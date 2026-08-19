"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  DISCOVERY_ENTRY_COOKIE,
  DISCOVERY_ROUTE,
  readDiscoveryEntry
} from "../../../discovery/entry";

/**
 * Asking again for the Offering that could not be opened (UX-0002 §14).
 *
 * A submission and not a link, because composing a Presentation is what
 * produces `Offering Presentation Open` — a prefetched anchor would record that
 * occurrence for somebody who never opened anything, which is the same reason
 * `US-DSC-F09-001` keeps this route out of every prerender and prefetch.
 *
 * The slug comes from the form rather than being reconstructed, and no Offering
 * is ever substituted for it: §14 requires that no alternative be invented, and
 * an Offering is the one thing that must never be.
 *
 * Without a usable slug the person goes back to where they came from, which
 * means reading the carrier rather than guessing. Discovery still holds their
 * Results if the carrier is alive; if it has expired there are no Results to
 * return to, and Home is the honest destination rather than a Results route
 * that would immediately bounce them there anyway.
 */
export async function retryOffering(form: FormData): Promise<void> {
  const slug = form.get("slug");
  if (typeof slug === "string" && slug !== "")
    redirect(`/offerings/${encodeURIComponent(slug)}`);

  const jar = await cookies();
  const entry = readDiscoveryEntry(jar.get(DISCOVERY_ENTRY_COOKIE)?.value);
  redirect(entry ? DISCOVERY_ROUTE : "/");
}
