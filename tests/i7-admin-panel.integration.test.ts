import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import { ADMIN_PANEL_FUNCTIONS } from "../modules/moderation/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { adminPanelSchema } from "../packages/contracts/src/index.js";

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
 * `US-PLT-F01-001` Admin Panel Access and Baseline.
 *
 * The Story is about a door and what is not behind it. Three conditions open
 * it, all three are re-read on every request, and the Panel that opens carries
 * no way to make another Admin — which is the part worth proving hardest,
 * because a provisioning action that leaked into the Panel would let one Admin
 * quietly manufacture more.
 */
suite("Increment I7 Admin Panel access and baseline", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;

  const address = () => `pnl-${randomUUID()}@example.test`;
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

  const authorize = (userId: string) =>
    pool.query(
      `insert into admin_authorization (user_id, granted_by) values ($1,'test')`,
      [userId]
    );

  /// An Admin who has entered the context, which is a separate act from being
  /// authorized for it.
  const admin = async (options: { enter?: boolean } = {}) => {
    const account = await signUp();
    await authorize(account.userId);
    if (options.enter !== false)
      await send("PUT", "/auth/me/admin-context", { cookie: account.cookie });
    return account;
  };

  const panel = (cookie: string) => send("GET", "/admin/panel", { cookie });

  beforeAll(async () => {
    process.env.ENABLE_TEST_PRINCIPAL = "false";
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

  it("opens only for an Enabled, authorized, entered account", async () => {
    const entered = await admin();
    const notEntered = await admin({ enter: false });
    const unauthorized = await signUp();

    // AC-1. Three conditions, and each of the two that can be removed
    // independently closes the Panel on its own.
    expect((await panel(entered.cookie)).statusCode).toBe(200);
    expect((await panel(notEntered.cookie)).statusCode).toBe(403);
    expect((await panel(unauthorized.cookie)).statusCode).toBe(403);
    expect((await panel("commerce_session=nonsense")).statusCode).toBe(401);
  });

  it("uses the existing account and publishes no separate Admin identity", async () => {
    const account = await admin();

    const opened = adminPanelSchema.parse((await panel(account.cookie)).json());
    const accounts = await pool.query<{ count: string }>(
      `select count(*)::text as count from user_account where email = $1`,
      [account.email]
    );

    // AC-2. The Panel names the same account that signed in. There is no Admin
    // identifier to publish, because there is no separate Admin identity — and
    // the contract has no field one could appear in.
    expect(opened.userId).toBe(account.userId);
    expect(accounts.rows[0]?.count).toBe("1");
    expect(Object.keys(opened).sort()).toEqual([
      "functions",
      "inheritedBaselines",
      "ownedBusinessIds",
      "userId"
    ]);
  });

  it("closes the moment the authorization is removed", async () => {
    const account = await admin();
    const before = await panel(account.cookie);

    await pool.query(`delete from admin_authorization where user_id = $1`, [
      account.userId
    ]);
    const after = await panel(account.cookie);

    // AC-3. Nothing is remembered from the entry: the authorization is joined
    // into the session read, so a grant withdrawn a moment ago closes the
    // Panel on the next request rather than at the next sign-in.
    expect(before.statusCode).toBe(200);
    expect(after.statusCode).toBe(403);
  });

  it("takes nothing away by being entered", async () => {
    const account = await admin();

    const opened = adminPanelSchema.parse((await panel(account.cookie)).json());
    const publicRead = await send("GET", "/discovery/browse");
    const ownBusiness = await send("POST", "/businesses", {
      body: { name: "Admin's own", slug: slug() },
      cookie: account.cookie
    });

    // AC-4. Guest and authenticated User abilities survive entry, and the
    // Panel says so rather than leaving it to be inferred from nothing having
    // refused them.
    expect(opened.inheritedBaselines.sort()).toEqual([
      "AUTHENTICATED_USER",
      "GUEST"
    ]);
    expect(publicRead.statusCode).toBe(200);
    expect(ownBusiness.statusCode).toBe(201);
  });

  it("keeps Admin behaviour unavailable outside the context", async () => {
    const account = await admin();
    await send("DELETE", "/auth/me/admin-context", { cookie: account.cookie });

    const closed = await panel(account.cookie);
    const adminAction = await send("POST", "/admin/categories", {
      body: {
        domain: "MOBILITY",
        name: "Otomobil",
        slug: slug(),
        stableKey: `K${randomUUID().replaceAll("-", "").toUpperCase()}`
      },
      cookie: account.cookie
    });

    // AC-5. Leaving the context withdraws the Panel and everything it lists.
    // The authorization is untouched; what changed is where the person is.
    expect(closed.statusCode).toBe(403);
    expect(adminAction.statusCode).toBe(403);
  });

  it("grants no Business ownership from authorization alone", async () => {
    const owner = await signUp();
    const created = await send("POST", "/businesses", {
      body: { name: "Someone else's", slug: slug() },
      cookie: owner.cookie
    });
    const businessId = created.json<{ id: string }>().id;
    const account = await admin();

    const opened = adminPanelSchema.parse((await panel(account.cookie)).json());
    const dashboard = await send(`GET`, `/businesses/${businessId}/dashboard`, {
      cookie: account.cookie
    });
    const context = await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });

    // AC-6. The Panel lists what this account owns in its own right, which is
    // nothing. Admin authorization opens no Business Dashboard and enters no
    // Business context — and both refusals are the same "not there" a stranger
    // gets, because an Admin has no standing to learn that the Business exists
    // through an ownership route.
    expect(opened.ownedBusinessIds).toEqual([]);
    expect(dashboard.statusCode).toBe(404);
    expect(context.statusCode).toBe(404);
  });

  it("offers no way to grant, remove, transfer or delegate Admin", async () => {
    const account = await admin();

    const opened = adminPanelSchema.parse((await panel(account.cookie)).json());
    const attempts = await Promise.all(
      [
        ["POST", "/admin/authorizations"],
        ["POST", "/admin/panel/authorizations"],
        ["PUT", "/admin/panel/admins"],
        ["DELETE", "/admin/authorizations"]
      ].map(([method, url]) =>
        send(method as "DELETE" | "POST" | "PUT", url, {
          body: {},
          cookie: account.cookie
        })
      )
    );

    // AC-7 and AC-8. Twice over: no provisioning verb is a value the Panel
    // vocabulary can hold, and no route spells one. An ordinary Admin cannot
    // make another Admin because there is nothing to call.
    expect(JSON.stringify(opened.functions)).not.toMatch(
      /grant|remove|transfer|delegate|tier|provision/iu
    );
    for (const attempt of attempts)
      expect([403, 404]).toContain(attempt.statusCode);
  });

  it("reserves authorization changes to an operational path outside the Panel", async () => {
    const account = await admin();
    const other = await signUp();

    const opened = adminPanelSchema.parse((await panel(account.cookie)).json());
    const beforeCount = await pool.query<{ count: string }>(
      `select count(*)::text as count from admin_authorization`
    );
    // The only way to authorize an account is a direct write — which is to say,
    // an operational act by whoever holds the database, not a request anybody
    // can make.
    await authorize(other.userId);
    const afterCount = await pool.query<{ count: string }>(
      `select count(*)::text as count from admin_authorization`
    );

    // AC-9. Granting works and is reachable only this way; the Panel's
    // published surface contains nothing that could have done it.
    expect(Number(afterCount.rows[0]?.count)).toBe(
      Number(beforeCount.rows[0]?.count) + 1
    );
    expect(opened.functions).toEqual([...ADMIN_PANEL_FUNCTIONS]);
  });

  it("denies a Suspended Admin while leaving public behaviour alone", async () => {
    const account = await admin();
    await pool.query(
      `update user_account set status = 'SUSPENDED' where id = $1`,
      [account.userId]
    );

    const closed = await panel(account.cookie);
    const publicRead = await send("GET", "/discovery/browse", {
      cookie: account.cookie
    });

    // AC-10. Suspension ends the authenticated session, so the Panel answers
    // as it would to a stranger — and the public site goes on working, because
    // it never depended on the session in the first place.
    expect(closed.statusCode).toBe(401);
    expect(publicRead.statusCode).toBe(200);
  });

  it("ends the context on logout and keeps the authorization", async () => {
    const account = await admin();

    await send("DELETE", "/auth/sessions/current", { cookie: account.cookie });
    const afterLogout = await panel(account.cookie);
    const authorization = await pool.query<{ count: string }>(
      `select count(*)::text as count from admin_authorization where user_id = $1`,
      [account.userId]
    );

    // AC-11. The context is gone and the account keeps what it was granted:
    // signing out is not a demotion.
    expect(afterLogout.statusCode).toBe(401);
    expect(authorization.rows[0]?.count).toBe("1");
  });

  it("lists only Platform behaviour that exists", async () => {
    const account = await admin();
    const opened = adminPanelSchema.parse((await panel(account.cookie)).json());

    // AC-5, read as a promise rather than a roadmap: every function the Panel
    // names has a route behind it today. The rest of PRD-0006 is absent, which
    // is the honest way to say "not yet" — a Panel that showed something it
    // could not open would be offering an action the platform then declines.
    const routes: Record<string, string> = {
      ADMINISTER_AFFILIATE_DESTINATIONS:
        "/admin/offerings/{offeringId}/affiliate-destination",
      MANAGE_ATTRIBUTE_DEFINITIONS: "/admin/attributes",
      MANAGE_CATEGORIES: "/admin/categories",
      MANAGE_MODERATION_CASES: "/admin/moderation-cases",
      MODERATE_OFFERINGS: "/admin/offerings/{offeringId}/concealment",
      MODERATE_USER_ACCESS: "/admin/user-accounts/{userId}/suspension",
      MODERATE_BUSINESSES: "/admin/businesses/{businessId}/restriction",
      READ_OFFERING_HISTORY: "/admin/offerings/{offeringId}",
      REQUEST_CORRECTION: "/admin/businesses/{businessId}/correction-requests"
    };
    const { default: document } = await import("../generated/openapi.json", {
      with: { type: "json" }
    });
    const paths = Object.keys(
      (document as { paths: Record<string, unknown> }).paths
    );
    for (const capability of opened.functions)
      expect(paths).toContain(`/api/v1${routes[capability]}`);
  });
});
