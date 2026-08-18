import { randomUUID } from "node:crypto";
import { createElement } from "react";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { DecisionContextResponse } from "@commerce/contracts";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { DecisionChat } from "../apps/web/src/app/decision/chat";
import {
  CHAT_BOUNDARY,
  CHAT_MEMORY,
  INVALIDITY_COPY,
  REPAIR_COPY,
  chatRefusal,
  selectionRefusal
} from "../apps/web/src/decision/copy";
import { DECISION_IDLE } from "../apps/web/src/decision/state";

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
 * UX-0009 §5 to §8.
 *
 * Decision is where the platform is most tempted to act on someone's behalf,
 * so most of these tests are about restraint: entering selects nothing, an
 * invalid context says nothing about the Offering, a Guest is not asked to
 * register, and no conversation outlives the flow it belonged to.
 */
suite("Increment I8 Decision flow", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

  const address = () => `df-${randomUUID()}@example.test`;
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

  /// One Published, publicly eligible Offering owned by a fresh Business.
  const publishedOffering = async () => {
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
    const created = await send("POST", `/businesses/${businessId}/offerings`, {
      // No digits in the title. The invention check refuses a reply carrying a
      // figure the brief never contained, and a generated identifier in the
      // title would make the assistant's faithful restatement look invented.
      body: { categoryId, slug: slug(), title: "Kırmızı araba" },
      cookie: account.cookie
    });
    const offeringId = created.json<{ id: string }>().id;
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/publication`,
      { cookie: account.cookie }
    );
    return { businessId, offeringId, owner: account };
  };

  const enter = async (body: unknown) =>
    (
      await send("POST", "/decision/flows", { body })
    ).json<DecisionContextResponse>();

  const context = async (decisionFlowId: string) =>
    (
      await send("GET", `/decision/flows/${decisionFlowId}`)
    ).json<DecisionContextResponse>();

  const select = (decisionFlowId: string, offeringId: string | null) =>
    send("PUT", `/decision/flows/${decisionFlowId}/selection`, {
      body: { offeringId }
    });

  const ask = (decisionFlowId: string, question: string) =>
    send("POST", `/decision/flows/${decisionFlowId}/chat`, {
      body: { priorities: [], question }
    });

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    const { createApiApp } = await import("../apps/api/src/bootstrap.js");
    app = await createApiApp({ logLevel: "fatal" });
    processor = new OutboxProcessor({ dispatcher, pool, publicWebUrl: ORIGIN });

    admin = await signUp();
    await pool.query(
      `insert into admin_authorization (user_id, granted_by) values ($1,'test')`,
      [admin.userId]
    );
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
    await pool.end();
  });

  it("enters from one Offering having selected nothing", async () => {
    const { offeringId } = await publishedOffering();

    const entered = await enter({ offeringId });

    // §5.1 and §8.1. Compare is not required, and arriving with something
    // already chosen would be the platform choosing on the person's behalf.
    expect(entered.offering?.offeringId).toBe(offeringId);
    expect(entered.comparison).toBeNull();
    expect(entered.selected).toBeNull();
    expect(entered.handoffAvailable).toBe(false);
    expect(entered.valid).toBe(true);
  });

  it("keeps the other members when one is selected", async () => {
    const first = await publishedOffering();
    const second = await publishedOffering();
    const set = await send("POST", "/decision/comparison-sets", {
      body: { offeringId: first.offeringId }
    });
    const comparisonSetId = set.json<{ comparisonSetId: string }>()
      .comparisonSetId;
    await send("POST", `/decision/comparison-sets/${comparisonSetId}/members`, {
      body: { offeringId: second.offeringId }
    });
    const entered = await enter({ comparisonSetId });

    await select(entered.decisionFlowId, first.offeringId);
    const after = await context(entered.decisionFlowId);

    // §8.2. Choosing is not discarding: the set the person built is still
    // there, and they may change their mind without rebuilding it.
    expect(after.selected?.offeringId).toBe(first.offeringId);
    expect(after.comparison?.members).toHaveLength(2);
    expect(after.handoffAvailable).toBe(true);
  });

  it("clears a selection through the same route that made it", async () => {
    const { offeringId } = await publishedOffering();
    const entered = await enter({ offeringId });
    await select(entered.decisionFlowId, offeringId);

    const cleared = await select(entered.decisionFlowId, null);

    // §8.3. Clearing is not a different act — it is the same statement with a
    // different answer, which is why there is no second route for it.
    expect(cleared.statusCode).toBe(200);
    expect(cleared.json<DecisionContextResponse>().selected).toBeNull();
    expect(cleared.json<DecisionContextResponse>().handoffAvailable).toBe(
      false
    );
  });

  it("refuses a selection the context does not contain", async () => {
    const inside = await publishedOffering();
    const outside = await publishedOffering();
    const entered = await enter({ offeringId: inside.offeringId });

    const refused = await select(entered.decisionFlowId, outside.offeringId);
    const after = await context(entered.decisionFlowId);

    expect(refused.statusCode).toBe(422);
    expect(refused.json<{ code: string }>().code).toBe(
      "SELECTION_NOT_IN_CONTEXT"
    );
    // The selection that was there is untouched — here, still nothing.
    expect(after.selected).toBeNull();
    // One sentence for both "not in this context" and "no longer eligible",
    // because distinguishing them would describe an Offering the context does
    // not contain.
    expect(selectionRefusal("SELECTION_NOT_IN_CONTEXT")).toMatch(
      /önünüzdekilerden/iu
    );
  });

  it("says nothing about an Offering that stopped being eligible", async () => {
    const { businessId, offeringId, owner } = await publishedOffering();
    const entered = await enter({ offeringId });
    await select(entered.decisionFlowId, offeringId);
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/retirement`,
      { cookie: owner.cookie }
    );

    const after = await context(entered.decisionFlowId);
    const asked = await ask(entered.decisionFlowId, "Bu ilan uygun mu?");

    // §6. The context is re-read, so a withdrawal reaches the person as an
    // invalid context rather than as a handoff that fails on arrival. Chat is
    // refused before the assistant is consulted, so nothing is said about it.
    expect(after.valid).toBe(false);
    expect(after.invalidity).toBe("OFFERING_INELIGIBLE");
    expect(after.handoffAvailable).toBe(false);
    expect(asked.statusCode).toBe(422);
    expect(asked.json<{ code: string }>().code).toBe(
      "DECISION_CONTEXT_INVALID"
    );
    // §6 also requires the person to be told what they may do about it.
    expect(after.repairs).toContain("LEAVE_DECISION");
    expect(INVALIDITY_COPY.OFFERING_INELIGIBLE).toMatch(/yayında değil/iu);
    expect(REPAIR_COPY.LEAVE_DECISION).toMatch(/çık/iu);
    expect(chatRefusal("DECISION_CONTEXT_INVALID")).toMatch(/söylenmedi/iu);
  });

  it("answers a Guest without asking for an account", async () => {
    const { offeringId } = await publishedOffering();
    const entered = await enter({ offeringId });

    // No cookie on any of these calls: §7.1 makes Chat public and §7.4 forbids
    // forced account creation before, during or after.
    const asked = await ask(entered.decisionFlowId, "Bu ilan nedir?");
    const history = await send(
      "GET",
      `/decision/flows/${entered.decisionFlowId}/chat`
    );

    expect(asked.statusCode).toBe(200);
    expect(history.json<{ turns: unknown[] }>().turns).toHaveLength(1);
  });

  it("holds a conversation for its own flow and no other", async () => {
    const { offeringId } = await publishedOffering();
    const first = await enter({ offeringId });
    await ask(first.decisionFlowId, "Bu ilan nedir?");

    const second = await enter({ offeringId });
    const history = await send(
      "GET",
      `/decision/flows/${second.decisionFlowId}/chat`
    );

    // §7.4. A second flow over the same Offering starts empty. There is no
    // saved history and no cross-decision memory — not because it is hidden,
    // but because the flow is what the conversation belongs to.
    expect(history.json<{ turns: unknown[] }>().turns).toEqual([]);
  });

  it("names its own boundaries before it is asked anything", () => {
    const markup = renderToStaticMarkup(
      createElement(DecisionChat, {
        action: () => Promise.resolve(DECISION_IDLE),
        disabled: false,
        turns: []
      })
    );

    // §7.3 and §7.4, said up front. Someone who expects the assistant to
    // decide for them would read its silence as reluctance rather than as a
    // boundary — and someone who expects the conversation to be saved should
    // learn it is not before they rely on it.
    expect(markup).toContain(CHAT_BOUNDARY);
    expect(markup).toContain(CHAT_MEMORY);
    // No sign-in prompt anywhere in a public surface.
    expect(markup).not.toMatch(/giriş yap|kayıt ol|hesap oluştur/iu);
  });
});
