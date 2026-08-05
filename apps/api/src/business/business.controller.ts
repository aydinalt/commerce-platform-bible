import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { z } from "zod";

import {
  createBusinessSchema,
  ownedBusinessSchema,
  ownedBusinessesSchema,
  type OwnedBusinesses
} from "@commerce/contracts";

import { OriginValidator } from "../security/origin.guard.js";
import { PrincipalResolver } from "../security/principal-resolver.js";
import { BusinessService } from "./business.service.js";

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
}
