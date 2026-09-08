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
import { browseViewSchema } from "../packages/contracts/src/index.js";

/**
 * `I68` — the Owner's four tabs.
 *
 * *Tümü, En yeni, Yükselenler, Popüler* have been at the top of his prototype
 * since the first one, and every list in the platform was arranged one way.
 *
 * **This is the increment that runs against a Frozen document**, and it is
 * worth saying plainly in the place the behaviour is asserted: PRD-0002 §12.5
 * excludes a user-controlled Sort from V1. What is admitted here is narrower
 * than the thing that section refuses — four arrangements the platform defines,
 * computed from facts it already records, applied identically to every listing
 * — and the four exclusions beside it (paid placement, sponsored priority,
 * promoted Listing Cards, Business-controlled ranking) are untouched. The
 * superseding revision that records the decision is
 * `PRD-0002-discovery-v3.0-draft.md`; until the Owner approves it, this code is
 * ahead of its document and the draft says so.
 *
 * The cases below are the ones where an implementation looks right and is not:
 *
 * - a tab that replaces the arrangement instead of leading it, so two products
 *   nobody has opened come back in whatever order the database produced;
 * - attention counted per *Offering*, so three partners selling one phone split
 *   its popularity three ways and none of them ranks;
 * - the counts leaking onto the card, which would publish a popularity claim no
 *   document has decided to make;
 * - and an unknown arrangement being accepted, which is the whole closed-set
 *   promise gone.
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

suite("Increment I68 result arrangement", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let categoryId: string;
  let domainId: string;

  const address = () => `arr-${randomUUID()}@example.test`;
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

  const list = async (input: {
    amount: string;
    productKey?: string;
    title: string;
  }) => {
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
      body: { categoryId, slug: offeringSlug, title: input.title },
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
            amount: input.amount,
            currency: "TRY",
            kind: "FIXED",
            stockState: "IN_STOCK"
          },
          ...(input.productKey === undefined
            ? {}
            : { productKey: input.productKey }),
          title: input.title
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

  /** Opens recorded against one Offering, inside the thirty-day window. */
  const opens = (offeringId: string, count: number) =>
    pool.query(
      `insert into offering_presentation_open (offering_id, domain_id, opened_at)
       select $1, $2, now() - interval '2 days'
       from generate_series(1, $3::int)`,
      [offeringId, domainId, count]
    );

  const arranged = async (arrangement: string) => {
    const view = browseViewSchema.parse(
      (
        await send("POST", `/discovery/browse/categories/${categoryId}`, {
          body: { arrangement }
        })
      ).json()
    );
    return view;
  };

  const titles = async (arrangement: string) =>
    (await arranged(arrangement)).results?.map((card) => card.title) ?? [];

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
    const category = await send("POST", "/admin/categories", {
      body: {
        domain: "TECHNOLOGY",
        name: `Sıralama ${randomUUID().slice(0, 8)}`,
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });
    categoryId = category.json<{ id: string }>().id;
    domainId = (
      await pool.query<{ id: string }>(
        `select domain_id as id from category where id = $1`,
        [categoryId]
      )
    ).rows[0]?.id as string;
  });

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    dispatcher.delivered.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("arranges by price when no tab is pressed, and says which arrangement it used", async () => {
    const mark = randomUUID().slice(0, 8);
    await list({ amount: "9000.00", title: `Pahalı ${mark}` });
    await list({ amount: "1000.00", title: `Ucuz ${mark}` });

    const view = await arranged("DEFAULT");
    expect(view.arrangement).toBe("DEFAULT");
    const shown = (view.results ?? []).map((card) => card.title);
    expect(shown.indexOf(`Ucuz ${mark}`)).toBeLessThan(
      shown.indexOf(`Pahalı ${mark}`)
    );
  });

  it("puts the newest first, whatever it costs", async () => {
    const mark = randomUUID().slice(0, 8);
    await list({ amount: "1000.00", title: `Önce ${mark}` });
    await list({ amount: "9000.00", title: `Sonra ${mark}` });

    /*
     * The expensive listing is the newest one, so this is exactly the case the
     * DEFAULT arrangement would order the other way — which is what makes it
     * evidence that the tab, and not the price, decided.
     */
    const shown = await titles("NEWEST");
    expect(shown.indexOf(`Sonra ${mark}`)).toBeLessThan(
      shown.indexOf(`Önce ${mark}`)
    );
  });

  it("counts opens over the product, not over the seller", async () => {
    const mark = randomUUID().slice(0, 8);
    const productKey = key();

    // One product, two partners. Neither seller alone out-opens the rival
    // below; together the product does — which is the whole point of counting
    // over the group the card stands for.
    const first = await list({
      amount: "5000.00",
      productKey,
      title: `Ortak ürün ${mark}`
    });
    const second = await list({
      amount: "5100.00",
      productKey,
      title: `Ortak ürün ${mark}`
    });
    const rival = await list({ amount: "100.00", title: `Rakip ${mark}` });

    await opens(first.offeringId, 3);
    await opens(second.offeringId, 3);
    await opens(rival.offeringId, 5);

    const shown = await titles("POPULAR");
    expect(shown.indexOf(`Ortak ürün ${mark}`)).toBeLessThan(
      shown.indexOf(`Rakip ${mark}`)
    );

    // And the cheap rival still leads under the ordinary arrangement, so the
    // difference is the tab rather than anything about the listings.
    const ordinary = await titles("DEFAULT");
    expect(ordinary.indexOf(`Rakip ${mark}`)).toBeLessThan(
      ordinary.indexOf(`Ortak ürün ${mark}`)
    );
  });

  it("falls back to the ordinary arrangement where a tab cannot separate two products", async () => {
    /*
     * Two products nobody has opened. `POPULAR` has nothing to say about
     * either, and the answer must not therefore be arbitrary: the tab is a
     * prefix to the ordinary ordering, not a replacement for it.
     */
    const mark = randomUUID().slice(0, 8);
    await list({ amount: "8000.00", title: `Sessiz pahalı ${mark}` });
    await list({ amount: "800.00", title: `Sessiz ucuz ${mark}` });

    const shown = await titles("POPULAR");
    expect(shown.indexOf(`Sessiz ucuz ${mark}`)).toBeLessThan(
      shown.indexOf(`Sessiz pahalı ${mark}`)
    );
  });

  it("publishes no attention counts on the card", async () => {
    const mark = randomUUID().slice(0, 8);
    const listed = await list({ amount: "1000.00", title: `Sayaç ${mark}` });
    await opens(listed.offeringId, 4);

    /*
     * `browseViewSchema` is `.strict()`, so a leaked ordering column would fail
     * the parse above rather than reach here — this asserts the intent as well,
     * because the numbers are ordering inputs and publishing them would put a
     * popularity claim on every card that no document has decided to make.
     */
    const card = (await arranged("POPULAR")).results?.[0];
    expect(Object.keys(card ?? {})).not.toContain("openCount");
    expect(Object.keys(card ?? {})).not.toContain("trendScore");
  });

  it("refuses an arrangement that is not one of the four", async () => {
    const refused = await send(
      "POST",
      `/discovery/browse/categories/${categoryId}`,
      { body: { arrangement: "SPONSORED" } }
    );
    expect(refused.statusCode).toBe(400);
  });

  it("treats a missing arrangement as the ordinary one", async () => {
    // Every client written before the tabs existed keeps working, and keeps
    // getting the list it used to get.
    const view = browseViewSchema.parse(
      (
        await send("POST", `/discovery/browse/categories/${categoryId}`, {
          body: {}
        })
      ).json()
    );
    expect(view.arrangement).toBe("DEFAULT");
  });
});
