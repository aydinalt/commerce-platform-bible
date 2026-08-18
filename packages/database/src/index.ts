export const databasePackage = {
  migrationsDirectory: "packages/database/prisma/migrations",
  schema: "packages/database/prisma/schema.prisma"
} as const;

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
