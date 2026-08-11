-- Direct Contact (`US-DEC-F06-001`, PRD-0004).
--
-- The V1 channel set is exactly three, and PRD-0004 fixes it — so it is an
-- enum rather than a string. A fourth channel is not a value this column can
-- hold.
CREATE TYPE "DirectContactChannel" AS ENUM ('TELEPHONE', 'EMAIL', 'URL');

-- One successful reveal-and-availability result (AC-10), which
-- `US-DEC-F07-001` consumes as Direct Contact Completion.
--
-- What it records is that approved contact information was revealed to an
-- Enabled authenticated User and the external channel was made available. AC-12
-- forbids a message, an inbox, a conversation, a reply, a delivery, an answer,
-- a Business-response state and an external-success confirmation — and there is
-- no column here for any of them. The revealed value itself is deliberately
-- absent too: it is the Business's protected information, and a log of it would
-- be a second place it could leak from.
CREATE TABLE "direct_contact_reveal" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "decision_flow_id" UUID NOT NULL,
    "offering_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "channel" "DirectContactChannel" NOT NULL,
    "revealed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "direct_contact_reveal_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "direct_contact_reveal_offering_id_revealed_at_idx"
  ON "direct_contact_reveal" ("offering_id", "revealed_at");

CREATE INDEX "direct_contact_reveal_decision_flow_id_idx"
  ON "direct_contact_reveal" ("decision_flow_id");

-- Like an Affiliate Handoff initiation, this outlives the flow: the flow is
-- current-flow state and expires, and a Completion that vanished with it would
-- be a Completion nobody could count. The flow reference is therefore not a
-- foreign key.
ALTER TABLE "direct_contact_reveal"
  ADD CONSTRAINT "direct_contact_reveal_offering_id_fkey"
  FOREIGN KEY ("offering_id") REFERENCES "offering" ("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "direct_contact_reveal"
  ADD CONSTRAINT "direct_contact_reveal_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "user_account" ("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
