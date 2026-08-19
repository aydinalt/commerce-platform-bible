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
  errorEnvelopeSchema,
  ownedBusinessSchema,
  ownedBusinessesSchema,
  sessionSchema
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
 * `US-BUS-F01-001` Business Creation and Ownership. Until now a Business could
 * only appear by direct SQL, so this is the step that makes the whole path —
 * register, create a Business, select it, author an Offering — reachable by a
 * person.
 */
suite("Increment I2 Business creation", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;

  const address = () => `bus-${randomUUID()}@example.test`;
  const slug = () => `bus-${randomUUID()}`;

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
      email,
      userId: confirmed.json<{ userId: string }>().userId
    };
  };

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
  });

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    dispatcher.delivered.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("creates a Business with no Admin approval in between", async () => {
    const { cookie } = await signUp();

    const created = await send("POST", "/businesses", {
      body: { name: "Kadıköy Motors", slug: slug() },
      cookie
    });

    // AC-3: nothing gates creation. AC-4 and AC-5: it begins Unrestricted and
    // Eligible rather than waiting to be enabled.
    expect(created.statusCode).toBe(201);
    expect(ownedBusinessSchema.parse(created.json())).toMatchObject({
      name: "Kadıköy Motors",
      publicExposure: "ELIGIBLE"
    });
    const moderation = await pool.query<{ status: string }>(
      `select status::text as status from business_moderation_state
       where business_id = $1`,
      [created.json<{ id: string }>().id]
    );
    expect(moderation.rows[0]?.status).toBe("UNRESTRICTED");
  });

  it("makes the Business immediately available to its owner", async () => {
    const { cookie } = await signUp();
    const created = await send("POST", "/businesses", {
      body: { name: "Immediate", slug: slug() },
      cookie
    });
    const { id } = created.json<{ id: string }>();

    const owned = await send("GET", "/businesses", { cookie });
    const authorized = await send("GET", "/auth/me/businesses", { cookie });
    const entered = await send("PUT", "/auth/me/business-context", {
      body: { businessId: id },
      cookie
    });

    // AC-6: available for management right away, with no further step.
    expect(
      ownedBusinessesSchema.parse(owned.json()).businesses.map((b) => b.id)
    ).toEqual([id]);
    expect(
      authorized.json<{ businesses: unknown[] }>().businesses
    ).toHaveLength(1);
    expect(sessionSchema.parse(entered.json()).selectedBusinessId).toBe(id);
  });

  it("lets one person own several Businesses", async () => {
    const { cookie } = await signUp();

    await send("POST", "/businesses", {
      body: { name: "First", slug: slug() },
      cookie
    });
    await send("POST", "/businesses", {
      body: { name: "Second", slug: slug() },
      cookie
    });

    // AC-7.
    const owned = await send("GET", "/businesses", { cookie });
    expect(ownedBusinessesSchema.parse(owned.json()).businesses).toHaveLength(
      2
    );
  });

  it("assigns exactly one owner, enforced by the database", async () => {
    const { cookie } = await signUp();
    const other = await signUp();
    const created = await send("POST", "/businesses", {
      body: { name: "Single owner", slug: slug() },
      cookie
    });
    const { id } = created.json<{ id: string }>();

    // AC-8 and AC-10: no co-owner, so a second owner row must be impossible
    // rather than merely unused.
    await expect(
      pool.query(
        `insert into business_owner (business_id,user_id) values ($1,$2)`,
        [id, other.userId]
      )
    ).rejects.toThrow();
  });

  it("refuses a Business without a display name", async () => {
    const { cookie } = await signUp();

    const created = await send("POST", "/businesses", {
      body: { name: "   ", slug: slug() },
      cookie
    });

    // AC-2: an owning account and a non-empty display name are both required.
    expect(created.statusCode).toBe(400);
    expect(
      errorEnvelopeSchema.parse(created.json()).fieldErrors?.name
    ).toBeDefined();
  });

  it("reports a taken slug as a conflict", async () => {
    const { cookie } = await signUp();
    const taken = slug();
    await send("POST", "/businesses", {
      body: { name: "First", slug: taken },
      cookie
    });

    const second = await send("POST", "/businesses", {
      body: { name: "Second", slug: taken },
      cookie
    });

    expect(second.statusCode).toBe(409);
    expect(errorEnvelopeSchema.parse(second.json()).code).toBe(
      "BUSINESS_SLUG_CONFLICT"
    );
  });

  it("requires an authenticated account", async () => {
    const created = await send("POST", "/businesses", {
      body: { name: "Anonymous", slug: slug() }
    });

    // AC-1.
    expect(created.statusCode).toBe(401);
  });

  it("refuses creation from an unrecognised origin", async () => {
    const { cookie } = await signUp();

    const created = await app.inject({
      body: { name: "Foreign", slug: slug() },
      headers: { cookie, origin: "https://attacker.example" },
      method: "POST",
      url: "/api/v1/businesses"
    });

    expect(created.statusCode).toBe(403);
  });

  it("records creation as audit evidence", async () => {
    const { cookie, userId } = await signUp();
    const created = await send("POST", "/businesses", {
      body: { name: "Audited", slug: slug() },
      cookie
    });
    const { id } = created.json<{ id: string }>();

    const audited = await pool.query<{ total: number }>(
      `select count(*)::int as total from audit_record
       where action = 'business.create' and target_id = $1
         and actor_user_id = $2 and result = 'ALLOWED'`,
      [id, userId]
    );
    expect(audited.rows[0]?.total).toBe(1);
  });
});
