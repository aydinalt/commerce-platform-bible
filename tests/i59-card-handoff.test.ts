import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import { silentLogger } from "../packages/testing/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { ListingCard } from "../apps/web/src/app/discovery/listing-card.js";
import {
  browseViewSchema,
  searchViewSchema,
  type ListingCardResponse
} from "../packages/contracts/src/index.js";

/**
 * `I59` — the card may send a person to the partner.
 *
 * **This increment revised a Frozen acceptance criterion, which is why the
 * suite is as much about what did not change as about what did.**
 * `US-DSC-F06-001` v1.0 AC-7 forbade a Listing Card from performing an
 * Affiliate Handoff; v1.1, Frozen on 2026-09-02, admits one. The prohibition had a reason —
 * a card is a bounded representation and must not become the surface a
 * downstream behaviour is owned by — and the revision keeps that reason alive
 * through three constraints, each of which is a case below:
 *
 * - the destination never reaches the card (AC-5, untouched);
 * - the handoff still travels through the Decision Flow that records it
 *   (`US-DEC-F05-001`, unamended);
 * - no affordance appears where the platform could not perform one (AC-10).
 *
 * A revision whose constraints are not tested is a prohibition that was simply
 * dropped.
 */
const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

const ORIGIN = "http://localhost:3000";
const PASSWORD = "correct horse battery staple";
const DESTINATION = "https://partner.example.test/urun/telefon";

class RecordingDispatcher implements EmailDispatcher {
  readonly delivered: EmailMessage[] = [];
  deliver(message: EmailMessage): Promise<void> {
    this.delivered.push(message);
    return Promise.resolve();
  }
}

suite("Increment I59 the card reaches the partner", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

  const address = () => `crd-${randomUUID()}@example.test`;
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
    action: "validation" | "enablement" | "disablement",
    body?: unknown
  ) =>
    send(
      "POST",
      `/admin/offerings/${offeringId}/affiliate-destination/${action}`,
      { ...(body === undefined ? {} : { body }), cookie: admin.cookie }
    );

  /**
   * One partner's published listing, with or without a reachable destination.
   *
   * Eligibility is reached the long way — authored by the owner, then validated
   * and enabled by an Admin — because that is the only path that proves the
   * card is reading the same Eligible state the handoff will re-read.
   */
  const list = async (input: {
    amount: string;
    businessName: string;
    destination: boolean;
    title: string;
  }) => {
    const account = await signUp();
    const business = await send("POST", "/businesses", {
      body: { name: input.businessName, slug: slug() },
      cookie: account.cookie
    });
    const businessId = business.json<{ id: string }>().id;
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });
    const offering = await send("POST", `/businesses/${businessId}/offerings`, {
      body: { categoryId, slug: slug(), title: input.title },
      cookie: account.cookie
    });
    const offeringId = offering.json<{ id: string }>().id;
    await send(
      "PUT",
      `/businesses/${businessId}/offerings/${offeringId}/content`,
      {
        body: {
          attributes: [],
          categoryId,
          pricing: {
            amount: input.amount,
            currency: "TRY",
            kind: "FIXED",
            stockState: "IN_STOCK"
          },
          title: input.title
        },
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

  const browse = async () =>
    browseViewSchema.parse(
      (
        await send("POST", `/discovery/browse/categories/${categoryId}`, {
          body: {}
        })
      ).json()
    );

  const cardFor = async (title: string) =>
    ((await browse()).results ?? []).find((card) => card.title === title);

  /**
   * What the card's control does when it is pressed, in the order the server
   * action performs it: enter a flow, select the Offering, initiate.
   *
   * Written out here rather than imported because the action itself reaches for
   * `next/headers` and a redirect. What is worth proving is that the three
   * steps are the platform's existing ones — a shortcut through the recorded
   * path rather than a private route to a partner.
   */
  const pressTheButton = async (offeringId: string) => {
    const entered = await send("POST", "/decision/flows", {
      body: { offeringId }
    });
    const decisionFlowId = entered.json<{ decisionFlowId: string }>()
      .decisionFlowId;
    await send("PUT", `/decision/flows/${decisionFlowId}/selection`, {
      body: { offeringId }
    });
    return send(
      "POST",
      `/decision/flows/${decisionFlowId}/affiliate-handoff`,
      {}
    );
  };

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
    const category = await send("POST", "/admin/categories", {
      body: {
        domain: "MOBILITY",
        name: `Kart ${randomUUID().slice(0, 8)}`,
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

  it("tells the card a handoff is available, and never where it goes", async () => {
    const title = `Telefon ${randomUUID().slice(0, 8)}`;
    await list({
      amount: "42990.00",
      businessName: "Teknoloji Deposu",
      destination: true,
      title
    });

    const card = await cardFor(title);
    expect(card?.handoffAvailable).toBe(true);
    /*
     * AC-5, unchanged by the revision and the reason it could be made at all.
     * The whole card is searched, not one field: a destination that leaked
     * through any other key would be just as public.
     */
    expect(JSON.stringify(card)).not.toContain("partner.example.test");
    expect(JSON.stringify(card)).not.toContain(DESTINATION);
  });

  it("says no handoff where a partner set no destination", async () => {
    const title = `Kulaklık ${randomUUID().slice(0, 8)}`;
    await list({
      amount: "4290.00",
      businessName: "Vitrin Elektronik",
      destination: false,
      title
    });

    // AC-10. The ordinary case, and not a failure: the card opens the Offering
    // the way every card did before the criterion was revised.
    expect((await cardFor(title))?.handoffAvailable).toBe(false);
  });

  it("records the handoff the Decision Story owns", async () => {
    const title = `Tablet ${randomUUID().slice(0, 8)}`;
    const offering = await list({
      amount: "18400.00",
      businessName: "Anadolu Bilişim",
      destination: true,
      title
    });

    expect(await initiations(offering.offeringId)).toBe(0);
    const response = await pressTheButton(offering.offeringId);

    expect(response.statusCode).toBe(200);
    expect(response.json<{ destination: string }>().destination).toBe(
      DESTINATION
    );
    /*
     * The point of the whole increment. A card that reached a partner without
     * this row would have taken the Affiliate Handoff away from
     * `US-DEC-F05-001` — and the Completion that Story requires would exist for
     * handoffs made from the Decision panel and not for the ones people
     * actually make.
     */
    expect(await initiations(offering.offeringId)).toBe(1);
  });

  it("stops offering the partner the moment the destination is disabled", async () => {
    const title = `Kamera ${randomUUID().slice(0, 8)}`;
    const offering = await list({
      amount: "26750.00",
      businessName: "Teknoloji Deposu",
      destination: true,
      title
    });
    expect((await cardFor(title))?.handoffAvailable).toBe(true);

    await administer(offering.offeringId, "disablement");

    expect((await cardFor(title))?.handoffAvailable).toBe(false);
    /*
     * And the answer is the same at the other end. `handoffAvailable` is a
     * report on the eligibility as it stood when the results were composed, not
     * a promise the card is allowed to keep — a destination withdrawn between
     * the search and the click is refused where it is read, which is the only
     * place that can be current.
     */
    const refused = await pressTheButton(offering.offeringId);
    expect(refused.statusCode).toBe(422);
    expect(await initiations(offering.offeringId)).toBe(0);
  });

  it("answers Search the same way it answers Browse", async () => {
    const title = `Dizüstü ${randomUUID().slice(0, 8)}`;
    await list({
      amount: "31900.00",
      businessName: "Vitrin Elektronik",
      destination: true,
      title
    });

    const found = searchViewSchema.parse(
      (
        await send("POST", "/discovery/search", { body: { query: title } })
      ).json()
    );
    const card = found.results.find((result) => result.title === title);

    // Two queries compose the card, and a control that appeared in one surface
    // and not the other would be one platform behaving as two.
    expect(card?.handoffAvailable).toBe(true);
  });

  describe("what the card renders", () => {
    const card = (handoffAvailable: boolean): ListingCardResponse => ({
      businessName: "Teknoloji Deposu",
      categoryName: "Telefon",
      handoffAvailable,
      offeringId: "11111111-1111-4111-8111-111111111111",
      pricing: {
        amount: "42990.00",
        amountSetAt: "2026-09-01T08:00:00.000Z",
        currency: "TRY",
        deliveryCost: null,
        kind: "FIXED",
        priorAmount: null,
        stockState: "IN_STOCK"
      },
      primaryVisualUrl: null,
      productKey: null,
      publishedAt: "2026-09-01T08:00:00.000Z",
      // I62. Every card carries a product score; unrated is `null` with a
      // count of zero, which is what a fixture with no reviews must say.
      rating: { average: null, count: 0 },
      sellerCount: 1,
      slug: "nova-x7-pro",
      title: "Nova X7 Pro"
    });

    const action = () => Promise.resolve();

    it("offers a pressed control rather than a followed link", () => {
      const html = renderToStaticMarkup(
        createElement(ListingCard, {
          card: card(true),
          handoffAction: action
        })
      );

      /*
       * `US-DEC-F05-001` AC-5 makes a handoff something a person chooses. A
       * link out to a partner can be followed by a prefetch, a crawler or a
       * middle-click, and each of those would record a Completion nobody
       * performed. A form is the difference between a choice and an accident.
       */
      expect(html).toContain("<form");
      expect(html).toContain('type="submit"');
      // The partner is named on the control: a person about to leave is
      // entitled to know whose site they are going to before they press it.
      expect(html).toContain("Teknoloji Deposu");
      expect(html).not.toContain("partner.example.test");
    });

    it("renders nothing at all where no handoff is available", () => {
      const html = renderToStaticMarkup(
        createElement(ListingCard, {
          card: card(false),
          handoffAction: action
        })
      );

      // Absent, not disabled. A greyed control on half the cards would teach a
      // person to expect the platform to fail.
      expect(html).not.toContain("<form");
      expect(html).toContain("Nova X7 Pro");
    });

    it("renders nothing where the surface supplies no action", () => {
      /*
       * The card decides *whether* to offer the partner; the page decides what
       * pressing it does. A surface that has no handoff to perform — a
       * Comparison member, a test — gets a card, not a broken button.
       */
      const html = renderToStaticMarkup(
        createElement(ListingCard, { card: card(true) })
      );
      expect(html).not.toContain("<form");
    });
  });
});
