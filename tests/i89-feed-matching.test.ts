import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { PROJECT_OFFERING } from "../packages/database/src/index.js";
import { FeedSyncer } from "../apps/worker/src/feed.sync.js";
import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import { silentLogger } from "../packages/testing/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { adminOfferingFeedsSchema } from "../packages/contracts/src/index.js";

/**
 * `I89` — how a feed finds an imported listing.
 *
 * `I88` scoped the intake to price and stock, and left one thing open, which
 * `FEED_MATCHING_OPEN_DECISION.md` put to the Owner: the intake reaches a
 * listing through `offering_feed_item`, and until now only the creation `I88`
 * removed ever wrote one. A feed pointed at an imported catalogue therefore
 * updated **nothing**.
 *
 * The Owner chose **option B on 2026-09-05**: match on the Product Key, within
 * the feed's own Business. It is already in both worlds — a column on
 * `offering`, a mapped feed field, a column in `offerings.csv` — so the
 * operator has already done the work and no schema changed.
 *
 * **Everything here is a refusal except the one certain case.** A match that is
 * ambiguous, unpublished, keyless or already spoken for links nothing, because
 * the failure this could produce is a partner's price attached to the wrong
 * listing — which nobody would notice, on a comparison site, ever.
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

suite("Increment I89 matching a document row to a listing", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let adminCookie = "";
  let businessId = "";
  let categoryId = "";

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
    const email = `i89-${randomUUID()}@example.test`;
    await send("POST", "/auth/registrations", {
      body: { email, password: PASSWORD }
    });
    await processor.processBatch();
    const message = dispatcher.delivered.find((one) => one.recipient === email);
    if (!message) throw new Error("NO_MESSAGE_DELIVERED");
    const link = /https?:\/\/\S+/u.exec(message.body)?.[0];
    if (!link) throw new Error("NO_LINK_IN_MESSAGE");
    const confirmed = await send("POST", "/auth/registrations/confirmations", {
      body: { token: new URL(link).searchParams.get("token") }
    });
    const cookies = confirmed.cookies as { name: string; value: string }[];
    return {
      cookie: `commerce_session=${cookies.find((one) => one.name === "commerce_session")?.value ?? ""}`,
      userId: confirmed.json<{ userId: string }>().userId
    };
  };

  const syncerFor = (documents: Record<string, string>) =>
    new FeedSyncer({
      fetch: (url) =>
        Promise.resolve(
          documents[url] === undefined
            ? new Response("gone", { status: 404 })
            : new Response(documents[url], { status: 200 })
        ),
      pool
    });

  const document = (rows: string) => `<products>${rows}</products>`;
  const product = (input: {
    price?: string;
    productKey?: string;
    sku: string;
  }) =>
    `<product><sku>${input.sku}</sku><name>Partner adı</name>` +
    `<price>${input.price ?? "99,90"}</price><currency>TRY</currency>` +
    `<stock>stokta</stock>` +
    (input.productKey === undefined ? "" : `<pkey>${input.productKey}</pkey>`) +
    `</product>`;

  /** A feed whose mapping carries the Product Key. */
  const feedFor = async (url: string) => {
    const written = await send("POST", "/admin/offering-feeds", {
      body: {
        businessId,
        categoryId,
        documentUrl: url,
        format: "XML",
        mapping: {
          currency: "currency",
          externalId: "sku",
          price: "price",
          productKey: "pkey",
          stock: "stock",
          title: "name"
        },
        name: `Feed ${randomUUID().slice(0, 8)}`
      },
      cookie: adminCookie
    });
    if (written.statusCode !== 201)
      throw new Error(`FEED_REFUSED_${written.statusCode}_${written.body}`);
    const found = adminOfferingFeedsSchema
      .parse(
        (
          await send("GET", "/admin/offering-feeds", { cookie: adminCookie })
        ).json()
      )
      .feeds.find((entry) => entry.documentUrl === url);
    if (found === undefined) throw new Error("FEED_NOT_LISTED");
    return {
      businessId,
      categoryId,
      documentUrl: url,
      format: "XML" as const,
      id: found.feedId,
      itemPath: null,
      mapping: found.mapping as never,
      name: found.name
    };
  };

  /**
   * A listing as the file import leaves one: the platform's own, **not** Source
   * Feed, carrying a Product Key and no intake link.
   *
   * That last part is the whole subject of this suite. Before I89 such a
   * listing was permanently invisible to the intake.
   */
  const imported = async (input: {
    business?: string;
    productKey: string | null;
    status?: string;
  }) => {
    const status = input.status ?? "PUBLISHED";
    const created = await pool.query<{ id: string }>(
      `insert into offering
         (business_id, category_id, slug, title, status, source, pricing_kind,
          amount, currency, amount_set_at, stock_state, product_key,
          published_at)
       values ($1,$2,$3,'İçe aktarılan ilan',$4::"OfferingStatus",'BUSINESS',
         'FIXED', 1500.00, 'TRY', now(), 'IN_STOCK', $5,
         case when $4 = 'DRAFT' then null else now() end)
       returning id`,
      [
        input.business ?? businessId,
        categoryId,
        `imported-${randomUUID()}`,
        status,
        input.productKey
      ]
    );
    const offeringId = created.rows[0]?.id ?? "";
    if (status === "PUBLISHED") {
      await pool.query(
        `insert into offering_publication
           (offering_id, status, eligibility_version)
         values ($1,'ELIGIBLE',1)`,
        [offeringId]
      );
      await pool.query(PROJECT_OFFERING, [offeringId, 1]);
    }
    return offeringId;
  };

  const listing = async (offeringId: string) =>
    (
      await pool.query<{
        amount: string | null;
        source: string;
        stockState: string;
        title: string;
      }>(
        `select o.title, o.amount::text as amount, o.source::text as source,
           o.stock_state::text as "stockState"
         from offering o where o.id = $1`,
        [offeringId]
      )
    ).rows[0] ?? null;

  const linkOf = async (offeringId: string) =>
    (
      await pool.query<{ externalId: string; feedId: string }>(
        `select feed_id as "feedId", external_id as "externalId"
         from offering_feed_item where offering_id = $1`,
        [offeringId]
      )
    ).rows[0] ?? null;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    await pool.query("delete from auth_throttle");
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
        name: `Eşleşme ${randomUUID().slice(0, 8)}`,
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
  }, 60_000);

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    dispatcher.delivered.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  }, 30_000);

  it("links an imported listing by Product Key and updates its price", async () => {
    const url = `https://partner.test/${randomUUID()}.xml`;
    const feed = await feedFor(url);
    const productKey = `PK-${randomUUID().slice(0, 8)}`;
    const offeringId = await imported({ productKey });
    const sku = randomUUID().slice(0, 8);

    const result = await syncerFor({
      [url]: document(product({ productKey, sku }))
    }).sync(feed);

    expect(result).toMatchObject({ skipped: 0, updated: 1 });
    // The link now exists and is keyed on the partner's own identifier, so a
    // later re-key of their catalogue cannot detach it.
    expect(await linkOf(offeringId)).toMatchObject({
      externalId: sku,
      feedId: feed.id
    });

    const after = await listing(offeringId);
    expect(after?.amount).toBe("99.90");
    // Still the platform's listing in every other respect. Source is
    // provenance, and I89 does not rewrite history to make a rule fit.
    expect(after?.source).toBe("BUSINESS");
    expect(after?.title).toBe("İçe aktarılan ilan");
  });

  it("refuses to guess when two listings share the key", async () => {
    /*
     * The one failure here nobody would ever notice: a partner's price on the
     * wrong listing. Reported as a rejection rather than a skip, because it is
     * a data problem an operator can fix — two listings of one Business should
     * not carry one Product Key.
     */
    const url = `https://partner.test/${randomUUID()}.xml`;
    const feed = await feedFor(url);
    const productKey = `PK-${randomUUID().slice(0, 8)}`;
    const first = await imported({ productKey });
    const second = await imported({ productKey });

    const result = await syncerFor({
      [url]: document(product({ productKey, sku: randomUUID().slice(0, 8) }))
    }).sync(feed);

    expect(result).toMatchObject({ rejected: 1, updated: 0 });
    expect(await linkOf(first)).toBeNull();
    expect(await linkOf(second)).toBeNull();
    expect((await listing(first))?.amount).toBe("1500.00");
  });

  it("links nothing where the document carries no Product Key", async () => {
    // A feed that does not map the field simply never links anything, which is
    // the safe direction for a rule whose failure is silent.
    const url = `https://partner.test/${randomUUID()}.xml`;
    const feed = await feedFor(url);
    const offeringId = await imported({
      productKey: `PK-${randomUUID().slice(0, 8)}`
    });

    const result = await syncerFor({
      [url]: document(product({ sku: randomUUID().slice(0, 8) }))
    }).sync(feed);

    expect(result).toMatchObject({ skipped: 1, updated: 0 });
    expect(await linkOf(offeringId)).toBeNull();
  });

  it("will not link a listing that is not Published", async () => {
    /*
     * A Draft somebody is still writing, or something an Admin hid, must not be
     * matched into an automated price feed by a coincidence of keys — and the
     * intake certainly cannot publish it.
     */
    const url = `https://partner.test/${randomUUID()}.xml`;
    const feed = await feedFor(url);
    const productKey = `PK-${randomUUID().slice(0, 8)}`;
    const draft = await imported({ productKey, status: "DRAFT" });

    const result = await syncerFor({
      [url]: document(product({ productKey, sku: randomUUID().slice(0, 8) }))
    }).sync(feed);

    expect(result).toMatchObject({ skipped: 1, updated: 0 });
    expect(await linkOf(draft)).toBeNull();
    expect((await listing(draft))?.amount).toBe("1500.00");
  });

  it("will not take a listing another feed already maintains", async () => {
    /*
     * `offering_feed_item.offering_id` is unique, so the database enforces this
     * as well as the query asks for it. Two feeds bidding on one price would
     * leave whichever ran last in charge, silently.
     */
    const productKey = `PK-${randomUUID().slice(0, 8)}`;
    const offeringId = await imported({ productKey });

    const first = await feedFor(`https://partner.test/${randomUUID()}.xml`);
    const firstSku = randomUUID().slice(0, 8);
    await syncerFor({
      [first.documentUrl]: document(product({ productKey, sku: firstSku }))
    }).sync(first);
    expect(await linkOf(offeringId)).toMatchObject({ feedId: first.id });

    const second = await feedFor(`https://partner.test/${randomUUID()}.xml`);
    const result = await syncerFor({
      [second.documentUrl]: document(
        product({ price: "1,00", productKey, sku: randomUUID().slice(0, 8) })
      )
    }).sync(second);

    expect(result).toMatchObject({ skipped: 1, updated: 0 });
    expect(await linkOf(offeringId)).toMatchObject({ feedId: first.id });
    expect((await listing(offeringId))?.amount).toBe("99.90");
  });

  it("keeps the link across a re-key at the partner's end", async () => {
    /*
     * The link is written once and is the match from then on. A partner who
     * changes their Product Key keeps their price updates, because the
     * identifier the intake uses afterwards is its own.
     */
    const url = `https://partner.test/${randomUUID()}.xml`;
    const feed = await feedFor(url);
    const productKey = `PK-${randomUUID().slice(0, 8)}`;
    const offeringId = await imported({ productKey });
    const sku = randomUUID().slice(0, 8);

    await syncerFor({
      [url]: document(product({ productKey, sku }))
    }).sync(feed);

    const second = await syncerFor({
      [url]: document(product({ price: "79,90", productKey: "başka", sku }))
    }).sync(feed);

    expect(second).toMatchObject({ updated: 1 });
    expect((await listing(offeringId))?.amount).toBe("79.90");
  });

  it("rests on the revision the Owner approved, not on a draft", () => {
    /*
     * The matching below is only permitted by `PRD-0001` v4.2 §5.11.1 — v4.1
     * said an intake may touch only an Offering whose Source is Feed, and every
     * listing this links to was imported. Asserted here because the code and
     * the document are one decision: if a later revision moved the boundary
     * back to Source, `link()` would be operating outside it in a worker,
     * silently, which is the one place nobody looks.
     */
    const authoritative = readFileSync("docs/prd/PRD-0001-offering.md", "utf8");
    expect(authoritative).toContain("**Version:** 4.2");
    expect(authoritative).toContain("**Status:** Frozen");
    expect(authoritative).toContain(
      "#### 5.11.1 An intake may only update what it is linked to"
    );
    // The baseline it superseded is preserved, not overwritten.
    expect(
      readFileSync("docs/prd/PRD-0001-offering-v4.1-superseded.md", "utf8")
    ).toContain("**Version:** 4.1");

    const note = readFileSync(
      "docs/implementation/FEED_MATCHING_OPEN_DECISION.md",
      "utf8"
    );
    // The note must not still read as open, or the next reader answers a
    // question that has been answered.
    expect(note).not.toMatch(/^- \*\*Status:\*\* Open\./mu);
    expect(note).toContain("Option B");
  });
});
