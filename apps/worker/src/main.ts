import { loadEmailConfig, loadRuntimeConfig } from "@commerce/config";
import { createDatabasePool, verifyDatabaseTimeouts } from "@commerce/database";
import { createLogger } from "@commerce/observability";

import { buildDispatcher } from "./dispatcher.js";
import { OutboxProcessor } from "./outbox.processor.js";
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

/*
 * The dispatcher now comes from `dispatcher.ts` (I38), so this entry and the
 * scheduled one cannot end up with different answers to "does this deployment
 * send real mail".
 */
/*
 * One pool for the process, shared by both components that use it.
 *
 * The outbox and the sweep never run at once — they take turns in the same loop
 * — so two pools bought nothing but two sets of idle connections.
 */
const pool = createDatabasePool((error) => {
  // `pg` re-emits an idle connection's failure on the pool, and a pool with no
  // listener throws. The worker would otherwise die the first time PostgreSQL
  // ended a session it was holding.
  logger.error({ err: error }, "database_connection_lost");
});

/**
 * Prove the timeouts before touching the outbox (I36).
 *
 * The worker's own pool, because unlike the API it owns one directly.
 *
 * **The worker needs this more than the API does, not less.** The retention
 * sweep is the one statement in the platform that scans whole tables, and it is
 * also the one nobody is watching — an unbounded sweep against a table with a
 * real backlog holds locks for as long as it takes. `statement_timeout` is what
 * turns that from an outage into a logged failure, so a worker that cannot
 * confirm it has one should not start.
 */
await verifyDatabaseTimeouts(pool);

const processor = new OutboxProcessor({
  dispatcher: buildDispatcher(email, logger, environment),
  logger,
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
