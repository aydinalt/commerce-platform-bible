import type {
  EditorialReview,
  OfferingPresentationResponse,
  ProductReviewsResponse
} from "@commerce/contracts";

import { absoluteUrl, clampDescription, offeringPath } from "../seo";

type JsonLdNode = Record<string, unknown>;

/**
 * What a crawler reads on an Offering Presentation (I97).
 *
 * **Every claim here is one a person can see on the page.** That is Google's
 * structured-data policy and it is also the only version of this worth
 * shipping: markup that describes reviews, prices or a verdict the page does
 * not show is a claim about a real product that nobody can check. Each field
 * below is taken from the payload the page renders, never composed for the
 * markup.
 *
 * **The two scores stay two, here as well.** `UX-0003` **Frozen v1.2** §8.9.1
 * and `US-EDT-F01-001` AC-6 forbid merging the editorial score with the crowd's
 * average or deriving a third from them — and structured data is the easiest
 * place in the codebase to break that by accident, because `aggregateRating` is
 * a single field that invites exactly one number. The crowd's average is the
 * only thing that becomes an `aggregateRating`; the editorial judgement is a
 * separate `Review` node with its own scale, which is what it is.
 */

/** `0–5`, the crowd's scale. Stated on the node rather than assumed. */
function crowdRating(reviews: ProductReviewsResponse): JsonLdNode {
  return {
    "@type": "AggregateRating",
    bestRating: 5,
    ratingValue: Number(reviews.rating.average),
    reviewCount: reviews.rating.count,
    worstRating: 1
  };
}

/**
 * The editorial review as its own node, with its own scale.
 *
 * `0–10` declared explicitly: a `Rating` without `bestRating` is read as
 * five-star by convention, which would silently restate an 8.4 as though it
 * were 8.4 out of 5 — the merge §8.9.1 forbids, achieved by omission.
 *
 * **Both dates travel with it.** `dateModified` is the re-check, and on a
 * comparison page it is the one that matters: a verdict written two years ago
 * and never revisited is a stale claim, and saying when it was last checked is
 * the difference between a source and a page. A review never re-checked carries
 * no `dateModified` rather than repeating the publication date.
 */
function editorialNode(review: EditorialReview): JsonLdNode {
  const node: JsonLdNode = {
    "@type": "Review",
    author: { "@type": "Organization", name: review.byline },
    datePublished: review.publishedAt,
    reviewBody: review.verdict,
    reviewRating: {
      "@type": "Rating",
      bestRating: 10,
      ratingValue: review.score,
      worstRating: 0
    }
  };
  if (review.lastCheckedAt !== null) node.dateModified = review.lastCheckedAt;
  return node;
}

/**
 * The sellers, as an `AggregateOffer`.
 *
 * **Only priced rows take part.** `PRD-0001` §5.10.5 is explicit that an
 * Offering with no amount has no position in a price ordering, and a low price
 * of zero composed from an unpriced row would be a number the page never shows
 * and the seller never quoted.
 */
function offersNode(
  offering: OfferingPresentationResponse
): JsonLdNode | undefined {
  const fixed = offering.sellers
    .map((seller) => seller.pricing)
    .filter((pricing) => pricing.kind === "FIXED");
  const priced = fixed
    .map((pricing) => Number(pricing.amount))
    .filter((amount) => Number.isFinite(amount));
  if (priced.length === 0) return undefined;

  /*
   * The currency travels with the amounts rather than from the page's own
   * pricing, which may be `ON_REQUEST` while a sibling seller is priced. Taking
   * it from the first priced row keeps the figure and its unit from two
   * different places.
   */
  const currency = fixed[0]?.currency;
  return {
    "@type": "AggregateOffer",
    highPrice: Math.max(...priced),
    lowPrice: Math.min(...priced),
    offerCount: priced.length,
    ...(currency === undefined ? {} : { priceCurrency: currency }),
    url: absoluteUrl(offeringPath(offering.slug))
  };
}

export function offeringJsonLd(input: {
  editorial: EditorialReview | null;
  offering: OfferingPresentationResponse;
  reviews: ProductReviewsResponse | null;
}): JsonLdNode {
  const { editorial, offering, reviews } = input;
  const node: JsonLdNode = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: offering.title,
    /*
     * The slug, which is the address a person shares and the identifier this
     * page is reachable by. The Offering's UUID is not published anywhere a
     * reader sees, so it would be an identifier nothing else could match.
     */
    sku: offering.slug,
    url: absoluteUrl(offeringPath(offering.slug))
  };

  if (offering.description !== null)
    node.description = clampDescription(offering.description, 300);
  if (offering.productKey !== null) node.productID = offering.productKey;
  /* Root first, and the leaf is the one a person would call this thing. */
  const leaf = offering.categoryPath.at(-1);
  if (leaf !== undefined) node.category = leaf;

  /*
   * The crowd's rating, and only when somebody has actually scored the product.
   * A product nobody has scored carries no `aggregateRating` rather than a zero
   * — five empty stars in markup is a verdict invented on behalf of people who
   * have not spoken, and it is the kind a rich result would print.
   */
  if (reviews !== null && reviews.rating.count > 0)
    node.aggregateRating = crowdRating(reviews);

  if (editorial !== null) node.review = [editorialNode(editorial)];

  const offers = offersNode(offering);
  if (offers !== undefined) node.offers = offers;

  return node;
}

/**
 * The node, rendered.
 *
 * `JSON.stringify` rather than a template, so a title carrying a quote or an
 * angle bracket cannot close the script tag — the injection this element exists
 * to avoid. `<` is escaped for the same reason: it is the only character that
 * can end a script block from inside a JSON string.
 */
export function JsonLd({ node }: { node: Record<string, unknown> }) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(node).replaceAll("<", "\\u003c")
      }}
      type="application/ld+json"
    />
  );
}
