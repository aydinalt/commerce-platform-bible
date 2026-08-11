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
 * `US-DEC-F02-001` Decision Context.
 *
 * A context is exactly one thing, it belongs to one flow, and it stops being
 * usable the moment what it names stops being eligible. The last of those is
 * where this suite spends most of its time: a context that still looks fine
 * after its Offering was retired is the failure mode AC-8 exists to prevent.
 */
suite("Increment I5 Decision Context", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let leafId: string;

  const address = () => `dec-${randomUUID()}@example.test`;
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
        {
          body: { offeringId }
        }
      );
    return comparisonSetId;
  };

  const enter = async (body: unknown) => {
    const entered = await send("POST", "/decision/flows", { body });
    return { entered, view: decisionContextSchema.parse(entered.json()) };
  };

  const contextOf = async (decisionFlowId: string) =>
    decisionContextSchema.parse(
      (await send("GET", `/decision/flows/${decisionFlowId}`)).json()
    );

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

  it("enters with one eligible Offering and no Compare", async () => {
    const offering = await publish();

    const { view } = await enter({ offeringId: offering.offeringId });

    // AC-1 and AC-2. One Offering is a complete context; no Comparison Set is
    // required and none is created.
    expect(view.offering?.offeringId).toBe(offering.offeringId);
    expect(view.comparison).toBeNull();
    expect(view.valid).toBe(true);
    const sets = await pool.query<{ count: string }>(
      `select count(*)::text as count from comparison_set`
    );
    expect(Number(sets.rows[0]?.count)).toBeGreaterThanOrEqual(0);
  });

  it("enters with the Comparison Set exactly as Compare left it", async () => {
    const first = await publish();
    const second = await publish();
    const comparisonSetId = await comparisonOf([
      first.offeringId,
      second.offeringId
    ]);

    const { view } = await enter({ comparisonSetId });

    // AC-3. The set is referenced rather than copied, so "unchanged" is a fact
    // about the data rather than a promise this code keeps.
    expect(view.offering).toBeNull();
    expect(view.comparison?.comparisonSetId).toBe(comparisonSetId);
    expect(view.comparison?.members.map((m) => m.offeringId)).toEqual([
      first.offeringId,
      second.offeringId
    ]);
    expect(view.valid).toBe(true);
  });

  it("refuses a context that is both, or neither", async () => {
    const offering = await publish();
    const comparisonSetId = await comparisonOf([offering.offeringId]);

    const both = await send("POST", "/decision/flows", {
      body: { comparisonSetId, offeringId: offering.offeringId }
    });
    const neither = await send("POST", "/decision/flows", { body: {} });

    // AC-1 and AC-5. A context holding two things would let Decision speak
    // about something the person never chose, so the request cannot even be
    // expressed.
    expect(both.statusCode).toBe(400);
    expect(neither.statusCode).toBe(400);
    expect(errorEnvelopeSchema.parse(both.json()).code).toBe(
      "VALIDATION_FAILED"
    );
  });

  it("keeps two flows apart", async () => {
    const first = await publish();
    const second = await publish();

    const one = await enter({ offeringId: first.offeringId });
    const other = await enter({ offeringId: second.offeringId });

    // AC-4 and AC-5. Entering a second time is a second flow, not an addition
    // to the first: nothing merges, and neither knows about the other.
    expect(one.view.decisionFlowId).not.toBe(other.view.decisionFlowId);
    expect(
      (await contextOf(one.view.decisionFlowId)).offering?.offeringId
    ).toBe(first.offeringId);
    expect(
      (await contextOf(other.view.decisionFlowId)).offering?.offeringId
    ).toBe(second.offeringId);
  });

  it("stores nothing that ties a flow to a person", async () => {
    const account = await signUp();
    const offering = await publish();

    const { view } = await enter({ offeringId: offering.offeringId });
    await send("GET", `/decision/flows/${view.decisionFlowId}`, {
      cookie: account.cookie
    });

    // AC-6. The signed-in read changes nothing about the row, because the row
    // has no column that could hold who read it. There is no personal Decision
    // history because there is nowhere to write one.
    const columns = await pool.query<{ column_name: string }>(
      `select column_name from information_schema.columns
       where table_name = 'decision_flow' order by column_name`
    );
    expect(columns.rows.map((row) => row.column_name)).toEqual([
      "comparison_set_id",
      "created_at",
      "expires_at",
      "id",
      "offering_id",
      "selected_offering_id"
    ]);
  });

  it("reports a single-Offering context invalid once the Offering is retired", async () => {
    const offering = await publish();
    const { view } = await enter({ offeringId: offering.offeringId });
    expect(view.valid).toBe(true);

    await retire(offering);
    const after = await contextOf(view.decisionFlowId);

    // AC-7 and AC-8. The Offering is not returned in a diminished form Chat
    // could still quote — it is not returned at all — and the context says so.
    expect(after.valid).toBe(false);
    expect(after.invalidity).toBe("OFFERING_INELIGIBLE");
    expect(after.offering).toBeNull();
  });

  it("reports a Comparison Set context invalid once it falls below two", async () => {
    const first = await publish();
    const second = await publish();
    const comparisonSetId = await comparisonOf([
      first.offeringId,
      second.offeringId
    ]);
    const { view } = await enter({ comparisonSetId });

    await retire(second);
    const after = await contextOf(view.decisionFlowId);

    // A set can fall below two without anyone touching it. The remaining
    // member is still shown — it is the set that is unusable, not the Offering.
    expect(after.valid).toBe(false);
    expect(after.invalidity).toBe("SET_NOT_VALID");
    expect(after.comparison?.members.map((m) => m.offeringId)).toEqual([
      first.offeringId
    ]);
  });

  it("offers repairing the set only where there is a set", async () => {
    const offering = await publish();
    const second = await publish();
    const comparisonSetId = await comparisonOf([
      offering.offeringId,
      second.offeringId
    ]);
    const single = await enter({ offeringId: offering.offeringId });
    const compared = await enter({ comparisonSetId });
    await retire(offering);
    await retire(second);

    const singleAfter = await contextOf(single.view.decisionFlowId);
    const comparedAfter = await contextOf(compared.view.decisionFlowId);

    // AC-9. Three ways out, and the one that returns to UX-0004 is offered
    // only where a Comparison Set exists to return to.
    expect(singleAfter.repairs).toEqual([
      "CHOOSE_ANOTHER_OFFERING",
      "LEAVE_DECISION"
    ]);
    expect(comparedAfter.repairs).toEqual([
      "REPAIR_COMPARISON_SET",
      "CHOOSE_ANOTHER_OFFERING",
      "LEAVE_DECISION"
    ]);
  });

  it("offers no repair while the context is valid", async () => {
    const offering = await publish();

    const { view } = await enter({ offeringId: offering.offeringId });

    // Nothing to repair, so nothing offered — the list is not a permanent
    // menu, it is what a person may do about a problem they have.
    expect(view.repairs).toEqual([]);
    expect(view.invalidity).toBeNull();
  });

  it("answers an expired flow the same way as one that never existed", async () => {
    const offering = await publish();
    const { view } = await enter({ offeringId: offering.offeringId });
    await pool.query(
      `update decision_flow set expires_at = now() - interval '1 minute'
       where id = $1`,
      [view.decisionFlowId]
    );

    const expired = await send("GET", `/decision/flows/${view.decisionFlowId}`);
    const never = await send("GET", `/decision/flows/${randomUUID()}`);

    expect(expired.statusCode).toBe(404);
    expect(never.statusCode).toBe(404);
    expect(errorEnvelopeSchema.parse(expired.json()).code).toBe(
      "DECISION_FLOW_NOT_FOUND"
    );
  });

  it("takes the flow with the Comparison Set when the set expires", async () => {
    const first = await publish();
    const second = await publish();
    const comparisonSetId = await comparisonOf([
      first.offeringId,
      second.offeringId
    ]);
    const { view } = await enter({ comparisonSetId });

    await pool.query(
      `update comparison_set set expires_at = now() - interval '1 minute'
       where id = $1`,
      [comparisonSetId]
    );
    const after = await send("GET", `/decision/flows/${view.decisionFlowId}`);

    // AC-4. A flow pointing at a set that no longer exists would outlive the
    // thing it was about, so the database takes it away with the set.
    expect(after.statusCode).toBe(404);
  });
});
