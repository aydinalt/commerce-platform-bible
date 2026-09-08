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
  Put,
  Req
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { z } from "zod";

import {
  advertisingSettingsSchema,
  excludeCategoryFromAdvertisingSchema,
  updateAdvertisingSettingsSchema
} from "@commerce/contracts";

import { PgAdvertisingRepository } from "../persistence/pg-advertising.repository.js";
import { OriginValidator } from "../security/origin.guard.js";
import { PrincipalResolver } from "../security/principal-resolver.js";

/**
 * Whether advertising runs, and where it may not (I75).
 *
 * PRD-0006 §20 gives the platform two powers over advertising. I70 built the
 * first one for a single region — **where** — as rows an Admin writes. This is
 * the second: **whether**, as one switch that covers every region including the
 * platform's own, plus the Categories §20.4 keeps clear of all of them.
 *
 * There is no route here that reports an impression, a click, revenue or fill
 * rate, and no state a route like that could read: §20.5 excludes all four.
 *
 * **This is not a settings area.** §12 refuses a standalone generic Platform
 * Configuration capability, and the difference is that every field this
 * controller accepts is named in a document and in a migration. Nothing here
 * accepts a key.
 */
@Controller("admin/advertising")
export class AdvertisingController {
  constructor(
    private readonly advertising: PgAdvertisingRepository,
    private readonly principals: PrincipalResolver,
    private readonly origins: OriginValidator
  ) {}

  @Get()
  async read(@Req() request: FastifyRequest) {
    await this.principals.resolveAdmin(request);
    return advertisingSettingsSchema.parse(await this.advertising.read());
  }

  /**
   * Writing all of them at once.
   *
   * `PUT` because this replaces a state rather than adding to one, and the
   * whole form travels: a partial write is how a kill switch ends up back on
   * because somebody submitted the field beside it.
   */
  @Put()
  @HttpCode(200)
  async update(@Body() body: unknown, @Req() request: FastifyRequest) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolveAdmin(request);

    const parsed = updateAdvertisingSettingsSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "Advertising settings need a switch and identifiers or blanks"
      });

    await this.advertising.update(parsed.data, principal.userId);
    return advertisingSettingsSchema.parse(await this.advertising.read());
  }

  /** Marking one Category — and everything under it — ad-free (§20.4). */
  @Post("exclusions")
  @HttpCode(201)
  async exclude(@Body() body: unknown, @Req() request: FastifyRequest) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolveAdmin(request);

    const parsed = excludeCategoryFromAdvertisingSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "An exclusion needs a Category identifier"
      });

    const written = await this.advertising.exclude(
      parsed.data.categoryId,
      principal.userId
    );
    if (!written)
      throw new NotFoundException({
        code: "CATEGORY_NOT_FOUND",
        message: "No active Category matches that identifier"
      });
    return { excluded: true };
  }

  /** Letting advertising back in. */
  @Delete("exclusions/:categoryId")
  @HttpCode(200)
  async include(
    @Param("categoryId", new ParseUUIDPipe({ errorHttpStatusCode: 400 }))
    categoryId: string,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    await this.principals.resolveAdmin(request);
    const done = await this.advertising.include(categoryId);
    if (!done)
      throw new NotFoundException({
        code: "EXCLUSION_NOT_FOUND",
        message: "No exclusion matches that Category"
      });
    return { included: true };
  }
}
