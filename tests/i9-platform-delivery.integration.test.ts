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

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

const ORIGIN = "http://localhost:3000";
const PASSWORD = "correct horse battery staple";

/**
 * Exactly the indicator groups the Story names, and nothing else.
 *
 * **Ten since `PRD-0006-platform.md` v2.5 §11.2**, which the Owner approved and
 * Froze on 2026-09-03 after asking for it by name. `affiliateHandoffRate` is a
 * ratio of two occurrences already in this list — `coreFlow`'s Presentation
 * Opens and Affiliate Handoff Completions — so it measures nothing new, and
 * §11.6.1 says so. It is still named here rather than absorbed, because the
 * point of this list is that a tenth key had to be argued for.
 */
const ANALYTICS_GROUPS = [
  "actionable",
  "affiliateDestinations",
  "affiliateHandoffRate",
  "businesses",
  "coreFlow",
  "destinationWorkload",
  "moderationCases",
  "offerings",
  "period",
  "userAccounts"
];

class RecordingDispatcher implements EmailDispatcher {
  readonly delivered: EmailMessage[] = [];

  deliver(message: EmailMessage): Promise<void> {
    this.delivered.push(message);
    return Promise.resolve();
  }
}

/**
 * The one Platform criterion nothing yet asserted.
 *
 * `US-PLT-F10-001` AC-18 is a list of ten things Basic Analytics must not
 * become. Two clauses were already checked — a custom date range is refused,
 * and the words that would turn a Completion into a sale appear nowhere in the
 * response — and one is held from the other side by `i6-business-dashboard`
 * *reports no metric, ranking or trend of any kind*.
 *
 * The rest were carried by nothing. A criterion that forbids ten futures is
 * awkward to test because none of them exists yet; the useful assertion is not
 * that each is absent one by one, but that **the answer has exactly the shape
 * the Story describes**, so anything derived, predicted or per-Business that
 * arrived later would have to arrive as a visible change here.
 */
suite("Increment I9 Platform delivery evidence", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };

  const address = () => `pd-${randomUUID()}@example.test`;
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
    const link = /https?:\/\/\S+/u.exec(message?.body ?? "")?.[0] ?? "";
    const confirmed = await send("POST", "/auth/registrations/confirmations", {
      body: { token: new URL(link).searchParams.get("token") }
    });
    const cookies = confirmed.cookies as { name: string; value: string }[];
    return {
      cookie: `commerce_session=${cookies.find((c) => c.name === "commerce_session")?.value ?? ""}`,
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

    admin = await signUp();
    await pool.query(
      `insert into admin_authorization (user_id, granted_by) values ($1,'test')`,
      [admin.userId]
    );
    await send("PUT", "/auth/me/admin-context", { cookie: admin.cookie });
  });

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    dispatcher.delivered.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("answers with exactly the groups the Story names and nothing derived", async () => {
    const answered = await send("GET", "/admin/analytics?period=ALL_TIME", {
      cookie: admin.cookie
    });
    const snapshot = answered.json<Record<string, unknown>>();

    // `US-PLT-F10-001` AC-18. Ten groups, counted from their own authorities.
    // Asserted as an equality rather than a set of `toContain` checks, because
    // the criterion is about what must never be added: a forecast, a trend, a
    // score or a recommendation would each arrive as a tenth key, and this is
    // the line it would break.
    expect(Object.keys(snapshot).sort()).toEqual(ANALYTICS_GROUPS);
    /*
     * **Applied to the payload's vocabulary rather than to the whole payload.**
     *
     * It used to run against `JSON.stringify(snapshot)`, which was right while
     * every value was a number. §11.6's per-Offering breakdown puts **titles**
     * in — words a partner wrote — and a product legitimately called "Trend
     * Mikrofon" would then fail a case about what the *platform* may report.
     *
     * The criterion is about the platform's own vocabulary: a forecast, a
     * trend, a score or a recommendation would arrive as a key. So the keys are
     * what is read, at every depth, and the guard keeps every word it had.
     */
    const keysOf = (value: unknown): string[] =>
      value === null || typeof value !== "object"
        ? []
        : Array.isArray(value)
          ? value.flatMap(keysOf)
          : Object.entries(value).flatMap(([key, child]) => [
              key,
              ...keysOf(child)
            ]);
    expect(keysOf(snapshot).join(" ")).not.toMatch(
      /forecast|predict|trend|recommend|score|ranking|billing|invoice|advert/iu
    );
  });

  it("counts nothing per Business and offers no Business a figure", async () => {
    const owner = await signUp();
    const business = await send("POST", "/businesses", {
      body: { name: "Kartal Motors", slug: slug() },
      cookie: owner.cookie
    });
    const businessId = business.json<{ id: string }>().id;
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: owner.cookie
    });

    const snapshot = await send("GET", "/admin/analytics?period=ALL_TIME", {
      cookie: admin.cookie
    });
    const dashboard = await send(`GET`, `/businesses/${businessId}/dashboard`, {
      cookie: owner.cookie
    });
    const refused = await send("GET", "/admin/analytics?period=ALL_TIME", {
      cookie: owner.cookie
    });

    // AC-18's "Business-facing analytics" clause, from both ends. The Admin
    // snapshot names no Business — it counts Businesses by moderation status,
    // never one Business's figures — and the owner's own Dashboard carries no
    // indicator to read. `i6-business-dashboard` holds the second half in
    // detail; what this adds is that the Admin figures are not a Business's
    // figures wearing another name.
    expect(snapshot.body).not.toContain(businessId);
    expect(snapshot.body).not.toContain("Kartal Motors");
    expect(JSON.stringify(dashboard.json())).not.toMatch(
      /count|total|views|opens|starts|completions/iu
    );
    // And there is one analytics address, inside the Admin context only.
    expect(refused.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("keeps the period the only thing a reader may choose", async () => {
    const grouped = await send(
      "GET",
      "/admin/analytics?period=ALL_TIME&groupBy=business",
      { cookie: admin.cookie }
    );
    const filtered = await send(
      "GET",
      "/admin/analytics?period=ALL_TIME&businessId=" + randomUUID(),
      { cookie: admin.cookie }
    );
    const plain = await send("GET", "/admin/analytics?period=ALL_TIME", {
      cookie: admin.cookie
    });

    // AC-18 again, on the axis a report builder grows along. A grouping or a
    // filter parameter is either refused or ignored — never honoured — so the
    // answer cannot be steered into a custom report by asking differently.
    for (const attempt of [grouped, filtered])
      expect(attempt.statusCode >= 400 || attempt.body === plain.body).toBe(
        true
      );
  });
});
