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

/**
 * Why an Affiliate Handoff is not available (`US-DEC-F05-001` AC-4).
 *
 * Two eligibility results and one selection, each with its own answer. PRD-0001
 * owns both eligibility results and AC-3 forbids recalculating either, so these
 * name what was *read* rather than what was worked out.
 */
export type HandoffUnavailability =
  /// No current eligible Selected Offering (`US-DEC-F04-001` AC-7).
  | "NOTHING_SELECTED"
  /// The Offering is no longer publicly eligible.
  | "OFFERING_INELIGIBLE"
  /// No Affiliate Destination, or its Handoff Eligibility is Ineligible.
  | "DESTINATION_INELIGIBLE";

/**
 * Raised when a handoff is asked for and cannot be given.
 *
 * AC-9 makes this the point at which nothing is recorded: an unavailable
 * handoff produces no initiation result, so `US-DEC-F07-001` sees no
 * Completion for it.
 */
export class HandoffUnavailableError extends Error {
  constructor(readonly reason: HandoffUnavailability) {
    super(reason);
    this.name = "HandoffUnavailableError";
  }
}

/// The complete V1 Direct Contact channel set (`US-DEC-F06-001` AC-4).
export const DIRECT_CONTACT_CHANNELS = ["TELEPHONE", "EMAIL", "URL"] as const;

export type DirectContactChannel = (typeof DIRECT_CONTACT_CHANNELS)[number];

/**
 * Why Direct Contact is not available (`US-DEC-F06-001` AC-11).
 *
 * Each gate answers for itself, because the remedies differ: a Guest signs in,
 * a person whose Offering was retired chooses another, and a Business with no
 * supplied channel cannot be contacted by anyone.
 */
export type ContactUnavailability =
  /// No current eligible Selected Offering.
  | "NOTHING_SELECTED"
  /// The Selected Offering is no longer publicly eligible (AC-2).
  | "OFFERING_INELIGIBLE"
  /// The owning Business supplied no approved channel (AC-3).
  | "NO_CHANNEL"
  /// The channel asked for is not one this Business supplied (AC-5).
  | "CHANNEL_NOT_AVAILABLE";

/**
 * Raised when Direct Contact cannot proceed.
 *
 * AC-11 makes this the point at which nothing is revealed and nothing is
 * recorded — so a refusal leaves no Completion for `US-DEC-F07-001` to find,
 * and no protected information anywhere near the response.
 */
export class DirectContactUnavailableError extends Error {
  constructor(readonly reason: ContactUnavailability) {
    super(reason);
    this.name = "DirectContactUnavailableError";
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
 * What an assistant answered, in the three shapes that matter here.
 *
 * `REFUSED` is the vendor declining — a safety filter, a rejected credential, a
 * question it will not take. `UNAVAILABLE` is the vendor not answering. The
 * distinction is not about retrying, as it is for email: nothing retries a
 * person's question. It is about what the person is told, because "I cannot
 * answer that" and "this is not working right now" are different sentences and
 * only one of them invites trying again.
 */
export type ChatOutcome =
  | { kind: "ANSWERED"; text: string }
  | { kind: "REFUSED"; reason: string }
  | { kind: "UNAVAILABLE"; reason: string };

/**
 * Everything an assistant vendor does differently, and nothing else.
 *
 * Three things, the same shape the email port took: what it is called, what
 * request carries a prompt to it, and how its answer is read. The timeout, the
 * credential handling, the prompt composition and the invention check are on
 * this side of the line — which is where the mistakes that matter live.
 */
export interface ChatProvider {
  readonly name: string;
  read(status: number, body: string): ChatOutcome;
  request(prompt: string): {
    body: string;
    headers: Record<string, string>;
    url: string;
  };
}

/**
 * Raised when the assistant could not be reached or would not answer.
 *
 * Separate from `AssistantInventedValueError`, which is the platform refusing
 * a reply it did receive. Both end with the person told that the question was
 * not answered, and neither records a turn — but only one of them is about the
 * platform's own judgement, and a log that confused the two would hide a vendor
 * outage behind a safety refusal.
 */
export class AssistantUnavailableError extends Error {
  constructor(reason: string, options?: ErrorOptions) {
    super(`ASSISTANT_UNAVAILABLE: ${reason}`, options);
    this.name = "AssistantUnavailableError";
  }
}

/**
 * The prompt, composed from the brief and nothing else.
 *
 * It lives here rather than in a vendor adapter deliberately. AC-4 says the
 * assistant works from the Decision Context alone, and that is only enforceable
 * if the text it receives is assembled in one place that has no database, no
 * projection and no other reachable fact — this function is handed a brief and
 * can produce nothing that was not in it.
 *
 * The instruction is part of the prompt rather than part of a vendor's
 * configuration for the same reason: AC-6 forbids a ranking, a winner and a
 * recommendation, and a rule kept in a vendor console is a rule nobody reviews.
 */
export function chatPrompt(input: {
  brief: DecisionBrief;
  question: string;
  turns: readonly { question: string; reply: string }[];
}): string {
  const lines = [
    "Aşağıdaki bilgilerle sınırlı kalarak yanıt ver.",
    "Burada olmayan hiçbir değeri, sayıyı veya özelliği kullanma.",
    "Sıralama yapma, kazanan seçme, öneride bulunma.",
    ""
  ];

  for (const offering of input.brief.offerings) {
    lines.push(
      `${offering.title} — ${offering.businessName} (${offering.categoryName})`
    );
    for (const attribute of offering.attributes) {
      const unit = attribute.unit === null ? "" : ` ${attribute.unit}`;
      lines.push(
        attribute.value === null
          ? `- ${attribute.name}: Belirtilmemiş`
          : `- ${attribute.name}: ${attribute.value}${unit}`
      );
    }
    lines.push("");
  }

  if (input.brief.priorities.length > 0)
    lines.push(
      `Kişinin belirttiği öncelikler: ${input.brief.priorities.join(", ")}.`,
      ""
    );

  for (const turn of input.turns)
    lines.push(`Soru: ${turn.question}`, `Yanıt: ${turn.reply}`, "");

  lines.push(`Soru: ${input.question}`);
  return lines.join("\n");
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

/**
 * Decision Completion (`US-DEC-F07-001`).
 *
 * Two results, and keeping them two is the whole of AC-4. There is no combined
 * verdict here and no function that returns one: a person who was handed off
 * to an affiliate and a person who was shown a telephone number reached
 * different ends, and PRD-0006 counts them separately.
 *
 * Completion is derived rather than declared. AC-3 forbids asking for another
 * confirmation, so nothing here is written when a person says they are
 * finished — the evidence F05 and F06 already recorded *is* the Completion,
 * read back.
 *
 * AC-5 fixes its meaning: the platform's V1 Decision-support responsibility
 * ended. AC-6 lists what it is not, and this shape says none of them — there
 * is no field for a purchase, a reply, a response or an external result.
 */
export const COMPLETION_KINDS = [
  "AFFILIATE_HANDOFF",
  "DIRECT_CONTACT"
] as const;

export type CompletionKind = (typeof COMPLETION_KINDS)[number];

export const decisionModule = { name: "decision" } as const;
