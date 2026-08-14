import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { z } from "zod";

import {
  assignableCategoriesSchema,
  categoriesSchema,
  categorySchema,
  createCategorySchema,
  renameCategorySchema,
  reparentCategorySchema,
  type Categories
} from "@commerce/contracts";

import { OriginValidator } from "../security/origin.guard.js";
import { PrincipalResolver } from "../security/principal-resolver.js";
import { PgCatalogRepository } from "../persistence/pg-catalog.repository.js";
import { CatalogService } from "./catalog.service.js";

/**
 * The Categories an Offering may be assigned to (`US-OFR-F01-001` AC-4).
 *
 * Its own controller, and public, because it is neither Category management
 * nor Offering management: it answers "where could this go", which the same
 * catalogue already answers publicly through Browse. Putting it under
 * `admin/categories` would have made a Business owner's picker depend on an
 * Admin gate they will never pass.
 *
 * A read, and the same predicate creation enforces — so a Category offered
 * here is one creation would accept.
 */
@Controller("categories")
export class AssignableCategoryController {
  constructor(private readonly catalog: PgCatalogRepository) {}

  @Get("assignable")
  async assignable() {
    return assignableCategoriesSchema.parse({
      categories: await this.catalog.assignable()
    });
  }
}

const uuidParam = (name: string) =>
  new ParseUUIDPipe({
    exceptionFactory: () =>
      new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: { [name]: ["Expected a UUID"] },
        message: `Invalid ${name}`
      })
  });

/**
 * Category management (`US-PLT-F08-001`).
 *
 * The route set is deliberately narrow. Rename and reparent are separate
 * single-purpose replacements rather than one general update, and there is no
 * endpoint that accepts a Domain for an existing Category — so cross-Domain
 * migration is not something the API refuses, it is something the API cannot
 * express (AC-15). For the same reason retirement is its own sub-resource
 * rather than `DELETE`: nothing here deletes anything.
 */
@Controller("admin/categories")
export class CatalogController {
  constructor(
    private readonly catalog: CatalogService,
    private readonly principals: PrincipalResolver,
    private readonly origins: OriginValidator
  ) {}

  /// Includes retired Categories, whose definition stays readable (AC-14).
  @Get()
  async list(@Req() request: FastifyRequest): Promise<Categories> {
    await this.principals.resolveAdmin(request);
    return categoriesSchema.parse({ categories: await this.catalog.list() });
  }

  @Post()
  @HttpCode(201)
  async create(@Body() body: unknown, @Req() request: FastifyRequest) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolveAdmin(request);

    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message:
          "Provide a Domain for a root Category or a parent for a child, not both"
      });

    return categorySchema.parse(
      await this.catalog.create(parsed.data, principal)
    );
  }

  /// AC-3. The body carries a name and nothing that could move identity.
  @Put(":categoryId/name")
  async rename(
    @Param("categoryId", uuidParam("categoryId")) categoryId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolveAdmin(request);

    const parsed = renameCategorySchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "Invalid Category name"
      });

    return categorySchema.parse(
      await this.catalog.rename(categoryId, parsed.data, principal)
    );
  }

  /// AC-4. `null` promotes the Category to a root of the same Domain.
  @Put(":categoryId/parent")
  async reparent(
    @Param("categoryId", uuidParam("categoryId")) categoryId: string,
    @Body() body: unknown,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolveAdmin(request);

    const parsed = reparentCategorySchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "Invalid parent"
      });

    return categorySchema.parse(
      await this.catalog.reparent(categoryId, parsed.data, principal)
    );
  }

  /// AC-12 and AC-14. Retirement, not deletion — the definition survives.
  @Post(":categoryId/retirement")
  @HttpCode(200)
  async retire(
    @Param("categoryId", uuidParam("categoryId")) categoryId: string,
    @Req() request: FastifyRequest
  ) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolveAdmin(request);
    return categorySchema.parse(
      await this.catalog.retire(categoryId, principal)
    );
  }
}
