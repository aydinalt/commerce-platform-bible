import type { Logger } from "pino";

import type { EmailDispatcher, EmailMessage } from "@commerce/notification";

/**
 * The development adapter. It records that a message was produced without
 * sending it anywhere, so the whole flow is exercisable before a provider is
 * chosen.
 *
 * The vendor adapter is the single remaining deployment decision; see
 * `docs/implementation/IDENTITY_IMPLEMENTATION_DECISION.md`. This one must never
 * be the configured dispatcher in production, so it says so loudly.
 */
export class LoggingEmailDispatcher implements EmailDispatcher {
  constructor(
    private readonly logger: Logger,
    environment: string
  ) {
    if (environment === "production") {
      throw new Error("EMAIL_DISPATCHER_NOT_CONFIGURED_FOR_PRODUCTION");
    }
  }

  deliver(message: EmailMessage): Promise<void> {
    // The body carries a single-use secret, so it is logged only here, in an
    // environment that by construction is not production.
    this.logger.info(
      { recipient: message.recipient, subject: message.subject },
      "email_not_sent_development_adapter"
    );
    this.logger.debug({ body: message.body }, "email_body");
    return Promise.resolve();
  }
}
