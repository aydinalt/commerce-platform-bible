import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { createDraftOfferingSchema } from "@commerce/contracts";

import { PrincipalResolver } from "../security/principal-resolver.js";
import { OfferingService } from "./offering.service.js";

@Controller("businesses/:businessId/offerings")
export class OfferingController {
  constructor(
    private readonly offerings: OfferingService,
    private readonly principals: PrincipalResolver
  ) {}

  @Post()
  create(
    @Param("businessId") businessId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    const parsed = createDraftOfferingSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException("Invalid offering input");
    return this.offerings.create(
      businessId,
      parsed.data,
      this.principals.resolve(request)
    );
  }

  @Get(":offeringId")
  get(
    @Param("businessId") businessId: string,
    @Param("offeringId") offeringId: string,
    @Req() request: FastifyRequest
  ) {
    return this.offerings.get(
      businessId,
      offeringId,
      this.principals.resolve(request)
    );
  }
}
