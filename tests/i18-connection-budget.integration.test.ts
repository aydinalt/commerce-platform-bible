import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  createDatabasePool,
  DEFAULT_POOL_MAX,
  poolMax
} from "../packages/database/src/index.js";

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

const ORIGIN = "http://localhost:3000";

/**
 * How many connections one process may hold.
 *
 * Every repository used to build its own `Pool`. There were fifteen of them in
 * the API, `pg` defaults `max` to ten, so a single instance could open a hundred
 * and fifty connections — against a PostgreSQL whose own default
 * `max_connections` is a hundred. The API could exhaust a default-configured
 * database on its own, a second instance was arithmetically impossible, and the
 * fifteen pools could not lend each other anything: fourteen sat idle while the
 * fifteenth queued.
 *
 * The number is asserted against `pg_stat_activity`, which is the only place
 * that can answer it — counting `new Pool(` in the source would prove that the
 * code says ten, not that the process opens ten.
 */
suite("Increment I18 connection budget", () => {
  const observer = new Pool({ connectionString: process.env.DATABASE_URL });
  let app: NestFastifyApplication;
  let applicationName: string;

  /**
   * Connections are attributed by `application_name`, which the app sets from
   * its connection string. Each suite gets its own so this counts the
   * application's connections and not the ones every other suite holds against
   * the same database.
   */
  const held = async (): Promise<number> => {
    const rows = await observer.query<{ total: number }>(
      `select count(*)::int as total from pg_stat_activity
       where application_name = $1`,
      [applicationName]
    );
    return rows.rows[0]?.total ?? 0;
  };

  beforeAll(async () => {
    applicationName = `budget-${randomUUID()}`;
    process.env.DATABASE_URL = `${process.env.DATABASE_URL ?? ""}${
      (process.env.DATABASE_URL ?? "").includes("?") ? "&" : "?"
    }application_name=${applicationName}`;

    const { createApiApp } = await import("../apps/api/src/bootstrap.js");
    app = await createApiApp({ logLevel: "fatal" });
  });

  afterAll(async () => {
    await app.close();
    await observer.end();
  });

  it("holds no more connections than one pool allows, however many repositories ask", async () => {
    /*
     * Three routes, not one, and that is the whole design of the case.
     *
     * Driving a single route only ever saturates the pools that route uses, so
     * against fifteen per-repository pools it would still report ten and this
     * case would pass while proving nothing — which it did, the first time it
     * was written, and is why it is written this way now.
     *
     * These three are served by different repositories: Discovery, public
     * Offering presentation, and the readiness probe's own. One pool holds ten
     * across all of them; a pool each would have held up to ten apiece.
     */
    const routes = [
      "/api/v1/discovery/browse",
      "/api/v1/offerings/nothing-by-this-slug",
      "/api/v1/health/ready"
    ];
    await Promise.all(
      Array.from({ length: 60 }, (_, index) =>
        app.inject({
          headers: { origin: ORIGIN },
          method: "GET",
          url: routes[index % routes.length] ?? routes[0]!
        })
      )
    );

    const count = await held();

    /*
     * The lower bound first, and it is not ceremony.
     *
     * A ceiling assertion passes for free against zero, and zero is exactly
     * what this would report if `application_name` stopped reaching the server
     * or the route stopped touching the database. Then the case would go on
     * passing while measuring nothing — which is the failure mode a test like
     * this one is most likely to have.
     */
    expect(count).toBeGreaterThan(1);

    /*
     * And the whole increment in one number.
     *
     * Before the change this was bounded by fifteen pools times ten. The only
     * reason it never reached a hundred and fifty in practice is that one
     * request touches only a few repositories — the ceiling was still there,
     * and a busy process would have found it.
     */
    expect(count).toBeLessThanOrEqual(poolMax());
  });

  it("stays inside the budget the deployment sets rather than one this file invents", () => {
    // Asserted against `poolMax()` rather than against ten. The number is a
    // property of the deployment — instances times max must stay under
    // `max_connections` — so a test that pinned ten would fail the first time
    // an operator set the variable it exists to be set by.
    expect(poolMax()).toBe(DEFAULT_POOL_MAX);
    expect(poolMax("25")).toBe(25);

    // A malformed setting takes the default rather than the process: `Number("")`
    // is 0, and a pool of zero accepts no queries at all.
    for (const bad of ["", "0", "-4", "ten", "3.5", undefined])
      expect(poolMax(bad)).toBe(DEFAULT_POOL_MAX);
  });

  it("builds a pool that carries the stated ceiling", async () => {
    /*
     * Set to something that is not the default, deliberately.
     *
     * `pg` would apply ten of its own accord, so a factory that forgot `max`
     * entirely would still satisfy an assertion made against the default. Seven
     * is a number only this code can produce.
     */
    const previous = process.env.DATABASE_POOL_MAX;
    process.env.DATABASE_POOL_MAX = "7";
    const pool = createDatabasePool();
    try {
      expect(pool.options.max).toBe(7);
    } finally {
      await pool.end();
      if (previous === undefined) delete process.env.DATABASE_POOL_MAX;
      else process.env.DATABASE_POOL_MAX = previous;
    }
  });
});
