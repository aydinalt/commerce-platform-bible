-- I64: a person can keep something, and what they keep is a product.
--
-- The Owner's prototype has had a heart on every card and a **Favorilerim**
-- entry in the header since the first version, and the platform had nowhere to
-- put either. This is the table.
--
-- **Keyed on the product group, exactly as `product_review` is**, and for the
-- same reason: `coalesce(product_key, id::text)` is PRD-0001 v4.0 §5.12's own
-- definition of a product, and a person who kept a phone kept the phone rather
-- than one shop's listing of it. Two consequences worth stating, because both
-- are the behaviour somebody would otherwise report as a bug:
--
-- - Keeping it from the cheapest seller and returning through a different one
--   shows it already kept. It is one thing, so it is one heart.
-- - A seller withdrawing their listing does not delete a favourite. The person
--   kept the product; the catalogue lost a way to buy it. The list shows what
--   is still reachable and the row survives, so a listing published tomorrow
--   brings it back rather than requiring the person to find it again.
--
-- `offering_id` is provenance, the same as on a review: which listing they were
-- looking at when they pressed it. Never what the favourite is read back by.
--
-- One row per person per product: pressing the heart twice is not two
-- favourites, and the unique index makes that true under concurrency rather
-- than only in the happy path.

CREATE TABLE "favourite" (
  "product_group_key" VARCHAR(64) NOT NULL,
  "user_id"           UUID NOT NULL,
  "offering_id"       UUID NOT NULL,
  "created_at"        TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  CONSTRAINT "favourite_pkey" PRIMARY KEY ("user_id", "product_group_key"),
  CONSTRAINT "favourite_user_id_fkey" FOREIGN KEY ("user_id")
    REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "favourite_offering_id_fkey" FOREIGN KEY ("offering_id")
    REFERENCES "offering"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Every read is "what has this person kept", newest first. The primary key
-- serves the membership test; this serves the list.
CREATE INDEX "favourite_user_id_created_at_idx"
  ON "favourite" ("user_id", "created_at" DESC);
