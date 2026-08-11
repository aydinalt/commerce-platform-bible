import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { z } from "zod";

import { ACTIONABLE_QUEUES, ANALYTICS_PERIODS } from "@commerce/analytics";
import { analyticsSchema } from "@commerce/contracts";

import { PgAnalyticsRepository } from "../persistence/pg-analytics.repository.js";
import { PrincipalResolver } from "../security/principal-resolver.js";

/**
 * Basic Analytics (`US-PLT-F10-001`).
 *
 * One `GET` and nothing else in this controller. AC-17 forbids any moderation
 * or management action happening automatically, and the way to guarantee that
 * of a dashboard is for the dashboard to have no verb — reading it cannot do
 * anything, because there is nothing here that could.
 *
 * AC-15's actionable indicators are addresses rather than buttons. The
 * response says where the workload queue and the Open cases live; going there
 * is navigation, and whatever is done on arrival is done by the Story that
 * owns it, under its own gates.
 */
@Controller("admin/analytics")
export class AnalyticsController {
  constructor(
    private readonly analytics: PgAnalyticsRepository,
    private readonly principals: PrincipalResolver
  ) {}

  @Get()
  async snapshot(
    @Query("period") period: unknown,
    @Req() request: FastifyRequest
  ) {
    // AC-1. The ordinary Admin gate: an Enabled account with a live
    // authorization that has entered the context.
    await this.principals.resolveAdmin(request);

    // AC-2. Four periods and no custom range. A date picker would be the first
    // step towards the report builder AC-18 excludes.
    const parsed = z.enum(ANALYTICS_PERIODS).nullish().safeParse(period);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: {
          period: [`Expected one of ${ANALYTICS_PERIODS.join(", ")}`]
        },
        message: "Invalid analytics period"
      });
    const selected = parsed.data ?? "LAST_7_DAYS";

    return analyticsSchema.parse({
      actionable: ACTIONABLE_QUEUES,
      ...(await this.analytics.snapshot(selected)),
      period: selected
    });
  }
}
