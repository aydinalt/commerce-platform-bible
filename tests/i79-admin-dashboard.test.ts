import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  FEATURE_FLAGS,
  featureEnabled
} from "../apps/web/src/platform/flags.js";
import { OVERVIEW } from "../apps/web/src/platform/copy.js";

/**
 * `I79` — the overview dashboard.
 *
 * The Owner asked for the last item of his admin architecture document: *"Mevcut
 * Next.js ve Tailwind v4 altyapımızla, metrik kartlarını (toplam ilan,
 * moderasyon vakaları) ve CTR/etkileşim raporlarını görselleştirecek ana panoyu
 * inşa etmeye başla."*
 *
 * The figures all existed. `/admin/analytics` has computed every one of them
 * since `US-PLT-F10-001`, and the Affiliate Handoff Rate since `I78`. What did
 * not exist was a surface that shows them at a glance — so **the risk this
 * increment carries is not a missing feature but a duplicated one**, and that is
 * what the cases below are about.
 *
 * The ways a dashboard goes wrong, each of which this one would do by default:
 *
 * - **it computes its own totals**, and becomes the second place the platform
 *   answers "how many listings are there" — the two drift, and the one people
 *   believe is whichever they opened first;
 * - **it draws a rate for a listing nobody has opened**, turning `PRD-0006`
 *   v2.5 §11.6.3's deliberate `null` into a `%0` bar that says the opposite of
 *   what is true;
 * - **it scales each bar to itself**, so a listing opened twice looks the size
 *   of one opened four thousand times;
 * - **it acquires a verb**, which `US-PLT-F10-001` AC-17 forbids of a dashboard;
 * - **it ships turned on**, which is the Owner's standing instruction for a new
 *   Admin surface and the one thing a flag cannot enforce about itself.
 */
describe("Increment I79 the overview dashboard", () => {
  const page = readFileSync("apps/web/src/app/admin/overview/page.tsx", "utf8");
  const bars = readFileSync(
    "apps/web/src/app/admin/overview/engagement-bars.tsx",
    "utf8"
  );
  const card = readFileSync(
    "apps/web/src/app/admin/overview/metric-card.tsx",
    "utf8"
  );

  it("is a declared flag, and is off unless it is named", () => {
    expect(FEATURE_FLAGS).toContain("ADMIN_DASHBOARD");
    /*
     * The three ways a deployment variable arrives wrong all mean off. A flag
     * that defaulted to on would be a flag in name only, and the Owner asked
     * for adoption to be a separate decision from merging.
     */
    expect(featureEnabled("ADMIN_DASHBOARD", undefined)).toBe(false);
    expect(featureEnabled("ADMIN_DASHBOARD", "")).toBe(false);
    expect(featureEnabled("ADMIN_DASHBOARD", "OFFERING_FEEDS")).toBe(false);
    expect(featureEnabled("ADMIN_DASHBOARD", "admin_dashboard")).toBe(true);
  });

  it("refuses the route before it looks at the session", () => {
    /*
     * Order matters and is asserted as order. If the session check came first,
     * an unadopted surface would answer a signed-out visitor with a login
     * prompt that leads to a `404` — which tells them the route exists.
     */
    /*
     * Measured inside the function body, not the file. The first
     * `SESSION_COOKIE` in the source is its import, which is above everything
     * and would make this pass no matter what order the checks ran in — the
     * first version of this case asserted exactly that and proved nothing.
     */
    const body = page.slice(page.indexOf("export default async function"));
    const flagAt = body.indexOf('featureEnabled("ADMIN_DASHBOARD")');
    const sessionAt = body.indexOf("jar.get(SESSION_COOKIE)");
    expect(flagAt).toBeGreaterThan(-1);
    expect(sessionAt).toBeGreaterThan(-1);
    expect(flagAt).toBeLessThan(sessionAt);
  });

  it("passes the same Admin gate as every other Admin surface", () => {
    // Not a gate of its own. There is exactly one Admin tier — `adminContext`
    // — and a dashboard inventing a second would be the place a parallel
    // authorization model starts.
    expect(page).toContain("fetchAdminPanel");
    expect(page).toContain("notFound()");
  });

  it("has no verb", () => {
    /*
     * `US-PLT-F10-001` AC-17: no moderation or management action may happen
     * from a dashboard. The way to guarantee that is for the surface to have
     * nothing on it that could — no form, no server action, no mutating call.
     */
    for (const source of [page, bars, card]) {
      expect(source).not.toMatch(/<form/u);
      expect(source).not.toMatch(/<button/u);
      expect(source).not.toMatch(/"use server"/u);
      expect(source).not.toMatch(/method:\s*"(POST|PUT|PATCH|DELETE)"/u);
    }
  });

  it("reads only what the analytics endpoint already answers", () => {
    /*
     * The whole point of the surface. Every figure comes from `fetchAnalytics`
     * — one request, the same one `/admin` makes — and no other read appears.
     * A dashboard that fetched a count of its own would be a second definition
     * of that count.
     */
    expect(page).toContain("fetchAnalytics");
    const reads = page.match(/fetch[A-Z]\w+/gu) ?? [];
    expect([...new Set(reads)].sort()).toEqual([
      "fetchAdminPanel",
      "fetchAnalytics"
    ]);
  });

  it("says unavailable rather than zero", () => {
    /*
     * UX-0006 §14, and a card is where it is easiest to lose: a big `0` is the
     * most confident thing on a dashboard and would be a lie about a figure
     * nobody managed to read. The card takes `number | null` and renders words
     * for the `null`.
     */
    expect(card).toContain("value === null");
    expect(card).toContain("OVERVIEW.cardUnavailable");
    expect(OVERVIEW.cardUnavailable).not.toMatch(/^0$|^—$/u);
  });

  it("draws no rate for a listing that has none", () => {
    /*
     * `PRD-0006` v2.5 §11.6.3. An Offering nobody has opened carries
     * `rate === null`, and the figures line must say so in words rather than
     * rendering a zero-width bar that looks like data.
     */
    expect(bars).toContain("row.rate === null");
    expect(bars).toContain("HANDOFF_RATE.noRate");
  });

  it("scales every bar against the most-opened listing, not against itself", () => {
    /*
     * The comparison an Admin came for. Bar length must mean opens across the
     * whole chart; scaling each bar to its own maximum would make every row
     * full-width and destroy the only thing the drawing adds over the table.
     */
    expect(bars).toContain("Math.max(...rows.map((row) => row.opens), 1)");
    expect(bars).toContain("(row.opens / widest) * 100");
  });

  it("does not re-sort the rows the API ordered by opens", () => {
    /*
     * §11.6 keeps analytics from recommending. Sorting by rate would put a
     * 1-of-2 listing above a 300-of-1000 one, which turns an observation into
     * a ranking — and a ranking is a decision about which listing matters.
     */
    expect(bars).not.toMatch(/\.sort\(/u);
  });

  it("does not replace the panel it links to", () => {
    /*
     * The Owner asked for a dashboard, not for the removal of the surface that
     * works — and behind a flag, a replacement nobody had adopted would leave
     * an Admin with neither.
     *
     * The link moved into `PageHead`'s props when I82 adopted the reference
     * template's header, so this looks for the address rather than for the
     * attribute it used to be written as. What must remain true is that the
     * overview points at `/admin`; how the markup spells it is not the claim.
     */
    expect(page).toContain('"/admin"');
  });
});
