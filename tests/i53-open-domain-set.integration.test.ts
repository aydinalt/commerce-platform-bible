import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type {
  BrowseRoots,
  Categories,
  CategoryResponse,
  SearchViewResponse
} from "@commerce/contracts";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import { silentLogger } from "../packages/testing/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";

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
 * Increment I53 — the Domain set is open, proved by a fourth Domain.
 *
 * **Every other test in this repository names one of the first three Domains,
 * and that is exactly why this file exists.** `MOBILITY`, `REAL_ESTATE` and
 * `TECHNOLOGY` were seeded by `20260810000200_category_management` and then
 * written into a union in `modules/catalog`, an enum in `packages/contracts`, a
 * label map in `apps/web` and eighty-one assertions. A suite that only ever
 * exercises the three cannot tell an open set from a closed one: both pass.
 *
 * So this suite creates a Domain nobody has written down anywhere, and follows
 * it through every surface that carries a Domain — the Admin catalogue, the
 * public Browse roots, a narrowed Search and the Admin Analytics tally. Frozen
 * PRD-0001 v4.0 §E: *"the set is open… Mobility, Real Estate and Technology
 * were the first three, not the whole set"*. `DOMAIN_SET_OPEN_DECISION.md`
 * records the Owner decision that governs where AC-1's enumeration used to.
 *
 * **The Domain is created here by SQL and that is a statement, not a shortcut.**
 * No endpoint creates a Domain — none is specified, and inventing one would be
 * a decision this increment has no authority to make. Domains arrive by
 * migration today. What this suite proves is the half that *is* in scope: that
 * a Domain the code has never heard of works everywhere once it exists.
 */
suite("Increment I53 the open Domain set", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };

  /*
   * A key, a slug and a name that appear in no source file, no contract and no
   * migration. If any of them had to be registered somewhere for this to work,
   * the set would not be open — and the failure would say where.
   */
  const FOURTH = {
    key: `GARDEN_${randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`,
    name: "Bahçe ve Yaşam",
    slug: `bahce-${randomUUID()}`
  };

  const address = () => `od-${randomUUID()}@example.test`;
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
    const link = /https?:\/\/\S+/u.exec(message?.body ?? "")?.[0] ?? "";
    const confirmed = await send("POST", "/auth/registrations/confirmations", {
      body: { token: new URL(link).searchParams.get("token") }
    });
    const cookies = confirmed.cookies as { name: string; value: string }[];
    return {
      cookie: `commerce_session=${cookies.find((c) => c.name === "commerce_session")?.value ?? ""}`,
      userId: confirmed.json<{ userId: string }>().userId
    };
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

    await pool.query(
      `insert into domain (id, stable_key, slug, name, active)
       values (gen_random_uuid(), $1, $2, $3, true)`,
      [FOURTH.key, FOURTH.slug, FOURTH.name]
    );
  });

  afterAll(async () => {
    /*
     * **The Domain is retired, not deleted.** A Discovery Start references the
     * Domain it began in, and `discovery_start_domain_id_fkey` is `RESTRICT` —
     * deliberately, because deleting a Domain would silently take a Discovery
     * path's own history with it. This suite records Starts, so it may not
     * delete what it created; it does what an Admin would do and marks it
     * inactive. The Categories go, because nothing outside this file uses them.
     */
    await pool.query(
      `delete from category where domain_id in
      (select id from domain where stable_key = $1)`,
      [FOURTH.key]
    );
    await pool.query("update domain set active = false where stable_key = $1", [
      FOURTH.key
    ]);
    await app.close();
    await pool.end();
  });

  it("accepts a root Category under a Domain the code never named", async () => {
    const created = await send("POST", "/admin/categories", {
      body: {
        domain: FOURTH.key,
        name: "Bahçe mobilyası",
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });

    /*
     * `z.enum(V1_DOMAINS)` would have refused this body with a 400 before it
     * reached a repository. The shape is still checked — `domainKeySchema`
     * bounds it to upper snake case within the column's 80 characters — but
     * membership is now a question about records, asked of the database.
     */
    expect(created.statusCode).toBe(201);
    const body = created.json<CategoryResponse>();
    expect(body.domain).toBe(FOURTH.key);
    expect(body.domainName).toBe(FOURTH.name);
  });

  it("refuses a Domain that does not exist without reporting a fault", async () => {
    const refused = await send("POST", "/admin/categories", {
      body: {
        domain: "NO_SUCH_DOMAIN_HERE",
        name: "Olmayan",
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });

    /*
     * **Opening the set created this case, and the first version of the change
     * got it wrong.** With the enum gone, an unknown key reached the insert and
     * came back as a generic `Error` — a 500, which tells the Admin the platform
     * broke when in fact the Admin made a typo. The refusal is theirs to read.
     */
    expect(refused.statusCode).toBe(400);
    expect(refused.json<{ code: string }>().code).toBe(
      "CATEGORY_DOMAIN_UNKNOWN"
    );
  });

  it("offers the fourth Domain to the Admin who has to choose one", async () => {
    const read = await send("GET", "/admin/categories", {
      cookie: admin.cookie
    });
    const { categories, domains } = read.json<Categories>();

    /*
     * The create-root form has to offer a Domain, and before this increment the
     * options came from a three-entry list held in `apps/web`. A list in the
     * interface is a second owner of membership: correct until somebody adds a
     * Domain, and then quietly wrong on the one screen that decides Domains.
     */
    expect(domains.map((d) => d.key)).toContain(FOURTH.key);
    expect(domains.find((d) => d.key === FOURTH.key)?.name).toBe(FOURTH.name);

    const mine = categories.filter((c) => c.domain === FOURTH.key);
    expect(mine.length).toBeGreaterThan(0);
    for (const category of mine) expect(category.domainName).toBe(FOURTH.name);
  });

  it("groups the fourth Domain's roots publicly under its own name", async () => {
    const roots = await send("GET", "/discovery/browse");
    const { domains } = roots.json<BrowseRoots>();
    const group = domains.find((d) => d.domain === FOURTH.key);

    /*
     * Home groups roots by Domain. The grouping is keyed by the stable key —
     * two Domains may share a name, and grouping by the name would merge them —
     * and the name travels beside it, so no surface has to translate a key it
     * has no dictionary for.
     */
    expect(group).toBeDefined();
    expect(group?.domainName).toBe(FOURTH.name);
    expect(group?.categories.length).toBeGreaterThan(0);
  });

  it("carries the fourth Domain's name through a narrowed Search", async () => {
    const roots = await send("GET", "/discovery/browse");
    const group = roots
      .json<BrowseRoots>()
      .domains.find((d) => d.domain === FOURTH.key);
    const leaf = group?.categories[0];

    const searched = await send("POST", "/discovery/search", {
      body: { categoryId: leaf?.id, query: "bahçe" }
    });

    /*
     * A Search narrowed to a leaf reports the Domain it was narrowed into,
     * because the Search Discovery Start is recorded against it
     * (`US-DSC-F02-001` AC-1). The name comes from the same row as the key.
     */
    expect(searched.statusCode).toBe(200);
    const view = searched.json<SearchViewResponse>();
    expect(view.domain).toBe(FOURTH.key);
    expect(view.domainName).toBe(FOURTH.name);
  });

  it("tallies the fourth Domain by its name rather than its key", async () => {
    const roots = await send("GET", "/discovery/browse");
    const group = roots
      .json<BrowseRoots>()
      .domains.find((d) => d.domain === FOURTH.key);

    await send("POST", "/discovery/search", {
      body: { categoryId: group?.categories[0]?.id, query: "bahçe" }
    });

    const analytics = await send("GET", "/admin/analytics", {
      cookie: admin.cookie
    });
    const { coreFlow } = analytics.json<{
      coreFlow: Record<
        string,
        { byDomain: { count: number; domain: string; domainName: string }[] }
      >;
    }>();
    const mine = Object.values(coreFlow)
      .flatMap((flow) => flow.byDomain)
      .filter((entry) => entry.domain === FOURTH.key);

    /*
     * **This is where the closed set hid longest.** Admin Analytics translated
     * the Domain key through a label map and showed `MOBILITY: 3` for anything
     * the map did not cover — so a fourth Domain would have appeared on the
     * screen as a raw identifier, in the one place a person reads Domains as
     * data rather than as navigation.
     */
    expect(mine.length).toBeGreaterThan(0);
    for (const entry of mine) expect(entry.domainName).toBe(FOURTH.name);
  });
});
