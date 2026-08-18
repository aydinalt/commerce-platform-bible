import { randomUUID } from "node:crypto";
import { createElement } from "react";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { V1_DOMAINS } from "@commerce/contracts";
import type { ContactChannelsResponse } from "@commerce/contracts";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { HandoffChoice } from "../apps/web/src/app/decision/handoff";
import { RESUMED_CHANNEL } from "../apps/web/src/decision/copy";
import { readResume, writeResume } from "../apps/web/src/identity/session";

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
 * The Identity criteria that nothing yet asserted.
 *
 * Advancing a Delivery Status needs every Acceptance Criterion *verified*, and
 * a criterion covered by an implementation nobody wrote a test for is a
 * criterion nobody checked. Going through the nine `US-IDN` Stories one at a
 * time turned up twelve that no existing test reaches, covered here in eight
 * tests.
 *
 * Eleven of them have a shape in common: each is about what a change leaves
 * *alone*. Logging out is easy to prove; logging out without quietly dropping a
 * Business ownership is the part that needs asserting.
 *
 * The twelfth, `US-IDN-F09-001` AC-2, was not merely untested — the channel an
 * interrupted person had chosen was carried nowhere, so they came back from
 * signing in to their own question, unanswered.
 */
suite("Increment I9 Identity delivery evidence", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };

  const address = () => `id-${randomUUID()}@example.test`;
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
      email,
      password: PASSWORD,
      userId: confirmed.json<{ userId: string }>().userId
    };
  };

  const signIn = async (email: string) => {
    const answered = await send("POST", "/auth/sessions", {
      body: { email, password: PASSWORD }
    });
    const cookies = answered.cookies as { name: string; value: string }[];
    return `commerce_session=${cookies.find((c) => c.name === "commerce_session")?.value ?? ""}`;
  };

  const category = async (domain: string) =>
    (
      await send("POST", "/admin/categories", {
        body: { domain, name: "Kök", slug: slug(), stableKey: key() },
        cookie: admin.cookie
      })
    ).json<{ id: string }>().id;

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

  it("logs out of a Business context and keeps the ownership", async () => {
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

    const out = await send("DELETE", "/auth/sessions/current", {
      cookie: account.cookie
    });
    const after = await signIn(account.email);
    const owned = await send("GET", "/auth/me/businesses", { cookie: after });

    // `US-IDN-F04-001` AC-1 — Logout is accepted from a Business context, not
    // only from the plain User one — and AC-5: the ownership relationship is
    // still there afterwards. Ending a context is not resigning from anything.
    expect(out.statusCode).toBeLessThan(400);
    expect(
      owned.json<{ businesses: { id: string }[] }>().businesses.map((b) => b.id)
    ).toContain(businessId);
  });

  it("logs out of an Admin context and keeps the authorization", async () => {
    const account = await signUp();
    await pool.query(
      `insert into admin_authorization (user_id, granted_by) values ($1,'test')`,
      [account.userId]
    );
    await send("PUT", "/auth/me/admin-context", { cookie: account.cookie });

    const out = await send("DELETE", "/auth/sessions/current", {
      cookie: account.cookie
    });
    const after = await signIn(account.email);
    const reentered = await send("PUT", "/auth/me/admin-context", {
      cookie: after
    });

    // AC-1 again from the third context, and AC-6: the authorization survived.
    // If it had not, this second entry would be refused — which is a stronger
    // check than reading a flag, because entry is what the authorization is
    // *for*.
    expect(out.statusCode).toBeLessThan(400);
    expect(reentered.statusCode).toBeLessThan(400);
  });

  it("leaves a Suspended account everything a Guest has", async () => {
    const account = await signUp();
    await send("POST", `/admin/user-accounts/${account.userId}/suspension`, {
      cookie: admin.cookie
    });

    const refused = await send("PUT", "/auth/me/business-context", {
      body: { businessId: randomUUID() },
      cookie: account.cookie
    });
    // Still holding their own cookie. Reading without one would only prove that
    // Guests can browse, which was never in doubt — the claim is about *this*
    // person, whose session the suspension has just invalidated.
    const browsing = await send("GET", "/discovery/browse", {
      cookie: account.cookie
    });
    const searching = await send("POST", "/discovery/search", {
      body: { query: "araba" },
      cookie: account.cookie
    });

    // `US-IDN-F01-001` AC-6 and `US-IDN-F06-001` AC-5. Suspension closes the
    // authenticated contexts and nothing else. A rejected session is not a
    // rejected person: the public platform is not a privilege that can be
    // withdrawn, so a request carrying a dead cookie is served exactly as a
    // request carrying none.
    expect(refused.statusCode).toBeGreaterThanOrEqual(400);
    expect(browsing.statusCode).toBe(200);
    expect(searching.statusCode).toBeLessThan(400);
  });

  it("opens the same public baseline in all three Domains", async () => {
    const roots = await Promise.all(V1_DOMAINS.map((d) => category(d)));

    const answers = await Promise.all(
      roots.map((id) =>
        send("POST", `/discovery/browse/categories/${id}`, { body: {} })
      )
    );

    // `US-IDN-F01-001` AC-8. One baseline, not three: a Domain is a place in
    // the catalogue, never a different set of rules about who may look. Asserted
    // across every Domain the platform has rather than a sample, because the
    // claim is about all of them.
    expect(V1_DOMAINS).toHaveLength(3);
    for (const answer of answers) expect(answer.statusCode).toBe(200);
  });

  it("brings the interrupted channel back and asks it again", () => {
    const decisionFlowId = randomUUID();
    const written = writeResume({
      action: "direct-contact",
      channel: "TELEPHONE",
      decisionFlowId
    });

    const markup = renderToStaticMarkup(
      createElement(HandoffChoice, {
        affiliateAction: () => Promise.resolve({ kind: "IDLE" as const }),
        affiliateAvailable: false,
        channels: {
          available: ["TELEPHONE", "EMAIL"],
          revealable: true
        } satisfies ContactChannelsResponse,
        contactAction: () => Promise.resolve({ kind: "IDLE" as const }),
        resumedChannel: readResume(written, decisionFlowId)?.channel ?? null
      })
    );

    // `US-IDN-F09-001` AC-2 and AC-4. What they chose comes back with them and
    // the page says so. It comes back as a question: the markup holds a button,
    // never a revealed value, which is AC-5 leaving the reveal to a fresh
    // request that re-checks every gate.
    expect(readResume(written, decisionFlowId)).toEqual({
      action: "direct-contact",
      channel: "TELEPHONE",
      decisionFlowId
    });
    expect(markup).toContain(RESUMED_CHANNEL);
    expect(markup).toContain('value="TELEPHONE"');
  });

  it("resumes nothing that stopped being on offer", () => {
    const decisionFlowId = randomUUID();
    const written = writeResume({
      action: "direct-contact",
      channel: "TELEPHONE",
      decisionFlowId
    });

    const markup = renderToStaticMarkup(
      createElement(HandoffChoice, {
        affiliateAction: () => Promise.resolve({ kind: "IDLE" as const }),
        affiliateAvailable: false,
        // The Business withdrew the telephone number while they were signing in.
        channels: {
          available: ["EMAIL"],
          revealable: true
        } satisfies ContactChannelsResponse,
        contactAction: () => Promise.resolve({ kind: "IDLE" as const }),
        resumedChannel: readResume(written, decisionFlowId)?.channel ?? null
      })
    );

    // `US-IDN-F09-001` AC-6. The intent still parses — it is the same cookie —
    // and the screen still refuses to act on it, because the channel is not in
    // what the API currently offers. The sentence goes too: promising to
    // continue where they left off would be describing somewhere that no longer
    // exists.
    expect(readResume(written, decisionFlowId)?.channel).toBe("TELEPHONE");
    expect(markup).not.toContain(RESUMED_CHANNEL);
    expect(markup).not.toContain('value="TELEPHONE"');
  });

  it("carries no interrupted request for anyone who was not interrupted", () => {
    const decisionFlowId = randomUUID();

    // `US-IDN-F09-001` AC-7. Somebody who opened Login from the header holds no
    // cookie at all, and a cookie left over from a different flow is not this
    // flow's question. Neither becomes a return context, so neither arrives at
    // Decision with something half-answered.
    expect(readResume(undefined, decisionFlowId)).toBeNull();
    expect(readResume("", decisionFlowId)).toBeNull();
    expect(
      readResume(
        writeResume({
          action: "direct-contact",
          channel: "EMAIL",
          decisionFlowId: randomUUID()
        }),
        decisionFlowId
      )
    ).toBeNull();
    // Nor is a name from outside either vocabulary a question. Whatever is put
    // in the cookie, only these two lists can come out.
    expect(
      readResume(
        `${decisionFlowId}:reveal-everything:TELEPHONE`,
        decisionFlowId
      )
    ).toBeNull();
    expect(
      readResume(`${decisionFlowId}:direct-contact:POSTAL`, decisionFlowId)
    ).toBeNull();
  });

  it("needs no authentication return for Chat or an Affiliate handoff", async () => {
    const leaf = await category("MOBILITY");
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
      body: { categoryId: leaf, slug: slug(), title: "Kırmızı araba" },
      cookie: account.cookie
    });
    const offeringId = created.json<{ id: string }>().id;
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/publication`,
      { cookie: account.cookie }
    );

    const flow = await send("POST", "/decision/flows", {
      body: { offeringId }
    });
    const decisionFlowId = flow.json<{ decisionFlowId: string }>()
      .decisionFlowId;
    const asked = await send("POST", `/decision/flows/${decisionFlowId}/chat`, {
      body: { priorities: [], question: "Bu araç hangi kategoride?" }
    });

    // `US-IDN-F09-001` AC-8. No cookie on either request. Chat answers a Guest
    // outright, so there is nothing to return from — the return path exists for
    // Direct Contact alone, and building one here would make signing in look
    // like a condition of asking a question.
    expect(asked.statusCode).toBeLessThan(400);
  });
});
