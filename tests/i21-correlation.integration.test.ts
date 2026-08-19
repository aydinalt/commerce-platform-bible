import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import pino from "pino";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { errorEnvelopeSchema } from "../packages/contracts/src/index.js";

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

const ORIGIN = "http://localhost:3000";

class RecordingDispatcher implements EmailDispatcher {
  readonly delivered: EmailMessage[] = [];

  deliver(message: EmailMessage): Promise<void> {
    this.delivered.push(message);
    return Promise.resolve();
  }
}

/**
 * One identifier, end to end (Engineering Constitution §12.3, and R1.3 of the
 * release criteria candidate).
 *
 * The identifier already existed — in the error envelope a person can quote and
 * in every `audit_record` — but it stopped at two boundaries. Fastify stamped
 * its own `req-1`, `req-2` on the automatic request and response lines, so the
 * failure and the route could not be joined; and the outbox carried nothing, so
 * an email that never arrived could not be traced to the request that asked for
 * it.
 *
 * These cases follow one identifier across both boundaries, which is the only
 * way to show that a join actually holds. Asserting that a column exists would
 * prove the column exists.
 */
suite("Increment I21 correlation", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  /** Every line the worker writes, so a delivery can be found by its id. */
  const lines: Record<string, unknown>[] = [];
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    const { createApiApp } = await import("../apps/api/src/bootstrap.js");
    app = await createApiApp({ logLevel: "fatal" });

    processor = new OutboxProcessor({
      dispatcher,
      logger: pino(
        { level: "info" },
        {
          write: (line: string) => {
            lines.push(JSON.parse(line) as Record<string, unknown>);
          }
        }
      ),
      pool,
      publicWebUrl: ORIGIN
    });
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("carries the caller's identifier from the request into the delivery", async () => {
    const correlationId = randomUUID();
    const email = `trace-${randomUUID()}@example.test`;

    await app.inject({
      body: { email, password: "correct horse battery staple" },
      headers: { origin: ORIGIN, "x-correlation-id": correlationId },
      method: "POST",
      url: "/api/v1/auth/registrations"
    });

    /*
     * The asynchronous boundary. Before this, the outbox row carried no
     * identifier at all — so "the confirmation email never arrived" could not
     * be joined to the request that asked for it, which is the one question
     * that incident starts from.
     */
    const queued = await pool.query<{ correlationId: string | null }>(
      `select o.correlation_id as "correlationId"
       from outbox_event o
       join pending_registration p on p.id = o.aggregate_id
       where p.email = $1`,
      [email]
    );
    expect(queued.rows[0]?.correlationId).toBe(correlationId);

    await processor.processBatch();

    // And the worker's own line carries it, so the delivery is findable by the
    // same identifier a person quotes — not only by a database query somebody
    // has to know how to write.
    const delivered = lines.find(
      (line) =>
        line.msg === "outbox_delivered" && line.correlationId === correlationId
    );
    expect(delivered).toBeDefined();
  });

  it("stamps the caller's identifier on Fastify's own request lines", async () => {
    const correlationId = randomUUID();

    /*
     * A second application, built with a logger this case can read.
     *
     * The suite's own app logs at `fatal` so the run stays quiet, and Fastify's
     * request lines are `info` — so the only way to assert what `reqId` holds
     * is to build one that writes somewhere visible.
     */
    const apiLines: Record<string, unknown>[] = [];
    const { createApiApp } = await import("../apps/api/src/bootstrap.js");
    const observed = await createApiApp({
      logLevel: "info",
      loggerDestination: {
        write: (line: string) => {
          apiLines.push(JSON.parse(line) as Record<string, unknown>);
        }
      }
    });

    const response = await observed.inject({
      headers: { origin: ORIGIN, "x-correlation-id": correlationId },
      method: "GET",
      url: "/api/v1/health/live"
    });
    await observed.close();

    // The join that did not exist. Fastify's automatic request line used to
    // carry `req-1`; it carries the caller's identifier now, which is what makes
    // the route, the status and the duration findable from an error message.
    const requestLine = apiLines.find((line) => line.reqId === correlationId);
    expect(requestLine).toBeDefined();

    /*
     * `request.id` is what Fastify puts in `reqId` on every automatic request
     * and response line. Making it the correlation identifier is what joins
     * those lines to the application's own — previously two identifiers for one
     * request, with nothing relating them.
     *
     * Asserted two ways, because the header alone would not prove it. The
     * echoed `x-correlation-id` shows what Fastify holds as `request.id`, and
     * the captured log line shows that the automatic request line carries the
     * same value in `reqId` — which is the join that did not exist.
     */
    expect(response.statusCode).toBe(200);
    expect(response.headers["x-correlation-id"]).toBe(correlationId);
  });

  it("mints an identifier rather than trusting a malformed one", async () => {
    const response = await app.inject({
      body: { slug: "" },
      headers: {
        origin: ORIGIN,
        // Reaches a `uuid` column if it is believed, which is the same reason
        // M11 refused a malformed principal at the edge rather than in the
        // driver.
        "x-correlation-id": "'; drop table x; --"
      },
      method: "POST",
      url: `/api/v1/businesses/${randomUUID()}/offerings`
    });

    const envelope = errorEnvelopeSchema.parse(response.json());
    expect(envelope.correlationId).not.toBe("'; drop table x; --");
    // Still a usable identifier, so the failure is findable even though the
    // caller supplied nothing worth keeping.
    expect(response.headers["x-correlation-id"]).toBe(envelope.correlationId);
  });

  it("gives the envelope and the request line the same identifier", async () => {
    // The join a person actually performs: they quote the id from the error
    // they saw, and it has to find the request that produced it. Two
    // identifiers made that impossible; this is the case that would fail if
    // they came apart again.
    const response = await app.inject({
      body: { slug: "" },
      headers: { origin: ORIGIN },
      method: "POST",
      url: `/api/v1/businesses/${randomUUID()}/offerings`
    });

    const envelope = errorEnvelopeSchema.parse(response.json());
    expect(response.headers["x-correlation-id"]).toBe(envelope.correlationId);
  });
});
