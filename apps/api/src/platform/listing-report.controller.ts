import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { z } from "zod";

import {
  listingReportsSchema,
  reviewListingReportSchema
} from "@commerce/contracts";

import { PgListingReportRepository } from "../persistence/pg-listing-report.repository.js";
import { OriginValidator } from "../security/origin.guard.js";
import { PrincipalResolver } from "../security/principal-resolver.js";

/**
 * How many reports one page of the queue carries.
 *
 * A fixed number rather than a request parameter, like every other Admin list
 * here: the queue is work to be done, and a caller choosing its size would be
 * choosing how much of it to see.
 */
const QUEUE_PAGE = 100;

/**
 * The queue of reader reports (I69).
 *
 * **Reading and closing, and nothing else.** There is no route here that hides
 * an Offering, restricts a Business or writes to a listing — the same
 * separation the Moderation Case controller keeps, and for the same reason. A
 * report says somebody claims something is wrong; acting on that claim happens
 * through the Stories that own the consequences, and an Admin who accepts a
 * report is recording a judgement rather than performing one.
 */
@Controller("admin/listing-reports")
export class ListingReportController {
  constructor(
    private readonly reports: PgListingReportRepository,
    private readonly principals: PrincipalResolver,
    private readonly origins: OriginValidator
  ) {}

  /// Open by default, because the queue exists to be emptied. The closed
  /// statuses are readable so that "we looked at this and dismissed it" is
  /// answerable when the same listing is reported again.
  @Get()
  async list(@Query("status") status: unknown, @Req() request: FastifyRequest) {
    await this.principals.resolveAdmin(request);
    const parsed = z
      .enum(["OPEN", "ACCEPTED", "DISMISSED"])
      .nullish()
      .safeParse(status);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: { status: ["Expected OPEN, ACCEPTED or DISMISSED"] },
        message: "Invalid report status"
      });
    return listingReportsSchema.parse(
      await this.reports.list(parsed.data ?? "OPEN", QUEUE_PAGE)
    );
  }

  /**
   * Closing one report.
   *
   * A report already closed answers `409` rather than being closed again: two
   * Admins reaching the same row is the ordinary race on a shared queue, and
   * the second one is told somebody got there first instead of silently
   * overwriting a colleague's decision and its timestamp.
   */
  @Post(":reportId/review")
  @HttpCode(200)
  async review(
    @Param("reportId", new ParseUUIDPipe({ errorHttpStatusCode: 400 }))
    reportId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolveAdmin(request);
    const parsed = reviewListingReportSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "A review is ACCEPTED or DISMISSED"
      });

    const closed = await this.reports.review({
      outcome: parsed.data.outcome,
      reportId,
      reviewerId: principal.userId
    });
    if (!closed)
      throw new ConflictException({
        code: "REPORT_ALREADY_REVIEWED",
        message: "That report has already been reviewed"
      });
    return { reviewed: true };
  }
}
