"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  addToComparison,
  COMPARISON_SET_COOKIE,
  COMPARISON_SET_MAX_AGE_SECONDS,
  NO_COMPARE_REFUSAL,
  readComparisonSetId,
  removeFromComparison,
  type CompareEntryState
} from "../../decision/comparison";

/**
 * The Compare actions (`US-DEC-F01-001`).
 *
 * Only the set's identifier is written to the browser, and only ever by these
 * actions. Every rule about what a set may contain is answered by the API, so
 * nothing here can accidentally admit a member the datamodel would refuse.
 */

async function remember(comparisonSetId: string): Promise<void> {
  const jar = await cookies();
  jar.set(COMPARISON_SET_COOKIE, comparisonSetId, {
    httpOnly: true,
    maxAge: COMPARISON_SET_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

async function currentSetId(): Promise<string | null> {
  const jar = await cookies();
  return readComparisonSetId(jar.get(COMPARISON_SET_COOKIE)?.value);
}

/**
 * Adding the Offering being viewed (AC-5, AC-6).
 *
 * A refusal returns rather than redirecting, so the person stays on the
 * Presentation they were reading and is told which bound they met.
 */
export async function addToCompare(
  _previous: CompareEntryState,
  form: FormData
): Promise<CompareEntryState> {
  const offeringId = form.get("offeringId");
  if (typeof offeringId !== "string") return { refusal: "UNKNOWN" };

  const replaces = form.get("replaces");
  const { refusal, set } = await addToComparison({
    comparisonSetId: await currentSetId(),
    offeringId,
    ...(typeof replaces === "string" && replaces.length > 0 ? { replaces } : {})
  });
  if (!set) return { refusal: refusal ?? "UNKNOWN" };
  await remember(set.comparisonSetId);
  return NO_COMPARE_REFUSAL;
}

export async function removeFromCompare(form: FormData): Promise<void> {
  const offeringId = form.get("offeringId");
  const comparisonSetId = await currentSetId();
  if (typeof offeringId !== "string" || comparisonSetId === null) return;
  await removeFromComparison(comparisonSetId, offeringId);
  redirect("/compare");
}
