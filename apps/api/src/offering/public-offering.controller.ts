import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  NotFoundException,
  Param,
  Post,
  Req
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { z } from "zod";

import {
  complementaryPlacementsSchema,
  offeringPresentationSchema,
  productReviewsSchema,
  submitListingReportSchema,
  writeProductReviewSchema
} from "@commerce/contracts";

import { digest } from "../identity/secret.js";
import { PgComplementaryRepository } from "../persistence/pg-complementary.repository.js";
import { PgListingReportRepository } from "../persistence/pg-listing-report.repository.js";
import { PgPresentationRepository } from "../persistence/pg-presentation.repository.js";
import { PgReviewRepository } from "../persistence/pg-review.repository.js";
import { OriginValidator } from "../security/origin.guard.js";
import { PrincipalResolver } from "../security/principal-resolver.js";

/**
 * How many reviews one page carries.
 *
 * A number rather than a request parameter, because the surface that reads this
 * is the product page's Yorum tab and it shows a page of the most recent — not
 * an archive somebody browses. `total` travels beside the page so a surface can
 * say what it is not showing, which is the honest version of a fixed page size.
 */
const REVIEW_PAGE = 20;

/**
 * How many reports one caller may send in an hour (I69).
 *
 * Generous on purpose: somebody working through a category and finding four
 * stale prices is the best thing that can happen to a comparison platform, and
 * a limit that punished them would cost more than the noise it prevents. What
 * it stops is one source producing volume.
 */
const REPORT_LIMIT = 10;
const REPORT_WINDOW_MS = 60 * 60 * 1000;

/**
 * Complete public Offering Presentation (`US-OFR-F05-001`), reached by opening
 * a Listing Card (`US-DSC-F09-001`).
 *
 * Public and unauthenticated, like Discovery itself. It reads the Discovery
 * projection rather than the Offering aggregate, which is what makes the
 * eligibility gate true without a check: the projection holds an Offering only
 * while its final Offering Public Eligibility is Eligible, so an Offering that
 * stopped being eligible after its Listing Card was drawn is not there to be
 * opened.
 *
 * The response carries Presentation content and no action. Compare, Decision
 * Chat, Affiliate Handoff and Direct Contact are entries the experience offers
 * and other PRDs own; nothing here executes one, and there is no field through
 * which one could be started.
 *
 * **The one exception, and it is not an action on an Offering.** I62 adds the
 * product's reviews under the same address. Writing one is not a decision about
 * a listing — no handoff, no contact, no seller involved — it is a person
 * saying what they thought of the thing, and the thing is the product group
 * rather than any one shop's listing of it.
 */
@Controller("offerings")
export class PublicOfferingController {
  constructor(
    private readonly complementary: PgComplementaryRepository,
    private readonly presentation: PgPresentationRepository,
    private readonly principals: PrincipalResolver,
    private readonly origins: OriginValidator,
    private readonly reports: PgListingReportRepository,
    private readonly reviews: PgReviewRepository
  ) {}

  /**
   * `US-OFR-F05-001` AC-9 and `US-DSC-F09-001` AC-7. An Offering that cannot
   * be presented is absent rather than refused, and says nothing about why: a
   * retired Offering, a Restricted Business and a slug that never existed are
   * indistinguishable from outside, which is the only answer that leaks
   * nothing. No `Offering Presentation Open` occurs on this path.
   */
  @Get(":slug")
  async get(@Param("slug") slug: string) {
    const presented = await this.presentation.present(slug);
    if (!presented)
      throw new NotFoundException({
        code: "OFFERING_NOT_FOUND",
        message: "No publicly eligible Offering matches that address"
      });
    return offeringPresentationSchema.parse(presented);
  }

  /**
   * What people said about this product (I62).
   *
   * Public: a review is written to be read, and a page that hid other people's
   * opinions behind a sign-in would be asking a person to join before finding
   * out whether they want to buy. Signing in changes exactly one thing — the
   * reader's own review is marked `mine`, so the page can offer to edit it
   * rather than to write a second one.
   *
   * `writable` is answered here rather than left to the surface to guess:
   * whether this person may write is a fact about the request, and a form
   * offered to somebody who will be refused on submit is a worse answer than
   * no form.
   */
  @Get(":slug/reviews")
  async listReviews(
    @Param("slug") slug: string,
    @Req() request: FastifyRequest
  ) {
    const groupKey = await this.reviews.groupKeyOf(slug);
    if (groupKey === null)
      throw new NotFoundException({
        code: "OFFERING_NOT_FOUND",
        message: "No publicly eligible Offering matches that address"
      });

    const principal = await this.principals.resolveOptional(request);
    const viewerId = principal === null ? null : principal.userId;
    const page = await this.reviews.list({
      groupKey,
      limit: REVIEW_PAGE,
      viewerId
    });
    return productReviewsSchema.parse({
      rating: await this.reviews.rating(groupKey),
      reviews: page.reviews,
      total: page.total,
      writable: viewerId !== null
    });
  }

  /**
   * Writing, or replacing, one's own review of this product (I62).
   *
   * Authentication is required and the refusal says nothing more than that: a
   * Guest gets `401` and may repeat the identical request after signing in,
   * which is the same shape `US-DEC-F06-001` AC-7 gives the only other
   * authenticated public action.
   *
   * The response is the reviews as they now stand rather than the row that was
   * written. A person who has just scored something wants to see where their
   * score left the product, and returning the aggregate makes that one request
   * instead of two — with no window in which the page shows a review that the
   * average beside it has not counted.
   */
  @Post(":slug/reviews")
  @HttpCode(200)
  async writeReview(
    @Param("slug") slug: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolve(request);

    const parsed = writeProductReviewSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "A review is a whole number of stars from one to five"
      });

    const groupKey = await this.reviews.groupKeyOf(slug);
    const offeringId = await this.reviews.offeringOf(slug);
    if (groupKey === null || offeringId === null)
      throw new NotFoundException({
        code: "OFFERING_NOT_FOUND",
        message: "No publicly eligible Offering matches that address"
      });

    await this.reviews.write({
      body: parsed.data.body,
      groupKey,
      offeringId,
      rating: parsed.data.rating,
      userId: principal.userId
    });

    const page = await this.reviews.list({
      groupKey,
      limit: REVIEW_PAGE,
      viewerId: principal.userId
    });
    return productReviewsSchema.parse({
      rating: await this.reviews.rating(groupKey),
      reviews: page.reviews,
      total: page.total,
      writable: true
    });
  }

  /**
   * "Hata Bildir" — reporting that something on this listing is wrong (I69).
   *
   * **Open to a Guest, deliberately.** The Owner's requirement is to collect
   * the report, and the people best placed to notice a stale price are the ones
   * least likely to have an account. A signed-in reporter is recorded so a
   * pattern from one account is visible; nobody is asked to become one.
   *
   * `202` rather than `200`: what the platform has done is accept a claim, not
   * agree with it. A response that read as agreement would be the platform
   * telling somebody their report was right before anyone had looked.
   *
   * The refusal for too many reports is `429` and says so plainly. It is not
   * disguised as success — a person whose report was dropped is entitled to
   * know it was — and it does not say what the limit is, because that is a
   * number to tune rather than a promise to keep.
   */
  @Post(":slug/reports")
  @HttpCode(202)
  async report(
    @Param("slug") slug: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);

    const parsed = submitListingReportSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "A report names one of the listed reasons"
      });

    /*
     * The address is hashed and never stored raw, exactly as the sign-in
     * limiter treats it: it is a key for counting and nothing else, and a table
     * of readers' addresses beside the listings they complained about is not a
     * thing this platform should hold.
     */
    if (
      await this.reports.throttled({
        limit: REPORT_LIMIT,
        subjectHash: digest(request.ip),
        windowMs: REPORT_WINDOW_MS
      })
    )
      throw new HttpException(
        {
          code: "TOO_MANY_REPORTS",
          message: "Too many reports from this caller; try again later"
        },
        429
      );

    const offeringId = await this.reports.reportable(slug);
    if (offeringId === null)
      throw new NotFoundException({
        code: "OFFERING_NOT_FOUND",
        message: "No publicly eligible Offering matches that address"
      });

    const principal = await this.principals.resolveOptional(request);
    await this.reports.submit({
      note: parsed.data.note,
      offeringId,
      reason: parsed.data.reason,
      reporterUserId: principal === null ? null : principal.userId
    });
    return { received: true };
  }

  /**
   * What goes with this (I70).
   *
   * **Its own route, and the separation is the promise.** PRD-0006 §20.3
   * forbids advertising from changing what is publicly eligible, what matches a
   * query or what a Listing Card contains — and the way to keep a promise like
   * that is to make it structurally true rather than to remember it. The
   * Presentation payload is exactly the product minimum it has always been;
   * this is fetched beside it, by a route that reads nothing about the person.
   *
   * An empty list is the ordinary answer and is not a failure: advertising is
   * absent by default (§20.4), so a heading nobody has configured suggests
   * nothing and the page is complete without it.
   */
  @Get(":slug/complementary")
  async complementaryFor(@Param("slug") slug: string) {
    return complementaryPlacementsSchema.parse({
      placements: await this.complementary.forListing(slug)
    });
  }
}
