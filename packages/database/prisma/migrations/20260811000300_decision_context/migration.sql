-- Decision Context (`US-DEC-F02-001`, PRD-0003).
--
-- Exactly one eligible Offering *or* one valid Comparison Set, never both and
-- never neither. AC-1 is the whole shape of this table, so it is a CHECK
-- rather than a rule the writer has to remember: a context holding two things
-- would let Decision Chat speak about something the person never chose.
--
-- Like a Comparison Set, this is current-flow state that expires. AC-6 forbids
-- persistent personal Decision history, cross-decision memory and a personal
-- Decision profile — so the row carries no person, and stops existing on its
-- own.

CREATE TABLE "decision_flow" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    -- One or the other. Both null or both set is not a Decision Context that
    -- happens to be wrong; it is not a Decision Context at all.
    "offering_id" UUID,
    "comparison_set_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "decision_flow_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "decision_flow_exactly_one_context" CHECK (
      ("offering_id" IS NULL) <> ("comparison_set_id" IS NULL)
    )
);

CREATE INDEX "decision_flow_expires_at_idx" ON "decision_flow" ("expires_at");

ALTER TABLE "decision_flow"
  ADD CONSTRAINT "decision_flow_offering_id_fkey"
  FOREIGN KEY ("offering_id") REFERENCES "offering" ("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- A Comparison Set that expires takes the flow built on it with it. AC-4
-- confines the context to the current flow, and a flow pointing at a set that
-- no longer exists would outlive the thing it was about.
ALTER TABLE "decision_flow"
  ADD CONSTRAINT "decision_flow_comparison_set_id_fkey"
  FOREIGN KEY ("comparison_set_id") REFERENCES "comparison_set" ("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
