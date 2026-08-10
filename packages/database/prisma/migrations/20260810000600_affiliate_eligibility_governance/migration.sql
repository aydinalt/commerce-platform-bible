-- Affiliate Destination eligibility governance (`US-OFR-F07-001`, PRD-0001 §9.6).
--
-- AC-10 states Handoff Eligibility as a biconditional: Eligible exactly when
-- Destination Status is `ENABLED` *and* Validation Result is `VALID`. Four
-- administration actions can move those two columns, and every one of them would
-- otherwise have to remember to recompute the third.
--
-- Written as a constraint, the rule holds for all four without any of them
-- knowing about it — including the case that is easy to miss: re-validating an
-- already Enabled destination as `INVALID` must drop its eligibility while
-- AC-4 keeps its status where it is.
ALTER TABLE "affiliate_destination"
  ADD CONSTRAINT "affiliate_destination_eligibility_composed" CHECK (
    ("handoff_eligibility" = 'ELIGIBLE')
    = ("status" = 'ENABLED' AND "validation_result" = 'VALID')
  );

-- The evidence trail for an action that changes nothing.
--
-- AC-2 makes Review alone leave every result untouched, which would make it
-- invisible. It is not: PRD-0001 §9.4 makes an approved Admin review one of the
-- conditions a `Valid` result depends on, so the review has to be a thing that
-- happened rather than a thing someone remembers happening.
CREATE TABLE "affiliate_destination_review" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "destination_id" UUID NOT NULL,
    "reviewed_by" UUID NOT NULL,
    "note" VARCHAR(1000),
    "reviewed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_destination_review_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "affiliate_destination_review"
  ADD CONSTRAINT "affiliate_destination_review_destination_id_fkey"
  FOREIGN KEY ("destination_id") REFERENCES "affiliate_destination" ("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "affiliate_destination_review"
  ADD CONSTRAINT "affiliate_destination_review_reviewed_by_fkey"
  FOREIGN KEY ("reviewed_by") REFERENCES "user_account" ("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "affiliate_destination_review_destination_id_reviewed_at_idx"
  ON "affiliate_destination_review" ("destination_id", "reviewed_at");

-- Why a validation result was reached. PRD-0001 §9.4 defines the product
-- meaning of `Valid` and `Invalid` and explicitly leaves the method open, so
-- this records the outcome and its stated reason, not a mechanism.
ALTER TABLE "affiliate_destination"
  ADD COLUMN "validation_reason" VARCHAR(1000),
  ADD COLUMN "validated_at" TIMESTAMPTZ(6),
  ADD COLUMN "validated_by" UUID;

ALTER TABLE "affiliate_destination"
  ADD CONSTRAINT "affiliate_destination_validated_by_fkey"
  FOREIGN KEY ("validated_by") REFERENCES "user_account" ("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AC-3: exactly one current validation result. `NOT_VALIDATED` is the absence
-- of one, so it carries no evidence; the other two always do.
ALTER TABLE "affiliate_destination"
  ADD CONSTRAINT "affiliate_destination_validation_evidence" CHECK (
    ("validation_result" = 'NOT_VALIDATED')
    = ("validated_at" IS NULL AND "validated_by" IS NULL)
  );

-- The authoring reset returns the destination to having no current result, so
-- it must clear the evidence with it. Replacing the function keeps that in the
-- one place the reset already lives.
CREATE OR REPLACE FUNCTION "affiliate_destination_reset_on_change"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW."reference" IS DISTINCT FROM OLD."reference" THEN
    NEW."status" := 'DRAFT';
    NEW."validation_result" := 'NOT_VALIDATED';
    NEW."handoff_eligibility" := 'INELIGIBLE';
    NEW."validation_reason" := NULL;
    NEW."validated_at" := NULL;
    NEW."validated_by" := NULL;
    NEW."version" := OLD."version" + 1;
    NEW."updated_at" := now();
  END IF;
  RETURN NEW;
END;
$$;
