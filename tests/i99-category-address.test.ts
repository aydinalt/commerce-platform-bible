import { readFileSync } from "node:fs";

import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { categoryAddressSchema } from "../packages/contracts/src/index.js";
import { absoluteUrl, categoryPath } from "../apps/web/src/seo.js";

/**
 * Increment I99 — the Category address (`UX-0002` **Frozen v1.4** §8A).
 *
 * **This is the first surface in the platform built to be found.** Every other
 * public route is somewhere a person arrives after already being here:
 * Discovery holds one visit's criteria in a cookie and Home is reachable only
 * by the site's own name. A Category existed only as a selection inside
 * somebody's session, so the words a market is actually searched with had no
 * address to land on.
 *
 * **The risk is not that the page fails to render. It is that it renders and
 * quietly becomes Discovery.** Four things would do it, and each has cases
 * below:
 *
 * - recording a Discovery Start on arrival, which §8A.4 forbids and which a
 *   crawler would then produce at whatever rate it chose;
 * - writing or reading the criteria carrier, which would make a shared link
 *   change what the person who followed it had open;
 * - growing a Filter, a budget or an arrangement — a criteria state at a
 *   shareable address is exactly what §4 excludes;
 * - aggregating a non-leaf's descendants, which §8.2 refuses in a path and
 *   §8A.2 refuses at an address.
 *
 * **Comments are stripped before any "this word does not appear" assertion.**
 * Every file in this repository documents what it deliberately does *not* do,
 * so a naive substring check reads the prose as the code. This is the fourth
 * increment to need the rule and it is stated here rather than rediscovered.
 */
const code = (path: string): string =>
  readFileSync(path, "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//gu, "")
    .replaceAll(/^\s*\/\/.*$/gmu, "");

const ROUTE = "apps/web/src/app/kategori/[slug]/page.tsx";
const READER = "apps/web/src/discovery/category-address.ts";

describe("Increment I99 the Category address", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  describe("the address itself", () => {
    it("is `/kategori/{slug}`, spelled in one place", () => {
      expect(categoryPath("oyun-klavyesi")).toBe("/kategori/oyun-klavyesi");

      /*
       * §8A.5 makes this the canonical address, and two spellings of a
       * canonical address is the defect a canonical tag exists to prevent. The
       * route, the sitemap and the links inside the page all call the same
       * function rather than writing the template out.
       */
      const spellings = [
        ROUTE,
        "apps/web/src/app/sitemap.ts",
        "apps/web/src/app/kategori/[slug]/category-unavailable.tsx"
      ].map(code);
      for (const source of spellings) {
        expect(source).toMatch(/categoryPath/u);
        expect(source).not.toMatch(/["'`]\/kategori\//u);
      }
    });

    it("encodes a slug rather than pasting it into a path", () => {
      // Not a hypothetical: a slug reaches this function from a URL, and the
      // same value is later printed into a canonical tag.
      expect(categoryPath("a/b")).toBe("/kategori/a%2Fb");
      expect(absoluteUrl(categoryPath("a b"))).toContain("/kategori/a%20b");
    });
  });

  describe("what the contract will not carry", () => {
    it("has no criteria, no path and no page number", () => {
      /*
       * The shape is the guard. A field that does not exist cannot be filled
       * in by a later surface that thought it would be convenient — which is
       * how a Filter would arrive at a shareable address.
       */
      const shape = Object.keys(categoryAddressSchema.shape).sort();
      expect(shape).toEqual([
        "ancestors",
        "category",
        "children",
        "domain",
        "domainName",
        "results"
      ]);
    });

    it("refuses an unknown field rather than ignoring it", () => {
      const valid = {
        ancestors: [],
        category: {
          id: "11111111-1111-4111-8111-111111111111",
          leaf: true,
          name: "Oyun klavyesi",
          slug: "oyun-klavyesi"
        },
        children: [],
        domain: "TECHNOLOGY",
        domainName: "Technology",
        results: []
      };
      expect(categoryAddressSchema.parse(valid)).toBeTruthy();
      expect(() =>
        categoryAddressSchema.parse({ ...valid, discoveryPathId: "x" })
      ).toThrow();
      expect(() =>
        categoryAddressSchema.parse({ ...valid, filters: [] })
      ).toThrow();
      expect(() =>
        categoryAddressSchema.parse({ ...valid, paging: null })
      ).toThrow();
    });
  });

  describe("what the route refuses to touch", () => {
    const route = code(ROUTE);
    const reader = code(READER);

    it("never reaches the Discovery criteria carrier", () => {
      /*
       * §8A.1: the address carries the Category and nothing else. Reading the
       * carrier would be harmless; **writing** it is what would make a shared
       * link change the Results of the person who followed it. Neither is
       * done, so neither can start being done by accident.
       */
      expect(route).not.toMatch(/DISCOVERY_ENTRY_COOKIE|readDiscoveryEntry/u);
      expect(route).not.toMatch(/discovery\/entry/u);
    });

    it("imports none of the actions that mint a Discovery path", () => {
      /*
       * Every export of `app/actions.ts` writes the carrier and redirects to
       * `/discovery`, and three of them mint a new path id — which is what a
       * Discovery Start is recorded against. The route importing any of them
       * would be the address quietly becoming Discovery.
       */
      expect(route).not.toMatch(/from "\.\.\/\.\.\/actions"/u);
      expect(route).not.toMatch(
        /selectCategory|beginBrowse|beginSearch|applyFilters|applyBudget|applyArrangement|goToPage/u
      );
    });

    it("reads over GET, where Discovery reads over POST", () => {
      /*
       * The two Discovery reads are `POST`s **because** each creates a
       * Discovery Start — an occurrence rather than a page being fetched. §8A.4
       * makes arrival here create none, so this is a read; and a permanent
       * address that could only be reached by a POST would be unindexable.
       */
      expect(reader).not.toMatch(/method:\s*"POST"/u);
      expect(reader).not.toMatch(/fetchBrowseView|fetchSearchView/u);
      expect(reader).toMatch(/discovery\/categories\//u);
    });

    it("offers no Filter, budget, availability or arrangement control", () => {
      // §8A.3. An address that grew any of these would grow a state to carry
      // them in, and that state at a shareable address is what §4 excludes.
      expect(route).not.toMatch(
        /FilterControls|BudgetControl|StockControl|ArrangementTabs/u
      );
    });
  });

  describe("what it presents", () => {
    /** `notFound()` observable as a throw, which is what Next does. */
    const NOT_FOUND = new Error("NEXT_NOT_FOUND");

    const mount = async (read: unknown) => {
      vi.doMock("next/headers", () => ({
        cookies: () => Promise.resolve({ get: () => undefined })
      }));
      vi.doMock("next/navigation", () => ({
        notFound: () => {
          throw NOT_FOUND;
        }
      }));
      vi.doMock("../apps/web/src/discovery/category-address.js", () => ({
        readCategoryAddress: () => Promise.resolve(read)
      }));
      vi.doMock("../apps/web/src/app/decision/actions.js", () => ({
        handoffFromCard: () => Promise.resolve()
      }));
      vi.doMock("../apps/web/src/app/favourites/actions.js", () => ({
        keepFavourite: () => Promise.resolve(),
        releaseFavourite: () => Promise.resolve()
      }));
      return (await import("../apps/web/src/app/kategori/[slug]/page.js")) as {
        default: (props: never) => Promise<ReactElement>;
        generateMetadata: (props: never) => Promise<{
          alternates?: { canonical?: string };
          title?: string;
        }>;
      };
    };

    const params = { params: Promise.resolve({ slug: "oyun-klavyesi" }) };

    const category = (over: Record<string, unknown> = {}) => ({
      id: "11111111-1111-4111-8111-111111111111",
      leaf: true,
      name: "Oyun klavyesi",
      slug: "oyun-klavyesi",
      ...over
    });

    const card = {
      businessName: "Teknoloji A.Ş.",
      categoryName: "Oyun klavyesi",
      handoffAvailable: false,
      listingNumber: "1001",
      offeringId: "22222222-2222-4222-8222-222222222222",
      pricing: {
        amount: "1200.00",
        currency: "TRY",
        deliveryCost: null,
        kind: "FIXED" as const,
        stockState: "IN_STOCK" as const
      },
      primaryVisualUrl: null,
      productKey: null,
      publishedAt: "2026-09-01T00:00:00.000Z",
      rating: { average: null, count: 0 },
      sellerCount: 1,
      slug: "bir-klavye",
      title: "Bir klavye"
    };

    it("presents a leaf's Results", async () => {
      const page = await mount({
        ancestors: [],
        category: category(),
        children: [],
        domain: "TECHNOLOGY",
        domainName: "Technology",
        results: [card]
      });
      const html = renderToStaticMarkup(await page.default(params as never));
      expect(html).toContain("Bir klavye");
      expect(html).toContain("listing-cards");
    });

    it("presents a branch's children and no Results at all", async () => {
      /*
       * **§8.2 at an address, not an exception to it.** The assertion that
       * matters is the absence: no card, no combined count, and nothing
       * offering to produce one. A branch that showed "1.240 ilan" would be the
       * non-leaf aggregation §21 forbids, arrived at by way of a summary.
       */
      const page = await mount({
        ancestors: [],
        category: category({ leaf: false }),
        children: [
          { ...category({ name: "Mekanik", slug: "mekanik" }), leaf: true }
        ],
        domain: "TECHNOLOGY",
        domainName: "Technology",
        results: null
      });
      const html = renderToStaticMarkup(await page.default(params as never));
      expect(html).toContain("/kategori/mekanik");
      expect(html).toContain("Alt kategoriler");
      expect(html).not.toContain("listing-cards");
      expect(html).not.toMatch(/bulunamadı/u);
    });

    it("states an empty leaf as a fact rather than an error", async () => {
      /*
       * §8A.3. `[]` and `null` are different answers and the page keeps them
       * apart: this one found nothing, the one above withheld.
       */
      const page = await mount({
        ancestors: [{ ...category({ name: "Teknoloji", slug: "teknoloji" }) }],
        category: category(),
        children: [],
        domain: "TECHNOLOGY",
        domainName: "Technology",
        results: []
      });
      const html = renderToStaticMarkup(await page.default(params as never));
      expect(html).toMatch(/bulunamadı/u);
      expect(html).toContain('role="status"');
      // The recovery is the parent's own address, because there are no criteria
      // at an address to relax.
      expect(html).toContain("/kategori/teknoloji");
    });

    it("answers a retired Category the way it answers an absent one", async () => {
      const page = await mount("MISSING");
      await expect(page.default(params as never)).rejects.toBe(NOT_FOUND);
    });

    it("never turns an outage into an empty Category", async () => {
      /*
       * **The one that would be durable.** A failed read presented as "this
       * Category holds nothing" is a false statement about the catalogue, made
       * at an address a search engine indexes and then believes.
       */
      const page = await mount("UNAVAILABLE");
      const html = renderToStaticMarkup(await page.default(params as never));
      expect(html).toMatch(/geçici olarak görüntülenemiyor/u);
      expect(html).not.toMatch(/bulunamadı/u);
    });

    it("declares itself canonical, and names the Category in the tab", async () => {
      const page = await mount({
        ancestors: [],
        category: category(),
        children: [],
        domain: "TECHNOLOGY",
        domainName: "Technology",
        results: []
      });
      const meta = await page.generateMetadata(params as never);
      expect(meta.title).toBe("Oyun klavyesi");
      expect(meta.alternates?.canonical).toBe(
        absoluteUrl("/kategori/oyun-klavyesi")
      );
    });

    it("keeps the generic title when the Category cannot be read", async () => {
      // Metadata is not worth a 500 on a page that would otherwise render.
      const page = await mount("UNAVAILABLE");
      const meta = await page.generateMetadata(params as never);
      expect(meta.title).toBe("Kategori");
      expect(meta.alternates?.canonical).toBeUndefined();
    });
  });

  describe("the sitemap", () => {
    const sitemapWith = async (read: unknown) => {
      vi.doMock("../apps/web/src/discovery/sitemap.js", () => ({
        readSitemap: () => Promise.resolve(read)
      }));
      const module = (await import("../apps/web/src/app/sitemap.js")) as {
        default: () => Promise<{ url: string }[]>;
      };
      return module.default();
    };

    it("advertises the Category addresses the API listed", async () => {
      const entries = await sitemapWith({
        categories: [
          { lastModified: "2026-09-01T00:00:00.000Z", slug: "oyun-klavyesi" }
        ],
        offerings: [
          { lastModified: "2026-09-02T00:00:00.000Z", slug: "bir-klavye" }
        ]
      });
      const urls = entries.map((entry) => entry.url);
      expect(urls).toContain(absoluteUrl("/kategori/oyun-klavyesi"));
      expect(urls).toContain(absoluteUrl("/offerings/bir-klavye"));
    });

    it("still answers an outage with the home page alone", async () => {
      /*
       * Unchanged by this increment and asserted because it would be easy to
       * break: an empty sitemap is the claim that this site has no pages, and
       * `null` from the reader must not become an empty category list either.
       */
      const entries = await sitemapWith(null);
      expect(entries).toHaveLength(1);
    });
  });

  describe("the slug became an address", () => {
    it("is globally unique in the schema, not merely per Domain", () => {
      /*
       * **The defect this found.** `@@unique([domainId, slug])` was the only
       * constraint, so two Domains could hold one slug and `/kategori/{slug}`
       * would have identified two Categories — an address that means two
       * things is not an address, and §8A.5 calls this one canonical.
       *
       * Nothing was broken when this was written: the authored taxonomy holds
       * 127 headings across 11 Domains with no repeat. What was missing is the
       * reason it stays that way.
       */
      const schema = readFileSync(
        "packages/database/prisma/schema.prisma",
        "utf8"
      );
      expect(schema).toMatch(/@@unique\(\[slug\], map: "category_slug_key"\)/u);
      // The per-Domain index is kept: `pg-catalog.repository.ts` names it when
      // it turns a unique violation into the Admin's message.
      expect(schema).toMatch(/@@unique\(\[domainId, slug\]\)/u);

      const migration = readFileSync(
        "packages/database/prisma/migrations/20260917000100_category_slug_address/migration.sql",
        "utf8"
      );
      expect(migration).toMatch(
        /CREATE UNIQUE INDEX "category_slug_key" ON "category" \("slug"\)/u
      );
    });

    it("translates both slug constraints into the Admin's conflict", () => {
      /*
       * Which index catches a repeat depends on where the repeat is. A
       * violation the translator did not recognise would reach the Admin as a
       * `500` rather than as the conflict it is.
       */
      const repository = code(
        "apps/api/src/persistence/pg-catalog.repository.ts"
      );
      expect(repository).toMatch(/"category_slug_key"/u);
      expect(repository).toMatch(/"category_domain_id_slug_key"/u);

      // And the message no longer says "in the Domain", which would send an
      // Admin looking in the wrong one — or at a retired Category they cannot
      // see at all.
      const service = code("apps/api/src/catalog/catalog.service.ts");
      expect(service).not.toMatch(/already exists in the Domain/u);
    });
  });
});
