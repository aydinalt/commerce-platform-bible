-- I83. The Admin audit trail.
--
-- The Owner asked for it when he set the PII rule: revealing somebody's email
-- address should be an action that leaves a record, and so should every other
-- consequential thing an Admin does. This is the table those records go in.
--
-- **Append-only, enforced rather than promised.** A trigger below refuses
-- UPDATE and DELETE. A comment saying "do not edit this table" is worth
-- nothing in the situation an audit trail exists for: the one where somebody
-- has a reason to change what it says. The application never issues either
-- statement, so the trigger costs nothing until it is the only thing standing
-- between a record and a quiet edit.
--
-- It is deliberately NOT deletable on retention grounds either. Listing reports
-- are swept after 180 days because they hold a member of the public's own
-- words; an audit row holds an Admin acting in their role, which is the thing
-- being accounted for. If a retention rule is ever wanted here it is an Owner
-- decision, and it will have to disable this trigger explicitly — which is the
-- point.

CREATE TYPE "AdminAuditAction" AS ENUM (
  -- Reading personal data. The Owner's rule of 2026-09-04: an email address is
  -- revealed only on a case, only on request, and the request is recorded.
  'PII_VIEW',
  -- The seven General Moderation actions. Recorded here in addition to the
  -- case's own resolutions, and the duplication is deliberate: a resolution
  -- says what happened to a target, this says who did it and when. The first
  -- is product history and the second is accountability, and a system that
  -- keeps only the first cannot answer "who suspended this account".
  'REQUEST_CORRECTION',
  'HIDE_OFFERING',
  'RESTORE_OFFERING',
  'RESTRICT_BUSINESS',
  'RESTORE_BUSINESS',
  -- Named exactly as the seven General Moderation actions already are
  -- (`MODERATION_ACTION_VALUES`), not as `USER_SUSPEND`/`USER_REINSTATE`. The
  -- Owner wrote the latter as an example; matching the existing vocabulary
  -- means an action can be recorded without a translation table, and a
  -- translation table between two spellings of the same seven things is where
  -- the eighth spelling eventually comes from.
  'SUSPEND_USER',
  'REINSTATE_USER',
  -- Opening a case, so a queue that fills up can be accounted for.
  'CASE_OPEN'
);

CREATE TABLE "admin_audit_event" (
  "id"          BIGSERIAL PRIMARY KEY,
  -- Who acted. Never null: an audit row with no actor is a row that accounts
  -- for nothing, and every path that writes here has resolved an Admin
  -- principal before it gets this far.
  "actor_id"    UUID NOT NULL,
  "action_type" "AdminAuditAction" NOT NULL,
  -- What was acted on. Nullable because not every action has a single target
  -- outside its case, and a fabricated one would be worse than an absent one.
  "target_id"   UUID,
  -- The case the action was taken under, where there is one. This is what
  -- turns "somebody viewed an address" into "this address was viewed while
  -- working case X" — the difference between a log and an account.
  "case_id"     UUID,
  "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  CONSTRAINT "admin_audit_event_actor_id_fkey" FOREIGN KEY ("actor_id")
    REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ON DELETE RESTRICT above, and it is load-bearing: an account that has acted
-- as an Admin cannot be deleted out from under its own audit rows. Cascading
-- would let removing a user erase the record of what they did.

-- The two questions this table is asked: what did this person do, and what has
-- been done to this target. Both are "recently", so both indexes are ordered.
CREATE INDEX "admin_audit_event_actor_id_occurred_at_idx"
  ON "admin_audit_event" ("actor_id", "occurred_at" DESC);
CREATE INDEX "admin_audit_event_target_id_occurred_at_idx"
  ON "admin_audit_event" ("target_id", "occurred_at" DESC)
  WHERE "target_id" IS NOT NULL;

-- Append-only.
CREATE OR REPLACE FUNCTION "admin_audit_event_is_append_only"()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'admin_audit_event is append-only: % is not permitted', TG_OP;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "admin_audit_event_no_update"
  BEFORE UPDATE ON "admin_audit_event"
  FOR EACH ROW EXECUTE FUNCTION "admin_audit_event_is_append_only"();

CREATE TRIGGER "admin_audit_event_no_delete"
  BEFORE DELETE ON "admin_audit_event"
  FOR EACH ROW EXECUTE FUNCTION "admin_audit_event_is_append_only"();

-- TRUNCATE is a third way to empty a table and it does **not** fire row
-- triggers. Found by testing the two above and then watching `truncate` clear
-- the table anyway — which would have left "append-only" true of the two
-- statements nobody would reach for and false of the one somebody would.
CREATE TRIGGER "admin_audit_event_no_truncate"
  BEFORE TRUNCATE ON "admin_audit_event"
  FOR EACH STATEMENT EXECUTE FUNCTION "admin_audit_event_is_append_only"();
