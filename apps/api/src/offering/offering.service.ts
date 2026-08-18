import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import { CategoryNotAssignableError } from "@commerce/catalog";
import type { CreateDraftOffering } from "@commerce/contracts";
import type { Principal } from "@commerce/identity";
import {
  OfferingSlugConflictError,
  type DraftOfferingRecord
} from "@commerce/offering";

import { PgCommerceRepository } from "../persistence/pg-commerce.repository.js";

const CREATE_ACTION = "offering.draft.create";
const INVENTORY_ACTION = "offering.inventory.read";
const READ_ACTION = "offering.draft.read";
const TARGET_TYPE = "Offering";

/**
 * `US-IDN-F07-001` AC-3 forbids choosing a Business silently, so a session must
 * have selected the Business it acts in. The baseline is `null` and is refused
 * here like any other Business: being signed in is not being somewhere.
 */
function actsFor(principal: Principal, businessId: string): boolean {
  return principal.businessId === businessId;
}

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

    if (!actsFor(principal, businessId)) {
      await deny("BUSINESS_CONTEXT_NOT_SELECTED");
      throw new ForbiddenException({
        code: "BUSINESS_CONTEXT_REQUIRED",
        message: "Select this Business context before acting in it"
      });
    }

    if (!(await this.repository.isEnabled(principal.userId))) {
      await deny("ACCOUNT_NOT_ACTIVE");
      throw new ForbiddenException("Account is not active");
    }

    // AC-6. Creating an Offering is one of the three acts restriction takes
    // away, so this is where a Restricted Business is stopped.
    const access = await this.repository.canAuthorOfferings(
      businessId,
      principal.userId,
      "CREATE_OFFERING"
    );
    if (!access.allowed) {
      await deny(access.reason);
      if (access.reason === "NOT_FOUND") throw new NotFoundException();
      throw new ForbiddenException("Business cannot author offerings");
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
      // `US-PLT-F08-001` AC-8 and AC-14. Reported as absence rather than as a
      // refusal: a Category that cannot take Offerings is not one the author is
      // being kept away from, it is one that is not there to be chosen.
      if (error instanceof CategoryNotAssignableError) {
        await deny("CATEGORY_NOT_ASSIGNABLE");
        throw new NotFoundException({
          code: "CATEGORY_NOT_FOUND",
          message: "No active leaf Category matches that identifier"
        });
      }
      throw error;
    }
  }

  /**
   * The owning Business management inventory (`US-OFR-F01-001` AC-5).
   *
   * A Restricted Business is refused *creation* by AC-6, but its owner may
   * still see what it already has: `US-BUS-F02-001` AC-13 keeps management
   * visibility separate from public exposure. So restriction is read here as a
   * reason to allow the read, not a reason to refuse it — the only refusal is
   * not owning the Business at all.
   */
  async inventory(businessId: string, principal: Principal) {
    const deny = (reason: string) =>
      this.denied(INVENTORY_ACTION, businessId, principal, reason);

    if (!actsFor(principal, businessId)) {
      await deny("BUSINESS_CONTEXT_NOT_SELECTED");
      throw new NotFoundException();
    }

    // AC-5. A Restricted owner still sees what they own.
    const access = await this.repository.canAuthorOfferings(
      businessId,
      principal.userId,
      "VIEW_OWNED"
    );
    if (!access.allowed) {
      await deny(access.reason);
      throw new NotFoundException();
    }

    return await this.repository.listInventory(businessId);
  }

  async get(
    businessId: string,
    offeringId: string,
    principal: Principal
  ): Promise<DraftOfferingRecord> {
    const deny = (reason: string) =>
      this.denied(READ_ACTION, businessId, principal, reason, offeringId);

    if (!actsFor(principal, businessId)) {
      await deny("BUSINESS_CONTEXT_NOT_SELECTED");
      throw new NotFoundException();
    }

    if (!(await this.repository.isEnabled(principal.userId))) {
      await deny("ACCOUNT_NOT_ACTIVE");
      throw new ForbiddenException();
    }

    // AC-5. Viewing an owned Published, Hidden or Archived Offering survives
    // restriction — this read used to refuse, which the Story corrects.
    const access = await this.repository.canAuthorOfferings(
      businessId,
      principal.userId,
      "VIEW_OWNED"
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
