/**
 * The prototype's domain, which is **not** the platform's domain.
 *
 * `packages/contracts` has no price field anywhere and no concept of a Product
 * that several Businesses sell. An Offering belongs to exactly one Business.
 * Everything below — `Product`, `PriceOffer`, `Merchant`, the discount, the
 * stock count, the review count — is invented for this prototype so the
 * ReDeal / Finview / Epey / Akakçe hybrid can be seen and judged.
 *
 * If this direction is approved, these types are the shape the contracts would
 * have to grow. They are written as if they were real so that reading them is
 * the same as reading the proposal.
 */

/** A shop that sells a Product. New: the platform has no seller-of-a-product. */
export interface Merchant {
  id: string;
  name: string;
  /** 0–5, one decimal. New: the platform has no rating anywhere. */
  rating: number;
  /** Akakçe puts this beside the shop name and it changes who you trust. */
  authorised: boolean;
}

/**
 * One shop's price for one Product.
 *
 * Modelled on an Akakçe row, which carries more than a number: the shop's own
 * title for the item, how many are left, when it ships, and when the price was
 * last read.
 */
export interface PriceOffer {
  merchant: Merchant;
  /** In whole lira. The platform stores no price at all today. */
  price: number;
  shipping: number;
  /** `null` when out of stock; a number when the shop states one. */
  stock: number | null;
  /** "Yarın kargoda", "Aynı gün kargo" — the shop's own words. */
  dispatch: string;
  /** The shop's own title for the item, which differs from the Product's. */
  listingTitle: string;
  /** A campaign line the shop is running, or `null`. */
  promotion: string | null;
  /** When this price was last read, as an ISO date-time. */
  seenAt: string;
}

/**
 * One row of the Epey-style specification table.
 *
 * `chips` rather than a single string, because Epey's most useful rows carry
 * several values — sensors, colours, camera features — and flattening them into
 * one comma-separated string loses the thing that makes them filterable.
 */
export interface Spec {
  /** The table this row belongs under — "EKRAN", "BATARYA", … */
  group: string;
  label: string;
  /** One or more values. A single-value row is a one-element array. */
  chips: string[];
  /** Marked when this is a value a buyer compares on. Drives the summary. */
  key?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categoryId: string;
  /**
   * The prose a person reads before the table. ReDeal shows an excerpt of it on
   * the listing row and the whole of it on the page.
   */
  description: string;
  /** Placeholder visuals as colour pairs — the platform has no images. */
  gallery: [string, string][];
  /** The cheapest offer, denormalised so a list does not have to reduce. */
  lowestPrice: number;
  /** The list price the discount is measured against, or `null`. */
  listPrice: number | null;
  /** How many shops sell it — the number Akakçe puts on the card. */
  offerCount: number;
  /** 0–100, drives the "Popüler" tab. */
  popularity: number;
  /** 0–100, drives the "Yükselenler" tab — movement, not raw volume. */
  heat: number;
  /** ISO date, drives the "En yeni" tab. */
  listedAt: string;
  /** How many people have written about it. Epey shows this on the page. */
  reviewCount: number;
  specs: Spec[];
  offers: PriceOffer[];
}

export interface Category {
  id: string;
  name: string;
}

/** The four quick filters, in the order the tabs are drawn. */
export const TABS = [
  { id: "latest", label: "En yeni" },
  { id: "all", label: "Tümü" },
  { id: "hottest", label: "Yükselenler" },
  { id: "popular", label: "Popüler" }
] as const;

export type TabId = (typeof TABS)[number]["id"];

/** Everything the results list depends on, in one object. */
export interface FilterState {
  tab: TabId;
  categoryId: string;
  /** The budget ceiling, in lira. */
  amount: number;
  /** The instalment plan, in months. */
  months: number;
  query: string;
}
