import { readFileSync } from "node:fs";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import * as contracts from "@commerce/contracts";

import { createApiApp } from "../apps/api/src/bootstrap.js";

/**
 * What the API answers, checked against what it publishes (I44).
 *
 * I41 proved the document names every operation the API serves. I42 proved the
 * schemas carry the right property names. I43 proved they carry the right
 * types. All three read **two files** and compared them with each other, and
 * I43 wrote down what none of them could see:
 *
 * > Nothing here reaches the handlers. Contract and document agree on names and
 * > types; whether a handler returns what the contract says is proven only
 * > where a test already asserts a response body.
 *
 * This drives the API. Every documented operation is called for real and the
 * response it gives back is checked against the description it publishes —
 * first that the status is one the document declares, then that the body
 * satisfies the contract the document names for that status.
 *
 * ## The map is derived, not written
 *
 * All 379 declared responses point at a schema by `$ref` and **none is
 * inlined**, so the document itself says which schema each operation returns
 * for each status. I43's naming rule turns that name into a Zod contract —
 * `ErrorEnvelope` into `errorEnvelopeSchema` — and all 39 named schemas pair.
 *
 * A hand-written table from operation to contract would have been the fourth
 * hand-maintained artefact in a repository that has now found drift in three of
 * them. There is no table here.
 *
 * ## What it found
 *
 * | | |
 * |---|---|
 * | `POST .../direct-contact` answers `403` | the document declared `200 400 401 404 422` |
 * | thirteen operations answered `503` | the document declared `503` on **one** operation of eighty-seven |
 *
 * Both are repaired in `generate-openapi.ts`, and 73 response bodies were
 * already correct.
 */
describe("Increment I44 what the API answers", () => {
  /**
   * A syntactically valid UUID, so a path parameter is refused for what it
   * addresses rather than for its shape.
   *
   * I37 got this wrong with `1111...-4444-...`: the variant nibble must be one
   * of `89ab`, so that value is not a UUID at all and every route rejected it
   * before reaching anything worth measuring.
   */
  const ADDRESSABLE = "11111111-2222-4333-8444-555555555555";

  const METHODS = ["get", "post", "put", "patch", "delete"];

  interface Operation {
    responses?: Record<
      string,
      { content?: Record<string, { schema?: { $ref?: string } }> }
    >;
  }

  interface Answer {
    body: string;
    label: string;
    operation: Operation;
    status: string;
  }

  let app: NestFastifyApplication;
  const answers: Answer[] = [];

  const paths = (): Record<string, Record<string, Operation>> =>
    (
      JSON.parse(readFileSync("generated/openapi.json", "utf8")) as {
        paths: Record<string, Record<string, Operation>>;
      }
    ).paths;

  beforeAll(async () => {
    app = await createApiApp({ logLevel: "error" });
    for (const [path, methods] of Object.entries(paths())) {
      for (const [method, operation] of Object.entries(methods)) {
        if (!METHODS.includes(method)) continue;
        const response = await app.inject({
          method: method.toUpperCase() as "GET",
          url: path.replaceAll(/\{[A-Za-z0-9_]+\}/gu, ADDRESSABLE),
          /*
           * An empty body rather than none, so a body-bearing operation is
           * refused by its own validation or guard rather than by the absence
           * of a payload the framework would reject before any of it ran.
           */
          ...(method === "get" || method === "delete"
            ? {}
            : {
                headers: { "content-type": "application/json" },
                payload: {}
              })
        });
        answers.push({
          body: response.body,
          label: `${method.toUpperCase()} ${path}`,
          operation,
          status: String(response.statusCode)
        });
      }
    }
  }, 120_000);

  afterAll(async () => {
    await app.close();
  });

  /** Every Zod object contract, keyed the way the document names its schema. */
  const contractFor = (
    schemaName: string
  ): { safeParse: (value: unknown) => { success: boolean } } | undefined => {
    const key = (name: string): string =>
      name.replace(/Schema$/u, "").toLowerCase();
    for (const [name, value] of Object.entries(
      contracts as Record<string, unknown>
    )) {
      const candidate = value as {
        safeParse?: (value: unknown) => { success: boolean };
      };
      if (typeof candidate.safeParse !== "function") continue;
      if (key(name) === key(schemaName))
        return candidate as {
          safeParse: (value: unknown) => { success: boolean };
        };
    }
    return undefined;
  };

  it("answers only with statuses the document declares for that operation", () => {
    /*
     * **The direction a client feels first.** A status the document does not
     * declare is a branch no generated client has: it falls through to whatever
     * the client does with an unrecognised response, which is usually to throw
     * something unhelpful far from the cause.
     *
     * This is what found both gaps. Neither was visible to I41, I42 or I43,
     * because all three compared the document with the contracts and **neither
     * side knew what the API answers**.
     */
    const undeclared = answers
      .filter(
        (answer) => answer.operation.responses?.[answer.status] === undefined
      )
      .map((answer) => `${answer.label} answered ${answer.status}`)
      .sort();
    expect(undeclared).toEqual([]);
  });

  it("answers with a body the contract the document names accepts", () => {
    /*
     * The published description says which schema this operation returns for
     * this status. That name resolves to a Zod contract, and the contract is
     * given the body the handler actually produced — so the chain runs handler
     * to contract to document, rather than document to contract and stopping.
     */
    const refused: string[] = [];
    for (const answer of answers) {
      const reference =
        answer.operation.responses?.[answer.status]?.content?.[
          "application/json"
        ]?.schema?.$ref;
      if (reference === undefined) continue;
      const contract = contractFor(reference.split("/").pop() ?? "");
      if (contract === undefined) continue;
      if (!contract.safeParse(JSON.parse(answer.body)).success)
        refused.push(`${answer.label} ${answer.status}`);
    }
    expect(refused).toEqual([]);
  });

  it("drove enough operations, and checked enough bodies, to mean something", () => {
    /*
     * **The guard, for the fourth increment running**, and against the same
     * failure every time: a comparison that passes because it compared nothing.
     * Here the ways to reach zero are a boot that throws and leaves `answers`
     * empty, and a naming change that pairs no schema with a contract and
     * leaves every body skipped.
     */
    expect(answers.length).toBeGreaterThan(80);
    const paired = answers.filter((answer) => {
      const reference =
        answer.operation.responses?.[answer.status]?.content?.[
          "application/json"
        ]?.schema?.$ref;
      return (
        reference !== undefined &&
        contractFor(reference.split("/").pop() ?? "") !== undefined
      );
    });
    expect(paired.length).toBeGreaterThan(60);
  });

  it("declares `503` everywhere except the one operation that needs no dependency", () => {
    /*
     * `ErrorEnvelopeFilter` is an `APP_FILTER`, so answering
     * `503 DEPENDENCY_UNAVAILABLE` is a property of every operation that
     * reaches the database rather than of any one of them. Until I44 the
     * document declared it **once**, and a generated client had no `503` branch
     * anywhere but readiness.
     *
     * **The exception is measured, not assumed.** Driven with no database
     * reachable, `GET /health/live` answered `200` and `GET /health/ready`
     * answered `503` — liveness is the one operation that still answers when
     * nothing behind it can, which is why declaring `503` for it would be a
     * promise the API does not make.
     *
     * Asserted as the exact split rather than a count, for the reason I43 gave:
     * a count is a budget somebody spends without deciding.
     */
    const without: string[] = [];
    for (const [path, methods] of Object.entries(paths()))
      for (const [method, operation] of Object.entries(methods))
        if (
          METHODS.includes(method) &&
          operation.responses?.["503"] === undefined
        )
          without.push(`${method.toUpperCase()} ${path}`);
    expect(without).toEqual(["GET /api/v1/health/live"]);
  });

  it("declares the `403` the Direct Contact reveal actually answers", () => {
    /*
     * The finding, by name. A general rule that has never been violated is
     * indistinguishable from one that cannot be, and this operation was
     * violating it — `reveal` calls `OriginValidator` before anything else, so
     * a request without an acceptable `Origin` is refused under ADR-0012 §2,
     * and the document listed `200 400 401 404 422`.
     *
     * It is the only Decision operation that carries a session, which is why it
     * is the only one that should declare `403` and the only one that did not.
     */
    const reveal =
      paths()["/api/v1/decision/flows/{decisionFlowId}/direct-contact"]?.[
        "post"
      ];
    expect(Object.keys(reveal?.responses ?? {}).sort()).toEqual([
      "200",
      "400",
      "401",
      "403",
      "404",
      "422",
      "503"
    ]);
  });
});
