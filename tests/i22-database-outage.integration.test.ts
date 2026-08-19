import { randomUUID } from "node:crypto";

import { HttpStatus } from "@nestjs/common";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { MetricsCollector } from "../apps/api/src/metrics/metrics.collector.js";
import { classifyDatabaseFailure } from "../packages/database/src/index.js";
import { errorEnvelopeSchema } from "../packages/contracts/src/index.js";

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

const ORIGIN = "http://localhost:3000";

/**
 * Nothing listens on port 1, so every connection attempt is refused
 * immediately. A real socket failure rather than a stubbed one, and portable:
 * the local environment runs an embedded PostgreSQL and CI runs a service
 * container, and neither can be stopped from inside a test.
 */
const DEAD_DATABASE_URL = "postgresql://commerce@127.0.0.1:1/commerce";

/**
 * Honest degradation when PostgreSQL is unavailable (R3.6 of the release
 * criteria candidate; Engineering Constitution §13).
 *
 * R3.6 asks for three things at once: readiness fails, requests answer
 * `503 DEPENDENCY_UNAVAILABLE`, and **nothing reports a defect**. Readiness was
 * already right. The other two were not, and both were measured before being
 * changed:
 *
 * | During a real outage | Before |
 * |---|---|
 * | `GET /discovery/browse` | `500 INTERNAL_ERROR` |
 * | `GET /metrics` | `500`, and about a serialisation error rather than the outage |
 *
 * The first is the platform blaming itself for its dependency being down, on
 * every request, for the whole outage — and telling clients not to retry. The
 * second removes monitoring at the exact moment it is wanted, including the
 * pool gauges and counters that never needed the database at all.
 */
suite("Increment I22 database outage", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.METRICS_TOKEN = `outage-${randomUUID()}`;

    /*
     * The pool reads `DATABASE_URL` when the module is constructed, so pointing
     * it somewhere dead for the duration of that call is enough to give this
     * app a database that is genuinely not there. Restored immediately, because
     * every other suite in this run needs the real one.
     */
    const real = process.env.DATABASE_URL;
    process.env.DATABASE_URL = DEAD_DATABASE_URL;
    try {
      const { createApiApp } = await import("../apps/api/src/bootstrap.js");
      app = await createApiApp({ logLevel: "fatal" });
    } finally {
      process.env.DATABASE_URL = real;
    }
  });

  /*
   * `app.close()` is the whole cleanup, and adding `pool.end()` after it fails.
   *
   * `DatabaseLifecycle.onModuleDestroy` ends the pool, because I18 made the
   * module its owner — with one shared pool, the first repository destroyed
   * would otherwise have closed it under the other fourteen. Suites that build
   * their own second pool still end it themselves; this one has no pool of its
   * own to end.
   */
  afterAll(async () => {
    await app.close();
  });

  it("classifies the failures a real outage produces, and only those", () => {
    /*
     * The shapes were taken from a measured outage rather than imagined: a
     * running embedded PostgreSQL was stopped underneath a live pool, and
     * `57P01` with that exact message is what `pg` raised.
     */
    expect(classifyDatabaseFailure({ code: "ECONNREFUSED" })).toBe(
      "unavailable"
    );
    expect(
      classifyDatabaseFailure({
        code: "57P01",
        message: "terminating connection due to administrator command"
      })
    ).toBe("unavailable");
    expect(classifyDatabaseFailure({ code: "08006" })).toBe("unavailable");
    expect(classifyDatabaseFailure({ code: "53300" })).toBe("unavailable");
    expect(
      classifyDatabaseFailure({ message: "Connection terminated unexpectedly" })
    ).toBe("unavailable");

    // Still their own kinds. I19 separated them because they call for different
    // responses, and an outage must not quietly absorb either.
    expect(classifyDatabaseFailure({ code: "57014" })).toBe("statement");
    expect(
      classifyDatabaseFailure({
        message: "timeout exceeded when trying to connect"
      })
    ).toBe("acquisition");

    /*
     * The boundary that matters most. A constraint violation, a syntax error
     * and an ordinary bug are defects, and a classifier that swallowed them
     * would turn every application fault into a soothing "try again later" —
     * answering 503 to a request that can never succeed.
     */
    expect(classifyDatabaseFailure({ code: "23505" })).toBeNull();
    expect(classifyDatabaseFailure({ code: "42601" })).toBeNull();
    expect(classifyDatabaseFailure(new TypeError("x is not a function"))).toBe(
      null
    );
    expect(classifyDatabaseFailure(undefined)).toBeNull();
  });

  it("answers 503 rather than reporting a defect it does not have", async () => {
    const response = await app.inject({
      headers: { origin: ORIGIN },
      method: "GET",
      url: "/api/v1/discovery/browse"
    });

    expect(response.statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    const envelope = errorEnvelopeSchema.parse(response.json());
    expect(envelope.code).toBe("DEPENDENCY_UNAVAILABLE");
    // Not "did not answer in time": there is no server to be slow. The status
    // is shared with the two timeouts, the message is what tells them apart.
    expect(envelope.message).toBe("The database is not available");
  });

  it("fails readiness closed", async () => {
    const response = await app.inject({
      headers: { origin: ORIGIN },
      method: "GET",
      url: "/api/v1/health/ready"
    });

    expect(response.statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    expect(errorEnvelopeSchema.parse(response.json()).code).toBe(
      "DEPENDENCY_UNAVAILABLE"
    );
  });

  it("keeps serving liveness, so the process is not mistaken for dead", async () => {
    // Liveness and readiness answering the same thing would get the process
    // restarted for a fault outside it, which fixes nothing and loses the
    // in-memory counters that say how long this has been happening.
    const response = await app.inject({
      headers: { origin: ORIGIN },
      method: "GET",
      url: "/api/v1/health/live"
    });

    expect(response.statusCode).toBe(200);
  });

  it("still serves the metrics that do not need a database", async () => {
    const response = await app.inject({
      headers: {
        authorization: `Bearer ${process.env.METRICS_TOKEN ?? ""}`,
        origin: ORIGIN
      },
      method: "GET",
      url: "/api/v1/metrics"
    });

    // The whole endpoint used to answer 500 here, taking the pool gauges and
    // the counters with it — the moment they are most worth having.
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/plain");
    expect(response.body).toContain("commerce_db_pool_max");
    expect(response.body).toContain("commerce_db_reachable 0");
    expect(response.body).toContain("commerce_db_unavailable_total");
  });

  it("omits the database-derived gauges rather than reporting them as zero", async () => {
    const response = await app.inject({
      headers: {
        authorization: `Bearer ${process.env.METRICS_TOKEN ?? ""}`,
        origin: ORIGIN
      },
      method: "GET",
      url: "/api/v1/metrics"
    });

    /*
     * `commerce_outbox_pending 0` during an outage would read as "mail is
     * flowing" and silence the alert that should be loudest. Absent is honest:
     * a scraper's staleness handling then applies, and `commerce_db_reachable`
     * says why.
     */
    expect(response.body).not.toContain("commerce_outbox_pending");
    expect(response.body).not.toContain("commerce_retention_pending_rows");
  });

  it("reports a defect in the scrape as an envelope, not as a serialisation error", async () => {
    /*
     * The path I20 said it had fixed and had not.
     *
     * Its closure record explains the mechanism correctly — a `text/plain`
     * header applied before the body means Fastify is asked to send the JSON
     * error envelope as text and refuses — and then only moved the header past
     * the *permission* check. It still ran before `scrape()`, so any failure
     * inside collection reproduced the identical error, which is precisely what
     * a database outage used to do.
     *
     * A database failure no longer reaches here, so the surviving way in is a
     * genuine defect in the collector. That path has to answer with something a
     * person can act on rather than a message about payload types.
     */
    const collector = app.get(MetricsCollector);
    const scrape = collector.scrape.bind(collector);
    collector.scrape = () => Promise.reject(new TypeError("collector defect"));

    try {
      const response = await app.inject({
        headers: {
          authorization: `Bearer ${process.env.METRICS_TOKEN ?? ""}`,
          origin: ORIGIN
        },
        method: "GET",
        url: "/api/v1/metrics"
      });

      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      const envelope = errorEnvelopeSchema.parse(response.json());
      expect(envelope.code).toBe("INTERNAL_ERROR");

      /*
       * **The message is the assertion**, and the status is not.
       *
       * With the header set too early this route still answers `500` and still
       * says `INTERNAL_ERROR` — so a test checking either would pass against
       * the bug. What changes is what the envelope *says*: Fastify's refusal to
       * serialise replaces the real failure, and the caller is told
       * *"Attempted to send payload of invalid type 'object'"* about a defect
       * that had nothing to do with payload types. That is how I20's fix looked
       * complete while half of it was missing.
       */
      expect(envelope.message).toBe("Unexpected server error");
    } finally {
      collector.scrape = scrape;
    }
  });

  it("counts the outage separately from the timeouts", async () => {
    await app.inject({
      headers: { origin: ORIGIN },
      method: "GET",
      url: "/api/v1/discovery/browse"
    });

    const response = await app.inject({
      headers: {
        authorization: `Bearer ${process.env.METRICS_TOKEN ?? ""}`,
        origin: ORIGIN
      },
      method: "GET",
      url: "/api/v1/metrics"
    });

    const outages = /^commerce_db_unavailable_total (\d+)$/mu.exec(
      response.body
    );
    expect(Number(outages?.[1])).toBeGreaterThan(0);

    // A series named for timeouts that counted outages would be a metric that
    // lies, and the two call for different responses: find the query, or find
    // the database.
    const statements =
      /^commerce_db_timeouts_total\{kind="statement"\} (\d+)$/mu.exec(
        response.body
      );
    expect(Number(statements?.[1])).toBe(0);
  });
});
