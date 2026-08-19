import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import { silentLogger } from "../packages/testing/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { permittedOfferingEntries } from "../modules/offering/src/index.js";
import { businessDashboardSchema } from "../packages/contracts/src/index.js";

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
 * `US-BUS-F05-001` Offering Management Entry.
 *
 * The Story is about offers rather than actions: which entries a Dashboard may
 * show. So the test that matters most is that an offered entry is one the write
 * path would honour — the offer and the refusal have to be the same rule read
 * twice, or a person is invited to do something the platform then declines.
 */
suite("Increment I6 Offering management entry", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let leafId: string;
  let requiredAttributeId: string;
  let strictLeafId: string;

  const address = () => `mgt-${randomUUID()}@example.test`;
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

  const owner = async () => {
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
    return { businessId, cookie: account.cookie };
  };

  const offer = async (
    business: { businessId: string; cookie: string },
    input: { categoryId?: string; publish?: boolean } = {}
  ) => {
    const categoryId = input.categoryId ?? leafId;
    const offering = await send(
      "POST",
      `/businesses/${business.businessId}/offerings`,
      {
        body: { categoryId, slug: slug(), title: "Kırmızı araba" },
        cookie: business.cookie
      }
    );
    const offeringId = offering.json<{ id: string }>().id;
    await send(
      "PUT",
      `/businesses/${business.businessId}/offerings/${offeringId}/content`,
      {
        body: { attributes: [], categoryId, title: "Kırmızı araba" },
        cookie: business.cookie
      }
    );
    if (input.publish)
      await send(
        "POST",
        `/businesses/${business.businessId}/offerings/${offeringId}/publication`,
        { cookie: business.cookie }
      );
    return offeringId;
  };

  const dashboard = async (business: { businessId: string; cookie: string }) =>
    businessDashboardSchema.parse(
      (
        await send("GET", `/businesses/${business.businessId}/dashboard`, {
          cookie: business.cookie
        })
      ).json()
    );

  const entriesFor = async (
    business: { businessId: string; cookie: string },
    offeringId: string
  ) => {
    const view = await dashboard(business);
    const all = [
      ...view.inventory.ARCHIVED,
      ...view.inventory.DRAFT,
      ...view.inventory.HIDDEN,
      ...view.inventory.PUBLISHED
    ];
    return all.find((entry) => entry.id === offeringId)?.entries ?? [];
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

    const leaf = await send("POST", "/admin/categories", {
      body: {
        domain: "MOBILITY",
        name: "Otomobil",
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });
    leafId = leaf.json<{ id: string }>().id;

    // A second leaf whose Attribute is required for publication, so a Draft can
    // exist that is perfectly valid and still not publishable.
    const strict = await send("POST", "/admin/categories", {
      body: {
        domain: "MOBILITY",
        name: "Ticari",
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });
    strictLeafId = strict.json<{ id: string }>().id;
    const required = await send("POST", "/admin/attributes", {
      body: {
        categoryIds: [strictLeafId],
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
    await pool.end();
  });

  it("organizes the inventory by the authoritative lifecycle states", async () => {
    const business = await owner();
    const draftId = await offer(business);
    const publishedId = await offer(business, { publish: true });

    const view = await dashboard(business);

    // AC-1. Four states, and an Offering appears under the one PRD-0001 says
    // it is in.
    expect(Object.keys(view.inventory).sort()).toEqual([
      "ARCHIVED",
      "DRAFT",
      "HIDDEN",
      "PUBLISHED"
    ]);
    expect(view.inventory.DRAFT.map((entry) => entry.id)).toContain(draftId);
    expect(view.inventory.PUBLISHED.map((entry) => entry.id)).toContain(
      publishedId
    );
  });

  it("begins a created Offering as a Draft", async () => {
    const business = await owner();

    const offeringId = await offer(business);

    // AC-3 and AC-4. Creation is available to this Unrestricted Business, and
    // what it produces is PRD-0001's Draft rather than a Business-owned state.
    const status = await pool.query<{ status: string }>(
      `select status::text as status from offering where id = $1`,
      [offeringId]
    );
    expect(status.rows[0]?.status).toBe("DRAFT");
  });

  it("offers Publish only where the minimum is already satisfied", async () => {
    const business = await owner();
    const ready = await offer(business);
    const incomplete = await offer(business, { categoryId: strictLeafId });

    const readyEntries = await entriesFor(business, ready);
    const incompleteEntries = await entriesFor(business, incomplete);

    // AC-6 and AC-7. The unsatisfied Draft is not offered Publish, and the
    // reason is PRD-0001's minimum consulted rather than restated: the
    // Dashboard asks the function that owns it.
    expect(readyEntries).toContain("PUBLISH");
    expect(incompleteEntries).not.toContain("PUBLISH");
  });

  it("keeps the offer and the refusal the same rule", async () => {
    const business = await owner();
    const incomplete = await offer(business, { categoryId: strictLeafId });

    const entries = await entriesFor(business, incomplete);
    const attempted = await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${incomplete}/publication`,
      { cookie: business.cookie }
    );

    // AC-2. What is not offered is what would be refused — and an entry that
    // was offered would have been honoured.
    expect(entries).not.toContain("PUBLISH");
    expect(attempted.statusCode).toBe(422);
  });

  it("makes an Archived Offering view-only", async () => {
    const business = await owner();
    const offeringId = await offer(business, { publish: true });
    await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${offeringId}/retirement`,
      { cookie: business.cookie }
    );

    const entries = await entriesFor(business, offeringId);

    // AC-9 and AC-11. Retirement produces Archived — not a Business-owned
    // result of its own — and Archived offers nothing but looking.
    expect(entries).toEqual(["VIEW"]);
  });

  it("offers Retire from every state that permits it", async () => {
    const business = await owner();
    const draftId = await offer(business);
    const publishedId = await offer(business, { publish: true });

    // AC-8. A person may stop offering something whatever stage it is at.
    expect(await entriesFor(business, draftId)).toContain("RETIRE");
    expect(await entriesFor(business, publishedId)).toContain("RETIRE");
  });

  it("offers no way to restore a Hidden Offering and no way to delete", async () => {
    const business = await owner();
    const offeringId = await offer(business, { publish: true });
    await pool.query(`update offering set status = 'HIDDEN' where id = $1`, [
      offeringId
    ]);

    const entries = await entriesFor(business, offeringId);

    // AC-10 and AC-12. Neither is missing by omission: neither is a value the
    // published enum can hold, so no surface can offer one by accident.
    expect(entries).not.toContain("PUBLISH");
    expect(JSON.stringify(entries)).not.toMatch(/restore|delete/iu);
  });

  it("distinguishes lifecycle Published from public eligibility", async () => {
    const business = await owner();
    const offeringId = await offer(business, { publish: true });
    await send("POST", `/admin/businesses/${business.businessId}/restriction`, {
      cookie: admin.cookie
    });

    const view = await dashboard(business);

    // AC-13. Still Published to its owner, and no longer publicly exposed. The
    // Dashboard reports both because they are two facts, not one: a single
    // field could not have said the Offering is live for the owner to manage
    // and absent from the public site.
    const entry = view.inventory.PUBLISHED.find((it) => it.id === offeringId);
    expect(entry?.status).toBe("PUBLISHED");
    expect(view.business.publicExposure).toBe("INELIGIBLE");
    const projected = await pool.query(
      `select 1 from offering_search_projection where offering_id = $1`,
      [offeringId]
    );
    expect(projected.rowCount).toBe(0);
  });

  it("narrows the entries a Restricted Business is offered", async () => {
    const business = await owner();
    const draftId = await offer(business);
    const publishedId = await offer(business, { publish: true });
    await send("POST", `/admin/businesses/${business.businessId}/restriction`, {
      cookie: admin.cookie
    });

    const draftEntries = await entriesFor(business, draftId);
    const publishedEntries = await entriesFor(business, publishedId);

    // AC-14 and AC-15. The Draft is still the owner's to work on; the Published
    // Offering may be looked at and retired, and nothing else — the bounded
    // correction-edit path `US-PLT-F06-001` owns does not exist yet.
    expect(draftEntries).toEqual(
      expect.arrayContaining(["EDIT", "RETIRE", "MANAGE_AFFILIATE_DESTINATION"])
    );
    expect(draftEntries).not.toContain("PUBLISH");
    expect(publishedEntries.sort()).toEqual(["RETIRE", "VIEW"]);
  });

  it("claims no lifecycle transition when an action fails", async () => {
    const business = await owner();
    const offeringId = await offer(business, { categoryId: strictLeafId });

    const refused = await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${offeringId}/publication`,
      { cookie: business.cookie }
    );

    // AC-16. The refusal left a Draft, not a half-published Offering — the
    // whole transaction was declined rather than partly applied.
    expect(refused.statusCode).toBe(422);
    const after = await pool.query<{
      published: string | null;
      status: string;
    }>(
      `select status::text as status, published_at::text as published
       from offering where id = $1`,
      [offeringId]
    );
    expect(after.rows[0]).toEqual({ published: null, status: "DRAFT" });
  });

  it("composes the same entries the Dashboard shows", () => {
    // The composition read directly, so the rules are legible without a
    // database: every case the Story names, in one place.
    expect(
      permittedOfferingEntries({
        lifecycle: "ARCHIVED",
        publicationMinimumSatisfied: true,
        restricted: false
      })
    ).toEqual(["VIEW"]);
    expect(
      permittedOfferingEntries({
        lifecycle: "DRAFT",
        publicationMinimumSatisfied: true,
        restricted: false
      })
    ).toEqual([
      "VIEW",
      "EDIT",
      "PUBLISH",
      "RETIRE",
      "MANAGE_AFFILIATE_DESTINATION"
    ]);
    expect(
      permittedOfferingEntries({
        lifecycle: "HIDDEN",
        publicationMinimumSatisfied: true,
        restricted: true
      })
    ).toEqual(["VIEW", "RETIRE"]);
  });

  it("lets a Restricted owner still publish nothing at all", async () => {
    const business = await owner();
    const draftId = await offer(business);
    await send("POST", `/admin/businesses/${business.businessId}/restriction`, {
      cookie: admin.cookie
    });

    const attempted = await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${draftId}/publication`,
      { cookie: business.cookie }
    );

    // AC-15, checked against the write path rather than the offer: the entry is
    // absent *and* the action is refused.
    expect(await entriesFor(business, draftId)).not.toContain("PUBLISH");
    expect(attempted.statusCode).toBe(403);
  });
});
