import { randomUUID } from "node:crypto";
import { createElement } from "react";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { ModerationCase } from "@commerce/contracts";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { RequestCorrection } from "../apps/web/src/app/admin/moderation-cases/case-actions";
import { ADMIN_IDLE } from "../apps/web/src/platform/admin-state";
import {
  ACTION_LABELS,
  ACTION_RESULTS,
  CLOSURE_CHANGES_NOTHING,
  CORRECTION_TARGET_LABELS,
  actionPath,
  moderationRefusal
} from "../apps/web/src/platform/moderation";

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
 * UX-0006 §7 and §8.
 *
 * A moderation case is a record of a concern, not a state of the thing it
 * concerns — and almost everything here follows from that. Reading changes
 * nothing, closing changes nothing, and the actions offered belong to the
 * target's current state rather than to the case.
 */
suite("Increment I8 Admin moderation", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

  const address = () => `am-${randomUUID()}@example.test`;
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

  /// A Business with one Published Offering.
  const published = async () => {
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
      body: { categoryId, slug: slug(), title: "Kırmızı araba" },
      cookie: account.cookie
    });
    const offeringId = created.json<{ id: string }>().id;
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/publication`,
      { cookie: account.cookie }
    );
    return { account, businessId, offeringId };
  };

  const openCase = async (body: unknown) =>
    (
      await send("POST", "/admin/moderation-cases", {
        body,
        cookie: admin.cookie
      })
    ).json<ModerationCase>();

  const readCase = async (caseId: string) =>
    (
      await send("GET", `/admin/moderation-cases/${caseId}`, {
        cookie: admin.cookie
      })
    ).json<ModerationCase>();

  const close = (caseId: string) =>
    send("POST", `/admin/moderation-cases/${caseId}/closure`, {
      cookie: admin.cookie
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

  it("changes nothing about the target by opening or reading a case", async () => {
    const { offeringId } = await published();

    const opened = await openCase({ offeringId, targetType: "OFFERING" });
    await readCase(opened.id);
    await readCase(opened.id);
    const lifecycle = await pool.query<{ status: string }>(
      `select status::text as status from offering where id = $1`,
      [offeringId]
    );

    // §7.1. A case is a record of a concern, not a state of the thing it
    // concerns — so surfacing one and looking at it twice leave the Offering
    // exactly where it was.
    expect(opened.status).toBe("OPEN");
    expect(lifecycle.rows[0]?.status).toBe("PUBLISHED");
  });

  it("offers only the actions the target's state permits", async () => {
    const { businessId, offeringId } = await published();
    const offeringCase = await openCase({ offeringId, targetType: "OFFERING" });

    // Published, so it can be hidden and not restored.
    expect(offeringCase.availableActions).toContain("HIDE_OFFERING");
    expect(offeringCase.availableActions).not.toContain("RESTORE_OFFERING");
    // And nothing about a User account is offered on an Offering case.
    expect(offeringCase.availableActions).not.toContain("SUSPEND_USER");

    await send("POST", `/admin/offerings/${offeringId}/concealment`, {
      cookie: admin.cookie
    });
    const afterHiding = await readCase(offeringCase.id);

    // The list follows the target, not the case: the same case now offers the
    // other transition, because that is the one PRD-0001 permits from here.
    expect(afterHiding.availableActions).toContain("RESTORE_OFFERING");
    expect(afterHiding.availableActions).not.toContain("HIDE_OFFERING");
    expect(afterHiding.businessId).toBe(businessId);
  });

  it("addresses each action at the route that owns its consequence", () => {
    const target = {
      businessId: randomUUID(),
      offeringId: randomUUID(),
      userId: randomUUID()
    };

    // §7.4. Seven actions, seven routes owned by the Stories that define what
    // they mean. This file addresses them and defines none — and an action
    // whose target the case does not name has no address at all.
    expect(actionPath("HIDE_OFFERING", target)).toContain("/concealment");
    expect(actionPath("RESTRICT_BUSINESS", target)).toContain("/restriction");
    expect(actionPath("SUSPEND_USER", target)).toContain("/suspension");
    expect(actionPath("SUSPEND_USER", { ...target, userId: null })).toBeNull();
    // Every action has a label and a stated result, so one added upstream
    // cannot appear as an unexplained button.
    for (const action of Object.keys(
      ACTION_LABELS
    ) as (keyof typeof ACTION_LABELS)[]) {
      expect(ACTION_LABELS[action]).toBeTruthy();
      expect(ACTION_RESULTS[action]).toBeTruthy();
    }
  });

  it("refuses to close a case nobody has decided anything about", async () => {
    const { offeringId } = await published();
    const opened = await openCase({ offeringId, targetType: "OFFERING" });

    const refused = await close(opened.id);
    const after = await readCase(opened.id);

    // §7.5 and AC-7. Closure is conditional on evidence, and the requirement
    // is a trigger — so a refused closure leaves the case exactly Open rather
    // than partly closed.
    expect(refused.statusCode).toBeGreaterThanOrEqual(400);
    expect(refused.json<{ code: string }>().code).toBe("CASE_NOT_RESOLVED");
    expect(after.status).toBe("OPEN");
    expect(moderationRefusal("CASE_NOT_RESOLVED")).toMatch(/stays open/iu);
  });

  it("closes on a no-action decision and changes no target state", async () => {
    const { offeringId } = await published();
    const opened = await openCase({ offeringId, targetType: "OFFERING" });

    await send(
      "POST",
      `/admin/moderation-cases/${opened.id}/no-action-decision`,
      { body: { reason: "Nothing wrong with it." }, cookie: admin.cookie }
    );
    const closed = await close(opened.id);
    const lifecycle = await pool.query<{ status: string }>(
      `select status::text as status from offering where id = $1`,
      [offeringId]
    );

    // §7.5. Deciding that nothing needs doing is a decision, and closing on it
    // creates no target state — the Offering is where it always was.
    expect(closed.statusCode).toBe(200);
    expect(closed.json<ModerationCase>().status).toBe("CLOSED");
    expect(lifecycle.rows[0]?.status).toBe("PUBLISHED");
    expect(CLOSURE_CHANGES_NOTHING).toMatch(/changes nothing/iu);
  });

  it("keeps a case open until somebody looks at the owner's answer", async () => {
    const { account, businessId, offeringId } = await published();
    await send("POST", `/admin/businesses/${businessId}/restriction`, {
      cookie: admin.cookie
    });
    await send("POST", `/admin/businesses/${businessId}/correction-requests`, {
      body: { contentArea: "TITLE", offeringId, target: "OFFERING_CONTENT" },
      cookie: admin.cookie
    });
    const notices = (
      await send("GET", `/businesses/${businessId}/correction-notices`, {
        cookie: account.cookie
      })
    ).json<{ notices: { caseId: string; id: string }[] }>().notices;
    const notice = notices[0];

    await send(
      "PUT",
      `/businesses/${businessId}/correction-notices/${notice?.id ?? ""}/response`,
      { body: { area: "TITLE", title: "Doğru başlık" }, cookie: account.cookie }
    );
    const answered = await readCase(notice?.caseId ?? "");
    // Closure asks for evidence before it asks about re-review, so the case
    // is given a decision first. Requesting a correction is not itself
    // evidence — it is asking somebody else to do something, which is exactly
    // why the case stays open until Platform looks again.
    await send(
      "POST",
      `/admin/moderation-cases/${answered.id}/no-action-decision`,
      {
        body: { reason: "Correction requested; nothing further from us." },
        cookie: admin.cookie
      }
    );
    const refused = await close(answered.id);

    // §8. The bounded owner response keeps the case Open and requires an Admin
    // to look again. It is not an eighth General Moderation action — it does
    // not appear in `availableActions` at all.
    expect(answered.reReviewRequired).toBe(true);
    expect(refused.json<{ code: string }>().code).toBe("CASE_NOT_RE_REVIEWED");
    expect((await readCase(answered.id)).status).toBe("OPEN");
    expect(answered.availableActions).not.toContain("BOUNDED_CORRECTION");

    await send("POST", `/admin/moderation-cases/${answered.id}/re-review`, {
      body: { note: null },
      cookie: admin.cookie
    });
    const reviewed = await readCase(answered.id);
    expect(reviewed.reReviewRequired).toBe(false);
  });

  it("offers no correction aimed at a User account", () => {
    const markup = renderToStaticMarkup(
      createElement(RequestCorrection, {
        action: () => Promise.resolve(ADMIN_IDLE),
        offeringCase: true
      })
    );

    // §7.2. Four approved targets, and User Account correction is absent from
    // the contract rather than filtered out here — so it is not a request this
    // form could make even if somebody edited the markup.
    for (const label of Object.values(CORRECTION_TARGET_LABELS))
      expect(markup).toContain(label);
    expect(markup).not.toMatch(/user account|hesap/iu);
    // And the Offering is not asked for: it comes from the case, so a
    // correction cannot be aimed at something the case is not about.
    expect(markup).not.toContain('name="offeringId"');
  });
});
