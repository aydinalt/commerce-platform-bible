import { describe, expect, it } from "vitest";

import { evaluatePublicationMinimum } from "../modules/offering/src/index.js";

const complete = {
  businessDisplayName: "Kadıköy Motors",
  categoryActiveLeaf: true,
  missingRequiredAttributes: 0,
  title: "A listing"
};

/**
 * PRD-0001 §6.1.1 lists the conditions, and `US-OFR-F02-001` AC-5 needs to say
 * which one failed. So each condition is checked on its own, and the case that
 * matters most is the last one: several failures are reported together rather
 * than the first one hiding the rest.
 */
describe("Universal Publication Minimum", () => {
  it("is satisfied when every condition holds", () => {
    expect(evaluatePublicationMinimum(complete)).toEqual({
      satisfied: true,
      shortfalls: []
    });
  });

  it("names a missing title", () => {
    expect(
      evaluatePublicationMinimum({ ...complete, title: "   " }).shortfalls
    ).toEqual(["TITLE_MISSING"]);
  });

  it("names a Category that is not an active leaf", () => {
    expect(
      evaluatePublicationMinimum({ ...complete, categoryActiveLeaf: false })
        .shortfalls
    ).toEqual(["CATEGORY_NOT_ACTIVE_LEAF"]);
  });

  it("names a required Attribute with no value", () => {
    expect(
      evaluatePublicationMinimum({
        ...complete,
        missingRequiredAttributes: 2
      }).shortfalls
    ).toEqual(["REQUIRED_ATTRIBUTE_MISSING"]);
  });

  it("names an owning Business with no display name", () => {
    expect(
      evaluatePublicationMinimum({ ...complete, businessDisplayName: "" })
        .shortfalls
    ).toEqual(["BUSINESS_DISPLAY_NAME_MISSING"]);
  });

  it("reports every shortfall rather than stopping at the first", () => {
    // Fixing one problem only to be told about the next is a poor way to learn
    // what is wrong with an Offering.
    expect(
      evaluatePublicationMinimum({
        businessDisplayName: "",
        categoryActiveLeaf: false,
        missingRequiredAttributes: 1,
        title: ""
      }).shortfalls
    ).toEqual([
      "TITLE_MISSING",
      "CATEGORY_NOT_ACTIVE_LEAF",
      "REQUIRED_ATTRIBUTE_MISSING",
      "BUSINESS_DISPLAY_NAME_MISSING"
    ]);
  });

  it("ignores Business authorization and moderation", () => {
    // §6.1.1 says in as many words that those are separate gates. Folding them
    // in would make a Restricted Business look like an incomplete Offering,
    // which is a different problem with a different remedy.
    expect(evaluatePublicationMinimum(complete).satisfied).toBe(true);
  });
});
