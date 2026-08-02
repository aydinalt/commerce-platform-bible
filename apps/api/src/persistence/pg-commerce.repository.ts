import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool, type PoolClient } from "pg";

import type { AuditEntry, AuditWriter } from "@commerce/audit";
import type {
  BusinessAccessDecision,
  BusinessAccessReader
} from "@commerce/business";
import type { CatalogReader } from "@commerce/catalog";
import type { IdentityReader } from "@commerce/identity";
import type {
  DraftOfferingRecord,
  DraftOfferingRepository
} from "@commerce/offering";

type OfferingInput = Parameters<DraftOfferingRepository["create"]>[0];

@Injectable()
export class PgCommerceRepository
  implements
    IdentityReader,
    BusinessAccessReader,
    CatalogReader,
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

  async isEnabled(userId: string): Promise<boolean> {
    const result = await this.pool.query<{ enabled: boolean }>(
      `select (status = 'ACTIVE') as enabled from user_account where id = $1`,
      [userId]
    );
    return result.rows[0]?.enabled ?? false;
  }

  async canAuthorOfferings(
    businessId: string,
    userId: string
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
    if (row.moderation === "RESTRICTED")
      return { allowed: false, reason: "RESTRICTED" };
    if (row.status === "SUSPENDED" || row.status === "RETIRED")
      return { allowed: false, reason: "SUSPENDED" };
    return { allowed: true };
  }

  async isActiveCategory(categoryId: string): Promise<boolean> {
    const result = await this.pool.query(
      `select 1 from category where id = $1 and active = true`,
      [categoryId]
    );
    return result.rowCount === 1;
  }

  async create(input: OfferingInput): Promise<DraftOfferingRecord> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
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
      throw error;
    } finally {
      client.release();
    }
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
