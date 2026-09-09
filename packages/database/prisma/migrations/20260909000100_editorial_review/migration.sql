-- I93: the platform's own judgement of a product, and the surface that writes it.
--
-- Features `EDT F01` (presentation) and `EDT F02` (authoring), both allocated in
-- `EDITORIAL_FEATURE_REGISTRY.md` Frozen v1.1. Behaviour owner: `PRD-0009`
-- Frozen v0.4. The two Stories, `US-EDT-F01-001` and `US-EDT-F02-001`, are built
-- against this one model on the Owner's decision that reading and writing be one
-- sealed architecture rather than a read model refactored when writing arrives.
--
-- ---------------------------------------------------------------------------
-- Why `product_key` and not `product_group_key`
-- ---------------------------------------------------------------------------
--
-- `product_review` and `favourite` group by
-- `coalesce(offering.product_key, offering.id::text)`, so a listing with no key
-- becomes a group of one named after the listing. That is right for a crowd
-- rating, which belongs to whatever the person was looking at. It is wrong here.
--
-- A review written against such a group would be attached to an Offering wearing
-- a Product Key's name, and would vanish the day that Offering was withdrawn --
-- which is exactly the failure `US-EDT-F01-001` AC-9 exists to prevent, reached
-- through the convenience meant to help. `US-EDT-F02-001` AC-1 forbids attaching
-- a review to an Offering and AC-14 requires a key the catalogue carries.
-- Together they leave one reading: a real key, or no review. This column is
-- therefore `NOT NULL` and holds `offering.product_key` verbatim.
--
-- ---------------------------------------------------------------------------
-- Why there is no foreign key to `offering`
-- ---------------------------------------------------------------------------
--
-- Two Acceptance Criteria pull in opposite directions and only one arrangement
-- satisfies both. AC-14 requires the key to exist in the catalogue at the moment
-- the review is written. AC-9 requires the review to survive every Offering that
-- carried that key being retired, hidden or withdrawn -- the criterion
-- `US-EDT-F01-001` §11 calls the one that justifies the whole architecture.
--
-- A foreign key would serve the first by defeating the second: it would either
-- block the seller's retirement or take the platform's judgement down with the
-- last listing. Existence is therefore checked inside the write transaction,
-- where there is no window between the check and the write, and no constraint
-- ties the review's life to any seller's.
--
-- ---------------------------------------------------------------------------
-- Why there is no `business_id`, and no room for a sponsorship
-- ---------------------------------------------------------------------------
--
-- This is platform-owned material, like `category` and `admin_audit_event` and
-- unlike everything a Business writes. This codebase has no tenant column and no
-- row-level security; Business-owned rows are scoped by `business_id` in each
-- query's WHERE clause. The absence of that column here *is* the isolation
-- boundary: no seller can reach the judgement written about the product they
-- sell, because no column expresses the relationship.
--
-- The same absence is the structural half of AC-16. There is no sponsor,
-- partner, commission, promotion, placement or reason column, and no JSON
-- document that could carry one -- which is why the sections and the points are
-- child tables with named columns rather than an array on this row. `PRD-0009`
-- §8 is a prohibition, and a prohibition is only as good as the shapes that can
-- carry a violation. A request to mark a review as sponsored should arrive at a
-- form with nowhere to put it, which is a better answer than a policy somebody
-- has to remember.

CREATE TYPE "EditorialReviewStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'WITHDRAWN');

CREATE TYPE "EditorialPointKind" AS ENUM ('PRO', 'CON');

-- `last_checked_at`, and why it is not called `updated_at`.
--
-- `PRD-0009` §13.4 and AC-9: the re-check date moves only when the writer states
-- that the review has been re-checked, never as a consequence of saving. Every
-- other table in this database sets `updated_at = now()` on write -- see
-- `product_review`'s own upsert -- and the day somebody follows that habit here
-- is the day the rule breaks silently. "Last re-checked" would come to mean
-- "last touched", a corrected comma would present as a fresh verification, and
-- the date the reader is invited to trust would be the least trustworthy thing
-- on the page. A correct reading surface over a writing surface that does that
-- presents a lie carefully.
--
-- So the two dates are named for what they claim, and ordinary row bookkeeping
-- gets its own column. There is no column here whose name invites the wrong
-- write.
CREATE TABLE "editorial_review" (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_key"     VARCHAR(64) NOT NULL,
  "status"          "EditorialReviewStatus" NOT NULL DEFAULT 'DRAFT',
  "verdict"         VARCHAR(280),
  "score"           NUMERIC(3, 1),
  "byline"          VARCHAR(120),
  "published_at"    TIMESTAMPTZ(6),
  "last_checked_at" TIMESTAMPTZ(6),
  "created_at"      TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "row_revised_at"  TIMESTAMPTZ(6) NOT NULL DEFAULT now()
);

-- One review per Product Key, in every state -- withdrawn included (AC-15).
--
-- The consequence is worth stating where somebody will read it: a withdrawn
-- review occupies its key permanently, because nothing deletes one (AC-7). The
-- remedy for a wrong judgement is to revise and republish the review that
-- exists, which is what `PRD-0009` §13.5 means by "a second is a revision of the
-- first, not a second review".
CREATE UNIQUE INDEX "editorial_review_product_key_key"
  ON "editorial_review" ("product_key");

-- Nought to ten. One decimal is guaranteed by NUMERIC(3,1) itself, which is
-- exact decimal rather than a float -- the same discipline the money rule
-- applies, for the same reason: a value a reader is shown should not depend on
-- binary rounding. Nought is a score a reviewer may legitimately give; absence
-- is NULL.
ALTER TABLE "editorial_review"
  ADD CONSTRAINT "editorial_review_score_range"
  CHECK ("score" IS NULL OR ("score" >= 0 AND "score" <= 10));

-- AC-12's single-row half, guaranteed here rather than only in a service.
--
-- `PRD-0009` §13.5 names six things a review may not be published without. Three
-- of them live on this row and are enforced below. The other three -- at least
-- one section, one pro and one con -- are counts across the child tables and
-- cannot be a row constraint; they are enforced in the write transaction and
-- asserted by test. That split is stated rather than left for a reader to infer
-- a guarantee this constraint does not give.
ALTER TABLE "editorial_review"
  ADD CONSTRAINT "editorial_review_published_is_complete"
  CHECK (
    "status" = 'DRAFT'
    OR (
      "verdict" IS NOT NULL AND btrim("verdict") <> ''
      AND "score" IS NOT NULL
      AND "byline" IS NOT NULL AND btrim("byline") <> ''
    )
  );

-- A review that has left DRAFT has been published once, and the date says when.
-- This is what makes `published_at` "set once and never again" checkable: a
-- WITHDRAWN row still carries it, because withdrawal is a removal from
-- presentation and not an erasure of history.
ALTER TABLE "editorial_review"
  ADD CONSTRAINT "editorial_review_left_draft_has_published_at"
  CHECK ("status" = 'DRAFT' OR "published_at" IS NOT NULL);

-- A re-check of something never published is a claim about nothing.
ALTER TABLE "editorial_review"
  ADD CONSTRAINT "editorial_review_checked_after_published"
  CHECK ("last_checked_at" IS NULL OR "published_at" IS NOT NULL);

-- Headed passages of prose. A child table rather than a JSON array, so that the
-- shape stays closed -- see the AC-16 note above.
CREATE TABLE "editorial_review_section" (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "review_id" UUID NOT NULL,
  "position"  SMALLINT NOT NULL,
  "heading"   VARCHAR(160) NOT NULL,
  "body"      VARCHAR(8000) NOT NULL,
  CONSTRAINT "editorial_review_section_review_id_fkey" FOREIGN KEY ("review_id")
    REFERENCES "editorial_review"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Author-chosen order, and one section per position so that "the third section"
-- names one thing. The cascade above never fires for a review, because nothing
-- deletes one (AC-7); it exists because the sections of a Draft are replaced
-- wholesale when it is rewritten.
CREATE UNIQUE INDEX "editorial_review_section_review_id_position_key"
  ON "editorial_review_section" ("review_id", "position");

-- The pros and the cons, in one table with a kind rather than two tables, so
-- that "at least one of each" -- the §13.5 rule that keeps a review from being
-- an advertisement -- is one query rather than two that can disagree.
CREATE TABLE "editorial_review_point" (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "review_id" UUID NOT NULL,
  "kind"      "EditorialPointKind" NOT NULL,
  "position"  SMALLINT NOT NULL,
  "text"      VARCHAR(280) NOT NULL,
  CONSTRAINT "editorial_review_point_review_id_fkey" FOREIGN KEY ("review_id")
    REFERENCES "editorial_review"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "editorial_review_point_review_id_kind_position_key"
  ON "editorial_review_point" ("review_id", "kind", "position");

-- The five editorial acts join the Admin audit trail.
--
-- `ADD VALUE IF NOT EXISTS` on each, because ADD VALUE is not transactional and
-- a partially applied migration must be re-runnable. This is the recipe
-- `20260905000200_admin_audit_destination` established.
--
-- **`CREATE_EDITORIAL_REVIEW` is here on the Owner's decision of 2026-09-09**,
-- taken on a defect found while writing this migration. `PRD-0009` Frozen v0.4
-- §13.8 names five acts -- "Creating, publishing, revising, re-checking and
-- withdrawing" -- while the §22.2 row added in `PRD-0006` Frozen v2.7 names
-- four, "Creating" having been dropped when that amendment was drafted. §22.2
-- also says its list is exhaustive and that an act not on it is not recorded, so
-- each of the two available readings contradicted one Frozen document. The Owner
-- chose to record all five, because under-recording is the failure §22 exists to
-- prevent while over-recording harms nobody. `PRD-0006` v2.8 restores the word
-- to §22.2.
ALTER TYPE "AdminAuditAction" ADD VALUE IF NOT EXISTS 'CREATE_EDITORIAL_REVIEW';
ALTER TYPE "AdminAuditAction" ADD VALUE IF NOT EXISTS 'PUBLISH_EDITORIAL_REVIEW';
ALTER TYPE "AdminAuditAction" ADD VALUE IF NOT EXISTS 'REVISE_EDITORIAL_REVIEW';
ALTER TYPE "AdminAuditAction" ADD VALUE IF NOT EXISTS 'RECHECK_EDITORIAL_REVIEW';
ALTER TYPE "AdminAuditAction" ADD VALUE IF NOT EXISTS 'WITHDRAW_EDITORIAL_REVIEW';
