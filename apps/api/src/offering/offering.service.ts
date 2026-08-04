import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import type { CreateDraftOffering } from "@commerce/contracts";
import type { Principal } from "@commerce/identity";
import {
  OfferingSlugConflictError,
  type DraftOfferingRecord
} from "@commerce/offering";

import { PgCommerceRepository } from "../persistence/pg-commerce.repository.js";

const CREATE_ACTION = "offering.draft.create";
const READ_ACTION = "offering.draft.read";
const TARGET_TYPE = "Offering";

@Injectable()
export class OfferingService {
  constructor(private readonly repository: PgCommerceRepository) {}

  async create(
    businessId: string,
    input: CreateDraftOffering,
    principal: Principal
  ): Promise<DraftOfferingRecord> {
    const deny = (reason: string) =>
      this.denied(CREATE_ACTION, businessId, principal, reason);

    if (!(await this.repository.isEnabled(principal.userId))) {
      await deny("ACCOUNT_NOT_ACTIVE");
      throw new ForbiddenException("Account is not active");
    }

    const access = await this.repository.canAuthorOfferings(
      businessId,
      principal.userId
    );
    if (!access.allowed) {
      await deny(access.reason);
      if (access.reason === "NOT_FOUND") throw new NotFoundException();
      throw new ForbiddenException("Business cannot author offerings");
    }

    if (!(await this.repository.isActiveCategory(input.categoryId))) {
      await deny("CATEGORY_NOT_ACTIVE");
      throw new NotFoundException("Category not found");
    }

    try {
      return await this.repository.create({
        businessId,
        categoryId: input.categoryId,
        correlationId: principal.correlationId,
        slug: input.slug,
        ...(input.summary === undefined ? {} : { summary: input.summary }),
        title: input.title,
        userId: principal.userId
      });
    } catch (error) {
      if (error instanceof OfferingSlugConflictError) {
        await deny("SLUG_CONFLICT");
        throw new ConflictException({
          code: "OFFERING_SLUG_CONFLICT",
          message: "An Offering with this slug already exists"
        });
      }
      throw error;
    }
  }

  async get(
    businessId: string,
    offeringId: string,
    principal: Principal
  ): Promise<DraftOfferingRecord> {
    const deny = (reason: string) =>
      this.denied(READ_ACTION, businessId, principal, reason, offeringId);

    if (!(await this.repository.isEnabled(principal.userId))) {
      await deny("ACCOUNT_NOT_ACTIVE");
      throw new ForbiddenException();
    }

    const access = await this.repository.canAuthorOfferings(
      businessId,
      principal.userId
    );
    if (!access.allowed) {
      await deny(access.reason);
      throw new NotFoundException();
    }

    const offering = await this.repository.findOwned(businessId, offeringId);
    if (!offering) {
      await deny("OFFERING_NOT_OWNED");
      throw new NotFoundException();
    }
    return offering;
  }

  /**
   * Denials are as auditable as successes: a refused attempt must leave the
   * same evidence trail an accepted one does.
   */
  private async denied(
    action: string,
    businessId: string,
    principal: Principal,
    reason: string,
    targetId?: string
  ): Promise<void> {
    await this.repository.record({
      action,
      actorUserId: principal.userId,
      correlationId: principal.correlationId,
      effectiveBusinessId: businessId,
      reason,
      result: "DENIED",
      ...(targetId === undefined ? {} : { targetId }),
      targetType: TARGET_TYPE
    });
  }
}
