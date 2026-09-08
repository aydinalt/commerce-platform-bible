-- I75. The advertising placement settings PRD-0006 §20.4 has always named.
--
-- §20 was approved in v2.2 and extended in v2.3, and **none of its settings
-- existed**: the platform had a complementary-product region it served itself
-- and no way to say who the external network is, which slot goes where,
-- whether advertising runs at all, or which Categories must stay clean.
--
-- **A named row, not a settings store.** §12 refuses a standalone generic
-- Platform Configuration capability, and a key-value table with an Admin form
-- in front of it is exactly that — the shape in which a new capability arrives
-- without anybody deciding to add one. So this table has one row and named
-- columns, and adding a setting means a migration and a decision, which is
-- the point.
CREATE TABLE "advertising_setting" (
  -- One row, enforced. `id` is fixed rather than generated so a second row
  -- cannot exist to disagree with the first.
  "id" BOOLEAN NOT NULL DEFAULT true,

  /*
   * The external network's publisher identifier. Empty by default and never
   * invented: §20.4 makes advertising absent until somebody sets this, and an
   * empty publisher identifier means no network advertising anywhere,
   * whatever the unit identifiers say.
   */
  "publisher_id" VARCHAR(64),

  -- One unit per permitted region (§20.1). A region with no unit shows
  -- nothing, which is a configuration state rather than a fault.
  --
  -- (Written without a semicolon on purpose: `i14` reads these files by
  -- splitting statements on one, and a comment that ended a CREATE TABLE early
  -- hid this table's foreign key from the check that exists to find it.)
  "unit_results" VARCHAR(64),
  "unit_presentation" VARCHAR(64),
  "unit_category" VARCHAR(64),

  /*
   * The master switch (§20.4). `false` suppresses **everything** immediately,
   * including the platform's own complementary region — the whole value of a
   * kill switch is that it does not need somebody to remember what it covers.
   */
  "enabled" BOOLEAN NOT NULL DEFAULT false,

  "updated_by" UUID,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

  CONSTRAINT "advertising_setting_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "advertising_setting_single_row" CHECK ("id" = true),
  CONSTRAINT "advertising_setting_updated_by_fkey" FOREIGN KEY ("updated_by")
    REFERENCES "user_account"("id") ON UPDATE CASCADE ON DELETE RESTRICT
);

-- The row exists from the start, switched off and holding nothing. A surface
-- reading settings finds an answer rather than an absence, and the answer is
-- "no advertising", which is what §20.4 requires of an unconfigured platform.
INSERT INTO "advertising_setting" ("id") VALUES (true);

-- §20.4's Category exclusion list: a Category marked ad-free, and every
-- Category beneath it.
CREATE TABLE "advertising_category_exclusion" (
  "category_id" UUID NOT NULL,
  "excluded_by" UUID,
  "excluded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

  CONSTRAINT "advertising_category_exclusion_pkey" PRIMARY KEY ("category_id"),
  CONSTRAINT "advertising_category_exclusion_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "category"("id")
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "advertising_category_exclusion_excluded_by_fkey"
    FOREIGN KEY ("excluded_by") REFERENCES "user_account"("id")
    ON UPDATE CASCADE ON DELETE RESTRICT
);
