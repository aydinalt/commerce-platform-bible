import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UnprocessableEntityException
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { z } from "zod";

import {
  addComparisonMemberSchema,
  affiliateHandoffSchema,
  contactChannelsSchema,
  directContactRevealSchema,
  askDecisionSchema,
  decisionChatSchema,
  comparisonSetSchema,
  comparisonViewSchema,
  decisionContextSchema,
  enterDecisionSchema,
  revealContactSchema,
  selectOfferingSchema
} from "@commerce/contracts";
import {
  AssistantInventedValueError,
  ComparisonMemberRefusedError,
  ComparisonSetNotFoundError,
  DecisionContextInvalidError,
  DecisionFlowNotFoundError,
  DirectContactUnavailableError,
  HandoffUnavailableError,
  SelectionNotInContextError
} from "@commerce/decision";

import { PgComparisonRepository } from "../persistence/pg-comparison.repository.js";
import { PgDecisionRepository } from "../persistence/pg-decision.repository.js";
import { OriginValidator } from "../security/origin.guard.js";
import { PrincipalResolver } from "../security/principal-resolver.js";

import { ChatService } from "./chat.service.js";

/**
 * Compare (`US-DEC-F01-001`).
 *
 * Public and unauthenticated, like Discovery and Presentation: PRD-0003 makes
 * Compare part of a person's decision rather than a feature of an account, and
 * nothing here resolves a principal.
 *
 * Compare is optional (AC-1), which shows up as an absence: no route requires
 * a Comparison Set, and the single-Offering Decision path never passes through
 * this controller at all.
 */
function uuidParam(name: string): ParseUUIDPipe {
  return new ParseUUIDPipe({
    exceptionFactory: () =>
      new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: { [name]: ["Expected a UUID"] },
        message: `Invalid ${name}`
      })
  });
}

@Controller("decision/comparison-sets")
export class DecisionController {
  constructor(private readonly comparisons: PgComparisonRepository) {}

  /// Beginning a set from the Offering a person was looking at.
  @Post()
  @HttpCode(201)
  async begin(@Body() body: unknown) {
    const parsed = addComparisonMemberSchema.safeParse(body);
    if (!parsed.success) throw this.invalid(parsed.error);
    return comparisonSetSchema.parse(
      await this.attempt(() => this.comparisons.begin(parsed.data.offeringId))
    );
  }

  @Get(":comparisonSetId")
  async current(
    @Param("comparisonSetId", uuidParam("comparisonSetId"))
    comparisonSetId: string
  ) {
    return comparisonSetSchema.parse(
      await this.attempt(() => this.comparisons.current(comparisonSetId))
    );
  }

  /**
   * Adding a member, and the only way past five (AC-5, AC-6).
   *
   * `replaces` is the person naming what leaves. Without it a full set refuses
   * the addition and stays exactly as it was — AC-4's promise applies to the
   * ceiling too.
   */
  @Post(":comparisonSetId/members")
  @HttpCode(200)
  async add(
    @Param("comparisonSetId", uuidParam("comparisonSetId"))
    comparisonSetId: string,
    @Body() body: unknown
  ) {
    const parsed = addComparisonMemberSchema.safeParse(body);
    if (!parsed.success) throw this.invalid(parsed.error);
    return comparisonSetSchema.parse(
      await this.attempt(() =>
        this.comparisons.add({
          comparisonSetId,
          offeringId: parsed.data.offeringId,
          replaces: parsed.data.replaces
        })
      )
    );
  }

  @Delete(":comparisonSetId/members/:offeringId")
  @HttpCode(200)
  async remove(
    @Param("comparisonSetId", uuidParam("comparisonSetId"))
    comparisonSetId: string,
    @Param("offeringId", uuidParam("offeringId")) offeringId: string
  ) {
    return comparisonSetSchema.parse(
      await this.attempt(() =>
        this.comparisons.remove(comparisonSetId, offeringId)
      )
    );
  }

  /**
   * Opening Compare (AC-2, AC-11).
   *
   * A `POST` because opening is an occurrence, exactly as beginning to look
   * is. A set that is not openable is refused rather than opened on fewer than
   * two members, and no Compare Start is recorded for it.
   */
  @Post(":comparisonSetId/compare")
  @HttpCode(200)
  async compare(
    @Param("comparisonSetId", uuidParam("comparisonSetId"))
    comparisonSetId: string
  ) {
    const view = await this.attempt(() =>
      this.comparisons.open(comparisonSetId)
    );
    if (!view)
      throw new UnprocessableEntityException({
        code: "COMPARISON_SET_NOT_OPENABLE",
        message: "Compare needs between two and five eligible Offerings"
      });
    return comparisonViewSchema.parse(view);
  }

  private invalid(error: z.ZodError): BadRequestException {
    return new BadRequestException({
      code: "VALIDATION_FAILED",
      fieldErrors: z.flattenError(error).fieldErrors,
      message: "Invalid Comparison Set request"
    });
  }

  /**
   * Refusals, reported rather than absorbed.
   *
   * Each one names the rule that refused, because AC-4 promises the current
   * valid set is unchanged and a person is entitled to know which of the three
   * bounds they met.
   */
  private async attempt<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch (error) {
      if (error instanceof ComparisonSetNotFoundError)
        throw new NotFoundException({
          code: "COMPARISON_SET_NOT_FOUND",
          message: "That Comparison Set has expired or never existed"
        });
      if (error instanceof ComparisonMemberRefusedError)
        throw new UnprocessableEntityException({
          code: error.refusal,
          message:
            error.refusal === "SET_FULL"
              ? "Remove or replace a member before adding a sixth"
              : error.refusal === "MEMBER_OTHER_CATEGORY"
                ? "Every member must share the same active leaf Category"
                : "That Offering is not publicly eligible"
        });
      throw error;
    }
  }
}

/**
 * The Decision Context (`US-DEC-F02-001`).
 *
 * Public, like Compare. A context is one eligible Offering or one valid
 * Comparison Set, and the flow it belongs to expires — there is no route here
 * that could produce a personal Decision history, because there is nothing
 * that stores one.
 */
@Controller("decision/flows")
export class DecisionFlowController {
  constructor(
    private readonly decisions: PgDecisionRepository,
    private readonly origins: OriginValidator,
    private readonly principals: PrincipalResolver
  ) {}

  /**
   * Entering Decision (AC-1 to AC-3).
   *
   * The body carries one of the two, never both — the schema is a union rather
   * than two optional fields, so a request asking to decide about two
   * unrelated things cannot be expressed.
   */
  @Post()
  @HttpCode(201)
  async enter(@Body() body: unknown) {
    const parsed = enterDecisionSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "A Decision Context is one Offering or one Comparison Set"
      });

    return decisionContextSchema.parse(
      await this.attempt(() =>
        "offeringId" in parsed.data
          ? this.decisions.enterWithOffering(parsed.data.offeringId)
          : this.decisions.enterWithComparisonSet(parsed.data.comparisonSetId)
      )
    );
  }

  /**
   * The current context, with its validity as it stands now (AC-7, AC-8).
   *
   * Read on every request rather than remembered: an Offering retired a moment
   * ago has to stop being something Decision speaks about immediately.
   */
  @Get(":decisionFlowId")
  async context(
    @Param("decisionFlowId", uuidParam("decisionFlowId"))
    decisionFlowId: string
  ) {
    return decisionContextSchema.parse(
      await this.attempt(() => this.decisions.context(decisionFlowId))
    );
  }

  /**
   * Selecting, changing or clearing the Selected Offering (AC-2, AC-3, AC-5).
   *
   * A `PUT` because the person is stating what the selection *is*, including
   * that it is nothing. There is no separate clear route, because clearing is
   * not a different act — it is the same statement with a different answer.
   */
  @Put(":decisionFlowId/selection")
  @HttpCode(200)
  async select(
    @Param("decisionFlowId", uuidParam("decisionFlowId"))
    decisionFlowId: string,
    @Body() body: unknown
  ) {
    const parsed = selectOfferingSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "Invalid selection"
      });

    return decisionContextSchema.parse(
      await this.attempt(() =>
        this.decisions.select(decisionFlowId, parsed.data.offeringId)
      )
    );
  }

  /**
   * Affiliate Handoff (`US-DEC-F05-001`).
   *
   * Public and unauthenticated (AC-1, AC-7): no Registration is required
   * before or after, and none is created. A `POST` because it is an
   * occurrence, and an explicit one — AC-5 makes the person choose it, so
   * nothing reaches this route by being followed.
   *
   * The response says where the person is being sent. Making that address the
   * active destination is the browser's part, and the surface that redirects
   * carries no tracking, no interstitial and no attribution: PRD-0003 leaves
   * redirect technology, affiliate-network integration and external-success
   * tracking outside V1.
   */
  @Post(":decisionFlowId/affiliate-handoff")
  @HttpCode(200)
  async handoff(
    @Param("decisionFlowId", uuidParam("decisionFlowId"))
    decisionFlowId: string
  ) {
    return affiliateHandoffSchema.parse(
      await this.attempt(() => this.decisions.initiateHandoff(decisionFlowId))
    );
  }

  /**
   * Which Direct Contact channels exist (`US-DEC-F06-001` AC-5, AC-6).
   *
   * Public, and deliberately so: knowing that a telephone number exists is not
   * being told it, and the choice AC-5 requires has to be offerable before
   * anything is revealed. `revealable` is what a Guest is missing.
   */
  @Get(":decisionFlowId/direct-contact")
  async channels(
    @Param("decisionFlowId", uuidParam("decisionFlowId"))
    decisionFlowId: string,
    @Req() request: FastifyRequest
  ) {
    const authenticated = await this.isEnabledUser(request);
    return contactChannelsSchema.parse(
      await this.attempt(() =>
        this.decisions.contactChannels(decisionFlowId, authenticated)
      )
    );
  }

  /**
   * Revealing one channel (AC-1, AC-9, AC-10).
   *
   * The only route in Decision that requires authentication. A Guest is
   * refused with `401` and told nothing else — AC-7 sends them to UX-0008 with
   * the interrupted action, and the action is exactly this request, which they
   * may repeat unchanged after signing in. AC-8's re-evaluation is then not a
   * separate mechanism: every gate is checked again because the request is
   * simply made again.
   */
  @Post(":decisionFlowId/direct-contact")
  @HttpCode(200)
  async reveal(
    @Param("decisionFlowId", uuidParam("decisionFlowId"))
    decisionFlowId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolve(request);

    const parsed = revealContactSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "Choose one available contact channel"
      });

    return directContactRevealSchema.parse(
      await this.attempt(() =>
        this.decisions.revealContact({
          channel: parsed.data.channel,
          decisionFlowId,
          userId: principal.userId
        })
      )
    );
  }

  /**
   * Whether this request carries an Enabled authenticated User.
   *
   * Asked by trying to resolve one, because that is the only answer that means
   * anything: `PrincipalResolver` refuses a Suspended holder, who keeps the
   * Guest baseline and must be treated as a Guest here (AC-1, AC-6).
   */
  private async isEnabledUser(request: FastifyRequest): Promise<boolean> {
    try {
      await this.principals.resolve(request);
      return true;
    } catch {
      return false;
    }
  }

  private async attempt<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch (error) {
      // AC-11. Nothing revealed, nothing recorded — so Completion sees none.
      if (error instanceof DirectContactUnavailableError)
        throw new UnprocessableEntityException({
          code: error.reason,
          message:
            error.reason === "NOTHING_SELECTED"
              ? "Select an Offering before continuing"
              : error.reason === "OFFERING_INELIGIBLE"
                ? "That Offering is no longer publicly eligible"
                : error.reason === "NO_CHANNEL"
                  ? "This Business supplied no contact channel"
                  : "Choose one of the available contact channels"
        });
      // AC-4 and AC-9. An unavailable handoff is refused and nothing is
      // recorded, so `US-DEC-F07-001` sees no Completion for it.
      if (error instanceof HandoffUnavailableError)
        throw new UnprocessableEntityException({
          code: error.reason,
          message:
            error.reason === "NOTHING_SELECTED"
              ? "Select an Offering before continuing"
              : error.reason === "OFFERING_INELIGIBLE"
                ? "That Offering is no longer publicly eligible"
                : "This Offering has no eligible Affiliate Destination"
        });
      // A flow is current-flow state; it is allowed to disappear, and one that
      // never existed says exactly the same thing.
      if (error instanceof DecisionFlowNotFoundError)
        throw new NotFoundException({
          code: "DECISION_FLOW_NOT_FOUND",
          message: "That Decision flow has expired or never existed"
        });
      // AC-3. Selecting something the context does not contain is refused, and
      // the selection that was already there is untouched.
      if (error instanceof SelectionNotInContextError)
        throw new UnprocessableEntityException({
          code: "SELECTION_NOT_IN_CONTEXT",
          message: "Select an Offering from the current Decision Context"
        });
      throw error;
    }
  }
}

/**
 * Decision Chat (`US-DEC-F03-001`).
 *
 * Public for a Guest, an Enabled User, a Business context, an Admin context
 * and a Suspended account through its Guest baseline (AC-1) — which is to say
 * it resolves no principal at all, so there is nothing that could differ. No
 * account is required before, during or after (AC-2), and none is created.
 */
@Controller("decision/flows/:decisionFlowId/chat")
export class DecisionChatController {
  constructor(private readonly chat: ChatService) {}

  /// The conversation so far, for this flow only.
  @Get()
  async history(
    @Param("decisionFlowId", uuidParam("decisionFlowId"))
    decisionFlowId: string
  ) {
    return decisionChatSchema.parse(
      await this.attempt(() => this.chat.history(decisionFlowId))
    );
  }

  /**
   * Asking (AC-3 to AC-6).
   *
   * A `POST` because asking is an occurrence: the first question on a valid
   * context produces Decision Chat Start. A context that is no longer valid is
   * refused before the assistant is consulted, so nothing is said about an
   * Offering that stopped being eligible.
   */
  @Post()
  @HttpCode(200)
  async ask(
    @Param("decisionFlowId", uuidParam("decisionFlowId"))
    decisionFlowId: string,
    @Body() body: unknown
  ) {
    const parsed = askDecisionSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "Invalid question"
      });

    return decisionChatSchema.parse(
      await this.attempt(() =>
        this.chat.ask({
          decisionFlowId,
          priorities: parsed.data.priorities,
          question: parsed.data.question
        })
      )
    );
  }

  private async attempt<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch (error) {
      if (error instanceof DecisionFlowNotFoundError)
        throw new NotFoundException({
          code: "DECISION_FLOW_NOT_FOUND",
          message: "That Decision flow has expired or never existed"
        });
      // AC-3. Chat begins only on a valid current Decision Context, so an
      // invalid one is refused rather than answered around.
      if (error instanceof DecisionContextInvalidError)
        throw new UnprocessableEntityException({
          code: "DECISION_CONTEXT_INVALID",
          message: "Repair the Decision Context before continuing"
        });
      // AC-6. Better to say nothing than to say a figure nobody published.
      if (error instanceof AssistantInventedValueError)
        throw new UnprocessableEntityException({
          code: "ASSISTANT_INVENTED_VALUE",
          message: "That question could not be answered from this Offering"
        });
      throw error;
    }
  }
}
