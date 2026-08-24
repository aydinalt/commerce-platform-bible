import { readFile } from "node:fs/promises";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { BRAND, FOOTER, NAV } from "../apps/web/src/app/shell-copy.js";

/**
 * The site shell, and a direction the Owner replaced (I33).
 *
 * **Twenty-two routes existed and there was no site.** No header, no
 * navigation, no footer, no brand mark — measured, not guessed: 22 pages, 60
 * components, 587 lines of CSS, and `layout.tsx` was `<html><body>{children}`.
 * Every page was correct in every rule it enforced and belonged to nothing.
 *
 * The Owner said "we still haven't moved to the frontend" twice before that
 * measurement was taken, and was right both times. What had been built was the
 * behaviour of an interface, not a product surface.
 *
 * On 2026-08-24 the Owner also **replaced I26's approved "calm, content-first"
 * direction with a dense listings one**, which is that document's own escape
 * clause being used: *"Where density would serve better than calm, this is the
 * wrong foundation and should be replaced rather than eroded."*
 */
describe("Increment I33 site shell", () => {
  let css = "";
  let code = "";
  let layout = "";

  beforeAll(async () => {
    css = await readFile("apps/web/src/app/globals.css", "utf8");
    code = css.replace(/\/\*[\s\S]*?\*\//gu, "");
    /*
     * **Comments stripped, for the third time in three files.**
     *
     * `layout.tsx` explains at length why no webfont is fetched, so a check for
     * the word `fetch` matched the paragraph saying it does not. The same shape
     * as I31's struck-through `lang="en"` and I33's own `480px` note: a check
     * that reads a file rather than the code cannot tell a decision from a
     * description of one.
     *
     * Three times is a pattern rather than an accident. This repository
     * comments heavily and on purpose, which means **every source-reading check
     * it writes must strip comments first** — otherwise the prose that makes
     * the code legible is the thing that breaks the tests.
     */
    layout = (await readFile("apps/web/src/app/layout.tsx", "utf8"))
      .replace(/\/\*[\s\S]*?\*\//gu, "")
      .replace(/\/\/.*$/gmu, "");
  });

  afterEach(() => {
    vi.resetModules();
  });

  /** The layout with a session cookie present, or absent. */
  const render = async (signedIn: boolean) => {
    vi.doMock("next/headers", () => ({
      cookies: () =>
        Promise.resolve({
          get: () => (signedIn ? { value: "session-token" } : undefined)
        })
    }));
    const { default: Layout } = await import("../apps/web/src/app/layout.js");
    type Shell = (props: never) => Promise<unknown>;
    return renderToStaticMarkup(
      (await (Layout as unknown as Shell)({
        children: createElement("main")
      } as never)) as never
    );
  };

  describe("every page belongs to something now", () => {
    it("carries a brand that links home", async () => {
      const markup = await render(false);

      /*
       * A wordmark rather than a logo. There is no mark to place and inventing
       * one would be design work on an asset that has to be right — but the
       * brand linking home from every page is the one navigation convention
       * nobody has to be taught, and that part is not optional.
       */
      expect(markup).toContain(BRAND.name);
      expect(markup).toMatch(
        /class="brand"[^>]*href="\/"|href="\/"[^>]*class="brand"/u
      );
      expect(markup).toContain(FOOTER.rights);
    });

    it("gives the header a landmark with a name", async () => {
      // Two navigation landmarks on a page need distinguishing, which I9 fixed
      // once already for Home's Category nav.
      const markup = await render(false);
      expect(markup).toContain("<header");
      expect(markup).toContain(`aria-label="${NAV.label}"`);
      expect(markup).toContain("<footer");
    });

    it("offers a way past the header to somebody using a keyboard", async () => {
      /*
       * WCAG 2.4.1. Off-screen rather than `display: none`, because a hidden
       * element is not focusable and the whole point is that it can be reached
       * — so the CSS moves it out of view and focus brings it back.
       */
      const markup = await render(false);
      expect(markup).toContain(BRAND.skip);
      expect(markup).toContain('href="#content"');
      expect(markup).toContain('id="content"');

      expect(code).toMatch(/\.skip-link\s*\{[^}]*position:\s*absolute/u);
      expect(code).toMatch(/\.skip-link:focus\s*\{[^}]*transform:\s*none/u);
      expect(code).not.toMatch(/\.skip-link\s*\{[^}]*display:\s*none/u);
    });

    it("adds no second main landmark", async () => {
      /*
       * The skip target is a `div`. Every page brings its own `main`, and two
       * landmarks with the same name is exactly the defect I9 spent an
       * increment removing.
       */
      const markup = await render(false);
      expect(markup.match(/<main/gu) ?? []).toHaveLength(1);
    });
  });

  describe("what the header is willing to say", () => {
    it("shows the two entries for somebody not signed in", async () => {
      const markup = await render(false);
      expect(markup).toContain(NAV.login);
      expect(markup).toContain(NAV.register);
      expect(markup).not.toContain(NAV.account);
    });

    it("shows the account entry for somebody who is", async () => {
      const markup = await render(true);
      expect(markup).toContain(NAV.account);
      expect(markup).not.toContain(NAV.login);
    });

    it("never names a context the person has not entered", async () => {
      /*
       * **Two states and no third, deliberately.** A header offering `Yönetici`
       * would tell anybody reading the markup that this account holds Admin
       * authorization — which UX-0008 §5 keeps behind an explicit context
       * entry, and which I7 built three gates for.
       *
       * It would also cost an API call on every page for an answer that can
       * change between two of them.
       */
      for (const signedIn of [true, false]) {
        const markup = await render(signedIn);
        expect(markup).not.toMatch(/Yönetici|İşletme bağlamı/u);
      }
    });

    it("treats the cookie as a hint rather than as proof", () => {
      /*
       * The presence of a cookie is not a valid session. It is not used as one:
       * every protected route re-checks with the API, and this only decides
       * which two links to draw. Getting it wrong costs a wasted click, not a
       * leak — asserted by the layout reaching for nothing but the cookie's
       * presence.
       */
      expect(layout).not.toMatch(/fetch|verifySession|readPrincipal/u);
      expect(layout).toContain("SESSION_COOKIE");
    });
  });

  describe("the direction the Owner replaced", () => {
    it("lets the results grid follow the room rather than a breakpoint", () => {
      /*
       * The density decision, expressed as `auto-fill` with a floor: the number
       * of columns is a consequence of the width instead of a fourth layout to
       * maintain. Five across on a wide screen, one on a phone, and no media
       * query — the first version had one at 480px and `i26` rejected it.
       */
      expect(code).toMatch(
        /\.listing-cards\s*\{[^}]*repeat\(auto-fill,\s*minmax\(/u
      );
    });

    it("widens the page for lists and leaves prose alone", () => {
      // A form and an error page stay at the width a line is readable at; a
      // grid of Offerings takes the room it needs.
      expect(code).toMatch(/main:has\(\.listing-cards\)\s*>\s*\*/u);
      expect(code).toMatch(/--measure:\s*46rem/u);
    });

    it("keeps everything that was never about calm", () => {
      /*
       * **The reversal is of spaciousness, not of restraint.** Lines rather
       * than shadows, one accent, no animation, the focus ring and the measured
       * contrast are accessibility or discipline; density is not a reason to
       * give any of them up, and this is where somebody would be tempted to.
       *
       * `i26` asserts each of these too. Repeated here because that suite now
       * describes a direction that no longer exists, and a reader could
       * reasonably conclude its constraints went with it.
       */
      expect(code).not.toMatch(/box-shadow/u);
      expect(code).not.toMatch(/@keyframes|animation:|transition:/u);
      expect(code).not.toMatch(/outline:\s*(none|0)/u);
      expect(code).toMatch(/:focus-visible\s*\{[^}]*outline:\s*2px solid/u);
    });

    it("does not shrink a control to buy density", () => {
      /*
       * Density comes from spacing and from the grid, not from smaller tap
       * targets. A 44px control is where a mis-tap costs most, and trading it
       * for two more rows would be paying in the wrong currency.
       */
      expect(code).toMatch(/button\s*\{[^}]*min-height:\s*2\.75rem/u);
      expect(code).toMatch(
        /input,\s*\n?\s*select,\s*\n?\s*textarea\s*\{[^}]*min-height:\s*2\.75rem/u
      );
    });

    it("keeps body text at the size a phone will not zoom", () => {
      // The one type value that did not come down. 16px is the browser default
      // and the floor below which a focused input triggers a zoom on iOS.
      expect(code).toMatch(/--text-body:\s*1rem/u);
    });
  });
});
