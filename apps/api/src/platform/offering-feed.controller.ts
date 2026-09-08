import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { z } from "zod";

import {
  adminOfferingFeedsSchema,
  createOfferingFeedSchema,
  offeringFeedRunsSchema
} from "@commerce/contracts";

import { PgOfferingFeedRepository } from "../persistence/pg-offering-feed.repository.js";
import { OriginValidator } from "../security/origin.guard.js";
import { PrincipalResolver } from "../security/principal-resolver.js";

/**
 * How many runs the log shows at once.
 *
 * A number rather than a request parameter, like the review page's. The surface
 * that reads this is an operator asking "what is broken", and the answer to
 * that is the recent past — an archive of every sync since the platform started
 * is a different question nobody has asked.
 */
const RUN_PAGE = 50;

/**
 * The partner catalogues, and how they last went (I76).
 *
 * The Owner asked for two things and this is both: feeds configured here rather
 * than in a deployment, and **their failures visible** — _"Feed senkronizasyon
 * hataları"_ — rather than buried in a log nobody opens.
 *
 * **Nothing here imports anything.** The intake runs on a schedule in the
 * worker, because reading somebody else's document is minutes of work against
 * their server and an Admin request is not the place for it. What this offers
 * is configuration and evidence.
 */
@Controller("admin/offering-feeds")
export class OfferingFeedController {
  constructor(
    private readonly feeds: PgOfferingFeedRepository,
    private readonly principals: PrincipalResolver,
    private readonly origins: OriginValidator
  ) {}

  @Get()
  async list(@Req() request: FastifyRequest) {
    await this.principals.resolveAdmin(request);
    return adminOfferingFeedsSchema.parse({ feeds: await this.feeds.list() });
  }

  /**
   * The run log, newest first.
   *
   * `?outcome=FAILED` is what the dashboard reads. Newest first here and oldest
   * first in the report queue, and the difference is the point: a report queue
   * is work to get through, this is news — what is broken *now* is what an
   * operator can act on.
   */
  @Get("runs")
  async runs(
    @Query("outcome") outcome: string | undefined,
    @Req() request: FastifyRequest
  ) {
    await this.principals.resolveAdmin(request);
    return offeringFeedRunsSchema.parse({
      runs: await this.feeds.runs({
        failuresOnly: outcome === "FAILED",
        limit: RUN_PAGE
      })
    });
  }

  @Post()
  @HttpCode(201)
  async create(@Body() body: unknown, @Req() request: FastifyRequest) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolveAdmin(request);

    const parsed = createOfferingFeedSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message:
          "A feed needs a Business, a Category, an address, and at least an identifier and a title field"
      });

    const written = await this.feeds.create(parsed.data, principal.userId);
    if (written === "BUSINESS_NOT_FOUND")
      throw new NotFoundException({
        code: "BUSINESS_NOT_FOUND",
        message: "No Business matches that identifier"
      });
    if (written === "CATEGORY_NOT_FOUND")
      throw new NotFoundException({
        code: "CATEGORY_NOT_FOUND",
        message: "No active Category matches that identifier"
      });
    return { created: true };
  }

  /**
   * Pausing one feed.
   *
   * The listings it created stay exactly as they are. Pausing is a statement
   * about reading a partner's document, not about withdrawing their four
   * thousand listings — that would be a moderation decision, and §7 owns those.
   */
  @Delete(":feedId")
  @HttpCode(200)
  async deactivate(
    @Param("feedId", new ParseUUIDPipe({ errorHttpStatusCode: 400 }))
    feedId: string,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    await this.principals.resolveAdmin(request);
    const done = await this.feeds.deactivate(feedId);
    if (!done)
      throw new NotFoundException({
        code: "FEED_NOT_FOUND",
        message: "No active feed matches that identifier"
      });
    return { deactivated: true };
  }
}
