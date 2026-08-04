-- Registration delivery through the transactional outbox.
--
-- The proof token is no longer minted when registration begins. It is minted at
-- delivery, so it exists only in memory and in the message itself. Putting it in
-- an outbox payload would have placed a replayable secret in the database and
-- undone the property that only digests are stored.
--
-- A pending registration therefore starts without a token digest and gains one
-- when its message is dispatched.

-- AlterTable
ALTER TABLE "pending_registration"
  ALTER COLUMN "token_hash" DROP NOT NULL;

-- Delivery attempts are recorded so a message cannot be silently lost.
ALTER TABLE "pending_registration"
  ADD COLUMN "dispatched_at" TIMESTAMPTZ(6);

-- The worker claims events in order; this index keeps that claim cheap as the
-- processed backlog grows.
CREATE INDEX "outbox_event_pending_idx"
  ON "outbox_event" ("available_at")
  WHERE "processed_at" IS NULL;
