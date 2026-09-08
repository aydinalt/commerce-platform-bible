-- I87. The affiliate destination's Admin acts join the central trail.
--
-- The Owner, 2026-09-05: "Affiliate hedefleri üzerindeki işlemler (inceleme,
-- doğrulama, etkinleştirme) platformun para kazandıran en kritik eylemleridir.
-- Bu eylemlerin merkezi denetim izinde (admin_audit_event) yer almaması kabul
-- edilemez. Bir eylemin kendi yerel geçmişinde tutulması, merkezi kütüğün
-- varoluş amacıyla çelişir."
--
-- Five values rather than three, and the split is the point:
--
--   * **Validation is recorded by its result.** The row carries an actor, an
--     action and a target and no free text, so `VALIDATE_DESTINATION` alone
--     would record that somebody judged the address and lose *what they
--     judged* — which is the half the Owner called the approval or refusal.
--     Two values keep the outcome in the trail instead of only in the
--     destination's own rows, which is the arrangement he rejected.
--   * **Disable is here even though he named three acts.** Enabling a handoff
--     turns the money on and disabling turns it off; a trail that records only
--     the first can say who started paying and not who stopped.
--
-- `IF NOT EXISTS` on each: adding an enum value is not transactional in the way
-- the rest of a migration is, and a half-applied retry must not fail on the
-- values it already added.
ALTER TYPE "AdminAuditAction" ADD VALUE IF NOT EXISTS 'REVIEW_DESTINATION';
ALTER TYPE "AdminAuditAction" ADD VALUE IF NOT EXISTS 'VALIDATE_DESTINATION_VALID';
ALTER TYPE "AdminAuditAction" ADD VALUE IF NOT EXISTS 'VALIDATE_DESTINATION_INVALID';
ALTER TYPE "AdminAuditAction" ADD VALUE IF NOT EXISTS 'ENABLE_DESTINATION';
ALTER TYPE "AdminAuditAction" ADD VALUE IF NOT EXISTS 'DISABLE_DESTINATION';
