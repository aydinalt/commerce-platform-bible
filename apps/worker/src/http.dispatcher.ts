import type { Logger } from "pino";

import {
  EmailRefusedError,
  type EmailDispatcher,
  type EmailMessage,
  type EmailProvider
} from "@commerce/notification";

export interface HttpEmailDispatcherOptions {
  logger: Logger;
  provider: EmailProvider;
  /** How long one attempt may take before it is abandoned as unavailable. */
  timeoutMs: number;
}

/**
 * Delivery over HTTP, with no provider in it.
 *
 * Everything here is the same whichever provider is chosen: bound the attempt,
 * send the request the provider described, read the answer the provider reads,
 * and turn it into the one distinction the outbox needs. The four things that
 * do differ are behind `EmailProvider`, so fitting a vendor is writing those
 * four and nothing else — and the parts most likely to be got wrong are
 * already written and already tested.
 */
export class HttpEmailDispatcher implements EmailDispatcher {
  constructor(private readonly options: HttpEmailDispatcherOptions) {}

  async deliver(message: EmailMessage): Promise<void> {
    const { logger, provider, timeoutMs } = this.options;
    const request = provider.request(message);

    /*
     * A timeout, because the worker's loop awaits this call.
     *
     * Without one, a provider that accepts a connection and then says nothing
     * stops the queue for every message behind it — not by failing, which the
     * outbox handles, but by never answering, which it cannot. The visibility
     * timeout on the claim would eventually let another worker take the event,
     * so the failure mode is a silently stalled process and a growing backlog.
     */
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
      // A refused connection, a DNS failure and our own abort all arrive here,
      // and all three are the same answer: not now, ask again. The original is
      // kept as `cause` — the outbox only needs the distinction, but whoever
      // reads the log needs to know which of the three it was.
      throw new Error(
        `EMAIL_UNAVAILABLE: ${provider.name} did not answer (${describe(error)})`,
        { cause: error }
      );
    } finally {
      clearTimeout(expiry);
    }

    const outcome = provider.read(status, body);

    /*
     * What is logged, and what is not.
     *
     * Not the request headers: they carry the credential. Not the request body
     * or the message: it carries a single-use registration or recovery token,
     * and a log is exactly the durable place that token is minted to avoid.
     * Not the recipient: it is somebody's address, and knowing which provider
     * answered how does not require knowing whose message it was.
     *
     * The provider's own response body is not logged either. It is the most
     * tempting field on this page and the least safe: providers echo the
     * request back in error payloads, so the one string most likely to contain
     * the token is the one describing why the token was not delivered.
     */
    logger.info(
      { outcome: outcome.kind, provider: provider.name, status },
      "email_delivery_attempted"
    );

    if (outcome.kind === "ACCEPTED") return;
    if (outcome.kind === "REFUSED") throw new EmailRefusedError(outcome.reason);
    throw new Error(`EMAIL_UNAVAILABLE: ${outcome.reason}`);
  }
}

/** The error's own words, without assuming it is an `Error`. */
function describe(error: unknown): string {
  if (error instanceof Error) return error.name;
  return typeof error;
}
