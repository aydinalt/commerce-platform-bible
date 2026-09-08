import type {
  OfferingPrice,
  PricingKind,
  StockState
} from "@commerce/contracts";

/**
 * How every public read finds an Offering's price.
 *
 * **Five queries in four repositories compose a Listing Card or a Presentation,
 * and a price that differed depending on which one built it would be five
 * answers to one question.** The same reasoning that put `PRIMARY_VISUAL_SQL`
 * in its own module puts the price here: the rule is selected the same way
 * everywhere because it is written once.
 *
 * **Read from `offering`, not projected.** `offering_search_projection`
 * denormalises what Search matches on, and every denormalised field carries a
 * refresh obligation. A price is the field most likely to change and the one
 * whose staleness is least visible — a card showing yesterday's amount looks
 * exactly like a card showing today's. The join to `offering` is already in
 * every one of these queries, so the columns cost nothing extra to reach.
 *
 * Requires the `offering` table to be aliased `o`, which all five call sites
 * already do.
 */
export const OFFERING_PRICE_SQL = `o.pricing_kind::text as "pricingKind",
  o.amount, o.currency, o.amount_set_at as "amountSetAt",
  o.prior_amount as "priorAmount", o.delivery_cost as "deliveryCost",
  o.stock_state::text as "stockState"`;

/**
 * The price columns as the driver hands them back.
 *
 * `NUMERIC` arrives as a string and stays one all the way to the response,
 * which is the point: the exact decimal the column holds is never parsed into
 * a float that could round it. PRD-0001 v4.0 §5.10.5 makes the ordering of
 * these amounts the product, and an ordering computed from approximations is
 * an ordering that is sometimes wrong.
 */
export interface OfferingPriceColumns {
  amount: string | null;
  amountSetAt: Date | null;
  currency: string | null;
  deliveryCost: string | null;
  pricingKind: PricingKind;
  priorAmount: string | null;
  stockState: StockState;
}

/**
 * Seven columns become the one shape §5.10.1 names.
 *
 * The union is built here rather than in SQL because it is a fact about the
 * contract, and a `case` expression assembling JSON would be that fact written
 * a second time in a second language.
 *
 * The throw is unreachable — `offering_fixed_price_is_complete` refuses such a
 * row — and it is a throw rather than a fallback to `UNKNOWN` deliberately. A
 * fallback would tell a person the platform does not know a price at the exact
 * moment the platform's own invariant has broken, which is the worst time to
 * say something reassuring.
 */
export function composePrice(row: OfferingPriceColumns): OfferingPrice {
  if (row.pricingKind !== "FIXED")
    return { kind: row.pricingKind, stockState: row.stockState };
  if (row.amount === null || row.currency === null || row.amountSetAt === null)
    throw new Error("OFFERING_FIXED_PRICE_INCOMPLETE");
  return {
    amount: row.amount,
    amountSetAt: row.amountSetAt.toISOString(),
    currency: row.currency,
    deliveryCost: row.deliveryCost,
    kind: "FIXED",
    priorAmount: row.priorAmount,
    stockState: row.stockState
  };
}

/**
 * A row shape: the response, minus the two fields SQL cannot produce directly,
 * plus the columns it produces instead.
 */
export type PricedRow<T> = Omit<T, "publishedAt" | "pricing"> & {
  publishedAt: Date;
} & OfferingPriceColumns;

/**
 * One row becomes one response.
 *
 * The seven price columns are destructured away rather than spread through,
 * for the same reason `pg-offering-content` does it: a `pricingKind` sitting
 * beside the composed `pricing` is a second statement of the same fact, and
 * `.strict()` on the contract refuses it — which is the schema catching a
 * mistake that would otherwise reach a person as a duplicated field.
 */
export function withPrice<
  T extends { pricing: OfferingPrice; publishedAt: string }
>(row: PricedRow<T>): T {
  const {
    amount: _amount,
    amountSetAt: _amountSetAt,
    currency: _currency,
    deliveryCost: _deliveryCost,
    pricingKind: _pricingKind,
    priorAmount: _priorAmount,
    stockState: _stockState,
    publishedAt,
    ...rest
  } = row;
  return {
    ...rest,
    pricing: composePrice(row),
    publishedAt: publishedAt.toISOString()
  } as unknown as T;
}

/**
 * What makes several Offerings one product (§5.12.1).
 *
 * `coalesce(product_key, id)` rather than `product_key` alone: an Offering with
 * no key is the only seller of itself, and grouping every keyless row together
 * under `null` would collapse the unrelated half of the catalogue into one
 * card. The identifier is the fallback because it is the one value guaranteed
 * unique per row.
 */
export const PRODUCT_GROUP_KEY = `coalesce(o.product_key, o.id::text)`;

/**
 * What a person would actually pay to receive the thing (§5.10.5).
 *
 * **The amount alone is not the offer.** A partner charging 43.750 with free
 * delivery is cheaper than one charging 43.700 plus 150 for delivery, and a
 * comparison ordered on the amount would put the dearer one first — the exact
 * mistake a comparison site exists to spare a person making by hand.
 *
 * `coalesce(delivery_cost, 0)` is not a claim that an unstated delivery is
 * free. §5.10.5 separates `null` (not stated) from `0` (free), and this
 * expression keeps that separation where it can be kept: an unstated cost adds
 * nothing, so the row sorts at its amount, which is the *lowest* it could
 * possibly cost. Sorting it as though something were charged would invent a
 * figure; sorting it at the bottom would punish a partner for silence. The
 * surface then says "Teslimat ücreti belirtilmemiş" beside the price, so the
 * person can see for themselves which rows are complete.
 */
export const TOTAL_COST_SQL = `(o.amount + coalesce(o.delivery_cost, 0))`;

/**
 * Which Offering in a group the card is drawn from.
 *
 * The cheapest priced one *delivered*, by `TOTAL_COST_SQL`, and §5.10.5 is why
 * the expression is not simply `amount asc`: an Offering with no amount has no
 * position in a price ordering, so priced rows sort first among themselves and
 * unpriced ones follow. A group of only unpriced Offerings falls through to the
 * newest, which is Browse's own ordering rather than an invented one.
 *
 * The card and the Offering page's price list order by the same expression on
 * purpose. They answer one question in two places, and a card drawn from a
 * seller who is not first in the list beneath it would be the platform
 * disagreeing with itself in a single click.
 */
export const PRODUCT_GROUP_PICK = `${PRODUCT_GROUP_KEY},
  (o.pricing_kind = 'FIXED') desc, ${TOTAL_COST_SQL} asc nulls last,
  p.published_at desc, p.offering_id`;

/**
 * How many Offerings the card stands for, counted in the same query that drew
 * it.
 *
 * A window rather than a correlated subquery, so the count is taken over
 * exactly the rows the `where` admitted: a budget that sets one seller aside
 * also stops the card claiming it. Counting excluded sellers would put a number
 * on screen that the list beneath it contradicts.
 */
/**
 * How a list of products is arranged, once the grouping has picked one row per
 * product (I63).
 *
 * **Cheapest first, and out of stock last however cheap it is.** This is the
 * Owner's own rule and his prototype's own `sort` — *sıralama konusunu
 * prototipine uyduralım* — and it replaces publication recency, which PRD-0002
 * §12.3 fixed at a time when no Offering carried an amount at all. A comparison
 * platform whose default order is "most recently listed" is answering a
 * question nobody asked it.
 *
 * The keys, in order and each for its own reason:
 *
 * 1. **Out of stock sinks.** A price a person cannot buy at is not a better
 *    offer than one they can, and putting it first makes the top row the one
 *    row that cannot be acted on. `UNKNOWN` is not `OUT_OF_STOCK` — an unstated
 *    stock level is not a claim that there is none — so it stays with the
 *    buyable rows. The seller list inside a Presentation has ordered this way
 *    since I58; this is the same rule applied to the list of products.
 * 2. **Priced before unpriced.** An Offering with no amount has no position in
 *    a price ordering; sorting it to either end would state a comparison the
 *    platform cannot make, so it follows the rows that can be compared.
 * 3. **What a person would pay** (§5.10.5), not the sticker price: 43.700 plus
 *    150 delivery is dearer than 43.750 delivered free.
 * 4. **Then recency**, which is what §12.3 used to decide alone and is now the
 *    tie-break it is good at: two identical prices, newer first.
 * 5. **Then the identifier**, so the order is total and a page boundary cannot
 *    show one product twice.
 *
 * Written against the *outer* query's quoted output columns, because the
 * grouping's `distinct on` fixes its own sort order and this is the ordering
 * that replaces it.
 */
export const LISTING_ORDER = `("stockState" = 'OUT_OF_STOCK'),
  ("pricingKind" = 'FIXED') desc,
  (amount + coalesce("deliveryCost", 0)) asc nulls last,
  "publishedAt" desc, "offeringId"`;

export const SELLER_COUNT_SQL = `count(*) over (partition by ${PRODUCT_GROUP_KEY})::int as "sellerCount"`;

/**
 * The same count where there is no result set to count within — one Offering
 * read on its own, in Decision or as a Comparison member.
 *
 * Eligibility is the projection's existence, exactly as it is everywhere else,
 * so a retired sibling stops being a seller here at the same moment it stops
 * being one in Discovery.
 */
export const SELLER_COUNT_SCALAR = `(
  select greatest(1, count(*))::int
  from offering_search_projection sp
  join offering so on so.id = sp.offering_id
  where so.product_key is not null and so.product_key = o.product_key
) as "sellerCount"`;

/** The matching hint itself, published beside the count that derives from it. */
export const PRODUCT_KEY_SQL = `o.product_key as "productKey"`;

/**
 * Whether a card could send this person to the partner (`US-DSC-F06-001` v1.1
 * AC-9 and AC-10).
 *
 * The same two conditions the Decision handoff checks, asked one step earlier:
 * a destination exists and it is Eligible — Enabled by its owner *and* Valid by
 * review. Asking here rather than trusting the card is what keeps the button
 * off the rows it would fail on, and a control that fails is worse on a
 * comparison card than no control at all.
 *
 * `exists` rather than a join, because a card must not gain or lose rows over
 * a question about a button. The handoff itself still re-reads the destination
 * at the moment of the click: this answers "would it work", and only the click
 * may answer "where to".
 */
export const HANDOFF_AVAILABLE_SQL = `exists (
  select 1 from affiliate_destination ad
  where ad.offering_id = o.id and ad.handoff_eligibility = 'ELIGIBLE'
) as "handoffAvailable"`;
