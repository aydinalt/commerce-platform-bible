"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  DISCOVERY_ENTRY_COOKIE,
  DISCOVERY_ROUTE,
  readDiscoveryEntry
} from "../../../discovery/entry";
import {
  sendListingReport,
  type ReportOutcome
} from "../../../discovery/reports";
import {
  writeProductReview,
  type ReviewOutcome
} from "../../../discovery/reviews";
import { LISTING_REPORT_REASONS } from "@commerce/contracts";
import { SESSION_COOKIE } from "../../../identity/session";

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

/**
 * What the person is told after reporting, and nothing else (I69).
 *
 * No identifier, no queue position, no "case number". A report is a courtesy;
 * inventing a reference for it would promise a process the platform has not
 * committed to running.
 */
export interface ReportState {
  readonly outcome: ReportOutcome | null;
}

/**
 * Sending a report about the listing being read (I69).
 *
 * **No redirect and no revalidation.** The person is reading a product page and
 * has done the platform a favour in passing; moving them, or re-fetching the
 * page under them, would take away what they were doing. The answer is a
 * sentence where the form was.
 *
 * The reason is checked against the contract's own list rather than passed
 * through: a form field is editable, and the API refusing an invented reason is
 * the second line of defence rather than the first.
 */
export async function reportListing(
  _state: ReportState,
  form: FormData
): Promise<ReportState> {
  const slug = form.get("slug");
  const reason = form.get("reason");
  if (
    typeof slug !== "string" ||
    slug === "" ||
    typeof reason !== "string" ||
    !(LISTING_REPORT_REASONS as readonly string[]).includes(reason)
  )
    return { outcome: "REFUSED" };

  const note = form.get("note");
  const jar = await cookies();

  return {
    outcome: await sendListingReport({
      note: typeof note === "string" && note.trim() !== "" ? note.trim() : null,
      reason,
      session: jar.get(SESSION_COOKIE)?.value,
      slug
    })
  };
}

/** What writing a review ended in, and nothing else. */
export interface ReviewState {
  readonly outcome: ReviewOutcome | null;
}

/**
 * Writing, or replacing, one's own review of this product (I62's surface).
 *
 * **The page is revalidated on success and not otherwise.** A written review
 * changes the list above the form and the score above the page, and both come
 * from the API — so the honest way to show them is to ask again rather than to
 * splice the new row in on this side and hope the average agrees. A failure
 * changes nothing, so re-fetching would only cost the person their place.
 *
 * A Guest is not redirected to sign in from here. The form is only offered when
 * the API said this caller may write, so arriving here without a session means
 * the session expired mid-page — and `SIGN_IN` says exactly that, which is more
 * use than being moved to a login screen with the review lost.
 */
export async function writeReview(
  _state: ReviewState,
  form: FormData
): Promise<ReviewState> {
  const slug = form.get("slug");
  const rating = Number(form.get("rating"));
  if (
    typeof slug !== "string" ||
    slug === "" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  )
    return { outcome: "REFUSED" };

  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) return { outcome: "SIGN_IN" };

  const body = form.get("body");
  const outcome = await writeProductReview({
    body: typeof body === "string" && body.trim() !== "" ? body.trim() : null,
    rating,
    session,
    slug
  });

  if (outcome === "WRITTEN")
    revalidatePath(`/offerings/${encodeURIComponent(slug)}`);
  return { outcome };
}
