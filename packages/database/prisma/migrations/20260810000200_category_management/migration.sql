-- Category and Domain management (`US-PLT-F08-001`).
--
-- Categories were reachable only by direct SQL, exactly as Businesses were
-- before `US-BUS-F01-001`. This migration does not add an endpoint; it adds the
-- invariants the endpoints are allowed to rely on, so that a hierarchy rule
-- cannot be broken by anything that reaches the table — including a future code
-- path nobody has written yet.

-- The three V1 Domains are fixed by PRD-0001 and by AC-1. They are data rather
-- than an enum because Categories reference them, but they are seeded here
-- rather than created through an endpoint: no Story gives anyone authority to
-- invent a fourth V1 Domain, and AC-15 rules out cross-Domain migration.
INSERT INTO "domain" ("id", "stable_key", "slug", "name", "active")
VALUES
  (gen_random_uuid(), 'MOBILITY', 'mobility', 'Mobility', true),
  (gen_random_uuid(), 'REAL_ESTATE', 'real-estate', 'Real Estate', true),
  (gen_random_uuid(), 'TECHNOLOGY', 'technology', 'Technology', true)
ON CONFLICT ("stable_key") DO NOTHING;

-- AC-7 and AC-10: a child inherits its root's Domain, and reparenting across
-- Domains is unavailable.
--
-- Rather than checking the parent's Domain in application code, the parent
-- reference itself carries the Domain: a child may only point at a parent that
-- already agrees with it. Cross-Domain parenting then fails as a foreign key
-- violation, and there is no code path — present or future — where the check
-- can be forgotten.
--
-- The same key gives AC-11 its teeth. A root whose Domain changed would orphan
-- every child's composite reference, so a used root's Domain cannot move even
-- if something tried to move it.
ALTER TABLE "category" ADD CONSTRAINT "category_id_domain_id_key"
  UNIQUE ("id", "domain_id");

-- The single-column parent key is replaced rather than joined: two foreign keys
-- over the same column would be one constraint too many to keep in agreement.
ALTER TABLE "category" DROP CONSTRAINT "category_parent_id_fkey";

-- `ON UPDATE RESTRICT`, not the inherited `CASCADE`. Under `CASCADE` a change
-- to a root's Domain quietly rewrote every descendant's Domain with it — a
-- silent cross-Domain migration of an entire subtree, which AC-15 says must not
-- exist. Under `RESTRICT` the same statement fails while any child remains,
-- which is precisely AC-11.
ALTER TABLE "category" ADD CONSTRAINT "category_parent_id_domain_id_fkey"
  FOREIGN KEY ("parent_id", "domain_id")
  REFERENCES "category" ("id", "domain_id")
  ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AC-5. A cycle of length one is a Category parented to itself; a longer cycle
-- — A under B under A — satisfies every declarative constraint while still
-- making a Category its own ancestor. Walking the ancestry is the only way to
-- see either, so one mechanism owns the whole rule rather than a CHECK covering
-- the shallow case and a trigger covering the rest.
--
-- This raises `23514` with a constraint name so the failure arrives in the same
-- shape as any other violated constraint. The interface layer already
-- translates driver constraint failures into stable error codes and does not
-- need to learn a second mechanism for this one.
CREATE OR REPLACE FUNCTION "category_reject_ancestry_cycle"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  ancestor UUID := NEW."parent_id";
  guard INT := 0;
BEGIN
  WHILE ancestor IS NOT NULL LOOP
    IF ancestor = NEW."id" THEN
      RAISE EXCEPTION 'Category % would become its own ancestor', NEW."id"
        USING ERRCODE = '23514', CONSTRAINT = 'category_no_ancestry_cycle';
    END IF;
    guard := guard + 1;
    IF guard > 64 THEN
      RAISE EXCEPTION 'Category ancestry exceeded the supported depth'
        USING ERRCODE = '23514', CONSTRAINT = 'category_no_ancestry_cycle';
    END IF;
    SELECT "parent_id" INTO ancestor FROM "category" WHERE "id" = ancestor;
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER "category_ancestry_cycle_guard"
  BEFORE INSERT OR UPDATE OF "parent_id" ON "category"
  FOR EACH ROW
  WHEN (NEW."parent_id" IS NOT NULL)
  EXECUTE FUNCTION "category_reject_ancestry_cycle"();
