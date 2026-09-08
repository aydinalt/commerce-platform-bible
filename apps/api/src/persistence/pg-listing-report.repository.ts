import { Injectable } from "@nestjs/common";
import { Pool } from "pg";

import type { ListingReportResponse } from "@commerce/contracts";

/**
 * "Hata Bildir" — what a reader says is wrong with a listing (I69).
 *
 * **The platform had one way to say something is wrong and it belonged to
 * Admins.** A Moderation Case is opened under `US-PLT-F06-001` by a person with
 * authority, and that is the wrong shape for what the Owner asked for: the
 * reader who notices a stale price is the only person who *can* notice it, and
 * the platform was throwing that away.
 *
 * A report is deliberately not a case. It is an unverified claim by anybody
 * about one listing, and everything about this table says so — no target union,
 * no lifecycle beyond "looked at", and no power to change an Offering. What an
 * accepted report produces is an Admin's decision to act through the machinery
 * that already governs acting.
 */
@Injectable()
export class PgListingReportRepository {
  constructor(private readonly pool: Pool) {}

  /**
   * The Offering behind a public address, and only while it is publicly
   * eligible.
   *
   * Read from the projection for the reason every public path does: the row is
   * there because publication evaluated the Offering as Eligible, so a listing
   * that has been retired cannot be reported. That is not pedantry — a report
   * about something nobody can see is a report an Admin cannot check.
   */
  async reportable(slug: string): Promise<string | null> {
    const found = await this.pool.query<{ offeringId: string }>(
      `select p.offering_id as "offeringId"
       from offering_search_projection p
       join offering o on o.id = p.offering_id
       where o.slug = $1`,
      [slug]
    );
    return found.rows[0]?.offeringId ?? null;
  }

  /**
   * Recording one report.
   *
   * No de-duplication, and that is the decision. Two people reporting the same
   * wrong price are two pieces of evidence, not one duplicated; the count is
   * the signal an Admin acts on. A person repeating themselves inflates it,
   * which is what the submission throttle in front of this exists to bound.
   */
  async submit(input: {
    note: string | null;
    offeringId: string;
    reason: string;
    reporterUserId: string | null;
  }): Promise<void> {
    await this.pool.query(
      `insert into listing_report
         (offering_id, reason, note, reporter_user_id)
       values ($1, $2::"ListingReportReason", $3, $4)`,
      [input.offeringId, input.reason, input.note, input.reporterUserId]
    );
  }

  /**
   * The queue, oldest first.
   *
   * Oldest rather than newest, unlike every other list on the platform: this is
   * work rather than news, and a queue that showed the newest first would let
   * the oldest report sit unread forever behind a page of arrivals.
   *
   * `reportsForListing` counts the *open* reports about the same listing, which
   * is the fact an Admin acts on. One person saying a price is wrong is a
   * claim; six people saying it is a listing to look at today.
   */
  async list(
    status: "ACCEPTED" | "DISMISSED" | "OPEN",
    limit: number
  ): Promise<{ reports: ListingReportResponse[]; total: number }> {
    const found = await this.pool.query<
      ListingReportResponse & { total: number }
    >(
      `select r.id as "reportId", r.reason::text as reason,
         r.note, r.status::text as status,
         r.submitted_at as "submittedAt",
         o.id as "offeringId",
         o.slug as "offeringSlug", o.title as "offeringTitle",
         o.listing_number::text as "listingNumber",
         (
           select count(*)::int from listing_report peer
           where peer.offering_id = r.offering_id and peer.status = 'OPEN'
         ) as "reportsForListing",
         count(*) over ()::int as total
       from listing_report r
       join offering o on o.id = r.offering_id
       where r.status = $1::"ListingReportStatus"
       order by r.submitted_at, r.id
       limit $2`,
      [status, limit]
    );

    return {
      reports: found.rows.map(({ total: _total, ...report }) => ({
        ...report,
        submittedAt: new Date(report.submittedAt).toISOString(),
        /*
         * A closed report is not part of its listing's open count, so the
         * subquery can answer zero for it. The contract's floor is one because
         * a report is always at least itself, and the honest reading of the
         * count on a closed row is "this one".
         */
        reportsForListing: Math.max(report.reportsForListing, 1)
      })),
      total: found.rows[0]?.total ?? 0
    };
  }

  /**
   * Closing a report, once.
   *
   * `where status = 'OPEN'` rather than a read-then-write: two Admins reaching
   * the same report is the ordinary race on a shared queue, and the second one
   * must not overwrite the first one's decision or its timestamp. `false` says
   * somebody got there first, which is a thing to be told rather than an error.
   */
  async review(input: {
    outcome: "ACCEPTED" | "DISMISSED";
    reportId: string;
    reviewerId: string;
  }): Promise<boolean> {
    const done = await this.pool.query(
      `update listing_report
       set status = $2::"ListingReportStatus",
           reviewed_by = $3,
           reviewed_at = now()
       where id = $1 and status = 'OPEN'`,
      [input.reportId, input.outcome, input.reviewerId]
    );
    return done.rowCount === 1;
  }

  /**
   * How many reports one caller may send in a window (I69).
   *
   * **A public write with no account behind it needs a bound, or it is a way to
   * fill a table.** The bound is generous — a person who spots three wrong
   * prices in an evening is doing the platform a favour, not attacking it — and
   * it is per caller rather than per listing, because the abuse to stop is one
   * source producing volume rather than several people agreeing.
   *
   * The table is `auth_throttle`, shared with the sign-in limiter and separated
   * from it by `scope`. Shared deliberately: it already expires its own windows
   * and is already the thing operators watch, and a second table with the same
   * columns would be a second thing to remember to clear.
   */
  async throttled(input: {
    limit: number;
    subjectHash: string;
    windowMs: number;
  }): Promise<boolean> {
    const result = await this.pool.query<{ blocked: boolean }>(
      `insert into auth_throttle (scope, subject_hash, attempts, first_seen_at)
       values ('listing_report', $1, 1, now())
       on conflict (scope, subject_hash) do update
         set attempts = case
               when auth_throttle.first_seen_at < now() - ($2::int * interval '1 millisecond')
                 then 1
               else auth_throttle.attempts + 1
             end,
             first_seen_at = case
               when auth_throttle.first_seen_at < now() - ($2::int * interval '1 millisecond')
                 then now()
               else auth_throttle.first_seen_at
             end
       returning (attempts > $3) as blocked`,
      [input.subjectHash, input.windowMs, input.limit]
    );
    return result.rows[0]?.blocked ?? false;
  }
}
