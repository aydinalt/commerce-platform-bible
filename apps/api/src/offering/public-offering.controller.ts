import { Controller, Get, NotFoundException, Param } from "@nestjs/common";

import { publicOfferingSchema } from "@commerce/contracts";

import { PgDiscoveryRepository } from "../persistence/pg-discovery.repository.js";

/**
 * Opening an Offering (`US-DSC-F09-001`).
 *
 * Public and unauthenticated, like Discovery itself. It reads the Discovery
 * projection rather than the Offering aggregate, which is what makes AC-4 true
 * without a check: the projection holds an Offering only while its final
 * Offering Public Eligibility is Eligible, so an Offering that stopped being
 * eligible after its Listing Card was drawn is not there to be opened.
 *
 * The route answers the identity and nothing else. It starts no Compare, no
 * Decision Chat, no Affiliate Handoff and no Direct Contact — AC-6 — and it
 * records no occurrence: `Offering Presentation Open` belongs to PRD-0001 §8.2.1
 * and occurs when complete Presentation successfully begins, which
 * `US-OFR-F05-001` owns.
 */
@Controller("offerings")
export class PublicOfferingController {
  constructor(private readonly discovery: PgDiscoveryRepository) {}

  /**
   * AC-7. An Offering that cannot be opened is absent rather than refused, and
   * says nothing about why: a retired Offering, a Restricted Business and a
   * slug that never existed are indistinguishable from outside, which is the
   * only answer that leaks nothing.
   */
  @Get(":slug")
  async get(@Param("slug") slug: string) {
    const offering = await this.discovery.publicOffering(slug);
    if (!offering)
      throw new NotFoundException({
        code: "OFFERING_NOT_FOUND",
        message: "No publicly eligible Offering matches that address"
      });
    return publicOfferingSchema.parse(offering);
  }
}
