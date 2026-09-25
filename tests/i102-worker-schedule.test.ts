import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * The worker's cadence from outside Vercel (I102).
 *
 * **The Owner chose Vercel Hobby on 2026-09-25**, and Hobby refuses any cron
 * that runs more than once a day. `apps/worker/vercel.json` therefore asks for
 * each job once a day, and that is a floor rather than the platform's cadence:
 * drained daily, the outbox makes a new account wait up to about twenty-five
 * hours for its confirmation link. The Owner chose Supabase Cron to supply the
 * real cadence, calling the same three endpoints with the same secret.
 *
 * These cases read `scripts/supabase-worker-schedule.sql` as text. **The CI
 * database has neither `pg_cron` nor `pg_net`**, so nothing here executes it.
 * It was executed once, on 2026-09-25, against a throwaway PostgreSQL 16
 * cluster with the real `pg_cron` 1.6 and a local stand-in for `pg_net`'s
 * `http_get` that recorded instead of sending: it refused to run without the
 * Vault secret, left three jobs after two runs, stored neither value in
 * `cron.job`, and pg_cron's own scheduler fired the outbox job on the minute
 * with the URL, header and timeout these cases assert. That is evidence the SQL
 * is right; it is not evidence that Supabase runs it, which only the first
 * production run can be.
 */
describe("Increment I102 the worker's schedule outside Vercel", () => {
  const path = "scripts/supabase-worker-schedule.sql";

  /** `--` comments stripped: what the database executes, not what it says. */
  const code = (): string =>
    readFileSync(path, "utf8").replaceAll(/--.*$/gmu, "");

  /** Each `cron.schedule('name', 'expression', $job$ … $job$)` in the file. */
  const jobs = (): { command: string; name: string; schedule: string }[] =>
    [
      ...code().matchAll(
        /cron\.schedule\(\s*'([^']+)',\s*'([^']+)',\s*\$job\$([\s\S]*?)\$job\$\s*\)/gu
      )
    ].map(([, name = "", schedule = "", command = ""]) => ({
      command,
      name,
      schedule
    }));

  it("asks for the cadence the platform needs, one job per endpoint", () => {
    /*
     * These are the cadences `apps/worker/vercel.json` carried until the Hobby
     * decision, and the loop in `main.ts` has always had: delivery every
     * minute because a person is waiting on it, the sweep every five because
     * nothing is, the feeds hourly because that is how often a partner's own
     * document changes.
     */
    expect(
      jobs()
        .map(({ name, schedule }) => [name, schedule])
        .sort()
    ).toEqual([
      ["worker-feeds", "0 * * * *"],
      ["worker-outbox", "* * * * *"],
      ["worker-sweep", "*/5 * * * *"]
    ]);
  });

  it("calls exactly the endpoints Vercel's own crons call", () => {
    /*
     * Two schedulers for one worker. If they named different paths, one of
     * them would be calling something that does not exist — and the worker
     * answers 404 to anything it does not recognise, which in a scheduler's
     * log looks the same as a wrong secret.
     */
    const vercel = (
      JSON.parse(readFileSync("apps/worker/vercel.json", "utf8")) as {
        crons: { path: string }[];
      }
    ).crons
      .map((entry) => entry.path)
      .sort();

    const called = jobs()
      .map(({ command }) => /\|\|\s*'(\/api\/[a-z]+)'/u.exec(command)?.[1])
      .sort();

    expect(called).toEqual(vercel);
  });

  it("reads the secret and the address from Vault, never from the file", () => {
    /*
     * **`cron.job` stores each command as written**, and anyone who can list
     * the scheduled jobs can read it. A literal secret here would be one
     * published to every reader of that table and to every reader of this
     * repository.
     */
    for (const { command } of jobs()) {
      expect(command).toMatch(
        /'Bearer ' \|\| \(select decrypted_secret from vault\.decrypted_secrets where name = 'worker_cron_secret'\)/u
      );
      expect(command).toMatch(
        /url := \(select decrypted_secret from vault\.decrypted_secrets where name = 'worker_base_url'\)/u
      );
    }
    // Nothing that looks like a token or an address anywhere in what runs.
    expect(code()).not.toMatch(/Bearer [A-Za-z0-9]/u);
    expect(code()).not.toMatch(/https?:\/\//u);
  });

  it("waits longer than the worker may take to answer", () => {
    /*
     * **`pg_net`'s default timeout is two seconds**, and the outbox drain may
     * spend `CRON_BUDGET_MS` — forty-five by default — before it replies. At
     * the default every request would be abandoned long before its answer,
     * and the only trace of it would be a response table full of timeouts.
     */
    const budget = Number(
      /^CRON_BUDGET_MS=(\d+)$/mu.exec(readFileSync(".env.example", "utf8"))?.[1]
    );
    expect(budget).toBeGreaterThan(0);

    for (const { command } of jobs()) {
      const timeout = Number(
        /timeout_milliseconds := (\d+)/u.exec(command)?.[1]
      );
      expect(timeout).toBeGreaterThan(budget);
    }
  });

  it("refuses to schedule anything until the extensions and secrets exist", () => {
    /*
     * A job scheduled before its secret exists runs every minute and fails
     * every minute, into a table nobody is reading yet. Refusing up front
     * turns a missing step into one error naming it.
     */
    const guard = code();
    for (const precondition of [
      "extname = 'pg_cron'",
      "extname = 'pg_net'",
      "name = 'worker_cron_secret'",
      "name = 'worker_base_url'"
    ])
      expect(guard).toContain(precondition);

    expect(guard.indexOf("raise exception")).toBeLessThan(
      guard.indexOf("cron.schedule(")
    );
  });
});
