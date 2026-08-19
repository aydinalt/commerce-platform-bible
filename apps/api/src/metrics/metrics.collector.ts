import { Injectable } from "@nestjs/common";
import { Pool } from "pg";

import {
  Counters,
  renderMetrics,
  type MetricSeries
} from "@commerce/observability";

import {
  DEFAULT_IDLE_TRANSACTION_TIMEOUT_MS,
  IDENTITY_GRACE_MS,
  OUTBOX_RETENTION_MS
} from "@commerce/database";

/**
 * What the last three increments made true and left invisible.
 *
 * I17 gave the platform a retention sweep, I18 gave it one connection pool and
 * I19 gave that pool a timeout. Each closure record ends with a version of the
 * same admission: the number was a judgement rather than a measurement, and
 * nothing could see whether it was right. §12.2 requires the metrics; these are
 * the ones that answer the questions those three increments raised.
 *
 * **Almost nothing here is instrumented at a call site.** The pool is asked what
 * it is holding, and the database is asked what it contains. That is deliberate:
 * a counter incremented in twenty places is twenty places to forget, and state
 * read at scrape time cannot drift from the thing it describes.
 */
@Injectable()
export class MetricsCollector {
  constructor(
    private readonly pool: Pool,
    private readonly counters: Counters
  ) {}

  async scrape(): Promise<string> {
    const database = await this.databaseState();
    return renderMetrics([...this.poolSeries(), ...database, ...this.counterSeries()]);
  }

  /**
   * The pool, asked directly.
   *
   * `waiting` is the one to alert on. `total` at the ceiling is a pool doing its
   * job; `waiting` above zero for any length of time means requests are queuing
   * for a connection, which is the state I19 made refusable after two seconds
   * and which `DATABASE_POOL_MAX` exists to prevent.
   */
  private poolSeries(): MetricSeries[] {
    return [
      {
        help: "PostgreSQL connections held by this process. Sustained waiting above zero means DATABASE_POOL_MAX is too low for the load, or something is holding connections too long.",
        kind: "gauge",
        name: "commerce_db_pool_connections",
        samples: [
          { labels: { state: "total" }, value: this.pool.totalCount },
          { labels: { state: "idle" }, value: this.pool.idleCount },
          { labels: { state: "waiting" }, value: this.pool.waitingCount }
        ]
      },
      {
        help: "The ceiling this process will not exceed, so saturation can be read as a ratio rather than guessed at.",
        kind: "gauge",
        name: "commerce_db_pool_max",
        samples: [{ value: this.pool.options.max ?? 0 }]
      }
    ];
  }

  /**
   * The worker's work, read from the database rather than from the worker.
   *
   * The worker is a **separate process** and this endpoint lives in the API, so
   * it cannot see the worker's counters — and asking it to expose its own
   * endpoint would mean giving a loop an HTTP surface it has no other reason to
   * have.
   *
   * Reading the state instead turns out to be the better measurement, not a
   * consolation. A counter of rows the sweep deleted says the sweep ran; a gauge
   * of rows still waiting to be deleted says whether it is *keeping up* — and if
   * the worker dies, every one of these climbs on its own. That is the signal an
   * alert should fire on.
   */
  private async databaseState(): Promise<MetricSeries[]> {
    const counts = await this.pool.query<{
      comparisonSets: number;
      deadLetters: number;
      decisionFlows: number;
      outboxProcessed: number;
      passwordResets: number;
      pendingOutbox: number;
      pendingRegistrations: number;
      sessions: number;
    }>(
      `select
         (select count(*)::int from outbox_event
           where processed_at is null and attempts < 8) as "pendingOutbox",
         (select count(*)::int from outbox_event
           where processed_at is null and attempts >= 8) as "deadLetters",
         (select count(*)::int from outbox_event
           where processed_at is not null
             and processed_at <= now() - ($1::double precision * interval '1 millisecond')) as "outboxProcessed",
         (select count(*)::int from user_session
           where expires_at <= now() - ($2::double precision * interval '1 millisecond')
              or revoked_at <= now() - ($2::double precision * interval '1 millisecond')) as "sessions",
         (select count(*)::int from pending_registration
           where expires_at <= now() - ($2::double precision * interval '1 millisecond')) as "pendingRegistrations",
         (select count(*)::int from password_reset
           where expires_at <= now() - ($2::double precision * interval '1 millisecond')) as "passwordResets",
         (select count(*)::int from decision_flow
           where expires_at <= now()) as "decisionFlows",
         (select count(*)::int from comparison_set
           where expires_at <= now()) as "comparisonSets"`,
      [OUTBOX_RETENTION_MS, IDENTITY_GRACE_MS]
    );
    const row = counts.rows[0];

    return [
      {
        help: "Outbox events still waiting for delivery. A number that grows without draining means mail is not going out.",
        kind: "gauge",
        name: "commerce_outbox_pending",
        samples: [{ value: row?.pendingOutbox ?? 0 }]
      },
      {
        help: "Outbox events that exhausted their attempts and will not be retried. Any value above zero is a message that never arrived and a person who is still waiting for it.",
        kind: "gauge",
        name: "commerce_outbox_dead_letters",
        samples: [{ value: row?.deadLetters ?? 0 }]
      },
      {
        help: "Rows the retention sweep would delete right now. These are what the worker is for: if it stops, every one of them climbs, which is the cheapest way to notice the worker has died.",
        kind: "gauge",
        name: "commerce_retention_pending_rows",
        samples: [
          { labels: { table: "user_session" }, value: row?.sessions ?? 0 },
          {
            labels: { table: "pending_registration" },
            value: row?.pendingRegistrations ?? 0
          },
          {
            labels: { table: "password_reset" },
            value: row?.passwordResets ?? 0
          },
          {
            labels: { table: "outbox_event" },
            value: row?.outboxProcessed ?? 0
          },
          {
            labels: { table: "decision_flow" },
            value: row?.decisionFlows ?? 0
          },
          {
            labels: { table: "comparison_set" },
            value: row?.comparisonSets ?? 0
          }
        ]
      }
    ];
  }

  /**
   * The two events that leave no trace to read afterwards.
   *
   * A cancelled statement and a refused connection are gone the moment they are
   * answered, so unlike everything above them they have to be counted where they
   * happen — in `ErrorEnvelopeFilter`, which is already the one place that
   * classifies them.
   *
   * **This counts the API's only.** The worker meets the same timeouts through
   * the same pool and nothing counts those; its failures surface as a stalled
   * outbox, which the gauges above do show.
   */
  private counterSeries(): MetricSeries[] {
    return [
      {
        help: "Database operations this process abandoned against the budgets I19 set. A rising statement count means queries are outgrowing five seconds; a rising acquisition count means the pool is exhausted.",
        kind: "counter",
        name: "commerce_db_timeouts_total",
        samples: [
          {
            labels: { kind: "statement" },
            value: this.counters.total(DB_TIMEOUT, { kind: "statement" })
          },
          {
            labels: { kind: "acquisition" },
            value: this.counters.total(DB_TIMEOUT, { kind: "acquisition" })
          }
        ]
      },
      {
        help: "How long a transaction may sit idle before PostgreSQL ends its session, published so a scrape carries the budget its numbers are measured against.",
        kind: "gauge",
        name: "commerce_db_idle_transaction_timeout_ms",
        samples: [{ value: DEFAULT_IDLE_TRANSACTION_TIMEOUT_MS }]
      }
    ];
  }
}

/** The one counter name, so the filter and the collector cannot disagree. */
export const DB_TIMEOUT = "db_timeout";
