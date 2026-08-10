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
  searchSubmissionSchema,
  searchViewSchema,
  type BrowseRoots
} from "@commerce/contracts";
import { searchTerms } from "@commerce/discovery";

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
   * Search (`US-DSC-F02-001`).
   *
   * A `POST` for the same reason Browse selection is: AC-1 makes a valid
   * submission create a Discovery Start, and that is an occurrence rather than
   * a page being fetched.
   *
   * A query whose terms are all stripped away — punctuation only — reaches no
   * searchable information, so AC-5 excludes everything and the answer is an
   * empty result set rather than an error. It was a valid submission; it just
   * matched nothing.
   */
  @Post("search")
  @HttpCode(200)
  async search(@Body() body: unknown) {
    const parsed = searchSubmissionSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: "Invalid Search submission"
      });

    const terms = searchTerms(parsed.data.query);
    const pathId = parsed.data.discoveryPathId ?? randomUUID();
    if (terms.length === 0)
      return searchViewSchema.parse({
        categoryId: null,
        discoveryPathId: pathId,
        domain: null,
        filtersAvailable: false,
        narrowing: [],
        query: parsed.data.query,
        results: []
      });

    const view = await this.discovery.search({
      categoryId: parsed.data.categoryId,
      pathId,
      query: parsed.data.query,
      terms
    });
    // `US-DSC-F04-001` AC-3 narrows to an active leaf. A branch, a retired
    // Category or one that never existed all answer the same way.
    if (!view)
      throw new NotFoundException({
        code: "CATEGORY_NOT_FOUND",
        message: "No active leaf Category matches that identifier"
      });
    return searchViewSchema.parse(view);
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
