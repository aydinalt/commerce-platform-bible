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
  affiliateHandoffSchema,
  errorEnvelopeSchema
} from "../packages/contracts/src/index.js";

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

const ORIGIN = "http://localhost:3000";
const PASSWORD = "correct horse battery staple";
const DESTINATION = "https://partner.example.test/ilan/kirmizi-araba";

class RecordingDispatcher implements EmailDispatcher {
  readonly delivered: EmailMessage[] = [];

  deliver(message: EmailMessage): Promise<void> {
    this.delivered.push(message);
    return Promise.resolve();
  }
}

/**
 * `US-DEC-F05-001` Affiliate Handoff.
 *
 * The first thing in the system that points a person out of it, so the suite
 * cares most about the two eligibility results guarding the door — and about
 * the promise that a refused handoff leaves nothing behind for Completion to
 * find.
 */
suite("Increment I5 Affiliate Handoff", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let leafId: string;

  const address = () => `hnd-${randomUUID()}@example.test`;
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

  /**
   * One published Offering, optionally with an eligible Affiliate Destination.
   *
   * Eligibility is reached through the real governance path — authored, then
   * validated and enabled by an Admin — because `US-DEC-F05-001` AC-3 says the
   * result is consumed rather than computed, and a planted row would not prove
   * that.
   */
  const publish = async (input: { destination?: boolean } = {}) => {
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

  const administer = (
    offeringId: string,
    action: "validation" | "enablement" | "disablement",
    body?: unknown
  ) =>
    send(
      "POST",
      `/admin/offerings/${offeringId}/affiliate-destination/${action}`,
      {
        ...(body === undefined ? {} : { body }),
        cookie: admin.cookie
      }
    );

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

  const handoff = (decisionFlowId: string, cookie?: string) =>
    send("POST", `/decision/flows/${decisionFlowId}/affiliate-handoff`, {
      ...(cookie === undefined ? {} : { cookie })
    });

  const initiations = async (offeringId: string) => {
    const counted = await pool.query<{ count: string }>(
      `select count(*)::text as count
       from affiliate_handoff where offering_id = $1`,
      [offeringId]
    );
    return Number(counted.rows[0]?.count ?? "0");
  };

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

  it("hands a Guest off without an account before or after", async () => {
    const offering = await publish({ destination: true });
    const decisionFlowId = await armed(offering.offeringId);
    const accountsBefore = await pool.query<{ count: string }>(
      `select count(*)::text as count from user_account`
    );

    const initiated = await handoff(decisionFlowId);

    // AC-1 and AC-7. No session was sent, none was created, and no
    // Registration stands between the person and the destination.
    expect(initiated.statusCode).toBe(200);
    const accountsAfter = await pool.query<{ count: string }>(
      `select count(*)::text as count from user_account`
    );
    expect(accountsAfter.rows[0]?.count).toBe(accountsBefore.rows[0]?.count);
  });

  it("makes the exact eligible destination active", async () => {
    const offering = await publish({ destination: true });
    const decisionFlowId = await armed(offering.offeringId);

    const initiated = affiliateHandoffSchema.parse(
      (await handoff(decisionFlowId)).json()
    );

    // AC-6. The address the Business authored and an Admin enabled, unchanged
    // — no wrapper, no tracking parameter, no interstitial of our own.
    expect(initiated.destination).toBe(DESTINATION);
    expect(initiated.offeringId).toBe(offering.offeringId);
  });

  it("records one initiation for each successful handoff", async () => {
    const offering = await publish({ destination: true });
    const decisionFlowId = await armed(offering.offeringId);

    await handoff(decisionFlowId);
    await handoff(decisionFlowId);

    // AC-8. Unlike a Discovery Start this is not once per flow: a person who
    // hands off, comes back and hands off again has done it twice.
    expect(await initiations(offering.offeringId)).toBe(2);
  });

  it("refuses while nothing is selected, and records nothing", async () => {
    const offering = await publish({ destination: true });
    const entered = await send("POST", "/decision/flows", {
      body: { offeringId: offering.offeringId }
    });
    const decisionFlowId = entered.json<{ decisionFlowId: string }>()
      .decisionFlowId;

    const refused = await handoff(decisionFlowId);

    // AC-5 and AC-9. A valid context is not a decision; the person has to
    // choose, and until they do there is nothing to hand off and nothing to
    // count.
    expect(refused.statusCode).toBe(422);
    expect(errorEnvelopeSchema.parse(refused.json()).code).toBe(
      "NOTHING_SELECTED"
    );
    expect(await initiations(offering.offeringId)).toBe(0);
  });

  it("refuses when the Offering has no eligible Affiliate Destination", async () => {
    const withoutDestination = await publish();
    const decisionFlowId = await armed(withoutDestination.offeringId);

    const refused = await handoff(decisionFlowId);

    // AC-2 and AC-4. Public eligibility alone is not enough; Handoff
    // Eligibility is a second, separately owned result.
    expect(refused.statusCode).toBe(422);
    expect(errorEnvelopeSchema.parse(refused.json()).code).toBe(
      "DESTINATION_INELIGIBLE"
    );
    expect(await initiations(withoutDestination.offeringId)).toBe(0);
  });

  it("refuses once the destination is disabled again", async () => {
    const offering = await publish({ destination: true });
    const decisionFlowId = await armed(offering.offeringId);
    expect((await handoff(decisionFlowId)).statusCode).toBe(200);

    await administer(offering.offeringId, "disablement");
    const refused = await handoff(decisionFlowId);

    // AC-3. The result is read at the moment of the handoff, so an Admin
    // disabling a destination stops the next person immediately — nothing here
    // remembers that it used to be eligible.
    expect(refused.statusCode).toBe(422);
    expect(errorEnvelopeSchema.parse(refused.json()).code).toBe(
      "DESTINATION_INELIGIBLE"
    );
    expect(await initiations(offering.offeringId)).toBe(1);
  });

  it("refuses once the Offering stops being publicly eligible", async () => {
    const offering = await publish({ destination: true });
    const decisionFlowId = await armed(offering.offeringId);

    await retire(offering);
    const refused = await handoff(decisionFlowId);

    // AC-2 and AC-4, the other half. Two conditions, two answers: a retired
    // Offering and an unvalidated destination are different problems with
    // different remedies.
    expect(refused.statusCode).toBe(422);
    expect(errorEnvelopeSchema.parse(refused.json()).code).toBe(
      "OFFERING_INELIGIBLE"
    );
    expect(await initiations(offering.offeringId)).toBe(0);
  });

  it("keeps the address that was made active even after it is re-authored", async () => {
    const offering = await publish({ destination: true });
    const decisionFlowId = await armed(offering.offeringId);
    await handoff(decisionFlowId);

    await send(
      "POST",
      `/businesses/${offering.businessId}/offerings/${offering.offeringId}/affiliate-destination`,
      {
        body: { reference: "https://partner.example.test/baska" },
        cookie: offering.cookie
      }
    );

    // Where a person was actually sent is a fact about the past, and the
    // Business changing its mind afterwards does not rewrite it.
    const recorded = await pool.query<{ destination: string }>(
      `select destination from affiliate_handoff where offering_id = $1`,
      [offering.offeringId]
    );
    expect(recorded.rows[0]?.destination).toBe(DESTINATION);
  });

  it("outlives the flow it belonged to", async () => {
    const offering = await publish({ destination: true });
    const decisionFlowId = await armed(offering.offeringId);
    await handoff(decisionFlowId);

    await pool.query(
      `update decision_flow set expires_at = now() - interval '1 minute'
       where id = $1`,
      [decisionFlowId]
    );
    await send("GET", `/decision/flows/${decisionFlowId}`);

    // The flow is current-flow state and disappears; the initiation is what
    // `US-DEC-F07-001` will consume as Completion, so it must not go with it.
    expect(await initiations(offering.offeringId)).toBe(1);
  });

  it("claims nothing about what happens at the destination", async () => {
    const offering = await publish({ destination: true });
    const decisionFlowId = await armed(offering.offeringId);

    const initiated = await handoff(decisionFlowId);

    // AC-10. The response is the published contract exactly: where, when, and
    // for which Offering. There is no field for a purchase, a confirmation, a
    // Favorite or a message, so none can be implied.
    expect(
      Object.keys(initiated.json<Record<string, unknown>>()).sort()
    ).toEqual(["destination", "initiatedAt", "offeringId"]);
    expect(initiated.body).not.toMatch(/success|purchase|complete|tamamlan/iu);
  });
});
