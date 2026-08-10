-- Discovery Start (`US-DSC-F03-001`, PRD-0002 §5.10).
--
-- A bounded occurrence, not a session: it records that a person began looking,
-- once per path. PRD-0006 Basic Analytics is its only consumer and does not
-- exist yet, but the occurrence has to be recorded when it happens — it cannot
-- be reconstructed afterwards from anything else the system stores.

CREATE TYPE "DiscoveryPathKind" AS ENUM ('BROWSE', 'SEARCH');

CREATE TABLE "discovery_start" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    -- The path a person is following. Server-issued and opaque: it identifies a
    -- continuous act of looking, and nothing about who is doing it.
    "path_id" UUID NOT NULL,
    "kind" "DiscoveryPathKind" NOT NULL,
    -- A Browse Start inherits the selected Category's Domain (AC-2). A Search
    -- Start has none until one active leaf Category is in the criteria
    -- (PRD-0002 §5.10), and §5.10 says the absence must not block counting.
    "domain_id" UUID,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discovery_start_pkey" PRIMARY KEY ("id")
);

-- AC-8. One Start per path, said once: a descendant selection inside the same
-- path finds this row already there and adds nothing.
CREATE UNIQUE INDEX "discovery_start_path_id_key"
  ON "discovery_start" ("path_id");

CREATE INDEX "discovery_start_kind_started_at_idx"
  ON "discovery_start" ("kind", "started_at");

ALTER TABLE "discovery_start"
  ADD CONSTRAINT "discovery_start_domain_id_fkey"
  FOREIGN KEY ("domain_id") REFERENCES "domain" ("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AC-2 read strictly: a Browse Start always inherits a Domain, because it
-- always begins from a Category and every Category has one.
ALTER TABLE "discovery_start"
  ADD CONSTRAINT "discovery_start_browse_has_domain"
  CHECK ("kind" <> 'BROWSE' OR "domain_id" IS NOT NULL);
