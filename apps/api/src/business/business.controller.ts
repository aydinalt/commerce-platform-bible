import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { z } from "zod";

import {
  businessInformationSchema,
  createBusinessSchema,
  ownedBusinessSchema,
  ownedBusinessesSchema,
  updateBusinessInformationSchema,
  type OwnedBusinesses
} from "@commerce/contracts";

import { OriginValidator } from "../security/origin.guard.js";
import { PrincipalResolver } from "../security/principal-resolver.js";
import { BusinessService } from "./business.service.js";

/**
 * Path identifiers reach PostgreSQL `uuid` columns, so they are rejected at the
 * edge rather than in the driver.
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

@Controller("businesses")
export class BusinessController {
  constructor(
    private readonly businesses: BusinessService,
    private readonly principals: PrincipalResolver,
    private readonly origins: OriginValidator
  ) {}

  /**
   * Creates a Business for the acting person. Requires no Admin approval
   * (`US-BUS-F01-001` AC-3) and grants exactly one owner (AC-8).
   */
  @Post()
  @HttpCode(201)
  async create(@Body() body: unknown, @Req() request: FastifyRequest) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolve(request);

    const parsed = createBusinessSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "Invalid Business input"
      });

    return ownedBusinessSchema.parse(
      await this.businesses.create(parsed.data, principal)
    );
  }

  /** Immediately available to its owner for management (AC-6). */
  @Get()
  async listOwned(@Req() request: FastifyRequest): Promise<OwnedBusinesses> {
    const principal = await this.principals.resolve(request);
    return ownedBusinessesSchema.parse({
      businesses: await this.businesses.listOwned(principal)
    });
  }

  /**
   * Every Business Information field for the owner (`US-BUS-F02-001` AC-1).
   * This response carries protected Direct Contact and therefore exists only
   * behind an authenticated owner check — AC-9 keeps it away from Guests.
   */
  @Get(":businessId/information")
  async information(
    @Param("businessId", uuidParam("businessId")) businessId: string,
    @Req() request: FastifyRequest
  ) {
    const principal = await this.principals.resolve(request);
    return businessInformationSchema.parse(
      await this.businesses.information(businessId, principal)
    );
  }

  /**
   * Saves the complete information set (AC-2). `PUT` rather than `PATCH`
   * because AC-4 requires removal to be expressible, and an omitted optional
   * field in a replacement says exactly that.
   */
  @Put(":businessId/information")
  async updateInformation(
    @Param("businessId", uuidParam("businessId")) businessId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolve(request);

    const parsed = updateBusinessInformationSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "Invalid Business Information"
      });

    return businessInformationSchema.parse(
      await this.businesses.updateInformation(
        businessId,
        parsed.data,
        principal
      )
    );
  }
}
