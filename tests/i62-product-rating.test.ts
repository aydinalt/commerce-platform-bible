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
  browseViewSchema,
  offeringPresentationSchema,
  productReviewsSchema
} from "../packages/contracts/src/index.js";
import { byline } from "../apps/api/src/persistence/pg-review.repository.js";

/**
 * `I62` — the product's score (the Owner's rating capability).
 *
 * **The prototype has shown stars on every card and a Yorum tab on every
 * product page since the layout was settled, and the platform had nothing
 * behind either.** No table, no contract field, no route. This increment is the
 * whole capability, and the cases below are the ones where an implementation
 * can look right and be wrong:
 *
 * - averaging per **seller** rather than per **product**, which is the Owner's
 *   one rule — *puanlama ürüne ait olacak, satıcıya değil* — and which a
 *   `group by offering_id` would break silently, because every score would
 *   still appear, just under the wrong number of things;
 * - letting a second submission be a second vote, which turns an average of
 *   people into an average of enthusiasm;
 * - admitting an unrated product under a rating floor, which answers a question
 *   about scores with a thing that has none;
 * - publishing a reviewer's full name, which is a privacy leak wearing a
 *   byline.
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

describe("Increment I62 the byline", () => {
  /*
   * Pure, so it runs without a database: the masking rule is the one piece of
   * this increment that decides what a real person's name looks like in public,
   * and it should be checked whether or not PostgreSQL is reachable.
   */
  it("publishes a given name and a surname initial", () => {
    expect(byline("Aylin Kaya")).toBe("Aylin K.");
  });

  it("keeps a single-word name whole rather than inventing an initial", () => {
    expect(byline("Aylin")).toBe("Aylin");
  });

  it("initialises the last word of a longer name", () => {
    expect(byline("Ayşe Nur Demirci")).toBe("Ayşe Nur D.");
  });

  it("uppercases the initial in Turkish", () => {
    // "ismet" initialises to "İ", not "I". The dotted capital is the Turkish
    // letter, and `toUpperCase()` without a locale gets it wrong.
    expect(byline("Ali ismet")).toBe("Ali İ.");
  });

  it("has no byline for an account that gave no name", () => {
    expect(byline(null)).toBeNull();
    expect(byline("   ")).toBeNull();
  });
});

suite("Increment I62 the product's score", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let categoryId: string;

  const address = () => `rev-${randomUUID()}@example.test`;
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

  const signUp = async (name?: string) => {
    const email = address();
    await send("POST", "/auth/registrations", {
      body: {
        email,
        ...(name === undefined ? {} : { name }),
        password: PASSWORD
      }
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

  /** One published Offering, optionally carrying a Product Key. */
  const list = async (input: { productKey?: string; title: string }) => {
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
    return { offeringId, slug: offeringSlug };
  };

  const review = async (
    offeringSlug: string,
    cookie: string,
    rating: number,
    body?: string
  ) =>
    send("POST", `/offerings/${offeringSlug}/reviews`, {
      body: { ...(body === undefined ? {} : { body }), rating },
      cookie
    });

  const reviews = async (offeringSlug: string, cookie?: string) =>
    productReviewsSchema.parse(
      (
        await send("GET", `/offerings/${offeringSlug}/reviews`, {
          ...(cookie === undefined ? {} : { cookie })
        })
      ).json()
    );

  const present = async (offeringSlug: string) =>
    offeringPresentationSchema.parse(
      (await send("GET", `/offerings/${offeringSlug}`)).json()
    );

  const cards = async (rating?: unknown) =>
    browseViewSchema.parse(
      (
        await send("POST", `/discovery/browse/categories/${categoryId}`, {
          body: rating === undefined ? {} : { rating }
        })
      ).json()
    ).results ?? [];

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
        name: `Puan ${randomUUID().slice(0, 8)}`,
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

  it("has no score before anybody scores it, and says so as absence", async () => {
    const listing = await list({ title: `Yeni ${randomUUID().slice(0, 8)}` });
    const presented = await present(listing.slug);

    // Not `0`. A product nobody has scored is not a product everybody scored
    // badly, and a surface that could not tell those apart would libel every
    // new listing.
    expect(presented.rating).toEqual({ average: null, count: 0 });
  });

  it("carries the score on the card as well as on the page", async () => {
    const title = `Kartlı ${randomUUID().slice(0, 8)}`;
    const listing = await list({ title });
    const reader = await signUp("Aylin Kaya");
    await review(listing.slug, reader.cookie, 4);

    const card = (await cards()).find((row) => row.title === title);
    expect(card?.rating).toEqual({ average: "4.0", count: 1 });
    expect((await present(listing.slug)).rating).toEqual({
      average: "4.0",
      count: 1
    });
  });

  it("scores the product rather than the seller", async () => {
    /*
     * **The rule this whole increment turns on.** Two shops, one Product Key,
     * one review written under the first listing — and the second listing shows
     * the same score, because the score is the product's.
     *
     * A `group by offering_id` would pass every other test in this file and
     * fail this one, which is why it is here rather than in a comment.
     */
    const productKey = key().slice(0, 24);
    const first = await list({
      productKey,
      title: `Ortak A ${randomUUID().slice(0, 8)}`
    });
    const second = await list({
      productKey,
      title: `Ortak B ${randomUUID().slice(0, 8)}`
    });

    const reader = await signUp("Mert Demir");
    await review(first.slug, reader.cookie, 5, "Beklediğimden hızlı geldi.");

    expect((await present(second.slug)).rating).toEqual({
      average: "5.0",
      count: 1
    });
    const seen = await reviews(second.slug);
    expect(seen.reviews.map((row) => row.body)).toEqual([
      "Beklediğimden hızlı geldi."
    ]);
  });

  it("replaces a person's own review rather than counting it twice", async () => {
    const listing = await list({ title: `Fikir ${randomUUID().slice(0, 8)}` });
    const reader = await signUp("Selin Ada");

    await review(listing.slug, reader.cookie, 2, "Beğenmedim.");
    const changed = await review(listing.slug, reader.cookie, 5, "Alıştım.");

    const after = productReviewsSchema.parse(changed.json());
    expect(after.total).toBe(1);
    expect(after.rating).toEqual({ average: "5.0", count: 1 });
    expect(after.reviews[0]?.body).toBe("Alıştım.");
    // The response of the write is the state after it, so a surface never
    // shows a review the average beside it has not counted.
    expect(after.reviews[0]?.mine).toBe(true);
  });

  it("averages several people to one decimal", async () => {
    const listing = await list({
      title: `Ortalama ${randomUUID().slice(0, 8)}`
    });
    for (const score of [5, 4, 4]) {
      const reader = await signUp("Deniz Yıldız");
      await review(listing.slug, reader.cookie, score);
    }
    // 13/3 = 4.333…, and one decimal is the precision an average of whole
    // stars can honestly claim. A string, so nothing downstream can render it
    // as 4.2999999.
    expect((await present(listing.slug)).rating).toEqual({
      average: "4.3",
      count: 3
    });
  });

  it("publishes a byline rather than a name or an address", async () => {
    const listing = await list({ title: `İmza ${randomUUID().slice(0, 8)}` });
    const reader = await signUp("Aylin Kaya");
    await review(listing.slug, reader.cookie, 4, "İyi.");

    const seen = await reviews(listing.slug);
    expect(seen.reviews[0]?.author).toBe("Aylin K.");
    // Nothing in the response may carry the address the account is reached by.
    expect(JSON.stringify(seen)).not.toContain("@example.test");
  });

  it("lets anyone read reviews and only a signed-in person write one", async () => {
    const listing = await list({ title: `Kapı ${randomUUID().slice(0, 8)}` });
    const reader = await signUp("Ece Mor");
    await review(listing.slug, reader.cookie, 3);

    const guest = await reviews(listing.slug);
    expect(guest.total).toBe(1);
    // A Guest is told they may not write instead of being shown a form that
    // fails on submit — and nothing of theirs is marked as theirs.
    expect(guest.writable).toBe(false);
    expect(guest.reviews.every((row) => row.mine === false)).toBe(true);

    const refused = await review(listing.slug, "", 5);
    expect(refused.statusCode).toBe(401);

    const signedIn = await reviews(listing.slug, reader.cookie);
    expect(signedIn.writable).toBe(true);
    expect(signedIn.reviews[0]?.mine).toBe(true);
  });

  it("refuses half a star and anything outside one to five", async () => {
    const listing = await list({ title: `Sınır ${randomUUID().slice(0, 8)}` });
    const reader = await signUp("Onur Sarı");

    // Half stars are an *average*, never a submission: nobody presses two and
    // a half.
    expect((await review(listing.slug, reader.cookie, 2.5)).statusCode).toBe(
      400
    );
    expect((await review(listing.slug, reader.cookie, 0)).statusCode).toBe(400);
    expect((await review(listing.slug, reader.cookie, 6)).statusCode).toBe(400);
  });

  it("keeps what clears the rating floor and sets aside what does not", async () => {
    const good = `Puanlı ${randomUUID().slice(0, 8)}`;
    const poor = `Düşük ${randomUUID().slice(0, 8)}`;
    const good1 = await list({ title: good });
    const poor1 = await list({ title: poor });
    const a = await signUp("Burak Tan");
    const b = await signUp("Zeynep Bal");
    await review(good1.slug, a.cookie, 5);
    await review(poor1.slug, b.cookie, 2);

    const strict = (await cards({ minimum: 4 })).map((row) => row.title);
    expect(strict).toContain(good);
    expect(strict).not.toContain(poor);

    // Removing the criterion restores the set rather than a subset of it.
    const all = (await cards()).map((row) => row.title);
    expect(all).toContain(good);
    expect(all).toContain(poor);
  });

  it("sets aside a product nobody has scored", async () => {
    /*
     * The rating equivalent of §10.4's rule for an absent value: a product with
     * no score does not satisfy a question about scores. Admitting it under
     * "four stars and up" would answer the person with the one thing that
     * cannot answer them.
     */
    const title = `Puansız ${randomUUID().slice(0, 8)}`;
    await list({ title });

    expect((await cards({ minimum: 4 })).map((row) => row.title)).not.toContain(
      title
    );
    expect((await cards()).map((row) => row.title)).toContain(title);
  });

  it("refuses a review of something that is not publicly eligible", async () => {
    const reader = await signUp("Kaya Ak");
    const refused = await review(`yok-${randomUUID()}`, reader.cookie, 4);
    // The same answer a retired Offering, a Restricted Business and an address
    // that never existed give on the presentation route: absent, and silent
    // about why.
    expect(refused.statusCode).toBe(404);
  });
});
