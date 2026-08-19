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
 * `US-OFR-F07-001` Affiliate Destination Eligibility Governance.
 *
 * Four actions with sharply different effects, and the Story spends most of its
 * criteria on what each one leaves *alone*: Review changes nothing, Validate
 * leaves the status where it is, Disable keeps the verdict.
 *
 * AC-10 is the one that ties them together — Eligible exactly when Enabled and
 * Valid — and it is a database constraint, so the cases below are checking that
 * the four actions arrive at states the constraint would have permitted anyway.
 */
suite("Increment I3 Affiliate Destination governance", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

  const address = () => `gov-${randomUUID()}@example.test`;
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

  /** An Offering with a destination its owner has just authored. */
  const destination = async () => {
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
    const offering = await send("POST", `/businesses/${businessId}/offerings`, {
      body: { categoryId, slug: slug(), title: "Listing" },
      cookie: account.cookie
    });
    const offeringId = offering.json<{ id: string }>().id;
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/affiliate-destination`,
      {
        body: { reference: "https://partner.example/1" },
        cookie: account.cookie
      }
    );
    return { ...account, businessId, offeringId };
  };

  const act = (
    offeringId: string,
    action: "review" | "validation" | "enablement" | "disablement",
    body?: unknown,
    cookie = admin.cookie
  ) =>
    send(
      "POST",
      `/admin/offerings/${offeringId}/affiliate-destination/${action}`,
      { ...(body === undefined ? {} : { body }), cookie }
    );

  const valid = (offeringId: string) =>
    act(offeringId, "validation", { result: "VALID" });

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

  it("leaves every result unchanged when Review alone is completed", async () => {
    const offering = await destination();

    const reviewed = await act(offering.offeringId, "review", {
      note: "Looks like a partner listing"
    });

    // AC-2. The action is real — it leaves a row — but it moves nothing.
    expect(affiliateDestinationSchema.parse(reviewed.json())).toMatchObject({
      handoffEligibility: "INELIGIBLE",
      status: "DRAFT",
      validationResult: "NOT_VALIDATED"
    });
    const recorded = await pool.query<{ note: string }>(
      `select r.note from affiliate_destination_review r
       join affiliate_destination d on d.id = r.destination_id
       where d.offering_id = $1`,
      [offering.offeringId]
    );
    expect(recorded.rows[0]?.note).toBe("Looks like a partner listing");
  });

  it("produces one current result and leaves the status alone", async () => {
    const offering = await destination();

    const validated = await act(offering.offeringId, "validation", {
      reason: "Reachable partner reference",
      result: "VALID"
    });

    // AC-3 and AC-4.
    expect(affiliateDestinationSchema.parse(validated.json())).toMatchObject({
      status: "DRAFT",
      validationReason: "Reachable partner reference",
      validationResult: "VALID"
    });
  });

  it("keeps a Valid destination Ineligible until it is enabled", async () => {
    const offering = await destination();

    const validated = await valid(offering.offeringId);

    // AC-5. This falls out of the composition rather than being held back:
    // Valid alone is not Enabled, so it is not Eligible.
    expect(
      affiliateDestinationSchema.parse(validated.json()).handoffEligibility
    ).toBe("INELIGIBLE");
  });

  it("refuses Enable unless the destination is Valid", async () => {
    const unvalidated = await destination();
    const invalid = await destination();
    await act(invalid.offeringId, "validation", {
      result: "INVALID"
    });

    const first = await act(unvalidated.offeringId, "enablement");
    const second = await act(invalid.offeringId, "enablement");

    // AC-6. Enabling on the strength of a check nobody performed, or one that
    // failed, is the same mistake.
    expect(first.statusCode).toBe(409);
    expect(second.statusCode).toBe(409);
    expect(errorEnvelopeSchema.parse(first.json()).code).toBe(
      "AFFILIATE_NOT_VALIDATED"
    );
  });

  it("produces Enabled and Eligible for a Valid destination", async () => {
    const offering = await destination();
    await valid(offering.offeringId);

    const enabled_ = await act(offering.offeringId, "enablement");

    // AC-7.
    expect(affiliateDestinationSchema.parse(enabled_.json())).toMatchObject({
      handoffEligibility: "ELIGIBLE",
      status: "ENABLED",
      validationResult: "VALID"
    });
  });

  it("produces Disabled and Ineligible while keeping the verdict", async () => {
    const offering = await destination();
    await act(offering.offeringId, "validation", {
      reason: "Checked",
      result: "VALID"
    });
    await act(offering.offeringId, "enablement");

    const disabled = await act(offering.offeringId, "disablement");

    // AC-8 and AC-9. The verdict survives, so re-enabling later needs no
    // second validation — the configuration never changed.
    expect(affiliateDestinationSchema.parse(disabled.json())).toMatchObject({
      handoffEligibility: "INELIGIBLE",
      status: "DISABLED",
      validationReason: "Checked",
      validationResult: "VALID"
    });
    const reEnabled = await act(offering.offeringId, "enablement");
    expect(reEnabled.statusCode).toBe(200);
  });

  it("refuses Disable unless the destination is Enabled", async () => {
    const offering = await destination();

    const disabled = await act(offering.offeringId, "disablement");

    expect(disabled.statusCode).toBe(409);
    expect(errorEnvelopeSchema.parse(disabled.json()).code).toBe(
      "AFFILIATE_NOT_ENABLED"
    );
  });

  it("drops eligibility when an Enabled destination is re-validated as Invalid", async () => {
    const offering = await destination();
    await valid(offering.offeringId);
    await act(offering.offeringId, "enablement");

    const revalidated = await act(offering.offeringId, "validation", {
      result: "INVALID"
    });

    // AC-10 against AC-4. The status stays Enabled because Validate does not
    // move it, and eligibility goes anyway — it was never a property of the
    // status alone.
    expect(affiliateDestinationSchema.parse(revalidated.json())).toMatchObject({
      handoffEligibility: "INELIGIBLE",
      status: "ENABLED",
      validationResult: "INVALID"
    });
  });

  it("permits no other combination of status and result", async () => {
    const offering = await destination();
    await valid(offering.offeringId);
    await act(offering.offeringId, "enablement");

    // AC-10 stated as a biconditional and enforced as one. Neither half of the
    // rule can be broken, whatever reaches the row.
    await expect(
      pool.query(
        `update affiliate_destination set handoff_eligibility = 'INELIGIBLE'
         where offering_id = $1`,
        [offering.offeringId]
      )
    ).rejects.toThrow();
    await expect(
      pool.query(
        `update affiliate_destination
           set status = 'DISABLED', handoff_eligibility = 'ELIGIBLE'
         where offering_id = $1`,
        [offering.offeringId]
      )
    ).rejects.toThrow();
  });

  it("keeps Handoff Eligibility separate from final Offering Public Eligibility", async () => {
    const offering = await destination();
    const before = await pool.query<{ total: number }>(
      `select count(*)::int as total from offering_publication
       where offering_id = $1`,
      [offering.offeringId]
    );

    await valid(offering.offeringId);
    await act(offering.offeringId, "enablement");

    // AC-11. The Offering is still a Draft and still publicly Ineligible; an
    // Eligible destination says nothing about it.
    const after = await pool.query<{ eligibility: string; total: number }>(
      `select (select count(*)::int from offering_publication p
               where p.offering_id = o.id) as total,
         (select p.status::text from offering_publication p
          where p.offering_id = o.id
          order by p.eligibility_version desc limit 1) as eligibility
       from offering o where o.id = $1`,
      [offering.offeringId]
    );
    expect(after.rows[0]?.total).toBe(before.rows[0]?.total);
    expect(after.rows[0]?.eligibility).toBe("INELIGIBLE");
  });

  it("changes no Offering lifecycle, Business moderation or account status", async () => {
    const offering = await destination();
    const before = await pool.query<{
      account: string;
      lifecycle: string;
      moderation: string;
    }>(
      `select o.status::text as lifecycle, m.status::text as moderation,
         u.status::text as account
       from offering o
       join business_moderation_state m on m.business_id = o.business_id
       join business_owner bo on bo.business_id = o.business_id
       join user_account u on u.id = bo.user_id
       where o.id = $1`,
      [offering.offeringId]
    );

    await act(offering.offeringId, "review", { note: "seen" });
    await valid(offering.offeringId);
    await act(offering.offeringId, "enablement");
    await act(offering.offeringId, "disablement");

    // AC-12. All four actions, and nothing outside the destination moved —
    // none of the statements can reach a table that holds any of these.
    const after = await pool.query(
      `select o.status::text as lifecycle, m.status::text as moderation,
         u.status::text as account
       from offering o
       join business_moderation_state m on m.business_id = o.business_id
       join business_owner bo on bo.business_id = o.business_id
       join user_account u on u.id = bo.user_id
       where o.id = $1`,
      [offering.offeringId]
    );
    expect(after.rows[0]).toEqual(before.rows[0]);
  });

  it("returns to no current result when the owner changes the reference", async () => {
    const offering = await destination();
    await act(offering.offeringId, "validation", {
      reason: "Checked",
      result: "VALID"
    });
    await act(offering.offeringId, "enablement");

    await send(
      "PUT",
      `/businesses/${offering.businessId}/offerings/${offering.offeringId}/affiliate-destination`,
      {
        body: { reference: "https://partner.example/2" },
        cookie: offering.cookie
      }
    );

    // `US-OFR-F06-001` AC-5 from the far side: an Enabled, Valid destination
    // that gets a new reference loses the verdict *and* the evidence for it,
    // because the result described a configuration that no longer exists.
    const state = await pool.query<{
      reason: string | null;
      status: string;
      validatedAt: Date | null;
      validation: string;
    }>(
      `select status::text as status,
         validation_result::text as validation,
         validation_reason as reason, validated_at as "validatedAt"
       from affiliate_destination where offering_id = $1`,
      [offering.offeringId]
    );
    expect(state.rows[0]).toEqual({
      reason: null,
      status: "DRAFT",
      validatedAt: null,
      validation: "NOT_VALIDATED"
    });
  });

  it("admits only an authorized Admin in an entered context", async () => {
    const offering = await destination();
    const stranger = await signUp();
    await pool.query(
      `insert into admin_authorization (user_id, granted_by) values ($1,'test')`,
      [stranger.userId]
    );

    const asOwner = await act(
      offering.offeringId,
      "enablement",
      undefined,
      offering.cookie
    );
    const asUnenteredAdmin = await act(
      offering.offeringId,
      "enablement",
      undefined,
      stranger.cookie
    );
    const asGuest = await send(
      "POST",
      `/admin/offerings/${offering.offeringId}/affiliate-destination/enablement`
    );

    // AC-1, and `US-IDN-F08-001` AC-5: authorization is not the same as having
    // entered the surface it authorizes.
    expect(asOwner.statusCode).toBe(403);
    expect(asUnenteredAdmin.statusCode).toBe(403);
    expect(asGuest.statusCode).toBe(401);
  });

  it("records every administration action as audit evidence", async () => {
    const offering = await destination();
    await act(offering.offeringId, "review", { note: "seen" });
    await valid(offering.offeringId);
    await act(offering.offeringId, "enablement");
    await act(offering.offeringId, "disablement");

    // Scoped to this Offering's destination: the Admin in this suite performs
    // the same actions for every other case too.
    const audited = await pool.query<{
      action: string;
      effectiveBusinessId: string | null;
    }>(
      `select a.action, a.effective_business_id as "effectiveBusinessId"
       from audit_record a
       join affiliate_destination d on d.id = a.target_id
       where d.offering_id = $1 and a.actor_user_id = $2
         and a.result = 'ALLOWED' and a.action like 'affiliate.%'
       order by a.action`,
      [offering.offeringId, admin.userId]
    );
    expect(audited.rows.map((r) => r.action)).toEqual([
      "affiliate.disable",
      "affiliate.enable",
      "affiliate.review",
      "affiliate.validate"
    ]);
    // An Admin acts in the Admin context, not for a Business, and the record
    // says so rather than borrowing the Offering's owner.
    expect(audited.rows.every((r) => r.effectiveBusinessId === null)).toBe(
      true
    );
  });
});
