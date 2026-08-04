-- Identity and Access baseline.
--
-- `US-IDN-F06-001` AC-1 fixes the V1 account-status vocabulary at exactly
-- Enabled and Suspended, and `US-IDN-F02-001` AC-7 forbids a Pending account
-- state. The M10 enum carried two further values with no Frozen definition, so
-- it is narrowed here and unproven registrations move to their own table.

-- Refuse to proceed rather than guess. Mapping PENDING_VERIFICATION onto
-- ENABLED would silently grant access to accounts that never proved control of
-- their email address, and CLOSED has no V1 replacement to map onto.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "user_account"
    WHERE "status"::text IN ('PENDING_VERIFICATION', 'CLOSED')
  ) THEN
    RAISE EXCEPTION
      'user_account holds rows in a status with no V1 representation; resolve them before migrating';
  END IF;
END $$;

-- Every surviving account has proven its email address by definition.
UPDATE "user_account"
SET "email_verified_at" = "created_at"
WHERE "email_verified_at" IS NULL;

-- AlterEnum
ALTER TYPE "AccountStatus" RENAME TO "AccountStatus_old";
CREATE TYPE "AccountStatus" AS ENUM ('ENABLED', 'SUSPENDED');

ALTER TABLE "user_account" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "user_account"
  ALTER COLUMN "status" TYPE "AccountStatus"
  USING (
    CASE "status"::text
      WHEN 'ACTIVE' THEN 'ENABLED'
      ELSE 'SUSPENDED'
    END
  )::"AccountStatus";
ALTER TABLE "user_account" ALTER COLUMN "status" SET DEFAULT 'ENABLED';

DROP TYPE "AccountStatus_old";

-- AlterTable
ALTER TABLE "user_account" ALTER COLUMN "email_verified_at" SET NOT NULL;

-- CreateTable
CREATE TABLE "user_credential" (
    "user_id" UUID NOT NULL,
    "password_hash" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_credential_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "pending_registration" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(320) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_session" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "issued_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),

    CONSTRAINT "user_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_throttle" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scope" VARCHAR(40) NOT NULL,
    "subject_hash" CHAR(64) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "first_seen_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blocked_until" TIMESTAMPTZ(6),

    CONSTRAINT "auth_throttle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pending_registration_email_key" ON "pending_registration"("email");
CREATE UNIQUE INDEX "pending_registration_token_hash_key" ON "pending_registration"("token_hash");
CREATE INDEX "pending_registration_expires_at_idx" ON "pending_registration"("expires_at");
CREATE UNIQUE INDEX "user_session_token_hash_key" ON "user_session"("token_hash");
CREATE INDEX "user_session_user_id_expires_at_idx" ON "user_session"("user_id", "expires_at");
CREATE UNIQUE INDEX "auth_throttle_scope_subject_hash_key" ON "auth_throttle"("scope", "subject_hash");
CREATE INDEX "auth_throttle_first_seen_at_idx" ON "auth_throttle"("first_seen_at");

-- AddForeignKey
ALTER TABLE "user_credential" ADD CONSTRAINT "user_credential_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTrigger
CREATE TRIGGER user_credential_set_updated_at
  BEFORE UPDATE ON "user_credential"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
