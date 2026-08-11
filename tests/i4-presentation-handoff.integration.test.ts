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
  errorEnvelopeSchema,
  publicOfferingSchema
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
 * `US-DSC-F09-001` Offering Presentation Handoff.
 *
 * The Story is about a boundary: Discovery hands over exactly what the person
 * selected and stops being responsible. Almost everything worth testing is
 * therefore about the moment of opening — whether the Offering is still
 * eligible *then*, not when its Listing Card was drawn — and about the things
 * opening must not do.
 */
suite("Increment I4 Offering Presentation handoff", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

  const address = () => `hnd-${randomUUID()}@example.test`;
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

  /// One published Offering, reached through the real path rather than planted.
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
    const offeringSlug = slug();
    const offering = await send("POST", `/businesses/${businessId}/offerings`, {
      body: { categoryId, slug: offeringSlug, title: "Kırmızı spor araba" },
      cookie: account.cookie
    });
    const offeringId = offering.json<{ id: string }>().id;
    await send(
      "PUT",
      `/businesses/${businessId}/offerings/${offeringId}/content`,
      {
        body: { attributes: [], categoryId, title: "Kırmızı spor araba" },
        cookie: account.cookie
      }
    );
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/publication`,
      { cookie: account.cookie }
    );
    return { businessId, cookie: account.cookie, offeringId, offeringSlug };
  };

  const open = (offeringSlug: string) =>
    send("GET", `/offerings/${offeringSlug}`);

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

    const category = await send("POST", "/admin/categories", {
      body: {
        domain: "MOBILITY",
        name: `Handoff ${randomUUID().slice(0, 8)}`,
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

  it("opens one eligible Offering", async () => {
    const { offeringSlug } = await publish();

    const opened = await open(offeringSlug);

    // AC-1 and AC-2. The exact identity the Listing Card carried, unchanged.
    expect(opened.statusCode).toBe(200);
    const offering = publicOfferingSchema.parse(opened.json());
    expect(offering.slug).toBe(offeringSlug);
    expect(offering.title).toBe("Kırmızı spor araba");
    expect(offering.businessName).toBe("Kartal Motors");
  });

  it("needs no session, and answers a session no differently", async () => {
    const { cookie, offeringSlug } = await publish();

    const anonymous = await open(offeringSlug);
    const signedIn = await send("GET", `/offerings/${offeringSlug}`, {
      cookie
    });

    // The handoff is public. A person who happens to be signed in — even the
    // owner — is opening the same public Offering.
    expect(signedIn.statusCode).toBe(200);
    expect(signedIn.json()).toEqual(anonymous.json());
  });

  it("refuses to open an Offering that stopped being eligible", async () => {
    const { businessId, cookie, offeringId, offeringSlug } = await publish();
    expect((await open(offeringSlug)).statusCode).toBe(200);

    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/retirement`,
      { cookie }
    );
    const opened = await open(offeringSlug);

    // AC-4. Eligibility is decided at the moment of opening, not at the moment
    // the card was drawn — which is exactly the case a cached page would get
    // wrong.
    expect(opened.statusCode).toBe(404);
    expect(errorEnvelopeSchema.parse(opened.json()).code).toBe(
      "OFFERING_NOT_FOUND"
    );
  });

  it("says the same thing about an Offering that never existed", async () => {
    const missing = await open(slug());
    const { businessId, cookie, offeringId, offeringSlug } = await publish();
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/retirement`,
      { cookie }
    );

    // AC-7 read strictly: the failure carries no explanation a person could
    // use to tell a retired Offering from one that was never there. The
    // correlation identifier is per-request and is what makes a failure
    // traceable, so it is the one thing allowed to differ.
    const said = (envelope: unknown) => {
      const { code, message } = errorEnvelopeSchema.parse(envelope);
      return { code, message };
    };
    expect(missing.statusCode).toBe(404);
    expect(said(missing.json())).toEqual(
      said((await open(offeringSlug)).json())
    );
  });

  it("does not open a Draft that was never published", async () => {
    const account = await signUp();
    const business = await send("POST", "/businesses", {
      body: { name: "Taslak Motors", slug: slug() },
      cookie: account.cookie
    });
    const businessId = business.json<{ id: string }>().id;
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });
    const draftSlug = slug();
    await send("POST", `/businesses/${businessId}/offerings`, {
      body: { categoryId, slug: draftSlug, title: "Henüz yayında değil" },
      cookie: account.cookie
    });

    // AC-4. A Draft has no projection row, so there is nothing to open — and
    // the owner's own Offering is no more openable than anyone else's.
    expect((await open(draftSlug)).statusCode).toBe(404);
  });

  it("records no occurrence and starts nothing else", async () => {
    const before = await pool.query<{ count: string }>(
      `select count(*)::text as count from discovery_start`
    );

    const { offeringSlug } = await publish();
    await open(offeringSlug);
    await open(offeringSlug);

    // AC-5 and AC-6. Opening is not Completion, begins no Compare, Decision
    // Chat, Affiliate Handoff or Direct Contact, and — since PRD-0001 §8.2.1
    // gives `Offering Presentation Open` to complete Presentation — records
    // nothing at all yet. Discovery Starts are the only occurrence the system
    // can currently write, and opening writes none.
    const after = await pool.query<{ count: string }>(
      `select count(*)::text as count from discovery_start`
    );
    expect(after.rows[0]?.count).toBe(before.rows[0]?.count);
  });

  it("exposes nothing beyond the identity that was selected", async () => {
    const { offeringSlug } = await publish();

    const opened = await open(offeringSlug);

    // The response is the published contract exactly. It has no field that
    // could carry a telephone number, an email address, an external contact
    // URL or an Affiliate Destination, so the handoff cannot widen what
    // Discovery was allowed to show.
    expect(Object.keys(opened.json<Record<string, unknown>>()).sort()).toEqual([
      "businessName",
      "categoryName",
      "offeringId",
      "publishedAt",
      "slug",
      "title"
    ]);
  });
});
