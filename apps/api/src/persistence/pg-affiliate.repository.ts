import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool, type PoolClient } from "pg";

import {
  AffiliateDestinationExistsError,
  AffiliateDestinationReadOnlyError,
  AUTHORED_DESTINATION_STATE,
  DESTINATION_AUTHORABLE,
  type AffiliateDestinationRecord,
  type OfferingLifecycle
} from "@commerce/offering";

const UNIQUE_VIOLATION = "23505";
const OFFERING_KEY_CONSTRAINT = "affiliate_destination_offering_id_key";

const DESTINATION_COLUMNS = `d.id, d.offering_id as "offeringId", d.reference,
   d.status::text as status,
   d.validation_result::text as "validationResult",
   d.handoff_eligibility::text as "handoffEligibility",
   d.version`;

@Injectable()
export class PgAffiliateRepository implements OnModuleDestroy {
  private readonly pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  /**
   * The destination for an owned Offering, if there is one.
   *
   * Ownership is part of the join, so a destination belonging to someone else's
   * Offering is not refused — it is simply not there, which is the same answer
   * the caller would get for an Offering that does not exist.
   */
  async findOwned(
    businessId: string,
    offeringId: string
  ): Promise<AffiliateDestinationRecord | null> {
    const result = await this.pool.query<AffiliateDestinationRecord>(
      `select ${DESTINATION_COLUMNS}
       from affiliate_destination d
       join offering o on o.id = d.offering_id and o.business_id = $2
       where d.offering_id = $1`,
      [offeringId, businessId]
    );
    return result.rows[0] ?? null;
  }

  /**
   * Creates the one destination an Offering may have (AC-1, AC-3).
   *
   * The three authored results are written as literals rather than left to the
   * column defaults. Defaults describe what happens when nobody says; §9.5 is
   * about what happens when someone does.
   */
  async create(input: {
    businessId: string;
    correlationId: string;
    offeringId: string;
    reference: string;
    userId: string;
  }): Promise<AffiliateDestinationRecord | null> {
    return this.write(async (client) => {
      const lifecycle = await this.authorableLifecycle(
        client,
        input.businessId,
        input.offeringId
      );
      if (lifecycle === null) return null;

      const created = await client.query<AffiliateDestinationRecord>(
        `insert into affiliate_destination
           (offering_id, reference, status, validation_result,
            handoff_eligibility)
         values ($1,$2,$3::"AffiliateDestinationStatus",
           $4::"AffiliateValidationResult", $5::"HandoffEligibility")
         returning ${DESTINATION_COLUMNS.replaceAll("d.", "")}`,
        [
          input.offeringId,
          input.reference,
          AUTHORED_DESTINATION_STATE.status,
          AUTHORED_DESTINATION_STATE.validationResult,
          AUTHORED_DESTINATION_STATE.handoffEligibility
        ]
      );
      const destination = created.rows[0];
      if (!destination) throw new Error("DESTINATION_INSERT_FAILED");

      await this.audit(client, {
        action: "offering.destination.create",
        businessId: input.businessId,
        correlationId: input.correlationId,
        destinationId: destination.id,
        userId: input.userId
      });
      return destination;
    });
  }

  /**
   * Edits the destination reference (AC-4, AC-5).
   *
   * This statement changes the reference and nothing else. The three results
   * are reset by the database trigger, which is the only way to be sure the
   * reset also happens on a path written later — PRD-0006 will own actions that
   * update this row.
   */
  async edit(input: {
    businessId: string;
    correlationId: string;
    offeringId: string;
    reference: string;
    userId: string;
  }): Promise<AffiliateDestinationRecord | null> {
    return this.write(async (client) => {
      const lifecycle = await this.authorableLifecycle(
        client,
        input.businessId,
        input.offeringId
      );
      if (lifecycle === null) return null;

      const updated = await client.query<AffiliateDestinationRecord>(
        `update affiliate_destination d
           set reference = $2
         where d.offering_id = $1
         returning ${DESTINATION_COLUMNS}`,
        [input.offeringId, input.reference]
      );
      const destination = updated.rows[0];
      if (!destination) return null;

      await this.audit(client, {
        action: "offering.destination.edit",
        businessId: input.businessId,
        correlationId: input.correlationId,
        destinationId: destination.id,
        userId: input.userId
      });
      return destination;
    });
  }

  /**
   * Locks the Offering and reports whether its lifecycle admits authoring.
   *
   * `null` means the Offering is not this Business's to touch; the read-only
   * refusal is thrown rather than returned because it is a different answer —
   * the Offering is theirs, and the destination is still visible.
   */
  private async authorableLifecycle(
    client: PoolClient,
    businessId: string,
    offeringId: string
  ): Promise<OfferingLifecycle | null> {
    const locked = await client.query<{ status: OfferingLifecycle }>(
      `select status::text as status from offering
       where id = $1 and business_id = $2 for update`,
      [offeringId, businessId]
    );
    const status = locked.rows[0]?.status;
    if (status === undefined) return null;
    if (!DESTINATION_AUTHORABLE.includes(status))
      throw new AffiliateDestinationReadOnlyError();
    return status;
  }

  private async audit(
    client: PoolClient,
    entry: {
      action: string;
      businessId: string;
      correlationId: string;
      destinationId: string;
      userId: string;
    }
  ): Promise<void> {
    await client.query(
      `insert into audit_record
        (actor_user_id, effective_business_id, action, target_type, target_id,
         result, correlation_id)
       values ($1,$2,$3,'AffiliateDestination',$4,'ALLOWED',$5)`,
      [
        entry.userId,
        entry.businessId,
        entry.action,
        entry.destinationId,
        entry.correlationId
      ]
    );
  }

  private async write<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const result = await work(client);
      await client.query("commit");
      return result;
    } catch (error) {
      await client.query("rollback");
      if (isUniqueViolation(error, OFFERING_KEY_CONSTRAINT))
        throw new AffiliateDestinationExistsError();
      throw error;
    } finally {
      client.release();
    }
  }
}

function isUniqueViolation(error: unknown, constraint: string): boolean {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as { code?: unknown; constraint?: unknown };
  return (
    candidate.code === UNIQUE_VIOLATION && candidate.constraint === constraint
  );
}
