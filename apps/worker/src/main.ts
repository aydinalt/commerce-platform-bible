import { loadEmailConfig, loadRuntimeConfig } from "@commerce/config";
import type { EmailDispatcher } from "@commerce/notification";
import { createLogger } from "@commerce/observability";

import { HttpEmailDispatcher } from "./http.dispatcher.js";
import { LoggingEmailDispatcher } from "./logging.dispatcher.js";
import { OutboxProcessor } from "./outbox.processor.js";
import { postmarkProvider } from "./postmark.provider.js";

const POLL_INTERVAL_MS = 2000;

const config = loadRuntimeConfig("worker");
const logger = createLogger("worker", config.logLevel);
const environment = process.env.NODE_ENV ?? "development";
const email = loadEmailConfig(environment);

/**
 * Builds the dispatcher the configuration names.
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
function buildDispatcher(): EmailDispatcher {
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

const processor = new OutboxProcessor({
  dispatcher: buildDispatcher(),
  publicWebUrl: process.env.PUBLIC_WEB_URL ?? "http://localhost:3000"
});

let running = true;

const stop = (signal: NodeJS.Signals): void => {
  logger.info({ signal }, "worker stopping");
  running = false;
};

process.once("SIGINT", stop);
process.once("SIGTERM", stop);

logger.info("worker ready");

const idle = () =>
  new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

while (running) {
  try {
    const handled = await processor.processBatch();
    // Idle only when there was nothing to do, so a backlog drains promptly.
    if (handled === 0) await idle();
  } catch (error) {
    logger.error({ err: error }, "outbox_batch_failed");
    await idle();
  }
}

await processor.close();
process.exitCode = 0;
