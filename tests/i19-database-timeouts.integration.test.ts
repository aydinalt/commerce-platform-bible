import { randomUUID } from "node:crypto";

import { HttpStatus } from "@nestjs/common";
import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ErrorEnvelopeFilter } from "../apps/api/src/http/error-envelope.filter.js";
import {
  createDatabasePool,
  databaseTimeouts,
  DEFAULT_CONNECTION_TIMEOUT_MS,
  DEFAULT_IDLE_TRANSACTION_TIMEOUT_MS,
  DEFAULT_STATEMENT_TIMEOUT_MS
} from "../packages/database/src/index.js";
import { errorEnvelopeSchema } from "../packages/contracts/src/index.js";

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

/**
 * The database dependency's timeout behaviour.
 *
 * Engineering Constitution §13 requires every production component to define
 * behaviour for timeout, and this one had none: a query that hung held its
 * connection until PostgreSQL or TCP gave up. I18 sharpened that in the act of
 * fixing something else — with one shared pool, ten hung queries are the whole
 * process rather than one repository's corner, and I18's own closure recorded
 * the gap.
 *
 * These cases drive real hangs against a real database rather than asserting
 * that a number was passed somewhere. A timeout that is configured and does not
 * fire is worse than none, because it is believed.
 */
suite("Increment I19 database timeouts", () => {
  const budget = 400;
  /**
   * Where the pool reports a connection that died while idle.
   *
   * The idle-transaction case below makes PostgreSQL end a session while the
   * client is checked out, and `pg` emits that on the **client** — the pool
   * never sees it. Collecting it here is not tidiness: an emitter with no
   * `error` listener throws, so without this the suite would take the whole
   * process down, which is exactly what the API would have done in production.
   */
  const lost: Error[] = [];
  let pool: Pool;
  let previous: Record<string, string | undefined>;

  beforeAll(() => {
    /*
     * Short budgets, so a case that fails to time out fails fast rather than
     * holding the suite for five seconds. The values under test are the
     * defaults, which the last case asserts separately — what these prove is
     * that whatever is configured is actually applied.
     */
    previous = {
      connection: process.env.DATABASE_CONNECTION_TIMEOUT_MS,
      idle: process.env.DATABASE_IDLE_TRANSACTION_TIMEOUT_MS,
      max: process.env.DATABASE_POOL_MAX,
      statement: process.env.DATABASE_STATEMENT_TIMEOUT_MS
    };
    process.env.DATABASE_STATEMENT_TIMEOUT_MS = String(budget);
    process.env.DATABASE_IDLE_TRANSACTION_TIMEOUT_MS = String(budget);
    process.env.DATABASE_CONNECTION_TIMEOUT_MS = String(budget);
    process.env.DATABASE_POOL_MAX = "1";
    pool = createDatabasePool((error) => lost.push(error));
  });

  afterAll(async () => {
    await pool.end();
    for (const [key, name] of [
      ["connection", "DATABASE_CONNECTION_TIMEOUT_MS"],
      ["idle", "DATABASE_IDLE_TRANSACTION_TIMEOUT_MS"],
      ["max", "DATABASE_POOL_MAX"],
      ["statement", "DATABASE_STATEMENT_TIMEOUT_MS"]
    ] as const) {
      const value = previous[key];
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  it("cancels a statement that runs past its budget", async () => {
    const started = Date.now();
    // `pg_sleep` is the one query guaranteed to outrun any budget, so this
    // measures the timeout rather than the speed of the machine.
    const failure = await pool
      .query("select pg_sleep(10)")
      .then(() => null)
      .catch((error: unknown) => error);

    // Named by SQLSTATE rather than by message: `57014` is `query_canceled`,
    // which is what `statement_timeout` raises and nothing else here does.
    expect((failure as { code?: string } | null)?.code).toBe("57014");
    // And it actually cut in — a case that only checked the error code would
    // pass just as well against a ten-second wait.
    expect(Date.now() - started).toBeLessThan(5_000);
  });

  it("ends a transaction left open and holding its locks", async () => {
    const client = await pool.connect();
    try {
      await client.query("begin");
      // A statement timeout does not cover this: `begin` followed by nothing is
      // not a running statement, so without its own setting this connection —
      // and every lock it holds — would be held until the client came back.
      await new Promise((resolve) => setTimeout(resolve, budget * 3));

      const failure = await client
        .query("select 1")
        .then(() => null)
        .catch((error: unknown) => error);
      expect(failure).not.toBeNull();
    } finally {
      client.release();
    }

    /*
     * And the half that keeps the process alive.
     *
     * Node throws for an `error` event nobody listens to, so a factory that set
     * this timeout without attaching a listener would have made the API crash
     * on the very condition the timeout exists to survive.
     *
     * This case exercises the **client** listener specifically: the connection
     * dies while checked out, and `pg` does not emit on the pool at all in that
     * situation. The first implementation listened only on the pool and this is
     * what caught it. Waited for, because the server ends the session on its own
     * schedule rather than on this one's.
     */
    await new Promise((resolve) => setTimeout(resolve, budget * 2));
    expect(lost.length).toBeGreaterThan(0);
  });

  it("refuses rather than hanging when no connection is free", async () => {
    // The pool holds one, and this takes it.
    const held = await pool.connect();
    try {
      const started = Date.now();
      const failure = await pool
        .connect()
        .then(() => null)
        .catch((error: unknown) => error);

      /*
       * `pg` defaults to waiting for ever. On a saturated pool that is a request
       * hanging silently until the client gives up — the failure that looks like
       * an outage and names nothing.
       */
      expect(failure).not.toBeNull();
      expect(Date.now() - started).toBeLessThan(5_000);
    } finally {
      held.release();
    }
  });

  it("answers a timeout as the published dependency failure, not as a defect", () => {
    const filter = new ErrorEnvelopeFilter();
    const sent: { body?: unknown; status?: number } = {};
    const reply = {
      send: (body: unknown) => {
        sent.body = body;
        return reply;
      },
      status: (code: number) => {
        sent.status = code;
        return reply;
      }
    };
    const host = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { "x-correlation-id": randomUUID() },
          log: { error: () => undefined, warn: () => undefined }
        }),
        getResponse: () => reply
      })
    };

    filter.catch(
      Object.assign(new Error("canceling statement due to statement timeout"), {
        code: "57014"
      }),
      host as never
    );

    /*
     * The point of the case. A cancelled statement is the system doing what it
     * was told, and `INTERNAL_ERROR` would tell a client the opposite — that
     * this is a defect and retrying is pointless.
     *
     * `DEPENDENCY_UNAVAILABLE` is the code already published for `503`, so
     * saying it here adds nothing to the contract that was not there before.
     */
    expect(sent.status).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    expect(errorEnvelopeSchema.parse(sent.body).code).toBe(
      "DEPENDENCY_UNAVAILABLE"
    );
  });

  it("still calls an ordinary failure a defect", () => {
    const filter = new ErrorEnvelopeFilter();
    const sent: { body?: unknown; status?: number } = {};
    const reply = {
      send: (body: unknown) => {
        sent.body = body;
        return reply;
      },
      status: (code: number) => {
        sent.status = code;
        return reply;
      }
    };
    const host = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
          log: { error: () => undefined, warn: () => undefined }
        }),
        getResponse: () => reply
      })
    };

    // The other half, and the one that keeps the case above honest: a filter
    // that called everything a dependency timeout would pass the previous test
    // and hide every real defect behind a 503.
    filter.catch(new Error("something genuinely broke"), host as never);

    expect(sent.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(errorEnvelopeSchema.parse(sent.body).code).toBe("INTERNAL_ERROR");
  });

  it("states the budgets the deployment runs with", () => {
    // Asserted against the exported defaults rather than against literals, so
    // this reads as "the Owner's numbers are what ship" rather than pinning a
    // second copy of them here.
    const defaults = databaseTimeouts({});
    expect(defaults.statementTimeoutMs).toBe(DEFAULT_STATEMENT_TIMEOUT_MS);
    expect(defaults.idleTransactionTimeoutMs).toBe(
      DEFAULT_IDLE_TRANSACTION_TIMEOUT_MS
    );
    expect(defaults.connectionTimeoutMillis).toBe(
      DEFAULT_CONNECTION_TIMEOUT_MS
    );
    // The Owner's decision of 2026-08-18, written once so a silent change to
    // either constant has to be a deliberate one.
    expect(DEFAULT_STATEMENT_TIMEOUT_MS).toBe(5_000);
    expect(DEFAULT_CONNECTION_TIMEOUT_MS).toBe(2_000);

    // A malformed setting takes the default rather than the process.
    for (const bad of ["", "0", "-1", "soon", "1.5"])
      expect(
        databaseTimeouts({ DATABASE_STATEMENT_TIMEOUT_MS: bad })
          .statementTimeoutMs
      ).toBe(DEFAULT_STATEMENT_TIMEOUT_MS);
    expect(
      databaseTimeouts({ DATABASE_STATEMENT_TIMEOUT_MS: "250" })
        .statementTimeoutMs
    ).toBe(250);
  });
});
