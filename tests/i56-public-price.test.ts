import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
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
  listingCardSchema,
  offeringPresentationSchema,
  searchViewSchema,
  type OfferingPrice
} from "../packages/contracts/src/index.js";
import {
  CardPrice,
  PresentationPrice
} from "../apps/web/src/discovery/price.js";

/**
 * `I56` — an amount reaches the person who came to compare amounts.
 *
 * **The gap this closes is the widest one the platform had, and it was
 * invisible from either end.** I52 gave every Offering a price: seven columns,
 * four database constraints, a contract that refuses an incomplete Fixed price,
 * and an owner's form to type one into. None of it reached a visitor.
 * `listingCardSchema` carried seven fields and no amount; `offeringPresentation`
 * carried ten and no amount; the two SQL queries that build them did not select
 * the columns. A business stated a price, the database stored it, and every
 * public surface withheld it.
 *
 * So the cases below are mostly about **three states staying three states**.
 * PRD-0001 v4.0 §5.10.1 separates Fixed, On Request and Unknown, and the whole
 * value of that separation is lost the moment a surface renders two of them the
 * same way: "no price shown" would mean both "this is quoted for you" and "we
 * have not read one yet", and a person cannot act on the difference they can no
 * longer see.
 */

const FIXED: OfferingPrice = {
  amount: "1250.00",
  amountSetAt: "2026-08-01T10:00:00.000Z",
  currency: "TRY",
  deliveryCost: null,
  kind: "FIXED",
  priorAmount: null,
  stockState: "UNKNOWN"
};

const render = (element: Parameters<typeof renderToStaticMarkup>[0]) =>
  renderToStaticMarkup(element);

describe("Increment I56 the public price", () => {
  describe("the contract", () => {
    const card = {
      businessName: "Kartal Motors",
      categoryName: "Otomobil",
      offeringId: "55555555-5555-4555-8555-555555555555",
      pricing: FIXED,
      primaryVisualUrl: null,
      // I58. A card with no Product Key stands for one Offering — itself.
      productKey: null,
      publishedAt: "2026-08-01T10:00:00.000Z",
      handoffAvailable: false,
      // I67. Every card carries the listing number a person can type back in.
      listingNumber: "482007",
      // I62. Every card carries a product score; unrated is `null` with a
      // count of zero, which is what a fixture with no reviews must say.
      rating: { average: null, count: 0 },
      sellerCount: 1,
      slug: "ilan",
      title: "İlan"
    };

    it("makes the price part of the Listing Card minimum", () => {
      expect(listingCardSchema.safeParse(card).success).toBe(true);
      const { pricing: _pricing, ...without } = card;
      /*
       * Required rather than optional, and that is the decision.
       *
       * An optional price would let a query that forgot to select the columns
       * ship a card with no amount and no error — which is precisely the state
       * the platform was in for two days without anyone noticing.
       */
      expect(listingCardSchema.safeParse(without).success).toBe(false);
    });

    it("refuses a Fixed price with no amount", () => {
      expect(
        listingCardSchema.safeParse({
          ...card,
          pricing: { currency: "TRY", kind: "FIXED", stockState: "UNKNOWN" }
        }).success
      ).toBe(false);
    });

    it("carries the same shape on Presentation as on the card", () => {
      /*
       * Identical, not merely compatible. A person who chose a card because of
       * a number has to find that number unchanged on the page it opened, and
       * two shapes are two chances for Discovery and Presentation to disagree
       * about what something costs.
       */
      const presentation = offeringPresentationSchema.shape.pricing;
      expect(presentation).toBe(listingCardSchema.shape.pricing);
    });
  });

  describe("what a card says", () => {
    it("states a Fixed amount in the site's own currency format", () => {
      const html = render(createElement(CardPrice, { pricing: FIXED }));

      // 1250.00 TRY reads as "₺1.250" in tr-TR: a full stop groups the
      // thousands, which is the reverse of the stored form, and a whole-lira
      // amount is not padded with kuruş nobody is charging.
      expect(html).toContain("1.250");
      expect(html).not.toContain("1.250,00");
      expect(html).toContain("₺");
    });

    it("shows kuruş exactly where a partner charges some", () => {
      /*
       * The other half of the rule above, and the reason it is written from the
       * decimal string rather than from a fraction-digit setting. Dropping the
       * kuruş everywhere would round 43.750,50 to a figure no partner quoted —
       * a price the platform invented, on a page whose whole purpose is to
       * report prices it did not.
       */
      const html = render(
        createElement(CardPrice, { pricing: { ...FIXED, amount: "43750.50" } })
      );
      expect(html).toContain("43.750,50");
    });

    it("formats from the decimal string rather than through a float", () => {
      /*
       * `0.1 + 0.2` is the reason the amount travelled here as a string. An
       * amount whose cents cannot be represented exactly in binary is the case
       * that catches a `Number()` slipped in at the last moment.
       */
      const html = render(
        createElement(CardPrice, {
          pricing: { ...FIXED, amount: "8999999999.99" }
        })
      );
      expect(html).toContain("8.999.999.999,99");
    });

    it("says something different for On Request than for Unknown", () => {
      const quoted = render(
        createElement(CardPrice, {
          pricing: { kind: "ON_REQUEST", stockState: "UNKNOWN" }
        })
      );
      const unread = render(
        createElement(CardPrice, {
          pricing: { kind: "UNKNOWN", stockState: "UNKNOWN" }
        })
      );

      /*
       * The distinction I52 built the column pair for, now visible.
       *
       * On Request is an answer: the thing has no amount by its nature. Unknown
       * is an admission: the platform has not read one. Rendering both as an
       * empty space would report a failure in the first case and promise a
       * quote in the second.
       */
      expect(quoted).not.toEqual(unread);
      expect(quoted).toContain("Teklif");
      expect(unread).toContain("Fiyat bilgisi yok");
    });

    it("shows a reduction as two amounts and invents no percentage", () => {
      const html = render(
        createElement(CardPrice, {
          pricing: { ...FIXED, priorAmount: "1500.00" }
        })
      );

      expect(html).toContain("₺1.500");
      expect(html).toContain("₺1.250");
      expect(html).toContain("<s");
      /*
       * §5.10.4 refuses to *store* a discount percentage because it is
       * derivable from two amounts that each change independently. Computing
       * one here would be the same second copy of the same fact, made at the
       * last possible moment and shown as though the platform stood behind it.
       */
      expect(html).not.toContain("%");
    });

    it("says nothing about stock when nothing was stated", () => {
      const unknown = render(createElement(CardPrice, { pricing: FIXED }));
      const stocked = render(
        createElement(CardPrice, {
          pricing: { ...FIXED, stockState: "IN_STOCK" }
        })
      );

      expect(unknown).not.toContain("Stok");
      expect(stocked).toContain("Stokta");
    });
  });

  describe("what the Offering page adds", () => {
    it("separates an unstated delivery cost from a free one", () => {
      const unstated = render(
        createElement(PresentationPrice, { pricing: FIXED })
      );
      const free = render(
        createElement(PresentationPrice, {
          pricing: { ...FIXED, deliveryCost: "0.00" }
        })
      );
      const charged = render(
        createElement(PresentationPrice, {
          pricing: { ...FIXED, deliveryCost: "49.90" }
        })
      );

      /*
       * Three statements, and none of them is "0,00 ₺ teslimat". The column is
       * nullable so that "not stated" and "free" can be different answers; a
       * surface that printed the zero would turn a stated kindness into a
       * charge a person has to squint at.
       */
      expect(unstated).toContain("belirtilmemiş");
      expect(free).toContain("ücretsiz");
      expect(charged).toContain("49,90");
    });

    it("says when the amount was last true", () => {
      const html = render(createElement(PresentationPrice, { pricing: FIXED }));

      /*
       * §5.10.3 makes the instant part of the price. On a platform whose
       * amounts will arrive from partner feeds, a number with no date is a
       * number nobody can judge — and the person deciding is the one who should
       * judge it.
       */
      /*
       * The attribute name is matched case-insensitively. `renderToStaticMarkup`
       * emits React's `dateTime` prop name verbatim where a browser would see
       * `datetime`; asserting the browser spelling here would be asserting
       * something about the test harness rather than about the markup.
       */
      expect(html).toMatch(/datetime="2026-08-01T10:00:00\.000Z"/iu);
      expect(html).toContain("<time");
    });
  });

  // ---------------------------------------------------------------- the wire

  const enabled = Boolean(process.env.DATABASE_URL);
  const wired = enabled ? describe : describe.skip;

  wired("end to end", () => {
    const ORIGIN = "http://localhost:3000";
    const PASSWORD = "correct horse battery staple";

    class RecordingDispatcher implements EmailDispatcher {
      readonly delivered: EmailMessage[] = [];
      deliver(message: EmailMessage): Promise<void> {
        this.delivered.push(message);
        return Promise.resolve();
      }
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const dispatcher = new RecordingDispatcher();
    let app: NestFastifyApplication;
    let processor: OutboxProcessor;
    let categoryId: string;

    const address = () => `prc-${randomUUID()}@example.test`;
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
      const confirmed = await send(
        "POST",
        "/auth/registrations/confirmations",
        {
          body: { token: new URL(link).searchParams.get("token") }
        }
      );
      const cookies = confirmed.cookies as { name: string; value: string }[];
      return {
        cookie: `commerce_session=${cookies.find((c) => c.name === "commerce_session")?.value ?? ""}`,
        userId: confirmed.json<{ userId: string }>().userId
      };
    };

    /// One published Offering carrying a price, through the real path.
    const publish = async (pricing: unknown, title: string) => {
      const account = await signUp();
      const business = await send("POST", "/businesses", {
        body: { name: "Kartal Motors", slug: slug() },
        cookie: account.cookie
      });
      const businessId = business.json<{ id: string }>().id;
      await send("PUT", "/auth/me/business-context", {
        body: { businessId },
        cookie: account.cookie
      });
      const offeringSlug = slug();
      const offering = await send(
        "POST",
        `/businesses/${businessId}/offerings`,
        {
          body: { categoryId, slug: offeringSlug, title },
          cookie: account.cookie
        }
      );
      const offeringId = offering.json<{ id: string }>().id;
      await send(
        "PUT",
        `/businesses/${businessId}/offerings/${offeringId}/content`,
        {
          body: { attributes: [], categoryId, pricing, title },
          cookie: account.cookie
        }
      );
      await send(
        "POST",
        `/businesses/${businessId}/offerings/${offeringId}/publication`,
        { cookie: account.cookie }
      );
      return { offeringSlug };
    };

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
          name: `Fiyat ${randomUUID().slice(0, 8)}`,
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

    it("carries one amount, unchanged, along the whole route", async () => {
      const title = `Fiyatlı ilan ${randomUUID().slice(0, 8)}`;
      const { offeringSlug } = await publish(
        {
          amount: "42990.00",
          currency: "TRY",
          kind: "FIXED",
          stockState: "IN_STOCK"
        },
        title
      );

      const browsed = browseViewSchema.parse(
        (
          await send("POST", `/discovery/browse/categories/${categoryId}`, {
            body: {}
          })
        ).json()
      );
      const searched = searchViewSchema.parse(
        (
          await send("POST", "/discovery/search", { body: { query: title } })
        ).json()
      );
      const opened = offeringPresentationSchema.parse(
        (await send("GET", `/offerings/${offeringSlug}`)).json()
      );

      const onCard = (browsed.results ?? []).find(
        (result) => result.slug === offeringSlug
      );
      const onResult = searched.results.find(
        (result) => result.slug === offeringSlug
      );

      /*
       * Browse, Search and Presentation compose the price in three different
       * queries. They agree here because they agree in one module — which is
       * the assertion, not the amount itself.
       */
      /*
       * Narrowed rather than matched loosely. `kind` is the discriminator, and
       * asserting the fields without it would pass against a union member that
       * has none of them.
       */
      const priced = onCard?.pricing;
      if (priced?.kind !== "FIXED") throw new Error("EXPECTED_FIXED_PRICE");
      expect(priced.amount).toBe("42990.00");
      expect(priced.currency).toBe("TRY");
      expect(priced.deliveryCost).toBeNull();
      expect(priced.priorAmount).toBeNull();
      expect(priced.stockState).toBe("IN_STOCK");
      // Stamped where the amount is written, so the value is the server's.
      expect(Number.isNaN(Date.parse(priced.amountSetAt))).toBe(false);

      expect(onResult?.pricing).toEqual(priced);
      expect(opened.pricing).toEqual(priced);
    });

    it("carries On Request as a state rather than as a missing amount", async () => {
      const title = `Teklifli ilan ${randomUUID().slice(0, 8)}`;
      const { offeringSlug } = await publish(
        { kind: "ON_REQUEST", stockState: "UNKNOWN" },
        title
      );

      const opened = offeringPresentationSchema.parse(
        (await send("GET", `/offerings/${offeringSlug}`)).json()
      );

      /*
       * No `amount: null` and no `amount: "0"`. §5.10.5 refuses to place an
       * unpriced Offering at either end of an ordering, and a zero would place
       * it at the cheap end of every one.
       */
      expect(opened.pricing).toEqual({
        kind: "ON_REQUEST",
        stockState: "UNKNOWN"
      });
      expect(Object.keys(opened.pricing)).not.toContain("amount");
    });
  });
});
