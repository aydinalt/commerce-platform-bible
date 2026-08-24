import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RESOLVING } from "../apps/web/src/failure-copy.js";
import { Resolving } from "../apps/web/src/app/resolving.js";

const APP = "apps/web/src/app";

/**
 * Loading Behaviour (I32).
 *
 * **Eight Frozen sections name it and there were zero `loading.tsx` files.**
 * Next.js keeps the previous page on screen until the next is ready, so
 * clicking a Listing Card did nothing visible for as long as the API took — up
 * to I25's ten-second budget. A person who presses a link and sees no change
 * presses it again.
 *
 * The interesting half of this increment is where a loading state is **not**
 * added, and why.
 */
describe("Increment I32 Loading Behaviour", () => {
  const segments = () =>
    readdirSync(APP, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.name === "loading.tsx")
      .map((entry) => String(entry.parentPath ?? entry.path).replace(APP, ""));

  describe("where a navigation waits", () => {
    it("covers each area with one file rather than each route", () => {
      /*
       * A segment inherits its nearest ancestor's loading state, so five files
       * cover fourteen routes. Asserted as a set because the placement is the
       * decision: one directory higher would swallow a sibling that must not
       * have one, and one lower would leave routes uncovered.
       */
      expect(segments().sort()).toEqual([
        "/admin",
        "/businesses",
        "/compare",
        "/decision",
        "/offerings/[slug]"
      ]);
    });

    it("has no root loading state, because it would cascade", () => {
      /*
       * **This is the whole design.** `app/loading.tsx` applies to every
       * segment beneath it that does not define its own, and there is no way to
       * opt a segment out. A root file would therefore reach Home and Discovery
       * — the two places the Frozen documents forbid it.
       */
      expect(readdirSync(APP)).not.toContain("loading.tsx");
    });
  });

  describe("where it is deliberately absent", () => {
    it("leaves Home alone, because Search must stay usable", () => {
      /*
       * UX-0001 §12, *Category loading*: "The person may still use Search where
       * Search entry is available."
       *
       * A `loading.tsx` replaces the whole segment, Search entry included — so
       * the compliant loading state for Home is one that keeps Search and marks
       * only the Categories as resolving. `loading.tsx` receives no props and
       * cannot read anything, so it cannot be that; the fix is a Suspense
       * boundary around the Category region inside the page, which is a change
       * to Home rather than a file beside it.
       */
      expect(segments()).not.toContain("");

      // And the thing §12 protects is still there to be protected: Home
      // renders the Search entry regardless of what the Categories are doing.
      const home = readFileSync(join(APP, "page.tsx"), "utf8");
      expect(home).toContain("SearchEntry");
    });

    it("leaves Discovery alone, because the criteria must stay visible", () => {
      /*
       * UX-0002 §13: "current criteria remain visible" while results resolve,
       * and "the experience does not silently change criteria".
       *
       * The criteria live in the carrier cookie, and a `loading.tsx` is a
       * synchronous fallback that cannot read one — an async fallback suspends
       * itself and shows nothing, which defeats the purpose. So the compliant
       * loading state cannot be written as a file beside the page.
       *
       * **Neither option available today is fully compliant**, and that is the
       * finding rather than a thing to paper over. Without a boundary the
       * previous page stays, so the criteria remain visible but its result
       * actions stay clickable — §13's third line. With one, the actions go but
       * so do the criteria. The compliant answer needs the criteria to be
       * knowable synchronously, which means the URL rather than a cookie, and
       * the cookie was chosen deliberately in I4 so that a prefetch cannot
       * record a Discovery Start.
       */
      expect(segments()).not.toContain("/discovery");
      expect(segments()).not.toContain("");
    });
  });

  describe("what the resolving surface says", () => {
    it("says it in words, not only in shapes", () => {
      const markup = renderToStaticMarkup(createElement(Resolving));

      /*
       * I9. A state a person cannot hear is a state they do not have, and a
       * silent loading screen is the case where that costs most: it is
       * indistinguishable from nothing happening, which is what makes somebody
       * press the link again.
       */
      expect(markup).toContain(RESOLVING.heading);
      expect(markup).toContain(RESOLVING.body);
      expect(markup).toContain('role="status"');
      expect(markup).toContain('aria-busy="true"');
    });

    it("announces progress rather than interrupting", () => {
      // `alert` interrupts whatever is being read. This is progress, not a
      // problem, and the difference is audible.
      const markup = renderToStaticMarkup(createElement(Resolving));
      expect(markup).not.toContain('role="alert"');
    });

    it("hides the shapes from a reader, and says nothing three times", () => {
      const markup = renderToStaticMarkup(createElement(Resolving));

      // Grey rectangles carry nothing a reader could use, and repeating
      // "loading" once per line is worse than saying it once.
      expect(markup).toContain('aria-hidden="true"');
      expect(markup.match(new RegExp(RESOLVING.body, "gu"))).toHaveLength(1);
    });

    it("promises nothing about how long", () => {
      /*
       * No progress bar and no estimate: the platform has no such number, and
       * I25's ten-second budget is a limit rather than a prediction. A bar that
       * fills at a made-up rate is a claim.
       */
      const markup = renderToStaticMarkup(createElement(Resolving));
      expect(markup).not.toContain("progressbar");
      expect(markup).not.toMatch(/saniye|%/u);
    });
  });

  describe("motion", () => {
    it("adds none, because the approved foundation forbids it", () => {
      /*
       * **The first version of this increment pulsed the skeleton and
       * `i26-design-foundation` caught it.** "No animation" is a constraint the
       * Owner approved on 2026-08-21, for a stated reason: motion needs a
       * `prefers-reduced-motion` story that would otherwise be discovered by
       * somebody it harms.
       *
       * The reasoning survives contact with this case. A pulsing skeleton says
       * nothing a still one does not — the sentence carries the state and the
       * shapes carry where the content will be — so the motion was decoration
       * bought at the price of a decision somebody had already made.
       *
       * Asserted here as well as in `i26` because this is where the temptation
       * lives: a loading screen is the one surface that seems to need movement.
       */
      const css = readFileSync(join(APP, "globals.css"), "utf8");
      const resolving = css.slice(css.indexOf("Resolving (I32)"));
      expect(resolving).not.toMatch(/@keyframes|animation:|transition:/u);
    });
  });
});
