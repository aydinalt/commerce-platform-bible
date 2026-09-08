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
  favouriteMarksSchema,
  favouritesSchema
} from "../packages/contracts/src/index.js";

/**
 * `I64` — keeping something, and asking for only what is in stock.
 *
 * Both controls have been on the Owner's prototype since the layout was
 * settled: a heart on every card with **Favorilerim** in the header, and
 * **Sadece stokta olanlar** under the search bar. Neither had anything behind
 * it.
 *
 * The cases below are the ones where an implementation looks right and is not:
 *
 * - keeping the *listing* rather than the product, so the same phone shows an
 *   empty heart under a second seller;
 * - deleting somebody's favourite when a seller withdraws, which loses a
 *   person's own data because a shop changed its mind;
 * - showing the price the thing cost when it was kept rather than what it costs
 *   now, which is the one number a comparison platform must not stale;
 * - admitting `UNKNOWN` stock under "only what is in stock", which answers a
 *   request for a stated fact with the absence of one.
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

suite("Increment I64 favourites and stock", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let categoryId: string;

  const address = () => `fav-${randomUUID()}@example.test`;
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
  const list = async (input: {
    amount?: string;
    productKey?: string;
    stockState?: "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
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
            amount: input.amount ?? "42990.00",
            currency: "TRY",
            kind: "FIXED",
            stockState: input.stockState ?? "IN_STOCK"
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

  const keep = (offeringSlug: string, cookie: string) =>
    send("PUT", `/offerings/${offeringSlug}/favourite`, { cookie });

  const release = (offeringSlug: string, cookie: string) =>
    send("DELETE", `/offerings/${offeringSlug}/favourite`, { cookie });

  const kept = async (cookie: string) =>
    favouritesSchema.parse(
      (await send("GET", "/me/favourites", { cookie })).json()
    );

  const marks = async (cookie: string) =>
    favouriteMarksSchema.parse(
      (await send("GET", "/me/favourites/marks", { cookie })).json()
    );

  const titles = async (body: Record<string, unknown> = {}) =>
    (
      browseViewSchema.parse(
        (
          await send("POST", `/discovery/browse/categories/${categoryId}`, {
            body
          })
        ).json()
      ).results ?? []
    ).map((card) => card.title);

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
        name: `Favori ${randomUUID().slice(0, 8)}`,
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

  it("keeps what a person kept, and keeping it twice keeps it once", async () => {
    const listing = await list({ title: `Kalp ${randomUUID().slice(0, 8)}` });
    const person = await signUp();

    expect((await keep(listing.slug, person.cookie)).statusCode).toBe(204);
    expect((await keep(listing.slug, person.cookie)).statusCode).toBe(204);

    const mine = await kept(person.cookie);
    expect(mine.cards).toHaveLength(1);
    expect(mine.cards[0]?.slug).toBe(listing.slug);
    expect(mine.unavailable).toBe(0);
  });

  it("keeps the product, so a second seller shows it already kept", async () => {
    /*
     * The rule the whole increment turns on, and the one a `favourite(user,
     * offering)` table would break silently: two shops, one Product Key, kept
     * once. The mark is the group key, so the heart on the second card is
     * filled without the person ever having seen that listing.
     */
    const productKey = key().slice(0, 24);
    const first = await list({
      amount: "9000.00",
      productKey,
      title: `Ortak A ${randomUUID().slice(0, 8)}`
    });
    await list({
      amount: "1000.00",
      productKey,
      title: `Ortak B ${randomUUID().slice(0, 8)}`
    });

    const person = await signUp();
    await keep(first.slug, person.cookie);

    expect((await marks(person.cookie)).productGroupKeys).toContain(productKey);
    const mine = await kept(person.cookie);
    // One card, not two: it is one product.
    expect(
      mine.cards.filter((card) => card.productKey === productKey)
    ).toHaveLength(1);
  });

  it("shows the cheapest seller of a kept product, not the one it was kept from", async () => {
    /*
     * Somebody who saved a phone at 9.000 and comes back to find it at 1.000 has
     * been told something useful. One shown the old figure has been told
     * something false — and the price is the one number this platform exists to
     * report.
     */
    const productKey = key().slice(0, 24);
    const dear = await list({
      amount: "9000.00",
      productKey,
      title: `Pahalı ${randomUUID().slice(0, 8)}`
    });
    await list({
      amount: "1000.00",
      productKey,
      title: `Ucuz ${randomUUID().slice(0, 8)}`
    });

    const person = await signUp();
    await keep(dear.slug, person.cookie);

    const card = (await kept(person.cookie)).cards.find(
      (row) => row.productKey === productKey
    );
    expect(card?.pricing.kind).toBe("FIXED");
    expect(card?.pricing.kind === "FIXED" ? card.pricing.amount : null).toBe(
      "1000.00"
    );
    // Two sellers of one product, stated on the card as everywhere else.
    expect(card?.sellerCount).toBe(2);
  });

  it("does not delete a favourite when the seller withdraws", async () => {
    const listing = await list({ title: `Kalkan ${randomUUID().slice(0, 8)}` });
    const person = await signUp();
    await keep(listing.slug, person.cookie);

    await send(
      "POST",
      `/businesses/${listing.businessId}/offerings/${listing.offeringId}/retirement`,
      { cookie: listing.cookie }
    );

    const mine = await kept(person.cookie);
    /*
     * The person kept a product; the catalogue lost a way to buy it. The row
     * survives and the page is told how many are missing, so a listing
     * published tomorrow brings it back rather than the person having to find
     * it again.
     */
    expect(mine.cards.map((card) => card.slug)).not.toContain(listing.slug);
    expect(mine.unavailable).toBeGreaterThanOrEqual(1);
  });

  it("lets a person let go of something the catalogue can no longer show", async () => {
    const listing = await list({ title: `Bırak ${randomUUID().slice(0, 8)}` });
    const person = await signUp();
    await keep(listing.slug, person.cookie);
    await send(
      "POST",
      `/businesses/${listing.businessId}/offerings/${listing.offeringId}/retirement`,
      { cookie: listing.cookie }
    );

    // Refusing here because the Offering is no longer eligible would trap the
    // row on the person's list forever.
    expect((await release(listing.slug, person.cookie)).statusCode).toBe(204);
    expect((await kept(person.cookie)).unavailable).toBe(0);
  });

  it("keeps one person's favourites out of another's", async () => {
    const listing = await list({ title: `Ayrı ${randomUUID().slice(0, 8)}` });
    const mine = await signUp();
    const theirs = await signUp();
    await keep(listing.slug, mine.cookie);

    expect((await kept(theirs.cookie)).cards).toHaveLength(0);
    expect((await marks(theirs.cookie)).productGroupKeys).not.toContain(
      listing.offeringId
    );
  });

  it("refuses a Guest and says nothing else", async () => {
    const listing = await list({ title: `Konuk ${randomUUID().slice(0, 8)}` });

    expect((await keep(listing.slug, "")).statusCode).toBe(401);
    expect((await send("GET", "/me/favourites")).statusCode).toBe(401);
    expect((await send("GET", "/me/favourites/marks")).statusCode).toBe(401);
  });

  it("refuses to keep something that is not publicly eligible", async () => {
    const person = await signUp();
    expect((await keep(`yok-${randomUUID()}`, person.cookie)).statusCode).toBe(
      404
    );
  });

  it("keeps only what a seller stated is in stock", async () => {
    const here = `Stokta ${randomUUID().slice(0, 8)}`;
    const gone = `Tükendi ${randomUUID().slice(0, 8)}`;
    const silent = `Belirsiz ${randomUUID().slice(0, 8)}`;
    await list({ stockState: "IN_STOCK", title: here });
    await list({ stockState: "OUT_OF_STOCK", title: gone });
    await list({ stockState: "UNKNOWN", title: silent });

    const only = await titles({ inStockOnly: true });
    expect(only).toContain(here);
    expect(only).not.toContain(gone);
    /*
     * The case worth being explicit about. PRD-0002 §10.4: an Offering with no
     * value for an applied criterion does not satisfy it — and somebody who
     * ticked this box asked for things a seller has *stated* are available.
     *
     * Deliberately the opposite of the ordering's treatment of UNKNOWN, which
     * does not sink it: an arrangement should not punish silence, but a filter
     * for a stated fact requires the statement.
     */
    expect(only).not.toContain(silent);

    // Removing the criterion restores the set rather than a subset of it.
    const all = await titles();
    expect(all).toContain(here);
    expect(all).toContain(gone);
    expect(all).toContain(silent);
  });
});
