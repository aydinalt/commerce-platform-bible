import {
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Req
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { favouriteMarksSchema, favouritesSchema } from "@commerce/contracts";

import { PgFavouriteRepository } from "../persistence/pg-favourite.repository.js";
import { OriginValidator } from "../security/origin.guard.js";
import { PrincipalResolver } from "../security/principal-resolver.js";

/**
 * Keeping something, and reading back what was kept (I64).
 *
 * The Owner's prototype has had a heart on every card and a **Favorilerim**
 * entry in the header since the first version. Both are here.
 *
 * **Authenticated throughout, and that is the honest shape rather than a
 * limitation.** A favourite is a fact about a person; a Guest has nowhere for
 * one to live. The prototype agrees — pressing the heart while signed out opens
 * the sign-in dialog — so the refusal is `401`, and the identical request
 * succeeds unchanged afterwards.
 *
 * `PUT` and `DELETE` rather than a toggle, because a toggle is a request whose
 * effect depends on a state the caller cannot see: two presses racing would
 * leave the heart in whichever state arrived last, and a retried request would
 * undo itself. Both of these say what they mean and repeat harmlessly.
 */
@Controller()
export class FavouriteController {
  constructor(
    private readonly favourites: PgFavouriteRepository,
    private readonly origins: OriginValidator,
    private readonly principals: PrincipalResolver
  ) {}

  /** Everything this person kept, as cards drawn from today's cheapest seller. */
  @Get("me/favourites")
  async list(@Req() request: FastifyRequest) {
    const principal = await this.principals.resolve(request);
    return favouritesSchema.parse(await this.favourites.list(principal.userId));
  }

  /**
   * Which products this person kept, as keys.
   *
   * The route a Discovery page calls to decide which hearts are filled. Kept
   * separate from the list above so that rendering Results does not fetch a
   * page of cards nobody is going to look at.
   */
  @Get("me/favourites/marks")
  async marks(@Req() request: FastifyRequest) {
    const principal = await this.principals.resolve(request);
    return favouriteMarksSchema.parse({
      productGroupKeys: await this.favourites.marks(principal.userId)
    });
  }

  @Put("offerings/:slug/favourite")
  @HttpCode(204)
  async keep(@Param("slug") slug: string, @Req() request: FastifyRequest) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolve(request);

    const found = await this.favourites.reachable(slug);
    if (found === null)
      throw new NotFoundException({
        code: "OFFERING_NOT_FOUND",
        message: "No publicly eligible Offering matches that address"
      });

    await this.favourites.add({
      groupKey: found.groupKey,
      offeringId: found.offeringId,
      userId: principal.userId
    });
  }

  /**
   * Stops keeping it.
   *
   * **Reachability is not required to let go of something**, and this is the
   * one route that reads an Offering without the eligibility gate. An Offering
   * whose sellers all withdrew is exactly the favourite a person is most likely
   * to want off their list, and refusing because the catalogue can no longer
   * show it would trap the row there. Nothing about the hidden listing reaches
   * the response — the key is resolved, the caller's own row is deleted, and
   * the answer is the same `204` either way.
   *
   * A slug that never existed also answers `204`. There is nothing to delete
   * and nothing to report, and distinguishing the two cases would tell an
   * anonymous prober which slugs exist.
   */
  @Delete("offerings/:slug/favourite")
  @HttpCode(204)
  async release(@Param("slug") slug: string, @Req() request: FastifyRequest) {
    this.origins.assertAcceptable(request, true);
    const principal = await this.principals.resolve(request);

    const groupKey = await this.favourites.groupKeyForRelease(slug);
    if (groupKey === null) return;
    await this.favourites.remove({ groupKey, userId: principal.userId });
  }
}
