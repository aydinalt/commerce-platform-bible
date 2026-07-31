export type BusinessAccessDecision =
  | { allowed: true }
  | { allowed: false; reason: "NOT_FOUND" | "RESTRICTED" | "SUSPENDED" };

export interface BusinessAccessReader {
  canAuthorOfferings(
    businessId: string,
    userId: string
  ): Promise<BusinessAccessDecision>;
}

export const businessModule = { name: "business" } as const;
