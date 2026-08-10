export type BusinessAccessDecision =
  | { allowed: true }
  | { allowed: false; reason: "NOT_FOUND" | "RESTRICTED" | "SUSPENDED" };

export interface BusinessAccessReader {
  canAuthorOfferings(
    businessId: string,
    userId: string
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
 */
export function publicBusinessIdentity(
  business: BusinessInformation
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

export const businessModule = { name: "business" } as const;
