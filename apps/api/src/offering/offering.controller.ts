import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { z } from "zod";

import {
  createDraftOfferingSchema,
  offeringInventorySchema,
  type OfferingInventory
} from "@commerce/contracts";

import { PrincipalResolver } from "../security/principal-resolver.js";
import { OfferingService } from "./offering.service.js";

/**
 * Path identifiers reach PostgreSQL `uuid` columns, so they are rejected at the
 * edge. Letting the driver reject them would turn a malformed request into a
 * server error.
 */
const uuidParam = (name: string) =>
  new ParseUUIDPipe({
    exceptionFactory: () =>
      new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: { [name]: ["Expected a UUID"] },
        message: `Invalid ${name}`
      })
  });

@Controller("businesses/:businessId/offerings")
export class OfferingController {
  constructor(
    private readonly offerings: OfferingService,
    private readonly principals: PrincipalResolver
  ) {}

  @Post()
  async create(
    @Param("businessId", uuidParam("businessId")) businessId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    const parsed = createDraftOfferingSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "Invalid offering input"
      });
    return await this.offerings.create(
      businessId,
      parsed.data,
      await this.principals.resolve(request)
    );
  }

  /**
   * The owning Business management inventory (`US-OFR-F01-001` AC-5). A newly
   * created Draft is reachable here without its owner having kept hold of the
   * identifier the creation response returned.
   */
  @Get()
  async inventory(
    @Param("businessId", uuidParam("businessId")) businessId: string,
    @Req() request: FastifyRequest
  ): Promise<OfferingInventory> {
    return offeringInventorySchema.parse({
      offerings: await this.offerings.inventory(
        businessId,
        await this.principals.resolve(request)
      )
    });
  }

  @Get(":offeringId")
  async get(
    @Param("businessId", uuidParam("businessId")) businessId: string,
    @Param("offeringId", uuidParam("offeringId")) offeringId: string,
    @Req() request: FastifyRequest
  ) {
    return await this.offerings.get(
      businessId,
      offeringId,
      await this.principals.resolve(request)
    );
  }
}
