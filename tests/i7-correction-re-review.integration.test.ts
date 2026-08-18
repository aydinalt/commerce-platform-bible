import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import { CORRECTION_TARGETS } from "../modules/business/src/index.js";
import { MODERATION_ACTIONS } from "../modules/moderation/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import {
  correctionNoticeSchema,
  moderationCaseSchema
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
 * `US-PLT-F06-001` Request Correction and Re-review.
 *
 * `US-BUS-F07-001` built the owner's half — the notice, the bounded edit, and
 * a response that records itself so re-review is outstanding. This Story
 * closes the loop: the outstanding requirement now has teeth. A case whose
 * owner has answered cannot be closed until somebody has looked at the answer,
 * because an owner who does the work and is never read might as well not have.
 */
suite("Increment I7 Request Correction and re-review", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

  const address = () => `rvw-${randomUUID()}@example.test`;
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

  /// A Restricted Business with one Published Offering under correction — the
  /// whole situation this Story governs, assembled once.
  const underCorrection = async () => {
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
      body: { categoryId, slug: slug(), title: "Yanıltıcı başlık" },
      cookie: account.cookie
    });
    const offeringId = offering.json<{ id: string }>().id;
    await send(
      "PUT",
      `/businesses/${businessId}/offerings/${offeringId}/content`,
      {
        body: { attributes: [], categoryId, title: "Yanıltıcı başlık" },
        cookie: account.cookie
      }
    );
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/publication`,
      { cookie: account.cookie }
    );
    await send("POST", `/admin/businesses/${businessId}/restriction`, {
      cookie: admin.cookie
    });
    const notice = correctionNoticeSchema.parse(
      (
        await send(
          "POST",
          `/admin/businesses/${businessId}/correction-requests`,
          {
            body: {
              contentArea: "TITLE",
              note: "Başlık yanıltıcı",
              offeringId,
              target: "OFFERING_CONTENT"
            },
            cookie: admin.cookie
          }
        )
      ).json()
    );
    return { ...account, businessId, notice, offeringId };
  };

  const respond = (
    business: { businessId: string; cookie: string },
    correctionId: string,
    title = "Düzeltilmiş başlık"
  ) =>
    send(
      "PUT",
      `/businesses/${business.businessId}/correction-notices/${correctionId}/response`,
      { body: { area: "TITLE", title }, cookie: business.cookie }
    );

  const readCase = async (caseId: string) =>
    moderationCaseSchema.parse(
      (
        await send("GET", `/admin/moderation-cases/${caseId}`, {
          cookie: admin.cookie
        })
      ).json()
    );

  const reReview = (caseId: string, note: string | null = "Düzeltme yeterli") =>
    send("POST", `/admin/moderation-cases/${caseId}/re-review`, {
      body: note === null ? {} : { note },
      cookie: admin.cookie
    });

  const noAction = (caseId: string) =>
    send("POST", `/admin/moderation-cases/${caseId}/no-action-decision`, {
      body: { reason: "Düzeltme sonrası sorun kalmadı" },
      cookie: admin.cookie
    });

  const close = (caseId: string) =>
    send("POST", `/admin/moderation-cases/${caseId}/closure`, {
      cookie: admin.cookie
    });

  const everything = (businessId: string, offeringId: string) =>
    pool.query<{
      caseStatus: string;
      eligibility: string;
      exposure: string;
      lifecycle: string;
      moderation: string;
      projected: string;
    }>(
      `select o.status::text as lifecycle,
         b.public_exposure::text as exposure,
         coalesce(m.status::text,'UNRESTRICTED') as moderation,
         coalesce((select p.status::text from offering_publication p
           where p.offering_id = o.id
           order by p.eligibility_version desc limit 1),'PENDING') as eligibility,
         (select count(*)::text from offering_search_projection s
           where s.offering_id = o.id) as projected,
         (select c.status::text from moderation_case c
          where c.business_id = b.id order by c.opened_at limit 1) as "caseStatus"
       from offering o
       join business b on b.id = o.business_id
       left join business_moderation_state m on m.business_id = b.id
       where o.id = $2 and b.id = $1`,
      [businessId, offeringId]
    );

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

  it("accepts the exact four targets and no account correction", async () => {
    const values = await pool.query<{ label: string }>(
      `select unnest(enum_range(null::"CorrectionTarget"))::text as label`
    );

    // AC-1 and AC-2. The database and the domain agree, and `USER_ACCOUNT` is
    // in neither — a correction against an account has nowhere to be written.
    expect(values.rows.map((row) => row.label).sort()).toEqual(
      [...CORRECTION_TARGETS].sort()
    );
    expect(JSON.stringify(CORRECTION_TARGETS)).not.toMatch(/USER_ACCOUNT/u);
  });

  it("keeps the case Open and changes nothing by requesting a correction", async () => {
    const business = await underCorrection();
    const before = await everything(business.businessId, business.offeringId);

    await send(
      "POST",
      `/admin/businesses/${business.businessId}/correction-requests`,
      { body: { target: "BUSINESS_INFORMATION" }, cookie: admin.cookie }
    );
    const after = await everything(business.businessId, business.offeringId);

    // AC-3 and AC-4. A second correction on the same case moves nothing: not
    // the lifecycle, the moderation status, the exposure input, the composed
    // eligibility, the projection or the case.
    expect(after.rows[0]).toEqual(before.rows[0]);
    expect(after.rows[0]?.caseStatus).toBe("OPEN");
  });

  it("creates a notice and no conversation", async () => {
    const business = await underCorrection();

    const notices = await send(
      "GET",
      `/businesses/${business.businessId}/correction-notices`,
      { cookie: business.cookie }
    );
    const reply = await send(
      "POST",
      `/admin/moderation-cases/${business.notice.caseId}/messages`,
      { body: { message: "Merhaba" }, cookie: admin.cookie }
    );

    // AC-5. The notice reaches the owner's Dashboard, and there is no verb on
    // either side that could begin a conversation about it.
    expect(notices.statusCode).toBe(200);
    expect(business.notice.target).toBe("OFFERING_CONTENT");
    expect(reply.statusCode).toBe(404);
  });

  it("refuses closure while the owner's answer is unread", async () => {
    const business = await underCorrection();
    await noAction(business.notice.caseId);
    const closableBefore = await readCase(business.notice.caseId);

    await respond(business, business.notice.id);
    const afterEdit = await readCase(business.notice.caseId);
    const refused = await close(business.notice.caseId);

    // AC-10, and the point of the whole Story. Before the owner answered, the
    // case was closable; the moment they answered, it stopped being — because
    // somebody now has something to read.
    expect(closableBefore.reReviewRequired).toBe(false);
    expect(afterEdit.reReviewRequired).toBe(true);
    expect(refused.statusCode).toBe(409);
    expect(refused.json<{ code: string }>().code).toBe("CASE_NOT_RE_REVIEWED");
  });

  it("allows closure once the answer has been read", async () => {
    const business = await underCorrection();
    await noAction(business.notice.caseId);
    await respond(business, business.notice.id);

    const reviewed = await reReview(business.notice.caseId);
    const closed = await close(business.notice.caseId);

    // AC-12. Two conditions and both met: a resolution to close on, and a look
    // at what the owner did.
    expect(reviewed.statusCode).toBe(201);
    expect(moderationCaseSchema.parse(reviewed.json()).reReviewRequired).toBe(
      false
    );
    expect(closed.statusCode).toBe(200);
  });

  it("will not let one review stand in for a later answer", async () => {
    const business = await underCorrection();
    await noAction(business.notice.caseId);
    await respond(business, business.notice.id, "İlk düzeltme");
    await reReview(business.notice.caseId);

    await respond(business, business.notice.id, "İkinci düzeltme");
    const afterSecond = await readCase(business.notice.caseId);
    const refused = await close(business.notice.caseId);

    // AC-10 read carefully. The requirement is a review of *this* answer, so
    // an earlier one does not discharge it — otherwise a single review would
    // license every future response.
    expect(afterSecond.reReviewRequired).toBe(true);
    expect(refused.statusCode).toBe(409);
  });

  it("needs no re-review where the owner was asked for nothing", async () => {
    const account = await signUp();
    const created = await send("POST", "/businesses", {
      body: { name: "Başka İşletme", slug: slug() },
      cookie: account.cookie
    });
    const businessId = created.json<{ id: string }>().id;
    const opened = moderationCaseSchema.parse(
      (
        await send("POST", "/admin/moderation-cases", {
          body: { businessId, targetType: "BUSINESS" },
          cookie: admin.cookie
        })
      ).json()
    );
    await noAction(opened.id);

    const closed = await close(opened.id);

    // The condition is about answers, not about cases. Nobody was asked to do
    // anything here, so there is nothing to have read.
    expect(opened.reReviewRequired).toBe(false);
    expect(closed.statusCode).toBe(200);
  });

  it("keeps everything where it was through the whole exchange", async () => {
    const business = await underCorrection();
    const before = await everything(business.businessId, business.offeringId);

    await respond(business, business.notice.id);
    const afterEdit = await everything(
      business.businessId,
      business.offeringId
    );
    await reReview(business.notice.caseId);
    const afterReview = await everything(
      business.businessId,
      business.offeringId
    );
    await noAction(business.notice.caseId);
    await close(business.notice.caseId);
    const afterClosure = await everything(
      business.businessId,
      business.offeringId
    );

    // AC-11 and AC-13. Through the owner's edit, the re-review and the closure
    // itself, the Business stays Restricted and Ineligible and the Offering
    // stays Published and publicly ineligible. Only the case status moved, and
    // only at the very end.
    expect(afterEdit.rows[0]).toEqual(before.rows[0]);
    expect(afterReview.rows[0]).toEqual(before.rows[0]);
    expect(afterClosure.rows[0]).toEqual({
      ...before.rows[0],
      caseStatus: "CLOSED"
    });
    expect(before.rows[0]?.moderation).toBe("RESTRICTED");
    expect(before.rows[0]?.exposure).toBe("INELIGIBLE");
    expect(before.rows[0]?.lifecycle).toBe("PUBLISHED");
    expect(before.rows[0]?.projected).toBe("0");
  });

  it("grants the owner nothing beyond the bounded edit", async () => {
    const business = await underCorrection();
    await respond(business, business.notice.id);

    const created = await send(
      "POST",
      `/businesses/${business.businessId}/offerings`,
      {
        body: { categoryId, slug: slug(), title: "Yeni" },
        cookie: business.cookie
      }
    );
    const untargeted = await send(
      "PUT",
      `/businesses/${business.businessId}/correction-notices/${business.notice.id}/response`,
      { body: { area: "SUMMARY", summary: "Başka" }, cookie: business.cookie }
    );
    const ordinary = await send(
      "PUT",
      `/businesses/${business.businessId}/offerings/${business.offeringId}/content`,
      {
        body: { attributes: [], categoryId, title: "Serbest" },
        cookie: business.cookie
      }
    );

    // AC-6, AC-7 and AC-8. Answering a correction leaves the owner exactly as
    // Restricted as before: no creation, no untargeted area, no ordinary
    // Published edit.
    expect(created.statusCode).toBe(403);
    expect(untargeted.statusCode).toBe(403);
    expect(ordinary.statusCode).toBe(403);
  });

  it("requires the saved correction to keep the Offering publishable", async () => {
    const business = await underCorrection();

    const emptied = await send(
      "PUT",
      `/businesses/${business.businessId}/correction-notices/${business.notice.id}/response`,
      { body: { area: "TITLE", title: "   " }, cookie: business.cookie }
    );

    // AC-9. A blank title is refused at the edge, before it can reach an
    // Offering the public has already been shown.
    expect(emptied.statusCode).toBe(400);
  });

  it("is not an eighth General Moderation action", async () => {
    const business = await underCorrection();
    await respond(business, business.notice.id);
    await reReview(business.notice.caseId);

    const after = await readCase(business.notice.caseId);

    // AC-14. The owner's response and the re-review are part of Request
    // Correction, not actions of their own: neither appears in the seven, and
    // neither becomes a resolution a closure could cite. The case has had an
    // owner edit and a re-review and still has nothing to close on, which is
    // exactly the distinction — the restriction here predates the case, so
    // even that is not among them.
    expect(MODERATION_ACTIONS).toHaveLength(7);
    expect(JSON.stringify(MODERATION_ACTIONS)).not.toMatch(
      /RESPONSE|RE_REVIEW|CORRECTION_EDIT/u
    );
    expect(after.resolutions).toEqual([]);
    expect((await close(business.notice.caseId)).statusCode).toBe(409);
  });
});
