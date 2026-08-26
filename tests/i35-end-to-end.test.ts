import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { ABSENT, RESOLVING } from "../apps/web/src/failure-copy.js";

/**
 * The first end-to-end run (I35).
 *
 * Every one of the 942 tests that came before this one calls `app.inject()` or
 * `renderToStaticMarkup`. **No socket had ever been opened and no web server had
 * ever served a page.** Five consecutive closure records named the gap and none
 * of them closed it, because closing it needs two processes running rather than
 * a better assertion.
 *
 * Running them found a defect on the first attempt, and it was a defect of the
 * exact shape that only running finds: `/offerings/there-is-no-such-offering`
 * answered **200 OK** with "Bu sayfa bulunamadı" in the body. See
 * `i32-loading-behaviour.test.ts` for the cause and the fix.
 *
 * The run itself lives in `scripts/smoke.mjs` rather than here, and that is a
 * decision rather than an omission. It has preconditions this suite cannot meet
 * — a production build of the web application and a migrated database — and a
 * test that skips when its preconditions are absent is worse than no test,
 * because the suite still reports green. The script fails loudly instead.
 *
 * **So what is left for this file is the part that can rot silently**: whether
 * the script still checks for the words the application actually says, and
 * whether it is still reachable at all.
 */
describe("Increment I35 the first end-to-end run", () => {
  const script = (): string => readFileSync("scripts/smoke.mjs", "utf8");

  /**
   * Comments stripped before anything is searched.
   *
   * Four checks in this repository have now matched their own explanatory prose
   * — `lang="en"` in I31, `480px` and `fetch` in I33 — because it comments
   * heavily and on purpose. A check that reads source and does not strip
   * comments is a check that can be satisfied by writing about it.
   */
  const code = (): string =>
    script()
      .replaceAll(/\/\*[\s\S]*?\*\//gu, "")
      .replaceAll(/^\s*\/\/.*$/gmu, "");

  describe("the copy it looks for", () => {
    it("is the copy the application actually shows", () => {
      /*
       * The script cannot import `failure-copy.ts`: it runs under plain node
       * and that file is TypeScript. So the two headings are duplicated, and a
       * duplicate nobody checks is a duplicate that drifts — the script would
       * keep passing while looking for a sentence the site had stopped saying,
       * which is the failure mode where a green smoke run means least.
       */
      expect(code()).toContain(`heading: "${ABSENT.heading}"`);
      expect(code()).toContain(`heading: "${RESOLVING.heading}"`);
    });

    it("does not look for the shell when it means the page", () => {
      /*
       * **The first version of the not-found check looked for the wordmark**,
       * which the site header puts on every page — so it passed on the
       * homepage, on Discovery, and on the soft 404 it was supposed to catch.
       *
       * A check that passes everywhere is not a check. Asserted as the absence
       * of the wordmark from the script, because that is the mistake rather
       * than a general rule about strings.
       */
      const notFoundCheck = code().slice(
        code().indexOf("there-is-no-such-offering")
      );
      expect(notFoundCheck).not.toContain("İlanlar");
    });
  });

  describe("what it refuses to do", () => {
    it("will not run against a build that is not there", () => {
      /*
       * Without this the script starts `next start` against an absent `.next`,
       * gets connection refused for sixty seconds, and reports a timeout — which
       * reads as a broken application rather than a missing step.
       */
      expect(code()).toContain("apps/api/dist/main.js");
      expect(code()).toContain("apps/web/.next/BUILD_ID");
    });

    it("will not report a stale process as this one", () => {
      /*
       * **The worst outcome available to a smoke test.** A server left running
       * from an earlier attempt answers every request, every check passes, and
       * the run certifies code that is not in the working tree. Refusing a held
       * port costs one probe and removes the possibility.
       */
      expect(code()).toMatch(/is already held/u);
    });

    it("stops both processes however it ends", () => {
      // Including when a check throws. Otherwise the next run finds the ports
      // held — by the run that was supposed to prove something.
      expect(code()).toMatch(/finally\s*\{[\s\S]*?stop\(\)/u);
    });

    it("exits non-zero when a check fails", () => {
      /*
       * The script prints a report, so it would be entirely possible for it to
       * print failures and exit 0 — and then CI would be green while the page
       * it just checked was broken. The report is for a person; the exit code
       * is for everything else.
       */
      expect(code()).toMatch(/process\.exit\(failed\.length === 0 \? 0 : 1\)/u);
    });
  });

  describe("where it sits", () => {
    const packageJson = (): { scripts: Record<string, string> } =>
      JSON.parse(readFileSync("package.json", "utf8")) as {
        scripts: Record<string, string>;
      };

    it("can be run by name", () => {
      expect(packageJson().scripts["smoke"]).toBe("node scripts/smoke.mjs");
    });

    it("is not part of `verify`, because `verify` has no database or build", () => {
      /*
       * `npm run verify` ends with `build`, so at the moment it starts there is
       * no `.next` to serve — and it holds no `DATABASE_URL` pointing at a
       * migrated database either. Adding `smoke` to that chain would make the
       * chain fail for reasons about the chain.
       *
       * This is the honest shape: `verify` proves the code, `smoke` proves the
       * deployment, and they run at different moments against different things.
       * Asserting the separation keeps somebody from closing the gap in the
       * direction that breaks both.
       */
      expect(packageJson().scripts["verify"]).not.toContain("smoke");
    });
  });
});
