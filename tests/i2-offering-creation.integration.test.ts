import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import {
  errorEnvelopeSchema,
  offeringInventorySchema
} from "../packages/contracts/src/index.js";

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

const ORIGIN = "http://localhost:3000";
const PASSWORD = "correct horse battery staple";

class RecordingDispatcher implements EmailDispatcher {
  readonly delivered: EmailMessage[] = [];

  deliver(message: EmailMessage): Promise<void> {
    this.delivered.push(message);
    return Promise.resolve();
  }
}

/**
 * `US-OFR-F01-001` Offering Creation.
 *
 * The write path itself came out of the Milestone 11 vertical slice, which
 * proved it worked without claiming it satisfied a Story. What this suite adds
 * is the part the slice had no reason to build: the created Draft now carries a
 * recorded final Offering Public Eligibility, and its owner can find it.
 *
 * AC-7 is the one that has to stay true as the product grows — creation must
 * reach no public surface. There is no public surface yet, so the case asserts
 * the absence of the projection row that will one day feed one.
 */
suite("Increment I2 Offering creation", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

  const address = () => `ofr-${randomUUID()}@example.test`;
  const key = () => `K${randomUUID().replaceAll("-", "").toUpperCase()}`;
  const slug = () => `s-${randomUUID()}`;

  const send = (
    method: "GET" | "POST" | "PUT",
    url: string,
    options: { body?: unknown; cookie?: string } = {}
  ) =>
    app.inject({
      ...(options.body === undefined ? {} : { body: options.body }),
      headers: {
        origin: ORIGIN,
        ...(options.cookie === undefined ? {} : { cookie: options.cookie })
      },
      method,
      url: `/api/v1${url}`
    });

  const signUp = async () => {
    const email = address();
    await send("POST", "/auth/registrations", {
      body: { email, password: PASSWORD }
    });
    await processor.processBatch();
    const message = dispatcher.delivered.find((m) => m.recipient === email);
    if (!message) throw new Error("NO_MESSAGE_DELIVERED");
    const link = /https?:\/\/\S+/u.exec(message.body)?.[0];
    if (!link) throw new Error("NO_LINK_IN_MESSAGE");
    const confirmed = await send("POST", "/auth/registrations/confirmations", {
      body: { token: new URL(link).searchParams.get("token") }
    });
    const cookies = confirmed.cookies as { name: string; value: string }[];
    return {
      cookie: `commerce_session=${cookies.find((c) => c.name === "commerce_session")?.value ?? ""}`,
      userId: confirmed.json<{ userId: string }>().userId
    };
  };

  /** A person who owns a Business and is acting in its context. */
  const owner = async () => {
    const account = await signUp();
    const created = await send("POST", "/businesses", {
      body: { name: "Author", slug: slug() },
      cookie: account.cookie
    });
    const businessId = created.json<{ id: string }>().id;
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });
    return { ...account, businessId };
  };

  const createOffering = (
    business: { businessId: string; cookie: string },
    body: Record<string, unknown> = {}
  ) =>
    send("POST", `/businesses/${business.businessId}/offerings`, {
      body: { categoryId, slug: slug(), title: "A listing", ...body },
      cookie: business.cookie
    });

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    const { createApiApp } = await import("../apps/api/src/bootstrap.js");
    app = await createApiApp({ logLevel: "fatal" });
    processor = new OutboxProcessor({ dispatcher, publicWebUrl: ORIGIN });

    admin = await signUp();
    await pool.query(
      `insert into admin_authorization (user_id, granted_by) values ($1,'test')`,
      [admin.userId]
    );
    await send("PUT", "/auth/me/admin-context", { cookie: admin.cookie });
    const category = await send("POST", "/admin/categories", {
      body: {
        domain: "MOBILITY",
        name: "Cars",
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });
    categoryId = category.json<{ id: string }>().id;
  });

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    dispatcher.delivered.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await processor.close();
    await pool.end();
  });

  it("creates one Draft for the Business whose context is selected", async () => {
    const business = await owner();

    const created = await createOffering(business);

    // AC-1, AC-2 and AC-3.
    expect(created.statusCode).toBe(201);
    expect(
      created.json<{ businessId: string; status: string }>()
    ).toMatchObject({ businessId: business.businessId, status: "DRAFT" });
  });

  it("records the new Draft as Ineligible", async () => {
    const business = await owner();
    const created = await createOffering(business);

    const evaluation = await pool.query<{
      reason: string;
      status: string;
      version: number;
    }>(
      `select status::text as status, reason_code as reason,
         eligibility_version as version
       from offering_publication where offering_id = $1`,
      [created.json<{ id: string }>().id]
    );

    // AC-4. The result is written, not left to be inferred: PRD-0001 §7.1
    // forbids consumers from recalculating it, and a consumer cannot read an
    // answer nobody recorded. The reason names which input withheld it.
    expect(evaluation.rows[0]).toEqual({
      reason: "LIFECYCLE_DRAFT",
      status: "INELIGIBLE",
      version: 1
    });
  });

  it("shows the new Draft in the owning Business inventory", async () => {
    const business = await owner();
    const created = await createOffering(business, { title: "Findable" });

    const inventory = await send(
      "GET",
      `/businesses/${business.businessId}/offerings`,
      { cookie: business.cookie }
    );

    // AC-5: reachable without having kept the identifier from the creation
    // response, and carrying the recorded eligibility beside it.
    expect(
      offeringInventorySchema.parse(inventory.json()).offerings
    ).toContainEqual(
      expect.objectContaining({
        id: created.json<{ id: string }>().id,
        publicEligibility: "INELIGIBLE",
        status: "DRAFT",
        title: "Findable"
      })
    );
  });

  it("denies creation while the Business is Restricted", async () => {
    const business = await owner();
    await pool.query(
      `update business_moderation_state set status = 'RESTRICTED'
       where business_id = $1`,
      [business.businessId]
    );

    const created = await createOffering(business);

    // AC-6.
    expect(created.statusCode).toBe(403);
    const none = await pool.query<{ total: number }>(
      `select count(*)::int as total from offering where business_id = $1`,
      [business.businessId]
    );
    expect(none.rows[0]?.total).toBe(0);
  });

  it("still shows the inventory to a Restricted Business owner", async () => {
    const business = await owner();
    await createOffering(business);
    await pool.query(
      `update business_moderation_state set status = 'RESTRICTED'
       where business_id = $1`,
      [business.businessId]
    );

    const inventory = await send(
      "GET",
      `/businesses/${business.businessId}/offerings`,
      { cookie: business.cookie }
    );

    // AC-6 refuses creation, not sight. `US-BUS-F02-001` AC-13 keeps
    // management visibility separate from public exposure.
    expect(inventory.statusCode).toBe(200);
    expect(
      offeringInventorySchema.parse(inventory.json()).offerings
    ).toHaveLength(1);
  });

  it("exposes the new Draft to no public surface", async () => {
    const business = await owner();
    const created = await createOffering(business);
    const offeringId = created.json<{ id: string }>().id;

    // AC-7. Creation publishes nothing, so the row that would one day feed
    // Discovery must not exist — and the Offering carries no publication
    // timestamp that would let anything treat it as having been public.
    const projected = await pool.query<{ total: number }>(
      `select count(*)::int as total from offering_search_projection
       where offering_id = $1`,
      [offeringId]
    );
    const offering = await pool.query<{
      archivedAt: Date | null;
      publishedAt: Date | null;
    }>(
      `select published_at as "publishedAt", archived_at as "archivedAt"
       from offering where id = $1`,
      [offeringId]
    );
    expect(projected.rows[0]?.total).toBe(0);
    expect(offering.rows[0]).toEqual({ archivedAt: null, publishedAt: null });
  });

  it("hides another Business's inventory", async () => {
    const business = await owner();
    await createOffering(business);
    const stranger = await owner();

    const inventory = await send(
      "GET",
      `/businesses/${business.businessId}/offerings`,
      { cookie: stranger.cookie }
    );

    // AC-2 read from the other side: an Offering belongs to exactly the
    // Business it was created for, and to nobody else.
    expect(inventory.statusCode).toBe(404);
  });

  it("requires the Business context to be selected", async () => {
    const business = await owner();
    await send("POST", "/businesses", {
      body: { name: "Second", slug: slug() },
      cookie: business.cookie
    });
    await app.inject({
      headers: { cookie: business.cookie, origin: ORIGIN },
      method: "DELETE",
      url: "/api/v1/auth/me/business-context"
    });

    const created = await createOffering(business);

    // AC-1 and AC-2: acting for a Business is explicit, never inferred from
    // ownership (`US-IDN-F07-001` AC-3).
    expect(created.statusCode).toBe(403);
    expect(errorEnvelopeSchema.parse(created.json()).code).toBe(
      "BUSINESS_CONTEXT_REQUIRED"
    );
  });
});
