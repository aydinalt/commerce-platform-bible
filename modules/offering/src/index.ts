export interface DraftOfferingRecord {
  businessId: string;
  categoryId: string;
  createdAt: Date;
  id: string;
  slug: string;
  status: "DRAFT";
  summary: string | null;
  title: string;
  updatedAt: Date;
  version: number;
}

/**
 * Raised when the tenant-scoped `(business_id, slug)` uniqueness rule is
 * violated. The persistence adapter translates the driver-level constraint
 * error into this domain error so the interface layer never inspects
 * PostgreSQL error codes.
 */
export class OfferingSlugConflictError extends Error {
  constructor(readonly slug: string) {
    super("OFFERING_SLUG_CONFLICT");
    this.name = "OfferingSlugConflictError";
  }
}

export interface DraftOfferingRepository {
  create(input: {
    businessId: string;
    categoryId: string;
    correlationId: string;
    slug: string;
    summary?: string;
    title: string;
    userId: string;
  }): Promise<DraftOfferingRecord>;
  findOwned(
    businessId: string,
    offeringId: string
  ): Promise<DraftOfferingRecord | null>;
}

/// The four lifecycle states of PRD-0001 §6.
export type OfferingLifecycle = "DRAFT" | "PUBLISHED" | "HIDDEN" | "ARCHIVED";

/// Owned by PRD-0005 and consumed here without being recalculated.
export type BusinessExposureInput = "ELIGIBLE" | "INELIGIBLE";

export type PublicEligibility = "ELIGIBLE" | "INELIGIBLE";

/**
 * Why an Offering is not publicly eligible. Recorded so a consumer can say
 * which input withheld the result, rather than inferring it — PRD-0001 §7.1
 * makes this the only place that answer is computed.
 */
export type IneligibilityReason =
  | "BUSINESS_INELIGIBLE"
  | "LIFECYCLE_ARCHIVED"
  | "LIFECYCLE_DRAFT"
  | "LIFECYCLE_HIDDEN";

export interface EligibilityResult {
  reason: IneligibilityReason | null;
  status: PublicEligibility;
}

/**
 * Final Offering Public Eligibility, composed exactly as PRD-0001 §7.3 states
 * it: `Published` is the only lifecycle input that contributes `Eligible`, and
 * the Business input must agree.
 *
 * PRD-0001 is the Single Information Owner of this result and §7.1 forbids
 * consumers from recalculating it. That is only enforceable if there is one
 * function to call and one recorded answer to read, so both live here — a
 * second implementation elsewhere would be the failure, not a convenience.
 *
 * The lifecycle check comes first because it is the more specific answer: an
 * Archived Offering under a Restricted Business is not usefully described as
 * "the Business is ineligible".
 */
export function composePublicEligibility(input: {
  businessExposure: BusinessExposureInput;
  lifecycle: OfferingLifecycle;
}): EligibilityResult {
  if (input.lifecycle === "DRAFT")
    return { reason: "LIFECYCLE_DRAFT", status: "INELIGIBLE" };
  if (input.lifecycle === "HIDDEN")
    return { reason: "LIFECYCLE_HIDDEN", status: "INELIGIBLE" };
  if (input.lifecycle === "ARCHIVED")
    return { reason: "LIFECYCLE_ARCHIVED", status: "INELIGIBLE" };
  if (input.businessExposure !== "ELIGIBLE")
    return { reason: "BUSINESS_INELIGIBLE", status: "INELIGIBLE" };
  return { reason: null, status: "ELIGIBLE" };
}

/**
 * Why the Universal Publication Minimum is not satisfied (PRD-0001 §6.1.1).
 *
 * Business authorization and Business Moderation Status are deliberately absent
 * — §6.1.1 says in as many words that they are separate gates and not part of
 * the minimum. Folding them in here would make a Restricted Business look like
 * an incomplete Offering, which is a different problem with a different remedy.
 */
export type PublicationShortfall =
  | "BUSINESS_DISPLAY_NAME_MISSING"
  | "CATEGORY_NOT_ACTIVE_LEAF"
  | "REQUIRED_ATTRIBUTE_MISSING"
  | "TITLE_MISSING";

export interface PublicationMinimum {
  satisfied: boolean;
  shortfalls: PublicationShortfall[];
}

/**
 * The Universal Publication Minimum, evaluated once.
 *
 * PRD-0001 §6.1.1 defines it as a list of conditions rather than a single test,
 * and `US-OFR-F02-001` AC-5 needs to say *which* one failed, so every condition
 * is checked rather than short-circuiting on the first.
 *
 * The owning Business is not checked for existence: an Offering reaches this
 * function through its Business, and the database has no way to hold one
 * without exactly one owner.
 */
export function evaluatePublicationMinimum(input: {
  businessDisplayName: string;
  categoryActiveLeaf: boolean;
  missingRequiredAttributes: number;
  title: string;
}): PublicationMinimum {
  const shortfalls: PublicationShortfall[] = [];
  if (input.title.trim() === "") shortfalls.push("TITLE_MISSING");
  if (!input.categoryActiveLeaf) shortfalls.push("CATEGORY_NOT_ACTIVE_LEAF");
  if (input.missingRequiredAttributes > 0)
    shortfalls.push("REQUIRED_ATTRIBUTE_MISSING");
  if (input.businessDisplayName.trim() === "")
    shortfalls.push("BUSINESS_DISPLAY_NAME_MISSING");
  return { satisfied: shortfalls.length === 0, shortfalls };
}

/**
 * Raised when a Published or Hidden edit would leave the Offering below the
 * Universal Publication Minimum (AC-5). A Draft never raises it: a Draft is
 * allowed to be incomplete, which is what makes it a Draft.
 */
export class PublicationMinimumError extends Error {
  constructor(readonly shortfalls: PublicationShortfall[]) {
    super("PUBLICATION_MINIMUM_NOT_SATISFIED");
    this.name = "PublicationMinimumError";
  }
}

/// Raised when an edit names an Archived Offering (AC-7).
export class OfferingNotEditableError extends Error {
  constructor(readonly lifecycle: OfferingLifecycle) {
    super("OFFERING_NOT_EDITABLE");
    this.name = "OfferingNotEditableError";
  }
}

/**
 * The lifecycle states an owner may retire from (`US-OFR-F03-001` AC-1).
 *
 * `ARCHIVED` is absent, and that absence is AC-9's second half: retirement is a
 * transition *to* Archived, so there is no second one to make. PRD-0001 §6.4
 * allows no transition out of Archived either, which is AC-7's other half.
 */
export const RETIREABLE_LIFECYCLES: readonly OfferingLifecycle[] = [
  "DRAFT",
  "PUBLISHED",
  "HIDDEN"
];

/**
 * Raised when publication names an Offering that is not a Draft
 * (`US-OFR-F04-001` AC-1).
 *
 * It doubles as AC-8's guarantee: Published and Hidden are not publication
 * targets, and no route offers a transition back to Draft, so there is nothing
 * that could make one.
 */
export class OfferingNotPublishableError extends Error {
  constructor(readonly lifecycle: OfferingLifecycle) {
    super("OFFERING_NOT_PUBLISHABLE");
    this.name = "OfferingNotPublishableError";
  }
}

/**
 * Raised when the acting Business is Restricted (`US-OFR-F04-001` AC-2).
 *
 * Separate from the publication minimum on purpose: PRD-0001 §6.1.1 keeps
 * moderation outside the minimum so that "your Business is restricted" and
 * "your Offering is incomplete" stay two different answers with two different
 * remedies.
 */
export class BusinessRestrictedError extends Error {
  constructor() {
    super("BUSINESS_RESTRICTED");
    this.name = "BusinessRestrictedError";
  }
}

/// Raised when retirement names an Offering that is already Archived (AC-9).
export class OfferingAlreadyArchivedError extends Error {
  constructor() {
    super("OFFERING_ALREADY_ARCHIVED");
    this.name = "OfferingAlreadyArchivedError";
  }
}

/**
 * The lifecycle states whose Affiliate Destination a Business owner may author
 * (`US-OFR-F06-001` AC-1, AC-4; PRD-0001 §9.2).
 *
 * Archived is absent, which is AC-7: an Archived Offering and its destination
 * are view-only. The read path does not consult this list — being unable to
 * change something is not the same as being unable to see it.
 */
export const DESTINATION_AUTHORABLE: readonly OfferingLifecycle[] = [
  "DRAFT",
  "PUBLISHED",
  "HIDDEN"
];

export interface AffiliateDestinationRecord {
  handoffEligibility: "ELIGIBLE" | "INELIGIBLE";
  id: string;
  offeringId: string;
  reference: string;
  status: "DRAFT" | "ENABLED" | "DISABLED";
  validationReason: string | null;
  validationResult: "NOT_VALIDATED" | "VALID" | "INVALID";
  version: number;
}

/**
 * What authoring a destination produces, whatever its previous state
 * (PRD-0001 §9.5).
 *
 * Creation and editing land on the same three values, so they are one constant
 * rather than two matching literals — the reason §9.5 gives is that a changed
 * destination must not stay eligible under an earlier validation result, and
 * that reason does not distinguish the two.
 */
export const AUTHORED_DESTINATION_STATE = {
  handoffEligibility: "INELIGIBLE",
  status: "DRAFT",
  validationResult: "NOT_VALIDATED"
} as const;

/// Raised when an Offering already has the one destination V1 allows (AC-2).
export class AffiliateDestinationExistsError extends Error {
  constructor() {
    super("AFFILIATE_DESTINATION_EXISTS");
    this.name = "AffiliateDestinationExistsError";
  }
}

/// Raised when authoring is attempted against an Archived Offering (AC-7).
export class AffiliateDestinationReadOnlyError extends Error {
  constructor() {
    super("AFFILIATE_DESTINATION_READ_ONLY");
    this.name = "AffiliateDestinationReadOnlyError";
  }
}

/**
 * Affiliate Destination Handoff Eligibility (`US-OFR-F07-001` AC-10).
 *
 * A biconditional, not a flag: Eligible exactly when the destination is Enabled
 * *and* its current validation result is Valid. Four administration actions can
 * move those two inputs, so none of them sets this — they set what they change
 * and read the answer back from here.
 *
 * The case worth stating out loud is re-validating an already Enabled
 * destination as Invalid. AC-4 leaves its status Enabled, and this drops its
 * eligibility anyway, because eligibility was never a property of the status
 * alone.
 *
 * PRD-0001 §9 keeps this result separate from final Offering Public
 * Eligibility (AC-11), which is why nothing here consults an Offering.
 */
export function composeHandoffEligibility(input: {
  status: AffiliateDestinationStatus;
  validationResult: AffiliateValidationResult;
}): "ELIGIBLE" | "INELIGIBLE" {
  return input.status === "ENABLED" && input.validationResult === "VALID"
    ? "ELIGIBLE"
    : "INELIGIBLE";
}

export type AffiliateDestinationStatus = "DRAFT" | "ENABLED" | "DISABLED";
export type AffiliateValidationResult = "NOT_VALIDATED" | "VALID" | "INVALID";

/**
 * Raised when Enable names a destination whose current validation result is not
 * `Valid` (AC-6). Enabling an unvalidated destination would make it publicly
 * reachable on the strength of a check nobody performed.
 */
export class AffiliateNotValidatedError extends Error {
  constructor(readonly validationResult: AffiliateValidationResult) {
    super("AFFILIATE_NOT_VALIDATED");
    this.name = "AffiliateNotValidatedError";
  }
}

/// Raised when Disable names a destination that is not Enabled (AC-8).
export class AffiliateNotEnabledError extends Error {
  constructor(readonly status: AffiliateDestinationStatus) {
    super("AFFILIATE_NOT_ENABLED");
    this.name = "AffiliateNotEnabledError";
  }
}

/**
 * Raised when a submitted value does not match the kind its Attribute
 * definition declares — a number sent for a Text, several options for a Single
 * Select, an option belonging to another definition.
 */
export class AttributeValueMismatchError extends Error {
  constructor(readonly attributeId: string) {
    super("ATTRIBUTE_VALUE_MISMATCH");
    this.name = "AttributeValueMismatchError";
  }
}

/**
 * The two Offering moderation transitions, and only those
 * (`US-PLT-F03-001` AC-1 to AC-4).
 *
 * Written as a map from action to the lifecycle it may start from, so the
 * availability question and the application question are answered by the same
 * sentence. Hide leaves Published; Restore leaves Hidden. There is no third
 * entry.
 *
 * AC-6 is what the map does not contain. There is no Archive, no restoring an
 * Archived Offering, no returning Hidden to Draft and no publishing a Draft on
 * a Business's behalf. Those are not refused by a check — they are not actions
 * this type can name, so no Admin surface can offer one and no path can reach
 * one.
 */
export const OFFERING_MODERATION_SOURCE = {
  HIDE_OFFERING: "PUBLISHED",
  RESTORE_OFFERING: "HIDDEN"
} as const satisfies Record<string, OfferingLifecycle>;

export type OfferingModerationAction = keyof typeof OFFERING_MODERATION_SOURCE;

/// What each action produces. PRD-0001 owns both results; this restates the
/// pair only so the two halves of one transition cannot drift apart.
export const OFFERING_MODERATION_RESULT = {
  HIDE_OFFERING: "HIDDEN",
  RESTORE_OFFERING: "PUBLISHED"
} as const satisfies Record<OfferingModerationAction, OfferingLifecycle>;

export function offeringModerationPermitted(input: {
  action: OfferingModerationAction;
  lifecycle: OfferingLifecycle;
}): boolean {
  return OFFERING_MODERATION_SOURCE[input.action] === input.lifecycle;
}

/**
 * Raised when Hide or Restore names an Offering whose lifecycle does not admit
 * it (AC-1, AC-3).
 *
 * It carries what was found rather than what was wanted, because the useful
 * thing to know is the state that refused — an Archived Offering is not a
 * Published one that failed, it is somewhere the action was never going.
 */
export class OfferingModerationUnavailableError extends Error {
  constructor(
    readonly action: OfferingModerationAction,
    readonly lifecycle: OfferingLifecycle
  ) {
    super("OFFERING_MODERATION_UNAVAILABLE");
    this.name = "OfferingModerationUnavailableError";
  }
}

export const offeringModule = { name: "offering" } as const;

/**
 * The Offering actions a Dashboard may offer (`US-BUS-F05-001` AC-2).
 *
 * A closed list, and what is missing from it is the point: there is no
 * `RESTORE`, because AC-10 forbids a Business owner returning a Hidden
 * Offering to Published, and no `DELETE`, because AC-12 gives V1 no permanent
 * deletion at all. Neither can be offered by mistake, because neither is a
 * value this type can hold.
 */
export const OFFERING_ENTRIES = [
  "VIEW",
  "EDIT",
  "PUBLISH",
  "RETIRE",
  "MANAGE_AFFILIATE_DESTINATION"
] as const;

export type OfferingEntry = (typeof OFFERING_ENTRIES)[number];

/**
 * Which entries are permitted for one Offering right now.
 *
 * Two authorities meet here and both must agree (AC-2): PRD-0001 decides what
 * a lifecycle state allows, and PRD-0005 decides what a Restricted Business
 * may still do. Composing them once means a surface cannot offer an action
 * that the write path would then refuse — the offer and the refusal are the
 * same rule read twice.
 *
 * `publicationMinimumSatisfied` is consumed rather than re-derived: AC-7 says
 * the feedback must not redefine the Universal Publication Minimum, and the
 * safest way not to redefine something is to be told the answer.
 */
export function permittedOfferingEntries(input: {
  lifecycle: OfferingLifecycle;
  publicationMinimumSatisfied: boolean;
  restricted: boolean;
}): OfferingEntry[] {
  return OFFERING_ENTRIES.filter((entry) => {
    // AC-11. An Archived Offering is history: readable, and nothing else.
    if (input.lifecycle === "ARCHIVED") return entry === "VIEW";

    if (entry === "VIEW") return true;
    // AC-5 and AC-14. A Draft is the owner's to edit whatever the Business's
    // standing; a Published or Hidden Offering is not, while Restricted.
    if (entry === "EDIT")
      return input.lifecycle === "DRAFT" || !input.restricted;
    // AC-6. Three conditions, and the minimum is one of them — a Publish entry
    // that led straight to a refusal would be an offer the platform could not
    // keep.
    if (entry === "PUBLISH")
      return (
        input.lifecycle === "DRAFT" &&
        !input.restricted &&
        input.publicationMinimumSatisfied
      );
    // AC-8 and AC-14. Retirement is permitted from every non-terminal state,
    // and restriction does not withdraw it.
    if (entry === "RETIRE") return true;
    // `US-BUS-F03-001` AC-9: authoring a destination survives restriction only
    // where the Offering itself is still owner-manageable.
    return input.lifecycle === "DRAFT" || !input.restricted;
  });
}

/**
 * Whether an Offering is currently the owner's to change (`US-BUS-F06-001`
 * AC-1, AC-6).
 *
 * Two conditions, from two authorities: PRD-0001 §9.2 says which lifecycle
 * states admit authoring at all, and PRD-0005 says a Restricted Business keeps
 * only its Drafts. Naming the conjunction once means the destination entry and
 * the destination write path cannot drift apart on what "owner-manageable"
 * means, because there is only one sentence saying it.
 */
export function destinationManageable(input: {
  lifecycle: OfferingLifecycle;
  restricted: boolean;
}): boolean {
  if (!DESTINATION_AUTHORABLE.includes(input.lifecycle)) return false;
  return !input.restricted || input.lifecycle === "DRAFT";
}

/**
 * The Affiliate Destination entries a Business Dashboard may offer
 * (`US-BUS-F06-001` AC-2, AC-3).
 *
 * Three values, and the four that are missing are AC-9: there is no `REVIEW`,
 * `VALIDATE`, `ENABLE` or `DISABLE`, because those are PRD-0006 administration
 * actions and a Business owner has none of them. They are not omitted from a
 * check — they are not values this type can hold, so no Business surface can
 * offer one even by mistake.
 */
export const DESTINATION_ENTRIES = ["VIEW", "CREATE", "EDIT"] as const;

export type DestinationEntry = (typeof DESTINATION_ENTRIES)[number];

/**
 * Which destination entries are permitted for one Offering right now.
 *
 * `VIEW` is offered only where a destination exists, because looking at
 * something absent is not an entry; and it is offered wherever one exists,
 * including for an Archived Offering, which is AC-10 — view-only rather than
 * invisible.
 *
 * `CREATE` and `EDIT` are the same permission asked of two different worlds:
 * zero-or-one association means exactly one of them can ever apply (AC-5,
 * PRD-0001 §9.1). Neither is offered where the Offering is not the owner's to
 * change, which is AC-1 and, for a Restricted Business, AC-6.
 */
export function permittedDestinationEntries(input: {
  exists: boolean;
  lifecycle: OfferingLifecycle;
  restricted: boolean;
}): DestinationEntry[] {
  const manageable = destinationManageable(input);
  return DESTINATION_ENTRIES.filter((entry) => {
    if (entry === "VIEW") return input.exists;
    if (entry === "CREATE") return manageable && !input.exists;
    return manageable && input.exists;
  });
}
