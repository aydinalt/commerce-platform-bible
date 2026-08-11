import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool } from "pg";

import {
  BusinessSlugConflictError,
  type BusinessInformation,
  type OwnedBusiness
} from "@commerce/business";

import { PROJECT_OFFERING } from "./pg-offering-content.repository.js";

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

/**
 * Restrict and Restore (`US-BUS-F03-001` AC-4, AC-11).
 *
 * The moderation status moves and the exposure input follows it — the database
 * keeps that mapping, so this writes one thing. What it also has to do is make
 * PRD-0001's composed result true again on both sides: a Restricted Business's
 * Offerings must stop being findable, and a restored one's Published Offerings
 * must reappear.
 *
 * AC-10 and AC-13 are then absences. Nothing here writes an Offering lifecycle,
 * an Affiliate Destination status or validation result, a User Account status
 * or an ownership row, and AC-12 and AC-14 fall out of the same restraint: only
 * lifecycle-Published Offerings are re-projected, so a Draft stays a Draft and
 * a Hidden or Archived Offering stays where it was.
 */
@Injectable()
export class PgBusinessRepository implements OnModuleDestroy {
  private readonly pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  async moderate(
    businessId: string,
    status: "RESTRICTED" | "UNRESTRICTED"
  ): Promise<OwnedBusiness | null> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      // Checked first: a moderation row for a Business that does not exist is
      // a foreign-key violation, and a caller naming an unknown identifier
      // deserves an absence rather than a failure.
      const exists = await client.query(
        `select 1 from business where id = $1`,
        [businessId]
      );
      if (exists.rowCount === 0) {
        await client.query("rollback");
        return null;
      }

      const updated = await client.query(
        `insert into business_moderation_state (business_id, status)
         values ($1, $2::"BusinessModerationStatus")
         on conflict (business_id) do update set
           status = excluded.status, updated_at = now()`,
        [businessId, status]
      );
      if (updated.rowCount === 0) {
        await client.query("rollback");
        return null;
      }

      if (status === "RESTRICTED")
        // Final Offering Public Eligibility is composed from the Business
        // input, so a Restricted Business has no eligible Offerings — and the
        // projection is where that answer is read from.
        await client.query(
          `delete from offering_search_projection where business_id = $1`,
          [businessId]
        );
      else {
        // AC-14. Only lifecycle-Published Offerings regain eligibility. A
        // Draft, a Hidden and an Archived Offering are each ineligible for a
        // reason restoration does not touch.
        const published = await client.query<{ id: string }>(
          `select id from offering
           where business_id = $1 and status = 'PUBLISHED'`,
          [businessId]
        );
        for (const offering of published.rows)
          await client.query(PROJECT_OFFERING, [offering.id, 1]);
      }

      const record = await client.query<OwnedBusiness>(
        `select b.id, b.name, b.slug, b.status,
           b.public_exposure as "publicExposure"
         from business b where b.id = $1`,
        [businessId]
      );
      await client.query("commit");
      return record.rows[0] ?? null;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * The Business as its Dashboard names it (`US-BUS-F04-001` AC-1, AC-2).
   *
   * The ownership join is the authorization: a person who does not own this
   * Business gets no row, and the caller reports that as absence. Admin
   * authorization cannot substitute for it, because there is no other way in
   * (AC-8).
   *
   * The Moderation Status comes back with the name, so the owner sees it
   * wherever they are working rather than discovering it by being refused.
   */
  async findDashboardBusiness(
    businessId: string,
    userId: string
  ): Promise<{
    id: string;
    moderationStatus: "RESTRICTED" | "UNRESTRICTED";
    name: string;
    publicExposure: "ELIGIBLE" | "INELIGIBLE";
    slug: string;
  } | null> {
    const result = await this.pool.query<{
      id: string;
      moderationStatus: "RESTRICTED" | "UNRESTRICTED";
      name: string;
      publicExposure: "ELIGIBLE" | "INELIGIBLE";
      slug: string;
    }>(
      `select b.id, b.name, b.slug,
         b.public_exposure::text as "publicExposure",
         coalesce(m.status::text, 'UNRESTRICTED') as "moderationStatus"
       from business b
       join business_owner bo on bo.business_id = b.id and bo.user_id = $2
       left join business_moderation_state m on m.business_id = b.id
       where b.id = $1`,
      [businessId, userId]
    );
    return result.rows[0] ?? null;
  }

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
