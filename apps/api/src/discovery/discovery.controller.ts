import { randomUUID } from "node:crypto";

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post
} from "@nestjs/common";
import { z } from "zod";

import {
  browseRootsSchema,
  browseSelectionSchema,
  browseViewSchema,
  type BrowseRoots
} from "@commerce/contracts";

import { PgDiscoveryRepository } from "../persistence/pg-discovery.repository.js";

/**
 * Path identifiers reach PostgreSQL `uuid` columns, so they are rejected at the
 * edge. Written out rather than shared with the other controllers: Discovery is
 * the public surface, and it should not import from an authenticated one to get
 * a validation pipe.
 */
function categoryIdParam(): ParseUUIDPipe {
  return new ParseUUIDPipe({
    exceptionFactory: () =>
      new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: { categoryId: ["Expected a UUID"] },
        message: "Invalid categoryId"
      })
  });
}

/**
 * Browse (`US-DSC-F03-001`).
 *
 * Public, and unauthenticated on purpose: `US-IDN-F01-001` makes Discovery
 * something a Guest does. Nothing here resolves a principal, so there is no
 * authenticated path to accidentally depend on.
 *
 * Everything a person sees comes from the Discovery projection, which exists
 * only for Offerings publication evaluated as Eligible and which retirement
 * removes. Final Offering Public Eligibility is therefore the only eligibility
 * input, exactly as PRD-0002 requires — not because this code checks it, but
 * because it reads a table that already answers it.
 */
@Controller("discovery")
export class DiscoveryController {
  constructor(private readonly discovery: PgDiscoveryRepository) {}

  /**
   * The active root Categories, by Domain. Choosing one of these begins a
   * Browse path, so nothing is recorded here: no Category has been selected
   * yet.
   */
  @Get("browse")
  async roots(): Promise<BrowseRoots> {
    return browseRootsSchema.parse({
      domains: await this.discovery.browseRoots()
    });
  }

  /**
   * Selecting a Category.
   *
   * A `POST` because selecting is an occurrence, not a page: AC-1 makes the
   * first selection of a path create a Discovery Start, and a `GET` that
   * quietly wrote one would be lying about what it does.
   *
   * The path identifier is server-issued and echoed back. A request that
   * carries one continues that path; a request without one begins a new path,
   * which is precisely AC-8's distinction.
   */
  @Post("browse/categories/:categoryId")
  @HttpCode(200)
  async browse(
    @Param("categoryId", categoryIdParam()) categoryId: string,
    @Body() body: unknown
  ) {
    const parsed = browseSelectionSchema.safeParse(body ?? {});
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "Invalid Browse selection"
      });

    const view = await this.discovery.browse({
      categoryId,
      pathId: parsed.data.discoveryPathId ?? randomUUID()
    });
    // AC-4. A retired Category is absent rather than refused, so it answers the
    // same way as one that was never there.
    if (!view)
      throw new NotFoundException({
        code: "CATEGORY_NOT_FOUND",
        message: "No active Category matches that identifier"
      });
    return browseViewSchema.parse(view);
  }
}
