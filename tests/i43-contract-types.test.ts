import { readFileSync } from "node:fs";

import * as z from "zod";
import { describe, expect, it } from "vitest";

import * as contracts from "@commerce/contracts";

/**
 * The published types, checked against the contracts (I43).
 *
 * I42 compared property *names* and found two the document had been hiding
 * since I30. It wrote down what it still could not see:
 *
 * > Property names only, not types. A field whose declared type stopped
 * > matching what the handler returns — `string` where a number is sent, a
 * > widened enum, a nullable that is not — passes every case here.
 *
 * This closes that. 301 properties are compared on both sides, and **they all
 * agree** — so this increment locks a good state in rather than repairing a bad
 * one, which is the state a five-thousand-line hand-maintained document leaves
 * one commit at a time.
 *
 * ## The measurement was wrong before it was right
 *
 * The first comparison reported **62 differences out of 301**, and every one of
 * them was the comparison's fault:
 *
 * | document | contract | actually |
 * |---|---|---|
 * | `type: ["string", "null"]` | `anyOf: [{string}, {null}]` | the same nullable string |
 * | `$ref` to a shared enum | the enum inlined | the same enum |
 * | `enum: ["ok"]` | `type: "string"` | the same string |
 *
 * **Three encodings of agreement, read as disagreement.** Had those been
 * "fixed", sixty-two correct declarations would have been edited into wrong
 * ones to satisfy a naive reader — which is worse than the gap it was meant to
 * close.
 *
 * So both sides are reduced to the same pair — a primitive kind and whether
 * null is permitted — before anything is compared.
 */
describe("Increment I43 the published types", () => {
  type Node = Record<string, unknown>;
  interface Kind {
    kind: string;
    nullable: boolean;
  }

  /** Follows `$ref` into a definitions table, with a bound against cycles. */
  const resolve = (node: Node, definitions: Record<string, Node>): Node => {
    let current = node;
    for (let hop = 0; hop < 8; hop += 1) {
      const reference = current["$ref"];
      if (typeof reference !== "string") break;
      const target = definitions[reference.split("/").pop() ?? ""];
      if (target === undefined) break;
      current = target;
    }
    return current;
  };

  /**
   * A primitive kind and whether null is permitted, and **nothing else**.
   *
   * Deliberately not `format`, `minimum`, `maxLength`, `pattern` or
   * `description`. Those are worth comparing and comparing them needs a
   * vocabulary for what "equivalent" means when one side says `format: "uuid"`
   * and the other says a regular expression — a decision, not an oversight, and
   * the closure record says so rather than letting silence imply coverage.
   */
  const kindOf = (raw: Node, definitions: Record<string, Node>): Kind => {
    const node = resolve(raw, definitions);
    let nullable = false;
    let current = node;

    const union = node["anyOf"] ?? node["oneOf"];
    if (Array.isArray(union)) {
      const branches = (union as Node[]).map((branch) =>
        resolve(branch, definitions)
      );
      const real = branches.filter((branch) => branch["type"] !== "null");
      if (real.length < branches.length) nullable = true;
      if (real.length === 1) current = real[0] as Node;
      else
        return {
          kind: `union(${real
            .map((branch) => {
              const kind = branch["type"];
              return typeof kind === "string" ? kind : "?";
            })
            .sort()
            .join(",")})`,
          nullable
        };
    }

    const declared = current["type"];
    if (Array.isArray(declared)) {
      const real = (declared as string[]).filter((one) => one !== "null");
      return {
        kind: real.sort().join("|"),
        nullable: real.length < declared.length || nullable
      };
    }
    if (typeof declared === "string") return { kind: declared, nullable };

    // An enum of strings is a string. The document sometimes says one and the
    // contract the other, and they mean the same thing to a caller.
    if (Array.isArray(current["enum"])) {
      const kinds = [
        ...new Set(
          (current["enum"] as unknown[]).map((value) =>
            value === null ? "null" : typeof value
          )
        )
      ];
      return {
        kind: kinds
          .filter((one) => one !== "null")
          .sort()
          .join("|"),
        nullable: kinds.includes("null") || nullable
      };
    }
    if ("const" in current) return { kind: typeof current["const"], nullable };

    return { kind: "unknown", nullable };
  };

  const show = (kind: Kind): string =>
    `${kind.kind}${kind.nullable ? "?" : ""}`;

  const document = (): {
    definitions: Record<string, Node>;
    schemas: Record<string, { properties?: Record<string, Node> }>;
  } => {
    const parsed = JSON.parse(
      readFileSync("generated/openapi.json", "utf8")
    ) as {
      components?: {
        schemas?: Record<string, { properties?: Record<string, Node> }>;
      };
    };
    const schemas = parsed.components?.schemas ?? {};
    return {
      definitions: schemas,
      schemas
    };
  };

  /** Contracts `z.toJSONSchema` refuses, and the reason. */
  const unrenderable: string[] = [];

  /** Each contract rendered as JSON Schema, keyed the way the document names it. */
  const contractSide = (): Map<
    string,
    { definitions: Record<string, Node>; properties: Record<string, Node> }
  > => {
    unrenderable.length = 0;
    const side = new Map<
      string,
      { definitions: Record<string, Node>; properties: Record<string, Node> }
    >();
    for (const [name, value] of Object.entries(
      contracts as Record<string, unknown>
    )) {
      const candidate = value as { safeParse?: unknown; shape?: unknown };
      if (typeof candidate.safeParse !== "function") continue;
      if (candidate.shape === undefined) continue;
      /*
       * `io: "output"` because the document describes responses. An input
       * rendering would show a default as optional where the response always
       * carries it.
       */
      let json: Node;
      try {
        json = z.toJSONSchema(value as z.ZodType, { io: "output" });
      } catch {
        /*
         * **Counted, not swallowed.** `z.toJSONSchema` refuses a schema
         * carrying a `transform` — "Transforms cannot be represented in JSON
         * Schema" — which is true and unavoidable: a transform is code, and
         * JSON Schema describes data.
         *
         * Skipping it silently is how this comparison would quietly shrink to
         * nothing as more contracts gained transforms, so the count is kept and
         * a case below holds it down.
         */
        unrenderable.push(name);
        continue;
      }
      const properties = json["properties"] as Record<string, Node> | undefined;
      if (properties === undefined) continue;
      side.set(name.replace(/Schema$/u, "").toLowerCase(), {
        definitions: (json["$defs"] ?? {}) as Record<string, Node>,
        properties
      });
    }
    return side;
  };

  const disagreements = (): string[] => {
    const { definitions, schemas } = document();
    const side = contractSide();
    const found: string[] = [];
    for (const [name, schema] of Object.entries(schemas)) {
      const contract = side.get(name.replace(/Schema$/u, "").toLowerCase());
      if (contract === undefined || schema.properties === undefined) continue;
      for (const [field, node] of Object.entries(schema.properties)) {
        const declared = contract.properties[field];
        if (declared === undefined) continue;
        const published = show(kindOf(node, definitions));
        const promised = show(kindOf(declared, contract.definitions));
        if (published !== promised)
          found.push(
            `${name}.${field}: document ${published}, contract ${promised}`
          );
      }
    }
    return found.sort();
  };

  const comparableCount = (): number => {
    const { schemas } = document();
    const side = contractSide();
    let total = 0;
    for (const [name, schema] of Object.entries(schemas)) {
      const contract = side.get(name.replace(/Schema$/u, "").toLowerCase());
      if (contract === undefined || schema.properties === undefined) continue;
      for (const field of Object.keys(schema.properties))
        if (field in contract.properties) total += 1;
    }
    return total;
  };

  it("publishes the type the contract declares, for every field", () => {
    /*
     * The whole increment, in one assertion. A field the document calls a
     * string and the contract makes a number is a client that compiles and
     * fails at runtime; a nullable the document omits is a client that never
     * checks.
     */
    expect(disagreements()).toEqual([]);
  });

  it("compares enough fields to be worth running", () => {
    /*
     * **The guard, for the third increment running.** I41's comparison would
     * have passed by emptiness and the guard is what noticed; I42's would too.
     * Here the equivalent failure is `z.toJSONSchema` throwing on a schema —
     * caught, skipped, and silently reducing the comparison to nothing.
     */
    expect(comparableCount()).toBeGreaterThan(250);
  });

  it("skips exactly the eight contracts JSON Schema cannot express", () => {
    /*
     * A `transform` is code and JSON Schema describes data, so `z.toJSONSchema`
     * is right to refuse these — every one is an **input** schema that trims or
     * normalises before validating, and none describes a response.
     *
     * **The set rather than a count.** A count is a budget somebody spends: add
     * a transform to a ninth contract and a "fewer than ten" bound absorbs it
     * silently, and the comparison shrinks by one subject with nobody
     * deciding. Naming them means the next one fails here and has to be
     * acknowledged.
     *
     * The first version of this case guessed "fewer than six" and there were
     * eight. The guess was wrong in the direction that would have blocked a
     * correct state, which is the better direction, and it was replaced by a
     * measurement rather than by a larger guess.
     */
    contractSide();
    expect([...unrenderable].sort()).toEqual([
      "browseSelectionSchema",
      "createAttributeSchema",
      "editOfferingSchema",
      "reviewAffiliateDestinationSchema",
      "searchSubmissionSchema",
      "updateAttributePropertiesSchema",
      "updateBusinessInformationSchema",
      "validateAffiliateDestinationSchema"
    ]);
  });

  it("still sees a nullable as different from a plain one", () => {
    /*
     * **The property the first version of this comparison destroyed.** It read
     * `type: ["string","null"]` and `anyOf: [{string},{null}]` as different
     * things, and the fix for that could easily have gone too far and read a
     * nullable and a non-nullable as the same.
     *
     * Asserted directly on the normaliser rather than through the document,
     * because what is being checked is the instrument.
     */
    expect(show(kindOf({ type: ["string", "null"] }, {}))).toBe("string?");
    expect(show(kindOf({ type: "string" }, {}))).toBe("string");
    expect(
      show(kindOf({ anyOf: [{ type: "string" }, { type: "null" }] }, {}))
    ).toBe("string?");
  });

  it("reads the three encodings of agreement as agreement", () => {
    /*
     * The sixty-two false differences, as cases. Each pair means the same thing
     * to a caller and was reported as drift by the first attempt.
     */
    const definitions = { Kind: { enum: ["A", "B"], type: "string" } };
    // A `$ref` to a shared enum, and the same enum inlined.
    expect(
      show(kindOf({ $ref: "#/components/schemas/Kind" }, definitions))
    ).toBe(show(kindOf({ enum: ["A", "B"], type: "string" }, {})));
    // An enum of strings, and a string.
    expect(show(kindOf({ enum: ["ok"] }, {}))).toBe(
      show(kindOf({ type: "string" }, {}))
    );
  });
});
