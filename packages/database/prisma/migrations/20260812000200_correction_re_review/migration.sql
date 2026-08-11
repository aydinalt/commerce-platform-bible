-- Request Correction and Re-review (`US-PLT-F06-001`).
--
-- `US-BUS-F07-001` made the owner's response record itself, so that re-review
-- was outstanding without anybody having to raise a flag. What was missing is
-- the other half: nothing recorded that re-review had *happened*, and so
-- nothing could require it before closure.
--
-- AC-10 and AC-12 are one rule read from two sides. A case whose owner has
-- answered is a case somebody has to look at again, and closing it without
-- looking would make the answer pointless — the owner did work that nobody
-- read. So the trigger below adds one condition to closure, and only for cases
-- that have an owner response to re-review.
--
-- A case with no correction edit is unaffected. Restricting a Business and
-- closing after a no-action decision needs no re-review, because nobody was
-- asked to do anything.

CREATE TABLE "correction_review" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "case_id" UUID NOT NULL,
  "note" VARCHAR(1000),
  "reviewed_by" UUID NOT NULL,
  "reviewed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now()
);

ALTER TABLE "correction_review"
  ADD CONSTRAINT "correction_review_case_id_fkey"
  FOREIGN KEY ("case_id") REFERENCES "moderation_case"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "correction_review"
  ADD CONSTRAINT "correction_review_reviewed_by_fkey"
  FOREIGN KEY ("reviewed_by") REFERENCES "user_account"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "correction_review_case_id_reviewed_at_idx"
  ON "correction_review" ("case_id", "reviewed_at");

-- AC-10 and AC-12. Closure now needs a resolution *and*, where the owner has
-- saved a correction, a re-review recorded after the most recent one.
--
-- "After the most recent one" rather than "at all", because an owner may
-- answer again following a re-review. A single earlier review would otherwise
-- stand in for every later response, which is the same as not requiring one.
CREATE OR REPLACE FUNCTION moderation_case_closure_needs_resolution()
RETURNS TRIGGER AS $$
DECLARE
  last_edit TIMESTAMPTZ;
  last_review TIMESTAMPTZ;
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

    SELECT max(e.edited_at) INTO last_edit
    FROM correction_edit e
    JOIN correction_request q ON q.id = e.correction_request_id
    WHERE q.case_id = NEW.id;

    IF last_edit IS NOT NULL THEN
      SELECT max(v.reviewed_at) INTO last_review
      FROM correction_review v WHERE v.case_id = NEW.id;

      IF last_review IS NULL OR last_review < last_edit THEN
        RAISE EXCEPTION 'CASE_NOT_RE_REVIEWED'
          USING ERRCODE = 'check_violation';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
