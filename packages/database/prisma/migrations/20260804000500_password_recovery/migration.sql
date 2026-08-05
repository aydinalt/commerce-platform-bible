-- Password recovery.
--
-- Same shape as registration delivery: the record and its outbox event are
-- written together, and the proof token is minted by the worker at delivery so
-- no replayable secret is ever stored.
--
-- One live reset per account. A repeated request replaces the previous one, so
-- an abandoned link stops working.

-- CreateTable
CREATE TABLE "password_reset" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" CHAR(64),
    "dispatched_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_user_id_key" ON "password_reset"("user_id");
CREATE UNIQUE INDEX "password_reset_token_hash_key" ON "password_reset"("token_hash");
CREATE INDEX "password_reset_expires_at_idx" ON "password_reset"("expires_at");

-- AddForeignKey
ALTER TABLE "password_reset" ADD CONSTRAINT "password_reset_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "user_account"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
