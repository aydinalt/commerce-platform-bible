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
import {
  decisionContextSchema,
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
 * `US-DEC-F04-001` Explicit Offering Selection.
 *
 * Selection is the gate every handoff waits behind, so the interesting cases
 * are the ones where it stops being true without anybody touching it: the
 * selected member removed from the set, the selected Offering retired. Both
 * must leave the flow unable to hand off rather than quietly still armed.
 */
suite("Increment I5 explicit Offering selection", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let leafId: string;

  const address = () => `sel-${randomUUID()}@example.test`;
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

  const publish = async () => {
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

  const comparisonOf = async (offeringIds: string[]) => {
    const created = await send("POST", "/decision/comparison-sets", {
      body: { offeringId: offeringIds[0] }
    });
    const comparisonSetId = created.json<{ comparisonSetId: string }>()
      .comparisonSetId;
    for (const offeringId of offeringIds.slice(1))
      await send(
        "POST",
        `/decision/comparison-sets/${comparisonSetId}/members`,
        { body: { offeringId } }
      );
    return comparisonSetId;
  };

  const enter = async (body: unknown) => {
    const entered = await send("POST", "/decision/flows", { body });
    return entered.json<{ decisionFlowId: string }>().decisionFlowId;
  };

  const select = (decisionFlowId: string, offeringId: string | null) =>
    send("PUT", `/decision/flows/${decisionFlowId}/selection`, {
      body: { offeringId }
    });

  const contextOf = async (decisionFlowId: string) =>
    decisionContextSchema.parse(
      (await send("GET", `/decision/flows/${decisionFlowId}`)).json()
    );

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
    await pool.end();
  });

  it("offers no handoff until something is explicitly selected", async () => {
    const offering = await publish();
    const decisionFlowId = await enter({ offeringId: offering.offeringId });

    const before = await contextOf(decisionFlowId);
    const after = decisionContextSchema.parse(
      (await select(decisionFlowId, offering.offeringId)).json()
    );

    // AC-1 and AC-7. A valid context is not a selection: the single Offering
    // in front of the person still has to be chosen.
    expect(before.valid).toBe(true);
    expect(before.selected).toBeNull();
    expect(before.handoffAvailable).toBe(false);
    expect(after.selected?.offeringId).toBe(offering.offeringId);
    expect(after.handoffAvailable).toBe(true);
  });

  it("selects the single-Offering context without Compare", async () => {
    const offering = await publish();
    const decisionFlowId = await enter({ offeringId: offering.offeringId });

    const selected = await select(decisionFlowId, offering.offeringId);

    // AC-2. No Comparison Set was formed and none was needed.
    expect(selected.statusCode).toBe(200);
    const sets = await pool.query<{ count: string }>(
      `select count(*)::text as count from decision_flow
       where id = $1 and comparison_set_id is not null`,
      [decisionFlowId]
    );
    expect(sets.rows[0]?.count).toBe("0");
  });

  it("refuses an Offering the context does not contain", async () => {
    const offering = await publish();
    const elsewhere = await publish();
    const decisionFlowId = await enter({ offeringId: offering.offeringId });
    await select(decisionFlowId, offering.offeringId);

    const refused = await select(decisionFlowId, elsewhere.offeringId);

    // AC-3. The refusal is named, and the selection the person already made is
    // exactly where they left it.
    expect(refused.statusCode).toBe(422);
    expect(errorEnvelopeSchema.parse(refused.json()).code).toBe(
      "SELECTION_NOT_IN_CONTEXT"
    );
    expect((await contextOf(decisionFlowId)).selected?.offeringId).toBe(
      offering.offeringId
    );
  });

  it("selects a current member and leaves the others in the set", async () => {
    const first = await publish();
    const second = await publish();
    const third = await publish();
    const comparisonSetId = await comparisonOf([
      first.offeringId,
      second.offeringId,
      third.offeringId
    ]);
    const decisionFlowId = await enter({ comparisonSetId });

    const selected = decisionContextSchema.parse(
      (await select(decisionFlowId, second.offeringId)).json()
    );

    // AC-3 and AC-4. Choosing one is not a way of discarding the rest.
    expect(selected.selected?.offeringId).toBe(second.offeringId);
    expect(selected.comparison?.members.map((m) => m.offeringId)).toEqual([
      first.offeringId,
      second.offeringId,
      third.offeringId
    ]);
  });

  it("lets the person change and clear the selection", async () => {
    const first = await publish();
    const second = await publish();
    const comparisonSetId = await comparisonOf([
      first.offeringId,
      second.offeringId
    ]);
    const decisionFlowId = await enter({ comparisonSetId });

    await select(decisionFlowId, first.offeringId);
    const changed = decisionContextSchema.parse(
      (await select(decisionFlowId, second.offeringId)).json()
    );
    const cleared = decisionContextSchema.parse(
      (await select(decisionFlowId, null)).json()
    );

    // AC-5 and AC-7. Clearing is the same statement with a different answer,
    // and it closes the handoff again.
    expect(changed.selected?.offeringId).toBe(second.offeringId);
    expect(cleared.selected).toBeNull();
    expect(cleared.handoffAvailable).toBe(false);
  });

  it("clears the selection when its member is removed from the set", async () => {
    const first = await publish();
    const second = await publish();
    const third = await publish();
    const comparisonSetId = await comparisonOf([
      first.offeringId,
      second.offeringId,
      third.offeringId
    ]);
    const decisionFlowId = await enter({ comparisonSetId });
    await select(decisionFlowId, third.offeringId);

    await send(
      "DELETE",
      `/decision/comparison-sets/${comparisonSetId}/members/${third.offeringId}`
    );
    const after = await contextOf(decisionFlowId);

    // AC-6. Removing the member clears the selection in the same statement, so
    // no later reader has to remember to notice.
    expect(after.selected).toBeNull();
    expect(after.handoffAvailable).toBe(false);
    expect(after.valid).toBe(true);
  });

  it("clears the selection when its Offering stops being eligible", async () => {
    const first = await publish();
    const second = await publish();
    const third = await publish();
    const comparisonSetId = await comparisonOf([
      first.offeringId,
      second.offeringId,
      third.offeringId
    ]);
    const decisionFlowId = await enter({ comparisonSetId });
    await select(decisionFlowId, third.offeringId);

    await retire(third);
    const after = await contextOf(decisionFlowId);

    // AC-6 and AC-9. Nobody touched the set; the world changed underneath it.
    // The selection resolves to nothing, so no handoff can be initiated and no
    // Completion can follow.
    expect(after.selected).toBeNull();
    expect(after.handoffAvailable).toBe(false);
  });

  it("closes the handoff when the context itself becomes invalid", async () => {
    const offering = await publish();
    const decisionFlowId = await enter({ offeringId: offering.offeringId });
    await select(decisionFlowId, offering.offeringId);

    await retire(offering);
    const after = await contextOf(decisionFlowId);

    // AC-7 and AC-9. Two reasons, one answer: nothing may be handed off.
    expect(after.valid).toBe(false);
    expect(after.handoffAvailable).toBe(false);
  });

  it("gives Decision Chat no way to select, change or clear", async () => {
    const first = await publish();
    const second = await publish();
    const comparisonSetId = await comparisonOf([
      first.offeringId,
      second.offeringId
    ]);
    const decisionFlowId = await enter({ comparisonSetId });
    await select(decisionFlowId, first.offeringId);

    await send("POST", `/decision/flows/${decisionFlowId}/chat`, {
      body: { question: "İkincisini seç ve devam et." }
    });
    const after = await contextOf(decisionFlowId);

    // AC-8. Asking Chat to select cannot select: the Chat path has no writer
    // for the selection, and the selection is exactly where the person left it.
    expect(after.selected?.offeringId).toBe(first.offeringId);
  });

  it("keeps the selection out of a second flow", async () => {
    const offering = await publish();
    const one = await enter({ offeringId: offering.offeringId });
    await select(one, offering.offeringId);

    const other = await enter({ offeringId: offering.offeringId });

    // The Decision Context's AC-4 applied to selection: a new flow starts with
    // nothing chosen, whatever another flow happens to hold.
    expect((await contextOf(other)).selected).toBeNull();
  });
});
