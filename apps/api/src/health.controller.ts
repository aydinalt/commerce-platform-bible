import { Controller, Get } from "@nestjs/common";

import { type HealthResponse, healthResponseSchema } from "@commerce/contracts";

@Controller("health")
export class HealthController {
  @Get("live")
  live(): HealthResponse {
    return healthResponseSchema.parse({
      service: "api",
      status: "ok"
    });
  }

  @Get("ready")
  ready(): HealthResponse {
    return healthResponseSchema.parse({
      service: "api",
      status: "ok"
    });
  }
}
