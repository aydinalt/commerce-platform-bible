-- Offering lifecycle vocabulary alignment with PRD-0001 §6.
--
-- The datamodel carried `DRAFT`, `PUBLISHED`, `RETIRED`. PRD-0001 defines four
-- states — Draft, Published, Hidden, Archived — where `retire` is the *action*
-- an owner takes and `Archived` is the resulting *state*. The missing Hidden
-- state matters beyond naming: `US-PLT-F08-001` AC-12 blocks Category
-- retirement while any Draft, Published or Hidden Offering remains assigned. A
-- state that cannot be named cannot be included in that rule, and would have to
-- be remembered later instead.
--
-- `retired_at` becomes `archived_at` for the same reason: it timestamps the
-- state, not the action.

ALTER TABLE "offering" DROP CONSTRAINT "offering_publication_state_consistent";

-- This partial index carries an `OfferingStatus` literal in its predicate, so
-- it cannot survive the type swap and is rebuilt below. It is expression-based
-- and therefore outside what Prisma models, which is why it is named here
-- explicitly rather than left to the datamodel.
DROP INDEX "offering_published_active_idx";

ALTER TABLE "offering" RENAME COLUMN "retired_at" TO "archived_at";

CREATE TYPE "OfferingStatus_new" AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN', 'ARCHIVED');

ALTER TABLE "offering" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "offering" ALTER COLUMN "status" TYPE "OfferingStatus_new"
  USING (
    CASE "status"::text WHEN 'RETIRED' THEN 'ARCHIVED' ELSE "status"::text END
  )::"OfferingStatus_new";
ALTER TABLE "offering" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

DROP TYPE "OfferingStatus";
ALTER TYPE "OfferingStatus_new" RENAME TO "OfferingStatus";

-- Hidden is reachable only from Published (PRD-0001 §6.3), so it keeps its
-- publication timestamp — a restore must not invent a new `Initial Published
-- At`. Archived is reachable from Draft as well as from Published and Hidden,
-- so it constrains only its own timestamp.
ALTER TABLE "offering"
  ADD CONSTRAINT "offering_publication_state_consistent" CHECK (
    ("status" = 'PUBLISHED' AND "published_at" IS NOT NULL AND "archived_at" IS NULL)
    OR ("status" = 'HIDDEN' AND "published_at" IS NOT NULL AND "archived_at" IS NULL)
    OR ("status" = 'ARCHIVED' AND "archived_at" IS NOT NULL)
    OR ("status" = 'DRAFT' AND "published_at" IS NULL AND "archived_at" IS NULL)
  );

CREATE INDEX "offering_published_active_idx"
  ON "offering" ("published_at" DESC)
  WHERE "status" = 'PUBLISHED';
