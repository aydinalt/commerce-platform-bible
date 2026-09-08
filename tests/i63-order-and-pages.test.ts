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
  searchViewSchema
} from "../packages/contracts/src/index.js";

/**
 * `I63` — the order of a list, and the length of one.
 *
 * **Two things the platform got from a document written before it had prices.**
 * PRD-0002 §12.3 fixed the Browse order at "later Initial Published At first"
 * when no Offering carried an amount at all, and the answer carried every
 * result because a Category held a dozen of them. The Owner's instruction is
 * one sentence for the first — *sıralama konusunu prototipine uyduralım* — and
 * a number for the second: twenty-five cards a page, with pager buttons under
 * them.
 *
 * The cases here are the ones where a plausible implementation is wrong:
 *
 * - ordering on the amount rather than on what a person would pay, which puts
 *   a cheaper sticker with a delivery charge above a dearer one without;
 * - sinking an unpriced Offering to the bottom *as though it were expensive*,
 *   or floating it to the top as though it were free;
 * - counting Offerings rather than products, so a pager promises pages that do
 *   not exist;
 * - answering a page past the end with Zero Results, which tells somebody who
 *   overshot a pager that their criteria matched nothing.
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

suite("Increment I63 result order and pages", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let categoryId: string;
  let seller: { businessId: string; cookie: string };

  const address = () => `ord-${randomUUID()}@example.test`;
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

  /** One published Offering under the shared seller and Category. */
  const list = async (input: {
    amount: string | null;
    deliveryCost?: string;
    stockState?: "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
    title: string;
  }) => {
    const offering = await send(
      "POST",
      `/businesses/${seller.businessId}/offerings`,
      {
        body: { categoryId, slug: slug(), title: input.title },
        cookie: seller.cookie
      }
    );
    const offeringId = offering.json<{ id: string }>().id;
    await send(
      "PUT",
      `/businesses/${seller.businessId}/offerings/${offeringId}/content`,
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
          title: input.title
        },
        cookie: seller.cookie
      }
    );
    await send(
      "POST",
      `/businesses/${seller.businessId}/offerings/${offeringId}/publication`,
      { cookie: seller.cookie }
    );
    return { offeringId };
  };

  const browse = async (body: Record<string, unknown> = {}) =>
    browseViewSchema.parse(
      (
        await send("POST", `/discovery/browse/categories/${categoryId}`, {
          body
        })
      ).json()
    );

  const titles = async (body: Record<string, unknown> = {}) =>
    ((await browse(body)).results ?? []).map((card) => card.title);

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
        name: `Sıra ${randomUUID().slice(0, 8)}`,
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });
    categoryId = category.json<{ id: string }>().id;

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
    seller = { businessId, cookie: account.cookie };
  });

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    dispatcher.delivered.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("puts the cheapest first, counting what a person would pay", async () => {
    /*
     * The pair that decides whether the ordering reads §5.10.5 or the amount
     * column: 1.000 plus 150 delivery is dearer than 1.100 delivered free, and
     * an implementation that sorted on `amount` would put them the other way
     * round while looking entirely reasonable.
     */
    const dearer = `Kargolu ${randomUUID().slice(0, 8)}`;
    const cheaper = `Kargosuz ${randomUUID().slice(0, 8)}`;
    await list({ amount: "1000.00", deliveryCost: "150.00", title: dearer });
    await list({ amount: "1100.00", deliveryCost: "0.00", title: cheaper });

    const listed = await titles();
    expect(listed.indexOf(cheaper)).toBeLessThan(listed.indexOf(dearer));
  });

  it("sinks what is out of stock however cheap it is", async () => {
    const cheapButGone = `Tükendi ${randomUUID().slice(0, 8)}`;
    const dearerButHere = `Stokta ${randomUUID().slice(0, 8)}`;
    await list({
      amount: "10.00",
      stockState: "OUT_OF_STOCK",
      title: cheapButGone
    });
    await list({ amount: "5000.00", title: dearerButHere });

    /*
     * A price a person cannot buy at is not a better offer than one they can.
     * The Owner's prototype does this and the seller list inside a Presentation
     * has done it since I58; this is the same rule applied to the list of
     * products.
     */
    const listed = await titles();
    expect(listed.indexOf(dearerButHere)).toBeLessThan(
      listed.indexOf(cheapButGone)
    );
  });

  it("puts what has no amount after everything that has one", async () => {
    /*
     * Not a judgement that quoted work is expensive: an Offering with no amount
     * has no position in a price ordering at all, and sorting it to either end
     * would state a comparison the platform cannot make. It follows the rows
     * that can be compared, which is the one placement that claims nothing.
     */
    const quoted = `Teklifli ${randomUUID().slice(0, 8)}`;
    const priced = `Fiyatlı ${randomUUID().slice(0, 8)}`;
    await list({ amount: null, title: quoted });
    await list({ amount: "999999.00", title: priced });

    const listed = await titles();
    expect(listed.indexOf(priced)).toBeLessThan(listed.indexOf(quoted));
  });

  it("carries twenty-five products a page and says how many there are", async () => {
    const mark = randomUUID().slice(0, 8);
    // Twenty-eight, so the second page is short and the third does not exist.
    for (let index = 0; index < 28; index += 1)
      await list({
        amount: `${1000 + index}.00`,
        title: `Sayfa${mark} ${index}`
      });

    const first = await browse();
    expect(first.paging?.pageSize).toBe(25);
    expect(first.results).toHaveLength(25);
    expect(first.paging?.page).toBe(1);
    // The count is of the whole list, not of the page, so a pager can be built
    // from one response rather than by walking to the end.
    expect(first.paging?.total).toBeGreaterThanOrEqual(28);

    const second = await browse({ page: 2 });
    expect(second.paging?.page).toBe(2);
    expect(second.results?.length).toBeGreaterThan(0);
    expect(second.paging?.total).toBe(first.paging?.total);

    // No product appears on two pages: the ordering is total, so a boundary
    // cannot show the same thing twice.
    const firstIds = (first.results ?? []).map((card) => card.offeringId);
    const secondIds = (second.results ?? []).map((card) => card.offeringId);
    expect(firstIds.filter((id) => secondIds.includes(id))).toEqual([]);
  });

  it("keeps the pages in one ordering across the boundary", async () => {
    const first = await browse();
    const second = await browse({ page: 2 });

    /*
     * The key the rule actually sorts on, written out here so the case checks
     * the arrangement rather than restating the amount column: out of stock
     * last, unpriced after priced, then what a person would pay.
     */
    const rank = (card: {
      pricing: {
        amount?: string;
        deliveryCost?: string | null;
        stockState: string;
      };
    }): [number, number, number] => [
      card.pricing.stockState === "OUT_OF_STOCK" ? 1 : 0,
      card.pricing.amount === undefined ? 1 : 0,
      Number(card.pricing.amount ?? 0) + Number(card.pricing.deliveryCost ?? 0)
    ];

    const ordered = [...(first.results ?? []), ...(second.results ?? [])].map(
      rank
    );
    const sorted = [...ordered].sort(
      (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]
    );
    // Page two continues page one rather than restarting it, which is what a
    // paged query gets wrong when the ordering is not total.
    expect(ordered).toEqual(sorted);
  });

  it("answers a page past the end with an empty page, not with Zero Results", async () => {
    const beyond = await browse({ page: 40 });

    expect(beyond.results).toEqual([]);
    /*
     * Somebody on page forty of two has overshot a list that exists. Telling
     * them their criteria matched nothing would be a false statement about the
     * catalogue, and §13's recovery actions — change the query, clear the
     * filters — would be answering a question they did not ask.
     */
    expect(beyond.zeroResults).toBeNull();
    expect(beyond.paging?.total).toBeGreaterThan(0);
  });

  it("says Zero Results when the criteria really match nothing", async () => {
    const empty = await browse({
      price: { currency: "TRY", maxAmount: "1.00" }
    });

    expect(empty.results).toEqual([]);
    expect(empty.paging?.total).toBe(0);
    expect(empty.zeroResults).not.toBeNull();
  });

  it("pages a Search too, and keeps relevance above price", async () => {
    const mark = `Ara${randomUUID().slice(0, 6)}`;
    // The dear one names the query in its title; the cheap one reaches it only
    // through the Category path.
    await list({ amount: "90000.00", title: `${mark} pahalı` });
    await list({ amount: "10.00", title: `Ucuz ${randomUUID().slice(0, 6)}` });

    const view = searchViewSchema.parse(
      (
        await send("POST", "/discovery/search", { body: { query: mark } })
      ).json()
    );

    expect(view.paging.pageSize).toBe(25);
    expect(view.paging.page).toBe(1);
    /*
     * PRD-0002 §12.2 decides which tier a result is in and I63 decides the
     * arrangement inside one. A title match therefore still comes first even
     * though something cheaper matched by another route — relevance is what
     * the person asked about, and price is how the answers are laid out.
     */
    expect(view.results[0]?.matchLevel).toBe("TITLE");
  });
});
