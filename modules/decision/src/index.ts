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

/**
 * Raised when a selection names something the Decision Context does not
 * contain (`US-DEC-F04-001` AC-3).
 *
 * Translated from the trigger, so the interface layer never reads PostgreSQL
 * error text — and so that the refusal keeps its meaning: the person asked to
 * act on something that is not in front of them.
 */
export class SelectionNotInContextError extends Error {
  constructor() {
    super("SELECTION_NOT_IN_CONTEXT");
    this.name = "SelectionNotInContextError";
  }
}

/// Raised when the flow a request names has expired or never existed.
export class DecisionFlowNotFoundError extends Error {
  constructor() {
    super("DECISION_FLOW_NOT_FOUND");
    this.name = "DecisionFlowNotFoundError";
  }
}

/**
 * Everything Decision Chat is allowed to know (`US-DEC-F03-001` AC-4).
 *
 * The brief is built from the current Decision Context and nothing else. It
 * has no telephone number, no email address, no contact URL and no Affiliate
 * Destination — not because the assistant is asked not to mention them, but
 * because it is never told them. AC-8 is a property of this shape.
 *
 * Neither is there a place for a previous conversation, another Offering, or
 * anything the person did before. AC-9 forbids that memory and the brief
 * cannot carry it.
 */
export interface BriefedAttribute {
  readonly name: string;
  readonly unit: string | null;
  /// `null` where the Offering supplied no value. The assistant is told the
  /// absence rather than left to infer one.
  readonly value: string | null;
}

export interface BriefedOffering {
  readonly attributes: readonly BriefedAttribute[];
  readonly businessName: string;
  readonly categoryName: string;
  readonly offeringId: string;
  readonly title: string;
}

export interface DecisionBrief {
  readonly offerings: readonly BriefedOffering[];
  /// What the person said matters to them, in their words (AC-5). Carried, not
  /// interpreted into a ranking.
  readonly priorities: readonly string[];
}

/**
 * The assistant, as a port.
 *
 * It receives a brief and the conversation so far, and returns words. It has
 * no database, no network of its own and no way to reach the projection — the
 * only facts available to it are the ones handed in, which is what makes AC-4
 * enforceable rather than aspirational.
 */
export interface DecisionAssistant {
  respond(input: {
    brief: DecisionBrief;
    question: string;
    turns: readonly { question: string; reply: string }[];
  }): Promise<string>;
}

/**
 * Every value the brief actually contains, as text.
 *
 * Used to check a reply before it reaches a person. It is a whitelist of what
 * may be said, assembled from what was supplied.
 */
function briefedValues(brief: DecisionBrief): Set<string> {
  const values = new Set<string>();
  for (const offering of brief.offerings)
    for (const attribute of offering.attributes)
      if (attribute.value !== null)
        for (const token of attribute.value.matchAll(/\d[\d.,]*/gu))
          values.add(token[0].replace(/[.,]$/u, ""));
  return values;
}

/**
 * Whether a reply states a figure the brief never contained (AC-6).
 *
 * This is a narrow guarantee and worth being honest about: it catches invented
 * *numbers*, which is the dangerous case — a mileage, a capacity, a year that
 * no Offering ever claimed. It cannot catch an invented sentence. A vendor
 * adapter is still bound by the brief; this is the check that does not depend
 * on the vendor honouring it.
 */
export function inventsValue(reply: string, brief: DecisionBrief): boolean {
  const permitted = briefedValues(brief);
  for (const token of reply.matchAll(/\d[\d.,]*/gu)) {
    const figure = token[0].replace(/[.,]$/u, "");
    if (!permitted.has(figure)) return true;
  }
  return false;
}

/// Raised when a reply would have stated something the brief did not contain.
/// The person is told the assistant could not answer, rather than told a
/// number nobody published.
export class AssistantInventedValueError extends Error {
  constructor() {
    super("ASSISTANT_INVENTED_VALUE");
    this.name = "AssistantInventedValueError";
  }
}

/// Raised when Chat is asked for on a context that is not currently valid.
/// AC-3 makes a valid context the condition of Chat beginning at all.
export class DecisionContextInvalidError extends Error {
  constructor() {
    super("DECISION_CONTEXT_INVALID");
    this.name = "DecisionContextInvalidError";
  }
}

export const decisionModule = { name: "decision" } as const;
