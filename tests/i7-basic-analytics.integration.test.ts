import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  ACTIONABLE_QUEUES,
  ANALYTICS_PERIODS,
  associatesDomain,
  CORE_FLOW_INDICATORS,
  periodStart
} from "../modules/analytics/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { analyticsSchema } from "../packages/contracts/src/index.js";
import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";

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
 * `US-PLT-F10-001` Basic Analytics.
 *
 * The occurrences this reads have been recorded since I3 and nothing has ever
 * looked at them. What makes the Story hard is not counting — it is the
 * restraint: no figure may be derived, no Completion may be dressed up as a
 * sale, no Domain may be guessed for a source that never recorded one, and
 * looking at the dashboard must do nothing at all.
 */
suite("Increment I7 Basic Analytics", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

  const address = () => `ana-${randomUUID()}@example.test`;
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

  const analytics = async (period?: string) =>
    analyticsSchema.parse(
      (
        await send(
          "GET",
          period === undefined
            ? "/admin/analytics"
            : `/admin/analytics?period=${period}`,
          { cookie: admin.cookie }
        )
      ).json()
    );

  const publishedOffering = async () => {
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
    const offering = await send("POST", `/businesses/${businessId}/offerings`, {
      body: { categoryId, slug: slug(), title: "Kırmızı araba" },
      cookie: account.cookie
    });
    const offeringId = offering.json<{ id: string }>().id;
    await send(
      "PUT",
      `/businesses/${businessId}/offerings/${offeringId}/content`,
      {
        body: { attributes: [], categoryId, title: "Kırmızı araba" },
        cookie: account.cookie
      }
    );
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/publication`,
      { cookie: account.cookie }
    );
    const record = await pool.query<{ slug: string }>(
      `select slug from offering where id = $1`,
      [offeringId]
    );
    return {
      ...account,
      businessId,
      offeringId,
      slug: record.rows[0]?.slug ?? ""
    };
  };

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

  it("opens only in an authorized active Admin context", async () => {
    const ordinary = await signUp();

    const outsider = await send("GET", "/admin/analytics", {
      cookie: ordinary.cookie
    });
    const guest = await send("GET", "/admin/analytics");
    const inside = await send("GET", "/admin/analytics", {
      cookie: admin.cookie
    });

    // AC-1. The same three gates every Admin surface applies.
    expect(outsider.statusCode).toBe(403);
    expect(guest.statusCode).toBe(401);
    expect(inside.statusCode).toBe(200);
  });

  it("offers exactly four periods and no custom range", async () => {
    const accepted = await Promise.all(
      ANALYTICS_PERIODS.map((period) =>
        send("GET", `/admin/analytics?period=${period}`, {
          cookie: admin.cookie
        })
      )
    );
    const custom = await send(
      "GET",
      "/admin/analytics?period=2026-08-01..2026-08-12",
      { cookie: admin.cookie }
    );

    // AC-2 and AC-18. A date range is refused, because a date picker is the
    // first step towards the report builder the Story excludes.
    expect([...ANALYTICS_PERIODS]).toEqual([
      "TODAY",
      "LAST_7_DAYS",
      "LAST_30_DAYS",
      "ALL_TIME"
    ]);
    expect(accepted.map((r) => r.statusCode)).toEqual([200, 200, 200, 200]);
    expect(custom.statusCode).toBe(400);
  });

  it("bounds occurrences by the period and current state by nothing", async () => {
    const business = await publishedOffering();
    const before = {
      month: await analytics("LAST_30_DAYS"),
      today: await analytics("TODAY")
    };

    await send("GET", `/offerings/${business.slug}`);
    // Aged deliberately: the same occurrence is inside Last 30 days and
    // outside Today, which is the only way to see the window doing anything.
    await pool.query(
      `update offering_presentation_open set opened_at = now() - interval '10 days'
       where offering_id = $1`,
      [business.offeringId]
    );
    const after = {
      month: await analytics("LAST_30_DAYS"),
      today: await analytics("TODAY")
    };

    // The counts are compared as differences rather than absolutes, because
    // every other test in this suite is also producing occurrences.
    expect(after.today.coreFlow.OFFERING_PRESENTATION_OPENS.overall).toBe(
      before.today.coreFlow.OFFERING_PRESENTATION_OPENS.overall
    );
    expect(after.month.coreFlow.OFFERING_PRESENTATION_OPENS.overall).toBe(
      before.month.coreFlow.OFFERING_PRESENTATION_OPENS.overall + 1
    );
    // The Offering itself is counted in both, because "how many Offerings are
    // Published" is not an occurrence a window could bound.
    expect(after.today.offerings.lifecycle.PUBLISHED).toBe(
      after.month.offerings.lifecycle.PUBLISHED
    );
  });

  it("breaks down by Domain only where the source records one", async () => {
    const business = await publishedOffering();
    await send("GET", `/offerings/${business.slug}`);

    const snapshot = await analytics("ALL_TIME");

    // AC-3. Three of six indicators carry the Domain they happened in; the
    // other three record none, and the honest answer is an empty breakdown
    // rather than a Domain borrowed from something related.
    for (const indicator of CORE_FLOW_INDICATORS) {
      const count = snapshot.coreFlow[indicator];
      if (!associatesDomain(indicator)) expect(count.byDomain).toEqual([]);
    }
    expect(
      snapshot.coreFlow.OFFERING_PRESENTATION_OPENS.byDomain.map(
        (each) => each.domain
      )
    ).toContain("MOBILITY");
  });

  it("counts a Search without a leaf Category overall and in no Domain", async () => {
    const before = await analytics("ALL_TIME");

    await send("POST", "/discovery/search", {
      body: { query: "kırmızı araba" }
    });
    const after = await analytics("ALL_TIME");

    // AC-4 and AC-5. The Start is counted, and it lands in no Domain — the
    // breakdown deliberately does not sum to the total, because Platform never
    // infers a Domain from what somebody typed.
    const domainTotal = after.coreFlow.DISCOVERY_STARTS.byDomain.reduce(
      (sum, each) => sum + each.count,
      0
    );
    expect(after.coreFlow.DISCOVERY_STARTS.overall).toBe(
      before.coreFlow.DISCOVERY_STARTS.overall + 1
    );
    expect(domainTotal).toBeLessThan(after.coreFlow.DISCOVERY_STARTS.overall);
  });

  it("shows every current-state indicator by its authoritative result", async () => {
    const business = await publishedOffering();
    await send("POST", `/admin/businesses/${business.businessId}/restriction`, {
      cookie: admin.cookie
    });
    await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${business.offeringId}/affiliate-destination`,
      { body: { reference: "https://a.test" }, cookie: business.cookie }
    );
    await send("POST", "/admin/moderation-cases", {
      body: { businessId: business.businessId, targetType: "BUSINESS" },
      cookie: admin.cookie
    });

    const snapshot = await analytics("ALL_TIME");

    // AC-6 through AC-11. Every group is keyed by the result its own
    // authority produced — nothing is renamed, bucketed or scored on the way.
    expect(Object.keys(snapshot.userAccounts)).toContain("ENABLED");
    expect(snapshot.businesses.RESTRICTED).toBeGreaterThan(0);
    expect(snapshot.offerings.lifecycle.PUBLISHED).toBeGreaterThan(0);
    expect(Object.keys(snapshot.offerings.publicEligibility)).toContain(
      "INELIGIBLE"
    );
    expect(snapshot.affiliateDestinations.status.DRAFT).toBeGreaterThan(0);
    expect(
      snapshot.affiliateDestinations.validationResult.NOT_VALIDATED
    ).toBeGreaterThan(0);
    expect(
      snapshot.affiliateDestinations.handoffEligibility.INELIGIBLE
    ).toBeGreaterThan(0);
    expect(snapshot.moderationCases.status.OPEN).toBeGreaterThan(0);
    expect(snapshot.moderationCases.openByTarget.BUSINESS).toBeGreaterThan(0);
    expect(snapshot.destinationWorkload.NEEDS_VALIDATION).toBeGreaterThan(0);
  });

  it("counts the workload with the same rule the queue uses", async () => {
    const business = await publishedOffering();
    await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${business.offeringId}/affiliate-destination`,
      { body: { reference: "https://a.test" }, cookie: business.cookie }
    );

    const snapshot = await analytics("ALL_TIME");
    const queue = await send(
      "GET",
      "/admin/offerings/affiliate-destinations/workload",
      { cookie: admin.cookie }
    );
    const pending = queue
      .json<{ items: { category: string | null }[] }>()
      .items.filter((item) => item.category === "NEEDS_VALIDATION").length;

    // AC-11. The count and the queue ask the same function, so a figure an
    // Admin acts on cannot disagree with the list they arrive at.
    expect(snapshot.destinationWorkload.NEEDS_VALIDATION).toBe(pending);
  });

  it("keeps the two Completions separate and calls neither a sale", async () => {
    const snapshot = await analytics("ALL_TIME");

    // AC-13 and AC-14. Two fields named for what they are, and no combined
    // figure in which either could be read as an external success. The words
    // that would make that claim appear nowhere in the response.
    expect(snapshot.coreFlow.AFFILIATE_HANDOFF_COMPLETIONS).toBeDefined();
    expect(snapshot.coreFlow.DIRECT_CONTACT_COMPLETIONS).toBeDefined();
    expect(Object.keys(snapshot.coreFlow).sort()).toEqual(
      [...CORE_FLOW_INDICATORS].sort()
    );
    expect(JSON.stringify(snapshot)).not.toMatch(
      /purchase|sale|contract|revenue|conversion|attribution|commission/iu
    );
  });

  it("points actionable indicators at their queues and nothing else at all", async () => {
    const snapshot = await analytics("ALL_TIME");

    // AC-15 and AC-16. Two workload indicators lead somewhere; the six
    // core-flow indicators are things that happened, and there is nowhere to
    // go about them.
    expect(snapshot.actionable).toEqual(ACTIONABLE_QUEUES);
    expect(Object.keys(snapshot.actionable)).toHaveLength(2);
    for (const indicator of CORE_FLOW_INDICATORS)
      expect(Object.keys(snapshot.coreFlow[indicator]).sort()).toEqual([
        "byDomain",
        "overall"
      ]);
  });

  it("does nothing by being read", async () => {
    const business = await publishedOffering();
    const before = await pool.query<{ digest: string }>(
      `select md5(string_agg(x, '|' order by x)) as digest from (
         select o.id::text || o.status::text from offering o
         union all select b.id::text || b.public_exposure::text from business b
         union all select u.id::text || u.status::text from user_account u
         union all select c.id::text || c.status::text from moderation_case c
       ) as t(x)`
    );

    await analytics("TODAY");
    await analytics("ALL_TIME");
    const after = await pool.query<{ digest: string }>(
      `select md5(string_agg(x, '|' order by x)) as digest from (
         select o.id::text || o.status::text from offering o
         union all select b.id::text || b.public_exposure::text from business b
         union all select u.id::text || u.status::text from user_account u
         union all select c.id::text || c.status::text from moderation_case c
       ) as t(x)`
    );

    // AC-17. Every Offering lifecycle, Business exposure, account status and
    // case status in the database, digested before and after two reads. A
    // dashboard with no verb cannot moderate anything.
    expect(after.rows[0]?.digest).toBe(before.rows[0]?.digest);
    expect(business.offeringId).toBeTruthy();
  });

  it("resolves each period boundary the way an Admin would read it", () => {
    const now = new Date("2026-08-12T15:30:00.000Z");

    // `TODAY` means since midnight rather than the last twenty-four hours: an
    // Admin asking what happened today means the day.
    expect(periodStart("TODAY", now)?.toISOString()).toBe(
      "2026-08-12T00:00:00.000Z"
    );
    expect(periodStart("LAST_7_DAYS", now)?.toISOString()).toBe(
      "2026-08-05T15:30:00.000Z"
    );
    expect(periodStart("LAST_30_DAYS", now)?.toISOString()).toBe(
      "2026-07-13T15:30:00.000Z"
    );
    expect(periodStart("ALL_TIME", now)).toBeNull();
  });
});
