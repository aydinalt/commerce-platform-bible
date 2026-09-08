import { Injectable } from "@nestjs/common";
import { Pool } from "pg";

import type { ProductReviewResponse } from "@commerce/contracts";

import { PRODUCT_GROUP_KEY } from "./offering-price.sql.js";

/**
 * A byline, not a name (I62).
 *
 * "Aylin Kaya" is stored and "Aylin K." is published. The surname initial is
 * enough to tell two Aylins apart in a list of reviews, which is all a byline
 * has to do; the full surname would hand every reader a real person's name in
 * exchange for a sentence about a phone, and nothing on the page needs it.
 *
 * A single-word name is published whole — there is no surname to shorten, and
 * appending an initial the person never gave would be inventing one. An account
 * with no name at all publishes `null` rather than a placeholder: an anonymous
 * review is honest, an invented byline is not.
 */
export function byline(displayName: string | null): string | null {
  if (displayName === null) return null;
  const parts = displayName.trim().split(/\s+/u).filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0] ?? null;
  const surname = parts[parts.length - 1] ?? "";
  return `${parts.slice(0, -1).join(" ")} ${surname.slice(0, 1).toLocaleUpperCase("tr")}.`;
}

interface ReviewRow {
  body: string | null;
  displayName: string | null;
  rating: number;
  reviewId: string;
  userId: string;
  writtenAt: Date;
}

/**
 * The reviews of a product, and the writing of one (I62).
 *
 * **Its own repository, because a review is nobody else's business.** Discovery
 * decides what a person can find, Presentation decides what one Offering is,
 * and neither of them owns what other people said about the thing. The rating
 * *aggregate* is a different matter and lives in `product-rating.sql`: it is
 * read by four queries in three repositories, so it is written once and
 * selected everywhere, exactly as the price is.
 *
 * Everything here is keyed on the product group — `coalesce(product_key,
 * id::text)`, §5.12's own definition — and never on the Offering. The Owner's
 * rule decides it: the rating belongs to the product, not the seller.
 */
@Injectable()
export class PgReviewRepository {
  constructor(private readonly pool: Pool) {}

  /**
   * The group key an Offering belongs to, and only while it is publicly
   * eligible.
   *
   * The projection is the gate here for the same reason it is everywhere else:
   * a person cannot review something they cannot reach, and a slug that reaches
   * a hidden Offering must answer the same way as one that reaches nothing.
   */
  async groupKeyOf(slug: string): Promise<string | null> {
    const found = await this.pool.query<{ groupKey: string }>(
      `select ${PRODUCT_GROUP_KEY} as "groupKey"
       from offering_search_projection p
       join offering o on o.id = p.offering_id
       where o.slug = $1`,
      [slug]
    );
    return found.rows[0]?.groupKey ?? null;
  }

  /**
   * One page of reviews, newest first, with the count of the whole set.
   *
   * The total is counted rather than inferred from the page, so a surface can
   * say what it is not showing. `viewerId` decides only which row is marked
   * `mine`; it never changes which rows are returned, because a review is
   * public the moment it is written.
   */
  async list(input: {
    groupKey: string;
    limit: number;
    viewerId: string | null;
  }): Promise<{ reviews: ProductReviewResponse[]; total: number }> {
    const found = await this.pool.query<ReviewRow>(
      `select r.id as "reviewId", r.rating, r.body,
         r.user_id as "userId", r.created_at as "writtenAt",
         a.display_name as "displayName"
       from product_review r
       join user_account a on a.id = r.user_id
       where r.product_group_key = $1
       order by r.created_at desc, r.id
       limit $2`,
      [input.groupKey, input.limit]
    );
    const counted = await this.pool.query<{ total: number }>(
      `select count(*)::int as total from product_review
       where product_group_key = $1`,
      [input.groupKey]
    );
    return {
      reviews: found.rows.map((row) => ({
        author: byline(row.displayName),
        body: row.body,
        mine: input.viewerId !== null && row.userId === input.viewerId,
        rating: row.rating,
        reviewId: row.reviewId,
        writtenAt: row.writtenAt.toISOString()
      })),
      total: counted.rows[0]?.total ?? 0
    };
  }

  /**
   * Writes a person's review of a product, replacing their previous one.
   *
   * `on conflict … do update` rather than a second row: one person has one
   * opinion about one product, and a second submission is a change of mind
   * rather than a second vote. The unique index is what makes that true under
   * concurrency instead of only in the happy path.
   *
   * `offering_id` is refreshed alongside, because it records which listing the
   * person was reading — and if they came back through a different seller, that
   * is the listing they were reading this time.
   */
  async write(input: {
    body: string | null;
    groupKey: string;
    offeringId: string;
    rating: number;
    userId: string;
  }): Promise<void> {
    await this.pool.query(
      `insert into product_review
         (product_group_key, offering_id, user_id, rating, body)
       values ($1,$2,$3,$4,$5)
       on conflict (product_group_key, user_id) do update
         set rating      = excluded.rating,
             body        = excluded.body,
             offering_id = excluded.offering_id,
             updated_at  = now()`,
      [input.groupKey, input.offeringId, input.userId, input.rating, input.body]
    );
  }

  /** The Offering behind a slug, while it is publicly eligible. */
  async offeringOf(slug: string): Promise<string | null> {
    const found = await this.pool.query<{ offeringId: string }>(
      `select p.offering_id as "offeringId"
       from offering_search_projection p
       join offering o on o.id = p.offering_id
       where o.slug = $1`,
      [slug]
    );
    return found.rows[0]?.offeringId ?? null;
  }

  /** The product's score, for the response that follows a write. */
  async rating(
    groupKey: string
  ): Promise<{ average: string | null; count: number }> {
    const found = await this.pool.query<{
      average: string | null;
      count: number;
    }>(
      `select round(avg(rating)::numeric, 1)::text as average,
         count(*)::int as count
       from product_review where product_group_key = $1`,
      [groupKey]
    );
    const row = found.rows[0];
    return { average: row?.average ?? null, count: row?.count ?? 0 };
  }
}
