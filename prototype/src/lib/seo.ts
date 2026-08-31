import { CATEGORIES, PRODUCTS, categoryById } from "./products";
import type { Category, Product } from "./types";

/**
 * Everything a search engine reads, in one module.
 *
 * **The reason this file exists is Single Information Owner.** The site's own
 * address was written into `ProductDetail` so the share menu could build a
 * link, and a second copy would have appeared in every canonical tag, every
 * Open Graph tag, the sitemap and every JSON-LD node — six places that must
 * agree and no way to notice when they stop. It is named once here.
 *
 * **A price comparison site lives or dies on this.** The whole proposition is
 * that a person arrives from a search for a product name and finds every price
 * on one page. If the page does not tell the search engine that it is a
 * product, what it costs, how many shops sell it and what people rated it,
 * the site competes for that search with a plain blue link against
 * competitors showing stars and a price range.
 */

/**
 * The site's own address.
 *
 * `.example` until the domain is chosen — a reserved name that can never
 * resolve, which is deliberate: a placeholder that looks real is a placeholder
 * that ships. **This is the one line to change**, and the environment variable
 * is there so staging and production do not need a code change to differ.
 *
 * **`typeof process` is guarded, and the guard was earned.** Next inlines
 * `NEXT_PUBLIC_*` at build time, so a bare `process.env` reads correctly
 * there — but this module is also bundled by esbuild for the single-file
 * preview, where `process` does not exist. The bare form threw on module load
 * and took the entire preview down: every driver failed at once, including
 * checks for the share menu and the year stepper that this change never
 * touched. A module read by two bundlers cannot assume either one's globals.
 */
const configured =
  typeof process === "undefined"
    ? undefined
    : process.env.NEXT_PUBLIC_SITE_URL;

export const SITE_ORIGIN = configured ?? "https://ilanlar.example";

export const SITE_NAME = "İlanlar";

export const SITE_DESCRIPTION =
  "Yazılımdan sigortaya, elektronikten seyahate; ürünleri fiyat, çıkış yılı " +
  "ve teknik özelliklerine göre karşılaştırın. Her ilanda tüm satıcıların " +
  "fiyatı yan yana.";

/** The one place a path becomes a full address. */
export const absoluteUrl = (path: string): string =>
  new URL(path, SITE_ORIGIN).toString();

export const productPath = (product: Product): string =>
  `/urun/${product.slug}`;

export const categoryPath = (category: Category | string): string =>
  `/kategori/${typeof category === "string" ? category : category.id}`;

/**
 * A meta description, cut to length on a word boundary.
 *
 * Google truncates around 155–160 characters and cuts mid-word when it does.
 * Cutting it here means the sentence ends where we chose rather than where the
 * pixel ran out.
 */
export function clamp(text: string, limit = 155): string {
  const flat = text.replace(/\s+/gu, " ").trim();
  if (flat.length <= limit) return flat;
  const cut = flat.slice(0, limit - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:]$/u, "")}…`;
}

/* ------------------------------------------------------------------ JSON-LD */

/**
 * The node types are `Record<string, unknown>` rather than a hand-written
 * interface per schema. Schema.org is an open vocabulary with hundreds of
 * optional properties; typing a subset would make the type a second, weaker
 * specification of the same thing — and the check that matters is not "does it
 * compile" but "does it say something true", which is what `preview/seo.mjs`
 * asserts against the catalogue.
 */
export type JsonLdNode = Record<string, unknown>;

/** ISO 8601 allows a bare year, and a bare year is all the catalogue holds. */
const releaseDate = (year: number): string => String(year);

/**
 * Schema.org availability, from the shop's stated stock.
 *
 * `null` stock is out of stock — the same reading `sortedOffers` uses when it
 * pushes those rows down. Two different readings of one field is how a page
 * ends up saying "stokta" beside a row marked sold out.
 */
const availability = (stock: number | null): string =>
  stock === null
    ? "https://schema.org/OutOfStock"
    : "https://schema.org/InStock";

/**
 * The Product node.
 *
 * **An Offering with no amount carries no `offers`, and that is the whole
 * point of PRD-0001 v4.0 §5.10.5 restated for a machine reader.** The
 * temptation is `"price": "0"` so the node validates; a zero is a claim that
 * the thing is free, and a search engine that believes it will print "₺0" in
 * a result. The honest node simply has no price, exactly as the page has no
 * price, and the site keeps the property that its numbers are never invented.
 *
 * `image` is **deliberately absent**: the catalogue has no photographs, only
 * placeholder colour pairs. Google requires `image` for a product rich result,
 * so this markup will validate but will not earn the rich card until the image
 * pipeline lands. Emitting a placeholder URL to satisfy the validator would
 * buy a warning-free report and a broken card.
 */
export function productJsonLd(product: Product): JsonLdNode {
  const category = categoryById(product.categoryId);
  const priced = product.pricingKind === "FIXED" && product.offers.length > 0;
  const prices = product.offers.map((offer) => offer.price);

  const node: JsonLdNode = {
    "@context": "https://schema.org",
    "@type": "Product",
    brand: { "@type": "Brand", name: product.brand },
    description: clamp(product.description, 300),
    name: product.name,
    productID: product.id,
    releaseDate: releaseDate(product.releaseYear),
    sku: product.slug,
    url: absoluteUrl(productPath(product))
  };

  if (category !== undefined) node.category = category.name;

  /*
   * The crowd's average and the reviews it is an average of. Google's policy
   * is that this markup must describe reviews a person can actually see on
   * the page; these are the ones the Yorum tab renders, and the count is the
   * length of that list rather than a separate figure that could drift.
   */
  if (product.reviews.length > 0) {
    node.aggregateRating = {
      "@type": "AggregateRating",
      bestRating: 5,
      ratingValue: product.rating,
      reviewCount: product.reviews.length,
      worstRating: 1
    };
    node.review = product.reviews.map((review) => ({
      "@type": "Review",
      author: { "@type": "Person", name: review.author },
      datePublished: review.date,
      name: review.title,
      reviewBody: review.body,
      reviewRating: {
        "@type": "Rating",
        bestRating: 5,
        ratingValue: review.rating,
        worstRating: 1
      }
    }));
  }

  if (priced) {
    node.offers = {
      "@type": "AggregateOffer",
      highPrice: Math.max(...prices),
      lowPrice: Math.min(...prices),
      offerCount: product.offers.length,
      offers: product.offers.map((offer) => ({
        "@type": "Offer",
        availability: availability(offer.stock),
        price: offer.price,
        priceCurrency: "TRY",
        seller: { "@type": "Organization", name: offer.merchant.name },
        url: absoluteUrl(productPath(product))
      })),
      priceCurrency: "TRY"
    };
  }

  return node;
}

/**
 * The editorial review as its own node.
 *
 * Separate from the crowd's reviews on purpose, because it is a different
 * claim: `Review` by a named author with a `datePublished` and a
 * `dateModified`. The modified date is the one that matters on a price
 * comparison — a verdict about value written two years ago and never revisited
 * is a stale claim, and saying when it was last checked is the difference
 * between a source and a page.
 */
export function editorialJsonLd(product: Product): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    author: { "@type": "Person", name: product.editorial.author },
    dateModified: product.editorial.updatedAt,
    datePublished: product.editorial.publishedAt,
    itemReviewed: {
      "@type": "Product",
      name: product.name,
      url: absoluteUrl(productPath(product))
    },
    reviewBody: product.editorial.verdict,
    reviewRating: {
      "@type": "Rating",
      bestRating: 10,
      ratingValue: product.editorial.score,
      worstRating: 0
    }
  };
}

/** The trail the page already draws, said again for the machine. */
export function breadcrumbJsonLd(
  trail: { name: string; path: string }[]
): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      item: absoluteUrl(step.path),
      name: step.name,
      position: index + 1
    }))
  };
}

/**
 * A category's listings as an ordered list.
 *
 * Cheapest first, and the order is not cosmetic: `ItemList` is a statement
 * about ranking, so it must match what the page shows. A list claiming an
 * order the page does not have is the kind of mismatch that costs the markup
 * its trust rather than merely its effect.
 */
export function categoryJsonLd(category: Category): JsonLdNode {
  const items = PRODUCTS.filter(
    (product) => product.categoryId === category.id
  ).sort((a, b) => a.lowestPrice - b.lowestPrice);

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(productPath(product))
    })),
    name: category.name,
    numberOfItems: items.length
  };
}

/**
 * The site itself, with its search.
 *
 * `SearchAction` is what lets a search engine offer a search box for the site
 * inside its own result. It points at the real query parameter the header's
 * field uses, so it cannot describe a search the site does not have.
 */
export function websiteJsonLd(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    description: SITE_DESCRIPTION,
    inLanguage: "tr-TR",
    name: SITE_NAME,
    potentialAction: {
      "@type": "SearchAction",
      "query-input": "required name=arama",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/?arama={arama}")
      }
    },
    url: SITE_ORIGIN
  };
}

/* -------------------------------------------------------------- copy makers */

/**
 * Categories that deserve an address of their own.
 *
 * **Two independent conditions, and a function rather than a filter over the
 * module's own constants — because the second condition was hiding the first.**
 * Mutation testing removed the `"all"` guard and every check still passed:
 * no product carries `all` as its category, so the "has listings" condition
 * excluded it anyway. The guard had become decorative without anyone being
 * able to tell, and would have stayed that way until a seed row was written
 * with `categoryId: "all"` and `/kategori/all` quietly became a second address
 * for the home page.
 *
 * Taking the catalogue as arguments makes the guard testable against a
 * catalogue that does not exist — which is the only catalogue in which the
 * guard is the thing doing the work.
 *
 * `all` is a filter, not a place: it is a category id because the dropdown
 * needs one, not because there is anything at the other end of it.
 */
export function indexableCategories(
  categories: Category[],
  products: Product[]
): Category[] {
  return categories.filter(
    (category) =>
      category.id !== "all" &&
      products.some((product) => product.categoryId === category.id)
  );
}

export const INDEXABLE_CATEGORIES = indexableCategories(CATEGORIES, PRODUCTS);

/**
 * A category page's title and description, built from what is in it.
 *
 * Written from the catalogue rather than by hand for eleven categories,
 * because a hand-written description goes stale the first time the count
 * changes and nobody notices — the page keeps claiming "12 ilan" while showing
 * three.
 */
export function categoryCopy(category: Category): {
  title: string;
  description: string;
} {
  const items = PRODUCTS.filter(
    (product) => product.categoryId === category.id
  );
  const prices = items
    .filter((product) => product.pricingKind === "FIXED")
    .map((product) => product.lowestPrice);
  const from =
    prices.length === 0
      ? ""
      : ` ${Math.min(...prices).toLocaleString("tr-TR")} ₺'den başlayan fiyatlarla.`;

  return {
    description: clamp(
      `${category.name} kategorisindeki ${items.length} ilanı satıcı ` +
        `fiyatları, çıkış yılı ve kullanıcı puanlarıyla karşılaştırın.${from}`
    ),
    title: `${category.name} — Fiyatları ve Karşılaştırma`
  };
}
