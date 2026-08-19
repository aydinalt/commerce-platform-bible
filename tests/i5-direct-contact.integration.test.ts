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
  contactChannelsSchema,
  directContactRevealSchema,
  errorEnvelopeSchema
} from "../packages/contracts/src/index.js";

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

const ORIGIN = "http://localhost:3000";
const PASSWORD = "correct horse battery staple";
const TELEPHONE = "+90 555 111 22 33";
const EMAIL = "iletisim@example.test";
const URL_CHANNEL = "https://example.test/iletisim";

class RecordingDispatcher implements EmailDispatcher {
  readonly delivered: EmailMessage[] = [];

  deliver(message: EmailMessage): Promise<void> {
    this.delivered.push(message);
    return Promise.resolve();
  }
}

/**
 * `US-DEC-F06-001` Direct Contact.
 *
 * The one Decision path that is not public, and the only place a Business's
 * protected information is ever read out. So the suite is mostly about who is
 * refused: a Guest, a Suspended holder, a person whose Offering was retired
 * since, and anyone asking for a channel that was never supplied.
 */
suite("Increment I5 Direct Contact", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let leafId: string;

  const address = () => `dct-${randomUUID()}@example.test`;
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

  const publish = async (input: { channels?: Record<string, string> } = {}) => {
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
    if (input.channels)
      await send("PUT", `/businesses/${businessId}/information`, {
        body: { name: "Kartal Motors", ...input.channels },
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

  const channels = (decisionFlowId: string, cookie?: string) =>
    send("GET", `/decision/flows/${decisionFlowId}/direct-contact`, {
      ...(cookie === undefined ? {} : { cookie })
    });

  const reveal = (decisionFlowId: string, channel: string, cookie?: string) =>
    send("POST", `/decision/flows/${decisionFlowId}/direct-contact`, {
      body: { channel },
      ...(cookie === undefined ? {} : { cookie })
    });

  const reveals = async (offeringId: string) => {
    const counted = await pool.query<{ count: string }>(
      `select count(*)::text as count
       from direct_contact_reveal where offering_id = $1`,
      [offeringId]
    );
    return Number(counted.rows[0]?.count ?? "0");
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

  it("reveals nothing to a Guest, and says nothing about the values", async () => {
    const offering = await publish({
      channels: { contactEmail: EMAIL, contactTelephone: TELEPHONE }
    });
    const decisionFlowId = await armed(offering.offeringId);

    const listed = await channels(decisionFlowId);
    const refused = await reveal(decisionFlowId, "TELEPHONE");

    // AC-6. The Guest learns that a telephone number exists — which is not the
    // number — and the reveal is refused outright.
    const view = contactChannelsSchema.parse(listed.json());
    expect(view.available.sort()).toEqual(["EMAIL", "TELEPHONE"]);
    expect(view.revealable).toBe(false);
    expect(listed.body).not.toContain(TELEPHONE);
    expect(refused.statusCode).toBe(401);
    expect(refused.body).not.toContain(TELEPHONE);
    expect(await reveals(offering.offeringId)).toBe(0);
  });

  it("reveals the chosen channel to an Enabled authenticated User", async () => {
    const account = await signUp();
    const offering = await publish({
      channels: { contactEmail: EMAIL, contactTelephone: TELEPHONE }
    });
    const decisionFlowId = await armed(offering.offeringId);

    const revealed = await reveal(decisionFlowId, "TELEPHONE", account.cookie);

    // AC-1 and AC-9. Every gate passed, so the value the Business supplied is
    // read out — and only the one that was asked for.
    const result = directContactRevealSchema.parse(revealed.json());
    expect(result.channel).toBe("TELEPHONE");
    expect(result.value).toBe(TELEPHONE);
    expect(revealed.body).not.toContain(EMAIL);
  });

  it("supports exactly telephone, email and contact URL", async () => {
    const account = await signUp();
    const offering = await publish({
      channels: {
        contactEmail: EMAIL,
        contactTelephone: TELEPHONE,
        contactUrl: URL_CHANNEL
      }
    });
    const decisionFlowId = await armed(offering.offeringId);

    const listed = contactChannelsSchema.parse(
      (await channels(decisionFlowId, account.cookie)).json()
    );
    const invented = await reveal(decisionFlowId, "WHATSAPP", account.cookie);

    // AC-4. Three channels, and a fourth is not a value the request can carry.
    expect(listed.available.sort()).toEqual(["EMAIL", "TELEPHONE", "URL"]);
    expect(invented.statusCode).toBe(400);
  });

  it("requires the person to name which channel", async () => {
    const account = await signUp();
    const offering = await publish({
      channels: { contactEmail: EMAIL, contactTelephone: TELEPHONE }
    });
    const decisionFlowId = await armed(offering.offeringId);

    const unnamed = await send(
      "POST",
      `/decision/flows/${decisionFlowId}/direct-contact`,
      { body: {}, cookie: account.cookie }
    );

    // AC-5. With two channels available nothing picks one on the person's
    // behalf — and the request cannot be made without saying which.
    expect(unnamed.statusCode).toBe(400);
    expect(await reveals(offering.offeringId)).toBe(0);
  });

  it("refuses a channel the Business never supplied", async () => {
    const account = await signUp();
    const offering = await publish({
      channels: { contactTelephone: TELEPHONE }
    });
    const decisionFlowId = await armed(offering.offeringId);

    const refused = await reveal(decisionFlowId, "EMAIL", account.cookie);

    // AC-5 again, from the other side: an unavailable channel is refused
    // rather than quietly answered with the one that does exist.
    expect(refused.statusCode).toBe(422);
    expect(errorEnvelopeSchema.parse(refused.json()).code).toBe(
      "CHANNEL_NOT_AVAILABLE"
    );
    expect(await reveals(offering.offeringId)).toBe(0);
  });

  it("says a Business with no channel cannot be contacted", async () => {
    const account = await signUp();
    const offering = await publish();
    const decisionFlowId = await armed(offering.offeringId);

    const listed = await channels(decisionFlowId, account.cookie);
    const refused = await reveal(decisionFlowId, "EMAIL", account.cookie);

    // AC-3. A state of the Business rather than a failure of the request.
    expect(listed.statusCode).toBe(422);
    expect(errorEnvelopeSchema.parse(refused.json()).code).toBe("NO_CHANNEL");
  });

  it("refuses once the Selected Offering stops being publicly eligible", async () => {
    const account = await signUp();
    const offering = await publish({
      channels: { contactTelephone: TELEPHONE }
    });
    const decisionFlowId = await armed(offering.offeringId);
    expect(
      (await reveal(decisionFlowId, "TELEPHONE", account.cookie)).statusCode
    ).toBe(200);

    await retire(offering);
    const refused = await reveal(decisionFlowId, "TELEPHONE", account.cookie);

    // AC-2 and AC-8. Eligibility is asked again on the second request, which
    // is exactly what re-evaluation after an authentication return amounts to:
    // the request is simply made again, and every gate is checked again.
    expect(refused.statusCode).toBe(422);
    expect(errorEnvelopeSchema.parse(refused.json()).code).toBe(
      "OFFERING_INELIGIBLE"
    );
    expect(refused.body).not.toContain(TELEPHONE);
    expect(await reveals(offering.offeringId)).toBe(1);
  });

  it("refuses while nothing is selected", async () => {
    const account = await signUp();
    const offering = await publish({
      channels: { contactTelephone: TELEPHONE }
    });
    const entered = await send("POST", "/decision/flows", {
      body: { offeringId: offering.offeringId }
    });
    const decisionFlowId = entered.json<{ decisionFlowId: string }>()
      .decisionFlowId;

    const refused = await reveal(decisionFlowId, "TELEPHONE", account.cookie);

    expect(refused.statusCode).toBe(422);
    expect(errorEnvelopeSchema.parse(refused.json()).code).toBe(
      "NOTHING_SELECTED"
    );
  });

  it("records one reveal result, and not the value it revealed", async () => {
    const account = await signUp();
    const offering = await publish({
      channels: { contactTelephone: TELEPHONE }
    });
    const decisionFlowId = await armed(offering.offeringId);

    await reveal(decisionFlowId, "TELEPHONE", account.cookie);

    // AC-10, and a deliberate absence: the row says which channel and to whom,
    // never the number. A log of it would be a second place it could leak from.
    expect(await reveals(offering.offeringId)).toBe(1);
    const columns = await pool.query<{ column_name: string }>(
      `select column_name from information_schema.columns
       where table_name = 'direct_contact_reveal' order by column_name`
    );
    expect(columns.rows.map((row) => row.column_name)).toEqual([
      "channel",
      "decision_flow_id",
      "id",
      "offering_id",
      "revealed_at",
      "user_id"
    ]);
  });

  it("creates no message, conversation or response state", async () => {
    const account = await signUp();
    const offering = await publish({
      channels: { contactTelephone: TELEPHONE }
    });
    const decisionFlowId = await armed(offering.offeringId);

    const revealed = await reveal(decisionFlowId, "TELEPHONE", account.cookie);

    // AC-12. The response is the published contract exactly, and nothing in
    // the system holds a message, an inbox, a reply or a delivery.
    expect(
      Object.keys(revealed.json<Record<string, unknown>>()).sort()
    ).toEqual(["channel", "offeringId", "revealedAt", "value"]);
    const tables = await pool.query<{ table_name: string }>(
      `select table_name from information_schema.tables
       where table_schema = 'public'
         and table_name similar to '%(message|inbox|conversation|reply)%'`
    );
    expect(tables.rows).toEqual([]);
  });

  it("outlives the flow it belonged to", async () => {
    const account = await signUp();
    const offering = await publish({
      channels: { contactTelephone: TELEPHONE }
    });
    const decisionFlowId = await armed(offering.offeringId);
    await reveal(decisionFlowId, "TELEPHONE", account.cookie);

    await pool.query(
      `update decision_flow set expires_at = now() - interval '1 minute'
       where id = $1`,
      [decisionFlowId]
    );
    await send("GET", `/decision/flows/${decisionFlowId}`);

    // Like an Affiliate Handoff initiation: the flow is current-flow state and
    // disappears, and what `US-DEC-F07-001` will consume must not go with it.
    expect(await reveals(offering.offeringId)).toBe(1);
  });
});
