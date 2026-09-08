import type { ProductRating } from "@commerce/contracts";

/**
 * A product's score, as the Owner's prototype draws it (I62).
 *
 * **Stars and a number, not stars alone.** The glyphs are the thing a person
 * reads at a glance and the number is the thing they can compare; a row of
 * shapes without the figure beside it makes 4,4 and 4,6 look identical, which
 * is exactly the distinction somebody choosing between two listings is trying
 * to make.
 *
 * The stars are `aria-hidden` and the accessible name is the sentence beneath
 * them. Five characters read out as "star star star half-star empty-star" is
 * noise; "5 üzerinden 4,3 · 12 değerlendirme" is the fact.
 */
function glyphs(average: string): string {
  const value = Number(average);
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    "★".repeat(full) +
    (half ? "⯨" : "") +
    "☆".repeat(Math.max(0, 5 - full - (half ? 1 : 0)))
  );
}

/**
 * The Turkish decimal separator is a comma, and the score is the one number on
 * a card that is not money — `Intl` formats the amounts, so this formats this.
 */
function scoreText(average: string): string {
  return average.replace(".", ",");
}

export function ProductRatingSummary({ rating }: { rating: ProductRating }) {
  /*
   * A product nobody has scored says so, and says it as absence rather than as
   * zero: five empty stars beside a new listing would be a verdict the platform
   * invented on behalf of people who have not spoken.
   */
  if (rating.average === null || rating.count === 0)
    return (
      <span className="product-rating product-rating-none">
        Henüz değerlendirilmedi
      </span>
    );

  return (
    <span
      aria-label={`5 üzerinden ${scoreText(rating.average)}, ${rating.count} değerlendirme`}
      className="product-rating"
    >
      <span aria-hidden="true" className="product-rating-stars">
        {glyphs(rating.average)}
      </span>
      <strong aria-hidden="true">{scoreText(rating.average)}</strong>
      <span aria-hidden="true" className="product-rating-count">
        {rating.count} değerlendirme
      </span>
    </span>
  );
}
