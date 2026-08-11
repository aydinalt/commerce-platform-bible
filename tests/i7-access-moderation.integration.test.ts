import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import { ACCESS_MODERATION_SOURCE } from "../modules/identity/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import {
  moderationCaseSchema,
  requestCorrectionSchema,
  userAccessSchema
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
 * `US-PLT-F05-001` User Access Moderation Actions.
 *
 * The sharpest authority boundary in the Platform domain. An ordinary Admin
 * may move an ordinary account's access status and may not touch an account
 * that carries Admin authorization — because an Admin who could suspend other
 * Admins could suspend every other Admin, and the platform would have one.
 *
 * The second thing worth proving hard is how little else moves. Suspending an
 * owner does not restrict their Business, hide their Offerings or make
 * anything publicly ineligible.
 */
suite("Increment I7 User access moderation actions", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

  const address = () => `acc-${randomUUID()}@example.test`;
  const key = () => `K${randomUUID().replaceAll("-", "").toUpperCase()}`;
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
      userId: confirmed.json<{ userId: string }>().userId
    };
  };

  const authorize = (userId: string) =>
    pool.query(
      `insert into admin_authorization (user_id, granted_by) values ($1,'test')`,
      [userId]
    );

  const suspend = (userId: string) =>
    send("POST", `/admin/user-accounts/${userId}/suspension`, {
      cookie: admin.cookie
    });

  const reinstate = (userId: string) =>
    send("POST", `/admin/user-accounts/${userId}/reinstatement`, {
      cookie: admin.cookie
    });

  const accountStatus = (userId: string) =>
    pool.query<{ authorizations: string; status: string }>(
      `select u.status::text as status,
         (select count(*)::text from admin_authorization a
          where a.user_id = u.id) as authorizations
       from user_account u where u.id = $1`,
      [userId]
    );

  /// An owner with one Published Offering and an Affiliate Destination — every
  /// result suspension must leave alone.
  const ownerWithOffering = async () => {
    const account = await signUp();
    const created = await send("POST", "/businesses", {
      body: { name: "Kartal Motors", slug: slug() },
      cookie: account.cookie
    });
    const businessId = created.json<{ id: string }>().id;
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });
    const offering = await send("POST", `/businesses/${businessId}/offerings`, {
      body: { categoryId, slug: slug(), title: "Kırmızı araba" },
      cookie: account.cookie
    });
    const offeringId = offering.json<{ id: string }>().id;
    await send(
      "PUT",
      `/businesses/${businessId}/offerings/${offeringId}/content`,
      {
        body: { attributes: [], categoryId, title: "Kırmızı araba" },
        cookie: account.cookie
      }
    );
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/publication`,
      { cookie: account.cookie }
    );
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/affiliate-destination`,
      { body: { reference: "https://a.test" }, cookie: account.cookie }
    );
    return { ...account, businessId, offeringId };
  };

  const surroundings = (businessId: string, offeringId: string) =>
    pool.query<{
      destination: string;
      eligibility: string;
      exposure: string;
      lifecycle: string;
      moderation: string;
      projected: string;
    }>(
      `select o.status::text as lifecycle,
         b.public_exposure::text as exposure,
         coalesce(m.status::text,'UNRESTRICTED') as moderation,
         d.status::text as destination,
         coalesce((select p.status::text from offering_publication p
           where p.offering_id = o.id
           order by p.eligibility_version desc limit 1),'PENDING') as eligibility,
         (select count(*)::text from offering_search_projection s
           where s.offering_id = o.id) as projected
       from offering o
       join business b on b.id = o.business_id
       left join business_moderation_state m on m.business_id = b.id
       left join affiliate_destination d on d.offering_id = o.id
       where o.id = $2 and b.id = $1`,
      [businessId, offeringId]
    );

  beforeAll(async () => {
    process.env.ENABLE_TEST_PRINCIPAL = "false";
    process.env.NODE_ENV = "test";
    const { createApiApp } = await import("../apps/api/src/bootstrap.js");
    app = await createApiApp({ logLevel: "fatal" });
    processor = new OutboxProcessor({ dispatcher, publicWebUrl: ORIGIN });

    admin = await signUp();
    await authorize(admin.userId);
    await send("PUT", "/auth/me/admin-context", { cookie: admin.cookie });

    const category = await send("POST", "/admin/categories", {
      body: {
        domain: "MOBILITY",
        name: "Otomobil",
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });
    categoryId = category.json<{ id: string }>().id;
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

  it("suspends only an Enabled account, and consumes the exact transition", async () => {
    const account = await signUp();

    const suspended = await suspend(account.userId);
    const again = await suspend(account.userId);
    const after = await accountStatus(account.userId);

    // AC-1 and AC-2. Enabled is the one state Suspend starts from, and what it
    // produces is PRD-0003's Suspended.
    expect(suspended.statusCode).toBe(200);
    expect(userAccessSchema.parse(suspended.json())).toEqual({
      status: "SUSPENDED",
      userId: account.userId
    });
    expect(after.rows[0]?.status).toBe("SUSPENDED");
    expect(again.statusCode).toBe(409);
  });

  it("reinstates only a Suspended account, and consumes the exact transition", async () => {
    const account = await signUp();
    const premature = await reinstate(account.userId);
    await suspend(account.userId);

    const reinstated = await reinstate(account.userId);
    const after = await accountStatus(account.userId);

    // AC-3 and AC-4.
    expect(premature.statusCode).toBe(409);
    expect(reinstated.statusCode).toBe(200);
    expect(after.rows[0]?.status).toBe("ENABLED");
  });

  it("refuses an Admin-authorized account whatever state it is in", async () => {
    const other = await signUp();
    await authorize(other.userId);

    const refusedSuspend = await suspend(other.userId);
    await pool.query(
      `update user_account set status = 'SUSPENDED' where id = $1`,
      [other.userId]
    );
    const refusedReinstate = await reinstate(other.userId);
    const after = await accountStatus(other.userId);

    // AC-5 and AC-6. Both directions refused, and the state is irrelevant:
    // this account is not an ordinary Admin's to move at all. There is no
    // parameter, header or flag that opts into it — the Product Owner's path
    // is outside this surface entirely.
    expect(refusedSuspend.statusCode).toBe(403);
    expect(refusedSuspend.json<{ code: string }>().code).toBe(
      "ADMIN_TARGET_FORBIDDEN"
    );
    expect(refusedReinstate.statusCode).toBe(403);
    expect(after.rows[0]?.status).toBe("SUSPENDED");
  });

  it("preserves Admin authorization through suspension", async () => {
    const other = await signUp();
    await authorize(other.userId);

    // The Product Owner's operational path: a direct write, which is what
    // "outside the ordinary Admin UI" means in practice.
    await pool.query(
      `update user_account set status = 'SUSPENDED' where id = $1`,
      [other.userId]
    );
    const after = await accountStatus(other.userId);

    // AC-7. Suspension is about access, not about what the account was
    // granted. Nothing in this Story's path writes `admin_authorization` at
    // all, so the grant survives whichever way the account got here.
    expect(after.rows[0]?.status).toBe("SUSPENDED");
    expect(after.rows[0]?.authorizations).toBe("1");
  });

  it("leaves the account's Business, Offering and destination alone", async () => {
    const owner = await ownerWithOffering();
    const before = await surroundings(owner.businessId, owner.offeringId);

    await suspend(owner.userId);
    const suspended = await surroundings(owner.businessId, owner.offeringId);
    await reinstate(owner.userId);
    const reinstated = await surroundings(owner.businessId, owner.offeringId);

    // AC-8, and the reason it matters: the account was moderated, not the
    // Business. Suspending an owner does not quietly take their Offerings off
    // the public site, and reinstating them puts nothing back — because
    // nothing was taken.
    expect(suspended.rows[0]).toEqual(before.rows[0]);
    expect(reinstated.rows[0]).toEqual(before.rows[0]);
    expect(before.rows[0]?.projected).toBe("1");
  });

  it("ends the suspended account's sessions without ending its account", async () => {
    const account = await signUp();

    await suspend(account.userId);
    const authenticated = await send("GET", "/auth/sessions/current", {
      cookie: account.cookie
    });
    const stillThere = await accountStatus(account.userId);

    // `US-IDN-F06-001` AC-4 honoured rather than reinvented: a Suspended
    // holder enters no authenticated context. The account is still there,
    // which is what makes reinstatement mean something.
    expect(authenticated.statusCode).toBe(401);
    expect(stillThere.rows[0]?.status).toBe("SUSPENDED");
  });

  it("offers no User Account correction target", () => {
    const attempted = requestCorrectionSchema.safeParse({
      target: "USER_ACCOUNT"
    });

    // AC-9. Not refused by a check — `USER_ACCOUNT` is not a value the
    // correction target enum can take, in the contract or in the database.
    expect(attempted.success).toBe(false);
  });

  it("leaves the case Open and cites the action that was applied", async () => {
    const account = await signUp();
    const opened = moderationCaseSchema.parse(
      (
        await send("POST", "/admin/moderation-cases", {
          body: { targetType: "USER_ACCOUNT", userId: account.userId },
          cookie: admin.cookie
        })
      ).json()
    );

    const whileEnabled = opened.availableActions;
    await suspend(account.userId);
    const after = moderationCaseSchema.parse(
      (
        await send("GET", `/admin/moderation-cases/${opened.id}`, {
          cookie: admin.cookie
        })
      ).json()
    );

    // AC-10, and `US-PLT-F02-001` AC-5 completing itself: the case now offers
    // the User actions, because there is finally something behind them.
    expect(whileEnabled).toEqual(["SUSPEND_USER"]);
    expect(after.status).toBe("OPEN");
    expect(after.availableActions).toEqual(["REINSTATE_USER"]);
    expect(after.resolutions.map((r) => r.action)).toEqual(["SUSPEND_USER"]);
  });

  it("claims no transition when the action fails", async () => {
    const account = await signUp();
    const before = await accountStatus(account.userId);

    const refused = await reinstate(account.userId);
    const after = await accountStatus(account.userId);
    const sessions = await pool.query<{ count: string }>(
      `select count(*)::text as count from user_session
       where user_id = $1 and revoked_at is null`,
      [account.userId]
    );

    // AC-11. Nothing moved, including the sessions a suspension would have
    // revoked — the transaction refused rather than the service undoing
    // anything.
    expect(refused.statusCode).toBe(409);
    expect(after.rows[0]).toEqual(before.rows[0]);
    expect(Number(sessions.rows[0]?.count)).toBeGreaterThan(0);
  });

  it("names two transitions and their source states", () => {
    // AC-1 and AC-3 read without a database. There is no third entry, so
    // deleting an account is not something this action family can express.
    expect(ACCESS_MODERATION_SOURCE).toEqual({
      REINSTATE_USER: "SUSPENDED",
      SUSPEND_USER: "ENABLED"
    });
  });
});
