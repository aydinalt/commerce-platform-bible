import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { z } from "zod";

import {
  caseTargetEmailSchema,
  moderationCaseSchema,
  moderationCasesSchema,
  openModerationCaseSchema,
  recordNoActionSchema,
  recordReReviewSchema
} from "@commerce/contracts";
import {
  CaseNotResolvedError,
  CaseNotReReviewedError
} from "@commerce/moderation";

import { PgAuditRepository } from "../persistence/pg-audit.repository.js";
import { PgModerationRepository } from "../persistence/pg-moderation.repository.js";
import { OriginValidator } from "../security/origin.guard.js";
import { PrincipalResolver } from "../security/principal-resolver.js";

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
 * General Moderation case management (`US-PLT-F02-001`).
 *
 * The case is workflow. It records that somebody should look at a target, what
 * was decided, and that somebody explicitly finished — and it touches no
 * target state at any point, which is AC-3, AC-8 and AC-9 read three ways.
 *
 * There is no route here that hides an Offering, restricts a Business or
 * suspends an account. Those actions belong to the Stories that own their
 * consequences; this records that one of them was applied. Keeping the two
 * apart is what lets a case be closed without anything happening to the target
 * because of the closing.
 */
@Controller("admin/moderation-cases")
export class ModerationCaseController {
  constructor(
    private readonly cases: PgModerationRepository,
    private readonly principals: PrincipalResolver,
    private readonly origins: OriginValidator,
    private readonly audit: PgAuditRepository
  ) {}

  /// AC-1 and AC-9. `status` filters the workflow and nothing else — there is
  /// no target state to filter by, because a case carries none.
  @Get()
  async list(@Query("status") status: unknown, @Req() request: FastifyRequest) {
    await this.principals.resolveAdmin(request);
    const parsed = z.enum(["OPEN", "CLOSED"]).nullish().safeParse(status);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: { status: ["Expected OPEN or CLOSED"] },
        message: "Invalid case status"
      });
    return moderationCasesSchema.parse({
      cases: await this.cases.list(parsed.data ?? null)
    });
  }

  @Get(":caseId")
  async read(
    @Param("caseId", uuidParam("caseId")) caseId: string,
    @Req() request: FastifyRequest
  ) {
    await this.principals.resolveAdmin(request);
    const found = await this.cases.find(caseId);
    if (!found) throw this.absent();
    return moderationCaseSchema.parse(found);
  }

  /**
   * Revealing the address of a User Account case's target (I82).
   *
   * The Owner's PII rule, expressed as a route: an email address never travels
   * with a list or with the case itself, and reaches an Admin only when they
   * ask for it on the case they are working.
   *
   * **A `POST`, not a `GET`, and the method is the point.** This reads no new
   * state and changes none, so `GET` is the obvious verb — but the Owner asked
   * for the reveal to be an action that can be attached to an audit trail, and
   * the things that get logged, retried, cached and prefetched are exactly the
   * things `GET` invites. A `POST` is not cached by a proxy, not prefetched by
   * a browser, not repeated by a reload, and reads in a log as something
   * somebody did rather than something a page loaded.
   *
   * `404` for a case that is not a User Account case, so an Offering case is
   * not a route to somebody's address, and for a case that does not exist —
   * the same answer either way, because distinguishing them would let a caller
   * test which case ids exist.
   */
  @Post(":caseId/target-email")
  @HttpCode(200)
  async targetEmail(
    @Param("caseId", uuidParam("caseId")) caseId: string,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolveAdmin(request);
    const email = await this.cases.targetEmail(caseId);
    if (email === null) throw this.absent();
    /*
     * I83. Recorded **after** the address is found and before it is returned,
     * so the trail holds reveals that actually produced an address and not
     * probes that found nothing. A refused request is not a disclosure.
     */
    await this.audit.record({
      action: "PII_VIEW",
      actorId: principal.userId,
      caseId
    });
    return caseTargetEmailSchema.parse({ email });
  }

  /// AC-2. Surfacing a target produces an Open case — the same one where a
  /// target already has an Open case, because one concern is one case.
  @Post()
  @HttpCode(201)
  async open(@Body() body: unknown, @Req() request: FastifyRequest) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolveAdmin(request);
    const parsed = openModerationCaseSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "Invalid moderation case target"
      });
    const opened = await this.cases.open({
      businessId:
        parsed.data.targetType === "BUSINESS" ? parsed.data.businessId : null,
      offeringId:
        parsed.data.targetType === "OFFERING" ? parsed.data.offeringId : null,
      openedBy: principal.userId,
      targetType: parsed.data.targetType,
      userId:
        parsed.data.targetType === "USER_ACCOUNT" ? parsed.data.userId : null
    });
    if (!opened)
      throw new NotFoundException({
        code: "MODERATION_TARGET_NOT_FOUND",
        message: "No target matches that identifier"
      });
    /*
     * I83. Recorded on every successful call, including the one that answered
     * with a case that already existed. "Somebody surfaced this target again"
     * is a fact worth having — a target being raised four times by four Admins
     * is exactly the pattern a queue hides.
     */
    await this.audit.record({
      action: "CASE_OPEN",
      actorId: principal.userId,
      caseId: opened.id,
      targetId: opened.offeringId ?? opened.businessId ?? opened.userId ?? null
    });
    return moderationCaseSchema.parse(opened);
  }

  /**
   * Records a no-action decision (AC-7).
   *
   * Its own route rather than a field on closure, because deciding that
   * nothing needs doing is a decision in its own right — one that stands in
   * the record whether or not the case is closed afterwards.
   */
  @Post(":caseId/no-action-decision")
  @HttpCode(201)
  async recordNoAction(
    @Param("caseId", uuidParam("caseId")) caseId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolveAdmin(request);
    const parsed = recordNoActionSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "Invalid no-action decision"
      });
    const resolved = await this.cases.resolve({
      action: null,
      caseId,
      noActionReason: parsed.data.reason,
      recordedBy: principal.userId
    });
    if (!resolved) throw this.absent();
    return moderationCaseSchema.parse(resolved);
  }

  /**
   * Records a re-review of the owner's correction response
   * (`US-PLT-F06-001` AC-10).
   *
   * Its own route, and deliberately cheap: an optional note and nothing else.
   * The act is the point — somebody looked at what the owner did. Requiring a
   * justification would make the correct thing feel expensive and encourage
   * closing without it, which is the failure this Story exists to prevent.
   *
   * Recording a re-review changes no target state and closes nothing. What it
   * changes is what closure will accept.
   */
  @Post(":caseId/re-review")
  @HttpCode(201)
  async reReview(
    @Param("caseId", uuidParam("caseId")) caseId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolveAdmin(request);
    const parsed = recordReReviewSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "Invalid re-review"
      });
    const reviewed = await this.cases.reReview({
      caseId,
      note: parsed.data.note ?? null,
      reviewedBy: principal.userId
    });
    if (!reviewed) throw this.absent();
    return moderationCaseSchema.parse(reviewed);
  }

  /**
   * Closes the case explicitly (AC-7, AC-8).
   *
   * Explicit because nothing else closes it: no action applied within the case
   * closes it, and neither does time. AC-11 is the transaction's doing — the
   * resolution requirement is a trigger, so a refused closure leaves the case
   * Open rather than partly closed.
   */
  @Post(":caseId/closure")
  @HttpCode(200)
  async close(
    @Param("caseId", uuidParam("caseId")) caseId: string,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolveAdmin(request);
    try {
      const closed = await this.cases.close(caseId, principal.userId);
      if (!closed) throw this.absent();
      return moderationCaseSchema.parse(closed);
    } catch (error) {
      if (error instanceof CaseNotResolvedError)
        throw new ConflictException({
          code: "CASE_NOT_RESOLVED",
          message:
            "A case may be closed only after an approved action or a recorded no-action decision"
        });
      if (error instanceof CaseNotReReviewedError)
        // AC-10. The owner answered and nobody has looked since. Closing now
        // would mean they did work no one read.
        throw new ConflictException({
          code: "CASE_NOT_RE_REVIEWED",
          message:
            "The owner has saved a correction that has not been re-reviewed"
        });
      throw error;
    }
  }

  private absent(): NotFoundException {
    return new NotFoundException({
      code: "MODERATION_CASE_NOT_FOUND",
      message: "No General Moderation case matches that identifier"
    });
  }
}
