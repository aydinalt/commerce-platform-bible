-- An Offering can hold visuals (`US-OFR-F05-001` AC-4, `US-DSC-F06-001` AC-4,
-- UX-0003 §8.2).
--
-- Three Frozen acceptance criteria have been half-satisfied since the surfaces
-- were built: each says to present the supplied visual *and* not to invent one
-- when it is absent, and only the second half could be true, because there was
-- nowhere for a visual to be supplied. `offeringPresentationSchema` has carried
-- `visuals: string[]` all along with the repository returning `[]` from a
-- literal.
--
-- **An address, not bytes.** `business.logo_url` has held an image this way
-- since the Business Information migration, so this is the platform's existing
-- answer rather than a second one. Storing bytes would need object storage,
-- which would need a hosting target, which does not exist.
CREATE TABLE "offering_visual" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "offering_id" UUID NOT NULL,
  -- The order the set is inspected in, and `0` is the primary visual. A
  -- Listing Card shows one; making "which one" a fact about the data rather
  -- than a rule in a query means Discovery and Presentation cannot disagree
  -- about it.
  "position" INTEGER NOT NULL,
  -- The same bound as `business.logo_url`. One limit for one kind of thing.
  "url" VARCHAR(2048) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

  CONSTRAINT "offering_visual_pkey" PRIMARY KEY ("id")
);

-- Two visuals cannot claim the same place in the order, so an Offering with two
-- primaries is unrepresentable rather than merely unexpected.
CREATE UNIQUE INDEX "offering_visual_offering_id_position_key"
  ON "offering_visual" ("offering_id", "position");

-- `CASCADE` because a visual is part of an Offering rather than a thing that
-- merely refers to one — it has no meaning once the Offering is gone, and
-- nothing else may point at it. This is the same choice
-- `offering_attribute_value` makes for the same reason.
ALTER TABLE "offering_visual"
  ADD CONSTRAINT "offering_visual_offering_id_fkey"
  FOREIGN KEY ("offering_id") REFERENCES "offering" ("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
