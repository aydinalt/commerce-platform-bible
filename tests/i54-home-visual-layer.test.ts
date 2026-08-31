import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, describe, expect, it } from "vitest";

const GLOBALS = "apps/web/src/app/globals.css";
const HOME = "apps/web/src/app/page.tsx";
const SEARCH = "apps/web/src/app/search-entry.tsx";

/**
 * The source with its comments removed.
 *
 * **This helper exists because the first version of the last case failed on its
 * own explanation.** It asserted that Home's source does not contain the word
 * "results" — Home has no Results, that is the point of the case — and the
 * comment three lines above it said *"the prototype's home page is a results
 * screen"*. A check that reads prose is checking prose. `tests/i27` learned the
 * same lesson about `lang="en"` and solved it the same way.
 */
const code = (file: string): string =>
  readFileSync(file, "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//gu, "")
    .replaceAll(/^\s*\/\/.*$/gmu, "");

/**
 * Increment I54 — Tailwind arrives, on one route, without Preflight.
 *
 * **The danger in this increment is a change nobody can see.** Tailwind's usual
 * entry point, `@import "tailwindcss"`, carries Preflight — its own CSS reset —
 * and `globals.css` already resets what it resets. Importing the usual way would
 * have swapped the base underneath 88 hand-written rules across twenty-two
 * routes, on a commit whose stated scope was one page, and no test in this
 * repository renders a page to pixels. It would have been found by a person
 * noticing that something looked wrong.
 *
 * So the cases below assert the two halves of that: **Preflight is absent** and
 * **the utilities are present**. Both are checked against Tailwind's real
 * compiled output rather than against the source text, because the question is
 * what the browser receives, not what the file says.
 */
const scratch = mkdtempSync(join(tmpdir(), "i54-"));

/**
 * The stylesheet as Tailwind actually compiles it.
 *
 * `--content` is pointed at the two files Home is made of, so what comes out is
 * the CSS those two files cause — the same scan Next performs, run directly.
 */
const compiled = (): string => {
  const out = join(scratch, "out.css");
  execFileSync(
    "npx",
    [
      "@tailwindcss/cli",
      "--input",
      GLOBALS,
      "--output",
      out,
      "--content",
      `${HOME},${SEARCH}`
    ],
    { encoding: "utf8", stdio: "pipe" }
  );
  return readFileSync(out, "utf8");
};

describe("Increment I54 Home's visual layer", () => {
  afterAll(() => rmSync(scratch, { force: true, recursive: true }));

  it("imports Tailwind by part rather than whole, so Preflight stays out", () => {
    const css = readFileSync(GLOBALS, "utf8");

    /*
     * The bare import is the whole point of this assertion. Somebody tidying
     * three import lines into one would be making a reasonable-looking change
     * that resets every page in the product.
     */
    expect(css).not.toMatch(/@import\s+["']tailwindcss["']\s*;/u);
    expect(css).toContain('@import "tailwindcss/theme.css" layer(theme)');
    expect(css).toContain(
      '@import "tailwindcss/utilities.css" layer(utilities)'
    );
  });

  it("emits no reset over the elements the existing rules style", () => {
    const css = compiled();

    /*
     * **The signatures are taken from Tailwind's own `preflight.css`, not
     * guessed.** The first version of this case looked for the substring
     * `border-style: solid` and failed on `--tw-border-style: solid` — a custom
     * property that sets nothing, emitted for `@property` fallbacks. A reset is
     * a declaration on an element, so the check has to name declarations
     * Preflight makes and nothing else does.
     *
     * `text-size-adjust` and `font-feature-settings` appear in `preflight.css`
     * and in no utility; `blockquote, dl, dd` is its margin-reset selector list,
     * which no utility produces either.
     */
    for (const signature of [
      "text-size-adjust",
      "font-feature-settings",
      "blockquote, dl, dd"
    ])
      expect(css).not.toContain(signature);

    // And what the 88 rules do style is still there, unmodified.
    expect(css).toContain(".entry {");
    expect(css).toContain(".site-header {");
  });

  it("resolves Home's utilities through the tokens rather than beside them", () => {
    const css = compiled();

    /*
     * `@theme inline` makes `bg-accent` compile to `var(--accent)` — the custom
     * property `globals.css` has always declared — rather than to a hex value
     * copied into a Tailwind config. If it had been `@theme` instead of
     * `@theme inline`, this would read `background-color: #2c5f8a` and the file
     * would have become the second place the accent is written down.
     */
    expect(css).toMatch(/\.bg-accent\s*\{[^}]*var\(--accent\)/u);
    expect(css).toMatch(/\.text-text-muted\s*\{[^}]*var\(--text-muted\)/u);
    expect(css).not.toMatch(/\.bg-accent\s*\{[^}]*#2c5f8a/iu);
  });

  it("keeps every element UX-0001 §6 lists, and adds none", () => {
    const home = code(HOME);
    const search = code(SEARCH);

    // §7.1: the exact approved prompt, still labelling the field.
    expect(search).toContain("Bugün ne yapmak istiyorsunuz?");
    expect(search).toContain('htmlFor="discovery-query"');
    expect(search).toContain("<h1 className=");

    // §8: Browse entries are still a submission, not a link (AC-3).
    expect(home).toContain("action={beginBrowse}");
    expect(home).toContain('type="submit"');

    /*
     * §6 does not list Results, and the prototype's home page is a results
     * screen. This is the assertion that the visual migration stayed a visual
     * migration.
     */
    for (const absent of ["Listing", "results", "Sonuç", "filter"])
      expect(home).not.toContain(absent);
  });

  it("deletes the rules Home stopped using and keeps the ones it shares", () => {
    const css = readFileSync(GLOBALS, "utf8");
    const discovery = readFileSync(
      "apps/web/src/app/discovery/discovery-view.tsx",
      "utf8"
    );

    // Home was the only route applying these three.
    expect(css).not.toMatch(/^\.search-entry-row/mu);

    /*
     * `.entry` and `.entry-nav` are still applied by Discovery, so they stay —
     * and this asserts the reason rather than the fact. If Discovery stops using
     * them and the rules remain, that is the next increment's cleanup; if it
     * still uses them and they are deleted, this fails first.
     */
    expect(discovery).toMatch(/className="[^"]*\bentry\b/u);
    expect(css).toMatch(/^\.entry \{/mu);
    expect(css).toMatch(/^\.entry-nav \{/mu);
  });
});
