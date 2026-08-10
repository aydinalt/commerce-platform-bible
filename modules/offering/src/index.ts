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

export const offeringModule = { name: "offering" } as const;
