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
  UnprocessableEntityException
} from "@nestjs/common";
import { z } from "zod";

import {
  addComparisonMemberSchema,
  comparisonSetSchema,
  comparisonViewSchema
} from "@commerce/contracts";
import {
  ComparisonMemberRefusedError,
  ComparisonSetNotFoundError
} from "@commerce/decision";

import { PgComparisonRepository } from "../persistence/pg-comparison.repository.js";

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
