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
import { decisionCompletionsSchema } from "../packages/contracts/src/index.js";

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

const ORIGIN = "http://localhost:3000";
const PASSWORD = "correct horse battery staple";
const DESTINATION = "https://partner.example.test/ilan";
const TELEPHONE = "+90 555 222 33 44";

class RecordingDispatcher implements EmailDispatcher {
  readonly delivered: EmailMessage[] = [];

  deliver(message: EmailMessage): Promise<void> {
    this.delivered.push(message);
    return Promise.resolve();
  }
}

/**
 * `US-DEC-F07-001` Decision Completion.
 *
 * Completion is derived, never declared — so this suite mostly checks that the
 * two results arise from their own evidence, stay apart, and appear without
 * anybody being asked to confirm anything. The rest is about what Completion
 * refuses to mean.
 */
suite("Increment I5 Decision Completion", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  const leaves: Record<string, string> = {};

  const address = () => `cmp-${randomUUID()}@example.test`;
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

  const administer = (
    offeringId: string,
    action: "validation" | "enablement",
    body?: unknown
  ) =>
    send(
      "POST",
      `/admin/offerings/${offeringId}/affiliate-destination/${action}`,
      { ...(body === undefined ? {} : { body }), cookie: admin.cookie }
    );

  const publish = async (
    input: {
      destination?: boolean;
      domain?: string;
      telephone?: boolean;
    } = {}
  ) => {
    const categoryId = leaves[input.domain ?? "MOBILITY"] as string;
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
    if (input.telephone)
      await send("PUT", `/businesses/${businessId}/information`, {
        body: { contactTelephone: TELEPHONE, name: "Kartal Motors" },
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

    if (input.destination) {
      await send(
        "POST",
        `/businesses/${businessId}/offerings/${offeringId}/affiliate-destination`,
        { body: { reference: DESTINATION }, cookie: account.cookie }
      );
      await administer(offeringId, "validation", { result: "VALID" });
      await administer(offeringId, "enablement");
    }
    return { businessId, cookie: account.cookie, offeringId };
  };

  const armed = async (offeringId: string) => {
    const entered = await send("POST", "/decision/flows", {
      body: { offeringId }
    });
    const decisionFlowId = entered.json<{ decisionFlowId: string }>()
      .decisionFlowId;
    await send("PUT", `/decision/flows/${decisionFlowId}/selection`, {
      body: { offeringId }
    });
    return decisionFlowId;
  };

  const completions = async (decisionFlowId: string) =>
    decisionCompletionsSchema.parse(
      (await send("GET", `/decision/flows/${decisionFlowId}/completion`)).json()
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

    // One leaf per V1 Domain: AC-10 is about the meaning being the same in all
    // three, which is only checkable with more than one.
    for (const domain of ["MOBILITY", "REAL_ESTATE", "TECHNOLOGY"]) {
      const leaf = await send("POST", "/admin/categories", {
        body: {
          domain,
          name: `Yaprak ${domain}`,
          slug: slug(),
          stableKey: key()
        },
        cookie: admin.cookie
      });
      leaves[domain] = leaf.json<{ id: string }>().id;
    }
  });

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    dispatcher.delivered.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("produces neither Completion before anything has happened", async () => {
    const offering = await publish({ destination: true });
    const decisionFlowId = await armed(offering.offeringId);

    const before = await completions(decisionFlowId);

    // Selecting is not completing. The journey is armed and nothing has ended.
    expect(before.affiliateHandoff).toBeNull();
    expect(before.directContact).toBeNull();
  });

  it("produces Affiliate Handoff Completion from a successful initiation", async () => {
    const offering = await publish({ destination: true });
    const decisionFlowId = await armed(offering.offeringId);

    await send("POST", `/decision/flows/${decisionFlowId}/affiliate-handoff`);
    const after = await completions(decisionFlowId);

    // AC-1 and AC-3. The initiation is the Completion; nobody was asked to
    // confirm anything afterwards, and no second act was required.
    expect(after.affiliateHandoff?.offeringId).toBe(offering.offeringId);
    expect(after.directContact).toBeNull();
  });

  it("produces Direct Contact Completion from a successful reveal", async () => {
    const account = await signUp();
    const offering = await publish({ telephone: true });
    const decisionFlowId = await armed(offering.offeringId);

    await send("POST", `/decision/flows/${decisionFlowId}/direct-contact`, {
      body: { channel: "TELEPHONE" },
      cookie: account.cookie
    });
    const after = await completions(decisionFlowId);

    // AC-2. Revealed and made available — that is the end of the platform's
    // part, and the Completion says which channel it was.
    expect(after.directContact?.channel).toBe("TELEPHONE");
    expect(after.directContact?.offeringId).toBe(offering.offeringId);
    expect(after.affiliateHandoff).toBeNull();
  });

  it("keeps the two Completions apart when both happened", async () => {
    const account = await signUp();
    const offering = await publish({ destination: true, telephone: true });
    const decisionFlowId = await armed(offering.offeringId);

    await send("POST", `/decision/flows/${decisionFlowId}/affiliate-handoff`);
    await send("POST", `/decision/flows/${decisionFlowId}/direct-contact`, {
      body: { channel: "TELEPHONE" },
      cookie: account.cookie
    });
    const after = await completions(decisionFlowId);

    // AC-4. Two results, never one. A combined verdict would lose which end
    // the person actually reached.
    expect(after.affiliateHandoff).not.toBeNull();
    expect(after.directContact).not.toBeNull();
    expect(Object.keys(after).sort()).toEqual([
      "affiliateHandoff",
      "decisionFlowId",
      "directContact"
    ]);
  });

  it("produces no Completion from a refused handoff", async () => {
    const offering = await publish();
    const decisionFlowId = await armed(offering.offeringId);

    const refused = await send(
      "POST",
      `/decision/flows/${decisionFlowId}/affiliate-handoff`
    );
    const after = await completions(decisionFlowId);

    // AC-7. Unsuccessful initiation, no evidence, no Completion — the chain
    // holds because the Completion is the evidence rather than a flag beside
    // it.
    expect(refused.statusCode).toBe(422);
    expect(after.affiliateHandoff).toBeNull();
  });

  it("produces no Completion from a refused reveal", async () => {
    const account = await signUp();
    const offering = await publish();
    const decisionFlowId = await armed(offering.offeringId);

    const refused = await send(
      "POST",
      `/decision/flows/${decisionFlowId}/direct-contact`,
      { body: { channel: "TELEPHONE" }, cookie: account.cookie }
    );
    const after = await completions(decisionFlowId);

    expect(refused.statusCode).toBe(422);
    expect(after.directContact).toBeNull();
  });

  it("claims no purchase, reply or external result", async () => {
    const offering = await publish({ destination: true });
    const decisionFlowId = await armed(offering.offeringId);
    await send("POST", `/decision/flows/${decisionFlowId}/affiliate-handoff`);

    const response = await send(
      "GET",
      `/decision/flows/${decisionFlowId}/completion`
    );

    // AC-5 and AC-6. Completion means the platform's part ended, and the
    // answer says nothing about a sale, a call, a reply or a service result —
    // there is no field in which it could.
    expect(response.body).not.toMatch(
      /purchase|sale|booking|contract|reply|response|success|satın|sipariş|yanıt/iu
    );
  });

  it("stores no Completion of its own", async () => {
    const offering = await publish({ destination: true });
    const decisionFlowId = await armed(offering.offeringId);

    await send("POST", `/decision/flows/${decisionFlowId}/affiliate-handoff`);
    await completions(decisionFlowId);
    await completions(decisionFlowId);

    // AC-9. Reading it twice writes nothing: there is no completion table, so
    // there is no personal Decision history for one to accumulate into.
    const tables = await pool.query<{ table_name: string }>(
      `select table_name from information_schema.tables
       where table_schema = 'public'
         and table_name similar to '%(completion|favorite|watch)%'`
    );
    expect(tables.rows).toEqual([]);
  });

  it("means the same thing in every Domain", async () => {
    const results: Record<string, unknown> = {};
    for (const domain of ["MOBILITY", "REAL_ESTATE", "TECHNOLOGY"]) {
      const offering = await publish({ destination: true, domain });
      const decisionFlowId = await armed(offering.offeringId);
      await send("POST", `/decision/flows/${decisionFlowId}/affiliate-handoff`);
      const after = await completions(decisionFlowId);
      results[domain] = {
        affiliate: after.affiliateHandoff !== null,
        contact: after.directContact,
        shape: Object.keys(after).sort()
      };
    }

    // AC-10. Mobility, Real Estate and Technology reach the same Completion in
    // the same shape, because nothing on this path consults a Domain at all.
    expect(results.REAL_ESTATE).toEqual(results.MOBILITY);
    expect(results.TECHNOLOGY).toEqual(results.MOBILITY);
  });

  it("leaves the evidence for Basic Analytics to consume", async () => {
    const account = await signUp();
    const offering = await publish({ destination: true, telephone: true });
    const decisionFlowId = await armed(offering.offeringId);
    await send("POST", `/decision/flows/${decisionFlowId}/affiliate-handoff`);
    await send("POST", `/decision/flows/${decisionFlowId}/direct-contact`, {
      body: { channel: "TELEPHONE" },
      cookie: account.cookie
    });

    // AC-8. PRD-0006 counts the two Completions separately, and Compare Start
    // and Decision Chat Start alongside them — four occurrences, four tables,
    // none of them redefining what the others mean.
    for (const table of [
      "affiliate_handoff",
      "direct_contact_reveal",
      "compare_start",
      "decision_chat_start"
    ]) {
      const exists = await pool.query(
        `select 1 from information_schema.tables
         where table_schema = 'public' and table_name = $1`,
        [table]
      );
      expect(exists.rowCount).toBe(1);
    }
  });

  it("answers an expired flow the same way as one that never existed", async () => {
    const offering = await publish({ destination: true });
    const decisionFlowId = await armed(offering.offeringId);
    await pool.query(
      `update decision_flow set expires_at = now() - interval '1 minute'
       where id = $1`,
      [decisionFlowId]
    );

    const expired = await send(
      "GET",
      `/decision/flows/${decisionFlowId}/completion`
    );
    const never = await send(
      "GET",
      `/decision/flows/${randomUUID()}/completion`
    );

    // The read belongs to the current flow. The evidence survives for
    // PRD-0006; what does not survive is a person's ability to re-read their
    // own Decision after it ended.
    expect(expired.statusCode).toBe(404);
    expect(never.statusCode).toBe(404);
  });
});
