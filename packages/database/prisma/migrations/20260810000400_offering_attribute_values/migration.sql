-- Offering Attribute values that can hold a Multi Select (`US-OFR-F02-001`).
--
-- `US-PLT-F09-001` made `MULTI_SELECT` a value kind an Admin can declare, but
-- left this table keyed on `(offering_id, attribute_definition_id)` — one row
-- per definition, so a Multi Select could be defined and never satisfied. That
-- was recorded as a gap for this Story to close, and this is it.
--
-- The shape now says the rule instead of assuming it:
--
--   * a surrogate key, because a Multi Select is several rows;
--   * one row per definition when no option is named — every non-Select kind;
--   * one row per option when one is, so the same option cannot be chosen
--     twice;
--   * a trigger for the part neither index can see: a Single Select holds one
--     option, not several.

ALTER TABLE "offering_attribute_value" DROP CONSTRAINT "offering_attribute_value_pkey";

ALTER TABLE "offering_attribute_value"
  ADD COLUMN "id" UUID NOT NULL DEFAULT gen_random_uuid();

ALTER TABLE "offering_attribute_value"
  ADD CONSTRAINT "offering_attribute_value_pkey" PRIMARY KEY ("id");

-- A scalar value is singular by definition, so the row is too.
CREATE UNIQUE INDEX "offering_attribute_value_scalar_key"
  ON "offering_attribute_value" ("offering_id", "attribute_definition_id")
  WHERE "option_id" IS NULL;

-- Choosing the same allowed value twice is not a second choice.
CREATE UNIQUE INDEX "offering_attribute_value_option_key"
  ON "offering_attribute_value"
     ("offering_id", "attribute_definition_id", "option_id")
  WHERE "option_id" IS NOT NULL;

-- `SINGLE_SELECT` differs from `MULTI_SELECT` only in how many options one
-- Offering may hold, and that difference lives in the definition rather than in
-- the row being written. An index cannot consult another table; a trigger can.
CREATE OR REPLACE FUNCTION "offering_attribute_value_enforce_arity"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  kind TEXT;
  chosen INT;
BEGIN
  IF NEW."option_id" IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT "value_kind"::text INTO kind
  FROM "attribute_definition" WHERE "id" = NEW."attribute_definition_id";

  IF kind <> 'SINGLE_SELECT' THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO chosen FROM "offering_attribute_value"
  WHERE "offering_id" = NEW."offering_id"
    AND "attribute_definition_id" = NEW."attribute_definition_id"
    AND "id" <> NEW."id";

  IF chosen > 0 THEN
    RAISE EXCEPTION 'A Single Select Attribute holds one allowed value'
      USING ERRCODE = '23514',
            CONSTRAINT = 'offering_attribute_value_single_select_arity';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER "offering_attribute_value_arity_guard"
  BEFORE INSERT OR UPDATE OF "option_id" ON "offering_attribute_value"
  FOR EACH ROW
  EXECUTE FUNCTION "offering_attribute_value_enforce_arity"();
