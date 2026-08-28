import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PAGE_UNAVAILABLE } from "../apps/web/src/app/service-unavailable.js";

/**
 * The two identity reads I24 did not reach (I45).
 *
 * I24 taught thirteen routes to tell an outage from an absence, in UX-0006
 * §14's five words: **"distinguish zero from unavailable"**. Fourteen readers
 * in `business/api.ts` and `platform/api.ts` were given
 * `absentUnlessUnavailable`, which raises on `5xx` and leaves `4xx` meaning
 * absent.
 *
 * **`identity/api.ts` was not among them**, and both of its reads collapsed
 * every failure into a confident answer:
 *
 * | Read | What a `503` became | What it means on screen |
 * |---|---|---|
 * | `readSession` | `null` | *you are signed out* |
 * | `readOwnedBusinesses` | `{ businesses: [] }` | *you own no Businesses* |
 *
 * So the rule was applied everywhere except the one place where the false
 * statement is about the **person** rather than about the catalogue. During a
 * database outage `/account` told somebody holding a perfectly valid token that
 * they were signed out and sent them to a sign-in form — which calls the same
 * API, and would have failed too.
 *
 * The second is quieter and worse. Most people own no Business, so zero is the
 * ordinary answer: an outage that produced zero looked exactly like the truth,
 * and an owner of three saw none of them with nothing on the page saying
 * anything had gone wrong.
 */
describe("Increment I45 the identity reads", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  /** A session cookie, so the page gets past its check for one at all. */
  const signedIn = (): void => {
    vi.doMock("next/headers", () => ({
      cookies: () =>
        Promise.resolve({ get: () => ({ value: "session-token" }) })
    }));
  };

  /** `redirect()` observable as a throw, which is what Next does internally. */
  const navigation = (): void => {
    vi.doMock("next/navigation", () => ({
      notFound: () => {
        throw new Error("NEXT_NOT_FOUND");
      },
      redirect: (to: string) => {
        throw new Error(`NEXT_REDIRECT_${to}`);
      }
    }));
  };

  type Page = (props: never) => Promise<ReactElement>;

  const render = async (page: Page, props: unknown): Promise<string> =>
    renderToStaticMarkup(await page(props as never));

  /**
   * The API answering with a status and nothing else.
   *
   * Stubbed at `fetch` rather than at the module, because what is being checked
   * is the reader's own treatment of a status code — mocking the reader would
   * assert the mock.
   */
  const apiAnswers = (status: number, body = "{}"): void => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response(body, { status })))
    );
  };

  describe("the reads themselves", () => {
    it("keeps 4xx meaning no session and makes 5xx mean unavailable", async () => {
      /*
       * `4xx` still means no session, and deliberately. A `401` is how the API
       * says a token is spent or an account suspended, and UX-0008 §7 sends
       * that person to sign in — which is right, and was never the defect. The
       * defect was `5xx` arriving at the same place.
       */
      const { ApiRequestError } = await import("../apps/web/src/api-error.js");
      const { readSession } = await import("../apps/web/src/identity/api.js");

      for (const status of [401, 403, 404]) {
        apiAnswers(status);
        await expect(readSession("token")).resolves.toBeNull();
      }

      for (const status of [500, 502, 503]) {
        apiAnswers(status);
        await expect(readSession("token")).rejects.toBeInstanceOf(
          ApiRequestError
        );
      }
    });

    it("stops reporting an outage as owning no Business", async () => {
      /*
       * The quiet one. `{ businesses: [] }` is a real answer most of the time,
       * which is exactly why an outage wearing it was invisible.
       */
      const { ApiRequestError } = await import("../apps/web/src/api-error.js");
      const { readOwnedBusinesses } =
        await import("../apps/web/src/identity/api.js");

      apiAnswers(503);
      await expect(readOwnedBusinesses("token")).rejects.toBeInstanceOf(
        ApiRequestError
      );

      // A refusal still answers an empty list rather than raising: the person
      // has no standing, which is a fact about the world.
      apiAnswers(401);
      await expect(readOwnedBusinesses("token")).resolves.toEqual({
        businesses: []
      });
    });

    it("puts both reads on I25's budget and leaves the writes off it", async () => {
      /*
       * **`identity/api.ts` was the module I25 did not reach.** It gave
       * twenty-seven read call sites a ten-second ceiling because Node's
       * `fetch` has none, so a hung API hung the page — and these two reads
       * were still calling `fetch` directly, which made `/account` the one
       * authenticated surface a hang could hold open for ever.
       *
       * The writes stay off it, and that is I25's decision rather than an
       * oversight: aborting a write does not undo it, so a timeout reported as
       * a failure would claim an outcome this application does not know.
       */
      const seen: (AbortSignal | null | undefined)[] = [];
      vi.stubGlobal(
        "fetch",
        vi.fn((_input: string, init?: RequestInit) => {
          seen.push(init?.signal);
          return Promise.resolve(new Response("{}", { status: 401 }));
        })
      );
      const api = await import("../apps/web/src/identity/api.js");

      await api.readSession("token");
      await api.readOwnedBusinesses("token");
      expect(seen.every((signal) => signal instanceof AbortSignal)).toBe(true);

      seen.length = 0;
      await api.logOut("token");
      await api.beginRecovery("someone@example.com");
      expect(seen.some((signal) => signal instanceof AbortSignal)).toBe(false);
    });
  });

  describe("UX-0008 the account page", () => {
    it("does not tell a signed-in person they are signed out", async () => {
      /*
       * **The whole increment, on screen.** The claim that used to be made is a
       * redirect to the sign-in form; the one that replaces it says only that
       * the read did not come back.
       */
      signedIn();
      navigation();
      apiAnswers(503);

      const { default: page } =
        await import("../apps/web/src/app/account/page.js");
      const markup = await render(page as Page, {
        searchParams: Promise.resolve({})
      });

      expect(markup).toContain(PAGE_UNAVAILABLE);
      expect(markup).toContain('href="/account"');
    });

    it("still sends a refused session to sign in", async () => {
      /*
       * The behaviour that must survive the repair. A `401` is a session that
       * genuinely is not one — a spent token, a suspended account — and UX-0008
       * §7 sends that person to sign in. A fix that turned every negative
       * answer into "temporarily unavailable" would have replaced one wrong
       * claim with another, and left somebody suspended waiting for an outage
       * to end that was never happening.
       */
      signedIn();
      navigation();
      apiAnswers(401);

      const { default: page } =
        await import("../apps/web/src/app/account/page.js");
      await expect(
        render(page as Page, { searchParams: Promise.resolve({}) })
      ).rejects.toThrow("NEXT_REDIRECT_/login");
    });
  });

  it("names the two Decision modules still outside the vocabulary", async () => {
    /*
     * **The first version of this case matched something other than what it
     * meant.** It searched for `status !== 200` and flagged `identity/api.ts`
     * — which by then was correct, because the raise on `5xx` runs first and
     * what remains provably means `4xx`. A repaired module failing a check
     * written to find unrepaired ones is the seventh time a check in this
     * repository has matched the wrong thing.
     *
     * So it measures the population instead. Five modules in the web
     * application call the API; three now import the unavailability vocabulary
     * and **two do not**, and those two were measured rather than guessed:
     * driven with a `503`, all fifteen of their exported functions answered
     * with a confident nothing.
     *
     * | Read | What a `503` becomes on screen |
     * |---|---|
     * | `readDecision` | *you have no Decision in progress* |
     * | `currentComparison` | *your Comparison is empty* |
     * | `readCompletions` | *nothing was completed* |
     * | `selectOffering` | a refusal with an empty reason |
     *
     * That is the same defect this increment closed for identity, over a wider
     * surface and with writes among it — and a failed write must not claim an
     * outcome either, so it is a larger question than a status check and is
     * left as its own increment rather than half-done here.
     *
     * **Asserted as the exact set.** Adding a sixth module to the gap fails
     * here, and so does repairing these two — which is the point: the second
     * failure is somebody deleting a name and recording that it is fixed,
     * rather than the finding quietly ageing out of a closure record.
     */
    const { readFileSync, readdirSync } = await import("node:fs");
    const areas = ["business", "decision", "discovery", "identity", "platform"];
    const withoutVocabulary: string[] = [];
    for (const area of areas) {
      const directory = `apps/web/src/${area}`;
      for (const name of readdirSync(directory)) {
        if (!name.endsWith(".ts")) continue;
        const source = readFileSync(`${directory}/${name}`, "utf8");
        if (!source.includes("fetch(")) continue;
        if (!source.includes('from "../api-error"'))
          withoutVocabulary.push(`${area}/${name}`);
      }
    }
    expect(withoutVocabulary.sort()).toEqual([
      "decision/comparison.ts",
      "decision/flow.ts"
    ]);
  });
});
