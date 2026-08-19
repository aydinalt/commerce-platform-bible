import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import { silentLogger } from "../packages/testing/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  authorizedBusinessesSchema,
  errorEnvelopeSchema,
  sessionSchema
} from "../packages/contracts/src/index.js";

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

const ORIGIN = "http://localhost:3000";
const PASSWORD = "correct horse battery staple";

/** Captures the registration link the worker would have emailed. */
class RecordingDispatcher implements EmailDispatcher {
  readonly delivered: EmailMessage[] = [];

  deliver(message: EmailMessage): Promise<void> {
    this.delivered.push(message);
    return Promise.resolve();
  }
}

/**
 * `US-IDN-F07-001` Business Context Access. The Story's governing rule is that
 * no Business is ever chosen silently, so most of these cases are about what
 * the system refuses to assume.
 */
suite("Milestone 12 Business context", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;

  const foreignId = randomUUID();
  let domainId: string;
  const categoryId = randomUUID();

  const address = () => `ctx-${randomUUID()}@example.test`;

  const send = (
    method: "DELETE" | "GET" | "POST" | "PUT",
    url: string,
    options: { body?: unknown; cookie?: string } = {}
  ) =>
    app.inject({
      ...(options.body === undefined ? {} : { body: options.body }),
      headers: {
        origin: ORIGIN,
        ...(options.cookie === undefined ? {} : { cookie: options.cookie })
      },
      method,
      url: `/api/v1${url}`
    });

  /** Registers a person and returns their session cookie and account id. */
  const signUp = async () => {
    const email = address();
    await send("POST", "/auth/registrations", {
      body: { email, password: PASSWORD }
    });
    await processor.processBatch();
    const message = dispatcher.delivered.find((m) => m.recipient === email);
    if (!message) throw new Error("NO_MESSAGE_DELIVERED");
    const link = /https?:\/\/\S+/u.exec(message.body)?.[0];
    if (!link) throw new Error("NO_LINK_IN_MESSAGE");
    const token = new URL(link).searchParams.get("token");
    const confirmed = await send("POST", "/auth/registrations/confirmations", {
      body: { token }
    });
    const cookies = confirmed.cookies as { name: string; value: string }[];
    const found = cookies.find((c) => c.name === "commerce_session");
    return {
      cookie: `commerce_session=${found?.value ?? ""}`,
      userId: confirmed.json<{ userId: string }>().userId
    };
  };

  /**
   * A Business owned by exactly one person (`US-BUS-F01-001` AC-8), so each
   * case creates its own rather than sharing one that could only ever belong to
   * whoever claimed it first.
   */
  const ownedBusiness = async (userId: string, name = "Owned") => {
    const id = randomUUID();
    await pool.query(
      `insert into business (id,slug,name,status) values ($1,$2,$3,'ACTIVE')`,
      [id, `ctx-${id}`, name]
    );
    await pool.query(
      `insert into business_owner (business_id,user_id) values ($1,$2)`,
      [id, userId]
    );
    return id;
  };

  beforeAll(async () => {
    process.env.NODE_ENV = "test";

    await pool.query(
      `insert into business (id,slug,name,status)
       values ($1,$2,'Foreign','ACTIVE')`,
      [foreignId, `ctx-foreign-${foreignId}`]
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
      [categoryId, domainId, `ctx-c-${categoryId}`, `ctx-c-${categoryId}`]
    );

    const { createApiApp } = await import("../apps/api/src/bootstrap.js");
    app = await createApiApp({ logLevel: "fatal" });
    processor = new OutboxProcessor({
      dispatcher,
      logger: silentLogger(),
      pool,
      publicWebUrl: ORIGIN
    });
  });

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    dispatcher.delivered.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("starts in the authenticated User baseline with no Business chosen", async () => {
    const { cookie } = await signUp();

    const session = await send("GET", "/auth/sessions/current", { cookie });

    // AC-3: nothing is selected on the person's behalf.
    expect(sessionSchema.parse(session.json()).selectedBusinessId).toBeNull();
  });

  it("offers only the Businesses the person is authorized for", async () => {
    const { cookie, userId } = await signUp();
    const ownedId = await ownedBusiness(userId, "Owned One");
    const secondId = await ownedBusiness(userId, "Owned Two");

    const listed = await send("GET", "/auth/me/businesses", { cookie });

    const { businesses } = authorizedBusinessesSchema.parse(listed.json());
    expect(businesses.map((b) => b.id).sort()).toEqual(
      [ownedId, secondId].sort()
    );
  });

  it("enters an explicitly chosen Business context", async () => {
    const { cookie, userId } = await signUp();
    const ownedId = await ownedBusiness(userId);

    const entered = await send("PUT", "/auth/me/business-context", {
      body: { businessId: ownedId },
      cookie
    });

    expect(entered.statusCode).toBe(200);
    expect(sessionSchema.parse(entered.json()).selectedBusinessId).toBe(
      ownedId
    );
  });

  it("refuses entry to a Business the person is not authorized for", async () => {
    const { cookie } = await signUp();

    const entered = await send("PUT", "/auth/me/business-context", {
      body: { businessId: foreignId },
      cookie
    });

    // AC-2: entry requires an authoritative relationship to that exact
    // Business.
    expect(entered.statusCode).toBe(404);
    expect(errorEnvelopeSchema.parse(entered.json()).code).toBe(
      "BUSINESS_NOT_AUTHORIZED"
    );
  });

  it("refuses to act in an owned Business that was never selected", async () => {
    const { cookie, userId } = await signUp();
    const ownedId = await ownedBusiness(userId);

    const created = await send("POST", `/businesses/${ownedId}/offerings`, {
      body: { categoryId, slug: `unselected-${randomUUID()}`, title: "No" },
      cookie
    });

    // Ownership alone is not enough while the context is unselected, otherwise
    // the Business would have been chosen silently.
    expect(created.statusCode).toBe(403);
    expect(errorEnvelopeSchema.parse(created.json()).code).toBe(
      "BUSINESS_CONTEXT_REQUIRED"
    );
  });

  it("acts only in the selected Business, not in another owned one", async () => {
    const { cookie, userId } = await signUp();
    const ownedId = await ownedBusiness(userId, "Owned One");
    const secondId = await ownedBusiness(userId, "Owned Two");
    await send("PUT", "/auth/me/business-context", {
      body: { businessId: ownedId },
      cookie
    });

    const inSelected = await send("POST", `/businesses/${ownedId}/offerings`, {
      body: { categoryId, slug: `selected-${randomUUID()}`, title: "Yes" },
      cookie
    });
    const inOther = await send("POST", `/businesses/${secondId}/offerings`, {
      body: { categoryId, slug: `other-${randomUUID()}`, title: "No" },
      cookie
    });

    // AC-6: entering one context grants no authority over another Business.
    expect(inSelected.statusCode).toBe(201);
    expect(inOther.statusCode).toBe(403);
  });

  it("drops the context when the ownership relationship is removed", async () => {
    const { cookie, userId } = await signUp();
    const ownedId = await ownedBusiness(userId);
    await send("PUT", "/auth/me/business-context", {
      body: { businessId: ownedId },
      cookie
    });

    await pool.query(
      `delete from business_owner where business_id = $1 and user_id = $2`,
      [ownedId, userId]
    );

    const session = await send("GET", "/auth/sessions/current", { cookie });

    // AC-8: conditions are re-evaluated, so a revoked relationship cannot
    // survive inside an established session.
    expect(sessionSchema.parse(session.json()).selectedBusinessId).toBeNull();
  });

  it("returns to the User baseline on leaving, keeping the session", async () => {
    const { cookie, userId } = await signUp();
    const ownedId = await ownedBusiness(userId);
    await send("PUT", "/auth/me/business-context", {
      body: { businessId: ownedId },
      cookie
    });

    const left = await send("DELETE", "/auth/me/business-context", { cookie });
    const session = await send("GET", "/auth/sessions/current", { cookie });

    // AC-9: leaving a Business context is not a Logout.
    expect(sessionSchema.parse(left.json()).selectedBusinessId).toBeNull();
    expect(session.statusCode).toBe(200);
    expect(sessionSchema.parse(session.json()).userId).toBe(userId);
  });

  it("requires an authenticated session to choose a context at all", async () => {
    const entered = await send("PUT", "/auth/me/business-context", {
      body: { businessId: foreignId }
    });

    // AC-1: Business context is unavailable without an Enabled account.
    expect(entered.statusCode).toBe(401);
  });

  it("refuses a context switch from an unrecognised origin", async () => {
    const { cookie, userId } = await signUp();
    const ownedId = await ownedBusiness(userId);

    const foreign = await app.inject({
      body: { businessId: ownedId },
      headers: { cookie, origin: "https://attacker.example" },
      method: "PUT",
      url: "/api/v1/auth/me/business-context"
    });

    expect(foreign.statusCode).toBe(403);
    expect(errorEnvelopeSchema.parse(foreign.json()).code).toBe(
      "ORIGIN_REJECTED"
    );
  });
});
