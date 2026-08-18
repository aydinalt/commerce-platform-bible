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
  searchViewSchema,
  ZERO_RESULT_RECOVERIES
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
 * `US-DSC-F08-001` Zero Results Recovery.
 *
 * The Story is about what happens when the honest answer is "nothing". Two
 * things must survive it: the criteria the person chose, and a bounded set of
 * ways out. Everything else — Recommendations, sponsored alternatives, an
 * ineligible Offering shown "so the page is not empty" — is forbidden, and the
 * closed recovery list is what makes that checkable.
 */
suite("Increment I3 Zero Results", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };

  const address = () => `zro-${randomUUID()}@example.test`;
  const key = () => `K${randomUUID().replaceAll("-", "").toUpperCase()}`;
  const slug = () => `s-${randomUUID()}`;
  const token = () => `zz${randomUUID().replaceAll("-", "").slice(0, 8)}`;

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

  const numberAttribute = async (categoryId: string, name: string) => {
    const created = await send("POST", "/admin/attributes", {
      body: {
        categoryIds: [categoryId],
        comparable: false,
        filterable: true,
        name,
        stableKey: key(),
        valueKind: "NUMBER"
      },
      cookie: admin.cookie
    });
    return created.json<{ id: string }>().id;
  };

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

  const search = (body: Record<string, unknown>) =>
    send("POST", "/discovery/search", { body });

  const browse = (categoryId: string, filters: unknown[] = []) =>
    send("POST", `/discovery/browse/categories/${categoryId}`, {
      body: { filters }
    });

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

  it("states Zero Results when a Search matches nothing", async () => {
    const term = token();

    const submitted = await search({ query: term });

    // AC-1. Empty results and an explicit Zero Results state — the difference
    // between "nothing matched" and "we forgot to answer".
    const view = searchViewSchema.parse(submitted.json());
    expect(view.results).toEqual([]);
    expect(view.zeroResults).not.toBeNull();
  });

  it("says nothing about Zero Results when something matched", async () => {
    const term = token();
    const leaf = await category(`Found ${term}`);
    await publish({ categoryId: leaf, title: `${term} listing` });

    const submitted = await search({ query: term });

    expect(searchViewSchema.parse(submitted.json()).zeroResults).toBeNull();
  });

  it("preserves the query, the Category and every Filter", async () => {
    const term = token();
    const leaf = await category(`Empty ${term}`);
    const mileage = await numberAttribute(leaf, "Mileage");
    const serviced = await send("POST", "/admin/attributes", {
      body: {
        categoryIds: [leaf],
        comparable: false,
        filterable: true,
        name: "Serviced",
        stableKey: key(),
        valueKind: "BOOLEAN"
      },
      cookie: admin.cookie
    });
    const servicedId = serviced.json<{ id: string }>().id;
    await publish({
      attributes: [{ attributeId: mileage, kind: "NUMBER", number: 900 }],
      categoryId: leaf,
      title: `${term} listing`
    });

    const submitted = await search({
      categoryId: leaf,
      filters: [
        { attributeId: mileage, kind: "NUMBER", max: 200, min: 100 },
        { attributeId: servicedId, kind: "BOOLEAN", value: true }
      ],
      query: term
    });

    // AC-2. Everything the person chose comes back, structured rather than
    // phrased — PRD-0002 §13 leaves the copy to UX.
    const zero = searchViewSchema.parse(submitted.json()).zeroResults;
    expect(zero?.criteria.query).toBe(term);
    expect(zero?.criteria.categoryName).toBe(`Empty ${term}`);
    expect(zero?.criteria.filters).toEqual([
      {
        attributeId: mileage,
        kind: "NUMBER",
        max: 200,
        min: 100,
        name: "Mileage",
        optionLabels: [],
        value: null
      },
      {
        attributeId: servicedId,
        kind: "BOOLEAN",
        max: null,
        min: null,
        name: "Serviced",
        optionLabels: [],
        value: true
      }
    ]);
  });

  it("names the chosen allowed values rather than their identifiers", async () => {
    const term = token();
    const leaf = await category(`Select ${term}`);
    const definition = await send("POST", "/admin/attributes", {
      body: {
        categoryIds: [leaf],
        comparable: false,
        filterable: true,
        name: "Fuel",
        options: [
          { label: "Petrol", stableKey: "PETROL" },
          { label: "Diesel", stableKey: "DIESEL" }
        ],
        stableKey: key(),
        valueKind: "SINGLE_SELECT"
      },
      cookie: admin.cookie
    });
    const fuel = definition.json<{
      id: string;
      options: { id: string }[];
    }>();
    await publish({ categoryId: leaf, title: `${term} listing` });

    const submitted = await search({
      categoryId: leaf,
      filters: [
        {
          attributeId: fuel.id,
          kind: "SELECT",
          optionIds: fuel.options.map((o) => o.id)
        }
      ],
      query: term
    });

    // AC-2. A person recognises "Petrol", not a UUID.
    expect(
      searchViewSchema.parse(submitted.json()).zeroResults?.criteria.filters[0]
        ?.optionLabels
    ).toEqual(["Petrol", "Diesel"]);
  });

  it("offers removing one Filter only when more than one is applied", async () => {
    const term = token();
    const leaf = await category(`Filters ${term}`);
    const first = await numberAttribute(leaf, "First");
    const second = await numberAttribute(leaf, "Second");
    await publish({ categoryId: leaf, title: `${term} listing` });

    const one = await search({
      categoryId: leaf,
      filters: [{ attributeId: first, kind: "NUMBER", max: 10 }],
      query: term
    });
    const two = await search({
      categoryId: leaf,
      filters: [
        { attributeId: first, kind: "NUMBER", max: 10 },
        { attributeId: second, kind: "NUMBER", max: 10 }
      ],
      query: term
    });

    // AC-3. With one Filter applied, removing it and clearing them all are the
    // same act, so only one of the two is offered.
    const recovery = (response: typeof one) =>
      searchViewSchema.parse(response.json()).zeroResults?.recovery ?? [];
    expect(recovery(one)).toContain("CLEAR_FILTERS");
    expect(recovery(one)).not.toContain("REMOVE_FILTER");
    expect(recovery(two)).toContain("REMOVE_FILTER");
    expect(recovery(two)).toContain("CLEAR_FILTERS");
  });

  it("offers changing or clearing the query only in a Search", async () => {
    const term = token();
    const leaf = await category(`Query ${term}`);

    const searched = await search({ query: term });
    const browsed = await browse(leaf);

    // AC-4. A Browse has no query, so offering to clear one would be offering
    // something that does not exist.
    const searchRecovery =
      searchViewSchema.parse(searched.json()).zeroResults?.recovery ?? [];
    const browseRecovery =
      browseViewSchema.parse(browsed.json()).zeroResults?.recovery ?? [];
    expect(searchRecovery).toContain("CHANGE_QUERY");
    expect(searchRecovery).toContain("CLEAR_QUERY");
    expect(browseRecovery).not.toContain("CHANGE_QUERY");
    expect(browseRecovery).not.toContain("CLEAR_QUERY");
  });

  it("offers a parent Category only when there is one", async () => {
    const term = token();
    const root = await category(`Root ${term}`);
    const leaf = await category(`Leaf ${term}`, root);
    const lonely = await category(`Lonely ${term}`);

    const underParent = await browse(leaf);
    const atRoot = await browse(lonely);

    // AC-5, and its boundary: a root leaf has nowhere above it.
    expect(
      browseViewSchema.parse(underParent.json()).zeroResults?.recovery
    ).toContain("MOVE_TO_PARENT_CATEGORY");
    expect(
      browseViewSchema.parse(atRoot.json()).zeroResults?.recovery
    ).not.toContain("MOVE_TO_PARENT_CATEGORY");
  });

  it("always offers another Category and the Homepage", async () => {
    const term = token();
    const leaf = await category(`Always ${term}`);

    const browsed = await browse(leaf);
    const searched = await search({ query: term });

    // AC-5 and AC-6. These two always apply, which is what stops the recovery
    // list from ever being empty — a dead end is not a recovery.
    for (const response of [browsed, searched]) {
      const recovery =
        (response === browsed
          ? browseViewSchema.parse(response.json()).zeroResults
          : searchViewSchema.parse(response.json()).zeroResults
        )?.recovery ?? [];
      expect(recovery).toContain("CHOOSE_ANOTHER_CATEGORY");
      expect(recovery).toContain("RETURN_TO_HOMEPAGE");
    }
  });

  it("removes no criterion and switches no mode", async () => {
    const term = token();
    const leaf = await category(`Kept ${term}`);
    const mileage = await numberAttribute(leaf, "Mileage");
    await publish({ categoryId: leaf, title: `${term} listing` });

    const submitted = await search({
      categoryId: leaf,
      filters: [{ attributeId: mileage, kind: "NUMBER", max: 10 }],
      query: term
    });

    // AC-7. Finding nothing is not a licence to widen the question: the query,
    // the Category and the Filter are all still in force, and the response is
    // still a Search.
    const view = searchViewSchema.parse(submitted.json());
    expect(view.query).toBe(term);
    expect(view.categoryId).toBe(leaf);
    expect(view.zeroResults?.criteria.filters).toHaveLength(1);
    expect(view.filtersAvailable).toBe(true);
    const started = await pool.query<{ kind: string }>(
      `select kind::text as kind from discovery_start where path_id = $1`,
      [view.discoveryPathId]
    );
    expect(started.rows[0]?.kind).toBe("SEARCH");
  });

  it("invents nothing beyond the bounded recovery set", async () => {
    const term = token();
    const leaf = await category(`Bounded ${term}`);
    const mileage = await numberAttribute(leaf, "Mileage");
    // A published Offering the Filter excludes, and a Draft that is not public
    // at all — neither may be offered as a consolation.
    await publish({
      attributes: [{ attributeId: mileage, kind: "NUMBER", number: 900 }],
      categoryId: leaf,
      title: `${term} excluded`
    });

    const submitted = await search({
      categoryId: leaf,
      filters: [{ attributeId: mileage, kind: "NUMBER", max: 10 }],
      query: term
    });

    // AC-8. No Recommendations, no sponsored alternatives, no ineligible
    // Offering shown to fill the space — the response has no field that could
    // carry one, and every recovery action comes from the closed list.
    const view = searchViewSchema.parse(submitted.json());
    expect(view.results).toEqual([]);
    expect(
      view.zeroResults?.recovery.every((action) =>
        ZERO_RESULT_RECOVERIES.includes(action)
      )
    ).toBe(true);
    expect(JSON.stringify(view)).not.toContain("excluded");
  });

  it("states Zero Results for a query that reaches no searchable information", async () => {
    const submitted = await search({ query: "!!! ??? ..." });

    // A valid submission whose terms all fall away matched nothing, so it is a
    // Zero Results state rather than a silent empty page.
    const view = searchViewSchema.parse(submitted.json());
    expect(view.zeroResults?.criteria.query).toBe("!!! ??? ...");
    expect(view.zeroResults?.recovery).toContain("CHANGE_QUERY");
  });

  it("withholds Zero Results on a branch rather than claiming emptiness", async () => {
    const term = token();
    const root = await category(`Branch ${term}`);
    const leaf = await category(`Leaf ${term}`, root);
    await publish({ categoryId: leaf, title: `${term} listing` });

    const view = await browse(root);

    // A branch withheld Results rather than found none, so there was no
    // question to answer and nothing to recover from.
    const browsed = browseViewSchema.parse(view.json());
    expect(browsed.results).toBeNull();
    expect(browsed.zeroResults).toBeNull();
  });
});
