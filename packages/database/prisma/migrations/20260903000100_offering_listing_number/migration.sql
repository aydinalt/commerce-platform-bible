-- I67. The listing number a person reads, says and types.
--
-- Every existing way to name a listing is addressed to a machine: the `id` is
-- a UUID nobody reads aloud, and the `slug` changes when a title is corrected.
-- The Owner's requirement is that a listing carries a number of its own and
-- that typing it into the search box finds it.
--
-- A sequence rather than a random code, because the number is meant to be
-- read: six or seven digits, no ambiguous letters, and no birthday-problem
-- retries at insert time. What that discloses is a rough listing volume, which
-- is what every classified site in the country already discloses by the same
-- means; a code that hid it would have to be long enough to be unreadable,
-- which is the property the column exists to avoid.
--
-- The shape is deliberately the one `BIGSERIAL` produces — an owned sequence
-- named `offering_listing_number_seq` supplying the column's default — so the
-- Prisma model can declare `@default(autoincrement())` and `db:drift` sees one
-- structure rather than two descriptions of it.
CREATE SEQUENCE "offering_listing_number_seq" AS bigint START WITH 482000;

-- The default is volatile, so PostgreSQL fills every existing row with a
-- distinct value as the column is added: listings that already exist are
-- numbered rather than left null and backfilled by a second statement that
-- could fail halfway.
ALTER TABLE "offering"
  ADD COLUMN "listing_number" BIGINT NOT NULL
  DEFAULT nextval('offering_listing_number_seq');

ALTER SEQUENCE "offering_listing_number_seq"
  OWNED BY "offering"."listing_number";

-- Unique because the number is an identity and not a label. The index is also
-- what makes the lookup a probe: a person typing a number gets one row read,
-- not a scan of the catalogue.
CREATE UNIQUE INDEX "offering_listing_number_key"
  ON "offering"("listing_number");
