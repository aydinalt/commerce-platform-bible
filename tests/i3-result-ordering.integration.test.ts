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
 * `US-DSC-F07-001` Default Result Ordering.
 *
 * Two fixed orders and no way to change either. Search prioritises the kind of
 * relationship a result has to the query; Browse, where every result relates to
 * the Category equally, prioritises recency.
 *
 * AC-7 is the one that shapes the API rather than the SQL: there is no sort
 * parameter to send, so there is nothing to refuse.
 */
suite("Increment I3 Default result ordering", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };

  const address = () => `ord-${randomUUID()}@example.test`;
  const key = () => `K${randomUUID().replaceAll("-", "").toUpperCase()}`;
  const slug = () => `s-${randomUUID()}`;
  const token = () => `zo${randomUUID().replaceAll("-", "").slice(0, 8)}`;

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

  const publish = async (input: {
    attributes?: unknown[];
    businessName?: string;
    categoryId: string;
    publishedAt?: string;
    summary?: string;
    title: string;
  }) => {
    const account = await signUp();
    const business = await send("POST", "/businesses", {
      body: { name: input.businessName ?? "Ordinary Motors", slug: slug() },
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
          summary: input.summary ?? null,
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
    // Initial Published At is immutable through the product, so an ordering
    // case that needs a specific one sets it directly.
    if (input.publishedAt !== undefined) {
      await pool.query(`update offering set published_at = $2 where id = $1`, [
        offeringId,
        input.publishedAt
      ]);
      await pool.query(
        `update offering_search_projection set published_at = $2
         where offering_id = $1`,
        [offeringId, input.publishedAt]
      );
    }
    return offeringId;
  };

  const search = (body: Record<string, unknown>, cookie?: string) =>
    send("POST", "/discovery/search", {
      body,
      ...(cookie === undefined ? {} : { cookie })
    });

  const searchTitles = (response: { json: <T>() => T }) =>
    searchViewSchema.parse(response.json()).results.map((r) => r.title);

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

  it("orders Search by the four Best Match levels", async () => {
    const term = token();
    const root = await category("Root");
    // A Category path is shared by every Offering under it, so the one that is
    // meant to match by path needs a leaf of its own. Putting the term in a
    // shared ancestor would give every Offering a path relationship and hide
    // the three levels below it.
    // The term stands as its own word everywhere it is meant to match:
    // full-text matching compares whole tokens, so `Path${term}` would be one
    // token that the query never equals.
    const plain = await category("Plain", root);
    const named = await category(`Path ${term}`, root);
    // Deliberately published newest-first in the *wrong* order for the
    // expected result, so recency cannot accidentally produce it.
    await publish({
      categoryId: plain,
      publishedAt: "2026-01-04T00:00:00Z",
      summary: `Mentions ${term} in the description`,
      title: "By description"
    });
    await publish({
      businessName: `Business ${term} Motors`,
      categoryId: plain,
      publishedAt: "2026-01-03T00:00:00Z",
      title: "By business"
    });
    await publish({
      categoryId: named,
      publishedAt: "2026-01-02T00:00:00Z",
      title: "By category"
    });
    await publish({
      categoryId: plain,
      publishedAt: "2026-01-01T00:00:00Z",
      title: `By title ${term}`
    });

    const submitted = await search({ query: term });

    // AC-1. Every one of these matches, and the level decides — the oldest
    // Offering comes first because its relationship is the strongest.
    expect(searchTitles(submitted)).toEqual([
      `By title ${term}`,
      "By category",
      "By business",
      "By description"
    ]);
  });

  it("places the later Initial Published At first within one level", async () => {
    const term = token();
    const leaf = await category(`Only ${term}`);
    await publish({
      categoryId: leaf,
      publishedAt: "2026-02-01T00:00:00Z",
      title: `Older ${term}`
    });
    await publish({
      categoryId: leaf,
      publishedAt: "2026-02-03T00:00:00Z",
      title: `Newer ${term}`
    });
    await publish({
      categoryId: leaf,
      publishedAt: "2026-02-02T00:00:00Z",
      title: `Middle ${term}`
    });

    const submitted = await search({ query: term });

    // AC-2. All three relate by title, so recency decides among them.
    expect(searchTitles(submitted)).toEqual([
      `Newer ${term}`,
      `Middle ${term}`,
      `Older ${term}`
    ]);
  });

  it("breaks a remaining Search tie the same way every time", async () => {
    const term = token();
    const leaf = await category(`Tied ${term}`);
    const at = "2026-03-01T00:00:00Z";
    await publish({ categoryId: leaf, publishedAt: at, title: `One ${term}` });
    await publish({ categoryId: leaf, publishedAt: at, title: `Two ${term}` });
    await publish({
      categoryId: leaf,
      publishedAt: at,
      title: `Three ${term}`
    });

    const runs = await Promise.all([
      search({ query: term }),
      search({ query: term }),
      search({ query: term })
    ]);

    // AC-3. Same level, same instant: the order is not defined by the product,
    // but it must not wander between requests.
    const [first, ...rest] = runs.map(searchTitles);
    expect(first).toHaveLength(3);
    for (const run of rest) expect(run).toEqual(first);
  });

  it("orders Browse by later Initial Published At first", async () => {
    const term = token();
    const leaf = await category(`Browse ${term}`);
    await publish({
      categoryId: leaf,
      publishedAt: "2026-04-01T00:00:00Z",
      title: "Older"
    });
    await publish({
      categoryId: leaf,
      publishedAt: "2026-04-03T00:00:00Z",
      title: "Newer"
    });

    const view = await send("POST", `/discovery/browse/categories/${leaf}`, {
      body: {}
    });

    // AC-4. Every result relates to the Category equally, so there is no level
    // to prioritise by.
    expect(
      browseViewSchema.parse(view.json()).results?.map((r) => r.title)
    ).toEqual(["Newer", "Older"]);
  });

  it("breaks a remaining Browse tie the same way every time", async () => {
    const term = token();
    const leaf = await category(`BrowseTied ${term}`);
    const at = "2026-05-01T00:00:00Z";
    await publish({ categoryId: leaf, publishedAt: at, title: "A" });
    await publish({ categoryId: leaf, publishedAt: at, title: "B" });

    const runs = await Promise.all([
      send("POST", `/discovery/browse/categories/${leaf}`, { body: {} }),
      send("POST", `/discovery/browse/categories/${leaf}`, { body: {} })
    ]);

    // AC-5.
    const [first, second] = runs.map((r) =>
      browseViewSchema.parse(r.json()).results?.map((c) => c.title)
    );
    expect(first).toHaveLength(2);
    expect(second).toEqual(first);
  });

  it("keeps each ordering mode after a Filter is applied", async () => {
    const term = token();
    const leaf = await category(`Filtered ${term}`);
    const definition = await send("POST", "/admin/attributes", {
      body: {
        categoryIds: [leaf],
        comparable: false,
        filterable: true,
        name: "Mileage",
        stableKey: key(),
        valueKind: "NUMBER"
      },
      cookie: admin.cookie
    });
    const mileage = definition.json<{ id: string }>().id;
    const withMileage = (n: number) => [
      { attributeId: mileage, kind: "NUMBER", number: n }
    ];
    await publish({
      attributes: withMileage(100),
      categoryId: leaf,
      publishedAt: "2026-06-01T00:00:00Z",
      title: `Older ${term}`
    });
    await publish({
      attributes: withMileage(100),
      categoryId: leaf,
      publishedAt: "2026-06-03T00:00:00Z",
      title: `Newer ${term}`
    });
    await publish({
      attributes: withMileage(900),
      categoryId: leaf,
      publishedAt: "2026-06-02T00:00:00Z",
      title: `Excluded ${term}`
    });
    const filter = [{ attributeId: mileage, kind: "NUMBER", max: 200 }];

    const filteredSearch = await search({
      categoryId: leaf,
      filters: filter,
      query: term
    });
    const filteredBrowse = await send(
      "POST",
      `/discovery/browse/categories/${leaf}`,
      { body: { filters: filter } }
    );

    // AC-6, and PRD-0002 §12.4: Filters narrow the set without becoming a
    // third ordering mode.
    expect(searchTitles(filteredSearch)).toEqual([
      `Newer ${term}`,
      `Older ${term}`
    ]);
    expect(
      browseViewSchema.parse(filteredBrowse.json()).results?.map((r) => r.title)
    ).toEqual([`Newer ${term}`, `Older ${term}`]);
  });

  it("offers no way to ask for a different order", async () => {
    const term = token();
    const leaf = await category(`NoSort ${term}`);
    await publish({ categoryId: leaf, title: `${term} listing` });

    const sortedSearch = await search({ query: term, sort: "PRICE" });
    const sortedBrowse = await send(
      "POST",
      `/discovery/browse/categories/${leaf}`,
      { body: { sort: "PRICE" } }
    );

    // AC-7. The schemas are strict, so an unknown field is refused rather than
    // ignored — a caller is never told a sort was accepted when it was not.
    expect(sortedSearch.statusCode).toBe(400);
    expect(sortedBrowse.statusCode).toBe(400);
  });

  it("gives an owner and an Admin no ordering advantage", async () => {
    const term = token();
    const leaf = await category(`Roles ${term}`);
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
    for (const [index, title] of [
      `First ${term}`,
      `Second ${term}`
    ].entries()) {
      const offering = await send(
        "POST",
        `/businesses/${businessId}/offerings`,
        {
          body: { categoryId: leaf, slug: slug(), title },
          cookie: account.cookie
        }
      );
      const offeringId = offering.json<{ id: string }>().id;
      await send(
        "POST",
        `/businesses/${businessId}/offerings/${offeringId}/publication`,
        { cookie: account.cookie }
      );
      await pool.query(
        `update offering_search_projection set published_at = $2
         where offering_id = $1`,
        [offeringId, `2026-07-0${index + 1}T00:00:00Z`]
      );
    }
    await publish({
      categoryId: leaf,
      publishedAt: "2026-07-03T00:00:00Z",
      title: `Stranger ${term}`
    });

    const asGuest = await search({ query: term });
    const asOwner = await search({ query: term }, account.cookie);
    const asAdmin = await search({ query: term }, admin.cookie);

    // AC-7's last clause. Owning two of these results buys nothing, and
    // neither does being an Admin.
    expect(searchTitles(asOwner)).toEqual(searchTitles(asGuest));
    expect(searchTitles(asAdmin)).toEqual(searchTitles(asGuest));
    expect(searchTitles(asGuest)[0]).toBe(`Stranger ${term}`);
  });
});
