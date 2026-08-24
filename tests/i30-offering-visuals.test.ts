import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { imageSource } from "../apps/web/src/image-source.js";
import { ListingCard } from "../apps/web/src/app/discovery/listing-card.js";
import { OfferingPresentation } from "../apps/web/src/app/offerings/[slug]/offering-presentation.js";

import type {
  ListingCardResponse,
  OfferingPresentationResponse
} from "@commerce/contracts";

/**
 * Offering visuals (`US-DSC-F06-001` AC-4, `US-OFR-F05-001` AC-4 and AC-5,
 * UX-0003 §8.2).
 *
 * **Three Frozen acceptance criteria were half-satisfied for as long as the
 * surfaces existed.** Each says two things — present the supplied visual, and
 * do not invent media when it is absent — and only the second could ever be
 * true, because nothing could supply one. `offeringPresentationSchema` carried
 * `visuals: string[]` from the start and the repository filled it from a
 * literal `[]`; `listingCardSchema` had no field for a visual at all.
 *
 * A criterion that can only fail in one direction is not a criterion that
 * passes. These cases exercise both directions.
 */
describe("Increment I30 Offering visuals", () => {
  const card = (primaryVisualUrl: string | null): ListingCardResponse => ({
    businessName: "Test İşletme",
    categoryName: "Klasik",
    offeringId: "11111111-1111-4111-8111-111111111111",
    primaryVisualUrl,
    publishedAt: "2026-08-22T00:00:00.000Z",
    slug: "test-ilan",
    title: "Test İlanı"
  });

  const presentation = (
    visuals: string[],
    logoUrl: string | null = null
  ): OfferingPresentationResponse => ({
    attributes: [],
    business: { logoUrl, name: "Test İşletme", shortDescription: null },
    categoryPath: ["Araçlar", "Klasik"],
    description: null,
    offeringId: "11111111-1111-4111-8111-111111111111",
    publishedAt: "2026-08-22T00:00:00.000Z",
    slug: "test-ilan",
    title: "Test İlanı",
    visuals
  });

  describe("what may become an image", () => {
    it("accepts the two schemes an address can arrive over", () => {
      /*
       * `http:` as well as `https:`. Offering visuals are addresses from other
       * sites and silently dropping every plain-HTTP one would lose real
       * images; the cost is a mixed-content warning, which is visible, where
       * dropping them would not be.
       */
      expect(imageSource("https://example.test/a.jpg")).toBe(
        "https://example.test/a.jpg"
      );
      expect(imageSource("http://example.test/a.jpg")).toBe(
        "http://example.test/a.jpg"
      );
    });

    it("refuses anything that is not one, and says nothing instead", () => {
      /*
       * **`business.logoUrl` has never been validated and has now been rendered
       * for the first time**, which is what makes this check load-bearing
       * rather than tidy. `US-BUS-F02-001` Out of Scope §11 excludes technical
       * URL validation, so the guard is at render and what may be stored is
       * unchanged.
       *
       * `data:` is refused because an SVG is a document with scripting rather
       * than a picture. It is inert inside an `img` in current browsers — that
       * is a property of browsers, not of this application, and not one worth
       * relying on for a value a stranger supplied.
       */
      for (const refused of [
        "javascript:alert(1)",
        "data:image/svg+xml,<svg onload=alert(1)>",
        "//example.test/a.jpg",
        "file:///etc/passwd",
        "not a url",
        "  ",
        ""
      ])
        expect(imageSource(refused)).toBeNull();

      expect(imageSource(null)).toBeNull();
    });

    it("is not fooled by a prefix that looks right", () => {
      /*
       * The reason this parses rather than testing `startsWith("http")`.
       * `httpsx:` begins with `https` and is not a scheme this accepts; a
       * prefix test would have said yes.
       *
       * **The first version of this case asserted the wrong thing.** It
       * expected `https:/\evil.test/a.jpg` to be refused — but the URL parser
       * normalises the backslash and that *is* an `https` address for
       * `evil.test`, which this application accepts from any host by design.
       * The case was testing the author's unease rather than a property.
       */
      expect(imageSource("httpsx://example.test/a.jpg")).toBeNull();
      expect(imageSource("HTTPS://example.test/a.jpg")).toBe(
        "HTTPS://example.test/a.jpg"
      );
    });
  });

  describe("US-DSC-F06-001 AC-4, the Listing Card", () => {
    it("presents the supplied primary visual", () => {
      const markup = renderToStaticMarkup(
        createElement(ListingCard, {
          card: card("https://example.test/primary.jpg")
        })
      );
      expect(markup).toContain('src="https://example.test/primary.jpg"');
      // Decorative: the title beside it is the Offering's identity, and
      // UX-0003 §8.2 gives the visual no information of its own to describe.
      expect(markup).toContain('alt=""');
    });

    it("invents no media when none is supplied", () => {
      const markup = renderToStaticMarkup(
        createElement(ListingCard, { card: card(null) })
      );
      // No element at all, rather than a frame around nothing. A placeholder
      // is media the Offering did not supply.
      expect(markup).not.toContain("<img");
      // The rest of the minimum is untouched by the absence.
      expect(markup).toContain("Test İlanı");
      expect(markup).toContain("Test İşletme");
    });

    it("treats a refused address exactly like an absent one", () => {
      const markup = renderToStaticMarkup(
        createElement(ListingCard, { card: card("javascript:alert(1)") })
      );
      expect(markup).not.toContain("<img");
      expect(markup).not.toContain("javascript:");
    });
  });

  describe("UX-0003 §8.2, the Presentation", () => {
    it("shows the whole supplied set, in the order it arrived", () => {
      const markup = renderToStaticMarkup(
        createElement(OfferingPresentation, {
          offering: presentation([
            "https://example.test/1.jpg",
            "https://example.test/2.jpg"
          ])
        })
      );
      /*
       * "The person may inspect the available set" — the set, not the primary.
       * The order is asserted rather than the membership, because the order is
       * the owner's decision and the first entry is what the Listing Card
       * shows: if these two disagreed, one Offering would have two primary
       * visuals.
       */
      expect(markup.indexOf("1.jpg")).toBeLessThan(markup.indexOf("2.jpg"));
      expect(markup).toContain("offering-visuals");
    });

    it("renders no region at all when the set is empty", () => {
      const markup = renderToStaticMarkup(
        createElement(OfferingPresentation, { offering: presentation([]) })
      );
      expect(markup).not.toContain("offering-visuals");
      // "The experience remains complete through the other required Offering
      // information."
      expect(markup).toContain("Test İlanı");
      expect(markup).toContain("Araçlar");
    });

    it("renders no region when every supplied address is refused", () => {
      /*
       * Filtered before the emptiness test, not after. An Offering whose only
       * visual is a `data:` URL supplies nothing this application will show,
       * and a `figure` around zero images is a frame around nothing.
       */
      const markup = renderToStaticMarkup(
        createElement(OfferingPresentation, {
          offering: presentation(["data:image/svg+xml,<svg>"])
        })
      );
      expect(markup).not.toContain("offering-visuals");
      expect(markup).not.toContain("<img");
    });
  });

  describe("US-OFR-F05-001 AC-5, the public Business identity", () => {
    it("shows the supplied logo the platform has been storing all along", () => {
      /*
       * **The comment above this section said three fields and the code
       * rendered two.** `logoUrl` has been in the schema, the contract and the
       * composed public identity since I1, and no surface ever put it on a
       * screen — so a claim about what the section shows was false for as long
       * as the section existed.
       */
      const markup = renderToStaticMarkup(
        createElement(OfferingPresentation, {
          offering: presentation([], "https://example.test/logo.png")
        })
      );
      expect(markup).toContain('src="https://example.test/logo.png"');
      // The display name is the heading directly above, so naming the Business
      // again in `alt` would make a screen reader say it twice.
      expect(markup).toContain('alt=""');
    });

    it("omits it when the Business supplied none", () => {
      const markup = renderToStaticMarkup(
        createElement(OfferingPresentation, { offering: presentation([]) })
      );
      expect(markup).not.toContain("business-logo");
      expect(markup).toContain("Test İşletme");
    });
  });
});
