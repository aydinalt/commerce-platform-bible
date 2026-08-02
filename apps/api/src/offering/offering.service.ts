import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import type { CreateDraftOffering } from "@commerce/contracts";
import type { Principal } from "@commerce/identity";

import { PgCommerceRepository } from "../persistence/pg-commerce.repository.js";

@Injectable()
export class OfferingService {
  constructor(private readonly repository: PgCommerceRepository) {}

  async create(
    businessId: string,
    input: CreateDraftOffering,
    principal: Principal
  ) {
    if (!(await this.repository.isEnabled(principal.userId)))
      throw new ForbiddenException("Account is not active");
    const access = await this.repository.canAuthorOfferings(
      businessId,
      principal.userId
    );
    if (!access.allowed) {
      if (access.reason === "NOT_FOUND") throw new NotFoundException();
      throw new ForbiddenException("Business cannot author offerings");
    }
    if (!(await this.repository.isActiveCategory(input.categoryId)))
      throw new NotFoundException("Category not found");
    return this.repository.create({
      businessId,
      categoryId: input.categoryId,
      correlationId: principal.correlationId,
      slug: input.slug,
      ...(input.summary === undefined ? {} : { summary: input.summary }),
      title: input.title,
      userId: principal.userId
    });
  }

  async get(businessId: string, offeringId: string, principal: Principal) {
    if (!(await this.repository.isEnabled(principal.userId)))
      throw new ForbiddenException();
    const access = await this.repository.canAuthorOfferings(
      businessId,
      principal.userId
    );
    if (!access.allowed) throw new NotFoundException();
    const offering = await this.repository.findOwned(businessId, offeringId);
    if (!offering) throw new NotFoundException();
    return offering;
  }
}
