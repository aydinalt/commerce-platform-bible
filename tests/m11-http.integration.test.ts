import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { errorEnvelopeSchema } from "../packages/contracts/src/index.js";
import { draftOfferingSchema } from "../packages/contracts/src/index.js";

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

/**
 * Everything else in this suite calls the service directly. These cases go over
 * the wire instead, so the route prefix, status codes, principal resolution and
 * error-envelope wiring are proven rather than assumed.
 */
suite("Milestone 11 HTTP surface", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const userId = randomUUID();
  const businessId = randomUUID();
  const otherBusinessId = randomUUID();
  let domainId: string;
  const categoryId = randomUUID();

  let app: NestFastifyApplication;

  const principalHeaders = () => ({
    "x-correlation-id": randomUUID(),
    "x-test-session-id": randomUUID(),
    "x-test-user-id": userId
  });

  const inject = (options: {
    body?: unknown;
    headers?: Record<string, string>;
    method: "GET" | "POST";
    url: string;
  }) => app.inject(options);

  beforeAll(async () => {
    process.env.ENABLE_TEST_PRINCIPAL = "true";
    process.env.NODE_ENV = "test";

    await pool.query(
      `insert into user_account (id,email,status,email_verified_at)
       values ($1,$2,'ENABLED',now())`,
      [userId, `http-${userId}@example.test`]
    );
    await pool.query(
      `insert into business (id,slug,name,status)
       values ($1,$2,'Owned','ACTIVE'),($3,$4,'Other','ACTIVE')`,
      [
        businessId,
        `http-${businessId}`,
        otherBusinessId,
        `http-other-${otherBusinessId}`
      ]
    );
    await pool.query(
      `insert into business_owner (business_id,user_id) values ($1,$2),($3,$2)`,
      [businessId, userId, otherBusinessId]
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
       values ($1,$2,$3,$4,'Category')`,
      [categoryId, domainId, `http-c-${categoryId}`, `http-c-${categoryId}`]
    );

    const { createApiApp } = await import("../apps/api/src/bootstrap.js");
    app = await createApiApp({ logLevel: "fatal" });
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("serves liveness under the versioned prefix", async () => {
    const response = await inject({
      method: "GET",
      url: "/api/v1/health/live"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ service: "api", status: "ok" });
  });

  it("answers 401 in the published envelope when no principal is presented", async () => {
    const response = await inject({
      body: { categoryId, slug: `anon-${randomUUID()}`, title: "Anonymous" },
      method: "POST",
      url: `/api/v1/businesses/${businessId}/offerings`
    });

    expect(response.statusCode).toBe(401);
    expect(errorEnvelopeSchema.parse(response.json()).code).toBe(
      "UNAUTHENTICATED"
    );
  });

  it("refuses a malformed principal instead of failing inside the driver", async () => {
    for (const header of [
      "x-correlation-id",
      "x-test-session-id",
      "x-test-user-id"
    ]) {
      const response = await inject({
        body: { categoryId, slug: `evil-${randomUUID()}`, title: "Evil" },
        headers: { ...principalHeaders(), [header]: "'; drop table x; --" },
        method: "POST",
        url: `/api/v1/businesses/${businessId}/offerings`
      });

      expect(response.statusCode).toBe(401);
      expect(errorEnvelopeSchema.parse(response.json()).code).toBe(
        "UNAUTHENTICATED"
      );
    }
  });

  it("rejects malformed path identifiers at the edge", async () => {
    const create = await inject({
      body: { categoryId, slug: `bad-${randomUUID()}`, title: "Bad path" },
      headers: principalHeaders(),
      method: "POST",
      url: "/api/v1/businesses/not-a-uuid/offerings"
    });
    expect(create.statusCode).toBe(400);
    expect(
      errorEnvelopeSchema.parse(create.json()).fieldErrors?.businessId
    ).toBeDefined();

    const read = await inject({
      headers: principalHeaders(),
      method: "GET",
      url: `/api/v1/businesses/${businessId}/offerings/not-a-uuid`
    });
    expect(read.statusCode).toBe(400);
    expect(
      errorEnvelopeSchema.parse(read.json()).fieldErrors?.offeringId
    ).toBeDefined();
  });

  it("refuses unknown body fields rather than silently dropping them", async () => {
    const response = await inject({
      body: {
        businessId: randomUUID(),
        categoryId,
        slug: `extra-${randomUUID()}`,
        status: "PUBLISHED",
        title: "Mass assignment attempt",
        version: 999
      },
      headers: principalHeaders(),
      method: "POST",
      url: `/api/v1/businesses/${businessId}/offerings`
    });

    expect(response.statusCode).toBe(400);
    expect(errorEnvelopeSchema.parse(response.json()).code).toBe(
      "VALIDATION_FAILED"
    );
  });

  it("labels an oversized payload with an actionable code", async () => {
    const response = await inject({
      body: {
        categoryId,
        slug: `big-${randomUUID()}`,
        summary: "A".repeat(2_000_000),
        title: "Too large"
      },
      headers: principalHeaders(),
      method: "POST",
      url: `/api/v1/businesses/${businessId}/offerings`
    });

    expect(response.statusCode).toBe(413);
    expect(errorEnvelopeSchema.parse(response.json()).code).toBe(
      "PAYLOAD_TOO_LARGE"
    );
  });

  it("creates a Draft Offering with 201 and the published response shape", async () => {
    const slug = `http-${randomUUID()}`;
    const response = await inject({
      body: { categoryId, slug, title: "Over the wire" },
      headers: principalHeaders(),
      method: "POST",
      url: `/api/v1/businesses/${businessId}/offerings`
    });

    expect(response.statusCode).toBe(201);
    const body = response.json<Record<string, unknown>>();
    expect(draftOfferingSchema.parse(body)).toMatchObject({
      businessId,
      slug,
      status: "DRAFT"
    });
  });

  it("reports validation failures with field errors", async () => {
    const response = await inject({
      body: { categoryId: "not-a-uuid", slug: "", title: "" },
      headers: principalHeaders(),
      method: "POST",
      url: `/api/v1/businesses/${businessId}/offerings`
    });

    expect(response.statusCode).toBe(400);
    const envelope = errorEnvelopeSchema.parse(response.json());
    expect(envelope.code).toBe("VALIDATION_FAILED");
    expect(Object.keys(envelope.fieldErrors ?? {}).sort()).toEqual([
      "categoryId",
      "slug",
      "title"
    ]);
  });

  it("echoes the caller's correlation id back in failures", async () => {
    const headers = principalHeaders();
    const response = await inject({
      body: { slug: "" },
      headers,
      method: "POST",
      url: `/api/v1/businesses/${businessId}/offerings`
    });

    expect(errorEnvelopeSchema.parse(response.json()).correlationId).toBe(
      headers["x-correlation-id"]
    );
  });

  it("reports a duplicate slug as 409 with a stable domain code", async () => {
    const slug = `conflict-${randomUUID()}`;
    const body = { categoryId, slug, title: "First" };
    const url = `/api/v1/businesses/${businessId}/offerings`;

    const first = await inject({
      body,
      headers: principalHeaders(),
      method: "POST",
      url
    });
    expect(first.statusCode).toBe(201);

    const second = await inject({
      body,
      headers: principalHeaders(),
      method: "POST",
      url
    });
    expect(second.statusCode).toBe(409);
    expect(errorEnvelopeSchema.parse(second.json()).code).toBe(
      "OFFERING_SLUG_CONFLICT"
    );
  });

  it("reads back an owned Offering and hides it from another Business", async () => {
    const slug = `roundtrip-${randomUUID()}`;
    const created = await inject({
      body: { categoryId, slug, summary: "Readable", title: "Roundtrip" },
      headers: principalHeaders(),
      method: "POST",
      url: `/api/v1/businesses/${businessId}/offerings`
    });
    const { id } = created.json<{ id: string }>();

    const owned = await inject({
      headers: principalHeaders(),
      method: "GET",
      url: `/api/v1/businesses/${businessId}/offerings/${id}`
    });
    expect(owned.statusCode).toBe(200);
    expect(draftOfferingSchema.parse(owned.json())).toMatchObject({ id, slug });

    const foreign = await inject({
      headers: principalHeaders(),
      method: "GET",
      url: `/api/v1/businesses/${otherBusinessId}/offerings/${id}`
    });
    expect(foreign.statusCode).toBe(404);
    expect(errorEnvelopeSchema.parse(foreign.json()).code).toBe("NOT_FOUND");
  });
});
