import type { Logger } from "pino";

import {
  AssistantUnavailableError,
  chatPrompt,
  type ChatProvider,
  type DecisionAssistant,
  type DecisionBrief
} from "@commerce/decision";

export interface HttpDecisionAssistantOptions {
  logger: Logger;
  provider: ChatProvider;
  /** How long one question may wait before the person is told it failed. */
  timeoutMs: number;
}

/**
 * The assistant over HTTP, with no vendor in it.
 *
 * Everything here is the same whichever vendor is chosen: compose the prompt
 * from the brief, bound the wait, send what the provider described, read what
 * the provider reads. The three things that differ are behind `ChatProvider`.
 *
 * The bound matters more here than it did for email. A message the outbox is
 * delivering has nobody watching it; this call is in front of a person who
 * asked a question and is waiting, and it used to be inside a database
 * transaction as well. A vendor that accepts a connection and says nothing
 * would hold both the person and a connection for as long as it liked.
 */
export class HttpDecisionAssistant implements DecisionAssistant {
  constructor(private readonly options: HttpDecisionAssistantOptions) {}

  async respond(input: {
    brief: DecisionBrief;
    question: string;
    turns: readonly { question: string; reply: string }[];
  }): Promise<string> {
    const { logger, provider, timeoutMs } = this.options;
    const request = provider.request(chatPrompt(input));

    const abort = new AbortController();
    const expiry = setTimeout(() => abort.abort(), timeoutMs);

    let status: number;
    let body: string;
    try {
      const answered = await fetch(request.url, {
        body: request.body,
        headers: request.headers,
        method: "POST",
        signal: abort.signal
      });
      status = answered.status;
      body = await answered.text();
    } catch (error) {
      // A refused connection, a DNS failure and our own abort are one answer to
      // the person: not working right now. The original is kept as `cause`
      // because whoever reads the log needs to know which of the three it was.
      throw new AssistantUnavailableError(
        `${provider.name} did not answer (${describe(error)})`,
        { cause: error }
      );
    } finally {
      clearTimeout(expiry);
    }

    const outcome = provider.read(status, body);

    /*
     * What is logged, and what is not.
     *
     * Not the headers — they carry the credential. Not the prompt: it contains
     * the Offerings the person is deciding between and the priorities they
     * stated in their own words, which together are a fairly complete account
     * of what somebody is shopping for.
     *
     * Not the question and not the reply. Both are the person's conversation,
     * they are already held for the life of the flow and swept when it expires,
     * and a log line is exactly the durable copy that sweep is meant to prevent.
     *
     * Not the provider's response body either, for the same reason it was kept
     * out of the email log: vendors echo the request back inside error payloads,
     * so the string most likely to contain the conversation is the one
     * explaining why the conversation failed.
     */
    logger.info(
      { outcome: outcome.kind, provider: provider.name, status },
      "assistant_answer_attempted"
    );

    if (outcome.kind === "ANSWERED") return outcome.text;
    // A refusal and an outage are one sentence to the person and two lines in
    // the log. The reason is the provider's own word for it, which is why it is
    // carried rather than replaced with a generic one.
    throw new AssistantUnavailableError(`${provider.name}: ${outcome.reason}`);
  }
}

/** The error's own words, without assuming it is an `Error`. */
function describe(error: unknown): string {
  if (error instanceof Error) return error.name;
  return typeof error;
}
