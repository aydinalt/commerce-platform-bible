import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { fetchOfferingPresentation } from "../../../discovery/api";
import {
  DISCOVERY_ENTRY_COOKIE,
  readDiscoveryEntry
} from "../../../discovery/entry";

import { OfferingPresentation } from "./offering-presentation";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "İlan" };

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
  const offering = await fetchOfferingPresentation(slug);

  // AC-4. Presentation begins only while the Offering is still eligible; a
  // not-found says nothing about why, which is the only answer that leaks
  // neither a retirement nor a moderation decision.
  if (!offering) notFound();

  return (
    <OfferingPresentation
      offering={offering}
      preparation={entry?.kind === "BROWSE" ? entry.preparation : undefined}
    />
  );
}
