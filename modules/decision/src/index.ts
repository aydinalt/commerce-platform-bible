/**
 * Decision — the rules that decide what a Comparison Set may be.
 *
 * PRD-0003 makes Compare optional and bounded: two to five publicly eligible
 * Offerings sharing one active leaf Category. The datamodel enforces the parts
 * a row can be judged against; what lives here is the vocabulary for the
 * refusals and the one rule a single row cannot see — that a set of one is
 * being formed rather than broken.
 */

/// PRD-0003 Compare. Not configurable: the numbers are product rules, not
/// tuning, and `US-DEC-F01-001` AC-2 states them.
export const COMPARISON_SET_MINIMUM = 2;
export const COMPARISON_SET_MAXIMUM = 5;

/**
 * How long a Comparison Set survives without being touched.
 *
 * Long enough to read two Presentations and come back, short enough that it is
 * plainly current-flow state. PRD-0003 gives V1 no saved Compare history, so
 * the set has to stop existing on its own rather than waiting to be cleaned up
 * by someone who remembers.
 */
export const COMPARISON_SET_TTL_MINUTES = 60;

export type ComparisonRefusal =
  /// The Offering is not publicly eligible — or no longer is (AC-4).
  | "MEMBER_INELIGIBLE"
  /// The Offering belongs to another active leaf Category (AC-3, AC-4).
  | "MEMBER_OTHER_CATEGORY"
  /// Five members already, and no explicit replacement was named (AC-6).
  | "SET_FULL";

/**
 * Raised when a member cannot join, carrying which rule refused it.
 *
 * The refusal is named rather than described so the interface layer can answer
 * without inspecting PostgreSQL error text, and — more importantly — so AC-4's
 * promise is checkable: the current valid set is unchanged, and this says why
 * without having touched it.
 */
export class ComparisonMemberRefusedError extends Error {
  constructor(readonly refusal: ComparisonRefusal) {
    super(refusal);
    this.name = "ComparisonMemberRefusedError";
  }
}

/// Raised when the set a request names has expired or never existed. Current-
/// flow state is allowed to disappear; that is what makes it current-flow.
export class ComparisonSetNotFoundError extends Error {
  constructor() {
    super("COMPARISON_SET_NOT_FOUND");
    this.name = "ComparisonSetNotFoundError";
  }
}

/**
 * Whether a set may be opened in Compare (AC-2).
 *
 * The floor is checked here rather than in the datamodel because a set passes
 * through one member on its way to two. Storing a single member is a set being
 * formed; opening Compare on it would be a comparison of one.
 */
export function openableInCompare(memberCount: number): boolean {
  return (
    memberCount >= COMPARISON_SET_MINIMUM &&
    memberCount <= COMPARISON_SET_MAXIMUM
  );
}

/**
 * How long a Decision flow survives.
 *
 * The same order as a Comparison Set, because they belong to the same act:
 * the flow that outlived its set would be a context about nothing.
 */
export const DECISION_FLOW_TTL_MINUTES = 60;

/**
 * Why a Decision Context is not currently usable (`US-DEC-F02-001` AC-7,
 * AC-8).
 *
 * A context can be well-formed and still be invalid: the Offering it names may
 * have been retired since, or the Comparison Set may have fallen below two
 * members while the person was reading. Both are ordinary and both must be
 * said, because Chat and the handoff actions are unavailable until the person
 * repairs it.
 */
export type ContextInvalidity =
  /// The single Offering is no longer publicly eligible.
  | "OFFERING_INELIGIBLE"
  /// The Comparison Set no longer holds two to five eligible members.
  | "SET_NOT_VALID";

/**
 * What a person may do about an invalid context (AC-9).
 *
 * A closed list, for the same reason Zero Results recovery is one: it makes
 * "offer nothing else" checkable. Repairing the set is offered only where
 * there is a set to repair — a single-Offering context has no Compare surface
 * to return to.
 */
export const CONTEXT_REPAIRS = [
  "REPAIR_COMPARISON_SET",
  "CHOOSE_ANOTHER_OFFERING",
  "LEAVE_DECISION"
] as const;

export type ContextRepair = (typeof CONTEXT_REPAIRS)[number];

export function contextRepairs(input: {
  hasComparisonSet: boolean;
}): ContextRepair[] {
  return CONTEXT_REPAIRS.filter(
    (repair) => repair !== "REPAIR_COMPARISON_SET" || input.hasComparisonSet
  );
}

/// Raised when the flow a request names has expired or never existed.
export class DecisionFlowNotFoundError extends Error {
  constructor() {
    super("DECISION_FLOW_NOT_FOUND");
    this.name = "DecisionFlowNotFoundError";
  }
}

export const decisionModule = { name: "decision" } as const;
