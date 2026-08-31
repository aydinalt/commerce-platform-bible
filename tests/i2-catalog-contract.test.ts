import { describe, expect, it } from "vitest";

import { ATTRIBUTE_VALUE_KINDS as CATALOG_KINDS } from "../modules/catalog/src/index.js";
import {
  ATTRIBUTE_VALUE_KINDS as CONTRACT_KINDS,
  createCategorySchema,
  domainKeySchema
} from "../packages/contracts/src/index.js";

/**
 * The Domain key, now that the set is open.
 *
 * **This block used to hold two tests and both are gone**, because what they
 * watched no longer exists. One asserted that `packages/contracts` and
 * `modules/catalog` spelled the same three-value list identically; the other
 * asserted the list was exactly `MOBILITY`, `REAL_ESTATE`, `TECHNOLOGY`. Frozen
 * PRD-0001 v4.0 §E makes a Domain a governed record and the set open —
 * `DOMAIN_SET_OPEN_DECISION.md` records the Owner decision — so there is no
 * second list to agree with and no third member to pin.
 *
 * What replaces them is the property that actually holds: the key is validated
 * for *shape* and not for *membership*. A test that only checked a fourth key
 * were accepted would pass against `z.string()`, which would accept a Domain
 * called `oops!` — so the refusals are asserted with it.
 */
describe("Domain key", () => {
  it("accepts a Domain nobody has thought of yet", () => {
    expect(domainKeySchema.parse("GARDEN")).toBe("GARDEN");
    expect(domainKeySchema.parse("HOME_AND_LIVING")).toBe("HOME_AND_LIVING");
  });

  it("still refuses a key that is not one", () => {
    for (const bad of ["", "lower", "Mixed_Case", "HAS SPACE", "TRAILING_"])
      expect(() => domainKeySchema.parse(bad)).toThrow();
  });

  it("bounds the key to the column that stores it", () => {
    expect(() => domainKeySchema.parse("A".repeat(81))).toThrow();
    expect(domainKeySchema.parse("A".repeat(80))).toHaveLength(80);
  });
});

describe("Attribute value kinds", () => {
  it("agree between the Catalog module and the published contract", () => {
    expect([...CONTRACT_KINDS]).toEqual([...CATALOG_KINDS]);
  });

  it("are exactly the five kinds of the Story", () => {
    // `US-PLT-F09-001` AC-2. Asserting the whole list rather than membership is
    // what makes a sixth kind fail here instead of quietly becoming selectable.
    expect([...CATALOG_KINDS]).toEqual([
      "TEXT",
      "NUMBER",
      "BOOLEAN",
      "SINGLE_SELECT",
      "MULTI_SELECT"
    ]);
  });
});

describe("Category creation contract", () => {
  const identity = { name: "Cars", slug: "cars", stableKey: "CARS" };

  it("accepts a root that names one Domain", () => {
    expect(
      createCategorySchema.safeParse({ ...identity, domain: "MOBILITY" })
        .success
    ).toBe(true);
  });

  it("accepts a child that names one parent", () => {
    expect(
      createCategorySchema.safeParse({
        ...identity,
        parentId: "0d1a2b3c-4d5e-4f60-8a9b-0c1d2e3f4a5b"
      }).success
    ).toBe(true);
  });

  it("refuses a request that names both", () => {
    // `US-PLT-F08-001` AC-7: a child inherits its Domain, so naming one
    // alongside a parent is a claim it is not entitled to make.
    expect(
      createCategorySchema.safeParse({
        ...identity,
        domain: "MOBILITY",
        parentId: "0d1a2b3c-4d5e-4f60-8a9b-0c1d2e3f4a5b"
      }).success
    ).toBe(false);
  });

  it("refuses a request that names neither", () => {
    // AC-6: a Category with no parent must have a Domain of its own.
    expect(createCategorySchema.safeParse(identity).success).toBe(false);
  });
});
