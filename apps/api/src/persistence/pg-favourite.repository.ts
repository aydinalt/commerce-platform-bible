import { Injectable } from "@nestjs/common";
import { Pool } from "pg";

import type { ListingCardResponse } from "@commerce/contracts";

import { LISTING_NUMBER_SQL, PRIMARY_VISUAL_SQL } from "./listing-card.sql.js";
import {
  HANDOFF_AVAILABLE_SQL,
  OFFERING_PRICE_SQL,
  PRODUCT_GROUP_KEY,
  PRODUCT_GROUP_PICK,
  PRODUCT_KEY_SQL,
  SELLER_COUNT_SQL,
  withPrice,
  type PricedRow
} from "./offering-price.sql.js";
import {
  PRODUCT_RATING_SQL,
  withRating,
  type RatedRow
} from "./product-rating.sql.js";

/**
 * What a person kept (I64).
 *
 * Keyed on the product group, exactly as reviews are and for the same reason:
 * a person who kept a phone kept the phone, not one shop's listing of it. The
 * consequences are the behaviour, not side effects of it — keeping it from the
 * cheapest seller and returning through a dearer one shows it already kept, and
 * a seller withdrawing their listing does not delete somebody's favourite.
 */
@Injectable()
export class PgFavouriteRepository {
  constructor(private readonly pool: Pool) {}

  /**
   * The group key an Offering belongs to, while it is publicly eligible.
   *
   * The projection gates this for the reason it gates everything public: a
   * person cannot keep something they cannot reach, and a slug that reaches a
   * hidden Offering must answer exactly as one that reaches nothing.
   */
  async reachable(
    slug: string
  ): Promise<{ groupKey: string; offeringId: string } | null> {
    const found = await this.pool.query<{
      groupKey: string;
      offeringId: string;
    }>(
      `select ${PRODUCT_GROUP_KEY} as "groupKey",
         p.offering_id as "offeringId"
       from offering_search_projection p
       join offering o on o.id = p.offering_id
       where o.slug = $1`,
      [slug]
    );
    return found.rows[0] ?? null;
  }

  /**
   * The group key behind a slug, **without** the eligibility gate (I64).
   *
   * Used only to let go of something. An Offering whose sellers all withdrew is
   * exactly the favourite a person is most likely to want off their list, and
   * refusing because the catalogue can no longer show it would trap the row
   * there. Reading the key is not reading the Offering: nothing about the
   * hidden listing reaches the response, and the only thing this enables is a
   * delete of the caller's own row.
   */
  async groupKeyForRelease(slug: string): Promise<string | null> {
    const found = await this.pool.query<{ groupKey: string }>(
      `select ${PRODUCT_GROUP_KEY} as "groupKey"
       from offering o where o.slug = $1`,
      [slug]
    );
    return found.rows[0]?.groupKey ?? null;
  }

  /**
   * Keeps it, and keeping it twice is keeping it once.
   *
   * `on conflict do nothing` rather than an existence check followed by an
   * insert: two presses arriving together would both pass the check, and the
   * primary key is what makes "one person, one product, one heart" true under
   * concurrency instead of only in the happy path.
   */
  async add(input: {
    groupKey: string;
    offeringId: string;
    userId: string;
  }): Promise<void> {
    await this.pool.query(
      `insert into favourite (product_group_key, user_id, offering_id)
       values ($1,$2,$3)
       on conflict (user_id, product_group_key) do nothing`,
      [input.groupKey, input.userId, input.offeringId]
    );
  }

  /** Stops keeping it. Removing what was never kept is not an error. */
  async remove(input: { groupKey: string; userId: string }): Promise<void> {
    await this.pool.query(
      `delete from favourite
       where user_id = $1 and product_group_key = $2`,
      [input.userId, input.groupKey]
    );
  }

  /**
   * Which products this person has kept, as keys.
   *
   * What a page of Listing Cards needs to decide which hearts are filled. The
   * cards are already on that page, so answering with cards would be a second
   * copy of what the surface is holding.
   */
  async marks(userId: string): Promise<string[]> {
    const found = await this.pool.query<{ productGroupKey: string }>(
      `select product_group_key as "productGroupKey"
       from favourite where user_id = $1`,
      [userId]
    );
    return found.rows.map((row) => row.productGroupKey);
  }

  /**
   * The kept products as Listing Cards, newest kept first.
   *
   * **Drawn from the cheapest currently eligible seller**, by the same
   * `PRODUCT_GROUP_PICK` Discovery uses — so a favourite shows today's price
   * from today's cheapest partner rather than the listing that happened to be
   * on screen when the heart was pressed. That is the point of keeping a
   * product rather than a listing.
   *
   * `unavailable` is what is kept and no longer reachable: every seller
   * withdrew, or moderation hid it. Those rows stay — the person kept a
   * product, and the catalogue losing a way to buy it is not them changing
   * their mind — so the page can say how many are missing instead of quietly
   * showing fewer than were saved.
   */
  async list(
    userId: string
  ): Promise<{ cards: ListingCardResponse[]; unavailable: number }> {
    const kept = await this.pool.query<
      RatedRow<PricedRow<ListingCardResponse>> & { keptAt: Date }
    >(
      `select distinct on (${PRODUCT_GROUP_KEY})
         p.offering_id as "offeringId", p.title,
         p.business_name as "businessName", c.name as "categoryName",
         o.slug, p.published_at as "publishedAt",
         f.created_at as "keptAt",
         ${PRIMARY_VISUAL_SQL},
         ${LISTING_NUMBER_SQL},
         ${OFFERING_PRICE_SQL},
         ${PRODUCT_KEY_SQL},
         ${SELLER_COUNT_SQL},
         ${HANDOFF_AVAILABLE_SQL},
         ${PRODUCT_RATING_SQL}
       from favourite f
       join offering o
         on ${PRODUCT_GROUP_KEY} = f.product_group_key
       join offering_search_projection p on p.offering_id = o.id
       join category c on c.id = p.category_id
       where f.user_id = $1
       order by ${PRODUCT_GROUP_PICK}`,
      [userId]
    );

    const counted = await this.pool.query<{ total: number }>(
      `select count(*)::int as total from favourite where user_id = $1`,
      [userId]
    );

    /*
     * Newest kept first, restored after the grouping: `distinct on` fixes its
     * own sort order — the one that picks the cheapest seller — so the order a
     * person reads the list in has to be applied afterwards. The same two-step
     * Browse uses, for the same reason.
     */
    const cards = kept.rows
      .slice()
      .sort((a, b) => b.keptAt.getTime() - a.keptAt.getTime())
      .map(({ keptAt: _keptAt, ...row }) =>
        withPrice<ListingCardResponse>(
          withRating<PricedRow<ListingCardResponse>>(row)
        )
      );

    return {
      cards,
      unavailable: Math.max(0, (counted.rows[0]?.total ?? 0) - cards.length)
    };
  }
}
