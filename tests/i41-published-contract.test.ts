import { readFileSync } from "node:fs";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createApiApp } from "../apps/api/src/bootstrap.js";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";

/**
 * The published contract, checked against what is served (I41).
 *
 * `generated/openapi.json` is committed and CI runs
 * `git diff --exit-code` against it. **That step proves the generator's output
 * matches the committed file and nothing else** — and the generator is
 * `apps/api/src/openapi/generate-openapi.ts`, five thousand hand-written lines
 * with no introspection. So the published description of this API could have
 * drifted from the API in every direction and every check would have stayed
 * green.
 *
 * Until now the only assertions on it named **six operations out of
 * eighty-seven**.
 *
 * The document turned out to be in good order: 87 operations served and
 * documented, none documented that is not served. **That is the result worth
 * locking in**, because it is the state a five-thousand-line hand-maintained
 * file drifts out of one commit at a time.
 */
describe("Increment I41 the published contract", () => {
  const METHODS = ["get", "post", "put", "patch", "delete"];

  /**
   * The one operation deliberately outside the contract.
   *
   * I19 closed `/metrics` and kept it out of the published description on
   * purpose: a Prometheus endpoint is operational surface rather than product
   * surface, and documenting it would announce it. Named here so the exclusion
   * is a decision with a reason rather than a hole.
   */
  const OUTSIDE_THE_CONTRACT = "GET /api/v1/metrics";

  let app: NestFastifyApplication;
  const served = new Set<string>();

  beforeAll(async () => {
    /*
     * Collected through `onRoute` while the application is assembled, because
     * **a Fastify instance cannot be asked what it serves afterwards**. There
     * is no enumerable route table; the hook fires forward only, so the
     * observer has to be attached before `app.init()` — which is where Nest
     * mounts the controllers, and not where a reader would guess.
     *
     * **Mutation testing corrected the first version of that claim.** Moving
     * the hook to just after `NestFactory.create` changes nothing: all
     * eighty-eight routes are still collected, because `create` builds the
     * container and `init` mounts it. Moving it after `init` collects nothing —
     * and the guard case below is what noticed, failing with "expected 0 to be
     * greater than 80" while the two comparisons happily compared nothing to
     * nothing.
     */
    app = await createApiApp({
      logLevel: "error",
      onRoute: (route) => {
        const methods = Array.isArray(route.method)
          ? route.method
          : [route.method];
        for (const method of methods) {
          // Fastify answers HEAD for every GET and OPTIONS for CORS. Neither is
          // an operation anybody writes down.
          if (method === "HEAD" || method === "OPTIONS") continue;
          served.add(
            `${method} ${route.url.replaceAll(/:([A-Za-z0-9_]+)/gu, "{$1}")}`
          );
        }
      }
    });
  }, 60_000);

  afterAll(async () => {
    await app.close();
  });

  const documented = (): Set<string> => {
    const document = JSON.parse(
      readFileSync("generated/openapi.json", "utf8")
    ) as { paths: Record<string, Record<string, unknown>> };
    const operations = new Set<string>();
    for (const [path, methods] of Object.entries(document.paths))
      for (const method of Object.keys(methods))
        if (METHODS.includes(method))
          operations.add(`${method.toUpperCase()} ${path}`);
    return operations;
  };

  it("documents every operation the API serves", () => {
    /*
     * The direction that matters to somebody building against this. An
     * operation the API answers and the document omits is a capability nobody
     * outside the repository can discover, and a hand-written document loses
     * one by the ordinary means: a route added and a file not edited.
     */
    const undocumented = [...served]
      .filter((operation) => !documented().has(operation))
      .filter((operation) => operation !== OUTSIDE_THE_CONTRACT)
      .sort();
    expect(undocumented).toEqual([]);
  });

  it("documents nothing the API does not serve", () => {
    /*
     * The other direction, and the worse one. A documented operation that does
     * not exist is a promise: somebody writes a client against it, ships, and
     * finds out in production. A route *removed* and a file not edited leaves
     * exactly this.
     */
    const invented = [...documented()]
      .filter((operation) => !served.has(operation))
      .sort();
    expect(invented).toEqual([]);
  });

  it("keeps `/metrics` outside the contract, deliberately", () => {
    /*
     * I19's decision, asserted so the exclusion above cannot quietly become a
     * general amnesty. If somebody documents it, this fails and they have to
     * argue with I19 rather than with a filter.
     */
    expect(served.has(OUTSIDE_THE_CONTRACT)).toBe(true);
    expect(documented().has(OUTSIDE_THE_CONTRACT)).toBe(false);
  });

  it("has more than a handful of operations, so the comparison means something", () => {
    /*
     * **A guard against the comparison passing by emptiness.** If `onRoute`
     * ever stopped firing — a Fastify change, a refactor of `bootstrap.ts` —
     * `served` would be empty, both directions above would compare nothing to
     * nothing, and the two cases that matter would pass while checking
     * nothing at all.
     */
    expect(served.size).toBeGreaterThan(80);
    expect(documented().size).toBeGreaterThan(80);
  });
});
