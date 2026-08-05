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
