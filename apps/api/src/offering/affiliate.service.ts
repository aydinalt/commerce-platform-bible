import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import type { AuthorAffiliateDestination } from "@commerce/contracts";
import type { Principal } from "@commerce/identity";
import {
  AffiliateDestinationExistsError,
  AffiliateDestinationReadOnlyError,
  type AffiliateDestinationRecord
} from "@commerce/offering";

import { PgAffiliateRepository } from "../persistence/pg-affiliate.repository.js";
import { PgCommerceRepository } from "../persistence/pg-commerce.repository.js";

const TARGET_TYPE = "AffiliateDestination";

@Injectable()
export class AffiliateService {
  constructor(
    private readonly destinations: PgAffiliateRepository,
    private readonly commerce: PgCommerceRepository
  ) {}

  /**
   * AC-6. The owner sees the current status, validation result and Handoff
   * Eligibility — including for an Archived Offering, whose destination is
   * view-only rather than invisible (AC-7).
   */
  async get(
    businessId: string,
    offeringId: string,
    principal: Principal
  ): Promise<AffiliateDestinationRecord> {
    await this.authorize(businessId, offeringId, principal, "read");
    const destination = await this.destinations.findOwned(
      businessId,
      offeringId
    );
    if (!destination) throw this.absent();
    return destination;
  }

  async create(
    businessId: string,
    offeringId: string,
    input: AuthorAffiliateDestination,
    principal: Principal
  ): Promise<AffiliateDestinationRecord> {
    await this.authorize(businessId, offeringId, principal, "create");
    return this.attempt(businessId, principal, "create", () =>
      this.destinations.create({
        businessId,
        correlationId: principal.correlationId,
        offeringId,
        reference: input.reference,
        userId: principal.userId
      })
    );
  }

  async edit(
    businessId: string,
    offeringId: string,
    input: AuthorAffiliateDestination,
    principal: Principal
  ): Promise<AffiliateDestinationRecord> {
    await this.authorize(businessId, offeringId, principal, "edit");
    return this.attempt(businessId, principal, "edit", () =>
      this.destinations.edit({
        businessId,
        correlationId: principal.correlationId,
        offeringId,
        reference: input.reference,
        userId: principal.userId
      })
    );
  }

  /**
   * The Business access gate PRD-0001 §9.2 defers to PRD-0005 for.
   *
   * A Restricted Business is refused authoring for the same reason it is
   * refused a Published edit: the destination is part of what the platform
   * would put in front of a person on its behalf. Reading is left alone —
   * management visibility is separate from public exposure.
   */
  private async authorize(
    businessId: string,
    offeringId: string,
    principal: Principal,
    action: "create" | "edit" | "read"
  ): Promise<void> {
    const deny = (reason: string) =>
      this.denied(businessId, principal, action, offeringId, reason);

    if (
      principal.businessId !== undefined &&
      principal.businessId !== businessId
    ) {
      await deny("BUSINESS_CONTEXT_NOT_SELECTED");
      throw new NotFoundException();
    }

    const access = await this.commerce.canAuthorOfferings(
      businessId,
      principal.userId
    );
    const restricted = !access.allowed && access.reason === "RESTRICTED";
    if (!access.allowed && !restricted) {
      await deny(access.reason);
      throw new NotFoundException();
    }
    if (restricted && action !== "read") {
      await deny("BUSINESS_RESTRICTED");
      throw new ForbiddenException({
        code: "BUSINESS_RESTRICTED",
        message: "A Restricted Business may not author an Affiliate Destination"
      });
    }
  }

  private async attempt(
    businessId: string,
    principal: Principal,
    action: "create" | "edit",
    work: () => Promise<AffiliateDestinationRecord | null>
  ): Promise<AffiliateDestinationRecord> {
    try {
      const destination = await work();
      if (!destination) throw this.absent();
      return destination;
    } catch (error) {
      if (error instanceof AffiliateDestinationExistsError) {
        await this.denied(
          businessId,
          principal,
          action,
          null,
          "ALREADY_EXISTS"
        );
        // AC-2. Zero or one — a second is not a second destination, it is a
        // request to replace the one that exists, which is an edit.
        throw new ConflictException({
          code: "AFFILIATE_DESTINATION_EXISTS",
          message: "This Offering already has an Affiliate Destination"
        });
      }
      if (error instanceof AffiliateDestinationReadOnlyError) {
        await this.denied(
          businessId,
          principal,
          action,
          null,
          "OFFERING_ARCHIVED"
        );
        // AC-7.
        throw new ForbiddenException({
          code: "AFFILIATE_DESTINATION_READ_ONLY",
          message:
            "An Archived Offering and its Affiliate Destination are view-only"
        });
      }
      throw error;
    }
  }

  private absent(): NotFoundException {
    return new NotFoundException({
      code: "AFFILIATE_DESTINATION_NOT_FOUND",
      message: "No owned Offering or Affiliate Destination matches"
    });
  }

  private async denied(
    businessId: string,
    principal: Principal,
    action: string,
    targetId: string | null,
    reason: string
  ): Promise<void> {
    await this.commerce.record({
      action: `offering.destination.${action}`,
      actorUserId: principal.userId,
      correlationId: principal.correlationId,
      effectiveBusinessId: businessId,
      reason,
      result: "DENIED",
      targetType: TARGET_TYPE,
      ...(targetId === null ? {} : { targetId })
    });
  }
}
