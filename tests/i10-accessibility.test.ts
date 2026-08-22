import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const APP = "apps/web/src/app";

/** Every `page.tsx`, keyed by the route it serves. */
function routes(): { file: string; route: string }[] {
  const found: { file: string; route: string }[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (entry === "page.tsx")
        found.push({
          file: path,
          route: dir.slice(APP.length).replace(/\\/gu, "/") || "/"
        });
    }
  };
  walk(APP);
  return found.sort((a, b) => a.route.localeCompare(b.route));
}

/**
 * The routes still written in English.
 *
 * **This list is a record of an accident being cleaned up, and it only
 * shrinks.** The application declares `<html lang="tr">` and the public journey
 * is Turkish; eighteen surfaces were nonetheless written in English and marked
 * `lang="en"`, so a person who searched in Turkish and then signed in changed
 * language mid-journey.
 *
 * I27 translated UX-0008's six authentication surfaces and I28 the Business
 * Dashboard's five, which is why only `admin` is left. When Admin lands this
 * becomes an empty pattern and the case below still holds — a route marked
 * English while written in Turkish fails just as loudly as the reverse.
 */
const ENGLISH = /^\/admin(\/|$)/u;

/**
 * The accessibility properties, asserted as properties.
 *
 * These check what a person using a screen reader or a keyboard receives, not
 * the markup that happens to produce it today: a page may be rewritten, and
 * these should still hold or still fail for a reason worth reading.
 *
 * They are file-level rather than rendered because most of them are claims
 * about *every* route, and a rendering test would need a session, a database
 * and a fixture for each of the twenty-two. The cost of that is a test that
 * checks source text; the benefit is that all twenty-two are checked rather
 * than the two somebody had fixtures for.
 */
describe("Increment I10 accessibility", () => {
  it("gives every route a title of its own", () => {
    const untitled = routes().filter(
      ({ file }) =>
        !/export const metadata|generateMetadata/u.test(
          readFileSync(file, "utf8")
        )
    );

    // WCAG 2.4.2. Twenty-two pages once shared the title "Commerce Platform",
    // which tells somebody restoring a tab, reading a history list or hearing
    // the page announced exactly nothing about where they are.
    //
    // The Homepage keeps the site's own name, because there the site name is
    // the honest answer.
    expect(untitled.map((r) => r.route)).toEqual(["/"]);
  });

  it("says which routes are in English and which are not", () => {
    const layout = readFileSync(join(APP, "layout.tsx"), "utf8");
    const mislabelled = routes().filter(({ file, route }) => {
      const declares = /<main lang="en">/u.test(readFileSync(file, "utf8"));
      return ENGLISH.test(route) !== declares;
    });

    // WCAG 3.1.1 and 3.1.2. The document is Turkish because the public journey
    // is; the entered contexts are English and each says so on its own `main`.
    // Without the part-level declaration a screen reader applies Turkish
    // pronunciation to English words, which is nearer noise than accent.
    expect(layout).toContain('<html lang="tr">');
    expect(mislabelled.map((r) => r.route)).toEqual([]);
  });

  it("skips no heading level in the public result lists", () => {
    const card = readFileSync(join(APP, "discovery/listing-card.tsx"), "utf8");
    const compare = readFileSync(join(APP, "compare/page.tsx"), "utf8");
    const search = readFileSync(
      join(APP, "discovery/discovery-view.tsx"),
      "utf8"
    );

    // WCAG 1.3.1. A Listing Card is content directly beneath a page's `h1`, in
    // Search Results and in the Compare recovery list alike. At `h3` the level
    // between them is missing, and somebody moving by heading hears a section
    // that is not there.
    expect(search).toMatch(/<h1>“\{view\.query\}” için sonuçlar<\/h1>/u);
    expect(card).toContain("<h2>");
    expect(card).not.toContain("<h3>");
    expect(compare).not.toContain("<h3>");
  });

  it("gives every control a name a screen reader can read", () => {
    const offenders: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) {
          walk(path);
          continue;
        }
        if (!entry.endsWith(".tsx")) continue;
        const text = readFileSync(path, "utf8");
        const labelled = new Set([
          ...[...text.matchAll(/htmlFor="([^"]*)"/gu)].map((m) => m[1]),
          ...[...text.matchAll(/htmlFor=\{([^}]*)\}/gu)].map((m) => m[1].trim())
        ]);
        for (const m of text.matchAll(
          /<(input|select|textarea)\b([\s\S]*?)\/?>/gu
        )) {
          const attrs = m[2];
          if (/type="(hidden|submit)"/u.test(attrs)) continue;
          if (/aria-label(ledby)?=/u.test(attrs)) continue;
          const ids = [
            ...[...attrs.matchAll(/\bid="([^"]*)"/gu)].map((x) => x[1]),
            ...[...attrs.matchAll(/\bid=\{([^}]*)\}/gu)].map((x) => x[1].trim())
          ];
          if (ids.some((id) => labelled.has(id))) continue;
          offenders.push(`${path} ${m[1]}`);
        }
      }
    };
    walk("apps/web/src");

    // WCAG 3.3.2 and 4.1.2. A `legend` names the group, not the control inside
    // it, which is why the Category rename and move fields read as "edit text"
    // until each was given a label of its own.
    expect(offenders).toEqual([]);
  });

  it("names every navigation landmark", () => {
    const unnamed: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) {
          walk(path);
          continue;
        }
        if (!entry.endsWith(".tsx")) continue;
        for (const m of readFileSync(path, "utf8").matchAll(/<nav\b([^>]*)>/gu))
          if (!/aria-label(ledby)?=/u.test(m[1])) unnamed.push(path);
      }
    };
    walk("apps/web/src");

    // WCAG 1.3.1. Browse renders two of these at once — children and ancestors
    // — and a landmark list holding two unlabelled "navigation" entries tells
    // somebody moving by landmark nothing about which is which.
    expect(unnamed).toEqual([]);
  });

  it("announces every refusal where a screen reader will hear it", () => {
    const silent: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) {
          walk(path);
          continue;
        }
        if (!entry.endsWith(".tsx")) continue;
        const text = readFileSync(path, "utf8");
        // A surface that renders a refusal message must put it in a live
        // region. `state.message` is the one vocabulary every refusal uses.
        if (/\{state\.message\}/u.test(text) && !/role="alert"/u.test(text))
          silent.push(path);
      }
    };
    walk("apps/web/src");

    // WCAG 4.1.3. A refusal that only appears on screen is a refusal somebody
    // not looking at the screen never receives — and every one of these
    // surfaces is a place where the platform has just declined to do something
    // the person asked for.
    expect(silent).toEqual([]);
  });
});
