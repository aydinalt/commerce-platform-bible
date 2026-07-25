-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "BusinessStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED');

-- CreateEnum
CREATE TYPE "OfferingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'RETIRED');

-- CreateEnum
CREATE TYPE "AttributeValueKind" AS ENUM ('TEXT', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'DATE', 'OPTION');

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('PENDING', 'ELIGIBLE', 'INELIGIBLE', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "user_account" (
    "id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "email_verified_at" TIMESTAMPTZ(6),
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "status" "BusinessStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_owner" (
    "business_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_owner_pkey" PRIMARY KEY ("business_id","user_id")
);

-- CreateTable
CREATE TABLE "domain" (
    "id" UUID NOT NULL,
    "stable_key" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" UUID NOT NULL,
    "domain_id" UUID NOT NULL,
    "parent_id" UUID,
    "stable_key" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribute_definition" (
    "id" UUID NOT NULL,
    "stable_key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "value_kind" "AttributeValueKind" NOT NULL,
    "searchable" BOOLEAN NOT NULL DEFAULT false,
    "filterable" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "attribute_definition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribute_option" (
    "id" UUID NOT NULL,
    "attribute_definition_id" UUID NOT NULL,
    "stable_key" VARCHAR(100) NOT NULL,
    "label" VARCHAR(160) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "attribute_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_attribute" (
    "category_id" UUID NOT NULL,
    "attribute_definition_id" UUID NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "category_attribute_pkey" PRIMARY KEY ("category_id","attribute_definition_id")
);

-- CreateTable
CREATE TABLE "offering" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "summary" VARCHAR(1000),
    "status" "OfferingStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "published_at" TIMESTAMPTZ(6),
    "retired_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "offering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offering_attribute_value" (
    "offering_id" UUID NOT NULL,
    "attribute_definition_id" UUID NOT NULL,
    "text_value" TEXT,
    "integer_value" BIGINT,
    "decimal_value" DECIMAL(24,8),
    "boolean_value" BOOLEAN,
    "date_value" DATE,
    "option_id" UUID,

    CONSTRAINT "offering_attribute_value_pkey" PRIMARY KEY ("offering_id","attribute_definition_id")
);

-- CreateTable
CREATE TABLE "offering_publication" (
    "id" UUID NOT NULL,
    "offering_id" UUID NOT NULL,
    "status" "PublicationStatus" NOT NULL DEFAULT 'PENDING',
    "eligibility_version" INTEGER NOT NULL,
    "reason_code" VARCHAR(100),
    "evaluated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offering_publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offering_search_projection" (
    "offering_id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "domain_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "summary" TEXT,
    "business_name" VARCHAR(200) NOT NULL,
    "searchable_text" TEXT NOT NULL,
    "filter_values" JSONB NOT NULL,
    "published_at" TIMESTAMPTZ(6) NOT NULL,
    "eligibility_version" INTEGER NOT NULL,
    "projected_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offering_search_projection_pkey" PRIMARY KEY ("offering_id")
);

-- CreateTable
CREATE TABLE "audit_record" (
    "id" UUID NOT NULL,
    "actor_user_id" UUID,
    "effective_business_id" UUID,
    "action" VARCHAR(120) NOT NULL,
    "target_type" VARCHAR(100) NOT NULL,
    "target_id" UUID,
    "result" VARCHAR(40) NOT NULL,
    "reason" TEXT,
    "correlation_id" UUID NOT NULL,
    "safe_metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox_event" (
    "id" UUID NOT NULL,
    "aggregate_type" VARCHAR(100) NOT NULL,
    "aggregate_id" UUID NOT NULL,
    "event_type" VARCHAR(160) NOT NULL,
    "payload" JSONB NOT NULL,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "available_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ(6),
    "attempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "outbox_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_account_email_key" ON "user_account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "business_slug_key" ON "business"("slug");

-- CreateIndex
CREATE INDEX "business_owner_user_id_idx" ON "business_owner"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "domain_stable_key_key" ON "domain"("stable_key");

-- CreateIndex
CREATE UNIQUE INDEX "domain_slug_key" ON "domain"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "category_stable_key_key" ON "category"("stable_key");

-- CreateIndex
CREATE INDEX "category_parent_id_idx" ON "category"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "category_domain_id_slug_key" ON "category"("domain_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "attribute_definition_stable_key_key" ON "attribute_definition"("stable_key");

-- CreateIndex
CREATE UNIQUE INDEX "attribute_option_attribute_definition_id_stable_key_key" ON "attribute_option"("attribute_definition_id", "stable_key");

-- CreateIndex
CREATE INDEX "offering_category_id_status_idx" ON "offering"("category_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "offering_business_id_slug_key" ON "offering"("business_id", "slug");

-- CreateIndex
CREATE INDEX "offering_attribute_value_attribute_definition_id_idx" ON "offering_attribute_value"("attribute_definition_id");

-- CreateIndex
CREATE INDEX "offering_publication_status_evaluated_at_idx" ON "offering_publication"("status", "evaluated_at");

-- CreateIndex
CREATE UNIQUE INDEX "offering_publication_offering_id_eligibility_version_key" ON "offering_publication"("offering_id", "eligibility_version");

-- CreateIndex
CREATE INDEX "offering_search_projection_domain_id_category_id_published__idx" ON "offering_search_projection"("domain_id", "category_id", "published_at");

-- CreateIndex
CREATE INDEX "audit_record_target_type_target_id_created_at_idx" ON "audit_record"("target_type", "target_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_record_actor_user_id_created_at_idx" ON "audit_record"("actor_user_id", "created_at");

-- CreateIndex
CREATE INDEX "outbox_event_processed_at_available_at_idx" ON "outbox_event"("processed_at", "available_at");

-- CreateIndex
CREATE INDEX "outbox_event_aggregate_type_aggregate_id_idx" ON "outbox_event"("aggregate_type", "aggregate_id");

-- AddForeignKey
ALTER TABLE "business_owner" ADD CONSTRAINT "business_owner_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_owner" ADD CONSTRAINT "business_owner_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_option" ADD CONSTRAINT "attribute_option_attribute_definition_id_fkey" FOREIGN KEY ("attribute_definition_id") REFERENCES "attribute_definition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_attribute" ADD CONSTRAINT "category_attribute_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_attribute" ADD CONSTRAINT "category_attribute_attribute_definition_id_fkey" FOREIGN KEY ("attribute_definition_id") REFERENCES "attribute_definition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offering" ADD CONSTRAINT "offering_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offering" ADD CONSTRAINT "offering_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offering_attribute_value" ADD CONSTRAINT "offering_attribute_value_offering_id_fkey" FOREIGN KEY ("offering_id") REFERENCES "offering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offering_attribute_value" ADD CONSTRAINT "offering_attribute_value_attribute_definition_id_fkey" FOREIGN KEY ("attribute_definition_id") REFERENCES "attribute_definition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offering_attribute_value" ADD CONSTRAINT "offering_attribute_value_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "attribute_option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offering_publication" ADD CONSTRAINT "offering_publication_offering_id_fkey" FOREIGN KEY ("offering_id") REFERENCES "offering"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offering_search_projection" ADD CONSTRAINT "offering_search_projection_offering_id_fkey" FOREIGN KEY ("offering_id") REFERENCES "offering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Database-owned invariants Prisma cannot express.
ALTER TABLE "user_account"
  ADD CONSTRAINT "user_account_version_positive" CHECK ("version" > 0);

ALTER TABLE "business"
  ADD CONSTRAINT "business_version_positive" CHECK ("version" > 0);

ALTER TABLE "offering"
  ADD CONSTRAINT "offering_version_positive" CHECK ("version" > 0),
  ADD CONSTRAINT "offering_publication_state_consistent" CHECK (
    ("status" = 'PUBLISHED' AND "published_at" IS NOT NULL AND "retired_at" IS NULL)
    OR ("status" = 'RETIRED' AND "retired_at" IS NOT NULL)
    OR ("status" = 'DRAFT' AND "published_at" IS NULL AND "retired_at" IS NULL)
  );

ALTER TABLE "offering_attribute_value"
  ADD CONSTRAINT "offering_attribute_exactly_one_value" CHECK (
    num_nonnulls(
      "text_value",
      "integer_value",
      "decimal_value",
      "boolean_value",
      "date_value",
      "option_id"
    ) = 1
  );

ALTER TABLE "offering_publication"
  ADD CONSTRAINT "offering_publication_eligibility_version_positive"
  CHECK ("eligibility_version" > 0);

ALTER TABLE "outbox_event"
  ADD CONSTRAINT "outbox_event_attempts_nonnegative" CHECK ("attempts" >= 0);

-- V1 PostgreSQL discovery support.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "offering_search_projection_text_fts_idx"
  ON "offering_search_projection"
  USING GIN (to_tsvector('simple', "searchable_text"));

CREATE INDEX "offering_search_projection_title_trgm_idx"
  ON "offering_search_projection"
  USING GIN ("title" gin_trgm_ops);

CREATE INDEX "offering_published_active_idx"
  ON "offering" ("published_at" DESC)
  WHERE "status" = 'PUBLISHED';
