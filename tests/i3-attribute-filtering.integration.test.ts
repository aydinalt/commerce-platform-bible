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
  browseViewSchema,
  errorEnvelopeSchema,
  searchViewSchema
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
 * `US-DSC-F05-001` Attribute Filtering.
 *
 * PRD-0002 §10.2 gives each value kind its own rule and §10.3 gives two
 * combination rules, so the cases below are mostly one per rule. The one that
 * ties them together is AC-9: an Offering with no value for an applied Filter
 * fails it. Without that, a missing value would compare as unknown and quietly
 * fall out of the question being asked.
 *
 * Filtering applies to Browse as well as Search — PRD-0002 §12.4 speaks of a
 * filtered Browse, and §10.1's condition is an active leaf Category, which is
 * Browse's ordinary state.
 */
suite("Increment I3 Attribute filtering", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };

  const address = () => `flt-${randomUUID()}@example.test`;
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

  const category = async (name: string, parentId?: string) => {
    const created = await send("POST", "/admin/categories", {
      body: {
        name,
        slug: slug(),
        stableKey: key(),
        ...(parentId === undefined ? { domain: "MOBILITY" } : { parentId })
      },
      cookie: admin.cookie
    });
    return created.json<{ id: string }>().id;
  };

  const attribute = async (input: {
    categoryId: string;
    filterable?: boolean;
    options?: { label: string; stableKey: string }[];
    valueKind: string;
  }) => {
    const created = await send("POST", "/admin/attributes", {
      body: {
        categoryIds: [input.categoryId],
        comparable: false,
        filterable: input.filterable ?? true,
        name: `Attribute ${randomUUID().slice(0, 8)}`,
        options: input.options ?? [],
        stableKey: key(),
        valueKind: input.valueKind
      },
      cookie: admin.cookie
    });
    return created.json<{
      id: string;
      options: { id: string; label: string }[];
    }>();
  };

  /** A publicly eligible Offering holding the given Attribute values. */
  const publish = async (input: {
    attributes?: unknown[];
    categoryId: string;
    title: string;
  }) => {
    const account = await signUp();
    const business = await send("POST", "/businesses", {
      body: { name: "Ordinary Motors", slug: slug() },
      cookie: account.cookie
    });
    const businessId = business.json<{ id: string }>().id;
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });
    const offering = await send("POST", `/businesses/${businessId}/offerings`, {
      body: { categoryId: input.categoryId, slug: slug(), title: input.title },
      cookie: account.cookie
    });
    const offeringId = offering.json<{ id: string }>().id;
    await send(
      "PUT",
      `/businesses/${businessId}/offerings/${offeringId}/content`,
      {
        body: {
          attributes: input.attributes ?? [],
          categoryId: input.categoryId,
          title: input.title
        },
        cookie: account.cookie
      }
    );
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/publication`,
      { cookie: account.cookie }
    );
    return offeringId;
  };

  const browse = (categoryId: string, filters: unknown[] = []) =>
    send("POST", `/discovery/browse/categories/${categoryId}`, {
      body: { filters }
    });

  const titles = (response: { json: <T>() => T }) =>
    browseViewSchema
      .parse(response.json())
      .results?.map((r) => r.title)
      .sort();

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
  });

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    dispatcher.delivered.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("offers a Filter only for an applicable filterable Attribute", async () => {
    const leaf = await category("Cars");
    const offered = await attribute({ categoryId: leaf, valueKind: "NUMBER" });
    const notFilterable = await attribute({
      categoryId: leaf,
      filterable: false,
      valueKind: "NUMBER"
    });
    const elsewhere = await attribute({
      categoryId: await category("Elsewhere"),
      valueKind: "BOOLEAN"
    });

    const view = await browse(leaf);

    // AC-1. Three conditions, and each of the other two Attributes fails one.
    const ids = browseViewSchema
      .parse(view.json())
      .filters.map((f) => f.attributeId);
    expect(ids).toContain(offered.id);
    expect(ids).not.toContain(notFilterable.id);
    expect(ids).not.toContain(elsewhere.id);
  });

  it("never offers a Text Attribute", async () => {
    const leaf = await category("Cars");
    const text = await attribute({
      categoryId: leaf,
      filterable: false,
      valueKind: "TEXT"
    });

    const view = await browse(leaf);

    // AC-2, twice over: `US-PLT-F09-001` refuses to mark a Text definition
    // filterable, so it cannot reach this list even if someone tried.
    expect(
      browseViewSchema.parse(view.json()).filters.map((f) => f.attributeId)
    ).not.toContain(text.id);
    const refused = await send("POST", "/admin/attributes", {
      body: {
        categoryIds: [leaf],
        comparable: false,
        filterable: true,
        name: "Filterable text",
        stableKey: key(),
        valueKind: "TEXT"
      },
      cookie: admin.cookie
    });
    expect(refused.statusCode).toBe(422);
  });

  it("offers no Filters on a branch", async () => {
    const branch = await category("Vehicles");
    const leaf = await category("Cars", branch);
    await attribute({ categoryId: leaf, valueKind: "NUMBER" });

    const view = await browse(branch);

    // AC-1's first condition. A branch has no selected leaf Category, so there
    // is nothing for a Filter to apply within.
    expect(browseViewSchema.parse(view.json()).filters).toEqual([]);
  });

  it("applies inclusive Number bounds and rejects a missing value", async () => {
    const leaf = await category("Cars");
    const mileage = await attribute({ categoryId: leaf, valueKind: "NUMBER" });
    const value = (n: number) => [
      { attributeId: mileage.id, kind: "NUMBER", number: n }
    ];
    await publish({ attributes: value(100), categoryId: leaf, title: "Low" });
    await publish({ attributes: value(200), categoryId: leaf, title: "Mid" });
    await publish({ attributes: value(300), categoryId: leaf, title: "High" });
    await publish({ categoryId: leaf, title: "Unstated" });

    const bounded = await browse(leaf, [
      { attributeId: mileage.id, kind: "NUMBER", max: 200, min: 100 }
    ]);
    const lowerOnly = await browse(leaf, [
      { attributeId: mileage.id, kind: "NUMBER", min: 200 }
    ]);

    // AC-3. Both bounds inclusive, and "Unstated" is in neither answer — AC-9.
    expect(titles(bounded)).toEqual(["Low", "Mid"]);
    expect(titles(lowerOnly)).toEqual(["High", "Mid"]);
  });

  it("matches Boolean exactly and rejects a missing value", async () => {
    const leaf = await category("Cars");
    const serviced = await attribute({
      categoryId: leaf,
      valueKind: "BOOLEAN"
    });
    const value = (b: boolean) => [
      { attributeId: serviced.id, boolean: b, kind: "BOOLEAN" }
    ];
    await publish({ attributes: value(true), categoryId: leaf, title: "Yes" });
    await publish({ attributes: value(false), categoryId: leaf, title: "No" });
    await publish({ categoryId: leaf, title: "Unstated" });

    const isTrue = await browse(leaf, [
      { attributeId: serviced.id, kind: "BOOLEAN", value: true }
    ]);
    const isFalse = await browse(leaf, [
      { attributeId: serviced.id, kind: "BOOLEAN", value: false }
    ]);

    // AC-4 and AC-9. "Unstated" is not a false; it is an absence.
    expect(titles(isTrue)).toEqual(["Yes"]);
    expect(titles(isFalse)).toEqual(["No"]);
  });

  it("combines values within one Single Select using OR", async () => {
    const leaf = await category("Cars");
    const fuel = await attribute({
      categoryId: leaf,
      options: [
        { label: "Petrol", stableKey: "PETROL" },
        { label: "Diesel", stableKey: "DIESEL" },
        { label: "Electric", stableKey: "ELECTRIC" }
      ],
      valueKind: "SINGLE_SELECT"
    });
    const option = (index: number) => fuel.options[index]?.id ?? "";
    const value = (index: number) => [
      { attributeId: fuel.id, kind: "SELECT", optionIds: [option(index)] }
    ];
    await publish({ attributes: value(0), categoryId: leaf, title: "Petrol" });
    await publish({ attributes: value(1), categoryId: leaf, title: "Diesel" });
    await publish({
      attributes: value(2),
      categoryId: leaf,
      title: "Electric"
    });

    const either = await browse(leaf, [
      {
        attributeId: fuel.id,
        kind: "SELECT",
        optionIds: [option(0), option(1)]
      }
    ]);

    // AC-5.
    expect(titles(either)).toEqual(["Diesel", "Petrol"]);
  });

  it("matches a Multi Select on any intersection", async () => {
    const leaf = await category("Cars");
    const extras = await attribute({
      categoryId: leaf,
      options: [
        { label: "Sunroof", stableKey: "SUNROOF" },
        { label: "Towbar", stableKey: "TOWBAR" },
        { label: "Winter tyres", stableKey: "WINTER" }
      ],
      valueKind: "MULTI_SELECT"
    });
    const option = (index: number) => extras.options[index]?.id ?? "";
    await publish({
      attributes: [
        {
          attributeId: extras.id,
          kind: "SELECT",
          optionIds: [option(0), option(1)]
        }
      ],
      categoryId: leaf,
      title: "Sunroof and towbar"
    });
    await publish({
      attributes: [
        { attributeId: extras.id, kind: "SELECT", optionIds: [option(2)] }
      ],
      categoryId: leaf,
      title: "Winter tyres"
    });

    const intersecting = await browse(leaf, [
      { attributeId: extras.id, kind: "SELECT", optionIds: [option(1)] }
    ]);

    // AC-6. One shared value is enough; the Offering need not hold only that.
    expect(titles(intersecting)).toEqual(["Sunroof and towbar"]);
  });

  it("combines different Filters using AND", async () => {
    const leaf = await category("Cars");
    const mileage = await attribute({ categoryId: leaf, valueKind: "NUMBER" });
    const serviced = await attribute({
      categoryId: leaf,
      valueKind: "BOOLEAN"
    });
    const both = (n: number, b: boolean) => [
      { attributeId: mileage.id, kind: "NUMBER", number: n },
      { attributeId: serviced.id, boolean: b, kind: "BOOLEAN" }
    ];
    await publish({
      attributes: both(100, true),
      categoryId: leaf,
      title: "Both"
    });
    await publish({
      attributes: both(100, false),
      categoryId: leaf,
      title: "Wrong boolean"
    });
    await publish({
      attributes: both(900, true),
      categoryId: leaf,
      title: "Wrong number"
    });

    const conjoined = await browse(leaf, [
      { attributeId: mileage.id, kind: "NUMBER", max: 200 },
      { attributeId: serviced.id, kind: "BOOLEAN", value: true }
    ]);

    // AC-7. Satisfying one Filter is not satisfying the set.
    expect(titles(conjoined)).toEqual(["Both"]);
  });

  it("narrows on applying a Filter and expands on removing it", async () => {
    const leaf = await category("Cars");
    const mileage = await attribute({ categoryId: leaf, valueKind: "NUMBER" });
    await publish({
      attributes: [{ attributeId: mileage.id, kind: "NUMBER", number: 100 }],
      categoryId: leaf,
      title: "Low"
    });
    await publish({
      attributes: [{ attributeId: mileage.id, kind: "NUMBER", number: 900 }],
      categoryId: leaf,
      title: "High"
    });

    const unfiltered = await browse(leaf);
    const filtered = await browse(leaf, [
      { attributeId: mileage.id, kind: "NUMBER", max: 200 }
    ]);
    const cleared = await browse(leaf);

    // AC-10, AC-11 and AC-12: clearing the Filters leaves the Category exactly
    // where it was.
    expect(titles(unfiltered)).toEqual(["High", "Low"]);
    expect(titles(filtered)).toEqual(["Low"]);
    expect(titles(cleared)).toEqual(["High", "Low"]);
  });

  it("combines the Search match, the Category and the Filters", async () => {
    const mark = `zf${randomUUID().replaceAll("-", "").slice(0, 8)}`;
    const first = await category(`First ${mark}`);
    const second = await category(`Second ${mark}`);
    const mileage = await attribute({ categoryId: first, valueKind: "NUMBER" });
    await publish({
      attributes: [{ attributeId: mileage.id, kind: "NUMBER", number: 100 }],
      categoryId: first,
      title: `${mark} wanted`
    });
    await publish({
      attributes: [{ attributeId: mileage.id, kind: "NUMBER", number: 900 }],
      categoryId: first,
      title: `${mark} too many miles`
    });
    await publish({ categoryId: second, title: `${mark} wrong category` });

    const combined = await send("POST", "/discovery/search", {
      body: {
        categoryId: first,
        filters: [{ attributeId: mileage.id, kind: "NUMBER", max: 200 }],
        query: mark
      }
    });

    // AC-8. Three criteria, one conjunction.
    expect(
      searchViewSchema.parse(combined.json()).results.map((r) => r.title)
    ).toEqual([`${mark} wanted`]);
  });

  it("keeps the query and the Category when Filters are cleared", async () => {
    const mark = `zc${randomUUID().replaceAll("-", "").slice(0, 8)}`;
    const leaf = await category(`Only ${mark}`);
    const mileage = await attribute({ categoryId: leaf, valueKind: "NUMBER" });
    await publish({
      attributes: [{ attributeId: mileage.id, kind: "NUMBER", number: 900 }],
      categoryId: leaf,
      title: `${mark} listing`
    });

    const filtered = await send("POST", "/discovery/search", {
      body: {
        categoryId: leaf,
        filters: [{ attributeId: mileage.id, kind: "NUMBER", max: 200 }],
        query: mark
      }
    });
    const cleared = await send("POST", "/discovery/search", {
      body: { categoryId: leaf, query: mark }
    });

    // AC-12. Removing the Filters removes only the Filters.
    expect(searchViewSchema.parse(filtered.json()).results).toEqual([]);
    const view = searchViewSchema.parse(cleared.json());
    expect(view.query).toBe(mark);
    expect(view.categoryId).toBe(leaf);
    expect(view.results).toHaveLength(1);
  });

  it("refuses a Filter applied outside an active leaf Category", async () => {
    const branch = await category("Vehicles");
    const leaf = await category("Cars", branch);
    const mileage = await attribute({ categoryId: leaf, valueKind: "NUMBER" });
    const mark = `zo${randomUUID().replaceAll("-", "").slice(0, 8)}`;
    await publish({ categoryId: leaf, title: `${mark} listing` });

    const onBranch = await browse(branch, [
      { attributeId: mileage.id, kind: "NUMBER", max: 200 }
    ]);
    const withoutCategory = await send("POST", "/discovery/search", {
      body: {
        filters: [{ attributeId: mileage.id, kind: "NUMBER", max: 200 }],
        query: mark
      }
    });

    // AC-1. Refused rather than ignored: PRD-0002 forbids Discovery from
    // silently removing criteria, and a dropped Filter would answer a
    // different question.
    expect(onBranch.statusCode).toBe(422);
    expect(withoutCategory.statusCode).toBe(422);
    expect(errorEnvelopeSchema.parse(onBranch.json()).code).toBe(
      "FILTER_CONTEXT_MISSING"
    );
  });

  it("refuses a Filter that is not offered here", async () => {
    const leaf = await category("Cars");
    const elsewhere = await attribute({
      categoryId: await category("Elsewhere"),
      valueKind: "NUMBER"
    });
    const notFilterable = await attribute({
      categoryId: leaf,
      filterable: false,
      valueKind: "NUMBER"
    });

    const foreign = await browse(leaf, [
      { attributeId: elsewhere.id, kind: "NUMBER", max: 200 }
    ]);
    const unfilterable = await browse(leaf, [
      { attributeId: notFilterable.id, kind: "NUMBER", max: 200 }
    ]);

    expect(foreign.statusCode).toBe(422);
    expect(unfilterable.statusCode).toBe(422);
    expect(errorEnvelopeSchema.parse(foreign.json()).code).toBe(
      "FILTER_NOT_AVAILABLE"
    );
  });

  it("refuses a Filter whose kind contradicts its Attribute", async () => {
    const leaf = await category("Cars");
    const mileage = await attribute({ categoryId: leaf, valueKind: "NUMBER" });

    const mismatched = await browse(leaf, [
      { attributeId: mileage.id, kind: "BOOLEAN", value: true }
    ]);

    // A Boolean question about a Number Attribute has no answer, so it is not
    // given one.
    expect(mismatched.statusCode).toBe(422);
  });

  it("offers the allowed values a Select Filter can use", async () => {
    const leaf = await category("Cars");
    const fuel = await attribute({
      categoryId: leaf,
      options: [
        { label: "Petrol", stableKey: "PETROL" },
        { label: "Diesel", stableKey: "DIESEL" }
      ],
      valueKind: "SINGLE_SELECT"
    });
    await send(
      "POST",
      `/admin/attributes/${fuel.id}/options/${fuel.options[1]?.id}/retirement`,
      { cookie: admin.cookie }
    );

    const view = await browse(leaf);

    // A retired allowed value stays readable as history (`US-PLT-F09-001`
    // AC-11) but is not something a person may newly choose.
    const offered = browseViewSchema
      .parse(view.json())
      .filters.find((f) => f.attributeId === fuel.id);
    expect(offered?.options.map((o) => o.label)).toEqual(["Petrol"]);
  });
});
