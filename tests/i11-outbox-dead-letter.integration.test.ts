import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { EmailRefusedError } from "@commerce/notification";
import type { EmailDispatcher, EmailMessage } from "@commerce/notification";

import {
  MAX_DELIVERY_ATTEMPTS,
  OutboxProcessor
} from "../apps/worker/src/outbox.processor.js";

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

const ORIGIN = "http://localhost:3000";
const PASSWORD = "correct horse battery staple";

/** Answers however the test asks it to, and counts how often it was asked. */
class ScriptedDispatcher implements EmailDispatcher {
  attempts = 0;
  answer: () => void = () => undefined;

  deliver(_message: EmailMessage): Promise<void> {
    this.attempts += 1;
    this.answer();
    return Promise.resolve();
  }
}

/**
 * What the outbox does when delivery does not succeed.
 *
 * The queue retried everything, forever. A provider outage and an address that
 * will never be accepted were the same event to it, so the second became a
 * message the platform sent itself every few minutes for the life of the
 * deployment — and nothing said which rows were in that state.
 */
suite("Increment I11 outbox dead letters", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new ScriptedDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;

  const address = () => `ob-${randomUUID()}@example.test`;

  const send = (method: "POST", url: string, body: unknown) =>
    app.inject({
      body,
      headers: { origin: ORIGIN },
      method,
      url: `/api/v1${url}`
    });

  /** A registration, which leaves exactly one unprocessed outbox event. */
  const requestRegistration = async () => {
    const email = address();
    await send("POST", "/auth/registrations", { email, password: PASSWORD });
    const row = await pool.query<{ id: string }>(
      `select o.id from outbox_event o
       join pending_registration p on p.id = o.aggregate_id
       where p.email = $1`,
      [email]
    );
    return row.rows[0]?.id ?? "";
  };

  const eventRow = async (id: string) =>
    (
      await pool.query<{ attempts: number; processed: boolean }>(
        `select attempts, processed_at is not null as processed
         from outbox_event where id = $1`,
        [id]
      )
    ).rows[0];

  /** Makes the event claimable again without waiting out the backoff. */
  const makeAvailable = async (id: string) => {
    await pool.query(
      `update outbox_event set available_at = now() - interval '1 second'
       where id = $1`,
      [id]
    );
  };

  beforeAll(async () => {
    process.env.ENABLE_TEST_PRINCIPAL = "false";
    process.env.NODE_ENV = "test";
    const { createApiApp } = await import("../apps/api/src/bootstrap.js");
    app = await createApiApp({ logLevel: "fatal" });
    processor = new OutboxProcessor({ dispatcher, publicWebUrl: ORIGIN });
  });

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    dispatcher.attempts = 0;
    dispatcher.answer = () => undefined;
  });

  afterAll(async () => {
    await app.close();
    await processor.close();
    await pool.end();
  });

  it("stops asking once the provider has refused", async () => {
    const id = await requestRegistration();
    dispatcher.answer = () => {
      throw new EmailRefusedError("suppressed recipient");
    };

    await processor.processBatch();
    const afterRefusal = await eventRow(id);
    await makeAvailable(id);
    await processor.processBatch();

    // One attempt, and no second one however available the row is made. A
    // refusal is the same answer every time it is asked for, so asking again is
    // load without information — and the person waiting for the email is no
    // closer either way.
    expect(dispatcher.attempts).toBe(1);
    expect(afterRefusal?.attempts).toBe(MAX_DELIVERY_ATTEMPTS);
    expect(afterRefusal?.processed).toBe(false);
  });

  it("keeps asking while the provider is merely unavailable", async () => {
    const id = await requestRegistration();
    dispatcher.answer = () => {
      throw new Error("EMAIL_UNAVAILABLE: provider timed out");
    };

    await processor.processBatch();
    await makeAvailable(id);
    await processor.processBatch();
    const row = await eventRow(id);

    // The distinction the whole change exists for: this one comes back.
    expect(dispatcher.attempts).toBe(2);
    expect(row?.attempts).toBe(2);
    expect(row?.processed).toBe(false);
  });

  it("gives up after the ceiling and leaves the row as the evidence", async () => {
    const id = await requestRegistration();
    dispatcher.answer = () => {
      throw new Error("EMAIL_UNAVAILABLE: still down");
    };

    for (let pass = 0; pass < MAX_DELIVERY_ATTEMPTS + 3; pass += 1) {
      await makeAvailable(id);
      await processor.processBatch();
    }
    const row = await eventRow(id);

    // A dead letter is a row that stopped, not a row that vanished and not a
    // new lifecycle state: unprocessed, at the ceiling, and still there to be
    // found by anyone asking what never went out.
    expect(dispatcher.attempts).toBe(MAX_DELIVERY_ATTEMPTS);
    expect(row?.attempts).toBe(MAX_DELIVERY_ATTEMPTS);
    expect(row?.processed).toBe(false);
  });

  it("processes a message that succeeds, and asks once", async () => {
    const id = await requestRegistration();

    await processor.processBatch();
    const row = await eventRow(id);

    // The ordinary path, asserted alongside the failures so the ceiling cannot
    // be satisfied by never delivering anything.
    expect(dispatcher.attempts).toBe(1);
    expect(row?.processed).toBe(true);
  });
});
