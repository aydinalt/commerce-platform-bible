-- Comparison Set (`US-DEC-F01-001`, PRD-0003 Compare).
--
-- The whole Story is about what a Comparison Set may contain, so the rules
-- live where a set is stored rather than in the code that writes one. Two to
-- five publicly eligible Offerings sharing one active leaf Category: the
-- ceiling, the shared leaf and the eligibility are enforced below, and only
-- the floor of two is left to the read that opens Compare — a set builds up
-- from one member, so a single-member set is a set being formed rather than an
-- invalid one.
--
-- The set is current-flow state, not history. It carries an expiry and is not
-- a session: it identifies nobody, and PRD-0003 gives V1 no saved Compare
-- history to keep.

CREATE TABLE "comparison_set" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    -- The shared active leaf Category (AC-3). Fixed by the first member, so
    -- every later member is compared against a decision already made rather
    -- than against the other members one at a time.
    "category_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "comparison_set_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "comparison_set_expires_at_idx" ON "comparison_set" ("expires_at");

ALTER TABLE "comparison_set"
  ADD CONSTRAINT "comparison_set_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "category" ("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "comparison_set_member" (
    "comparison_set_id" UUID NOT NULL,
    "offering_id" UUID NOT NULL,
    "added_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- One Offering appears once. AC-2 counts members, and the same Offering
    -- twice would be a set of five that shows three things.
    CONSTRAINT "comparison_set_member_pkey"
      PRIMARY KEY ("comparison_set_id", "offering_id")
);

CREATE INDEX "comparison_set_member_offering_id_idx"
  ON "comparison_set_member" ("offering_id");

ALTER TABLE "comparison_set_member"
  ADD CONSTRAINT "comparison_set_member_comparison_set_id_fkey"
  FOREIGN KEY ("comparison_set_id") REFERENCES "comparison_set" ("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "comparison_set_member"
  ADD CONSTRAINT "comparison_set_member_offering_id_fkey"
  FOREIGN KEY ("offering_id") REFERENCES "offering" ("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AC-2, AC-3, AC-4 and AC-6, enforced where they cannot be forgotten.
--
-- The eligibility test is the Discovery projection's existence, which is the
-- same answer Discovery and Presentation use: a row is there only while final
-- Offering Public Eligibility is `Eligible`. Nothing here recalculates it, and
-- PRD-0001 §7.1 forbids doing so.
--
-- The ceiling is a count taken under the row lock the insert already holds, so
-- two simultaneous additions to a four-member set cannot both succeed.
CREATE OR REPLACE FUNCTION comparison_set_member_admissible()
RETURNS TRIGGER AS $$
DECLARE
  set_category UUID;
  member_category UUID;
  member_count INT;
BEGIN
  SELECT category_id INTO set_category
  FROM comparison_set WHERE id = NEW.comparison_set_id FOR UPDATE;

  SELECT category_id INTO member_category
  FROM offering_search_projection WHERE offering_id = NEW.offering_id;

  IF member_category IS NULL THEN
    RAISE EXCEPTION 'COMPARISON_MEMBER_INELIGIBLE'
      USING ERRCODE = 'check_violation';
  END IF;

  IF member_category <> set_category THEN
    RAISE EXCEPTION 'COMPARISON_MEMBER_OTHER_CATEGORY'
      USING ERRCODE = 'check_violation';
  END IF;

  SELECT count(*) INTO member_count
  FROM comparison_set_member WHERE comparison_set_id = NEW.comparison_set_id;

  IF member_count >= 5 THEN
    RAISE EXCEPTION 'COMPARISON_SET_FULL'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comparison_set_member_admissible
BEFORE INSERT ON "comparison_set_member"
FOR EACH ROW EXECUTE FUNCTION comparison_set_member_admissible();

-- Compare Start (`US-DEC-F01-001` AC-11).
--
-- One per Comparison Set, like a Discovery Start is one per path: opening the
-- same set again is the same person still comparing the same things, and
-- PRD-0006 Basic Analytics would otherwise count one comparison several times.
CREATE TABLE "compare_start" (
    "comparison_set_id" UUID NOT NULL,
    "domain_id" UUID NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compare_start_pkey" PRIMARY KEY ("comparison_set_id")
);

CREATE INDEX "compare_start_domain_id_started_at_idx"
  ON "compare_start" ("domain_id", "started_at");

-- The occurrence outlives the set it describes: the set expires and is swept,
-- and what happened stays happened.
ALTER TABLE "compare_start"
  ADD CONSTRAINT "compare_start_domain_id_fkey"
  FOREIGN KEY ("domain_id") REFERENCES "domain" ("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
