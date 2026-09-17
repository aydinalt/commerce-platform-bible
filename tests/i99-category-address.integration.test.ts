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
import {
  categoryAddressSchema,
  sitemapSchema
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
 * Increment I99 — a Category answering at its own address.
 *
 * `UX-0002` **Frozen v1.4** §8A gives a Category a permanent address, and the
 * whole of §8A is about what that address may and may not do. Two of its rules
 * can only be checked against a real database:
 *
 * - **§8A.4, arrival records no Discovery Start.** This is the one that would
 *   be invisible. The page would look right, the Results would be right, and
 *   the platform's own account of what people did would fill with a crawler's
 *   traversal at whatever rate the crawler chose. The `discovery_start` table
 *   is the only place that can answer it.
 * - **§8A.2, a branch aggregates nothing.** A query that joined descendants
 *   would produce a plausible list, and only a branch with a stocked leaf
 *   beneath it shows the difference.
 */
suite("Increment I99 the Category address", () => {
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
      userId: confirmed.json<{ userId: string }>().userId
    };
  };

  const root = async (domain = "MOBILITY", name = "Root") => {
    const categorySlug = slug();
    const created = await send("POST", "/admin/categories", {
      body: { domain, name, slug: categorySlug, stableKey: key() },
      cookie: admin.cookie
    });
    return { id: created.json<{ id: string }>().id, slug: categorySlug };
  };

  const child = async (parentId: string, name = "Child") => {
    const categorySlug = slug();
    const created = await send("POST", "/admin/categories", {
      body: { name, parentId, slug: categorySlug, stableKey: key() },
      cookie: admin.cookie
    });
    return { id: created.json<{ id: string }>().id, slug: categorySlug };
  };

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

  /** The address, fetched as a Guest: no cookie anywhere. */
  const at = (categorySlug: string) =>
    send("GET", `/discovery/categories/${categorySlug}`);

  const startCount = async () =>
    (
      await pool.query<{ total: number }>(
        `select count(*)::int as total from discovery_start`
      )
    ).rows[0]?.total ?? 0;

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
  });

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    dispatcher.delivered.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("answers a leaf with its Results, to a Guest with no account", async () => {
    const branch = await root("TECHNOLOGY", "Klavyeler");
    const leaf = await child(branch.id, "Oyun klavyesi");
    await publish(leaf.id, "Bir oyun klavyesi");

    const answer = await at(leaf.slug);

    expect(answer.statusCode).toBe(200);
    const view = categoryAddressSchema.parse(answer.json());
    expect(view.category.slug).toBe(leaf.slug);
    expect(view.category.leaf).toBe(true);
    expect(view.results?.map((card) => card.title)).toEqual([
      "Bir oyun klavyesi"
    ]);
    // §8A.2: a leaf presents no children, and the field is empty rather than
    // absent — the shape does not change between a leaf and a branch.
    expect(view.children).toEqual([]);
    // Its own place in the catalogue, root first.
    expect(view.ancestors.map((step) => step.slug)).toEqual([branch.slug]);
  });

  it("records no Discovery Start, however many times it is fetched", async () => {
    /*
     * **§8A.4, and the reason it is a rule rather than an accident.** This is
     * the first surface in the platform a crawler reaches by design. An arrival
     * that produced an occurrence would put a machine's traversal into the
     * platform's own account of what people did — and the count is what
     * `UX-0006`'s Basic Analytics reads.
     *
     * Counted across the whole table rather than against a path id, because the
     * failure being guarded against is a path id being **minted** here. A
     * per-path assertion would pass while the route invented a new one on every
     * request, which is precisely the shape of the bug.
     */
    const branch = await root("TECHNOLOGY", "Fareler");
    const leaf = await child(branch.id, "Oyun faresi");
    await publish(leaf.id, "Bir fare");

    const before = await startCount();
    await at(leaf.slug);
    await at(leaf.slug);
    await at(branch.slug);
    const after = await startCount();

    expect(after).toBe(before);
  });

  it("withholds Results on a branch and aggregates nothing beneath it", async () => {
    /*
     * §8A.2 is §8.2 applied at an address. `null` says "withheld" where an
     * empty array would say "none here", and the two must not be merged: a
     * branch that answered `[]` would be claiming its subtree is empty while a
     * stocked leaf sits directly underneath it.
     */
    const branch = await root("TECHNOLOGY", "Ekranlar");
    const leaf = await child(branch.id, "Oyun monitörü");
    await publish(leaf.id, "Bir monitör");

    const answer = await at(branch.slug);

    expect(answer.statusCode).toBe(200);
    const view = categoryAddressSchema.parse(answer.json());
    expect(view.category.leaf).toBe(false);
    expect(view.results).toBeNull();
    expect(view.children.map((one) => one.slug)).toEqual([leaf.slug]);
  });

  it("answers an empty leaf with an empty list rather than nothing", async () => {
    // §8A.3: the absence is a stated fact. `[]` is what lets the surface state
    // it; `null` there would have been the branch's answer, which is different.
    const branch = await root("TECHNOLOGY", "Kulaklıklar");
    const leaf = await child(branch.id, "Oyun kulaklığı");

    const view = categoryAddressSchema.parse((await at(leaf.slug)).json());
    expect(view.results).toEqual([]);
  });

  it("answers a retired Category the way it answers one that never existed", async () => {
    const branch = await root("TECHNOLOGY", "Tabletler");
    const leaf = await child(branch.id, "Çizim tableti");

    expect((await at(leaf.slug)).statusCode).toBe(200);

    await send("POST", `/admin/categories/${leaf.id}/retirement`, {
      cookie: admin.cookie
    });

    // §8.1 and §8A.2. Identical to a slug nobody ever created, so the answer
    // leaks neither a retirement nor a moderation decision.
    expect((await at(leaf.slug)).statusCode).toBe(404);
    expect((await at(`never-${randomUUID()}`)).statusCode).toBe(404);
  });

  it("refuses a second Category with a slug that is already an address", async () => {
    /*
     * **The defect this increment found.** The schema constrained only
     * `(domain_id, slug)`, so two Domains could hold one slug and
     * `/kategori/{slug}` would have identified two Categories. Admin now gets
     * the conflict rather than a second Category nobody could reach.
     */
    const taken = slug();
    const first = await send("POST", "/admin/categories", {
      body: {
        domain: "TECHNOLOGY",
        name: "İlk",
        slug: taken,
        stableKey: key()
      },
      cookie: admin.cookie
    });
    expect(first.statusCode).toBe(201);

    const second = await send("POST", "/admin/categories", {
      body: {
        // A different Domain, which used to be enough.
        domain: "MOBILITY",
        name: "İkinci",
        slug: taken,
        stableKey: key()
      },
      cookie: admin.cookie
    });

    expect(second.statusCode).toBe(409);
    expect(second.json<{ code: string }>().code).toBe("CATEGORY_KEY_CONFLICT");
  });

  it("advertises the Category in the sitemap once it holds something", async () => {
    const branch = await root("TECHNOLOGY", "Mikrofonlar");
    const leaf = await child(branch.id, "Yayıncı mikrofonu");

    const empty = sitemapSchema.parse(
      (await send("GET", "/discovery/sitemap")).json()
    );
    const emptySlugs = empty.categories.map((entry) => entry.slug);
    /*
     * Not yet: the address exists and states honestly that it holds nothing,
     * and asking a crawler to spend budget on that page teaches it this
     * sitemap is not worth reading.
     */
    expect(emptySlugs).not.toContain(leaf.slug);

    await publish(leaf.id, "Bir mikrofon");

    const filled = sitemapSchema.parse(
      (await send("GET", "/discovery/sitemap")).json()
    );
    const slugs = filled.categories.map((entry) => entry.slug);
    expect(slugs).toContain(leaf.slug);
    // The branch too, on its descendant's listing — what it presents is its
    // children's addresses, and those changed when this one did.
    expect(slugs).toContain(branch.slug);
  });

  it("drops a Category out of the sitemap when its last listing leaves", async () => {
    /*
     * **The retired-Category case cannot be reached, and finding that out is
     * the point of writing this one.** `US-PLT-F08-001` AC-12 refuses to retire
     * a Category while an Offering in an active lifecycle state sits in it, so
     * "a retired Category with listings" does not exist — the sitemap's active
     * filter is a second guard rather than the only one.
     *
     * What does happen is this: the listings leave, and the address stops being
     * worth advertising. A sitemap that kept it would spend crawl budget on a
     * page that says "nothing here", which is what teaches a crawler that this
     * file is not worth reading.
     */
    const branch = await root("TECHNOLOGY", "Koltuklar");
    const leaf = await child(branch.id, "Oyuncu koltuğu");
    const listing = await publish(leaf.id, "Bir koltuk");

    const before = sitemapSchema.parse(
      (await send("GET", "/discovery/sitemap")).json()
    );
    expect(before.categories.map((entry) => entry.slug)).toContain(leaf.slug);

    await send(
      "POST",
      `/businesses/${listing.businessId}/offerings/${listing.offeringId}/retirement`,
      { cookie: listing.cookie }
    );

    const after = sitemapSchema.parse(
      (await send("GET", "/discovery/sitemap")).json()
    );
    expect(after.categories.map((entry) => entry.slug)).not.toContain(
      leaf.slug
    );
    // And the branch goes with it, because what it presented was this leaf.
    expect(after.categories.map((entry) => entry.slug)).not.toContain(
      branch.slug
    );
  });
});
