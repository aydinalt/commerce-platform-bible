import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type {
  AssignableCategories,
  DecisionContextResponse,
  ErrorEnvelope
} from "@commerce/contracts";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { SHORTFALL_COPY } from "../apps/web/src/business/action-outcome";
import { SELECTION_LOST } from "../apps/web/src/decision/copy";

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
 * The three gaps `I8_EXPERIENCE_SURFACES_CLOSURE.md` recorded as weaker than
 * they looked.
 *
 * Two were real and are closed here by making the platform say what it already
 * knew. The third was a mistake in the record: the error envelope carries
 * `fieldErrors`, and the publication path was already publishing its shortfalls
 * — the web client was dropping them, and the correction path was sending them
 * where the envelope could not carry them.
 */
suite("Increment I8 recorded gaps", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

  const address = () => `rg-${randomUUID()}@example.test`;
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

  const owner = async () => {
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
    return { ...account, businessId };
  };

  const category = async (name: string, parentId?: string) =>
    (
      await send("POST", "/admin/categories", {
        body: {
          name,
          slug: slug(),
          stableKey: key(),
          ...(parentId === undefined ? { domain: "MOBILITY" } : { parentId })
        },
        cookie: admin.cookie
      })
    ).json<{ id: string }>().id;

  const assignable = async () =>
    (await send("GET", "/categories/assignable")).json<AssignableCategories>()
      .categories;

  beforeAll(async () => {
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
    categoryId = await category("Otomobil");
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

  it("tells a selection that fell away apart from one never made", async () => {
    const business = await owner();
    const created = await send(
      "POST",
      `/businesses/${business.businessId}/offerings`,
      {
        body: { categoryId, slug: slug(), title: "Kırmızı araba" },
        cookie: business.cookie
      }
    );
    const offeringId = created.json<{ id: string }>().id;
    await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${offeringId}/publication`,
      { cookie: business.cookie }
    );

    const entered = (
      await send("POST", "/decision/flows", { body: { offeringId } })
    ).json<DecisionContextResponse>();
    const before = entered;

    await send("PUT", `/decision/flows/${entered.decisionFlowId}/selection`, {
      body: { offeringId }
    });
    await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${offeringId}/retirement`,
      { cookie: business.cookie }
    );
    const after = (
      await send("GET", `/decision/flows/${entered.decisionFlowId}`)
    ).json<DecisionContextResponse>();

    // UX-0009 §16. Both read `selected: null`, and only one of them means
    // something was withdrawn — the difference was a fact the platform had and
    // had not published.
    expect(before.selected).toBeNull();
    expect(before.selectionLost).toBe(false);
    expect(after.selected).toBeNull();
    expect(after.selectionLost).toBe(true);
    // And the sentence says both halves: gone, and nothing completed.
    expect(SELECTION_LOST).toMatch(/hiçbir işlem tamamlanmadı/iu);
    const completions = await send(
      "GET",
      `/decision/flows/${entered.decisionFlowId}/completion`
    );
    expect(
      completions.json<{ affiliateHandoff: unknown }>().affiliateHandoff
    ).toBeNull();
  });

  it("publishes which conditions of the minimum failed", async () => {
    const business = await owner();
    const strict = await category("Ticari");
    const required = await send("POST", "/admin/attributes", {
      body: {
        categoryIds: [strict],
        comparable: false,
        filterable: false,
        name: "Ruhsat",
        options: [],
        stableKey: key(),
        valueKind: "TEXT"
      },
      cookie: admin.cookie
    });
    await send(
      "PUT",
      `/admin/attributes/${required.json<{ id: string }>().id}/required-for-publication`,
      { body: { requiredForPublication: true }, cookie: admin.cookie }
    );
    const created = await send(
      "POST",
      `/businesses/${business.businessId}/offerings`,
      {
        body: { categoryId: strict, slug: slug(), title: "Kırmızı araba" },
        cookie: business.cookie
      }
    );
    const offeringId = created.json<{ id: string }>().id;

    const refused = await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${offeringId}/publication`,
      { cookie: business.cookie }
    );
    const envelope = refused.json<ErrorEnvelope>();

    // The envelope has always carried `fieldErrors`; the closure record was
    // wrong to say the shortfall was unavailable. It is here, named, and the
    // screen relays it rather than composing a second description of the
    // minimum.
    expect(refused.statusCode).toBe(422);
    expect(envelope.code).toBe("PUBLICATION_MINIMUM_NOT_SATISFIED");
    expect(envelope.fieldErrors?.publicationMinimum).toContain(
      "REQUIRED_ATTRIBUTE_MISSING"
    );
    for (const shortfall of envelope.fieldErrors?.publicationMinimum ?? [])
      expect(SHORTFALL_COPY[shortfall]).toBeTruthy();
  });

  it("carries a correction's shortfalls where the envelope can hold them", async () => {
    const business = await owner();
    const created = await send(
      "POST",
      `/businesses/${business.businessId}/offerings`,
      {
        body: { categoryId, slug: slug(), title: "Kırmızı araba" },
        cookie: business.cookie
      }
    );
    const offeringId = created.json<{ id: string }>().id;
    await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${offeringId}/publication`,
      { cookie: business.cookie }
    );
    await send("POST", `/admin/businesses/${business.businessId}/restriction`, {
      cookie: admin.cookie
    });
    await send(
      "POST",
      `/admin/businesses/${business.businessId}/correction-requests`,
      {
        body: { contentArea: "TITLE", offeringId, target: "OFFERING_CONTENT" },
        cookie: admin.cookie
      }
    );
    const notices = (
      await send(
        "GET",
        `/businesses/${business.businessId}/correction-notices`,
        {
          cookie: business.cookie
        }
      )
    ).json<{ notices: { id: string }[] }>().notices;

    // A correction that empties the title leaves a Published Offering below the
    // minimum, which is refused — and now says which part.
    const refused = await send(
      "PUT",
      `/businesses/${business.businessId}/correction-notices/${notices[0]?.id ?? ""}/response`,
      { body: { area: "TITLE", title: "  " }, cookie: business.cookie }
    );

    // Either the contract refuses a blank title outright, or the minimum does.
    // Both are correct; what matters is that a minimum refusal names its
    // shortfalls rather than sending them where the envelope drops them.
    if (
      refused.json<ErrorEnvelope>().code === "PUBLICATION_MINIMUM_NOT_SATISFIED"
    )
      expect(
        refused.json<ErrorEnvelope>().fieldErrors?.publicationMinimum
      ).toContain("TITLE_MISSING");
    else expect(refused.statusCode).toBe(400);
  });

  it("offers exactly the Categories creation would accept", async () => {
    const business = await owner();
    const parent = await category("Araçlar");
    const leaf = await category("Otomobil", parent);

    const offered = await assignable();
    const ids = offered.map((entry) => entry.id);

    // The branch is not offered and the leaf is, which is the same predicate
    // creation enforces.
    expect(ids).toContain(leaf);
    expect(ids).not.toContain(parent);

    const accepted = await send(
      "POST",
      `/businesses/${business.businessId}/offerings`,
      {
        body: { categoryId: leaf, slug: slug(), title: "Kırmızı araba" },
        cookie: business.cookie
      }
    );
    const refused = await send(
      "POST",
      `/businesses/${business.businessId}/offerings`,
      {
        body: { categoryId: parent, slug: slug(), title: "Kırmızı araba" },
        cookie: business.cookie
      }
    );

    expect(accepted.statusCode).toBe(201);
    expect(refused.statusCode).toBeGreaterThanOrEqual(400);
    // The path is the whole ancestry, so two leaves sharing a name are still
    // distinguishable in a picker.
    expect(offered.find((entry) => entry.id === leaf)?.path).toEqual([
      "Araçlar",
      "Otomobil"
    ]);
  });

  it("stops offering a Category the moment it stops being assignable", async () => {
    const soon = await category("Geçici");

    expect((await assignable()).map((e) => e.id)).toContain(soon);
    await send("POST", `/admin/categories/${soon}/retirement`, {
      cookie: admin.cookie
    });

    // Retirement is not deletion, so the Category is still there — it is
    // simply no longer somewhere an Offering may go, and the picker follows
    // the same rule rather than a cached list.
    expect((await assignable()).map((e) => e.id)).not.toContain(soon);
  });
});
