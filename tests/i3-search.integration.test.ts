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
import { searchViewSchema } from "../packages/contracts/src/index.js";

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
 * `US-DSC-F02-001` Search.
 *
 * The Story is mostly a boundary: five kinds of information Search may consider
 * and seven it may not. The exclusions hold because nothing outside the
 * Discovery projection is ever consulted — a telephone number is not filtered
 * out of matching, it was never in the set being matched.
 *
 * AC-7 asks for the highest applicable match level and no more. What ordering
 * does with it belongs to `US-DSC-F07-001`.
 */
suite("Increment I3 Search", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  /// A term unique to this suite, so its cases never match another's data.
  let mark: string;

  const address = () => `sch-${randomUUID()}@example.test`;
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

  /**
   * A publicly eligible Offering. Everything a Story lets Search see is
   * settable here, so each case can put its term in exactly one field.
   */
  const publish = async (input: {
    attributes?: { attributeId: string; kind: "SELECT"; optionIds: string[] }[];
    businessName?: string;
    categoryId: string;
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
    return { businessId, cookie: account.cookie, offeringId };
  };

  /** Searching as a Guest: no cookie. */
  const search = (query: string, cookie?: string) =>
    send("POST", "/discovery/search", {
      body: { query },
      ...(cookie === undefined ? {} : { cookie })
    });

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
    mark = `zx${randomUUID().replaceAll("-", "").slice(0, 10)}`;
  });

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    dispatcher.delivered.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("creates one Search Discovery Start with no Domain", async () => {
    const submitted = await search(`${mark} nothing matches this`);

    // AC-1, and PRD-0002 §5.10: a Search Start has no Domain until the criteria
    // include one selected active leaf Category, which `US-DSC-F04-001` owns.
    const pathId = searchViewSchema.parse(submitted.json()).discoveryPathId;
    const recorded = await pool.query<{
      domainId: string | null;
      kind: string;
    }>(
      `select kind::text as kind, domain_id as "domainId"
       from discovery_start where path_id = $1`,
      [pathId]
    );
    expect(recorded.rows[0]).toEqual({ domainId: null, kind: "SEARCH" });
  });

  it("refuses an empty query as an invalid submission", async () => {
    const submitted = await send("POST", "/discovery/search", {
      body: { query: "   " }
    });

    // AC-1 speaks of a *valid non-empty* query. Nothing was submitted, so
    // nothing started.
    expect(submitted.statusCode).toBe(400);
  });

  it("spans several leaf Categories with no Category selected", async () => {
    const root = await category(`Root ${mark}`);
    const first = await category("First", root);
    const second = await category("Second", root);
    await publish({ categoryId: first, title: `${mark} hatchback` });
    await publish({ categoryId: second, title: `${mark} apartment` });

    const submitted = await search(mark);

    // AC-2. Search begins without a Category and is not confined to one.
    const results = searchViewSchema.parse(submitted.json()).results;
    expect(results).toHaveLength(2);
    expect(new Set(results.map((r) => r.categoryName))).toEqual(
      new Set(["First", "Second"])
    );
  });

  it("matches each approved kind of information and levels it", async () => {
    const root = await category(`Vehicles ${mark}`);
    const leaf = await category(`Estate${mark}`, root);
    const byTitle = await publish({
      categoryId: leaf,
      title: `Title${mark} listing`
    });
    const byBusiness = await publish({
      businessName: `Business${mark} Motors`,
      categoryId: leaf,
      title: "Ordinary listing"
    });
    const bySummary = await publish({
      categoryId: leaf,
      summary: `A summary mentioning Summary${mark}`,
      title: "Ordinary listing"
    });

    const levels = await Promise.all([
      search(`Title${mark}`),
      search(`Estate${mark}`),
      search(`Business${mark}`),
      search(`Summary${mark}`)
    ]);

    // AC-3 and AC-7. The four relationships PRD-0002 §12.2 names, each found
    // and each attributed to the field it came from.
    const view = (index: number) =>
      searchViewSchema.parse(levels[index]?.json());
    expect(view(0).results[0]).toMatchObject({
      matchLevel: "TITLE",
      offeringId: byTitle.offeringId
    });
    expect(view(1).results.map((r) => r.matchLevel)).toEqual([
      "CATEGORY_PATH",
      "CATEGORY_PATH",
      "CATEGORY_PATH"
    ]);
    expect(view(2).results[0]).toMatchObject({
      matchLevel: "BUSINESS_NAME",
      offeringId: byBusiness.offeringId
    });
    expect(view(3).results[0]).toMatchObject({
      matchLevel: "DESCRIPTION_OR_ATTRIBUTE",
      offeringId: bySummary.offeringId
    });
  });

  it("matches an Attribute by the label a person reads", async () => {
    const root = await category(`Fuels ${mark}`);
    const leaf = await category("Cars", root);
    const definition = await send("POST", "/admin/attributes", {
      body: {
        categoryIds: [leaf],
        comparable: false,
        filterable: false,
        name: "Fuel",
        options: [{ label: `Petrol${mark}`, stableKey: "PETROL" }],
        stableKey: key(),
        valueKind: "SINGLE_SELECT"
      },
      cookie: admin.cookie
    });
    const attribute = definition.json<{
      id: string;
      options: { id: string }[];
    }>();
    const listed = await publish({
      attributes: [
        {
          attributeId: attribute.id,
          kind: "SELECT",
          optionIds: [attribute.options[0]?.id ?? ""]
        }
      ],
      categoryId: leaf,
      title: "Ordinary listing"
    });

    const submitted = await search(`Petrol${mark}`);

    // AC-3's last clause: the *display* value, not the identifier the
    // projection keeps for filtering.
    expect(searchViewSchema.parse(submitted.json()).results[0]).toMatchObject({
      matchLevel: "DESCRIPTION_OR_ATTRIBUTE",
      offeringId: listed.offeringId
    });
  });

  it("prefers the highest applicable level when several apply", async () => {
    const root = await category(`Both ${mark}`);
    const leaf = await category(`Shared${mark}`, root);
    await publish({
      businessName: `Shared${mark} Motors`,
      categoryId: leaf,
      title: `Shared${mark} listing`
    });

    const submitted = await search(`Shared${mark}`);

    // AC-7. Title, Category path and Business name all relate; the highest is
    // reported.
    expect(
      searchViewSchema.parse(submitted.json()).results[0]?.matchLevel
    ).toBe("TITLE");
  });

  it("excludes protected contact and Affiliate information from matching", async () => {
    const root = await category(`Hidden ${mark}`);
    const leaf = await category("Cars", root);
    const listed = await publish({ categoryId: leaf, title: "Ordinary" });
    await send("PUT", `/businesses/${listed.businessId}/information`, {
      body: {
        contactEmail: `phone${mark}@example.test`,
        contactTelephone: `+90 216 ${mark}`,
        contactUrl: `https://contact${mark}.example`,
        name: "Ordinary Motors"
      },
      cookie: listed.cookie
    });
    await send(
      "POST",
      `/businesses/${listed.businessId}/offerings/${listed.offeringId}/affiliate-destination`,
      {
        body: { reference: `https://affiliate${mark}.example` },
        cookie: listed.cookie
      }
    );

    const attempts = await Promise.all([
      search(`phone${mark}`),
      search(`contact${mark}`),
      search(`affiliate${mark}`)
    ]);

    // AC-4. Not filtered out of matching — never in the set being matched.
    for (const attempt of attempts)
      expect(searchViewSchema.parse(attempt.json()).results).toEqual([]);
  });

  it("excludes Draft, Hidden and Archived Offerings", async () => {
    const root = await category(`States ${mark}`);
    const leaf = await category("Cars", root);
    const draftOnly = await publish({
      categoryId: leaf,
      title: `Draft${mark} listing`
    });
    await pool.query(
      `delete from offering_search_projection where offering_id = $1`,
      [draftOnly.offeringId]
    );
    await pool.query(
      `update offering set status = 'DRAFT', published_at = null where id = $1`,
      [draftOnly.offeringId]
    );
    const retired = await publish({
      categoryId: leaf,
      title: `Archived${mark} listing`
    });
    await send(
      "POST",
      `/businesses/${retired.businessId}/offerings/${retired.offeringId}/retirement`,
      { cookie: retired.cookie }
    );

    const attempts = await Promise.all([
      search(`Draft${mark}`),
      search(`Archived${mark}`)
    ]);

    // AC-4's "historical records" and "ineligible Offerings". Both are absent
    // from the projection, which is the only thing Search reads.
    for (const attempt of attempts)
      expect(searchViewSchema.parse(attempt.json()).results).toEqual([]);
  });

  it("excludes an Offering that matches none of the searchable information", async () => {
    const root = await category(`Silent ${mark}`);
    const leaf = await category("Cars", root);
    await publish({ categoryId: leaf, title: "Ordinary listing" });

    const submitted = await search(`absent${mark}`);

    // AC-5.
    expect(searchViewSchema.parse(submitted.json()).results).toEqual([]);
  });

  it("requires every term to relate to something", async () => {
    const root = await category(`Terms ${mark}`);
    const leaf = await category("Cars", root);
    await publish({ categoryId: leaf, title: `Alpha${mark} listing` });

    const both = await search(`Alpha${mark} Beta${mark}`);
    const one = await search(`Alpha${mark}`);

    // A relationship to half a query is not a meaningful relationship to it.
    expect(searchViewSchema.parse(both.json()).results).toEqual([]);
    expect(searchViewSchema.parse(one.json()).results).toHaveLength(1);
  });

  it("retains the exact query as visible criteria", async () => {
    const submitted = await search(`  Kadıköy  ${mark}  `);

    // AC-6. Trimmed at the edge, but never rewritten: the person sees what
    // they asked for.
    expect(searchViewSchema.parse(submitted.json()).query).toBe(
      `Kadıköy  ${mark}`
    );
  });

  it("answers a punctuation-only query with no results rather than an error", async () => {
    const submitted = await search("!!! ??? ...");

    // A valid submission whose terms all fall away reaches no searchable
    // information, so AC-5 excludes everything. It matched nothing; it was not
    // a bad request.
    expect(submitted.statusCode).toBe(200);
    expect(searchViewSchema.parse(submitted.json()).results).toEqual([]);
  });

  it("behaves identically with and without a session", async () => {
    const root = await category(`Roles ${mark}`);
    const leaf = await category("Cars", root);
    const listed = await publish({
      categoryId: leaf,
      title: `Role${mark} listing`
    });
    const account = await signUp();

    const asGuest = await search(`Role${mark}`);
    const asUser = await search(`Role${mark}`, account.cookie);
    const asOwner = await search(`Role${mark}`, listed.cookie);
    const asAdmin = await search(`Role${mark}`, admin.cookie);

    // AC-8. The owner and the Admin see exactly what a stranger sees, because
    // Search never asks who is asking.
    const ids = (response: typeof asGuest) =>
      searchViewSchema.parse(response.json()).results.map((r) => r.offeringId);
    expect(ids(asGuest)).toEqual([listed.offeringId]);
    expect(ids(asUser)).toEqual(ids(asGuest));
    expect(ids(asOwner)).toEqual(ids(asGuest));
    expect(ids(asAdmin)).toEqual(ids(asGuest));
  });

  it("carries no protected information on a Search result", async () => {
    const root = await category(`Cards ${mark}`);
    const leaf = await category("Cars", root);
    const listed = await publish({
      categoryId: leaf,
      title: `Card${mark} listing`
    });
    await send("PUT", `/businesses/${listed.businessId}/information`, {
      body: {
        contactEmail: "sales@example.test",
        contactTelephone: "+90 216 000 00 00",
        name: "Ordinary Motors"
      },
      cookie: listed.cookie
    });

    const submitted = await search(`Card${mark}`);

    // The Listing Card minimum applies to Search results too — plus the match
    // level, which is the only thing this Story adds to it.
    const card = searchViewSchema.parse(submitted.json()).results[0];
    expect(Object.keys(card ?? {}).sort()).toEqual([
      "businessName",
      "categoryName",
      "matchLevel",
      "offeringId",
      "publishedAt",
      "slug",
      "title"
    ]);
  });
});
