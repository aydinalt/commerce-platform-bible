import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import { silentLogger } from "../packages/testing/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { InventoryGroup } from "../apps/web/src/app/businesses/[businessId]/inventory-group";
import {
  ACTION_REFUSALS,
  refusalMessage
} from "../apps/web/src/business/action-outcome";
import { ENTRY_LABELS } from "../apps/web/src/business/inventory";

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
 * UX-0005 §9 Offering Actions.
 *
 * The screen turns each offered entry into the thing it names and decides
 * nothing about which entries exist. So the tests come in two halves: what the
 * markup does with the entries it is handed, and what the platform actually
 * does when those submissions arrive — because a button that looked right
 * while the action did the wrong thing would pass either half alone.
 */
suite("Increment I8 Offering actions", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;
  let strictCategoryId: string;

  const address = () => `oac-${randomUUID()}@example.test`;
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

  const owner = async () => {
    const account = await signUp();
    const created = await send("POST", "/businesses", {
      body: { name: "Kartal Motors", slug: slug() },
      cookie: account.cookie
    });
    const businessId = created.json<{ id: string }>().id;
    // UX-0008 §8.2 enters the Business context before UX-0005 opens, and the
    // Offering routes require it — a management action belongs to a context a
    // person chose rather than to whichever Business they last looked at.
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });
    return { ...account, businessId };
  };

  const create = (
    business: { businessId: string; cookie: string },
    category = categoryId
  ) =>
    send("POST", `/businesses/${business.businessId}/offerings`, {
      body: { categoryId: category, slug: slug(), title: "Kırmızı araba" },
      cookie: business.cookie
    });

  const describeContent = (
    business: { businessId: string; cookie: string },
    offeringId: string,
    category = categoryId
  ) =>
    send(
      "PUT",
      `/businesses/${business.businessId}/offerings/${offeringId}/content`,
      {
        body: { attributes: [], categoryId: category, title: "Kırmızı araba" },
        cookie: business.cookie
      }
    );

  const act = (
    business: { businessId: string; cookie: string },
    offeringId: string,
    action: "publication" | "retirement"
  ) =>
    send(
      "POST",
      `/businesses/${business.businessId}/offerings/${offeringId}/${action}`,
      { cookie: business.cookie }
    );

  const lifecycleOf = async (offeringId: string) =>
    (
      await pool.query<{ status: string }>(
        `select status::text as status from offering where id = $1`,
        [offeringId]
      )
    ).rows[0]?.status;

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
        name: "Otomobil",
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });
    categoryId = category.json<{ id: string }>().id;

    const strict = await send("POST", "/admin/categories", {
      body: {
        domain: "MOBILITY",
        name: "Ticari",
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });
    strictCategoryId = strict.json<{ id: string }>().id;
    const required = await send("POST", "/admin/attributes", {
      body: {
        categoryIds: [strictCategoryId],
        comparable: false,
        filterable: false,
        name: "Ruhsat numarası",
        stableKey: key(),
        valueKind: "TEXT"
      },
      cookie: admin.cookie
    });
    await send(
      "PUT",
      `/admin/attributes/${required.json<{ id: string }>().id}/required-for-publication`,
      { body: { requiredForPublication: true }, cookie: admin.cookie }
    );
  });

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    dispatcher.delivered.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("begins a created Offering as a Draft", async () => {
    const business = await owner();

    const created = await create(business);

    // §9, "Create". The screen names no starting state; PRD-0001 decides what
    // creation produces, and a Dashboard that said "Draft" would be a second
    // place that could one day disagree.
    expect(created.statusCode).toBe(201);
    expect(await lifecycleOf(created.json<{ id: string }>().id)).toBe("DRAFT");
  });

  it("refuses creation and publication to a Restricted Business", async () => {
    const business = await owner();
    const draft = await create(business);
    const offeringId = draft.json<{ id: string }>().id;
    await describeContent(business, offeringId);
    await send("POST", `/admin/businesses/${business.businessId}/restriction`, {
      cookie: admin.cookie
    });

    const created = await create(business);
    const published = await act(business, offeringId, "publication");

    // §10. The two things restriction withdraws, checked against the routes
    // rather than against the screen's own idea of what it hid.
    expect(created.statusCode).toBe(403);
    expect(published.statusCode).toBe(403);
    expect(await lifecycleOf(offeringId)).toBe("DRAFT");
  });

  it("claims no transition when publication is refused", async () => {
    const business = await owner();
    const draft = await create(business, strictCategoryId);
    const offeringId = draft.json<{ id: string }>().id;
    await describeContent(business, offeringId, strictCategoryId);

    const refused = await act(business, offeringId, "publication");
    const versions = await pool.query<{ count: string }>(
      `select count(*)::text as count from offering_publication
       where offering_id = $1`,
      [offeringId]
    );

    // §15. The Offering is still a Draft and no new eligibility evaluation was
    // recorded — the refusal is a refusal all the way down.
    expect(refused.statusCode).toBe(422);
    expect(await lifecycleOf(offeringId)).toBe("DRAFT");
    expect(versions.rows[0]?.count).toBe("1");
  });

  it("says the Offering is not ready without redefining the minimum", () => {
    const message = refusalMessage("PUBLICATION_MINIMUM_NOT_SATISFIED");

    // §9. The experience presents validation feedback *without redefining the
    // minimum*, so this points at the Offering rather than listing conditions.
    // Listing them here would be a second definition of PRD-0001 §6.1.1 that
    // could drift from the one the API enforces.
    expect(message).toMatch(/not ready to publish/u);
    expect(message).not.toMatch(/title|category|attribute|display name/iu);
  });

  it("retires from Draft, Published and Hidden to Archived", async () => {
    const business = await owner();
    const draft = await create(business);
    const draftId = draft.json<{ id: string }>().id;
    await describeContent(business, draftId);

    const live = await create(business);
    const liveId = live.json<{ id: string }>().id;
    await describeContent(business, liveId);
    await act(business, liveId, "publication");

    const retiredDraft = await act(business, draftId, "retirement");
    const retiredLive = await act(business, liveId, "retirement");

    // §9, "Retire". Available from every non-terminal state, and what it
    // produces is PRD-0001's Archived rather than a Dashboard-owned result.
    expect(retiredDraft.statusCode).toBe(200);
    expect(retiredLive.statusCode).toBe(200);
    expect(await lifecycleOf(draftId)).toBe("ARCHIVED");
    expect(await lifecycleOf(liveId)).toBe("ARCHIVED");
  });

  it("claims nothing when retiring something already retired", async () => {
    const business = await owner();
    const draft = await create(business);
    const offeringId = draft.json<{ id: string }>().id;
    await describeContent(business, offeringId);
    await act(business, offeringId, "retirement");

    const again = await act(business, offeringId, "retirement");

    // §15, and the message the screen shows for it names no transition.
    expect(again.statusCode).toBe(409);
    expect(again.json<{ code: string }>().code).toBe(
      "OFFERING_ALREADY_ARCHIVED"
    );
    expect(ACTION_REFUSALS.OFFERING_ALREADY_ARCHIVED).toMatch(
      /already been retired/u
    );
  });

  it("turns each offered entry into the thing it names", () => {
    const markup = renderToStaticMarkup(
      InventoryGroup({
        businessId: "0f3a2b1c-4d5e-4a7b-8c9d-0e1f2a3b4c5d",
        group: "DRAFT",
        offerings: [
          {
            categoryId: "0f3a2b1c-4d5e-4a7b-8c9d-0e1f2a3b4c5d",
            createdAt: "2026-08-12T09:00:00.000Z",
            entries: ["VIEW", "EDIT", "PUBLISH", "RETIRE"],
            id: "1a2b3c4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d",
            publicEligibility: "PENDING",
            slug: "kirmizi-araba",
            status: "DRAFT",
            title: "Kırmızı araba",
            updatedAt: "2026-08-12T09:00:00.000Z"
          }
        ]
      }) as React.ReactElement
    );

    // Publish and Retire become submissions, because they are things a person
    // does; View and Edit become links, because they are places to go. A link
    // that performed a transition could be followed by a prefetch.
    expect(markup).toMatch(/<form[^>]*>[\s\S]*Publish/u);
    expect(markup).toMatch(/<form[^>]*>[\s\S]*Retire/u);
    expect(markup).toMatch(/<a[^>]*href="[^"]*offerings\/1a2b3c4d[^"]*"/u);
  });

  it("gives an Archived Offering no action at all", () => {
    const markup = renderToStaticMarkup(
      InventoryGroup({
        businessId: "0f3a2b1c-4d5e-4a7b-8c9d-0e1f2a3b4c5d",
        group: "ARCHIVED",
        offerings: [
          {
            categoryId: "0f3a2b1c-4d5e-4a7b-8c9d-0e1f2a3b4c5d",
            createdAt: "2026-08-12T09:00:00.000Z",
            entries: ["VIEW"],
            id: "1a2b3c4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d",
            publicEligibility: "INELIGIBLE",
            slug: "kirmizi-araba",
            status: "ARCHIVED",
            title: "Kırmızı araba",
            updatedAt: "2026-08-12T09:00:00.000Z"
          }
        ]
      }) as React.ReactElement
    );

    // §8, "Archived". Historical view only — and this component contains no
    // rule saying so. It was handed one entry and rendered one link.
    expect(markup).toContain(ENTRY_LABELS.VIEW);
    expect(markup).not.toContain("<form");
    expect(markup).not.toMatch(/restore|delete/iu);
  });
});
