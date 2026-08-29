import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { BRAND, SITE } from "../apps/web/src/app/shell-copy.js";
import { REQUIRED_MARKER } from "../apps/web/src/form-copy.js";
import { TITLES } from "../apps/web/src/identity/copy.js";
import { TERMS } from "../apps/web/src/vocabulary.js";

/**
 * The title, which no check reads (I51).
 *
 * I27, I28 and I29 consolidated the application onto Turkish and each proved it
 * with a detector. **Every one of those detectors reads markup** — first the
 * text between tags, then, after five corrections, the strings inside a JSX
 * expression. `export const metadata` is neither, so nothing in this repository
 * had ever looked at a page title.
 *
 * Measured across twenty-two routes:
 *
 * | | |
 * |---|---|
 * | Routes declaring their own title | 21 |
 * | Titles that were English | 2 — `Your account`, `Offering` |
 * | The site's own title and description | both English |
 *
 * The site's header says `İlanlar` on every page and every browser tab said
 * `Commerce Platform`. `/account` renders `<h1>{TITLES.account}</h1>` —
 * *Hesabınız* — sixty lines below a title that said `Your account`.
 *
 * A title is not decoration. It is the tab, the bookmark, the browser history
 * entry, the search result, and the first thing a screen reader announces on
 * arrival.
 */
describe("Increment I51 the page titles", () => {
  const APP = "apps/web/src/app";

  /** Every `page.tsx`, keyed by the route it serves. */
  const pages = new Map<string, string>();
  const walk = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name === "page.tsx")
        pages.set(
          path
            .replace(APP, "")
            .replace("/page.tsx", "")
            .replaceAll("\\", "/") || "/",
          readFileSync(path, "utf8")
        );
    }
  };
  walk(APP);

  const layout = readFileSync(`${APP}/layout.tsx`, "utf8");

  /** The expression a file gives as its `title:`, with comments removed. */
  const titleOf = (source: string): string =>
    /title:\s*([^,\n}]+)/u
      .exec(source.replaceAll(/\/\*[\s\S]*?\*\//gu, " "))?.[1]
      ?.trim() ?? "";

  it("gives every route a title of its own, and names the one exception", () => {
    /*
     * **Exactly one route may lean on the site's default**, and it is Home,
     * where the page and the site are the same thing: a tab reading `İlanlar`
     * on the front page is right, and `İlanlar — İlanlar` would not be.
     *
     * Asserted as the exact set rather than as a count, so a new route shipping
     * without a title fails here and has to argue that it is the front page.
     */
    const untitled = [...pages]
      .filter(
        ([, source]) => !/export const metadata|generateMetadata/u.test(source)
      )
      .map(([route]) => route);

    expect(pages.size).toBe(22);
    expect(untitled).toEqual(["/"]);
  });

  it("names the site once, and takes the tab from it", () => {
    /*
     * **The defect this increment exists for.** The layout said
     * `title: "Commerce Platform"` while `BRAND.name` — the word in the header
     * of all twenty-two routes — is `İlanlar`. A product with two names is what
     * that was, and the second one was in every tab.
     *
     * The default and the template both come from `BRAND.name`, so the name is
     * declared in one place and the tab cannot drift from the header.
     */
    expect(layout).toContain("default: BRAND.name");
    expect(layout).toContain("template: SITE.titleTemplate");
    expect(SITE.titleTemplate).toBe(`%s — ${BRAND.name}`);
    expect(SITE.titleTemplate.startsWith("%s")).toBe(true);
  });

  it("leaves no literal in a title but the three public ones, exactly", () => {
    /*
     * **An exact set rather than a language heuristic, and the reason is
     * `Karar`.** A detector that treats ASCII-only text as English is what
     * every earlier language case does, and it would report the Decision
     * flow's own Turkish title as English — Turkish reaches `ç ğ ı ö ş ü`
     * within a sentence, not within one five-letter word.
     *
     * So this asserts the set instead, which is the pattern that has not failed
     * here. `Your account` and `Offering` were removed by this increment;
     * `Karşılaştırma`, `Karar` and `Sonuçlar` remain as literals and are
     * **acknowledged rather than fixed**: the public routes never had their
     * copy extracted into a module — I31 recorded that boundary — and doing it
     * is a job of its own rather than a line in this one.
     *
     * A fourth literal, in any language, fails here.
     */
    const literals = [...pages.values()]
      .map((source) => titleOf(source))
      .filter((expression) => expression.startsWith('"'))
      .map((expression) => expression.slice(1, -1))
      .sort();

    expect(literals).toEqual(["Karar", "Karşılaştırma", "Sonuçlar"]);
  });

  it("makes the account tab and the account heading one decision", () => {
    /*
     * The exact shape of what was wrong: the same fact, in two languages, in
     * one file. Both now name `TITLES.account`, so translating one translates
     * the other and neither can be left behind again.
     */
    const account = pages.get("/account") ?? "";
    expect(titleOf(account)).toBe("TITLES.account");
    expect(account).toContain("<h1>{TITLES.account}</h1>");
    expect(TITLES.account).toBe("Hesabınız");
  });

  it("calls an Offering the same thing on both routes that show one", () => {
    /*
     * The owner's view said `Offering` and the public view said `İlan` — the
     * same object, two words, one of them in the wrong language. Both take
     * `TERMS.offering` now, which is where every other surface in the product
     * already gets that word.
     */
    for (const route of [
      "/offerings/[slug]",
      "/businesses/[businessId]/offerings/[offeringId]"
    ])
      expect(titleOf(pages.get(route) ?? ""), route).toBe("TERMS.offering");

    expect(TERMS.offering).toBe("İlan");
  });

  it("describes the site in Turkish, in one place, and only there", () => {
    /*
     * `description: "Decision-completion marketplace"` is the sentence a search
     * engine puts under the link, so it is the one piece of copy a person can
     * read without having visited. It is a translation of the Frozen phrase
     * rather than a new claim about the product.
     *
     * **No route declares its own description**, so there is one to keep right
     * rather than twenty-two to keep consistent.
     */
    expect(layout).toContain("description: SITE.description");
    expect(SITE.description).toMatch(/[çğıİöşüÇĞÖŞÜ]/u);

    const described = [...pages]
      .filter(([, source]) => /description:/u.test(source))
      .map(([route]) => route);
    expect(described).toEqual([]);
  });

  it("marks a required field in the language of the form", () => {
    /*
     * **The second position no language check reads**, and it was on screen:
     * `{required ? " (required)" : null}` beside `Görünen ad` on Business
     * Information. `i27`'s expression scan required the character after the
     * opening quote to be a letter and did not permit brackets, so this string
     * defeated it twice over — the twelfth wrong match here, in the detector
     * that had already been corrected five times.
     *
     * The leading space belongs to the value. A marker the caller has to space
     * correctly is one edit from `Görünen ad(zorunlu)`.
     */
    expect(REQUIRED_MARKER).toBe(" (zorunlu)");
    expect(REQUIRED_MARKER.startsWith(" ")).toBe(true);

    const form = readFileSync(
      `${APP}/businesses/[businessId]/information/information-form.tsx`,
      "utf8"
    );
    expect(form).toContain("{required ? REQUIRED_MARKER : null}");
  });
});
