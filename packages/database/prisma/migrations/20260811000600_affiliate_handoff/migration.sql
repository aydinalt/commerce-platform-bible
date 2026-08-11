-- Affiliate Handoff initiation (`US-DEC-F05-001` AC-8, PRD-0003).
--
-- One row per successful initiation. `US-DEC-F07-001` consumes it as Affiliate
-- Handoff Completion, and PRD-0006 Basic Analytics counts it — so it records
-- that the platform made an external destination active, and nothing about
-- what happened there. AC-10 forbids an external-success claim, and this table
-- has no column that could express one.
--
-- Unlike a Discovery Start it is not once per flow: a person who hands off,
-- comes back and hands off again has done it twice.

CREATE TABLE "affiliate_handoff" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "decision_flow_id" UUID NOT NULL,
    "offering_id" UUID NOT NULL,
    -- The exact address that was made active, as it stood at that moment. The
    -- destination may be re-authored afterwards; what a person was sent to is
    -- a fact about the past.
    "destination" VARCHAR(2048) NOT NULL,
    "initiated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_handoff_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "affiliate_handoff_offering_id_initiated_at_idx"
  ON "affiliate_handoff" ("offering_id", "initiated_at");

CREATE INDEX "affiliate_handoff_decision_flow_id_idx"
  ON "affiliate_handoff" ("decision_flow_id");

-- The flow is current-flow state and expires; the initiation outlives it, for
-- the same reason `decision_chat_start` does. So the reference is deliberately
-- not a foreign key: a Completion that vanished when its flow lapsed would be
-- a Completion nobody could count.
ALTER TABLE "affiliate_handoff"
  ADD CONSTRAINT "affiliate_handoff_offering_id_fkey"
  FOREIGN KEY ("offering_id") REFERENCES "offering" ("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
