import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  errorEnvelopeSchema,
  sessionSchema
} from "../packages/contracts/src/index.js";

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

const ORIGIN = "http://localhost:3000";
const PASSWORD = "correct horse battery staple";

/**
 * Identity and Access baseline, exercised over HTTP. Each case names the
 * Acceptance Criterion it holds, so a regression points at the Frozen Story it
 * would break.
 */
suite("Milestone 12 identity baseline", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let app: NestFastifyApplication;

  const address = () => `m12-${randomUUID()}@example.test`;

  const post = (
    url: string,
    body: unknown,
    headers: Record<string, string> = {}
  ) => app.inject({ body, headers, method: "POST", url: `/api/v1${url}` });

  /** Completes registration and returns the address and its session cookie. */
  const register = async (email = address()) => {
    const begun = await post("/auth/registrations", {
      email,
      password: PASSWORD
    });
    const { registrationToken } = begun.json<{ registrationToken?: string }>();
    if (!registrationToken) throw new Error("NO_TOKEN_DISCLOSED");
    const confirmed = await post("/auth/registrations/confirmations", {
      token: registrationToken
    });
    return { confirmed, cookie: sessionCookie(confirmed), email };
  };

  const sessionCookie = (response: { cookies: unknown[] }) => {
    const cookies = response.cookies as { name: string; value: string }[];
    const found = cookies.find((c) => c.name === "commerce_session");
    return found ? `commerce_session=${found.value}` : "";
  };

  beforeAll(async () => {
    process.env.ENABLE_TEST_PRINCIPAL = "false";
    process.env.NODE_ENV = "test";
    const { createApiApp } = await import("../apps/api/src/bootstrap.js");
    app = await createApiApp({ logLevel: "fatal" });
  });

  // Throttling is keyed by client address, and every injected request shares
  // one. Cases that are not about throttling start from a clean counter; the
  // case that is about it builds its own.
  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("creates exactly one Enabled account once email control is proven", async () => {
    const { confirmed, email } = await register();

    expect(confirmed.statusCode).toBe(201);
    expect(sessionSchema.parse(confirmed.json())).toMatchObject({
      status: "ENABLED"
    });

    const accounts = await pool.query<{ status: string; total: number }>(
      `select count(*)::int as total, min(status::text) as status
       from user_account where email = $1`,
      [email]
    );
    // AC-3, AC-5: exactly one account, Enabled.
    expect(accounts.rows[0]).toMatchObject({ status: "ENABLED", total: 1 });
  });

  it("creates no account before email control is proven", async () => {
    const email = address();
    await post("/auth/registrations", { email, password: PASSWORD });

    // AC-2 and AC-7: the pending registration is not an account, and there is
    // no Pending account state for it to occupy.
    const accounts = await pool.query(
      `select 1 from user_account where email = $1`,
      [email]
    );
    const pending = await pool.query(
      `select 1 from pending_registration where email = $1`,
      [email]
    );
    expect(accounts.rowCount).toBe(0);
    expect(pending.rowCount).toBe(1);
  });

  it("does not reveal whether an address is already registered", async () => {
    const { email } = await register();

    const repeat = await post("/auth/registrations", {
      email,
      password: PASSWORD
    });
    const fresh = await post("/auth/registrations", {
      email: address(),
      password: PASSWORD
    });

    // AC-8 prevents a second account; the security baseline forbids revealing
    // that from the response.
    expect(repeat.statusCode).toBe(fresh.statusCode);
    const accounts = await pool.query(
      `select 1 from user_account where email = $1`,
      [email]
    );
    expect(accounts.rowCount).toBe(1);
  });

  it("refuses a registration link that has already been spent", async () => {
    const email = address();
    const begun = await post("/auth/registrations", {
      email,
      password: PASSWORD
    });
    const { registrationToken } = begun.json<{ registrationToken: string }>();

    const first = await post("/auth/registrations/confirmations", {
      token: registrationToken
    });
    const second = await post("/auth/registrations/confirmations", {
      token: registrationToken
    });

    expect(first.statusCode).toBe(201);
    expect(second.statusCode).toBe(400);
    expect(errorEnvelopeSchema.parse(second.json()).code).toBe(
      "REGISTRATION_TOKEN_INVALID"
    );
  });

  it("signs in with the registered address and password", async () => {
    const { email } = await register();

    const response = await post("/auth/sessions", {
      email,
      password: PASSWORD
    });

    // `US-IDN-F03-001` AC-1, AC-3.
    expect(response.statusCode).toBe(201);
    expect(sessionSchema.parse(response.json()).status).toBe("ENABLED");
  });

  it("answers a wrong password and an unknown address identically", async () => {
    const { email } = await register();

    const wrong = await post("/auth/sessions", {
      email,
      password: "not the password"
    });
    const unknown = await post("/auth/sessions", {
      email: address(),
      password: PASSWORD
    });

    expect(wrong.statusCode).toBe(401);
    expect(unknown.statusCode).toBe(401);
    expect(errorEnvelopeSchema.parse(wrong.json()).code).toBe(
      errorEnvelopeSchema.parse(unknown.json()).code
    );
  });

  it("refuses a Suspended account without disclosing the suspension", async () => {
    const { email } = await register();
    await pool.query(
      `update user_account set status = 'SUSPENDED' where email = $1`,
      [email]
    );

    const response = await post("/auth/sessions", {
      email,
      password: PASSWORD
    });

    // AC-4: no authenticated context. AC-5: indistinguishable from a rejected
    // credential, so suspension is not observable from outside.
    expect(response.statusCode).toBe(401);
    expect(errorEnvelopeSchema.parse(response.json()).code).toBe(
      "CREDENTIALS_REJECTED"
    );
  });

  it("drops an established session the moment the account is suspended", async () => {
    const { cookie, email } = await register();

    const before = await app.inject({
      headers: { cookie },
      method: "GET",
      url: "/api/v1/auth/sessions/current"
    });
    expect(before.statusCode).toBe(200);

    await pool.query(
      `update user_account set status = 'SUSPENDED' where email = $1`,
      [email]
    );

    const after = await app.inject({
      headers: { cookie },
      method: "GET",
      url: "/api/v1/auth/sessions/current"
    });
    // ADR-0012: the principal is rebuilt from current server state, so a
    // suspension takes effect without waiting for the session to expire.
    expect(after.statusCode).toBe(401);
  });

  it("issues an HTTP-only, SameSite session cookie carrying no account data", async () => {
    const { confirmed, email } = await register();
    const cookies = confirmed.cookies as {
      httpOnly?: boolean;
      name: string;
      sameSite?: string;
      value: string;
    }[];
    const session = cookies.find((c) => c.name === "commerce_session");

    expect(session?.httpOnly).toBe(true);
    expect(session?.sameSite?.toLowerCase()).toBe("strict");
    expect(session?.value).not.toContain(email);

    // Only the digest is persisted, so the bearer value is not in the database.
    const stored = await pool.query(
      `select 1 from user_session where token_hash = $1`,
      [session?.value ?? ""]
    );
    expect(stored.rowCount).toBe(0);
  });

  it("ends the session on logout and returns the person to Guest abilities", async () => {
    const { cookie } = await register();

    const loggedOut = await app.inject({
      headers: { cookie, origin: ORIGIN },
      method: "DELETE",
      url: "/api/v1/auth/sessions/current"
    });
    const after = await app.inject({
      headers: { cookie },
      method: "GET",
      url: "/api/v1/auth/sessions/current"
    });

    // `US-IDN-F04-001` AC-2, AC-3, AC-7.
    expect(loggedOut.statusCode).toBe(204);
    expect(after.statusCode).toBe(401);
  });

  it("retains the account after logout", async () => {
    const { cookie, email } = await register();
    await app.inject({
      headers: { cookie, origin: ORIGIN },
      method: "DELETE",
      url: "/api/v1/auth/sessions/current"
    });

    // AC-4: logout ends a context, it does not delete an account.
    const accounts = await pool.query(
      `select 1 from user_account where email = $1`,
      [email]
    );
    expect(accounts.rowCount).toBe(1);
  });

  it("refuses a cookie-authenticated mutation from an unrecognised origin", async () => {
    const { cookie } = await register();

    const foreign = await app.inject({
      headers: { cookie, origin: "https://attacker.example" },
      method: "DELETE",
      url: "/api/v1/auth/sessions/current"
    });
    const originless = await app.inject({
      headers: { cookie },
      method: "DELETE",
      url: "/api/v1/auth/sessions/current"
    });

    // ADR-0012 §2 requires origin validation on cookie-authenticated mutations.
    expect(foreign.statusCode).toBe(403);
    expect(errorEnvelopeSchema.parse(foreign.json()).code).toBe(
      "ORIGIN_REJECTED"
    );
    expect(originless.statusCode).toBe(403);
    expect(errorEnvelopeSchema.parse(originless.json()).code).toBe(
      "ORIGIN_MISSING"
    );
  });

  it("rejects a password below the recorded minimum length", async () => {
    const response = await post("/auth/registrations", {
      email: address(),
      password: "short"
    });

    expect(response.statusCode).toBe(400);
    expect(
      errorEnvelopeSchema.parse(response.json()).fieldErrors?.password
    ).toBeDefined();
  });

  it("throttles repeated registration attempts from one caller", async () => {
    const attempts = [];
    for (let index = 0; index <= 10; index += 1)
      attempts.push(
        await post("/auth/registrations", {
          email: address(),
          password: PASSWORD
        })
      );

    // `V1_SECURITY_ARCHITECTURE.md` requires registration and recovery
    // throttling; the last attempt must be refused.
    expect(attempts.at(-1)?.statusCode).toBe(429);
    expect(errorEnvelopeSchema.parse(attempts.at(-1)?.json()).code).toBe(
      "RATE_LIMITED"
    );
  });

  it("stores no password in a recoverable form", async () => {
    const { email } = await register();

    const stored = await pool.query<{ passwordHash: string }>(
      `select c.password_hash as "passwordHash"
       from user_credential c join user_account u on u.id = c.user_id
       where u.email = $1`,
      [email]
    );
    const hash = stored.rows[0]?.passwordHash ?? "";

    // Argon2id is mandated by ADR-0012 §2; the prefix proves the algorithm
    // rather than trusting a library default.
    expect(hash.startsWith("$argon2id$")).toBe(true);
    expect(hash).not.toContain(PASSWORD);
  });
});
