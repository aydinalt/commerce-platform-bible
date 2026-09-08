-- I70. The complementary product a listing suggests.
--
-- The Owner's requirement is one example and a rule: *"otomotiv ile ilgili ilan
-- incelendiğinde belirttiğim yerde lastik affilte link yönlendirmesi olması
-- gerekiyor. Tüm ilan bölümlerinde ilgili bölüme uygun tamamlayıcı ürünler
-- önermesi gerekiyor."* A car needs tyres, a laptop needs a bag, a policy needs
-- roadside assistance — and every one of those is a partner link the platform
-- can carry without touching what the listing itself says.
--
-- **Curated rows rather than derived listings, and that is the decision.** The
-- platform could compute "what goes with this" from the catalogue, and it would
-- be guessing: a heading's neighbours are not its complements, and a wrong
-- suggestion beside a real product reads as the platform not knowing what it
-- sells. A row here is somebody's judgement, written down, and the surface
-- carries exactly what was written.
--
-- Keyed on the Category rather than on the Offering. The Owner's rule is about
-- *sections* — every listing under Otomotiv suggests tyres — and a per-listing
-- table would ask somebody to repeat that decision for every car on the site.
CREATE TABLE "complementary_placement" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "category_id" UUID NOT NULL,
  -- What the thing is, in the person's language: "Kış lastiği".
  "label" VARCHAR(120) NOT NULL,
  -- Whose site they will be on. Named on the control itself, because a person
  -- about to leave the platform is entitled to know where they are going
  -- before they press it rather than after.
  "partner_name" VARCHAR(160) NOT NULL,
  -- One line of why it is here, where a line helps.
  "note" VARCHAR(240),
  "destination_url" VARCHAR(2048) NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

  CONSTRAINT "complementary_placement_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "complementary_placement_category_id_fkey" FOREIGN KEY ("category_id")
    REFERENCES "category"("id") ON UPDATE CASCADE ON DELETE RESTRICT,

  -- One row per thing per Category. Two "Kış lastiği" rows under one heading is
  -- a mistake being made twice, not two suggestions.
  CONSTRAINT "complementary_placement_category_id_label_key"
    UNIQUE ("category_id", "label")
);

-- The public read: the active rows for one Category, in the order somebody
-- arranged them.
CREATE INDEX "complementary_placement_category_id_position_idx"
  ON "complementary_placement"("category_id", "position")
  WHERE "active" = true;
