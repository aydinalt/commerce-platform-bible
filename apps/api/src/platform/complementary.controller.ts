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
  Req
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { z } from "zod";

import {
  adminComplementaryPlacementsSchema,
  createComplementaryPlacementSchema
} from "@commerce/contracts";

import { PgComplementaryRepository } from "../persistence/pg-complementary.repository.js";
import { OriginValidator } from "../security/origin.guard.js";
import { PrincipalResolver } from "../security/principal-resolver.js";

/**
 * Where advertising may appear, as rows somebody wrote (I70).
 *
 * PRD-0006 §20 gives the platform two things and only two: **where**
 * advertising may appear and **whether** it appears. This is both, for the
 * complementary-product region — an Admin writes what a listing suggests and
 * switches it off when the arrangement ends.
 *
 * There is no route here that reports an impression, a click, revenue or fill
 * rate, and there is nothing to add one to: §20.5 excludes all four, and the
 * absence is the boundary rather than an omission.
 */
@Controller("admin/complementary-placements")
export class ComplementaryPlacementController {
  constructor(
    private readonly placements: PgComplementaryRepository,
    private readonly principals: PrincipalResolver,
    private readonly origins: OriginValidator
  ) {}

  @Get()
  async list(@Req() request: FastifyRequest) {
    await this.principals.resolveAdmin(request);
    return adminComplementaryPlacementsSchema.parse({
      placements: await this.placements.list()
    });
  }

  /**
   * Writing one placement, or correcting the one that is already there.
   *
   * A repeated Category and label is a correction rather than a second
   * suggestion: an Admin fixing a wrong address is fixing that address, and two
   * rows reading "Kış lastiği" under one heading is one mistake made twice.
   */
  @Post()
  @HttpCode(201)
  async create(@Body() body: unknown, @Req() request: FastifyRequest) {
    this.origins.assertAcceptable(request, true);
    await this.principals.resolveAdmin(request);

    const parsed = createComplementaryPlacementSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message:
          "A placement needs a Category, a label, a partner and an address"
      });

    const written = await this.placements.create(parsed.data);
    if (!written)
      throw new NotFoundException({
        code: "CATEGORY_NOT_FOUND",
        message: "No active Category matches that identifier"
      });
    return { created: true };
  }

  /**
   * Switching one off.
   *
   * Deactivated rather than deleted: a placement is a partner relationship
   * somebody agreed to, and a row that can come back is how "we paused this" is
   * said. A placement already off answers `404` — there is nothing to switch.
   */
  @Delete(":placementId")
  @HttpCode(200)
  async deactivate(
    @Param("placementId", new ParseUUIDPipe({ errorHttpStatusCode: 400 }))
    placementId: string,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    await this.principals.resolveAdmin(request);
    const done = await this.placements.deactivate(placementId);
    if (!done)
      throw new NotFoundException({
        code: "PLACEMENT_NOT_FOUND",
        message: "No active placement matches that identifier"
      });
    return { deactivated: true };
  }
}
