import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import * as contracts from "@commerce/contracts";

/**
 * The published shapes, checked against the contracts (I42).
 *
 * I41 compared the OpenAPI document with the routes the API serves and found it
 * complete: 87 operations documented, none invented. It also wrote down what it
 * could not see:
 *
 * > This compares method and path, not shape. A response schema that no longer
 * > matches what the handler returns would pass every case here.
 *
 * **It did not match, and had not since I30.** That increment gave Offerings
 * visuals — adding `primaryVisualUrl` to the Search result and `visuals` to the
 * owner's editable content — and updated the Zod contracts, the database, the
 * API and the web application. It did not update the **five-thousand-line
 * hand-written OpenAPI generator**, and nothing in the repository could tell.
 *
 * So for eleven increments the published description of this API omitted two
 * fields the API returns. A client generated from it would have had no
 * `primaryVisualUrl` on a Listing Card and no `visuals` on an Offering, and
 * would have looked correct while quietly dropping them.
 */
describe("Increment I42 the published shapes", () => {
  /**
   * The Zod object schemas, keyed by the document's naming.
   *
   * `searchResultSchema` in the contracts is `SearchResult` in the document, so
   * the trailing `Schema` and the casing are normalised away. Eighty-one of the
   * ninety-two document schemas correspond this way; the rest are shapes one
   * side names and the other inlines, and comparing those needs a mapping
   * nobody has written.
   */
  const contractShapes = (): Map<string, string[]> => {
    const shapes = new Map<string, string[]>();
    for (const [name, value] of Object.entries(
      contracts as Record<string, unknown>
    )) {
      const candidate = value as {
        safeParse?: unknown;
        shape?: Record<string, unknown>;
      };
      if (typeof candidate.safeParse !== "function") continue;
      if (candidate.shape === undefined) continue;
      shapes.set(
        name.replace(/Schema$/u, "").toLowerCase(),
        Object.keys(candidate.shape).sort()
      );
    }
    return shapes;
  };

  const documentShapes = (): Map<string, string[]> => {
    const document = JSON.parse(
      readFileSync("generated/openapi.json", "utf8")
    ) as {
      components?: {
        schemas?: Record<string, { properties?: Record<string, unknown> }>;
      };
    };
    const shapes = new Map<string, string[]>();
    for (const [name, schema] of Object.entries(
      document.components?.schemas ?? {}
    ))
      if (schema.properties !== undefined)
        shapes.set(name, Object.keys(schema.properties).sort());
    return shapes;
  };

  /** Only the pairs where both sides name the same shape. */
  const pairs = (): { document: string[]; name: string; zod: string[] }[] => {
    const zod = contractShapes();
    const found: { document: string[]; name: string; zod: string[] }[] = [];
    for (const [name, properties] of documentShapes()) {
      const shape = zod.get(name.replace(/Schema$/u, "").toLowerCase());
      if (shape !== undefined)
        found.push({ document: properties, name, zod: shape });
    }
    return found;
  };

  it("publishes every field the contract declares", () => {
    /*
     * **The direction that was broken.** A field the API returns and the
     * document omits is a field every generated client drops on the floor, and
     * it arrives by the ordinary means: a contract edited and a five-thousand
     * line file not edited.
     *
     * Both misses were I30's: `SearchResult.primaryVisualUrl` and
     * `EditableOfferingContent.visuals`.
     */
    const missing = pairs()
      .map(({ document, name, zod }) => ({
        fields: zod.filter((field) => !document.includes(field)),
        name
      }))
      .filter(({ fields }) => fields.length > 0);
    expect(missing).toEqual([]);
  });

  it("publishes nothing the contract does not declare", () => {
    /*
     * The other direction, and the one that promises rather than hides. A
     * documented field that no response carries is something a client will
     * read and find `undefined` in, and a field *removed* from a contract
     * leaves exactly this.
     */
    const invented = pairs()
      .map(({ document, name, zod }) => ({
        fields: document.filter((field) => !zod.includes(field)),
        name
      }))
      .filter(({ fields }) => fields.length > 0);
    expect(invented).toEqual([]);
  });

  it("compares enough shapes to be worth running", () => {
    /*
     * **The guard I41 taught me to write.** Its own comparison would have
     * passed by emptiness if the route observer stopped firing, and the case
     * that noticed was exactly this one.
     *
     * Here the equivalent failure is a naming change on either side — a
     * contract renamed, a document schema renamed — silently reducing the pairs
     * to zero and leaving both comparisons comparing nothing.
     */
    expect(pairs().length).toBeGreaterThan(75);
  });

  it("names the two fields I30 added and the document had lost", () => {
    /*
     * Asserted by name rather than only by the general rule, because a general
     * rule that has never been violated is indistinguishable from one that
     * cannot be. These two were violated for eleven increments.
     */
    const document = documentShapes();
    expect(document.get("SearchResult")).toContain("primaryVisualUrl");
    expect(document.get("EditableOfferingContent")).toContain("visuals");
  });
});
