import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import type {
  AuthorAffiliateDestination,
  DestinationManagementEntry,
  ReviewAffiliateDestination,
  ValidateAffiliateDestination
} from "@commerce/contracts";
import type { Principal } from "@commerce/identity";
import {
  AffiliateDestinationExistsError,
  AffiliateDestinationReadOnlyError,
  AffiliateNotEnabledError,
  AffiliateNotValidatedError,
  permittedDestinationEntries,
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

  /**
   * The Business-side management entry (`US-BUS-F06-001`).
   *
   * One read answers three questions that a surface would otherwise have to
   * guess at separately: what the Offering is, what its destination currently
   * says, and what the owner may do about it. The third is composed from the
   * first two by the same rule the write path enforces, so an offered entry is
   * one that would be honoured (AC-2, AC-3).
   *
   * Everything the destination reports is copied, not computed. AC-4 and AC-5
   * leave status, validation result and Handoff Eligibility with PRD-0001, and
   * the surest way to leave a result alone is to have no expression here that
   * could produce it.
   */
  async managementEntry(
    businessId: string,
    offeringId: string,
    principal: Principal
  ): Promise<DestinationManagementEntry> {
    await this.authorize(businessId, offeringId, principal, "read");
    const offering = await this.destinations.findOwnedOffering(
      businessId,
      offeringId
    );
    // AC-1. No owned Offering, no entry — and no hint that one exists
    // elsewhere.
    if (!offering) throw this.absent();
    const destination = await this.destinations.findOwned(
      businessId,
      offeringId
    );
    return {
      destination,
      entries: permittedDestinationEntries({
        exists: destination !== null,
        lifecycle: offering.status,
        restricted: await this.restricted(businessId, principal.userId)
      }),
      offering
    };
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

    // AC-9. Viewing survives restriction outright; authoring survives only
    // where the Offering itself is still owner-manageable, which while
    // Restricted means a Draft. So the general gate is asked with the intent,
    // and the Offering's lifecycle decides the rest.
    const access = await this.commerce.canAuthorOfferings(
      businessId,
      principal.userId,
      action === "read" ? "VIEW_OWNED" : "MANAGE_AFFILIATE_DESTINATION"
    );
    if (!access.allowed) {
      await deny(access.reason);
      throw new NotFoundException();
    }
    if (action !== "read") {
      const restricted = await this.restricted(businessId, principal.userId);
      const lifecycle = await this.destinations.offeringLifecycle(offeringId);
      if (restricted && lifecycle !== "DRAFT") {
        await deny("BUSINESS_RESTRICTED");
        throw new ForbiddenException({
          code: "BUSINESS_RESTRICTED",
          message:
            "A Restricted Business may author an Affiliate Destination only on a Draft Offering"
        });
      }
    }
  }

  /**
   * Whether the Business is currently Restricted, asked of the one authority
   * that knows (`US-BUS-F03-001`).
   *
   * The question is put as "may this Business edit a Published Offering", and
   * a `RESTRICTED` refusal is the answer. Reading the moderation status
   * directly would be a second place that decides what restriction means.
   */
  private async restricted(
    businessId: string,
    userId: string
  ): Promise<boolean> {
    const editable = await this.commerce.canAuthorOfferings(
      businessId,
      userId,
      "EDIT_PUBLISHED"
    );
    return !editable.allowed && editable.reason === "RESTRICTED";
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

  /**
   * The four Platform administration actions (`US-OFR-F07-001`).
   *
   * They share one entry point because they share one authorization rule —
   * AC-1 admits only an authorized Admin — and one absence: none of them can
   * reach an Offering, a Business or an account, which is AC-12.
   */
  async administer(
    offeringId: string,
    action: "review" | "validate" | "enable" | "disable",
    input: ReviewAffiliateDestination | ValidateAffiliateDestination | null,
    principal: Principal
  ): Promise<AffiliateDestinationRecord> {
    try {
      const destination = await this.run(offeringId, action, input, principal);
      if (!destination)
        throw new NotFoundException({
          code: "AFFILIATE_DESTINATION_NOT_FOUND",
          message: "No Affiliate Destination matches that Offering"
        });
      return destination;
    } catch (error) {
      if (error instanceof AffiliateNotValidatedError)
        // AC-6. Enabling an unvalidated destination would make it publicly
        // reachable on the strength of a check nobody performed.
        throw new ConflictException({
          code: "AFFILIATE_NOT_VALIDATED",
          message: "Only a Valid Affiliate Destination may be enabled"
        });
      if (error instanceof AffiliateNotEnabledError)
        throw new ConflictException({
          code: "AFFILIATE_NOT_ENABLED",
          message: "Only an Enabled Affiliate Destination may be disabled"
        });
      throw error;
    }
  }

  /// The Admin's read, which owns no Business and needs none.
  async forAdmin(offeringId: string): Promise<AffiliateDestinationRecord> {
    const destination = await this.destinations.findForAdmin(offeringId);
    if (!destination)
      throw new NotFoundException({
        code: "AFFILIATE_DESTINATION_NOT_FOUND",
        message: "No Affiliate Destination matches that Offering"
      });
    return destination;
  }

  private run(
    offeringId: string,
    action: "review" | "validate" | "enable" | "disable",
    input: ReviewAffiliateDestination | ValidateAffiliateDestination | null,
    principal: Principal
  ): Promise<AffiliateDestinationRecord | null> {
    const common = {
      correlationId: principal.correlationId,
      offeringId,
      userId: principal.userId
    };
    if (action === "review")
      return this.destinations.review({
        ...common,
        note: (input as ReviewAffiliateDestination).note
      });
    if (action === "validate") {
      const verdict = input as ValidateAffiliateDestination;
      return this.destinations.validate({
        ...common,
        reason: verdict.reason,
        result: verdict.result
      });
    }
    if (action === "enable") return this.destinations.enable(common);
    return this.destinations.disable(common);
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
