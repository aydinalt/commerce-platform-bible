-- I57: the eleven sectors the platform actually sells into become Domains.
--
-- `20260810000200_category_management` seeded three Domains and said so plainly:
-- they were the V1 set, and the enum in the contract agreed with them. I53
-- deleted that enum — a Domain became a governed record whose set is open — and
-- this migration is the first use of that opening.
--
-- **Three of the eleven are the three that already exist.** Their stable keys
-- are unchanged, because a stable key is what everything else references and
-- renaming one would orphan every Category, Discovery Start and projection that
-- names it. What changes is the display name and the slug, neither of which
-- anything reads back: the platform is Turkish (I27–I29) and "Technology"
-- beside "Sigorta Hizmetleri" would be the bilingual-by-accident state those
-- increments existed to end.
--
-- The mapping is meaning-for-meaning rather than word-for-word:
--   MOBILITY     → Otomotiv ve Araç Kiralama   (narrowed; nothing else used it)
--   REAL_ESTATE  → Gayrimenkul ve Emlak
--   TECHNOLOGY   → Teknoloji ve Tüketici Elektroniği
--
-- **`V1_SCOPE.md` §8 still says "V1 launches with three domains only" and is
-- Frozen.** PRD-0001 v4.0 §E says the set is open, and `DOMAIN_SET_OPEN_DECISION`
-- resolved that conflict without mentioning V1_SCOPE. This migration makes the
-- unreconciled document visible rather than quietly outvoting it: the Owner's
-- affiliate analysis names eleven sectors, and V1_SCOPE §8 needs a revision.

UPDATE "domain" SET "slug" = 'otomotiv-arac-kiralama',
  "name" = 'Otomotiv ve Araç Kiralama' WHERE "stable_key" = 'MOBILITY';
UPDATE "domain" SET "slug" = 'gayrimenkul-emlak',
  "name" = 'Gayrimenkul ve Emlak' WHERE "stable_key" = 'REAL_ESTATE';
UPDATE "domain" SET "slug" = 'teknoloji-elektronik',
  "name" = 'Teknoloji ve Tüketici Elektroniği' WHERE "stable_key" = 'TECHNOLOGY';

INSERT INTO "domain" ("id", "stable_key", "slug", "name", "active")
VALUES
  (gen_random_uuid(), 'YAZILIM_YAPAY_ZEKA', 'yazilim-yapay-zeka',
   'Yazılım, Yapay Zeka ve Dijital Araçlar', true),
  (gen_random_uuid(), 'FINANS_KRIPTO', 'finans-kripto-yatirim',
   'Finans, Kripto ve Yatırım', true),
  (gen_random_uuid(), 'SIGORTA', 'sigorta', 'Sigorta Hizmetleri', true),
  (gen_random_uuid(), 'EGITIM', 'egitim-gelisim',
   'Eğitim ve Çevrimiçi Gelişim', true),
  (gen_random_uuid(), 'SAGLIK_KOZMETIK', 'saglik-kozmetik-bakim',
   'Sağlık, Kozmetik ve Kişisel Bakım', true),
  (gen_random_uuid(), 'OYUN_ESPOR', 'oyun-espor-eglence',
   'Oyun, E-Spor ve Dijital Eğlence', true),
  (gen_random_uuid(), 'EV_BAHCE', 'ev-bahce-akilli-yasam',
   'Ev, Bahçe ve Akıllı Yaşam', true),
  (gen_random_uuid(), 'SEYAHAT', 'seyahat-turizm', 'Seyahat ve Turizm', true)
ON CONFLICT ("stable_key") DO NOTHING;
