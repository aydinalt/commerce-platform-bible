import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ABSENT, UNEXPECTED } from "../apps/web/src/failure-copy.js";
import NotFound from "../apps/web/src/app/not-found.js";
import RouteError from "../apps/web/src/app/error.js";
import GlobalError from "../apps/web/src/app/global-error.js";

const APP = "apps/web/src/app";

/**
 * The two screens a person reaches when the application breaks (I31).
 *
 * **Twenty-two routes had no error boundary and twenty-nine `notFound()` calls
 * had no page.** Every one of them produced Next.js's built-in screen: English,
 * no route back into the application, nothing to quote to anybody.
 *
 * The thirteen `notFound()` calls I24 kept deliberately — because answering
 * "unavailable" there would leak that something exists — were being given in
 * the wrong language by the increment that made them honest.
 */
describe("Increment I31 failure surfaces", () => {
  /** Next hands the boundary an `Error` and a way to try again. */
  const failure = (digest?: string) =>
    Object.assign(new Error("boom"), digest === undefined ? {} : { digest });

  describe("every route now has a boundary", () => {
    it("has an error boundary, a global one and a not-found page", () => {
      /*
       * Asserted as files rather than as behaviour, because that is what Next
       * looks for: a boundary that exists in a component but not at
       * `app/error.tsx` catches nothing at all.
       */
      const root = readdirSync(APP);
      expect(root).toContain("error.tsx");
      expect(root).toContain("global-error.tsx");
      expect(root).toContain("not-found.tsx");
    });

    it("leaves no route needing one of its own", () => {
      /*
       * One boundary at the root covers every segment beneath it, which is why
       * twenty-two files are not needed. This case exists to say that on
       * purpose: somebody counting `error.tsx` files and finding one could
       * otherwise conclude twenty-one routes were forgotten.
       *
       * A route folder may still add its own where a failure there deserves a
       * different answer. None does today.
       */
      const nested: string[] = [];
      const walk = (dir: string): void => {
        for (const entry of readdirSync(dir)) {
          const path = join(dir, entry);
          if (statSync(path).isDirectory()) walk(path);
          else if (entry === "error.tsx" && dir !== APP) nested.push(path);
        }
      };
      walk(APP);
      expect(nested).toEqual([]);
    });
  });

  describe("an uncaught error", () => {
    it("says what happened without claiming what failed", () => {
      const markup = renderToStaticMarkup(
        createElement(RouteError, { error: failure(), reset: () => undefined })
      );

      expect(markup).toContain(UNEXPECTED.heading);
      expect(markup).toContain(UNEXPECTED.body);
      /*
       * The sentence that stops a person guessing. A blank or broken screen
       * reads as "my work is gone", and it is not: this boundary catches a
       * failure while *rendering*, after any save has already resolved.
       */
      expect(markup).toContain(UNEXPECTED.unchanged);
    });

    it("offers a way out that is not the address that just failed", () => {
      const markup = renderToStaticMarkup(
        createElement(RouteError, { error: failure(), reset: () => undefined })
      );

      // Retry does something here; Home goes somewhere. Both, because a
      // transient failure and a permanent one need different answers.
      expect(markup).toContain("<button");
      expect(markup).toContain(UNEXPECTED.retry);
      expect(markup).toContain('href="/"');
    });

    it("announces itself rather than only being visible", () => {
      // I9. A state a person cannot hear is a state they do not have, and this
      // is the screen where not knowing costs most.
      const markup = renderToStaticMarkup(
        createElement(RouteError, { error: failure(), reset: () => undefined })
      );
      expect(markup).toContain('role="alert"');
    });

    it("shows a reference only when there is one", () => {
      const withDigest = renderToStaticMarkup(
        createElement(RouteError, {
          error: failure("abc123"),
          reset: () => undefined
        })
      );
      expect(withDigest).toContain("abc123");
      expect(withDigest).toContain(UNEXPECTED.reference);

      /*
       * A label with nothing after it is worse than no label: somebody would
       * read the empty space as the identifier and quote it. `digest` is absent
       * for a client-side error, so this is the ordinary case rather than the
       * edge one.
       */
      const without = renderToStaticMarkup(
        createElement(RouteError, { error: failure(), reset: () => undefined })
      );
      expect(without).not.toContain(UNEXPECTED.reference);
    });
  });

  describe("an error in the root layout", () => {
    it("brings its own document, because the one that draws it failed", () => {
      const markup = renderToStaticMarkup(
        createElement(GlobalError, { error: failure(), reset: () => undefined })
      );

      /*
       * `error.tsx` sits inside the layout and cannot catch a failure *of* the
       * layout — at that point there is no `<html>` to render into.
       */
      expect(markup).toContain("<html");
      expect(markup).toContain("<body");
    });

    it("declares the language itself rather than inheriting it", () => {
      /*
       * There is nothing to inherit from: the layout that normally declares
       * `lang="tr"` is the thing that failed. Without this a screen reader
       * falls back to its own default and reads Turkish with English rules, on
       * the one screen a person reaches when they are already confused.
       */
      const markup = renderToStaticMarkup(
        createElement(GlobalError, { error: failure(), reset: () => undefined })
      );
      expect(markup).toContain('lang="tr"');
    });
  });

  describe("something that is not there", () => {
    it("gives one answer to both situations, on purpose", () => {
      const markup = renderToStaticMarkup(createElement(NotFound));

      /*
       * The twenty-nine `notFound()` calls mean either "no such address" or
       * "not yours", and the second is exactly why the first cannot be more
       * specific: a page that told them apart would answer, to anybody who
       * asked, whether a given Offering or Business exists.
       *
       * I24 spent an increment making sure a failed read does not leak
       * existence. This would leak it through the other door.
       */
      expect(markup).toContain(ABSENT.heading);
      expect(markup).toContain(ABSENT.body);
      expect(markup).toContain('href="/"');
    });

    it("names the possible reasons without claiming one", () => {
      // Naming them is what makes the vagueness read as vagueness rather than
      // as the platform having lost track of something.
      expect(ABSENT.body).toMatch(/değişmiş/u);
      expect(ABSENT.body).toMatch(/kaldırılmış/u);
      expect(ABSENT.body).toMatch(/açık olmayabilir/u);
    });

    it("offers no retry, because there is nothing to retry", () => {
      const markup = renderToStaticMarkup(createElement(NotFound));
      expect(markup).not.toContain("<button");
    });
  });

  it("names the failure copy, because no rule can derive it", () => {
    /*
     * **The same conclusion the submit labels reached, in the same place.**
     * `failure-copy.ts` is a copy module, so it sits outside every check that
     * walks the route folders — a mutation putting `Not found` into it passed
     * both detectors in `i27`.
     *
     * A shape rule cannot rescue this. `Ara` and `Tekrar dene` are Turkish and
     * contain none of `ç ğ ı ö ş ü`, which is exactly what the abandoned
     * attempt in I30 discovered: Turkish and English are not separable by
     * character class at word level. Where a property cannot be derived, naming
     * the value is honest and a rule that cannot work is not.
     */
    expect(ABSENT.heading).toBe("Bu sayfa bulunamadı");
    expect(UNEXPECTED.heading).toBe("Bir şeyler ters gitti");
    expect(UNEXPECTED.retry).toBe("Tekrar dene");
    expect(UNEXPECTED.home).toBe("Ana sayfaya dön");
  });

  describe("what these screens are not", () => {
    it("keeps the unavailable surface separate from the unexpected one", () => {
      /*
       * `service-unavailable.tsx` is shown when a read the code *expected* to
       * fail did fail — it knows what did not load and says so, and it says
       * records were not deleted. Nothing was expected here, so these claim
       * nothing about what happened.
       *
       * Asserted because merging them is the obvious tidying-up, and it would
       * make one of the two lie.
       */
      const unavailable = readFileSync(
        join(APP, "service-unavailable.tsx"),
        "utf8"
      );
      expect(unavailable).not.toContain("failure-copy");
      expect(UNEXPECTED.body).not.toBe(ABSENT.body);
    });
  });
});
