import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { ChatService } from "../apps/api/src/decision/chat.service.js";
import { PgChatRepository } from "../apps/api/src/persistence/pg-chat.repository.js";
import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import {
  AssistantUnavailableError,
  type DecisionAssistant,
  type DecisionBrief
} from "../modules/decision/src/index.js";
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
 * What the platform is doing while the vendor thinks.
 *
 * The assistant is the one dependency the platform waits on and does not
 * control, so the interesting question is not what it answers but what is
 * being held while it does not.
 */
suite("Increment I12 Decision Chat and the connection pool", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let chats: PgChatRepository;
  let leafId: string;
  let admin: { cookie: string; userId: string };

  /** Answers however the test asks it to, and looks at the database first. */
  class ScriptedAssistant implements DecisionAssistant {
    answer: (brief: DecisionBrief) => string = () => "Yanıt";
    heldInTransaction = -1;

    async respond(input: { brief: DecisionBrief }): Promise<string> {
      this.heldInTransaction = await openTransactions();
      return this.answer(input.brief);
    }
  }

  const assistant = new ScriptedAssistant();
  let service: ChatService;

  const address = () => `cnp-${randomUUID()}@example.test`;
  const key = () => `K${randomUUID().replaceAll("-", "").toUpperCase()}`;
  const slug = () => `s-${randomUUID()}`;

  /**
   * Connections sitting inside an open transaction, right now.
   *
   * Asked on a connection of its own, so the question cannot be its own answer.
   * `idle in transaction` is exactly the state a transaction held across a
   * network call produces: begun, doing nothing, and not released.
   */
  const openTransactions = async () => {
    const counted = await pool.query<{ count: string }>(
      `select count(*)::text as count from pg_stat_activity
       where datname = current_database()
         and state = 'idle in transaction'
         and pid <> pg_backend_pid()`
    );
    return Number(counted.rows[0]?.count ?? "0");
  };

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

  /** One published Offering, entered as a Decision Context. */
  const enterFlow = async () => {
    const account = await signUp();
    const business = await send("POST", "/businesses", {
      body: { name: "Kartal Motors", slug: slug() },
      cookie: account.cookie
    });
    const businessId = business.json<{ id: string }>().id;
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });

    const offering = await send("POST", `/businesses/${businessId}/offerings`, {
      body: { categoryId: leafId, slug: slug(), title: "Kırmızı araba" },
      cookie: account.cookie
    });
    const offeringId = offering.json<{ id: string }>().id;
    await send(
      "PUT",
      `/businesses/${businessId}/offerings/${offeringId}/content`,
      {
        body: { attributes: [], categoryId: leafId, title: "Kırmızı araba" },
        cookie: account.cookie
      }
    );
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/publication`,
      { cookie: account.cookie }
    );

    const entered = await send("POST", "/decision/flows", {
      body: { offeringId }
    });
    return entered.json<{ decisionFlowId: string }>().decisionFlowId;
  };

  const turnCount = async (decisionFlowId: string) => {
    const counted = await pool.query<{ count: string }>(
      `select count(*)::text as count
       from decision_chat_turn where decision_flow_id = $1`,
      [decisionFlowId]
    );
    return Number(counted.rows[0]?.count ?? "0");
  };

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    const { createApiApp } = await import("../apps/api/src/bootstrap.js");
    app = await createApiApp({ logLevel: "fatal" });
    processor = new OutboxProcessor({ dispatcher, publicWebUrl: ORIGIN });

    // The application composes its assistant at boot from configuration, and
    // the suite has no way to substitute one without a testing container. So
    // the service is assembled here from the same two dependencies the module
    // gives it, which is the seam the vendor call actually sits on.
    chats = new PgChatRepository();
    service = new ChatService(chats, assistant);

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
    assistant.answer = () => "Yanıt";
    assistant.heldInTransaction = -1;
  });

  afterAll(async () => {
    await app.close();
    await chats.onModuleDestroy();
    await processor.close();
    await pool.end();
  });

  it("holds no transaction open while the vendor is thinking", async () => {
    const decisionFlowId = await enterFlow();

    const answered = await service.ask({
      decisionFlowId,
      priorities: [],
      question: "Bu araç hakkında ne söyleyebilirsin?"
    });

    /*
     * The whole act used to run inside one transaction: read the brief, ask the
     * vendor, check the answer, record it. That held one of the pool's ten
     * connections across a call to somebody else's service, so ten people
     * asking a slow assistant at once would have stopped every other request in
     * the process — including the ones that never go near Chat — and a vendor
     * answering slowly would have looked like a database outage.
     *
     * Asserted from inside the vendor call, because that is the only moment the
     * difference exists.
     */
    expect(assistant.heldInTransaction).toBe(0);
    expect(answered.turns).toHaveLength(1);
  });

  it("records no turn when the assistant does not answer", async () => {
    const decisionFlowId = await enterFlow();
    assistant.answer = () => {
      throw new AssistantUnavailableError("test-provider: outage");
    };

    const refused = service.ask({
      decisionFlowId,
      priorities: [],
      question: "Bu araç hakkında ne söyleyebilirsin?"
    });

    // The conversation is what a person reads back. A failed question that left
    // a turn behind would put a gap in it that nobody could explain, and Chat
    // Start would claim a conversation that never began.
    await expect(refused).rejects.toBeInstanceOf(AssistantUnavailableError);
    expect(await turnCount(decisionFlowId)).toBe(0);
  });

  it("records no turn when the reply states a figure nobody published", async () => {
    const decisionFlowId = await enterFlow();
    assistant.answer = () => "Bu araç 42000 km yapmış.";

    const refused = service.ask({
      decisionFlowId,
      priorities: [],
      question: "Kaç kilometre?"
    });

    // AC-6, and the reason the check sits between the two transactions rather
    // than after the write: the invented figure is refused before anything is
    // recorded, so the conversation holds nothing the platform disowns.
    await expect(refused).rejects.toThrow(/ASSISTANT_INVENTED_VALUE/u);
    expect(await turnCount(decisionFlowId)).toBe(0);
  });
});
