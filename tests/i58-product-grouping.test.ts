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
  searchViewSchema
} from "../packages/contracts/src/index.js";

/**
 * `I58` — several partners selling one thing become one card.
 *
 * **This is the increment the platform was named for and did not do.** Three
 * partners listing the same phone produced three Listing Cards with the same
 * title, and the person had to scan them and work out which was cheapest — the
 * comparison a comparison site exists to have already made.
 *
 * PRD-0001 v4.0 §5.12 has held the answer since it was Frozen: Offerings
 * carrying the same Product Key *are presented as* one product. Nothing here
 * invents an entity — there is still no `Product` row and no `Merchant` row, and
 * §4 refuses both by name. What changed is that a query finally reads the
 * column.
 *
 * §5.12.3 is the line these cases are really about: **similar titles, similar
 * attributes and similar prices are not evidence.** The key is the only
 * evidence, so two Offerings that look identical and carry no key stay two
 * cards, and that is the correct answer rather than a missed opportunity.
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

suite("Increment I58 one product, several sellers", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let categoryId: string;

  const address = () => `grp-${randomUUID()}@example.test`;
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

  /**
   * One partner's listing of one product.
   *
   * Each seller is a separate Business with a separate owner, because that is
   * what a partner *is* — `business_owner` allows exactly one owner per
   * Business, so a shortcut that hung several partners off one account would be
   * testing a shape the platform refuses.
   */
  const list = async (input: {
    amount: string | null;
    businessName: string;
    deliveryCost?: string;
    productKey: string | null;
    stockState?: "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
    title: string;
  }) => {
    const account = await signUp();
    const business = await send("POST", "/businesses", {
      body: { name: input.businessName, slug: slug() },
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
          pricing:
            input.amount === null
              ? { kind: "ON_REQUEST", stockState: "UNKNOWN" }
              : {
                  amount: input.amount,
                  currency: "TRY",
                  ...(input.deliveryCost === undefined
                    ? {}
                    : { deliveryCost: input.deliveryCost }),
                  kind: "FIXED",
                  stockState: input.stockState ?? "IN_STOCK"
                },
          ...(input.productKey === null
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
    return { offeringId, offeringSlug };
  };

  const browse = async () =>
    browseViewSchema.parse(
      (
        await send("POST", `/discovery/browse/categories/${categoryId}`, {
          body: {}
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
    const category = await send("POST", "/admin/categories", {
      body: {
        domain: "MOBILITY",
        name: `Grup ${randomUUID().slice(0, 8)}`,
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

  it("draws one card for three partners, from the cheapest of them", async () => {
    const productKey = `PK-${randomUUID().slice(0, 8)}`;
    const title = `Telefon ${randomUUID().slice(0, 8)}`;
    await list({
      amount: "44200.00",
      businessName: "Anadolu Bilişim",
      productKey,
      title
    });
    const cheapest = await list({
      amount: "42990.00",
      businessName: "Teknoloji Deposu",
      productKey,
      title
    });
    await list({
      amount: "43750.00",
      businessName: "Vitrin Elektronik",
      productKey,
      title
    });

    const cards = (await browse()).results ?? [];
    const mine = cards.filter((card) => card.title === title);

    // One card, not three. This is the whole increment.
    expect(mine).toHaveLength(1);
    expect(mine[0]?.sellerCount).toBe(3);
    expect(mine[0]?.productKey).toBe(productKey);
    /*
     * Drawn from the cheapest seller rather than the newest or the first. A
     * comparison card whose price is not the best available price is worse than
     * no price: it is a wrong answer to the question the card is for.
     */
    expect(mine[0]?.offeringId).toBe(cheapest.offeringId);
    expect(mine[0]?.businessName).toBe("Teknoloji Deposu");
    expect(
      mine[0]?.pricing.kind === "FIXED" ? mine[0].pricing.amount : null
    ).toBe("42990.00");
  });

  it("keeps two look-alikes apart when neither carries a key", async () => {
    /*
     * §5.12.3, stated as a case. Two identical titles at identical prices are
     * exactly the pair a heuristic would merge, and merging them would present
     * two different things as one — the failure the Frozen text exists to
     * prevent.
     */
    const title = `Aynı ad ${randomUUID().slice(0, 8)}`;
    await list({
      amount: "1000.00",
      businessName: "Bir Mağaza",
      productKey: null,
      title
    });
    await list({
      amount: "1000.00",
      businessName: "Başka Mağaza",
      productKey: null,
      title
    });

    const mine = ((await browse()).results ?? []).filter(
      (card) => card.title === title
    );
    expect(mine).toHaveLength(2);
    expect(mine.every((card) => card.sellerCount === 1)).toBe(true);
    expect(mine.every((card) => card.productKey === null)).toBe(true);
  });

  it("groups a Search result the same way it groups a Browse one", async () => {
    const productKey = `PK-${randomUUID().slice(0, 8)}`;
    const title = `Kulaklık ${randomUUID().slice(0, 8)}`;
    await list({
      amount: "4450.00",
      businessName: "Teknoloji Deposu",
      productKey,
      title
    });
    await list({
      amount: "4290.00",
      businessName: "Vitrin Elektronik",
      productKey,
      title
    });

    const found = searchViewSchema.parse(
      (
        await send("POST", "/discovery/search", { body: { query: title } })
      ).json()
    );
    const mine = found.results.filter((result) => result.title === title);

    // Browse and Search compose the card in two different queries; a grouping
    // that held in one and not the other would be two answers to one question.
    expect(mine).toHaveLength(1);
    expect(mine[0]?.sellerCount).toBe(2);
    expect(mine[0]?.businessName).toBe("Vitrin Elektronik");
  });

  it("lists every seller on the Offering page, cheapest first", async () => {
    const productKey = `PK-${randomUUID().slice(0, 8)}`;
    const title = `Laptop ${randomUUID().slice(0, 8)}`;
    const dear = await list({
      amount: "62450.00",
      businessName: "Teknoloji Deposu",
      productKey,
      title
    });
    await list({
      amount: "61900.00",
      businessName: "Anadolu Bilişim",
      productKey,
      title
    });
    await list({
      amount: null,
      businessName: "Teklifli Mağaza",
      productKey,
      title
    });

    // Opened by the *dearest* seller's address, to prove the list is a fact
    // about the product rather than about the row that was opened.
    const page = offeringPresentationSchema.parse(
      (await send("GET", `/offerings/${dear.offeringSlug}`)).json()
    );

    expect(page.sellers).toHaveLength(3);
    expect(page.sellers.map((seller) => seller.businessName)).toEqual([
      "Anadolu Bilişim",
      "Teknoloji Deposu",
      // §5.10.5. No amount means no position in a price ordering, so it follows
      // the priced rows rather than being sorted to either end of them.
      "Teklifli Mağaza"
    ]);
    expect(page.productKey).toBe(productKey);
  });

  it("makes an Offering with no key the only seller of itself", async () => {
    const title = `Tek satıcı ${randomUUID().slice(0, 8)}`;
    const only = await list({
      amount: "3450.00",
      businessName: "Meridyen Tur",
      productKey: null,
      title
    });

    const page = offeringPresentationSchema.parse(
      (await send("GET", `/offerings/${only.offeringSlug}`)).json()
    );

    /*
     * Never empty. A page that dropped the list here would answer "who sells
     * this" with silence, beside a price that says somebody does.
     */
    expect(page.sellers).toHaveLength(1);
    expect(page.sellers[0]?.offeringId).toBe(only.offeringId);
    expect(page.productKey).toBeNull();
  });

  it("puts a seller who cannot sell it last, however cheap", async () => {
    /*
     * The prototype's own rule (`filter.ts`, `sortedOffers`), and the Owner
     * confirmed it on 2026-09-02. A price a person cannot buy at is not a
     * better offer than one they can — a list headed by an unbuyable row is a
     * list whose first answer is wrong.
     *
     * `UNKNOWN` is deliberately not treated as out of stock: an unstated stock
     * level is not a claim that there is none, and demoting a partner for
     * saying nothing would punish silence.
     */
    const productKey = `PK-${randomUUID().slice(0, 8)}`;
    const title = `Fırın ${randomUUID().slice(0, 8)}`;
    await list({
      amount: "5000.00",
      businessName: "Boş Depo",
      productKey,
      stockState: "OUT_OF_STOCK",
      title
    });
    const quiet = await list({
      amount: "6400.00",
      businessName: "Sessiz Depo",
      productKey,
      stockState: "UNKNOWN",
      title
    });
    await list({
      amount: "6200.00",
      businessName: "Dolu Depo",
      productKey,
      stockState: "IN_STOCK",
      title
    });

    const page = offeringPresentationSchema.parse(
      (await send("GET", `/offerings/${quiet.offeringSlug}`)).json()
    );

    expect(page.sellers.map((seller) => seller.businessName)).toEqual([
      // Buyable rows first, cheapest of them at the top.
      "Dolu Depo",
      "Sessiz Depo",
      // Cheapest of all three, and last, because it cannot be bought.
      "Boş Depo"
    ]);
  });

  it("ranks by what the thing costs delivered, not by the amount alone", async () => {
    /*
     * The case the prototype's own wording demands and the first query did not
     * do. "Kargo dâhil en ucuz" is a claim about the total, and a partner who
     * shaves the amount and charges for delivery would otherwise take the top
     * row — and the card — from the partner who is actually cheaper.
     */
    const productKey = `PK-${randomUUID().slice(0, 8)}`;
    const title = `Süpürge ${randomUUID().slice(0, 8)}`;
    await list({
      amount: "8900.00",
      businessName: "Kargolu Mağaza",
      deliveryCost: "450.00",
      productKey,
      title
    });
    const cheaperDelivered = await list({
      amount: "9100.00",
      businessName: "Kargosuz Mağaza",
      deliveryCost: "0.00",
      productKey,
      title
    });

    const card = ((await browse()).results ?? []).find(
      (result) => result.title === title
    );
    expect(card?.offeringId).toBe(cheaperDelivered.offeringId);
    expect(card?.businessName).toBe("Kargosuz Mağaza");

    const page = offeringPresentationSchema.parse(
      (await send("GET", `/offerings/${cheaperDelivered.offeringSlug}`)).json()
    );
    /*
     * The list beneath the card is ordered by the same expression the card was
     * picked with. A card drawn from one seller above a list headed by another
     * is the platform contradicting itself inside a single click.
     */
    expect(page.sellers.map((seller) => seller.businessName)).toEqual([
      "Kargosuz Mağaza",
      "Kargolu Mağaza"
    ]);
  });

  it("sorts an unstated delivery cost at its amount rather than inventing one", async () => {
    /*
     * §5.10.5 separates `null` from `0`, and the ordering has to keep them
     * apart in the only way an ordering can: an unstated cost adds nothing, so
     * the row sits at the lowest it could possibly cost. Sorting it as though
     * something were charged would put a made-up figure in a comparison, and
     * sorting it last would punish a partner for silence.
     */
    const productKey = `PK-${randomUUID().slice(0, 8)}`;
    const title = `Tencere ${randomUUID().slice(0, 8)}`;
    const silent = await list({
      amount: "1200.00",
      businessName: "Sessiz Mağaza",
      productKey,
      title
    });
    await list({
      amount: "1150.00",
      businessName: "Konuşkan Mağaza",
      deliveryCost: "120.00",
      productKey,
      title
    });

    const page = offeringPresentationSchema.parse(
      (await send("GET", `/offerings/${silent.offeringSlug}`)).json()
    );
    expect(page.sellers.map((seller) => seller.businessName)).toEqual([
      // 1200 + nothing stated beats 1150 + 120 stated.
      "Sessiz Mağaza",
      "Konuşkan Mağaza"
    ]);
    expect(
      page.sellers[0]?.pricing.kind === "FIXED"
        ? page.sellers[0].pricing.deliveryCost
        : "unset"
    ).toBeNull();
  });
});
