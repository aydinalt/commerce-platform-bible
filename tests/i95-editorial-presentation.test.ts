import { readFileSync } from "node:fs";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { EditorialSection } from "../apps/web/src/editorial/editorial-section.js";
import { EditorialReviewPresentation } from "../apps/web/src/editorial/review-presentation.js";
import { ProductRatingSummary } from "../apps/web/src/discovery/rating.js";

/**
 * Increment I95 — the editorial review as a reader meets it (`EDT F01`).
 *
 * `I93` built the behaviour and `I94` the writing surface and the presentation
 * component. What was missing was the last step: putting it on the page a
 * reader actually opens. This file is about the three ways that step goes
 * wrong.
 *
 * - **An outage claims the product has no review.** Most products genuinely
 *   have none, so the lie is invisible: the page looks exactly like the
 *   hundreds of correct ones beside it. `UX-0003` **Frozen v1.2** §8.9.2 exists
 *   for this one case.
 * - **The two scores merge**, or a third is derived from them. They are on one
 *   screen, one is `0–10` and the other `0–5`, and the merge does not have to be
 *   arithmetic to happen — a shared heading is enough.
 * - **An empty frame appears on every listing that has no review**, which is
 *   almost all of them, implying a missing thing rather than an absent one.
 */
describe("Increment I95 the editorial review on the Offering presentation", () => {
  const page = readFileSync(
    "apps/web/src/app/offerings/[slug]/page.tsx",
    "utf8"
  );
  const presentation = readFileSync(
    "apps/web/src/app/offerings/[slug]/offering-presentation.tsx",
    "utf8"
  );
  const section = readFileSync(
    "apps/web/src/editorial/editorial-section.tsx",
    "utf8"
  );
  const api = readFileSync("apps/web/src/editorial/api.ts", "utf8");

  /**
   * The source with its comments removed.
   *
   * **The same guard `i94` had to learn, applied from the start here.** Two
   * assertions in the first draft of this file failed on their own
   * explanations: `api.ts` documents its three answers with a table containing
   * `{ review: null }`, and the presentation's comment explains that "a blended
   * figure answers neither question". Both were caught by checks looking for
   * those very strings as behaviour. A prose mention is not a behaviour, and
   * every assertion about an absence reads stripped source for that reason.
   */
  const code = (source: string): string =>
    source.replace(/\/\*[\s\S]*?\*\//gu, "").replace(/\/\/.*$/gmu, "");

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

  const render = (
    editorial: Parameters<typeof EditorialSection>[0]["editorial"]
  ): string =>
    renderToStaticMarkup(createElement(EditorialSection, { editorial }));

  describe("absence, outage and no Product Key are three answers — AC-14, §8.9.2", () => {
    /**
     * The case the whole separation exists for. A failed read must not be
     * allowed to say "this product has no editorial review", because that
     * sentence is true of most products and would be believed.
     */
    it("says the reading failed rather than claiming there is no review", () => {
      const markup = render(null);
      expect(markup).toContain("okunamadı");
      expect(markup).toContain('role="alert"');
    });

    /**
     * AC-14. An Offering with no reviewed Product Key is presented exactly as
     * it is today — no heading, no frame, no placeholder. Most products have no
     * review, so a placeholder would appear on almost every listing.
     */
    it("presents nothing at all where the product has no review", () => {
      expect(render({ review: null })).toBe("");
    });

    /**
     * §8.9.2's second case. A listing with no Product Key has nothing to fail
     * to read, so it must not reach the outage branch — which it would if the
     * page asked anyway and the request failed.
     */
    it("presents nothing at all where the listing carries no Product Key", () => {
      expect(render(undefined)).toBe("");
    });

    it("does not ask about a listing that carries no Product Key", () => {
      expect(page).toContain("offering.productKey === null");
      expect(page).toContain("? undefined");
    });

    /** The read answers `null` on failure and never an empty wrapper. */
    it("never turns a failed read into an absent review", () => {
      expect(api).toContain("if (!response.ok) return null;");
      expect(api).toContain("} catch {");
      expect(code(api)).not.toContain("review: null }");
    });

    /**
     * A review that cannot be read must not take the listing down with it. The
     * read is separate from the Presentation read for exactly this reason, and
     * the page must not have made it a condition of rendering.
     */
    it("does not let the review's outage become the listing's", () => {
      expect(page).not.toMatch(
        /editorial[^)]*\)\s*(notFound|return <Presentation)/u
      );
      expect(section).toContain("editorial === null");
    });
  });

  describe("the two scores stay two — AC-5, AC-6, §8.9.1", () => {
    /**
     * Both scales are spelled out in words, in the same phrasing, so that the
     * denominators are the first thing a reader meets rather than something
     * they have to work out from `8,4 / 10` beside four and a half stars.
     */
    it("states each scale in words, and they are different scales", () => {
      const editorial = renderToStaticMarkup(
        createElement(EditorialReviewPresentation, { review })
      );
      const crowd = renderToStaticMarkup(
        createElement(ProductRatingSummary, {
          rating: { average: "4.3", count: 12 }
        })
      );
      expect(editorial).toContain("10 üzerinden");
      expect(crowd).toContain("5 üzerinden");
      expect(editorial).not.toContain("5 üzerinden");
      expect(crowd).not.toContain("10 üzerinden");
    });

    it("expresses the editorial score with one decimal", () => {
      const markup = renderToStaticMarkup(
        createElement(EditorialReviewPresentation, {
          review: { ...review, score: 8 }
        })
      );
      expect(markup).toContain("8,0");
    });

    /**
     * AC-6. No third number is derived from the two. The prohibition is not
     * only against an average: any arithmetic that took both would produce a
     * figure answering neither question.
     */
    it("derives no third number from the two", () => {
      const both = code(presentation) + code(section);
      expect(both).not.toMatch(
        /rating[^\n]*\+[^\n]*score|score[^\n]*\+[^\n]*rating/u
      );
      expect(both).not.toMatch(/\/\s*2\b/u);
      expect(both).not.toMatch(
        /average\(|combinedScore|overallScore|blended/iu
      );
    });

    /**
     * §8.9.1: the two are presented as distinguishable regions, "so that a
     * reader who reads only one of them knows which one they read". A shared
     * heading is the merge that needs no arithmetic.
     */
    it("gives each its own heading rather than one region", () => {
      expect(render({ review })).toContain("Editör incelemesi");
      expect(
        readFileSync(
          "apps/web/src/app/offerings/[slug]/reviews-section.tsx",
          "utf8"
        )
      ).toContain('id="reviews">Yorumlar');
      expect(presentation).toContain("<EditorialSection");
      expect(presentation).toContain("<ReviewsSection");
    });
  });

  describe("what the review presents — AC-3, AC-4, AC-10", () => {
    const markup = (): string =>
      renderToStaticMarkup(
        createElement(EditorialReviewPresentation, { review })
      );

    it("carries the verdict, the sections, the pros, the cons and the author", () => {
      const rendered = markup();
      for (const part of [
        "İyi bir cihaz",
        "Başlık",
        "gövde",
        "sessiz",
        "pahalı",
        "Editör ekibi"
      ])
        expect(rendered, `${part} is missing`).toContain(part);
    });

    /**
     * AC-4. Two dates, and neither presented in place of the other. A review's
     * prose ages faster than the prices around it, so "written in March" and
     * "written in March, checked in June" are different claims.
     */
    it("presents both dates as separate values", () => {
      const rendered = markup();
      expect(rendered).toContain("2026");
      expect(rendered.match(/<time/gu)).toHaveLength(2);
    });

    it("says a review has never been re-checked rather than repeating the first date", () => {
      const rendered = renderToStaticMarkup(
        createElement(EditorialReviewPresentation, {
          review: { ...review, lastCheckedAt: null }
        })
      );
      expect(rendered).toContain("Hiç");
      expect(rendered.match(/<time/gu)).toHaveLength(1);
    });
  });

  describe("the line against commerce — AC-11, AC-12", () => {
    /**
     * AC-11. Advertising is permitted in three named regions and this is not
     * one of them. The complementary block is advertising and must stay outside
     * the editorial section rather than merely beside it.
     */
    it("places no advertising inside the review", () => {
      expect(section).not.toContain("ComplementaryBlock");
      expect(section).not.toMatch(/Reklam|advert/iu);
      const editorialAt = presentation.indexOf("<EditorialSection");
      const adAt = presentation.indexOf("<ComplementaryBlock");
      expect(editorialAt).toBeGreaterThan(-1);
      expect(adAt).toBeGreaterThan(-1);
      expect(adAt).not.toBe(editorialAt);
    });

    /**
     * AC-12, at the surface. There is no field for a commercial relationship in
     * the shape this component receives, so there is nothing for the screen to
     * present even if one were invented upstream.
     */
    it("has nowhere to present a commercial relationship", () => {
      const component = readFileSync(
        "apps/web/src/editorial/review-presentation.tsx",
        "utf8"
      );
      expect(component).not.toMatch(
        /sponsored|sponsor|commission|partnerId|promoted/iu
      );
    });
  });

  describe("the same review, on every Offering carrying the key — AC-7, AC-8, AC-9", () => {
    /**
     * Keyed by Product Key rather than by Offering, which is what makes one
     * review answer for every seller of the product unduplicated, and what
     * keeps it answering after the seller a reader arrived through has gone.
     */
    it("asks by Product Key and not by listing", () => {
      expect(api).toContain("/editorial-review");
      expect(api).toContain("products/${encodeURIComponent(productKey)}");
      expect(api).not.toContain("/offerings/");
      expect(page).toContain("readEditorialReview(offering.productKey)");
      expect(page).not.toMatch(/readEditorialReview\(slug\)/u);
    });
  });

  describe("the listing is unchanged where nothing is added", () => {
    /**
     * The existing Presentation read is untouched: the editorial review is
     * fetched beside it, never folded into it, so a listing renders exactly as
     * it did whatever the editorial read answers.
     */
    it("leaves the Presentation read alone", () => {
      expect(page).toContain("fetchOfferingPresentation(slug)");
      expect(page).toContain("readProductReviews({");
      expect(api).not.toContain("offeringPresentationSchema");
    });

    it("adds one section and removes none", () => {
      for (const existing of [
        "<ReviewsSection",
        "<DecisionEntries",
        "<ComplementaryBlock",
        "<ReportForm",
        "<ProductRatingSummary"
      ])
        expect(presentation, `${existing} was lost`).toContain(existing);
    });
  });
});
