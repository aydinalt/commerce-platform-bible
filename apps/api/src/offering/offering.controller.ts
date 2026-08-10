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
  affiliateDestinationSchema,
  authorAffiliateDestinationSchema,
  createDraftOfferingSchema,
  editOfferingSchema,
  offeringContentSchema,
  offeringInventorySchema,
  type OfferingInventory
} from "@commerce/contracts";

import { OriginValidator } from "../security/origin.guard.js";
import { PrincipalResolver } from "../security/principal-resolver.js";
import { AffiliateService } from "./affiliate.service.js";
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

  /**
   * Owner retirement (`US-OFR-F03-001`). Its own sub-resource rather than a
   * `DELETE`, and rather than a lifecycle field on the edit: retirement is not
   * deletion, and it is the one transition an owner may make.
   */
  @Post(":offeringId/retirement")
  @HttpCode(200)
  async retire(
    @Param("businessId", uuidParam("businessId")) businessId: string,
    @Param("offeringId", uuidParam("offeringId")) offeringId: string,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    return offeringContentSchema.parse(
      await this.content.retire(
        businessId,
        offeringId,
        await this.principals.resolve(request)
      )
    );
  }
}

/**
 * Affiliate Destination configuration (`US-OFR-F06-001`).
 *
 * Its own controller because PRD-0001 §9.1 makes the destination a distinct
 * associated object: authoring it is neither Offering creation nor Offering
 * editing, and folding it into either would say otherwise.
 *
 * There is no Review, Validate, Enable or Disable route here. AC-8 denies those
 * to the Business owner, and PRD-0006 owns the surface that will offer them.
 */
@Controller(
  "businesses/:businessId/offerings/:offeringId/affiliate-destination"
)
export class AffiliateDestinationController {
  constructor(
    private readonly destinations: AffiliateService,
    private readonly origins: OriginValidator,
    private readonly principals: PrincipalResolver
  ) {}

  /// AC-6, and AC-7's other half: an Archived destination stays readable.
  @Get()
  async get(
    @Param("businessId", uuidParam("businessId")) businessId: string,
    @Param("offeringId", uuidParam("offeringId")) offeringId: string,
    @Req() request: FastifyRequest
  ) {
    return affiliateDestinationSchema.parse(
      await this.destinations.get(
        businessId,
        offeringId,
        await this.principals.resolve(request)
      )
    );
  }

  @Post()
  @HttpCode(201)
  async create(
    @Param("businessId", uuidParam("businessId")) businessId: string,
    @Param("offeringId", uuidParam("offeringId")) offeringId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolve(request);
    return affiliateDestinationSchema.parse(
      await this.destinations.create(
        businessId,
        offeringId,
        this.parse(body),
        principal
      )
    );
  }

  /// AC-4 and AC-5. Saving a reference returns the destination to Draft, Not
  /// Validated and Ineligible, whatever it was before.
  @Put()
  async edit(
    @Param("businessId", uuidParam("businessId")) businessId: string,
    @Param("offeringId", uuidParam("offeringId")) offeringId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolve(request);
    return affiliateDestinationSchema.parse(
      await this.destinations.edit(
        businessId,
        offeringId,
        this.parse(body),
        principal
      )
    );
  }

  private parse(body: unknown) {
    const parsed = authorAffiliateDestinationSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "Invalid Affiliate Destination"
      });
    return parsed.data;
  }
}

/**
 * The Admin's historical read (`US-OFR-F03-001` AC-6).
 *
 * It sits on its own route rather than beside the owner's because it answers a
 * different question: the owner asks about an Offering of theirs, an Admin asks
 * about an Offering. There is deliberately nothing here but a read — AC-9
 * denies Admin-initiated archiving, and the surest way to deny it is to offer
 * no route that could perform it.
 */
@Controller("admin/offerings")
export class AdminOfferingController {
  constructor(
    private readonly content: OfferingContentService,
    private readonly principals: PrincipalResolver
  ) {}

  @Get(":offeringId")
  async get(
    @Param("offeringId", uuidParam("offeringId")) offeringId: string,
    @Req() request: FastifyRequest
  ) {
    await this.principals.resolveAdmin(request);
    return offeringContentSchema.parse(await this.content.forAdmin(offeringId));
  }
}
