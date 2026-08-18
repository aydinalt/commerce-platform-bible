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
 * How long one statement may run before PostgreSQL cancels it.
 *
 * The Engineering Constitution §13 requires every production component to
 * define behaviour for timeout, and the database dependency had none: a query
 * that hung held its connection until PostgreSQL or TCP gave up. I18 made that
 * worse in the act of fixing something else — with one shared pool, ten hung
 * queries are the whole process rather than one repository's corner.
 *
 * Five seconds, chosen by the Owner on 2026-08-18. No legitimate V1 query
 * should come near it: Discovery is indexed, a Comparison Set holds at most
 * five members, Analytics is bounded by period. It is long enough to mean
 * "this query has gone wrong" and short enough not to keep a person waiting on
 * one that has.
 *
 * Set on the connection rather than per query, so a statement cannot escape it
 * by being written somewhere nobody thought to look.
 */
export const DEFAULT_STATEMENT_TIMEOUT_MS = 5_000;

/**
 * How long a transaction may sit idle before PostgreSQL ends its session.
 *
 * A statement timeout does not cover this: `begin` followed by nothing is not a
 * running statement, so a transaction abandoned mid-flight would hold its
 * connection *and its locks* indefinitely. Ten seconds is deliberately looser
 * than the statement budget — an idle transaction is a bug rather than a slow
 * query, and this exists to bound the damage rather than to catch it early.
 */
export const DEFAULT_IDLE_TRANSACTION_TIMEOUT_MS = 10_000;

/**
 * How long a caller waits for a free connection before being refused.
 *
 * `pg` defaults to zero, which means *wait for ever*. On a saturated pool that
 * is a request hanging silently until the client gives up — the failure mode
 * that looks like an outage and names nothing. Two seconds, chosen by the Owner
 * on 2026-08-18, turns saturation into a `503 DEPENDENCY_UNAVAILABLE` a person
 * and a log can both read.
 */
export const DEFAULT_CONNECTION_TIMEOUT_MS = 2_000;

/** Reads a positive-integer millisecond setting, or the stated default. */
function milliseconds(raw: string | undefined, fallback: number): number {
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function databaseTimeouts(env: NodeJS.ProcessEnv = process.env): {
  connectionTimeoutMillis: number;
  idleTransactionTimeoutMs: number;
  statementTimeoutMs: number;
} {
  return {
    connectionTimeoutMillis: milliseconds(
      env.DATABASE_CONNECTION_TIMEOUT_MS,
      DEFAULT_CONNECTION_TIMEOUT_MS
    ),
    idleTransactionTimeoutMs: milliseconds(
      env.DATABASE_IDLE_TRANSACTION_TIMEOUT_MS,
      DEFAULT_IDLE_TRANSACTION_TIMEOUT_MS
    ),
    statementTimeoutMs: milliseconds(
      env.DATABASE_STATEMENT_TIMEOUT_MS,
      DEFAULT_STATEMENT_TIMEOUT_MS
    )
  };
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
export function createDatabasePool(
  /**
   * Where a connection that dies underneath the pool is reported.
   *
   * **Not optional, and not defaulted.** A dead connection emits `error`, and an
   * `EventEmitter` with no `error` listener throws by Node's rule — taking the
   * process down. Adding `idle_in_transaction_session_timeout` without this
   * would have made the API crash on exactly the condition the timeout exists to
   * survive: the server ends the session and nothing is listening.
   *
   * **Two listeners, because `pg` has two cases and only one of them is the
   * pool's.** A connection sitting idle *in* the pool reports on the pool; one
   * currently checked out reports on the client, and the pool never sees it.
   * The first attempt here attached only the pool listener, and the second case
   * still brought the process down — which the idle-transaction test caught,
   * because that test holds its client while the server kills it.
   *
   * Making the caller supply the handler is deliberate. A default would be a
   * silent swallow, and a connection dying unexpectedly is precisely what an
   * operator needs to be told about.
   */
  onError: (error: Error) => void
): Pool {
  const timeouts = databaseTimeouts();
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: timeouts.connectionTimeoutMillis,
    // Both are PostgreSQL settings applied to every connection the pool opens,
    // which is why no call site has to remember them. `options` reaches the
    // server at connection time rather than as a statement somebody could skip.
    options: `-c statement_timeout=${timeouts.statementTimeoutMs} -c idle_in_transaction_session_timeout=${timeouts.idleTransactionTimeoutMs}`,
    max: poolMax()
  });
  // An idle connection's failure arrives here.
  pool.on("error", onError);
  // A checked-out one's arrives on the client, so every client gets the same
  // handler as it is created. `connect` fires once per new connection, not once
  // per checkout, so this does not accumulate listeners.
  pool.on("connect", (client) => client.on("error", onError));
  return pool;
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
