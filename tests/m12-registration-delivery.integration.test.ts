import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

const PASSWORD = "correct horse battery staple";
const WEB_URL = "http://localhost:3000";

/** Captures what would have been sent, so the message itself can be asserted. */
class RecordingDispatcher implements EmailDispatcher {
  readonly delivered: EmailMessage[] = [];

  deliver(message: EmailMessage): Promise<void> {
    this.delivered.push(message);
    return Promise.resolve();
  }
}

/**
 * Registration is only real if the proof reaches the person. This drives the
 * whole path — API writes the record and its outbox event, the worker mints the
 * token and produces the message, the API accepts that token — and checks that
 * the secret never lands in the database on the way.
 */
suite("Milestone 12 registration delivery", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;

  const address = () => `mail-${randomUUID()}@example.test`;

  const post = (url: string, body: unknown) =>
    app.inject({ body, method: "POST", url: `/api/v1${url}` });

  const tokenFrom = (message: EmailMessage) => {
    const link = /https?:\/\/\S+/u.exec(message.body)?.[0];
    if (!link) throw new Error("NO_LINK_IN_MESSAGE");
    return new URL(link).searchParams.get("token");
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

  it("schedules a delivery in the same transaction as the registration", async () => {
    const email = address();
    await post("/auth/registrations", { email, password: PASSWORD });

    const scheduled = await pool.query<{ total: number }>(
      `select count(*)::int as total
       from outbox_event o
       join pending_registration p on p.id = o.aggregate_id
       where p.email = $1 and o.processed_at is null`,
      [email]
    );
    // Neither can exist without the other, which is the point of the outbox.
    expect(scheduled.rows[0]?.total).toBe(1);
  });

  it("stores no usable token until the message is dispatched", async () => {
    const email = address();
    await post("/auth/registrations", { email, password: PASSWORD });

    const pending = await pool.query<{ tokenHash: string | null }>(
      `select token_hash as "tokenHash" from pending_registration where email = $1`,
      [email]
    );
    expect(pending.rows[0]?.tokenHash).toBeNull();
  });

  it("delivers a link whose token completes registration", async () => {
    const email = address();
    await post("/auth/registrations", { email, password: PASSWORD });

    const handled = await processor.processBatch();
    expect(handled).toBeGreaterThan(0);

    const message = dispatcher.delivered.find((m) => m.recipient === email);
    expect(message).toBeDefined();
    expect(message?.body).toContain(WEB_URL);

    const confirmed = await post("/auth/registrations/confirmations", {
      token: tokenFrom(message!)
    });
    expect(confirmed.statusCode).toBe(201);
  });

  it("never writes the delivered token to the database", async () => {
    const email = address();
    await post("/auth/registrations", { email, password: PASSWORD });
    await processor.processBatch();

    const token = tokenFrom(
      dispatcher.delivered.find((m) => m.recipient === email)!
    );
    expect(token).toBeTruthy();

    // The bearer value must appear nowhere: not on the pending record, not in
    // the outbox payload that carried the instruction to send it.
    const stored = await pool.query<{ total: number }>(
      `select (
         (select count(*) from pending_registration where token_hash = $1) +
         (select count(*) from outbox_event where payload::text like '%' || $1 || '%')
       )::int as total`,
      [token]
    );
    expect(stored.rows[0]?.total).toBe(0);
  });

  it("marks the event processed so it is not delivered twice", async () => {
    const email = address();
    await post("/auth/registrations", { email, password: PASSWORD });

    await processor.processBatch();
    const first = dispatcher.delivered.filter(
      (m) => m.recipient === email
    ).length;
    await processor.processBatch();
    const second = dispatcher.delivered.filter(
      (m) => m.recipient === email
    ).length;

    expect(first).toBe(1);
    expect(second).toBe(1);
  });

  it("invalidates the earlier link when registration is repeated", async () => {
    const email = address();
    await post("/auth/registrations", { email, password: PASSWORD });
    await processor.processBatch();
    const firstToken = tokenFrom(
      dispatcher.delivered.find((m) => m.recipient === email)!
    );

    dispatcher.delivered.length = 0;
    await post("/auth/registrations", { email, password: PASSWORD });
    await processor.processBatch();
    const secondToken = tokenFrom(
      dispatcher.delivered.find((m) => m.recipient === email)!
    );

    expect(secondToken).not.toBe(firstToken);
    const stale = await post("/auth/registrations/confirmations", {
      token: firstToken
    });
    const fresh = await post("/auth/registrations/confirmations", {
      token: secondToken
    });
    expect(stale.statusCode).toBe(400);
    expect(fresh.statusCode).toBe(201);
  });

  it("reports nothing about the message to the caller", async () => {
    const response = await post("/auth/registrations", {
      email: address(),
      password: PASSWORD
    });

    // The API must not hand back the proof it just scheduled to email.
    expect(response.statusCode).toBe(202);
    expect(response.body).not.toContain("token");
  });
});
