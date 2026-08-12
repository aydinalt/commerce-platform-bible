import type { ModerationCase } from "@commerce/contracts";

type Action = ModerationCase["availableActions"][number];
type TargetType = ModerationCase["targetType"];

/**
 * What each of the seven General Moderation actions is called.
 *
 * A total mapping of the vocabulary `US-PLT-F02-001` publishes, so an eighth
 * appearing upstream breaks this file. There is no eighth today and the
 * bounded owner response is not one: UX-0006 §8 says so explicitly, and it is
 * true here because it is a Business act performed in UX-0005, not a value
 * this type can hold.
 */
export const ACTION_LABELS: Record<Action, string> = {
  HIDE_OFFERING: "Hide this Offering",
  REINSTATE_USER: "Reinstate this account",
  REQUEST_CORRECTION: "Request a correction",
  RESTORE_BUSINESS: "Restore this Business",
  RESTORE_OFFERING: "Restore this Offering",
  RESTRICT_BUSINESS: "Restrict this Business",
  SUSPEND_USER: "Suspend this account"
};

/**
 * What each action produces, in the words of the PRD that owns the result.
 *
 * §7.4 lets the Dashboard explain the result and then consume it, but never
 * redefine it — so each sentence is a transition PRD-0001 or PRD-0005 already
 * states, and none adds a consequence of its own. `REQUEST_CORRECTION` is the
 * one that produces no transition at all, and saying so is the point: an Admin
 * who expected it to take something down would otherwise assume it had.
 */
export const ACTION_RESULTS: Record<Action, string> = {
  HIDE_OFFERING: "Published becomes Hidden.",
  REINSTATE_USER: "Suspended becomes Enabled.",
  REQUEST_CORRECTION:
    "Nothing changes state. The Business is asked to fix something and the case stays open.",
  RESTORE_BUSINESS: "Restricted becomes Unrestricted.",
  RESTORE_OFFERING: "Hidden becomes Published.",
  RESTRICT_BUSINESS: "Unrestricted becomes Restricted.",
  SUSPEND_USER: "Enabled becomes Suspended."
};

/**
 * Where each action is performed.
 *
 * Seven actions on seven routes, each owned by the Story that defines its
 * consequence — so this file addresses them and defines none. The Dashboard is
 * where they are *asked for*; what they mean happens elsewhere, which is the
 * whole of §7.4.
 */
export function actionPath(
  action: Action,
  target: {
    businessId: string | null;
    offeringId: string | null;
    userId: string | null;
  }
): string | null {
  if (action === "HIDE_OFFERING" && target.offeringId !== null)
    return `/admin/offerings/${target.offeringId}/concealment`;
  if (action === "RESTORE_OFFERING" && target.offeringId !== null)
    return `/admin/offerings/${target.offeringId}/restoration`;
  if (action === "RESTRICT_BUSINESS" && target.businessId !== null)
    return `/admin/businesses/${target.businessId}/restriction`;
  if (action === "RESTORE_BUSINESS" && target.businessId !== null)
    return `/admin/businesses/${target.businessId}/restoration`;
  if (action === "SUSPEND_USER" && target.userId !== null)
    return `/admin/user-accounts/${target.userId}/suspension`;
  if (action === "REINSTATE_USER" && target.userId !== null)
    return `/admin/user-accounts/${target.userId}/reinstatement`;
  if (action === "REQUEST_CORRECTION" && target.businessId !== null)
    return `/admin/businesses/${target.businessId}/correction-requests`;
  return null;
}

export const TARGET_LABELS: Record<TargetType, string> = {
  BUSINESS: "Business",
  OFFERING: "Offering",
  USER_ACCOUNT: "User account"
};

/**
 * The four things a correction may target (§7.2).
 *
 * User Account correction is absent, and not because it is filtered out: the
 * contract has no such value, so a correction aimed at an account is not a
 * request this application can make.
 */
export const CORRECTION_TARGET_LABELS = {
  AFFILIATE_DESTINATION_CONFIGURATION: "Affiliate Destination configuration",
  BUSINESS_INFORMATION: "Business information",
  DIRECT_CONTACT_INFORMATION: "Direct contact information",
  OFFERING_CONTENT: "Offering content"
} as const;

export const CONTENT_AREA_LABELS = {
  ATTRIBUTES: "Attributes",
  SUMMARY: "Summary",
  TITLE: "Title"
} as const;

/**
 * What closure requires, said before it is attempted.
 *
 * `US-PLT-F02-001` AC-7 makes closure conditional on evidence, and
 * `US-PLT-F06-001` AC-10 adds a re-review where the owner has answered. Both
 * are enforced in the database, so this sentence changes nothing — it just
 * stops the refusal being the first time an Admin hears about the rule.
 */
export const CLOSURE_NEEDS_EVIDENCE =
  "A case closes only after an applied action or a recorded no-action decision.";
export const CLOSURE_NEEDS_RE_REVIEW =
  "The Business has answered this correction. Record a re-review before closing.";

/// §7.5. Closing creates no target state — worth saying, because an Admin who
/// believed otherwise would close cases expecting something to happen.
export const CLOSURE_CHANGES_NOTHING =
  "Closing changes nothing about the Offering, the Business or the account.";

/// §8. The owner's bounded response keeps the case open and requires an Admin
/// to look again. It is not an eighth action.
export const RE_REVIEW_REQUIRED_NOTICE =
  "The Business used the bounded correction path. The case is still open and needs a re-review.";

export const MODERATION_REFUSALS: Record<string, string> = {
  ADMIN_TARGET_FORBIDDEN:
    "This account holds Admin authorization. Suspending or reinstating it is a Product Owner action taken outside this application.",
  BUSINESS_MODERATION_UNAVAILABLE:
    "That Business is not in a state this action can start from. Nothing has changed.",
  CASE_NOT_RESOLVED:
    "This case has no applied action and no recorded no-action decision, so it stays open.",
  CASE_NOT_RE_REVIEWED:
    "The Business answered after the last review. Record a re-review before closing.",
  OFFERING_MODERATION_UNAVAILABLE:
    "That Offering is not in a state this action can start from. Nothing has changed.",
  ACCESS_MODERATION_UNAVAILABLE:
    "That account is not in a state this action can start from. Nothing has changed.",
  MODERATION_CASE_NOT_FOUND: "That case no longer exists.",
  USER_ACCOUNT_NOT_FOUND: "No account matches that identifier."
};

/**
 * What a refused action says.
 *
 * Every sentence ends by saying nothing changed, because §15 requires a failed
 * action not to claim a transition — and the most convincing way to not claim
 * one is to say plainly that none happened.
 */
export function moderationRefusal(code: string): string {
  return (
    MODERATION_REFUSALS[code] ??
    "That could not be done. Nothing about this target has changed."
  );
}

/// §14. An empty queue is a state worth naming.
export const NO_CASES = "No case matches this filter.";
