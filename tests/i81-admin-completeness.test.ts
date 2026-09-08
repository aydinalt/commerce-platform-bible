import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { ACTIONABLE_QUEUES } from "../modules/analytics/src/index.js";
import {
  ADVERTISING,
  ANALYTICS,
  PLACEMENTS,
  REPORTS,
  RETIRED
} from "../apps/web/src/platform/copy.js";

/**
 * `I81` — the Admin panel's missing content.
 *
 * The Owner asked for the panel's gaps to be closed and its content examined.
 * The audit found a shape worth naming: **almost nothing here was a missing
 * feature. Every defect was a fact the API already answered and the interface
 * threw away.**
 *
 * - the report queue asked for a total and discarded it, so a backlog of four
 *   hundred showed a hundred rows and no sign of the rest;
 * - the case queue rendered the target's *type*, so twenty Offering cases were
 *   twenty rows reading "İlan";
 * - §12.3's Affiliate workload tally was computed and shown nowhere, because
 *   `/admin` summed its three categories into one link;
 * - `analytics.actionable` — the addresses §12.5 exists to provide — was read
 *   by no file at all, and one of its two entries was an API endpoint rather
 *   than a page;
 * - five surfaces printed raw ISO timestamps at people;
 * - `advertisingSettings.updatedAt` never reached the kill-switch screen.
 *
 * The cases below pin each of those to the thing that would have to be undone
 * to reintroduce it.
 */
describe("Increment I81 the Admin panel's content", () => {
  const read = (path: string): string => readFileSync(path, "utf8");

  /**
   * The same comment-stripping `i48-management-surfaces` needed, for the same
   * reason (I81).
   *
   * A case below forbids `case-target.tsx` from rendering the target's state,
   * and that file's own doc comment *explains* that it must not — naming
   * lifecycle, restriction and suspension in order to rule them out. Read
   * against the raw file, the check fails on the sentence that documents it,
   * and the cheapest way to pass becomes deleting the explanation. A guard that
   * pays authors to remove its own rationale is worse than no guard.
   */
  const code = (path: string): string =>
    read(path)
      .replaceAll(/\/\*[\s\S]*?\*\//gu, " ")
      .replaceAll(/^\s*\/\/.*$/gmu, " ");

  const ADMIN = "apps/web/src/app/admin";

  it("carries the report queue's total, and says when the page is not all of it", () => {
    const api = read("apps/web/src/platform/api.ts");
    /*
     * The defect was one character of destructuring: `.reports` on the parsed
     * body threw the count away. Asserted as the absence of that access rather
     * than the presence of a field, because the field could return and still
     * be dropped here.
     */
    expect(api).not.toMatch(/listingReportsSchema\.parse\([^)]*\)\.reports/u);
    const page = read(`${ADMIN}/listing-reports/page.tsx`);
    expect(page).toContain("queue.total");
    expect(page).toContain("REPORTS.showingOldest");
    // The truncation notice must be conditional: a queue that fits says nothing.
    expect(page).toContain("queue.total > reports.length");
    expect(typeof REPORTS.showingOldest(3)).toBe("string");
  });

  it("names which thing a moderation case is about, and never how it is doing", () => {
    const target = code(`${ADMIN}/moderation-cases/case-target.tsx`);
    expect(target).toContain("offeringTitle");
    expect(target).toContain("businessName");
    /*
     * **The line this component must not cross.** `US-PLT-F02-001` AC-9 keeps a
     * case from publishing its target's product state; the case response
     * carries none, and this is the natural place somebody would add it back.
     */
    for (const state of ["lifecycle", "restricted", "suspended"])
      expect(target, `case target must not render ${state}`).not.toContain(
        state
      );
    // Both surfaces use it, so the queue and the detail page cannot disagree.
    expect(read(`${ADMIN}/moderation-cases/page.tsx`)).toContain(
      "caseTargetText"
    );
    expect(read(`${ADMIN}/moderation-cases/[caseId]/page.tsx`)).toContain(
      "CaseTarget"
    );
  });

  it("shows §12.3's Affiliate workload split rather than only its sum", () => {
    expect(read(`${ADMIN}/analytics-table.tsx`)).toContain(
      "analytics.destinationWorkload"
    );
    expect(ANALYTICS.destinationWorkload.length).toBeGreaterThan(0);
  });

  it("points every actionable indicator at a page a person can open", () => {
    /*
     * `DESTINATION_WORKLOAD` was `/admin/offerings/affiliate-destinations/
     * workload` — the API route the figure is fetched from. An Admin following
     * it arrived at JSON. AC-15 says the indicator opens the queue it counts,
     * and the queue a person opens is an Admin page.
     *
     * The check is structural rather than a list of two strings: any address
     * that starts with the API's own prefix is an endpoint, whatever it is
     * called.
     */
    for (const [name, href] of Object.entries(ACTIONABLE_QUEUES)) {
      expect(href, `${name} must be a page`).toMatch(/^\/admin\//u);
      expect(href, `${name} must not be an API route`).not.toMatch(
        /^\/admin\/offerings\//u
      );
    }
  });

  it("hands the overview's figures off to the queues behind them", () => {
    const page = code(`${ADMIN}/overview/page.tsx`);
    // Read from the response, not hard-coded: one place knows where a queue is.
    expect(page).toContain("analytics.actionable.OPEN_MODERATION_CASES");
    expect(page).toContain("analytics.actionable.DESTINATION_WORKLOAD");
    /*
     * AC-16: no core-flow indicator is actionable. The overview must not grow a
     * link out of one — they are things that happened, with nowhere to go.
     */
    expect(page).not.toMatch(/coreFlow/u);
  });

  it("writes every Admin moment as a date rather than an ISO string", () => {
    /*
     * The five sites the audit found. Each renders through `<When>`, which
     * formats in `tr-TR` and keeps the machine-readable value in `dateTime`.
     */
    for (const [path, field] of [
      [`${ADMIN}/listing-reports/page.tsx`, "report.submittedAt"],
      [`${ADMIN}/moderation-cases/page.tsx`, "entry.openedAt"],
      [`${ADMIN}/moderation-cases/[caseId]/page.tsx`, "found.openedAt"],
      [`${ADMIN}/offering-feeds/page.tsx`, "feed.lastRun.finishedAt"],
      [`${ADMIN}/advertising/page.tsx`, "settings.updatedAt"]
    ] as const) {
      const source = read(path);
      expect(source, `${path} should format ${field}`).toContain(
        `<When value={${field}} />`
      );
      // The bare interpolation is what it replaced, and must not come back.
      expect(source, `${path} still prints ${field} raw`).not.toContain(
        `{${field}}\n`
      );
    }
  });

  it("says when the master switch makes a placement serve nothing", () => {
    const page = read(`${ADMIN}/complementary-placements/page.tsx`);
    expect(page).toContain("PLACEMENTS.masterSwitchOff");
    /*
     * Lenient on an unreadable setting: a wrong "nothing is serving" is worse
     * than a missing note, so the notice requires a definite `false`.
     */
    expect(page).toContain("!settings.enabled");
    expect(page).toContain("!isUnavailable(settings)");
    expect(PLACEMENTS.masterSwitchOff.length).toBeGreaterThan(0);
  });

  it("keeps the panel in one language", () => {
    /*
     * `(retired)` was the only English left, in three places, and the I27
     * consolidation detectors never saw it because it sits inside a JSX
     * expression rather than between tags.
     */
    expect(RETIRED).not.toMatch(/retired/iu);
    for (const path of [
      `${ADMIN}/categories/page.tsx`,
      `${ADMIN}/attributes/page.tsx`
    ])
      expect(read(path), `${path} still says (retired)`).not.toContain(
        "(retired)"
      );
  });

  it("shows when the kill switch was last moved", () => {
    // The first question somebody opening it in an emergency has.
    expect(read(`${ADMIN}/advertising/page.tsx`)).toContain(
      "ADVERTISING.updated"
    );
    expect(typeof ADVERTISING.updated).toBe("string");
  });
});
