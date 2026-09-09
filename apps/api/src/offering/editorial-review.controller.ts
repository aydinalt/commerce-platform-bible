import { Controller, Get, Param, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { editorialReviewViewSchema } from "@commerce/contracts";

import { PgEditorialRepository } from "../persistence/pg-editorial.repository.js";
import { OriginValidator } from "../security/origin.guard.js";

/**
 * The editorial review, as a reader meets it (I93, `EDT F01`).
 *
 * **A route of its own rather than a field on the Offering presentation**, and
 * the reason is `UX-0003` **Frozen v1.2** §8.9.2: _"an outage is not entitled
 * to make the claim 'there is no review'"_. Folded into the presentation, a
 * failed editorial read would have exactly two ways to end — take the whole
 * page down, or answer `null` and tell the reader the product has no review.
 * The first is disproportionate and the second is the lie the section forbids.
 * Fetched separately, the two answers are distinguishable: a 200 carrying
 * `review: null` means there is none, and a failure means the screen does not
 * know and must say so. The crowd reviews of §8.6 are fetched the same way for
 * the same reason.
 *
 * **Keyed by Product Key rather than by Offering**, because that is what a
 * review is about (`US-EDT-F01-001` AC-1). The same review answers for every
 * seller of the product, unduplicated (AC-8), and it keeps answering after the
 * seller a reader arrived through has gone (AC-9).
 *
 * Reading records nothing (`PRD-0009` §13.8). It is published content, not an
 * act on a target.
 */
@Controller("products")
export class EditorialReviewController {
  constructor(
    private readonly editorial: PgEditorialRepository,
    private readonly origins: OriginValidator
  ) {}

  /**
   * `AC-7`, `AC-14`: the review of this Product Key, or the honest empty
   * answer. A key with no review returns `review: null`, and the screen
   * presents nothing at all rather than a placeholder — most products will have
   * no review, and an empty frame implies a missing thing rather than an absent
   * one.
   */
  @Get(":productKey/editorial-review")
  async review(
    @Param("productKey") productKey: string,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, false);
    const review = await this.editorial.published(productKey);
    return editorialReviewViewSchema.parse({ review });
  }
}
