import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool } from "pg";

import {
  boundedCorrectionAvailable,
  CORRECTION_MANAGEMENT_AREAS,
  type CorrectionTarget,
  type OfferingContentArea
} from "@commerce/business";
import type { OfferingLifecycle } from "@commerce/offering";

export interface CorrectionNoticeRecord {
  boundedEditAvailable: boolean;
  caseId: string;
  caseStatus: "OPEN" | "CLOSED";
  contentArea: OfferingContentArea | null;
  id: string;
  managementArea:
    | "AFFILIATE_DESTINATION"
    | "BUSINESS_INFORMATION"
    | "OFFERING_CONTENT"
    | null;
  note: string | null;
  offeringId: string | null;
  reReviewRequired: boolean;
  requestedAt: string;
  target: CorrectionTarget;
}

interface NoticeRow {
  caseId: string;
  caseStatus: "OPEN" | "CLOSED";
  contentArea: OfferingContentArea | null;
  edits: string;
  id: string;
  lifecycle: OfferingLifecycle | null;
  note: string | null;
  offeringId: string | null;
  requestedAt: Date;
  target: CorrectionTarget;
}

const NOTICE_SELECT = `select r.id, r.case_id as "caseId",
     c.status::text as "caseStatus",
     r.target::text as target,
     r.offering_id as "offeringId",
     r.content_area::text as "contentArea",
     r.note, r.requested_at as "requestedAt",
     o.status::text as lifecycle,
     (select count(*) from correction_edit e
      where e.correction_request_id = r.id) as edits
   from correction_request r
   join moderation_case c on c.id = r.case_id
   left join offering o on o.id = r.offering_id`;

/**
 * Request Correction and the owner's view of it (`US-BUS-F07-001`).
 *
 * The reads here are deliberately inert. AC-5 says the notice changes nothing
 * by existing, and the way to keep that true is for the notice path to contain
 * no write at all — not a "seen at" stamp, not a counter, not a status. A
 * caller cannot accidentally make a notice consequential, because there is
 * nothing here that could.
 */
@Injectable()
export class PgCorrectionRepository implements OnModuleDestroy {
  private readonly pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  /**
   * Records Request Correction against an existing or newly opened case.
   *
   * PRD-0006 owns the seven-action General Moderation set and case closure;
   * this is the one part Business needs in order to have anything to respond
   * to. The case is opened `Open` and nothing here can move it, so AC-12 and
   * AC-15 hold by omission rather than by rule.
   */
  async request(input: {
    businessId: string;
    contentArea: OfferingContentArea | null;
    note: string | null;
    offeringId: string | null;
    requestedBy: string;
    target: CorrectionTarget;
  }): Promise<CorrectionNoticeRecord | null> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");

      const business = await client.query<{ id: string }>(
        `select id from business where id = $1 for update`,
        [input.businessId]
      );
      if (!business.rows[0]) {
        await client.query("rollback");
        return null;
      }

      // One Open case per Business at a time: a second correction against the
      // same Business is another request on the same case, not a second case
      // for the owner to answer separately.
      const existing = await client.query<{ id: string }>(
        `select id from moderation_case
         where business_id = $1 and status = 'OPEN'
         order by opened_at limit 1`,
        [input.businessId]
      );
      const caseId =
        existing.rows[0]?.id ??
        (
          await client.query<{ id: string }>(
            // `US-PLT-F02-001` gave the case a target. A correction is always
            // about something the Business owns, so the case it opens is a
            // Business case — which is also why a User Account case can carry
            // no correction: the composite key has no Business to reach.
            `insert into moderation_case
               (target_type, business_id, opened_by)
             values ('BUSINESS', $1, $2) returning id`,
            [input.businessId, input.requestedBy]
          )
        ).rows[0]?.id;
      if (!caseId) throw new Error("CASE_NOT_OPENED");

      const created = await client.query<{ id: string }>(
        `insert into correction_request
           (case_id, business_id, target, offering_id, content_area, note,
            requested_by)
         values ($1,$2,$3::"CorrectionTarget",$4,$5::"OfferingContentArea",$6,$7)
         returning id`,
        [
          caseId,
          input.businessId,
          input.target,
          input.offeringId,
          input.contentArea,
          input.note,
          input.requestedBy
        ]
      );
      const id = created.rows[0]?.id;
      if (!id) throw new Error("CORRECTION_NOT_RECORDED");

      const notice = await client.query<NoticeRow>(
        `${NOTICE_SELECT} where r.id = $1`,
        [id]
      );
      await client.query("commit");
      const row = notice.rows[0];
      return row ? this.compose(row) : null;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  /// Every notice for one owned Business, newest first. Ownership is settled
  /// by the caller's access check; this knows only the Business.
  async listNotices(businessId: string): Promise<CorrectionNoticeRecord[]> {
    const result = await this.pool.query<NoticeRow>(
      `${NOTICE_SELECT} where r.business_id = $1 order by r.requested_at desc, r.id`,
      [businessId]
    );
    return result.rows.map((row) => this.compose(row));
  }

  async findNotice(
    businessId: string,
    id: string
  ): Promise<CorrectionNoticeRecord | null> {
    const result = await this.pool.query<NoticeRow>(
      `${NOTICE_SELECT} where r.id = $1 and r.business_id = $2`,
      [id, businessId]
    );
    const row = result.rows[0];
    return row ? this.compose(row) : null;
  }

  /**
   * The two derived facts, composed in one place.
   *
   * `boundedEditAvailable` is the conjunction PRD-0005 §8.3.1 states, asked of
   * the domain rather than restated in SQL. `reReviewRequired` is the existence
   * of a saved edit (AC-14): the requirement is the record of the response
   * itself, so there is no flag anybody has to remember to raise.
   */
  private compose(row: NoticeRow): CorrectionNoticeRecord {
    return {
      boundedEditAvailable:
        row.lifecycle !== null &&
        boundedCorrectionAvailable({
          caseOpen: row.caseStatus === "OPEN",
          lifecycle: row.lifecycle,
          target: row.target
        }),
      caseId: row.caseId,
      caseStatus: row.caseStatus,
      contentArea: row.contentArea,
      id: row.id,
      managementArea: CORRECTION_MANAGEMENT_AREAS[row.target],
      note: row.note,
      offeringId: row.offeringId,
      reReviewRequired: Number(row.edits) > 0,
      requestedAt: row.requestedAt.toISOString(),
      target: row.target
    };
  }
}
