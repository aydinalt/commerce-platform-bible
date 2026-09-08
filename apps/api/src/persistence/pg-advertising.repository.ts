import { Injectable } from "@nestjs/common";
import { Pool } from "pg";

import type {
  AdvertisingExclusionResponse,
  AdvertisingSettingsResponse,
  UpdateAdvertisingSettingsInput
} from "@commerce/contracts";

/**
 * The advertising placement settings (I75).
 *
 * PRD-0006 §20 has named these since v2.2 and none of them existed. The
 * platform had one advertising region it filled itself (I70) and no way to say
 * who the external network is, which unit goes where, whether advertising runs
 * at all, or which Categories must stay clean.
 *
 * **One row with named columns.** §12 refuses a standalone generic Platform
 * Configuration capability, so this is not a settings store: reading it returns
 * five decided things, and a sixth needs a migration and an argument. That
 * friction is the feature.
 *
 * **Nothing here counts anything.** §20.5 excludes impression, click and
 * revenue reporting. There is no counter column and no route that would
 * increment one, and the absence is the boundary rather than an oversight.
 */
@Injectable()
export class PgAdvertisingRepository {
  constructor(private readonly pool: Pool) {}

  /**
   * The settings as they stand, with the Categories somebody kept clear.
   *
   * The row is seeded by the migration and cannot be deleted — `id` is fixed
   * and checked — so this always answers. A surface reading it finds "no
   * advertising, nowhere configured" rather than an absence it would have to
   * interpret, which is what §20.4 asks of an unconfigured platform.
   */
  async read(): Promise<AdvertisingSettingsResponse> {
    const settings = await this.pool.query<{
      category: string | null;
      enabled: boolean;
      presentation: string | null;
      publisherId: string | null;
      results: string | null;
      updatedAt: Date;
    }>(
      `select s.publisher_id as "publisherId", s.enabled,
         s.unit_results as "results", s.unit_presentation as "presentation",
         s.unit_category as "category", s.updated_at as "updatedAt"
       from advertising_setting s where s.id`
    );
    const row = settings.rows[0];

    const excluded = await this.pool.query<
      Omit<AdvertisingExclusionResponse, "excludedAt"> & { excludedAt: Date }
    >(
      `select x.category_id as "categoryId", c.name as "categoryName",
         x.excluded_at as "excludedAt"
       from advertising_category_exclusion x
       join category c on c.id = x.category_id
       order by c.name`
    );

    return {
      enabled: row?.enabled ?? false,
      exclusions: excluded.rows.map((entry) => ({
        categoryId: entry.categoryId,
        categoryName: entry.categoryName,
        excludedAt: entry.excludedAt.toISOString()
      })),
      publisherId: row?.publisherId ?? null,
      units: {
        category: row?.category ?? null,
        presentation: row?.presentation ?? null,
        results: row?.results ?? null
      },
      updatedAt: (row?.updatedAt ?? new Date()).toISOString()
    };
  }

  /**
   * Writing all five at once.
   *
   * An update rather than an upsert, and it touches the one row by its fixed
   * key: there is nothing to create, and a statement that could create
   * something would be a statement that could create a second row disagreeing
   * with the first.
   */
  async update(
    input: UpdateAdvertisingSettingsInput,
    adminUserId: string
  ): Promise<void> {
    await this.pool.query(
      `update advertising_setting
       set publisher_id = $1, unit_results = $2, unit_presentation = $3,
           unit_category = $4, enabled = $5, updated_by = $6, updated_at = now()
       where id`,
      [
        input.publisherId,
        input.units.results,
        input.units.presentation,
        input.units.category,
        input.enabled,
        adminUserId
      ]
    );
  }

  /**
   * Marking one Category ad-free.
   *
   * The Category has to exist and be active, for the reason a placement's does:
   * a rule written against a retired heading is a row nothing will read. Naming
   * one already excluded succeeds without changing anything — the Admin asked
   * for a state and the state is what they get.
   */
  async exclude(categoryId: string, adminUserId: string): Promise<boolean> {
    const category = await this.pool.query(
      `select 1 from category where id = $1 and active = true`,
      [categoryId]
    );
    if (category.rowCount !== 1) return false;

    await this.pool.query(
      `insert into advertising_category_exclusion (category_id, excluded_by)
       values ($1,$2) on conflict (category_id) do nothing`,
      [categoryId, adminUserId]
    );
    return true;
  }

  /**
   * Letting advertising back into one Category.
   *
   * Deleted rather than deactivated, unlike a placement: an exclusion is not an
   * arrangement with anybody, it is a line somebody drew, and a line that has
   * been rubbed out leaves nothing worth keeping. Removing one that is not
   * there answers `false`, so a surface can say so rather than claim it undid
   * something.
   */
  async include(categoryId: string): Promise<boolean> {
    const done = await this.pool.query(
      `delete from advertising_category_exclusion where category_id = $1`,
      [categoryId]
    );
    return done.rowCount === 1;
  }
}
