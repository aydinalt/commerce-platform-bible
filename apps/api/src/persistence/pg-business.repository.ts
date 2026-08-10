import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool } from "pg";

import {
  BusinessSlugConflictError,
  type BusinessInformation,
  type OwnedBusiness
} from "@commerce/business";

/**
 * Every Business Information column, named once. The owner read-back and the
 * update read-back must agree exactly, and AC-9 is easier to keep true when the
 * protected columns are listed in one place that can be reviewed as a whole.
 */
const INFORMATION_COLUMNS = `b.id, b.slug, b.name, b.status,
   b.public_exposure as "publicExposure",
   b.logo_url as "logoUrl", b.short_description as "shortDescription",
   b.contact_telephone as "contactTelephone",
   b.contact_email as "contactEmail", b.contact_url as "contactUrl"`;

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

  /**
   * The owner's view of one owned Business (AC-1). Ownership is part of the
   * join rather than a separate check, so a Business the acting person does not
   * own is indistinguishable from one that does not exist.
   */
  async findOwnedInformation(
    businessId: string,
    userId: string
  ): Promise<BusinessInformation | null> {
    const result = await this.pool.query<BusinessInformation>(
      `select ${INFORMATION_COLUMNS}
       from business b
       join business_owner bo on bo.business_id = b.id and bo.user_id = $2
       where b.id = $1`,
      [businessId, userId]
    );
    return result.rows[0] ?? null;
  }

  /**
   * Replaces the Business Information set and records the edit.
   *
   * The update names only information columns. AC-12 requires that a valid edit
   * changes no moderation status, exposure input, Offering lifecycle, final
   * Offering eligibility or Completion by itself — the cheapest way to keep that
   * true is for this statement to be unable to express those changes at all.
   *
   * The join on `business_owner` means a non-owner updates zero rows and gets
   * `null` back, which the caller reports as absence.
   */
  async updateInformation(input: {
    businessId: string;
    contactEmail: string | null;
    contactTelephone: string | null;
    contactUrl: string | null;
    correlationId: string;
    logoUrl: string | null;
    name: string;
    shortDescription: string | null;
    userId: string;
  }): Promise<BusinessInformation | null> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const updated = await client.query<BusinessInformation>(
        `update business b
           set name = $3, logo_url = $4, short_description = $5,
               contact_telephone = $6, contact_email = $7, contact_url = $8
         from business_owner bo
         where bo.business_id = b.id and bo.user_id = $2 and b.id = $1
         returning ${INFORMATION_COLUMNS}`,
        [
          input.businessId,
          input.userId,
          input.name,
          input.logoUrl,
          input.shortDescription,
          input.contactTelephone,
          input.contactEmail,
          input.contactUrl
        ]
      );
      const business = updated.rows[0];
      if (!business) {
        await client.query("rollback");
        return null;
      }

      await client.query(
        `insert into audit_record
          (actor_user_id, effective_business_id, action, target_type, target_id,
           result, correlation_id)
         values ($1,$2,'business.information.update','Business',$2,'ALLOWED',$3)`,
        [input.userId, business.id, input.correlationId]
      );
      await client.query("commit");
      return business;
    } catch (error) {
      await client.query("rollback");
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
