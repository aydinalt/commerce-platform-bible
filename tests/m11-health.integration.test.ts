import { ServiceUnavailableException } from "@nestjs/common";
import { Pool } from "pg";
import { afterAll, describe, expect, it } from "vitest";

import { HealthController } from "../apps/api/src/health.controller.js";
import { PgCommerceRepository } from "../apps/api/src/persistence/pg-commerce.repository.js";

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

suite("Milestone 11 health probes", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const repository = new PgCommerceRepository(pool);
  const controller = new HealthController(repository);

  afterAll(async () => {
    await pool.end();
  });

  it("reports liveness without touching any dependency", () => {
    expect(controller.live()).toEqual({ service: "api", status: "ok" });
  });

  it("reports readiness once PostgreSQL answers", async () => {
    await expect(controller.ready()).resolves.toEqual({
      service: "api",
      status: "ok"
    });
  });

  it("fails closed when the database is unreachable", async () => {
    /*
     * A pool that is closed before anything asks it for a connection, which is
     * as close to an unreachable database as a test can get without one.
     *
     * It has to be a *second* pool now. Every repository used to build its own,
     * so this case could make one and close it; the process shares one pool, and
     * closing that would take the two cases above with it. Handing the pool in
     * is what keeps the substitution possible at all — an ambient singleton
     * would have left this case with nothing to close.
     */
    const unreachable = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    await unreachable.end();

    const probe = new HealthController(new PgCommerceRepository(unreachable));
    await expect(probe.ready()).rejects.toBeInstanceOf(
      ServiceUnavailableException
    );
  });
});
