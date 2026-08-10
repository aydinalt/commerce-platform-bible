-- Affiliate Destination (`US-OFR-F06-001`, PRD-0001 §9).
--
-- A destination is a distinct object associated with exactly one Offering, not
-- a field on the Offering. That distinction is the Story: authoring it is
-- neither `F01 — Offering Creation` nor `F02 — Offering Editing`, and its
-- status has its own life.

CREATE TYPE "AffiliateDestinationStatus" AS ENUM ('DRAFT', 'ENABLED', 'DISABLED');
CREATE TYPE "AffiliateValidationResult" AS ENUM ('NOT_VALIDATED', 'VALID', 'INVALID');
CREATE TYPE "HandoffEligibility" AS ENUM ('ELIGIBLE', 'INELIGIBLE');

CREATE TABLE "affiliate_destination" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "offering_id" UUID NOT NULL,
    -- PRD-0001 §9.4 requires a usable external reference that is "currently
    -- supplied by the Business and is not empty". An empty one is not a
    -- destination awaiting a value; it is not a destination.
    "reference" VARCHAR(2048) NOT NULL,
    "status" "AffiliateDestinationStatus" NOT NULL DEFAULT 'DRAFT',
    "validation_result" "AffiliateValidationResult" NOT NULL DEFAULT 'NOT_VALIDATED',
    "handoff_eligibility" "HandoffEligibility" NOT NULL DEFAULT 'INELIGIBLE',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_destination_pkey" PRIMARY KEY ("id")
);

-- AC-2. "Zero or one" and "cannot be shared" are the same statement read from
-- either end, and a unique key says both at once.
CREATE UNIQUE INDEX "affiliate_destination_offering_id_key"
  ON "affiliate_destination" ("offering_id");

ALTER TABLE "affiliate_destination"
  ADD CONSTRAINT "affiliate_destination_offering_id_fkey"
  FOREIGN KEY ("offering_id") REFERENCES "offering" ("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "affiliate_destination"
  ADD CONSTRAINT "affiliate_destination_reference_present"
  CHECK (btrim("reference") <> '');

ALTER TABLE "affiliate_destination"
  ADD CONSTRAINT "affiliate_destination_version_positive" CHECK ("version" > 0);

-- AC-5, and PRD-0001 §9.5's reason for it: "This prevents a changed destination
-- from remaining eligible under an earlier validation result."
--
-- The reset lives here rather than in the authoring code because the code that
-- must not forget it has not been written yet. `PRD-0006` will own Review,
-- Validate, Enable and Disable, and one of those paths will one day update this
-- row. A changed reference resets the three results no matter which path
-- changed it — including a path nobody has thought of.
--
-- It fires only when the reference actually changes, so enabling a destination
-- whose configuration is unchanged is untouched.
CREATE OR REPLACE FUNCTION "affiliate_destination_reset_on_change"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW."reference" IS DISTINCT FROM OLD."reference" THEN
    NEW."status" := 'DRAFT';
    NEW."validation_result" := 'NOT_VALIDATED';
    NEW."handoff_eligibility" := 'INELIGIBLE';
    NEW."version" := OLD."version" + 1;
    NEW."updated_at" := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER "affiliate_destination_reset_guard"
  BEFORE UPDATE ON "affiliate_destination"
  FOR EACH ROW
  EXECUTE FUNCTION "affiliate_destination_reset_on_change"();
