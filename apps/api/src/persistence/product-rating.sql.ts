import type { ProductRating } from "@commerce/contracts";

import { PRODUCT_GROUP_KEY } from "./offering-price.sql.js";

/**
 * How every public read finds a product's score (I62).
 *
 * The same reasoning that gave the price its own module gives the rating one:
 * four queries in three repositories compose a Listing Card, a Search Result or
 * a Presentation, and a score that differed depending on which one built it
 * would be four answers to one question.
 *
 * **Grouped on the product, never on the Offering.** `PRODUCT_GROUP_KEY` is
 * §5.12's own definition of a product — the Offerings sharing a `product_key`,
 * and the Offering itself where nobody has matched it — and it is the
 * expression `product_review.product_group_key` was written against. Five
 * partners selling one phone therefore show one score, which is the Owner's
 * rule stated in SQL: *puanlama ürüne ait olacak, satıcıya değil*.
 *
 * A correlated subquery rather than a join, for the reason the seller count is
 * a window function rather than a second pass: the grouping query already
 * carries `distinct on (product_group_key)`, and a join to an aggregate would
 * multiply the rows the `distinct on` exists to reduce. The partial index
 * `product_review_product_group_key_idx` is what makes the subquery a lookup
 * rather than a scan.
 *
 * Requires the `offering` table aliased `o`, like every other expression here.
 */
export const PRODUCT_RATING_SQL = `(
  select round(avg(r.rating)::numeric, 1)::text
  from product_review r where r.product_group_key = ${PRODUCT_GROUP_KEY}
) as "ratingAverage",
(
  select count(*)::int
  from product_review r where r.product_group_key = ${PRODUCT_GROUP_KEY}
) as "ratingCount"`;

/**
 * The rating columns as the driver hands them back.
 *
 * `numeric` arrives as a string and stays one, for the reason every amount in
 * this repository does: `4.3` has no exact binary representation, and a score
 * that renders as `4.2999999` somewhere downstream is a fact the platform
 * failed to state. The cast to `text` in SQL makes that explicit rather than
 * relying on the driver's default for `numeric`.
 */
export interface ProductRatingColumns {
  ratingAverage: string | null;
  ratingCount: number;
}

export type RatedRow<T> = Omit<T, "rating"> & ProductRatingColumns;

/**
 * Two columns become the one shape the contract names.
 *
 * `count: 0` with `average: null` is the ordinary state of a product nobody has
 * scored yet, and it is deliberately not `0`: a product with no reviews is not
 * a product everybody rated badly, and a surface that cannot tell those apart
 * would libel every new listing.
 */
export function withRating<T extends { rating: ProductRating }>(
  row: RatedRow<T>
): T {
  const { ratingAverage, ratingCount, ...rest } = row;
  return {
    ...rest,
    rating: { average: ratingAverage, count: ratingCount }
  } as unknown as T;
}

/**
 * The floor a Rating Constraint puts under a result set (I62).
 *
 * **A product with no reviews fails every constraint**, which is why this is
 * written as a bare comparison rather than with a `coalesce(..., 0)` that would
 * make the intent implicit. Somebody asking for four stars and up is asking
 * about products people have scored; admitting an unscored one would answer
 * their question with a product that cannot answer it.
 *
 * Returns SQL and its parameters rather than an interpolated number, on the
 * same terms as `pricePredicate`: the value comes from a request.
 */
export function ratingPredicate(
  minimum: number | null,
  firstParameter: number
): { parameters: number[]; sql: string } {
  if (minimum === null) return { parameters: [], sql: "" };
  return {
    parameters: [minimum],
    sql: ` and (
      select avg(r.rating) from product_review r
      where r.product_group_key = ${PRODUCT_GROUP_KEY}
    ) >= $${firstParameter}`
  };
}

/**
 * The predicate behind "only what is in stock" (I64).
 *
 * `= 'IN_STOCK'` rather than `<> 'OUT_OF_STOCK'`, and the difference is the
 * whole criterion: PRD-0002 §10.4 says an Offering with no value for an applied
 * criterion does not satisfy it, and `UNKNOWN` is exactly that — no value. A
 * person who ticked this box asked for things a seller has *stated* are
 * available.
 *
 * The ordering treats `UNKNOWN` the other way and both are right. An
 * arrangement should not punish silence, because absence of a claim is not a
 * claim of absence; a filter for a stated fact requires the statement, or it is
 * not a filter.
 *
 * No parameter: the value is a boolean the caller already branched on, so there
 * is nothing to bind.
 */
export function stockPredicate(inStockOnly: boolean): string {
  return inStockOnly ? ` and o.stock_state = 'IN_STOCK'` : "";
}
