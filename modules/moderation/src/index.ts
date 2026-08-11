/**
 * What the Admin Panel offers right now (`US-PLT-F01-001` AC-5).
 *
 * A closed list of the Platform functions that actually exist. It is not a
 * roadmap: every value here has a route behind it, so a Panel that offers
 * something can open it. PRD-0006 names more Admin behaviour than this, and
 * the honest way to say "not yet" is to say nothing.
 *
 * What is missing is the point of AC-7, AC-8 and AC-9. There is no `GRANT_ADMIN`,
 * no `REMOVE_ADMIN`, no `TRANSFER_ADMIN`, no `DELEGATE_ADMIN` and no tier of any
 * kind, because first-Admin establishment and authorization grant or removal
 * are Product Owner decisions taken outside the Panel. None of them is a value
 * this type can hold, so no Panel — present or future — can offer one by
 * accident.
 */
export const ADMIN_PANEL_FUNCTIONS = [
  "MANAGE_CATEGORIES",
  "MANAGE_ATTRIBUTE_DEFINITIONS",
  "ADMINISTER_AFFILIATE_DESTINATIONS",
  "MODERATE_BUSINESSES",
  "REQUEST_CORRECTION",
  "READ_OFFERING_HISTORY"
] as const;

export type AdminPanelFunction = (typeof ADMIN_PANEL_FUNCTIONS)[number];

/**
 * The baselines an Admin keeps while in Admin context (AC-4).
 *
 * Owner Decision D06 makes Admin context additive rather than a replacement:
 * entering it takes nothing away, so a person browsing the public site or
 * managing their own Business goes on being able to. Naming the two inherited
 * baselines makes that a stated property rather than a happy accident of
 * nothing having refused them.
 */
export const ADMIN_INHERITED_BASELINES = [
  "GUEST",
  "AUTHENTICATED_USER"
] as const;

export type AdminInheritedBaseline = (typeof ADMIN_INHERITED_BASELINES)[number];

/**
 * Whether the Admin Panel may be opened at all.
 *
 * Three conditions and one answer (AC-1). They are expressed as a conjunction
 * for the same reason PRD-0005 §8.3.1 is: a Panel that opened with two of the
 * three satisfied would be a Panel that trusted something it had not checked.
 *
 * `authorized` and `entered` are deliberately separate. Being able to enter the
 * Admin surface and being in it are different states (`US-IDN-F08-001` AC-5),
 * and collapsing them would make every ordinary browsing session one stray
 * request away from an Admin action.
 */
export function adminPanelOpens(input: {
  authorized: boolean;
  enabled: boolean;
  entered: boolean;
}): boolean {
  return input.enabled && input.authorized && input.entered;
}

/**
 * Raised when the Panel is asked for without every condition of AC-1. The
 * reason is carried but is not for the caller: AC-10 refuses a Suspended
 * account without telling it which condition failed.
 */
export class AdminPanelClosedError extends Error {
  constructor(
    readonly reason: "NOT_AUTHORIZED" | "NOT_ENABLED" | "NOT_ENTERED"
  ) {
    super("ADMIN_PANEL_CLOSED");
    this.name = "AdminPanelClosedError";
  }
}

/**
 * The exact seven General Moderation actions (`US-PLT-F02-001` AC-4).
 *
 * PRD-0006 §7 and Owner Decision D15/D16 fix this list, and AC-10 is why it is
 * a list rather than a convention: Affiliate Destination Review, Validate,
 * Enable and Disable are a separate action family, and the way that separation
 * quietly ends is somebody adding a fifth verb to a set that had no edges.
 *
 * All seven are here even though `US-PLT-F03-001` and `US-PLT-F05-001` have not
 * yet built four of them. This Story owns the *set*; whether a given action can
 * be taken right now is a different question, answered by
 * `availableModerationActions`.
 */
export const MODERATION_ACTIONS = [
  "REQUEST_CORRECTION",
  "HIDE_OFFERING",
  "RESTORE_OFFERING",
  "RESTRICT_BUSINESS",
  "RESTORE_BUSINESS",
  "SUSPEND_USER",
  "REINSTATE_USER"
] as const;

export type ModerationAction = (typeof MODERATION_ACTIONS)[number];

export const MODERATION_TARGET_TYPES = [
  "OFFERING",
  "BUSINESS",
  "USER_ACCOUNT"
] as const;

export type ModerationTargetType = (typeof MODERATION_TARGET_TYPES)[number];

/**
 * Which action belongs to which kind of target. An action offered against the
 * wrong kind of thing is not a rare mistake to guard against — it is a
 * category error, so the mapping is total and stated once.
 */
export const ACTION_TARGET: Record<ModerationAction, ModerationTargetType> = {
  HIDE_OFFERING: "OFFERING",
  REINSTATE_USER: "USER_ACCOUNT",
  REQUEST_CORRECTION: "BUSINESS",
  RESTORE_BUSINESS: "BUSINESS",
  RESTORE_OFFERING: "OFFERING",
  RESTRICT_BUSINESS: "BUSINESS",
  SUSPEND_USER: "USER_ACCOUNT"
};

/**
 * The actions with a path behind them today.
 *
 * `US-PLT-F03-001` owns Hide and Restore Offering; `US-PLT-F05-001` owns
 * Suspend and Reinstate User. Until those Stories are delivered, offering
 * either would be an offer the platform could not keep, so this list is what
 * AC-5's "currently valid" is read through. It is separate from
 * `MODERATION_ACTIONS` on purpose: the set does not shrink because four of its
 * members are unbuilt, and the offer does not grow because they are named.
 */
export const IMPLEMENTED_MODERATION_ACTIONS: readonly ModerationAction[] = [
  "REQUEST_CORRECTION",
  "HIDE_OFFERING",
  "RESTORE_OFFERING",
  "RESTRICT_BUSINESS",
  "RESTORE_BUSINESS"
];

/**
 * Which of the seven an Admin may take on this case right now (AC-5).
 *
 * Three conditions, and each removes something different. The target kind
 * removes actions that were never about this sort of thing. The target's
 * current state removes the ones that would be no-ops or contradictions — a
 * Restricted Business cannot be restricted again. Implementation removes the
 * ones that have no path yet.
 *
 * A Closed case offers nothing at all: AC-8 makes closure a workflow ending,
 * and an action taken after it would be an action nobody had a case for.
 */
export function availableModerationActions(input: {
  caseOpen: boolean;
  lifecycle?: "ARCHIVED" | "DRAFT" | "HIDDEN" | "PUBLISHED";
  restricted?: boolean;
  suspended?: boolean;
  targetType: ModerationTargetType;
}): ModerationAction[] {
  if (!input.caseOpen) return [];
  return MODERATION_ACTIONS.filter((action) => {
    if (ACTION_TARGET[action] !== input.targetType) return false;
    if (!IMPLEMENTED_MODERATION_ACTIONS.includes(action)) return false;
    // `US-PLT-F03-001` AC-1 and AC-3. Hide leaves Published, Restore leaves
    // Hidden, and a Draft or Archived Offering is somewhere neither action
    // was ever going.
    if (action === "HIDE_OFFERING") return input.lifecycle === "PUBLISHED";
    if (action === "RESTORE_OFFERING") return input.lifecycle === "HIDDEN";
    if (action === "RESTRICT_BUSINESS") return input.restricted !== true;
    if (action === "RESTORE_BUSINESS") return input.restricted === true;
    if (action === "SUSPEND_USER") return input.suspended !== true;
    if (action === "REINSTATE_USER") return input.suspended === true;
    return true;
  });
}

/**
 * Whether an applied action or recorded no-action decision resolves the case
 * (AC-7).
 *
 * Request Correction is deliberately not one. AC-6 keeps the case Open after
 * it, because a correction asks the Business to do something — the case stays
 * open precisely so somebody comes back and looks.
 */
export function resolvesCase(
  resolution: { action: ModerationAction } | { noActionReason: string }
): boolean {
  return (
    !("action" in resolution) || resolution.action !== "REQUEST_CORRECTION"
  );
}

/// Raised when closure is requested with nothing to close the case on (AC-7).
export class CaseNotResolvedError extends Error {
  constructor() {
    super("CASE_NOT_RESOLVED");
    this.name = "CaseNotResolvedError";
  }
}

/// Raised when an action is applied that the case's target does not admit
/// right now (AC-5).
export class ModerationActionUnavailableError extends Error {
  constructor(readonly action: ModerationAction) {
    super("MODERATION_ACTION_UNAVAILABLE");
    this.name = "ModerationActionUnavailableError";
  }
}

export const moderationModule = { name: "moderation" } as const;
