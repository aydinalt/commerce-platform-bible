import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UnprocessableEntityException
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { z } from "zod";

import {
  editorialCreateInputSchema,
  editorialDraftInputSchema,
  editorialReviewAdminSchema,
  editorialReviewListSchema
} from "@commerce/contracts";
import {
  IncompleteReviewError,
  InvalidReviewTransitionError,
  ReviewAlreadyExistsError,
  UnknownProductKeyError
} from "@commerce/editorial";

import { PgAuditRepository } from "../persistence/pg-audit.repository.js";
import { PgEditorialRepository } from "../persistence/pg-editorial.repository.js";
import { OriginValidator } from "../security/origin.guard.js";
import { PrincipalResolver } from "../security/principal-resolver.js";

/**
 * Writing an editorial review (I93, `EDT F02`).
 *
 * **There is no screen for this, and building one is forbidden until there
 * is.** No UX document describes the Admin authoring surface; `UX-0006` owns
 * the Admin dashboard and has no section for it. `US-EDT-F02-001`'s Freeze Note
 * makes that a binding condition on delivery rather than a note: nothing that
 * puts pixels on a screen may be built until the screen is drawn in the
 * prototype's language and approved. What is here is the behaviour — the
 * states, the dates, the refusals and the trail — which is not visual and was
 * not waiting on it.
 *
 * **Five routes rather than one that takes a state**, because `PRD-0009` §13.4
 * makes re-checking a separate act from saving in as many words, and a single
 * `PATCH` carrying `{ status, checked }` would put the two back together at the
 * one layer where the distinction has to hold. The route names are the acts the
 * audit trail records.
 *
 * **Every act is recorded and reading is not** (`PRD-0009` §13.8, `PRD-0006`
 * §22.2). The five values were added to `AdminAuditAction` in I93;
 * `CREATE_EDITORIAL_REVIEW` is there by the Owner's decision of 2026-09-09,
 * taken on a discrepancy between §13.8's five acts and the four named in the
 * §22.2 row. `PRD-0006` v2.8 restores the word to the document.
 */
@Controller("admin/editorial-reviews")
export class EditorialAdminController {
  constructor(
    private readonly audit: PgAuditRepository,
    private readonly editorial: PgEditorialRepository,
    private readonly origins: OriginValidator,
    private readonly principals: PrincipalResolver
  ) {}

  /** AC-1: the platform administrator, and no one else, may read this list. */
  @Get()
  async list(@Req() request: FastifyRequest) {
    this.origins.assertAcceptable(request, true);
    await this.principals.resolveAdmin(request);
    const reviews = await this.editorial.list();
    return editorialReviewListSchema.parse({ reviews });
  }

  @Get(":productKey")
  async one(
    @Param("productKey") productKey: string,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    await this.principals.resolveAdmin(request);
    const review = await this.editorial.forWriter(productKey);
    if (review === null) throw this.absent();
    return editorialReviewAdminSchema.parse(review);
  }

  /** AC-14, AC-15. Created as a Draft — nothing is published by creating it. */
  @Post()
  async create(@Body() body: unknown, @Req() request: FastifyRequest) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolveAdmin(request);
    const parsed = this.parse(editorialCreateInputSchema, body);
    const { productKey, ...draft } = parsed;
    const review = await this.act(async () =>
      this.editorial.create({ draft, productKey })
    );
    await this.audit.record({
      action: "CREATE_EDITORIAL_REVIEW",
      actorId: principal.userId,
      targetId: review.id
    });
    return editorialReviewAdminSchema.parse(review);
  }

  /**
   * Save — and **only** save.
   *
   * AC-9 and AC-11 are one line of code between them: this route moves neither
   * date, because the payload it accepts has no field for either and the update
   * it runs does not name them. A writer who fixes a comma leaves "last
   * re-checked" where it was.
   *
   * The audit action is `REVISE_EDITORIAL_REVIEW` whatever state the review is
   * in. A Draft edit is still an Admin changing what the platform will say, and
   * a trail that recorded only the edits to published reviews would be missing
   * the ones made in the hour before publication.
   */
  @Put(":id")
  async save(
    @Param("id") id: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolveAdmin(request);
    const draft = this.parse(editorialDraftInputSchema, body);
    const review = await this.act(async () =>
      this.editorial.save({ draft, id })
    );
    await this.audit.record({
      action: "REVISE_EDITORIAL_REVIEW",
      actorId: principal.userId,
      targetId: review.id
    });
    return editorialReviewAdminSchema.parse(review);
  }

  /** AC-12: refused unless everything §13.5 requires is present. */
  @Post(":id/publication")
  @HttpCode(200)
  async publish(@Param("id") id: string, @Req() request: FastifyRequest) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolveAdmin(request);
    const review = await this.act(async () => this.editorial.publish(id));
    await this.audit.record({
      action: "PUBLISH_EDITORIAL_REVIEW",
      actorId: principal.userId,
      targetId: review.id
    });
    return editorialReviewAdminSchema.parse(review);
  }

  /**
   * AC-9, AC-10: the act that moves the re-check date, and the only one.
   *
   * **It takes no body**, which is the point. There is nothing to state beyond
   * that the check happened, and a payload would invite a caller to send this
   * alongside a save — which is exactly the collapse §13.4 forbids.
   */
  @Post(":id/recheck")
  @HttpCode(200)
  async recheck(@Param("id") id: string, @Req() request: FastifyRequest) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolveAdmin(request);
    const review = await this.act(async () => this.editorial.recheck(id));
    await this.audit.record({
      action: "RECHECK_EDITORIAL_REVIEW",
      actorId: principal.userId,
      targetId: review.id
    });
    return editorialReviewAdminSchema.parse(review);
  }

  /**
   * AC-6, AC-7: withdrawal, which is how a wrong judgement comes down.
   *
   * There is no `DELETE` on this controller and there is not meant to be. The
   * review stops being presented; that it existed, and who withdrew it, stays
   * in the trail.
   */
  @Post(":id/withdrawal")
  @HttpCode(200)
  async withdraw(@Param("id") id: string, @Req() request: FastifyRequest) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolveAdmin(request);
    const review = await this.act(async () => this.editorial.withdraw(id));
    await this.audit.record({
      action: "WITHDRAW_EDITORIAL_REVIEW",
      actorId: principal.userId,
      targetId: review.id
    });
    return editorialReviewAdminSchema.parse(review);
  }

  private parse<T>(schema: z.ZodType<T>, body: unknown): T {
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "Invalid editorial review"
      });
    return parsed.data;
  }

  /**
   * Domain refusals become the status codes that describe them.
   *
   * A refusal is not a server fault and must not read as one: an unknown
   * Product Key and a duplicate review are both things a writer can put right,
   * and an incomplete publication names what is missing so that it can be
   * fixed in one pass rather than discovered one refusal at a time.
   */
  private async act<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch (error) {
      if (error instanceof UnknownProductKeyError)
        throw new UnprocessableEntityException({
          code: "UNKNOWN_PRODUCT_KEY",
          message: "No published listing carries that Product Key"
        });
      if (error instanceof ReviewAlreadyExistsError)
        throw new ConflictException({
          code: "EDITORIAL_REVIEW_EXISTS",
          message: "That Product Key already carries an editorial review"
        });
      if (error instanceof IncompleteReviewError)
        throw new UnprocessableEntityException({
          code: "EDITORIAL_REVIEW_INCOMPLETE",
          message:
            "An editorial review is missing parts it cannot publish without",
          missing: error.missing
        });
      if (error instanceof InvalidReviewTransitionError)
        throw new ConflictException({
          code: "EDITORIAL_REVIEW_TRANSITION",
          from: error.from,
          message: "An editorial review cannot move between those states",
          to: error.to
        });
      throw error;
    }
  }

  private absent(): NotFoundException {
    return new NotFoundException({
      code: "EDITORIAL_REVIEW_NOT_FOUND",
      message: "No editorial review exists for that Product Key"
    });
  }
}
