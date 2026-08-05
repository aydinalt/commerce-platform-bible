-- Business creation and ownership.
--
-- `US-BUS-F01-001` AC-5 requires a new Business to begin with Business Public
-- Exposure Input `Eligible`. That input is a distinct concept from Business
-- Moderation Status: moderation is a Platform decision, exposure is the
-- Business-side input that `US-BUS-F02-001` AC-7 reads alongside final Offering
-- Public Eligibility. The M10 schema modelled neither, so the enum is added
-- here.

-- CreateEnum
CREATE TYPE "BusinessExposureInput" AS ENUM ('ELIGIBLE', 'INELIGIBLE');

-- AlterTable
ALTER TABLE "business"
  ADD COLUMN "public_exposure" "BusinessExposureInput" NOT NULL DEFAULT 'ELIGIBLE';

-- AC-8 assigns exactly one owner to each Business in V1, and AC-10 rules out
-- co-owners, transfer and delegation. A composite key alone would have allowed
-- a second owner row to appear silently, so the rule is enforced here rather
-- than left to every future caller to remember.
CREATE UNIQUE INDEX "business_owner_business_id_key" ON "business_owner"("business_id");
