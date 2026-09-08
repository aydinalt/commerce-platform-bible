import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * `I85` — importing a real catalogue.
 *
 * The Owner asked to move from building the platform to loading it. What was
 * missing was not a feature but a road: taxonomy and field sets could be seeded,
 * and there was **no way at all** to get a partner or a listing in except by
 * hand through the site, five calls and three Admin acts at a time.
 *
 * This suite guards the properties that were found by running the importer
 * against a real database rather than by reasoning about it. Each of them was a
 * bug first:
 *
 * - **money as a number.** The contract takes an amount as a decimal *string*
 *   so a price never becomes a float that could disagree with the database
 *   about what something costs. The first version sent `Number(...)` and the
 *   API refused every priced row.
 * - **a draft is not a finished listing.** Creating one is five calls; the
 *   second failing leaves a `DRAFT`. Skipping "anything that exists" made a
 *   re-run report *zero errors* over listings that were never published — the
 *   worst answer available, because it is the one that stops somebody looking.
 * - **a session is not a business context.** A resumed partner signed in and
 *   then got `404` on every listing, an error that reads like a missing
 *   Offering and is really a missing context.
 * - **a dry run must resolve partners from the file.** It writes none, so
 *   checking only the database reported "unknown partner" for every listing of
 *   every partner the same run was about to create.
 */
describe("Increment I85 the catalogue importer", () => {
  const script = readFileSync("scripts/import-catalogue.mjs", "utf8");
  const code = script
    .replaceAll(/\/\*[\s\S]*?\*\//gu, " ")
    .replaceAll(/^\s*\/\/.*$/gmu, " ");

  it("sends money as a canonical decimal string, never a number", () => {
    /*
     * The regex is the contract's own: ten integer digits, at most two
     * decimals, no sign — exactly `NUMERIC(12,2)`. Asserted as the presence of
     * the check rather than the absence of `Number(`, because a later edit
     * could reintroduce the coercion anywhere.
     */
    expect(code).toContain("^(?:0|[1-9]\\d{0,9})(?:\\.\\d{1,2})?$");
    // The parser must return the string it validated, not a parsed value.
    expect(code).not.toMatch(/return Number\(/u);
  });

  it("resumes a draft instead of skipping it", () => {
    /*
     * The skip is keyed on the lifecycle, so a half-created listing is carried
     * the rest of the way and only a published one is left alone.
     */
    expect(code).toContain("status::text as status");
    expect(code).toContain('found.status !== "DRAFT"');
    expect(code).toContain("existingId");
  });

  it("enters the business context after signing a partner back in", () => {
    const resumed = code.slice(code.indexOf("signIn("));
    expect(resumed).toContain("/auth/me/business-context");
  });

  it("performs all three Admin acts, and adds no batch endpoint", () => {
    /*
     * Review, Validate and Enable stay three acts. Collapsing them would have
     * been less code and would have removed a deliberate three-step judgement
     * from the platform for everybody, for ever, to save an operator minutes
     * once.
     */
    for (const act of ["/review", "/validation", "/enablement"])
      expect(code, `the importer must perform ${act}`).toContain(act);
    /*
     * No new route was added for this; it drives the ones that exist. The
     * check is for a batch *address*, not the word: the first version forbade
     * `batch` anywhere and matched `processor.processBatch()` — the outbox
     * drain that recovers the confirmation link, which has nothing to do with
     * moderation and is entirely correct.
     */
    expect(code).not.toMatch(/["`][\w/-]*(?:batch|bulk)[\w/-]*["`]/iu);
  });

  it("goes through the API rather than writing rows", () => {
    /*
     * Between "a row exists" and "somebody can see it" sit the publication
     * minimum, the eligibility composition, the projection and the handoff
     * biconditional. An importer writing SQL would bypass all four and produce
     * a catalogue that looks complete in the database and is invisible on the
     * site.
     */
    expect(code).toContain("app.inject");
    expect(code).not.toMatch(/insert into offering\b/iu);
    expect(code).not.toMatch(/insert into business\b/iu);
  });

  it("refuses to run without a stable password", () => {
    // A password invented per run would make every re-run fail on every
    // existing partner, which is the opposite of resumable.
    expect(code).toContain("IMPORT_PASSWORD");
    expect(code).toMatch(/PASSWORD === ""/u);
  });

  it("collects row failures instead of aborting", () => {
    // One malformed price must not cost the other 499 rows.
    expect(code).toContain("failures.push");
    expect(code).toContain("process.exitCode = 1");
  });

  it("parses CSV properly rather than splitting on commas", () => {
    /*
     * A product title with a comma in it is not an edge case. `split(",")`
     * would shift every column after it and import the price into the currency
     * field.
     */
    expect(code).not.toMatch(/\.split\(","\)/u);
    expect(code).toContain("quoted");
  });

  it("ships templates that match the columns it reads", () => {
    const businesses = readFileSync("data/businesses.example.csv", "utf8");
    const offerings = readFileSync("data/offerings.example.csv", "utf8");
    const columnsOf = (csv: string) =>
      (csv.split("\n")[0] ?? "").split(",").map((name) => name.trim());

    /*
     * A template whose headers the script does not read is worse than no
     * template: an operator fills it in and the values land nowhere.
     */
    for (const column of columnsOf(businesses))
      expect(code, `businesses template column ${column}`).toContain(
        `"${column}"`
      );
    for (const column of columnsOf(offerings))
      expect(code, `offerings template column ${column}`).toContain(
        `"${column}"`
      );
  });

  it("is named in the launch runbook", () => {
    /*
     * The runbook is the first launch document this repository has had, and a
     * tool nobody can find is a tool nobody runs.
     */
    const runbook = readFileSync(
      "docs/implementation/V1_LAUNCH_RUNBOOK.md",
      "utf8"
    );
    expect(runbook).toContain("import:catalogue");
    expect(runbook).toContain("seed:taxonomy");
    expect(runbook).toContain("seed:attributes");
    // The order that only fails loudly in one direction.
    expect(runbook.indexOf("seed:taxonomy")).toBeLessThan(
      runbook.indexOf("seed:attributes")
    );
  });
});
