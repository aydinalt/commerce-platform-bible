-- Correlation across the asynchronous boundary (Engineering Constitution
-- §12.3, and R1.3 of the release criteria candidate).
--
-- `audit_record` already carries a `correlation_id`, and so does every error
-- envelope a person can quote back. The outbox did not — so a message that
-- never arrived could not be traced to the request that asked for it, which is
-- the one question an incident about registration email actually starts from.
--
-- Nullable, deliberately. Rows written before this migration have no
-- identifier to supply and inventing one would be worse than admitting the
-- absence; delivery has never depended on it and still does not.
ALTER TABLE "outbox_event" ADD COLUMN "correlation_id" UUID;

-- Indexed, because the reason this column exists is to be searched by: given a
-- correlation id from a person's error message, find what it queued.
CREATE INDEX "outbox_event_correlation_id_idx"
  ON "outbox_event" ("correlation_id");
