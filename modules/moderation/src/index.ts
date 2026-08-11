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

export const moderationModule = { name: "moderation" } as const;
