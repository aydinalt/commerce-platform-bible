-- General Moderation Case Management (`US-PLT-F02-001`).
--
-- `US-BUS-F07-001` needed a case to answer, so it made one — bound to a
-- Business, because that was the only target Business could respond about.
-- This Story owns the case, and General Moderation reaches three targets: an
-- Offering, a Business, and a User Account.
--
-- The target is three nullable columns and a type, with a CHECK making exactly
-- one of them present. A single `target_id` with no foreign key would have been
-- shorter and would have let an Open case point at an Offering that no longer
-- exists.
--
-- `business_id` stays, and stays populated for an Offering target too — it is
-- the Business the case concerns rather than the thing being moderated. That
-- keeps `correction_request`'s composite foreign key working, and it also
-- means a User Account case cannot carry a correction request: there is no
-- Business for the key to reach, so `US-BUS-F07-001`'s Business-owned target
-- set holds structurally rather than by rule.
--
-- What this does not do is change any target's state. AC-3, AC-8 and AC-9 are
-- about a workflow status being nobody's product state, and nothing here reads
-- or writes an Offering lifecycle, a moderation status, an access status or an
-- eligibility result.

CREATE TYPE "ModerationTargetType" AS ENUM (
  'OFFERING',
  'BUSINESS',
  'USER_ACCOUNT'
);

-- The exact seven of PRD-0006 §7 and Owner Decision D15/D16. Affiliate
-- Destination Review, Validate, Enable and Disable are absent, which is AC-10:
-- they are a separate action family, and adding one here would be the way that
-- separation quietly ends.
CREATE TYPE "ModerationAction" AS ENUM (
  'REQUEST_CORRECTION',
  'HIDE_OFFERING',
  'RESTORE_OFFERING',
  'RESTRICT_BUSINESS',
  'RESTORE_BUSINESS',
  'SUSPEND_USER',
  'REINSTATE_USER'
);

-- Existing cases are all Business targets, because that is the only kind
-- `US-BUS-F07-001` could open.
ALTER TABLE "moderation_case"
  ADD COLUMN "target_type" "ModerationTargetType" NOT NULL DEFAULT 'BUSINESS',
  ADD COLUMN "offering_id" UUID,
  ADD COLUMN "user_id" UUID;

ALTER TABLE "moderation_case" ALTER COLUMN "target_type" DROP DEFAULT;

-- A Business case still names its Business, so `business_id` cannot become
-- nullable in general. It is nullable now only so a User Account case can
-- exist; the CHECK below is what keeps every other combination out.
ALTER TABLE "moderation_case" ALTER COLUMN "business_id" DROP NOT NULL;

ALTER TABLE "moderation_case"
  ADD CONSTRAINT "moderation_case_offering_id_fkey"
  FOREIGN KEY ("offering_id") REFERENCES "offering"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "moderation_case"
  ADD CONSTRAINT "moderation_case_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "user_account"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Exactly one target, and the Business a case concerns present exactly where
-- there is one to name. An Offering case carries both: the Offering it is
-- about, and the Business that will have to answer for it.
ALTER TABLE "moderation_case"
  ADD CONSTRAINT "moderation_case_exactly_one_target" CHECK (
    CASE "target_type"
      WHEN 'OFFERING' THEN
        "offering_id" IS NOT NULL AND "business_id" IS NOT NULL
        AND "user_id" IS NULL
      WHEN 'BUSINESS' THEN
        "business_id" IS NOT NULL
        AND "offering_id" IS NULL AND "user_id" IS NULL
      WHEN 'USER_ACCOUNT' THEN
        "user_id" IS NOT NULL
        AND "offering_id" IS NULL AND "business_id" IS NULL
    END
  );

CREATE INDEX "moderation_case_target_type_status_idx"
  ON "moderation_case" ("target_type", "status");

-- One row per action applied within a case, and per recorded no-action
-- decision. AC-7 makes closure conditional on one of the two having happened,
-- and the condition is read from these rows rather than from a flag — a flag
-- can be set by something that did not do the work.
CREATE TABLE "moderation_resolution" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "case_id" UUID NOT NULL,
  "action" "ModerationAction",
  "no_action_reason" VARCHAR(1000),
  "recorded_by" UUID NOT NULL,
  "recorded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  -- An applied action or a no-action decision, never both and never neither.
  -- "Nothing was decided" is not a resolution, and a row that claimed to be
  -- both would let a closure cite whichever suited it.
  CONSTRAINT "moderation_resolution_exactly_one_kind" CHECK (
    ("action" IS NULL) <> ("no_action_reason" IS NULL)
  )
);

ALTER TABLE "moderation_resolution"
  ADD CONSTRAINT "moderation_resolution_case_id_fkey"
  FOREIGN KEY ("case_id") REFERENCES "moderation_case"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "moderation_resolution"
  ADD CONSTRAINT "moderation_resolution_recorded_by_fkey"
  FOREIGN KEY ("recorded_by") REFERENCES "user_account"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "moderation_resolution_case_id_recorded_at_idx"
  ON "moderation_resolution" ("case_id", "recorded_at");

-- AC-7. A case cannot reach `Closed` with nothing to close it on. The gate is
-- here rather than only in the service because closure is the one transition
-- that ends an obligation: a case closed without a resolution is a target
-- nobody ever decided about, and no later reader could tell.
--
-- Request Correction is deliberately not a resolution. AC-6 keeps the case
-- Open after it, so a correction alone leaves this exception standing.
CREATE OR REPLACE FUNCTION moderation_case_closure_needs_resolution()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'CLOSED' AND OLD.status <> 'CLOSED' THEN
    IF NOT EXISTS (
      SELECT 1 FROM moderation_resolution r
      WHERE r.case_id = NEW.id
        AND (r.no_action_reason IS NOT NULL
             OR r.action <> 'REQUEST_CORRECTION')
    ) THEN
      RAISE EXCEPTION 'CASE_NOT_RESOLVED' USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER moderation_case_closure_needs_resolution
BEFORE UPDATE OF status ON "moderation_case"
FOR EACH ROW EXECUTE FUNCTION moderation_case_closure_needs_resolution();
