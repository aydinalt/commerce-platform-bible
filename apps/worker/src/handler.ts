import { timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

import { loadEmailConfig, loadRuntimeConfig } from "@commerce/config";
import { createDatabasePool, verifyDatabaseTimeouts } from "@commerce/database";
import { createLogger } from "@commerce/observability";

import { buildDispatcher } from "./dispatcher.js";
import { drainOutbox } from "./drain.js";
import { OutboxProcessor } from "./outbox.processor.js";
import { RetentionSweeper } from "./retention.sweeper.js";

/**
 * The worker as two scheduled invocations (I38).
 *
 * `main.ts` is a `while (running)` loop and stays one. This is the same work,
 * entered by a scheduler instead — the arrangement I37 made for the API, for
 * the same reason: **a staged hosting decision is only reversible while both
 * shapes exist.**
 *
 * ## Two endpoints, because the two jobs have different cadences
 *
 * In the loop the sweep is gated by a five-minute timer and the outbox polls
 * every two seconds. A function has no memory between invocations, so that
 * timer cannot survive — `sweptAt` in a fresh process is always zero and the
 * sweep would run on every outbox tick. **The cadence has to move into the
 * schedule**, which means two endpoints with two entries in `vercel.json`
 * rather than one endpoint that guesses.
 */

/**
 * Built once per instance, like the API's handler and for the same reason: a
 * warm instance that rebuilt per invocation would open a new pool each time.
 */
let starting: Promise<Worker> | undefined;

interface Worker {
  drainBudgetMs: number;
  processor: OutboxProcessor;
  sweeper: RetentionSweeper;
}

const build = async (): Promise<Worker> => {
  const config = loadRuntimeConfig("worker");
  const logger = createLogger("worker", config.logLevel);
  const environment = process.env["NODE_ENV"] ?? "development";

  const pool = createDatabasePool((error) => {
    logger.error({ err: error }, "database_connection_lost");
  });

  // I36's check, at the third and fourth places the platform starts. The sweep
  // is the one statement that scans whole tables, so a worker that cannot
  // confirm it has a statement timeout should not run at all.
  await verifyDatabaseTimeouts(pool);

  return {
    /*
     * How long one invocation may spend draining.
     *
     * Read from the environment because it is a property of the plan rather
     * than of the code: Vercel's function limit differs by plan and by
     * `maxDuration`, and a number compiled in here would be wrong on three
     * deployments out of four. The default is deliberately below the smallest
     * limit worth deploying on.
     */
    drainBudgetMs: Number(process.env["CRON_BUDGET_MS"] ?? "45000"),
    processor: new OutboxProcessor({
      dispatcher: buildDispatcher(loadEmailConfig(environment), logger),
      logger,
      pool,
      publicWebUrl: process.env["PUBLIC_WEB_URL"] ?? "http://localhost:3000"
    }),
    sweeper: new RetentionSweeper(pool)
  };
};

/**
 * Whether this request carries the scheduler's secret.
 *
 * Vercel sends `Authorization: Bearer ${CRON_SECRET}` on a cron invocation.
 * Compared at **full length** — `timingSafeEqual` throws on a length mismatch,
 * so the lengths are checked first and the comparison itself never short
 * circuits on the first differing byte.
 *
 * **An unset or empty `CRON_SECRET` never matches.** A deployment that forgot
 * to set one gets an endpoint nobody can reach, rather than one everybody can:
 * this endpoint sends real email and deletes real rows, so an open one is a way
 * to exhaust a mail quota from the outside.
 */
const authorised = (request: IncomingMessage): boolean => {
  const expected = process.env["CRON_SECRET"] ?? "";
  if (expected === "") return false;

  const header = request.headers.authorization ?? "";
  const offered = header.startsWith("Bearer ") ? header.slice(7) : "";

  const a = Buffer.from(offered);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

/**
 * Wraps a job in the checks every scheduled invocation needs.
 *
 * **An unauthorised caller gets 404, not 401**, matching what I19 decided for
 * `/metrics`: `401` confirms that something is there to be authorised against,
 * and this endpoint's existence is not worth announcing to somebody guessing
 * paths.
 */
const guarded =
  (run: (worker: Worker) => Promise<Record<string, unknown>>) =>
  async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    if (!authorised(request)) {
      response.writeHead(404).end();
      return;
    }

    starting ??= build();
    try {
      const result = await run(await starting);
      response
        .writeHead(200, { "content-type": "application/json" })
        .end(JSON.stringify(result));
    } catch (error) {
      /*
       * A failed invocation answers 500 so the scheduler's own log records it.
       * The body says nothing: a scheduler cannot act on a message, and this
       * endpoint is reachable from the internet by anyone holding the secret.
       */
      process.stderr.write(
        `${error instanceof Error ? error.message : String(error)}\n`
      );
      response.writeHead(500).end();
    }
  };

/** Delivers what is queued, for as long as the budget allows. */
export const outboxHandler = guarded(async ({ drainBudgetMs, processor }) => ({
  ...(await drainOutbox({ budgetMs: drainBudgetMs, processor }))
}));

/**
 * Deletes what the platform has finished with (ADR-0012 §3).
 *
 * Its own endpoint and its own schedule, because the loop's five-minute timer
 * cannot survive a process that does not persist between invocations.
 */
export const sweepHandler = guarded(async ({ sweeper }) => ({
  ...(await sweeper.sweep())
}));
