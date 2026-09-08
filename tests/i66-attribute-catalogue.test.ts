import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * `I66` — the field sets a listing is entered against.
 *
 * **The catalogue had a shape and no fields.** Eleven sectors and a hundred and
 * twenty-seven headings were seeded by `seed-taxonomy.mjs`; the Attribute
 * machinery has existed since I2 and, outside the test suite, nothing had ever
 * written a row into it. Everything that depends on it was therefore missing at
 * once: the per-heading specification the Owner's prototype shows, Attribute
 * Filters, the comparison table's rows, the search that answers "16 gb ram
 * laptop", and the listing form itself.
 *
 * These cases read the two scripts as text rather than running them against a
 * database, and that is deliberate: what can go wrong here is a *drift* between
 * two files — a heading renamed in one and not the other, a key reused for two
 * different things — and a drift is visible in the source without a server.
 * The script's own `ATTRIBUTE_SHAPE_CLASH` guard covers the third failure at
 * run time, and it has already caught one (`PANEL`, which meant a television's
 * screen technology in one sector and a hosting control panel in another).
 */
const taxonomy = readFileSync("scripts/seed-taxonomy.mjs", "utf8");
const attributes = readFileSync("scripts/seed-attributes.mjs", "utf8");

/** Every heading slug the taxonomy seeds, in the order it seeds them. */
function taxonomyHeadings(): string[] {
  const body = /const TAXONOMY = \{([\s\S]*?)\n\};/u.exec(taxonomy)?.[1] ?? "";
  return [...body.matchAll(/\["([a-z0-9-]+)",\s*"/gu)].map(
    (row) => row[1] ?? ""
  );
}

/** Every heading slug the attribute catalogue writes fields for. */
function fieldHeadings(): string[] {
  return [...attributes.matchAll(/^ {2}"?([a-z0-9-]+)"?: \[$/gmu)].map(
    (row) => row[1] ?? ""
  );
}

/** The fields written under one heading, as their attribute keys. */
function fieldsOf(slug: string): string[] {
  const opened = new RegExp(`^ {2}"?${slug}"?: \\[([\\s\\S]*?)^ {2}\\]`, "mu");
  const block = opened.exec(attributes)?.[1] ?? "";
  return [
    /*
     * `a("KEY", …)` written inline — with the newline Prettier inserts when the
     * call is long — and the shared constants referenced by name.
     */
    ...[...block.matchAll(/a\(\s*"([A-Z0-9_]+)"/gu)].map((row) => row[1] ?? ""),
    ...[...block.matchAll(/^\s{4}([A-Z][A-Z0-9_]+),?$/gmu)].map(
      (row) => row[1] ?? ""
    )
  ];
}

describe("Increment I66 the attribute catalogue", () => {
  it("gives every seeded heading a field set", () => {
    const missing = taxonomyHeadings().filter(
      (slug) => !fieldHeadings().includes(slug)
    );

    /*
     * The whole increment in one assertion. A heading with no fields is a
     * listing form that asks for a title and a price, a Category that offers no
     * Filters, and a product page whose specification is empty — and none of
     * those looks broken from the outside, which is why it needs a test rather
     * than a review.
     */
    expect(missing).toEqual([]);
  });

  it("writes fields for nothing the taxonomy does not seed", () => {
    // The other direction, and the one a rename produces: a heading renamed in
    // the taxonomy leaves its fields orphaned here, pointing at a Category that
    // no longer exists. The script reports it at run time; this fails first.
    const orphans = fieldHeadings().filter(
      (slug) => !taxonomyHeadings().includes(slug)
    );
    expect(orphans).toEqual([]);
  });

  it("keeps every heading between four and ten fields", () => {
    /*
     * A heading with twenty fields is a form nobody finishes and a filter panel
     * nobody reads; one with two is a Category that cannot be narrowed. The
     * bounds are a judgement, and they are asserted so that the next hundred
     * headings are argued about rather than accumulated.
     */
    const outside = fieldHeadings()
      .map((slug) => [slug, fieldsOf(slug).length] as const)
      .filter(([, count]) => count < 4 || count > 10);

    expect(outside).toEqual([]);
  });

  it("counts what it checked, so a broken parse is visible", () => {
    // Both checks above pass vacuously against an empty parse. These numbers
    // are the evidence that the regexes still see the files.
    expect(taxonomyHeadings()).toHaveLength(127);
    expect(fieldHeadings()).toHaveLength(127);
  });

  it("marks no field as required for publication", () => {
    /*
     * `requiredForPublication` is a real gate — an Offering missing a required
     * value cannot be published — and a seed script turning it on would retire
     * other people's drafts. The flag belongs to the Admin screens, one heading
     * at a time, once there are sellers to tell.
     */
    expect(attributes).toContain("required_for_publication");
    expect(
      /required_for_publication[^)]*?\$\d+,\s*true/u.test(attributes)
    ).toBe(false);
  });

  it("never makes a Text field filterable", () => {
    // `US-PLT-F09-001` refuses it and the Admin service enforces it; the script
    // states the same rule at the insert rather than trusting the flag letters.
    expect(attributes).toContain(
      'field.flags.includes("f") && kind !== "TEXT"'
    );
  });
});
