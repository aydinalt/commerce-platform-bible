import { notFound } from "next/navigation";

import { fetchPublicOffering } from "../../../discovery/api";

import { OfferingIdentity } from "./offering-identity";

/**
 * The Offering a Listing Card opens (`US-DSC-F09-001`).
 *
 * Discovery's responsibility ends here (AC-3). Nothing on this route reads the
 * Discovery criteria, and nothing writes them: the carrier cookie is untouched,
 * so a person who opens an Offering and goes back finds the Results they left —
 * AC-7, which matters most in the case where the Offering could not be opened
 * at all.
 *
 * Opening is not Completion (AC-5). No occurrence is recorded here;
 * `Offering Presentation Open` occurs when complete Presentation successfully
 * begins, and PRD-0001 §8.2.1 gives that to `US-OFR-F05-001`.
 */

/// Eligibility can change between two requests, so this may not be prerendered.
export const dynamic = "force-dynamic";

export default async function OfferingPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const offering = await fetchPublicOffering(slug);

  // AC-4. Presentation begins only while the Offering is still eligible; a
  // not-found says nothing about why, which is the only answer that leaks
  // neither a retirement nor a moderation decision.
  if (!offering) notFound();

  return <OfferingIdentity offering={offering} />;
}
