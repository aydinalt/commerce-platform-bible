import { loadRuntimeConfig } from "@commerce/config";
import { createLogger } from "@commerce/observability";

import { LoggingEmailDispatcher } from "./logging.dispatcher.js";
import { OutboxProcessor } from "./outbox.processor.js";

const POLL_INTERVAL_MS = 2000;

const config = loadRuntimeConfig("worker");
const logger = createLogger("worker", config.logLevel);
const environment = process.env.NODE_ENV ?? "development";

const processor = new OutboxProcessor({
  dispatcher: new LoggingEmailDispatcher(logger, environment),
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
