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
  advertisingSettingsSchema,
  complementaryPlacementsSchema
} from "../packages/contracts/src/index.js";
import { featureEnabled } from "../apps/web/src/platform/flags.js";

/**
 * `I75` — the advertising placement centre.
 *
 * The Owner asked for it in his admin architecture document: *"Google Ads /
 * Harici Reklamlar: Yayıncı kimliği ve birim (slot) ID'lerini girmek için form
 * alanları. Kontrol Mekanizması: Tüm reklamları tek tuşla kapatan 'Kill Switch'
 * (Ana Anahtar) ve reklamsız kalması gereken kategori/sayfa istisnaları."*
 *
 * PRD-0006 §20 has named every one of these since v2.2 and **not one of them
 * existed**. I70 built a region and filled it from rows an Admin types; nothing
 * said who the network is, which unit goes where, whether advertising runs at
 * all, or which Categories must stay clean.
 *
 * The cases below are the ones where this looks implemented and is not:
 *
 * - a kill switch that turns off the *network* and leaves the platform's own
 *   advertising running, so the one control somebody reaches for in an
 *   emergency does not do the thing its name promises;
 * - an exclusion that stops at the Category it names, so marking a sector
 *   ad-free leaves every heading under it advertising;
 * - a partial write, which is how a switch comes back on because somebody
 *   submitted the field beside it;
 * - a settings row that can be deleted or duplicated, so the platform has two
 *   answers to "is advertising on" or none;
 * - and a counter, anywhere, which §20.5 excludes.
 */
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

describe("Increment I75 the feature flag", () => {
  /**
   * The Owner asked for the new Admin surfaces to arrive behind flags, and the
   * only property that makes a flag one is that it is **off** by default. A
   * flag defaulting to on is a comment.
   */
  it("is off for an absent, empty or malformed setting", () => {
    expect(featureEnabled("ADVERTISING_SETTINGS", undefined)).toBe(false);
    expect(featureEnabled("ADVERTISING_SETTINGS", "")).toBe(false);
    expect(featureEnabled("ADVERTISING_SETTINGS", ",,, ,")).toBe(false);
    // A name nothing declares enables nothing, silently: a boot that refused
    // over a spelling would be a worse failure than a screen staying hidden.
    expect(featureEnabled("ADVERTISING_SETTINGS", "ADVERTISING")).toBe(false);
  });

  it("is on when its own name is listed, however the list is spaced", () => {
    expect(featureEnabled("ADVERTISING_SETTINGS", "ADVERTISING_SETTINGS")).toBe(
      true
    );
    expect(
      featureEnabled(
        "ADVERTISING_SETTINGS",
        " something , advertising_settings"
      )
    ).toBe(true);
  });
});

suite("Increment I75 advertising placement settings", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let sectorId: string;
  let headingId: string;
  let adminCookie: string;
  let readerCookie: string;

  const address = () => `ads-${randomUUID()}@example.test`;
  const key = () => `K${randomUUID().replaceAll("-", "").toUpperCase()}`;
  const slug = () => `s-${randomUUID()}`;

  const send = (
    method: "DELETE" | "GET" | "POST" | "PUT",
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
        ...(parentId === undefined ? { domain: "MOBILITY" } : { parentId }),
        name,
        slug: slug(),
        stableKey: key()
      },
      cookie: adminCookie
    });
    if (created.statusCode !== 201)
      throw new Error(`CATEGORY_REFUSED_${created.statusCode}`);
    return created.json<{ id: string }>().id;
  };

  const list = async (categoryId: string, title: string) => {
    const account = await signUp();
    const business = await send("POST", "/businesses", {
      body: { name: `Mağaza ${randomUUID().slice(0, 6)}`, slug: slug() },
      cookie: account.cookie
    });
    const businessId = business.json<{ id: string }>().id;
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });
    const offeringSlug = slug();
    const offering = await send("POST", `/businesses/${businessId}/offerings`, {
      body: { categoryId, slug: offeringSlug, title },
      cookie: account.cookie
    });
    const offeringId = offering.json<{ id: string }>().id;
    await send(
      "PUT",
      `/businesses/${businessId}/offerings/${offeringId}/content`,
      {
        body: {
          attributes: [],
          categoryId,
          pricing: {
            amount: "850000.00",
            currency: "TRY",
            kind: "FIXED",
            stockState: "IN_STOCK"
          },
          title
        },
        cookie: account.cookie
      }
    );
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/publication`,
      { cookie: account.cookie }
    );
    return { offeringId, slug: offeringSlug };
  };

  const settings = async () =>
    advertisingSettingsSchema.parse(
      (await send("GET", "/admin/advertising", { cookie: adminCookie })).json()
    );

  const save = (body: unknown) =>
    send("PUT", "/admin/advertising", { body, cookie: adminCookie });

  const suggested = async (offeringSlug: string) =>
    complementaryPlacementsSchema.parse(
      (await send("GET", `/offerings/${offeringSlug}/complementary`)).json()
    ).placements;

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

    const admin = await signUp();
    await pool.query(
      `insert into admin_authorization (user_id, granted_by) values ($1,'test')`,
      [admin.userId]
    );
    await send("PUT", "/auth/me/admin-context", { cookie: admin.cookie });
    adminCookie = admin.cookie;
    readerCookie = (await signUp()).cookie;

    sectorId = await category(`Reklam sektörü ${randomUUID().slice(0, 8)}`);
    headingId = await category(
      `Reklam başlığı ${randomUUID().slice(0, 8)}`,
      sectorId
    );

    /*
     * One placement under the sector, inherited by the heading. Everything
     * below is about the two gates in front of it rather than about the
     * placement, which `i70` already owns.
     */
    await send("POST", "/admin/complementary-placements", {
      body: {
        categoryId: sectorId,
        destinationUrl: "https://partner.example/lastik",
        label: `Kış lastiği ${randomUUID().slice(0, 8)}`,
        partnerName: "Lastik Partner",
        position: 0
      },
      cookie: adminCookie
    });
  });

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    await pool.query("delete from advertising_category_exclusion");
    await pool.query(
      `update advertising_setting
       set enabled = false, publisher_id = null, unit_results = null,
           unit_presentation = null, unit_category = null where id`
    );
    dispatcher.delivered.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("answers with 'no advertising' rather than with an absence", async () => {
    /*
     * §20.4 makes advertising absent until somebody configures it, and the
     * honest encoding of that is a row that exists and says no — not a missing
     * row a surface would have to interpret. A read is an answer.
     */
    const current = await settings();
    expect(current.enabled).toBe(false);
    expect(current.publisherId).toBeNull();
    expect(current.units).toEqual({
      category: null,
      presentation: null,
      results: null
    });
    expect(current.exclusions).toEqual([]);
  });

  it("has exactly one row, and refuses to grow a second", async () => {
    // The single-row check is what stops the platform from having two answers
    // to "is advertising on". Without it, a second row is one INSERT away and
    // whichever the reader happens to select wins.
    await expect(
      pool.query(`insert into advertising_setting (id) values (true)`)
    ).rejects.toThrow();
    await expect(
      pool.query(`insert into advertising_setting (id) values (false)`)
    ).rejects.toThrow();
    const counted = await pool.query<{ count: string }>(
      `select count(*) as count from advertising_setting`
    );
    expect(counted.rows[0]?.count).toBe("1");
  });

  it("keeps the whole platform's advertising off until it is turned on", async () => {
    /*
     * **The defect this increment exists for.** I70 shipped a region that
     * served whatever an Admin had written, with no switch in front of it — so
     * "advertising is absent by default" was true of the configuration and not
     * of the platform.
     */
    const listed = await list(headingId, `Kapalıyken ${randomUUID()}`);
    expect(await suggested(listed.slug)).toEqual([]);

    await save({
      enabled: true,
      publisherId: "pub-0000000000000000",
      units: { category: null, presentation: null, results: null }
    });
    expect(await suggested(listed.slug)).toHaveLength(1);
  });

  it("covers the platform's own region, not only the network's", async () => {
    /*
     * The whole value of a master switch is that nobody has to remember what it
     * does not cover. A switch that suppressed the external units and left the
     * complementary block running would be the version somebody discovers
     * during the incident it was pressed for.
     */
    const listed = await list(headingId, `Ana anahtar ${randomUUID()}`);
    await save({
      enabled: true,
      publisherId: "pub-0000000000000000",
      units: {
        category: "unit-category",
        presentation: "unit-presentation",
        results: "unit-results"
      }
    });
    expect(await suggested(listed.slug)).toHaveLength(1);

    await save({
      enabled: false,
      publisherId: "pub-0000000000000000",
      units: {
        category: "unit-category",
        presentation: "unit-presentation",
        results: "unit-results"
      }
    });
    // The identifiers are still there. Off is a state, not an erasure: an
    // operator who switched advertising off in a hurry has not lost the
    // configuration they will switch back on.
    const current = await settings();
    expect(current.enabled).toBe(false);
    expect(current.units.results).toBe("unit-results");
    expect(await suggested(listed.slug)).toEqual([]);
  });

  it("keeps a Category clean, and every Category under it", async () => {
    /*
     * §20.4's exclusion list. Written against a heading and inherited
     * downwards, like the placements themselves — an exclusion that stopped at
     * the Category it names would leave a sector marked ad-free advertising in
     * every heading under it, which is the opposite of what somebody marking a
     * sector meant.
     */
    const listed = await list(headingId, `Reklamsız ${randomUUID()}`);
    await save({
      enabled: true,
      publisherId: "pub-0000000000000000",
      units: { category: null, presentation: null, results: null }
    });
    expect(await suggested(listed.slug)).toHaveLength(1);

    const excluded = await send("POST", "/admin/advertising/exclusions", {
      body: { categoryId: sectorId },
      cookie: adminCookie
    });
    expect(excluded.statusCode).toBe(201);
    expect(await suggested(listed.slug)).toEqual([]);

    const named = await settings();
    expect(named.exclusions.map((entry) => entry.categoryId)).toEqual([
      sectorId
    ]);

    const restored = await send(
      "DELETE",
      `/admin/advertising/exclusions/${sectorId}`,
      { cookie: adminCookie }
    );
    expect(restored.statusCode).toBe(200);
    expect(await suggested(listed.slug)).toHaveLength(1);
  });

  it("takes the same Category twice without complaining", async () => {
    // An Admin asked for a state, and the state is what they get. A second
    // request answering `409` would make "make sure this is ad-free" a question
    // about what somebody did earlier.
    for (const attempt of [1, 2]) {
      const written = await send("POST", "/admin/advertising/exclusions", {
        body: { categoryId: headingId },
        cookie: adminCookie
      });
      expect([attempt, written.statusCode]).toEqual([attempt, 201]);
    }
    expect((await settings()).exclusions).toHaveLength(1);
  });

  it("refuses a Category that does not exist, and an exclusion that is not there", async () => {
    const missing = await send("POST", "/admin/advertising/exclusions", {
      body: { categoryId: randomUUID() },
      cookie: adminCookie
    });
    expect(missing.statusCode).toBe(404);

    const nothing = await send(
      "DELETE",
      `/admin/advertising/exclusions/${randomUUID()}`,
      { cookie: adminCookie }
    );
    // Nothing was undone, and the answer says so rather than claiming it was.
    expect(nothing.statusCode).toBe(404);
  });

  it("takes the whole form, so no field survives a submission nobody read", async () => {
    /*
     * A partial write is how a kill switch comes back on: somebody edits the
     * publisher identifier, the request carries only that, and `enabled` keeps
     * a value nobody looked at. `PUT` with every field required is the shape
     * that cannot do it.
     */
    const partial = await save({ publisherId: "pub-1111111111111111" });
    expect(partial.statusCode).toBe(400);
    expect(partial.json<{ code: string }>().code).toBe("VALIDATION_FAILED");
    expect((await settings()).publisherId).toBeNull();
  });

  it("stores a blank identifier as absence rather than as an empty one", async () => {
    await save({
      enabled: true,
      publisherId: "pub-2222222222222222",
      units: { category: "  ", presentation: "unit-x", results: "" }
    });
    const current = await settings();
    // §20.4: an empty identifier means no advertising there, and it must read
    // as "nothing is configured" rather than as a unit named "".
    expect(current.units).toEqual({
      category: null,
      presentation: "unit-x",
      results: null
    });
    expect(current.publisherId).toBe("pub-2222222222222222");
  });

  it("keeps every one of these to an Admin", async () => {
    for (const attempt of [
      await send("GET", "/admin/advertising", { cookie: readerCookie }),
      await send("PUT", "/admin/advertising", {
        body: {
          enabled: true,
          publisherId: null,
          units: { category: null, presentation: null, results: null }
        },
        cookie: readerCookie
      }),
      await send("POST", "/admin/advertising/exclusions", {
        body: { categoryId: sectorId },
        cookie: readerCookie
      }),
      await send("DELETE", `/admin/advertising/exclusions/${sectorId}`, {
        cookie: readerCookie
      })
    ])
      // `403`, which is the platform's own shape: `resolveAdmin` refuses a
      // session that has not entered the Admin context, and it refuses it the
      // same way whether or not an authorization exists.
      expect(attempt.statusCode).toBe(403);

    expect(
      (await send("GET", "/admin/advertising")).statusCode
    ).toBeGreaterThanOrEqual(401);
  });

  it("records the switch without recording anybody looking at an advertisement", async () => {
    /*
     * §20.5 excludes impression, click, revenue and fill-rate reporting. The
     * absence has to be asserted against the schema rather than described,
     * because an absence has no behaviour to test — and the first counter added
     * to this table is the one that arrives without a decision.
     */
    await save({
      enabled: true,
      publisherId: "pub-3333333333333333",
      units: { category: null, presentation: null, results: null }
    });
    const columns = await pool.query<{ column_name: string }>(
      `select column_name from information_schema.columns
       where table_name in ('advertising_setting','advertising_category_exclusion')`
    );
    const names = columns.rows.map((row) => row.column_name);
    for (const forbidden of [
      "impressions",
      "clicks",
      "revenue",
      "fill_rate",
      "views",
      "click_count"
    ])
      expect(names).not.toContain(forbidden);

    // And the payload a surface reads carries none either, whatever the table
    // grows later.
    expect(Object.keys(await settings()).sort()).toEqual([
      "enabled",
      "exclusions",
      "publisherId",
      "units",
      "updatedAt"
    ]);
  });

  it("says who changed it last, without putting that on a public surface", async () => {
    const before = (await settings()).updatedAt;
    await new Promise((resolve) => setTimeout(resolve, 5));
    await save({
      enabled: true,
      publisherId: "pub-4444444444444444",
      units: { category: null, presentation: null, results: null }
    });
    expect((await settings()).updatedAt).not.toBe(before);

    // The Admin who made the change is on the row and not in the payload:
    // knowing who configured advertising is an operational fact, and the
    // surfaces that read this are Admin surfaces that already know who is
    // signed in.
    const stored = await pool.query<{ updated_by: string | null }>(
      `select updated_by from advertising_setting where id`
    );
    expect(stored.rows[0]?.updated_by).not.toBeNull();
  });
});
