import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { z } from "zod";

import {
  createDraftOfferingSchema,
  editOfferingSchema,
  offeringContentSchema,
  offeringInventorySchema,
  type OfferingInventory
} from "@commerce/contracts";

import { OriginValidator } from "../security/origin.guard.js";
import { PrincipalResolver } from "../security/principal-resolver.js";
import { OfferingContentService } from "./offering-content.service.js";
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
    private readonly content: OfferingContentService,
    private readonly origins: OriginValidator,
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

  /**
   * The Offering's complete content, Attribute values included
   * (`US-OFR-F02-001` AC-1). Every lifecycle state is readable — an Archived
   * Offering may not be edited, but it is still there to look at.
   */
  @Get(":offeringId/content")
  async readContent(
    @Param("businessId", uuidParam("businessId")) businessId: string,
    @Param("offeringId", uuidParam("offeringId")) offeringId: string,
    @Req() request: FastifyRequest
  ) {
    return offeringContentSchema.parse(
      await this.content.get(
        businessId,
        offeringId,
        await this.principals.resolve(request)
      )
    );
  }

  /**
   * Replaces the Offering's content. An Attribute left out is one the Offering
   * no longer has a value for, matching the Business Information edit.
   *
   * There is no lifecycle field in the body and none in this route: AC-10 says
   * a saved edit creates, publishes, retires, hides, restores, validates,
   * enables and disables nothing, and the surest way to keep that promise is to
   * give the request no way to ask for any of it.
   */
  @Put(":offeringId/content")
  async editContent(
    @Param("businessId", uuidParam("businessId")) businessId: string,
    @Param("offeringId", uuidParam("offeringId")) offeringId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolve(request);

    const parsed = editOfferingSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "Invalid Offering content"
      });

    return offeringContentSchema.parse(
      await this.content.edit(businessId, offeringId, parsed.data, principal)
    );
  }
}
