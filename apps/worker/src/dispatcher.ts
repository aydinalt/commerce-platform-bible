import type { EmailConfig } from "@commerce/config";
import type { EmailDispatcher } from "@commerce/notification";
import type { createLogger } from "@commerce/observability";

import { HttpEmailDispatcher } from "./http.dispatcher.js";
import { LoggingEmailDispatcher } from "./logging.dispatcher.js";
import { postmarkProvider } from "./postmark.provider.js";

/**
 * Builds the dispatcher the configuration names.
 *
 * **Lifted out of `main.ts` in I38**, unchanged, because the scheduled entry
 * needs the same dispatcher and a second copy of this decision is the kind of
 * duplicate that drifts — one deployment sending real mail and the other
 * writing to a log, with nothing to say which.
 *
 * `loadEmailConfig` has already refused a production deployment naming a vendor
 * without a credential or a sender, so by the time this runs the values exist.
 * Adding a second vendor is a second branch and a second `EmailProvider`;
 * nothing else here moves.
 *
 * There is no fallback to the development adapter. A deployment that asked for
 * real delivery and silently got none would look healthy while every
 * registration expired unanswered — the worst of the outcomes, and the only one
 * nobody would notice.
 */
/**
 * Derived rather than imported: `@commerce/observability` exports the factory
 * and not the type, and inventing a second name for what it returns would be a
 * definition that can drift from the thing it describes.
 */
type Logger = ReturnType<typeof createLogger>;

export function buildDispatcher(
  email: EmailConfig,
  logger: Logger,
  environment: string = process.env["NODE_ENV"] ?? "development"
): EmailDispatcher {
  if (email.transport === "development")
    return new LoggingEmailDispatcher(logger, environment);

  return new HttpEmailDispatcher({
    logger,
    provider: postmarkProvider({
      // Non-null because `loadEmailConfig` throws without them, which is where
      // the operator gets an error naming the setting rather than a stack.
      apiKey: email.apiKey ?? "",
      sender: email.sender ?? ""
    }),
    timeoutMs: email.timeoutMs
  });
}
