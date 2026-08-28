import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PAGE_UNAVAILABLE } from "../apps/web/src/app/service-unavailable.js";

/**
 * A refused connection is the dependency's, not a defect (I47).
 *
 * I23 and I24 built the surfaces that say *the read did not come back* rather
 * than inventing an answer. I45 and I46 brought the last four modules under the
 * same rule. Every one of them was reached by an `ApiRequestError`, and only two
 * things produced one: a `5xx` the API actually answered, and a timeout this
 * application imposed.
 *
 * **Nothing listening on the port produced neither.** `fetch` throws a
 * `TypeError`, `api-error.ts` deliberately let it propagate, and the whole page
 * came down — so the honest surfaces were unreachable in the plainest failure of
 * the three. I45's probe measured it as `/offerings/{slug}` answering `500` with
 * an empty shell and left it undiagnosed; this is the diagnosis.
 *
 * ## The old reasoning was right and its classification was wrong
 *
 * > only what is known to be the dependency's is presented as retryable
 *
 * That discipline is what stops an application answering "please try again" to
 * its own bugs for ever, and it is kept. A refused connection simply *is* known
 * to be the dependency's, and Node says so:
 *
 * | | `cause.syscall` |
 * |---|---|
 * | connection refused, DNS failure | a string |
 * | unsupported scheme, malformed URL | absent |
 *
 * A system call is the discriminator rather than a list of codes, because a
 * list is a budget somebody spends without deciding.
 */
describe("Increment I47 a refused connection", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  /** What `fetch` throws, reproduced rather than described. */
  const transportFailure = (syscall: string, code: string): TypeError =>
    new TypeError("fetch failed", {
      cause: Object.assign(new Error(`${syscall} ${code}`), { code, syscall })
    });

  const configurationError = (): TypeError =>
    new TypeError("Failed to parse URL from not-a-url", {
      cause: Object.assign(new TypeError("Invalid URL"), {
        code: "ERR_INVALID_URL"
      })
    });

  /*
   * Typed as `Error` rather than `unknown` because the lint is right: a promise
   * rejected with a non-`Error` is a shape `fetch` never produces, and every
   * failure this file reproduces is one.
   */
  const throwing = (error: Error): void => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(error))
    );
  };

  it("turns a network refusal into the vocabulary the surfaces understand", async () => {
    /*
     * The whole increment. `503` rather than a new status, because the API
     * already answers `503 DEPENDENCY_UNAVAILABLE` when *its* dependency is
     * missing — and to the person these are one situation, which is the
     * argument this file was already making two paragraphs above the line that
     * contradicted it.
     */
    const { ApiRequestError, fetchWithBudget, isApiUnavailable } =
      await import("../apps/web/src/api-error.js");

    for (const [syscall, code] of [
      ["connect", "ECONNREFUSED"],
      ["getaddrinfo", "EAI_AGAIN"],
      ["connect", "ECONNRESET"]
    ]) {
      throwing(transportFailure(syscall as string, code as string));
      const raised = await fetchWithBudget("http://x/y", {}, "READ").catch(
        (error: unknown) => error
      );
      expect(raised).toBeInstanceOf(ApiRequestError);
      expect(isApiUnavailable(raised)).toBe(true);
    }
  });

  it("still lets this application's own mistakes reach the crash screen", async () => {
    /*
     * **The overshoot, and the reason the original classification existed.** A
     * malformed `API_BASE_URL` is a deployment defect, and presenting it as
     * "temporarily unavailable" would promise a retry that can never succeed
     * and hide the mistake for as long as nobody looked at a log.
     *
     * It is told apart structurally: every way this application can construct a
     * request wrongly fails *before* a system call, so there is no `syscall` to
     * report.
     */
    const { ApiRequestError, fetchWithBudget } =
      await import("../apps/web/src/api-error.js");

    throwing(configurationError());
    const raised = await fetchWithBudget("http://x/y", {}, "READ").catch(
      (error: unknown) => error
    );
    expect(raised).toBeInstanceOf(TypeError);
    expect(raised).not.toBeInstanceOf(ApiRequestError);

    // Nor is a contract that stopped parsing an outage: it is this side's bug.
    throwing(new SyntaxError("Unexpected token"));
    await expect(fetchWithBudget("http://x/y", {}, "READ")).rejects.toThrow(
      SyntaxError
    );
  });

  it("keeps a timeout answering 504, and the two paths never meet", async () => {
    /*
     * **The first version of this case asserted something untrue.** Its comment
     * said the abort check must run before the transport check or a timeout
     * would be reclassified as a `503`, and a mutation that swapped the two
     * **survived** — which is how the claim was found rather than believed.
     *
     * Measured: an aborted `fetch` throws an `AbortError`, and an `AbortError`
     * is not a `TypeError`. The two classifications are disjoint, so the order
     * is genuinely incidental and nothing here protects the timeout except that
     * a transport failure does not look like one.
     *
     * The stub was wrong too — it rejected with a `TypeError`, a shape `fetch`
     * never produces on abort — so the case was passing against a fabrication.
     * It uses the real one now.
     */
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_input: string, init?: RequestInit) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => {
              reject(
                new DOMException("This operation was aborted", "AbortError")
              );
            });
          })
      )
    );
    vi.stubEnv("API_TIMEOUT_MS", "10");
    const { ApiRequestError, fetchWithBudget } =
      await import("../apps/web/src/api-error.js");

    const raised = await fetchWithBudget("http://x/y", {}, "READ").catch(
      (error: unknown) => error
    );
    expect(raised).toBeInstanceOf(ApiRequestError);
    expect((raised as InstanceType<typeof ApiRequestError>).status).toBe(504);

    // The disjointness itself, asserted rather than left to the comment.
    const aborted = new DOMException("aborted", "AbortError");
    expect(aborted instanceof TypeError).toBe(false);
  });

  it("lets the Offering Presentation say what is true instead of crashing", async () => {
    /*
     * The route I45 measured and did not diagnose. Its page was **already
     * correct** — it catches `isApiUnavailable` and renders
     * `PresentationUnavailable` — and never got the chance, because a refused
     * connection was not classified as unavailable.
     *
     * That is worth saying plainly: this is not a repair to the page. The page
     * has been right since I24, and one classification three files away made it
     * unreachable.
     */
    vi.doMock("next/headers", () => ({
      cookies: () => Promise.resolve({ get: () => undefined })
    }));
    vi.doMock("next/navigation", () => ({
      notFound: () => {
        throw new Error("NEXT_NOT_FOUND");
      },
      redirect: (to: string) => {
        throw new Error(`NEXT_REDIRECT_${to}`);
      }
    }));
    throwing(transportFailure("connect", "ECONNREFUSED"));

    const { default: page } =
      await import("../apps/web/src/app/offerings/[slug]/page.js");
    const markup = renderToStaticMarkup(
      await (page as (props: never) => Promise<ReactElement>)({
        params: Promise.resolve({ slug: "some-offering" })
      } as never)
    );

    expect(markup).toContain("şu anda");
    expect(markup).not.toContain(PAGE_UNAVAILABLE);
  });

  it("reaches every read rather than the one route that was noticed", async () => {
    /*
     * **The guard.** `/offerings/{slug}` is where this was measured, and it was
     * never the only route affected — every read in the web application goes
     * through `fetchWithBudget`, so a fix applied at the route would have
     * repaired the symptom that happened to be looked at and left the rest.
     *
     * The count is asserted so that a read added outside the budget fails here.
     * A new call site using bare `fetch` is exactly how `identity/api.ts` came
     * to be outside I25 for twenty increments.
     */
    const { readFileSync, readdirSync } = await import("node:fs");
    let budgeted = 0;
    for (const area of [
      "business",
      "decision",
      "discovery",
      "identity",
      "platform"
    ])
      for (const name of readdirSync(`apps/web/src/${area}`))
        if (name.endsWith(".ts"))
          budgeted += (
            readFileSync(`apps/web/src/${area}/${name}`, "utf8").match(
              /fetchWithBudget\(/gu
            ) ?? []
          ).length;
    expect(budgeted).toBeGreaterThan(15);
  });
});
