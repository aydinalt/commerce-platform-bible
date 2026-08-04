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

export const offeringModule = { name: "offering" } as const;
