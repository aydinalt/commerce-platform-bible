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
  attributeSchema,
  attributesSchema,
  errorEnvelopeSchema
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
 * `US-PLT-F09-001` Attribute Definition Management.
 *
 * The Story is one promise stated eight ways: an edit to a definition never
 * silently reinterprets or discards a value an Offering already holds. So most
 * of these cases set up a dependency first and then prove the edit is refused —
 * and, just as importantly, that the same edit is allowed once the dependency
 * is only history.
 *
 * Offering values are PRD-0001's to write (AC-14) and no Story has given them a
 * write path yet, so the cases that need one insert it directly. That is the
 * same seam every earlier suite used for Categories before `US-PLT-F08-001`.
 */
suite("Increment I2 Attribute definitions", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };

  const address = () => `att-${randomUUID()}@example.test`;
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

  /** An Offering in a given lifecycle state, holding a value for a definition.
   * PRD-0001 owns this write path and has not built it yet (AC-14). */
  const offeringWithValue = async (input: {
    attributeId: string;
    categoryId: string;
    optionId?: string;
    status: "DRAFT" | "PUBLISHED" | "HIDDEN" | "ARCHIVED";
  }) => {
    const business = await pool.query<{ id: string }>(
      `insert into business (slug, name, status) values ($1,'Holder','ACTIVE')
       returning id`,
      [slug()]
    );
    const businessId = business.rows[0]?.id;
    const timestamps =
      input.status === "DRAFT"
        ? "null, null"
        : input.status === "ARCHIVED"
          ? "null, now()"
          : "now(), null";
    const offering = await pool.query<{ id: string }>(
      `insert into offering
         (business_id, category_id, slug, title, status, published_at, archived_at)
       values ($1,$2,$3,'Holder',$4::"OfferingStatus",${timestamps})
       returning id`,
      [businessId, input.categoryId, slug(), input.status]
    );
    const offeringId = offering.rows[0]?.id;
    await pool.query(
      input.optionId === undefined
        ? `insert into offering_attribute_value
             (offering_id, attribute_definition_id, text_value)
           values ($1,$2,'held')`
        : `insert into offering_attribute_value
             (offering_id, attribute_definition_id, option_id)
           values ($1,$2,$3)`,
      input.optionId === undefined
        ? [offeringId, input.attributeId]
        : [offeringId, input.attributeId, input.optionId]
    );
    return offeringId;
  };

  const createAttribute = async (body: Record<string, unknown>) =>
    send("POST", "/admin/attributes", {
      body: {
        categoryIds: [],
        comparable: false,
        filterable: false,
        name: "Attribute",
        stableKey: key(),
        valueKind: "TEXT",
        ...body
      },
      cookie: admin.cookie
    });

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

  it("creates a definition with the complete property set", async () => {
    const categoryId = await leafCategory();

    const created = await createAttribute({
      categoryIds: [categoryId],
      comparable: true,
      name: "Mileage",
      unit: "km",
      valueKind: "NUMBER"
    });

    // AC-1 and AC-3.
    expect(created.statusCode).toBe(201);
    expect(attributeSchema.parse(created.json())).toMatchObject({
      categoryIds: [categoryId],
      comparable: true,
      filterable: false,
      name: "Mileage",
      requiredForPublication: false,
      unit: "km",
      valueKind: "NUMBER"
    });
  });

  it("supports exactly the five V1 value kinds", async () => {
    const kinds = await pool.query<{ kind: string }>(
      `select unnest(enum_range(null::"AttributeValueKind"))::text as kind`
    );

    // AC-2.
    expect(kinds.rows.map((r) => r.kind).sort()).toEqual(
      ["BOOLEAN", "MULTI_SELECT", "NUMBER", "SINGLE_SELECT", "TEXT"].sort()
    );
    const rejected = await createAttribute({ valueKind: "DATE" });
    expect(rejected.statusCode).toBe(400);
  });

  it("keeps the unit with Number", async () => {
    const withUnit = await createAttribute({
      unit: "km",
      valueKind: "TEXT"
    });

    // AC-3: a unit means nothing on the other kinds, so they cannot carry one.
    expect(withUnit.statusCode).toBe(422);
    expect(errorEnvelopeSchema.parse(withUnit.json()).code).toBe(
      "ATTRIBUTE_SHAPE_INVALID"
    );
  });

  it("requires a Select kind to have an allowed value", async () => {
    const empty = await createAttribute({
      valueKind: "SINGLE_SELECT"
    });
    const supplied = await createAttribute({
      options: [{ label: "Petrol", stableKey: "PETROL" }],
      valueKind: "MULTI_SELECT"
    });

    // AC-4: refused before anything is written, so no definition ever exists
    // in the state the Story forbids — not even for an instant.
    expect(empty.statusCode).toBe(422);
    expect(attributeSchema.parse(supplied.json()).options).toHaveLength(1);
  });

  it("prevents Text from being filterable", async () => {
    const created = await createAttribute({
      filterable: true,
      valueKind: "TEXT"
    });

    // AC-5.
    expect(created.statusCode).toBe(422);
    expect(errorEnvelopeSchema.parse(created.json()).code).toBe(
      "ATTRIBUTE_SHAPE_INVALID"
    );
  });

  it("adds applicability freely", async () => {
    const first = await leafCategory();
    const second = await leafCategory();
    const created = await createAttribute({ categoryIds: [first] });
    const attributeId = created.json<{ id: string }>().id;

    const widened = await send(
      "PUT",
      `/admin/attributes/${attributeId}/categories`,
      { body: { categoryIds: [first, second] }, cookie: admin.cookie }
    );

    // AC-6: an addition takes nothing away, so nothing guards it.
    expect(attributeSchema.parse(widened.json()).categoryIds.sort()).toEqual(
      [first, second].sort()
    );
  });

  it("blocks removing applicability that an Offering relies on", async () => {
    const categoryId = await leafCategory();
    const created = await createAttribute({ categoryIds: [categoryId] });
    const attributeId = created.json<{ id: string }>().id;
    await offeringWithValue({ attributeId, categoryId, status: "DRAFT" });

    const narrowed = await send(
      "PUT",
      `/admin/attributes/${attributeId}/categories`,
      { body: { categoryIds: [] }, cookie: admin.cookie }
    );

    // AC-8: Draft counts. The value exists whether or not anyone can see it.
    expect(narrowed.statusCode).toBe(409);
    expect(errorEnvelopeSchema.parse(narrowed.json()).code).toBe(
      "ATTRIBUTE_MUTATION_BLOCKED"
    );
  });

  it("allows removing applicability once only Archived history remains", async () => {
    const categoryId = await leafCategory();
    const created = await createAttribute({ categoryIds: [categoryId] });
    const attributeId = created.json<{ id: string }>().id;
    await offeringWithValue({ attributeId, categoryId, status: "ARCHIVED" });

    const narrowed = await send(
      "PUT",
      `/admin/attributes/${attributeId}/categories`,
      { body: { categoryIds: [] }, cookie: admin.cookie }
    );

    // AC-11 and AC-12: the history is readable and untouched, and it does not
    // hold the definition hostage.
    expect(narrowed.statusCode).toBe(200);
    const kept = await pool.query<{ total: number }>(
      `select count(*)::int as total from offering_attribute_value
       where attribute_definition_id = $1`,
      [attributeId]
    );
    expect(kept.rows[0]?.total).toBe(1);
  });

  it("blocks a value-kind change while a value exists", async () => {
    const categoryId = await leafCategory();
    const created = await createAttribute({ categoryIds: [categoryId] });
    const attributeId = created.json<{ id: string }>().id;
    await offeringWithValue({ attributeId, categoryId, status: "PUBLISHED" });

    const changed = await send(
      "PUT",
      `/admin/attributes/${attributeId}/value-kind`,
      { body: { valueKind: "NUMBER" }, cookie: admin.cookie }
    );

    // AC-9: reading a stored Text as a Number is exactly the silent
    // reinterpretation AC-12 forbids.
    expect(changed.statusCode).toBe(409);
    const unchanged = await send("GET", "/admin/attributes", {
      cookie: admin.cookie
    });
    expect(
      attributesSchema
        .parse(unchanged.json())
        .attributes.find((a) => a.id === attributeId)?.valueKind
    ).toBe("TEXT");
  });

  it("allows a value-kind change while nothing depends on it", async () => {
    const created = await createAttribute({});
    const attributeId = created.json<{ id: string }>().id;

    const changed = await send(
      "PUT",
      `/admin/attributes/${attributeId}/value-kind`,
      { body: { valueKind: "BOOLEAN" }, cookie: admin.cookie }
    );

    expect(attributeSchema.parse(changed.json()).valueKind).toBe("BOOLEAN");
  });

  it("blocks relabelling and retiring an allowed value in use", async () => {
    const categoryId = await leafCategory();
    const created = await createAttribute({
      categoryIds: [categoryId],
      options: [
        { label: "Petrol", stableKey: "PETROL" },
        { label: "Diesel", stableKey: "DIESEL" }
      ],
      valueKind: "SINGLE_SELECT"
    });
    const definition = attributeSchema.parse(created.json());
    const optionId = definition.options[0]?.id;
    await offeringWithValue({
      attributeId: definition.id,
      categoryId,
      optionId,
      status: "HIDDEN"
    });

    const relabelled = await send(
      "PUT",
      `/admin/attributes/${definition.id}/options/${optionId}/label`,
      { body: { label: "Gasoline" }, cookie: admin.cookie }
    );
    const retired = await send(
      "POST",
      `/admin/attributes/${definition.id}/options/${optionId}/retirement`,
      { cookie: admin.cookie }
    );

    // AC-10 covers both. Renaming a value in use changes what an existing
    // Offering appears to say, which is the same harm as removing it.
    expect(relabelled.statusCode).toBe(409);
    expect(retired.statusCode).toBe(409);
  });

  it("retires an unused allowed value while keeping it readable", async () => {
    const created = await createAttribute({
      options: [
        { label: "Petrol", stableKey: "PETROL" },
        { label: "Diesel", stableKey: "DIESEL" }
      ],
      valueKind: "SINGLE_SELECT"
    });
    const definition = attributeSchema.parse(created.json());
    const optionId = definition.options[1]?.id;

    const retired = await send(
      "POST",
      `/admin/attributes/${definition.id}/options/${optionId}/retirement`,
      { cookie: admin.cookie }
    );

    // AC-11 and AC-15: retired, not deleted — it is still in the response.
    const after = attributeSchema.parse(retired.json());
    expect(after.options).toHaveLength(2);
    expect(after.options.find((o) => o.id === optionId)?.active).toBe(false);
  });

  it("refuses to retire the last allowed value of a Select", async () => {
    const created = await createAttribute({
      options: [{ label: "Only", stableKey: "ONLY" }],
      valueKind: "SINGLE_SELECT"
    });
    const definition = attributeSchema.parse(created.json());

    const retired = await send(
      "POST",
      `/admin/attributes/${definition.id}/options/${definition.options[0]?.id}/retirement`,
      { cookie: admin.cookie }
    );

    // AC-4 holds for the life of the definition, not only at creation.
    expect(retired.statusCode).toBe(422);
    expect(errorEnvelopeSchema.parse(retired.json()).code).toBe(
      "ATTRIBUTE_OPTIONS_EXHAUSTED"
    );
  });

  it("allows required-for-publication only when every live Offering has a value", async () => {
    const categoryId = await leafCategory();
    const created = await createAttribute({ categoryIds: [categoryId] });
    const attributeId = created.json<{ id: string }>().id;
    const other = await createAttribute({ categoryIds: [categoryId] });
    await offeringWithValue({
      attributeId: other.json<{ id: string }>().id,
      categoryId,
      status: "PUBLISHED"
    });

    const refused = await send(
      "PUT",
      `/admin/attributes/${attributeId}/required-for-publication`,
      { body: { requiredForPublication: true }, cookie: admin.cookie }
    );

    // AC-7: the Published Offering exists and has no value for this
    // definition, so the flag would make it retroactively invalid.
    expect(refused.statusCode).toBe(409);
    expect(errorEnvelopeSchema.parse(refused.json()).code).toBe(
      "ATTRIBUTE_MUTATION_BLOCKED"
    );

    await offeringWithValue({ attributeId, categoryId, status: "PUBLISHED" });
    await pool.query(
      `delete from offering_attribute_value v
       using offering o
       where v.offering_id = o.id and o.category_id = $1
         and v.attribute_definition_id <> $2`,
      [categoryId, attributeId]
    );
    await pool.query(
      `delete from offering o where o.category_id = $1
       and not exists (select 1 from offering_attribute_value v
                       where v.offering_id = o.id
                         and v.attribute_definition_id = $2)`,
      [categoryId, attributeId]
    );

    const accepted = await send(
      "PUT",
      `/admin/attributes/${attributeId}/required-for-publication`,
      { body: { requiredForPublication: true }, cookie: admin.cookie }
    );
    expect(attributeSchema.parse(accepted.json()).requiredForPublication).toBe(
      true
    );
  });

  it("never blocks turning required-for-publication off", async () => {
    const created = await createAttribute({});
    const attributeId = created.json<{ id: string }>().id;

    const cleared = await send(
      "PUT",
      `/admin/attributes/${attributeId}/required-for-publication`,
      { body: { requiredForPublication: false }, cookie: admin.cookie }
    );

    // Turning it off promises nothing about existing Offerings, so there is
    // nothing for AC-7 to protect.
    expect(cleared.statusCode).toBe(200);
  });

  it("changes filterable and comparable without touching an Offering", async () => {
    const categoryId = await leafCategory();
    const created = await createAttribute({
      categoryIds: [categoryId],
      valueKind: "NUMBER"
    });
    const attributeId = created.json<{ id: string }>().id;
    const offeringId = await offeringWithValue({
      attributeId,
      categoryId,
      status: "PUBLISHED"
    });

    const updated = await send(
      "PUT",
      `/admin/attributes/${attributeId}/properties`,
      {
        body: {
          comparable: true,
          filterable: true,
          name: "Renamed",
          unit: "km"
        },
        cookie: admin.cookie
      }
    );

    // AC-13: presentation changes, lifecycle does not. And AC-12: the value
    // the Offering held is still there.
    expect(attributeSchema.parse(updated.json())).toMatchObject({
      comparable: true,
      filterable: true,
      name: "Renamed"
    });
    const offering = await pool.query<{ status: string; total: number }>(
      `select o.status::text as status,
         (select count(*)::int from offering_attribute_value v
          where v.offering_id = o.id) as total
       from offering o where o.id = $1`,
      [offeringId]
    );
    expect(offering.rows[0]).toEqual({ status: "PUBLISHED", total: 1 });
  });

  it("claims no change when a save fails", async () => {
    const created = await createAttribute({ name: "Original" });
    const attributeId = created.json<{ id: string }>().id;

    const refused = await send(
      "PUT",
      `/admin/attributes/${attributeId}/properties`,
      {
        body: {
          comparable: false,
          filterable: true,
          name: "Renamed",
          unit: null
        },
        cookie: admin.cookie
      }
    );

    // AC-16: the request tried to change the name *and* set filterable on a
    // Text definition. The whole save is refused, so the name did not move.
    expect(refused.statusCode).toBe(422);
    const after = await send("GET", "/admin/attributes", {
      cookie: admin.cookie
    });
    expect(
      attributesSchema
        .parse(after.json())
        .attributes.find((a) => a.id === attributeId)?.name
    ).toBe("Original");
  });

  it("offers no way to delete a definition", async () => {
    const created = await createAttribute({});
    const attributeId = created.json<{ id: string }>().id;

    const deleted = await app.inject({
      headers: { cookie: admin.cookie, origin: ORIGIN },
      method: "DELETE",
      url: `/api/v1/admin/attributes/${attributeId}`
    });

    // AC-15: deletion, merge, replacement and migration are absent, not
    // refused.
    expect(deleted.statusCode).toBe(404);
    const survives = await pool.query<{ total: number }>(
      `select count(*)::int as total from attribute_definition where id = $1`,
      [attributeId]
    );
    expect(survives.rows[0]?.total).toBe(1);
  });

  it("refuses management outside an entered Admin context", async () => {
    const account = await signUp();

    const asUser = await send("GET", "/admin/attributes", {
      cookie: account.cookie
    });
    const asGuest = await send("GET", "/admin/attributes");

    expect(asUser.statusCode).toBe(403);
    expect(asGuest.statusCode).toBe(401);
  });

  it("records every definition action as audit evidence", async () => {
    const created = await createAttribute({});
    const attributeId = created.json<{ id: string }>().id;
    await send("PUT", `/admin/attributes/${attributeId}/value-kind`, {
      body: { valueKind: "BOOLEAN" },
      cookie: admin.cookie
    });

    const audited = await pool.query<{ action: string }>(
      `select action from audit_record
       where target_id = $1 and target_type = 'AttributeDefinition'
         and result = 'ALLOWED'
       order by action`,
      [attributeId]
    );
    expect(audited.rows.map((r) => r.action)).toEqual([
      "attribute.create",
      "attribute.value-kind.change"
    ]);
  });
});
