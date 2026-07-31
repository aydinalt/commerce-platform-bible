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
