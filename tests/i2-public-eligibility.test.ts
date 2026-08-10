import { describe, expect, it } from "vitest";

import {
  composePublicEligibility,
  type BusinessExposureInput,
  type OfferingLifecycle
} from "../modules/offering/src/index.js";

const LIFECYCLES: OfferingLifecycle[] = [
  "DRAFT",
  "PUBLISHED",
  "HIDDEN",
  "ARCHIVED"
];
const EXPOSURES: BusinessExposureInput[] = ["ELIGIBLE", "INELIGIBLE"];

/**
 * PRD-0001 §7.3 states the composition as a table, so it is tested as one.
 * Enumerating every combination is what makes this a proof rather than a
 * sample: eight inputs, exactly one of which may produce `Eligible`.
 */
describe("final Offering Public Eligibility", () => {
  it("is Eligible only for a Published Offering of an Eligible Business", () => {
    const eligible = LIFECYCLES.flatMap((lifecycle) =>
      EXPOSURES.map((businessExposure) => ({
        businessExposure,
        lifecycle,
        result: composePublicEligibility({ businessExposure, lifecycle }).status
      }))
    ).filter((row) => row.result === "ELIGIBLE");

    expect(eligible).toEqual([
      {
        businessExposure: "ELIGIBLE",
        lifecycle: "PUBLISHED",
        result: "ELIGIBLE"
      }
    ]);
  });

  it("names the lifecycle input when the lifecycle withholds the result", () => {
    // The lifecycle answer is the more specific one: an Archived Offering
    // under a Restricted Business is not usefully described as "the Business
    // is ineligible".
    for (const lifecycle of ["DRAFT", "HIDDEN", "ARCHIVED"] as const)
      expect(
        composePublicEligibility({
          businessExposure: "INELIGIBLE",
          lifecycle
        }).reason
      ).toBe(`LIFECYCLE_${lifecycle}`);
  });

  it("names the Business input when only the Business withholds it", () => {
    expect(
      composePublicEligibility({
        businessExposure: "INELIGIBLE",
        lifecycle: "PUBLISHED"
      })
    ).toEqual({ reason: "BUSINESS_INELIGIBLE", status: "INELIGIBLE" });
  });

  it("carries no reason when the result is Eligible", () => {
    expect(
      composePublicEligibility({
        businessExposure: "ELIGIBLE",
        lifecycle: "PUBLISHED"
      })
    ).toEqual({ reason: null, status: "ELIGIBLE" });
  });
});
