import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import type {
  CreateBusiness,
  UpdateBusinessInformation
} from "@commerce/contracts";
import type { Principal } from "@commerce/identity";
import {
  BusinessSlugConflictError,
  type BusinessInformation,
  type OwnedBusiness
} from "@commerce/business";

import { PgBusinessRepository } from "../persistence/pg-business.repository.js";
import { PgCommerceRepository } from "../persistence/pg-commerce.repository.js";

const CREATE_ACTION = "business.create";
const UPDATE_ACTION = "business.information.update";
const TARGET_TYPE = "Business";

@Injectable()
export class BusinessService {
  constructor(
    private readonly repository: PgBusinessRepository,
    private readonly audit: PgCommerceRepository
  ) {}

  /**
   * Creates a Business owned by the acting person. No Admin approval precedes
   * it (`US-BUS-F01-001` AC-3), and the same account owns it — there is no
   * separate Business identity (AC-9).
   */
  /**
   * Applies an approved Restrict or Restore Business action.
   *
   * The repository moves the moderation status and makes the composed
   * eligibility true again on both sides. A Business that does not exist
   * answers as absent rather than as a refusal.
   */
  async moderate(
    businessId: string,
    status: "RESTRICTED" | "UNRESTRICTED"
  ): Promise<OwnedBusiness> {
    const moderated = await this.repository.moderate(businessId, status);
    if (!moderated)
      throw new NotFoundException({
        code: "BUSINESS_NOT_FOUND",
        message: "No Business matches that identifier"
      });
    return moderated;
  }

  async create(
    input: CreateBusiness,
    principal: Principal
  ): Promise<OwnedBusiness> {
    if (!(await this.repository.isEnabled(principal.userId))) {
      await this.denied(principal, "ACCOUNT_NOT_ACTIVE");
      throw new ForbiddenException("Account is not active");
    }

    try {
      const business = await this.repository.create({
        correlationId: principal.correlationId,
        name: input.name,
        slug: input.slug,
        userId: principal.userId
      });
      return business;
    } catch (error) {
      if (error instanceof BusinessSlugConflictError) {
        await this.denied(principal, "SLUG_CONFLICT");
        throw new ConflictException({
          code: "BUSINESS_SLUG_CONFLICT",
          message: "A Business with this slug already exists"
        });
      }
      throw error;
    }
  }

  /** The Businesses this person owns, available immediately after creation. */
  listOwned(principal: Principal): Promise<OwnedBusiness[]> {
    return this.repository.listOwned(principal.userId);
  }

  /**
   * Every Business Information field for the exact selected owned Business
   * (`US-BUS-F02-001` AC-1). Management visibility is deliberately wider than
   * public exposure (AC-13): an `Ineligible` Business is still fully visible to
   * the person who owns it.
   */
  async information(
    businessId: string,
    principal: Principal
  ): Promise<BusinessInformation> {
    const business = await this.repository.findOwnedInformation(
      businessId,
      principal.userId
    );
    if (!business) throw this.absent();
    return business;
  }

  /**
   * Saves the complete information set (AC-2). An inactive account is refused
   * before the write, and a Business this person does not own is reported as
   * absent rather than forbidden — the acting person has no standing to learn
   * that it exists.
   */
  async updateInformation(
    businessId: string,
    input: UpdateBusinessInformation,
    principal: Principal
  ): Promise<BusinessInformation> {
    if (!(await this.repository.isEnabled(principal.userId))) {
      await this.denied(principal, "ACCOUNT_NOT_ACTIVE", UPDATE_ACTION);
      throw new ForbiddenException("Account is not active");
    }

    const business = await this.repository.updateInformation({
      businessId,
      contactEmail: input.contactEmail,
      contactTelephone: input.contactTelephone,
      contactUrl: input.contactUrl,
      correlationId: principal.correlationId,
      logoUrl: input.logoUrl,
      name: input.name,
      shortDescription: input.shortDescription,
      userId: principal.userId
    });
    if (!business) {
      await this.denied(principal, "NOT_OWNED", UPDATE_ACTION);
      throw this.absent();
    }
    return business;
  }

  private absent(): NotFoundException {
    return new NotFoundException({
      code: "BUSINESS_NOT_FOUND",
      message: "No owned Business matches that identifier"
    });
  }

  private async denied(
    principal: Principal,
    reason: string,
    action: string = CREATE_ACTION
  ): Promise<void> {
    await this.audit.record({
      action,
      actorUserId: principal.userId,
      correlationId: principal.correlationId,
      reason,
      result: "DENIED",
      targetType: TARGET_TYPE
    });
  }
}
