import { createHash, randomBytes } from "node:crypto";

import { Pool } from "pg";

import {
  REGISTRATION_REQUESTED,
  type EmailDispatcher
} from "@commerce/notification";

/** Matches the API's digesting so a delivered token resolves on confirmation. */
function digest(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export interface OutboxProcessorOptions {
  dispatcher: EmailDispatcher;
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
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  /** Returns how many events were handled, so a caller can drain deliberately. */
  async processBatch(limit = 20): Promise<number> {
    const claimed = await this.claim(limit);
    let handled = 0;

    for (const event of claimed) {
      try {
        if (event.eventType === REGISTRATION_REQUESTED) {
          await this.deliverRegistration(event.aggregateId);
        }
        await this.markProcessed(event.id);
        handled += 1;
      } catch {
        // Leave the event unprocessed and let its attempt count grow; a later
        // pass retries it rather than losing the message.
        await this.recordFailure(event.id);
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
      eventType: string;
      id: string;
    }>(
      `update outbox_event
         set available_at = now() + interval '1 minute'
       where id in (
         select id from outbox_event
         where processed_at is null and available_at <= now()
         order by occurred_at
         limit $1
         for update skip locked
       )
       returning id, aggregate_id as "aggregateId", event_type as "eventType"`,
      [limit]
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

  private async markProcessed(id: string): Promise<void> {
    await this.pool.query(
      `update outbox_event set processed_at = now() where id = $1`,
      [id]
    );
  }

  private async recordFailure(id: string): Promise<void> {
    await this.pool.query(
      `update outbox_event
         set attempts = attempts + 1,
             available_at = now() + (least(attempts + 1, 6) * interval '30 seconds')
       where id = $1`,
      [id]
    );
  }
}
