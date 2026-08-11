-- Offering Presentation Open (`US-OFR-F05-001` AC-8, PRD-0001 §8.2.1).
--
-- A bounded occurrence, like Discovery Start: it records that complete public
-- Presentation successfully began for one eligible Offering. PRD-0006 Basic
-- Analytics is its only consumer and does not exist yet, but the occurrence
-- cannot be reconstructed afterwards — nothing else the system stores says
-- that a stranger looked at an Offering.
--
-- PRD-0001 §8.2.1 excludes an owner or Admin management view, so this table is
-- written only by the public Presentation path.

CREATE TABLE "offering_presentation_open" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "offering_id" UUID NOT NULL,
    -- Carried for the domain grouping PRD-0006 §11 asks Basic Analytics to
    -- support. Denormalised on purpose: an Offering may be recategorised
    -- later, and this occurrence belongs to the Domain it happened in.
    "domain_id" UUID NOT NULL,
    "opened_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offering_presentation_open_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "offering_presentation_open_offering_id_opened_at_idx"
  ON "offering_presentation_open" ("offering_id", "opened_at");

CREATE INDEX "offering_presentation_open_domain_id_opened_at_idx"
  ON "offering_presentation_open" ("domain_id", "opened_at");

-- The occurrence outlives the Offering's eligibility but not the Offering
-- itself: an Offering is Archived rather than deleted, so `restrict` states
-- that a deletion which would orphan history is a mistake.
ALTER TABLE "offering_presentation_open"
  ADD CONSTRAINT "offering_presentation_open_offering_id_fkey"
  FOREIGN KEY ("offering_id") REFERENCES "offering" ("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "offering_presentation_open"
  ADD CONSTRAINT "offering_presentation_open_domain_id_fkey"
  FOREIGN KEY ("domain_id") REFERENCES "domain" ("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
