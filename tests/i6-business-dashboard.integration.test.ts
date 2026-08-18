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
  businessDashboardSchema,
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
 * `US-BUS-F04-001` Business Dashboard and Context Selection.
 *
 * Two things that are easy to confuse: which Business a person is *looking at*
 * and which Business the platform would act on. The Story keeps them apart, so
 * this suite spends most of its time on switching — what it changes, what it
 * must not touch, and what happens when it fails.
 */
suite("Increment I6 Business Dashboard and context selection", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let leafId: string;

  const address = () => `dsh-${randomUUID()}@example.test`;
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

  const createBusiness = async (cookie: string, name: string) => {
    const created = await send("POST", "/businesses", {
      body: { name, slug: slug() },
      cookie
    });
    return created.json<{ id: string }>().id;
  };

  const publishInto = async (
    cookie: string,
    businessId: string,
    publish: boolean
  ) => {
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie
    });
    const offering = await send("POST", `/businesses/${businessId}/offerings`, {
      body: { categoryId: leafId, slug: slug(), title: "Kırmızı araba" },
      cookie
    });
    const offeringId = offering.json<{ id: string }>().id;
    await send(
      "PUT",
      `/businesses/${businessId}/offerings/${offeringId}/content`,
      {
        body: { attributes: [], categoryId: leafId, title: "Kırmızı araba" },
        cookie
      }
    );
    if (publish)
      await send(
        "POST",
        `/businesses/${businessId}/offerings/${offeringId}/publication`,
        { cookie }
      );
    return offeringId;
  };

  const dashboard = (businessId: string, cookie?: string) =>
    send("GET", `/businesses/${businessId}/dashboard`, {
      ...(cookie === undefined ? {} : { cookie })
    });

  const session = async (cookie: string) =>
    sessionSchema.parse(
      (await send("GET", "/auth/sessions/current", { cookie })).json()
    );

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    const { createApiApp } = await import("../apps/api/src/bootstrap.js");
    app = await createApiApp({ logLevel: "fatal" });
    processor = new OutboxProcessor({ dispatcher, publicWebUrl: ORIGIN });

    admin = await signUp();
    await pool.query(
      `insert into admin_authorization (user_id, granted_by) values ($1,'test')`,
      [admin.userId]
    );
    await send("PUT", "/auth/me/admin-context", { cookie: admin.cookie });

    const leaf = await send("POST", "/admin/categories", {
      body: {
        domain: "MOBILITY",
        name: "Otomobil",
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });
    leafId = leaf.json<{ id: string }>().id;
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

  it("opens only for an Enabled owner of that exact Business", async () => {
    const account = await signUp();
    const stranger = await signUp();
    const businessId = await createBusiness(account.cookie, "Kartal Motors");

    // AC-1. Three ways of not being the owner, and one answer to all of them.
    expect((await dashboard(businessId, account.cookie)).statusCode).toBe(200);
    expect((await dashboard(businessId, stranger.cookie)).statusCode).toBe(404);
    expect((await dashboard(businessId)).statusCode).toBe(401);
  });

  it("names the Business and its Moderation Status", async () => {
    const account = await signUp();
    const businessId = await createBusiness(account.cookie, "Kartal Motors");

    const before = businessDashboardSchema.parse(
      (await dashboard(businessId, account.cookie)).json()
    );
    await send("POST", `/admin/businesses/${businessId}/restriction`, {
      cookie: admin.cookie
    });
    const after = businessDashboardSchema.parse(
      (await dashboard(businessId, account.cookie)).json()
    );

    // AC-2. An owner should learn that their Business is Restricted here,
    // rather than by being refused somewhere else.
    expect(before.business.name).toBe("Kartal Motors");
    expect(before.business.moderationStatus).toBe("UNRESTRICTED");
    expect(after.business.moderationStatus).toBe("RESTRICTED");
    expect(after.business.publicExposure).toBe("INELIGIBLE");
  });

  it("organizes the inventory by lifecycle and adds nothing to it", async () => {
    const account = await signUp();
    const businessId = await createBusiness(account.cookie, "Kartal Motors");
    const draftId = await publishInto(account.cookie, businessId, false);
    const publishedId = await publishInto(account.cookie, businessId, true);

    const view = businessDashboardSchema.parse(
      (await dashboard(businessId, account.cookie)).json()
    );

    // AC-9. Lifecycle-organized, by reference, and carrying the authoritative
    // eligibility PRD-0001 owns rather than a second opinion about it.
    expect(view.inventory.DRAFT.map((entry) => entry.id)).toEqual([draftId]);
    expect(view.inventory.PUBLISHED.map((entry) => entry.id)).toEqual([
      publishedId
    ]);
    expect(view.inventory.HIDDEN).toEqual([]);
    expect(view.inventory.ARCHIVED).toEqual([]);
    expect(view.inventory.PUBLISHED[0]?.publicEligibility).toBe("ELIGIBLE");
  });

  it("reports no metric, ranking or trend of any kind", async () => {
    const account = await signUp();
    const businessId = await createBusiness(account.cookie, "Kartal Motors");
    await publishInto(account.cookie, businessId, true);

    const response = await dashboard(businessId, account.cookie);

    // AC-10. The shape is exactly two things, and neither can hold a figure
    // about performance. A person who wants to know how many Offerings they
    // have can count the ones in front of them.
    const body = response.json<Record<string, unknown>>();
    expect(Object.keys(body).sort()).toEqual(["business", "inventory"]);
    expect(response.body).not.toMatch(
      /count|total|views|revenue|conversion|rank|trend|score/iu
    );
  });

  it("enters the sole owned Business without inventing a second identity", async () => {
    const account = await signUp();
    const businessId = await createBusiness(account.cookie, "Kartal Motors");

    const entered = await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });

    // AC-3. The same account, now acting for its Business — the session says
    // which, and the person is still the person.
    const current = sessionSchema.parse(entered.json());
    expect(current.selectedBusinessId).toBe(businessId);
    expect(current.userId).toBe(account.userId);
  });

  it("requires an explicit choice where more than one Business is owned", async () => {
    const account = await signUp();
    const first = await createBusiness(account.cookie, "Kartal Motors");
    const second = await createBusiness(account.cookie, "Deniz Emlak");

    const owned = await send("GET", "/auth/me/businesses", {
      cookie: account.cookie
    });

    // AC-4. Owning two does not select either: the baseline stays until the
    // person says which, and nothing picks the first one for them.
    expect((await session(account.cookie)).selectedBusinessId).toBeNull();
    expect(
      owned.json<{ businesses: { id: string }[] }>().businesses.map((b) => b.id)
    ).toEqual(expect.arrayContaining([first, second]));
  });

  it("changes only the active context when switching", async () => {
    const account = await signUp();
    const first = await createBusiness(account.cookie, "Kartal Motors");
    const second = await createBusiness(account.cookie, "Deniz Emlak");
    const before = await pool.query<{ count: string }>(
      `select count(*)::text as count from business_owner where user_id = $1`,
      [account.userId]
    );

    await send("PUT", "/auth/me/business-context", {
      body: { businessId: first },
      cookie: account.cookie
    });
    await send("PUT", "/auth/me/business-context", {
      body: { businessId: second },
      cookie: account.cookie
    });

    // AC-5. Ownership is unchanged — switching is about where the person is
    // standing, not about what they have.
    expect((await session(account.cookie)).selectedBusinessId).toBe(second);
    const after = await pool.query<{ count: string }>(
      `select count(*)::text as count from business_owner where user_id = $1`,
      [account.userId]
    );
    expect(after.rows[0]?.count).toBe(before.rows[0]?.count);
  });

  it("applies no management action to the Business that is not active", async () => {
    const account = await signUp();
    const first = await createBusiness(account.cookie, "Kartal Motors");
    const second = await createBusiness(account.cookie, "Deniz Emlak");
    await send("PUT", "/auth/me/business-context", {
      body: { businessId: second },
      cookie: account.cookie
    });

    const created = await send("POST", `/businesses/${first}/offerings`, {
      body: { categoryId: leafId, slug: slug(), title: "Yanlış işletme" },
      cookie: account.cookie
    });

    // AC-6. An action aimed at a Business whose context is not selected is not
    // quietly applied to the active one — it is not applied at all. The refusal
    // names the missing context rather than hiding the Business, because the
    // person does own it.
    expect(created.statusCode).toBe(403);
    expect(created.json<{ code: string }>().code).toBe(
      "BUSINESS_CONTEXT_REQUIRED"
    );
    const offerings = await pool.query<{ count: string }>(
      `select count(*)::text as count from offering where business_id = $1`,
      [first]
    );
    expect(offerings.rows[0]?.count).toBe("0");
  });

  it("re-evaluates the account on entry and after a switch", async () => {
    const account = await signUp();
    const businessId = await createBusiness(account.cookie, "Kartal Motors");
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });

    await pool.query(
      `update user_account set status = 'SUSPENDED' where id = $1`,
      [account.userId]
    );
    const opened = await dashboard(businessId, account.cookie);
    const switched = await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });

    // AC-7. Suspended a moment ago, and the Dashboard is closed now — the
    // status is asked again rather than remembered from the switch.
    expect(opened.statusCode).toBe(401);
    expect(switched.statusCode).toBe(401);
  });

  it("treats Admin authorization as no kind of ownership", async () => {
    const account = await signUp();
    const businessId = await createBusiness(account.cookie, "Kartal Motors");

    const opened = await dashboard(businessId, admin.cookie);
    const entered = await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: admin.cookie
    });

    // AC-8. An Admin can moderate this Business and still cannot stand inside
    // it: the two are different authorities over different things.
    expect(opened.statusCode).toBe(404);
    expect(entered.statusCode).toBe(404);
  });

  it("keeps the last confirmed Business when a switch fails", async () => {
    const account = await signUp();
    const stranger = await signUp();
    const mine = await createBusiness(account.cookie, "Kartal Motors");
    const theirs = await createBusiness(stranger.cookie, "Başkasının");
    await send("PUT", "/auth/me/business-context", {
      body: { businessId: mine },
      cookie: account.cookie
    });

    const refused = await send("PUT", "/auth/me/business-context", {
      body: { businessId: theirs },
      cookie: account.cookie
    });

    // AC-11. The ownership test lives inside the statement that writes the
    // selection, so a refused switch updates nothing — there is no moment when
    // the person is standing nowhere.
    expect(refused.statusCode).toBe(404);
    expect((await session(account.cookie)).selectedBusinessId).toBe(mine);
  });

  it("answers a Dashboard for a Business that does not exist as absent", async () => {
    const account = await signUp();

    const missing = await dashboard(randomUUID(), account.cookie);

    // A Business someone else owns and one that never existed look the same
    // from outside, which is the only answer that leaks nothing.
    expect(missing.statusCode).toBe(404);
  });
});
