import { loadEmailConfig, loadRuntimeConfig } from "@commerce/config";
import type { EmailDispatcher } from "@commerce/notification";
import { createLogger } from "@commerce/observability";

import { LoggingEmailDispatcher } from "./logging.dispatcher.js";
import { OutboxProcessor } from "./outbox.processor.js";

const POLL_INTERVAL_MS = 2000;

const config = loadRuntimeConfig("worker");
const logger = createLogger("worker", config.logLevel);
const environment = process.env.NODE_ENV ?? "development";
const email = loadEmailConfig(environment);

/**
 * Builds the dispatcher the configuration names.
 *
 * `http` is deliberately unreachable until a provider exists. The transport,
 * the timeout, the secret handling and the retry decision are all written and
 * tested; what is missing is the four small provider-specific things
 * `EmailProvider` asks for, and this is where the chosen one is constructed.
 *
 * It throws rather than falling back to the development adapter. A deployment
 * that asked for real delivery and silently got none would look healthy while
 * every registration expired unanswered — the worst of the three possible
 * outcomes, and the only one nobody would notice.
 */
function buildDispatcher(): EmailDispatcher {
  if (email.transport === "development")
    return new LoggingEmailDispatcher(logger, environment);

  throw new Error(
    "EMAIL_PROVIDER_NOT_IMPLEMENTED: set EMAIL_TRANSPORT=development, or " +
      "supply an EmailProvider to HttpEmailDispatcher here"
  );
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
