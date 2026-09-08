import { randomUUID } from "node:crypto";

import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { FeedSyncer } from "../apps/worker/src/feed.sync.js";
import type { FeedRow } from "../apps/worker/src/feed.sync.js";

/**
 * `I91` — the two Acceptance Criteria the Owner froze knowing they were unmet.
 *
 * `US-PLT-F13-001` Frozen v0.1 §13 named them, and he set the order: freeze the
 * documents, then make the code true. This suite is the second half.
 *
 * **AC-9 — a failed run says what *kind* of failure it was.** Until now a run
 * recorded a message, and an Admin reading "the server answered 503" had to
 * infer from prose whose job it was: the partner's engineer, the partner's
 * publisher, or their own mapping. Three causes, three people, one sentence.
 *
 * The classification is by **type** and never by matching words in a message.
 * A classifier that read prose would stop working the first time somebody
 * reworded an error, and it would do so silently — which is the failure mode
 * this whole increment is about.
 *
 * **The third kind was not reachable at all.** A document that parsed and
 * yielded nothing usable was recorded as a *successful* run with N rejections:
 * true in the letter, and it left an Admin looking at a green run beside a feed
 * that had never updated anything. It is a failure, and its cause is the
 * mapping.
 */
const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

suite("Increment I91 why a feed run failed", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let businessId = "";
  let categoryId = "";

  /** A feed row, without going through the Admin API: this is the worker. */
  const feedFor = async (url: string): Promise<FeedRow> => {
    /*
     * The mapping is columns rather than a document — `map_external_id`,
     * `map_title`, `map_price` — which is the schema saying the same thing the
     * contract's `.strict()` says: the fields are a closed list.
     */
    const created = await pool.query<{ id: string }>(
      `insert into offering_feed
         (business_id, category_id, name, document_url, format,
          map_external_id, map_title, map_price, active)
       values ($1,$2,$3,$4,'XML','sku','name','price',true)
       returning id`,
      [businessId, categoryId, `I91 ${randomUUID().slice(0, 8)}`, url]
    );
    return {
      businessId,
      categoryId,
      documentUrl: url,
      format: "XML",
      id: created.rows[0]?.id ?? "",
      itemPath: null,
      mapping: { externalId: "sku", price: "price", title: "name" },
      name: "I91"
    };
  };

  const syncerFor = (answer: () => Promise<Response>) =>
    new FeedSyncer({ fetch: () => answer(), pool });

  const recorded = async (feedId: string) =>
    (
      await pool.query<{
        failureKind: string | null;
        message: string | null;
        outcome: string;
      }>(
        `select outcome::text as outcome, failure_kind::text as "failureKind",
           message
         from offering_feed_run where feed_id = $1
         order by started_at desc limit 1`,
        [feedId]
      )
    ).rows[0] ?? null;

  beforeAll(async () => {
    const business = await pool.query<{ id: string }>(
      `insert into business (name, slug, public_exposure)
       values ('I91 Partner', $1, 'ELIGIBLE') returning id`,
      [`i91-${randomUUID()}`]
    );
    businessId = business.rows[0]?.id ?? "";
    const domain = await pool.query<{ id: string }>(
      `select id from domain limit 1`
    );
    const category = await pool.query<{ id: string }>(
      `insert into category (domain_id, stable_key, slug, name, active)
       values ($1, $2, $3, 'I91', true) returning id`,
      [
        domain.rows[0]?.id ?? "",
        `K${randomUUID().replaceAll("-", "").toUpperCase()}`,
        `i91-${randomUUID()}`
      ]
    );
    categoryId = category.rows[0]?.id ?? "";
  }, 30_000);

  afterAll(async () => {
    await pool.end();
  });

  it("names a server that would not answer", async () => {
    const feed = await feedFor(`https://partner.test/${randomUUID()}.xml`);
    await syncerFor(() =>
      Promise.resolve(new Response("nope", { status: 503 }))
    ).sync(feed);

    const run = await recorded(feed.id);
    expect(run?.outcome).toBe("FAILED");
    expect(run?.failureKind).toBe("SOURCE_UNREACHABLE");
    // The message keeps the partner's own answer; the kind says whose job it is.
    expect(run?.message).toContain("503");
  });

  it("names a connection that died as the source, not as the document", async () => {
    /*
     * A socket failure never reaches the parser, so filing it under "the
     * document could not be read" would send an Admin to the partner's
     * publisher for a problem their engineer has.
     */
    const feed = await feedFor(`https://partner.test/${randomUUID()}.xml`);
    await syncerFor(() => Promise.reject(new Error("ECONNREFUSED"))).sync(feed);

    expect((await recorded(feed.id))?.failureKind).toBe("SOURCE_UNREACHABLE");
  });

  it("names a document that arrived and could not be parsed", async () => {
    const feed = await feedFor(`https://partner.test/${randomUUID()}.xml`);
    await syncerFor(() =>
      Promise.resolve(new Response("<products><product>", { status: 200 }))
    ).sync(feed);

    const run = await recorded(feed.id);
    expect(run?.outcome).toBe("FAILED");
    expect(run?.failureKind).toBe("DOCUMENT_UNREADABLE");
  });

  it("names a mapping that fits nothing in the document", async () => {
    /*
     * **The kind that was unreachable.** The document is well formed and every
     * row is refused, because the mapping names fields it does not carry. This
     * used to be a SUCCEEDED run with N rejections — the shape in which a
     * misconfigured feed looks healthy for a week.
     */
    const feed = await feedFor(`https://partner.test/${randomUUID()}.xml`);
    await syncerFor(() =>
      Promise.resolve(
        new Response(
          "<products>" +
            "<product><id>1</id><label>Bir</label></product>" +
            "<product><id>2</id><label>İki</label></product>" +
            "</products>",
          { status: 200 }
        )
      )
    ).sync(feed);

    const run = await recorded(feed.id);
    expect(run?.outcome).toBe("FAILED");
    expect(run?.failureKind).toBe("MAPPING_INCOMPLETE");
    expect(run?.message).toContain("2");
  });

  it("does not blame the mapping for an empty catalogue", async () => {
    /*
     * A document offering nothing says nothing about the mapping. Calling that
     * a mapping failure would blame the Admin for a partner's empty morning.
     */
    const feed = await feedFor(`https://partner.test/${randomUUID()}.xml`);
    await syncerFor(() =>
      Promise.resolve(new Response("<products></products>", { status: 200 }))
    ).sync(feed);

    const run = await recorded(feed.id);
    expect(run?.outcome).toBe("SUCCEEDED");
    expect(run?.failureKind).toBeNull();
  });

  it("records no kind on a run that worked", async () => {
    /*
     * The outcome and the kind are one fact and must not be able to disagree:
     * a successful run carrying a failure kind would be a row that contradicts
     * itself, and somebody would eventually believe the wrong half.
     */
    const feed = await feedFor(`https://partner.test/${randomUUID()}.xml`);
    /*
     * The row has to be *usable*, which here means a price with a currency:
     * a priced row with no currency is refused, and a run whose every row is
     * refused is a mapping failure by the rule above — correctly, because a
     * currency field nobody mapped is a mapping that does not fit the document.
     */
    await syncerFor(() =>
      Promise.resolve(
        new Response(
          "<products><product><sku>a</sku><name>Bir</name>" +
            "</product></products>",
          { status: 200 }
        )
      )
    ).sync(feed);

    const run = await recorded(feed.id);
    expect(run?.outcome).toBe("SUCCEEDED");
    expect(run?.failureKind).toBeNull();
  });

  it("classifies by type rather than by reading the message", async () => {
    /*
     * Asserted on the source, because this is the property that decays
     * silently: a classifier matching on prose keeps compiling, keeps passing
     * the tests above, and starts answering wrongly the day somebody rewords
     * an error.
     */
    const source = (await import("node:fs")).readFileSync(
      "apps/worker/src/feed.sync.ts",
      "utf8"
    );
    expect(source).toContain("error instanceof FeedSourceError");
    expect(source).toContain("error instanceof FeedFormatError");
    expect(source).not.toMatch(/message\.(includes|startsWith|match)\(/u);
  });
});

/**
 * `AC-3` — the mapping refuses a key nobody named.
 *
 * **This one was already true, and the Story said it was not.** The honesty
 * note in `US-PLT-F13-001` §13 was written from memory rather than from the
 * contract, and the contract has been `.strict()` since `I76`: an unknown key
 * is refused with a validation error before any feed is written.
 *
 * The correction is recorded in `US-PLT-F13-001` v0.2 rather than by editing a
 * Frozen document, and the test is written now so that the claim is checked
 * rather than remembered — which is exactly what went wrong the first time.
 */
describe("Increment I91 the mapping is a closed list", () => {
  it("refuses a key the contract does not name", async () => {
    const { createOfferingFeedSchema } =
      await import("../packages/contracts/src/index.js");
    const parsed = createOfferingFeedSchema.safeParse({
      businessId: randomUUID(),
      categoryId: randomUUID(),
      documentUrl: "https://partner.test/feed.xml",
      format: "XML",
      mapping: {
        externalId: "sku",
        title: "name",
        // Not one of §24.1's fields, and not a place to put a setting.
        warehouseCode: "depo"
      },
      name: "Bir feed"
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts the fields §24.1 names", async () => {
    const { createOfferingFeedSchema } =
      await import("../packages/contracts/src/index.js");
    const parsed = createOfferingFeedSchema.safeParse({
      businessId: randomUUID(),
      categoryId: randomUUID(),
      documentUrl: "https://partner.test/feed.xml",
      format: "XML",
      mapping: {
        currency: "currency",
        externalId: "sku",
        price: "price",
        productKey: "pkey",
        stock: "stock",
        title: "name"
      },
      name: "Bir feed"
    });
    expect(parsed.success).toBe(true);
  });
});
