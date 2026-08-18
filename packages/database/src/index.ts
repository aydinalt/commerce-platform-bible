import { Pool } from "pg";

export const databasePackage = {
  migrationsDirectory: "packages/database/prisma/migrations",
  schema: "packages/database/prisma/schema.prisma"
} as const;

/**
 * How many PostgreSQL connections one process may hold.
 *
 * `pg` defaults to ten per `Pool`, and every repository used to build its own —
 * **fifteen of them in the API alone, so a single instance could open a hundred
 * and fifty connections.** PostgreSQL ships with `max_connections = 100`. The
 * API could exhaust a default-configured database on its own, a second instance
 * was arithmetically impossible, and the fifteen pools could not lend each other
 * anything: fourteen sat idle while the fifteenth queued.
 *
 * Ten is the same number `pg` would have chosen, now meaning what it says.
 * `DATABASE_POOL_MAX` exists because the right number is a property of the
 * deployment — instance count times this must stay under `max_connections`, less
 * whatever the superuser reserve and the migration job need.
 */
export const DEFAULT_POOL_MAX = 10;

export function poolMax(
  raw: string | undefined = process.env.DATABASE_POOL_MAX
): number {
  const parsed = Number(raw);
  // A malformed setting takes the default rather than the process: `Number("")`
  // is 0, and a pool of zero accepts no queries at all.
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_POOL_MAX;
}

/**
 * The one pool a process gets.
 *
 * Deliberately a factory rather than a module-level singleton. A singleton
 * would be an ambient global that nothing declares and no test can substitute —
 * and `m11-health` proves readiness fails against an unreachable database by
 * handing a repository a pool it has closed, which is only possible while the
 * pool is a dependency somebody passes in.
 *
 * Each app calls this once: the API registers the result as its `Pool` provider,
 * the worker holds it in `main`.
 */
export function createDatabasePool(): Pool {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    max: poolMax()
  });
}

/**
 * Expired current-flow Decision state, expressed once.
 *
 * Both the API request path and the worker's retention sweep remove this state,
 * which is three call sites plus one — and the condition below is subtle enough
 * that four copies of it would be four chances to get it wrong. It lives here
 * because it is a statement about the schema rather than about any one caller.
 */

/**
 * Flows first, and unconditionally: a flow that has passed its own expiry is
 * over, and `US-DEC-F03-001` AC-9 takes its chat turns with it by cascade.
 */
export const EXPIRED_DECISION_FLOWS_SQL =
  "delete from decision_flow where expires_at <= now()";

/**
 * Then expired Comparison Sets, which cascade to any flow still built on one.
 *
 * That cascade is deliberate — the `decision_context` migration says a flow
 * pointing at a set that no longer exists would outlive the thing it was about
 * — and it used to end live flows early, because a flow could claim sixty
 * minutes from its own creation while the set beneath it had less than that
 * left. `PgDecisionRepository.enterWithComparisonSet` now caps the flow at its
 * set's expiry, so by the time this statement can reach a set, every flow on it
 * has already expired too. Nothing here needs a guard; the two records simply
 * cannot disagree any more.
 */
export const EXPIRED_COMPARISON_SETS_SQL =
  "delete from comparison_set where expires_at <= now()";
