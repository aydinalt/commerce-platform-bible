import { randomUUID } from "node:crypto";
import { createElement } from "react";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type {
  DecisionCompletionsResponse,
  DecisionContextResponse
} from "@commerce/contracts";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { HandoffChoice } from "../apps/web/src/app/decision/handoff";
import {
  AFFILIATE_COMPLETION,
  AFTER_COMPLETION,
  DIRECT_CONTACT_COMPLETION,
  NO_AFFILIATE,
  NO_CONTACT_CHANNEL,
  handoffRefusal
} from "../apps/web/src/decision/copy";
import { DECISION_IDLE } from "../apps/web/src/decision/state";
import { returnPath } from "../apps/web/src/identity/session";

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

const ORIGIN = "http://localhost:3000";
const PASSWORD = "correct horse battery staple";
const DESTINATION = "https://example.test/kirmizi-araba";

class RecordingDispatcher implements EmailDispatcher {
  readonly delivered: EmailMessage[] = [];

  deliver(message: EmailMessage): Promise<void> {
    this.delivered.push(message);
    return Promise.resolve();
  }
}

/**
 * UX-0009 §9 to §12.
 *
 * The end of the journey is where a platform is most tempted to claim more
 * than it did — a sale, a reply, a success. So these tests check what is *not*
 * claimed as carefully as what happens: a failed handoff records no
 * Completion, a Guest learns nothing protected, and the two Completions stay
 * two.
 */
suite("Increment I8 Decision handoff", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

  const address = () => `dh-${randomUUID()}@example.test`;
  const key = () => `K${randomUUID().replaceAll("-", "").toUpperCase()}`;
  const slug = () => `s-${randomUUID()}`;

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

  /**
   * A Published Offering, optionally with contact details and an Enabled
   * Affiliate Destination.
   */
  const offering = async (
    options: { contact?: boolean; destination?: boolean } = {}
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
    if (options.contact === true)
      await send("PUT", `/businesses/${businessId}/information`, {
        body: {
          contactEmail: "satis@example.test",
          contactTelephone: "05551112233",
          contactUrl: null,
          logoUrl: null,
          name: "Kartal Motors",
          shortDescription: null
        },
        cookie: account.cookie
      });

    const created = await send("POST", `/businesses/${businessId}/offerings`, {
      body: { categoryId, slug: slug(), title: "Kırmızı araba" },
      cookie: account.cookie
    });
    const offeringId = created.json<{ id: string }>().id;

    if (options.destination === true) {
      await send(
        "POST",
        `/businesses/${businessId}/offerings/${offeringId}/affiliate-destination`,
        { body: { reference: DESTINATION }, cookie: account.cookie }
      );
      await send(
        "POST",
        `/admin/offerings/${offeringId}/affiliate-destination/validation`,
        { body: { result: "VALID" }, cookie: admin.cookie }
      );
      await send(
        "POST",
        `/admin/offerings/${offeringId}/affiliate-destination/enablement`,
        { cookie: admin.cookie }
      );
    }

    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/publication`,
      { cookie: account.cookie }
    );
    return { businessId, offeringId, owner: account };
  };

  /// One flow with the Offering selected, which is what §9 waits for.
  const selected = async (offeringId: string) => {
    const entered = (
      await send("POST", "/decision/flows", { body: { offeringId } })
    ).json<DecisionContextResponse>();
    await send("PUT", `/decision/flows/${entered.decisionFlowId}/selection`, {
      body: { offeringId }
    });
    return entered.decisionFlowId;
  };

  const context = async (decisionFlowId: string) =>
    (
      await send("GET", `/decision/flows/${decisionFlowId}`)
    ).json<DecisionContextResponse>();

  const completions = async (decisionFlowId: string) =>
    (
      await send("GET", `/decision/flows/${decisionFlowId}/completion`)
    ).json<DecisionCompletionsResponse>();

  beforeAll(async () => {
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
    await processor.close();
    await pool.end();
  });

  it("offers the Affiliate path exactly where it would be honoured", async () => {
    const withDestination = await offering({ destination: true });
    const without = await offering();

    const good = await context(await selected(withDestination.offeringId));
    const bad = await context(await selected(without.offeringId));

    // §9. The read answers the same conjunction the initiation enforces, so an
    // offered path is one the platform would honour and a withheld one is one
    // it would have refused. Neither read carries the address.
    expect(good.affiliateAvailable).toBe(true);
    expect(bad.handoffAvailable).toBe(true);
    expect(bad.affiliateAvailable).toBe(false);
    expect(JSON.stringify(good)).not.toContain(DESTINATION);
  });

  it("offers no path at all until something is selected", async () => {
    const { offeringId } = await offering({ destination: true });
    const entered = (
      await send("POST", "/decision/flows", { body: { offeringId } })
    ).json<DecisionContextResponse>();

    const before = await context(entered.decisionFlowId);
    const refused = await send(
      "POST",
      `/decision/flows/${entered.decisionFlowId}/affiliate-handoff`
    );

    // §8. A handoff waits for the explicit act, and nothing supplies one.
    expect(before.handoffAvailable).toBe(false);
    expect(before.affiliateAvailable).toBe(false);
    expect(refused.statusCode).toBe(422);
    expect(refused.json<{ code: string }>().code).toBe("NOTHING_SELECTED");
    expect(handoffRefusal("NOTHING_SELECTED")).toMatch(/önce bir ilan seçin/iu);
  });

  it("claims no Completion when a handoff is refused", async () => {
    const { offeringId } = await offering();
    const decisionFlowId = await selected(offeringId);

    const refused = await send(
      "POST",
      `/decision/flows/${decisionFlowId}/affiliate-handoff`
    );
    const after = await completions(decisionFlowId);

    // §18. The refusal happens inside the transaction that would have recorded
    // the initiation, so "no Completion occurs" is a property of the write
    // rather than a cleanup afterwards.
    expect(refused.statusCode).toBe(422);
    expect(after.affiliateHandoff).toBeNull();
    expect(after.directContact).toBeNull();
  });

  it("tells a Guest nothing protected and asks nothing of the Business", async () => {
    const { offeringId } = await offering({ contact: true });
    const decisionFlowId = await selected(offeringId);

    const channels = await send(
      "GET",
      `/decision/flows/${decisionFlowId}/direct-contact`
    );
    const refused = await send(
      "POST",
      `/decision/flows/${decisionFlowId}/direct-contact`,
      { body: { channel: "TELEPHONE" } }
    );

    // §11.3 and §11.2. Knowing a telephone number exists is not being told it,
    // and the choice has to be offerable before the reveal. A Guest is
    // interrupted rather than refused outright, and returns to repeat this
    // exact request.
    expect(channels.json<{ available: string[] }>().available).toContain(
      "TELEPHONE"
    );
    expect(channels.json<{ revealable: boolean }>().revealable).toBe(false);
    expect(channels.body).not.toContain("05551112233");
    expect(refused.statusCode).toBe(401);
    expect((await completions(decisionFlowId)).directContact).toBeNull();
    // The return names a destination this application owns, never an address.
    expect(returnPath("decision")).toBe("/decision");
    expect(returnPath("https://elsewhere.test")).toBeNull();
  });

  it("counts the two Completions as two", async () => {
    const first = await offering({ destination: true });
    const second = await offering({ contact: true });
    const account = await signUp();

    const affiliateFlow = await selected(first.offeringId);
    await send("POST", `/decision/flows/${affiliateFlow}/affiliate-handoff`);

    const contactFlow = await selected(second.offeringId);
    await send("POST", `/decision/flows/${contactFlow}/direct-contact`, {
      body: { channel: "EMAIL" },
      cookie: account.cookie
    });

    const affiliate = await completions(affiliateFlow);
    const contact = await completions(contactFlow);

    // §12. Two different ends to a journey, and PRD-0006 counts them
    // separately — so each appears only where its own evidence exists.
    expect(affiliate.affiliateHandoff?.offeringId).toBe(first.offeringId);
    expect(affiliate.directContact).toBeNull();
    expect(contact.directContact?.channel).toBe("EMAIL");
    expect(contact.affiliateHandoff).toBeNull();
  });

  it("claims nothing about what happened after the handoff", () => {
    // §12. Neither sentence claims a purchase, a sale, a booking, a contract,
    // an application, a delivery, an answer or a reply — and neither asks for
    // an account now that the journey has ended.
    for (const sentence of [
      AFFILIATE_COMPLETION,
      DIRECT_CONTACT_COMPLETION,
      AFTER_COMPLETION
    ]) {
      expect(sentence).not.toMatch(
        /satın|sipariş|sözleşme|rezervasyon|başvuru|teslim|yanıt|cevap|tebrik/iu
      );
      expect(sentence).not.toMatch(/kayıt ol|hesap oluştur|üye ol/iu);
    }
  });

  it("shows no destination and no message box where a path is unavailable", () => {
    const markup = renderToStaticMarkup(
      createElement(HandoffChoice, {
        affiliateAction: () => Promise.resolve(DECISION_IDLE),
        affiliateAvailable: false,
        channels: null,
        contactAction: () => Promise.resolve(DECISION_IDLE)
      })
    );

    // §16. The unavailable Affiliate path says so without exposing where it
    // would have led, and the absent contact channel is stated rather than
    // replaced by a message form — UX-0007 does not exist, and a form here
    // would promise a reply nothing could deliver.
    expect(markup).toContain(NO_AFFILIATE);
    expect(markup).toContain(NO_CONTACT_CHANNEL);
    expect(markup).not.toContain("http");
    // No control that would take a message. The sentence above does use the
    // word — it is there to say the platform has no such place — so the check
    // is against inputs rather than against wording.
    expect(markup).not.toMatch(/<textarea|<input|<form/iu);
  });
});
