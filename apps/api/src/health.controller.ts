import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";

import { type HealthResponse, healthResponseSchema } from "@commerce/contracts";

import { PgCommerceRepository } from "./persistence/pg-commerce.repository.js";

@Controller("health")
export class HealthController {
  constructor(private readonly repository: PgCommerceRepository) {}

  /** Liveness answers whether the process itself is running. */
  @Get("live")
  live(): HealthResponse {
    return healthResponseSchema.parse({ service: "api", status: "ok" });
  }

  /**
   * Readiness answers whether the process can actually serve traffic. It must
   * fail closed when PostgreSQL is unreachable, otherwise an orchestrator keeps
   * routing requests that cannot succeed.
   */
  @Get("ready")
  async ready(): Promise<HealthResponse> {
    if (!(await this.repository.isDatabaseReachable()))
      throw new ServiceUnavailableException({
        code: "DEPENDENCY_UNAVAILABLE",
        message: "Database is not reachable"
      });
    return healthResponseSchema.parse({ service: "api", status: "ok" });
  }
}
