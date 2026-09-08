import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { PROJECT_OFFERING } from "../packages/database/src/index.js";
import { FeedSyncer, feedSlug } from "../apps/worker/src/feed.sync.js";
import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import { silentLogger } from "../packages/testing/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import {
  adminOfferingFeedsSchema,
  offeringFeedRunsSchema,
  searchViewSchema
} from "../packages/contracts/src/index.js";

/**
 * `I76` — the feed intake, end to end.
 *
 * `i76-feed-documents` owns everything that happens before a database is
 * involved. This owns what happens after, and every case is a way an intake
 * looks like it works and quietly does not:
 *
 * - **an intake that can reach an Offering it did not create.** PRD-0001
 *   §5.11.1 forbids it in one sentence, and the sentence is worthless unless
 *   something enforces it: a Business owner's authoring and an Admin's typed
 *   correction are decisions, and an intake overwriting one destroys a decision
 *   and leaves no trace that it did;
 * - **a second import of the same catalogue**, because the identity used to
 *   match a product across syncs was the title, or the slug, or nothing;
 * - **a malformed document that imports its readable half**, so a partner's
 *   catalogue silently loses everything after the broken tag and the loss is
 *   indistinguishable from products they withdrew;
 * - **one bad row taking down four thousand good ones**, or the reverse: a row
 *   refused with no reason anybody can act on;
 * - **a feed publishing past moderation**, which would make an XML document a
 *   way around `US-OFR-F04-001` AC-2;
 * - and **an hourly sync that touches `Amount Set At` every hour**, which makes
 *   every price look freshly confirmed while nothing has changed.
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

describe("Increment I76 the address a feed listing gets", () => {
  it("derives one from the partner's own identifier, so it survives a rename", () => {
    /*
     * The slug is the address a person may have bookmarked. Deriving it from
     * the *title* would move it every time a partner corrected a product name,
     * sending everybody who wrote it down to a 404 — the exact failure I67's
     * listing number exists to make impossible.
     */
    const feed = "0191d3c4-0000-7000-8000-000000000000";
    expect(feedSlug(feed, "SKU-1234")).toBe("f0191d3c4-sku-1234");
    expect(feedSlug(feed, "SKU 1234")).toBe("f0191d3c4-sku-1234");
    expect(feedSlug(feed, "  A/B  ")).toBe("f0191d3c4-a-b");
    // A partner identifier with nothing a slug can use still gets an address.
    expect(feedSlug(feed, "…")).toBe("f0191d3c4-x");
  });
});

suite("Increment I76 the feed intake", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let adminCookie: string;
  let businessId: string;
  let categoryId: string;
  let ownerCookie: string;

  const address = () => `feed-${randomUUID()}@example.test`;
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

  /** A syncer whose network is a function, so a partner can be simulated. */
  const syncerFor = (documents: Record<string, string | Error>) =>
    new FeedSyncer({
      fetch: (url) => {
        const document = documents[url];
        if (document === undefined)
          return Promise.resolve(new Response("not found", { status: 404 }));
        if (document instanceof Error) return Promise.reject(document);
        return Promise.resolve(new Response(document, { status: 200 }));
      },
      pool
    });

  const feedFor = async (input: {
    documentUrl: string;
    mapping?: Record<string, string>;
    name?: string;
  }) => {
    const written = await send("POST", "/admin/offering-feeds", {
      body: {
        businessId,
        categoryId,
        documentUrl: input.documentUrl,
        format: "XML",
        mapping: {
          externalId: "sku",
          price: "price",
          currency: "currency",
          stock: "stock",
          title: "name",
          ...input.mapping
        },
        name: input.name ?? `Feed ${randomUUID().slice(0, 8)}`
      },
      cookie: adminCookie
    });
    if (written.statusCode !== 201)
      throw new Error(`FEED_REFUSED_${written.statusCode}_${written.body}`);
    const listed = adminOfferingFeedsSchema.parse(
      (
        await send("GET", "/admin/offering-feeds", { cookie: adminCookie })
      ).json()
    ).feeds;
    const found = listed.find(
      (feed) => feed.documentUrl === input.documentUrl && feed.active
    );
    if (found === undefined) throw new Error("FEED_NOT_LISTED");
    return found;
  };

  const offeringFor = async (feedId: string, externalId: string) => {
    const found = await pool.query<{
      amount: string | null;
      amountSetAt: Date | null;
      currency: string | null;
      offeringId: string;
      slug: string;
      status: string;
      stockState: string;
      title: string;
    }>(
      `select o.id as "offeringId", o.title, o.slug, o.status::text as status,
         o.amount::text as amount, o.currency, o.amount_set_at as "amountSetAt",
         o.stock_state::text as "stockState"
       from offering_feed_item i join offering o on o.id = i.offering_id
       where i.feed_id = $1 and i.external_id = $2`,
      [feedId, externalId]
    );
    return found.rows[0] ?? null;
  };

  /**
   * A listing the platform already carries, linked to the partner's identifier.
   *
   * **Since I88 the intake creates nothing**, so a suite that wants a listing
   * to update has to make one — which is the new shape of the system rather
   * than a testing inconvenience: the catalogue is built by the file import and
   * the feed only ever finds what is already there.
   *
   * Written straight to the database because what these tests are about is the
   * link and the lifecycle, not the authoring path.
   */
  const carried = async (
    feedId: string,
    externalId: string,
    input: { amount?: string; business?: string; status?: string } = {}
  ) => {
    const status = input.status ?? "PUBLISHED";
    const created = await pool.query<{ id: string }>(
      `insert into offering
         (business_id, category_id, slug, title, status, source, pricing_kind,
          amount, currency, amount_set_at, stock_state, published_at)
       values ($1,$2,$3,$4,$5::"OfferingStatus",'FEED','FIXED',$6::numeric,
         'TRY', now(), 'IN_STOCK',
         /* offering_publication_state_consistent (no backticks: this comment
            is inside a SQL template literal): a Hidden listing was published
            once, so it carries a published_at too. Only a Draft has none. */
         case when $5 = 'DRAFT' then null else now() end)
       returning id`,
      [
        input.business ?? businessId,
        categoryId,
        `carried-${externalId}`,
        `Taşınan ${externalId}`,
        status,
        input.amount ?? "129.90"
      ]
    );
    const offeringId = created.rows[0]?.id ?? "";
    await pool.query(
      `insert into offering_feed_item (feed_id, external_id, offering_id)
       values ($1,$2,$3)`,
      [feedId, externalId, offeringId]
    );
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

  const document = (rows: string) =>
    `<?xml version="1.0" encoding="UTF-8"?><products>${rows}</products>`;

  const product = (input: {
    currency?: string;
    name: string;
    price?: string;
    sku: string;
    stock?: string;
  }) =>
    `<product><sku>${input.sku}</sku><name>${input.name}</name>` +
    `<price>${input.price ?? "129,90"}</price>` +
    `<currency>${input.currency ?? "TRY"}</currency>` +
    `<stock>${input.stock ?? "stokta"}</stock></product>`;

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
        name: `Feed bölümü ${randomUUID().slice(0, 8)}`,
        slug: slug(),
        stableKey: key()
      },
      cookie: adminCookie
    });
    categoryId = category.json<{ id: string }>().id;

    const owner = await signUp();
    ownerCookie = owner.cookie;
    const business = await send("POST", "/businesses", {
      body: { name: `Partner ${randomUUID().slice(0, 6)}`, slug: slug() },
      cookie: ownerCookie
    });
    businessId = business.json<{ id: string }>().id;
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: ownerCookie
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

  it("creates nothing, whatever the document offers (I88)", async () => {
    /*
     * **The capability the Owner removed**, and the one this suite used to open
     * by demonstrating: _"feed entegrasyonu … kafasına göre yeni ilan
     * oluşturmamalı"_. A product the platform does not carry is counted and
     * passed over, because everything that makes a listing worth having — the
     * Category it belongs under, its field values, its affiliate address, its
     * pictures — comes from the file import and none of it is in a feed.
     */
    const url = `https://partner.test/${randomUUID()}.xml`;
    const feed = await feedFor({ documentUrl: url });
    const first = randomUUID().slice(0, 8);

    const result = await syncerFor({
      [url]: document(
        product({ name: `Kablo ${first}`, sku: `${first}-1` }) +
          product({
            name: `Adaptör ${first}`,
            price: "1.299,90",
            sku: `${first}-2`
          })
      )
    }).sync({
      businessId,
      categoryId,
      documentUrl: url,
      format: "XML",
      id: feed.feedId,
      itemPath: null,
      mapping: feed.mapping as never,
      name: feed.name
    });

    expect(result).toMatchObject({
      created: 0,
      outcome: "SUCCEEDED",
      read: 2,
      rejected: 0,
      skipped: 2,
      updated: 0
    });
    // Counted as skipped and **not** as rejected: a partner's document is
    // their whole catalogue, so this is the ordinary case and not a fault.
    expect(await offeringFor(feed.feedId, `${first}-1`)).toBeNull();

    const written = await pool.query<{ total: number }>(
      `select count(*)::int as total from offering where title like $1`,
      [`%${first}%`]
    );
    expect(written.rows[0]?.total).toBe(0);

    const view = searchViewSchema.parse(
      (
        await send("POST", "/discovery/search", { body: { query: first } })
      ).json()
    );
    expect(view.results).toHaveLength(0);
  });

  it("updates the price and the stock, and leaves the words alone", async () => {
    /*
     * The Owner's sentence, in one test: _"Feed'in görevi yalnızca eşleşen ve
     * yayında olan ilanların fiyat ve stok durumunu güncellemektir."_ The title
     * is the half that used to be overwritten — every hour, silently, over an
     * editor's work.
     */
    const url = `https://partner.test/${randomUUID()}.xml`;
    const feed = await feedFor({ documentUrl: url });
    const sku = randomUUID().slice(0, 8);
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
    await carried(feed.feedId, sku);
    const before = await offeringFor(feed.feedId, sku);

    const second = await syncerFor({
      [url]: document(
        product({
          name: `Yeni ad ${sku}`,
          price: "99,90",
          sku,
          stock: "stokta yok"
        })
      )
    }).sync(row);

    expect(second).toMatchObject({
      created: 0,
      read: 1,
      skipped: 0,
      updated: 1
    });
    const after = await offeringFor(feed.feedId, sku);
    expect(after?.offeringId).toBe(before?.offeringId);
    expect(after?.amount).toBe("99.90");
    expect(after?.stockState).toBe("OUT_OF_STOCK");
    // The curated half, untouched: the title the partner sent is ignored.
    expect(after?.title).toBe(before?.title);
    expect(after?.title).not.toBe(`Yeni ad ${sku}`);
    // The address survives, because it was never derived from the name.
    expect(after?.slug).toBe(before?.slug);
  });

  it("moves Amount Set At only when the amount moves", async () => {
    /*
     * An hourly sync that touched it every hour would make every price look
     * freshly confirmed while nothing had changed — and `Amount Set At` is the
     * platform's only claim about when a price was true.
     */
    const url = `https://partner.test/${randomUUID()}.xml`;
    const feed = await feedFor({ documentUrl: url });
    const sku = randomUUID().slice(0, 8);
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
    const body = document(product({ name: `Sabit ${sku}`, sku }));

    // 129,90 is what `product()` sends by default, so the first sync states the
    // price the listing already carries: nothing moves.
    await carried(feed.feedId, sku, { amount: "129.90" });
    const syncer = syncerFor({ [url]: body });
    await syncer.sync(row);
    const first = (await offeringFor(feed.feedId, sku))?.amountSetAt;

    await syncer.sync(row);
    expect((await offeringFor(feed.feedId, sku))?.amountSetAt).toEqual(first);

    await syncerFor({
      [url]: document(product({ name: `Sabit ${sku}`, price: "149,90", sku }))
    }).sync(row);
    expect((await offeringFor(feed.feedId, sku))?.amountSetAt).not.toEqual(
      first
    );
  });

  it("cannot touch an Offering a Business owner authored", async () => {
    /*
     * **The rule PRD-0001 §5.11.1 states and this enforces.** The enforcement
     * is structural rather than a check: the intake finds what to update
     * through `offering_feed_item`, and an Offering nobody's intake created has
     * no row there. A `source = 'FEED'` check before every write would be one
     * call site away from being forgotten.
     */
    const owned = await send("POST", `/businesses/${businessId}/offerings`, {
      body: {
        categoryId,
        slug: slug(),
        title: `Elle yazılmış ${randomUUID().slice(0, 8)}`
      },
      cookie: ownerCookie
    });
    const offeringId = owned.json<{ id: string }>().id;

    const url = `https://partner.test/${randomUUID()}.xml`;
    const feed = await feedFor({ documentUrl: url });
    // The feed claims the same identifier the owner's listing would have.
    await syncerFor({
      [url]: document(product({ name: "Feed'in adı", sku: offeringId }))
    }).sync({
      businessId,
      categoryId,
      documentUrl: url,
      format: "XML",
      id: feed.feedId,
      itemPath: null,
      mapping: feed.mapping as never,
      name: feed.name
    });

    const untouched = await pool.query<{ source: string; title: string }>(
      `select title, source::text as source from offering where id = $1`,
      [offeringId]
    );
    expect(untouched.rows[0]?.source).toBe("BUSINESS");
    expect(untouched.rows[0]?.title).not.toBe("Feed'in adı");
  });

  it("imports nothing from a document that does not parse", async () => {
    /*
     * Importing the readable half would lose everything after the broken tag,
     * and the loss is indistinguishable from products the partner withdrew — so
     * the platform would quietly stop showing them and nobody could tell which.
     */
    const url = `https://partner.test/${randomUUID()}.xml`;
    const feed = await feedFor({ documentUrl: url });
    const sku = randomUUID().slice(0, 8);

    const result = await syncerFor({
      [url]: `<products>${product({ name: "Okunur", sku })}<product><sku>x</sku>`
    }).sync({
      businessId,
      categoryId,
      documentUrl: url,
      format: "XML",
      id: feed.feedId,
      itemPath: null,
      mapping: feed.mapping as never,
      name: feed.name
    });

    expect(result.outcome).toBe("FAILED");
    expect(result.created).toBe(0);
    expect(result.message).toBeTruthy();
    expect(await offeringFor(feed.feedId, sku)).toBeNull();
  });

  it("says what went wrong when the partner's server does", async () => {
    const url = `https://partner.test/${randomUUID()}.xml`;
    const feed = await feedFor({ documentUrl: url });
    // Nothing registered at that address: the fetcher answers 404.
    const result = await syncerFor({}).sync({
      businessId,
      categoryId,
      documentUrl: url,
      format: "XML",
      id: feed.feedId,
      itemPath: null,
      mapping: feed.mapping as never,
      name: feed.name
    });

    expect(result.outcome).toBe("FAILED");
    // The message names the server's answer rather than saying "sync failed".
    // "The partner is down" and "the mapping is wrong" are two jobs for two
    // different people, and a log that blurred them would send both to the
    // wrong one.
    expect(result.message).toContain("404");

    const runs = offeringFeedRunsSchema.parse(
      (
        await send("GET", "/admin/offering-feeds/runs?outcome=FAILED", {
          cookie: adminCookie
        })
      ).json()
    ).runs;
    expect(runs.some((run) => run.feedId === feed.feedId)).toBe(true);
  });

  it("refuses one bad row without losing the good ones, and says why", async () => {
    const url = `https://partner.test/${randomUUID()}.xml`;
    const feed = await feedFor({ documentUrl: url });
    const sku = randomUUID().slice(0, 8);
    await carried(feed.feedId, `${sku}-ok`);

    const result = await syncerFor({
      [url]: document(
        product({ name: `İyi ${sku}`, sku: `${sku}-ok` }) +
          `<product><sku>${sku}-noname</sku><price>1</price></product>` +
          `<product><sku>${sku}-badprice</sku><name>x</name><price>arayınız</price></product>`
      )
    }).sync({
      businessId,
      categoryId,
      documentUrl: url,
      format: "XML",
      id: feed.feedId,
      itemPath: null,
      mapping: feed.mapping as never,
      name: feed.name
    });

    expect(result).toMatchObject({
      created: 0,
      outcome: "SUCCEEDED",
      read: 3,
      rejected: 2,
      updated: 1
    });
    expect(await offeringFor(feed.feedId, `${sku}-ok`)).not.toBeNull();

    // Every refusal carries a reason a person can act on. A run reporting "2
    // rejected" and not why is a run nobody can fix.
    const runs = offeringFeedRunsSchema.parse(
      (
        await send("GET", "/admin/offering-feeds/runs", { cookie: adminCookie })
      ).json()
    ).runs;
    const mine = runs.find((run) => run.feedId === feed.feedId);
    expect(mine?.rejections).toHaveLength(2);
    for (const rejection of mine?.rejections ?? [])
      expect(rejection.reason.length).toBeGreaterThan(0);
  });

  it("counts what has vanished from the document and touches none of it", async () => {
    /*
     * The obvious next step — retiring them — is a lifecycle decision, and one
     * truncated response from a partner would delete a catalogue. The count and
     * `missing_since` are the evidence somebody needs to take that decision;
     * taking it here would be taking it on their behalf.
     */
    const url = `https://partner.test/${randomUUID()}.xml`;
    const feed = await feedFor({ documentUrl: url });
    const sku = randomUUID().slice(0, 8);
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

    await carried(feed.feedId, `${sku}-a`);
    await carried(feed.feedId, `${sku}-b`);
    await syncerFor({
      [url]: document(
        product({ name: `Kalan ${sku}`, sku: `${sku}-a` }) +
          product({ name: `Giden ${sku}`, sku: `${sku}-b` })
      )
    }).sync(row);

    const second = await syncerFor({
      [url]: document(product({ name: `Kalan ${sku}`, sku: `${sku}-a` }))
    }).sync(row);

    expect(second.missing).toBe(1);
    const gone = await offeringFor(feed.feedId, `${sku}-b`);
    /*
     * I77. The Owner's rule of 2026-09-03: out of stock immediately, and
     * **still published** — a single partner outage must not delete a
     * catalogue, so nothing is withdrawn inside the 72-hour tolerance.
     */
    expect(gone?.status).toBe("PUBLISHED");
    expect(gone?.stockState).toBe("OUT_OF_STOCK");

    const marked = await pool.query<{ missingSince: Date | null }>(
      `select missing_since as "missingSince" from offering_feed_item
       where feed_id = $1 and external_id = $2`,
      [feed.feedId, `${sku}-b`]
    );
    expect(marked.rows[0]?.missingSince).not.toBeNull();

    // And it comes back when the partner's document does.
    const third = await syncerFor({
      [url]: document(
        product({ name: `Kalan ${sku}`, sku: `${sku}-a` }) +
          product({ name: `Giden ${sku}`, sku: `${sku}-b` })
      )
    }).sync(row);
    expect(third.missing).toBe(0);
    // And it is in stock again, because the document says so.
    expect((await offeringFor(feed.feedId, `${sku}-b`))?.stockState).toBe(
      "IN_STOCK"
    );
  });

  it("holds a listing inside the tolerance and counts it past the end of it", async () => {
    /*
     * **The Owner's reason, tested rather than described:** a single API outage
     * or one bad partner sync must not delete a catalogue. Inside 72 hours the
     * listing is out of stock and still published; past it the platform counts
     * it and — until `PRD-0001` v4.1 is Frozen — still withdraws nothing,
     * because neither lifecycle state can carry a reversible withdrawal.
     */
    const url = `https://partner.test/${randomUUID()}.xml`;
    const feed = await feedFor({ documentUrl: url });
    const sku = randomUUID().slice(0, 8);
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

    await carried(feed.feedId, sku);
    await syncerFor({
      [url]: document(product({ name: `Tolerans ${sku}`, sku }))
    }).sync(row);
    const syncer = syncerFor({ [url]: document("") });

    // The document no longer offers it. Inside the tolerance: nothing counted.
    await syncer.sync(row).catch(() => undefined);
    await pool.query(
      `update offering_feed_item set missing_since = now() - interval '1 hour'
       where feed_id = $1 and external_id = $2`,
      [feed.feedId, sku]
    );
    expect(await syncer.pastTolerance(feed.feedId)).toBe(0);

    // Three days later, still absent.
    await pool.query(
      `update offering_feed_item set missing_since = now() - interval '73 hours'
       where feed_id = $1 and external_id = $2`,
      [feed.feedId, sku]
    );
    expect(await syncer.pastTolerance(feed.feedId)).toBe(1);

    // Counted, and still published. Withdrawing it would need a lifecycle
    // state that can be undone, and PRD-0001 has none — v4.1 is the revision
    // that would add one.
    expect((await offeringFor(feed.feedId, sku))?.status).toBe("PUBLISHED");
  });

  it("publishes nothing, restriction or not (I88)", async () => {
    /*
     * This test used to prove that a feed could not publish **past** a
     * restriction — `US-OFR-F04-001` AC-2, and the reading that an XML document
     * is not more trusted than a person. The Owner has since removed the
     * capability entirely: _"kafasına göre yeni ilan oluşturmamalı veya bizim
     * kapattığımız ilanları diriltmemeli"_.
     *
     * So the case is now the stronger one. A listing that is not live is not
     * made live, and it is not even priced: it is a listing somebody has not
     * finished or has deliberately taken down, and a partner's document is not
     * an argument about either.
     */
    const url = `https://partner.test/${randomUUID()}.xml`;
    const feed = await feedFor({ documentUrl: url });
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

    const draftSku = randomUUID().slice(0, 8);
    const hiddenSku = randomUUID().slice(0, 8);
    await carried(feed.feedId, draftSku, {
      amount: "500.00",
      status: "DRAFT"
    });
    await carried(feed.feedId, hiddenSku, {
      amount: "500.00",
      status: "HIDDEN"
    });

    const result = await syncerFor({
      [url]: document(
        product({ name: "Taslak", price: "1,00", sku: draftSku }) +
          product({ name: "Gizlenmiş", price: "1,00", sku: hiddenSku })
      )
    }).sync(row);

    expect(result).toMatchObject({ skipped: 2, updated: 0 });
    for (const sku of [draftSku, hiddenSku]) {
      const held = await offeringFor(feed.feedId, sku);
      // Neither published nor repriced.
      expect(held?.status).not.toBe("PUBLISHED");
      expect(held?.amount).toBe("500.00");
    }

    // And still marked as seen, so the missing-product tolerance does not
    // start counting an absence that never happened.
    const seen = await pool.query<{ missingSince: Date | null }>(
      `select missing_since as "missingSince" from offering_feed_item
       where feed_id = $1 and external_id = $2`,
      [feed.feedId, draftSku]
    );
    expect(seen.rows[0]?.missingSince).toBeNull();
  });

  it("keeps the feed surfaces to Admins", async () => {
    const reader = await signUp();
    for (const attempt of [
      await send("GET", "/admin/offering-feeds", { cookie: reader.cookie }),
      await send("GET", "/admin/offering-feeds/runs", {
        cookie: reader.cookie
      }),
      await send("POST", "/admin/offering-feeds", {
        body: {
          businessId,
          categoryId,
          documentUrl: "https://partner.test/x.xml",
          format: "XML",
          mapping: { externalId: "sku", title: "name" },
          name: "x"
        },
        cookie: reader.cookie
      })
    ])
      expect(attempt.statusCode).toBe(403);
  });

  it("pauses a feed without withdrawing anything it maintains", async () => {
    /*
     * Pausing says "stop reading this partner's document". It does not say
     * "withdraw their four thousand listings" — that is a moderation decision,
     * and §7 owns those.
     */
    const url = `https://partner.test/${randomUUID()}.xml`;
    const feed = await feedFor({ documentUrl: url });
    const sku = randomUUID().slice(0, 8);
    await carried(feed.feedId, sku);
    await syncerFor({
      [url]: document(product({ name: `Duraklatılan ${sku}`, sku }))
    }).sync({
      businessId,
      categoryId,
      documentUrl: url,
      format: "XML",
      id: feed.feedId,
      itemPath: null,
      mapping: feed.mapping as never,
      name: feed.name
    });

    const paused = await send(
      "DELETE",
      `/admin/offering-feeds/${feed.feedId}`,
      {
        cookie: adminCookie
      }
    );
    expect(paused.statusCode).toBe(200);
    expect((await offeringFor(feed.feedId, sku))?.status).toBe("PUBLISHED");

    // And a paused feed is not read.
    const due = await syncerFor({}).due();
    expect(due.map((entry) => entry.id)).not.toContain(feed.feedId);
  });
});
