import { randomUUID } from "node:crypto";
import { createElement } from "react";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type {
  AffiliateDestination,
  DestinationWorkloadItem
} from "@commerce/contracts";
import { MODERATION_ACTIONS } from "@commerce/moderation";
import { DESTINATION_ADMINISTRATION_ACTIONS } from "@commerce/offering";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import { silentLogger } from "../packages/testing/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { DestinationAction } from "../apps/web/src/app/admin/destinations/destination-actions";
import { ADMIN_IDLE } from "../apps/web/src/platform/admin-state";
import {
  DESTINATION_ACTION_RESULTS,
  SEPARATE_FROM_MODERATION,
  WORKLOAD_COPY,
  WORKLOAD_ORDER,
  disableAvailable,
  enableAvailable
} from "../apps/web/src/platform/destinations";

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
 * UX-0006 §9.
 *
 * Four verbs whose results belong to `US-PLT-F07-001`, and a workload category
 * that is a way of looking at a destination rather than a state it can be in.
 * So the tests check that the queue follows the results rather than the other
 * way round, and that this family and General Moderation never meet.
 */
suite("Increment I8 Admin destinations", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

  const address = () => `ade-${randomUUID()}@example.test`;
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

  /// One Draft Offering with an authored destination — the state everything in
  /// this queue starts from.
  const withDestination = async () => {
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
      `/businesses/${businessId}/offerings/${offeringId}/affiliate-destination`,
      {
        body: { reference: `https://example.test/${randomUUID()}` },
        cookie: account.cookie
      }
    );
    return { businessId, offeringId };
  };

  const administer = (offeringId: string, path: string, body?: unknown) =>
    send(
      "POST",
      `/admin/offerings/${offeringId}/affiliate-destination/${path}`,
      {
        ...(body === undefined ? {} : { body }),
        cookie: admin.cookie
      }
    );

  const workload = async () =>
    (
      await send("GET", "/admin/offerings/affiliate-destinations/workload", {
        cookie: admin.cookie
      })
    ).json<{ items: DestinationWorkloadItem[] }>().items;

  const itemFor = async (offeringId: string) =>
    (await workload()).find(
      (item) => item.destination.offeringId === offeringId
    );

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
  });

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    dispatcher.delivered.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("records a review and changes nothing by it", async () => {
    const { offeringId } = await withDestination();
    const before = await itemFor(offeringId);

    const reviewed = await administer(offeringId, "review", {
      note: "Looks like the right page."
    });
    const after = await itemFor(offeringId);

    // §9's Results. Review changes no state by itself, and the workload
    // category is unmoved — which is the honest thing for the button to say.
    expect(reviewed.statusCode).toBe(200);
    expect(after?.destination.status).toBe(before?.destination.status);
    expect(after?.destination.validationResult).toBe(
      before?.destination.validationResult
    );
    expect(after?.category).toBe("NEEDS_VALIDATION");
    expect(DESTINATION_ACTION_RESULTS.REVIEW).toMatch(
      /hiçbir şeyi değiştirmez/iu
    );
  });

  it("moves the queue by moving the results it is derived from", async () => {
    const { offeringId } = await withDestination();

    expect((await itemFor(offeringId))?.category).toBe("NEEDS_VALIDATION");
    await administer(offeringId, "validation", {
      reason: "The page is not the Offering.",
      result: "INVALID"
    });
    expect((await itemFor(offeringId))?.category).toBe(
      "BUSINESS_CORRECTION_NEEDED"
    );
    await administer(offeringId, "validation", {
      reason: null,
      result: "VALID"
    });
    expect((await itemFor(offeringId))?.category).toBe("READY_TO_ENABLE");
    await administer(offeringId, "enablement");

    // AC-11 and AC-12. Enabled is not waiting for anybody, so its category
    // becomes nothing — and nothing had to remember to clear it, because the
    // category is derived on every read rather than stored. The queue shows
    // items by category, so an item owing nothing appears under no heading.
    expect((await itemFor(offeringId))?.category).toBeNull();
  });

  it("refuses Enable without a Valid result and offers it only where it holds", async () => {
    const { offeringId } = await withDestination();

    const early = await administer(offeringId, "enablement");
    const notValidated = await itemFor(offeringId);

    await administer(offeringId, "validation", {
      reason: null,
      result: "VALID"
    });
    const validated = await itemFor(offeringId);

    // AC-6. The screen offers Enable exactly where the route would honour it,
    // read from the same condition rather than from a second opinion.
    expect(early.statusCode).toBeGreaterThanOrEqual(400);
    expect(enableAvailable(notValidated!.destination)).toBe(false);
    expect(enableAvailable(validated!.destination)).toBe(true);
    expect(disableAvailable(validated!.destination)).toBe(false);
  });

  it("keeps the validation result when a destination is disabled", async () => {
    const { offeringId } = await withDestination();
    await administer(offeringId, "validation", {
      reason: null,
      result: "VALID"
    });
    await administer(offeringId, "enablement");

    const disabled = await administer(offeringId, "disablement");
    const destination = disabled.json<AffiliateDestination>();

    // §9's Results. Disable produces Disabled and Handoff Ineligible and
    // preserves the validation result — a check somebody performed is not
    // undone by a decision about whether to use it.
    expect(destination.status).toBe("DISABLED");
    expect(destination.handoffEligibility).toBe("INELIGIBLE");
    expect(destination.validationResult).toBe("VALID");
    expect(DESTINATION_ACTION_RESULTS.DISABLE).toMatch(/olduğu gibi kalır/iu);
  });

  it("keeps this family and General Moderation apart", () => {
    const overlap = DESTINATION_ADMINISTRATION_ACTIONS.filter((action) =>
      (MODERATION_ACTIONS as readonly string[]).includes(action)
    );

    // §9's opening line. Two vocabularies that never meet, said in the domain
    // and said again on the screen — because the two queues share a panel and
    // an Admin has no other way to know that validating opens no case.
    expect(overlap).toEqual([]);
    expect(SEPARATE_FROM_MODERATION).toMatch(/Genel Moderasyon değildir/u);
  });

  it("says whose turn it is on the one item that is not the platform's", () => {
    // An Admin who did not know a Business-correction item is not theirs to
    // move would keep returning to it. The queue is also ordered so that what
    // the platform can act on comes first.
    expect(WORKLOAD_COPY.BUSINESS_CORRECTION_NEEDED).toMatch(
      /Değiştirmesi gereken/u
    );
    expect(WORKLOAD_ORDER[0]).toBe("READY_TO_ENABLE");
    expect(WORKLOAD_ORDER.at(-1)).toBe("BUSINESS_CORRECTION_NEEDED");
  });

  it("asks why when marking something invalid", () => {
    const markup = renderToStaticMarkup(
      createElement(DestinationAction, {
        action: () => Promise.resolve(ADMIN_IDLE),
        verb: "VALIDATE_INVALID"
      })
    );

    // The contract allows an empty reason; the form asks anyway, because
    // "invalid" alone tells the Business nothing they can act on.
    expect(markup).toContain('name="reason"');
    expect(markup).toContain(DESTINATION_ACTION_RESULTS.VALIDATE_INVALID);
    // And there is no way to un-check something: NOT_VALIDATED is the absence
    // of a result, not one Validate can produce.
    expect(markup).not.toMatch(/not_validated/iu);
  });
});
