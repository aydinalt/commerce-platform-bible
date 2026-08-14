import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException
} from "@nestjs/common";

import {
  BoundedCorrectionUnavailableError,
  CorrectionAreaNotTargetedError,
  type CorrectionManagementArea,
  type OwnerIntent
} from "@commerce/business";
import type { RequestCorrection, SaveCorrection } from "@commerce/contracts";
import type { Principal } from "@commerce/identity";
import {
  AttributeValueMismatchError,
  PublicationMinimumError
} from "@commerce/offering";

import { PgCommerceRepository } from "../persistence/pg-commerce.repository.js";
import {
  PgCorrectionRepository,
  type CorrectionNoticeRecord
} from "../persistence/pg-correction.repository.js";
import { PgOfferingContentRepository } from "../persistence/pg-offering-content.repository.js";

/**
 * What each management area needs before a notice may point at it (AC-4).
 *
 * A notice always states its target; whether it can be *opened* is a live
 * question about the owner right now. Asking it as an ordinary owner intent is
 * the point of AC-7: the correction path grants nothing, so the answer is the
 * one the owner would have got without any notice at all.
 */
const AREA_INTENT: Record<CorrectionManagementArea, OwnerIntent> = {
  AFFILIATE_DESTINATION: "MANAGE_AFFILIATE_DESTINATION",
  BUSINESS_INFORMATION: "MANAGE_INFORMATION",
  OFFERING_CONTENT: "VIEW_OWNED"
};

@Injectable()
export class CorrectionService {
  constructor(
    private readonly corrections: PgCorrectionRepository,
    private readonly content: PgOfferingContentRepository,
    private readonly commerce: PgCommerceRepository
  ) {}

  /**
   * Platform records Request Correction (PRD-0006 §7.3).
   *
   * The minimum Business needs something to respond to. The seven-action
   * General Moderation set, re-review and case closure stay with PRD-0006 and
   * are not implemented here, which is AC-15 — an unimplemented action cannot
   * be performed by accident.
   */
  async request(
    businessId: string,
    input: RequestCorrection,
    principal: Principal
  ): Promise<CorrectionNoticeRecord> {
    const notice = await this.corrections.request({
      businessId,
      contentArea: input.contentArea ?? null,
      note: input.note ?? null,
      offeringId: input.offeringId ?? null,
      requestedBy: principal.userId,
      target: input.target
    });
    if (!notice)
      throw new NotFoundException({
        code: "BUSINESS_NOT_FOUND",
        message: "No Business matches that identifier"
      });
    return notice;
  }

  /**
   * The owner's correction notices (AC-3).
   *
   * Reading them changes nothing — not the case, not the Offering, not the
   * Business (AC-5) — and there is no reply to write, because AC-6 leaves no
   * conversation for one to belong to.
   */
  async notices(
    businessId: string,
    principal: Principal
  ): Promise<CorrectionNoticeRecord[]> {
    await this.assertOwner(businessId, principal);
    const notices = await this.corrections.listNotices(businessId);
    return Promise.all(
      notices.map(async (notice) => ({
        ...notice,
        managementArea: (await this.authorized(
          businessId,
          principal,
          notice.managementArea
        ))
          ? notice.managementArea
          : null
      }))
    );
  }

  /**
   * One bounded correction save (§8.3.1).
   *
   * The gates are enforced where the change happens rather than here, so that
   * a case closed a moment ago cannot be answered by a request that checked it
   * a moment earlier. This translates the refusals into named errors and adds
   * nothing to them.
   */
  async save(
    businessId: string,
    correctionRequestId: string,
    input: SaveCorrection,
    principal: Principal
  ): Promise<unknown> {
    await this.assertOwner(businessId, principal);
    try {
      const saved = await this.content.saveCorrection({
        area: input.area,
        attributes: input.area === "ATTRIBUTES" ? input.attributes : null,
        businessId,
        correctionRequestId,
        correlationId: principal.correlationId,
        summary: input.area === "SUMMARY" ? input.summary : null,
        title: input.area === "TITLE" ? input.title : null,
        userId: principal.userId
      });
      if (!saved)
        throw new NotFoundException({
          code: "CORRECTION_NOT_FOUND",
          message: "No Offering-content correction matches that identifier"
        });
      return saved;
    } catch (error) {
      if (error instanceof CorrectionAreaNotTargetedError)
        // AC-9 and AC-10. Not a validation failure — a request to change
        // something this notice never asked about.
        throw new ForbiddenException({
          code: "CORRECTION_AREA_NOT_TARGETED",
          message:
            "A bounded correction may change only the content area the notice identified"
        });
      if (error instanceof BoundedCorrectionUnavailableError)
        throw new ConflictException({
          code: "BOUNDED_CORRECTION_UNAVAILABLE",
          message:
            "The bounded correction path requires an Open case and a Published or Hidden Offering",
          reason: error.reason
        });
      if (error instanceof PublicationMinimumError)
        // AC-11. A correction that left the Offering below the minimum would
        // leave something publicly promised and incomplete.
        //
        // The shortfalls travel in `fieldErrors`, which is where the error
        // envelope carries them. A top-level `shortfalls` key was dropped in
        // transit, so the caller was told the minimum failed and never which
        // part of it — the same explanation the ordinary edit path publishes.
        throw new UnprocessableEntityException({
          code: "PUBLICATION_MINIMUM_NOT_SATISFIED",
          fieldErrors: { publicationMinimum: error.shortfalls },
          message: "The saved correction must keep the Offering publishable"
        });
      if (error instanceof AttributeValueMismatchError)
        throw new UnprocessableEntityException({
          code: "ATTRIBUTE_VALUE_MISMATCH",
          message: "A value does not match its Attribute definition"
        });
      throw error;
    }
  }

  /// Ownership, asked the ordinary way. A Business this person does not own is
  /// absent rather than forbidden.
  private async assertOwner(
    businessId: string,
    principal: Principal
  ): Promise<void> {
    if (
      principal.businessId !== undefined &&
      principal.businessId !== businessId
    )
      throw new NotFoundException();
    const access = await this.commerce.canAuthorOfferings(
      businessId,
      principal.userId,
      "VIEW_OWNED"
    );
    if (!access.allowed) throw new NotFoundException();
  }

  private async authorized(
    businessId: string,
    principal: Principal,
    area: CorrectionManagementArea | null
  ): Promise<boolean> {
    if (area === null) return false;
    const access = await this.commerce.canAuthorOfferings(
      businessId,
      principal.userId,
      AREA_INTENT[area]
    );
    return access.allowed;
  }
}
