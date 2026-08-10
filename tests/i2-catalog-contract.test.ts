import { describe, expect, it } from "vitest";

import {
  ATTRIBUTE_VALUE_KINDS as CATALOG_KINDS,
  V1_DOMAINS as CATALOG_DOMAINS
} from "../modules/catalog/src/index.js";
import {
  ATTRIBUTE_VALUE_KINDS as CONTRACT_KINDS,
  V1_DOMAINS as CONTRACT_DOMAINS,
  createCategorySchema
} from "../packages/contracts/src/index.js";

/**
 * Shared packages may not import product modules, so the V1 Domain list is
 * stated twice: once by the Catalog module that owns the concept, once by the
 * published contract. Two spellings of a closed set will drift the moment
 * nobody is watching, so this is what watches.
 */
describe("V1 Domain list", () => {
  it("agrees between the Catalog module and the published contract", () => {
    expect([...CONTRACT_DOMAINS]).toEqual([...CATALOG_DOMAINS]);
  });

  it("is exactly the three Domains of PRD-0001", () => {
    expect([...CATALOG_DOMAINS]).toEqual([
      "MOBILITY",
      "REAL_ESTATE",
      "TECHNOLOGY"
    ]);
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
