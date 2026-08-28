import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PAGE_UNAVAILABLE } from "../apps/web/src/app/service-unavailable.js";
import { handoffRefusal } from "../apps/web/src/decision/copy.js";

/**
 * The last two modules that reported an outage as an answer (I46).
 *
 * I24 taught thirteen routes UX-0006 §14's *distinguish zero from unavailable*.
 * I45 found `identity/api.ts` outside that rule and, in closing it, measured
 * which modules were still outside — asserting the set so that repairing it
 * would fail a case and have to be acknowledged rather than quietly forgotten.
 *
 * This is that acknowledgement.
 *
 * **These two lie harder than the others, because they tell the person to throw
 * work away.**
 *
 * | Route | What a `503` said | What was true |
 * |---|---|---|
 * | `/decision` | *Bu karar akışının süresi doldu* | the flow is fine; it could not be read |
 * | `/compare` | *Karşılaştırma oturumunuz sona erdi* | the set is fine; it could not be read |
 *
 * Elsewhere the false claim costs a reload. Here it costs a Decision in
 * progress and a Comparison Set built one Offering at a time, because both
 * screens follow the claim with an invitation to start again.
 *
 * ## The writes were already honest, and are left alone
 *
 * Eight writes report a refusal by code, and the temptation was to treat them
 * the same way. **Measured rather than assumed**, their fallback copy claims
 * nothing a `5xx` would make untrue — the Affiliate Handoff says "nothing was
 * initiated and no information was shared", which is as true of an outage as of
 * a refusal, because the API refuses inside the transaction that would have
 * recorded a Completion.
 *
 * Changing them would have been motion, not repair.
 */
describe("Increment I46 the Decision reads", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  const FLOW = "11111111-2222-4333-8444-555555555555";

  /** The cookies both pages read, so neither stops before its API call. */
  const carrying = (): void => {
    vi.doMock("next/headers", () => ({
      cookies: () => Promise.resolve({ get: () => ({ value: FLOW }) })
    }));
  };

  const apiAnswers = (status: number, body = "{}"): void => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response(body, { status })))
    );
  };

  type Page = (props: never) => Promise<ReactElement>;

  const render = async (page: Page, props: unknown): Promise<string> =>
    renderToStaticMarkup(await page(props as never));

  describe("the reads themselves", () => {
    it("raises on a 5xx and keeps 4xx meaning gone", async () => {
      /*
       * `404` still means the flow or the set really has expired, and that is
       * the answer both pages were written for. It was never the defect — the
       * defect was a `503` arriving at the same place.
       */
      const { ApiRequestError } = await import("../apps/web/src/api-error.js");
      const { readDecision } = await import("../apps/web/src/decision/flow.js");
      const { currentComparison } =
        await import("../apps/web/src/decision/comparison.js");

      for (const read of [
        () => readDecision(FLOW, undefined),
        () => currentComparison(FLOW)
      ]) {
        apiAnswers(404);
        await expect(read()).resolves.toBeNull();
        for (const status of [500, 502, 503]) {
          apiAnswers(status);
          await expect(read()).rejects.toBeInstanceOf(ApiRequestError);
        }
      }
    });

    it("times a read and leaves a write untimed", async () => {
      /*
       * **The rule is derived from the method, not from a list of names.** I25
       * split reads from writes and I24 split an outage from an absence, and
       * both land on the same line here: a `GET` reports what is, everything
       * else changes something. A hand-kept list of read functions would have
       * been a fifth place to forget one, which is how these two modules came
       * to be outside both rules at once.
       *
       * The writes stay untimed because aborting one does not undo it, and
       * reporting a timeout as a failure would claim an outcome this
       * application does not know.
       */
      const seen: { method: unknown; timed: boolean }[] = [];
      vi.stubGlobal(
        "fetch",
        vi.fn((_input: string, init?: RequestInit) => {
          seen.push({
            method: init?.method,
            timed: init?.signal instanceof AbortSignal
          });
          return Promise.resolve(new Response("{}", { status: 404 }));
        })
      );
      const flow = await import("../apps/web/src/decision/flow.js");

      await flow.readChat(FLOW);
      await flow.selectOffering(FLOW, null);

      expect(seen).toEqual([
        { method: "GET", timed: true },
        { method: "PUT", timed: false }
      ]);
    });
  });

  describe("UX-0009 the two surfaces", () => {
    it("stops telling a person their Decision flow expired", async () => {
      carrying();
      apiAnswers(503);

      const { default: page } =
        await import("../apps/web/src/app/decision/page.js");
      const markup = await render(page as Page, {});

      expect(markup).toContain(PAGE_UNAVAILABLE);
      // The claim that used to be made, and the invitation that followed it.
      expect(markup).not.toContain("süresi doldu");
    });

    it("stops telling a person their Comparison ended", async () => {
      carrying();
      apiAnswers(503);

      const { default: page } =
        await import("../apps/web/src/app/compare/page.js");
      const markup = await render(page as Page, {});

      expect(markup).toContain(PAGE_UNAVAILABLE);
      expect(markup).not.toContain("sona erdi");
    });

    it("still says a flow expired when it really did", async () => {
      /*
       * The behaviour that must survive the repair, and the one an overshoot
       * would destroy. A flow is current-flow state and is *allowed* to
       * disappear — §16 requires the page to say so. Reporting every failure as
       * an outage would leave somebody waiting for one to end that had never
       * begun, in front of a flow that is genuinely gone.
       */
      carrying();
      apiAnswers(404);

      const { default: page } =
        await import("../apps/web/src/app/decision/page.js");
      const markup = await render(page as Page, {});

      expect(markup).toContain("süresi doldu");
      expect(markup).not.toContain(PAGE_UNAVAILABLE);
    });
  });

  it("leaves the writes claiming nothing an outage would make untrue", () => {
    /*
     * **Asserted so that a later increment does not "fix" what is already
     * right.** The obvious symmetry — reads raise, so writes should too — would
     * have replaced honest copy with a second surface saying the same thing,
     * and would have taken a refusal a person is entitled to see and hidden it
     * behind an outage screen.
     *
     * The sentence is the evidence. It states an outcome that holds whether the
     * API refused or never answered.
     */
    expect(handoffRefusal("DEPENDENCY_UNAVAILABLE")).toContain(
      "Hiçbir şey başlatılmadı"
    );
  });

  it("leaves no web module reading the API outside the vocabulary", async () => {
    /*
     * I45 asserted this set as `["decision/comparison.ts", "decision/flow.ts"]`
     * precisely so that repairing them would fail there and force somebody to
     * delete the names and say so. **That is what happened**, and the set is
     * now empty — which is a stronger statement than the two names were, and
     * the one that stops a sixth module joining the gap unnoticed.
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
    expect(withoutVocabulary).toEqual([]);
  });
});
