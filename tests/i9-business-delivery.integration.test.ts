import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import { silentLogger } from "../packages/testing/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";

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
 * The Business criteria that nothing yet asserted.
 *
 * Reading all 95 against the suite found the Business Stories close to fully
 * covered — `i6-business-dashboard`, `i6-offering-management`,
 * `i6-destination-management` and `i6-correction-notice` were each written
 * criterion by criterion and line up almost one to one. Two gaps survived, and
 * both are about a gate that exists in the code with nothing watching it.
 */
suite("Increment I9 Business delivery evidence", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;

  const address = () => `bd-${randomUUID()}@example.test`;
  const slug = () => `s-${randomUUID()}`;

  const send = (
    method: "GET" | "POST" | "PUT",
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
    const link = /https?:\/\/\S+/u.exec(message?.body ?? "")?.[0] ?? "";
    const confirmed = await send("POST", "/auth/registrations/confirmations", {
      body: { token: new URL(link).searchParams.get("token") }
    });
    const cookies = confirmed.cookies as { name: string; value: string }[];
    return {
      cookie: `commerce_session=${cookies.find((c) => c.name === "commerce_session")?.value ?? ""}`,
      userId: confirmed.json<{ userId: string }>().userId
    };
  };

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
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

  it("creates no Business for an account that is not Enabled", async () => {
    const account = await signUp();
    const before = await pool.query<{ count: string }>(
      `select count(*)::text as count from business_owner where user_id = $1`,
      [account.userId]
    );
    await pool.query(
      `update user_account set status = 'SUSPENDED' where id = $1`,
      [account.userId]
    );

    const refused = await send("POST", "/businesses", {
      body: { name: "Kartal Motors", slug: slug() },
      cookie: account.cookie
    });
    const after = await pool.query<{ count: string }>(
      `select count(*)::text as count from business_owner where user_id = $1`,
      [account.userId]
    );

    // `US-BUS-F01-001` AC-1. The Story asks for an *Enabled* authenticated
    // account, and being authenticated was the only half anything checked.
    // `BusinessService.create` has refused a suspended holder since I2; nothing
    // watched it, so nothing would have noticed the check being dropped.
    //
    // The row count is asserted either side because a refusal that still wrote
    // the Business would be the failure worth catching, and a status code alone
    // would not see it.
    expect(refused.statusCode).toBeGreaterThanOrEqual(400);
    expect(after.rows[0]?.count).toBe(before.rows[0]?.count);
  });

  it("refuses the suspended holder exactly as it refuses a stranger", async () => {
    const account = await signUp();
    await pool.query(
      `update user_account set status = 'SUSPENDED' where id = $1`,
      [account.userId]
    );

    const suspended = await send("POST", "/businesses", {
      body: { name: "Kartal Motors", slug: slug() },
      cookie: account.cookie
    });
    const stranger = await send("POST", "/businesses", {
      body: { name: "Kartal Motors", slug: slug() }
    });

    // AC-1, from the side that says *where* the gate is. Suspension ends the
    // session, so creation is refused before any Business rule is consulted —
    // the two answers are the same answer, and neither mentions the account.
    //
    // Worth recording because it means `BusinessService.create`'s own Enabled
    // check cannot be reached over HTTP by this route. It is a second gate
    // behind a closed one, which is a reasonable thing to keep and a
    // misleading thing to cite as the evidence.
    expect(suspended.statusCode).toBe(401);
    expect(stranger.statusCode).toBe(401);
    expect(suspended.json<{ code: string }>().code).toBe(
      stranger.json<{ code: string }>().code
    );
  });

  it("gives a Business no public address of its own", async () => {
    const account = await signUp();
    const created = await send("POST", "/businesses", {
      body: { name: "Kartal Motors", slug: slug() },
      cookie: account.cookie
    });
    const businessId = created.json<{ id: string }>().id;

    const asGuest = await Promise.all([
      send("GET", "/businesses"),
      send("GET", `/businesses/${businessId}/information`),
      send("GET", `/businesses/${businessId}/dashboard`)
    ]);

    // `US-BUS-F01-001` AC-11. Creating a Business produces no public page for
    // it. Every address that names a Business is a management address and
    // answers a Guest as such — the only public surface carrying any Business
    // information at all is the Offering Presentation, which carries the
    // identity set and is covered by `i4-offering-presentation`.
    for (const answer of asGuest)
      expect(answer.statusCode).toBeGreaterThanOrEqual(400);
  });
});
