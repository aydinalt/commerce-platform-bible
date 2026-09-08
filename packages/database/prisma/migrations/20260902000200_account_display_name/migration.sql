-- I62: an account gets the name its own registration form asks for.
--
-- The Owner's prototype has asked for it since the first version — the Kayıt ol
-- dialog's first field is **Adınız** — and the platform threw it away, because
-- `user_account` held an address and nothing else. That was defensible while
-- nothing public was written by a person. Product reviews are, and a review
-- signed with an email address is a privacy leak wearing a byline.
--
-- **Nullable, and it stays nullable.** Every account that exists was created
-- without one, and a `NOT NULL` here would either refuse the migration or
-- invent names for real people. A review by an account with no name is
-- presented as an anonymous review rather than as a name the platform made up.
--
-- The column is the *given* name in full; how much of it is shown is a
-- presentation rule, not a storage one — the repository publishes "Aylin K.",
-- never "Aylin Kaya", which is the shape the prototype's own Reviews component
-- shows and the least a byline can carry while still being a byline.

ALTER TABLE "user_account" ADD COLUMN "display_name" VARCHAR(80);
ALTER TABLE "pending_registration" ADD COLUMN "display_name" VARCHAR(80);
