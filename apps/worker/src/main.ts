import { loadEmailConfig, loadRuntimeConfig } from "@commerce/config";
import { createDatabasePool } from "@commerce/database";
import type { EmailDispatcher } from "@commerce/notification";
import { createLogger } from "@commerce/observability";

import { HttpEmailDispatcher } from "./http.dispatcher.js";
import { LoggingEmailDispatcher } from "./logging.dispatcher.js";
import { OutboxProcessor } from "./outbox.processor.js";
import { postmarkProvider } from "./postmark.provider.js";
import { RetentionSweeper } from "./retention.sweeper.js";

const POLL_INTERVAL_MS = 2000;

/**
 * The sweep is not the outbox and does not want its cadence.
 *
 * Nothing waits on a deleted row, so running it every two seconds would buy
 * nothing and cost a table-wide `delete` scan on every tick. Five minutes is
 * frequent enough that a session is gone minutes after it expires and rare
 * enough to be invisible.
 */
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;

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

/*
 * One pool for the process, shared by both components that use it.
 *
 * The outbox and the sweep never run at once — they take turns in the same loop
 * — so two pools bought nothing but two sets of idle connections.
 */
const pool = createDatabasePool();

const processor = new OutboxProcessor({
  dispatcher: buildDispatcher(),
  pool,
  publicWebUrl: process.env.PUBLIC_WEB_URL ?? "http://localhost:3000"
});

const sweeper = new RetentionSweeper(pool);
let sweptAt = 0;

/**
 * Deletes what the platform has finished with (ADR-0012 §3, "session cleanup").
 *
 * It shares the outbox's loop rather than getting a timer of its own, so the
 * two can never run at once and a shutdown stops both at the same place. A
 * failed sweep is logged and the loop continues: nothing downstream depends on
 * a row having been deleted, and a worker that stopped delivering mail because
 * a `delete` failed would trade a large problem for a small one.
 */
async function sweepIfDue(): Promise<void> {
  if (Date.now() - sweptAt < SWEEP_INTERVAL_MS) return;
  sweptAt = Date.now();
  try {
    const counts = await sweeper.sweep();
    // Logged whether or not anything went, because a sweep that removes
    // thousands of rows every cycle is a symptom rather than a success, and
    // that is only visible against the cycles that removed none.
    logger.info({ ...counts }, "retention_swept");
  } catch (error) {
    logger.error({ err: error }, "retention_sweep_failed");
  }
}

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
  await sweepIfDue();
  try {
    const handled = await processor.processBatch();
    // Idle only when there was nothing to do, so a backlog drains promptly.
    if (handled === 0) await idle();
  } catch (error) {
    logger.error({ err: error }, "outbox_batch_failed");
    await idle();
  }
}

await pool.end();
process.exitCode = 0;
