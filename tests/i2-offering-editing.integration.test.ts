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
  offeringContentSchema
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
 * `US-OFR-F02-001` Offering Editing.
 *
 * Editing is the first path that writes Attribute values, which is why this is
 * where the Multi Select gap left open by `US-PLT-F09-001` closes.
 *
 * The Story's shape is a Draft that may be incomplete and a Published or Hidden
 * Offering that may not. So the interesting cases are the ones where the same
 * edit is accepted on a Draft and refused on a Published Offering — the
 * lifecycle is the only thing that differs.
 *
 * AC-9's bounded correction-edit path needs an Open correction case owned by
 * `US-PLT-F06-001`. Nothing can create one yet, so the exception cannot be
 * exercised and is not offered; the Restricted refusal below is unconditional.
 */
suite("Increment I2 Offering editing", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

  const address = () => `edt-${randomUUID()}@example.test`;
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

  const owner = async () => {
    const account = await signUp();
    const created = await send("POST", "/businesses", {
      body: { name: "Author", slug: slug() },
      cookie: account.cookie
    });
    const businessId = created.json<{ id: string }>().id;
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });
    return { ...account, businessId };
  };

  const leafCategory = async () => {
    const created = await send("POST", "/admin/categories", {
      body: {
        domain: "MOBILITY",
        name: "Leaf",
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });
    return created.json<{ id: string }>().id;
  };

  /** A Draft Offering owned by a fresh Business acting in its own context. */
  const draft = async (inCategory = categoryId) => {
    const business = await owner();
    const created = await send(
      "POST",
      `/businesses/${business.businessId}/offerings`,
      {
        body: { categoryId: inCategory, slug: slug(), title: "Original" },
        cookie: business.cookie
      }
    );
    return { ...business, offeringId: created.json<{ id: string }>().id };
  };

  /** PRD-0001 §6.2 owns the Draft → Published transition and
   * `US-OFR-F04-001` has not built it, so this suite reaches past the API for
   * the one thing it cannot yet ask for. */
  const setLifecycle = (
    offeringId: string,
    status: "PUBLISHED" | "HIDDEN" | "ARCHIVED"
  ) =>
    pool.query(
      status === "ARCHIVED"
        ? `update offering set status = 'ARCHIVED', archived_at = now()
           where id = $1`
        : `update offering set status = $2::"OfferingStatus",
             published_at = coalesce(published_at, now())
           where id = $1`,
      status === "ARCHIVED" ? [offeringId] : [offeringId, status]
    );

  const editBody = (overrides: Record<string, unknown> = {}) => ({
    attributes: [],
    categoryId,
    title: "Edited",
    ...overrides
  });

  const edit = (
    business: { businessId: string; cookie: string },
    offeringId: string,
    body: Record<string, unknown> = {}
  ) =>
    send(
      "PUT",
      `/businesses/${business.businessId}/offerings/${offeringId}/content`,
      { body: editBody(body), cookie: business.cookie }
    );

  const createAttribute = async (
    body: Record<string, unknown>,
    inCategory = categoryId
  ) => {
    const created = await send("POST", "/admin/attributes", {
      body: {
        categoryIds: [inCategory],
        comparable: false,
        filterable: false,
        name: "Attribute",
        stableKey: key(),
        valueKind: "TEXT",
        ...body
      },
      cookie: admin.cookie
    });
    return created.json<{
      id: string;
      options: { id: string; stableKey: string }[];
    }>();
  };

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
        name: "Cars",
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

  it("edits an owned Draft and keeps its Business", async () => {
    const business = await draft();

    const edited = await edit(business, business.offeringId, {
      summary: "Now with detail"
    });

    // AC-1 and AC-2.
    expect(edited.statusCode).toBe(200);
    expect(offeringContentSchema.parse(edited.json())).toMatchObject({
      businessId: business.businessId,
      status: "DRAFT",
      summary: "Now with detail",
      title: "Edited"
    });
  });

  it("holds several allowed values for a Multi Select", async () => {
    const business = await draft();
    const definition = await createAttribute({
      options: [
        { label: "Petrol", stableKey: "PETROL" },
        { label: "Diesel", stableKey: "DIESEL" },
        { label: "Electric", stableKey: "ELECTRIC" }
      ],
      valueKind: "MULTI_SELECT"
    });
    const chosen = definition.options.slice(0, 2).map((o) => o.id);

    const edited = await edit(business, business.offeringId, {
      attributes: [
        { attributeId: definition.id, kind: "SELECT", optionIds: chosen }
      ]
    });

    // The gap `US-PLT-F09-001` left open: a Multi Select could be declared but
    // never satisfied, because one Offering could hold one value per
    // definition. It can now hold several.
    const stored = offeringContentSchema.parse(edited.json()).attributes;
    expect(stored).toHaveLength(1);
    expect(stored[0]?.optionIds.slice().sort()).toEqual(chosen.slice().sort());
  });

  it("refuses a second allowed value for a Single Select", async () => {
    const business = await draft();
    const definition = await createAttribute({
      options: [
        { label: "Petrol", stableKey: "PETROL" },
        { label: "Diesel", stableKey: "DIESEL" }
      ],
      valueKind: "SINGLE_SELECT"
    });

    const edited = await edit(business, business.offeringId, {
      attributes: [
        {
          attributeId: definition.id,
          kind: "SELECT",
          optionIds: definition.options.map((o) => o.id)
        }
      ]
    });

    // The two Select kinds differ only in how many options one Offering may
    // hold, and that difference lives in the definition rather than the row.
    // The trigger would catch it as well, but the caller is told which value
    // was wrong instead of being handed a constraint failure.
    expect(edited.statusCode).toBe(422);
    expect(errorEnvelopeSchema.parse(edited.json()).code).toBe(
      "ATTRIBUTE_VALUE_MISMATCH"
    );
    const none = await pool.query<{ total: number }>(
      `select count(*)::int as total from offering_attribute_value
       where offering_id = $1`,
      [business.offeringId]
    );
    expect(none.rows[0]?.total).toBe(0);
  });

  it("refuses a value that does not match its Attribute kind", async () => {
    const business = await draft();
    const definition = await createAttribute({ valueKind: "NUMBER" });

    const edited = await edit(business, business.offeringId, {
      attributes: [
        { attributeId: definition.id, kind: "TEXT", text: "not a number" }
      ]
    });

    expect(edited.statusCode).toBe(422);
    expect(errorEnvelopeSchema.parse(edited.json()).code).toBe(
      "ATTRIBUTE_VALUE_MISMATCH"
    );
  });

  it("removes an Attribute value left out of the edit", async () => {
    const business = await draft();
    const definition = await createAttribute({ valueKind: "TEXT" });
    await edit(business, business.offeringId, {
      attributes: [
        { attributeId: definition.id, kind: "TEXT", text: "present" }
      ]
    });

    const cleared = await edit(business, business.offeringId, {
      attributes: []
    });

    // The submitted set replaces the stored one, as the Business Information
    // edit does — an omission is a removal, not an ambiguity.
    expect(offeringContentSchema.parse(cleared.json()).attributes).toEqual([]);
  });

  it("saves a Published edit that keeps the publication minimum", async () => {
    const business = await draft();
    await setLifecycle(business.offeringId, "PUBLISHED");

    const edited = await edit(business, business.offeringId, {
      title: "Still complete"
    });

    // AC-3.
    expect(edited.statusCode).toBe(200);
    expect(offeringContentSchema.parse(edited.json()).status).toBe("PUBLISHED");
  });

  it("saves a Hidden edit that keeps the publication minimum", async () => {
    const business = await draft();
    await setLifecycle(business.offeringId, "HIDDEN");

    const edited = await edit(business, business.offeringId, {
      title: "Still complete"
    });

    // AC-4. Hidden is not public, but it is still a Published Offering that an
    // Admin removed from circulation, so the same minimum applies.
    expect(edited.statusCode).toBe(200);
    expect(offeringContentSchema.parse(edited.json()).status).toBe("HIDDEN");
  });

  it("rejects a Published edit that drops a required Attribute value", async () => {
    // Its own Category. `US-PLT-F09-001` AC-7 refuses the required flag while
    // any Published Offering in an applicable Category lacks a value, so
    // sharing a Category with the other cases would refuse the setup instead
    // of the edit.
    const ownCategory = await leafCategory();
    const business = await draft(ownCategory);
    const definition = await createAttribute(
      { valueKind: "TEXT" },
      ownCategory
    );
    await edit(business, business.offeringId, {
      attributes: [{ attributeId: definition.id, kind: "TEXT", text: "held" }],
      categoryId: ownCategory
    });
    const required = await send(
      "PUT",
      `/admin/attributes/${definition.id}/required-for-publication`,
      { body: { requiredForPublication: true }, cookie: admin.cookie }
    );
    expect(required.statusCode).toBe(200);
    await setLifecycle(business.offeringId, "PUBLISHED");

    const edited = await edit(business, business.offeringId, {
      attributes: [],
      categoryId: ownCategory
    });

    // AC-5, and PRD-0001 §6.1.1's third condition. The same edit is fine on a
    // Draft: being incomplete is what makes a Draft a Draft.
    expect(edited.statusCode).toBe(422);
    expect(errorEnvelopeSchema.parse(edited.json()).code).toBe(
      "PUBLICATION_MINIMUM_NOT_SATISFIED"
    );
    const kept = await pool.query<{ total: number }>(
      `select count(*)::int as total from offering_attribute_value
       where offering_id = $1`,
      [business.offeringId]
    );
    expect(kept.rows[0]?.total).toBe(1);
  });

  it("rejects a Published edit onto a Category that is not an active leaf", async () => {
    const business = await draft();
    await setLifecycle(business.offeringId, "PUBLISHED");
    const branch = await send("POST", "/admin/categories", {
      body: {
        domain: "MOBILITY",
        name: "Branch",
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });
    const branchId = branch.json<{ id: string }>().id;
    await send("POST", "/admin/categories", {
      body: {
        name: "Leaf",
        parentId: branchId,
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });

    const edited = await edit(business, business.offeringId, {
      categoryId: branchId
    });

    // AC-5 again, on §6.1.1's second condition.
    expect(edited.statusCode).toBe(422);
    expect(
      errorEnvelopeSchema.parse(edited.json()).fieldErrors?.publicationMinimum
    ).toEqual(["CATEGORY_NOT_ACTIVE_LEAF"]);
  });

  it("preserves lifecycle and Initial Published At across an edit", async () => {
    const business = await draft();
    await setLifecycle(business.offeringId, "PUBLISHED");
    const before = await pool.query<{ publishedAt: Date }>(
      `select published_at as "publishedAt" from offering where id = $1`,
      [business.offeringId]
    );

    await edit(business, business.offeringId, { title: "Renamed" });

    // AC-6. The update statement cannot name `status` or `published_at`, so
    // this asserts the boundary the SQL enforces.
    const after = await pool.query<{ publishedAt: Date; status: string }>(
      `select status::text as status, published_at as "publishedAt"
       from offering where id = $1`,
      [business.offeringId]
    );
    expect(after.rows[0]?.status).toBe("PUBLISHED");
    expect(after.rows[0]?.publishedAt).toEqual(before.rows[0]?.publishedAt);
  });

  it("denies editing an Archived Offering", async () => {
    const business = await draft();
    await setLifecycle(business.offeringId, "ARCHIVED");

    const edited = await edit(business, business.offeringId, {
      title: "Too late"
    });

    // AC-7: Archived is historical. There is no edit that applies to it.
    expect(edited.statusCode).toBe(403);
    expect(errorEnvelopeSchema.parse(edited.json()).code).toBe(
      "OFFERING_ARCHIVED"
    );
  });

  it("keeps Draft management but denies Published editing for a Restricted Business", async () => {
    const business = await draft();
    const published = await send(
      "POST",
      `/businesses/${business.businessId}/offerings`,
      {
        body: { categoryId, slug: slug(), title: "Live" },
        cookie: business.cookie
      }
    );
    const publishedId = published.json<{ id: string }>().id;
    await setLifecycle(publishedId, "PUBLISHED");
    await pool.query(
      `update business_moderation_state set status = 'RESTRICTED'
       where business_id = $1`,
      [business.businessId]
    );

    const draftEdit = await edit(business, business.offeringId, {
      title: "Draft still mine"
    });
    const publishedEdit = await edit(business, publishedId, {
      title: "Not this one"
    });

    // AC-8 removes normal Published and Hidden editing; §5 keeps Draft
    // management. AC-9's correction path needs an Open correction case, which
    // nothing can create yet, so the refusal here is unconditional.
    expect(draftEdit.statusCode).toBe(200);
    expect(publishedEdit.statusCode).toBe(403);
    expect(errorEnvelopeSchema.parse(publishedEdit.json()).code).toBe(
      "BUSINESS_RESTRICTED"
    );
  });

  it("changes no lifecycle, publication or eligibility by saving an edit", async () => {
    const business = await draft();
    const before = await pool.query<{ evaluations: number; status: string }>(
      `select o.status::text as status,
         (select count(*)::int from offering_publication p
          where p.offering_id = o.id) as evaluations
       from offering o where o.id = $1`,
      [business.offeringId]
    );

    await edit(business, business.offeringId, { title: "Edited" });

    // AC-10. Nothing was created, published, retired, hidden, restored,
    // validated, enabled or disabled — the recorded eligibility was not even
    // re-evaluated, because neither of its inputs moved.
    const after = await pool.query<{
      evaluations: number;
      projected: number;
      status: string;
    }>(
      `select o.status::text as status,
         (select count(*)::int from offering_publication p
          where p.offering_id = o.id) as evaluations,
         (select count(*)::int from offering_search_projection s
          where s.offering_id = o.id) as projected
       from offering o where o.id = $1`,
      [business.offeringId]
    );
    expect(after.rows[0]).toEqual({ ...before.rows[0], projected: 0 });
  });

  it("hides another Business's Offering from editing", async () => {
    const business = await draft();
    const stranger = await owner();

    const edited = await send(
      "PUT",
      `/businesses/${business.businessId}/offerings/${business.offeringId}/content`,
      { body: editBody(), cookie: stranger.cookie }
    );

    expect(edited.statusCode).toBe(404);
  });

  it("refuses an edit from an unrecognised origin", async () => {
    const business = await draft();

    const edited = await app.inject({
      body: editBody(),
      headers: { cookie: business.cookie, origin: "https://attacker.example" },
      method: "PUT",
      url: `/api/v1/businesses/${business.businessId}/offerings/${business.offeringId}/content`
    });

    expect(edited.statusCode).toBe(403);
  });

  it("records the edit as audit evidence", async () => {
    const business = await draft();

    await edit(business, business.offeringId, { title: "Audited" });

    const audited = await pool.query<{ total: number }>(
      `select count(*)::int as total from audit_record
       where action = 'offering.content.edit' and target_id = $1
         and actor_user_id = $2 and result = 'ALLOWED'`,
      [business.offeringId, business.userId]
    );
    expect(audited.rows[0]?.total).toBe(1);
  });
});
