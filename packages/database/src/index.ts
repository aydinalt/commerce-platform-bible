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
   * **Two listeners, because `pg` emits on two objects and neither covers both
   * cases.** Measured rather than assumed:
   *
   * | When the connection dies | `pool` emits | `client` emits |
   * |---|---|---|
   * | checked out by a caller | no | yes |
   * | idle inside the pool | yes | yes |
   *
   * So the client listener is what saves the first case and the pool listener is
   * what saves the second — the pool emits independently there, and an emission
   * with no listener is what throws. The first attempt here attached only the
   * pool listener and the checked-out case still brought the process down, which
   * the idle-transaction test caught because it holds its client while the
   * server kills the session.
   *
   * The consequence is that an idle death is reported **twice**, once from each
   * object. That is `pg`'s shape rather than a choice made here, and it is
   * better than the alternative of dropping a listener that is load-bearing for
   * one of the two cases.
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
  // An idle connection's failure arrives here, and only an idle one's.
  pool.on("error", onError);
  // A checked-out connection's arrives on the client and nowhere else, so every
  // client gets the same handler as it is created. `connect` fires once per new
  // connection rather than once per checkout, so listeners do not accumulate.
  pool.on("connect", (client) => client.on("error", onError));
  return pool;
}

/**
 * Why the database did not serve a request, when the request was not at fault.
 *
 * `null` means it *was* at fault, or that the failure has nothing to do with the
 * database — those are defects and must keep answering `500`. Widening this
 * union to swallow constraint violations or syntax errors would turn every
 * application bug into a soothing "try again later".
 */
export type DatabaseFailure = "acquisition" | "statement" | "unavailable";

/** `query_canceled` — what `statement_timeout` raises. */
const STATEMENT_TIMEOUT_CODE = "57014";

/**
 * SQLSTATE classes that mean the server could not serve us.
 *
 * - `08` connection exception — the connection broke or was never made.
 * - `53` insufficient resources — out of connections, memory or disk. Not the
 *   caller's fault and not this application's defect; the caller's correct
 *   action is to come back later, which is what `503` says.
 * - `57` operator intervention — admin shutdown (`57P01`), crash shutdown
 *   (`57P02`), still starting up (`57P03`). **Except `57014`**, which is also
 *   class 57 and is a cancelled statement rather than an absent server; I19
 *   made that its own kind and it stays its own kind, because "your query was
 *   too slow" and "the database is gone" call for different responses.
 */
const UNAVAILABLE_CLASSES = new Set(["08", "53", "57"]);

/**
 * Socket-level failures, which never reach PostgreSQL and so carry no SQLSTATE.
 *
 * `ENOENT` is here because this repository connects over a Unix socket in test:
 * a stopped server leaves no socket file, and the resulting error is a missing
 * path rather than a refused connection.
 */
const UNAVAILABLE_SYSCALLS = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ENOENT",
  "ENOTFOUND",
  "EPIPE",
  "ETIMEDOUT"
]);

/**
 * `pg`'s own messages for a connection that went away, which arrive as plain
 * `Error`s with nothing structured to match on.
 *
 * Matching message text is unpleasant and is the reason this lives in one named
 * function rather than inline at a call site: when `pg` rewords something,
 * exactly one place is wrong and one test fails.
 */
const UNAVAILABLE_MESSAGES = [
  "Connection terminated",
  "Client has encountered a connection error",
  "Cannot use a pool after calling end"
];

/** The pool's own acquisition timeout, which never reaches the server either. */
const ACQUISITION_MESSAGE = "timeout exceeded when trying to connect";

/**
 * Classifies a failure raised while talking to PostgreSQL.
 *
 * **One function for all three kinds, deliberately.** An earlier version of this
 * logic lived in `ErrorEnvelopeFilter` and knew only about the two timeouts, so
 * a database that was *absent* rather than *slow* fell through to
 * `INTERNAL_ERROR` — the platform blaming itself for its dependency being down,
 * on every request, for the whole outage. Splitting the knowledge across two
 * homes is how that happened; keeping the three kinds in one place is how it
 * stops being possible to add a fourth and forget one caller.
 *
 * It lives in this package because this package already owns the pool, the
 * timeouts the two timeout kinds are measured against, and the connection
 * options that set them on the server.
 */
export function classifyDatabaseFailure(
  error: unknown
): DatabaseFailure | null {
  if (typeof error !== "object" || error === null) return null;
  const candidate = error as {
    code?: unknown;
    message?: unknown;
    syscall?: unknown;
  };

  if (typeof candidate.code === "string") {
    if (candidate.code === STATEMENT_TIMEOUT_CODE) return "statement";
    if (UNAVAILABLE_SYSCALLS.has(candidate.code)) return "unavailable";
    // A SQLSTATE is five characters and its first two are the class.
    if (
      candidate.code.length === 5 &&
      UNAVAILABLE_CLASSES.has(candidate.code.slice(0, 2))
    )
      return "unavailable";
  }

  if (typeof candidate.message !== "string") return null;
  const message = candidate.message;
  if (message.includes(ACQUISITION_MESSAGE)) return "acquisition";
  return UNAVAILABLE_MESSAGES.some((text) => message.includes(text))
    ? "unavailable"
    : null;
}

/**
 * A row that can no longer authenticate anything is deleted at once.
 *
 * The Owner's reading, and the right one: these rows carry an email address and
 * a password hash for a person who is not a User, and the reason to delete them
 * is precisely that they should not linger. `audit_record` is this repository's
 * forensic store and already carries what happened; a dead token digest adds
 * nothing to it.
 */
export const IDENTITY_GRACE_MS = 0;

/**
 * Delivered mail is evidence for a month, then it is noise.
 *
 * A processed outbox event answers "did we send it, and when" — a question with
 * a short useful life, asked while somebody is still wondering why they did not
 * get an email. One row accrues per registration and per password reset, so
 * keeping them all is a table that only ever grows.
 */
export const OUTBOX_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Long enough past the fifteen-minute attempt window that deleting a throttle
 * row forgives nobody.
 *
 * `registerAttempt` already resets `attempts` to 1 when `first_seen_at` has
 * fallen outside the window, so removing such a row is exactly what the next
 * attempt would do to it. A subject who is still being counted is inside the
 * window and is never touched here.
 */
export const THROTTLE_RETENTION_MS = 24 * 60 * 60 * 1000;

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
