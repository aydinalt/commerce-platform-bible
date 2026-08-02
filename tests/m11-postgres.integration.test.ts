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
  const domainId = randomUUID();
  const categoryId = randomUUID();

  beforeAll(async () => {
    await pool.query(
      `insert into user_account (id,email,status) values ($1,$2,'ACTIVE')`,
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
    await pool.query(
      `insert into domain (id,stable_key,slug,name) values ($1,$2,$3,'M11 Domain')`,
      [domainId, `domain-${domainId}`, `domain-${domainId}`]
    );
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
    const offering = await repository.create({
      businessId,
      categoryId,
      correlationId: randomUUID(),
      slug: `draft-${randomUUID()}`,
      title: "Safe draft",
      userId
    });
    const audit = await pool.query(
      `select 1 from audit_record where target_id = $1 and action = 'offering.draft.create'`,
      [offering.id]
    );
    expect(audit.rowCount).toBe(1);
  });

  it("does not expose an offering through another business", async () => {
    const offering = await repository.create({
      businessId,
      categoryId,
      correlationId: randomUUID(),
      slug: `isolated-${randomUUID()}`,
      title: "Tenant isolated draft",
      userId
    });
    await expect(
      repository.findOwned(otherBusinessId, offering.id)
    ).resolves.toBeNull();
  });
});
