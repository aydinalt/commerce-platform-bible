import { randomUUID } from "node:crypto";
import { createElement } from "react";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type {
  CorrectionNotice,
  EditableOfferingContent
} from "@commerce/contracts";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { CorrectionNotices } from "../apps/web/src/app/businesses/[businessId]/correction-notices";
import { ACTION_IDLE } from "../apps/web/src/business/action-outcome";
import { CorrectionForm } from "../apps/web/src/app/businesses/[businessId]/corrections/[correctionId]/correction-form";
import {
  CORRECTION_REFUSALS,
  NO_NOTICES,
  TARGET_COPY,
  noticeEntry
} from "../apps/web/src/business/corrections";

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
 * UX-0005 §11 and §12.
 *
 * A correction notice is the one thing on this Dashboard that the platform
 * asked of the Business rather than the other way round, and almost every
 * requirement about it is a requirement that something *not* happen: no state
 * changes by reading, no conversation appears, no untargeted edit becomes
 * possible, no case closes. So most of these tests check absences — and check
 * them against the platform, because an absence that only holds in the markup
 * is not an absence at all.
 */
suite("Increment I8 correction notices", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

  const address = () => `cn-${randomUUID()}@example.test`;
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

  type Owner = { businessId: string; cookie: string; userId: string };

  const owner = async (): Promise<Owner> => {
    const account = await signUp();
    const created = await send("POST", "/businesses", {
      body: { name: "Kartal Motors", slug: slug() },
      cookie: account.cookie
    });
    const businessId = created.json<{ id: string }>().id;
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });
    return { ...account, businessId };
  };

  /// A Published Offering, which is what the bounded path requires.
  const published = async (business: Owner) => {
    const created = await send(
      "POST",
      `/businesses/${business.businessId}/offerings`,
      {
        body: { categoryId, slug: slug(), title: "Kırmızı araba" },
        cookie: business.cookie
      }
    );
    const offeringId = created.json<{ id: string }>().id;
    await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${offeringId}/publication`,
      { cookie: business.cookie }
    );
    return offeringId;
  };

  const requestCorrection = (business: Owner, body: unknown) =>
    send(
      "POST",
      `/admin/businesses/${business.businessId}/correction-requests`,
      {
        body,
        cookie: admin.cookie
      }
    );

  const restrict = (business: Owner) =>
    send("POST", `/admin/businesses/${business.businessId}/restriction`, {
      cookie: admin.cookie
    });

  const notices = async (business: Owner) =>
    (
      await send(
        "GET",
        `/businesses/${business.businessId}/correction-notices`,
        { cookie: business.cookie }
      )
    ).json<{ notices: CorrectionNotice[] }>().notices;

  const respond = (business: Owner, correctionId: string, body: unknown) =>
    send(
      "PUT",
      `/businesses/${business.businessId}/correction-notices/${correctionId}/response`,
      { body, cookie: business.cookie }
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

  it("says there are no notices without offering anything in their place", () => {
    const markup = renderToStaticMarkup(
      createElement(CorrectionNotices, {
        businessId: randomUUID(),
        notices: []
      })
    );

    // §14. One sentence. No inbox, no conversation, no substitute for one —
    // and nothing that submits, because there is nothing to submit to.
    expect(markup).toContain(NO_NOTICES);
    expect(markup).not.toContain("<form");
    expect(markup).not.toMatch(/reply|message|acknowledge|dismiss/iu);
  });

  it("changes nothing about the Business by being read", async () => {
    const business = await owner();
    const offeringId = await published(business);
    await restrict(business);
    await requestCorrection(business, {
      contentArea: "TITLE",
      note: "The title names a model this vehicle is not.",
      offeringId,
      target: "OFFERING_CONTENT"
    });

    const before = await pool.query<{ status: string }>(
      `select m.status::text as status from business_moderation_state m
       where m.business_id = $1`,
      [business.businessId]
    );
    await notices(business);
    await notices(business);
    const after = await pool.query<{ status: string }>(
      `select m.status::text as status from business_moderation_state m
       where m.business_id = $1`,
      [business.businessId]
    );
    const lifecycle = await pool.query<{ status: string }>(
      `select status::text as status from offering where id = $1`,
      [offeringId]
    );

    // AC-5. Reading is a `GET`, and there is no sibling verb that could have
    // moved anything — so two reads leave exactly what one read found.
    expect(after.rows[0]?.status).toBe(before.rows[0]?.status);
    expect(lifecycle.rows[0]?.status).toBe("PUBLISHED");
  });

  it("opens the bounded path at the correction, never at the Offering", async () => {
    const business = await owner();
    const offeringId = await published(business);
    await restrict(business);
    await requestCorrection(business, {
      contentArea: "TITLE",
      offeringId,
      target: "OFFERING_CONTENT"
    });
    const [notice] = await notices(business);

    const entry = noticeEntry(business.businessId, notice!);

    // §11. The correction is what confers the permission, so it is what the
    // address names. An Offering address here would be a way to reach the
    // ordinary edit path under correction authority.
    expect(notice?.boundedEditAvailable).toBe(true);
    expect(entry?.href).toBe(
      `/businesses/${business.businessId}/corrections/${notice!.id}`
    );
    expect(entry?.href).not.toContain(offeringId);
  });

  it("gives an unauthorized area no way in and still says what was asked", async () => {
    const business = await owner();
    const offeringId = await published(business);
    await requestCorrection(business, {
      offeringId,
      target: "AFFILIATE_DESTINATION_CONFIGURATION"
    });
    const [notice] = await notices(business);

    const markup = renderToStaticMarkup(
      createElement(CorrectionNotices, {
        businessId: business.businessId,
        notices: [notice!]
      })
    );

    // AC-4 is a live question about the owner, not a property of the notice.
    // A notice with nowhere to go is still shown: hiding it would leave
    // someone unaware that something was asked of their Business.
    expect(markup).toContain(TARGET_COPY.AFFILIATE_DESTINATION_CONFIGURATION);
    if (notice?.managementArea === null)
      expect(noticeEntry(business.businessId, notice)).toBeNull();
  });

  it("refuses a content area the notice did not target", async () => {
    const business = await owner();
    const offeringId = await published(business);
    await restrict(business);
    await requestCorrection(business, {
      contentArea: "TITLE",
      offeringId,
      target: "OFFERING_CONTENT"
    });
    const [notice] = await notices(business);

    const untargeted = await respond(business, notice!.id, {
      area: "SUMMARY",
      summary: "Something else entirely"
    });

    // §11's "untargeted edit". The screen never offers the other area, and
    // the platform refuses it anyway — one boundary held in two places, so
    // neither is the only thing holding it.
    expect(untargeted.statusCode).toBe(403);
    expect(untargeted.json<{ code: string }>().code).toBe(
      "CORRECTION_AREA_NOT_TARGETED"
    );
    expect(CORRECTION_REFUSALS.CORRECTION_AREA_NOT_TARGETED).toMatch(
      /only that part/iu
    );
  });

  it("saves the targeted area and leaves the case exactly open", async () => {
    const business = await owner();
    const offeringId = await published(business);
    await restrict(business);
    await requestCorrection(business, {
      contentArea: "TITLE",
      offeringId,
      target: "OFFERING_CONTENT"
    });
    const [notice] = await notices(business);

    const saved = await respond(business, notice!.id, {
      area: "TITLE",
      title: "Doğru başlık"
    });
    const after = await notices(business);
    const state = await pool.query<{
      moderation: string;
      status: string;
    }>(
      `select o.status::text as status, m.status::text as moderation
       from offering o
       join business_moderation_state m on m.business_id = o.business_id
       where o.id = $1`,
      [offeringId]
    );

    // §11. The edit lands; nothing else does. The case is still Open, the
    // Business is still Restricted, the lifecycle has not moved, and re-review
    // is still required — which is exactly what the screen says out loud.
    expect(saved.statusCode).toBe(200);
    expect(saved.json<{ title: string }>().title).toBe("Doğru başlık");
    expect(after[0]?.caseStatus).toBe("OPEN");
    expect(after[0]?.reReviewRequired).toBe(true);
    expect(state.rows[0]?.status).toBe("PUBLISHED");
    expect(state.rows[0]?.moderation).toBe("RESTRICTED");
  });

  it("offers one area and no lifecycle control at all", () => {
    const content: EditableOfferingContent = {
      applicableAttributes: [],
      attributes: [],
      businessId: randomUUID(),
      categoryId,
      id: randomUUID(),
      publishedAt: "2026-08-12T09:00:00.000Z",
      slug: "s",
      status: "PUBLISHED",
      summary: "Eski özet",
      title: "Eski başlık",
      version: 2
    };

    const markup = renderToStaticMarkup(
      createElement(CorrectionForm, {
        action: () => Promise.resolve(ACTION_IDLE),
        area: "TITLE",
        content
      })
    );

    // The area is not a field, so a submission cannot change which area this
    // is. And §11's list of things the path does not grant has no control here
    // to be forgotten about.
    expect(markup).toContain('name="title"');
    expect(markup).not.toContain('name="summary"');
    expect(markup).not.toContain('name="area"');
    expect(markup).not.toMatch(
      /publish|retire|archive|category|restrict|close/iu
    );
  });
});
