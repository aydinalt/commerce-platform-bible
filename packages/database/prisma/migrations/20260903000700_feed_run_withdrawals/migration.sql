-- I78. What the Owner's 72-hour rule did on each run.
--
-- Counted on the run rather than derived from the item table, because the two
-- answer different questions. `offering_feed_item` says what is withdrawn
-- **now**; a run says what happened **then**, and an operator asking "when did
-- we lose four hundred listings" needs the second.
--
-- `restored_count` is the reversibility PRD-0001 v4.1 §7.2 exists to provide,
-- made visible. A promise nobody can see kept is one somebody eventually
-- re-implements by hand.
ALTER TABLE "offering_feed_run"
  ADD COLUMN "withdrawn_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "restored_count" INTEGER NOT NULL DEFAULT 0;
