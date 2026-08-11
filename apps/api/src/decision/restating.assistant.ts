import type { DecisionAssistant, DecisionBrief } from "@commerce/decision";

/**
 * The development assistant: it restates the brief and adds nothing.
 *
 * V1 has no assistant vendor, and this is the same shape the outbound email
 * port takes — a port with an adapter that refuses to construct in production,
 * so a deployment without a real one fails loudly rather than quietly
 * answering people with a stub.
 *
 * What it does is deliberately the floor of `US-DEC-F03-001` AC-5: it explains
 * the authoritative values, says `Not provided` where an applicable comparable
 * value is missing, and repeats the priorities the person stated. It draws no
 * conclusion, because AC-6 forbids a ranking, a winner or a recommendation and
 * this adapter has no way to form one.
 *
 * A vendor adapter replacing it inherits the same contract: it is handed the
 * brief and nothing else, and its reply passes the same invention check.
 */
export class RestatingDecisionAssistant implements DecisionAssistant {
  constructor(environment: string) {
    if (environment === "production")
      throw new Error("DECISION_ASSISTANT_NOT_CONFIGURED_FOR_PRODUCTION");
  }

  respond(input: { brief: DecisionBrief; question: string }): Promise<string> {
    const lines: string[] = [];

    for (const offering of input.brief.offerings) {
      lines.push(`${offering.title} — ${offering.businessName}`);
      for (const attribute of offering.attributes) {
        const unit = attribute.unit === null ? "" : ` ${attribute.unit}`;
        // The absence is stated in the same breath as the values, because a
        // list that silently skipped it would read as though the Attribute did
        // not apply.
        lines.push(
          attribute.value === null
            ? `- ${attribute.name}: Belirtilmemiş`
            : `- ${attribute.name}: ${attribute.value}${unit}`
        );
      }
    }

    if (input.brief.priorities.length > 0)
      lines.push(
        `Önceliğiniz olarak belirttikleriniz: ${input.brief.priorities.join(", ")}.`
      );

    // No closing sentence, no suggestion, no "bu size daha uygun görünüyor".
    // The person compares; the platform reports.
    return Promise.resolve(lines.join("\n"));
  }
}
