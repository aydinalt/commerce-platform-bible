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

export const decisionModule = { name: "decision" } as const;
