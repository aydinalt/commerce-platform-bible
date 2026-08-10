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
  browseRootsSchema,
  browseViewSchema
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
 * `US-DSC-F03-001` Browse.
 *
 * The first public surface in the system, and the first reader of the Discovery
 * projection that `US-OFR-F04-001` writes. Every case below runs as a Guest,
 * with no cookie at all — Discovery is something a person does before deciding
 * whether to have an account.
 *
 * The Story's shape is a hierarchy that guides and a leaf that answers. So the
 * cases that matter most are the negative ones: a branch withholds Results
 * rather than gathering its descendants', and a retired Category is not a place
 * you can be.
 */
suite("Increment I3 Browse", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };

  const address = () => `brw-${randomUUID()}@example.test`;
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

  const root = async (domain = "MOBILITY", name = "Root") => {
    const created = await send("POST", "/admin/categories", {
      body: { domain, name, slug: slug(), stableKey: key() },
      cookie: admin.cookie
    });
    return created.json<{ id: string }>().id;
  };

  const child = async (parentId: string, name = "Child") => {
    const created = await send("POST", "/admin/categories", {
      body: { name, parentId, slug: slug(), stableKey: key() },
      cookie: admin.cookie
    });
    return created.json<{ id: string }>().id;
  };

  /** A publicly eligible Offering in the given leaf Category. */
  const publish = async (categoryId: string, title = "A listing") => {
    const account = await signUp();
    const business = await send("POST", "/businesses", {
      body: { name: "Kadıköy Motors", slug: slug() },
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
    return { businessId, cookie: account.cookie, offeringId };
  };

  /** Browsing as a Guest: no cookie anywhere. */
  const browse = (categoryId: string, discoveryPathId?: string) =>
    send("POST", `/discovery/browse/categories/${categoryId}`, {
      body: discoveryPathId === undefined ? {} : { discoveryPathId }
    });

  const starts = async (pathId: string) =>
    (
      await pool.query<{ total: number }>(
        `select count(*)::int as total from discovery_start where path_id = $1`,
        [pathId]
      )
    ).rows[0]?.total;

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

  it("offers the active roots to a Guest without any account", async () => {
    const rootId = await root("TECHNOLOGY", "Laptops");

    const roots = await send("GET", "/discovery/browse");

    // `US-IDN-F01-001`: Discovery is something a person does before deciding
    // whether to have an account.
    expect(roots.statusCode).toBe(200);
    const domains = browseRootsSchema.parse(roots.json()).domains;
    expect(
      domains
        .find((d) => d.domain === "TECHNOLOGY")
        ?.categories.some((c) => c.id === rootId)
    ).toBe(true);
  });

  it("creates one Discovery Start carrying the Category's Domain", async () => {
    const rootId = await root("REAL_ESTATE");

    const view = await browse(rootId);

    // AC-1 and AC-2.
    const pathId = browseViewSchema.parse(view.json()).discoveryPathId;
    const recorded = await pool.query<{ domain: string; kind: string }>(
      `select s.kind::text as kind, d.stable_key as domain
       from discovery_start s join domain d on d.id = s.domain_id
       where s.path_id = $1`,
      [pathId]
    );
    expect(recorded.rows[0]).toEqual({
      domain: "REAL_ESTATE",
      kind: "BROWSE"
    });
  });

  it("creates no further Start for descendants of the same path", async () => {
    const rootId = await root();
    const childId = await child(rootId);
    const grandChildId = await child(childId);

    const first = await browse(rootId);
    const pathId = browseViewSchema.parse(first.json()).discoveryPathId;
    await browse(childId, pathId);
    await browse(grandChildId, pathId);

    // AC-8. One act of looking, however many steps it takes.
    expect(await starts(pathId)).toBe(1);
  });

  it("creates a separate Start for a new path", async () => {
    const rootId = await root();

    const first = await browse(rootId);
    const second = await browse(rootId);

    // The same Category, two people — or the same person looking again. Both
    // are new paths, because neither carried one.
    const firstPath = browseViewSchema.parse(first.json()).discoveryPathId;
    const secondPath = browseViewSchema.parse(second.json()).discoveryPathId;
    expect(firstPath).not.toBe(secondPath);
    expect(await starts(firstPath)).toBe(1);
    expect(await starts(secondPath)).toBe(1);
  });

  it("navigates children, parents and alternative branches", async () => {
    const rootId = await root();
    const first = await child(rootId, "First branch");
    const second = await child(rootId, "Second branch");
    const leaf = await child(first, "Leaf");

    const atFirst = await browse(first);
    const atLeaf = await browse(leaf);

    // AC-3. From a branch you can see its children and its siblings; from a
    // leaf you can see the way back.
    const branch = browseViewSchema.parse(atFirst.json());
    expect(branch.children.map((c) => c.id)).toEqual([leaf]);
    expect(branch.siblings.map((c) => c.id)).toEqual([second]);
    expect(
      browseViewSchema.parse(atLeaf.json()).ancestors.map((c) => c.id)
    ).toEqual([rootId, first]);
  });

  it("excludes retired Categories from every destination", async () => {
    const rootId = await root();
    const living = await child(rootId, "Living");
    const doomed = await child(rootId, "Doomed");
    await send("POST", `/admin/categories/${doomed}/retirement`, {
      cookie: admin.cookie
    });

    const atRoot = await browse(rootId);
    const atRetired = await browse(doomed);

    // AC-4. Not a destination that refuses you — not a destination.
    expect(
      browseViewSchema.parse(atRoot.json()).children.map((c) => c.id)
    ).toEqual([living]);
    expect(atRetired.statusCode).toBe(404);
  });

  it("withholds Results while the Category is a branch", async () => {
    const rootId = await root();
    const leaf = await child(rootId);
    await publish(leaf);

    const atRoot = await browse(rootId);

    // AC-5 and AC-7. `null`, not an empty list: Results are not being shown,
    // and the parent does not gather its descendants'.
    const view = browseViewSchema.parse(atRoot.json());
    expect(view.category.leaf).toBe(false);
    expect(view.results).toBeNull();
  });

  it("presents Results only once an active leaf is selected", async () => {
    const rootId = await root();
    const leaf = await child(rootId);
    const published = await publish(leaf, "Kadıköy hatchback");

    const atLeaf = await browse(leaf);

    // AC-6, and the PRD-0002 §11 Listing Card minimum.
    const view = browseViewSchema.parse(atLeaf.json());
    expect(view.category.leaf).toBe(true);
    expect(view.results).toHaveLength(1);
    expect(view.results?.[0]).toMatchObject({
      businessName: "Kadıköy Motors",
      offeringId: published.offeringId,
      title: "Kadıköy hatchback"
    });
  });

  it("carries no protected or Affiliate information on a Listing Card", async () => {
    const rootId = await root();
    const leaf = await child(rootId);
    const published = await publish(leaf);
    await send("PUT", `/businesses/${published.businessId}/information`, {
      body: {
        contactEmail: "sales@kadikoy.example",
        contactTelephone: "+90 216 000 00 00",
        contactUrl: "https://kadikoy.example/contact",
        name: "Kadıköy Motors"
      },
      cookie: published.cookie
    });
    await send(
      "POST",
      `/businesses/${published.businessId}/offerings/${published.offeringId}/affiliate-destination`,
      {
        body: { reference: "https://partner.example/secret" },
        cookie: published.cookie
      }
    );

    const atLeaf = await browse(leaf);

    // PRD-0002 §11. The card has no field that could hold any of these, so
    // this checks the shape rather than a filter someone had to remember.
    const card = browseViewSchema.parse(atLeaf.json()).results?.[0];
    const serialised = JSON.stringify(card);
    expect(serialised).not.toContain("sales@kadikoy.example");
    expect(serialised).not.toContain("+90 216 000 00 00");
    expect(serialised).not.toContain("partner.example");
  });

  it("shows only publicly eligible Offerings", async () => {
    const rootId = await root();
    const leaf = await child(rootId);
    const published = await publish(leaf, "Still listed");
    const draftOnly = await publish(leaf, "Withdrawn");
    await send(
      "POST",
      `/businesses/${draftOnly.businessId}/offerings/${draftOnly.offeringId}/retirement`,
      { cookie: draftOnly.cookie }
    );

    const atLeaf = await browse(leaf);

    // Final Offering Public Eligibility is the only eligibility input, and it
    // arrives as the presence or absence of a projection row rather than as a
    // check this code performs.
    const results = browseViewSchema.parse(atLeaf.json()).results;
    expect(results?.map((r) => r.offeringId)).toEqual([published.offeringId]);
  });

  it("orders Results by later Initial Published At first", async () => {
    const rootId = await root();
    const leaf = await child(rootId);
    const older = await publish(leaf, "Older");
    await pool.query(
      `update offering set published_at = now() - interval '1 day' where id = $1`,
      [older.offeringId]
    );
    await pool.query(
      `update offering_search_projection
         set published_at = now() - interval '1 day' where offering_id = $1`,
      [older.offeringId]
    );
    await publish(leaf, "Newer");

    const atLeaf = await browse(leaf);

    // PRD-0002 §12: Browse Results use later Initial Published At first.
    // `US-DSC-F07-001` owns the rule; this is the first place it has to hold.
    expect(
      browseViewSchema.parse(atLeaf.json()).results?.map((r) => r.title)
    ).toEqual(["Newer", "Older"]);
  });

  it("shows an empty leaf as empty rather than as withheld", async () => {
    const rootId = await root();
    const leaf = await child(rootId);

    const atLeaf = await browse(leaf);

    // The distinction the `null` exists to make: this leaf genuinely has
    // nothing, and says so.
    expect(browseViewSchema.parse(atLeaf.json()).results).toEqual([]);
  });

  it("treats a Category as a leaf once its only child retires", async () => {
    const rootId = await root();
    const onlyChild = await child(rootId);
    await send("POST", `/admin/categories/${onlyChild}/retirement`, {
      cookie: admin.cookie
    });

    const atRoot = await browse(rootId);

    // `leaf` is derived, not stored: a Category stops being a branch when its
    // last active child does.
    const view = browseViewSchema.parse(atRoot.json());
    expect(view.category.leaf).toBe(true);
    expect(view.children).toEqual([]);
    expect(view.results).toEqual([]);
  });

  it("rejects a malformed Category identifier at the edge", async () => {
    const view = await send("POST", "/discovery/browse/categories/not-a-uuid", {
      body: {}
    });

    expect(view.statusCode).toBe(400);
  });
});
