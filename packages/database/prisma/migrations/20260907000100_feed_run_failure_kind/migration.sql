-- I91. Why a feed run failed, as a value rather than as a sentence.
--
-- `US-PLT-F13-001` AC-9 and `PRD-0006` Frozen v2.6 §24.2: a failed run must
-- distinguish a server that refused, a document that could not be parsed, and a
-- mapping that names a field the document does not carry. Those are three
-- different jobs for three different people — the partner's engineer, the
-- partner's publisher, and the Admin who wrote the mapping — and a run that
-- reports only a message sends all three to whoever reads English best.
--
-- The message stays. It says what happened; this says what kind of thing
-- happened, which is what a surface can group, filter and route on.
--
-- `UNCLASSIFIED` exists because an unexpected error must not be filed under one
-- of the three. A category that swallows the unknown is a category that lies
-- the first time something new breaks.
CREATE TYPE "OfferingFeedFailureKind" AS ENUM (
  'SOURCE_UNREACHABLE',
  'DOCUMENT_UNREADABLE',
  'MAPPING_INCOMPLETE',
  'UNCLASSIFIED'
);

ALTER TABLE "offering_feed_run"
  ADD COLUMN "failure_kind" "OfferingFeedFailureKind";
