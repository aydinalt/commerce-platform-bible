import { ServiceUnavailableException } from "@nestjs/common";
import { afterAll, describe, expect, it } from "vitest";

import { HealthController } from "../apps/api/src/health.controller.js";
import { PgCommerceRepository } from "../apps/api/src/persistence/pg-commerce.repository.js";

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

suite("Milestone 11 health probes", () => {
  const repository = new PgCommerceRepository();
  const controller = new HealthController(repository);

  afterAll(async () => {
    await repository.onModuleDestroy();
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
    const closed = new PgCommerceRepository();
    await closed.onModuleDestroy();

    await expect(new HealthController(closed).ready()).rejects.toBeInstanceOf(
      ServiceUnavailableException
    );
  });
});
