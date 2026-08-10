import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool, type PoolClient } from "pg";

import type {
  BrowseCategory,
  BrowseView,
  ListingCard
} from "@commerce/discovery";

/**
 * A Category as Browse sees it. `leaf` is derived rather than stored: a
 * Category becomes a branch the moment an active child appears under it, and
 * stops being one when that child retires.
 */
const BROWSE_CATEGORY = `c.id, c.name, c.slug,
   not exists (
     select 1 from category child
     where child.parent_id = c.id and child.active = true
   ) as leaf`;

@Injectable()
export class PgDiscoveryRepository implements OnModuleDestroy {
  private readonly pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  /**
   * The active root Categories, grouped by Domain.
   *
   * Choosing from this list is what begins a Browse path, so nothing here
   * records a Discovery Start: no Category has been selected yet.
   */
  async browseRoots(): Promise<
    { categories: BrowseCategory[]; domain: string }[]
  > {
    const result = await this.pool.query<BrowseCategory & { domain: string }>(
      `select ${BROWSE_CATEGORY}, d.stable_key as domain
       from category c
       join domain d on d.id = c.domain_id
       where c.parent_id is null and c.active = true and d.active = true
       order by d.stable_key, c.name`
    );
    const byDomain = new Map<string, BrowseCategory[]>();
    for (const row of result.rows) {
      const { domain, ...category } = row;
      byDomain.set(domain, [...(byDomain.get(domain) ?? []), category]);
    }
    return [...byDomain].map(([domain, categories]) => ({
      categories,
      domain
    }));
  }

  /**
   * One point in a Browse path.
   *
   * The Discovery Start is written in the same transaction that reads the view,
   * because AC-1 ties the occurrence to the selection rather than to a separate
   * call a client might forget to make.
   */
  async browse(input: {
    categoryId: string;
    pathId: string;
  }): Promise<BrowseView | null> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");

      const found = await client.query<
        BrowseCategory & {
          domain: string;
          domainId: string;
          parentId: string | null;
        }
      >(
        `select ${BROWSE_CATEGORY}, c.parent_id as "parentId",
           c.domain_id as "domainId", d.stable_key as domain
         from category c
         join domain d on d.id = c.domain_id
         where c.id = $1 and c.active = true`,
        [input.categoryId]
      );
      const current = found.rows[0];
      // AC-4. A retired Category is not a Browse destination, so it reads the
      // same way as one that never existed.
      if (!current) {
        await client.query("rollback");
        return null;
      }

      // AC-1 and AC-8. The insert is the whole rule: a path that already has a
      // Start keeps it, and a descendant selection adds none.
      await client.query(
        `insert into discovery_start (path_id, kind, domain_id)
         values ($1, 'BROWSE', $2)
         on conflict (path_id) do nothing`,
        [input.pathId, current.domainId]
      );

      const { domain, domainId, parentId, ...category } = current;
      void domainId;

      const children = await this.categories(
        client,
        `c.parent_id = $1 and c.active = true`,
        [input.categoryId]
      );
      const siblings =
        parentId === null
          ? await this.categories(
              client,
              `c.parent_id is null and c.domain_id = $1 and c.active = true
               and c.id <> $2`,
              [current.domainId, input.categoryId]
            )
          : await this.categories(
              client,
              `c.parent_id = $1 and c.active = true and c.id <> $2`,
              [parentId, input.categoryId]
            );
      const ancestors = await this.ancestors(client, input.categoryId);

      // AC-5, AC-6 and AC-7. A branch withholds Results rather than showing an
      // empty set or gathering its descendants' — `null` says "not shown", and
      // an empty array would say "none here".
      const results = category.leaf
        ? await this.results(client, input.categoryId)
        : null;

      await client.query("commit");
      return {
        ancestors,
        category,
        children,
        discoveryPathId: input.pathId,
        domain,
        results,
        siblings
      };
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * The Listing Cards for one active leaf Category.
   *
   * The projection is the only eligibility input: a row is there because
   * publication evaluated the Offering as Eligible, and retirement removes it.
   * PRD-0002 §12 orders Browse by later Initial Published At first.
   *
   * The Category display name is joined rather than projected, so a rename
   * shows immediately — `US-PLT-F08-001` AC-3 keeps identity stable across one.
   */
  private async results(
    client: PoolClient,
    categoryId: string
  ): Promise<ListingCard[]> {
    const result = await client.query<
      Omit<ListingCard, "publishedAt"> & { publishedAt: Date }
    >(
      `select p.offering_id as "offeringId", p.title, p.business_name as "businessName",
         c.name as "categoryName", o.slug, p.published_at as "publishedAt"
       from offering_search_projection p
       join offering o on o.id = p.offering_id
       join category c on c.id = p.category_id
       where p.category_id = $1
       order by p.published_at desc, p.offering_id`,
      [categoryId]
    );
    return result.rows.map((row) => ({
      ...row,
      publishedAt: row.publishedAt.toISOString()
    }));
  }

  private async categories(
    client: PoolClient,
    where: string,
    parameters: unknown[]
  ): Promise<BrowseCategory[]> {
    const result = await client.query<BrowseCategory>(
      `select ${BROWSE_CATEGORY} from category c where ${where} order by c.name`,
      parameters
    );
    return result.rows;
  }

  /// The active path back to the root, so a person can return to a parent or
  /// step out to another branch (AC-3).
  private async ancestors(
    client: PoolClient,
    categoryId: string
  ): Promise<BrowseCategory[]> {
    const result = await client.query<BrowseCategory>(
      `with recursive walk as (
         select c.id, c.parent_id, 0 as depth
         from category c where c.id = $1
         union all
         select parent.id, parent.parent_id, walk.depth + 1
         from category parent
         join walk on walk.parent_id = parent.id
       )
       select ${BROWSE_CATEGORY}
       from walk join category c on c.id = walk.id
       where walk.depth > 0 and c.active = true
       order by walk.depth desc`,
      [categoryId]
    );
    return result.rows;
  }
}
