/**
 * Draining the outbox, bounded by a deadline (I38).
 *
 * The worker was a `while (running)` loop with a two-second sleep. Vercel runs
 * functions, so there is nowhere to loop — and **until this existed no email
 * was ever sent on the Owner's chosen platform**, which meant registration
 * confirmations sat unread in the outbox and nobody could complete a sign-up. A
 * deployment would have looked healthy and been unusable.
 *
 * This is the draining, separated from what drives it. `main.ts` still calls it
 * in a loop; the cron handler calls it once. **One draining path, two shapes** —
 * the same arrangement I37 made for the API, for the same reason: a staged
 * hosting decision is only reversible while both exist.
 *
 * ## Why a deadline rather than "until empty"
 *
 * A function is killed when it exceeds its duration, mid-statement and without
 * warning. `processBatch` marks what it delivered before returning, so a kill
 * between batches loses nothing — but a kill *inside* a batch is a delivery
 * whose outcome nobody recorded, and the outbox's retry then sends it again.
 *
 * So this stops when the next batch could not finish in the time left, rather
 * than when the time is gone. What it cannot deliver stays queued for the next
 * invocation, which is exactly what an outbox is for.
 */

/** What this needs from an `OutboxProcessor`, and nothing more. */
export interface BatchProcessor {
  processBatch: (limit?: number) => Promise<number>;
}

export interface DrainResult {
  /** How many batches were run. */
  batches: number;
  /** How many messages were handled across them. */
  delivered: number;
  /**
   * Whether the outbox was empty when this stopped.
   *
   * `false` means the deadline arrived first and work remains — which is not a
   * failure, but is the thing an operator needs to see: an outbox that never
   * reports `true` is one the schedule cannot keep up with.
   */
  drained: boolean;
}

export interface DrainOptions {
  /** Wall-clock milliseconds this may spend, including the batch in flight. */
  budgetMs: number;
  processor: BatchProcessor;
  /** Injected so a test can drive the clock rather than wait on it. */
  now?: () => number;
  /**
   * What one batch is assumed to cost, subtracted from the remaining budget
   * before starting another.
   *
   * A guess, and deliberately a generous one: **being wrong in the other
   * direction is a batch killed halfway.** Twenty messages against a vendor
   * with a ten-second timeout each is the worst case, and no real batch comes
   * near it — but the cost of over-reserving is one fewer batch this minute,
   * and the cost of under-reserving is a duplicate delivery.
   */
  reserveMs?: number;
}

export const DEFAULT_RESERVE_MS = 12_000;

export async function drainOutbox({
  budgetMs,
  now = Date.now,
  processor,
  reserveMs = DEFAULT_RESERVE_MS
}: DrainOptions): Promise<DrainResult> {
  const started = now();
  let batches = 0;
  let delivered = 0;

  for (;;) {
    // Checked before the first batch too: a budget smaller than one batch
    // should do nothing rather than start work it cannot finish.
    if (now() - started + reserveMs > budgetMs)
      return { batches, delivered, drained: false };

    const handled = await processor.processBatch();
    batches += 1;
    delivered += handled;

    // Nothing left. This is the answer the schedule is supposed to produce,
    // and the only one that says the cadence is keeping up.
    if (handled === 0) return { batches, delivered, drained: true };
  }
}
