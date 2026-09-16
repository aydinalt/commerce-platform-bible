import { cache } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { isApiUnavailable } from "../../../api-error";
import {
  fetchComplementary,
  fetchOfferingPresentation
} from "../../../discovery/api";
import {
  DISCOVERY_ENTRY_COOKIE,
  readDiscoveryEntry
} from "../../../discovery/entry";
import { readProductReviews } from "../../../discovery/reviews";
import { readEditorialReview } from "../../../editorial/api";
import { SESSION_COOKIE } from "../../../identity/session";
import { JsonLd, offeringJsonLd } from "../../../editorial/structured-data";
import { absoluteUrl, clampDescription, offeringPath } from "../../../seo";
import { TERMS } from "../../../vocabulary";

import { OfferingPresentation } from "./offering-presentation";
import { PresentationUnavailable } from "./presentation-unavailable";

import type { Metadata } from "next";

/**
 * The Presentation, read once per request (I97).
 *
 * `generateMetadata` and the page body both need it, and without this they
 * would each fetch it — doubling the load on the busiest public route in the
 * platform. `cache` memoises for the lifetime of one request and nothing
 * longer, which matters here: the route is `force-dynamic` precisely because
 * eligibility can change between two requests.
 */
const presentationOf = cache(async (slug: string) => {
  try {
    return await fetchOfferingPresentation(slug);
  } catch (error) {
    if (!isApiUnavailable(error)) throw error;
    return "UNAVAILABLE" as const;
  }
});

/**
 * The tab, the snippet and the canonical address (I97).
 *
 * **`I51` found this and named it rather than fixing it**: _"`generateMetadata`
 * is not used anywhere, so no title carries the name of the thing being looked
 * at: every Offering tab says `İlan — İlanlar` rather than the Offering's own
 * title."_ On a comparison site that is not only a tab — it is the line a search
 * engine prints, identical on every listing the platform has.
 *
 * **The canonical address is the point of the exercise.** One product is sold by
 * several partners and each of their listings is a separate page carrying the
 * same Product Key; without a canonical each is a near-duplicate of the others,
 * and a crawler picks whichever it likes. Each page declares itself canonical,
 * which is true: it is one seller's listing, and `sellers` is how the others are
 * reached.
 *
 * An Offering that cannot be read keeps the generic title rather than failing.
 * Metadata is not worth a `500` on a page that would otherwise render.
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const offering = await presentationOf(slug);
  /* The same word as the owner's view of the same thing, from one place (I51). */
  if (offering === "UNAVAILABLE" || !offering) return { title: TERMS.offering };

  const canonical = absoluteUrl(offeringPath(offering.slug));
  const description =
    offering.description === null
      ? undefined
      : clampDescription(offering.description);

  return {
    alternates: { canonical },
    ...(description === undefined ? {} : { description }),
    openGraph: {
      ...(description === undefined ? {} : { description }),
      title: offering.title,
      type: "website",
      url: canonical
    },
    title: offering.title
  };
}

/**
 * The Offering a Listing Card opens (`US-DSC-F09-001`).
 *
 * Discovery's responsibility ends here (AC-3). Nothing on this route writes the
 * Discovery criteria: the carrier cookie is untouched, so a person who opens an
 * Offering and goes back finds the Results they left — AC-7, which matters most
 * in the case where the Offering could not be opened at all.
 *
 * It does read one thing. `US-DSC-F10-001` AC-5 requires the unchanged
 * Compare-preparation context to reach Presentation alongside the newly opened
 * Offering, so the carrier is read and passed on exactly as found — not
 * rewritten, not extended, and not turned into a Comparison Set.
 *
 * Opening is not Completion (`US-DSC-F09-001` AC-5). The one occurrence it
 * produces is `Offering Presentation Open`, and the API produces it at the
 * moment an eligible complete Presentation is composed — which is why this
 * route is never prerendered and never prefetched.
 */

/// Eligibility can change between two requests, so this may not be prerendered.
export const dynamic = "force-dynamic";

export default async function OfferingPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const jar = await cookies();
  const entry = readDiscoveryEntry(jar.get(DISCOVERY_ENTRY_COOKIE)?.value);

  /*
   * UX-0002 §14 and UX-0003 §16. A `404` is already an ordinary answer handled
   * below — the Offering stopped being eligible, which is expected. This is the
   * other case: the API could not answer at all, which used to take the whole
   * page down and with it the Results the person would go back to.
   *
   * Defects are rethrown. A contract that no longer parses is this
   * application's problem to fix, not a condition to invite a person to retry.
   */
  const read = await presentationOf(slug);
  if (read === "UNAVAILABLE") return <PresentationUnavailable slug={slug} />;
  const offering = read;

  // AC-4. Presentation begins only while the Offering is still eligible; a
  // not-found says nothing about why, which is the only answer that leaks
  // neither a retirement nor a moderation decision.
  if (!offering) notFound();

  /*
   * I70. Fetched after the Presentation and never in place of it: this is
   * advertising, and a listing that cannot show a suggestion still shows the
   * listing. `fetchComplementary` answers with an empty list on any failure,
   * so nothing here has to decide what an outage means for an advertisement.
   */
  /*
   * I97. The three reads the page already makes, held so the markup describes
   * exactly what the page renders — Google's structured-data policy, and the
   * only version worth shipping: markup describing a review or a price the page
   * does not show is a claim about a real product that nobody can check.
   */
  const editorial =
    offering.productKey === null
      ? undefined
      : await readEditorialReview(offering.productKey);
  const reviews = await readProductReviews({
    session: jar.get(SESSION_COOKIE)?.value,
    slug
  });

  return (
    <>
      {/*
       * I97. Rendered beside the page rather than inside the Presentation
       * component, because it is a document-layer claim rather than a thing a
       * person reads — and because composing it needs all three reads, which
       * only this route has.
       */}
      <JsonLd
        node={offeringJsonLd({
          editorial:
            editorial === undefined || editorial === null
              ? null
              : editorial.review,
          offering,
          reviews
        })}
      />
      <OfferingPresentation
        complementary={await fetchComplementary(slug)}
        /*
         * I95, `EDT F01`. Fetched separately from the Presentation and never as a
         * field inside it, which is `UX-0003` **Frozen v1.2** §8.9.2's doing: a
         * review folded into the Presentation read would have two ways to end on
         * failure — take the whole listing down, or answer "no review" — and the
         * first is disproportionate while the second is the claim §8.9.2 forbids
         * an outage from making. Fetched apart, the two answers stay apart.
         *
         * **Not fetched at all where the listing carries no Product Key.** There
         * is nothing to ask about, so `undefined` reaches the screen and it
         * presents nothing and says nothing — §8.9.2's second case, which must not
         * be allowed to become an outage by way of a request that could fail.
         */
        editorial={editorial}
        offering={offering}
        preparation={entry?.kind === "BROWSE" ? entry.preparation : undefined}
        /*
         * Read with the session where there is one, because one thing in the
         * answer is about the caller: their own review is marked, so the page can
         * offer to edit it rather than to write a second one.
         */
        reviews={reviews}
      />
    </>
  );
}
