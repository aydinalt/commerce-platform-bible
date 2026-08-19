import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ApiRequestError,
  isApiUnavailable
} from "../apps/web/src/api-error.js";

/**
 * The Error Behaviour every Frozen UX document specifies and none of them had.
 *
 * Eight Frozen UX documents carry an "Error Behaviour" section. The web
 * application had **no error boundary on any of its twenty-two routes**, so a
 * failed read threw and Next.js replaced the whole page with its built-in crash
 * screen — losing the person's criteria, every bounded recovery the documents
 * name, and any statement of what had happened.
 *
 * That got worse with I22 rather than better. The API now answers a database
 * outage with `503 DEPENDENCY_UNAVAILABLE`, which says truthfully "this is
 * temporary, your request was fine" — and the person was shown an application
 * crash, which says the opposite about a different system.
 *
 * This increment covers the public path the Owner scoped: UX-0001 §13's two
 * states and UX-0002 §14's three. The recurring shape of all five is the same
 * and is what these cases assert — what the person had remains, nothing is
 * invented, no occurrence is claimed, and a bounded set of recoveries is
 * offered.
 */
describe("Increment I23 error behaviour", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  /**
   * An unavailable-API failure from the module registry the code under test
   * will use.
   *
   * `vi.resetModules()` gives each case a fresh registry, so an
   * `ApiRequestError` built from this file's own top-level import is a
   * *different class object* from the one the page imports — and `instanceof`
   * is false between them. The failure would then escape the page's `catch`,
   * and the test would report a bug that does not exist while passing over one
   * that might.
   */
  const unavailable = async () => {
    const { ApiRequestError: Live } =
      await import("../apps/web/src/api-error.js");
    return new Live("DISCOVERY", 503);
  };

  /** Both Discovery reads failing the same way, as an outage makes them. */
  const mockDiscoveryReads = (error: unknown) => {
    vi.doMock("../apps/web/src/discovery/api.js", () => ({
      fetchBrowseView: () => {
        throw error;
      },
      fetchOfferingPresentation: () => {
        throw error;
      },
      fetchSearchView: () => {
        throw error;
      }
    }));
  };

  describe("telling a dependency failure from a defect", () => {
    it("treats only the API's own 5xx as unavailable", () => {
      expect(isApiUnavailable(new ApiRequestError("DISCOVERY", 503))).toBe(
        true
      );
      expect(isApiUnavailable(new ApiRequestError("DISCOVERY", 500))).toBe(
        true
      );

      /*
       * `4xx` is this application having sent something wrong. Presenting it as
       * "temporarily unavailable" would promise a retry that can never succeed,
       * which is the same trade I22 refused when it kept constraint violations
       * answering `500` rather than folding them into `DEPENDENCY_UNAVAILABLE`.
       */
      expect(isApiUnavailable(new ApiRequestError("DISCOVERY", 400))).toBe(
        false
      );
      expect(isApiUnavailable(new ApiRequestError("DISCOVERY", 409))).toBe(
        false
      );

      // A bug must keep reaching the crash screen. A page that caught these
      // would hide its own defects behind "please try again", for ever.
      expect(isApiUnavailable(new TypeError("x is not a function"))).toBe(
        false
      );
      expect(isApiUnavailable(new Error("DISCOVERY_503"))).toBe(false);
      expect(isApiUnavailable(undefined)).toBe(false);
    });

    it("carries the status the API answered, rather than a number in a string", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.resolve(new Response("", { status: 503 })))
      );
      const { fetchBrowseRoots } =
        await import("../apps/web/src/discovery/api.js");

      // `Error("BROWSE_ROOTS_503")` put the number somewhere nobody could
      // branch on, which is why every page treated an outage as a crash.
      await expect(fetchBrowseRoots()).rejects.toMatchObject({
        name: "ApiRequestError",
        status: 503
      });
    });
  });

  describe("UX-0002 §14 Search or Browse result error", () => {
    /** The carrier, mocked so a test can prove nothing wrote to it. */
    const carrier = (value: string) => {
      const set = vi.fn();
      vi.doMock("next/headers", () => ({
        cookies: () => Promise.resolve({ get: () => ({ value }), set })
      }));
      return set;
    };

    it("keeps the criteria, invents nothing, and offers the three recoveries", async () => {
      const set = carrier(
        JSON.stringify({ kind: "SEARCH", pathId: "p", query: "kiralık daire" })
      );
      mockDiscoveryReads(await unavailable());

      const { default: DiscoveryPage } =
        await import("../apps/web/src/app/discovery/page.js");
      const markup = renderToStaticMarkup(
        (await DiscoveryPage()) as ReactElement
      );

      // "Current criteria remain" — and are shown, which is the difference
      // between criteria surviving and criteria appearing to be thrown away.
      expect(markup).toContain("kiralık daire");

      /*
       * "No alternative query or Category is invented." Proven by the carrier
       * never being written: a page that cannot write cannot substitute. This
       * is the assertion that would fail first if somebody later "helpfully"
       * cleared the cookie on the way out.
       */
      expect(set).not.toHaveBeenCalled();

      // Retry, change criteria, return Home.
      expect(markup).toContain("Tekrar dene");
      expect(markup).toContain('href="/"');
      expect(markup).toContain("Bugün ne yapmak istiyorsunuz?");
    });

    it("retries by submission, because a prefetched link would claim a Discovery Start", async () => {
      carrier(JSON.stringify({ kind: "SEARCH", pathId: "p", query: "araba" }));
      mockDiscoveryReads(await unavailable());

      const { default: DiscoveryPage } =
        await import("../apps/web/src/app/discovery/page.js");
      const markup = renderToStaticMarkup(
        (await DiscoveryPage()) as ReactElement
      );

      /*
       * The whole reason every entry into Discovery is a `POST`. An anchor to
       * `/discovery` would be prefetched by Next, and a prefetched Discovery
       * route records a Discovery Start for somebody who never asked for one —
       * on the one surface whose entire purpose is that nothing was claimed.
       */
      expect(markup).not.toContain('href="/discovery"');
      expect(markup).toContain("<form");
    });

    it("rethrows a defect instead of inviting a retry that cannot work", async () => {
      carrier(JSON.stringify({ kind: "SEARCH", pathId: "p", query: "ev" }));
      mockDiscoveryReads(new TypeError("view.results is not iterable"));

      const { default: DiscoveryPage } =
        await import("../apps/web/src/app/discovery/page.js");

      await expect(DiscoveryPage()).rejects.toBeInstanceOf(TypeError);
    });
  });

  describe("UX-0002 §14 Filter application error", () => {
    it("leaves the last confirmed criteria and does not apply the failed Filter", async () => {
      const set = vi.fn();
      const confirmed = {
        categoryId: "11111111-1111-4111-8111-111111111111",
        kind: "BROWSE",
        pathId: "p"
      };
      vi.doMock("next/headers", () => ({
        cookies: () =>
          Promise.resolve({
            get: () => ({ value: JSON.stringify(confirmed) }),
            set
          })
      }));
      mockDiscoveryReads(await unavailable());

      const { applyFilters } = await import("../apps/web/src/app/actions.js");
      await applyFilters(new FormData());

      /*
       * All three parts of §14 are this one absence. The carrier still holds
       * the last confirmed criteria, so they remain; the requested Filter never
       * reached it, so it was not applied; and the controls the person used are
       * still on the page, so retrying and removing are both still available.
       *
       * The alternative — applying a Filter the API never confirmed as offered
       * — would be this application deciding what may be filtered by, which
       * §9.1 makes a property of the Category and the Attribute definition.
       */
      expect(set).not.toHaveBeenCalled();
    });
  });

  describe("UX-0002 §14 Listing Card open error", () => {
    it("keeps Discovery context and offers retry without opening anything", async () => {
      const { PresentationUnavailable } =
        await import("../apps/web/src/app/offerings/[slug]/presentation-unavailable.js");

      const markup = renderToStaticMarkup(
        createElement(PresentationUnavailable, { slug: "kirmizi-araba" })
      );

      // The Offering is named exactly and never substituted: §14 forbids
      // inventing an alternative, and an Offering is the one thing that must
      // never be.
      expect(markup).toContain('value="kirmizi-araba"');

      /*
       * Both recoveries are submissions, for two different occurrences. A
       * prefetched link back to this Offering would ask the API to compose a
       * Presentation and record `Offering Presentation Open` for somebody who
       * never opened anything; a prefetched link to Discovery would record a
       * Discovery Start the same way.
       */
      expect(markup).not.toContain('href="/offerings');
      expect(markup).not.toContain('href="/discovery"');
      expect(markup).toContain("Sonuçlara dön");
    });

    it("does not offer Decision or Compare over a Presentation it could not read", async () => {
      const { PresentationUnavailable } =
        await import("../apps/web/src/app/offerings/[slug]/presentation-unavailable.js");

      const markup = renderToStaticMarkup(
        createElement(PresentationUnavailable, { slug: "x" })
      );

      // UX-0003 §16: "no Decision or Compare action starts". Offering them over
      // an absent Presentation would begin a Decision about an Offering this
      // application could not read.
      expect(markup).not.toContain("Karar");
      expect(markup).not.toContain("Karşılaştır");
    });
  });
});
