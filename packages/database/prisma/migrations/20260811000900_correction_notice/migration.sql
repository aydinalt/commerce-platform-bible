-- Correction Notice and Owner Response (`US-BUS-F07-001`).
--
-- Three things have to be true here that code could not be trusted to keep
-- true, because each of them is the kind of rule a later feature forgets.
--
-- First, the target set is exact. PRD-0005 §12.1 names four Business-owned
-- targets and puts User Account outside V1 (AC-1, AC-2). That is an enum, so a
-- correction against a User Account is not refused — it cannot be written.
--
-- Second, an Offering-content correction and its Offering are inseparable. A
-- notice that says "correct the title" without saying which Offering, or one
-- that names an Offering belonging to another Business, would let the bounded
-- path of §8.3.1 aim at something it was never approved for. A CHECK ties the
-- two nullable columns to the target, and a composite foreign key makes the
-- named Offering necessarily the case's own.
--
-- Third, a correction edit needs an Open case (AC-8). The trigger below refuses
-- one against a Closed case, so the gate holds for any path that ever exists —
-- including one written after everybody has forgotten this file.
--
-- What this migration deliberately does not do is close a case or record a
-- re-review. AC-15 leaves approved action, no-action decision and closure with
-- PRD-0006, so the columns that would hold them are here and nothing in this
-- Increment writes them.

CREATE TYPE "ModerationCaseStatus" AS ENUM ('OPEN', 'CLOSED');

-- AC-1 and AC-2. Four values, and `USER_ACCOUNT` is not one of them.
CREATE TYPE "CorrectionTarget" AS ENUM (
  'BUSINESS_INFORMATION',
  'OFFERING_CONTENT',
  'AFFILIATE_DESTINATION_CONFIGURATION',
  'DIRECT_CONTACT_INFORMATION'
);

-- The parts of Offering content a correction may aim at. Category is absent on
-- purpose: a correction is for fixing what an Offering says, not for moving it
-- to a different part of the catalogue while its Business is Restricted.
CREATE TYPE "OfferingContentArea" AS ENUM ('TITLE', 'SUMMARY', 'ATTRIBUTES');

CREATE TABLE "moderation_case" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "business_id" UUID NOT NULL,
  "status" "ModerationCaseStatus" NOT NULL DEFAULT 'OPEN',
  "opened_by" UUID NOT NULL,
  "opened_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "closed_by" UUID,
  "closed_at" TIMESTAMPTZ(6),
  -- A Closed case without a record of who closed it and when is a case nobody
  -- can answer for. PRD-0006 will write all three together or none of them.
  CONSTRAINT "moderation_case_closure_evidence" CHECK (
    ("status" = 'CLOSED')
    = ("closed_by" IS NOT NULL AND "closed_at" IS NOT NULL)
  )
);

CREATE INDEX "moderation_case_business_id_status_idx"
  ON "moderation_case" ("business_id", "status");

-- Lets the composite foreign key below reach a case and its Business at once.
CREATE UNIQUE INDEX "moderation_case_id_business_id_key"
  ON "moderation_case" ("id", "business_id");

-- The same, for an Offering. `offering` already has a unique `(business_id,
-- slug)`; this one is about identity rather than naming.
CREATE UNIQUE INDEX "offering_id_business_id_key"
  ON "offering" ("id", "business_id");

CREATE TABLE "correction_request" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "case_id" UUID NOT NULL,
  "business_id" UUID NOT NULL,
  "target" "CorrectionTarget" NOT NULL,
  "offering_id" UUID,
  "content_area" "OfferingContentArea",
  "note" VARCHAR(1000),
  "requested_by" UUID NOT NULL,
  "requested_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  -- The case and the Business are read together, so a request cannot drift onto
  -- a case belonging to somebody else.
  -- AC-3 and AC-9. An Offering-content correction identifies exactly one
  -- Offering and exactly one content area; every other target identifies
  -- neither. Both directions, so neither half can be supplied alone.
  CONSTRAINT "correction_request_offering_target" CHECK (
    ("target" = 'OFFERING_CONTENT')
    = ("offering_id" IS NOT NULL AND "content_area" IS NOT NULL)
  )
);

CREATE INDEX "correction_request_business_id_requested_at_idx"
  ON "correction_request" ("business_id", "requested_at");

CREATE INDEX "correction_request_case_id_idx"
  ON "correction_request" ("case_id");

-- One row per saved owner response. Its existence is what makes re-review
-- outstanding (AC-14): rather than a boolean somebody has to remember to set,
-- the requirement is the record of the edit itself, which cannot be forgotten
-- because writing it is the same act as making the change.
CREATE TABLE "correction_edit" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "correction_request_id" UUID NOT NULL,
  "offering_id" UUID NOT NULL,
  "content_area" "OfferingContentArea" NOT NULL,
  "edited_by" UUID NOT NULL,
  "edited_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now()
);

CREATE INDEX "correction_edit_correction_request_id_idx"
  ON "correction_edit" ("correction_request_id");

-- Foreign keys, written out rather than inlined. Every one carries
-- `ON UPDATE CASCADE`, which is the referential action Prisma's datamodel
-- means when a relation does not say otherwise. Inlining them leaves the
-- update action at PostgreSQL's `NO ACTION` default, and the migrated database
-- then differs from the datamodel in a way only the drift gate can see.
--
-- The two composite keys are the point of the whole arrangement: they make "the
-- corrected Offering belongs to the case's Business" a fact the database holds
-- rather than a condition somebody has to check.

ALTER TABLE "moderation_case" ADD CONSTRAINT "moderation_case_business_id_fkey"
  FOREIGN KEY ("business_id") REFERENCES "business"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "moderation_case" ADD CONSTRAINT "moderation_case_opened_by_fkey"
  FOREIGN KEY ("opened_by") REFERENCES "user_account"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "moderation_case" ADD CONSTRAINT "moderation_case_closed_by_fkey"
  FOREIGN KEY ("closed_by") REFERENCES "user_account"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "correction_request" ADD CONSTRAINT "correction_request_case_fkey"
  FOREIGN KEY ("case_id", "business_id")
  REFERENCES "moderation_case"("id", "business_id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "correction_request" ADD CONSTRAINT "correction_request_offering_fkey"
  FOREIGN KEY ("offering_id", "business_id")
  REFERENCES "offering"("id", "business_id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "correction_request"
  ADD CONSTRAINT "correction_request_requested_by_fkey"
  FOREIGN KEY ("requested_by") REFERENCES "user_account"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "correction_edit"
  ADD CONSTRAINT "correction_edit_correction_request_id_fkey"
  FOREIGN KEY ("correction_request_id") REFERENCES "correction_request"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "correction_edit" ADD CONSTRAINT "correction_edit_offering_id_fkey"
  FOREIGN KEY ("offering_id") REFERENCES "offering"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "correction_edit" ADD CONSTRAINT "correction_edit_edited_by_fkey"
  FOREIGN KEY ("edited_by") REFERENCES "user_account"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AC-8's first gate, and AC-12 read from the other side: an edit is only ever
-- an answer to an Open case, and saving one leaves the status alone. Nothing
-- here closes anything.
CREATE OR REPLACE FUNCTION correction_edit_requires_open_case()
RETURNS TRIGGER AS $$
DECLARE
  case_status TEXT;
  targeted_offering UUID;
  targeted_area TEXT;
BEGIN
  SELECT c.status::text, r.offering_id, r.content_area::text
    INTO case_status, targeted_offering, targeted_area
  FROM correction_request r
  JOIN moderation_case c ON c.id = r.case_id
  WHERE r.id = NEW.correction_request_id;

  IF case_status <> 'OPEN' THEN
    RAISE EXCEPTION 'CORRECTION_CASE_NOT_OPEN' USING ERRCODE = 'check_violation';
  END IF;

  -- AC-9. The edit is recorded against the exact Offering and the exact area
  -- the notice named, so a record of a correction to something else is not a
  -- row this table accepts.
  IF NEW.offering_id IS DISTINCT FROM targeted_offering
     OR NEW.content_area::text IS DISTINCT FROM targeted_area THEN
    RAISE EXCEPTION 'CORRECTION_EDIT_NOT_TARGETED'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER correction_edit_requires_open_case
BEFORE INSERT ON "correction_edit"
FOR EACH ROW EXECUTE FUNCTION correction_edit_requires_open_case();
