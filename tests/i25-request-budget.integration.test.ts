import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ApiRequestError,
  DEFAULT_API_TIMEOUT_MS,
  apiTimeoutMs,
  isApiUnavailable
} from "../apps/web/src/api-error.js";

/**
 * The last untimed dependency edge (Engineering Constitution §13).
 *
 * §13 requires every production component to define behaviour for timeout, and
 * every outbound edge in this repository had one except the edge a person
 * actually waits on:
 *
 * | Edge | Budget |
 * |---|---|
 * | Worker → Postmark | 10s |
 * | API → Chat provider | 8s |
 * | API → PostgreSQL | 5s statement, 2s connection |
 * | **Web → API** | **none, across 27 call sites** |
 *
 * Node's `fetch` has no default, so a hung API hung the page. That made I23 and
 * I24 hollow in the case that produces them most often: the bounded surfaces
 * they built were unreachable, because the render never finished to show one.
 *
 * Ten seconds, chosen by the Owner on 2026-08-19. It is a ceiling derived from
 * the budgets underneath rather than a round number — shorter and this side
 * would abort a request the API was about to answer *correctly*.
 */
describe("Increment I25 request budget", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    vi.resetModules();
  });

  describe("the budget", () => {
    it("sits above every budget the API answers within", () => {
      /*
       * The constraint that fixes this number, rather than taste. The API
       * bounds its own worst honest answer at eight seconds (Chat) and five
       * (a statement) — so anything at or below those would cut off an answer
       * that was coming, replacing a precise `503 DEPENDENCY_UNAVAILABLE` with
       * a vague "could not load" and timing out a healthy Decision Chat.
       */
      expect(DEFAULT_API_TIMEOUT_MS).toBeGreaterThan(8_000);
    });

    it("takes the default rather than the process for a malformed setting", () => {
      // `Number("")` is 0, and a zero-millisecond budget aborts every request
      // before it is sent — the same trap `poolMax` names in I18.
      for (const raw of ["", "0", "-1", "abc", undefined])
        expect(apiTimeoutMs(raw)).toBe(DEFAULT_API_TIMEOUT_MS);

      expect(apiTimeoutMs("2500")).toBe(2_500);
    });
  });

  describe("a request that never answers", () => {
    it("is abandoned rather than waited on for ever", async () => {
      vi.stubEnv("API_TIMEOUT_MS", "40");

      /*
       * A `fetch` that resolves only when its signal aborts, which is what a
       * hung API is from this side: the connection is open, the request was
       * accepted, and nothing ever comes back. A rejected promise would prove
       * nothing — that path already worked.
       */
      vi.stubGlobal(
        "fetch",
        vi.fn(
          (_input: string, init: RequestInit) =>
            new Promise((_resolve, reject) => {
              init.signal?.addEventListener("abort", () => {
                reject(new DOMException("aborted", "AbortError"));
              });
            })
        )
      );

      /*
       * The class comes from the same import as the function under test.
       *
       * `vi.resetModules()` gives each case a fresh registry, so this file's
       * top-level `ApiRequestError` is a *different class object* from the one
       * `fetchWithBudget` throws and `instanceof` is false between them. I23
       * hit this exact trap and recorded it; recording it did not stop it
       * happening again, which is the argument for taking the class from the
       * live module rather than remembering not to.
       */
      const { ApiRequestError: Live, fetchWithBudget } =
        await import("../apps/web/src/api-error.js");
      const started = Date.now();

      await expect(
        fetchWithBudget("http://api.test/x", {}, "READ")
      ).rejects.toBeInstanceOf(Live);

      // Bounded, and bounded by *this* budget rather than by a socket giving
      // up minutes later.
      expect(Date.now() - started).toBeLessThan(2_000);
    });

    it("reaches the same bounded surfaces an outage does", async () => {
      vi.stubEnv("API_TIMEOUT_MS", "40");
      vi.stubGlobal(
        "fetch",
        vi.fn(
          (_input: string, init: RequestInit) =>
            new Promise((_resolve, reject) => {
              init.signal?.addEventListener("abort", () => {
                reject(new DOMException("aborted", "AbortError"));
              });
            })
        )
      );

      const { fetchWithBudget: budgeted, isApiUnavailable: unavailable } =
        await import("../apps/web/src/api-error.js");

      const failure = await budgeted("http://api.test/x", {}, "READ").catch(
        (error: unknown) => error
      );

      /*
       * `504`, so `isApiUnavailable` already treats it as unavailable and a
       * hang lands on exactly the surfaces I23 and I24 built. That is the
       * honest mapping: to the person, and to the retry they will make, "did
       * not answer in time" and "is not there" are one situation.
       */
      expect((failure as ApiRequestError).status).toBe(504);
      expect(unavailable(failure)).toBe(true);
    });

    it("leaves a network failure alone instead of calling it a timeout", async () => {
      vi.stubEnv("API_TIMEOUT_MS", "5000");
      const refused = new TypeError("fetch failed");
      vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.reject(refused))
      );

      const { fetchWithBudget } = await import("../apps/web/src/api-error.js");

      /*
       * A refused connection is not this request being slow, and relabelling it
       * would be the same overreach I22 refused when it kept constraint
       * violations answering `500`. It propagates untouched.
       */
      await expect(
        fetchWithBudget("http://api.test/x", {}, "READ")
      ).rejects.toBe(refused);
    });

    it("does not hold the event loop open after a request that answered", async () => {
      vi.stubEnv("API_TIMEOUT_MS", "60000");
      const clear = vi.spyOn(globalThis, "clearTimeout");
      vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.resolve(new Response("", { status: 200 })))
      );

      const { fetchWithBudget } = await import("../apps/web/src/api-error.js");
      await fetchWithBudget("http://api.test/x", {}, "READ");

      // An un-cleared sixty-second timer per request is a slow leak on a server
      // rendering thousands of them, and it is invisible until it is not.
      expect(clear).toHaveBeenCalled();
    });
  });

  describe("what the budget covers", () => {
    it("is applied by the reads and by none of the writes", async () => {
      const { readFile } = await import("node:fs/promises");
      const sources = await Promise.all(
        [
          "apps/web/src/discovery/api.ts",
          "apps/web/src/business/api.ts",
          "apps/web/src/platform/api.ts"
        ].map((path) => readFile(path, "utf8"))
      );
      const source = sources.join("\n");

      /*
       * Asserted against the source because the property is an absence, and an
       * absence has no call to make. Sixteen reads are budgeted; the eight
       * writes deliberately are not.
       *
       * Aborting a write does not undo it — the API may have created the
       * Offering a moment after this side stopped listening — so reporting a
       * timeout as a failure would claim an outcome this application does not
       * know. UX-0005 §15's "a failed Offering action does not claim a
       * lifecycle transition" cuts both ways.
       */
      expect(source.match(/fetchWithBudget\(/gu)).toHaveLength(16);
      expect(source.match(/await fetch\(/gu)).toHaveLength(8);
    });

    it("keeps a timeout distinguishable from the absence it is not", () => {
      // `504` is unavailable; `404` is still absent. I24's separation survives
      // a new way of failing being added to it.
      expect(isApiUnavailable(new ApiRequestError("READ", 504))).toBe(true);
      expect(isApiUnavailable(new ApiRequestError("READ", 404))).toBe(false);
    });
  });
});
