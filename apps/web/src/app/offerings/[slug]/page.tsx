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
import { SESSION_COOKIE } from "../../../identity/session";
import { TERMS } from "../../../vocabulary";

import { OfferingPresentation } from "./offering-presentation";
import { PresentationUnavailable } from "./presentation-unavailable";

import type { Metadata } from "next";

/* The same word as the owner's view of the same thing, from one place (I51). */
export const metadata: Metadata = { title: TERMS.offering };

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
  let offering;
  try {
    offering = await fetchOfferingPresentation(slug);
  } catch (error) {
    if (!isApiUnavailable(error)) throw error;
    return <PresentationUnavailable slug={slug} />;
  }

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
  return (
    <OfferingPresentation
      complementary={await fetchComplementary(slug)}
      offering={offering}
      preparation={entry?.kind === "BROWSE" ? entry.preparation : undefined}
      /*
       * Read with the session where there is one, because one thing in the
       * answer is about the caller: their own review is marked, so the page can
       * offer to edit it rather than to write a second one.
       */
      reviews={await readProductReviews({
        session: jar.get(SESSION_COOKIE)?.value,
        slug
      })}
    />
  );
}
