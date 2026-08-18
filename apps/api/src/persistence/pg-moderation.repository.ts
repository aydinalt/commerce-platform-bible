import { Injectable } from "@nestjs/common";
import { Pool } from "pg";

import {
  ACTION_TARGET,
  availableModerationActions,
  CaseNotResolvedError,
  CaseNotReReviewedError,
  type ModerationAction,
  type ModerationTargetType
} from "@commerce/moderation";

const CHECK_VIOLATION = "23514";

export interface ModerationCaseRecord {
  availableActions: ModerationAction[];
  businessId: string | null;
  closedAt: string | null;
  id: string;
  offeringId: string | null;
  openedAt: string;
  /// True where the owner has saved a correction that nobody has looked at
  /// since. Closure is refused while it holds (`US-PLT-F06-001` AC-10).
  reReviewRequired: boolean;
  resolutions: {
    action: ModerationAction | null;
    noActionReason: string | null;
    recordedAt: string;
  }[];
  status: "CLOSED" | "OPEN";
  targetType: ModerationTargetType;
  userId: string | null;
}

interface CaseRow {
  businessId: string | null;
  closedAt: Date | null;
  id: string;
  lifecycle: "ARCHIVED" | "DRAFT" | "HIDDEN" | "PUBLISHED" | null;
  offeringId: string | null;
  lastEditAt: Date | null;
  lastReviewAt: Date | null;
  openedAt: Date;
  restricted: boolean | null;
  status: "CLOSED" | "OPEN";
  suspended: boolean | null;
  targetType: ModerationTargetType;
  userId: string | null;
}

/**
 * The case read, with just enough of the target to answer AC-5.
 *
 * Three facts are joined in — whether the Business is Restricted, whether the
 * account is Suspended, and the Offering's lifecycle — and they are the *only*
 * target state that crosses this boundary. They are read to decide which
 * actions to offer, never reported: a case that published its target's product
 * state would be exactly the conflation AC-9 forbids.
 */
const CASE_SELECT = `select c.id, c.target_type::text as "targetType",
     c.offering_id as "offeringId", c.business_id as "businessId",
     c.user_id as "userId", c.status::text as status,
     c.opened_at as "openedAt", c.closed_at as "closedAt",
     (coalesce(m.status::text, 'UNRESTRICTED') = 'RESTRICTED') as restricted,
     (u.status::text = 'SUSPENDED') as suspended,
     o.status::text as lifecycle,
     (select max(e.edited_at) from correction_edit e
      join correction_request q on q.id = e.correction_request_id
      where q.case_id = c.id) as "lastEditAt",
     (select max(v.reviewed_at) from correction_review v
      where v.case_id = c.id) as "lastReviewAt"
   from moderation_case c
   left join business_moderation_state m on m.business_id = c.business_id
   left join user_account u on u.id = c.user_id
   left join offering o on o.id = c.offering_id`;

function isCheckViolation(error: unknown, constraint: string): boolean {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as { code?: unknown; message?: unknown };
  return (
    candidate.code === CHECK_VIOLATION &&
    typeof candidate.message === "string" &&
    candidate.message.includes(constraint)
  );
}

@Injectable()
export class PgModerationRepository {
  constructor(private readonly pool: Pool) {}

  /**
   * Surfaces a case, which is to say opens one (AC-2).
   *
   * A target with an Open case already has the case it needs — a second would
   * be a second thing to close for one concern. So this returns the Open one
   * where there is one, and the returned case is `Open` either way, which is
   * the whole of AC-2.
   *
   * AC-3 is the absence here: nothing in this method reads or writes an
   * Offering lifecycle, a moderation status or an account status. Opening a
   * case is a note that somebody should look, not a consequence.
   */
  async open(input: {
    businessId: string | null;
    offeringId: string | null;
    openedBy: string;
    targetType: ModerationTargetType;
    userId: string | null;
  }): Promise<ModerationCaseRecord | null> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");

      // An Offering case names the Business that will answer for it, resolved
      // here rather than supplied, so a caller cannot pair an Offering with
      // somebody else's Business.
      let businessId = input.businessId;
      if (input.targetType === "OFFERING") {
        const owner = await client.query<{ businessId: string }>(
          `select business_id as "businessId" from offering where id = $1`,
          [input.offeringId]
        );
        businessId = owner.rows[0]?.businessId ?? null;
        if (businessId === null) {
          await client.query("rollback");
          return null;
        }
      }

      const existing = await client.query<{ id: string }>(
        `select id from moderation_case
         where status = 'OPEN'
           and target_type = $1::"ModerationTargetType"
           and offering_id is not distinct from $2
           and business_id is not distinct from $3
           and user_id is not distinct from $4
         order by opened_at limit 1`,
        [input.targetType, input.offeringId, businessId, input.userId]
      );

      const id =
        existing.rows[0]?.id ??
        (
          await client.query<{ id: string }>(
            `insert into moderation_case
               (target_type, offering_id, business_id, user_id, opened_by)
             values ($1::"ModerationTargetType",$2,$3,$4,$5)
             returning id`,
            [
              input.targetType,
              input.offeringId,
              businessId,
              input.userId,
              input.openedBy
            ]
          )
        ).rows[0]?.id;
      if (!id) throw new Error("CASE_NOT_OPENED");

      await client.query("commit");
      return this.find(id);
    } catch (error) {
      await client.query("rollback");
      // A target that does not exist arrives as a foreign-key violation; the
      // caller should hear "no such target", not a server error.
      if (
        typeof error === "object" &&
        error !== null &&
        (error as { code?: unknown }).code === "23503"
      )
        return null;
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Notes that one of the seven was applied to a target, within whatever Open
   * case that target has (AC-7).
   *
   * It records rather than performs. `US-BUS-F03-001` owns what Restrict
   * Business *does*; this writes down that it happened, so a later closure has
   * something to cite. A target with no Open case is not an error — moderation
   * can be applied without anybody having opened a case first, and inventing
   * one here would make a case out of an act that needed no review.
   */
  async recordApplied(input: {
    action: ModerationAction;
    recordedBy: string;
    targetId: string;
  }): Promise<void> {
    // Which column identifies the target follows from the action, so a caller
    // supplies the thing it acted on and nothing else. An Offering case also
    // names the Business that will answer for it, and matching on both would
    // have quietly missed every Offering action.
    const column = {
      BUSINESS: "business_id",
      OFFERING: "offering_id",
      USER_ACCOUNT: "user_id"
    }[ACTION_TARGET[input.action]];
    await this.pool.query(
      `insert into moderation_resolution (case_id, action, recorded_by)
       select c.id, $1::"ModerationAction", $3
       from moderation_case c
       where c.status = 'OPEN'
         and c.target_type = $4::"ModerationTargetType"
         and c.${column} = $2`,
      [
        input.action,
        input.targetId,
        input.recordedBy,
        ACTION_TARGET[input.action]
      ]
    );
  }

  /**
   * Records that an Admin re-reviewed the owner's response
   * (`US-PLT-F06-001` AC-10).
   *
   * It writes one row and reads nothing about the target, which is AC-4 and
   * AC-13 read forward: looking at something changes nothing about it. What it
   * does change is what closure will accept — the trigger requires a review
   * dated after the most recent owner edit.
   */
  async reReview(input: {
    caseId: string;
    note: string | null;
    reviewedBy: string;
  }): Promise<ModerationCaseRecord | null> {
    const known = await this.pool.query<{ id: string }>(
      `select id from moderation_case where id = $1`,
      [input.caseId]
    );
    if (!known.rows[0]) return null;
    await this.pool.query(
      `insert into correction_review (case_id, note, reviewed_by)
       values ($1,$2,$3)`,
      [input.caseId, input.note, input.reviewedBy]
    );
    return this.find(input.caseId);
  }

  async find(id: string): Promise<ModerationCaseRecord | null> {
    const result = await this.pool.query<CaseRow>(
      `${CASE_SELECT} where c.id = $1`,
      [id]
    );
    const row = result.rows[0];
    return row ? this.compose(row, await this.resolutions([id])) : null;
  }

  async list(
    status: "CLOSED" | "OPEN" | null
  ): Promise<ModerationCaseRecord[]> {
    const result = await this.pool.query<CaseRow>(
      status === null
        ? `${CASE_SELECT} order by c.opened_at desc, c.id`
        : `${CASE_SELECT} where c.status = $1::"ModerationCaseStatus"
           order by c.opened_at desc, c.id`,
      status === null ? [] : [status]
    );
    const resolutions = await this.resolutions(
      result.rows.map((row) => row.id)
    );
    return result.rows.map((row) => this.compose(row, resolutions));
  }

  /**
   * Records an applied action or a no-action decision.
   *
   * The Story's own actions are applied elsewhere — `US-BUS-F03-001` owns
   * Restrict and Restore, `US-BUS-F07-001` owns Request Correction — and this
   * records that they happened within a case. Keeping the two apart is AC-3
   * and AC-8 read forwards: the case knows an action was taken and never takes
   * one itself.
   */
  async resolve(input: {
    action: ModerationAction | null;
    caseId: string;
    noActionReason: string | null;
    recordedBy: string;
  }): Promise<ModerationCaseRecord | null> {
    const known = await this.pool.query<{ status: string }>(
      `select status::text as status from moderation_case where id = $1`,
      [input.caseId]
    );
    if (!known.rows[0]) return null;

    await this.pool.query(
      `insert into moderation_resolution
         (case_id, action, no_action_reason, recorded_by)
       values ($1,$2::"ModerationAction",$3,$4)`,
      [input.caseId, input.action, input.noActionReason, input.recordedBy]
    );
    return this.find(input.caseId);
  }

  /**
   * Closes a case explicitly (AC-7).
   *
   * The whole method writes two columns and a status, and reads nothing about
   * the target — AC-8 says closing creates no target-state result, and the way
   * to keep that true is to have no statement here that could.
   *
   * The resolution requirement is enforced by a trigger, so a closure that
   * fails leaves the case exactly Open (AC-11) rather than half-closed. The
   * check is translated back into a named error here.
   */
  async close(
    id: string,
    closedBy: string
  ): Promise<ModerationCaseRecord | null> {
    try {
      const updated = await this.pool.query<{ id: string }>(
        `update moderation_case
           set status = 'CLOSED', closed_at = now(), closed_by = $2
         where id = $1 and status = 'OPEN'
         returning id`,
        [id, closedBy]
      );
      if (!updated.rows[0]) return this.find(id);
      return this.find(id);
    } catch (error) {
      if (isCheckViolation(error, "CASE_NOT_RESOLVED"))
        throw new CaseNotResolvedError();
      if (isCheckViolation(error, "CASE_NOT_RE_REVIEWED"))
        throw new CaseNotReReviewedError();
      throw error;
    }
  }

  private async resolutions(ids: string[]): Promise<
    Map<
      string,
      {
        action: ModerationAction | null;
        noActionReason: string | null;
        recordedAt: string;
      }[]
    >
  > {
    const grouped = new Map<
      string,
      {
        action: ModerationAction | null;
        noActionReason: string | null;
        recordedAt: string;
      }[]
    >();
    if (ids.length === 0) return grouped;
    const result = await this.pool.query<{
      action: ModerationAction | null;
      caseId: string;
      noActionReason: string | null;
      recordedAt: Date;
    }>(
      `select case_id as "caseId", action::text as action,
         no_action_reason as "noActionReason", recorded_at as "recordedAt"
       from moderation_resolution
       where case_id = any($1::uuid[])
       order by recorded_at, id`,
      [ids]
    );
    for (const row of result.rows) {
      const list = grouped.get(row.caseId) ?? [];
      list.push({
        action: row.action,
        noActionReason: row.noActionReason,
        recordedAt: row.recordedAt.toISOString()
      });
      grouped.set(row.caseId, list);
    }
    return grouped;
  }

  private compose(
    row: CaseRow,
    resolutions: Map<
      string,
      {
        action: ModerationAction | null;
        noActionReason: string | null;
        recordedAt: string;
      }[]
    >
  ): ModerationCaseRecord {
    return {
      availableActions: availableModerationActions({
        caseOpen: row.status === "OPEN",
        ...(row.lifecycle === null ? {} : { lifecycle: row.lifecycle }),
        restricted: row.restricted ?? false,
        suspended: row.suspended ?? false,
        targetType: row.targetType
      }),
      businessId: row.businessId,
      closedAt: row.closedAt?.toISOString() ?? null,
      id: row.id,
      offeringId: row.offeringId,
      openedAt: row.openedAt.toISOString(),
      // AC-10. Outstanding exactly while the owner's most recent answer is
      // newer than the most recent look at it — an earlier review cannot
      // stand in for a later response.
      reReviewRequired:
        row.lastEditAt !== null &&
        (row.lastReviewAt === null || row.lastReviewAt < row.lastEditAt),
      resolutions: resolutions.get(row.id) ?? [],
      status: row.status,
      targetType: row.targetType,
      userId: row.userId
    };
  }
}
