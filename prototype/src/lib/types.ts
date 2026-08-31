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
 * How a price reached the platform.
 *
 * The three models the Owner's affiliate analysis separates, and the reason
 * they are on screen rather than only in a database column: **they are not
 * equally trustworthy and they do not go stale at the same rate.** A merchant
 * API answers in real time, a network datafeed is a file that refreshes on a
 * schedule, and a scraped price is a reading of a page that may have changed
 * layout since. A person deciding whether to trust a number deserves to know
 * which of the three produced it.
 *
 * This is also the Owner's chosen build order: feed first, merchant API
 * second, scraping last.
 */
export type OfferSource = "API" | "FEED" | "SCRAPE";

export const SOURCE_LABELS: Record<OfferSource, string> = {
  API: "Satıcı API'si",
  FEED: "Ağ beslemesi",
  SCRAPE: "Site okuması"
};

/** One person's review. New: the platform has no rating or review anywhere. */
export interface Review {
  id: string;
  author: string;
  /** 1–5 whole stars. */
  rating: number;
  /** ISO date. */
  date: string;
  title: string;
  body: string;
  /** Whether the platform saw a Handoff for this person on this Product. */
  verified: boolean;
  /** How many people marked it useful. */
  helpful: number;
}

/**
 * The editorial review: the part a search engine indexes and a person reads
 * when the specification table has not decided it for them.
 *
 * Kept separate from `description` because they answer different questions.
 * `description` says *what it is*, in one paragraph, above the fold. This says
 * *what it is like to own*, at length, and carries the dates that make it
 * checkable.
 */
export interface Editorial {
  /** The one-line judgement, which is what most people actually read. */
  verdict: string;
  /** 0–10, the editorial score — deliberately not the crowd's star average. */
  score: number;
  sections: { heading: string; body: string }[];
  pros: string[];
  cons: string[];
  /** A video placeholder: the prototype has no media pipeline. */
  video: { title: string; duration: string } | null;
  author: string;
  /** ISO date the review was first published. */
  publishedAt: string;
  /** ISO date it was last revised. A review with no revision date is a claim
   *  about the present that nobody has re-checked. */
  updatedAt: string;
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
  /** Which of the three intake models produced this row. */
  source: OfferSource;
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
  /**
   * Whether this Offering has a stated amount at all.
   *
   * **PRD-0001 v4.0 §5.10.1 on screen.** Insurance and commercial property are
   * the categories that forced the distinction: a policy is quoted after the
   * risk is described, and an asking price of "görüşmeye açık" is a real
   * answer rather than a missing one. Showing either as "fiyat bilinmiyor"
   * tells a person the platform failed when nothing failed.
   *
   * `UNKNOWN` — the platform has not read a price yet — is deliberately not
   * here: the prototype's catalogue is hand-written, so nothing in it is
   * waiting on a feed, and inventing that state would be inventing a failure.
   */
  pricingKind: "FIXED" | "ON_REQUEST";
  /** ISO date, drives the "En yeni" tab. */
  listedAt: string;
  /**
   * The year the product reached the market.
   *
   * **Not the same as `listedAt`, and the difference is the point.** A listing
   * added yesterday can be a 2022 model, and on a price comparison that is
   * exactly the case a person needs warning about: the cheapest row in a list
   * is very often the oldest one.
   */
  releaseYear: number;
  /** How many people have written about it. Epey shows this on the page. */
  reviewCount: number;
  /** The crowd's average, 0–5 with one decimal. Derived from `reviews`. */
  rating: number;
  specs: Spec[];
  offers: PriceOffer[];
  reviews: Review[];
  editorial: Editorial;
}

export interface Category {
  id: string;
  name: string;
  /**
   * Which intake model the Owner's analysis says this sector is reached by.
   *
   * On a category, not only on an offer, because it is a **procurement** fact:
   * it decides what has to be built before this part of the catalogue can be
   * filled at all. Games and hosting arrive as clean network feeds; general
   * e-commerce needs merchant APIs; the rest is a scraping problem with the
   * legal exposure the analysis describes.
   */
  intake: OfferSource;
  /** The commission band the analysis records for this sector. */
  commission: string;
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
  /**
   * The oldest release year a person will accept.
   *
   * **This slot used to be an instalment term**, and the Owner replaced it.
   * The instalment figure was a financial presentation — PRD-0001 §4 puts
   * payment, credit and commission out of scope — and it was computed as a
   * flat division, which is not what any instalment plan in Turkey actually
   * costs. A number that looks like a monthly payment and is not one is worse
   * than no number.
   *
   * Release year answers the question that was actually being asked: **is this
   * still current?** On a comparison site the second-cheapest listing is
   * routinely a three-year-old model, and nothing else on the page says so.
   */
  minYear: number;
  query: string;
}
