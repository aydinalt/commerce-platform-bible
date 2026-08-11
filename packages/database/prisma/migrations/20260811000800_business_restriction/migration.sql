-- Business Moderation and Public Exposure Input (`US-BUS-F03-001`).
--
-- AC-2 and AC-3 are a mapping, not a pair of decisions: `Unrestricted` means
-- exposure input `Eligible` and `Restricted` means `Ineligible`. Two columns
-- that a writer has to keep in step would eventually disagree, and the day they
-- did, a Restricted Business would still be publicly exposed.
--
-- So the moderation status is the source and the exposure input follows it. The
-- trigger below writes one from the other, and the guard after it refuses any
-- attempt to set them apart.

-- Existing rows first: a Business created before this migration has both, and
-- they already agree.
UPDATE "business" b
SET "public_exposure" = CASE
    WHEN m.status = 'RESTRICTED' THEN 'INELIGIBLE'::"BusinessExposureInput"
    ELSE 'ELIGIBLE'::"BusinessExposureInput"
  END
FROM "business_moderation_state" m
WHERE m.business_id = b.id;

CREATE OR REPLACE FUNCTION business_exposure_follows_moderation()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE business
  SET public_exposure = CASE
      WHEN NEW.status = 'RESTRICTED' THEN 'INELIGIBLE'::"BusinessExposureInput"
      ELSE 'ELIGIBLE'::"BusinessExposureInput"
    END
  WHERE id = NEW.business_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER business_exposure_follows_moderation
AFTER INSERT OR UPDATE OF status ON "business_moderation_state"
FOR EACH ROW EXECUTE FUNCTION business_exposure_follows_moderation();

-- The guard. Exposure input is a consequence, so a write that contradicts the
-- moderation status is refused rather than quietly accepted — including one
-- issued by a future feature that has forgotten this mapping exists.
CREATE OR REPLACE FUNCTION business_exposure_matches_moderation()
RETURNS TRIGGER AS $$
DECLARE
  moderation TEXT;
BEGIN
  SELECT coalesce(m.status::text, 'UNRESTRICTED') INTO moderation
  FROM business b
  LEFT JOIN business_moderation_state m ON m.business_id = b.id
  WHERE b.id = NEW.id;

  IF (moderation = 'RESTRICTED') <> (NEW.public_exposure = 'INELIGIBLE') THEN
    RAISE EXCEPTION 'EXPOSURE_CONTRADICTS_MODERATION'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER business_exposure_matches_moderation
BEFORE UPDATE OF public_exposure ON "business"
FOR EACH ROW EXECUTE FUNCTION business_exposure_matches_moderation();
