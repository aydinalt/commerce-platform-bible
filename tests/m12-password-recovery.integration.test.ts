import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { errorEnvelopeSchema } from "../packages/contracts/src/index.js";

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

const PASSWORD = "correct horse battery staple";
const NEW_PASSWORD = "a different sufficiently long one";
const WEB_URL = "http://localhost:3000";

class RecordingDispatcher implements EmailDispatcher {
  readonly delivered: EmailMessage[] = [];

  deliver(message: EmailMessage): Promise<void> {
    this.delivered.push(message);
    return Promise.resolve();
  }
}

/**
 * `US-IDN-F05-001` Password Recovery. The Story is mostly about what recovery
 * must *not* disturb: the account, its access status, and its relationships.
 */
suite("Milestone 12 password recovery", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;

  const address = () => `rec-${randomUUID()}@example.test`;

  const post = (url: string, body: unknown) =>
    app.inject({
      body,
      headers: { origin: WEB_URL },
      method: "POST",
      url: `/api/v1${url}`
    });

  const linkToken = (recipient: string, subject: string) => {
    const message = dispatcher.delivered.find(
      (m) => m.recipient === recipient && m.subject === subject
    );
    if (!message) throw new Error("NO_MESSAGE_DELIVERED");
    const link = /https?:\/\/\S+/u.exec(message.body)?.[0];
    if (!link) throw new Error("NO_LINK_IN_MESSAGE");
    return new URL(link).searchParams.get("token");
  };

  /** Registers an account and returns its address and identifier. */
  const account = async () => {
    const email = address();
    await post("/auth/registrations", { email, password: PASSWORD });
    await processor.processBatch();
    const confirmed = await post("/auth/registrations/confirmations", {
      token: linkToken(email, "Confirm your email address")
    });
    return { email, userId: confirmed.json<{ userId: string }>().userId };
  };

  /** Runs recovery to the point of holding a usable reset token. */
  const recoveryToken = async (email: string) => {
    await post("/auth/password-resets", { email });
    await processor.processBatch();
    return linkToken(email, "Reset your password");
  };

  beforeAll(async () => {
    process.env.ENABLE_TEST_PRINCIPAL = "false";
    process.env.NODE_ENV = "test";
    const { createApiApp } = await import("../apps/api/src/bootstrap.js");
    app = await createApiApp({ logLevel: "fatal" });
    processor = new OutboxProcessor({ dispatcher, publicWebUrl: WEB_URL });
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

  it("begins recovery without authentication and sets the new password", async () => {
    const { email } = await account();

    const token = await recoveryToken(email);
    const reset = await post("/auth/password-resets/completions", {
      password: NEW_PASSWORD,
      token
    });

    // AC-1, AC-3: unauthenticated start, one-time proof before a new password.
    expect(reset.statusCode).toBe(204);
    const signedIn = await post("/auth/sessions", {
      email,
      password: NEW_PASSWORD
    });
    // AC-5: Login may be attempted, and now succeeds.
    expect(signedIn.statusCode).toBe(201);
  });

  it("stops accepting the previous password", async () => {
    const { email } = await account();
    await post("/auth/password-resets/completions", {
      password: NEW_PASSWORD,
      token: await recoveryToken(email)
    });

    const old = await post("/auth/sessions", { email, password: PASSWORD });
    expect(old.statusCode).toBe(401);
  });

  it("keeps the same account and its relationships", async () => {
    const { email, userId } = await account();
    const businessId = randomUUID();
    await pool.query(
      `insert into business (id,slug,name,status) values ($1,$2,'Kept','ACTIVE')`,
      [businessId, `rec-${businessId}`]
    );
    await pool.query(
      `insert into business_owner (business_id,user_id) values ($1,$2)`,
      [businessId, userId]
    );

    await post("/auth/password-resets/completions", {
      password: NEW_PASSWORD,
      token: await recoveryToken(email)
    });

    // AC-4 and AC-7: the same account, with its ownership intact.
    const after = await pool.query<{ id: string; owned: number }>(
      `select u.id, (
         select count(*)::int from business_owner bo where bo.user_id = u.id
       ) as owned
       from user_account u where u.email = $1`,
      [email]
    );
    expect(after.rows[0]?.id).toBe(userId);
    expect(after.rows[0]?.owned).toBe(1);
  });

  it("leaves Admin authorization untouched", async () => {
    const { email, userId } = await account();
    await pool.query(
      `insert into admin_authorization (user_id, granted_by)
       values ($1,'Product Owner')`,
      [userId]
    );

    await post("/auth/password-resets/completions", {
      password: NEW_PASSWORD,
      token: await recoveryToken(email)
    });

    // AC-8: recovery is a credential change, not an authorization change.
    const authorization = await pool.query(
      `select 1 from admin_authorization where user_id = $1`,
      [userId]
    );
    expect(authorization.rowCount).toBe(1);
  });

  it("leaves a Suspended account suspended and still unable to sign in", async () => {
    const { email } = await account();
    await pool.query(
      `update user_account set status = 'SUSPENDED' where email = $1`,
      [email]
    );

    const token = await recoveryToken(email);
    const reset = await post("/auth/password-resets/completions", {
      password: NEW_PASSWORD,
      token
    });

    // AC-9: the reset itself succeeds for a Suspended account.
    expect(reset.statusCode).toBe(204);
    const status = await pool.query<{ status: string }>(
      `select status::text as status from user_account where email = $1`,
      [email]
    );
    // AC-6: recovery changes no access status.
    expect(status.rows[0]?.status).toBe("SUSPENDED");
    // And suspension still governs Login (`US-IDN-F03-001` AC-4).
    const signedIn = await post("/auth/sessions", {
      email,
      password: NEW_PASSWORD
    });
    expect(signedIn.statusCode).toBe(401);
  });

  it("ends existing sessions when the password is reset", async () => {
    const { email } = await account();
    const signedIn = await post("/auth/sessions", {
      email,
      password: PASSWORD
    });
    const cookies = signedIn.cookies as { name: string; value: string }[];
    const cookie = `commerce_session=${cookies.find((c) => c.name === "commerce_session")?.value ?? ""}`;

    await post("/auth/password-resets/completions", {
      password: NEW_PASSWORD,
      token: await recoveryToken(email)
    });

    // Whoever asked for the reset may not be whoever was signed in.
    const after = await app.inject({
      headers: { cookie },
      method: "GET",
      url: "/api/v1/auth/sessions/current"
    });
    expect(after.statusCode).toBe(401);
  });

  it("spends the recovery link exactly once", async () => {
    const { email } = await account();
    const token = await recoveryToken(email);

    const first = await post("/auth/password-resets/completions", {
      password: NEW_PASSWORD,
      token
    });
    const second = await post("/auth/password-resets/completions", {
      password: "yet another long enough password",
      token
    });

    expect(first.statusCode).toBe(204);
    expect(second.statusCode).toBe(400);
    expect(errorEnvelopeSchema.parse(second.json()).code).toBe(
      "RESET_TOKEN_INVALID"
    );
  });

  it("does not reveal whether an address has an account", async () => {
    const { email } = await account();

    const known = await post("/auth/password-resets", { email });
    const unknown = await post("/auth/password-resets", { email: address() });

    expect(known.statusCode).toBe(unknown.statusCode);
    expect(known.body).toBe(unknown.body);
  });

  it("schedules no message for an address with no account", async () => {
    const unknown = address();
    await post("/auth/password-resets", { email: unknown });
    await processor.processBatch();

    expect(dispatcher.delivered.some((m) => m.recipient === unknown)).toBe(
      false
    );
  });

  it("stores no usable token until the message is dispatched", async () => {
    const { email } = await account();
    await post("/auth/password-resets", { email });

    const pending = await pool.query<{ tokenHash: string | null }>(
      `select r.token_hash as "tokenHash" from password_reset r
       join user_account u on u.id = r.user_id where u.email = $1`,
      [email]
    );
    expect(pending.rows[0]?.tokenHash).toBeNull();
  });
});
