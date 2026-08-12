import type { ManagedOffering } from "@commerce/contracts";

/**
 * The entry vocabulary, read off the contract rather than restated.
 *
 * `ManagedOffering["entries"]` is the published list, so a value added to or
 * removed from it upstream breaks this file rather than being silently
 * unlabelled or silently unrenderable.
 */
type OfferingEntry = ManagedOffering["entries"][number];

/**
 * The four lifecycle groups, in the order UX-0005 §8 writes them.
 *
 * Ordered rather than sorted, because the order is meaning: Draft is what a
 * person is still working on, Published is what they are offering, Hidden is
 * what the platform took out of circulation, and Archived is history. A
 * Dashboard that put Archived first would be telling a different story about
 * the Business.
 */
export const LIFECYCLE_GROUPS = [
  "DRAFT",
  "PUBLISHED",
  "HIDDEN",
  "ARCHIVED"
] as const;

export type LifecycleGroup = (typeof LIFECYCLE_GROUPS)[number];

/**
 * What each entry is called on screen.
 *
 * A total mapping of the vocabulary `US-BUS-F05-001` publishes, so an entry
 * the API offers always has a label. There is no `RESTORE` and no `DELETE`
 * here for the same reason there is none there: neither is a value the type
 * can hold, so neither can appear on this screen even by accident.
 */
export const ENTRY_LABELS: Record<OfferingEntry, string> = {
  EDIT: "Edit",
  MANAGE_AFFILIATE_DESTINATION: "Affiliate destination",
  PUBLISH: "Publish",
  RETIRE: "Retire",
  VIEW: "View"
};

/**
 * How the Dashboard says what an Offering's public standing is (§9, "Public
 * eligibility language").
 *
 * Lifecycle Published and final Offering Public Eligibility are two facts and
 * are worded as two, because §9 forbids the screen from ever stating that
 * every Published Offering is public. `PENDING` deliberately reads as not yet
 * decided rather than as a promise.
 */
export const ELIGIBILITY_COPY: Record<
  ManagedOffering["publicEligibility"],
  string
> = {
  ELIGIBLE: "Publicly visible",
  INELIGIBLE: "Not publicly visible",
  PENDING: "Public visibility not yet decided",
  WITHDRAWN: "Withdrawn from public view"
};

/**
 * Whether creating an Offering may be offered at all.
 *
 * §14 is explicit that an empty inventory does *not* present Create to a
 * Restricted Business — the emptiest screen is exactly where an unavailable
 * action is most tempting to show and least honest.
 */
export function offersCreate(moderation: string): boolean {
  return moderation !== "RESTRICTED";
}
