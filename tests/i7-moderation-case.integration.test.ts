import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import {
  availableModerationActions,
  MODERATION_ACTIONS
} from "../modules/moderation/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { moderationCaseSchema } from "../packages/contracts/src/index.js";

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
 * `US-PLT-F02-001` General Moderation Case Management.
 *
 * The Story's whole point is a separation: a case is workflow, and workflow is
 * not any target's product state. So the tests that matter most are the ones
 * showing that opening, reviewing and closing a case leave the Offering, the
 * Business and the account exactly where they were — and that closing is
 * something an Admin has to have earned.
 */
suite("Increment I7 General Moderation case management", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

  const address = () => `mcs-${randomUUID()}@example.test`;
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

  const business = async () => {
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

  const publishedOffering = async (owner: {
    businessId: string;
    cookie: string;
  }) => {
    const created = await send(
      "POST",
      `/businesses/${owner.businessId}/offerings`,
      {
        body: { categoryId, slug: slug(), title: "Kırmızı araba" },
        cookie: owner.cookie
      }
    );
    const offeringId = created.json<{ id: string }>().id;
    await send(
      "PUT",
      `/businesses/${owner.businessId}/offerings/${offeringId}/content`,
      {
        body: { attributes: [], categoryId, title: "Kırmızı araba" },
        cookie: owner.cookie
      }
    );
    await send(
      "POST",
      `/businesses/${owner.businessId}/offerings/${offeringId}/publication`,
      { cookie: owner.cookie }
    );
    return offeringId;
  };

  const openCase = async (target: Record<string, unknown>) => {
    const response = await send("POST", "/admin/moderation-cases", {
      body: target,
      cookie: admin.cookie
    });
    return {
      body: moderationCaseSchema.parse(response.json()),
      statusCode: response.statusCode
    };
  };

  const readCase = async (caseId: string) =>
    moderationCaseSchema.parse(
      (
        await send("GET", `/admin/moderation-cases/${caseId}`, {
          cookie: admin.cookie
        })
      ).json()
    );

  const close = (caseId: string) =>
    send("POST", `/admin/moderation-cases/${caseId}/closure`, {
      cookie: admin.cookie
    });

  const noAction = (caseId: string, reason = "Şikâyet asılsız") =>
    send("POST", `/admin/moderation-cases/${caseId}/no-action-decision`, {
      body: { reason },
      cookie: admin.cookie
    });

  /// Everything about a target that a case must not touch.
  const targetState = (
    businessId: string,
    offeringId: string,
    userId: string
  ) =>
    pool.query<{
      exposure: string;
      lifecycle: string;
      moderation: string;
      publication: string;
      accountStatus: string;
    }>(
      `select o.status::text as lifecycle,
         b.public_exposure::text as exposure,
         coalesce(m.status::text,'UNRESTRICTED') as moderation,
         coalesce((select p.status::text from offering_publication p
           where p.offering_id = o.id
           order by p.eligibility_version desc limit 1),'PENDING') as publication,
         u.status::text as "accountStatus"
       from offering o
       join business b on b.id = o.business_id
       left join business_moderation_state m on m.business_id = b.id
       cross join user_account u
       where o.id = $2 and b.id = $1 and u.id = $3`,
      [businessId, offeringId, userId]
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

  it("has exactly two statuses and starts Open", async () => {
    const owner = await business();

    const opened = await openCase({
      businessId: owner.businessId,
      targetType: "BUSINESS"
    });
    const values = await pool.query<{ label: string }>(
      `select unnest(enum_range(null::"ModerationCaseStatus"))::text as label`
    );

    // AC-1 and AC-2. Two values in the datamodel, and surfacing a target
    // produces the first of them.
    expect(values.rows.map((row) => row.label)).toEqual(["OPEN", "CLOSED"]);
    expect(opened.statusCode).toBe(201);
    expect(opened.body.status).toBe("OPEN");
  });

  it("answers a second surfacing with the case that already exists", async () => {
    const owner = await business();

    const first = await openCase({
      businessId: owner.businessId,
      targetType: "BUSINESS"
    });
    const second = await openCase({
      businessId: owner.businessId,
      targetType: "BUSINESS"
    });

    // AC-2. One concern is one case. A second case would be a second thing to
    // close for something nobody thought of twice.
    expect(second.body.id).toBe(first.body.id);
    expect(second.body.status).toBe("OPEN");
  });

  it("changes no target state by opening or reading", async () => {
    const owner = await business();
    const offeringId = await publishedOffering(owner);
    const before = await targetState(
      owner.businessId,
      offeringId,
      owner.userId
    );

    const opened = await openCase({ offeringId, targetType: "OFFERING" });
    const afterOpen = await targetState(
      owner.businessId,
      offeringId,
      owner.userId
    );
    await readCase(opened.body.id);
    const afterRead = await targetState(
      owner.businessId,
      offeringId,
      owner.userId
    );

    // AC-3. Lifecycle, exposure, moderation, publication and account status are
    // all exactly where they were. A case is a note that somebody should look.
    expect(afterOpen.rows[0]).toEqual(before.rows[0]);
    expect(afterRead.rows[0]).toEqual(before.rows[0]);
  });

  it("names an Offering case's Business without being told", async () => {
    const owner = await business();
    const offeringId = await publishedOffering(owner);

    const opened = await openCase({ offeringId, targetType: "OFFERING" });

    // The Business that will answer for the Offering is resolved from the
    // Offering, so a caller cannot pair one Business's Offering with another
    // Business's case.
    expect(opened.body.targetType).toBe("OFFERING");
    expect(opened.body.offeringId).toBe(offeringId);
    expect(opened.body.businessId).toBe(owner.businessId);
    expect(opened.body.userId).toBeNull();
  });

  it("publishes exactly the seven General Moderation actions", async () => {
    const values = await pool.query<{ label: string }>(
      `select unnest(enum_range(null::"ModerationAction"))::text as label`
    );

    // AC-4 and AC-10. Seven, and none of them is an Affiliate Destination
    // administration action — Review, Validate, Enable and Disable are a
    // separate family, and the way that separation ends is somebody adding a
    // fifth verb to a set with no edges.
    expect([...MODERATION_ACTIONS]).toEqual([
      "REQUEST_CORRECTION",
      "HIDE_OFFERING",
      "RESTORE_OFFERING",
      "RESTRICT_BUSINESS",
      "RESTORE_BUSINESS",
      "SUSPEND_USER",
      "REINSTATE_USER"
    ]);
    expect(values.rows.map((row) => row.label).sort()).toEqual(
      [...MODERATION_ACTIONS].sort()
    );
    expect(JSON.stringify(MODERATION_ACTIONS)).not.toMatch(
      /validate|enable|disable|review/iu
    );
  });

  it("offers only actions valid for this target right now", async () => {
    const owner = await business();
    const businessCase = await openCase({
      businessId: owner.businessId,
      targetType: "BUSINESS"
    });
    const unrestricted = businessCase.body.availableActions;

    await send("POST", `/admin/businesses/${owner.businessId}/restriction`, {
      cookie: admin.cookie
    });
    const restricted = (await readCase(businessCase.body.id)).availableActions;

    // AC-5. A Business that is not Restricted can be; one that is cannot be
    // again, and can be restored instead. Nothing offered here would be
    // refused if taken.
    expect(unrestricted).toContain("RESTRICT_BUSINESS");
    expect(unrestricted).not.toContain("RESTORE_BUSINESS");
    expect(restricted).toContain("RESTORE_BUSINESS");
    expect(restricted).not.toContain("RESTRICT_BUSINESS");
  });

  it("offers nothing that has no path yet", async () => {
    const owner = await business();
    const offeringId = await publishedOffering(owner);

    const opened = await openCase({ offeringId, targetType: "OFFERING" });

    // AC-5. Hide and Restore Offering are members of the set and belong to
    // `US-PLT-F03-001`. Offering one now would be an offer the platform could
    // not keep, so the set does not shrink and the offer does not grow.
    expect(opened.body.availableActions).toEqual([]);
    expect(MODERATION_ACTIONS).toContain("HIDE_OFFERING");
  });

  it("keeps the case Open after Request Correction", async () => {
    const owner = await business();
    const opened = await openCase({
      businessId: owner.businessId,
      targetType: "BUSINESS"
    });

    await send(
      "POST",
      `/admin/businesses/${owner.businessId}/correction-requests`,
      { body: { target: "BUSINESS_INFORMATION" }, cookie: admin.cookie }
    );
    const afterCorrection = await readCase(opened.body.id);
    const refused = await close(opened.body.id);

    // AC-6 and AC-7 together. A correction asks the Business to do something,
    // so the case stays Open precisely so somebody comes back and looks — and
    // a correction alone is not something a closure may cite.
    expect(afterCorrection.status).toBe("OPEN");
    expect(refused.statusCode).toBe(409);
    expect(refused.json<{ code: string }>().code).toBe("CASE_NOT_RESOLVED");
  });

  it("closes only after an approved action or a recorded no-action decision", async () => {
    const applied = await business();
    const appliedCase = await openCase({
      businessId: applied.businessId,
      targetType: "BUSINESS"
    });
    await send("POST", `/admin/businesses/${applied.businessId}/restriction`, {
      cookie: admin.cookie
    });

    const decided = await business();
    const decidedCase = await openCase({
      businessId: decided.businessId,
      targetType: "BUSINESS"
    });
    await noAction(decidedCase.body.id);

    const bare = await business();
    const bareCase = await openCase({
      businessId: bare.businessId,
      targetType: "BUSINESS"
    });

    // AC-7. Two ways to earn a closure and no third. A case nobody decided
    // about stays Open, which is the only honest thing for it to be.
    expect((await close(appliedCase.body.id)).statusCode).toBe(200);
    expect((await close(decidedCase.body.id)).statusCode).toBe(200);
    expect((await close(bareCase.body.id)).statusCode).toBe(409);
  });

  it("changes no target state by closing", async () => {
    const owner = await business();
    const offeringId = await publishedOffering(owner);
    const opened = await openCase({ offeringId, targetType: "OFFERING" });
    await noAction(opened.body.id);
    const before = await targetState(
      owner.businessId,
      offeringId,
      owner.userId
    );

    const closed = await close(opened.body.id);
    const after = await targetState(owner.businessId, offeringId, owner.userId);

    // AC-8. Finishing the workflow finishes the workflow. The Offering is
    // still Published and still eligible; nothing happened to it because
    // somebody stopped looking at it.
    expect(closed.statusCode).toBe(200);
    expect(after.rows[0]).toEqual(before.rows[0]);
  });

  it("carries no target product state at all", async () => {
    const owner = await business();
    const offeringId = await publishedOffering(owner);
    const opened = await openCase({ offeringId, targetType: "OFFERING" });

    // AC-9. The strongest form of "case status is not target status" is a
    // shape with nowhere to put one. There is no lifecycle, moderation status,
    // access status, eligibility or validation result in a case.
    expect(Object.keys(opened.body).sort()).toEqual([
      "availableActions",
      "businessId",
      "closedAt",
      "id",
      "offeringId",
      "openedAt",
      "resolutions",
      "status",
      "targetType",
      "userId"
    ]);
    expect(JSON.stringify(opened.body)).not.toMatch(
      /PUBLISHED|ELIGIBLE|RESTRICTED|ENABLED|VALIDATED/u
    );
  });

  it("claims no closure when the closure fails", async () => {
    const owner = await business();
    const opened = await openCase({
      businessId: owner.businessId,
      targetType: "BUSINESS"
    });

    const refused = await close(opened.body.id);
    const after = await readCase(opened.body.id);
    const stored = await pool.query<{
      closedAt: string | null;
      status: string;
    }>(
      `select status::text as status, closed_at::text as "closedAt"
       from moderation_case where id = $1`,
      [opened.body.id]
    );

    // AC-11. Not partly closed: the status, the timestamp and the person who
    // would have closed it are all untouched, because the trigger refused the
    // update rather than the service undoing it afterwards.
    expect(refused.statusCode).toBe(409);
    expect(after.status).toBe("OPEN");
    expect(stored.rows[0]).toEqual({ closedAt: null, status: "OPEN" });
  });

  it("composes availability from the case and the target alone", () => {
    // The rules read without a database. A Closed case offers nothing at all —
    // an action taken after closure would be an action nobody had a case for.
    expect(
      availableModerationActions({
        caseOpen: false,
        restricted: false,
        targetType: "BUSINESS"
      })
    ).toEqual([]);
    expect(
      availableModerationActions({
        caseOpen: true,
        restricted: false,
        targetType: "BUSINESS"
      })
    ).toEqual(["REQUEST_CORRECTION", "RESTRICT_BUSINESS"]);
    expect(
      availableModerationActions({
        caseOpen: true,
        suspended: false,
        targetType: "USER_ACCOUNT"
      })
    ).toEqual([]);
  });
});
