import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { promisify } from "node:util";

import { Pool } from "pg";
import { afterAll, describe, expect, it } from "vitest";

const run = promisify(execFile);

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

/**
 * Increment `I100` — the import operator's lifecycle, and existing partners.
 *
 * ## B1, and why it was worth finding
 *
 * `scripts/import-catalogue.mjs` registers an account of its own for every real
 * run and grants it Admin, because the three destination acts go through the
 * API and `V1_LAUNCH_RUNBOOK` §4 keeps the standing Admin's password with one
 * person. That part is sound. What was missing is the other half: **nothing
 * ever took the authorization away.** Every run left a permanent Super Admin
 * whose password is `IMPORT_PASSWORD`, and the word `import-operator` appeared
 * in no document and no test — so an operator following the pre-import
 * checklist had no reason to look for it.
 *
 * **The account is retired rather than deleted**, and that is the schema's
 * decision: `admin_audit_event.actor_id` is `onDelete: Restrict` precisely so
 * that removing a user cannot erase the record of what they did. The operator
 * performs three audited acts per listing with a destination, so it is evidence.
 * What is removed is every capability.
 *
 * ## B2
 *
 * `V1_LAUNCH_RUNBOOK` §2.2 has always said `businessSlug` may name "an existing
 * Business". The importer only accepted slugs from the same `businesses.csv`,
 * which breaks the second import batch — the run where an operator adds more
 * listings and leaves out partners that already exist.
 *
 * ## What these cases are, and are not
 *
 * The three stand-down cases below drive the **script** against a real database.
 * The rest are source assertions, and they are here for the property a single
 * run cannot show: that the cleanup is reached on the failing path as well.
 * Comments are stripped first — every file in this repository documents what it
 * deliberately does not do, so a naive "this word does not appear" check reads
 * the prose as the code.
 */
const script = readFileSync("scripts/import-catalogue.mjs", "utf8");
const code = script
  .replaceAll(/\/\*[\s\S]*?\*\//gu, "")
  .replaceAll(/^\s*\/\/.*$/gmu, "");

describe("Increment I100 the importer's own shape", () => {
  it("stands the operator down from a finally, not from the happy path", () => {
    /*
     * **The whole of B1's correctness is this one word.** A cleanup at the end
     * of the `try` runs on the runs nobody worries about and is skipped on the
     * ones that threw — which are exactly the runs an operator walks away from.
     */
    const tail = code.slice(code.lastIndexOf("} finally {"));
    expect(tail).toContain("await standDownOperator()");

    /* And before the pool closes, or the four statements have nothing to run on. */
    expect(tail.indexOf("standDownOperator")).toBeLessThan(
      tail.indexOf("pool.end()")
    );
  });

  it("removes every capability and deletes no account", () => {
    const stand = code.slice(
      code.indexOf("const standDownOperator"),
      code.indexOf("} finally {")
    );
    expect(stand).toMatch(/delete from admin_authorization where user_id/u);
    // AC-9: an entered context must stop at once, not at the next login.
    expect(stand).toMatch(/set admin_context = false/u);
    expect(stand).toMatch(/set revoked_at = now\(\)/u);
    expect(stand).toMatch(/set status = 'SUSPENDED'/u);

    /*
     * Never `delete from user_account`. `admin_audit_event.actor_id` would
     * refuse it, and a schema that stopped refusing it would let an import erase
     * the record of who enabled each affiliate destination.
     */
    expect(code).not.toMatch(/delete from user_account/u);
  });

  it("never prints the password", () => {
    /*
     * The stand-down reports what it did, and a report is the easiest place to
     * put a secret by accident — it is the one line an operator copies into a
     * ticket.
     *
     * **Asserted on where the value goes, not on which calls mention the
     * word.** The first version of this case forbade `PASSWORD` anywhere near a
     * `write(`, and it failed on the usage message — `"IMPORT_PASSWORD is not
     * set"` — which names the variable an operator has to set and discloses
     * nothing. Naming the secret is not leaking it; interpolating it is. So the
     * check follows the *identifier*: `PASSWORD` holds the value, and it may
     * reach exactly two places, both of them request bodies.
     */
    const uses = code.match(/(?<![A-Z_])PASSWORD\b/gu) ?? [];
    expect(uses).toHaveLength(4); // the constant, its emptiness check, and two bodies
    expect(code).toMatch(/const PASSWORD = process\.env\["IMPORT_PASSWORD"\]/u);
    expect(code.match(/password: PASSWORD\b/gu)).toHaveLength(2);

    /* And it is never put into a string at all, printed or otherwise. */
    expect(code).not.toMatch(/\$\{PASSWORD\}/u);
  });

  it("resolves an existing partner by slug, and creates nothing doing it", () => {
    const resolver = code.slice(
      code.indexOf("const existingPartner"),
      code.indexOf("for (let at = 0; at < businesses.length")
    );
    /* The owner's address is read rather than guessed from the slug. */
    expect(resolver).toMatch(/join business_owner/u);
    expect(resolver).toMatch(/join user_account/u);
    expect(resolver).toMatch(/where b\.slug = \$1/u);
    /* Resolution only: no Business is created on this path. */
    expect(resolver).not.toMatch(/POST", "\/businesses/u);
    expect(resolver).toMatch(/return undefined/u);
  });

  it("keeps the same-run partner ahead of the database", () => {
    /*
     * Order matters for idempotency: a partner created moments ago in this run
     * must be used as-is rather than re-resolved, and a second run must not
     * create a second Business for a slug it already has.
     */
    expect(code).toMatch(/partner\[businessSlug\] \?\?/u);
    expect(code).toMatch(/dryRun \? undefined : await existingPartner/u);
  });
});

suite("Increment I100 the import operator, against a database", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const written: string[] = [];

  afterAll(async () => {
    for (const file of written) rmSync(file, { force: true });
    await pool.end();
  });

  const csv = (name: string, body: string) => {
    const path = `/tmp/i100-${name}-${randomUUID()}.csv`;
    writeFileSync(path, body, "utf8");
    written.push(path);
    return path;
  };

  const leafCategory = async () => {
    const found = await pool.query<{ key: string }>(
      `select c.stable_key as key from category c
        where c.active = true
          and not exists (
            select 1 from category child
            where child.parent_id = c.id and child.active = true
          )
        limit 1`
    );
    const key = found.rows[0]?.key;
    if (key === undefined) throw new Error("NO_ACTIVE_LEAF_CATEGORY");
    return key;
  };

  /** Every Admin this database holds whose authorization came from an import. */
  const importAdmins = async () =>
    (
      await pool.query<{ total: number }>(
        `select count(*)::int as total from admin_authorization
          where granted_by = 'import-catalogue'`
      )
    ).rows[0]?.total ?? 0;

  const operators = async () =>
    (
      await pool.query<{ email: string; sessions: number; status: string }>(
        `select u.email, u.status::text as status,
                (select count(*)::int from user_session s
                  where s.user_id = u.id and s.revoked_at is null) as sessions
           from user_account u
          where u.email like 'import-operator-%'
          order by u.created_at desc`
      )
    ).rows;

  /**
   * Clears the caller throttle these runs share, and it stands for a real
   * limitation rather than for flakiness.
   *
   * The importer registers every account it needs through `POST
   * /auth/registrations`, which `IdentityService` throttles at **10 attempts
   * per 15 minutes per caller IP** (`ATTEMPT_LIMIT`), and every request the
   * script makes arrives through `app.inject` as the same caller. Five importer
   * runs in one test file cross that line, and the 429 is not what an operator
   * sees: `signUp` does not wrap the begin-registration call in `ok(...)`, so a
   * throttled attempt is silent and the run dies further down with
   * `NO_CONFIRMATION_FOR_<address>`, which reads like a broken mailer.
   *
   * **The same ceiling applies to a real import** — a launch batch of more than
   * nine new partners hits it — and that is a finding about the importer, not
   * about these tests. It is recorded and left open on purpose: it is neither
   * B1 nor B2, and the remedies (exempting an operator, raising the limit,
   * registering partners outside the API) are auth decisions that belong to the
   * Owner. Clearing the row here keeps this file testing the thing it is about.
   */
  const relaxCallerThrottle = () =>
    pool.query(
      `delete from auth_throttle
        where scope in ('registration', 'login', 'login-caller')`
    );

  const importCatalogue = async (businesses: string, offerings: string) => {
    await relaxCallerThrottle();
    return run(
      "node",
      ["scripts/import-catalogue.mjs", businesses, offerings],
      {
        env: {
          ...process.env,
          IMPORT_EMAIL_DOMAIN: "i100.invalid",
          IMPORT_PASSWORD: "i100-operator-lifecycle"
        }
      }
    ).catch((error: unknown) => {
      /* A failing run still has to clean up — that is the case below. */
      const result = error as { stderr?: string; stdout?: string };
      return { stderr: result.stderr ?? "", stdout: result.stdout ?? "" };
    });
  };

  it("leaves no Admin behind when the import succeeds", async () => {
    const category = await leafCategory();
    const partner = `i100-${randomUUID().slice(0, 8)}`;
    const before = await importAdmins();

    const { stderr, stdout } = await importCatalogue(
      csv(
        "businesses",
        `slug,name,shortDescription,ownerEmail\n${partner},I100 Partner,,\n`
      ),
      csv(
        "offerings",
        `businessSlug,slug,title,summary,categoryStableKey,productKey,priceKind,amount,currency,priorAmount,deliveryCost,stockState,destinationUrl,imageUrls,attributes\n` +
          `${partner},${partner}-listing,I100 İlan,,${category},I100-${partner},FIXED,100.00,TRY,,,IN_STOCK,,,\n`
      )
    );

    /*
     * Named before the assertions that depend on the run having happened at
     * all. A throttled registration kills the run before the operator exists,
     * and every assertion below then fails on an empty stdout — which is a
     * diagnosis nobody would reach from "expected to contain 'İçe aktarma'".
     */
    expect(stderr).not.toContain("NO_CONFIRMATION_FOR");
    expect(stdout).toContain("İçe aktarma tamamlandı");
    expect(stdout).toContain("operatör: yetki geri alındı");

    /*
     * **Counted rather than looked at.** An assertion that "the newest operator
     * has no authorization" would pass while every earlier one kept theirs;
     * what has to be true is that the import left the standing total where it
     * found it.
     */
    expect(await importAdmins()).toBe(before);

    const [newest] = await operators();
    expect(newest?.status).toBe("SUSPENDED");
    expect(newest?.sessions).toBe(0);
  });

  it("cleans up when the import fails", async () => {
    /*
     * A category key nothing matches, so the run fails after the operator has
     * been made and authorized. This is the path the `finally` exists for.
     */
    const partner = `i100-${randomUUID().slice(0, 8)}`;
    const before = await importAdmins();

    const { stdout } = await importCatalogue(
      csv(
        "businesses",
        `slug,name,shortDescription,ownerEmail\n${partner},I100 Partner,,\n`
      ),
      csv(
        "offerings",
        `businessSlug,slug,title,summary,categoryStableKey,productKey,priceKind,amount,currency,priorAmount,deliveryCost,stockState,destinationUrl,imageUrls,attributes\n` +
          `${partner},${partner}-listing,I100 İlan,,NO__SUCH__CATEGORY,I100-${partner},FIXED,100.00,TRY,,,IN_STOCK,,,\n`
      )
    );

    expect(stdout).toContain("operatör: yetki geri alındı");
    expect(await importAdmins()).toBe(before);
  });

  it("accumulates no orphan Admins across runs", async () => {
    /*
     * The failure B1 describes is cumulative: one standing Super Admin is a
     * mistake, and one per run is the thing that makes it a policy. Two runs,
     * and the count has to be where it started.
     */
    const category = await leafCategory();
    const before = await importAdmins();

    for (const _ of [1, 2]) {
      void _;
      const partner = `i100-${randomUUID().slice(0, 8)}`;
      await importCatalogue(
        csv(
          "businesses",
          `slug,name,shortDescription,ownerEmail\n${partner},I100 Partner,,\n`
        ),
        csv(
          "offerings",
          `businessSlug,slug,title,summary,categoryStableKey,productKey,priceKind,amount,currency,priorAmount,deliveryCost,stockState,destinationUrl,imageUrls,attributes\n` +
            `${partner},${partner}-listing,I100 İlan,,${category},I100-${partner},FIXED,100.00,TRY,,,IN_STOCK,,,\n`
        )
      );
    }

    expect(await importAdmins()).toBe(before);
    for (const operator of (await operators()).slice(0, 2))
      expect(operator.status).toBe("SUSPENDED");
  });

  it("adds listings to a partner that is not in this run's businesses.csv", async () => {
    /*
     * **B2, and it is the second-batch case rather than a hypothetical.** Run
     * one creates the partner; run two names it only in `offerings.csv`, which
     * is what `V1_LAUNCH_RUNBOOK` §2.2 has always said is allowed and what the
     * importer used to refuse.
     */
    const category = await leafCategory();
    const partner = `i100-${randomUUID().slice(0, 8)}`;

    await importCatalogue(
      csv(
        "businesses",
        `slug,name,shortDescription,ownerEmail\n${partner},I100 Partner,,\n`
      ),
      csv(
        "offerings",
        `businessSlug,slug,title,summary,categoryStableKey,productKey,priceKind,amount,currency,priorAmount,deliveryCost,stockState,destinationUrl,imageUrls,attributes\n` +
          `${partner},${partner}-first,I100 İlk,,${category},I100-${partner}-1,FIXED,100.00,TRY,,,IN_STOCK,,,\n`
      )
    );

    /* The second batch: an empty partner file, and a listing for the partner
       that already exists. */
    const { stdout } = await importCatalogue(
      csv("businesses", `slug,name,shortDescription,ownerEmail\n`),
      csv(
        "offerings",
        `businessSlug,slug,title,summary,categoryStableKey,productKey,priceKind,amount,currency,priorAmount,deliveryCost,stockState,destinationUrl,imageUrls,attributes\n` +
          `${partner},${partner}-second,I100 İkinci,,${category},I100-${partner}-2,FIXED,120.00,TRY,,,IN_STOCK,,,\n`
      )
    );

    expect(stdout).not.toContain("bulunabildi");
    expect(stdout).toContain(`ilan: ${partner}-second`);

    const listings = await pool.query<{ total: number }>(
      `select count(*)::int as total
         from offering o join business b on b.id = o.business_id
        where b.slug = $1`,
      [partner]
    );
    /* Two listings on one Business — not a second Business for the same slug. */
    expect(listings.rows[0]?.total).toBe(2);
    const businesses = await pool.query<{ total: number }>(
      `select count(*)::int as total from business where slug = $1`,
      [partner]
    );
    expect(businesses.rows[0]?.total).toBe(1);
  });
});
