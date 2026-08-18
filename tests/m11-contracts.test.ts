import { describe, expect, it } from "vitest";

import {
  createDraftOfferingSchema,
  draftOfferingSchema
} from "../packages/contracts/src/index.js";

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

  /*
   * Two cases stood here, both about `TestPrincipalAdapter`: that it refused to
   * construct under `NODE_ENV=production`, and that it refused a malformed
   * identifier rather than passing one to the driver.
   *
   * They are not moved or renamed, because the thing they described no longer
   * exists — the adapter is deleted and the session cookie is the only way to
   * become a principal. What they were protecting is still protected, one layer
   * further in: `m11-http.integration.test.ts` presents a malformed session
   * token over the wire and requires a `401` in the published envelope, and the
   * production refusal is now vacuous because there is nothing to refuse.
   */
});
