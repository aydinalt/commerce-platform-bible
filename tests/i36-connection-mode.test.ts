import { readFileSync } from "node:fs";

import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  DatabaseTimeoutsUnverified,
  connectionMode,
  createDatabasePool,
  databaseTimeouts,
  verifyDatabaseTimeouts
} from "../packages/database/src/index.js";

/**
 * Reaching Supabase through its pooler (I36).
 *
 * The Owner chose **Vercel and Supabase** on 2026-08-26, with the API shipping
 * on Vercel first and moving to a process host later if the measurements demand
 * it. Supabase answers the database question and introduces one that every test
 * in this repository was blind to.
 *
 * **A transaction pooler refuses the `options` startup parameter.** Since I18,
 * `statement_timeout` and `idle_in_transaction_session_timeout` have been
 * carried on that parameter, deliberately — "set on the connection rather than
 * per query, so a statement cannot escape it by being written somewhere nobody
 * thought to look". Supavisor and PgBouncer in transaction mode reject it
 * unless their own `ignore_startup_parameters` lists it, and on a managed
 * pooler that configuration is not ours.
 *
 * So on Supabase's port 6543 the timeouts have to come from the database role,
 * and **nothing in the application could tell the difference**. Every test here
 * asserted the timeouts by reading the code that sets them. That is a test of
 * intent, and intent is exactly what a pooler in the middle discards.
 */
describe("Increment I36 connection mode", () => {
  describe("what is sent to the server", () => {
    it("carries the timeouts on a direct connection", () => {
      /*
       * Unchanged from I18 and asserted so it stays that way. Without a pooler
       * in the path `options` is the right mechanism: it reaches the server at
       * connection time, so no call site has to remember it and no statement
       * can be written that escapes it.
       */
      const pool = createDatabasePool(() => undefined);
      const { statementTimeoutMs } = databaseTimeouts();
      expect(
        (pool as unknown as { options: { options?: string } }).options.options
      ).toContain(`statement_timeout=${String(statementTimeoutMs)}`);
      void pool.end();
    });

    it("does not carry them through a transaction pooler", () => {
      /*
       * **The pooler refuses this parameter rather than ignoring it**, so
       * sending it to Supabase's port 6543 is a connection that never opens —
       * an API that will not boot rather than one running without a timeout.
       *
       * Omitting it is therefore not a compromise. It is the only way to
       * connect, and what makes it safe is that the boot check below proves the
       * timeouts arrived by the other route.
       */
      process.env["DATABASE_CONNECTION_MODE"] = "transaction";
      try {
        const pool = createDatabasePool(() => undefined);
        expect(
          (pool as unknown as { options: { options?: string } }).options.options
        ).toBeUndefined();
        void pool.end();
      } finally {
        delete process.env["DATABASE_CONNECTION_MODE"];
      }
    });

    it("treats anything it does not recognise as direct", () => {
      /*
       * **Deliberately this way round.** A typo takes the default, sends
       * `options`, and a transaction pooler refuses the connection — so the
       * mistake surfaces while somebody is deploying.
       *
       * The other default would be worse in exactly the way this increment is
       * about: an unrecognised value silently meaning "send nothing" would
       * strip the timeouts and leave the platform looking healthy.
       */
      expect(connectionMode("transactional")).toBe("direct");
      expect(connectionMode(undefined)).toBe("direct");
      expect(connectionMode("transaction")).toBe("transaction");
    });
  });

  describe("what the server is asked at boot", () => {
    let pool: Pool;

    beforeAll(() => {
      pool = createDatabasePool(() => undefined);
    });
    afterAll(async () => {
      await pool.end();
    });

    it("accepts the settings this process configured", async () => {
      // The `direct` path end to end, against a real server: `options` was sent
      // and `pg_settings` reports it back.
      await expect(verifyDatabaseTimeouts(pool)).resolves.toBeUndefined();
    });

    it("refuses when a timeout is not what was configured", async () => {
      /*
       * **This is the case the pooler creates**, reproduced without one: a
       * connection that works, answers queries, and does not have the timeout
       * the process believes it set.
       *
       * Simulated by moving the server's value rather than by faking the query,
       * because what is being tested is that the application reads the setting
       * in force rather than the setting it asked for.
       */
      const wrong = new Pool({
        connectionString: process.env["DATABASE_URL"],
        options:
          "-c statement_timeout=999 -c idle_in_transaction_session_timeout=10000"
      });
      try {
        await expect(verifyDatabaseTimeouts(wrong)).rejects.toThrow(
          DatabaseTimeoutsUnverified
        );
      } finally {
        await wrong.end();
      }
    });

    it("names the setting and both numbers", async () => {
      /*
       * An operator who reads `DATABASE_TIMEOUTS_UNVERIFIED` and nothing else
       * has to guess which of two settings, and whether the fault is the
       * `alter role` or the value in the environment. Naming both removes the
       * guess — and this failure will most often be read at deploy time by
       * somebody who did not write any of it.
       */
      const wrong = new Pool({
        connectionString: process.env["DATABASE_URL"],
        options:
          "-c statement_timeout=999 -c idle_in_transaction_session_timeout=10000"
      });
      try {
        await expect(verifyDatabaseTimeouts(wrong)).rejects.toThrow(
          /statement_timeout is 999ms on the server, not 5000ms/u
        );
      } finally {
        await wrong.end();
      }
    });

    it("refuses an idle-transaction timeout that drifted too", async () => {
      // Both settings, not just the famous one. An abandoned transaction holds
      // its locks, which is the failure the second timeout exists for.
      const wrong = new Pool({
        connectionString: process.env["DATABASE_URL"],
        options:
          "-c statement_timeout=5000 -c idle_in_transaction_session_timeout=1"
      });
      try {
        await expect(verifyDatabaseTimeouts(wrong)).rejects.toThrow(
          /idle_in_transaction_session_timeout/u
        );
      } finally {
        await wrong.end();
      }
    });
  });

  describe("where the check is wired", () => {
    /**
     * Comments **and import statements** stripped before anything is searched.
     *
     * Comments, because this repository comments heavily and on purpose and
     * four checks have now matched their own explanatory prose. Imports,
     * because of the mutation below.
     */
    const source = (path: string): string =>
      readFileSync(path, "utf8")
        .replaceAll(/\/\*[\s\S]*?\*\//gu, "")
        .replaceAll(/^\s*\/\/.*$/gmu, "")
        .replaceAll(/^import[\s\S]*?;$/gmu, "");

    it("runs in both entrypoints, before either serves anything", () => {
      /*
       * Wired at the entrypoints rather than inside `createDatabasePool` so
       * that building a pool stays synchronous — `m11-health` proves readiness
       * fails by handing a repository a pool it has closed, which is only
       * possible while the pool is a plain value a test can substitute.
       *
       * The cost of that choice is that a third entrypoint could forget, and
       * this is the case that notices.
       *
       * **The first version of this case did not notice.** Deleting the call
       * from the worker left it passing, because the name was still on the
       * import line — a check on `"verifyDatabaseTimeouts"` is satisfied by
       * importing it and never calling it. It now matches the call, and the
       * imports are removed before the search so that stays true.
       */
      for (const path of ["apps/api/src/main.ts", "apps/worker/src/main.ts"])
        expect(source(path)).toMatch(/verifyDatabaseTimeouts\(\w/u);
    });

    it("checks before the API listens", () => {
      // After `listen` would mean the first requests are served by a process
      // that has not established it has a statement timeout.
      const main = source("apps/api/src/main.ts");
      expect(main.indexOf("verifyDatabaseTimeouts(")).toBeLessThan(
        main.indexOf("app.listen(")
      );
    });
  });

  describe("what a Supabase deployment is told", () => {
    const env = (): string => readFileSync(".env.example", "utf8");

    it("names the alternative route the timeouts must take", () => {
      /*
       * `.env.example` is the only instruction sheet a deployment has — I34's
       * finding, and this increment adds the step most likely to be skipped.
       * Setting `transaction` without the `alter role` is a deployment that
       * refuses to boot; not knowing about the `alter role` is a deployment
       * that cannot be fixed without reading the source.
       */
      expect(env()).toMatch(/alter role[\s\S]*?statement_timeout/iu);
      expect(env()).toMatch(
        /alter role[\s\S]*?idle_in_transaction_session_timeout/iu
      );
    });

    it("says which port means which mode", () => {
      // The two ports are the whole decision and neither is guessable from the
      // connection string.
      expect(env()).toContain("6543");
      expect(env()).toContain("5432");
    });
  });
});
