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
  affiliateDestinationSchema,
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
 * `US-OFR-F06-001` Affiliate Destination Configuration.
 *
 * The Story's centre is PRD-0001 §9.5: authoring a destination — creating it or
 * changing it — always produces Draft, Not Validated and Ineligible, so that a
 * changed destination cannot remain eligible under an earlier validation
 * result. The Enabled and Disabled cases below reach past the API to set up the
 * state PRD-0006 will one day produce, because the reset matters most for
 * exactly the states this Story cannot yet create.
 *
 * This also closes `US-OFR-F03-001` AC-8, which had nothing to make view-only
 * when it was written.
 */
suite("Increment I2 Affiliate Destination", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

  const address = () => `aff-${randomUUID()}@example.test`;
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

  const path = (business: { businessId: string }, offeringId: string) =>
    `/businesses/${business.businessId}/offerings/${offeringId}/affiliate-destination`;

  const author = (
    business: { businessId: string; cookie: string },
    offeringId: string,
    reference: string,
    method: "POST" | "PUT" = "POST"
  ) =>
    send(method, path(business, offeringId), {
      body: { reference },
      cookie: business.cookie
    });

  /**
   * The state Platform administration produces, set up directly because
   * `US-OFR-F07-001` owns the actions that reach it.
   *
   * Handoff Eligibility is composed from the pair rather than asserted:
   * `US-OFR-F07-001` AC-10 makes `ELIGIBLE` mean exactly Enabled and Valid, and
   * the database now refuses any other combination.
   */
  const administer = (
    offeringId: string,
    status: "ENABLED" | "DISABLED",
    validation: "VALID" | "INVALID" = "VALID"
  ) =>
    pool.query(
      `update affiliate_destination
         set status = $2::"AffiliateDestinationStatus",
             validation_result = $3::"AffiliateValidationResult",
             validated_at = now(), validated_by = $4,
             handoff_eligibility = $5::"HandoffEligibility"
       where offering_id = $1`,
      [
        offeringId,
        status,
        validation,
        admin.userId,
        status === "ENABLED" && validation === "VALID"
          ? "ELIGIBLE"
          : "INELIGIBLE"
      ]
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

  it("creates a destination that begins Draft, Not Validated and Ineligible", async () => {
    const business = await draft();

    const created = await author(
      business,
      business.offeringId,
      "https://partner.example/listing/1"
    );

    // AC-1 and AC-3.
    expect(created.statusCode).toBe(201);
    expect(affiliateDestinationSchema.parse(created.json())).toMatchObject({
      handoffEligibility: "INELIGIBLE",
      offeringId: business.offeringId,
      reference: "https://partner.example/listing/1",
      status: "DRAFT",
      validationResult: "NOT_VALIDATED"
    });
  });

  it("allows one destination per Offering and never a shared one", async () => {
    const business = await draft();
    await author(business, business.offeringId, "https://partner.example/1");

    const second = await author(
      business,
      business.offeringId,
      "https://partner.example/2"
    );

    // AC-2. "Zero or one" and "cannot be shared" are the same statement read
    // from either end, and the unique key says both.
    expect(second.statusCode).toBe(409);
    expect(errorEnvelopeSchema.parse(second.json()).code).toBe(
      "AFFILIATE_DESTINATION_EXISTS"
    );
    const other = await draft();
    const shared = await pool.query<{ total: number }>(
      `select count(*)::int as total from affiliate_destination
       where offering_id in ($1,$2)`,
      [business.offeringId, other.offeringId]
    );
    expect(shared.rows[0]?.total).toBe(1);
  });

  it("resets an Enabled destination when its reference changes", async () => {
    const business = await draft();
    await author(business, business.offeringId, "https://partner.example/old");
    await administer(business.offeringId, "ENABLED");

    const edited = await author(
      business,
      business.offeringId,
      "https://partner.example/new",
      "PUT"
    );

    // AC-4 and AC-5, and the reason PRD-0001 §9.5 gives for them: an earlier
    // validation must not stay authoritative for a changed configuration.
    expect(affiliateDestinationSchema.parse(edited.json())).toMatchObject({
      handoffEligibility: "INELIGIBLE",
      reference: "https://partner.example/new",
      status: "DRAFT",
      validationResult: "NOT_VALIDATED"
    });
  });

  it("resets a Disabled destination too", async () => {
    const business = await draft();
    await author(business, business.offeringId, "https://partner.example/old");
    await administer(business.offeringId, "DISABLED", "INVALID");

    const edited = await author(
      business,
      business.offeringId,
      "https://partner.example/new",
      "PUT"
    );

    // AC-5 names Draft, Enabled and Disabled. Disabled is the one where the
    // temptation to "leave it alone" is strongest, and §9.5 does not.
    expect(affiliateDestinationSchema.parse(edited.json()).status).toBe(
      "DRAFT"
    );
  });

  it("resets the results even when the reset is not asked for", async () => {
    const business = await draft();
    await author(business, business.offeringId, "https://partner.example/old");
    await administer(business.offeringId, "ENABLED");

    // Not through the API at all: PRD-0006 will own paths that update this row,
    // and the reset has to survive one nobody has written yet.
    await pool.query(
      `update affiliate_destination set reference = $2 where offering_id = $1`,
      [business.offeringId, "https://partner.example/sideways"]
    );

    const state = await pool.query<{
      eligibility: string;
      status: string;
      validation: string;
    }>(
      `select status::text as status,
         validation_result::text as validation,
         handoff_eligibility::text as eligibility
       from affiliate_destination where offering_id = $1`,
      [business.offeringId]
    );
    expect(state.rows[0]).toEqual({
      eligibility: "INELIGIBLE",
      status: "DRAFT",
      validation: "NOT_VALIDATED"
    });
  });

  it("leaves an administered destination alone when nothing changed", async () => {
    const business = await draft();
    await author(business, business.offeringId, "https://partner.example/same");
    await administer(business.offeringId, "ENABLED");

    await pool.query(
      `update affiliate_destination set reference = $2 where offering_id = $1`,
      [business.offeringId, "https://partner.example/same"]
    );

    // The reset fires on a *changed* reference. Enabling a destination whose
    // configuration is unchanged must not undo itself.
    const state = await pool.query<{ status: string }>(
      `select status::text as status from affiliate_destination
       where offering_id = $1`,
      [business.offeringId]
    );
    expect(state.rows[0]?.status).toBe("ENABLED");
  });

  it("shows the owner the status, validation result and Handoff Eligibility", async () => {
    const business = await draft();
    await author(business, business.offeringId, "https://partner.example/1");
    await administer(business.offeringId, "ENABLED");

    const read = await send("GET", path(business, business.offeringId), {
      cookie: business.cookie
    });

    // AC-6.
    expect(affiliateDestinationSchema.parse(read.json())).toMatchObject({
      handoffEligibility: "ELIGIBLE",
      status: "ENABLED",
      validationResult: "VALID"
    });
  });

  it("makes an Archived Offering's destination view-only", async () => {
    const business = await draft();
    await author(business, business.offeringId, "https://partner.example/1");
    await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${business.offeringId}/retirement`,
      { cookie: business.cookie }
    );

    const read = await send("GET", path(business, business.offeringId), {
      cookie: business.cookie
    });
    const edited = await author(
      business,
      business.offeringId,
      "https://partner.example/2",
      "PUT"
    );

    // AC-7, and `US-OFR-F03-001` AC-8, which had nothing to assert when it was
    // written. View-only means readable, not invisible.
    expect(affiliateDestinationSchema.parse(read.json()).reference).toBe(
      "https://partner.example/1"
    );
    expect(edited.statusCode).toBe(403);
    expect(errorEnvelopeSchema.parse(edited.json()).code).toBe(
      "AFFILIATE_DESTINATION_READ_ONLY"
    );
  });

  it("refuses a destination on an Archived Offering", async () => {
    const business = await draft();
    await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${business.offeringId}/retirement`,
      { cookie: business.cookie }
    );

    const created = await author(
      business,
      business.offeringId,
      "https://partner.example/1"
    );

    // AC-1 admits Draft, Published and Hidden. Archived is absent from that
    // list, and AC-7 says why.
    expect(created.statusCode).toBe(403);
  });

  it("offers the owner no Review, Validate, Enable or Disable action", async () => {
    const business = await draft();
    await author(business, business.offeringId, "https://partner.example/1");

    const attempts = await Promise.all(
      ["review", "validation", "enablement", "disablement"].map((action) =>
        send("POST", `${path(business, business.offeringId)}/${action}`, {
          cookie: business.cookie
        })
      )
    );
    const smuggled = await send("PUT", path(business, business.offeringId), {
      body: {
        reference: "https://partner.example/2",
        status: "ENABLED"
      },
      cookie: business.cookie
    });

    // AC-8. The four actions are absent rather than refused, and the edit body
    // has no field that could ask for one — so a request that tries is not
    // partially honoured, it is rejected whole.
    expect(attempts.map((a) => a.statusCode)).toEqual([404, 404, 404, 404]);
    expect(smuggled.statusCode).toBe(400);
    const unchanged = await pool.query<{ status: string }>(
      `select status::text as status from affiliate_destination
       where offering_id = $1`,
      [business.offeringId]
    );
    expect(unchanged.rows[0]?.status).toBe("DRAFT");
  });

  it("keeps the destination out of the Business's Direct Contact channels", async () => {
    const business = await draft();
    await author(business, business.offeringId, "https://partner.example/1");

    const information = await send(
      "GET",
      `/businesses/${business.businessId}/information`,
      { cookie: business.cookie }
    );

    // AC-9. A Handoff destination and a Direct Contact channel are different
    // things: the destination belongs to one Offering and carries Handoff
    // Eligibility, while contact channels belong to the Business and are
    // released through PRD-0004. Neither can be mistaken for the other because
    // neither appears where the other lives.
    expect(businessInformationSchema.parse(information.json())).toMatchObject({
      contactEmail: null,
      contactTelephone: null,
      contactUrl: null
    });
    const read = await send("GET", path(business, business.offeringId), {
      cookie: business.cookie
    });
    expect(affiliateDestinationSchema.parse(read.json())).toHaveProperty(
      "handoffEligibility"
    );
  });

  it("refuses authoring to a Restricted Business but still shows it", async () => {
    const business = await draft();
    await author(business, business.offeringId, "https://partner.example/1");
    await pool.query(
      `update business_moderation_state set status = 'RESTRICTED'
       where business_id = $1`,
      [business.businessId]
    );

    const edited = await author(
      business,
      business.offeringId,
      "https://partner.example/2",
      "PUT"
    );
    const read = await send("GET", path(business, business.offeringId), {
      cookie: business.cookie
    });

    // `US-BUS-F03-001` AC-9 narrows what restriction reaches here: a Draft is
    // still the owner's to manage, so its destination is too. Reading is
    // untouched either way — seeing your own configuration is management
    // visibility, not exposure.
    expect(edited.statusCode).toBe(200);
    expect(read.statusCode).toBe(200);
  });

  it("hides another Business's destination", async () => {
    const business = await draft();
    await author(business, business.offeringId, "https://partner.example/1");
    const stranger = await owner();

    const read = await send("GET", path(business, business.offeringId), {
      cookie: stranger.cookie
    });

    expect(read.statusCode).toBe(404);
  });

  it("refuses an empty reference", async () => {
    const business = await draft();

    const created = await author(business, business.offeringId, "   ");

    // PRD-0001 §9.4 requires a reference "currently supplied by the Business
    // and not empty". An empty one is not a destination awaiting a value.
    expect(created.statusCode).toBe(400);
  });

  it("records authoring as audit evidence", async () => {
    const business = await draft();
    await author(business, business.offeringId, "https://partner.example/1");
    await author(
      business,
      business.offeringId,
      "https://partner.example/2",
      "PUT"
    );

    const audited = await pool.query<{ action: string }>(
      `select action from audit_record
       where target_type = 'AffiliateDestination' and actor_user_id = $1
         and result = 'ALLOWED'
       order by action`,
      [business.userId]
    );
    expect(audited.rows.map((r) => r.action)).toEqual([
      "offering.destination.create",
      "offering.destination.edit"
    ]);
  });
});
