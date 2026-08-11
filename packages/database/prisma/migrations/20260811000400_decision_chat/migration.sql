-- Decision Chat (`US-DEC-F03-001`, PRD-0003).
--
-- Two tables and one deliberate absence. AC-9 forbids saved Chat history, a
-- personal Decision profile and cross-decision memory, but permits retaining
-- context "only for the current Decision flow" — so the turns hang off the
-- flow, are removed with it, and carry no person.

CREATE TABLE "decision_chat_turn" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "decision_flow_id" UUID NOT NULL,
    -- The order a person asked things in. A conversation read back out of
    -- order would be a different conversation.
    "position" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "reply" TEXT NOT NULL,
    "asked_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decision_chat_turn_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "decision_chat_turn_unique_position"
      UNIQUE ("decision_flow_id", "position")
);

-- Cascade rather than restrict: the flow expiring must take the conversation
-- with it. A transcript that outlived its flow would be exactly the saved
-- history AC-9 forbids.
ALTER TABLE "decision_chat_turn"
  ADD CONSTRAINT "decision_chat_turn_decision_flow_id_fkey"
  FOREIGN KEY ("decision_flow_id") REFERENCES "decision_flow" ("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Decision Chat Start (AC-3).
--
-- One per flow, like a Discovery Start is one per path: a person asking a
-- second question has not begun a second conversation. PRD-0006 Basic
-- Analytics consumes it.
--
-- It deliberately does *not* cascade with the flow. The flow is current-flow
-- state and disappears; that assistive Chat began is a fact about the past.
CREATE TABLE "decision_chat_start" (
    "decision_flow_id" UUID NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decision_chat_start_pkey" PRIMARY KEY ("decision_flow_id")
);

CREATE INDEX "decision_chat_start_started_at_idx"
  ON "decision_chat_start" ("started_at");
