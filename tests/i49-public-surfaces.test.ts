import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * The layer above the public components (I49).
 *
 * I48 gave the seventeen management surfaces a visual system and the Owner
 * chose the public side next. **The components there were never the problem** —
 * measured before anything was written, `.listing-card` carries thirteen rules,
 * `.comparison` four, `.category-choices` its own button treatment, and 29 of
 * the stylesheet's 31 classes were already referenced.
 *
 * What the public routes lacked was the layer *above* them: the block a heading
 * and a row of buttons sit in, the width an entrance should have, and the rule
 * that separates a results heading from the results.
 *
 * ## A public block is not a workspace panel
 *
 * A panel is a container for work. These are entrances, and a results grid
 * boxed inside a card reads as a widget rather than as the page — so the
 * treatment is a rule and a muted label rather than a border on four sides.
 * Lines doing the work, which is the direction's own instruction rather than a
 * preference of this increment.
 */
describe("Increment I49 the public surfaces", () => {
  const css = readFileSync("apps/web/src/app/globals.css", "utf8");
  /*
   * The stylesheet with its comments removed, and with `@import` lines removed
   * too.
   *
   * **The second removal is I54's, and it is the tenth time something here has
   * matched other than what it meant.** Tailwind arrives by
   * `@import "tailwindcss/theme.css" layer(theme)`, and the class extractor
   * below reads `.css` out of that filename and reports it as a declared class.
   * A vocabulary check that counts filenames is counting the wrong thing, in the
   * direction that quietly grows the set.
   */
  const rules = css
    .replaceAll(/\/\*[\s\S]*?\*\//gu, " ")
    .replaceAll(/^@import[^;]*;$/gmu, " ");

  const discovery = readFileSync(
    "apps/web/src/app/discovery/discovery-view.tsx",
    "utf8"
  );
  const home = readFileSync("apps/web/src/app/page.tsx", "utf8");

  /*
   * **I55 moved this whole layer to Tailwind, and these five cases follow it
   * rather than being deleted.**
   *
   * I49 gave the public routes the layer *above* the components: the block a
   * heading and a row of buttons sit in, the rule under a results heading, the
   * narrow measure for an entrance. Every one of those was a class in
   * `globals.css`, and every one of them is now a utility beside the markup it
   * shapes — `.entry`, `.entry-nav`, `.category-choices`, `.results-heading`,
   * `.zero-results` and `.preparation-notice` are gone.
   *
   * The decisions did not go with them. A public block is still not a workspace
   * panel; the two ways into Discovery still get the same heading; a results
   * grid is still wide and an entrance still narrow. So the cases below assert
   * the same things at the place they are now stated, which is the only way a
   * migration can be checked at all: if the claim cannot be re-pointed, the
   * claim was about the selector rather than about the product.
   */
  it("leaves no rule behind for a route that stopped applying it", () => {
    /*
     * The Owner's rule of 2026-08-31, as a measurement. Each of these six names
     * had exactly one user, that user has moved, and the rule went with it — so
     * neither the stylesheet nor any component may still mention them.
     */
    for (const gone of [
      "entry",
      "entry-nav",
      "category-choices",
      "results-heading",
      "zero-results",
      "preparation-notice"
    ]) {
      expect(rules).not.toMatch(new RegExp(`^\\.${gone}[\\s,{>:]`, "mu"));
      expect(discovery).not.toContain(`className="${gone}"`);
    }
  });

  it("keeps the rules Compare still applies", () => {
    /*
     * `.listing-card` and its two companions stay, and the reason is the same
     * one that kept `.entry` alive through I54: Compare hand-writes the same
     * markup on its own route. **Discovery's Listing Card was deliberately not
     * moved** — moving it would have left the same object looking like two
     * different things depending on which page it was seen from, which is worse
     * than a stylesheet with three rules waiting for their second route.
     */
    const compare = readFileSync("apps/web/src/app/compare/page.tsx", "utf8");
    for (const kept of [
      "listing-cards",
      "listing-card",
      "listing-card-facts"
    ]) {
      expect(rules).toMatch(new RegExp(`^\\.${kept}[\\s,{]`, "mu"));
      expect(compare).toContain(`className="${kept}"`);
    }
  });

  it("keeps the entrance narrow and the results wide", () => {
    /*
     * **This is the one claim I dropped when re-pointing these cases, and a
     * mutant found it.** Narrowing Discovery's section to Home's measure passed
     * every rewritten case until this was added back.
     *
     * The reason it matters has not changed since I49 wrote it as `.entry`
     * against `--measure-wide`: a Search field is one decision and a wide input
     * invites nothing, while a results grid exists to be wide. The claim moved
     * from two CSS custom properties to two Tailwind widths; it is the same
     * claim, and it has to be made about both sides or it is not a comparison.
     */
    expect(home).toContain("max-w-2xl");
    expect(discovery).toContain("max-w-6xl");
    expect(discovery).not.toContain("max-w-2xl");
  });

  it("gives one pattern to the two places that do the same thing", () => {
    /*
     * Discovery's narrowing block and its widening block are the same act —
     * choosing a Category from a row of buttons — and Home's entrance was the
     * third. All three now say it in the same utilities rather than sharing a
     * class, so the check counts the utility string instead of the class name.
     */
    const row = 'className="flex list-none flex-wrap gap-2 p-0"';
    expect(discovery.match(new RegExp(row, "gu"))?.length ?? 0).toBe(2);
    expect(home).toContain(row);
  });

  it("puts the same results heading on both ways into Discovery", () => {
    /*
     * Discovery is reached by Search and by Browse and renders a different
     * heading for each. Styling one and forgetting the other is the ordinary way
     * a surface ends up with two personalities, so both are named — and the
     * heading still carries the 2px rule it borrowed from `.workspace h1`, which
     * is the single structural idea crossing the signed-in boundary.
     */
    const heading = "border-b-2 border-border-strong";
    expect(discovery.match(new RegExp(heading, "gu"))?.length ?? 0).toBe(2);
    expect(rules).toMatch(/\.workspace h1 \{[^}]*border-bottom: 2px/u);
  });

  it("adds nothing the direction forbids", () => {
    /*
     * **This increment introduced no box around an entrance.** The public
     * treatment is rules and spacing; a border on four sides would be the
     * workspace panel leaking onto a surface that must stay open.
     *
     * Two exceptions are deliberate and named rather than excluded by a loose
     * pattern: Zero Results is a dashed outline because it is a statement about
     * absence, and the Compare-preparation notice is bordered because it says a
     * constraint is in force. Both were bordered before I55 and both still are.
     */
    const boxes = discovery.match(/className="[^"]*\bborder\b[^"]*"/gu) ?? [];
    for (const box of boxes)
      expect(
        box.includes("border-dashed") ||
          box.includes("border-accent") ||
          box.includes("border-t") ||
          box.includes("border-b-2")
      ).toBe(true);
  });

  it("declares exactly these classes, and nothing has quietly become another", () => {
    /*
     * **Two versions of this case were defeated before it measured anything.**
     *
     * The first asked whether the file contained `.listing-card`. Renaming that
     * class away leaves `.listing-cards` behind, and the substring satisfied
     * the check — the plural covering for the singular, which is the collision
     * I28 found between four eligibility labels and I29 answered with a
     * pairwise check. The ninth time something here has matched other than what
     * it meant, and this one was mine.
     *
     * The second matched the name as a whole token and **still passed**,
     * because `.listing-card` appears in `.listing-card h3` and four other
     * selectors: asking whether a name is present cannot answer whether its
     * treatment survived.
     *
     * **I54 removed one name from this list and that is the case working.**
     * `.search-entry-row` was deleted when Home moved to Tailwind, and this
     * assertion failed until the removal was written down here. A vocabulary
     * that shrinks silently is the same defect as one that grows silently.
     *
     * So it asserts the whole vocabulary instead. Any rename, addition or
     * removal fails here and has to be acknowledged — which is what the two
     * broken versions were reaching for and could not express. It is the same
     * forcing function I45 used and I46 had to answer.
     *
     * **I50 added `.flow` and had to say so here**, one increment later. The
     * Decision flow's five sections needed a scope of their own, and this list
     * grew by one deliberately rather than by a check being loosened.
     */
    const declared = [...new Set(rules.match(/\.[a-z][a-z0-9-]*/gu) ?? [])]
      .map((selector) => selector.slice(1))
      .sort();

    expect(declared).toEqual([
      "attribute-absent",
      "attributes",
      "auth",
      "badge",
      "badge-critical",
      "badge-notice",
      "brand",
      "business-logo",
      "category-path",
      "comparison",
      "comparison-business",
      "decision-entries",
      "field-hint",
      "field-wide",
      "flow",
      "listing-card",
      "listing-card-facts",
      "listing-card-visual",
      "listing-cards",
      "offering-visuals",
      "site-footer",
      "site-header",
      "site-header-inner",
      "skeleton",
      "skeleton-stack",
      "skip-link",
      "stacking",
      "workspace"
    ]);
  });
});
