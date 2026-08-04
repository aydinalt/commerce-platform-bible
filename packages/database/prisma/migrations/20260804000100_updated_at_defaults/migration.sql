-- Prisma's `@updatedAt` and `@default(uuid())` are enforced by the Prisma Client
-- only. The persistence layer writes through raw `pg` SQL, so neither `id` nor
-- `updated_at` was ever supplied and the NOT NULL constraints rejected every
-- insert. Move both responsibilities into the database so that any writer
-- (Prisma Client, raw SQL, migrations, psql) produces valid rows.

-- Primary-key defaults: mirror `@default(uuid())` at the database level.
ALTER TABLE "user_account"         ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "business"             ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "domain"               ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "category"             ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "attribute_definition" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "attribute_option"     ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "offering"             ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "offering_publication" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "audit_record"         ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "outbox_event"         ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- CreateFunction
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW."updated_at" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- AlterTable
ALTER TABLE "user_account"
  ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "business"
  ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "offering"
  ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "business_moderation_state"
  ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTrigger
CREATE TRIGGER user_account_set_updated_at
  BEFORE UPDATE ON "user_account"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- CreateTrigger
CREATE TRIGGER business_set_updated_at
  BEFORE UPDATE ON "business"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- CreateTrigger
CREATE TRIGGER offering_set_updated_at
  BEFORE UPDATE ON "offering"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- CreateTrigger
CREATE TRIGGER business_moderation_state_set_updated_at
  BEFORE UPDATE ON "business_moderation_state"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
