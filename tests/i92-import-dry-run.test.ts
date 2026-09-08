import { execFile } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * `I92` — the launch dry run, asserted by running it.
 *
 * The Owner set five conditions the import must satisfy before the real
 * catalogue is loaded. Four of them are properties of a *run*, not of the
 * source, so this suite runs the script as an operator would — a subprocess,
 * two CSV files, `--dry-run` — and reads its output. The fifth is that he gets
 * the raw output, which is not a thing a test can hold.
 *
 * Three of the four were not true when he wrote them down:
 *
 * - **An empty `productKey` imported silently.** The request body was built as
 *   `row["productKey"] ? { productKey: … } : {}`, so a missing key became an
 *   absent field rather than a refusal. The listing published, looked correct,
 *   and could never be matched by its partner's feed (`I89` matches on
 *   `product_key`) nor grouped with its competitors. The damage would have
 *   surfaced weeks later as "why does this price never change".
 * - **The dry run proved nothing about how it read a cell.** It printed a
 *   count of valid rows. Whether an empty delivery cost had been read as
 *   `null` or as `0` — a promise of free delivery nobody made, which also wins
 *   the total-cost ordering — was not visible anywhere.
 * - **"Nothing was written" was a claim by the code about the code.** True at
 *   the time, and it would have stayed printed had somebody later added a
 *   write above the early return.
 *
 * The fourth, that one bad row must not stop the others, was already true and
 * is asserted here because the first three changes move code around it.
 */
const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

const run = promisify(execFile);

/** The columns the importer reads, in the order the example file has them. */
const HEADER =
  "businessSlug,slug,title,summary,categoryStableKey,productKey," +
  "priceKind,amount,currency,priorAmount,deliveryCost,stockState," +
  "destinationUrl,imageUrls,attributes";

suite("Increment I92 the launch dry run", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let categoryKey = "";
  let output = "";
  let exitCode = 0;

  beforeAll(async () => {
    /*
     * A real Category, because the importer resolves `categoryStableKey`
     * against the database and a fabricated key would fail every row for the
     * wrong reason — the suite would then pass its "one bad row does not stop
     * the others" test over a file in which every row was bad.
     */
    const category = await pool.query<{ key: string }>(
      `select stable_key as key from category where active limit 1`
    );
    categoryKey = category.rows[0]?.key ?? "";

    const folder = mkdtempSync(join(tmpdir(), "i92-"));
    const businesses = join(folder, "businesses.csv");
    const offerings = join(folder, "offerings.csv");
    writeFileSync(
      businesses,
      "slug,name,shortDescription,ownerEmail\n" +
        "i92-partner,I92 Partner,Test.,\n"
    );
    /*
     * Row 3 is the Owner's case: a product key nobody filled in and a delivery
     * cost nobody filled in, on the same row. The two conditions he set for it
     * pull in opposite directions — refuse the row, and prove how its empty
     * delivery cost was read — so the importer parses the money before it
     * judges the row, and both facts are printed for the same line.
     *
     * Row 4 exists to prove the refusal above it did not end the run.
     */
    writeFileSync(
      offerings,
      `${HEADER}\n` +
        `i92-partner,i92-one,Bir,,${categoryKey},I92-K1,` +
        `FIXED,"1.000,00",TRY,,"49,90",IN_STOCK,,,\n` +
        `i92-partner,i92-two,İki,,${categoryKey},,` +
        `FIXED,"2.000,00",TRY,,,IN_STOCK,,,\n` +
        `i92-partner,i92-three,Üç,,${categoryKey},I92-K3,` +
        `FIXED,"3.000,00",TRY,,"0",IN_STOCK,,,\n`
    );

    try {
      const done = await run(
        "node",
        [
          "scripts/import-catalogue.mjs",
          businesses,
          offerings,
          "--dry-run",
          "--skip-image-check"
        ],
        { env: { ...process.env, IMPORT_PASSWORD: "i92-dry-run" } }
      );
      output = done.stdout + done.stderr;
    } catch (error) {
      /*
       * A dry run over a file with a bad row exits non-zero on purpose, and
       * `execFile` rejects on that. The output is the point, not the code.
       */
      const failed = error as { code?: number; stderr: string; stdout: string };
      output = failed.stdout + failed.stderr;
      exitCode = failed.code ?? 0;
    }
  }, 120_000);

  afterAll(async () => {
    await pool.end();
  });

  it("writes nothing, and the database is what says so", () => {
    /*
     * Not the sentence "nothing was written", which the script could print
     * either way — the setting read back out of the session that just ran. A
     * write added above the early return would fail against Postgres rather
     * than be announced as a dry run.
     */
    expect(output).toContain("DENEME — hiçbir şey yazılmadı");
    expect(output).toContain("transaction_read_only=on");
  });

  it("makes the read-only session real rather than announced", async () => {
    /*
     * The claim above is only worth printing if the setting the script uses
     * actually refuses a write. Asserted against the same statement the script
     * sends, on a connection of this suite's own, so the guarantee is checked
     * rather than assumed from a line of output.
     */
    const client = await pool.connect();
    try {
      await client.query(
        "set session characteristics as transaction read only"
      );
      await expect(
        client.query(`create temporary table i92_should_not_exist (a int)`)
      ).rejects.toThrow(/read-only transaction/u);
    } finally {
      client.release(true);
    }
  });

  it("refuses a row whose productKey is empty", () => {
    expect(output).toContain("productKey eksik");
    expect(output).toContain("i92-two");
    expect(output).toContain("hata    : 1");
    // A refused row is a refused row, and the run says so on the way out.
    expect(exitCode).toBe(1);
  });

  it("carries on through the refusal instead of stopping at it", () => {
    /*
     * The row after the bad one is the whole assertion. An importer that
     * aborted would leave an operator with one message and four hundred
     * unexamined rows, which is the failure this dry run exists to prevent.
     */
    expect(output).toContain("i92-three");
    expect(output).toContain("ilan    : 2 yazılacak");
  });

  it("reads an empty delivery cost as null, and shows that it did", () => {
    /*
     * The distinction that cannot be checked any other way. `0` is a promise
     * of free delivery, and it is not the same claim as "not stated" — the
     * total-cost ordering adds `coalesce(delivery_cost, 0)`, so a wrongly
     * zeroed row quietly beats an honest one.
     */
    expect(output).toContain("kargo=null (belirtilmemiş)");
    // And a stated zero still reads as zero rather than being flattened away.
    expect(output).toContain("kargo=0");
    expect(output).toContain("kargo=49.90");
  });

  it("does not bury the report under the API's routing table", () => {
    /*
     * The importer boots the API in-process to drive it, and Nest's own
     * bootstrap logger ignored the `fatal` level it was given: about a hundred
     * and thirty `LOG` lines announcing every mapped route arrived before any
     * of the report. An operator asked to read the output should not have to
     * scroll past the platform's route table to find out what happened to
     * their file.
     */
    expect(output).not.toContain("RouterExplorer");
    expect(output).not.toContain("Nest application successfully started");
  });
});
