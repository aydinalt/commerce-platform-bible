import { ProductRatingSummary } from "../../../discovery/rating";

import { ReviewForm } from "./review-form";

import type { ProductReviewsResponse } from "@commerce/contracts";

/**
 * What people said about this product (I62's surface).
 *
 * The API has answered this since I62 and no page asked it. The stars were on
 * every card and every product page; the sentences behind them were not
 * anywhere, which is the half of a review that tells somebody *why*.
 *
 * **The reviews are the product's, not the seller's.** They are keyed on the
 * product group, so three partners selling one phone show one set of reviews
 * and one score — the Owner's rule: *puanlama ürüne ait olacak, satıcıya
 * değil*.
 *
 * `null` is an outage and renders a sentence rather than an empty section: "no
 * reviews yet" is a claim about the product, and making it while the API is
 * down would be telling every visitor something untrue.
 */
export function ReviewsSection({
  reviews,
  slug
}: {
  reviews: ProductReviewsResponse | null;
  slug: string;
}) {
  if (reviews === null)
    return (
      <section aria-labelledby="reviews">
        <h2 id="reviews">Yorumlar</h2>
        <p role="alert">Yorumlar şu anda okunamadı.</p>
      </section>
    );

  const mine = reviews.reviews.find((review) => review.mine);

  return (
    <section aria-labelledby="reviews">
      <h2 id="reviews">Yorumlar</h2>

      <p className="reviews-summary">
        <ProductRatingSummary rating={reviews.rating} />
        {/* What the page is not showing, said rather than implied: the list is
            the most recent, and a person who reads twenty of two hundred is
            entitled to know which twenty. */}
        {reviews.total > reviews.reviews.length ? (
          <span className="reviews-total">
            {reviews.total} yorumun en yenileri gösteriliyor
          </span>
        ) : null}
      </p>

      {reviews.reviews.length === 0 ? (
        <p>Bu ürüne henüz yorum yapılmamış.</p>
      ) : (
        <ul className="reviews">
          {reviews.reviews.map((review) => (
            <li className="review" key={review.reviewId}>
              <p className="review-head">
                {/* The byline is a masking rule the API applies: "Aylin K.",
                    never a full surname. An account with no name at all is
                    published as an anonymous review rather than as an invented
                    byline. */}
                <span className="review-author">
                  {review.author ?? "Bir alıcı"}
                </span>
                <span aria-hidden="true">·</span>
                <span className="review-score">{review.rating}/5</span>
                {review.mine ? (
                  <span className="review-mine">Sizin yorumunuz</span>
                ) : null}
              </p>
              {review.body === null ? null : <p>{review.body}</p>}
            </li>
          ))}
        </ul>
      )}

      {/*
        `writable` is the API's answer about this request rather than this
        page's guess: a form offered to somebody who will be refused on submit
        is a worse answer than no form.
      */}
      {reviews.writable ? (
        <ReviewForm
          slug={slug}
          {...(mine === undefined
            ? {}
            : { mine: { body: mine.body, rating: mine.rating } })}
        />
      ) : (
        <p className="reviews-guest">Yorum yazmak için giriş yapın.</p>
      )}
    </section>
  );
}
