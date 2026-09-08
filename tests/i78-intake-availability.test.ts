import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { composePublicEligibility } from "../modules/offering/src/index.js";
import { PROJECT_OFFERING } from "../packages/database/src/index.js";
import { FeedSyncer } from "../apps/worker/src/feed.sync.js";
import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import { silentLogger } from "../packages/testing/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import {
  adminOfferingFeedsSchema,
  analyticsSchema,
  searchViewSchema
} from "../packages/contracts/src/index.js";

/**
 * `I78` — the third eligibility input, and the affiliate rate.
 *
 * Two things the Owner decided on 2026-09-03, and both needed a Frozen document
 * before they could be built.
 *
 * ## The withdrawal (`PRD-0001` v4.1 §7.2)
 *
 * _"Bu tolerans süresinin sonunda hala feed'de yoksa, sistem ürünü otomatik
 * olarak yayından kaldırsın"_ — with the reason that shaped every line of it:
 * one API outage must not delete a catalogue.
 *
 * **Neither lifecycle state could carry it.** `Archived` has no way back
 * (§6.5), so a three-day partner outage would destroy a catalogue permanently;
 * `Hidden` is an Admin's moderation outcome that only an Admin may undo (§7.2,
 * FR-15), so a partner returning would leave somebody restoring four thousand
 * listings by hand. The cases below are the ones that go wrong if the third
 * input is implemented as either of those, or implemented carelessly:
 *
 * - a withdrawal that changes the lifecycle, which makes it irreversible or
 *   makes an intake perform moderation;
 * - a withdrawal recorded on the strength of a **failed** reading, which turns
 *   one outage at a partner into a catalogue leaving Search;
 * - a return that needs an Admin;
 * - an unrelated republish — a Business restore, an Admin *Restore*, an owner
 *   publishing a Draft — quietly putting a withdrawn listing back.
 *
 * ## The rate (`PRD-0006` v2.5 §11.6)
 *
 * The Owner's own emphasis: an Offering nobody has opened has **no rate**, not
 * a rate of zero — _"veri okuryazarlığı açısından çok isabetli"_ — and the rate
 * must never reach Discovery ordering.
 */
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

describe("Increment I78 composing the third input", () => {
  it("makes a withdrawn Offering ineligible without touching its lifecycle", () => {
    expect(
      composePublicEligibility({
        businessExposure: "ELIGIBLE",
        intakeAvailability: "UNAVAILABLE",
        lifecycle: "PUBLISHED"
      })
    ).toEqual({ reason: "INTAKE_UNAVAILABLE", status: "INELIGIBLE" });
  });

  it("treats an unstated input as available, because that is what it means", () => {
    /*
     * §7.3: an Offering whose Source is not Feed is Eligible on this input by
     * construction. Hundreds of call sites have nothing to do with an intake,
     * and the default is the honest answer for every one of them rather than a
     * convenience — "not stated" and "available" are the same fact.
     */
    expect(
      composePublicEligibility({
        businessExposure: "ELIGIBLE",
        lifecycle: "PUBLISHED"
      })
    ).toEqual({ reason: null, status: "ELIGIBLE" });
  });

  it("keeps the more specific reason when more than one input disagrees", () => {
    // An Archived listing that also vanished from a feed is a retired listing,
    // not a withdrawn one, and the recorded reason should say so.
    expect(
      composePublicEligibility({
        businessExposure: "ELIGIBLE",
        intakeAvailability: "UNAVAILABLE",
        lifecycle: "ARCHIVED"
      }).reason
    ).toBe("LIFECYCLE_ARCHIVED");
    expect(
      composePublicEligibility({
        businessExposure: "INELIGIBLE",
        intakeAvailability: "UNAVAILABLE",
        lifecycle: "PUBLISHED"
      }).reason
    ).toBe("BUSINESS_INELIGIBLE");
  });
});

suite("Increment I78 withdrawing what a feed stopped offering", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let adminCookie: string;
  let businessId: string;
  let categoryId: string;

  const address = () => `iav-${randomUUID()}@example.test`;
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

  const syncerFor = (documents: Record<string, string>) =>
    new FeedSyncer({
      fetch: (url) =>
        Promise.resolve(
          documents[url] === undefined
            ? new Response("gone", { status: 503 })
            : new Response(documents[url], { status: 200 })
        ),
      pool
    });

  const document = (rows: string) => `<products>${rows}</products>`;
  const product = (sku: string, name: string) =>
    `<product><sku>${sku}</sku><name>${name}</name>` +
    `<price>129,90</price><currency>TRY</currency></product>`;

  /** A feed with one product already imported and published. */
  const seeded = async (marker: string) => {
    const url = `https://partner.test/${randomUUID()}.xml`;
    const created = await send("POST", "/admin/offering-feeds", {
      body: {
        businessId,
        categoryId,
        documentUrl: url,
        format: "XML",
        mapping: {
          currency: "currency",
          externalId: "sku",
          price: "price",
          title: "name"
        },
        name: `Feed ${randomUUID().slice(0, 8)}`
      },
      cookie: adminCookie
    });
    if (created.statusCode !== 201)
      throw new Error(`FEED_REFUSED_${created.statusCode}`);
    const feed = adminOfferingFeedsSchema
      .parse(
        (
          await send("GET", "/admin/offering-feeds", { cookie: adminCookie })
        ).json()
      )
      .feeds.find((entry) => entry.documentUrl === url);
    if (feed === undefined) throw new Error("FEED_NOT_LISTED");

    const row = {
      businessId,
      categoryId,
      documentUrl: url,
      format: "XML" as const,
      id: feed.feedId,
      itemPath: null,
      mapping: feed.mapping as never,
      name: feed.name
    };
    /*
     * The listing exists before the feed ever reads the document (I88). Since
     * the Owner scoped the intake to price and stock it creates nothing, so the
     * thing a withdrawal withdraws has to be carried by the platform first —
     * which is the real order of events now: the file import builds the
     * catalogue, and the feed only ever finds it.
     */
    const listing = await pool.query<{ id: string }>(
      `insert into offering
         (business_id, category_id, slug, title, status, source, pricing_kind,
          amount, currency, amount_set_at, stock_state, published_at)
       values ($1,$2,$3,$4,'PUBLISHED','FEED','FIXED',129.90,'TRY',now(),
         'IN_STOCK', now())
       returning id`,
      [businessId, categoryId, `carried-${marker}`, `Ürün ${marker}`]
    );
    const offeringId = listing.rows[0]?.id ?? "";
    await pool.query(
      `insert into offering_feed_item (feed_id, external_id, offering_id)
       values ($1,$2,$3)`,
      [feed.feedId, marker, offeringId]
    );
    await pool.query(
      `insert into offering_publication (offering_id, status, eligibility_version)
       values ($1,'ELIGIBLE',1)`,
      [offeringId]
    );
    await pool.query(PROJECT_OFFERING, [offeringId, 1]);

    await syncerFor({
      [url]: document(product(marker, `Ürün ${marker}`))
    }).sync(row);
    return { row, url };
  };

  const state = async (feedId: string, externalId: string) => {
    const found = await pool.query<{
      intakeAvailable: boolean;
      offeringId: string;
      projected: number;
      slug: string;
      status: string;
      withdrawnAt: Date | null;
    }>(
      `select o.id as "offeringId", o.slug, o.status::text as status,
         o.intake_available as "intakeAvailable",
         i.withdrawn_at as "withdrawnAt",
         (select count(*)::int from offering_search_projection p
          where p.offering_id = o.id) as projected
       from offering_feed_item i join offering o on o.id = i.offering_id
       where i.feed_id = $1 and i.external_id = $2`,
      [feedId, externalId]
    );
    return found.rows[0] ?? null;
  };

  /** Ages the absence past the Owner's 72-hour tolerance. */
  const age = (feedId: string, externalId: string) =>
    pool.query(
      `update offering_feed_item set missing_since = now() - interval '73 hours'
       where feed_id = $1 and external_id = $2`,
      [feedId, externalId]
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

    const admin = await signUp();
    await pool.query(
      `insert into admin_authorization (user_id, granted_by) values ($1,'test')`,
      [admin.userId]
    );
    await send("PUT", "/auth/me/admin-context", { cookie: admin.cookie });
    adminCookie = admin.cookie;

    const category = await send("POST", "/admin/categories", {
      body: {
        domain: "TECHNOLOGY",
        name: `Çekilme ${randomUUID().slice(0, 8)}`,
        slug: slug(),
        stableKey: key()
      },
      cookie: adminCookie
    });
    categoryId = category.json<{ id: string }>().id;

    const owner = await signUp();
    const business = await send("POST", "/businesses", {
      body: { name: `Partner ${randomUUID().slice(0, 6)}`, slug: slug() },
      cookie: owner.cookie
    });
    businessId = business.json<{ id: string }>().id;
  });

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    dispatcher.delivered.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("withdraws past the tolerance without changing the lifecycle", async () => {
    const marker = randomUUID().slice(0, 8);
    const { row, url } = await seeded(marker);
    expect((await state(row.id, marker))?.projected).toBe(1);

    // The document stops offering it. Inside the tolerance: nothing withdrawn.
    const empty = syncerFor({ [url]: document("") });
    const inside = await empty.sync(row);
    expect(inside.withdrawn).toBe(0);
    expect((await state(row.id, marker))?.projected).toBe(1);

    // Three days later.
    await age(row.id, marker);
    const past = await empty.sync(row);
    expect(past.withdrawn).toBe(1);

    const after = await state(row.id, marker);
    // **Still Published.** The lifecycle is untouched, which is what makes this
    // reversible — and what stops an intake performing a moderation action.
    expect(after?.status).toBe("PUBLISHED");
    expect(after?.intakeAvailable).toBe(false);
    // Out of Discovery: the projection's existence is the public gate.
    expect(after?.projected).toBe(0);
  });

  it("records why, in the eligibility history", async () => {
    const marker = randomUUID().slice(0, 8);
    const { row, url } = await seeded(marker);
    await syncerFor({ [url]: document("") }).sync(row);
    await age(row.id, marker);
    await syncerFor({ [url]: document("") }).sync(row);

    const current = await state(row.id, marker);
    const history = await pool.query<{ reason: string | null; status: string }>(
      `select status::text as status, reason_code as reason
       from offering_publication where offering_id = $1
       order by eligibility_version desc limit 1`,
      [current?.offeringId]
    );
    // Recorded rather than only acted on: a Business Dashboard reading the
    // latest evaluation would otherwise go on reporting a composition that no
    // longer holds.
    expect(history.rows[0]).toEqual({
      reason: "INTAKE_UNAVAILABLE",
      status: "INELIGIBLE"
    });
  });

  it("puts it back when the partner offers it again, with no Admin involved", async () => {
    /*
     * **The property that made a third eligibility input the right mechanism.**
     * `Hidden` would have needed an Admin here, for every listing.
     */
    const marker = randomUUID().slice(0, 8);
    const { row, url } = await seeded(marker);
    await syncerFor({ [url]: document("") }).sync(row);
    await age(row.id, marker);
    await syncerFor({ [url]: document("") }).sync(row);
    expect((await state(row.id, marker))?.projected).toBe(0);

    const back = await syncerFor({
      [url]: document(product(marker, `Geri döndü ${marker}`))
    }).sync(row);

    expect(back.restored).toBe(1);
    const after = await state(row.id, marker);
    expect(after?.intakeAvailable).toBe(true);
    expect(after?.withdrawnAt).toBeNull();
    expect(after?.projected).toBe(1);

    // And it is findable again.
    const view = searchViewSchema.parse(
      (
        await send("POST", "/discovery/search", { body: { query: marker } })
      ).json()
    );
    expect(view.results.map((r) => r.offeringId)).toContain(after?.offeringId);
  });

  it("withdraws nothing on a reading it could not complete", async () => {
    /*
     * **`PRD-0001` v4.1 §5.11.1a's fourth rule, and the one an implementation
     * would omit.** An intake that could not reach or parse its source has
     * learned nothing about availability. Without this, one outage at a partner
     * takes their whole catalogue out of Search — which is the failure the
     * Owner's tolerance exists to prevent, arriving by a different door.
     */
    const marker = randomUUID().slice(0, 8);
    const { row } = await seeded(marker);
    await age(row.id, marker);

    // Nothing registered at that address: the fetcher answers 503.
    const failed = await syncerFor({}).sync(row);
    expect(failed.outcome).toBe("FAILED");
    expect(failed.withdrawn).toBe(0);

    const after = await state(row.id, marker);
    expect(after?.intakeAvailable).toBe(true);
    expect(after?.projected).toBe(1);
  });

  it("is not undone by an Admin Restore", async () => {
    /*
     * An Admin restoring a Hidden listing is undoing a Hide. Whether the
     * partner still sells the thing is a different question with a different
     * owner, and answering both with one action would put a withdrawn product
     * back into Search.
     */
    const marker = randomUUID().slice(0, 8);
    const { row, url } = await seeded(marker);
    await syncerFor({ [url]: document("") }).sync(row);
    await age(row.id, marker);
    await syncerFor({ [url]: document("") }).sync(row);

    const current = await state(row.id, marker);
    await send("POST", `/admin/offerings/${current?.offeringId}/moderation`, {
      body: { action: "HIDE_OFFERING" },
      cookie: adminCookie
    });
    await send("POST", `/admin/offerings/${current?.offeringId}/moderation`, {
      body: { action: "RESTORE_OFFERING" },
      cookie: adminCookie
    });

    const after = await state(row.id, marker);
    expect(after?.status).toBe("PUBLISHED");
    // Restored to Published, and still out of Discovery, because the feed still
    // does not offer it.
    expect(after?.projected).toBe(0);
  });

  it("is not undone by restoring the Business", async () => {
    /*
     * The one that composes **per Offering**. Restoring a Business restores its
     * listings — and a listing its own feed withdrew three days ago is not one
     * of them. Composing once for the Business and applying it to every row
     * would put withdrawn products back into Search on the day a restriction
     * was lifted, a fault nobody would connect to the restore.
     */
    const marker = randomUUID().slice(0, 8);
    const { row, url } = await seeded(marker);
    await syncerFor({ [url]: document("") }).sync(row);
    await age(row.id, marker);
    await syncerFor({ [url]: document("") }).sync(row);

    await send("POST", `/admin/businesses/${businessId}/moderation`, {
      body: { action: "RESTRICT_BUSINESS" },
      cookie: adminCookie
    });
    await send("POST", `/admin/businesses/${businessId}/moderation`, {
      body: { action: "RESTORE_BUSINESS" },
      cookie: adminCookie
    });

    expect((await state(row.id, marker))?.projected).toBe(0);
  });
});

suite("Increment I78 the affiliate handoff rate", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let adminCookie: string;

  const address = () => `ctr-${randomUUID()}@example.test`;

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

    const email = address();
    await send("POST", "/auth/registrations", {
      body: { email, password: PASSWORD }
    });
    await processor.processBatch();
    const message = dispatcher.delivered.find((m) => m.recipient === email);
    const link = /https?:\/\/\S+/u.exec(message?.body ?? "")?.[0];
    const confirmed = await send("POST", "/auth/registrations/confirmations", {
      body: { token: new URL(link ?? "").searchParams.get("token") }
    });
    const cookies = confirmed.cookies as { name: string; value: string }[];
    adminCookie = `commerce_session=${cookies.find((c) => c.name === "commerce_session")?.value ?? ""}`;
    await pool.query(
      `insert into admin_authorization (user_id, granted_by) values ($1,'test')`,
      [confirmed.json<{ userId: string }>().userId]
    );
    await send("PUT", "/auth/me/admin-context", { cookie: adminCookie });
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  const analytics = async () =>
    analyticsSchema.parse(
      (
        await send("GET", "/admin/analytics?period=ALL_TIME", {
          cookie: adminCookie
        })
      ).json()
    );

  it("reports the rate as a ratio of two things already counted", async () => {
    /*
     * §11.6.1. No event, counter or record exists to produce this — which is
     * why it is an addition to an inventory rather than a new capability, and
     * why §19's deferral of technical analytics measurement is untouched.
     */
    const snapshot = await analytics();
    const { handoffs, opens, rate } = snapshot.affiliateHandoffRate.overall;
    expect(handoffs).toBe(
      snapshot.coreFlow.AFFILIATE_HANDOFF_COMPLETIONS.overall
    );
    expect(opens).toBe(snapshot.coreFlow.OFFERING_PRESENTATION_OPENS.overall);
    if (opens === 0) expect(rate).toBeNull();
    else expect(rate).toBeCloseTo(handoffs / opens, 10);
  });

  it("never reports a rate where nobody has looked", async () => {
    /*
     * **The Owner's own emphasis on 2026-09-03.** `0%` reads as "nobody chose
     * this"; the truth is "nobody has looked". They are opposite conclusions
     * from the same figure, which is exactly the kind of mistake a dashboard
     * makes for years.
     *
     * Asserted structurally: every row carries opens, and no row may carry a
     * rate without them.
     */
    const snapshot = await analytics();
    for (const row of snapshot.affiliateHandoffRate.byOffering) {
      if (row.opens === 0) expect(row.rate).toBeNull();
      else expect(row.rate).not.toBeNull();
    }
  });

  it("keeps the rate out of every public surface", async () => {
    /*
     * §11.6.3. A rate that could order Results would be ranking by commercial
     * performance, which PRD-0002 forbids outright — so it is asserted absent
     * from what a person actually receives rather than described as forbidden.
     */
    const view = await send("POST", "/discovery/search", {
      body: { query: "a" }
    });
    const body = view.body;
    expect(body).not.toContain("handoffRate");
    expect(body).not.toContain("affiliateHandoffRate");
  });

  it("keeps the rate to an Admin", async () => {
    expect((await send("GET", "/admin/analytics")).statusCode).toBe(401);
  });
});
