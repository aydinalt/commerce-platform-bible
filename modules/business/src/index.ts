export type BusinessAccessDecision =
  | { allowed: true }
  | { allowed: false; reason: "NOT_FOUND" | "RESTRICTED" | "SUSPENDED" };

export interface BusinessAccessReader {
  /**
   * Whether this owner may do this particular thing right now.
   *
   * The intent is a parameter because restriction withdraws some acts and not
   * others (`US-BUS-F03-001` AC-5 to AC-9). A caller that does not say what it
   * is about to do cannot be given a correct answer.
   */
  canAuthorOfferings(
    businessId: string,
    userId: string,
    intent: OwnerIntent
  ): Promise<BusinessAccessDecision>;
}

/// Exactly one owner per Business in V1 (`US-BUS-F01-001` AC-8).
export interface OwnedBusiness {
  id: string;
  name: string;
  publicExposure: "ELIGIBLE" | "INELIGIBLE";
  slug: string;
  status: string;
}

/**
 * Everything the owner may see and edit for one Business
 * (`US-BUS-F02-001` AC-1, AC-2). Two groups live on one record and the split
 * between them is the Story: the public identity set, and protected Direct
 * Contact channels that never leave an authenticated path.
 */
export interface BusinessInformation extends OwnedBusiness {
  contactEmail: string | null;
  contactTelephone: string | null;
  contactUrl: string | null;
  logoUrl: string | null;
  shortDescription: string | null;
}

/// Display name plus supplied logo and short description — and nothing else
/// (`US-BUS-F02-001` AC-6).
export interface PublicBusinessIdentity {
  logoUrl: string | null;
  name: string;
  shortDescription: string | null;
}

/**
 * Composes the public Business identity set, or refuses to compose one at all.
 *
 * AC-8 forbids exposing any Business Information publicly while Business Public
 * Exposure Input is `Ineligible`, so this returns `null` rather than a redacted
 * object — there is no partially public Business.
 *
 * This is only the Business half of AC-7. Final Offering Public Eligibility is
 * owned by PRD-0001 and evaluated where an Offering is presented, so a caller
 * that has a non-null result here still has one more condition to satisfy.
 *
 * The parameter is the four fields this actually reads rather than the whole
 * owner record. A caller composing a public identity should not have to hold a
 * Business's protected contact channels in order to ask.
 */
export function publicBusinessIdentity(
  business: PublicBusinessIdentity & {
    publicExposure: OwnedBusiness["publicExposure"];
  }
): PublicBusinessIdentity | null {
  if (business.publicExposure !== "ELIGIBLE") return null;
  return {
    logoUrl: business.logoUrl,
    name: business.name,
    shortDescription: business.shortDescription
  };
}

/**
 * Whether any Direct Contact channel is supplied at all. AC-11 makes Direct
 * Contact unavailable where no approved channel exists, and AC-5 makes zero
 * channels a valid Business — so the absence is an expected state to be
 * reported, not an error.
 */
export function hasDirectContactChannel(
  business: BusinessInformation
): boolean {
  return Boolean(
    business.contactTelephone ?? business.contactEmail ?? business.contactUrl
  );
}

/**
 * Raised when the public slug is already taken. Translated from the driver-level
 * constraint so the interface layer never inspects PostgreSQL error codes.
 */
export class BusinessSlugConflictError extends Error {
  constructor(readonly slug: string) {
    super("BUSINESS_SLUG_CONFLICT");
    this.name = "BusinessSlugConflictError";
  }
}

/**
 * What an owner is trying to do (`US-BUS-F03-001` AC-5 to AC-9).
 *
 * Restriction is not a door being locked; it is a specific set of things being
 * withdrawn. A Restricted owner still manages the Business, still edits an
 * existing Draft, still sees what they published and still retires what they
 * no longer want — so a single "may this Business be authored" question was
 * always going to answer too many things at once.
 */
export const OWNER_INTENTS = [
  "MANAGE_INFORMATION",
  "VIEW_OWNED",
  "CREATE_OFFERING",
  "EDIT_DRAFT",
  "EDIT_PUBLISHED",
  "PUBLISH_OFFERING",
  "RETIRE_OFFERING",
  "MANAGE_AFFILIATE_DESTINATION"
] as const;

export type OwnerIntent = (typeof OWNER_INTENTS)[number];

/**
 * The three things restriction withdraws, and only those.
 *
 * AC-6 removes creating an Offering and publishing a Draft; AC-7 removes
 * normal editing of a Published or Hidden Offering, leaving the bounded
 * correction-edit path `US-PLT-F06-001` will own. Everything else in
 * `OWNER_INTENTS` survives, which is what AC-5, AC-8 and AC-9 say in three
 * different sentences.
 */
const WITHDRAWN_WHILE_RESTRICTED: readonly OwnerIntent[] = [
  "CREATE_OFFERING",
  "PUBLISH_OFFERING",
  "EDIT_PUBLISHED"
];

export function restrictionWithdraws(intent: OwnerIntent): boolean {
  return WITHDRAWN_WHILE_RESTRICTED.includes(intent);
}

/**
 * The Business-owned Request Correction targets (`US-BUS-F07-001` AC-1).
 *
 * PRD-0005 §12.1 names four, and the fifth thing people will ask for is a
 * correction against a User Account. AC-2 puts that outside V1, so it is not a
 * value here and not a value in the database either — a notice against an
 * account is not refused anywhere, because there is nowhere for it to be
 * written.
 */
export const CORRECTION_TARGETS = [
  "BUSINESS_INFORMATION",
  "OFFERING_CONTENT",
  "AFFILIATE_DESTINATION_CONFIGURATION",
  "DIRECT_CONTACT_INFORMATION"
] as const;

export type CorrectionTarget = (typeof CORRECTION_TARGETS)[number];

/**
 * The parts of Offering content a correction may aim at (AC-9).
 *
 * Category is absent. A correction exists to fix what an Offering says, and
 * moving a Published Offering into a different part of the catalogue while its
 * Business is Restricted is a different act with different consequences for
 * Discovery — one PRD-0001's ordinary edit path owns, under the ordinary gate.
 */
export const OFFERING_CONTENT_AREAS = [
  "TITLE",
  "SUMMARY",
  "ATTRIBUTES"
] as const;

export type OfferingContentArea = (typeof OFFERING_CONTENT_AREAS)[number];

/**
 * The management area a notice opens (AC-4).
 *
 * A total mapping rather than a lookup that might miss: every target has
 * exactly one area, so a notice can always say where to go, and no notice can
 * point somewhere the target did not name.
 */
export const CORRECTION_MANAGEMENT_AREAS = {
  AFFILIATE_DESTINATION_CONFIGURATION: "AFFILIATE_DESTINATION",
  BUSINESS_INFORMATION: "BUSINESS_INFORMATION",
  DIRECT_CONTACT_INFORMATION: "BUSINESS_INFORMATION",
  OFFERING_CONTENT: "OFFERING_CONTENT"
} as const satisfies Record<CorrectionTarget, string>;

export type CorrectionManagementArea =
  (typeof CORRECTION_MANAGEMENT_AREAS)[CorrectionTarget];

/**
 * Whether the bounded correction-edit path is open right now (AC-8).
 *
 * PRD-0005 §8.3.1 writes this as a conjunction of five conditions, and it is
 * expressed as one here for the same reason: a path that could be entered with
 * four of them satisfied would be a path around restriction rather than a
 * narrow exception to it.
 *
 * Ownership is not a parameter — it is settled before this is asked, by the
 * query that found the correction at all. A correction reached through an
 * ownership join belongs to the acting owner or was never found.
 */
export function boundedCorrectionAvailable(input: {
  caseOpen: boolean;
  lifecycle: "DRAFT" | "PUBLISHED" | "HIDDEN" | "ARCHIVED";
  target: CorrectionTarget;
}): boolean {
  return (
    input.caseOpen &&
    input.target === "OFFERING_CONTENT" &&
    (input.lifecycle === "PUBLISHED" || input.lifecycle === "HIDDEN")
  );
}

/// Raised when a correction save names a content area the notice did not
/// target (AC-9, AC-10).
export class CorrectionAreaNotTargetedError extends Error {
  constructor(readonly area: OfferingContentArea) {
    super("CORRECTION_AREA_NOT_TARGETED");
    this.name = "CorrectionAreaNotTargetedError";
  }
}

/// Raised when the bounded path is entered without every condition of AC-8.
export class BoundedCorrectionUnavailableError extends Error {
  constructor(readonly reason: string) {
    super("BOUNDED_CORRECTION_UNAVAILABLE");
    this.name = "BoundedCorrectionUnavailableError";
  }
}

export const businessModule = { name: "business" } as const;
