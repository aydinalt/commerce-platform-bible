import type { CorrectionNotice } from "@commerce/contracts";

type Target = CorrectionNotice["target"];
type ManagementArea = NonNullable<CorrectionNotice["managementArea"]>;
type ContentArea = NonNullable<CorrectionNotice["contentArea"]>;

/**
 * What each notice is about, in the words of the thing it names.
 *
 * A total mapping of the contract's own vocabulary, so a target added upstream
 * breaks this file rather than appearing on screen unlabelled. The sentences
 * describe the subject and never the consequence — a notice changes no state
 * by itself (§12), and copy that said "your listing has been taken down" would
 * be describing a restriction this notice did not perform.
 */
export const TARGET_COPY: Record<Target, string> = {
  AFFILIATE_DESTINATION_CONFIGURATION:
    "Something about an Affiliate Destination needs your attention.",
  BUSINESS_INFORMATION:
    "Something about your Business information needs your attention.",
  DIRECT_CONTACT_INFORMATION:
    "Something about your direct contact details needs your attention.",
  OFFERING_CONTENT: "Something about an Offering needs your attention."
};

/// What the targeted part of an Offering is called, matching the edit form's
/// own labels so the notice and the field it points at read the same.
export const CONTENT_AREA_COPY: Record<ContentArea, string> = {
  ATTRIBUTES: "Attributes",
  SUMMARY: "Summary",
  TITLE: "Title"
};

/// What the link into a management area says.
export const AREA_COPY: Record<ManagementArea, string> = {
  AFFILIATE_DESTINATION: "Open the Affiliate Destination",
  BUSINESS_INFORMATION: "Open Business information",
  OFFERING_CONTENT: "Open the Offering"
};

/**
 * Where a notice opens.
 *
 * `null` where the API said `managementArea` is `null`, which is `US-BUS-F07-
 * 001` AC-4 answering a live question: the owner is not authorized for that
 * area right now. The notice still says what it is about — it simply has
 * nowhere to send them, and offering a link that would refuse them on arrival
 * would be worse than offering none.
 *
 * The bounded correction-edit path gets its own address, because it is not the
 * ordinary Offering screen with fewer fields — it is a different permission,
 * conferred by the correction, and naming the correction is the only way to
 * ask for it (§11).
 */
export function noticeEntry(
  businessId: string,
  notice: CorrectionNotice
): { href: string; label: string } | null {
  const area = notice.managementArea;
  if (area === null) return null;
  const label = AREA_COPY[area];
  if (notice.boundedEditAvailable)
    return {
      href: `/businesses/${businessId}/corrections/${notice.id}`,
      label
    };
  if (area === "BUSINESS_INFORMATION")
    return { href: `/businesses/${businessId}/information`, label };
  // An Offering-shaped area with no Offering names nothing to open. The
  // database refuses that combination, so this is a shape the notice cannot
  // have — and an entry is still not invented for it.
  if (notice.offeringId === null) return null;
  if (area === "AFFILIATE_DESTINATION")
    return {
      href: `/businesses/${businessId}/offerings/${notice.offeringId}/destination`,
      label
    };
  return {
    href: `/businesses/${businessId}/offerings/${notice.offeringId}`,
    label
  };
}

/**
 * What the notice says about where the case stands.
 *
 * `reReviewRequired` is stated plainly because §11 is explicit that an owner
 * edit closes nothing: someone who fixed what was asked and heard nothing back
 * would reasonably assume it was over. Saying so is not a promise about when —
 * the notice has no such fact to offer, and inventing one would be worse than
 * the silence it replaces.
 */
export const RE_REVIEW_COPY =
  "Making this change does not close the case. The platform reviews it again.";

/// UX-0005 §14. There is no inbox, no conversation and no substitute for one,
/// so an absence of notices is said in one sentence and nothing is offered.
export const NO_NOTICES = "You have no correction notices.";

/**
 * What a refused correction save says.
 *
 * A third map, for the same reason there was a second: these refusals arrive
 * inside a path that exists only because a notice granted it, and every one of
 * them is really the same sentence — the permission this screen is standing on
 * is narrower than the request that just arrived, or is gone.
 *
 * `BOUNDED_CORRECTION_UNAVAILABLE` deliberately does not list PRD-0005
 * §8.3.1's five conditions. The person did not choose to enter this path
 * through a rule they can recite; they followed a notice, and if the path has
 * closed the useful thing to tell them is to go back and look at the notice
 * again.
 */
export const CORRECTION_REFUSALS: Record<string, string> = {
  ATTRIBUTE_VALUE_MISMATCH:
    "One of the values does not fit the Attribute it belongs to. Nothing was saved.",
  BOUNDED_CORRECTION_UNAVAILABLE:
    "This correction can no longer be answered here. Go back and open the notice again.",
  CORRECTION_AREA_NOT_TARGETED:
    "This notice asks about one part of the Offering, and only that part can be changed here.",
  CORRECTION_NOT_FOUND:
    "This correction is no longer available. Go back and open the notice again.",
  PUBLICATION_MINIMUM_NOT_SATISFIED:
    "That change was not saved: it would have left this Offering short of what it needs to stay published."
};

export function correctionRefusalMessage(code: string): string {
  return (
    CORRECTION_REFUSALS[code] ??
    "That could not be saved. This Offering still holds what it held before."
  );
}
