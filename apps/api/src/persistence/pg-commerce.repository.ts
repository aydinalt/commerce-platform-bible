import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool, type PoolClient } from "pg";

import type { AuditEntry, AuditWriter } from "@commerce/audit";
import {
  restrictionWithdraws,
  type BusinessAccessDecision,
  type BusinessAccessReader,
  type OwnerIntent
} from "@commerce/business";
import { CategoryNotAssignableError } from "@commerce/catalog";
import type { IdentityReader } from "@commerce/identity";
import {
  composePublicEligibility,
  evaluatePublicationMinimum,
  OfferingSlugConflictError,
  type DraftOfferingRecord,
  type DraftOfferingRepository
} from "@commerce/offering";

type OfferingInput = Parameters<DraftOfferingRepository["create"]>[0];

/**
 * One row of the owning Business management inventory.
 *
 * The timestamps are ISO strings rather than `Date`s: the published contract
 * says `date-time`, and the response is validated against it before anything
 * gets a chance to serialise a `Date` into something else.
 */
/**
 * One Offering as the owner's inventory names it.
 *
 * The two state fields are typed rather than left as strings: they are
 * PRD-0001's vocabularies, and `US-BUS-F04-001` AC-9 asks the Dashboard to
 * expose them without redefining them — which is easier to keep true when a
 * fifth lifecycle cannot be typed here in the first place.
 */
export interface InventoryEntry {
  categoryId: string;
  createdAt: string;
  id: string;
  publicEligibility: "ELIGIBLE" | "INELIGIBLE" | "PENDING" | "WITHDRAWN";
  slug: string;
  status: "ARCHIVED" | "DRAFT" | "HIDDEN" | "PUBLISHED";
  title: string;
  updatedAt: string;
}

const UNIQUE_VIOLATION = "23505";
const OFFERING_SLUG_CONSTRAINT = "offering_business_id_slug_key";

function isUniqueViolation(error: unknown, constraint: string): boolean {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as { code?: unknown; constraint?: unknown };
  return (
    candidate.code === UNIQUE_VIOLATION && candidate.constraint === constraint
  );
}

/**
 * An Offering may be assigned only to an active leaf Category
 * (`US-PLT-F08-001` AC-8), and the Category's Domain is what gives the Offering
 * its own (AC-9) — which is why nothing here copies a Domain onto the Offering:
 * it is derived from this row, not duplicated beside it.
 *
 * The share lock is the point. Retirement takes an exclusive lock on the same
 * row before counting assigned Offerings, so the two cannot interleave: either
 * this assignment is visible to that count, or this assignment finds the
 * Category already retired.
 */
async function assertAssignable(
  client: PoolClient,
  categoryId: string
): Promise<void> {
  const category = await client.query<{ assignable: boolean }>(
    `select (c.active and not exists (
       select 1 from category child
       where child.parent_id = c.id and child.active = true
     )) as assignable
     from category c where c.id = $1 for share`,
    [categoryId]
  );
  if (category.rows[0]?.assignable !== true)
    throw new CategoryNotAssignableError(categoryId);
}

@Injectable()
export class PgCommerceRepository
  implements
    IdentityReader,
    BusinessAccessReader,
    DraftOfferingRepository,
    AuditWriter,
    OnModuleDestroy
{
  private readonly pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  /**
   * Readiness must reflect the dependency the process cannot serve without.
   * A probe that answers from process memory reports healthy while every
   * request fails.
   */
  async isDatabaseReachable(): Promise<boolean> {
    try {
      await this.pool.query("select 1");
      return true;
    } catch {
      return false;
    }
  }

  async isEnabled(userId: string): Promise<boolean> {
    const result = await this.pool.query<{ enabled: boolean }>(
      `select (status = 'ENABLED') as enabled from user_account where id = $1`,
      [userId]
    );
    return result.rows[0]?.enabled ?? false;
  }

  /**
   * Whether this owner may do this particular thing (`US-BUS-F03-001`).
   *
   * Restriction withdraws three acts and leaves the rest — creating an
   * Offering, publishing a Draft and normally editing a Published or Hidden
   * one. Asking with an intent is what lets a Restricted owner keep managing
   * their Business, their Drafts and their retirements without every caller
   * re-deciding which of those restriction was supposed to stop.
   */
  async canAuthorOfferings(
    businessId: string,
    userId: string,
    intent: OwnerIntent
  ): Promise<BusinessAccessDecision> {
    const result = await this.pool.query<{
      moderation: string;
      status: string;
    }>(
      `select b.status, coalesce(ms.status, 'UNRESTRICTED') as moderation
       from business b
       join business_owner bo on bo.business_id = b.id and bo.user_id = $2
       left join business_moderation_state ms on ms.business_id = b.id
       where b.id = $1`,
      [businessId, userId]
    );
    const row = result.rows[0];
    if (!row) return { allowed: false, reason: "NOT_FOUND" };
    if (row.moderation === "RESTRICTED" && restrictionWithdraws(intent))
      return { allowed: false, reason: "RESTRICTED" };
    if (row.status === "SUSPENDED" || row.status === "RETIRED")
      return { allowed: false, reason: "SUSPENDED" };
    return { allowed: true };
  }

  async create(input: OfferingInput): Promise<DraftOfferingRecord> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      await assertAssignable(client, input.categoryId);
      const result = await client.query<DraftOfferingRecord>(
        `insert into offering
           (business_id, category_id, slug, title, summary, status)
         values ($1, $2, $3, $4, $5, 'DRAFT')
         returning id, business_id as "businessId", category_id as "categoryId",
           slug, title, summary, status, version, created_at as "createdAt",
           updated_at as "updatedAt"`,
        [
          input.businessId,
          input.categoryId,
          input.slug,
          input.title,
          input.summary ?? null
        ]
      );
      const offering = result.rows[0];
      if (!offering) throw new Error("OFFERING_INSERT_FAILED");

      // `US-OFR-F01-001` AC-4. The result is recorded rather than left to be
      // derived later, because PRD-0001 §7.1 forbids consumers from
      // recalculating it — and a consumer cannot read an answer that was never
      // written. It is written in the same transaction as the Offering, so no
      // Draft ever exists without one.
      const exposure = await client.query<{ publicExposure: string }>(
        `select public_exposure::text as "publicExposure" from business
         where id = $1`,
        [input.businessId]
      );
      const eligibility = composePublicEligibility({
        businessExposure:
          exposure.rows[0]?.publicExposure === "ELIGIBLE"
            ? "ELIGIBLE"
            : "INELIGIBLE",
        lifecycle: "DRAFT"
      });
      await client.query(
        `insert into offering_publication
           (offering_id, status, eligibility_version, reason_code)
         values ($1, $2::"PublicationStatus", 1, $3)`,
        [offering.id, eligibility.status, eligibility.reason]
      );

      await this.writeAudit(client, {
        action: "offering.draft.create",
        actorUserId: input.userId,
        correlationId: input.correlationId,
        effectiveBusinessId: input.businessId,
        result: "ALLOWED",
        targetId: offering.id,
        targetType: "Offering"
      });
      await client.query("commit");
      return offering;
    } catch (error) {
      await client.query("rollback");
      if (isUniqueViolation(error, OFFERING_SLUG_CONSTRAINT))
        throw new OfferingSlugConflictError(input.slug);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * The owning Business management inventory (`US-OFR-F01-001` AC-5).
   *
   * It carries the recorded eligibility result rather than deriving one, and it
   * lists every lifecycle state: management visibility is not public exposure,
   * so an Ineligible Offering is exactly what its owner most needs to see.
   */
  /**
   * Which of this Business's Drafts satisfy the Universal Publication Minimum.
   *
   * Asked once for the whole inventory rather than once per Draft, and asked in
   * PRD-0001's own terms: the same four conditions `evaluatePublicationMinimum`
   * takes, read from the database and handed to it. `US-BUS-F05-001` AC-7
   * forbids the Dashboard from redefining the minimum, and the surest way not
   * to redefine something is to call the one function that owns it.
   */
  async publishableDrafts(businessId: string): Promise<Set<string>> {
    const rows = await this.pool.query<{
      businessDisplayName: string;
      categoryActiveLeaf: boolean;
      id: string;
      missingRequiredAttributes: string;
      title: string;
    }>(
      `select o.id, o.title, b.name as "businessDisplayName",
         (c.active and not exists (
            select 1 from category child
            where child.parent_id = c.id and child.active = true
          )) as "categoryActiveLeaf",
         (select count(*) from category_attribute ca
          join attribute_definition d on d.id = ca.attribute_definition_id
          where ca.category_id = o.category_id
            and d.required_for_publication = true
            and not exists (
              select 1 from offering_attribute_value v
              where v.offering_id = o.id
                and v.attribute_definition_id = d.id
            )) as "missingRequiredAttributes"
       from offering o
       join business b on b.id = o.business_id
       join category c on c.id = o.category_id
       where o.business_id = $1 and o.status = 'DRAFT'`,
      [businessId]
    );

    return new Set(
      rows.rows
        .filter(
          (row) =>
            evaluatePublicationMinimum({
              businessDisplayName: row.businessDisplayName,
              categoryActiveLeaf: row.categoryActiveLeaf,
              missingRequiredAttributes: Number(row.missingRequiredAttributes),
              title: row.title
            }).satisfied
        )
        .map((row) => row.id)
    );
  }

  async listInventory(businessId: string): Promise<InventoryEntry[]> {
    const result = await this.pool.query<
      Omit<InventoryEntry, "createdAt" | "updatedAt"> & {
        createdAt: Date;
        updatedAt: Date;
      }
    >(
      `select o.id, o.slug, o.title, o.status::text as status,
         o.category_id as "categoryId",
         o.created_at as "createdAt", o.updated_at as "updatedAt",
         coalesce(p.status::text, 'PENDING') as "publicEligibility"
       from offering o
       left join lateral (
         select status from offering_publication
         where offering_id = o.id
         order by eligibility_version desc limit 1
       ) p on true
       where o.business_id = $1
       order by o.created_at desc, o.id`,
      [businessId]
    );
    // The driver hands back `Date`s in the server's zone; the contract publishes
    // UTC `date-time`. Converting here keeps that promise in one place instead
    // of depending on how something downstream happens to serialise a `Date`.
    return result.rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString()
    }));
  }

  async findOwned(
    businessId: string,
    offeringId: string
  ): Promise<DraftOfferingRecord | null> {
    const result = await this.pool.query<DraftOfferingRecord>(
      `select id, business_id as "businessId", category_id as "categoryId",
         slug, title, summary, status, version, created_at as "createdAt",
         updated_at as "updatedAt"
       from offering where id = $1 and business_id = $2 and status = 'DRAFT'`,
      [offeringId, businessId]
    );
    return result.rows[0] ?? null;
  }

  async record(entry: AuditEntry): Promise<void> {
    const client = await this.pool.connect();
    try {
      await this.writeAudit(client, entry);
    } finally {
      client.release();
    }
  }

  private async writeAudit(
    client: PoolClient,
    entry: AuditEntry
  ): Promise<void> {
    await client.query(
      `insert into audit_record
        (actor_user_id, effective_business_id, action, target_type, target_id,
         result, reason, correlation_id, safe_metadata)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        entry.actorUserId ?? null,
        entry.effectiveBusinessId ?? null,
        entry.action,
        entry.targetType,
        entry.targetId ?? null,
        entry.result,
        entry.reason ?? null,
        entry.correlationId,
        entry.safeMetadata ? JSON.stringify(entry.safeMetadata) : null
      ]
    );
  }
}
