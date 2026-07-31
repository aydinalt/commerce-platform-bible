CREATE TYPE "BusinessModerationStatus" AS ENUM ('UNRESTRICTED', 'RESTRICTED');

CREATE TABLE "business_moderation_state" (
    "business_id" UUID NOT NULL,
    "status" "BusinessModerationStatus" NOT NULL DEFAULT 'UNRESTRICTED',
    "reason_code" VARCHAR(100),
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "business_moderation_state_pkey" PRIMARY KEY ("business_id")
);

ALTER TABLE "business_moderation_state"
ADD CONSTRAINT "business_moderation_state_business_id_fkey"
FOREIGN KEY ("business_id") REFERENCES "business"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
