import type { FilterState, PriceOffer, Product } from "./types";

/**
 * Every rule the results list obeys, in one file and with no React in it.
 *
 * Kept out of the components deliberately: a filter written inside the
 * component that renders it is a rule nobody can test and nobody can find. This
 * module is pure, so it is the part of the prototype that could survive into
 * the real application unchanged.
 */

/** Turkish-aware lowercase, so `İSTANBUL` matches `istanbul`. */
const fold = (value: string): string =>
  value.toLocaleLowerCase("tr").replaceAll("ı", "i").trim();

export function matchesQuery(product: Product, query: string): boolean {
  const q = fold(query);
  if (q === "") return true;
  return (
    fold(product.name).includes(q) ||
    fold(product.brand).includes(q) ||
    product.specs.some((spec) =>
      spec.chips.some((chip) => fold(chip).includes(q))
    )
  );
}

/**
 * The monthly instalment a person would pay.
 *
 * **Deliberately not compounded.** A prototype that shows an interest-bearing
 * figure is making a financial claim, and this one has no rate to make it from.
 * It is the price divided by the term, and the label on screen says so.
 */
export function monthlyInstalment(price: number, months: number): number {
  return Math.round(price / Math.max(months, 1));
}

/** The comparator behind each of the four tabs. */
const ORDER: Record<FilterState["tab"], (a: Product, b: Product) => number> = {
  all: (a, b) => a.lowestPrice - b.lowestPrice,
  latest: (a, b) => b.listedAt.localeCompare(a.listedAt),
  hottest: (a, b) => b.heat - a.heat,
  popular: (a, b) => b.popularity - a.popularity
};

export function applyFilters(
  products: Product[],
  state: FilterState
): Product[] {
  return products
    .filter((product) => {
      if (state.categoryId !== "all" && product.categoryId !== state.categoryId)
        return false;
      if (product.lowestPrice > state.amount) return false;
      return matchesQuery(product, state.query);
    })
    .sort(ORDER[state.tab]);
}

/**
 * The alternatives rule, stated rather than tuned until it looked right.
 *
 * An alternative is a **different** Product whose cheapest price sits within a
 * band around the anchor's, ordered by how close it is. The band is a
 * percentage rather than a fixed number of lira, because ±2.000 TL is a
 * different suggestion at 8.000 than at 80.000.
 *
 * **The band widens rather than the list being padded.** If the tight band
 * yields fewer than `minimum`, it is retried once at the wide band — and if
 * that still yields nothing, the caller gets an empty list and the screen says
 * so. Filling the space with unrelated Products is how a comparison site
 * teaches people to ignore the section.
 */
export const TIGHT_BAND = 0.15;
export const WIDE_BAND = 0.35;

export function alternativesFor(
  anchor: Product,
  products: Product[],
  { limit = 4, minimum = 3 }: { limit?: number; minimum?: number } = {}
): { items: Product[]; band: number } {
  const within = (band: number): Product[] =>
    products
      .filter(
        (product) =>
          product.id !== anchor.id &&
          Math.abs(product.lowestPrice - anchor.lowestPrice) <=
            anchor.lowestPrice * band
      )
      .sort(
        (a, b) =>
          Math.abs(a.lowestPrice - anchor.lowestPrice) -
          Math.abs(b.lowestPrice - anchor.lowestPrice)
      );

  const tight = within(TIGHT_BAND);
  if (tight.length >= minimum)
    return { items: tight.slice(0, limit), band: TIGHT_BAND };

  const wide = within(WIDE_BAND);

  /*
   * **The widening is only reported when it actually found something**, and the
   * first version got this wrong. Measured on the real data: the anchor at
   * 42.990 ₺ has two neighbours inside ±15%, falls short of the minimum, widens
   * to ±35% — and finds the same two. The screen then said "aralık
   * genişletildi" beside a list that had not changed, which is a checkbox
   * telling the person about machinery instead of about products.
   *
   * A band the caller is told about has to be a band that made a difference.
   */
  if (wide.length === tight.length)
    return { items: tight.slice(0, limit), band: TIGHT_BAND };

  return { items: wide.slice(0, limit), band: WIDE_BAND };
}

/** Offers cheapest first, and out-of-stock last however cheap it is. */
export function sortedOffers(product: Product) {
  return [...product.offers].sort((a, b) => {
    const stocked = (offer: PriceOffer): boolean => offer.stock !== null;
    if (stocked(a) !== stocked(b)) return stocked(a) ? -1 : 1;
    return a.price + a.shipping - (b.price + b.shipping);
  });
}
