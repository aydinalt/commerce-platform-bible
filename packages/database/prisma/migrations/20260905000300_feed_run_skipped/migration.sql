-- I88. What a run passed over.
--
-- The Owner, 2026-09-05: the feed's job is "yalnızca eşleşen ve yayında olan
-- ilanların fiyat ve stok durumunu güncellemek". A partner's document lists
-- their whole catalogue and the platform carries a curated part of it, so from
-- now on a healthy run passes over most of what it reads.
--
-- Its own column rather than a share of `rejected_count`: a rejection is a row
-- somebody has to fix, and four thousand ordinary skips in that number would
-- bury the one row with an unreadable price and make every run look broken.
--
-- `created_count` stays, and stays truthful: the runs that created listings
-- happened, and a history that dropped the number would say they did not.
ALTER TABLE "offering_feed_run"
  ADD COLUMN "skipped_count" INTEGER NOT NULL DEFAULT 0;
