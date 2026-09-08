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
import { listingReportsSchema } from "../packages/contracts/src/index.js";

/**
 * `I69` — "Hata Bildir".
 *
 * **The platform had one way to say something is wrong and it belonged to
 * Admins.** A Moderation Case is opened by a person with authority; the reader
 * who notices that a price is three weeks stale is the only person who *can*
 * notice it, and there was nowhere for them to say so. The Owner's requirement
 * replaces *Listeye dön* — a control that duplicated the browser's own back
 * button — with the one thing a reader can do that nobody else on the platform
 * can.
 *
 * The cases below are the ones where this looks implemented and is not:
 *
 * - a report that requires an account, which collects fewer reports from
 *   exactly the people who noticed;
 * - a public write with no bound, which is a way to fill a table;
 * - a report queue that can act on a listing, which would be a second
 *   moderation system with none of the first one's rules;
 * - and two Admins closing one report, where the second silently overwrites the
 *   first one's decision.
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

suite("Increment I69 listing reports", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let categoryId: string;
  let adminCookie: string;

  const address = () => `rep-${randomUUID()}@example.test`;
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

  const list = async (title: string) => {
    const account = await signUp();
    const business = await send("POST", "/businesses", {
      body: { name: `Mağaza ${randomUUID().slice(0, 6)}`, slug: slug() },
      cookie: account.cookie
    });
    const businessId = business.json<{ id: string }>().id;
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });
    const offeringSlug = slug();
    const offering = await send("POST", `/businesses/${businessId}/offerings`, {
      body: { categoryId, slug: offeringSlug, title },
      cookie: account.cookie
    });
    const offeringId = offering.json<{ id: string }>().id;
    await send(
      "PUT",
      `/businesses/${businessId}/offerings/${offeringId}/content`,
      {
        body: {
          attributes: [],
          categoryId,
          pricing: {
            amount: "1000.00",
            currency: "TRY",
            kind: "FIXED",
            stockState: "IN_STOCK"
          },
          title
        },
        cookie: account.cookie
      }
    );
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/publication`,
      { cookie: account.cookie }
    );
    return {
      businessId,
      cookie: account.cookie,
      offeringId,
      slug: offeringSlug
    };
  };

  const report = (offeringSlug: string, body: unknown, cookie?: string) =>
    send("POST", `/offerings/${offeringSlug}/reports`, {
      body,
      ...(cookie === undefined ? {} : { cookie })
    });

  const queue = async (status = "OPEN") =>
    listingReportsSchema.parse(
      (
        await send("GET", `/admin/listing-reports?status=${status}`, {
          cookie: adminCookie
        })
      ).json()
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
        name: `Bildirim ${randomUUID().slice(0, 8)}`,
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });
    categoryId = category.json<{ id: string }>().id;
  });

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    /*
     * The queue is **oldest first**, which is the product decision this file
     * asserts elsewhere — and it means a database that outlives one run pushes
     * this run's reports off the first page behind hundreds of older ones. The
     * rows are cleared so each case reads a queue it wrote, rather than
     * asserting about a page that no longer contains its own evidence.
     */
    await pool.query("delete from listing_report");
    dispatcher.delivered.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("takes a report from somebody who is not signed in", async () => {
    const listed = await list(`Bildirilecek ${randomUUID().slice(0, 8)}`);

    /*
     * The whole point of the increment in one case. Requiring an account here
     * would collect fewer reports from exactly the people who notice — and the
     * response is `202`, not `200`: what the platform has done is accept a
     * claim, not agree with it.
     */
    const sent = await report(listed.slug, {
      note: "Fiyat üç haftadır güncellenmemiş.",
      reason: "PRICE_WRONG"
    });
    expect(sent.statusCode).toBe(202);

    const open = await queue();
    const mine = open.reports.find((row) => row.offeringSlug === listed.slug);
    expect(mine?.reason).toBe("PRICE_WRONG");
    expect(mine?.note).toBe("Fiyat üç haftadır güncellenmemiş.");
    expect(mine?.status).toBe("OPEN");
    // The listing number is on the row because an Admin will quote it to the
    // partner, and a UUID is not something anybody quotes.
    expect(mine?.listingNumber).toMatch(/^\d+$/u);
  });

  it("counts how many people reported the same listing", async () => {
    const listed = await list(`Kalabalık ${randomUUID().slice(0, 8)}`);
    for (const reason of ["PRICE_WRONG", "STOCK_WRONG", "LINK_BROKEN"])
      expect((await report(listed.slug, { reason })).statusCode).toBe(202);

    /*
     * One person saying a price is wrong is a claim; three people saying it is
     * a listing to look at today. The count is on every row so the pattern is
     * visible in the queue rather than found by opening rows one at a time.
     */
    const open = await queue();
    const rows = open.reports.filter((row) => row.offeringSlug === listed.slug);
    expect(rows).toHaveLength(3);
    expect(rows.every((row) => row.reportsForListing === 3)).toBe(true);
  });

  it("refuses a reason nobody offered", async () => {
    const listed = await list(`Uydurma ${randomUUID().slice(0, 8)}`);
    const refused = await report(listed.slug, { reason: "SELLER_IS_RUDE" });
    expect(refused.statusCode).toBe(400);
  });

  it("has nothing to report about a listing nobody can see", async () => {
    // A report about something an Admin cannot open is a report they cannot
    // check, so the eligibility gate applies to reporting exactly as it applies
    // to reading.
    const missing = await report(slug(), { reason: "PRICE_WRONG" });
    expect(missing.statusCode).toBe(404);
  });

  it("bounds how many reports one caller may send", async () => {
    const listed = await list(`Sınır ${randomUUID().slice(0, 8)}`);
    const codes: number[] = [];
    for (let attempt = 0; attempt < 12; attempt += 1)
      codes.push(
        (await report(listed.slug, { reason: "PRICE_WRONG" })).statusCode
      );

    /*
     * A public write with no account behind it needs a bound or it is a way to
     * fill a table. The refusal is a plain `429` rather than a silent drop: a
     * person whose report went nowhere is entitled to know it did.
     */
    expect(codes.filter((code) => code === 202).length).toBeGreaterThan(0);
    expect(codes).toContain(429);
  });

  it("closes a report once, and tells the second Admin somebody got there first", async () => {
    const listed = await list(`Kapanış ${randomUUID().slice(0, 8)}`);
    await report(listed.slug, { reason: "WRONG_CATEGORY" });
    const open = await queue();
    const target = open.reports.find((row) => row.offeringSlug === listed.slug);
    if (target === undefined) throw new Error("NO_REPORT_QUEUED");

    const first = await send(
      "POST",
      `/admin/listing-reports/${target.reportId}/review`,
      { body: { outcome: "ACCEPTED" }, cookie: adminCookie }
    );
    expect(first.statusCode).toBe(200);

    const second = await send(
      "POST",
      `/admin/listing-reports/${target.reportId}/review`,
      { body: { outcome: "DISMISSED" }, cookie: adminCookie }
    );
    expect(second.statusCode).toBe(409);

    // And the first decision stands rather than being overwritten by the
    // second: the row moved to ACCEPTED and stayed there.
    const accepted = await queue("ACCEPTED");
    expect(
      accepted.reports.some((row) => row.reportId === target.reportId)
    ).toBe(true);
  });

  it("changes nothing about the listing it concerns", async () => {
    /*
     * The separation this increment rests on. Accepting a report records that
     * an Admin agrees there is something to fix; PRD-0006 owns what may then be
     * done to an Offering, and a report queue that could hide a listing would
     * be a second moderation system with none of the first one's rules.
     */
    const listed = await list(`Dokunulmaz ${randomUUID().slice(0, 8)}`);
    await report(listed.slug, { reason: "MISLEADING_INFORMATION" });
    const open = await queue();
    const target = open.reports.find((row) => row.offeringSlug === listed.slug);
    if (target === undefined) throw new Error("NO_REPORT_QUEUED");

    await send("POST", `/admin/listing-reports/${target.reportId}/review`, {
      body: { outcome: "ACCEPTED" },
      cookie: adminCookie
    });

    const stillPublic = await send("GET", `/offerings/${listed.slug}`);
    expect(stillPublic.statusCode).toBe(200);
    const status = await pool.query<{ status: string }>(
      `select status::text as status from offering where id = $1`,
      [listed.offeringId]
    );
    expect(status.rows[0]?.status).toBe("PUBLISHED");
  });

  it("keeps the queue to Admins", async () => {
    const stranger = await signUp();
    const refused = await send("GET", "/admin/listing-reports", {
      cookie: stranger.cookie
    });
    /*
     * The same refusal every Admin route gives: an entered Admin context is
     * required, and a signed-in stranger has not entered one. It is the
     * platform's own shape rather than this route's opinion — `resolveAdmin`
     * decides it once for all of them, which is why this case asserts the
     * refusal rather than a status this controller chose.
     */
    expect(refused.statusCode).toBe(403);
  });
});
