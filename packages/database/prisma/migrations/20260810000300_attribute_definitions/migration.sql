-- Attribute definition management (`US-PLT-F09-001`).
--
-- The datamodel and the Story disagreed in three places, and each disagreement
-- would have made an Acceptance Criterion unwritable:
--
--   * the value kinds were `TEXT, INTEGER, DECIMAL, BOOLEAN, DATE, OPTION`,
--     while AC-2 fixes them at Text, Number, Boolean, Single Select and Multi
--     Select. `Integer` and `Decimal` are one Number; `Date` is not a V1 kind;
--     `Option` was one Select where the Story needs two;
--   * AC-1 requires `comparable` and `required for publication`, and AC-3 a
--     unit, none of which existed;
--   * `category_attribute.required` placed the required flag on each
--     applicability link, but AC-7 evaluates it across *every* applicable
--     Category at once, so it belongs to the definition.
--
-- Nothing reads or writes these tables yet, so the alignment is a rename rather
-- than a migration of meaning.

-- AC-2. The kinds are replaced wholesale rather than extended, so no retired
-- spelling survives to be selected by accident.
CREATE TYPE "AttributeValueKind_new" AS ENUM (
  'TEXT', 'NUMBER', 'BOOLEAN', 'SINGLE_SELECT', 'MULTI_SELECT'
);

ALTER TABLE "attribute_definition" ALTER COLUMN "value_kind" TYPE "AttributeValueKind_new"
  USING (
    CASE "value_kind"::text
      WHEN 'INTEGER' THEN 'NUMBER'
      WHEN 'DECIMAL' THEN 'NUMBER'
      WHEN 'OPTION' THEN 'SINGLE_SELECT'
      WHEN 'DATE' THEN 'TEXT'
      ELSE "value_kind"::text
    END
  )::"AttributeValueKind_new";

DROP TYPE "AttributeValueKind";
ALTER TYPE "AttributeValueKind_new" RENAME TO "AttributeValueKind";

-- AC-1 and AC-3.
ALTER TABLE "attribute_definition"
  ADD COLUMN "unit" VARCHAR(40),
  ADD COLUMN "comparable" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "required_for_publication" BOOLEAN NOT NULL DEFAULT false;

-- AC-7 reads the flag across every applicable Category at once, so a per-link
-- copy would be a second answer to a question that has one.
ALTER TABLE "category_attribute" DROP COLUMN "required";

-- AC-5. Text cannot be filterable in V1 — stated once, here, rather than at
-- every place a definition is written.
ALTER TABLE "attribute_definition"
  ADD CONSTRAINT "attribute_definition_text_not_filterable"
  CHECK (NOT ("value_kind" = 'TEXT' AND "filterable"));

-- AC-3. A unit is a property of Number and means nothing on the other kinds,
-- so the other kinds cannot carry one.
ALTER TABLE "attribute_definition"
  ADD CONSTRAINT "attribute_definition_unit_belongs_to_number"
  CHECK ("unit" IS NULL OR "value_kind" = 'NUMBER');

-- The Offering value shape follows the kinds. `integer_value` and
-- `decimal_value` become one `number_value`; `date_value` goes with the kind it
-- served. Offering values remain PRD-0001's to write (AC-14) — this only keeps
-- the shape able to hold what a definition can now declare.
ALTER TABLE "offering_attribute_value"
  DROP CONSTRAINT "offering_attribute_exactly_one_value";

ALTER TABLE "offering_attribute_value"
  ADD COLUMN "number_value" DECIMAL(24,8);

UPDATE "offering_attribute_value"
  SET "number_value" = COALESCE("integer_value"::DECIMAL, "decimal_value");

ALTER TABLE "offering_attribute_value"
  DROP COLUMN "integer_value",
  DROP COLUMN "decimal_value",
  DROP COLUMN "date_value";

ALTER TABLE "offering_attribute_value"
  ADD CONSTRAINT "offering_attribute_exactly_one_value" CHECK (
    num_nonnulls("text_value", "number_value", "boolean_value", "option_id") = 1
  );

-- AC-4. A Select kind must always have at least one governed allowed value.
-- Creation can check it inside its own transaction, but retirement cannot: the
-- last active option can only be recognised by looking at its siblings. A
-- trigger sees them; a statement does not.
--
-- Raised as `23514` with a constraint name so it arrives in the same shape as
-- any other violated constraint.
CREATE OR REPLACE FUNCTION "attribute_option_keep_one_active"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  kind TEXT;
  remaining INT;
BEGIN
  SELECT "value_kind"::text INTO kind
  FROM "attribute_definition" WHERE "id" = NEW."attribute_definition_id";

  IF kind NOT IN ('SINGLE_SELECT', 'MULTI_SELECT') THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO remaining FROM "attribute_option"
  WHERE "attribute_definition_id" = NEW."attribute_definition_id"
    AND "active" = true AND "id" <> NEW."id";

  IF remaining = 0 THEN
    RAISE EXCEPTION 'A Select Attribute must keep one allowed value'
      USING ERRCODE = '23514',
            CONSTRAINT = 'attribute_option_at_least_one_active';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER "attribute_option_last_active_guard"
  BEFORE UPDATE OF "active" ON "attribute_option"
  FOR EACH ROW
  WHEN (OLD."active" = true AND NEW."active" = false)
  EXECUTE FUNCTION "attribute_option_keep_one_active"();
