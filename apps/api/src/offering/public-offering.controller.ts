import { Controller, Get, NotFoundException, Param } from "@nestjs/common";

import { offeringPresentationSchema } from "@commerce/contracts";

import { PgPresentationRepository } from "../persistence/pg-presentation.repository.js";

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
 */
@Controller("offerings")
export class PublicOfferingController {
  constructor(private readonly presentation: PgPresentationRepository) {}

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
}
