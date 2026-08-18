import { Injectable } from "@nestjs/common";
import { Pool, type PoolClient } from "pg";

import {
  ACTIVE_LIFECYCLE_STATES,
  CategoryCycleError,
  CategoryDomainMismatchError,
  CategoryKeyConflictError,
  CategoryParentRetiredError,
  CategoryRetirementBlockedError,
  type CategoryRecord,
  type V1Domain
} from "@commerce/catalog";

const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";
const CHECK_VIOLATION = "23514";

const PARENT_DOMAIN_CONSTRAINT = "category_parent_id_domain_id_fkey";
const ANCESTRY_CYCLE_CONSTRAINT = "category_no_ancestry_cycle";
const SLUG_CONSTRAINT = "category_domain_id_slug_key";
const STABLE_KEY_CONSTRAINT = "category_stable_key_key";

/**
 * The Offering states that keep a Category in use (`US-PLT-F08-001` AC-12).
 *
 * `ARCHIVED` is absent on purpose: AC-13 lets historical association survive
 * retirement. The list is written out rather than expressed as "not archived"
 * so that a fifth lifecycle state could not join it silently.
 */
const BLOCKING_OFFERING_STATES = ACTIVE_LIFECYCLE_STATES;

const CATEGORY_COLUMNS = `c.id, c.name, c.slug, c.stable_key as "stableKey",
   c.parent_id as "parentId", c.active, d.stable_key as domain`;

function violates(error: unknown, code: string, constraint: string): boolean {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as { code?: unknown; constraint?: unknown };
  return candidate.code === code && candidate.constraint === constraint;
}

@Injectable()
export class PgCatalogRepository {
  constructor(private readonly pool: Pool) {}

  /**
   * Every Category an Offering may be assigned to right now
   * (`US-OFR-F01-001` AC-4).
   *
   * The predicate is the one `assertAssignable` enforces on creation — active,
   * and with no active child — asked as a question rather than as a refusal.
   * Written out here rather than shared as a function because the two are
   * different shapes of the same sentence: one locks a row and throws, this one
   * scans and lists. What must not drift is the condition, and a test compares
   * this list against what creation actually accepts.
   *
   * The path is the full ancestry, root first. Two Categories may share a leaf
   * name in different parts of the catalogue, and a picker of bare names would
   * ask somebody to choose between two identical options.
   */
  async assignable(): Promise<
    { domain: string; id: string; name: string; path: string[] }[]
  > {
    const result = await this.pool.query<{
      domain: string;
      id: string;
      name: string;
      path: string[];
    }>(
      `with recursive walk as (
         select c.id as leaf_id, c.id, c.parent_id, c.name, 0 as depth
         from category c
         where c.active = true
           and not exists (
             select 1 from category child
             where child.parent_id = c.id and child.active = true
           )
         union all
         select walk.leaf_id, parent.id, parent.parent_id, parent.name,
           walk.depth + 1
         from category parent join walk on walk.parent_id = parent.id
       )
       select leaf.id, leaf.name, d.stable_key as domain,
         array_agg(walk.name order by walk.depth desc) as path
       from category leaf
       join walk on walk.leaf_id = leaf.id
       join domain d on d.id = leaf.domain_id
       group by leaf.id, leaf.name, d.stable_key
       order by d.stable_key, path`
    );
    return result.rows;
  }

  /**
   * A root Category names exactly one V1 Domain (AC-1, AC-6). The Domain is
   * resolved from its stable key inside the insert, so an unknown Domain
   * inserts nothing rather than defaulting to something.
   */
  async createRoot(input: {
    correlationId: string;
    domain: V1Domain;
    name: string;
    slug: string;
    stableKey: string;
    userId: string;
  }): Promise<CategoryRecord> {
    return this.write(async (client) => {
      const created = await client.query<CategoryRecord>(
        `with parent_domain as (
           select id from domain where stable_key = $1
         )
         insert into category (domain_id, parent_id, stable_key, slug, name)
         select parent_domain.id, null, $2, $3, $4 from parent_domain
         returning id, name, slug, stable_key as "stableKey",
           parent_id as "parentId", active, $1::text as domain`,
        [input.domain, input.stableKey, input.slug, input.name]
      );
      const category = created.rows[0];
      if (!category) throw new Error("UNKNOWN_DOMAIN");
      await this.audit(client, {
        action: "category.create",
        categoryId: category.id,
        correlationId: input.correlationId,
        userId: input.userId
      });
      return category;
    });
  }

  /**
   * A child inherits its parent's Domain (AC-7) by reading it from the parent
   * rather than accepting one. There is no argument here that could disagree
   * with the parent, so AC-10 has nothing to reject at this call site.
   */
  async createChild(input: {
    correlationId: string;
    name: string;
    parentId: string;
    slug: string;
    stableKey: string;
    userId: string;
  }): Promise<CategoryRecord | null> {
    return this.write(async (client) => {
      const parent = await client.query<{ active: boolean; domainId: string }>(
        `select active, domain_id as "domainId" from category
         where id = $1 for share`,
        [input.parentId]
      );
      const found = parent.rows[0];
      if (!found) return null;
      if (!found.active) throw new CategoryParentRetiredError(input.parentId);

      const created = await client.query<CategoryRecord>(
        `insert into category (domain_id, parent_id, stable_key, slug, name)
         values ($1, $2, $3, $4, $5)
         returning id, name, slug, stable_key as "stableKey",
           parent_id as "parentId", active,
           (select stable_key from domain where id = $1) as domain`,
        [
          found.domainId,
          input.parentId,
          input.stableKey,
          input.slug,
          input.name
        ]
      );
      const category = created.rows[0];
      if (!category) throw new Error("CATEGORY_INSERT_FAILED");
      await this.audit(client, {
        action: "category.create",
        categoryId: category.id,
        correlationId: input.correlationId,
        userId: input.userId
      });
      return category;
    });
  }

  /**
   * Rename changes the display name alone (AC-3). Identity lives in `id`,
   * `stable_key` and `slug`, none of which this statement can reach.
   */
  async rename(input: {
    categoryId: string;
    correlationId: string;
    name: string;
    userId: string;
  }): Promise<CategoryRecord | null> {
    return this.write(async (client) => {
      const updated = await client.query<{ id: string }>(
        `update category set name = $2 where id = $1 returning id`,
        [input.categoryId, input.name]
      );
      if (!updated.rows[0]) return null;
      await this.audit(client, {
        action: "category.rename",
        categoryId: input.categoryId,
        correlationId: input.correlationId,
        userId: input.userId
      });
      return this.readWithin(client, input.categoryId);
    });
  }

  /**
   * Reparenting within the Domain (AC-4). Cross-Domain parents and ancestry
   * cycles both fail in the database — the composite foreign key refuses the
   * first, the ancestry trigger the second — and are translated here rather
   * than pre-checked, so no window exists between checking and writing.
   */
  async reparent(input: {
    categoryId: string;
    correlationId: string;
    parentId: string | null;
    userId: string;
  }): Promise<CategoryRecord | null> {
    return this.write(async (client) => {
      const updated = await client.query<{ id: string }>(
        `update category set parent_id = $2 where id = $1 returning id`,
        [input.categoryId, input.parentId]
      );
      if (!updated.rows[0]) return null;
      await this.audit(client, {
        action: "category.reparent",
        categoryId: input.categoryId,
        correlationId: input.correlationId,
        userId: input.userId
      });
      return this.readWithin(client, input.categoryId);
    });
  }

  /**
   * Retirement (AC-12, AC-14). The Category row is locked for the duration, so
   * a concurrent Offering assignment cannot slip in between the dependency
   * check and the write — assignment takes a share lock on the same row.
   */
  async retire(input: {
    categoryId: string;
    correlationId: string;
    userId: string;
  }): Promise<CategoryRecord | null> {
    return this.write(async (client) => {
      const locked = await client.query<{ active: boolean }>(
        `select active from category where id = $1 for update`,
        [input.categoryId]
      );
      if (!locked.rows[0]) return null;

      const children = await client.query(
        `select 1 from category where parent_id = $1 and active = true limit 1`,
        [input.categoryId]
      );
      if (children.rowCount === 1)
        throw new CategoryRetirementBlockedError("ACTIVE_CHILD");

      const offerings = await client.query(
        `select 1 from offering
         where category_id = $1 and status = any($2::"OfferingStatus"[])
         limit 1`,
        [input.categoryId, BLOCKING_OFFERING_STATES]
      );
      if (offerings.rowCount === 1)
        throw new CategoryRetirementBlockedError("ASSIGNED_OFFERING");

      await client.query(`update category set active = false where id = $1`, [
        input.categoryId
      ]);
      await this.audit(client, {
        action: "category.retire",
        categoryId: input.categoryId,
        correlationId: input.correlationId,
        userId: input.userId
      });
      return this.readWithin(client, input.categoryId);
    });
  }

  /// Retired Categories are included: AC-14 keeps the historical definition
  /// readable to management even though active Browse excludes it.
  async list(): Promise<CategoryRecord[]> {
    const result = await this.pool.query<CategoryRecord>(
      `select ${CATEGORY_COLUMNS}
       from category c join domain d on d.id = c.domain_id
       order by d.stable_key, c.slug`
    );
    return result.rows;
  }

  async find(categoryId: string): Promise<CategoryRecord | null> {
    const result = await this.pool.query<CategoryRecord>(
      `select ${CATEGORY_COLUMNS}
       from category c join domain d on d.id = c.domain_id
       where c.id = $1`,
      [categoryId]
    );
    return result.rows[0] ?? null;
  }

  private async readWithin(
    client: PoolClient,
    categoryId: string
  ): Promise<CategoryRecord> {
    const result = await client.query<CategoryRecord>(
      `select ${CATEGORY_COLUMNS}
       from category c join domain d on d.id = c.domain_id
       where c.id = $1`,
      [categoryId]
    );
    const category = result.rows[0];
    if (!category) throw new Error("CATEGORY_DISAPPEARED");
    return category;
  }

  private async audit(
    client: PoolClient,
    entry: {
      action: string;
      categoryId: string;
      correlationId: string;
      userId: string;
    }
  ): Promise<void> {
    await client.query(
      `insert into audit_record
        (actor_user_id, action, target_type, target_id, result, correlation_id)
       values ($1,$2,'Category',$3,'ALLOWED',$4)`,
      [entry.userId, entry.action, entry.categoryId, entry.correlationId]
    );
  }

  /**
   * One transaction per action, and one place where driver-level constraint
   * failures become named domain errors. AC-16 requires that a failed action
   * claims no result: the rollback is what makes that true, and returning the
   * row only after the commit is what keeps it honest.
   */
  private async write<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const result = await work(client);
      await client.query("commit");
      return result;
    } catch (error) {
      await client.query("rollback");
      throw translate(error);
    } finally {
      client.release();
    }
  }
}

function translate(error: unknown): unknown {
  if (violates(error, CHECK_VIOLATION, ANCESTRY_CYCLE_CONSTRAINT))
    return new CategoryCycleError();
  if (violates(error, FOREIGN_KEY_VIOLATION, PARENT_DOMAIN_CONSTRAINT))
    return new CategoryDomainMismatchError();
  if (violates(error, UNIQUE_VIOLATION, SLUG_CONSTRAINT))
    return new CategoryKeyConflictError("SLUG");
  if (violates(error, UNIQUE_VIOLATION, STABLE_KEY_CONSTRAINT))
    return new CategoryKeyConflictError("STABLE_KEY");
  return error;
}
