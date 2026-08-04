import { describe, expect, it } from "vitest";

import {
  createDraftOfferingSchema,
  draftOfferingSchema
} from "../packages/contracts/src/index.js";
import { TestPrincipalAdapter } from "../modules/identity/src/index.js";

const id = "11111111-1111-4111-8111-111111111111";

describe("Milestone 11 contracts", () => {
  it("accepts the narrow Draft Offering input", () => {
    expect(
      createDraftOfferingSchema.parse({
        categoryId: id,
        slug: "safe-draft",
        title: "Safe draft"
      })
    ).toMatchObject({ slug: "safe-draft" });
  });

  it("accepts a Draft Offering response", () => {
    const now = new Date().toISOString();
    expect(
      draftOfferingSchema.parse({
        businessId: id,
        categoryId: id,
        createdAt: now,
        id,
        slug: "safe-draft",
        status: "DRAFT",
        summary: null,
        title: "Safe draft",
        updatedAt: now,
        version: 1
      }).status
    ).toBe("DRAFT");
  });

  it("fails closed when test principal is enabled in production", () => {
    expect(() => new TestPrincipalAdapter("production", true)).toThrow(
      "TEST_PRINCIPAL_FORBIDDEN_IN_PRODUCTION"
    );
  });

  it("refuses a principal whose identifiers are not well formed", () => {
    const adapter = new TestPrincipalAdapter("test", true);
    const headers = {
      "x-correlation-id": id,
      "x-test-session-id": id,
      "x-test-user-id": id
    };

    expect(adapter.resolve(headers)).toMatchObject({ userId: id });

    for (const header of Object.keys(headers)) {
      expect(() =>
        adapter.resolve({ ...headers, [header]: "'; drop table x; --" })
      ).toThrow("TEST_PRINCIPAL_MALFORMED");
    }
  });
});
