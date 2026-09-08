-- I78. The third final-eligibility input (PRD-0001 v4.1 §7.2).
--
-- The Owner set the rule for a product that disappears from a partner's feed on
-- 2026-09-03: out of stock for 72 hours, and if it is still absent at the end
-- of that tolerance the platform stops publishing it. His reason is the one
-- that shaped the design — "tek bir API kesintisinin veya hatalı partner
-- senkronizasyonunun tüm kataloğu silmesini engellemek hayati önem taşıyor."
--
-- **Neither lifecycle state could carry it**, which is why this column exists
-- rather than a status change:
--
--   Archived -- PRD-0001 §6.5 has no transition out of it. A three-day partner
--               outage would permanently destroy their catalogue, which is the
--               exact outcome the tolerance exists to prevent.
--   Hidden   -- §7.2 makes it an Admin's moderation outcome and FR-15 reserves
--               the restore to an Admin. An intake hiding four thousand
--               listings would leave somebody restoring them by hand.
--
-- So PRD-0001 v4.1 added a third input to §7.3's composition instead, on the
-- model §7.3 already used for Business restriction: publicly ineligible
-- **without changing the lifecycle state**, and reversible by the intake that
-- set it.
--
-- Default true, and that is the whole story for every Offering no intake
-- maintains. §7.3 makes an Offering whose Source is not Feed Eligible on this
-- input by construction, and a column that defaults to available says so
-- without a backfill.
ALTER TABLE "offering"
  ADD COLUMN "intake_available" BOOLEAN NOT NULL DEFAULT true;

-- Only ever false for a handful of rows, and every reader that cares is asking
-- for exactly those. A partial index is the shape of that question.
CREATE INDEX "offering_intake_unavailable_idx"
  ON "offering"("intake_available")
  WHERE "intake_available" = false;

-- When the intake withdrew it, and therefore how long it has been withdrawn.
--
-- Kept beside "missing_since" rather than derived from it. "The document
-- stopped listing this" and "the platform stopped publishing it" are two events
-- separated by the tolerance, and collapsing them would make the tolerance
-- unmeasurable after the fact.
ALTER TABLE "offering_feed_item"
  ADD COLUMN "withdrawn_at" TIMESTAMPTZ(6);
