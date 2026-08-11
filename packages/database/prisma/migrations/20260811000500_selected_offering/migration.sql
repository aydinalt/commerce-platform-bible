-- Explicit Offering Selection (`US-DEC-F04-001`, PRD-0003).
--
-- Selection lives on the Decision flow because that is what it is: the one
-- Offering this flow is about to act on. It is nullable, and the null is the
-- normal starting state — AC-1 makes every handoff wait for an explicit act.

ALTER TABLE "decision_flow"
  ADD COLUMN "selected_offering_id" UUID;

ALTER TABLE "decision_flow"
  ADD CONSTRAINT "decision_flow_selected_offering_id_fkey"
  FOREIGN KEY ("selected_offering_id") REFERENCES "offering" ("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AC-2 and AC-3, where they cannot be forgotten.
--
-- In a single-Offering context the only selectable Offering is that one. In a
-- Comparison Set context it must be a current member. Writing this as a
-- trigger rather than a check in the service is the difference between a rule
-- and a habit: `US-DEC-F05-001` and `US-DEC-F06-001` will both read the
-- selection, and neither should have to re-establish that it is legitimate.
CREATE OR REPLACE FUNCTION decision_flow_selection_admissible()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.selected_offering_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.offering_id IS NOT NULL THEN
    IF NEW.selected_offering_id <> NEW.offering_id THEN
      RAISE EXCEPTION 'SELECTION_NOT_IN_CONTEXT'
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM comparison_set_member m
    WHERE m.comparison_set_id = NEW.comparison_set_id
      AND m.offering_id = NEW.selected_offering_id
  ) THEN
    RAISE EXCEPTION 'SELECTION_NOT_IN_CONTEXT'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER decision_flow_selection_admissible
BEFORE INSERT OR UPDATE ON "decision_flow"
FOR EACH ROW EXECUTE FUNCTION decision_flow_selection_admissible();

-- AC-6, for the half a person does not perform themselves.
--
-- Removing the selected member from the Comparison Set clears the selection in
-- the same statement. Without this the flow would hold a selection that its
-- own context no longer contains — and every later reader would have to
-- remember to notice.
CREATE OR REPLACE FUNCTION comparison_member_removal_clears_selection()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE decision_flow
  SET selected_offering_id = NULL
  WHERE comparison_set_id = OLD.comparison_set_id
    AND selected_offering_id = OLD.offering_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comparison_member_removal_clears_selection
AFTER DELETE ON "comparison_set_member"
FOR EACH ROW EXECUTE FUNCTION comparison_member_removal_clears_selection();
