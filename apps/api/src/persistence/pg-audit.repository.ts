import { Injectable } from "@nestjs/common";
import { Pool } from "pg";

import type { AdminAuditAction } from "@commerce/contracts";

/**
 * The actions the trail records.
 *
 * **Taken from the contract rather than written out again here.** This was a
 * third hand-maintained copy of the list — the database enum, the contract's
 * `ADMIN_AUDIT_ACTIONS`, and a union in this file — and the three agreed only
 * because somebody remembered to update all of them. `tests/i87-destination-
 * audit.test.ts` catches a disagreement between the first two by reading
 * `enum_range` out of the database; nothing caught a disagreement with the
 * third, and adding I93's five editorial acts would have been a fourth chance
 * to get it wrong silently.
 *
 * Two owners is the fewest this can have: a shared package may not import the
 * database (`dependency-cruiser.config.mjs`), so the contract cannot read the
 * enum, and the test is what holds them together.
 */
export type { AdminAuditAction };

/** One row of the trail, as it is read (I84). */
export interface AdminAuditRow {
  actionType: AdminAuditAction;
  actorId: string;
  caseId: string | null;
  id: string;
  occurredAt: Date;
  targetId: string | null;
}

/**
 * What an Admin did, written down (I83).
 *
 * The Owner asked for a central place for every consequential Admin action,
 * starting with the PII reveal the previous increment left ready for one.
 *
 * **Writing here must never stop the thing being audited.** That is the one
 * design decision in this file and it cuts both ways, so it is worth being
 * explicit about which way it cuts here: if the audit insert fails, the action
 * it describes has *already happened* — the address was read, the account was
 * suspended — and throwing would report a failure that did not occur, leaving
 * an Admin to retry an action that already took effect. So a failed write is
 * swallowed and logged rather than propagated.
 *
 * The cost of that choice is real and is named rather than hidden: a database
 * fault can lose an audit row while its action succeeds. The alternative loses
 * the action *and* misreports it, which is worse. A trail that is complete
 * except under database failure is the honest shape of this, and pretending
 * otherwise by throwing would buy nothing — the row would still not be there.
 *
 * The table is append-only, enforced by triggers on UPDATE, DELETE and
 * TRUNCATE. There is deliberately no method here that reads, edits or removes
 * anything: this repository can only add.
 */
@Injectable()
export class PgAuditRepository {
  constructor(private readonly pool: Pool) {}

  /**
   * Reading the trail (I84).
   *
   * **This repository could only add until now, and that was worth keeping as
   * long as it lasted.** Reading is added because the Owner asked for a surface
   * to read it from; there is still no method here that edits or removes
   * anything, and the database refuses all three of UPDATE, DELETE and TRUNCATE
   * regardless of what this file asks for.
   *
   * Filtered by who acted, what they did, and when — the three the Owner named.
   * Paged with an offset, unlike the report queue: that queue is work to be
   * emptied so paging it would be choosing which part of a backlog to ignore,
   * while this is a record being searched, and a record you cannot page through
   * is a record you cannot audit.
   */
  async list(input: {
    action: AdminAuditAction | null;
    actorId: string | null;
    from: Date | null;
    limit: number;
    offset: number;
    to: Date | null;
  }): Promise<{ events: AdminAuditRow[]; total: number }> {
    const found = await this.pool.query<AdminAuditRow & { total: string }>(
      `select e.id::text as id, e.actor_id as "actorId",
         e.action_type::text as "actionType",
         e.target_id as "targetId", e.case_id as "caseId",
         e.occurred_at as "occurredAt",
         count(*) over ()::text as total
       from admin_audit_event e
       where ($1::text is null or e.action_type::text = $1)
         and ($2::uuid is null or e.actor_id = $2)
         and ($3::timestamptz is null or e.occurred_at >= $3)
         and ($4::timestamptz is null or e.occurred_at < $4)
       order by e.occurred_at desc, e.id desc
       limit $5 offset $6`,
      [
        input.action,
        input.actorId,
        input.from,
        input.to,
        input.limit,
        input.offset
      ]
    );
    return {
      events: found.rows.map((row) => ({
        actionType: row.actionType,
        actorId: row.actorId,
        caseId: row.caseId,
        id: row.id,
        occurredAt: row.occurredAt,
        targetId: row.targetId
      })),
      total: Number(found.rows[0]?.total ?? 0)
    };
  }

  async record(input: {
    action: AdminAuditAction;
    actorId: string;
    caseId?: string | null;
    targetId?: string | null;
  }): Promise<void> {
    try {
      await this.pool.query(
        `insert into admin_audit_event
           (actor_id, action_type, target_id, case_id)
         values ($1, $2::"AdminAuditAction", $3, $4)`,
        [
          input.actorId,
          input.action,
          input.targetId ?? null,
          input.caseId ?? null
        ]
      );
    } catch (error) {
      /*
       * Reported to the process log rather than to the caller. Something has to
       * say an audit row was lost, and the caller is the one party that must
       * not hear it — see the note above.
       */
      console.error("admin_audit_event_write_failed", {
        action: input.action,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}
