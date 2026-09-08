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
  complementaryPlacementsSchema,
  offeringPresentationSchema
} from "../packages/contracts/src/index.js";

/**
 * `I70` — what a listing suggests beside itself.
 *
 * The Owner's requirement is one example and a rule: *"otomotiv ile ilgili ilan
 * incelendiğinde belirttiğim yerde lastik affilte link yönlendirmesi olması
 * gerekiyor. Tüm ilan bölümlerinde ilgili bölüme uygun tamamlayıcı ürünler
 * önermesi gerekiyor."*
 *
 * **This is advertising, and PRD-0006 §20 is what bounds it.** The section
 * permits three regions, forbids advertising from touching Results ordering,
 * eligibility or a Listing Card, requires every unit to be labelled, and
 * excludes impression, click and revenue reporting. The cases below assert the
 * ones a wrong implementation would break:
 *
 * - placements travelling *inside* the Presentation payload, which would make
 *   advertising part of what a listing is;
 * - a placement changing what is eligible or what a card contains;
 * - a suggestion appearing under a heading nobody configured, which is
 *   advertising arriving by default rather than by decision;
 * - and a destination that is not an ordinary web address, which is the shape
 *   an open redirect takes.
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

suite("Increment I70 complementary placements", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let sectorId: string;
  let headingId: string;
  let otherHeadingId: string;
  let adminCookie: string;

  const address = () => `adv-${randomUUID()}@example.test`;
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

  /*
   * A root names a Domain and a child names a parent — never both: the contract
   * is a strict union, because a root that also named a parent would be
   * claiming a Domain it must instead inherit.
   */
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
      throw new Error(`CATEGORY_REFUSED_${created.statusCode}_${created.body}`);
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

  const place = (body: unknown) =>
    send("POST", "/admin/complementary-placements", {
      body,
      cookie: adminCookie
    });

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

    sectorId = await category(`Otomotiv ${randomUUID().slice(0, 8)}`);
    headingId = await category(
      `Binek araç ${randomUUID().slice(0, 8)}`,
      sectorId
    );
    otherHeadingId = await category(
      `Ticari araç ${randomUUID().slice(0, 8)}`,
      sectorId
    );
  });

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    /*
     * **I75 put a master switch in front of every placement, and it is off.**
     * PRD-0006 §20.4 makes advertising absent until somebody turns it on, so
     * the seeded row says `false` and this suite — which is about what a
     * *configured* platform suggests — turns it on and clears the ad-free
     * Category list before each case. The switch's own behaviour is asserted in
     * `i75`, where it belongs.
     */
    await pool.query("delete from advertising_category_exclusion");
    await pool.query("update advertising_setting set enabled = true where id");
    dispatcher.delivered.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("suggests nothing until somebody says what to suggest", async () => {
    /*
     * PRD-0006 §20.4: advertising is absent by default. A heading nobody has
     * configured suggests nothing, and the answer is an empty list rather than
     * a refusal — the surface can then tell "nothing configured" from "the
     * request failed", which is the difference between a complete page and a
     * broken one.
     */
    const listed = await list(otherHeadingId, `Kamyonet ${randomUUID()}`);
    expect(await suggested(listed.slug)).toEqual([]);
  });

  it("carries the Owner's own example: a car listing offers tyres", async () => {
    const listed = await list(headingId, `Sedan ${randomUUID()}`);
    expect(
      (
        await place({
          categoryId: headingId,
          destinationUrl: "https://partner.example/lastik",
          label: "Kış lastiği",
          note: "Aracınızın ebadına göre",
          partnerName: "Lastik Dünyası"
        })
      ).statusCode
    ).toBe(201);

    const shown = await suggested(listed.slug);
    expect(shown).toEqual([
      {
        destinationUrl: "https://partner.example/lastik",
        label: "Kış lastiği",
        note: "Aracınızın ebadına göre",
        partnerName: "Lastik Dünyası"
      }
    ]);
  });

  it("inherits a sector's placements down to every heading under it", async () => {
    /*
     * *"Tüm ilan bölümlerinde ilgili bölüme uygun tamamlayıcı ürünler
     * önermesi gerekiyor."* A hundred and twenty-seven headings each needing
     * their own list is how a rule stops being true somewhere; a placement
     * written against the sector applies underneath it.
     */
    await place({
      categoryId: sectorId,
      destinationUrl: "https://partner.example/kasko",
      label: "Kasko teklifi",
      partnerName: "Marmara Sigorta"
    });

    const listed = await list(otherHeadingId, `Panelvan ${randomUUID()}`);
    expect((await suggested(listed.slug)).map((row) => row.label)).toContain(
      "Kasko teklifi"
    );
  });

  it("lets a heading replace what its sector suggests, rather than repeat it", async () => {
    await place({
      categoryId: sectorId,
      destinationUrl: "https://partner.example/genel-lastik",
      label: "Kış lastiği",
      partnerName: "Genel Lastik"
    });

    // The heading already has its own "Kış lastiği" from the case above. One
    // suggestion appears, and it is the nearer one: two rows with one label
    // would read as the platform suggesting the same thing twice.
    const listed = await list(headingId, `Sedan ${randomUUID()}`);
    const tyres = (await suggested(listed.slug)).filter(
      (row) => row.label === "Kış lastiği"
    );
    expect(tyres).toHaveLength(1);
    expect(tyres[0]?.partnerName).toBe("Lastik Dünyası");
  });

  it("keeps advertising out of what a listing is", async () => {
    /*
     * **The boundary this increment rests on**, and it is asserted as a shape
     * rather than trusted as a habit. PRD-0006 §20.3 forbids advertising from
     * changing what is publicly eligible, what matches a query or what a
     * Listing Card contains. The Presentation payload is `.strict()` and has no
     * field for a placement, so a future change that tried to put one there
     * fails here.
     */
    const listed = await list(headingId, `Sedan ${randomUUID()}`);
    const presented = offeringPresentationSchema.parse(
      (await send("GET", `/offerings/${listed.slug}`)).json()
    );
    expect(Object.keys(presented)).not.toContain("complementary");
    expect(Object.keys(presented)).not.toContain("placements");
  });

  it("refuses a destination that is not an ordinary web address", async () => {
    // The shape an open redirect takes, and the one a prefix test would admit.
    for (const destinationUrl of [
      "javascript:alert(1)",
      "data:text/html,<script>",
      "not a url at all"
    ])
      expect(
        (
          await place({
            categoryId: headingId,
            destinationUrl,
            label: `Kötü ${randomUUID().slice(0, 6)}`,
            partnerName: "Bilinmeyen"
          })
        ).statusCode
      ).toBe(400);
  });

  it("refuses a placement under a Category that does not exist", async () => {
    expect(
      (
        await place({
          categoryId: randomUUID(),
          destinationUrl: "https://partner.example/x",
          label: "Hayalet",
          partnerName: "Yok"
        })
      ).statusCode
    ).toBe(404);
  });

  it("switches a placement off without losing it", async () => {
    const listed = await list(otherHeadingId, `Kamyonet ${randomUUID()}`);
    await place({
      categoryId: otherHeadingId,
      destinationUrl: "https://partner.example/tente",
      label: "Kasa tentesi",
      partnerName: "Tente Merkezi"
    });
    expect((await suggested(listed.slug)).map((row) => row.label)).toContain(
      "Kasa tentesi"
    );

    const all = await send("GET", "/admin/complementary-placements", {
      cookie: adminCookie
    });
    /*
     * Matched on the Category as well as the label. The database outlives one
     * run of this file, so a label alone finds whichever "Kasa tentesi" was
     * written first — and deactivating last week's row while asserting about
     * this one is the shape of test that passes for the wrong reason.
     */
    const target = all
      .json<{
        placements: {
          categoryId: string;
          label: string;
          placementId: string;
        }[];
      }>()
      .placements.find(
        (row) =>
          row.label === "Kasa tentesi" && row.categoryId === otherHeadingId
      );
    if (target === undefined) throw new Error("NO_PLACEMENT");

    expect(
      (
        await send(
          "DELETE",
          `/admin/complementary-placements/${target.placementId}`,
          { cookie: adminCookie }
        )
      ).statusCode
    ).toBe(200);

    // Off the surface immediately, and still a row: a placement is a partner
    // arrangement, and "we paused this" must not mean "we forgot this".
    expect(
      (await suggested(listed.slug)).map((row) => row.label)
    ).not.toContain("Kasa tentesi");
    const kept = await pool.query<{ active: boolean }>(
      `select active from complementary_placement where id = $1`,
      [target.placementId]
    );
    expect(kept.rows[0]?.active).toBe(false);
  });

  it("keeps the placements to Admins", async () => {
    const stranger = await signUp();
    expect(
      (
        await send("GET", "/admin/complementary-placements", {
          cookie: stranger.cookie
        })
      ).statusCode
    ).toBe(403);
  });
});
