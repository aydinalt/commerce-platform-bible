-- I62: the product carries a score, and the score belongs to the product.
--
-- The Owner's rule, in his words: *"puanlama ürüne ait olacak satıcıya değil"*
-- — the rating belongs to the product, not to the seller. The contracts have
-- said the opposite half of this since the beginning and still do: PRD-0001
-- v4.0 §4 puts **seller** score out of scope, and `sellerOfferSchema` carries
-- no rating. Nothing here changes that. What arrives is the other thing: a
-- score for the thing being sold, written by the people who bought it.
--
-- **Why `product_group_key` and not `offering_id`.** §5.12 already defines what
-- a product is on this platform — the set of Offerings sharing a `product_key`,
-- and `coalesce(product_key, id::text)` for one nobody has matched. The
-- Discovery and presentation queries have grouped on exactly that expression
-- since I58. A review keyed on `offering_id` would give five sellers of one
-- phone five separate scores, and the card — which shows the cheapest seller —
-- would show that seller's score under a title that names the product. Keying
-- on the group is the only shape that answers the rule as written.
--
-- `offering_id` is kept as provenance: which listing the person was reading
-- when they wrote. It is never what the score is read back by, which is why a
-- withdrawn listing does not take a product's score with it.
--
-- One row per person per product. A second opinion replaces the first
-- (`on conflict … do update` in the repository), so an average stays an average
-- of people rather than of submissions.

CREATE TABLE "product_review" (
  "id"                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_group_key" VARCHAR(64) NOT NULL,
  "offering_id"       UUID NOT NULL,
  "user_id"           UUID NOT NULL,
  "rating"            SMALLINT NOT NULL,
  "body"              VARCHAR(2000),
  "created_at"        TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at"        TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  CONSTRAINT "product_review_offering_id_fkey" FOREIGN KEY ("offering_id")
    REFERENCES "offering"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "product_review_user_id_fkey" FOREIGN KEY ("user_id")
    REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Whole stars only. Half stars are an average, never a submission; the
-- constraint says so in the one place that cannot be forgotten.
ALTER TABLE "product_review"
  ADD CONSTRAINT "product_review_rating_range" CHECK ("rating" BETWEEN 1 AND 5);

CREATE UNIQUE INDEX "product_review_product_group_key_user_id_key"
  ON "product_review" ("product_group_key", "user_id");

-- Every read is "the reviews of this product": the aggregate on a card, the
-- list on a presentation, the rating floor in Discovery. One index serves all
-- three because they all start from the group key.
CREATE INDEX "product_review_product_group_key_idx"
  ON "product_review" ("product_group_key");
