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

export const offeringModule = { name: "offering" } as const;
