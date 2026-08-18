import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import { BUSINESS_MODERATION_SOURCE } from "../modules/business/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { moderationCaseSchema } from "../packages/contracts/src/index.js";

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
 * `US-PLT-F04-001` Business Moderation Actions.
 *
 * `US-BUS-F03-001` built what Restrict and Restore *do*. This Story is about
 * their edges: which state each may start from, and how far the consequences
 * reach. The interesting half is the second — restriction has to take an
 * Offering out of circulation without touching its lifecycle, and restoration
 * has to put back only what was Published, and neither may reach an Affiliate
 * Destination, an account or an ownership row.
 */
suite("Increment I7 Business moderation actions", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

  const address = () => `bmd-${randomUUID()}@example.test`;
  const key = () => `K${randomUUID().replaceAll("-", "").toUpperCase()}`;
  const slug = () => `s-${randomUUID()}`;

  const send = (
    method: "DELETE" | "GET" | "POST" | "PUT",
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
      body: { name: "Kartal Motors", slug: slug() },
      cookie: account.cookie
    });
    const businessId = created.json<{ id: string }>().id;
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });
    return { ...account, businessId };
  };

  const offering = async (
    business: { businessId: string; cookie: string },
    options: { publish?: boolean } = {}
  ) => {
    const created = await send(
      "POST",
      `/businesses/${business.businessId}/offerings`,
      {
        body: { categoryId, slug: slug(), title: "Kırmızı araba" },
        cookie: business.cookie
      }
    );
    const offeringId = created.json<{ id: string }>().id;
    await send(
      "PUT",
      `/businesses/${business.businessId}/offerings/${offeringId}/content`,
      {
        body: { attributes: [], categoryId, title: "Kırmızı araba" },
        cookie: business.cookie
      }
    );
    if (options.publish !== false)
      await send(
        "POST",
        `/businesses/${business.businessId}/offerings/${offeringId}/publication`,
        { cookie: business.cookie }
      );
    return offeringId;
  };

  const restrict = (businessId: string) =>
    send("POST", `/admin/businesses/${businessId}/restriction`, {
      cookie: admin.cookie
    });

  const restore = (businessId: string) =>
    send("POST", `/admin/businesses/${businessId}/restoration`, {
      cookie: admin.cookie
    });

  const businessState = (businessId: string) =>
    pool.query<{ exposure: string; moderation: string; owners: string }>(
      `select b.public_exposure::text as exposure,
         coalesce(m.status::text,'UNRESTRICTED') as moderation,
         (select count(*)::text from business_owner o
          where o.business_id = b.id) as owners
       from business b
       left join business_moderation_state m on m.business_id = b.id
       where b.id = $1`,
      [businessId]
    );

  const offeringState = (offeringId: string) =>
    pool.query<{
      eligibility: string;
      lifecycle: string;
      projected: string;
    }>(
      `select o.status::text as lifecycle,
         coalesce((select p.status::text from offering_publication p
           where p.offering_id = o.id
           order by p.eligibility_version desc limit 1),'PENDING') as eligibility,
         (select count(*)::text from offering_search_projection s
           where s.offering_id = o.id) as projected
       from offering o where o.id = $1`,
      [offeringId]
    );

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    const { createApiApp } = await import("../apps/api/src/bootstrap.js");
    app = await createApiApp({ logLevel: "fatal" });
    processor = new OutboxProcessor({ dispatcher, pool, publicWebUrl: ORIGIN });

    admin = await signUp();
    await pool.query(
      `insert into admin_authorization (user_id, granted_by) values ($1,'test')`,
      [admin.userId]
    );
    await send("PUT", "/auth/me/admin-context", { cookie: admin.cookie });

    const category = await send("POST", "/admin/categories", {
      body: {
        domain: "MOBILITY",
        name: "Otomobil",
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

  it("restricts only an Unrestricted Business, and produces both outcomes", async () => {
    const business = await owner();

    const first = await restrict(business.businessId);
    const again = await restrict(business.businessId);
    const after = await businessState(business.businessId);

    // AC-1 and AC-2. The transition starts from Unrestricted and arrives at
    // two results that come together — the exposure input is not a second
    // thing an Admin sets.
    expect(first.statusCode).toBe(200);
    expect(again.statusCode).toBe(409);
    expect(after.rows[0]?.moderation).toBe("RESTRICTED");
    expect(after.rows[0]?.exposure).toBe("INELIGIBLE");
  });

  it("restores only a Restricted Business, and produces both outcomes", async () => {
    const business = await owner();
    const premature = await restore(business.businessId);
    await restrict(business.businessId);

    const restored = await restore(business.businessId);
    const after = await businessState(business.businessId);

    // AC-5 and AC-6. Restoring something that was never restricted is not a
    // harmless repeat; it is a claim about a transition that did not happen.
    expect(premature.statusCode).toBe(409);
    expect(restored.statusCode).toBe(200);
    expect(after.rows[0]?.moderation).toBe("UNRESTRICTED");
    expect(after.rows[0]?.exposure).toBe("ELIGIBLE");
  });

  it("moves no Offering lifecycle in either direction", async () => {
    const business = await owner();
    const published = await offering(business);
    const draft = await offering(business, { publish: false });

    await restrict(business.businessId);
    const restricted = await Promise.all([
      offeringState(published),
      offeringState(draft)
    ]);
    await restore(business.businessId);
    const restored = await Promise.all([
      offeringState(published),
      offeringState(draft)
    ]);

    // AC-3 and AC-7. A Published Offering is still Published while its
    // Business is Restricted, and a Draft is still a Draft after restoration —
    // restoring a Business publishes nothing.
    expect(restricted.map((r) => r.rows[0]?.lifecycle)).toEqual([
      "PUBLISHED",
      "DRAFT"
    ]);
    expect(restored.map((r) => r.rows[0]?.lifecycle)).toEqual([
      "PUBLISHED",
      "DRAFT"
    ]);
  });

  it("records the composed result rather than only acting on it", async () => {
    const business = await owner();
    const published = await offering(business);

    const before = await offeringState(published);
    await restrict(business.businessId);
    const restricted = await offeringState(published);
    await restore(business.businessId);
    const restored = await offeringState(published);

    // AC-4 and AC-8. Losing eligibility is a composition, and the composition's
    // answer is written into the sequence — not just enacted by deleting a
    // projection. Without this, the Business's own Dashboard would keep
    // reporting a result that no longer held.
    expect(before.rows[0]).toEqual({
      eligibility: "ELIGIBLE",
      lifecycle: "PUBLISHED",
      projected: "1"
    });
    expect(restricted.rows[0]).toEqual({
      eligibility: "INELIGIBLE",
      lifecycle: "PUBLISHED",
      projected: "0"
    });
    expect(restored.rows[0]).toEqual({
      eligibility: "ELIGIBLE",
      lifecycle: "PUBLISHED",
      projected: "1"
    });
  });

  it("gives no eligibility back to a Draft, Hidden or Archived Offering", async () => {
    const business = await owner();
    const hidden = await offering(business);
    await send("POST", `/admin/offerings/${hidden}/concealment`, {
      cookie: admin.cookie
    });
    const archived = await offering(business);
    await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${archived}/retirement`,
      { cookie: business.cookie }
    );
    const draft = await offering(business, { publish: false });

    await restrict(business.businessId);
    await restore(business.businessId);
    const after = await Promise.all([
      offeringState(hidden),
      offeringState(archived),
      offeringState(draft)
    ]);

    // AC-7 and AC-8. Each of the three is ineligible for a reason restoration
    // does not touch, so none of them comes back into Discovery.
    expect(after.map((r) => r.rows[0]?.lifecycle)).toEqual([
      "HIDDEN",
      "ARCHIVED",
      "DRAFT"
    ]);
    expect(after.map((r) => r.rows[0]?.projected)).toEqual(["0", "0", "0"]);
  });

  it("reaches no Affiliate Destination, account or ownership row", async () => {
    const business = await owner();
    const published = await offering(business);
    await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${published}/affiliate-destination`,
      { body: { reference: "https://a.test" }, cookie: business.cookie }
    );
    const unrelated = () =>
      pool.query(
        `select d.status::text as destination,
           d.validation_result::text as validation,
           d.handoff_eligibility::text as handoff,
           u.status::text as account,
           (select count(*)::text from business_owner o
            where o.business_id = $2) as owners
         from affiliate_destination d
         cross join user_account u
         where d.offering_id = $1 and u.id = $3`,
        [published, business.businessId, business.userId]
      );
    const before = await unrelated();

    await restrict(business.businessId);
    const restricted = await unrelated();
    await restore(business.businessId);
    const restored = await unrelated();

    // AC-9. Five results with nothing to do with Business moderation, and none
    // of them moved — because nothing in the path writes any of them.
    expect(restricted.rows[0]).toEqual(before.rows[0]);
    expect(restored.rows[0]).toEqual(before.rows[0]);
  });

  it("leaves the case Open and cites the action that was applied", async () => {
    const business = await owner();
    const opened = moderationCaseSchema.parse(
      (
        await send("POST", "/admin/moderation-cases", {
          body: { businessId: business.businessId, targetType: "BUSINESS" },
          cookie: admin.cookie
        })
      ).json()
    );

    await restrict(business.businessId);
    const after = moderationCaseSchema.parse(
      (
        await send("GET", `/admin/moderation-cases/${opened.id}`, {
          cookie: admin.cookie
        })
      ).json()
    );

    // AC-10. Applying an approved action gives a later closure something to
    // stand on, and closes nothing by itself.
    expect(after.status).toBe("OPEN");
    expect(after.resolutions.map((r) => r.action)).toEqual([
      "RESTRICT_BUSINESS"
    ]);
  });

  it("claims no transition when the action fails", async () => {
    const business = await owner();
    const published = await offering(business);
    const beforeBusiness = await businessState(business.businessId);
    const beforeOffering = await offeringState(published);

    const refused = await restore(business.businessId);
    const afterBusiness = await businessState(business.businessId);
    const afterOffering = await offeringState(published);

    // AC-11. Nothing moved: not the moderation status, not the exposure input,
    // not the Offering's recorded eligibility, not its projection. The
    // transaction refused rather than the service undoing anything.
    expect(refused.statusCode).toBe(409);
    expect(afterBusiness.rows[0]).toEqual(beforeBusiness.rows[0]);
    expect(afterOffering.rows[0]).toEqual(beforeOffering.rows[0]);
  });

  it("names two transitions and their source states", () => {
    // AC-1 and AC-5 read without a database. There is no third entry, so
    // suspending, deleting or transferring a Business is not something this
    // action family can express.
    expect(BUSINESS_MODERATION_SOURCE).toEqual({
      RESTORE_BUSINESS: "RESTRICTED",
      RESTRICT_BUSINESS: "UNRESTRICTED"
    });
  });
});
