import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const PRISMA = "packages/database/prisma";
const SCHEMA = join(PRISMA, "schema.prisma");

/** One relation the datamodel owns: where it lives and what it means. */
interface OwnedRelation {
  columns: string[];
  onDelete: string | null;
  onUpdate: string;
  table: string;
}

/** One foreign key a migration actually wrote. */
interface WrittenKey {
  columns: string[];
  onDelete: string;
  onUpdate: string;
  table: string;
}

const key = (table: string, columns: string[]) => `${table}(${columns.join()})`;

/**
 * Every relation `schema.prisma` owns, with the referential actions it means.
 *
 * Only the owning side has `fields:`; the back-reference names the same
 * relation and writes no column, so it is not a foreign key and is skipped.
 *
 * **`onUpdate` defaults to `Cascade`** when a relation does not say otherwise,
 * which is the whole reason this check exists: an author who spells only
 * `ON DELETE` in SQL has not written what the datamodel means, they have
 * written PostgreSQL's `NO ACTION` and left no trace of the disagreement.
 * `onDelete`'s default depends on optionality, so it is asserted only where
 * the schema states it.
 */
function ownedRelations(): OwnedRelation[] {
  const schema = readFileSync(SCHEMA, "utf8");
  const owned: OwnedRelation[] = [];

  for (const model of schema.matchAll(/model\s+(\w+)\s*\{([\s\S]*?)\n\}/gu)) {
    const [, name = "", body = ""] = model;
    const table = /@@map\("([^"]+)"\)/u.exec(body)?.[1] ?? name;
    const columnOf = new Map(
      [...body.matchAll(/^\s*(\w+)\s+\S+.*?@map\("([^"]+)"\)/gmu)].map((m) => [
        m[1] ?? "",
        m[2] ?? ""
      ])
    );

    for (const relation of body.matchAll(
      /@relation\(([^)]*fields:[^)]*)\)/gu
    )) {
      const inner = relation[1] ?? "";
      const fields = /fields:\s*\[([^\]]*)\]/u.exec(inner)?.[1] ?? "";
      owned.push({
        columns: fields
          .split(",")
          .map((field) => field.trim())
          .map((field) => columnOf.get(field) ?? field),
        onDelete: /onDelete:\s*(\w+)/u.exec(inner)?.[1] ?? null,
        onUpdate: /onUpdate:\s*(\w+)/u.exec(inner)?.[1] ?? "Cascade",
        table
      });
    }
  }
  return owned;
}

/**
 * Every foreign key the migrations wrote, whichever way it was spelled.
 *
 * Both spellings are in this repository — `ALTER TABLE ... ADD CONSTRAINT` and
 * a `FOREIGN KEY` clause inside `CREATE TABLE` — and the inline form is the one
 * that invites the mistake, because the referential actions sit at the end of a
 * clause rather than at the end of a statement.
 */
function writtenKeys(): WrittenKey[] {
  const sql = readdirSync(PRISMA + "/migrations")
    .filter((entry) => !entry.endsWith(".toml"))
    .sort()
    .map((entry) =>
      readFileSync(join(PRISMA, "migrations", entry, "migration.sql"), "utf8")
    )
    .join("\n");

  const written: WrittenKey[] = [];
  for (const statement of sql.matchAll(/(?:ALTER|CREATE)\s+TABLE[^;]*;/gu)) {
    const text = statement[0];
    const table =
      /TABLE\s+(?:IF NOT EXISTS\s+)?"?(\w+)"?/u.exec(text)?.[1] ?? "";

    for (const fk of text.matchAll(
      /FOREIGN KEY\s*\(([^)]*)\)\s*REFERENCES([\s\S]*?)(?=,\s*\n\s*(?:CONSTRAINT|FOREIGN KEY)|\)\s*;|;)/gu
    )) {
      const tail = fk[1 + 1] ?? "";
      written.push({
        columns: (fk[1] ?? "")
          .split(",")
          .map((column) => column.trim().replaceAll('"', "")),
        // `SET NULL` is two words; every other action is one.
        onDelete: /ON DELETE (SET NULL|\w+)/u.exec(tail)?.[1] ?? "ABSENT",
        onUpdate: /ON UPDATE (SET NULL|\w+)/u.exec(tail)?.[1] ?? "ABSENT",
        table
      });
    }
  }
  return written;
}

const same = (declared: string, sql: string) =>
  declared.toUpperCase() === sql.replaceAll(" ", "").toUpperCase();

/**
 * The two checks `CURRENT_STATUS.md` claimed existed, and did not.
 *
 * Its Known Boundaries said "two local checks now stand in for the gates that
 * cannot run here". No test and no script in this repository read
 * `schema.prisma`; the claim was withdrawn on 2026-08-17 and these are the
 * checks it described.
 *
 * They do not replace the CI drift gate, which compares a real database to the
 * datamodel and sees things no text comparison can. What they add is the one
 * failure the drift gate is bad at telling you about *before* you push: a
 * migration that says less than the datamodel means.
 */
describe("Increment I14 schema and migration consistency", () => {
  it("gives every relation the datamodel owns a foreign key", () => {
    const written = new Set(
      writtenKeys().map((fk) => key(fk.table, fk.columns))
    );
    const unenforced = ownedRelations()
      .map((relation) => key(relation.table, relation.columns))
      .filter((relation) => !written.has(relation));

    // A relation Prisma models and no migration enforces is a rule the
    // datamodel states and the database does not keep. Prisma Client would
    // honour it and every raw-SQL path in this repository would not — and this
    // repository is raw SQL everywhere except migrations.
    expect(unenforced).toEqual([]);
  });

  it("spells the referential actions the datamodel means", () => {
    const written = new Map(
      writtenKeys().map((fk) => [key(fk.table, fk.columns), fk])
    );

    const wrong = ownedRelations().flatMap((relation) => {
      const fk = written.get(key(relation.table, relation.columns));
      if (!fk) return [];
      const problems: string[] = [];
      if (!same(relation.onUpdate, fk.onUpdate))
        problems.push(
          `${key(relation.table, relation.columns)} ON UPDATE: datamodel says ${relation.onUpdate}, migration says ${fk.onUpdate}`
        );
      if (relation.onDelete !== null && !same(relation.onDelete, fk.onDelete))
        problems.push(
          `${key(relation.table, relation.columns)} ON DELETE: datamodel says ${relation.onDelete}, migration says ${fk.onDelete}`
        );
      return problems;
    });

    /*
     * An inlined `REFERENCES ... ON DELETE` leaves `ON UPDATE` at PostgreSQL's
     * `NO ACTION` while the datamodel means `CASCADE`, and nothing local said
     * so: `prisma migrate diff` needs an engine this environment cannot reach.
     *
     * Keyed by table *and* columns, which is not fussiness. Keyed by column
     * name alone, this comparison reports sixteen failures that are not real —
     * `user_id` and `offering_id` each appear in several tables under different
     * rules, and the last one read wins.
     */
    expect(wrong).toEqual([]);
  });

  it("counts what it checked, so a vanished relation is visible", () => {
    // Both checks above pass vacuously against an empty parse: a regex that
    // stopped matching would report nothing wrong and nothing at all. These
    // numbers are the evidence that the parses still see the datamodel.
    // 54 since I30 added `offering_visual`; 56 since I62 added
    // `product_review` and 58 since I64 added `favourite` — each owns two, the
    // Offering it was written under and the account it belongs to. 61 since
    // I69 added `listing_report`, which owns three: the listing it concerns,
    // the reader who sent it where there was one, and the Admin who closed it.
    // 62 since I70's `complementary_placement`, which owns one: the Category
    // whose listings suggest it. 65 since I75's advertising settings — the
    // single settings row names the Admin who last changed it, and each ad-free
    // Category names the Category and the Admin who marked it. 72 since I76's
    // feed intake: a feed names its Business, its Category and the Admin who
    // configured it; a run names its feed; a rejection names its run; and a
    // feed item names both the feed and the Offering it stands for. 73 since
    // I83's `admin_audit_event`, which owns exactly one: the Admin who acted.
    // Only the owning side counts here — `UserAccount`'s back-reference is the
    // same relation seen from the other end — so this moves by one, not two.
    // The row's `target_id` and `case_id` are deliberately not relations: an
    // audit row must outlive whatever it describes, and a foreign key that
    // could cascade or restrict would make the record depend on the very thing
    // it exists to account for.
    // It names a target and a case as bare ids rather than relations, and that
    // is deliberate — an audit row must outlive whatever it describes, so a
    // foreign key that could cascade or restrict against it would make the
    // record depend on the thing being accounted for.
    // 75 since I93's editorial review, which owns two: a section and a point
    // each name the review they belong to. The review itself owns none — it
    // names a Product Key and deliberately not an Offering, because AC-14 wants
    // the key to exist when the review is written and AC-9 wants the review to
    // survive every Offering carrying that key being withdrawn. A foreign key
    // would serve the first by defeating the second.
    expect(ownedRelations()).toHaveLength(75);
    // 55 since I30 added `offering_visual`'s foreign key; 59 with the four I62
    // and I64 wrote inline in their `CREATE TABLE` statements, 62 with I69's
    // three, 63 with I70's one, 66 with I75's three and 73 with I76's seven.
    // 74 with I83's one: the audit row's actor. Its `target_id` and `case_id`
    // are deliberately not foreign keys — see the note above.
    // 76 with I93's two: the editorial review's section and point children.
    expect(writtenKeys()).toHaveLength(76);
  });
});
