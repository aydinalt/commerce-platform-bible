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
  destinationManagementEntrySchema,
  destinationWorkloadSchema,
  editOfferingSchema,
  editableOfferingContentSchema,
  offeringContentSchema,
  offeringInventorySchema,
  reviewAffiliateDestinationSchema,
  validateAffiliateDestinationSchema,
  type OfferingInventory
} from "@commerce/contracts";

import { PgModerationRepository } from "../persistence/pg-moderation.repository.js";
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
    return editableOfferingContentSchema.parse(
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
   * Draft → Published (`US-OFR-F04-001`). Its own sub-resource, like
   * retirement, and for the same reason: a transition is an action a person
   * takes, not a field they set.
   *
   * There is no matching route back. AC-8 denies Published → Draft and Hidden →
   * Draft, and the way to deny a transition is to offer no way to ask for it.
   */
  @Post(":offeringId/publication")
  @HttpCode(200)
  async publish(
    @Param("businessId", uuidParam("businessId")) businessId: string,
    @Param("offeringId", uuidParam("offeringId")) offeringId: string,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    return offeringContentSchema.parse(
      await this.content.publish(
        businessId,
        offeringId,
        await this.principals.resolve(request)
      )
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

  /**
   * The management entry (`US-BUS-F06-001`).
   *
   * Separate from the read below rather than a relaxation of it. That read
   * answers "what is this Offering's destination", and `US-OFR-F06-001` makes
   * absence a 404 there. This one answers "what may I do about this Offering's
   * destination", where absence is not a failure — it is the condition AC-2
   * offers Create for.
   */
  @Get("management")
  async management(
    @Param("businessId", uuidParam("businessId")) businessId: string,
    @Param("offeringId", uuidParam("offeringId")) offeringId: string,
    @Req() request: FastifyRequest
  ) {
    return destinationManagementEntrySchema.parse(
      await this.destinations.managementEntry(
        businessId,
        offeringId,
        await this.principals.resolve(request)
      )
    );
  }

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
    private readonly cases: PgModerationRepository,
    private readonly content: OfferingContentService,
    private readonly destinations: AffiliateService,
    private readonly origins: OriginValidator,
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

  /**
   * Hide Offering (`US-PLT-F03-001` AC-1, AC-2).
   *
   * Its own route, and Restore is another, because they are two approved
   * actions rather than one status field. An endpoint that accepted a
   * lifecycle would let a caller write `ARCHIVED` — which is precisely the
   * transition AC-6 says Platform does not have.
   */
  @Post(":offeringId/concealment")
  @HttpCode(200)
  async hide(
    @Param("offeringId", uuidParam("offeringId")) offeringId: string,
    @Req() request: FastifyRequest
  ) {
    return this.applyModeration(offeringId, "HIDE_OFFERING", request);
  }

  /// Restore Offering (AC-3, AC-4). It returns the lifecycle to Published and
  /// promises nothing about public eligibility — PRD-0001 composes that.
  @Post(":offeringId/restoration")
  @HttpCode(200)
  async restore(
    @Param("offeringId", uuidParam("offeringId")) offeringId: string,
    @Req() request: FastifyRequest
  ) {
    return this.applyModeration(offeringId, "RESTORE_OFFERING", request);
  }

  /**
   * The two actions share everything except their name.
   *
   * The case note is written after the transition, never before: `US-PLT-F02-001`
   * AC-7 wants a record of what was *applied*, and a refused Hide has applied
   * nothing. A failure throws before this line is reached, so no case can cite
   * an action that did not happen.
   */
  private async applyModeration(
    offeringId: string,
    action: "HIDE_OFFERING" | "RESTORE_OFFERING",
    request: FastifyRequest
  ) {
    const principal = await this.adminGuard(request);
    const moderated = await this.content.moderate(
      offeringId,
      action,
      principal
    );
    await this.cases.recordApplied({
      action,
      recordedBy: principal.userId,
      targetId: offeringId
    });
    return offeringContentSchema.parse(moderated);
  }

  /**
   * The Affiliate Destination workload (`US-PLT-F07-001` AC-8 to AC-12).
   *
   * On the collection rather than under one Offering, because the question it
   * answers is "what is waiting for me" rather than "what about this one". A
   * `GET`, so looking at the queue moves nothing in it.
   */
  @Get("affiliate-destinations/workload")
  async workload(@Req() request: FastifyRequest) {
    await this.principals.resolveAdmin(request);
    return destinationWorkloadSchema.parse({
      items: await this.destinations.workload()
    });
  }

  @Get(":offeringId/affiliate-destination")
  async destination(
    @Param("offeringId", uuidParam("offeringId")) offeringId: string,
    @Req() request: FastifyRequest
  ) {
    await this.principals.resolveAdmin(request);
    return affiliateDestinationSchema.parse(
      await this.destinations.forAdmin(offeringId)
    );
  }

  /**
   * Review (`US-OFR-F07-001` AC-2). It leaves every result where it is and
   * records that it happened — PRD-0001 §9.4 makes an approved review one of
   * the conditions a `Valid` result rests on, so it cannot be a private act.
   */
  @Post(":offeringId/affiliate-destination/review")
  @HttpCode(200)
  async review(
    @Param("offeringId", uuidParam("offeringId")) offeringId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    const principal = await this.adminGuard(request);
    return affiliateDestinationSchema.parse(
      await this.destinations.administer(
        offeringId,
        "review",
        this.parse(reviewAffiliateDestinationSchema, body, "Invalid review"),
        principal
      )
    );
  }

  /// Validate (AC-3, AC-4, AC-5). One current result; the status stays put.
  @Post(":offeringId/affiliate-destination/validation")
  @HttpCode(200)
  async validate(
    @Param("offeringId", uuidParam("offeringId")) offeringId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    const principal = await this.adminGuard(request);
    return affiliateDestinationSchema.parse(
      await this.destinations.administer(
        offeringId,
        "validate",
        this.parse(
          validateAffiliateDestinationSchema,
          body,
          "Invalid validation result"
        ),
        principal
      )
    );
  }

  /// Enable (AC-6, AC-7).
  @Post(":offeringId/affiliate-destination/enablement")
  @HttpCode(200)
  async enable(
    @Param("offeringId", uuidParam("offeringId")) offeringId: string,
    @Req() request: FastifyRequest
  ) {
    const principal = await this.adminGuard(request);
    return affiliateDestinationSchema.parse(
      await this.destinations.administer(offeringId, "enable", null, principal)
    );
  }

  /// Disable (AC-8, AC-9).
  @Post(":offeringId/affiliate-destination/disablement")
  @HttpCode(200)
  async disable(
    @Param("offeringId", uuidParam("offeringId")) offeringId: string,
    @Req() request: FastifyRequest
  ) {
    const principal = await this.adminGuard(request);
    return affiliateDestinationSchema.parse(
      await this.destinations.administer(offeringId, "disable", null, principal)
    );
  }

  private async adminGuard(request: FastifyRequest) {
    this.origins.assertAcceptable(request, true);
    return await this.principals.resolveAdmin(request);
  }

  private parse<T>(
    schema: { safeParse: (value: unknown) => z.ZodSafeParseResult<T> },
    body: unknown,
    message: string
  ): T {
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message
      });
    return parsed.data;
  }
}
