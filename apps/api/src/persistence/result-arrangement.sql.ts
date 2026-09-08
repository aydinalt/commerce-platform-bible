import { PRODUCT_GROUP_KEY } from "./offering-price.sql.js";

import type { ResultArrangement } from "@commerce/discovery";

/**
 * How the Owner's four tabs become an `order by` (I68).
 *
 * **Two of them are free and two are not**, and that is why the columns are
 * conditional rather than always selected. *Tümü* and *En yeni* are ordered by
 * facts already on the row — the price the query selected and the publication
 * instant the projection carries — while *Popüler* and *Yükselenler* count
 * events. Selecting those counts on every Browse and every Search so that two
 * tabs nobody pressed could be ready would put two correlated aggregates on
 * every list in the platform, permanently, to serve a minority of requests.
 *
 * The window is thirty days everywhere and it is the Owner's: *"bu ay"*. It is
 * written as an interval rather than as a calendar month on purpose — a
 * calendar month makes every list quietly wrong on the first of the month,
 * when a product's whole history is discarded at midnight and the tab shows
 * whatever happened to be opened overnight.
 */
const WINDOW = `interval '30 days'`;

/** Opens of any Offering in this product group, inside the window. */
const OPENS = `(
  select count(*)
  from offering_presentation_open e
  join offering eo on eo.id = e.offering_id
  where coalesce(eo.product_key, eo.id::text) = ${PRODUCT_GROUP_KEY}
    and e.opened_at >= now() - ${WINDOW}
)`;

/** Handoffs to a partner, over the same group and window. */
const HANDOFFS = `(
  select count(*)
  from affiliate_handoff h
  join offering ho on ho.id = h.offering_id
  where coalesce(ho.product_key, ho.id::text) = ${PRODUCT_GROUP_KEY}
    and h.initiated_at >= now() - ${WINDOW}
)`;

/** Reviews written about this product inside the window. */
const REVIEWS = `(
  select count(*)
  from product_review r
  where r.product_group_key = ${PRODUCT_GROUP_KEY}
    and r.written_at >= now() - ${WINDOW}
)`;

/**
 * The two ordering columns, computed only where a tab needs them.
 *
 * Everything counted here is counted **over the product group**, never over the
 * single Offering the card was drawn from — the same rule the score and the
 * heart follow (§5.12.1, and the Owner's *puanlama ürüne ait olacak*). Three
 * partners selling one phone are one product, so the attention it received is
 * one number rather than three that each understate it.
 *
 * `trendScore` is the Owner's own formula: the average of three signals over
 * one window. His prototype averages reviews, clicks and searches; the third
 * is replaced by the Affiliate Handoff, because the platform records how many
 * people went on to the partner and does not record how many searches a product
 * appeared in. The substitution is stated rather than hidden — it is a stronger
 * signal than the one it replaces, and the difference is the Owner's to accept.
 */
export function attentionColumns(arrangement: ResultArrangement): string {
  if (arrangement === "POPULAR")
    return `${OPENS}::int as "openCount", 0::numeric as "trendScore"`;
  if (arrangement === "RISING")
    return `0 as "openCount",
      ((${OPENS} + ${HANDOFFS} + ${REVIEWS})::numeric / 3) as "trendScore"`;
  // Neither tab is in force, so neither number is computed. The columns still
  // exist because the statement's shape must not depend on the arrangement:
  // one query with two constants is easier to reason about than two queries.
  return `0 as "openCount", 0::numeric as "trendScore"`;
}

/**
 * The keys a tab puts *in front of* the ordinary arrangement.
 *
 * Always a prefix, never a replacement. `LISTING_ORDER` still decides every tie
 * — out of stock last, then cheapest delivered first — so a tab whose own
 * signal cannot separate two products falls back to the arrangement the rest of
 * the platform uses instead of to whatever order the database happened to
 * produce. A newly listed product, which no tab's counters have anything to say
 * about, therefore appears where the price would put it rather than at the
 * bottom of a list of zeroes in an arbitrary order.
 *
 * `DEFAULT` contributes nothing at all, which is the point: *Tümü* is not a
 * fourth ordering, it is the absence of the other three.
 */
export function arrangementOrder(arrangement: ResultArrangement): string {
  if (arrangement === "NEWEST") return `"publishedAt" desc, `;
  if (arrangement === "POPULAR") return `"openCount" desc, `;
  if (arrangement === "RISING") return `"trendScore" desc, `;
  return "";
}

/**
 * The two ordering columns as they come back on a row.
 *
 * They are ordering inputs and not information about a product, so they are
 * removed before a card is composed: the Listing Card schema is `.strict()` and
 * would refuse them, which is the guard rather than the inconvenience. What a
 * person is shown is the arrangement itself — the tab — and not the numbers
 * that produced it, because publishing "opened 41 times" would put a popularity
 * claim on a card that no document has decided to make.
 */
export interface AttentionColumns {
  openCount: number;
  trendScore: string;
}

export function withoutAttention<T>(row: AttentionColumns & T): T {
  const { openCount: _openCount, trendScore: _trendScore, ...rest } = row;
  return rest as unknown as T;
}
