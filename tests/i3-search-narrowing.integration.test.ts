import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
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
 * `US-DSC-F04-001` Search Category Narrowing.
 *
 * The whole Story is that narrowing stays inside the Search. Selecting a
 * Category here is not the Browse gesture wearing a different hat: the query
 * survives, the route stays Search, and the Discovery Start that already exists
 * gains a Domain instead of a second Start being created beside it.
 */
suite("Increment I3 Search Category narrowing", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let mark: string;

  const address = () => `nrw-${randomUUID()}@example.test`;
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

  const category = async (
    name: string,
    parent?: { domain?: never; parentId: string } | { domain: string }
  ) => {
    const created = await send("POST", "/admin/categories", {
      body: {
        name,
        slug: slug(),
        stableKey: key(),
        ...(parent && "parentId" in parent
          ? { parentId: parent.parentId }
          : { domain: parent?.domain ?? "MOBILITY" })
      },
      cookie: admin.cookie
    });
    return created.json<{ id: string }>().id;
  };

  const publish = async (categoryId: string, title: string) => {
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
      body: { categoryId, slug: slug(), title },
      cookie: account.cookie
    });
    const offeringId = offering.json<{ id: string }>().id;
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/publication`,
      { cookie: account.cookie }
    );
    return offeringId;
  };

  const search = (body: Record<string, unknown>) =>
    send("POST", "/discovery/search", { body });

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
    mark = `zn${randomUUID().replaceAll("-", "").slice(0, 10)}`;
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

  /**
   * A query reaching two leaf Categories in two different Domains.
   *
   * Each call gets its own term. The cases assert the *exact* set of leaves a
   * query reaches, so sharing one term between them would make every case see
   * every other case's Categories — and the first case to run would pass while
   * the rest failed on ordering alone.
   */
  const spanning = async () => {
    const term = `${mark}${randomUUID().replaceAll("-", "").slice(0, 6)}`;
    const cars = await category(`Cars ${term}`, { domain: "MOBILITY" });
    const carsLeaf = await category(`Hatchbacks ${term}`, { parentId: cars });
    const flats = await category(`Homes ${term}`, { domain: "REAL_ESTATE" });
    const flatsLeaf = await category(`Flats ${term}`, { parentId: flats });
    const car = await publish(carsLeaf, `${term} listing one`);
    const flat = await publish(flatsLeaf, `${term} listing two`);
    return { car, carsLeaf, flat, flatsLeaf, term };
  };

  it("offers narrowing when the query reaches more than one leaf", async () => {
    const context = await spanning();

    const submitted = await search({ query: context.term });

    // AC-1.
    const view = searchViewSchema.parse(submitted.json());
    expect(view.narrowing.map((c) => c.id).sort()).toEqual(
      [context.carsLeaf, context.flatsLeaf].sort()
    );
    expect(view.results).toHaveLength(2);
  });

  it("offers no narrowing when the query reaches one leaf", async () => {
    const only = await category(`Only ${mark}`, { domain: "TECHNOLOGY" });
    await publish(only, `single${mark} listing`);

    const submitted = await search({ query: `single${mark}` });

    // AC-1 read the other way: narrowing is offered when there is something to
    // narrow between.
    expect(searchViewSchema.parse(submitted.json()).narrowing).toEqual([]);
  });

  it("retains the exact query and narrows the candidate set", async () => {
    const context = await spanning();

    const submitted = await search({
      categoryId: context.carsLeaf,
      query: `  ${context.term}  `
    });

    // AC-2 and AC-3.
    const view = searchViewSchema.parse(submitted.json());
    expect(view.query).toBe(context.term);
    expect(view.categoryId).toBe(context.carsLeaf);
    expect(view.results.map((r) => r.offeringId)).toEqual([context.car]);
  });

  it("keeps offering the alternatives it narrowed away from", async () => {
    const context = await spanning();

    const submitted = await search({
      categoryId: context.carsLeaf,
      query: context.term
    });

    // Computed from the unnarrowed set, so a person can change their mind
    // without starting again.
    expect(
      searchViewSchema
        .parse(submitted.json())
        .narrowing.map((c) => c.id)
        .sort()
    ).toEqual([context.carsLeaf, context.flatsLeaf].sort());
  });

  it("stays a Search and creates no Browse Start", async () => {
    const context = await spanning();
    const first = await search({ query: context.term });
    const pathId = searchViewSchema.parse(first.json()).discoveryPathId;

    await search({
      categoryId: context.carsLeaf,
      discoveryPathId: pathId,
      query: context.term
    });

    // AC-4. Selecting a Category here is not the Browse gesture: one Start,
    // still classified as Search.
    const recorded = await pool.query<{ kind: string }>(
      `select kind::text as kind from discovery_start where path_id = $1`,
      [pathId]
    );
    expect(recorded.rows).toEqual([{ kind: "SEARCH" }]);
  });

  it("gives the existing Search Start its Domain once one is available", async () => {
    const context = await spanning();
    const first = await search({ query: context.term });
    const pathId = searchViewSchema.parse(first.json()).discoveryPathId;
    const before = await pool.query<{ domainId: string | null }>(
      `select domain_id as "domainId" from discovery_start where path_id = $1`,
      [pathId]
    );

    const narrowed = await search({
      categoryId: context.flatsLeaf,
      discoveryPathId: pathId,
      query: context.term
    });

    // AC-5. PRD-0002 §5.10: a Search Start has no Domain until the criteria
    // include one selected active leaf Category. Then it has one.
    expect(before.rows[0]?.domainId).toBeNull();
    expect(searchViewSchema.parse(narrowed.json()).domain).toBe("REAL_ESTATE");
    const after = await pool.query<{ domain: string }>(
      `select d.stable_key as domain from discovery_start s
       join domain d on d.id = s.domain_id where s.path_id = $1`,
      [pathId]
    );
    expect(after.rows[0]?.domain).toBe("REAL_ESTATE");
  });

  it("keeps the Domain the Start first gained", async () => {
    const context = await spanning();
    const first = await search({ query: context.term });
    const pathId = searchViewSchema.parse(first.json()).discoveryPathId;
    await search({
      categoryId: context.carsLeaf,
      discoveryPathId: pathId,
      query: context.term
    });

    await search({
      categoryId: context.flatsLeaf,
      discoveryPathId: pathId,
      query: context.term
    });

    // The Start records where the looking began. Changing your mind later is a
    // narrowing, not a different beginning.
    const recorded = await pool.query<{ domain: string }>(
      `select d.stable_key as domain from discovery_start s
       join domain d on d.id = s.domain_id where s.path_id = $1`,
      [pathId]
    );
    expect(recorded.rows[0]?.domain).toBe("MOBILITY");
  });

  it("opens the Attribute Filter gate only on a leaf", async () => {
    const context = await spanning();

    const unnarrowed = await search({ query: context.term });
    const narrowed = await search({
      categoryId: context.carsLeaf,
      query: context.term
    });

    // AC-6. The gate, not the Filters — `US-DSC-F05-001` owns what it gates.
    expect(searchViewSchema.parse(unnarrowed.json()).filtersAvailable).toBe(
      false
    );
    expect(searchViewSchema.parse(narrowed.json()).filtersAvailable).toBe(true);
  });

  it("refuses to narrow to a branch or a retired Category", async () => {
    const branch = await category(`Branch ${mark}`, { domain: "MOBILITY" });
    const leaf = await category(`Leaf ${mark}`, { parentId: branch });
    await publish(leaf, `${mark} listing`);
    const doomed = await category(`Doomed ${mark}`, { domain: "MOBILITY" });
    await send("POST", `/admin/categories/${doomed}/retirement`, {
      cookie: admin.cookie
    });

    const toBranch = await search({ categoryId: branch, query: mark });
    const toRetired = await search({ categoryId: doomed, query: mark });

    // AC-3 narrows to an *active leaf*. Neither of these is one.
    expect(toBranch.statusCode).toBe(404);
    expect(toRetired.statusCode).toBe(404);
  });

  it("preserves the Search ordering mode across narrowing", async () => {
    const context = await spanning();

    const narrowed = await search({
      categoryId: context.carsLeaf,
      query: context.term
    });

    // AC-7. Narrowing does not turn a Search into a Browse: the results still
    // carry the match level that Best Match ordering consumes.
    const results = searchViewSchema.parse(narrowed.json()).results;
    expect(results.every((r) => r.matchLevel.length > 0)).toBe(true);
    expect(results[0]?.matchLevel).toBe("TITLE");
  });

  it("narrows without a path and starts one", async () => {
    const context = await spanning();

    const submitted = await search({
      categoryId: context.carsLeaf,
      query: context.term
    });

    // Narrowing on the first request is still a Search beginning, so the Start
    // exists and already carries the Domain.
    const pathId = searchViewSchema.parse(submitted.json()).discoveryPathId;
    const recorded = await pool.query<{ domain: string; kind: string }>(
      `select s.kind::text as kind, d.stable_key as domain
       from discovery_start s join domain d on d.id = s.domain_id
       where s.path_id = $1`,
      [pathId]
    );
    expect(recorded.rows[0]).toEqual({ domain: "MOBILITY", kind: "SEARCH" });
  });
});
