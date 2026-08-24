import { randomUUID } from "node:crypto";
import { createElement } from "react";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { AttributeResponse, CategoryResponse } from "@commerce/contracts";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import { silentLogger } from "../packages/testing/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { ReparentCategory } from "../apps/web/src/app/admin/categories/category-forms";
import { ADMIN_IDLE } from "../apps/web/src/platform/admin-state";
import {
  ARCHIVED_DOES_NOT_BLOCK,
  DOMAINS,
  RETIREMENT_IS_NOT_DELETION,
  TEXT_IS_NOT_FILTERABLE,
  asTree,
  catalogRefusal
} from "../apps/web/src/platform/catalog";

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
 * UX-0006 §10 and §11.
 *
 * Both sections ask the experience to *prevent or explain*, and the platform
 * does the preventing — so these tests check that the refusals are real, that
 * what survived a refusal is what was there before, and that the screen says
 * the rules rather than restating them as logic of its own.
 */
suite("Increment I8 Admin catalog", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };

  const address = () => `ac-${randomUUID()}@example.test`;
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

  const root = async (domain: string, name = "Kök") =>
    (
      await send("POST", "/admin/categories", {
        body: { domain, name, slug: slug(), stableKey: key() },
        cookie: admin.cookie
      })
    ).json<CategoryResponse>();

  const child = async (parentId: string, name = "Çocuk") =>
    (
      await send("POST", "/admin/categories", {
        body: { name, parentId, slug: slug(), stableKey: key() },
        cookie: admin.cookie
      })
    ).json<CategoryResponse>();

  const categories = async () =>
    (await send("GET", "/admin/categories", { cookie: admin.cookie })).json<{
      categories: CategoryResponse[];
    }>().categories;

  const attribute = async (body: unknown) =>
    send("POST", "/admin/attributes", { body, cookie: admin.cookie });

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

  it("gives a child its parent's Domain and no way to change it", async () => {
    const parent = await root("REAL_ESTATE");
    const created = await child(parent.id);

    // §10 and AC-7. A root names one Domain; a child inherits it. There is no
    // route that accepts a new Domain, so the create form is the only place a
    // Domain is ever decided.
    expect(created.domain).toBe("REAL_ESTATE");
    expect(created.parentId).toBe(parent.id);
    expect(DOMAINS).toHaveLength(3);
  });

  it("refuses a cross-Domain move and leaves the hierarchy alone", async () => {
    const mobility = await root("MOBILITY");
    const technology = await root("TECHNOLOGY");
    const moving = await child(mobility.id);

    const refused = await send("PUT", `/admin/categories/${moving.id}/parent`, {
      body: { parentId: technology.id },
      cookie: admin.cookie
    });
    const after = (await categories()).find((c) => c.id === moving.id);

    // §10's prevented list, and §15's "preserves the last confirmed
    // definition" — which is the transaction's doing, not a cleanup.
    expect(refused.statusCode).toBeGreaterThanOrEqual(400);
    expect(refused.json<{ code: string }>().code).toBe(
      "CATEGORY_DOMAIN_MISMATCH"
    );
    expect(after?.parentId).toBe(mobility.id);
    expect(catalogRefusal("CATEGORY_DOMAIN_MISMATCH")).toMatch(
      /hiyerarşi değişmedi/iu
    );
  });

  it("refuses to put a Category underneath itself", async () => {
    const parent = await root("MOBILITY");
    const descendant = await child(parent.id);

    const refused = await send("PUT", `/admin/categories/${parent.id}/parent`, {
      body: { parentId: descendant.id },
      cookie: admin.cookie
    });

    expect(refused.json<{ code: string }>().code).toBe(
      "CATEGORY_ANCESTRY_CYCLE"
    );
    expect(catalogRefusal("CATEGORY_ANCESTRY_CYCLE")).toMatch(
      /kendi altında yer alamaz/iu
    );
  });

  it("keeps a Category open while an active child remains", async () => {
    const parent = await root("MOBILITY");
    await child(parent.id);

    const refused = await send(
      "POST",
      `/admin/categories/${parent.id}/retirement`,
      { cookie: admin.cookie }
    );
    const after = (await categories()).find((c) => c.id === parent.id);

    // §10. Refused, and the Category stays active — the screen says both
    // before the attempt, so the refusal is a reminder rather than news.
    expect(refused.statusCode).toBeGreaterThanOrEqual(400);
    expect(after?.active).toBe(true);
    expect(RETIREMENT_IS_NOT_DELETION).toMatch(/yerinde bırakır/iu);
    expect(ARCHIVED_DOES_NOT_BLOCK).toMatch(/açık tutmaz/u);
  });

  it("keeps a retired Category rather than deleting it", async () => {
    const leaf = await root("TECHNOLOGY", "Yaprak");

    await send("POST", `/admin/categories/${leaf.id}/retirement`, {
      cookie: admin.cookie
    });
    const after = (await categories()).find((c) => c.id === leaf.id);

    // AC-14. The definition survives, and the tree still shows it — hiding it
    // would hide the explanation for Offerings that still name it.
    expect(after).toBeDefined();
    expect(after?.active).toBe(false);
    expect(
      asTree(await categories()).some(({ category }) => category.id === leaf.id)
    ).toBe(true);
  });

  it("orders the tree so a child reads underneath its parent", async () => {
    const parent = await root("MOBILITY", "Araçlar");
    const first = await child(parent.id, "Ağır vasıta");
    const second = await child(parent.id, "Otomobil");

    const tree = asTree(await categories());
    const parentAt = tree.findIndex((e) => e.category.id === parent.id);
    const firstAt = tree.findIndex((e) => e.category.id === first.id);
    const secondAt = tree.findIndex((e) => e.category.id === second.id);

    // The hierarchy is the thing being managed, so it is legible without the
    // page drawing one: children follow their parent, deeper.
    expect(firstAt).toBeGreaterThan(parentAt);
    expect(secondAt).toBeGreaterThan(firstAt);
    expect(tree[firstAt]?.depth).toBe((tree[parentAt]?.depth ?? 0) + 1);
  });

  it("offers only same-Domain parents rather than letting somebody find out", async () => {
    const mobility = await root("MOBILITY", "Araçlar");
    const technology = await root("TECHNOLOGY", "Cihazlar");
    const moving = await child(mobility.id, "Otomobil");

    const markup = renderToStaticMarkup(
      createElement(ReparentCategory, {
        action: () => Promise.resolve(ADMIN_IDLE),
        categories: [mobility, technology, moving],
        category: moving
      })
    );

    // Not a second rule — the platform refuses a cross-Domain parent anyway.
    // Offering one would be inviting somebody to do the thing §10 says the
    // experience prevents, and letting them learn it by being refused.
    expect(markup).toContain(mobility.id);
    expect(markup).not.toContain(technology.id);
  });

  it("refuses a Text Attribute that claims to be filterable", async () => {
    const category = await root("MOBILITY");

    const refused = await attribute({
      categoryIds: [category.id],
      comparable: false,
      filterable: true,
      name: "Açıklama",
      stableKey: key(),
      valueKind: "TEXT"
    });

    // §11. PRD-0002 §10.1 leaves Text out of V1 filtering, and the platform
    // refuses it — so the form says the rule rather than disabling a control
    // and leaving an Admin to wonder whether they misread it.
    expect(refused.statusCode).toBeGreaterThanOrEqual(400);
    expect(TEXT_IS_NOT_FILTERABLE).toMatch(/filtre olamaz/iu);
  });

  it("refuses to change a value kind that Offerings already depend on", async () => {
    const category = await root("MOBILITY");
    const created = await attribute({
      categoryIds: [category.id],
      comparable: false,
      filterable: false,
      name: "Kilometre",
      stableKey: key(),
      valueKind: "NUMBER"
    });
    const definition = created.json<AttributeResponse>();

    const account = await signUp();
    const business = await send("POST", "/businesses", {
      body: { name: "Kartal Motors", slug: slug() },
      cookie: account.cookie
    });
    const businessId = business.json<{ id: string }>().id;
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });
    const offering = await send("POST", `/businesses/${businessId}/offerings`, {
      body: { categoryId: category.id, slug: slug(), title: "Kırmızı araba" },
      cookie: account.cookie
    });
    const offeringId = offering.json<{ id: string }>().id;
    await send(
      "PUT",
      `/businesses/${businessId}/offerings/${offeringId}/content`,
      {
        body: {
          attributes: [
            { attributeId: definition.id, kind: "NUMBER", number: 120000 }
          ],
          categoryId: category.id,
          summary: null,
          title: "Kırmızı araba"
        },
        cookie: account.cookie
      }
    );
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/publication`,
      { cookie: account.cookie }
    );

    const refused = await send(
      "PUT",
      `/admin/attributes/${definition.id}/value-kind`,
      { body: { valueKind: "TEXT" }, cookie: admin.cookie }
    );
    const after = (
      await send("GET", "/admin/attributes", { cookie: admin.cookie })
    )
      .json<{ attributes: AttributeResponse[] }>()
      .attributes.find((a) => a.id === definition.id);

    // §11. The change would silently alter values Offerings already hold, so
    // it is refused and the last confirmed definition survives.
    expect(refused.statusCode).toBeGreaterThanOrEqual(400);
    expect(refused.json<{ code: string }>().code).toBe(
      "ATTRIBUTE_MUTATION_BLOCKED"
    );
    expect(after?.valueKind).toBe("NUMBER");
    expect(catalogRefusal("ATTRIBUTE_MUTATION_BLOCKED")).toMatch(
      /sessizce bozar ya da siler/iu
    );
  });
});
