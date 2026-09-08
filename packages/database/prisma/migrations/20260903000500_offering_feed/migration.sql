-- I76. Partner catalogues, taken from a feed rather than scraped.
--
-- The Owner's requirement names the method as well as the outcome: "Ürün
-- verilerinin partner sitelerinden ham çekimi (scraping) yerine, Affiliate
-- XML/JSON feed'leri üzerinden alınması." A feed is a document a partner
-- publishes for this purpose and maintains; a scrape is a reading of a page
-- they published for people, and it breaks silently every time they redesign
-- it.
--
-- `PRD-0001-offering.md` §5.11 already governs what an intake may do, and it
-- has since v3.1: an intake **may create and update Offerings whose Source is
-- Feed, and may not modify any other.** §135 leaves the mechanism to its own
-- documents. Nothing below asks for a new product decision, and `offering.source`
-- already exists to carry the answer.

CREATE TYPE "OfferingFeedFormat" AS ENUM ('XML', 'JSON');

-- Two outcomes and no third. A run either read the whole document or it did
-- not; there is no "partly" — a partial import loses half a partner's
-- catalogue, and the missing half is indistinguishable from products that were
-- withdrawn, so the platform would quietly stop showing them and nobody would
-- know which.
CREATE TYPE "OfferingFeedRunOutcome" AS ENUM ('SUCCEEDED', 'FAILED');

CREATE TABLE "offering_feed" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),

  -- Whose catalogue this is. Every Offering the feed creates belongs to this
  -- Business, which is what makes a Feed Offering moderatable exactly like any
  -- other (§5.11.2): there is an owner to restrict.
  "business_id" UUID NOT NULL,

  /*
   * Where the feed's Offerings are filed.
   *
   * One Category for the whole feed, deliberately. A per-product Category would
   * mean trusting a partner's own taxonomy to choose a heading in this
   * platform's, and a wrong heading is worse than a coarse one: it puts a
   * product where nobody browsing for it will look, and no test can see it.
   * `map_category_key` records what the partner called it so that a future
   * mapping has something to work from.
   */
  "category_id" UUID NOT NULL,

  "name" VARCHAR(160) NOT NULL,
  "document_url" VARCHAR(2048) NOT NULL,
  "format" "OfferingFeedFormat" NOT NULL,

  -- Where the products are inside the document, when the guess is wrong. Empty
  -- means "work it out", which is right for most feeds and wrong for enough of
  -- them to need an override.
  "item_path" VARCHAR(240),

  /*
   * The mapping, as **named columns rather than a document**.
   *
   * A `jsonb` blob with a form in front of it would take a field nobody
   * decided to support, and the twelfth time somebody needed one they would add
   * it to the form instead of to this file. Twelve columns is more typing and
   * exactly the right amount of friction: each is a thing the platform
   * understands, and a thirteenth needs a migration.
   *
   * Only two are NOT NULL. An identifier that survives the next sync, because
   * without one every sync is a fresh import and the catalogue doubles every
   * hour, and a title, because a listing with no name is not a listing.
   *
   * (No semicolon in this comment on purpose: `i14` splits these files on one
   * to find each statement, and a comment that ended a CREATE TABLE early
   * would hide the table's foreign keys from the check that exists to find
   * them.)
   */
  "map_external_id" VARCHAR(240) NOT NULL,
  "map_title" VARCHAR(240) NOT NULL,
  "map_summary" VARCHAR(240),
  "map_price" VARCHAR(240),
  "map_prior_price" VARCHAR(240),
  "map_delivery_cost" VARCHAR(240),
  "map_currency" VARCHAR(240),
  "map_stock" VARCHAR(240),
  "map_url" VARCHAR(240),
  "map_image_url" VARCHAR(240),
  "map_product_key" VARCHAR(240),
  "map_category_key" VARCHAR(240),

  -- Deactivated rather than deleted, like a complementary placement: a feed is
  -- an arrangement with a partner, and a row that can be switched back on is
  -- how "we paused this" is said.
  "active" BOOLEAN NOT NULL DEFAULT true,

  "created_by" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

  CONSTRAINT "offering_feed_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "offering_feed_business_id_name_key" UNIQUE ("business_id", "name"),
  CONSTRAINT "offering_feed_business_id_fkey" FOREIGN KEY ("business_id")
    REFERENCES "business"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "offering_feed_category_id_fkey" FOREIGN KEY ("category_id")
    REFERENCES "category"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "offering_feed_created_by_fkey" FOREIGN KEY ("created_by")
    REFERENCES "user_account"("id") ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX "offering_feed_active_idx" ON "offering_feed"("active");

-- Every sync, whether it worked.
--
-- **A failed run is the point of this table**, not an exception to it. The
-- Owner asked for the failures on the dashboard — "Feed senkronizasyon hataları"
-- — and a log that only recorded successes would answer "when did this last
-- work" and never "why did it stop".
CREATE TABLE "offering_feed_run" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "feed_id" UUID NOT NULL,
  "outcome" "OfferingFeedRunOutcome" NOT NULL,
  "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "finished_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

  -- What the document held and what became of it. `read` minus the other three
  -- is never silently lost: a row is created, updated, rejected, or unchanged.
  "read_count" INTEGER NOT NULL DEFAULT 0,
  "created_count" INTEGER NOT NULL DEFAULT 0,
  "updated_count" INTEGER NOT NULL DEFAULT 0,
  "rejected_count" INTEGER NOT NULL DEFAULT 0,

  -- Products the platform holds from this feed that the document no longer
  -- offers. Counted and **not acted on**: retiring a listing is a lifecycle
  -- decision, and one truncated document from a partner would otherwise delete
  -- a catalogue.
  "missing_count" INTEGER NOT NULL DEFAULT 0,

  -- Why it failed, in the words a person can act on. Null on success.
  "message" VARCHAR(2000),

  CONSTRAINT "offering_feed_run_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "offering_feed_run_feed_id_fkey" FOREIGN KEY ("feed_id")
    REFERENCES "offering_feed"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  -- A failure says why and a success does not claim one. The same evidence
  -- shape `moderation_case` and `listing_report` use.
  CONSTRAINT "offering_feed_run_failure_evidence" CHECK (
    ("outcome" = 'FAILED') = ("message" IS NOT NULL)
  )
);

-- The dashboard reads the newest run per feed, and the newest failures.
CREATE INDEX "offering_feed_run_feed_id_started_at_idx"
  ON "offering_feed_run"("feed_id", "started_at" DESC);
CREATE INDEX "offering_feed_run_outcome_started_at_idx"
  ON "offering_feed_run"("outcome", "started_at" DESC);

-- Which rows a run refused, and why.
--
-- Bounded per run by the intake rather than by the schema: a feed that rejects
-- forty thousand rows has one problem, not forty thousand, and storing them all
-- would make the run that reports the problem the run that fills the disk.
CREATE TABLE "offering_feed_rejection" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "run_id" UUID NOT NULL,
  "external_id" VARCHAR(160),
  "reason" VARCHAR(400) NOT NULL,

  CONSTRAINT "offering_feed_rejection_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "offering_feed_rejection_run_id_fkey" FOREIGN KEY ("run_id")
    REFERENCES "offering_feed_run"("id") ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX "offering_feed_rejection_run_id_idx"
  ON "offering_feed_rejection"("run_id");

-- What the platform holds from a feed, and under which name the partner knows
-- it.
--
-- **This is the row that keeps §5.11.1 true.** An intake finds what to update
-- through here, so it can only ever reach an Offering it created. An Offering a
-- Business owner authored, or an Admin corrected, has no row here and is
-- therefore unreachable — which is a stronger guarantee than checking
-- `source = 'FEED'` before every write, because it cannot be forgotten at one
-- call site.
CREATE TABLE "offering_feed_item" (
  "feed_id" UUID NOT NULL,
  "external_id" VARCHAR(160) NOT NULL,
  "offering_id" UUID NOT NULL,
  "first_seen_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "last_seen_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  -- Set when a successful run did not find this product, cleared when it comes
  -- back. Recorded, not acted on.
  "missing_since" TIMESTAMPTZ(6),

  CONSTRAINT "offering_feed_item_pkey" PRIMARY KEY ("feed_id", "external_id"),
  -- One Offering belongs to at most one feed item. Two feeds claiming one
  -- listing would make "which document is authoritative" a race.
  CONSTRAINT "offering_feed_item_offering_id_key" UNIQUE ("offering_id"),
  CONSTRAINT "offering_feed_item_feed_id_fkey" FOREIGN KEY ("feed_id")
    REFERENCES "offering_feed"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "offering_feed_item_offering_id_fkey" FOREIGN KEY ("offering_id")
    REFERENCES "offering"("id") ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX "offering_feed_item_missing_since_idx"
  ON "offering_feed_item"("missing_since")
  WHERE "missing_since" IS NOT NULL;
