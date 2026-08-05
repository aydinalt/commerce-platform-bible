import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool } from "pg";

import {
  BusinessSlugConflictError,
  type OwnedBusiness
} from "@commerce/business";

const UNIQUE_VIOLATION = "23505";
const BUSINESS_SLUG_CONSTRAINT = "business_slug_key";

function isUniqueViolation(error: unknown, constraint: string): boolean {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as { code?: unknown; constraint?: unknown };
  return (
    candidate.code === UNIQUE_VIOLATION && candidate.constraint === constraint
  );
}

@Injectable()
export class PgBusinessRepository implements OnModuleDestroy {
  private readonly pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async isEnabled(userId: string): Promise<boolean> {
    const result = await this.pool.query<{ enabled: boolean }>(
      `select (status = 'ENABLED') as enabled from user_account where id = $1`,
      [userId]
    );
    return result.rows[0]?.enabled ?? false;
  }

  /**
   * The Business, its ownership, its moderation state and the audit record are
   * written together. A Business without its owner would be unreachable, and an
   * owner row without its Business is meaningless — neither half is useful
   * alone, so neither is committed alone.
   *
   * Moderation is written as `UNRESTRICTED` and exposure defaults to `ELIGIBLE`
   * (`US-BUS-F01-001` AC-4, AC-5) rather than left to be inferred from an absent
   * row.
   */
  async create(input: {
    correlationId: string;
    name: string;
    slug: string;
    userId: string;
  }): Promise<OwnedBusiness> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const created = await client.query<OwnedBusiness>(
        `insert into business (slug, name, status, public_exposure)
         values ($1,$2,'ACTIVE','ELIGIBLE')
         returning id, slug, name, status,
           public_exposure as "publicExposure"`,
        [input.slug, input.name]
      );
      const business = created.rows[0];
      if (!business) throw new Error("BUSINESS_INSERT_FAILED");

      await client.query(
        `insert into business_owner (business_id, user_id) values ($1,$2)`,
        [business.id, input.userId]
      );
      await client.query(
        `insert into business_moderation_state (business_id, status, updated_at)
         values ($1,'UNRESTRICTED',now())`,
        [business.id]
      );
      await client.query(
        `insert into audit_record
          (actor_user_id, effective_business_id, action, target_type, target_id,
           result, correlation_id)
         values ($1,$2,'business.create','Business',$2,'ALLOWED',$3)`,
        [input.userId, business.id, input.correlationId]
      );
      await client.query("commit");
      return business;
    } catch (error) {
      await client.query("rollback");
      if (isUniqueViolation(error, BUSINESS_SLUG_CONSTRAINT))
        throw new BusinessSlugConflictError(input.slug);
      throw error;
    } finally {
      client.release();
    }
  }

  async listOwned(userId: string): Promise<OwnedBusiness[]> {
    const result = await this.pool.query<OwnedBusiness>(
      `select b.id, b.slug, b.name, b.status,
         b.public_exposure as "publicExposure"
       from business b
       join business_owner bo on bo.business_id = b.id and bo.user_id = $1
       order by b.name`,
      [userId]
    );
    return result.rows;
  }
}
