import {
  BadRequestException,
  ConflictException,
  Controller,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Get,
  ParseUUIDPipe,
  Post,
  Query,
  Req
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { z } from "zod";

import { adminUserAccountsSchema, userAccessSchema } from "@commerce/contracts";
import {
  AccessModerationUnavailableError,
  AdminTargetForbiddenError,
  type AccessModerationAction
} from "@commerce/identity";

import { PgIdentityRepository } from "../persistence/pg-identity.repository.js";
import { PgAuditRepository } from "../persistence/pg-audit.repository.js";
import { PgModerationRepository } from "../persistence/pg-moderation.repository.js";
import { OriginValidator } from "../security/origin.guard.js";
import { PrincipalResolver } from "../security/principal-resolver.js";

/**
 * How many accounts one page of the register carries.
 *
 * A fixed number rather than a request parameter, like the report queue and the
 * feed runs: a caller choosing the size would be choosing how much to see.
 */
const ACCOUNT_PAGE = 100;

const uuidParam = (name: string) =>
  new ParseUUIDPipe({
    exceptionFactory: () =>
      new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: { [name]: ["Expected a UUID"] },
        message: `Invalid ${name}`
      })
  });

/**
 * User access moderation (`US-PLT-F05-001`).
 *
 * Two routes, and the boundary they sit on is the sharpest in the Platform
 * domain: an ordinary Admin may move an ordinary account's access status, and
 * may not touch an account that carries Admin authorization. Owner Decision
 * D22 reserves that to the Product Owner outside this surface, which is why
 * there is no parameter, header or flag here that could opt into it (AC-6).
 *
 * There is also no route that grants or removes Admin authorization, and no
 * correction target for a User Account (AC-9) — both are absences the whole
 * Platform surface shares rather than checks this controller performs.
 */
@Controller("admin/user-accounts")
export class AccessModerationController {
  constructor(
    private readonly accounts: PgIdentityRepository,
    private readonly cases: PgModerationRepository,
    private readonly origins: OriginValidator,
    private readonly principals: PrincipalResolver,
    private readonly audit: PgAuditRepository
  ) {}

  /**
   * The register of accounts (I83).
   *
   * The Owner asked for this surface so Suspend and Reinstate stop being
   * unreachable: their routes have existed since `US-PLT-F05-001` and could
   * only be triggered from a `USER_ACCOUNT` case, which nothing in the panel
   * could create.
   *
   * **A fixed page, like every other Admin list here.** A caller choosing the
   * size would be choosing how much of the register to see, and the count comes
   * back beside the rows so a truncated page can say it is one.
   */
  @Get()
  async list(@Query("status") status: unknown, @Req() request: FastifyRequest) {
    await this.principals.resolveAdmin(request);
    const parsed = z
      .enum(["ENABLED", "PENDING_VERIFICATION", "SUSPENDED"])
      .nullish()
      .safeParse(status);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: {
          status: ["Expected ENABLED, PENDING_VERIFICATION or SUSPENDED"]
        },
        message: "Invalid account status"
      });
    const found = await this.accounts.listAccounts({
      limit: ACCOUNT_PAGE,
      status: parsed.data ?? null
    });
    return adminUserAccountsSchema.parse({
      accounts: found.accounts.map((account) => ({
        ...account,
        registeredAt: account.registeredAt.toISOString()
      })),
      total: found.total
    });
  }

  /// AC-1 and AC-2. Available for an Enabled, non-Admin-authorized account.
  @Post(":userId/suspension")
  @HttpCode(200)
  async suspend(
    @Param("userId", uuidParam("userId")) userId: string,
    @Req() request: FastifyRequest
  ) {
    return this.apply(userId, "SUSPEND_USER", request);
  }

  /// AC-3 and AC-4. Available for a Suspended, non-Admin-authorized account.
  @Post(":userId/reinstatement")
  @HttpCode(200)
  async reinstate(
    @Param("userId", uuidParam("userId")) userId: string,
    @Req() request: FastifyRequest
  ) {
    return this.apply(userId, "REINSTATE_USER", request);
  }

  private async apply(
    userId: string,
    action: AccessModerationAction,
    request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolveAdmin(request);
    try {
      const moderated = await this.accounts.moderateAccess({ action, userId });
      if (!moderated)
        throw new NotFoundException({
          code: "USER_ACCOUNT_NOT_FOUND",
          message: "No User Account matches that identifier"
        });
      // AC-10. The case learns an approved action was applied and stays Open.
      await this.cases.recordApplied({
        action,
        recordedBy: principal.userId,
        targetId: userId
      });
      /*
       * I83. Recorded here as well as on the case, and the duplication is the
       * point: a case resolution says what happened to a target, and this says
       * who did it and when. The first is product history, the second is
       * accountability — and "who suspended this account" is a question only
       * the second can answer, because a resolution outlives neither the case
       * nor the Admin who wrote it in any queryable way.
       */
      await this.audit.record({
        action,
        actorId: principal.userId,
        targetId: userId
      });
      return userAccessSchema.parse(moderated);
    } catch (error) {
      if (error instanceof AdminTargetForbiddenError)
        // AC-5. Forbidden rather than not-found: the account plainly exists,
        // and pretending otherwise would tell an Admin less than they need to
        // understand why the platform said no.
        throw new ForbiddenException({
          code: "ADMIN_TARGET_FORBIDDEN",
          message:
            "An Admin-authorized account may be suspended or reinstated only by the Product Owner, outside this surface"
        });
      if (error instanceof AccessModerationUnavailableError)
        throw new ConflictException({
          code: "ACCESS_MODERATION_UNAVAILABLE",
          message:
            action === "SUSPEND_USER"
              ? "Only an Enabled account may be suspended"
              : "Only a Suspended account may be reinstated",
          status: error.status
        });
      throw error;
    }
  }
}
