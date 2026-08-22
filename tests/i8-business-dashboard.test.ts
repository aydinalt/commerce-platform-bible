import { renderToStaticMarkup } from "react-dom/server";

import { INVENTORY } from "../apps/web/src/business/copy.js";
import { describe, expect, it } from "vitest";

import type { BusinessDashboardResponse } from "../packages/contracts/src/index.js";
import { InventoryGroup } from "../apps/web/src/app/businesses/[businessId]/inventory-group";
import {
  ELIGIBILITY_COPY,
  ENTRY_LABELS,
  LIFECYCLE_GROUPS,
  offersCreate
} from "../apps/web/src/business/inventory";

/**
 * UX-0005 Business Dashboard — the inventory.
 *
 * The screen composes almost nothing, and that is what these tests protect.
 * `US-BUS-F05-001` already decided which entries are permitted, from the same
 * two authorities the write path consults; a Dashboard that filtered them
 * again would be a second opinion and eventually a different one. So most of
 * what follows checks that the screen renders what it was given and adds no
 * judgement of its own.
 */
describe("Increment I8 Business Dashboard inventory", () => {
  const offering = (
    overrides: Partial<BusinessDashboardResponse["inventory"]["DRAFT"][number]>
  ): BusinessDashboardResponse["inventory"]["DRAFT"][number] => ({
    categoryId: "0f3a2b1c-4d5e-4a7b-8c9d-0e1f2a3b4c5d",
    createdAt: "2026-08-12T09:00:00.000Z",
    entries: ["VIEW"],
    id: "1a2b3c4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d",
    publicEligibility: "PENDING",
    slug: "kirmizi-araba",
    status: "DRAFT",
    title: "Kırmızı araba",
    updatedAt: "2026-08-12T09:00:00.000Z",
    ...overrides
  });

  const render = (
    group: (typeof LIFECYCLE_GROUPS)[number],
    offerings: BusinessDashboardResponse["inventory"]["DRAFT"]
  ) =>
    renderToStaticMarkup(
      InventoryGroup({ group, offerings }) as React.ReactElement
    );

  it("orders the four lifecycle groups the way the document writes them", () => {
    // §8. The order is meaning: what a person is still working on, what they
    // are offering, what the platform took out of circulation, and history.
    // A Dashboard that led with Archived would tell a different story about
    // the same Business.
    expect([...LIFECYCLE_GROUPS]).toEqual([
      "DRAFT",
      "PUBLISHED",
      "HIDDEN",
      "ARCHIVED"
    ]);
  });

  it("shows exactly the entries it was given", () => {
    const markup = render("DRAFT", [
      offering({
        entries: ["VIEW", "EDIT", "PUBLISH", "RETIRE"]
      })
    ]);

    // Four offered, four rendered. The screen neither adds one it thinks
    // ought to be there nor drops one it doubts.
    expect(markup).toContain(ENTRY_LABELS.VIEW);
    expect(markup).toContain(ENTRY_LABELS.EDIT);
    expect(markup).toContain(ENTRY_LABELS.PUBLISH);
    expect(markup).toContain(ENTRY_LABELS.RETIRE);
  });

  it("renders an Archived Offering as view-only without being told to", () => {
    const markup = render("ARCHIVED", [
      offering({
        entries: ["VIEW"],
        publicEligibility: "INELIGIBLE",
        status: "ARCHIVED"
      })
    ]);

    // §8, "Archived". No edit, no restore, no new destination authoring — and
    // this component contains no rule saying so. It was handed one entry and
    // rendered one entry, which is why the promise cannot drift.
    expect(markup).toContain(ENTRY_LABELS.VIEW);
    expect(markup).not.toContain(ENTRY_LABELS.EDIT);
    expect(markup).not.toContain(ENTRY_LABELS.RETIRE);
    expect(markup).not.toMatch(/restore|delete/iu);
  });

  it("never says a Published Offering is public", () => {
    const withheld = render("PUBLISHED", [
      offering({
        entries: ["VIEW", "RETIRE"],
        publicEligibility: "INELIGIBLE",
        status: "PUBLISHED"
      })
    ]);
    const visible = render("PUBLISHED", [
      offering({
        entries: ["VIEW", "EDIT", "RETIRE"],
        publicEligibility: "ELIGIBLE",
        status: "PUBLISHED"
      })
    ]);

    // §9, "Public eligibility language". Both are lifecycle Published and only
    // one is publicly visible, so the screen states the second fact separately
    // rather than letting the group heading imply it.
    expect(withheld).toContain(ELIGIBILITY_COPY.INELIGIBLE);
    expect(visible).toContain(ELIGIBILITY_COPY.ELIGIBLE);
    expect(withheld).not.toContain(ELIGIBILITY_COPY.ELIGIBLE);
  });

  it("reads a pending eligibility as undecided rather than as a promise", () => {
    const markup = render("DRAFT", [
      offering({ publicEligibility: "PENDING" })
    ]);

    // A Draft has no public standing yet, and saying "not publicly visible"
    // would overstate a decision nobody has made.
    expect(markup).toContain(ELIGIBILITY_COPY.PENDING);
    expect(ELIGIBILITY_COPY.PENDING).toMatch(/henüz belirlenmedi/u);
  });

  it("says so plainly when a group is empty", () => {
    const markup = render("HIDDEN", []);

    // §14. An empty group is a real answer and gets one, rather than the group
    // disappearing and leaving a person to wonder whether it was ever there.
    expect(markup).toContain(INVENTORY.emptyGroup);
  });

  it("offers creation only where moderation permits it", () => {
    // §14 again, and the case worth being careful about: an empty inventory is
    // exactly where an unavailable action is most tempting to show.
    expect(offersCreate("UNRESTRICTED")).toBe(true);
    expect(offersCreate("RESTRICTED")).toBe(false);
  });

  it("has a label for every entry the contract can carry", () => {
    // A vocabulary added upstream without a label here would render as
    // nothing at all, so the two are checked against each other. RESTORE and
    // DELETE appear in neither, because neither is a value the type can hold.
    expect(Object.keys(ENTRY_LABELS).sort()).toEqual([
      "EDIT",
      "MANAGE_AFFILIATE_DESTINATION",
      "PUBLISH",
      "RETIRE",
      "VIEW"
    ]);
    expect(JSON.stringify(ENTRY_LABELS)).not.toMatch(/restore|delete/iu);
  });
});
