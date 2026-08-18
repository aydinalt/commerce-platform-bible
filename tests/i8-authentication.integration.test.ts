import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import loginPage from "../apps/web/src/app/login/page";
import registerPage from "../apps/web/src/app/register/page";
import { REFUSAL_COPY } from "../apps/web/src/identity/outcome";
import { AUTH_ROUTES } from "../apps/web/src/identity/session";

/// Login is a server component that resolves its search parameters, so a
/// render in a test has to hand it the same promise Next would.
const emptyParams = (): Promise<
  Record<string, string | string[] | undefined>
> => Promise.resolve({});

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
 * UX-0008 Authentication.
 *
 * The first surface with a secret to lose. Everything below is about what does
 * *not* happen: no context before proof, no context for a Suspended account,
 * no authority from recovery, no account deleted by signing out, no Business
 * chosen on somebody's behalf, and no token anywhere a person could read it.
 *
 * The screens are rendered through `react-dom/server` and the API is driven
 * through the real HTTP surface, because the promise being checked spans both:
 * a page that showed the right thing while the server did the wrong one would
 * pass either half alone.
 */
suite("Increment I8 Authentication", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;

  const address = () => `aut-${randomUUID()}@example.test`;
  const slug = () => `s-${randomUUID()}`;

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

  const sessionOf = (response: { cookies: unknown }) => {
    const cookies = response.cookies as { name: string; value: string }[];
    return cookies.find((c) => c.name === "commerce_session")?.value ?? "";
  };

  /// Registration up to but not past the proof link.
  const begin = async () => {
    const email = address();
    await send("POST", "/auth/registrations", {
      body: { email, password: PASSWORD }
    });
    await processor.processBatch();
    const message = dispatcher.delivered.find((m) => m.recipient === email);
    if (!message) throw new Error("NO_MESSAGE_DELIVERED");
    const link = /https?:\/\/\S+/u.exec(message.body)?.[0];
    if (!link) throw new Error("NO_LINK_IN_MESSAGE");
    return { email, link: new URL(link) };
  };

  const registered = async () => {
    const { email, link } = await begin();
    const confirmed = await send("POST", "/auth/registrations/confirmations", {
      body: { token: link.searchParams.get("token") }
    });
    return {
      cookie: `commerce_session=${sessionOf(confirmed)}`,
      email,
      session: sessionOf(confirmed),
      userId: confirmed.json<{ userId: string }>().userId
    };
  };

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    const { createApiApp } = await import("../apps/api/src/bootstrap.js");
    app = await createApiApp({ logLevel: "fatal" });
    processor = new OutboxProcessor({ dispatcher, pool, publicWebUrl: ORIGIN });
  });

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    dispatcher.delivered.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("points its links at the addresses the worker already writes", async () => {
    const { link } = await begin();

    // The proof link is minted by the worker and landed on by the web
    // application. If those two ever disagreed, every registration would end
    // at a page that does not exist — so the route constant and the delivered
    // address are checked against each other rather than each against a guess.
    expect(link.pathname).toBe(AUTH_ROUTES.confirm);
    expect(link.searchParams.get("token")).toBeTruthy();
  });

  it("creates no account and no context before proof", async () => {
    const { email } = await begin();

    const accounts = await pool.query<{ count: string }>(
      `select count(*)::text as count from user_account where email = $1`,
      [email]
    );
    const attempted = await send("POST", "/auth/sessions", {
      body: { email, password: PASSWORD }
    });

    // §6.2. Before proof there is no account at all — not a pending one, not a
    // disabled one. Signing in with the address that was submitted a moment
    // ago is refused exactly as an unknown address would be.
    expect(accounts.rows[0]?.count).toBe("0");
    expect(attempted.statusCode).toBe(401);
  });

  it("creates exactly one Enabled account and a session at proof", async () => {
    const { link } = await begin();

    const confirmed = await send("POST", "/auth/registrations/confirmations", {
      body: { token: link.searchParams.get("token") }
    });
    const account = await pool.query<{ status: string }>(
      `select status::text as status from user_account where id = $1`,
      [confirmed.json<{ userId: string }>().userId]
    );

    // §6.3. The account and the session arrive together, so there is no moment
    // in which one exists without the other.
    expect(confirmed.statusCode).toBe(201);
    expect(account.rows[0]?.status).toBe("ENABLED");
    expect(sessionOf(confirmed)).toBeTruthy();
  });

  it("creates no second account for an address that already has one", async () => {
    const account = await registered();

    await send("POST", "/auth/registrations", {
      body: { email: account.email, password: PASSWORD }
    });
    const accounts = await pool.query<{ count: string }>(
      `select count(*)::text as count from user_account where email = $1`,
      [account.email]
    );

    // §6.4. And nothing in the response distinguishes this from a first
    // attempt, which is why the Register screen can offer the route to Login
    // permanently rather than conditionally — it has nothing to condition on.
    expect(accounts.rows[0]?.count).toBe("1");
  });

  it("refuses a spent proof link the second time", async () => {
    const { link } = await begin();
    const token = link.searchParams.get("token");

    const first = await send("POST", "/auth/registrations/confirmations", {
      body: { token }
    });
    const second = await send("POST", "/auth/registrations/confirmations", {
      body: { token }
    });

    // The screen shows one message for a spent, expired or forged link,
    // because all three mean the same thing to the person holding it.
    expect(first.statusCode).toBe(201);
    expect(second.statusCode).toBe(400);
    expect(REFUSAL_COPY.TOKEN).toContain("no longer valid");
  });

  it("enters no context for a Suspended account", async () => {
    const account = await registered();
    await pool.query(
      `update user_account set status = 'SUSPENDED' where id = $1`,
      [account.userId]
    );

    const login = await send("POST", "/auth/sessions", {
      body: { email: account.email, password: PASSWORD }
    });
    const existing = await send("GET", "/auth/sessions/current", {
      cookie: account.cookie
    });
    const publicRead = await send("GET", "/discovery/browse");

    // §7. Neither a new session nor the one already held. Public Guest
    // behaviour is untouched, because it never depended on a session.
    //
    // The refusal is a `401` rather than anything that names suspension:
    // `US-IDN-F03-001` AC-4 and AC-5 make it identical to a wrong password, so
    // the login form has no way to disclose that an account was suspended.
    expect(login.statusCode).toBe(401);
    expect(existing.statusCode).toBe(401);
    expect(publicRead.statusCode).toBe(200);
  });

  it("keeps the account and its authority through recovery", async () => {
    const account = await registered();
    const business = await send("POST", "/businesses", {
      body: { name: "Kartal Motors", slug: slug() },
      cookie: account.cookie
    });
    await pool.query(
      `insert into admin_authorization (user_id, granted_by) values ($1,'test')`,
      [account.userId]
    );
    await pool.query(
      `update user_account set status = 'SUSPENDED' where id = $1`,
      [account.userId]
    );

    dispatcher.delivered.length = 0;
    await send("POST", "/auth/password-resets", {
      body: { email: account.email }
    });
    await processor.processBatch();
    const message = dispatcher.delivered.find(
      (m) => m.recipient === account.email
    );
    const resetLink = new URL(
      /https?:\/\/\S+/u.exec(message?.body ?? "")?.[0] ?? ""
    );
    const completed = await send("POST", "/auth/password-resets/completions", {
      body: {
        password: "a different correct horse",
        token: resetLink.searchParams.get("token")
      }
    });
    const after = await pool.query<{
      admins: string;
      owned: string;
      status: string;
    }>(
      `select u.status::text as status,
         (select count(*)::text from admin_authorization a where a.user_id = u.id) as admins,
         (select count(*)::text from business_owner o where o.user_id = u.id) as owned
       from user_account u where u.id = $1`,
      [account.userId]
    );

    // §9.3. The same account, still Suspended, still owning what it owned and
    // still authorized for what it was authorized for. Recovery changes a
    // password and grants nothing.
    expect(resetLink.pathname).toBe(AUTH_ROUTES.reset);
    expect(completed.statusCode).toBe(204);
    expect(after.rows[0]).toEqual({
      admins: "1",
      owned: "1",
      status: "SUSPENDED"
    });
    expect(business.statusCode).toBe(201);
  });

  it("ends the context on sign-out and keeps everything else", async () => {
    const account = await registered();
    await send("POST", "/businesses", {
      body: { name: "Kartal Motors", slug: slug() },
      cookie: account.cookie
    });
    await pool.query(
      `insert into admin_authorization (user_id, granted_by) values ($1,'test')`,
      [account.userId]
    );

    await send("DELETE", "/auth/sessions/current", { cookie: account.cookie });
    const after = await send("GET", "/auth/sessions/current", {
      cookie: account.cookie
    });
    const kept = await pool.query<{
      admins: string;
      owned: string;
      status: string;
    }>(
      `select u.status::text as status,
         (select count(*)::text from admin_authorization a where a.user_id = u.id) as admins,
         (select count(*)::text from business_owner o where o.user_id = u.id) as owned
       from user_account u where u.id = $1`,
      [account.userId]
    );

    // §8.4. The context ends and nothing else does: not the account, not the
    // ownership, not the authorization.
    expect(after.statusCode).toBe(401);
    expect(kept.rows[0]).toEqual({
      admins: "1",
      owned: "1",
      status: "ENABLED"
    });
  });

  it("enters no Business and no Admin context by signing in", async () => {
    const account = await registered();
    await send("POST", "/businesses", {
      body: { name: "Kartal Motors", slug: slug() },
      cookie: account.cookie
    });
    await pool.query(
      `insert into admin_authorization (user_id, granted_by) values ($1,'test')`,
      [account.userId]
    );

    const login = await send("POST", "/auth/sessions", {
      body: { email: account.email, password: PASSWORD }
    });
    const session = login.json<{
      adminAuthorized: boolean;
      adminContext: boolean;
      selectedBusinessId: string | null;
    }>();

    // §8.1. Owning exactly one Business does not enter it, and being
    // authorized for Admin does not enter that either. Both remain offers.
    expect(session.selectedBusinessId).toBeNull();
    expect(session.adminAuthorized).toBe(true);
    expect(session.adminContext).toBe(false);
  });

  it("puts no secret in any page it renders", async () => {
    // Login resolves its search parameters, so the element is awaited before
    // it is rendered. UX-0009 §11.2 is why it reads them at all: an
    // interrupted Direct Contact names where it resumes.
    const rendered = [
      renderToStaticMarkup(await loginPage({ searchParams: emptyParams() })),
      renderToStaticMarkup(registerPage())
    ].join("");

    // The token never reaches a page, and the password field is never given a
    // value: §13 preserves entered non-secret context, and a password put back
    // into a field is a password sitting in somebody's markup.
    expect(rendered).not.toMatch(/commerce_session|token=/u);
    expect(rendered).toMatch(/type="password"/u);
    expect(rendered).not.toMatch(/type="password"[^>]*value=/u);
  });

  it("offers recovery from Login without having to fail first", async () => {
    const rendered = renderToStaticMarkup(
      await loginPage({ searchParams: emptyParams() })
    );

    // §14 leaves somebody who failed able to retry *or* begin recovery. Making
    // the second route appear only after a failure would hide it from the
    // person who already knows they have forgotten.
    expect(rendered).toContain(AUTH_ROUTES.recover);
    expect(rendered).toContain(AUTH_ROUTES.register);
  });

  it("names every route once", () => {
    // The worker's links, the pages and the redirects all read the same
    // constants, so a renamed route cannot leave a message pointing at a page
    // that no longer exists.
    expect(AUTH_ROUTES).toEqual({
      account: "/account",
      confirm: "/register/confirm",
      login: "/login",
      recover: "/recover",
      register: "/register",
      reset: "/recover/reset"
    });
  });
});
