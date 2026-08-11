import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool, type PoolClient } from "pg";

import {
  AffiliateDestinationExistsError,
  AffiliateDestinationReadOnlyError,
  AffiliateNotEnabledError,
  AffiliateNotValidatedError,
  AUTHORED_DESTINATION_STATE,
  composeHandoffEligibility,
  DESTINATION_AUTHORABLE,
  type AffiliateDestinationRecord,
  type AffiliateValidationResult,
  type OfferingLifecycle
} from "@commerce/offering";

const UNIQUE_VIOLATION = "23505";
const OFFERING_KEY_CONSTRAINT = "affiliate_destination_offering_id_key";

const DESTINATION_COLUMNS = `d.id, d.offering_id as "offeringId", d.reference,
   d.status::text as status,
   d.validation_result::text as "validationResult",
   d.validation_reason as "validationReason",
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
  /**
   * The Offering's current lifecycle, for the one caller that needs it.
   *
   * `US-BUS-F03-001` AC-9 lets a Restricted owner author an Affiliate
   * Destination only where the Offering itself is still owner-manageable, and
   * that is a lifecycle question rather than a destination one.
   */
  async offeringLifecycle(offeringId: string): Promise<string | null> {
    const result = await this.pool.query<{ status: string }>(
      `select status::text as status from offering where id = $1`,
      [offeringId]
    );
    return result.rows[0]?.status ?? null;
  }

  /**
   * The owned Offering the destination entry is about (`US-BUS-F06-001` AC-1).
   *
   * Ownership is the `where`, not a check afterwards: an Offering belonging to
   * another Business is not refused, it is simply not found — the same answer
   * as for an Offering that never existed. `offeringLifecycle` above cannot
   * serve here, because it deliberately knows nothing about who owns what.
   */
  async findOwnedOffering(
    businessId: string,
    offeringId: string
  ): Promise<{ id: string; status: OfferingLifecycle; title: string } | null> {
    const result = await this.pool.query<{
      id: string;
      status: OfferingLifecycle;
      title: string;
    }>(
      `select id, status::text as status, title
       from offering where id = $1 and business_id = $2`,
      [offeringId, businessId]
    );
    return result.rows[0] ?? null;
  }

  /**
   * Every Affiliate Destination with its derived workload category
   * (`US-PLT-F07-001` AC-8 to AC-12).
   *
   * The category is composed in TypeScript rather than in SQL. It could have
   * been a `CASE` expression, and then there would be two places that decide
   * what "Ready to Enable" means — the one PRD-0006 §9 describes and the one
   * that ships. Reading the two authoritative results and asking the domain
   * keeps it to one.
   *
   * Ordering puts the oldest first: work that has waited longest is the work
   * most likely to have been forgotten.
   */
  async listWorkload(): Promise<
    { businessId: string; destination: AffiliateDestinationRecord }[]
  > {
    const result = await this.pool.query<
      AffiliateDestinationRecord & { businessId: string }
    >(
      `select ${DESTINATION_COLUMNS}, o.business_id as "businessId"
       from affiliate_destination d
       join offering o on o.id = d.offering_id
       order by d.created_at, d.id`
    );
    return result.rows.map(({ businessId, ...destination }) => ({
      businessId,
      destination
    }));
  }

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
   * The Admin's view of a destination. Ownership is not part of the lookup: an
   * Admin administers destinations, and is the owner of none of them.
   */
  async findForAdmin(
    offeringId: string
  ): Promise<AffiliateDestinationRecord | null> {
    const result = await this.pool.query<AffiliateDestinationRecord>(
      `select ${DESTINATION_COLUMNS} from affiliate_destination d
       where d.offering_id = $1`,
      [offeringId]
    );
    return result.rows[0] ?? null;
  }

  /**
   * Review (`US-OFR-F07-001` AC-2).
   *
   * It writes a review row and touches no result column. That is the whole
   * action: PRD-0001 §9.6 says Review changes no status, no validation result
   * and no Handoff Eligibility by itself, and §9.4 makes it a condition a
   * `Valid` result depends on — so it has to leave a trace without leaving a
   * change.
   */
  async review(input: {
    correlationId: string;
    note: string | null;
    offeringId: string;
    userId: string;
  }): Promise<AffiliateDestinationRecord | null> {
    return this.administer(input.offeringId, async (client, current) => {
      await client.query(
        `insert into affiliate_destination_review
           (destination_id, reviewed_by, note) values ($1,$2,$3)`,
        [current.id, input.userId, input.note]
      );
      await this.audit(client, {
        action: "affiliate.review",
        correlationId: input.correlationId,
        destinationId: current.id,
        userId: input.userId
      });
    });
  }

  /**
   * Validate (AC-3, AC-4, AC-5).
   *
   * One current result, and the status left exactly where it was. Handoff
   * Eligibility is recomposed rather than assigned, which is what makes AC-5
   * fall out for free: a `VALID` result on a `DRAFT` destination composes to
   * `INELIGIBLE` because it is not Enabled, not because anyone remembered to
   * hold it back.
   */
  async validate(input: {
    correlationId: string;
    offeringId: string;
    reason: string | null;
    result: AffiliateValidationResult;
    userId: string;
  }): Promise<AffiliateDestinationRecord | null> {
    return this.administer(input.offeringId, async (client, current) => {
      await client.query(
        `update affiliate_destination
           set validation_result = $2::"AffiliateValidationResult",
               validation_reason = $3,
               validated_at = now(),
               validated_by = $4,
               handoff_eligibility = $5::"HandoffEligibility",
               version = version + 1,
               updated_at = now()
         where id = $1`,
        [
          current.id,
          input.result,
          input.reason,
          input.userId,
          composeHandoffEligibility({
            status: current.status,
            validationResult: input.result
          })
        ]
      );
      await this.audit(client, {
        action: "affiliate.validate",
        correlationId: input.correlationId,
        destinationId: current.id,
        userId: input.userId
      });
    });
  }

  /// Enable (AC-6, AC-7). Available only on a `VALID` destination.
  async enable(input: {
    correlationId: string;
    offeringId: string;
    userId: string;
  }): Promise<AffiliateDestinationRecord | null> {
    return this.administer(input.offeringId, async (client, current) => {
      if (current.validationResult !== "VALID")
        throw new AffiliateNotValidatedError(current.validationResult);

      await client.query(
        `update affiliate_destination
           set status = 'ENABLED',
               handoff_eligibility = $2::"HandoffEligibility",
               version = version + 1, updated_at = now()
         where id = $1`,
        [
          current.id,
          composeHandoffEligibility({
            status: "ENABLED",
            validationResult: current.validationResult
          })
        ]
      );
      await this.audit(client, {
        action: "affiliate.enable",
        correlationId: input.correlationId,
        destinationId: current.id,
        userId: input.userId
      });
    });
  }

  /**
   * Disable (AC-8, AC-9).
   *
   * The statement names status and eligibility and cannot name the validation
   * result, which is how AC-9 preserves it: a disabled destination keeps the
   * verdict it earned, so re-enabling it later does not need re-validating.
   */
  async disable(input: {
    correlationId: string;
    offeringId: string;
    userId: string;
  }): Promise<AffiliateDestinationRecord | null> {
    return this.administer(input.offeringId, async (client, current) => {
      if (current.status !== "ENABLED")
        throw new AffiliateNotEnabledError(current.status);

      await client.query(
        `update affiliate_destination
           set status = 'DISABLED',
               handoff_eligibility = $2::"HandoffEligibility",
               version = version + 1, updated_at = now()
         where id = $1`,
        [
          current.id,
          composeHandoffEligibility({
            status: "DISABLED",
            validationResult: current.validationResult
          })
        ]
      );
      await this.audit(client, {
        action: "affiliate.disable",
        correlationId: input.correlationId,
        destinationId: current.id,
        userId: input.userId
      });
    });
  }

  /**
   * One shape for all four actions: lock the destination, do the work, read it
   * back.
   *
   * The lock is on the destination rather than the Offering, because AC-12 puts
   * the Offering out of reach — administration changes no Offering lifecycle,
   * no Business Moderation Status and no account status, and nothing in here
   * can reach a table that holds any of them.
   */
  private async administer(
    offeringId: string,
    work: (
      client: PoolClient,
      current: AffiliateDestinationRecord
    ) => Promise<void>
  ): Promise<AffiliateDestinationRecord | null> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const locked = await client.query<AffiliateDestinationRecord>(
        `select ${DESTINATION_COLUMNS} from affiliate_destination d
         where d.offering_id = $1 for update`,
        [offeringId]
      );
      const current = locked.rows[0];
      if (!current) {
        await client.query("rollback");
        return null;
      }

      await work(client, current);

      const updated = await client.query<AffiliateDestinationRecord>(
        `select ${DESTINATION_COLUMNS} from affiliate_destination d
         where d.id = $1`,
        [current.id]
      );
      await client.query("commit");
      return updated.rows[0] ?? null;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
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

  /**
   * `businessId` is absent for the Platform administration actions, and the
   * audit record says so: an Admin acts in the Admin context rather than for a
   * Business (`US-IDN-F08-001` AC-6). Recording the Offering's owner there
   * would claim an authority the Admin was not using.
   */
  private async audit(
    client: PoolClient,
    entry: {
      action: string;
      businessId?: string;
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
        entry.businessId ?? null,
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
