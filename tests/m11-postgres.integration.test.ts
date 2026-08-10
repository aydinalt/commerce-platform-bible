import { randomUUID } from "node:crypto";

import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PgCommerceRepository } from "../apps/api/src/persistence/pg-commerce.repository.js";

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

suite("Milestone 11 PostgreSQL integration", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const repository = new PgCommerceRepository();
  const userId = randomUUID();
  const businessId = randomUUID();
  const otherBusinessId = randomUUID();
  let domainId: string;
  const categoryId = randomUUID();

  beforeAll(async () => {
    await pool.query(
      `insert into user_account (id,email,status,email_verified_at)
       values ($1,$2,'ENABLED',now())`,
      [userId, `m11-${userId}@example.test`]
    );
    await pool.query(
      `insert into business (id,slug,name,status)
       values ($1,$2,'M11 Business','ACTIVE'),($3,$4,'Other','ACTIVE')`,
      [
        businessId,
        `m11-${businessId}`,
        otherBusinessId,
        `other-${otherBusinessId}`
      ]
    );
    await pool.query(
      `insert into business_owner (business_id,user_id) values ($1,$2)`,
      [businessId, userId]
    );
    // The V1 Domains are seeded by `20260810000200_category_management`; this
    // suite predates that and used to invent one of its own.
    domainId = (
      await pool.query<{ id: string }>(
        `select id from domain where stable_key = 'MOBILITY'`
      )
    ).rows[0]!.id;
    await pool.query(
      `insert into category (id,domain_id,stable_key,slug,name)
       values ($1,$2,$3,$4,'M11 Category')`,
      [categoryId, domainId, `category-${categoryId}`, `category-${categoryId}`]
    );
  });

  afterAll(async () => {
    await repository.onModuleDestroy();
    await pool.end();
  });

  it("creates the offering and audit record atomically", async () => {
    const slug = `draft-${randomUUID()}`;
    await repository.create({
      businessId,
      categoryId,
      correlationId: randomUUID(),
      slug,
      title: "Safe draft",
      userId
    });
    const audit = await pool.query<{ auditCount: number }>(
      `select count(*)::int as "auditCount"
       from audit_record a
       join offering o on o.id = a.target_id
       where o.slug = $1 and a.action = 'offering.draft.create'`,
      [slug]
    );
    expect(audit.rows[0]?.auditCount).toBe(1);
  });

  it("does not expose an offering through another business", async () => {
    const slug = `isolated-${randomUUID()}`;
    await repository.create({
      businessId,
      categoryId,
      correlationId: randomUUID(),
      slug,
      title: "Tenant isolated draft",
      userId
    });
    const created = await pool.query<{ id: string }>(
      `select id from offering where slug = $1`,
      [slug]
    );
    const offeringId = created.rows[0]?.id;
    expect(offeringId).toBeDefined();
    if (!offeringId) throw new Error("OFFERING_NOT_FOUND");
    await expect(
      repository.findOwned(otherBusinessId, offeringId)
    ).resolves.toBeNull();
  });
});
