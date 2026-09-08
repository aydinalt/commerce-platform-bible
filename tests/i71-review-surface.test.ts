import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ReviewsSection } from "../apps/web/src/app/offerings/[slug]/reviews-section.js";

import type { ProductReviewsResponse } from "@commerce/contracts";

/**
 * `I71` — the reviews, on the page.
 *
 * **I62 built the whole of this and stopped one step short.** The API answered
 * `GET /offerings/{slug}/reviews`, the score reached every Listing Card and
 * every product page, and the sentences behind the stars were nowhere: a person
 * could see that a phone scored 4.3 and could not read one word about why, and
 * nobody could write one. A score with no reviews under it is a number the
 * platform is asking to be trusted about.
 *
 * The cases below are the ones where a review surface looks right and is not:
 *
 * - an outage rendered as "no reviews yet", which tells every visitor something
 *   untrue about a real product;
 * - a write form offered to somebody the API will refuse, which is a worse
 *   answer than no form;
 * - an empty form offered to somebody who has already written one, which reads
 *   as a chance to vote twice when it is a chance to overwrite.
 */
describe("Increment I71 the review surface", () => {
  const reviews = (
    over: Partial<ProductReviewsResponse> = {}
  ): ProductReviewsResponse => ({
    rating: { average: "4.5", count: 2 },
    reviews: [
      {
        author: "Aylin K.",
        body: "İki haftadır kullanıyorum, pili gerçekten iddia edildiği gibi.",
        mine: false,
        rating: 5,
        reviewId: "11111111-1111-4111-8111-111111111111",
        writtenAt: "2026-09-01T10:00:00.000Z"
      },
      {
        author: null,
        body: null,
        mine: false,
        rating: 4,
        reviewId: "22222222-2222-4222-8222-222222222222",
        writtenAt: "2026-08-30T10:00:00.000Z"
      }
    ],
    total: 2,
    writable: false,
    ...over
  });

  const render = (value: ProductReviewsResponse | null) =>
    renderToStaticMarkup(
      createElement(ReviewsSection, { reviews: value, slug: "bir-ilan" })
    );

  it("shows what people wrote, and the byline the API masked", () => {
    const markup = render(reviews());
    expect(markup).toContain("pili gerçekten iddia edildiği gibi");
    // "Aylin K." and never "Aylin Kaya": the masking is the API's rule and this
    // surface prints what it was given rather than looking for more.
    expect(markup).toContain("Aylin K.");
  });

  it("prints a score with no words as a score", () => {
    /*
     * A rating without a sentence is a complete review — `body` is nullable for
     * exactly that reason — and an anonymous one is honest where an invented
     * byline would not be. Both are in the second fixture row.
     */
    const markup = render(reviews());
    expect(markup).toContain("4/5");
    expect(markup).toContain("Bir alıcı");
  });

  it("says an outage is an outage rather than an absence", () => {
    /*
     * The case that matters most and is easiest to get wrong. `null` means the
     * reviews could not be read; rendering the empty state for it would tell
     * every visitor that nobody has reviewed a product that may have two
     * hundred reviews.
     */
    const markup = render(null);
    expect(markup).toContain("okunamadı");
    expect(markup).not.toContain("henüz yorum yapılmamış");
  });

  it("distinguishes an empty product from an unreadable one", () => {
    const markup = render(
      reviews({ rating: { average: null, count: 0 }, reviews: [], total: 0 })
    );
    expect(markup).toContain("henüz yorum yapılmamış");
    expect(markup).not.toContain("okunamadı");
  });

  it("offers the form only where the API said this caller may write", () => {
    // `writable` is an answer about *this request*. A form shown to a Guest
    // would collect a review and then refuse it, which is a worse answer than
    // not offering one.
    expect(render(reviews({ writable: false }))).toContain("giriş yapın");
    expect(render(reviews({ writable: true }))).toContain("Puanınız");
  });

  it("offers somebody their own review back rather than an empty box", () => {
    const mine = reviews({ writable: true });
    const first = mine.reviews[0];
    if (first === undefined) throw new Error("NO_FIXTURE_REVIEW");
    const markup = render({
      ...mine,
      reviews: [{ ...first, mine: true }, ...mine.reviews.slice(1)]
    });

    /*
     * One person, one review: a repeat submission replaces the previous one,
     * which is what keeps the average an average of *people*. So the form says
     * "change" and holds what they wrote, rather than looking like a second
     * vote.
     */
    expect(markup).toContain("Puanınızı değiştirin");
    expect(markup).toContain("Yorumu güncelle");
    expect(markup).toContain("pili gerçekten iddia edildiği gibi");
    expect(markup).toContain("Sizin yorumunuz");
  });

  it("says what it is not showing when it is not showing all of them", () => {
    // A person who reads twenty of two hundred is entitled to know which
    // twenty. The API sends the whole count beside the page for this.
    const markup = render(reviews({ total: 214 }));
    expect(markup).toContain("214");
  });
});
