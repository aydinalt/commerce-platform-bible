-- I69. "Hata Bildir" — a report about a listing, from the person reading it.
--
-- The platform had one way to say something is wrong with a listing and it was
-- an Admin opening a Moderation Case. That is a governed act by a person with
-- authority (`US-PLT-F06-001`), and it is the wrong shape for what the Owner
-- asked for: a reader who can see that a price is stale has no way to say so,
-- and the platform loses the only signal it can get about a fact only a partner
-- can correct.
--
-- A report is **not** a Moderation Case and is deliberately a separate table.
-- A case is opened by an Admin, carries a lifecycle other documents govern, and
-- concerns a Business, an Offering or an account. A report is an unverified
-- claim by anybody, about one listing, and its whole content is "somebody says
-- this". Writing reports into `moderation_case` would have made the queue an
-- Admin reviews indistinguishable from a queue anybody can fill.
CREATE TYPE "ListingReportReason" AS ENUM (
  'PRICE_WRONG',
  'STOCK_WRONG',
  'WRONG_CATEGORY',
  'MISLEADING_INFORMATION',
  'LINK_BROKEN'
);

-- Three states and no more. A report is open until somebody has looked at it,
-- and then it is either something the platform acted on or something it did
-- not — recorded, because a dismissed report is evidence too: five dismissed
-- reports about one listing is a different fact from one.
CREATE TYPE "ListingReportStatus" AS ENUM ('OPEN', 'ACCEPTED', 'DISMISSED');

CREATE TABLE "listing_report" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "offering_id" UUID NOT NULL,
  "reason" "ListingReportReason" NOT NULL,
  -- What the person added in their own words, if anything. Bounded because a
  -- report is a sentence, not a document.
  "note" VARCHAR(600),
  -- Null for a Guest, and that is the ordinary case: the Owner's requirement is
  -- to collect the report, and demanding an account first would collect fewer
  -- of them from exactly the people who noticed. It is recorded when present so
  -- that a pattern of reports from one account is visible.
  "reporter_user_id" UUID,
  "status" "ListingReportStatus" NOT NULL DEFAULT 'OPEN',
  "submitted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "reviewed_by" UUID,
  "reviewed_at" TIMESTAMPTZ(6),

  CONSTRAINT "listing_report_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "listing_report_offering_id_fkey" FOREIGN KEY ("offering_id")
    REFERENCES "offering"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "listing_report_reporter_user_id_fkey" FOREIGN KEY ("reporter_user_id")
    REFERENCES "user_account"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "listing_report_reviewed_by_fkey" FOREIGN KEY ("reviewed_by")
    REFERENCES "user_account"("id") ON UPDATE CASCADE ON DELETE RESTRICT,

  -- The same shape `moderation_case_closure_evidence` uses: a report that is no
  -- longer open must say who looked and when, and one that is open must not
  -- claim either.
  CONSTRAINT "listing_report_review_evidence" CHECK (
    ("status" <> 'OPEN') = ("reviewed_by" IS NOT NULL AND "reviewed_at" IS NOT NULL)
  )
);

-- The queue an Admin reads: open reports, oldest first.
CREATE INDEX "listing_report_status_submitted_at_idx"
  ON "listing_report"("status", "submitted_at");

-- Every report about one listing, which is what makes a pattern readable.
CREATE INDEX "listing_report_offering_id_idx"
  ON "listing_report"("offering_id");
