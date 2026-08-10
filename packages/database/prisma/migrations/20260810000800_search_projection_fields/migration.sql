-- Searchable fields as their own columns (`US-DSC-F02-001`).
--
-- The projection already carried a single `searchable_text` blob, which is
-- enough to decide whether an Offering matches but not *what* matched. PRD-0002
-- §12.2 ranks four different relationships — title, Category path, Business
-- display name, description and Attribute values — and AC-7 requires the
-- highest applicable one to be identified. A blob cannot answer that question.
--
-- So the fields are projected separately and the blob is kept as their
-- concatenation, which is what the existing full-text index covers.

ALTER TABLE "offering_search_projection"
  -- The active Category path display names, not just the leaf: PRD-0002 §9.1
  -- lets a person recognise an Offering by where it sits in the hierarchy.
  ADD COLUMN "category_path" TEXT NOT NULL DEFAULT '',
  -- Attribute *display* values — the option label a person would read, not the
  -- identifier `filter_values` holds for filtering.
  ADD COLUMN "attribute_text" TEXT NOT NULL DEFAULT '';

ALTER TABLE "offering_search_projection"
  ALTER COLUMN "category_path" DROP DEFAULT,
  ALTER COLUMN "attribute_text" DROP DEFAULT;

-- One index per relationship PRD-0002 §12.2 names, because the level is decided
-- by asking each field separately.
CREATE INDEX "offering_search_projection_title_fts_idx"
  ON "offering_search_projection"
  USING GIN (to_tsvector('simple', "title"));

CREATE INDEX "offering_search_projection_category_path_fts_idx"
  ON "offering_search_projection"
  USING GIN (to_tsvector('simple', "category_path"));

CREATE INDEX "offering_search_projection_business_name_fts_idx"
  ON "offering_search_projection"
  USING GIN (to_tsvector('simple', "business_name"));
