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
  categoriesSchema,
  categorySchema,
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
 * `US-PLT-F08-001` Category and Domain Management.
 *
 * Categories could previously exist only by direct SQL, which is why every
 * earlier suite seeds them that way. This is the step that makes the catalog
 * something a person maintains.
 *
 * Most of what this Story asks for is negative — a hierarchy that cannot become
 * invalid, a Domain that cannot move, a Category that cannot be deleted — so
 * most of these cases assert a refusal. Where the refusal comes from a database
 * constraint, the test drives it through the API anyway: what matters is that
 * the person on the other end gets a named reason rather than a server error.
 */
suite("Increment I2 Category management", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };

  const address = () => `cat-${randomUUID()}@example.test`;
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
      email,
      userId: confirmed.json<{ userId: string }>().userId
    };
  };

  /** Authorization is provisioned operationally, so it is granted here the way
   * an operator would grant it (`US-IDN-F08-001` AC-3). */
  const signUpAdmin = async () => {
    const account = await signUp();
    await pool.query(
      `insert into admin_authorization (user_id, granted_by) values ($1,'test')`,
      [account.userId]
    );
    await send("PUT", "/auth/me/admin-context", { cookie: account.cookie });
    return account;
  };

  const root = async (domain: string) => {
    const created = await send("POST", "/admin/categories", {
      body: { domain, name: "Root", slug: slug(), stableKey: key() },
      cookie: admin.cookie
    });
    return created.json<{ id: string }>().id;
  };

  const child = async (parentId: string) => {
    const created = await send("POST", "/admin/categories", {
      body: { name: "Child", parentId, slug: slug(), stableKey: key() },
      cookie: admin.cookie
    });
    return created.json<{ id: string }>().id;
  };

  /** A Business that may author Offerings, so assignment cases exercise the
   * Category rule rather than an authorization one. */
  const authoringBusiness = async () => {
    const owner = await signUp();
    const created = await send("POST", "/businesses", {
      body: { name: "Author", slug: slug() },
      cookie: owner.cookie
    });
    const businessId = created.json<{ id: string }>().id;
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: owner.cookie
    });
    return { businessId, cookie: owner.cookie };
  };

  beforeAll(async () => {
    process.env.ENABLE_TEST_PRINCIPAL = "false";
    process.env.NODE_ENV = "test";
    const { createApiApp } = await import("../apps/api/src/bootstrap.js");
    app = await createApiApp({ logLevel: "fatal" });
    processor = new OutboxProcessor({ dispatcher, publicWebUrl: ORIGIN });
    admin = await signUpAdmin();
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

  it("seeds exactly the three V1 Domains", async () => {
    const domains = await pool.query<{ stableKey: string }>(
      `select stable_key as "stableKey" from domain order by stable_key`
    );

    // AC-1: a root Category may name one of these and nothing else.
    expect(domains.rows.map((d) => d.stableKey)).toEqual([
      "MOBILITY",
      "REAL_ESTATE",
      "TECHNOLOGY"
    ]);
  });

  it("creates a root under one V1 Domain", async () => {
    const created = await send("POST", "/admin/categories", {
      body: {
        domain: "MOBILITY",
        name: "Cars",
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });

    // AC-1 and AC-6.
    expect(created.statusCode).toBe(201);
    expect(categorySchema.parse(created.json())).toMatchObject({
      active: true,
      domain: "MOBILITY",
      name: "Cars",
      parentId: null
    });
  });

  it("refuses a root outside the three V1 Domains", async () => {
    const created = await send("POST", "/admin/categories", {
      body: {
        domain: "AGRICULTURE",
        name: "Tractors",
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });

    // AC-1: the set is closed, so a fourth Domain is not a missing row — it is
    // not a Domain at all.
    expect(created.statusCode).toBe(400);
  });

  it("refuses a Category that is both a root and a child", async () => {
    const parentId = await root("MOBILITY");

    const created = await send("POST", "/admin/categories", {
      body: {
        domain: "TECHNOLOGY",
        name: "Confused",
        parentId,
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });

    // AC-6 and AC-7 together: naming a Domain and a parent would claim a Domain
    // that must instead be inherited.
    expect(created.statusCode).toBe(400);
  });

  it("makes a child inherit its parent's Domain", async () => {
    const parentId = await root("REAL_ESTATE");

    const created = await send("POST", "/admin/categories", {
      body: { name: "Flats", parentId, slug: slug(), stableKey: key() },
      cookie: admin.cookie
    });

    // AC-2 and AC-7: the child names no Domain and receives the root's.
    expect(created.statusCode).toBe(201);
    expect(categorySchema.parse(created.json())).toMatchObject({
      domain: "REAL_ESTATE",
      parentId
    });
  });

  it("preserves identity across a rename", async () => {
    const categoryId = await root("TECHNOLOGY");
    const before = await send("GET", "/admin/categories", {
      cookie: admin.cookie
    });
    const original = categoriesSchema
      .parse(before.json())
      .categories.find((c) => c.id === categoryId);

    const renamed = await send("PUT", `/admin/categories/${categoryId}/name`, {
      body: { name: "Laptops" },
      cookie: admin.cookie
    });

    // AC-3: the display name is the only thing that moved.
    expect(categorySchema.parse(renamed.json())).toEqual({
      ...original,
      name: "Laptops"
    });
  });

  it("reparents within the same Domain", async () => {
    const first = await root("MOBILITY");
    const second = await root("MOBILITY");
    const moving = await child(first);

    const moved = await send("PUT", `/admin/categories/${moving}/parent`, {
      body: { parentId: second },
      cookie: admin.cookie
    });
    const promoted = await send("PUT", `/admin/categories/${moving}/parent`, {
      body: { parentId: null },
      cookie: admin.cookie
    });

    // AC-4: the hierarchy changes and the Domain does not.
    expect(moved.json<{ parentId: string }>().parentId).toBe(second);
    expect(categorySchema.parse(promoted.json())).toMatchObject({
      domain: "MOBILITY",
      parentId: null
    });
  });

  it("refuses a parent in another Domain", async () => {
    const mobility = await root("MOBILITY");
    const technology = await root("TECHNOLOGY");
    const moving = await child(mobility);

    const moved = await send("PUT", `/admin/categories/${moving}/parent`, {
      body: { parentId: technology },
      cookie: admin.cookie
    });

    // AC-10, and with it AC-15: there is no cross-Domain migration to perform.
    expect(moved.statusCode).toBe(409);
    expect(errorEnvelopeSchema.parse(moved.json()).code).toBe(
      "CATEGORY_DOMAIN_MISMATCH"
    );
  });

  it("refuses a Category as its own parent", async () => {
    const categoryId = await root("MOBILITY");

    const moved = await send("PUT", `/admin/categories/${categoryId}/parent`, {
      body: { parentId: categoryId },
      cookie: admin.cookie
    });

    // AC-5, the shortest possible cycle.
    expect(moved.statusCode).toBe(409);
    expect(errorEnvelopeSchema.parse(moved.json()).code).toBe(
      "CATEGORY_ANCESTRY_CYCLE"
    );
  });

  it("refuses a parent from inside its own subtree", async () => {
    const rootId = await root("MOBILITY");
    const childId = await child(rootId);
    const grandChildId = await child(childId);

    const moved = await send("PUT", `/admin/categories/${rootId}/parent`, {
      body: { parentId: grandChildId },
      cookie: admin.cookie
    });

    // AC-5 again, at the depth no single-row constraint could see.
    expect(moved.statusCode).toBe(409);
    expect(errorEnvelopeSchema.parse(moved.json()).code).toBe(
      "CATEGORY_ANCESTRY_CYCLE"
    );
  });

  it("keeps a used root's Domain fixed", async () => {
    const rootId = await root("MOBILITY");
    await child(rootId);
    const technology = await pool.query<{ id: string }>(
      `select id from domain where stable_key = 'TECHNOLOGY'`
    );

    // AC-11. No endpoint accepts a Domain for an existing Category, so this
    // reaches past the API to prove the datamodel refuses it too.
    await expect(
      pool.query(`update category set domain_id = $2 where id = $1`, [
        rootId,
        technology.rows[0]?.id
      ])
    ).rejects.toThrow();
  });

  it("assigns an Offering only to an active leaf", async () => {
    const rootId = await root("MOBILITY");
    const leafId = await child(rootId);
    const business = await authoringBusiness();

    const toBranch = await send(
      "POST",
      `/businesses/${business.businessId}/offerings`,
      {
        body: { categoryId: rootId, slug: slug(), title: "On a branch" },
        cookie: business.cookie
      }
    );
    const toLeaf = await send(
      "POST",
      `/businesses/${business.businessId}/offerings`,
      {
        body: { categoryId: leafId, slug: slug(), title: "On a leaf" },
        cookie: business.cookie
      }
    );

    // AC-8: the root has an active child, so it is a branch and carries no
    // Offerings of its own.
    expect(toBranch.statusCode).toBe(404);
    expect(toLeaf.statusCode).toBe(201);
  });

  it("derives the Offering's Domain from its leaf Category", async () => {
    const rootId = await root("REAL_ESTATE");
    const leafId = await child(rootId);
    const business = await authoringBusiness();

    const created = await send(
      "POST",
      `/businesses/${business.businessId}/offerings`,
      {
        body: { categoryId: leafId, slug: slug(), title: "A flat" },
        cookie: business.cookie
      }
    );

    // AC-9: the Domain is reached through the Category rather than stored
    // beside the Offering, so the two can never disagree.
    const derived = await pool.query<{ domain: string }>(
      `select d.stable_key as domain
       from offering o
       join category c on c.id = o.category_id
       join domain d on d.id = c.domain_id
       where o.id = $1`,
      [created.json<{ id: string }>().id]
    );
    expect(derived.rows[0]?.domain).toBe("REAL_ESTATE");
  });

  it("retires a Category with no active dependencies", async () => {
    const categoryId = await root("TECHNOLOGY");

    const retired = await send(
      "POST",
      `/admin/categories/${categoryId}/retirement`,
      { cookie: admin.cookie }
    );

    // AC-12 in the permitted case, and AC-14: the definition survives.
    expect(categorySchema.parse(retired.json())).toMatchObject({
      active: false,
      id: categoryId
    });
    const listed = await send("GET", "/admin/categories", {
      cookie: admin.cookie
    });
    expect(
      categoriesSchema.parse(listed.json()).categories.map((c) => c.id)
    ).toContain(categoryId);
  });

  it("refuses retirement while an active child remains", async () => {
    const rootId = await root("MOBILITY");
    await child(rootId);

    const retired = await send(
      "POST",
      `/admin/categories/${rootId}/retirement`,
      { cookie: admin.cookie }
    );

    // AC-12.
    expect(retired.statusCode).toBe(409);
    expect(errorEnvelopeSchema.parse(retired.json()).code).toBe(
      "CATEGORY_RETIREMENT_BLOCKED"
    );
  });

  it("refuses retirement while a Draft Offering remains assigned", async () => {
    const rootId = await root("MOBILITY");
    const leafId = await child(rootId);
    const business = await authoringBusiness();
    await send("POST", `/businesses/${business.businessId}/offerings`, {
      body: { categoryId: leafId, slug: slug(), title: "Still here" },
      cookie: business.cookie
    });

    const retired = await send(
      "POST",
      `/admin/categories/${leafId}/retirement`,
      { cookie: admin.cookie }
    );

    // AC-12: Draft counts, even though nothing is public yet.
    expect(retired.statusCode).toBe(409);
    expect(errorEnvelopeSchema.parse(retired.json()).code).toBe(
      "CATEGORY_RETIREMENT_BLOCKED"
    );
  });

  it("lets Archived history keep its Category association", async () => {
    const rootId = await root("MOBILITY");
    const leafId = await child(rootId);
    const business = await authoringBusiness();
    const offering = await send(
      "POST",
      `/businesses/${business.businessId}/offerings`,
      {
        body: { categoryId: leafId, slug: slug(), title: "Gone" },
        cookie: business.cookie
      }
    );
    await pool.query(
      `update offering set status = 'ARCHIVED', archived_at = now() where id = $1`,
      [offering.json<{ id: string }>().id]
    );

    const retired = await send(
      "POST",
      `/admin/categories/${leafId}/retirement`,
      { cookie: admin.cookie }
    );

    // AC-13: the association survives and does not block retirement.
    expect(retired.statusCode).toBe(200);
    const kept = await pool.query<{ total: number }>(
      `select count(*)::int as total from offering where category_id = $1`,
      [leafId]
    );
    expect(kept.rows[0]?.total).toBe(1);
  });

  it("refuses a new Offering on a retired Category", async () => {
    const rootId = await root("MOBILITY");
    const leafId = await child(rootId);
    await send("POST", `/admin/categories/${leafId}/retirement`, {
      cookie: admin.cookie
    });
    const business = await authoringBusiness();

    const created = await send(
      "POST",
      `/businesses/${business.businessId}/offerings`,
      {
        body: { categoryId: leafId, slug: slug(), title: "Too late" },
        cookie: business.cookie
      }
    );

    // AC-14.
    expect(created.statusCode).toBe(404);
  });

  it("refuses a child under a retired parent", async () => {
    const rootId = await root("TECHNOLOGY");
    await send("POST", `/admin/categories/${rootId}/retirement`, {
      cookie: admin.cookie
    });

    const created = await send("POST", "/admin/categories", {
      body: {
        name: "Late child",
        parentId: rootId,
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });

    // Retirement was permitted because no active child remained (AC-12).
    // Allowing one afterwards would undo the condition that permitted it.
    expect(created.statusCode).toBe(409);
    expect(errorEnvelopeSchema.parse(created.json()).code).toBe(
      "CATEGORY_PARENT_RETIRED"
    );
  });

  it("claims no result when an action fails", async () => {
    const first = await root("MOBILITY");
    const takenSlug = slug();
    await send("POST", "/admin/categories", {
      body: {
        name: "First",
        parentId: first,
        slug: takenSlug,
        stableKey: key()
      },
      cookie: admin.cookie
    });
    const stableKey = key();

    const second = await send("POST", "/admin/categories", {
      body: { name: "Second", parentId: first, slug: takenSlug, stableKey },
      cookie: admin.cookie
    });

    // AC-16: the conflict is reported and nothing partial survives it — no
    // Category row, and no audit record claiming one was created.
    expect(second.statusCode).toBe(409);
    const orphan = await pool.query<{ total: number }>(
      `select count(*)::int as total from category where stable_key = $1`,
      [stableKey]
    );
    expect(orphan.rows[0]?.total).toBe(0);
  });

  it("offers no way to delete a Category", async () => {
    const categoryId = await root("MOBILITY");

    const deleted = await app.inject({
      headers: { cookie: admin.cookie, origin: ORIGIN },
      method: "DELETE",
      url: `/api/v1/admin/categories/${categoryId}`
    });

    // AC-15: permanent deletion is not refused, it is absent.
    expect(deleted.statusCode).toBe(404);
    const survives = await pool.query<{ total: number }>(
      `select count(*)::int as total from category where id = $1`,
      [categoryId]
    );
    expect(survives.rows[0]?.total).toBe(1);
  });

  it("refuses management to an authorized Admin who has not entered the context", async () => {
    const account = await signUp();
    await pool.query(
      `insert into admin_authorization (user_id, granted_by) values ($1,'test')`,
      [account.userId]
    );

    const listed = await send("GET", "/admin/categories", {
      cookie: account.cookie
    });

    // Being able to enter the Admin surface is not being in it
    // (`US-IDN-F08-001` AC-5).
    expect(listed.statusCode).toBe(403);
    expect(errorEnvelopeSchema.parse(listed.json()).code).toBe(
      "ADMIN_CONTEXT_REQUIRED"
    );
  });

  it("refuses management to an ordinary account and to a Guest", async () => {
    const account = await signUp();

    const asUser = await send("POST", "/admin/categories", {
      body: {
        domain: "MOBILITY",
        name: "Nope",
        slug: slug(),
        stableKey: key()
      },
      cookie: account.cookie
    });
    const asGuest = await send("GET", "/admin/categories");

    expect(asUser.statusCode).toBe(403);
    expect(asGuest.statusCode).toBe(401);
  });

  it("records every Category action as audit evidence", async () => {
    const categoryId = await root("MOBILITY");
    await send("PUT", `/admin/categories/${categoryId}/name`, {
      body: { name: "Renamed" },
      cookie: admin.cookie
    });
    await send("POST", `/admin/categories/${categoryId}/retirement`, {
      cookie: admin.cookie
    });

    const audited = await pool.query<{ action: string }>(
      `select action from audit_record
       where target_id = $1 and actor_user_id = $2 and result = 'ALLOWED'
       order by action`,
      [categoryId, admin.userId]
    );
    expect(audited.rows.map((r) => r.action)).toEqual([
      "category.create",
      "category.rename",
      "category.retire"
    ]);
  });
});
