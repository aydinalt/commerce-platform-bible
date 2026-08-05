-- Admin authorization.
--
-- `US-IDN-F08-001` AC-1: authorization attaches to an existing User Account and
-- creates no separate Admin identity, so this is a relationship table keyed by
-- the account itself.
--
-- AC-3 and AC-4: grant and removal are controlled operational provisioning
-- outside the product layer, with no self-service, delegation or tiers. There is
-- deliberately no product API for this table; `scripts/admin.mjs` is the
-- operator path. `granted_by` records who authorised the decision (AC-2).

-- CreateTable
CREATE TABLE "admin_authorization" (
    "user_id" UUID NOT NULL,
    "granted_by" VARCHAR(160) NOT NULL,
    "granted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_authorization_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "admin_authorization" ADD CONSTRAINT "admin_authorization_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "user_account"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Admin context is entered explicitly, like a Business context, and is held on
-- the session so it can be re-evaluated on every request (AC-11).
ALTER TABLE "user_session"
  ADD COLUMN "admin_context" BOOLEAN NOT NULL DEFAULT false;
