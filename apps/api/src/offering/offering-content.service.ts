import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException
} from "@nestjs/common";

import type { EditOffering } from "@commerce/contracts";
import type { Principal } from "@commerce/identity";
import {
  AttributeValueMismatchError,
  BusinessRestrictedError,
  OfferingAlreadyArchivedError,
  OfferingNotEditableError,
  OfferingNotPublishableError,
  PublicationMinimumError
} from "@commerce/offering";

import {
  PgOfferingContentRepository,
  type OfferingContentRecord
} from "../persistence/pg-offering-content.repository.js";
import { PgCommerceRepository } from "../persistence/pg-commerce.repository.js";

const EDIT_ACTION = "offering.content.edit";
const PUBLISH_ACTION = "offering.publish";
const TARGET_TYPE = "Offering";

/**
 * The lifecycle states a Restricted Business may still edit.
 *
 * `US-OFR-F02-001` AC-8 removes normal Published and Hidden editing from a
 * Restricted Business but §5 keeps its Draft management. AC-9 allows one
 * exception — the bounded correction-edit path — which requires an Open
 * Offering-content correction case owned by `US-PLT-F06-001`. No such case can
 * exist yet, so the exception has no way to be exercised and is not offered.
 */
const RESTRICTED_EDITABLE = ["DRAFT"];

@Injectable()
export class OfferingContentService {
  constructor(
    private readonly content: PgOfferingContentRepository,
    private readonly commerce: PgCommerceRepository
  ) {}

  async edit(
    businessId: string,
    offeringId: string,
    input: EditOffering,
    principal: Principal
  ): Promise<OfferingContentRecord> {
    const deny = (reason: string) => this.denied(businessId, principal, reason);

    // Acting for a Business is explicit (`US-IDN-F07-001` AC-3), so an edit
    // aimed at a Business whose context is not selected is not an edit at all.
    if (
      principal.businessId !== undefined &&
      principal.businessId !== businessId
    ) {
      await deny("BUSINESS_CONTEXT_NOT_SELECTED");
      throw new NotFoundException();
    }
    if (!(await this.commerce.isEnabled(principal.userId))) {
      await deny("ACCOUNT_NOT_ACTIVE");
      throw new ForbiddenException("Account is not active");
    }

    const access = await this.commerce.canAuthorOfferings(
      businessId,
      principal.userId
    );
    // Restriction is a separate gate from ownership: it narrows what may be
    // edited (AC-8) rather than hiding the Offering.
    const restricted = !access.allowed && access.reason === "RESTRICTED";
    if (!access.allowed && !restricted) {
      await deny(access.reason);
      throw new NotFoundException();
    }

    const existing = await this.content.findOwned(businessId, offeringId);
    if (!existing) {
      await deny("OFFERING_NOT_OWNED");
      throw new NotFoundException();
    }

    // AC-8, read before the write so the refusal names the real reason rather
    // than surfacing as a publication-minimum failure later.
    if (restricted && !RESTRICTED_EDITABLE.includes(existing.status)) {
      await deny("BUSINESS_RESTRICTED");
      throw new ForbiddenException({
        code: "BUSINESS_RESTRICTED",
        message: "A Restricted Business may edit only its Draft Offerings"
      });
    }

    try {
      const edited = await this.content.edit({
        attributes: input.attributes,
        businessId,
        categoryId: input.categoryId,
        correlationId: principal.correlationId,
        offeringId,
        summary: input.summary,
        title: input.title,
        userId: principal.userId
      });
      if (!edited) {
        await deny("OFFERING_NOT_OWNED");
        throw new NotFoundException();
      }
      return edited;
    } catch (error) {
      throw await this.reported(error, businessId, principal);
    }
  }

  /**
   * Owner retirement (`US-OFR-F03-001` AC-1).
   *
   * A Restricted Business may still retire: PRD-0005's restriction gate governs
   * publication and normal editing, and nothing in this Story or in §6.4 makes
   * withdrawing your own Offering from circulation something a restriction
   * should prevent.
   */
  async retire(
    businessId: string,
    offeringId: string,
    principal: Principal
  ): Promise<OfferingContentRecord> {
    const deny = (reason: string) => this.denied(businessId, principal, reason);

    if (
      principal.businessId !== undefined &&
      principal.businessId !== businessId
    ) {
      await deny("BUSINESS_CONTEXT_NOT_SELECTED");
      throw new NotFoundException();
    }
    if (!(await this.commerce.isEnabled(principal.userId))) {
      await deny("ACCOUNT_NOT_ACTIVE");
      throw new ForbiddenException("Account is not active");
    }

    const access = await this.commerce.canAuthorOfferings(
      businessId,
      principal.userId
    );
    if (!access.allowed && access.reason !== "RESTRICTED") {
      await deny(access.reason);
      throw new NotFoundException();
    }

    try {
      const retired = await this.content.retire({
        businessId,
        correlationId: principal.correlationId,
        offeringId,
        userId: principal.userId
      });
      if (!retired) {
        await deny("OFFERING_NOT_OWNED");
        throw new NotFoundException();
      }
      return retired;
    } catch (error) {
      if (error instanceof OfferingAlreadyArchivedError) {
        await deny("OFFERING_ALREADY_ARCHIVED");
        // AC-9. Retirement is a transition *to* Archived, so there is no
        // second one to make — and PRD-0001 §6.4 allows none out of it either.
        throw new ConflictException({
          code: "OFFERING_ALREADY_ARCHIVED",
          message: "This Offering is already Archived"
        });
      }
      throw error;
    }
  }

  /**
   * Draft → Published (`US-OFR-F04-001`).
   *
   * The Restricted case is refused here as itself rather than being folded into
   * the ownership check: AC-2 is a gate a Business can clear later, and telling
   * someone their Offering was not found when their Business is restricted
   * would send them looking for the wrong problem.
   */
  async publish(
    businessId: string,
    offeringId: string,
    principal: Principal
  ): Promise<OfferingContentRecord> {
    const deny = (reason: string) =>
      this.denied(businessId, principal, reason, PUBLISH_ACTION);

    if (
      principal.businessId !== undefined &&
      principal.businessId !== businessId
    ) {
      await deny("BUSINESS_CONTEXT_NOT_SELECTED");
      throw new NotFoundException();
    }
    if (!(await this.commerce.isEnabled(principal.userId))) {
      await deny("ACCOUNT_NOT_ACTIVE");
      throw new ForbiddenException("Account is not active");
    }

    const access = await this.commerce.canAuthorOfferings(
      businessId,
      principal.userId
    );
    if (!access.allowed && access.reason !== "RESTRICTED") {
      await deny(access.reason);
      throw new NotFoundException();
    }

    try {
      const published = await this.content.publish({
        businessId,
        correlationId: principal.correlationId,
        offeringId,
        userId: principal.userId
      });
      if (!published) {
        await deny("OFFERING_NOT_OWNED");
        throw new NotFoundException();
      }
      return published;
    } catch (error) {
      if (error instanceof BusinessRestrictedError) {
        await deny("BUSINESS_RESTRICTED");
        throw new ForbiddenException({
          code: "BUSINESS_RESTRICTED",
          message: "A Restricted Business may not publish an Offering"
        });
      }
      if (error instanceof OfferingNotPublishableError) {
        await deny("OFFERING_NOT_DRAFT");
        // AC-1, and AC-8 from the other side: Published and Hidden are not
        // publication targets, and nothing offers a way back to Draft.
        throw new ConflictException({
          code: "OFFERING_NOT_DRAFT",
          message: "Only a Draft Offering may be published"
        });
      }
      if (error instanceof PublicationMinimumError) {
        await deny("PUBLICATION_MINIMUM");
        // AC-3 and AC-7. The Offering is still a Draft, because the whole
        // transaction was refused rather than partly applied.
        throw new UnprocessableEntityException({
          code: "PUBLICATION_MINIMUM_NOT_SATISFIED",
          fieldErrors: { publicationMinimum: error.shortfalls },
          message:
            "The Offering does not satisfy the Universal Publication Minimum"
        });
      }
      throw error;
    }
  }

  /// AC-6. An Admin reads the historical record without owning it.
  async forAdmin(offeringId: string): Promise<OfferingContentRecord> {
    const offering = await this.content.findForAdmin(offeringId);
    if (!offering)
      throw new NotFoundException({
        code: "OFFERING_NOT_FOUND",
        message: "No Offering matches that identifier"
      });
    return offering;
  }

  async get(
    businessId: string,
    offeringId: string,
    principal: Principal
  ): Promise<OfferingContentRecord> {
    if (
      principal.businessId !== undefined &&
      principal.businessId !== businessId
    )
      throw new NotFoundException();
    const access = await this.commerce.canAuthorOfferings(
      businessId,
      principal.userId
    );
    if (!access.allowed && access.reason !== "RESTRICTED")
      throw new NotFoundException();

    const offering = await this.content.findOwned(businessId, offeringId);
    if (!offering) throw new NotFoundException();
    return offering;
  }

  private async reported(
    error: unknown,
    businessId: string,
    principal: Principal
  ): Promise<unknown> {
    if (error instanceof OfferingNotEditableError) {
      await this.denied(businessId, principal, "OFFERING_ARCHIVED");
      // AC-7. Archived is historical: the Offering is there to be read, and
      // there is no edit that could apply to it.
      return new ForbiddenException({
        code: "OFFERING_ARCHIVED",
        message: "An Archived Offering is historical and cannot be edited"
      });
    }
    if (error instanceof PublicationMinimumError) {
      await this.denied(businessId, principal, "PUBLICATION_MINIMUM");
      // AC-5. The whole edit is refused, so the Offering keeps the content it
      // had — a Published Offering never becomes quietly incomplete.
      return new UnprocessableEntityException({
        code: "PUBLICATION_MINIMUM_NOT_SATISFIED",
        fieldErrors: { publicationMinimum: error.shortfalls },
        message:
          "The edit would leave the Offering below the Universal Publication Minimum"
      });
    }
    if (error instanceof AttributeValueMismatchError)
      return new UnprocessableEntityException({
        code: "ATTRIBUTE_VALUE_MISMATCH",
        fieldErrors: { attributes: [error.attributeId] },
        message:
          "A submitted value does not match the kind its Attribute declares"
      });
    return error;
  }

  private async denied(
    businessId: string,
    principal: Principal,
    reason: string,
    action: string = EDIT_ACTION
  ): Promise<void> {
    await this.commerce.record({
      action,
      actorUserId: principal.userId,
      correlationId: principal.correlationId,
      effectiveBusinessId: businessId,
      reason,
      result: "DENIED",
      targetType: TARGET_TYPE
    });
  }
}
