import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { MetricsCollector } from "../apps/api/src/metrics/metrics.collector.js";
import {
  Counters,
  renderMetrics
} from "../packages/observability/src/index.js";

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

const ORIGIN = "http://localhost:3000";
const TOKEN = "metrics-token-for-the-suite";

/**
 * Metrics (Engineering Constitution §12.2).
 *
 * "Each production component shall expose metrics appropriate to its role" — and
 * none existed. What is published is not a general survey: it is the set of
 * questions I17, I18 and I19 raised and left unanswerable. Each of those closure
 * records admits its own number was a judgement rather than a measurement, and
 * nothing could see whether the judgement held.
 *
 * These cases seed real state and read it back through the endpoint. A metric
 * that renders a plausible number without being connected to anything is the
 * failure mode worth guarding against, because it is believed.
 */
suite("Increment I20 metrics", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let app: NestFastifyApplication;
  let previousToken: string | undefined;

  const scrape = (headers: Record<string, string> = {}) =>
    app.inject({
      headers: { origin: ORIGIN, ...headers },
      method: "GET",
      url: "/api/v1/metrics"
    });

  const authorised = () => scrape({ authorization: `Bearer ${TOKEN}` });

  /** One sample's value, by series name and optional label. */
  const value = (body: string, name: string, label?: string): number => {
    const line = body
      .split("\n")
      .find(
        (candidate) =>
          candidate.startsWith(name) &&
          !candidate.startsWith("#") &&
          (label === undefined || candidate.includes(label))
      );
    return Number(line?.split(" ").pop());
  };

  beforeAll(async () => {
    previousToken = process.env.METRICS_TOKEN;
    process.env.METRICS_TOKEN = TOKEN;
    process.env.NODE_ENV = "test";

    const { createApiApp } = await import("../apps/api/src/bootstrap.js");
    app = await createApiApp({ logLevel: "fatal" });
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
    if (previousToken === undefined) delete process.env.METRICS_TOKEN;
    else process.env.METRICS_TOKEN = previousToken;
  });

  it("tells an unauthorised caller nothing, including that it exists", async () => {
    const anonymous = await scrape();
    const wrongToken = await scrape({ authorization: "Bearer not-the-token" });

    /*
     * `404` rather than `401`, deliberately.
     *
     * Pool saturation and backlog depth say more about the platform's health
     * than anything else it publishes. An endpoint that refuses confirms it is
     * there, and there is no reason to confirm that to somebody who cannot use
     * it.
     */
    expect(anonymous.statusCode).toBe(404);
    expect(wrongToken.statusCode).toBe(404);
    expect(anonymous.body).not.toContain("commerce_");
  });

  it("serves the scrape format a monitoring system expects", async () => {
    const response = await authorised();

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/plain");
    // Every series carries both, or a scraper cannot type it.
    expect(response.body).toContain("# HELP commerce_db_pool_connections");
    expect(response.body).toContain(
      "# TYPE commerce_db_pool_connections gauge"
    );
    expect(response.body).toContain(
      "# TYPE commerce_db_timeouts_total counter"
    );
    // Prometheus requires a trailing newline.
    expect(response.body.endsWith("\n")).toBe(true);
  });

  it("reports the pool this process actually holds", async () => {
    const body = (await authorised()).body;

    /*
     * The question I18 could not answer. `DATABASE_POOL_MAX` was chosen by
     * reasoning — its own closure calls ten "a default, not a measurement" —
     * and until now nothing could show what the process was holding against it.
     */
    expect(value(body, "commerce_db_pool_max")).toBeGreaterThan(0);
    expect(
      value(body, "commerce_db_pool_connections", 'state="total"')
    ).toBeGreaterThan(0);
    // Serving this scrape needed a connection, so `total` cannot be zero — a
    // gauge wired to nothing would report exactly that.
    expect(
      value(body, "commerce_db_pool_connections", 'state="idle"')
    ).toBeLessThanOrEqual(value(body, "commerce_db_pool_max"));
  });

  it("counts a dead letter that exists and not one that does not", async () => {
    const before = value(
      (await authorised()).body,
      "commerce_outbox_dead_letters"
    );

    const id = randomUUID();
    await pool.query(
      `insert into outbox_event (id,aggregate_type,aggregate_id,event_type,payload,processed_at,attempts)
       values ($1,'T',$2,'e','{}'::jsonb,null,8)`,
      [id, randomUUID()]
    );
    const after = value(
      (await authorised()).body,
      "commerce_outbox_dead_letters"
    );

    /*
     * Asserted as a difference rather than as a total. Other suites share this
     * database and seed their own events; counting globally would be counting
     * their work, which is the mistake `i11-outbox-dead-letter` was corrected
     * for once already.
     */
    expect(after).toBe(before + 1);

    // And it stops being one the moment it is delivered — the gauge reads the
    // present rather than accumulating history.
    await pool.query(
      `update outbox_event set processed_at = now() where id = $1`,
      [id]
    );
    expect(
      value((await authorised()).body, "commerce_outbox_dead_letters")
    ).toBe(before);
  });

  it("sees work the worker has not done, from a process that is not the worker", async () => {
    const before = value(
      (await authorised()).body,
      "commerce_retention_pending_rows",
      'table="pending_registration"'
    );

    await pool.query(
      `insert into pending_registration (email,password_hash,expires_at)
       values ($1,'x',now() - interval '1 minute')`,
      [`metrics-${randomUUID()}@example.test`]
    );

    const after = value(
      (await authorised()).body,
      "commerce_retention_pending_rows",
      'table="pending_registration"'
    );

    /*
     * The design decision this case exists for.
     *
     * The worker is a separate process, so the API cannot read its counters —
     * and giving a loop an HTTP surface just to publish them would be a worse
     * answer than the question deserves. Reading the *state* instead is not a
     * consolation: a count of rows the sweep deleted says it ran, while a count
     * of rows still waiting says whether it is keeping up. If the worker dies,
     * this climbs on its own, which is the thing an alert should watch.
     */
    expect(after).toBe(before + 1);
  });

  it("publishes a counter at zero before anything has happened to it", () => {
    // A series that appears only after its first event is a series an alert
    // cannot be written against, because "absent" and "none yet" look identical
    // until the first failure.
    const body = renderMetrics([
      {
        help: "h",
        kind: "counter",
        name: "commerce_db_timeouts_total",
        samples: [
          {
            labels: { kind: "statement" },
            value: new Counters().total("unused")
          }
        ]
      }
    ]);

    expect(body).toContain('commerce_db_timeouts_total{kind="statement"} 0');
  });

  it("escapes a label value rather than producing a broken scrape", () => {
    // Not reachable from the series published today, whose labels are all fixed
    // strings — but the renderer is the shared thing, and a quote in a label is
    // how one bad value silently corrupts an entire scrape.
    const body = renderMetrics([
      {
        help: "h",
        kind: "gauge",
        name: "commerce_test",
        samples: [{ labels: { table: 'a"b\\c' }, value: 1 }]
      }
    ]);

    expect(body).toContain('commerce_test{table="a\\"b\\\\c"} 1');
  });

  it("keeps the collector and the counters the same object", async () => {
    // Two instances would leave the endpoint reporting zero while the filter
    // counted — the failure that looks like "no timeouts happened".
    const collector = app.get(MetricsCollector);
    const counters = app.get(Counters);
    counters.increment("db_timeout", { kind: "statement" });

    const body = await collector.scrape();
    expect(body).toContain('commerce_db_timeouts_total{kind="statement"} 1');
  });
});
