import { createHash, randomBytes } from "node:crypto";

import type { Logger } from "pino";
import type { Pool } from "pg";

import {
  PASSWORD_RESET_REQUESTED,
  REGISTRATION_REQUESTED,
  isPermanentRefusal,
  type EmailDispatcher
} from "@commerce/notification";

/**
 * How many times a message may be attempted before the outbox stops.
 *
 * A dead letter here is a row that is unprocessed and has stopped being
 * claimed, which is a state the table can already express: `attempts` counts,
 * and the claim excludes rows that have reached the ceiling. No new column and
 * no new lifecycle — the evidence is the row that stayed.
 *
 * Eight attempts spans roughly fifteen minutes under the backoff below, which
 * outlasts an ordinary provider incident without turning a permanent problem
 * into a permanent load.
 */
export const MAX_DELIVERY_ATTEMPTS = 8;

/** Matches the API's digesting so a delivered token resolves on confirmation. */
function digest(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export interface OutboxProcessorOptions {
  dispatcher: EmailDispatcher;
  /**
   * Where a delivery is reported, carrying the correlation identifier of the
   * request that queued it (§12.3).
   *
   * The processor logged nothing before this, which meant a message that never
   * arrived left no trace outside its own row — and the row could not be tied
   * to the request either. Both halves are the same gap.
   */
  logger: Logger;
  /**
   * The process's pool, handed in rather than built here.
   *
   * The worker holds two components that talk to PostgreSQL and used to open a
   * pool each, which is the same mistake the API made fifteen times over.
   */
  pool: Pool;
  /** Base address the registration link points at. */
  publicWebUrl: string;
}

/**
 * The transactional outbox's first real consumer.
 *
 * The registration token is minted **here**, at delivery, and only its digest is
 * written back. The token therefore exists in memory and in the message, never
 * at rest — which is also why a retry is safe: each attempt mints a fresh token
 * and invalidates the previous one.
 */
export class OutboxProcessor {
  private readonly pool: Pool;

  constructor(private readonly options: OutboxProcessorOptions) {
    this.pool = options.pool;
  }

  /** Returns how many events were handled, so a caller can drain deliberately. */
  async processBatch(limit = 20): Promise<number> {
    const claimed = await this.claim(limit);
    let handled = 0;

    for (const event of claimed) {
      // Carried on every line this event produces, so a person quoting the
      // correlation identifier from their error message finds the delivery
      // attempts too — not only the request that asked for them.
      const trace = {
        correlationId: event.correlationId,
        eventType: event.eventType
      };
      try {
        if (event.eventType === REGISTRATION_REQUESTED) {
          await this.deliverRegistration(event.aggregateId);
        } else if (event.eventType === PASSWORD_RESET_REQUESTED) {
          await this.deliverPasswordReset(event.aggregateId);
        }
        await this.markProcessed(event.id);
        this.options.logger.info(trace, "outbox_delivered");
        handled += 1;
      } catch (error) {
        /*
         * A refusal is not a failure to retry.
         *
         * An address the provider will never accept, a sender it does not
         * recognise, a credential it rejects: each comes back identically on
         * every attempt. Retrying one is the platform sending itself the same
         * message every few minutes for as long as the deployment runs, and
         * the person waiting for the email is no closer either way.
         *
         * Attempts are still counted so the row says how hard it was tried,
         * and it is left unprocessed so it is still there to be found.
         */
        const permanent = isPermanentRefusal(error);
        // `warn` for something that will be tried again, `error` for one that
        // will not: a dead letter is a person who never got their email, and it
        // should not read like a transient blip.
        this.options.logger[permanent ? "error" : "warn"](
          { ...trace, err: error, permanent },
          "outbox_delivery_failed"
        );
        await this.recordFailure(event.id, permanent);
      }
    }

    return handled;
  }

  /**
   * Claims work atomically. The `for update skip locked` sits inside the same
   * statement as the update, so the row locks are held for its duration and two
   * workers cannot claim the same event; a bare select would release them
   * immediately and deliver some messages twice.
   *
   * Pushing `available_at` forward acts as a visibility timeout: a claim that is
   * never completed becomes eligible again instead of being lost.
   */
  private async claim(limit: number) {
    const result = await this.pool.query<{
      aggregateId: string;
      correlationId: string | null;
      eventType: string;
      id: string;
    }>(
      `update outbox_event
         set available_at = now() + interval '1 minute'
       where id in (
         select id from outbox_event
         where processed_at is null
           and available_at <= now()
           and attempts < $2
         order by occurred_at
         limit $1
         for update skip locked
       )
       returning id, aggregate_id as "aggregateId", event_type as "eventType",
                 correlation_id as "correlationId"`,
      [limit, MAX_DELIVERY_ATTEMPTS]
    );
    return result.rows;
  }

  private async deliverRegistration(pendingId: string): Promise<void> {
    const token = randomBytes(32).toString("base64url");
    const claimed = await this.pool.query<{ email: string }>(
      `update pending_registration
         set token_hash = $1, dispatched_at = now()
       where id = $2 and expires_at > now()
       returning email`,
      [digest(token), pendingId]
    );

    const email = claimed.rows[0]?.email;
    // An expired or superseded registration has nothing to deliver, and that is
    // not a failure worth retrying.
    if (email === undefined) return;

    const link = `${this.options.publicWebUrl}/register/confirm?token=${token}`;
    await this.options.dispatcher.deliver({
      body: `Confirm your email address to finish creating your account:\n\n${link}\n\nThe link expires shortly. If you did not request it, ignore this message.`,
      recipient: email,
      subject: "Confirm your email address"
    });
  }

  private async deliverPasswordReset(resetId: string): Promise<void> {
    const token = randomBytes(32).toString("base64url");
    const claimed = await this.pool.query<{ email: string }>(
      `update password_reset r
         set token_hash = $1, dispatched_at = now()
       from user_account u
       where r.user_id = u.id and r.id = $2 and r.expires_at > now()
       returning u.email`,
      [digest(token), resetId]
    );

    const email = claimed.rows[0]?.email;
    if (email === undefined) return;

    const link = `${this.options.publicWebUrl}/recover/reset?token=${token}`;
    await this.options.dispatcher.deliver({
      body: `Set a new password for your account:\n\n${link}\n\nThe link expires shortly. If you did not request it, ignore this message and your password stays unchanged.`,
      recipient: email,
      subject: "Reset your password"
    });
  }

  private async markProcessed(id: string): Promise<void> {
    await this.pool.query(
      `update outbox_event set processed_at = now() where id = $1`,
      [id]
    );
  }

  /**
   * Counts the attempt, and decides whether there will be another.
   *
   * A permanent refusal jumps `attempts` straight to the ceiling rather than
   * setting a separate flag. The claim already refuses to take rows at the
   * ceiling, so one rule stops both kinds of dead letter and there is only one
   * place that can be got wrong.
   */
  private async recordFailure(id: string, permanent: boolean): Promise<void> {
    await this.pool.query(
      `update outbox_event
         set attempts = case when $2 then $3 else attempts + 1 end,
             available_at = now() + (least(attempts + 1, 6) * interval '30 seconds')
       where id = $1`,
      [id, permanent, MAX_DELIVERY_ATTEMPTS]
    );
  }
}
