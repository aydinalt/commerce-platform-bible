import type { Pool } from "pg";

import {
  EXPIRED_COMPARISON_SETS_SQL,
  EXPIRED_DECISION_FLOWS_SQL,
  IDENTITY_GRACE_MS,
  OUTBOX_RETENTION_MS,
  THROTTLE_RETENTION_MS
} from "@commerce/database";

/**
 * Deleting what the platform has finished with.
 *
 * ADR-0012 §3 names "cookie security, CSRF defense, rotation, expiry and
 * session cleanup" as mandatory controls. The first four exist. **Session
 * cleanup did not** — an expired or revoked `user_session` was filtered out on
 * every read and never removed, and the same was true of every other table
 * carrying an `expires_at`. Each one has an index on that column and nothing
 * that ever used it to delete a row.
 *
 * That is two problems wearing one coat. Unbounded growth is the visible one.
 * The one that matters more is that an abandoned `pending_registration` holds
 * an email address and a password hash **forever**, for somebody who never
 * became a User — and `US-IDN-F02-001` AC-7 was explicit that a pending
 * registration is not an account state. Keeping it indefinitely makes it one in
 * practice.
 *
 * No Frozen document states a retention policy, so the windows are an Owner
 * decision taken on 2026-08-18 and recorded in
 * `docs/implementation/I17_RETENTION_SWEEP.md`. They live in
 * `@commerce/database` beside the statements they bound, because I20 needed to
 * publish how many rows are *waiting* to be deleted and a second copy of a
 * window is a second thing to get wrong.
 */

export interface SweepCounts {
  authThrottles: number;
  comparisonSets: number;
  decisionFlows: number;
  outboxEvents: number;
  passwordResets: number;
  pendingRegistrations: number;
  sessions: number;
}

export class RetentionSweeper {
  constructor(private readonly pool: Pool) {}

  /**
   * One pass. Returns what it removed, so a caller can log a sweep that did
   * something differently from one that found nothing — a sweep quietly
   * deleting thousands of rows every cycle is a symptom, not a success.
   *
   * The statements are independent and are deliberately not one transaction.
   * They share no invariant; wrapping them together would only widen the window
   * in which every one of these tables is locked, to buy an atomicity nothing
   * reads.
   */
  async sweep(): Promise<SweepCounts> {
    // Written as statements rather than as an object literal whose properties
    // happen to be awaited in order. Two of these must run in sequence, and an
    // ordering that depends on where a key sorts is an ordering a formatter can
    // silently change.

    // Expired or revoked. The resolver refuses both already, so this changes
    // nothing a request can observe — it removes a token digest that is worth
    // nothing and a row that would otherwise be kept for ever.
    const sessions = await this.run(
      `delete from user_session
       where expires_at <= now() - ($1::double precision * interval '1 millisecond')
          or revoked_at <= now() - ($1::double precision * interval '1 millisecond')`,
      [IDENTITY_GRACE_MS]
    );

    // Never touches a registration that is still usable, and so never one whose
    // message has not been sent: an undispatched row inside its window is work
    // the outbox still owes somebody.
    const pendingRegistrations = await this.run(
      `delete from pending_registration
       where expires_at <= now() - ($1::double precision * interval '1 millisecond')`,
      [IDENTITY_GRACE_MS]
    );

    const passwordResets = await this.run(
      `delete from password_reset
       where expires_at <= now() - ($1::double precision * interval '1 millisecond')`,
      [IDENTITY_GRACE_MS]
    );

    const authThrottles = await this.run(
      `delete from auth_throttle
       where first_seen_at < now() - ($1::double precision * interval '1 millisecond')`,
      [THROTTLE_RETENTION_MS]
    );

    /*
     * Processed events only — which preserves every dead letter without naming
     * one.
     *
     * A dead letter is a row that is unprocessed and has stopped being claimed
     * (`OutboxProcessor`: `attempts` at the ceiling, `processed_at` still
     * null). `processed_at is not null` therefore excludes it by construction,
     * along with every event still waiting and every one still retrying. One
     * condition, and no second rule to keep in step with the first.
     */
    const outboxEvents = await this.run(
      `delete from outbox_event
       where processed_at is not null
         and processed_at <= now() - ($1::double precision * interval '1 millisecond')`,
      [OUTBOX_RETENTION_MS]
    );

    /*
     * Decision state is already swept, but only by a request that uses
     * Decision. A platform nobody compares on for a week keeps a week of
     * expired flows and the chat turns that cascade from them — and
     * `US-DEC-F03-001` AC-9 holds the conversation for the current flow only.
     * Sweeping here makes that true of a quiet platform too.
     *
     * Flows first, then sets, which is the order the request path already uses:
     * a set cascades to the flows built on it, so removing the dead flows
     * first keeps the cascade from being what deletes them.
     */
    const decisionFlows = await this.run(EXPIRED_DECISION_FLOWS_SQL, []);
    const comparisonSets = await this.run(EXPIRED_COMPARISON_SETS_SQL, []);

    return {
      authThrottles,
      comparisonSets,
      decisionFlows,
      outboxEvents,
      passwordResets,
      pendingRegistrations,
      sessions
    };
  }

  private async run(sql: string, values: unknown[]): Promise<number> {
    const result = await this.pool.query(sql, values);
    return result.rowCount ?? 0;
  }
}
