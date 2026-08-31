-- An Offering states what it costs, where its record came from, and which
-- product it is an instance of (PRD-0001 v4.0 §5.10, §5.11, §5.12).
--
-- **The Kind is the fact and the amount is a detail**, which is the whole
-- reason this is not a nullable `price` column. There are two different
-- absences and a single `NULL` conflates them:
--
--   ON_REQUEST  the Offering has no amount *by its nature* — a consultancy, a
--               repair, a bespoke installation. What it costs is settled after
--               the Handoff, according to what is asked for.
--   UNKNOWN     the *platform* does not know yet. A feed carried nothing, or
--               no reading has happened.
--
-- Showing a service as "price unknown" tells a person the platform has failed
-- when nothing has failed. This is the same distinction PRD-0002 §14 draws
-- between zero results and results unavailable, and PRD-0006 §14 between absent
-- and unavailable.

CREATE TYPE "PricingKind" AS ENUM ('FIXED', 'ON_REQUEST', 'UNKNOWN');
CREATE TYPE "StockState" AS ENUM ('IN_STOCK', 'OUT_OF_STOCK', 'UNKNOWN');
CREATE TYPE "OfferingSource" AS ENUM ('MANUAL', 'FEED', 'BUSINESS');

ALTER TABLE "offering"
  -- `UNKNOWN` is the honest default: it is what is true of every Offering that
  -- exists before this migration, none of which has ever been priced.
  ADD COLUMN "pricing_kind" "PricingKind" NOT NULL DEFAULT 'UNKNOWN',
  -- NUMERIC, not a float. Money in a `double` is a rounding error waiting for a
  -- large enough catalogue, and a comparison site's only product is the
  -- correctness of its ordering.
  ADD COLUMN "amount" NUMERIC(12, 2),
  ADD COLUMN "currency" CHAR(3),
  -- §5.10.3. A price without an instant is a claim about the present the
  -- platform cannot keep.
  ADD COLUMN "amount_set_at" TIMESTAMPTZ(6),
  ADD COLUMN "prior_amount" NUMERIC(12, 2),
  -- `0` is free delivery; `NULL` is "not stated". Two different answers.
  ADD COLUMN "delivery_cost" NUMERIC(12, 2),
  ADD COLUMN "stock_state" "StockState" NOT NULL DEFAULT 'UNKNOWN',
  -- Existing rows were all authored by a Business owner, which is what
  -- `BUSINESS` means. Backfilling them as anything else would be inventing a
  -- history.
  ADD COLUMN "source" "OfferingSource" NOT NULL DEFAULT 'BUSINESS',
  ADD COLUMN "product_key" VARCHAR(64);

-- A Fixed price is complete or it is not a Fixed price.
--
-- The alternative — letting `FIXED` sit beside a null amount — puts a surface
-- in the position of deciding what to show, and there is no right answer it
-- could reach. The database refusing it is the only place the question stays
-- answered.
ALTER TABLE "offering"
  ADD CONSTRAINT "offering_fixed_price_is_complete" CHECK (
    "pricing_kind" <> 'FIXED'
    OR ("amount" IS NOT NULL AND "currency" IS NOT NULL AND "amount_set_at" IS NOT NULL)
  );

-- An amount that is not shown is an amount that will one day be shown by
-- accident. `ON_REQUEST` and `UNKNOWN` carry no money at all.
ALTER TABLE "offering"
  ADD CONSTRAINT "offering_unpriced_carries_no_amount" CHECK (
    "pricing_kind" = 'FIXED'
    OR ("amount" IS NULL AND "prior_amount" IS NULL AND "amount_set_at" IS NULL)
  );

-- Money is not negative, and a delivery charge of zero is free rather than
-- absent.
ALTER TABLE "offering"
  ADD CONSTRAINT "offering_amounts_are_not_negative" CHECK (
    ("amount" IS NULL OR "amount" >= 0)
    AND ("prior_amount" IS NULL OR "prior_amount" >= 0)
    AND ("delivery_cost" IS NULL OR "delivery_cost" >= 0)
  );

-- §5.10.4. A reduction is derived from two amounts, so a prior amount that is
-- not above the current one describes no reduction and would render as `−%0`
-- or, worse, as an increase presented as a saving.
ALTER TABLE "offering"
  ADD CONSTRAINT "offering_prior_amount_is_a_reduction" CHECK (
    "prior_amount" IS NULL OR "amount" IS NULL OR "prior_amount" > "amount"
  );

-- The ordering §5.10.5 requires: the amount a person would pay, cheapest
-- first, among Offerings that have an amount at all. Partial, because the
-- Offerings without one have no position in a price ordering and indexing them
-- would only make the index larger.
CREATE INDEX "offering_price_order_idx"
  ON "offering" ("category_id", (("amount" + COALESCE("delivery_cost", 0))))
  WHERE "pricing_kind" = 'FIXED';

-- §5.12.1. The lookup that turns a key into "the other Offerings for this
-- product". Not unique: several Offerings sharing a key is the entire point.
CREATE INDEX "offering_product_key_idx"
  ON "offering" ("product_key")
  WHERE "product_key" IS NOT NULL;

-- §5.11.1. An intake selects its own rows before it updates them, so the
-- source is part of the predicate rather than a check made afterwards.
CREATE INDEX "offering_source_idx" ON "offering" ("source");
