import { readFileSync } from "node:fs";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { sitemapSchema } from "@commerce/contracts";

import robots from "../apps/web/src/app/robots.js";
import {
  JsonLd,
  offeringJsonLd
} from "../apps/web/src/editorial/structured-data.js";
import {
  absoluteUrl,
  clampDescription,
  offeringPath
} from "../apps/web/src/seo.js";

/**
 * Increment I97 — making the platform findable.
 *
 * The prototype has had `robots.txt`, `sitemap.xml` and structured data since
 * `PROTOTYPE_SEO.md`; the product had none of the three, and every Offering tab
 * said `İlan — İlanlar` because `I51` found `generateMetadata` unused and named
 * it as separate work. For a comparison site organic search is the acquisition
 * channel, so this was the channel being closed.
 *
 * **The dangerous half of SEO is not the missing tag — it is the confident
 * false claim.** Markup is read by a machine that cannot see the page, so
 * nothing on screen breaks when it lies:
 *
 * - a sitemap that answers an outage with an empty file asks every crawler to
 *   forget the catalogue;
 * - an `aggregateRating` composed from the editorial score restates 8.4 out of
 *   ten as 8.4 out of five, which is the merge `UX-0003` §8.9.1 and
 *   `US-EDT-F01-001` AC-6 forbid — achieved without any arithmetic at all;
 * - a price in markup that the page never shows is a number no seller quoted.
 */
describe("Increment I97 the SEO surface", () => {
  const sitemapSource = readFileSync("apps/web/src/app/sitemap.ts", "utf8");
  const reader = readFileSync("apps/web/src/discovery/sitemap.ts", "utf8");
  const page = readFileSync(
    "apps/web/src/app/offerings/[slug]/page.tsx",
    "utf8"
  );

  /**
   * The source with its comments removed.
   *
   * **The third increment to need this, so it is worth stating as a rule rather
   * than a fix.** Every file in this repository explains what it deliberately
   * does not do, which means every assertion of the form "this word does not
   * appear" will find the sentence promising it does not. `i94` learned it,
   * `i95` repeated it, and this file tripped on `sitemap.ts`'s own note that
   * `priority` is left unset. A prose mention is not a behaviour.
   */
  const code = (source: string): string =>
    source.replace(/\/\*[\s\S]*?\*\//gu, "").replace(/\/\/.*$/gmu, "");

  const offering = {
    attributes: [],
    business: { logoUrl: null, name: "Acme", shortDescription: null },
    categoryPath: ["Teknoloji", "Telefon"],
    description: "Sessiz ve hızlı bir cihaz.",
    handoffAvailable: true,
    listingNumber: "1234",
    offeringId: "8f4c4b9a-0000-4000-8000-000000000000",
    pricing: {
      amount: "1000.00",
      amountSetAt: "2026-03-01T00:00:00.000Z",
      currency: "TRY",
      deliveryCost: null,
      kind: "FIXED" as const,
      priorAmount: null,
      stockState: "IN_STOCK" as const
    },
    productKey: "XZ200",
    publishedAt: "2026-03-01T00:00:00.000Z",
    rating: { average: "4.3", count: 12 },
    sellers: [],
    slug: "acme-telefon",
    title: "Acme Telefon",
    visuals: []
  };

  const seller = (amount: string | null, currency = "TRY") => ({
    businessName: "Acme",
    offeringId: "8f4c4b9a-0000-4000-8000-000000000001",
    pricing:
      amount === null
        ? { kind: "ON_REQUEST" as const, stockState: "UNKNOWN" as const }
        : {
            amount,
            amountSetAt: "2026-03-01T00:00:00.000Z",
            currency,
            deliveryCost: null,
            kind: "FIXED" as const,
            priorAmount: null,
            stockState: "IN_STOCK" as const
          },
    slug: "acme-telefon"
  });

  const review = {
    byline: "Editör ekibi",
    cons: ["pahalı"],
    lastCheckedAt: "2026-06-01T00:00:00.000Z",
    productKey: "XZ200",
    pros: ["sessiz"],
    publishedAt: "2026-03-01T00:00:00.000Z",
    score: 8.4,
    sections: [{ body: "gövde", heading: "Başlık" }],
    verdict: "İyi bir cihaz"
  };

  const crowd = {
    rating: { average: "4.3", count: 12 },
    reviews: [],
    total: 12
  };

  describe("the two scores stay two, in the markup as well — AC-6, §8.9.1", () => {
    /**
     * The trap this whole describe exists for. `aggregateRating` is one field
     * that invites exactly one number, and the editorial score is the obvious
     * candidate — it is the platform's own judgement and it looks authoritative.
     * Putting it there would merge the two, and nothing on screen would change.
     */
    it("builds the aggregate rating from the crowd and never from the editor", () => {
      const node = offeringJsonLd({
        editorial: review,
        offering,
        reviews: crowd
      }) as {
        aggregateRating: { bestRating: number; ratingValue: number };
        review: { reviewRating: { bestRating: number; ratingValue: number } }[];
      };
      expect(node.aggregateRating.ratingValue).toBe(4.3);
      expect(node.aggregateRating.bestRating).toBe(5);
      expect(node.review[0]?.reviewRating.ratingValue).toBe(8.4);
      expect(node.review[0]?.reviewRating.bestRating).toBe(10);
    });

    /**
     * A `Rating` with no `bestRating` is read as five-star by convention, so
     * omitting it would restate 8.4 as though it were out of five — the merge,
     * achieved by omission rather than by arithmetic.
     */
    it("declares the editorial scale explicitly", () => {
      const node = offeringJsonLd({
        editorial: review,
        offering,
        reviews: null
      }) as { review: { reviewRating: Record<string, unknown> }[] };
      expect(node.review[0]?.reviewRating).toHaveProperty("bestRating", 10);
      expect(node.review[0]?.reviewRating).toHaveProperty("worstRating", 0);
    });

    it("derives no third number from the two", () => {
      const source = readFileSync(
        "apps/web/src/editorial/structured-data.tsx",
        "utf8"
      ).replace(/\/\*[\s\S]*?\*\//gu, "");
      expect(source).not.toMatch(/\/\s*2\b/u);
      expect(source).not.toMatch(/combined|blended|overall/iu);
    });

    /**
     * A product nobody has scored carries no rating rather than a zero. Five
     * empty stars in markup is a verdict invented on behalf of people who have
     * not spoken — and a rich result would print it.
     */
    it("omits the aggregate rating where nobody has scored the product", () => {
      const node = offeringJsonLd({
        editorial: null,
        offering,
        reviews: { rating: { average: "0", count: 0 }, reviews: [], total: 0 }
      });
      expect(node).not.toHaveProperty("aggregateRating");
    });

    it("omits the review node where there is no editorial review", () => {
      const node = offeringJsonLd({
        editorial: null,
        offering,
        reviews: crowd
      });
      expect(node).not.toHaveProperty("review");
    });

    /**
     * `dateModified` is the re-check. A review never re-checked carries none
     * rather than repeating the publication date — the same refusal the visible
     * page makes.
     */
    it("carries both dates, and repeats neither for the other", () => {
      const checked = offeringJsonLd({
        editorial: review,
        offering,
        reviews: null
      }) as { review: Record<string, unknown>[] };
      expect(checked.review[0]?.dateModified).toBe("2026-06-01T00:00:00.000Z");

      const never = offeringJsonLd({
        editorial: { ...review, lastCheckedAt: null },
        offering,
        reviews: null
      }) as { review: Record<string, unknown>[] };
      expect(never.review[0]).not.toHaveProperty("dateModified");
      expect(never.review[0]?.datePublished).toBe("2026-03-01T00:00:00.000Z");
    });
  });

  describe("prices in the markup are prices the page shows", () => {
    it("aggregates only the priced sellers", () => {
      const node = offeringJsonLd({
        editorial: null,
        offering: {
          ...offering,
          sellers: [seller("1000.00"), seller(null), seller("1500.00")]
        },
        reviews: null
      }) as {
        offers: { lowPrice: number; highPrice: number; offerCount: number };
      };
      expect(node.offers.lowPrice).toBe(1000);
      expect(node.offers.highPrice).toBe(1500);
      /* The unpriced row is absent, not counted as zero. */
      expect(node.offers.offerCount).toBe(2);
    });

    it("omits the offers entirely where nothing is priced", () => {
      const node = offeringJsonLd({
        editorial: null,
        offering: { ...offering, sellers: [seller(null)] },
        reviews: null
      });
      expect(node).not.toHaveProperty("offers");
    });

    it("takes the currency from the priced rows themselves", () => {
      const node = offeringJsonLd({
        editorial: null,
        offering: { ...offering, sellers: [seller("1000.00", "EUR")] },
        reviews: null
      }) as { offers: { priceCurrency: string } };
      expect(node.offers.priceCurrency).toBe("EUR");
    });
  });

  describe("the script cannot be closed from inside", () => {
    /**
     * A title carrying `</script>` would end the block and everything after it
     * would be parsed as markup. The escape is the reason this element exists
     * rather than a template string.
     */
    it("escapes the one character that can end the block", () => {
      const markup = renderToStaticMarkup(
        createElement(JsonLd, {
          node: { name: "</script><img onerror=alert(1)>" }
        })
      );
      expect(markup).not.toContain("</script><img");
      expect(markup).toContain("\\u003c");
    });
  });

  describe("robots.txt", () => {
    const rules = robots();

    it("declares the sitemap and the host", () => {
      expect(rules.sitemap).toContain("/sitemap.xml");
      expect(rules.host).toBeTruthy();
    });

    /**
     * Filters are for people; listings are for search engines. A crawler that
     * indexes the parameterised copies of Discovery spends its budget on a
     * thousand near-identical pages and visits the listings less.
     */
    it("keeps crawlers out of the parameterised and private surfaces", () => {
      const rule = Array.isArray(rules.rules) ? rules.rules[0] : rules.rules;
      const disallow = rule?.disallow;
      const list = Array.isArray(disallow) ? disallow : [disallow];
      for (const path of [
        "/discovery?",
        "/account",
        "/favourites",
        "/login",
        "/admin",
        "/businesses"
      ])
        expect(list, `${path} is crawlable`).toContain(path);
    });

    /** The canonical listing route is never excluded. */
    it("leaves the listings themselves crawlable", () => {
      const rule = Array.isArray(rules.rules) ? rules.rules[0] : rules.rules;
      const list = Array.isArray(rule?.disallow)
        ? rule.disallow
        : [rule?.disallow];
      expect(list).not.toContain("/offerings");
      expect(rule?.allow).toBe("/");
    });
  });

  describe("the sitemap", () => {
    /**
     * **An empty sitemap is the claim that this site has no pages.** An outage
     * must not make it: the home page alone is a smaller and truer answer, and
     * a `500` at `/sitemap.xml` reads to a crawler as a site-level fault.
     */
    it("answers an outage with the home page rather than an empty file", () => {
      expect(reader).toContain("return null");
      /* I99 renamed the binding when the read grew a second list; the rule it
         guards is unchanged — `null` from the reader yields the home page
         alone, never an empty file claiming this site has no pages. */
      expect(sitemapSource).toContain("if (read === null) return [home]");
    });

    /**
     * A sitemap where every page changed today teaches a crawler that the date
     * means nothing, and it then ignores it on the pages that really changed.
     */
    it("uses each listing's own date rather than the time of the request", () => {
      expect(sitemapSource).toContain("new Date(entry.lastModified)");
    });

    it("claims no priority, because a site that marks everything important says nothing", () => {
      expect(code(sitemapSource)).not.toContain("priority");
    });

    it("is bounded at the protocol's own limit", () => {
      const tooMany = {
        categories: [],
        offerings: Array.from({ length: 50_001 }, (_, index) => ({
          lastModified: "2026-03-01T00:00:00.000Z",
          slug: `s${String(index)}`
        }))
      };
      expect(sitemapSchema.safeParse(tooMany).success).toBe(false);
    });
  });

  describe("the tab, the snippet and the canonical address", () => {
    /**
     * `I51` recorded this gap and left it: every Offering tab said
     * `İlan — İlanlar`. On a comparison site that is also the line a search
     * engine prints, identical on every listing the platform has.
     */
    it("names the listing rather than the word for listing", () => {
      expect(page).toContain("export async function generateMetadata");
      expect(page).toContain("title: offering.title");
    });

    /**
     * One product is sold by several partners, each a separate page carrying
     * the same Product Key. Without a canonical each is a near-duplicate and a
     * crawler picks whichever it likes.
     */
    it("declares a canonical address", () => {
      expect(page).toContain("alternates: { canonical }");
      expect(page).toContain("absoluteUrl(offeringPath(offering.slug))");
    });

    /** Metadata is not worth a 500 on a page that would otherwise render. */
    it("keeps the generic title when the listing cannot be read", () => {
      expect(page).toContain("return { title: TERMS.offering }");
    });

    /**
     * `generateMetadata` and the body both need the Presentation, and the route
     * is `force-dynamic`. Without a per-request memo the busiest public page in
     * the platform would fetch it twice.
     */
    it("reads the presentation once per request", () => {
      expect(page).toContain("cache(async (slug: string)");
      expect(page.match(/fetchOfferingPresentation\(/gu)).toHaveLength(1);
    });
  });

  describe("descriptions are cut at a word", () => {
    it("leaves a short description alone", () => {
      expect(clampDescription("Kısa bir açıklama.")).toBe("Kısa bir açıklama.");
    });

    it("cuts on whitespace and says there is more", () => {
      const cut = clampDescription("bir ".repeat(80), 20);
      expect(cut.endsWith("…")).toBe(true);
      expect(cut.length).toBeLessThanOrEqual(21);
      expect(cut).not.toMatch(/bi…$/u);
    });

    it("collapses the whitespace a description may carry", () => {
      expect(clampDescription("iki\n\nsatır")).toBe("iki satır");
    });
  });

  describe("addresses", () => {
    it("builds absolute addresses without doubling the separator", () => {
      expect(absoluteUrl("/offerings/x")).toMatch(
        /^https?:\/\/[^/]+\/offerings\/x$/u
      );
    });

    it("escapes a slug that would otherwise change the path", () => {
      expect(offeringPath("a/b")).toBe("/offerings/a%2Fb");
    });
  });
});
