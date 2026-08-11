import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import { inventsValue } from "../modules/decision/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import {
  decisionChatSchema,
  errorEnvelopeSchema
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
 * `US-DEC-F03-001` Decision Chat.
 *
 * Almost every criterion here is a prohibition, and the ones that matter most
 * are about what an assistant might say. So the suite checks two different
 * things: that the brief cannot carry what must not be revealed, and that a
 * reply carrying an invented figure never reaches a person.
 */
suite("Increment I5 Decision Chat", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let leafId: string;
  let mileageId: string;

  const address = () => `cht-${randomUUID()}@example.test`;
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

  const publish = async (
    input: { attributes?: unknown[]; contact?: boolean; title?: string } = {}
  ) => {
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
    if (input.contact)
      await send("PUT", `/businesses/${businessId}/information`, {
        body: {
          contactEmail: "gizli@example.test",
          contactTelephone: "+90 555 111 22 33",
          contactUrl: "https://example.test/iletisim",
          name: "Kartal Motors"
        },
        cookie: account.cookie
      });

    const title = input.title ?? "Kırmızı araba";
    const offering = await send("POST", `/businesses/${businessId}/offerings`, {
      body: { categoryId: leafId, slug: slug(), title },
      cookie: account.cookie
    });
    const offeringId = offering.json<{ id: string }>().id;
    await send(
      "PUT",
      `/businesses/${businessId}/offerings/${offeringId}/content`,
      {
        body: {
          attributes: input.attributes ?? [],
          categoryId: leafId,
          title
        },
        cookie: account.cookie
      }
    );
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/publication`,
      { cookie: account.cookie }
    );
    return { businessId, cookie: account.cookie, offeringId };
  };

  const retire = (offering: {
    businessId: string;
    cookie: string;
    offeringId: string;
  }) =>
    send(
      "POST",
      `/businesses/${offering.businessId}/offerings/${offering.offeringId}/retirement`,
      { cookie: offering.cookie }
    );

  const enterWith = async (offeringId: string) => {
    const entered = await send("POST", "/decision/flows", {
      body: { offeringId }
    });
    return entered.json<{ decisionFlowId: string }>().decisionFlowId;
  };

  const ask = (decisionFlowId: string, body: unknown, cookie?: string) =>
    send("POST", `/decision/flows/${decisionFlowId}/chat`, {
      body,
      ...(cookie === undefined ? {} : { cookie })
    });

  const starts = async (decisionFlowId: string) => {
    const counted = await pool.query<{ count: string }>(
      `select count(*)::text as count
       from decision_chat_start where decision_flow_id = $1`,
      [decisionFlowId]
    );
    return Number(counted.rows[0]?.count ?? "0");
  };

  beforeAll(async () => {
    process.env.ENABLE_TEST_PRINCIPAL = "false";
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

    const mileage = await send("POST", "/admin/attributes", {
      body: {
        categoryIds: [leafId],
        comparable: true,
        filterable: true,
        name: "Kilometre",
        stableKey: key(),
        unit: "km",
        valueKind: "NUMBER"
      },
      cookie: admin.cookie
    });
    mileageId = mileage.json<{ id: string }>().id;
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

  it("answers a Guest without an account, and an account no differently", async () => {
    const offering = await publish({
      attributes: [{ attributeId: mileageId, kind: "NUMBER", number: 42000 }]
    });
    const account = await signUp();
    const guestFlow = await enterWith(offering.offeringId);
    const userFlow = await enterWith(offering.offeringId);

    const asGuest = await ask(guestFlow, { question: "Kilometresi nedir?" });
    const asUser = await ask(
      userFlow,
      { question: "Kilometresi nedir?" },
      account.cookie
    );

    // AC-1 and AC-2. No principal is resolved, so there is nothing that could
    // differ — and no account was created by either request.
    expect(asGuest.statusCode).toBe(200);
    expect(decisionChatSchema.parse(asGuest.json()).turns[0]?.reply).toBe(
      decisionChatSchema.parse(asUser.json()).turns[0]?.reply
    );
  });

  it("produces Decision Chat Start once, however many questions follow", async () => {
    const offering = await publish();
    const decisionFlowId = await enterWith(offering.offeringId);

    await ask(decisionFlowId, { question: "Bu ilan nedir?" });
    await ask(decisionFlowId, { question: "Peki ya kilometresi?" });

    // AC-3. A second question is not a second conversation.
    expect(await starts(decisionFlowId)).toBe(1);
  });

  it("produces no occurrence and no answer on an invalid context", async () => {
    const offering = await publish();
    const decisionFlowId = await enterWith(offering.offeringId);
    await retire(offering);

    const refused = await ask(decisionFlowId, { question: "Bu ilan nedir?" });

    // AC-3 and the Decision Context's AC-8. The assistant is never consulted,
    // so nothing is said about an Offering that stopped being eligible.
    expect(refused.statusCode).toBe(422);
    expect(errorEnvelopeSchema.parse(refused.json()).code).toBe(
      "DECISION_CONTEXT_INVALID"
    );
    expect(await starts(decisionFlowId)).toBe(0);
  });

  it("explains the authoritative values and states what is missing", async () => {
    const offering = await publish({
      attributes: [{ attributeId: mileageId, kind: "NUMBER", number: 42000 }]
    });
    const bare = await publish();
    const withValue = await enterWith(offering.offeringId);
    const without = await enterWith(bare.offeringId);

    const answered = await ask(withValue, { question: "Kilometre?" });
    const absent = await ask(without, { question: "Kilometre?" });

    // AC-5. The value with its governed unit where supplied, and the absence
    // said out loud where it is not — an omitted line would read as though the
    // Attribute did not apply.
    const reply = decisionChatSchema.parse(answered.json()).turns[0]?.reply;
    expect(reply).toContain("42000");
    expect(reply).toContain("km");
    expect(decisionChatSchema.parse(absent.json()).turns[0]?.reply).toContain(
      "Belirtilmemiş"
    );
  });

  it("repeats the stated priorities without turning them into an order", async () => {
    const offering = await publish();
    const decisionFlowId = await enterWith(offering.offeringId);

    const answered = await ask(decisionFlowId, {
      priorities: ["düşük kilometre", "bakımlı olması"],
      question: "Neye bakmalıyım?"
    });

    // AC-5 and AC-6. The words come back; no conclusion is drawn from them.
    const reply = decisionChatSchema.parse(answered.json()).turns[0]?.reply;
    expect(reply).toContain("düşük kilometre");
    expect(reply).not.toMatch(/öneri|tavsiye|daha uygun|en iyi|kazanan/iu);
  });

  it("withholds a reply that states a figure the context never contained", () => {
    const brief = {
      offerings: [
        {
          attributes: [{ name: "Kilometre", unit: "km", value: "42000" }],
          businessName: "Kartal Motors",
          categoryName: "Otomobil",
          offeringId: "11111111-1111-4111-8111-111111111111",
          title: "Kırmızı araba"
        }
      ],
      priorities: []
    };

    // AC-6. The narrow guarantee, and the one that does not depend on a vendor
    // honouring its brief: a number nobody published cannot reach a person.
    expect(inventsValue("Kilometre: 42000 km", brief)).toBe(false);
    expect(inventsValue("Yaklaşık 40000 km olmalı", brief)).toBe(true);
    expect(inventsValue("Bu ilan hakkında bilgi yok", brief)).toBe(false);
  });

  it("carries no telephone, email or contact URL into the conversation", async () => {
    const offering = await publish({ contact: true });
    const decisionFlowId = await enterWith(offering.offeringId);

    const answered = await ask(decisionFlowId, {
      question: "İşletmeye nasıl ulaşırım?"
    });

    // AC-8. The brief has no field that could hold a channel, so a Guest
    // cannot be told one — not because the assistant declines, but because it
    // was never told.
    expect(answered.body).not.toContain("gizli@example.test");
    expect(answered.body).not.toContain("555 111");
    expect(answered.body).not.toContain("example.test/iletisim");
  });

  it("selects nothing and begins nothing", async () => {
    const offering = await publish();
    const decisionFlowId = await enterWith(offering.offeringId);

    await ask(decisionFlowId, { question: "Bunu seçiyorum, devam et." });

    // AC-7. Asking for a selection or a handoff cannot produce one: Chat has
    // no route, no field and no dependency through which either could happen.
    const columns = await pool.query<{ column_name: string }>(
      `select column_name from information_schema.columns
       where table_name = 'decision_flow' order by column_name`
    );
    expect(columns.rows.map((row) => row.column_name)).not.toContain(
      "selected_offering_id"
    );
  });

  it("makes no claim about a purchase, a reply or an external result", async () => {
    const offering = await publish();
    const decisionFlowId = await enterWith(offering.offeringId);

    const answered = await ask(decisionFlowId, {
      question: "Satın alırsam ne olur?"
    });

    // AC-10. The reply reports what the Offering says and stops there.
    expect(answered.body).not.toMatch(
      /satın alındı|sipariş|sözleşme|yanıt verdi|tamamlandı|başarıyla/iu
    );
  });

  it("keeps the conversation to this flow and no other", async () => {
    const first = await publish({ title: "Birinci ilan" });
    const second = await publish({ title: "İkinci ilan" });
    const one = await enterWith(first.offeringId);
    const other = await enterWith(second.offeringId);

    await ask(one, { question: "Bu nedir?" });
    const history = decisionChatSchema.parse(
      (await send("GET", `/decision/flows/${other}/chat`)).json()
    );

    // AC-9 and the Context's AC-5. A second flow starts empty; nothing merges,
    // and nothing remembers.
    expect(history.turns).toEqual([]);
  });

  it("takes the conversation with the flow when it expires", async () => {
    const offering = await publish();
    const decisionFlowId = await enterWith(offering.offeringId);
    await ask(decisionFlowId, { question: "Bu nedir?" });

    await pool.query(
      `update decision_flow set expires_at = now() - interval '1 minute'
       where id = $1`,
      [decisionFlowId]
    );
    const after = await send("GET", `/decision/flows/${decisionFlowId}/chat`);

    // AC-9. A transcript that outlived its flow would be exactly the saved
    // Chat history the Story forbids, so the database removes it.
    expect(after.statusCode).toBe(404);
    const turns = await pool.query<{ count: string }>(
      `select count(*)::text as count
       from decision_chat_turn where decision_flow_id = $1`,
      [decisionFlowId]
    );
    expect(turns.rows[0]?.count).toBe("0");
  });

  it("keeps the record that Chat began after the flow is gone", async () => {
    const offering = await publish();
    const decisionFlowId = await enterWith(offering.offeringId);
    await ask(decisionFlowId, { question: "Bu nedir?" });

    await pool.query(
      `update decision_flow set expires_at = now() - interval '1 minute'
       where id = $1`,
      [decisionFlowId]
    );
    await send("GET", `/decision/flows/${decisionFlowId}/chat`);

    // The flow is current-flow state and disappears; that assistive Chat began
    // is a fact about the past, and PRD-0006 Basic Analytics consumes it.
    expect(await starts(decisionFlowId)).toBe(1);
  });
});
