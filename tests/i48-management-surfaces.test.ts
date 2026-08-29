import { readFileSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * The seventeen surfaces that had no visual system (I48).
 *
 * I26 built the token layer and I33 turned the direction from "calm" to "dense
 * listings". Both landed on the **public** surfaces, where Discovery, the
 * Listing Card and Compare each got the classes they needed as they were built.
 *
 * Measured before anything was written: **twenty of twenty-two `page.tsx` files
 * carried no `className` at all**, and the seventeen an owner or an Admin
 * actually works in — the Business Dashboard, every Admin screen, sign-in,
 * registration, recovery — were headings, paragraphs, forms and tables on a
 * bare page.
 *
 * ## Nothing here is a new direction
 *
 * The Owner replaced the direction on 2026-08-24 and listed what survives
 * regardless: lines rather than shadows, one accent and two states, no
 * animation, the focus ring, the measured contrast, `min-height: 2.75rem` on
 * every control. Every rule added is built from tokens that already existed.
 *
 * **`i26-design-foundation` reads the whole of `globals.css`**, so a shadow, an
 * animation, a fourth breakpoint or a fifth colour added by this increment
 * fails *that* suite. This one does not repeat those checks; it asserts that
 * they still apply to the file this increment grew.
 */
describe("Increment I48 the management surfaces", () => {
  const css = readFileSync("apps/web/src/app/globals.css", "utf8");

  /** The segments that carry a scope, and the scope each carries. */
  const SEGMENTS: Record<string, "auth" | "workspace"> = {
    account: "workspace",
    admin: "workspace",
    businesses: "workspace",
    login: "auth",
    recover: "auth",
    register: "auth"
  };

  it("scopes every management segment without touching a page", () => {
    /*
     * **The whole point of doing it this way.** The markup was already
     * semantic, so seventeen page edits would have bought nothing but
     * seventeen chances to style one of them differently — and the eighteenth
     * page, added later, would have been styled by whoever wrote it.
     *
     * A segment layout is the only place Next lets a scope be declared that a
     * new page inherits without agreeing to anything.
     */
    for (const [segment, scope] of Object.entries(SEGMENTS)) {
      const layout = readFileSync(
        `apps/web/src/app/${segment}/layout.tsx`,
        "utf8"
      );
      expect(layout).toContain(`className="${scope}"`);
    }
  });

  it("leaves every management page exactly as bare as it was", () => {
    /*
     * Asserted rather than described. If a later increment reaches for a class
     * on one of these pages, this fails and the question gets asked out loud:
     * does the pattern belong in the layer, or is this page genuinely
     * different?
     *
     * `/compare` and `/businesses/{id}` are the two public-facing exceptions
     * measured before this increment — Compare carries its own table classes
     * and the Dashboard one inventory class — and both are named so the count
     * cannot drift by accident.
     *
     * **I49 added `/` and had to say so here.** Home's entrance needed a width
     * narrower than the results grid, and that is a fact about Home rather than
     * a pattern the layer should carry — a `.entry` rule applied to every page
     * would cap the Discovery grid it exists to leave open. So the class went
     * on the page, this list grew by one, and the question the case exists to
     * force was asked and answered rather than skipped.
     */
    const classed: string[] = [];
    const walk = (directory: string): void => {
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const path = `${directory}/${entry.name}`;
        if (entry.isDirectory()) walk(path);
        else if (entry.name === "page.tsx")
          if (readFileSync(path, "utf8").includes("className"))
            classed.push(
              path.replace("apps/web/src/app", "").replace("/page.tsx", "")
            );
      }
    };
    walk("apps/web/src/app");
    expect(classed.sort()).toEqual([
      "",
      "/businesses/[businessId]",
      "/compare"
    ]);
  });

  it("gives a workspace the wide measure and prose the narrow one", () => {
    /*
     * A queue, a catalogue and an inventory are lists; `--measure` is 46rem
     * because that is where a *line* stops being readable, which is a fact
     * about prose and not about a table. I33 added `--measure-wide` for exactly
     * this and the public results grid was the only thing using it.
     */
    expect(css).toMatch(/\.workspace main > \*\s*\{[^}]*--measure-wide/u);
    expect(css).toMatch(/\.auth main > \*\s*\{[^}]*var\(--measure\)/u);
  });

  it("draws a panel with a line and a surface, not with elevation", () => {
    /*
     * The rule I26 states as "lines rather than shadows", applied to the one
     * component this increment adds. `i26` proves no `box-shadow` exists
     * anywhere in the file; this proves the panel positively uses the border
     * and the raised surface instead, so deleting the border and adding nothing
     * would fail here rather than pass both.
     */
    const panel = /\.workspace section \{([^}]*)\}/u.exec(css)?.[1] ?? "";
    expect(panel).toContain("1px solid var(--border)");
    expect(panel).toContain("var(--surface-raised)");
  });

  it("keeps an unclassed list away from every list that knows what it is", () => {
    /*
     * **The mistake this selector exists to avoid.** A bare `.workspace ul`
     * would have redrawn `.listing-cards` on the Business Dashboard as a
     * bordered row list — the Offering inventory silently losing the card
     * treatment the public side uses, on the one screen where an owner
     * compares their own listings with what a visitor sees.
     */
    expect(css).toContain(".workspace ul:not([class])");
    expect(css).not.toMatch(/\.workspace ul \{/u);
  });

  /**
   * The stylesheet with its prose removed.
   *
   * **The first version of the two cases below read the file whole, and both
   * were wrong for it.** One searched for `@media` widths and found `480` — in
   * a comment, explaining a breakpoint that had been *removed*. So a check
   * written to catch a fourth breakpoint was failed by a sentence saying there
   * were only three.
   *
   * That is the eighth time a check in this repository has matched something
   * other than what it meant, and it happened here in the increment that added
   * the most prose to the file it checks.
   */
  const rules = css.replaceAll(/\/\*[\s\S]*?\*\//gu, " ");

  it("adds no breakpoint of its own", () => {
    /*
     * The two-column form uses 768px, which is I26's own line. A form is the
     * obvious place to reach for a one-off width — "this one needs 900" — and
     * the scale is the decision, so a fourth number is a new decision nobody
     * took.
     */
    const widths = [
      ...rules.matchAll(/@media \((?:min|max)-width: (\d+)px\)/gu)
    ].map(([, px]) => Number(px));
    expect([...new Set(widths)].sort((a, b) => a - b)).toEqual([
      767, 768, 1120
    ]);
  });

  it("spends no control height on density", () => {
    /*
     * The Owner's own words: *density comes from spacing and from the grid, not
     * from smaller tap targets*. The layer adds spacing rules and a grid and
     * touches no control, so the floor stays exactly where I26 put it.
     *
     * **Compared as numbers rather than matched as text.** The first version
     * used a pattern meant to find anything below `2.75rem`, and `[0-2]`
     * followed by an optional decimal matched `2.75` itself — a check that
     * failed on the value it existed to permit.
     *
     * **Only the negative is asserted here.** `i33-site-shell` already names
     * the two rules positively — `button`, and `input, select, textarea` — and
     * repeating that would be two places to update when a third control
     * arrives. The guess that there were more than two was also wrong: four
     * control types are covered by exactly two declarations, measured.
     */
    const heights = [...rules.matchAll(/min-height:\s*([\d.]+)rem/gu)].map(
      ([, value]) => Number(value)
    );
    expect(heights.length).toBeGreaterThan(0);
    expect(heights.filter((height) => height < 2.75)).toEqual([]);
  });
});
