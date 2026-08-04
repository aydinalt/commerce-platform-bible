-- Business context selection.
--
-- `US-IDN-F07-001` AC-3 forbids choosing a Business silently, so the selection
-- is explicit state rather than something inferred per request. It lives on the
-- session because ADR-0012 keeps authoritative context server-side, and because
-- leaving the context must not end the authenticated User session (AC-9).
--
-- `ON DELETE SET NULL`: losing a Business drops the context, never the session.

-- AlterTable
ALTER TABLE "user_session"
  ADD COLUMN "selected_business_id" UUID;

-- AddForeignKey
ALTER TABLE "user_session"
  ADD CONSTRAINT "user_session_selected_business_id_fkey"
  FOREIGN KEY ("selected_business_id") REFERENCES "business"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "user_session_selected_business_id_idx"
  ON "user_session"("selected_business_id");
