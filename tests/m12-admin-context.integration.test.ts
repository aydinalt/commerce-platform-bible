import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import {
  errorEnvelopeSchema,
  sessionSchema
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
 * `US-IDN-F08-001` Admin Authorization and Context Access. Authorization is
 * provisioned operationally, so these cases grant it the way an operator would —
 * against the database — and then check what the product layer will and will not
 * do with it.
 */
suite("Milestone 12 Admin context", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;

  const address = () => `adm-${randomUUID()}@example.test`;

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
    const confirmed = await send("POST", "/auth/registrations/confirmations", {
      body: { token: new URL(link).searchParams.get("token") }
    });
    const cookies = confirmed.cookies as { name: string; value: string }[];
    return {
      cookie: `commerce_session=${cookies.find((c) => c.name === "commerce_session")?.value ?? ""}`,
      email,
      userId: confirmed.json<{ userId: string }>().userId
    };
  };

  /** What the operational script does, which is the only supported path. */
  const grantAdmin = (userId: string) =>
    pool.query(
      `insert into admin_authorization (user_id, granted_by)
       values ($1,'Product Owner') on conflict do nothing`,
      [userId]
    );

  const revokeAdmin = (userId: string) =>
    pool.query(`delete from admin_authorization where user_id = $1`, [userId]);

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    const { createApiApp } = await import("../apps/api/src/bootstrap.js");
    app = await createApiApp({ logLevel: "fatal" });
    processor = new OutboxProcessor({ dispatcher, publicWebUrl: ORIGIN });
  });

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    dispatcher.delivered.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await processor.close();
    await pool.end();
  });

  it("publishes no way to grant or remove Admin authorization", async () => {
    const document = JSON.parse(
      await readFile("generated/openapi.json", "utf8")
    ) as { paths: Record<string, unknown> };

    // AC-3 and AC-4: provisioning is operational and outside the product layer,
    // so the contract must offer no self-service surface for it.
    const granting = Object.keys(document.paths).filter((path) =>
      /admin-authorization|admins/u.test(path)
    );
    expect(granting).toEqual([]);
  });

  it("reports no Admin authorization for an ordinary account", async () => {
    const { cookie } = await signUp();

    const session = await send("GET", "/auth/sessions/current", { cookie });

    expect(sessionSchema.parse(session.json())).toMatchObject({
      adminAuthorized: false,
      adminContext: false
    });
  });

  it("refuses Admin context to an account without authorization", async () => {
    const { cookie } = await signUp();

    const entered = await send("PUT", "/auth/me/admin-context", { cookie });

    expect(entered.statusCode).toBe(403);
    expect(errorEnvelopeSchema.parse(entered.json()).code).toBe(
      "ADMIN_NOT_AUTHORIZED"
    );
  });

  it("does not enter Admin context merely because authorization exists", async () => {
    const { cookie, userId } = await signUp();
    await grantAdmin(userId);

    const session = await send("GET", "/auth/sessions/current", { cookie });

    // AC-5: authorization is necessary, the explicit choice is separate.
    expect(sessionSchema.parse(session.json())).toMatchObject({
      adminAuthorized: true,
      adminContext: false
    });
  });

  it("enters Admin context on an explicit request", async () => {
    const { cookie, userId } = await signUp();
    await grantAdmin(userId);

    const entered = await send("PUT", "/auth/me/admin-context", { cookie });

    expect(entered.statusCode).toBe(200);
    expect(sessionSchema.parse(entered.json())).toMatchObject({
      adminAuthorized: true,
      adminContext: true,
      selectedBusinessId: null
    });
  });

  it("grants no Business authority through Admin authorization", async () => {
    const { cookie, userId } = await signUp();
    await grantAdmin(userId);
    await send("PUT", "/auth/me/admin-context", { cookie });

    const businessId = randomUUID();
    await pool.query(
      `insert into business (id,slug,name,status) values ($1,$2,'Unowned','ACTIVE')`,
      [businessId, `adm-${businessId}`]
    );

    const entered = await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie
    });
    const listed = await send("GET", "/auth/me/businesses", { cookie });

    // AC-7 here, and `US-IDN-F07-001` AC-7: Admin authorization is not a
    // Business relationship and cannot stand in for one.
    expect(entered.statusCode).toBe(404);
    expect(listed.json<{ businesses: unknown[] }>().businesses).toEqual([]);
  });

  it("leaves Admin context when a Business context is entered", async () => {
    const { cookie, userId } = await signUp();
    await grantAdmin(userId);
    const businessId = randomUUID();
    await pool.query(
      `insert into business (id,slug,name,status) values ($1,$2,'Owned','ACTIVE')`,
      [businessId, `adm-own-${businessId}`]
    );
    await pool.query(
      `insert into business_owner (business_id,user_id) values ($1,$2)`,
      [businessId, userId]
    );
    await send("PUT", "/auth/me/admin-context", { cookie });

    const entered = await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie
    });

    // AC-6: the Admin surface is routed without Business ownership, so the two
    // contexts do not overlap.
    expect(sessionSchema.parse(entered.json())).toMatchObject({
      adminContext: false,
      selectedBusinessId: businessId
    });
  });

  it("drops Admin context the moment authorization is removed", async () => {
    const { cookie, userId } = await signUp();
    await grantAdmin(userId);
    await send("PUT", "/auth/me/admin-context", { cookie });

    await revokeAdmin(userId);
    const session = await send("GET", "/auth/sessions/current", { cookie });

    // AC-9 and AC-11: conditions are re-evaluated, so removal takes effect at
    // once rather than at the next login.
    expect(sessionSchema.parse(session.json())).toMatchObject({
      adminAuthorized: false,
      adminContext: false
    });
  });

  it("keeps ordinary User behaviour after authorization is removed", async () => {
    const { cookie, userId } = await signUp();
    await grantAdmin(userId);
    await send("PUT", "/auth/me/admin-context", { cookie });
    await revokeAdmin(userId);

    const session = await send("GET", "/auth/sessions/current", { cookie });
    const refused = await send("PUT", "/auth/me/admin-context", { cookie });

    // AC-10: the account remains an ordinary authenticated User.
    expect(session.statusCode).toBe(200);
    expect(sessionSchema.parse(session.json()).userId).toBe(userId);
    expect(refused.statusCode).toBe(403);
  });

  it("makes Admin context unavailable while the account is Suspended", async () => {
    const { cookie, email, userId } = await signUp();
    await grantAdmin(userId);
    await pool.query(
      `update user_account set status = 'SUSPENDED' where email = $1`,
      [email]
    );

    const entered = await send("PUT", "/auth/me/admin-context", { cookie });

    // AC-8: suspension governs even while authorization remains present.
    expect(entered.statusCode).toBe(401);
    const authorization = await pool.query(
      `select 1 from admin_authorization where user_id = $1`,
      [userId]
    );
    expect(authorization.rowCount).toBe(1);
  });

  it("returns to the User baseline on leaving Admin context", async () => {
    const { cookie, userId } = await signUp();
    await grantAdmin(userId);
    await send("PUT", "/auth/me/admin-context", { cookie });

    const left = await send("DELETE", "/auth/me/admin-context", { cookie });

    expect(sessionSchema.parse(left.json())).toMatchObject({
      adminAuthorized: true,
      adminContext: false
    });
  });

  it("refuses an Admin context switch from an unrecognised origin", async () => {
    const { cookie, userId } = await signUp();
    await grantAdmin(userId);

    const foreign = await app.inject({
      headers: { cookie, origin: "https://attacker.example" },
      method: "PUT",
      url: "/api/v1/auth/me/admin-context"
    });

    expect(foreign.statusCode).toBe(403);
    expect(errorEnvelopeSchema.parse(foreign.json()).code).toBe(
      "ORIGIN_REJECTED"
    );
  });
});
