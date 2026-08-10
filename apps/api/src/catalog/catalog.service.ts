import {
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import type {
  CreateCategory,
  RenameCategory,
  ReparentCategory
} from "@commerce/contracts";
import type { Principal } from "@commerce/identity";
import {
  CategoryCycleError,
  CategoryDomainMismatchError,
  CategoryKeyConflictError,
  CategoryParentRetiredError,
  CategoryRetirementBlockedError,
  type CategoryRecord
} from "@commerce/catalog";

import { PgCatalogRepository } from "../persistence/pg-catalog.repository.js";

@Injectable()
export class CatalogService {
  constructor(private readonly repository: PgCatalogRepository) {}

  list(): Promise<CategoryRecord[]> {
    return this.repository.list();
  }

  /**
   * Creates a root or a child from one request (`US-PLT-F08-001` AC-1, AC-2).
   * Which one it is was already decided by the contract, so nothing here has to
   * guess: a Domain means a root, a parent means a child.
   */
  async create(
    input: CreateCategory,
    principal: Principal
  ): Promise<CategoryRecord> {
    try {
      if ("domain" in input)
        return await this.repository.createRoot({
          correlationId: principal.correlationId,
          domain: input.domain,
          name: input.name,
          slug: input.slug,
          stableKey: input.stableKey,
          userId: principal.userId
        });

      const created = await this.repository.createChild({
        correlationId: principal.correlationId,
        name: input.name,
        parentId: input.parentId,
        slug: input.slug,
        stableKey: input.stableKey,
        userId: principal.userId
      });
      if (!created) throw this.absent();
      return created;
    } catch (error) {
      throw this.reported(error);
    }
  }

  async rename(
    categoryId: string,
    input: RenameCategory,
    principal: Principal
  ): Promise<CategoryRecord> {
    const renamed = await this.repository.rename({
      categoryId,
      correlationId: principal.correlationId,
      name: input.name,
      userId: principal.userId
    });
    if (!renamed) throw this.absent();
    return renamed;
  }

  async reparent(
    categoryId: string,
    input: ReparentCategory,
    principal: Principal
  ): Promise<CategoryRecord> {
    try {
      const moved = await this.repository.reparent({
        categoryId,
        correlationId: principal.correlationId,
        parentId: input.parentId,
        userId: principal.userId
      });
      if (!moved) throw this.absent();
      return moved;
    } catch (error) {
      throw this.reported(error);
    }
  }

  async retire(
    categoryId: string,
    principal: Principal
  ): Promise<CategoryRecord> {
    try {
      const retired = await this.repository.retire({
        categoryId,
        correlationId: principal.correlationId,
        userId: principal.userId
      });
      if (!retired) throw this.absent();
      return retired;
    } catch (error) {
      throw this.reported(error);
    }
  }

  private absent(): NotFoundException {
    return new NotFoundException({
      code: "CATEGORY_NOT_FOUND",
      message: "No Category matches that identifier"
    });
  }

  /**
   * Every refusal the database raised, reported as itself.
   *
   * AC-16 requires that a failed action claims no Category result. The rollback
   * already guarantees that; what this adds is that the caller learns *which*
   * rule refused, rather than a single indistinguishable failure.
   */
  private reported(error: unknown): unknown {
    if (error instanceof CategoryCycleError)
      return new ConflictException({
        code: "CATEGORY_ANCESTRY_CYCLE",
        message: "A Category cannot become its own ancestor"
      });
    if (error instanceof CategoryDomainMismatchError)
      return new ConflictException({
        code: "CATEGORY_DOMAIN_MISMATCH",
        message: "A Category may only be parented within its own Domain"
      });
    if (error instanceof CategoryParentRetiredError)
      return new ConflictException({
        code: "CATEGORY_PARENT_RETIRED",
        message: "A retired Category accepts no new child"
      });
    if (error instanceof CategoryRetirementBlockedError)
      return new ConflictException({
        code: "CATEGORY_RETIREMENT_BLOCKED",
        message:
          error.blocker === "ACTIVE_CHILD"
            ? "An active child Category remains"
            : "A Draft, Published or Hidden Offering remains assigned"
      });
    if (error instanceof CategoryKeyConflictError)
      return new ConflictException({
        code: "CATEGORY_KEY_CONFLICT",
        message:
          error.conflict === "SLUG"
            ? "A Category with this slug already exists in the Domain"
            : "A Category with this stable key already exists"
      });
    return error;
  }
}
