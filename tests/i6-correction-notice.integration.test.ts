import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import {
  CORRECTION_TARGETS,
  OFFERING_CONTENT_AREAS
} from "../modules/business/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import {
  correctionNoticesSchema,
  correctionNoticeSchema
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
 * `US-BUS-F07-001` Correction Notice and Owner Response.
 *
 * The Story is an exception to a prohibition, which is the most dangerous kind
 * of feature: a Restricted Business normally cannot touch a Published Offering,
 * and this opens one narrow door. So the tests that matter most are the ones
 * proving the door is exactly as wide as PRD-0005 §8.3.1 says and no wider —
 * one Offering, one content area, an Open case, and nothing else moved by
 * walking through it.
 */
suite("Increment I6 Correction notice and owner response", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;
  let requiredAttributeId: string;
  let strictCategoryId: string;

  const address = () => `cor-${randomUUID()}@example.test`;
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

  /**
   * A Restricted Business with one Published Offering — the situation the
   * bounded path exists for.
   *
   * `publish: false` leaves a Draft, and `restrict: false` leaves the owner
   * their ordinary permissions. Both are needed because two conditions of
   * §8.3.1 can only be tested by removing one of them.
   */
  const scenario = async (
    options: {
      category?: string;
      publish?: boolean;
      restrict?: boolean;
      values?: unknown[];
    } = {}
  ) => {
    const category = options.category ?? categoryId;
    const attributes = options.values ?? [];
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
    const offering = await send("POST", `/businesses/${businessId}/offerings`, {
      body: { categoryId: category, slug: slug(), title: "Kırmızı araba" },
      cookie: account.cookie
    });
    const offeringId = offering.json<{ id: string }>().id;
    await send(
      "PUT",
      `/businesses/${businessId}/offerings/${offeringId}/content`,
      {
        body: {
          attributes,
          categoryId: category,
          summary: "İlk özet",
          title: "Kırmızı araba"
        },
        cookie: account.cookie
      }
    );
    if (options.publish !== false)
      await send(
        "POST",
        `/businesses/${businessId}/offerings/${offeringId}/publication`,
        { cookie: account.cookie }
      );
    if (options.restrict !== false)
      await send("POST", `/admin/businesses/${businessId}/restriction`, {
        cookie: admin.cookie
      });
    return { ...account, businessId, offeringId };
  };

  const requestCorrection = (
    businessId: string,
    body: Record<string, unknown>
  ) =>
    send("POST", `/admin/businesses/${businessId}/correction-requests`, {
      body,
      cookie: admin.cookie
    });

  const offeringCorrection = async (
    business: { businessId: string; offeringId: string },
    area: "TITLE" | "SUMMARY" | "ATTRIBUTES" = "TITLE"
  ) => {
    const response = await requestCorrection(business.businessId, {
      contentArea: area,
      note: "Başlık yanıltıcı",
      offeringId: business.offeringId,
      target: "OFFERING_CONTENT"
    });
    return correctionNoticeSchema.parse(response.json());
  };

  const notices = async (business: { businessId: string; cookie: string }) =>
    correctionNoticesSchema.parse(
      (
        await send(
          "GET",
          `/businesses/${business.businessId}/correction-notices`,
          {
            cookie: business.cookie
          }
        )
      ).json()
    ).notices;

  const respond = (
    business: { businessId: string; cookie: string },
    correctionId: string,
    body: Record<string, unknown>
  ) =>
    send(
      "PUT",
      `/businesses/${business.businessId}/correction-notices/${correctionId}/response`,
      { body, cookie: business.cookie }
    );

  const state = (businessId: string, offeringId: string) =>
    pool.query<{
      caseStatus: string;
      exposure: string;
      lifecycle: string;
      moderation: string;
      projected: string;
      title: string;
    }>(
      `select o.status::text as lifecycle, o.title,
         b.public_exposure::text as exposure,
         coalesce(m.status::text,'UNRESTRICTED') as moderation,
         (select c.status::text from moderation_case c
          where c.business_id = b.id order by c.opened_at limit 1) as "caseStatus",
         (select count(*)::text from offering_search_projection p
          where p.offering_id = o.id) as projected
       from offering o
       join business b on b.id = o.business_id
       left join business_moderation_state m on m.business_id = b.id
       where o.id = $2 and b.id = $1`,
      [businessId, offeringId]
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

    // A second leaf whose Attribute is required for publication. The Attribute
    // is marked required before any Offering exists, because `US-PLT-F09-001`
    // guards that change once values are in use.
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
    requiredAttributeId = required.json<{ id: string }>().id;
    await send(
      "PUT",
      `/admin/attributes/${requiredAttributeId}/required-for-publication`,
      { body: { requiredForPublication: true }, cookie: admin.cookie }
    );
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

  it("accepts exactly the four Business-owned targets", async () => {
    const business = await scenario();

    const accepted = await Promise.all(
      CORRECTION_TARGETS.map((target) =>
        requestCorrection(
          business.businessId,
          target === "OFFERING_CONTENT"
            ? {
                contentArea: "TITLE",
                offeringId: business.offeringId,
                target
              }
            : { target }
        )
      )
    );

    // AC-1. All four, and each opens onto a management area rather than a
    // dead end.
    expect(accepted.map((response) => response.statusCode)).toEqual([
      201, 201, 201, 201
    ]);
  });

  it("has no way to name a User Account as a target", async () => {
    const business = await scenario();

    const refused = await requestCorrection(business.businessId, {
      target: "USER_ACCOUNT"
    });
    const direct = await pool
      .query(
        `insert into correction_request
           (case_id, business_id, target, requested_by)
         select c.id, c.business_id, 'USER_ACCOUNT', $2
         from moderation_case c where c.business_id = $1 limit 1`,
        [business.businessId, admin.userId]
      )
      .catch((error: { code?: string }) => error.code);

    // AC-2. Refused at the edge, and unwritable underneath it: `USER_ACCOUNT`
    // is not a value the enum holds, so there is no layer at which a
    // correction against an account could survive.
    expect(refused.statusCode).toBe(400);
    expect(direct).toBe("22P02");
  });

  it("identifies the exact target and where it opens", async () => {
    const business = await scenario();
    const notice = await offeringCorrection(business, "SUMMARY");

    const shown = await notices(business);

    // AC-3 and AC-4. The notice names the Offering and the area, and points at
    // the management area the owner is currently authorized for.
    const found = shown.find((item) => item.id === notice.id);
    expect(found?.target).toBe("OFFERING_CONTENT");
    expect(found?.offeringId).toBe(business.offeringId);
    expect(found?.contentArea).toBe("SUMMARY");
    expect(found?.managementArea).toBe("OFFERING_CONTENT");
  });

  it("changes nothing by existing or by being read", async () => {
    const business = await scenario();
    const before = await state(business.businessId, business.offeringId);

    await offeringCorrection(business);
    const afterRequest = await state(business.businessId, business.offeringId);
    await notices(business);
    const afterRead = await state(business.businessId, business.offeringId);

    // AC-5. Lifecycle, moderation, exposure, eligibility and the Offering
    // itself are exactly where they were. The case is Open because opening it
    // is what Request Correction does, not a side effect of the notice.
    expect(afterRequest.rows[0]).toEqual({
      ...before.rows[0],
      caseStatus: "OPEN"
    });
    expect(afterRead.rows[0]).toEqual(afterRequest.rows[0]);
  });

  it("creates no message, conversation or reply", async () => {
    const business = await scenario();
    const notice = await offeringCorrection(business);

    const shown = await notices(business);
    const reply = await send(
      "POST",
      `/businesses/${business.businessId}/correction-notices/${notice.id}/replies`,
      { body: { message: "Düzelttim" }, cookie: business.cookie }
    );

    // AC-6. Nothing in the notice can hold a conversation, and no verb exists
    // that could begin one.
    expect(Object.keys(shown[0] ?? {}).sort()).toEqual([
      "boundedEditAvailable",
      "caseId",
      "caseStatus",
      "contentArea",
      "id",
      "managementArea",
      "note",
      "offeringId",
      "reReviewRequired",
      "requestedAt",
      "target"
    ]);
    expect(reply.statusCode).toBe(404);
  });

  it("opens no management area the owner is not currently authorized for", async () => {
    const business = await scenario();
    await requestCorrection(business.businessId, {
      contentArea: "TITLE",
      offeringId: business.offeringId,
      target: "OFFERING_CONTENT"
    });
    await requestCorrection(business.businessId, {
      target: "BUSINESS_INFORMATION"
    });

    const shown = await notices(business);

    // AC-4 and AC-7. Restriction does not withdraw Business Information
    // management, so that notice opens; nothing here grants an authority the
    // owner would not have had without a notice at all.
    const information = shown.find(
      (item) => item.target === "BUSINESS_INFORMATION"
    );
    expect(information?.managementArea).toBe("BUSINESS_INFORMATION");
  });

  it("opens the bounded path only when every condition holds", async () => {
    const restricted = await scenario();
    const draftOnly = await scenario({ publish: false });

    const targeted = await offeringCorrection(restricted);
    const information = correctionNoticeSchema.parse(
      (
        await requestCorrection(restricted.businessId, {
          target: "BUSINESS_INFORMATION"
        })
      ).json()
    );
    const wrongLifecycle = await offeringCorrection(draftOnly);

    // AC-8. Three of the five conditions, each failing on its own: the wrong
    // target, and the wrong lifecycle. The Open case is the fourth, tested
    // below; ownership is the fifth and is why the notice was found at all.
    expect(targeted.boundedEditAvailable).toBe(true);
    expect(information.boundedEditAvailable).toBe(false);
    expect(wrongLifecycle.boundedEditAvailable).toBe(false);
  });

  it("refuses a bounded edit once the case is closed", async () => {
    const business = await scenario();
    const notice = await offeringCorrection(business);
    await pool.query(
      `update moderation_case
         set status = 'CLOSED', closed_at = now(), closed_by = $2
       where id = $1`,
      [notice.caseId, admin.userId]
    );

    const refused = await respond(business, notice.id, {
      area: "TITLE",
      title: "Düzeltilmiş başlık"
    });

    // AC-8's remaining condition. The case is re-read inside the transaction
    // that would perform the change, so a case closed after the notice was
    // opened still refuses the save.
    expect(refused.statusCode).toBe(409);
    expect(refused.json<{ code: string }>().code).toBe(
      "BOUNDED_CORRECTION_UNAVAILABLE"
    );
  });

  it("limits the edit to the exact targeted content area", async () => {
    const business = await scenario();
    const notice = await offeringCorrection(business, "TITLE");

    const untargeted = await respond(business, notice.id, {
      area: "SUMMARY",
      summary: "Başka bir şey"
    });
    const targeted = await respond(business, notice.id, {
      area: "TITLE",
      title: "Düzeltilmiş başlık"
    });

    // AC-9. The notice asked about the title; the summary is not this notice's
    // business, and saying so is a refusal rather than a silent no-op.
    expect(untargeted.statusCode).toBe(403);
    expect(untargeted.json<{ code: string }>().code).toBe(
      "CORRECTION_AREA_NOT_TARGETED"
    );
    expect(targeted.statusCode).toBe(200);
    expect(targeted.json<{ title: string }>().title).toBe("Düzeltilmiş başlık");
  });

  it("limits the edit to the exact Offering", async () => {
    // The second Offering is created before restriction, because a Restricted
    // Business cannot create one — which is itself the point of AC-10.
    const business = await scenario({ restrict: false });
    const other = await send(
      "POST",
      `/businesses/${business.businessId}/offerings`,
      {
        body: { categoryId, slug: slug(), title: "İkinci" },
        cookie: business.cookie
      }
    );
    const otherId = other.json<{ id: string }>().id;
    await send("POST", `/admin/businesses/${business.businessId}/restriction`, {
      cookie: admin.cookie
    });
    const notice = await offeringCorrection(business);

    await respond(business, notice.id, {
      area: "TITLE",
      title: "Düzeltilmiş başlık"
    });
    const untouched = await pool.query<{ title: string }>(
      `select title from offering where id = $1`,
      [otherId]
    );

    // AC-9. The permission is addressed by the correction, so there is no way
    // to spell "use this authority on a different Offering".
    expect(untouched.rows[0]?.title).toBe("İkinci");
  });

  it("grants no creation, publication or unrelated edit", async () => {
    const business = await scenario();
    const notice = await offeringCorrection(business);
    await respond(business, notice.id, {
      area: "TITLE",
      title: "Düzeltilmiş başlık"
    });

    const created = await send(
      "POST",
      `/businesses/${business.businessId}/offerings`,
      {
        body: { categoryId, slug: slug(), title: "Yeni" },
        cookie: business.cookie
      }
    );
    const ordinaryEdit = await send(
      "PUT",
      `/businesses/${business.businessId}/offerings/${business.offeringId}/content`,
      {
        body: { attributes: [], categoryId, title: "Serbest düzenleme" },
        cookie: business.cookie
      }
    );

    // AC-10. Having answered a correction, the owner is exactly as Restricted
    // as before: no creation, and no ordinary Published edit.
    expect(created.statusCode).toBe(403);
    expect(ordinaryEdit.statusCode).toBe(403);
  });

  it("requires the saved correction to preserve the publication minimum", async () => {
    const business = await scenario({
      category: strictCategoryId,
      values: [
        { attributeId: requiredAttributeId, kind: "TEXT", text: "34 ABC 123" }
      ]
    });
    const notice = await offeringCorrection(business, "ATTRIBUTES");

    const emptied = await respond(business, notice.id, {
      area: "ATTRIBUTES",
      attributes: []
    });

    const values = await pool.query(
      `select 1 from offering_attribute_value where offering_id = $1`,
      [business.offeringId]
    );

    // AC-11. A correction that left a publicly promised Offering incomplete is
    // refused — and refused as a whole: the values it would have removed are
    // still there, because the transaction that would have removed them rolled
    // back.
    expect(emptied.statusCode).toBe(422);
    expect(emptied.json<{ code: string }>().code).toBe(
      "PUBLICATION_MINIMUM_NOT_SATISFIED"
    );
    expect(values.rowCount).toBe(1);
  });

  it("keeps everything where it was after the owner responds", async () => {
    const business = await scenario();
    const before = await state(business.businessId, business.offeringId);
    const notice = await offeringCorrection(business);

    await respond(business, notice.id, {
      area: "TITLE",
      title: "Düzeltilmiş başlık"
    });
    const after = await state(business.businessId, business.offeringId);
    const responded = await notices(business);

    // AC-12, AC-13 and AC-14 in one look, because they are one situation: the
    // title changed and nothing else did. The case is still Open, the Business
    // still Restricted and Ineligible, the Offering still Published and still
    // absent from Discovery — and re-review is now outstanding.
    expect(after.rows[0]).toEqual({
      ...before.rows[0],
      caseStatus: "OPEN",
      title: "Düzeltilmiş başlık"
    });
    expect(after.rows[0]?.moderation).toBe("RESTRICTED");
    expect(after.rows[0]?.exposure).toBe("INELIGIBLE");
    expect(after.rows[0]?.projected).toBe("0");
    expect(
      responded.find((item) => item.id === notice.id)?.reReviewRequired
    ).toBe(true);
  });

  it("leaves approved action, no-action and closure to Platform", async () => {
    const business = await scenario();
    const notice = await offeringCorrection(business);

    const attempts = await Promise.all(
      ["closure", "re-review", "no-action"].map((action) =>
        send(
          "POST",
          `/admin/businesses/${business.businessId}/correction-requests/${notice.id}/${action}`,
          { body: {}, cookie: admin.cookie }
        )
      )
    );

    // AC-15. None of the three exists in this Increment. An unimplemented
    // action cannot be performed by accident, and the case therefore cannot be
    // closed by anything the Business response path does.
    for (const attempt of attempts) expect(attempt.statusCode).toBe(404);
  });

  it("publishes the exact vocabularies the Story allows", () => {
    // AC-1, AC-2 and AC-9 read straight off the two closed lists. Category is
    // not a correctable content area, so a correction cannot move an Offering
    // across the catalogue while its Business is Restricted.
    expect(CORRECTION_TARGETS).toEqual([
      "BUSINESS_INFORMATION",
      "OFFERING_CONTENT",
      "AFFILIATE_DESTINATION_CONFIGURATION",
      "DIRECT_CONTACT_INFORMATION"
    ]);
    expect(OFFERING_CONTENT_AREAS).toEqual(["TITLE", "SUMMARY", "ATTRIBUTES"]);
  });
});
