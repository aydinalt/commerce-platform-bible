import {
  ConflictException,
  ForbiddenException,
  Injectable
} from "@nestjs/common";

import type { CreateBusiness } from "@commerce/contracts";
import type { Principal } from "@commerce/identity";
import {
  BusinessSlugConflictError,
  type OwnedBusiness
} from "@commerce/business";

import { PgBusinessRepository } from "../persistence/pg-business.repository.js";
import { PgCommerceRepository } from "../persistence/pg-commerce.repository.js";

const CREATE_ACTION = "business.create";
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

  private async denied(principal: Principal, reason: string): Promise<void> {
    await this.audit.record({
      action: CREATE_ACTION,
      actorUserId: principal.userId,
      correlationId: principal.correlationId,
      reason,
      result: "DENIED",
      targetType: TARGET_TYPE
    });
  }
}
