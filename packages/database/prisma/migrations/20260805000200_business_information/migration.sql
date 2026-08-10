-- Business information (`US-BUS-F02-001`).
--
-- Two groups of fields, and the split is the point of the Story:
--
--   * the public Business identity set — display name, logo, short description
--     — which AC-6 fixes at exactly those three;
--   * protected Direct Contact channels — telephone, email, external contact
--     URL — which AC-9 keeps away from Guests entirely and AC-10 releases only
--     through PRD-0004 to an Enabled authenticated User.
--
-- They are stored on one row but must never be served by one code path, so the
-- comment lives here as well as in the repository.

-- AlterTable: public Business identity set
ALTER TABLE "business"
  ADD COLUMN "logo_url" VARCHAR(2048),
  ADD COLUMN "short_description" VARCHAR(500);

-- AlterTable: protected Direct Contact channels
ALTER TABLE "business"
  ADD COLUMN "contact_telephone" VARCHAR(40),
  ADD COLUMN "contact_email" VARCHAR(320),
  ADD COLUMN "contact_url" VARCHAR(2048);
