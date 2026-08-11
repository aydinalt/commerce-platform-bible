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
  businessDashboardSchema,
  businessInformationSchema,
  correctionNoticeSchema,
  correctionNoticesSchema,
  createBusinessSchema,
  offeringContentSchema,
  ownedBusinessSchema,
  ownedBusinessesSchema,
  requestCorrectionSchema,
  saveCorrectionSchema,
  updateBusinessInformationSchema,
  type OwnedBusinesses
} from "@commerce/contracts";

import { PgModerationRepository } from "../persistence/pg-moderation.repository.js";
import { OriginValidator } from "../security/origin.guard.js";
import { PrincipalResolver } from "../security/principal-resolver.js";
import { BusinessService } from "./business.service.js";
import { CorrectionService } from "./correction.service.js";

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
    private readonly corrections: CorrectionService,
    private readonly principals: PrincipalResolver,
    private readonly origins: OriginValidator
  ) {}

  /**
   * The owner's correction notices (`US-BUS-F07-001` AC-3, AC-4).
   *
   * A `GET`, and that is the whole of AC-5: reading a notice performs no
   * write, so no state can move because a notice was looked at. There is no
   * sibling route for replying, acknowledging or dismissing — AC-6 rules out
   * Messaging, and the way to rule out a conversation is to leave no verb that
   * could start one.
   */
  @Get(":businessId/correction-notices")
  async correctionNotices(
    @Param("businessId", uuidParam("businessId")) businessId: string,
    @Req() request: FastifyRequest
  ) {
    return correctionNoticesSchema.parse({
      notices: await this.corrections.notices(
        businessId,
        await this.principals.resolve(request)
      )
    });
  }

  /**
   * The bounded correction save (§8.3.1).
   *
   * Addressed by the correction rather than by the Offering, because the
   * correction is what confers the permission. There is no way to spell "edit
   * this Offering under correction authority" without naming the correction
   * that granted it, so an unrelated Offering has no path here at all (AC-9).
   */
  @Put(":businessId/correction-notices/:correctionId/response")
  async saveCorrection(
    @Param("businessId", uuidParam("businessId")) businessId: string,
    @Param("correctionId", uuidParam("correctionId")) correctionId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolve(request);
    const parsed = saveCorrectionSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "Invalid correction response"
      });
    return offeringContentSchema.parse(
      await this.corrections.save(
        businessId,
        correctionId,
        parsed.data,
        principal
      )
    );
  }

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
  /**
   * The Business Dashboard (`US-BUS-F04-001`).
   *
   * Reached by naming the Business rather than by reading the selected
   * context: AC-5 makes switching change the active context and nothing else,
   * and a Dashboard that answered "whichever Business you last selected" would
   * make AC-6 impossible to keep — a management action would depend on state
   * the request never mentioned.
   */
  @Get(":businessId/dashboard")
  async dashboard(
    @Param("businessId", uuidParam("businessId")) businessId: string,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    return businessDashboardSchema.parse(
      await this.businesses.dashboard(
        businessId,
        await this.principals.resolve(request)
      )
    );
  }
}

/**
 * Restrict and Restore (`US-BUS-F03-001` AC-4, AC-11).
 *
 * Admin-only, and deliberately two actions rather than one status field: the
 * Story names them, and an endpoint that accepted a status would let a caller
 * write `Restricted` without an approved Restrict Business action behind it.
 *
 * The moderation case around these — why, by whom, and what happens next — is
 * `US-PLT-F02-001`'s. What lives here is what the two actions *do*.
 */
@Controller("admin/businesses")
export class AdminBusinessController {
  constructor(
    private readonly businesses: BusinessService,
    private readonly cases: PgModerationRepository,
    private readonly corrections: CorrectionService,
    private readonly principals: PrincipalResolver,
    private readonly origins: OriginValidator
  ) {}

  /**
   * Request Correction (`US-BUS-F07-001`, PRD-0006 §7.3).
   *
   * The one Platform action this Increment needs, so that the Business
   * response path has something real to answer. It opens or joins an Open case
   * and changes nothing else — no lifecycle, no moderation status, no exposure
   * input, no eligibility (AC-5). Re-review and closure are PRD-0006's and are
   * not here (AC-15).
   */
  @Post(":businessId/correction-requests")
  @HttpCode(201)
  async requestCorrection(
    @Param("businessId", uuidParam("businessId")) businessId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolveAdmin(request);
    const parsed = requestCorrectionSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "Invalid correction request"
      });
    return correctionNoticeSchema.parse(
      await this.corrections.request(businessId, parsed.data, principal)
    );
  }

  @Post(":businessId/restriction")
  @HttpCode(200)
  async restrict(
    @Param("businessId", uuidParam("businessId")) businessId: string,
    @Req() request: FastifyRequest
  ) {
    return ownedBusinessSchema.parse(
      await this.moderate(businessId, "RESTRICTED", request)
    );
  }

  @Post(":businessId/restoration")
  @HttpCode(200)
  async restore(
    @Param("businessId", uuidParam("businessId")) businessId: string,
    @Req() request: FastifyRequest
  ) {
    return ownedBusinessSchema.parse(
      await this.moderate(businessId, "UNRESTRICTED", request)
    );
  }

  private async moderate(
    businessId: string,
    status: "RESTRICTED" | "UNRESTRICTED",
    request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolveAdmin(request);
    const moderated = await this.businesses.moderate(businessId, status);
    // `US-PLT-F02-001` AC-7. The action's consequences are this Story's; that
    // it was applied is the case's, so it is written down where a later
    // closure can cite it. A Business with no Open case records nothing.
    await this.cases.recordApplied({
      action:
        status === "RESTRICTED" ? "RESTRICT_BUSINESS" : "RESTORE_BUSINESS",
      businessId,
      offeringId: null,
      recordedBy: principal.userId,
      userId: null
    });
    return moderated;
  }
}
