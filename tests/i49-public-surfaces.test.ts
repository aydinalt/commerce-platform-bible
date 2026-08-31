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

  const home = readFileSync("apps/web/src/app/page.tsx", "utf8");
  const discovery = readFileSync(
    "apps/web/src/app/discovery/discovery-view.tsx",
    "utf8"
  );

  it("gives one pattern to the two places that still do the same thing", () => {
    /*
     * Home's "or start from a category", Discovery's narrowing block and its
     * widening block are the same act — choosing a Category from a row of
     * buttons — so they get one class rather than three treatments that drift.
     */
    /*
     * **I54 moved Home to Tailwind and this case was re-counted, not relaxed.**
     * Home no longer applies `.entry-nav`; the two Discovery blocks still do,
     * and the rule stays in `globals.css` for exactly them. The claim is
     * unchanged in kind (one pattern for the places that share an act) and
     * changed in number, because one of the three left. When Discovery moves,
     * the rule goes with it and this case goes with the rule.
     */
    expect(rules).toContain(".entry-nav");
    expect(home).not.toContain('className="entry-nav"');
    expect(discovery.match(/className="entry-nav"/gu)?.length ?? 0).toBe(2);
  });

  it("narrows the entrance without narrowing the grid", () => {
    /*
     * **The reason `.entry` is a class on Home rather than a rule in the
     * layer.** A search field is one decision and a 76rem input invites
     * nothing, so the entrance takes the prose measure — but applying that to
     * every public `section` would cap the Discovery results grid, which exists
     * to be wide. The narrow width is a fact about Home, not a pattern.
     */
    expect(rules).toMatch(/\.entry \{[^}]*max-width: var\(--measure\)/u);
    expect(rules).not.toMatch(/\.entry \{[^}]*--measure-wide/u);
    /*
     * **Home used to be the file this asserted against, and I54 moved it.** The
     * narrow measure is still a fact about entrances rather than a pattern for
     * every public section, and Discovery's entrance still takes it from this
     * rule. Home says the same thing in Tailwind utilities beside its own
     * markup, so the assertion follows the rule's remaining user.
     */
    expect(discovery).toMatch(/className="[^"]*\bentry\b/u);
  });

  it("borrows the workspace's page rule, and only that", () => {
    /*
     * A results heading carries the same 2px rule `.workspace h1` carries, so
     * the two halves of the product read as one thing. It is the single
     * structural idea crossing the boundary and it crosses deliberately —
     * somebody who signs in should not feel they have arrived somewhere else.
     *
     * Asserted as *the same declaration* rather than as two similar ones, so a
     * later change to one is visible as a divergence from the other.
     */
    const workspace = /\.workspace h1 \{([^}]*)\}/u.exec(rules)?.[1] ?? "";
    const results = /\.results-heading \{([^}]*)\}/u.exec(rules)?.[1] ?? "";
    expect(results.trim()).not.toBe("");
    expect(results.trim()).toBe(workspace.trim());
  });

  it("puts the results heading on both ways into Discovery", () => {
    /*
     * Discovery is reached by Search and by Browse and renders a different
     * heading for each. Styling one and forgetting the other is the ordinary
     * way a surface ends up with two personalities, so both are named.
     */
    expect(discovery.match(/className="results-heading"/gu)?.length ?? 0).toBe(
      2
    );
  });

  it("adds nothing the direction forbids", () => {
    /*
     * `i26-design-foundation` proves this for the whole file and would fail
     * before this case did. What is asserted here is narrower and worth its own
     * line: **this increment introduced no class that paints a box**. The
     * public treatment is rules and spacing, and a border on four sides
     * appearing under `.entry` or `.entry-nav` would be the workspace panel
     * leaking onto a surface that must stay open.
     */
    for (const selector of [".entry ", ".entry-nav ", ".results-heading "]) {
      const block =
        new RegExp(`\\${selector.trim()} \\{([^}]*)\\}`, "u").exec(
          rules
        )?.[1] ?? "";
      expect(block).not.toMatch(/border-radius/u);
      expect(block).not.toMatch(/border:/u);
    }
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
      "category-choices",
      "category-path",
      "comparison",
      "comparison-business",
      "decision-entries",
      "entry",
      "entry-nav",
      "field-hint",
      "field-wide",
      "flow",
      "listing-card",
      "listing-card-facts",
      "listing-card-visual",
      "listing-cards",
      "offering-visuals",
      "preparation-notice",
      "results-heading",
      "site-footer",
      "site-header",
      "site-header-inner",
      "skeleton",
      "skeleton-stack",
      "skip-link",
      "stacking",
      "workspace",
      "zero-results"
    ]);
  });
});
