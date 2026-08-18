import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import {
  draftOfferingSchema,
  errorEnvelopeSchema
} from "../packages/contracts/src/index.js";

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

const ORIGIN = "http://localhost:3000";
const PASSWORD = "correct horse battery staple";

class RecordingDispatcher implements EmailDispatcher {
  readonly delivered: EmailMessage[] = [];

  deliver(message: EmailMessage): Promise<void> {
    this.delivered.push(message);
    return Promise.resolve();
  }
}

/**
 * Everything else in this suite calls the service directly. These cases go over
 * the wire instead, so the route prefix, status codes, principal resolution and
 * error-envelope wiring are proven rather than assumed.
 *
 * **The principal is now a real session.** This suite used to authenticate
 * through `x-test-user-id` headers served by `TestPrincipalAdapter`, which
 * existed because M11 predated identity: there was no way to register, so a
 * header stood in for one. Identity arrived in I1 and the affordance outlived
 * its reason — a second way to mint a principal, refusing to construct in
 * production but present in the code either way. It is deleted, and this file
 * is the last thing that needed it.
 *
 * Nothing about what these cases assert changed. The edge still refuses a
 * malformed identifier before the driver sees it; the identifier is simply the
 * session token now, which is what a person actually presents.
 */
suite("Milestone 11 HTTP surface", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;

  let cookie: string;
  let businessId: string;
  let otherBusinessId: string;
  let categoryId: string;

  /** A correlation identifier per request, as every caller is expected to send. */
  const headers = () => ({ "x-correlation-id": randomUUID() });

  const inject = (options: {
    body?: unknown;
    headers?: Record<string, string>;
    method: "GET" | "POST" | "PUT";
    url: string;
  }) =>
    app.inject({
      ...options,
      headers: { origin: ORIGIN, ...options.headers }
    });

  const authed = (extra: Record<string, string> = {}) => ({
    cookie,
    ...headers(),
    ...extra
  });

  /** Register, confirm by the emailed token, and keep the session cookie. */
  const signUp = async () => {
    const email = `http-${randomUUID()}@example.test`;
    await inject({
      body: { email, password: PASSWORD },
      headers: headers(),
      method: "POST",
      url: "/api/v1/auth/registrations"
    });
    await processor.processBatch();
    const message = dispatcher.delivered.find((m) => m.recipient === email);
    const link = /https?:\/\/\S+/u.exec(message?.body ?? "")?.[0] ?? "";
    const confirmed = await inject({
      body: { token: new URL(link).searchParams.get("token") },
      headers: headers(),
      method: "POST",
      url: "/api/v1/auth/registrations/confirmations"
    });
    const cookies = confirmed.cookies as { name: string; value: string }[];
    return `commerce_session=${
      cookies.find((c) => c.name === "commerce_session")?.value ?? ""
    }`;
  };

  const createBusiness = async (name: string) => {
    const created = await inject({
      body: { name, slug: `http-${randomUUID()}` },
      headers: authed(),
      method: "POST",
      url: "/api/v1/businesses"
    });
    return created.json<{ id: string }>().id;
  };

  beforeAll(async () => {
    process.env.NODE_ENV = "test";

    const { createApiApp } = await import("../apps/api/src/bootstrap.js");
    app = await createApiApp({ logLevel: "fatal" });
    processor = new OutboxProcessor({ dispatcher, publicWebUrl: ORIGIN });

    cookie = await signUp();
    businessId = await createBusiness("Owned");
    otherBusinessId = await createBusiness("Other");
    await inject({
      body: { businessId },
      headers: authed(),
      method: "PUT",
      url: "/api/v1/auth/me/business-context"
    });

    // The V1 Domains are seeded by `20260810000200_category_management`.
    const domainId = (
      await pool.query<{ id: string }>(
        `select id from domain where stable_key = 'MOBILITY'`
      )
    ).rows[0]!.id;
    categoryId = randomUUID();
    await pool.query(
      `insert into category (id,domain_id,stable_key,slug,name)
       values ($1,$2,$3,$4,'Category')`,
      [categoryId, domainId, `http-c-${categoryId}`, `http-c-${categoryId}`]
    );
  });

  afterAll(async () => {
    await app.close();
    await processor.close();
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
      headers: headers(),
      method: "POST",
      url: `/api/v1/businesses/${businessId}/offerings`
    });

    expect(response.statusCode).toBe(401);
    expect(errorEnvelopeSchema.parse(response.json()).code).toBe(
      "UNAUTHENTICATED"
    );
  });

  it("refuses a malformed principal instead of failing inside the driver", async () => {
    // The untrusted identifier used to be three headers; it is the session
    // token now. The property is the same one M11 established: a value that
    // reaches a `uuid` column or a lookup is refused at the edge, so a request
    // that should be a 401 never becomes a 500 inside the driver.
    for (const value of ["'; drop table x; --", "not-a-token", ""]) {
      const response = await inject({
        body: { categoryId, slug: `evil-${randomUUID()}`, title: "Evil" },
        headers: { ...headers(), cookie: `commerce_session=${value}` },
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
      headers: authed(),
      method: "POST",
      url: "/api/v1/businesses/not-a-uuid/offerings"
    });
    expect(create.statusCode).toBe(400);
    expect(
      errorEnvelopeSchema.parse(create.json()).fieldErrors?.businessId
    ).toBeDefined();

    const read = await inject({
      headers: authed(),
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
      headers: authed(),
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
      headers: authed(),
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
      headers: authed(),
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
      headers: authed(),
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
    const sent = authed();
    const response = await inject({
      body: { slug: "" },
      headers: sent,
      method: "POST",
      url: `/api/v1/businesses/${businessId}/offerings`
    });

    expect(errorEnvelopeSchema.parse(response.json()).correlationId).toBe(
      sent["x-correlation-id"]
    );
  });

  it("reports a duplicate slug as 409 with a stable domain code", async () => {
    const slug = `conflict-${randomUUID()}`;
    const body = { categoryId, slug, title: "First" };
    const url = `/api/v1/businesses/${businessId}/offerings`;

    const first = await inject({
      body,
      headers: authed(),
      method: "POST",
      url
    });
    expect(first.statusCode).toBe(201);

    const second = await inject({
      body,
      headers: authed(),
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
      headers: authed(),
      method: "POST",
      url: `/api/v1/businesses/${businessId}/offerings`
    });
    const { id } = created.json<{ id: string }>();

    const owned = await inject({
      headers: authed(),
      method: "GET",
      url: `/api/v1/businesses/${businessId}/offerings/${id}`
    });
    expect(owned.statusCode).toBe(200);
    expect(draftOfferingSchema.parse(owned.json())).toMatchObject({ id, slug });

    // The same account owns both Businesses, so this is the tenancy boundary
    // rather than an ownership one: an Offering is readable through the exact
    // Business that holds it and through no other.
    const foreign = await inject({
      headers: authed(),
      method: "GET",
      url: `/api/v1/businesses/${otherBusinessId}/offerings/${id}`
    });
    expect(foreign.statusCode).toBe(404);
    expect(errorEnvelopeSchema.parse(foreign.json()).code).toBe("NOT_FOUND");
  });
});
