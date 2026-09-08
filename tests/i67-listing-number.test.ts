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
  offeringPresentationSchema,
  searchViewSchema
} from "../packages/contracts/src/index.js";
import { listingReference } from "../modules/discovery/src/index.js";

/**
 * `I67` — the listing number.
 *
 * **Every way to name a listing was addressed to a machine.** The `id` is a
 * UUID nobody reads over the telephone; the `slug` changes when a title is
 * corrected, so a person who wrote one down can be sent to a 404 by an edit
 * they never saw. The Owner asked for the third kind of name — *"her ilanın
 * kendine özgü bir ilan numarası olması gerekiyor. İlan numarasını arama
 * kutusuna yazınca listelensin"* — and it is the one a person can use.
 *
 * The cases below are the ones where this looks implemented and is not:
 *
 * - a number that is not stable across an edit, which breaks the single
 *   promise it makes;
 * - a number that reaches the *text index* instead of a lookup, so typing it
 *   returns every listing whose description happens to contain those digits;
 * - a number that swallows an ordinary search, so `16 gb ram` or a query with
 *   a word beside the digits stops answering;
 * - and the Turkish `İ`, which lowercases in JavaScript to `i` plus a
 *   combining dot and matches nothing in PostgreSQL — the failure that made a
 *   text match the wrong mechanism for this in the first place.
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

describe("Increment I67 recognising a listing number", () => {
  it("takes a bare number", () => {
    expect(listingReference("482007")).toBe("482007");
    expect(listingReference("  482007  ")).toBe("482007");
  });

  it("takes the prefix a card prints, however it was typed", () => {
    // `İLN` as surfaces printed it until 2026-09-03, `ILN` as an ASCII
    // keyboard produces it, the word itself, and the abbreviation a person adds
    // without thinking. Nothing prints the prefix now and all of them are still
    // accepted: people paste what they wrote down.
    expect(listingReference("İLN-482007")).toBe("482007");
    expect(listingReference("ILN-482007")).toBe("482007");
    expect(listingReference("iln 482007")).toBe("482007");
    expect(listingReference("İlan no 482007")).toBe("482007");
    expect(listingReference("no: 482007")).toBe("482007");
  });

  it("refuses anything that is a description", () => {
    /*
     * The whole risk of this feature in four lines. A rule that fired on "a
     * query containing digits" would turn every specification search into a
     * failed lookup — and the catalogue is full of them, because I66 put the
     * numbers a person searches by into the index on purpose.
     */
    expect(listingReference("16 gb ram laptop")).toBeNull();
    expect(listingReference("iphone 15 128 gb")).toBeNull();
    expect(listingReference("mavi 482007")).toBeNull();
    expect(listingReference("kırmızı araba")).toBeNull();
    // Four digits is a year, a model or a price; five is where a number stops
    // being something a person would type as a description.
    expect(listingReference("2024")).toBeNull();
  });
});

suite("Increment I67 the listing number end to end", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let categoryId: string;

  const address = () => `iln-${randomUUID()}@example.test`;
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

  /** One published Offering, with its own seller. */
  const list = async (input: { summary?: string; title: string }) => {
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
            amount: "42990.00",
            currency: "TRY",
            kind: "FIXED",
            stockState: "IN_STOCK"
          },
          ...(input.summary === undefined ? {} : { summary: input.summary }),
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

  const presented = async (offeringSlug: string) =>
    offeringPresentationSchema.parse(
      (await send("GET", `/offerings/${offeringSlug}`)).json()
    );

  const search = async (query: string) =>
    searchViewSchema.parse(
      (await send("POST", "/discovery/search", { body: { query } })).json()
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
    const category = await send("POST", "/admin/categories", {
      body: {
        domain: "TECHNOLOGY",
        name: `İlan no ${randomUUID().slice(0, 8)}`,
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

  it("gives every listing a number of its own, and keeps it across an edit", async () => {
    const listed = await list({ title: `Numaralı ürün ${randomUUID()}` });
    const before = (await presented(listed.slug)).listingNumber;
    expect(before).toMatch(/^\d+$/u);

    const other = await list({ title: `Başka ürün ${randomUUID()}` });
    expect((await presented(other.slug)).listingNumber).not.toBe(before);

    /*
     * The promise the number makes. A title correction rewrites the projection,
     * republishes the Offering and — before this increment — would have been
     * the moment a person's written-down identifier stopped working, because
     * the only stable-looking name they had was the slug in the address bar.
     */
    await send(
      "PUT",
      `/businesses/${listed.businessId}/offerings/${listed.offeringId}/content`,
      {
        body: {
          attributes: [],
          categoryId,
          pricing: {
            amount: "39990.00",
            currency: "TRY",
            kind: "FIXED",
            stockState: "IN_STOCK"
          },
          title: `Düzeltilmiş başlık ${randomUUID()}`
        },
        cookie: listed.cookie
      }
    );
    expect((await presented(listed.slug)).listingNumber).toBe(before);
  });

  it("finds the listing when its number is typed, in every form it is written", async () => {
    const listed = await list({ title: `Aranan ürün ${randomUUID()}` });
    const number = (await presented(listed.slug)).listingNumber;

    for (const query of [
      number,
      `İLN-${number}`,
      `ILN-${number}`,
      `iln ${number}`,
      `ilan no ${number}`
    ]) {
      const view = await search(query);
      expect(view.results.map((row) => row.offeringId)).toEqual([
        listed.offeringId
      ]);
      // The lookup answers with the listing and with nothing else: a total of
      // one is what distinguishes it from a text match that happened to rank
      // the right row first.
      expect(view.paging.total).toBe(1);
      expect(view.zeroResults).toBeNull();
    }
  });

  it("puts the same number on the card the search returns", async () => {
    const listed = await list({ title: `Kartlı ürün ${randomUUID()}` });
    const number = (await presented(listed.slug)).listingNumber;
    const view = await search(number);
    expect(view.results[0]?.listingNumber).toBe(number);
  });

  it("answers a number nobody has with Zero Results rather than an error", async () => {
    /*
     * A mistyped number is the ordinary case, not an exception: one digit wrong
     * and the person is asking about a listing that does not exist. It reads as
     * an empty Search — the query stays visible with the recovery beside it —
     * rather than as a 404, because they searched.
     */
    const view = await search("999999999");
    expect(view.results).toEqual([]);
    expect(view.paging.total).toBe(0);
    expect(view.zeroResults?.criteria.query).toBe("999999999");
  });

  it("leaves an ordinary search alone", async () => {
    const marker = randomUUID().slice(0, 8);
    const listed = await list({
      summary: `Bu üründe 16 GB bellek ve 512 GB depolama var. ${marker}`,
      title: `Dizüstü ${marker}`
    });

    // A query with digits in it is still a query. If the reference rule were
    // any wider, this would have become a lookup for a listing numbered 16.
    const view = await search(`16 gb ${marker}`);
    expect(view.results.map((row) => row.offeringId)).toContain(
      listed.offeringId
    );
  });
});
