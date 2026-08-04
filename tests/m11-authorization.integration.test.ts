import { randomUUID } from "node:crypto";

import {
  ConflictException,
  ForbiddenException,
  NotFoundException
} from "@nestjs/common";
import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Principal } from "../modules/identity/src/index.js";
import { OfferingService } from "../apps/api/src/offering/offering.service.js";
import { PgCommerceRepository } from "../apps/api/src/persistence/pg-commerce.repository.js";

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

/**
 * Negative authorization coverage required by
 * `docs/implementation/FIRST_VERTICAL_SLICE_READINESS.md`, limited to the
 * scenarios reachable by this slice (draft creation and owned read-back).
 * Every denial must both fail closed and leave a DENIED audit record.
 */
suite("Milestone 11 negative authorization", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const repository = new PgCommerceRepository();
  const service = new OfferingService(repository);

  const ownerId = randomUUID();
  const strangerId = randomUUID();
  const suspendedUserId = randomUUID();
  const activeBusinessId = randomUUID();
  const suspendedBusinessId = randomUUID();
  const restrictedBusinessId = randomUUID();
  const otherBusinessId = randomUUID();
  const domainId = randomUUID();
  const categoryId = randomUUID();
  const inactiveCategoryId = randomUUID();

  const principal = (userId: string): Principal => ({
    correlationId: randomUUID(),
    sessionId: randomUUID(),
    userId
  });

  const draft = (slug: string) => ({ categoryId, slug, title: "Draft" });

  const auditCount = async (correlationId: string, result: string) => {
    const rows = await pool.query<{ total: number }>(
      `select count(*)::int as total from audit_record
       where correlation_id = $1 and result = $2`,
      [correlationId, result]
    );
    return rows.rows[0]?.total ?? 0;
  };

  beforeAll(async () => {
    await pool.query(
      `insert into user_account (id,email,status,email_verified_at)
       values ($1,$2,'ENABLED',now()),($3,$4,'ENABLED',now()),($5,$6,'SUSPENDED',now())`,
      [
        ownerId,
        `owner-${ownerId}@example.test`,
        strangerId,
        `stranger-${strangerId}@example.test`,
        suspendedUserId,
        `suspended-${suspendedUserId}@example.test`
      ]
    );
    await pool.query(
      `insert into business (id,slug,name,status)
       values ($1,$2,'Active','ACTIVE'),($3,$4,'Suspended','SUSPENDED'),
              ($5,$6,'Restricted','ACTIVE'),($7,$8,'Other','ACTIVE')`,
      [
        activeBusinessId,
        `active-${activeBusinessId}`,
        suspendedBusinessId,
        `suspended-${suspendedBusinessId}`,
        restrictedBusinessId,
        `restricted-${restrictedBusinessId}`,
        otherBusinessId,
        `other-${otherBusinessId}`
      ]
    );
    await pool.query(
      `insert into business_owner (business_id,user_id)
       values ($1,$2),($3,$2),($4,$2),($5,$2)`,
      [
        activeBusinessId,
        ownerId,
        suspendedBusinessId,
        restrictedBusinessId,
        otherBusinessId
      ]
    );
    await pool.query(
      `insert into business_moderation_state (business_id,status,updated_at)
       values ($1,'RESTRICTED',now())`,
      [restrictedBusinessId]
    );
    await pool.query(
      `insert into domain (id,stable_key,slug,name) values ($1,$2,$3,'Domain')`,
      [domainId, `domain-${domainId}`, `domain-${domainId}`]
    );
    await pool.query(
      `insert into category (id,domain_id,stable_key,slug,name,active)
       values ($1,$2,$3,$4,'Active',true),($5,$2,$6,$7,'Inactive',false)`,
      [
        categoryId,
        domainId,
        `category-${categoryId}`,
        `category-${categoryId}`,
        inactiveCategoryId,
        `category-${inactiveCategoryId}`,
        `category-${inactiveCategoryId}`
      ]
    );
  });

  afterAll(async () => {
    await repository.onModuleDestroy();
    await pool.end();
  });

  it("refuses a suspended account holder", async () => {
    const actor = principal(suspendedUserId);
    await expect(
      service.create(activeBusinessId, draft(`p-${randomUUID()}`), actor)
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(auditCount(actor.correlationId, "DENIED")).resolves.toBe(1);
  });

  it("hides a Business the principal does not own", async () => {
    const actor = principal(strangerId);
    await expect(
      service.create(activeBusinessId, draft(`s-${randomUUID()}`), actor)
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(auditCount(actor.correlationId, "DENIED")).resolves.toBe(1);
  });

  it("refuses a suspended Business", async () => {
    const actor = principal(ownerId);
    await expect(
      service.create(suspendedBusinessId, draft(`x-${randomUUID()}`), actor)
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(auditCount(actor.correlationId, "DENIED")).resolves.toBe(1);
  });

  it("refuses a moderation-restricted Business", async () => {
    const actor = principal(ownerId);
    await expect(
      service.create(restrictedBusinessId, draft(`r-${randomUUID()}`), actor)
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(auditCount(actor.correlationId, "DENIED")).resolves.toBe(1);
  });

  it("refuses an inactive Category", async () => {
    const actor = principal(ownerId);
    await expect(
      service.create(
        activeBusinessId,
        {
          categoryId: inactiveCategoryId,
          slug: `c-${randomUUID()}`,
          title: "D"
        },
        actor
      )
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(auditCount(actor.correlationId, "DENIED")).resolves.toBe(1);
  });

  it("reports a duplicate slug as a conflict rather than a server error", async () => {
    const slug = `dupe-${randomUUID()}`;
    await service.create(activeBusinessId, draft(slug), principal(ownerId));

    const actor = principal(ownerId);
    await expect(
      service.create(activeBusinessId, draft(slug), actor)
    ).rejects.toBeInstanceOf(ConflictException);
    await expect(auditCount(actor.correlationId, "DENIED")).resolves.toBe(1);
  });

  it("allows the same slug inside a different owned Business", async () => {
    const slug = `shared-${randomUUID()}`;
    await service.create(activeBusinessId, draft(slug), principal(ownerId));
    await expect(
      service.create(otherBusinessId, draft(slug), principal(ownerId))
    ).resolves.toMatchObject({ slug, status: "DRAFT" });
  });

  it("does not read back an Offering through a different owned Business", async () => {
    const slug = `read-${randomUUID()}`;
    const created = await service.create(
      activeBusinessId,
      draft(slug),
      principal(ownerId)
    );

    await expect(
      service.get(activeBusinessId, created.id, principal(ownerId))
    ).resolves.toMatchObject({ id: created.id });

    const actor = principal(ownerId);
    await expect(
      service.get(otherBusinessId, created.id, actor)
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(auditCount(actor.correlationId, "DENIED")).resolves.toBe(1);
  });

  it("records successful creation as ALLOWED evidence", async () => {
    const actor = principal(ownerId);
    await service.create(activeBusinessId, draft(`ok-${randomUUID()}`), actor);
    await expect(auditCount(actor.correlationId, "ALLOWED")).resolves.toBe(1);
    await expect(auditCount(actor.correlationId, "DENIED")).resolves.toBe(0);
  });
});
