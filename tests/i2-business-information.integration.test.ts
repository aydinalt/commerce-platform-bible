import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  hasDirectContactChannel,
  publicBusinessIdentity,
  type BusinessInformation
} from "../modules/business/src/index.js";
import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import { silentLogger } from "../packages/testing/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import {
  businessInformationSchema,
  errorEnvelopeSchema
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
 * `US-BUS-F02-001` Business Information and Exposure.
 *
 * The Story's whole point is a split: display name, logo and short description
 * are the public Business identity set, while telephone, email and contact URL
 * are protected Direct Contact that no Guest may reach. They share one row, so
 * the split has to be proven rather than assumed.
 *
 * AC-7, AC-10 and the Guest half of AC-9 need a public Offering surface and
 * PRD-0004 Direct Contact, neither of which exists before I4/I5. What is
 * provable now is the composition rule itself, which is tested directly.
 */
suite("Increment I2 Business information", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;

  const address = () => `bin-${randomUUID()}@example.test`;
  const slug = () => `bin-${randomUUID()}`;

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

  const withBusiness = async () => {
    const account = await signUp();
    const created = await send("POST", "/businesses", {
      body: { name: "Kadıköy Motors", slug: slug() },
      cookie: account.cookie
    });
    return { ...account, businessId: created.json<{ id: string }>().id };
  };

  const complete = {
    contactEmail: "sales@kadikoy.example",
    contactTelephone: "+90 216 000 00 00",
    contactUrl: "https://kadikoy.example/contact",
    logoUrl: "https://cdn.example/logo.png",
    name: "Kadıköy Motors",
    shortDescription: "Used cars in Kadıköy since 1998."
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

  it("shows the owner every Business Information field", async () => {
    const { businessId, cookie } = await withBusiness();

    const read = await send("GET", `/businesses/${businessId}/information`, {
      cookie
    });

    // AC-1: every field is visible, including the ones never yet supplied.
    expect(read.statusCode).toBe(200);
    expect(businessInformationSchema.parse(read.json())).toMatchObject({
      contactEmail: null,
      contactTelephone: null,
      contactUrl: null,
      logoUrl: null,
      name: "Kadıköy Motors",
      shortDescription: null
    });
  });

  it("saves the complete information set", async () => {
    const { businessId, cookie } = await withBusiness();

    const saved = await send("PUT", `/businesses/${businessId}/information`, {
      body: complete,
      cookie
    });

    // AC-2: all six fields are editable in one save.
    expect(saved.statusCode).toBe(200);
    expect(businessInformationSchema.parse(saved.json())).toMatchObject(
      complete
    );

    const read = await send("GET", `/businesses/${businessId}/information`, {
      cookie
    });
    expect(read.json()).toMatchObject(complete);
  });

  it("refuses a save that empties the display name", async () => {
    const { businessId, cookie } = await withBusiness();
    await send("PUT", `/businesses/${businessId}/information`, {
      body: complete,
      cookie
    });

    const emptied = await send("PUT", `/businesses/${businessId}/information`, {
      body: { ...complete, name: "   " },
      cookie
    });

    // AC-3: the one field that cannot be removed.
    expect(emptied.statusCode).toBe(400);
    expect(
      errorEnvelopeSchema.parse(emptied.json()).fieldErrors?.name
    ).toBeDefined();

    const read = await send("GET", `/businesses/${businessId}/information`, {
      cookie
    });
    expect(read.json<{ name: string }>().name).toBe("Kadıköy Motors");
  });

  it("lets every optional field be added, changed and removed", async () => {
    const { businessId, cookie } = await withBusiness();

    await send("PUT", `/businesses/${businessId}/information`, {
      body: complete,
      cookie
    });
    const changed = await send("PUT", `/businesses/${businessId}/information`, {
      body: { ...complete, shortDescription: "Now also servicing." },
      cookie
    });
    const removed = await send("PUT", `/businesses/${businessId}/information`, {
      body: { contactUrl: null, name: complete.name },
      cookie
    });

    // AC-4: added above, changed here, and removed by omission — an omitted
    // optional field in a replacement is a removal, not an oversight.
    expect(changed.json<{ shortDescription: string }>().shortDescription).toBe(
      "Now also servicing."
    );
    expect(businessInformationSchema.parse(removed.json())).toMatchObject({
      contactEmail: null,
      contactTelephone: null,
      contactUrl: null,
      logoUrl: null,
      shortDescription: null
    });
  });

  it("accepts a Business with no Direct Contact channel at all", async () => {
    const { businessId, cookie } = await withBusiness();

    const saved = await send("PUT", `/businesses/${businessId}/information`, {
      body: { logoUrl: complete.logoUrl, name: complete.name },
      cookie
    });

    // AC-5: zero supplied channels is a valid Business, not an incomplete one.
    expect(saved.statusCode).toBe(200);
    expect(hasDirectContactChannel(saved.json<BusinessInformation>())).toBe(
      false
    );
  });

  it("changes no moderation status or exposure input by itself", async () => {
    const { businessId, cookie } = await withBusiness();
    const before = await pool.query<{ moderation: string; exposure: string }>(
      `select m.status::text as moderation, b.public_exposure::text as exposure
       from business b
       join business_moderation_state m on m.business_id = b.id
       where b.id = $1`,
      [businessId]
    );

    await send("PUT", `/businesses/${businessId}/information`, {
      body: complete,
      cookie
    });

    // AC-12: a valid edit moves no other state. The update statement cannot
    // name those columns, so this asserts the boundary the SQL enforces.
    const after = await pool.query<{ moderation: string; exposure: string }>(
      `select m.status::text as moderation, b.public_exposure::text as exposure
       from business b
       join business_moderation_state m on m.business_id = b.id
       where b.id = $1`,
      [businessId]
    );
    expect(after.rows[0]).toEqual(before.rows[0]);
    expect(after.rows[0]?.moderation).toBe("UNRESTRICTED");
  });

  it("keeps management visibility open while public exposure is closed", async () => {
    const { businessId, cookie } = await withBusiness();
    await send("PUT", `/businesses/${businessId}/information`, {
      body: complete,
      cookie
    });
    // Exposure input follows the moderation status (`US-BUS-F03-001` AC-3), so
    // Restricting the Business is the only way to reach Ineligible — writing
    // the column directly is refused by the database.
    await pool.query(
      `update business_moderation_state set status = 'RESTRICTED'
       where business_id = $1`,
      [businessId]
    );

    const read = await send("GET", `/businesses/${businessId}/information`, {
      cookie
    });

    // AC-13: an Ineligible Business is still fully visible to its owner.
    // AC-8: but it composes no public identity at all.
    const business = businessInformationSchema.parse(read.json());
    expect(business).toMatchObject(complete);
    expect(publicBusinessIdentity(business)).toBeNull();
  });

  it("hides another person's Business rather than forbidding it", async () => {
    const { businessId } = await withBusiness();
    const stranger = await signUp();

    const read = await send("GET", `/businesses/${businessId}/information`, {
      cookie: stranger.cookie
    });
    const written = await send("PUT", `/businesses/${businessId}/information`, {
      body: complete,
      cookie: stranger.cookie
    });

    // A non-owner has no standing to learn the Business exists, and protected
    // contact must not leak through a status code.
    expect(read.statusCode).toBe(404);
    expect(written.statusCode).toBe(404);
    expect(errorEnvelopeSchema.parse(read.json()).code).toBe(
      "BUSINESS_NOT_FOUND"
    );
  });

  it("requires an authenticated account", async () => {
    const { businessId } = await withBusiness();

    const read = await send("GET", `/businesses/${businessId}/information`);

    // Protected Direct Contact sits behind this response, so an unauthenticated
    // caller never reaches it (AC-9).
    expect(read.statusCode).toBe(401);
  });

  it("refuses a save from an unrecognised origin", async () => {
    const { businessId, cookie } = await withBusiness();

    const written = await app.inject({
      body: complete,
      headers: { cookie, origin: "https://attacker.example" },
      method: "PUT",
      url: `/api/v1/businesses/${businessId}/information`
    });

    expect(written.statusCode).toBe(403);
  });

  it("rejects a malformed identifier at the edge", async () => {
    const { cookie } = await withBusiness();

    const read = await send("GET", "/businesses/not-a-uuid/information", {
      cookie
    });

    expect(read.statusCode).toBe(400);
    expect(
      errorEnvelopeSchema.parse(read.json()).fieldErrors?.businessId
    ).toBeDefined();
  });

  it("records the edit as audit evidence", async () => {
    const { businessId, cookie, userId } = await withBusiness();

    await send("PUT", `/businesses/${businessId}/information`, {
      body: complete,
      cookie
    });

    const audited = await pool.query<{ total: number }>(
      `select count(*)::int as total from audit_record
       where action = 'business.information.update' and target_id = $1
         and actor_user_id = $2 and result = 'ALLOWED'`,
      [businessId, userId]
    );
    expect(audited.rows[0]?.total).toBe(1);
  });
});
