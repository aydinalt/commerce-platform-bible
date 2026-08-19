import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import { silentLogger } from "../packages/testing/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import {
  editableOfferingContentSchema,
  errorEnvelopeSchema,
  offeringContentSchema
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
 * `US-OFR-F03-001` Offering Retirement.
 *
 * Retirement is not deletion, and almost every case here is a way of saying so:
 * the Category, the Attribute values and the earlier eligibility evaluations
 * all survive. What changes is reachability.
 *
 * AC-8 concerns an associated Affiliate Destination, which `US-OFR-F06-001`
 * owns and which has no representation in the datamodel yet. There is nothing
 * to make view-only, so nothing here asserts it.
 */
suite("Increment I2 Offering retirement", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

  const address = () => `ret-${randomUUID()}@example.test`;
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

  const draft = async () => {
    const business = await owner();
    const created = await send(
      "POST",
      `/businesses/${business.businessId}/offerings`,
      {
        body: { categoryId, slug: slug(), title: "Original" },
        cookie: business.cookie
      }
    );
    return { ...business, offeringId: created.json<{ id: string }>().id };
  };

  /** `US-OFR-F04-001` owns Draft → Published and has not built it. */
  const setLifecycle = (offeringId: string, status: "PUBLISHED" | "HIDDEN") =>
    pool.query(
      `update offering set status = $2::"OfferingStatus",
         published_at = coalesce(published_at, now())
       where id = $1`,
      [offeringId, status]
    );

  const retire = (
    business: { businessId: string; cookie: string },
    offeringId: string
  ) =>
    send(
      "POST",
      `/businesses/${business.businessId}/offerings/${offeringId}/retirement`,
      { cookie: business.cookie }
    );

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    const { createApiApp } = await import("../apps/api/src/bootstrap.js");
    app = await createApiApp({ logLevel: "fatal" });
    processor = new OutboxProcessor({
      dispatcher,
      logger: silentLogger(),
      pool,
      publicWebUrl: ORIGIN
    });

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
    await pool.end();
  });

  it("retires a Draft, a Published and a Hidden Offering", async () => {
    const fromDraft = await draft();
    const fromPublished = await draft();
    await setLifecycle(fromPublished.offeringId, "PUBLISHED");
    const fromHidden = await draft();
    await setLifecycle(fromHidden.offeringId, "HIDDEN");

    const results = [
      await retire(fromDraft, fromDraft.offeringId),
      await retire(fromPublished, fromPublished.offeringId),
      await retire(fromHidden, fromHidden.offeringId)
    ];

    // AC-1 and AC-2: all three are permitted starting states, and all three
    // arrive at the same one.
    expect(results.map((r) => r.statusCode)).toEqual([200, 200, 200]);
    expect(
      results.map((r) => offeringContentSchema.parse(r.json()).status)
    ).toEqual(["ARCHIVED", "ARCHIVED", "ARCHIVED"]);
  });

  it("records a fresh Ineligible evaluation without erasing the earlier one", async () => {
    const business = await draft();

    await retire(business, business.offeringId);

    // AC-3. A new evaluation rather than an amended one: the first result was
    // true of the state it was recorded against.
    const evaluations = await pool.query<{ reason: string; status: string }>(
      `select status::text as status, reason_code as reason
       from offering_publication where offering_id = $1
       order by eligibility_version`,
      [business.offeringId]
    );
    expect(evaluations.rows).toEqual([
      { reason: "LIFECYCLE_DRAFT", status: "INELIGIBLE" },
      { reason: "LIFECYCLE_ARCHIVED", status: "INELIGIBLE" }
    ]);
  });

  it("leaves nothing for Discovery to find", async () => {
    const business = await draft();
    // When this Story landed, nothing wrote the projection and the row had to
    // be planted to prove retirement removed it. `US-OFR-F04-001` now writes
    // it, so the case can use the real path.
    await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${business.offeringId}/publication`,
      { cookie: business.cookie }
    );
    const projectedBefore = await pool.query<{ total: number }>(
      `select count(*)::int as total from offering_search_projection
       where offering_id = $1`,
      [business.offeringId]
    );
    expect(projectedBefore.rows[0]?.total).toBe(1);

    await retire(business, business.offeringId);

    // AC-4.
    const projected = await pool.query<{ total: number }>(
      `select count(*)::int as total from offering_search_projection
       where offering_id = $1`,
      [business.offeringId]
    );
    expect(projected.rows[0]?.total).toBe(0);
  });

  it("keeps the Category, Domain and Attribute values as history", async () => {
    const business = await draft();
    const definition = await send("POST", "/admin/attributes", {
      body: {
        categoryIds: [categoryId],
        comparable: false,
        filterable: false,
        name: "Colour",
        stableKey: key(),
        valueKind: "TEXT"
      },
      cookie: admin.cookie
    });
    const attributeId = definition.json<{ id: string }>().id;
    await send(
      "PUT",
      `/businesses/${business.businessId}/offerings/${business.offeringId}/content`,
      {
        body: {
          attributes: [{ attributeId, kind: "TEXT", text: "Red" }],
          categoryId,
          title: "Original"
        },
        cookie: business.cookie
      }
    );

    const retired = await retire(business, business.offeringId);

    // AC-5. This is what separates retirement from deletion: the record is
    // still the record.
    const archived = offeringContentSchema.parse(retired.json());
    expect(archived.categoryId).toBe(categoryId);
    expect(archived.attributes).toEqual([
      {
        attributeId,
        booleanValue: null,
        numberValue: null,
        optionIds: [],
        textValue: "Red"
      }
    ]);
    const derived = await pool.query<{ domain: string }>(
      `select d.stable_key as domain from offering o
       join category c on c.id = o.category_id
       join domain d on d.id = c.domain_id
       where o.id = $1`,
      [business.offeringId]
    );
    expect(derived.rows[0]?.domain).toBe("MOBILITY");
  });

  it("stays viewable to its owner and to an authorized Admin", async () => {
    const business = await draft();
    await retire(business, business.offeringId);

    const asOwner = await send(
      "GET",
      `/businesses/${business.businessId}/offerings/${business.offeringId}/content`,
      { cookie: business.cookie }
    );
    const asAdmin = await send(
      "GET",
      `/admin/offerings/${business.offeringId}`,
      { cookie: admin.cookie }
    );

    // AC-6. Two different questions asked of two different shapes: the owner
    // asks about an Offering of theirs and is told what it could hold as well
    // as what it holds, because that read is what a form is built from. The
    // Admin asks about an Offering and gets the record — a historical read has
    // no form behind it, so it carries no definitions.
    expect(editableOfferingContentSchema.parse(asOwner.json()).status).toBe(
      "ARCHIVED"
    );
    expect(offeringContentSchema.parse(asAdmin.json()).status).toBe("ARCHIVED");
  });

  it("hides the Admin read from anyone not in an Admin context", async () => {
    const business = await draft();

    const asOwner = await send(
      "GET",
      `/admin/offerings/${business.offeringId}`,
      { cookie: business.cookie }
    );
    const asGuest = await send(
      "GET",
      `/admin/offerings/${business.offeringId}`
    );

    expect(asOwner.statusCode).toBe(403);
    expect(asGuest.statusCode).toBe(401);
  });

  it("denies editing an Archived Offering", async () => {
    const business = await draft();
    await retire(business, business.offeringId);

    const edited = await send(
      "PUT",
      `/businesses/${business.businessId}/offerings/${business.offeringId}/content`,
      {
        body: { attributes: [], categoryId, title: "Changed my mind" },
        cookie: business.cookie
      }
    );

    // AC-7's first half, and `US-OFR-F02-001` AC-7 from the other side.
    expect(edited.statusCode).toBe(403);
    expect(errorEnvelopeSchema.parse(edited.json()).code).toBe(
      "OFFERING_ARCHIVED"
    );
  });

  it("denies a second retirement", async () => {
    const business = await draft();
    await retire(business, business.offeringId);

    const again = await retire(business, business.offeringId);

    // AC-9's second half. Retirement is a transition *to* Archived, so there
    // is no second one to make — and PRD-0001 §6.4 allows none out of it,
    // which is AC-7's other half: there is no restore route to refuse.
    expect(again.statusCode).toBe(409);
    expect(errorEnvelopeSchema.parse(again.json()).code).toBe(
      "OFFERING_ALREADY_ARCHIVED"
    );
  });

  it("offers an Admin no way to archive an Offering", async () => {
    const business = await draft();

    const attempted = await send(
      "POST",
      `/admin/offerings/${business.offeringId}/retirement`,
      { cookie: admin.cookie }
    );

    // AC-9's first half: denied because it is absent, not because it is
    // refused.
    expect(attempted.statusCode).toBe(404);
    const unchanged = await pool.query<{ status: string }>(
      `select status::text as status from offering where id = $1`,
      [business.offeringId]
    );
    expect(unchanged.rows[0]?.status).toBe("DRAFT");
  });

  it("lets a Restricted Business withdraw its own Offering", async () => {
    const business = await draft();
    await pool.query(
      `update business_moderation_state set status = 'RESTRICTED'
       where business_id = $1`,
      [business.businessId]
    );

    const retired = await retire(business, business.offeringId);

    // Restriction governs publication and normal editing. Nothing in this
    // Story makes withdrawing your own Offering something it should prevent.
    expect(retired.statusCode).toBe(200);
  });

  it("hides another Business's Offering from retirement", async () => {
    const business = await draft();
    const stranger = await owner();

    const retired = await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${business.offeringId}/retirement`,
      { cookie: stranger.cookie }
    );

    expect(retired.statusCode).toBe(404);
  });

  it("records the retirement as audit evidence", async () => {
    const business = await draft();

    await retire(business, business.offeringId);

    const audited = await pool.query<{ total: number }>(
      `select count(*)::int as total from audit_record
       where action = 'offering.retire' and target_id = $1
         and actor_user_id = $2 and result = 'ALLOWED'`,
      [business.offeringId, business.userId]
    );
    expect(audited.rows[0]?.total).toBe(1);
  });
});
