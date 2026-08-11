import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { offeringPresentationSchema } from "../packages/contracts/src/index.js";

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
 * `US-OFR-F05-001` Full Offering Detail Presentation.
 *
 * The Story is a product minimum plus an occurrence, and the two are joined:
 * `Offering Presentation Open` may exist only where a complete eligible
 * Presentation was actually composed. So the cases below check the content and
 * the occurrence together — a refusal that still counted an open would satisfy
 * neither AC-8 nor AC-9.
 */
suite("Increment I4 complete Offering Presentation", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let rootId: string;
  let leafId: string;
  let mileageId: string;
  let servicedId: string;
  let fuel: { id: string; options: { id: string; label: string }[] };

  const address = () => `prs-${randomUUID()}@example.test`;
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

  const publish = async (input: {
    attributes?: unknown[];
    business?: Record<string, unknown>;
    summary?: string;
  }) => {
    const account = await signUp();
    const created = await send("POST", "/businesses", {
      body: { name: "Kartal Motors", slug: slug() },
      cookie: account.cookie
    });
    const businessId = created.json<{ id: string }>().id;
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });
    if (input.business)
      await send("PUT", `/businesses/${businessId}/information`, {
        body: { name: "Kartal Motors", ...input.business },
        cookie: account.cookie
      });

    const offeringSlug = slug();
    const offering = await send("POST", `/businesses/${businessId}/offerings`, {
      body: {
        categoryId: leafId,
        slug: offeringSlug,
        title: "Kırmızı spor araba",
        ...(input.summary === undefined ? {} : { summary: input.summary })
      },
      cookie: account.cookie
    });
    const offeringId = offering.json<{ id: string }>().id;
    await send(
      "PUT",
      `/businesses/${businessId}/offerings/${offeringId}/content`,
      {
        body: {
          attributes: input.attributes ?? [],
          categoryId: leafId,
          title: "Kırmızı spor araba",
          ...(input.summary === undefined ? {} : { summary: input.summary })
        },
        cookie: account.cookie
      }
    );
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/publication`,
      { cookie: account.cookie }
    );
    return { businessId, cookie: account.cookie, offeringId, offeringSlug };
  };

  const present = async (offeringSlug: string) => {
    const response = await send("GET", `/offerings/${offeringSlug}`);
    return {
      response,
      view: offeringPresentationSchema.parse(response.json())
    };
  };

  const opens = async (offeringId: string) => {
    const counted = await pool.query<{ count: string }>(
      `select count(*)::text as count
       from offering_presentation_open where offering_id = $1`,
      [offeringId]
    );
    return Number(counted.rows[0]?.count ?? "0");
  };

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

    const root = await send("POST", "/admin/categories", {
      body: {
        domain: "MOBILITY",
        name: "Araçlar",
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });
    rootId = root.json<{ id: string }>().id;
    const leaf = await send("POST", "/admin/categories", {
      body: {
        name: "Otomobil",
        parentId: rootId,
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });
    leafId = leaf.json<{ id: string }>().id;

    const mileage = await send("POST", "/admin/attributes", {
      body: {
        categoryIds: [leafId],
        comparable: true,
        filterable: true,
        name: "Kilometre",
        stableKey: key(),
        unit: "km",
        valueKind: "NUMBER"
      },
      cookie: admin.cookie
    });
    mileageId = mileage.json<{ id: string }>().id;

    const serviced = await send("POST", "/admin/attributes", {
      body: {
        categoryIds: [leafId],
        comparable: false,
        filterable: true,
        name: "Servis bakımlı",
        stableKey: key(),
        valueKind: "BOOLEAN"
      },
      cookie: admin.cookie
    });
    servicedId = serviced.json<{ id: string }>().id;

    const created = await send("POST", "/admin/attributes", {
      body: {
        categoryIds: [leafId],
        comparable: true,
        filterable: true,
        name: "Yakıt",
        options: [
          { label: "Benzin", stableKey: "PETROL" },
          { label: "Dizel", stableKey: "DIESEL" }
        ],
        stableKey: key(),
        valueKind: "MULTI_SELECT"
      },
      cookie: admin.cookie
    });
    fuel = created.json<{
      id: string;
      options: { id: string; label: string }[];
    }>();
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

  it("presents the product minimum", async () => {
    const { offeringSlug } = await publish({
      summary: "Tek elden, bakımlı."
    });

    const { view } = await present(offeringSlug);

    // AC-2. Title, Category context, description and public Business identity.
    // The Category context is the whole path, root first — where an Offering
    // sits is part of what it is.
    expect(view.title).toBe("Kırmızı spor araba");
    expect(view.categoryPath).toEqual(["Araçlar", "Otomobil"]);
    expect(view.description).toBe("Tek elden, bakımlı.");
    expect(view.business.name).toBe("Kartal Motors");
  });

  it("keeps the governed unit and the allowed-value labels", async () => {
    const { offeringSlug } = await publish({
      attributes: [
        { attributeId: mileageId, kind: "NUMBER", number: 42_000 },
        {
          attributeId: fuel.id,
          kind: "SELECT",
          optionIds: fuel.options.map((option) => option.id)
        }
      ]
    });

    const { view } = await present(offeringSlug);

    // AC-3. The unit comes from the definition rather than the value, and a
    // Multi Select reads as the labels a person chose rather than the
    // identifiers that stored them.
    const mileage = view.attributes.find((a) => a.attributeId === mileageId);
    expect(mileage?.number).toBe(42_000);
    expect(mileage?.unit).toBe("km");
    expect(
      view.attributes.find((a) => a.attributeId === fuel.id)?.optionLabels
    ).toEqual(["Benzin", "Dizel"]);
  });

  it("distinguishes an unanswered Attribute from an answered one", async () => {
    const { offeringSlug } = await publish({
      attributes: [{ attributeId: servicedId, kind: "BOOLEAN", boolean: false }]
    });

    const { view } = await present(offeringSlug);

    // AC-3 and AC-4. A `false` Boolean was supplied and an absent one was not;
    // reporting them the same way would invent an answer nobody gave.
    const serviced = view.attributes.find((a) => a.attributeId === servicedId);
    expect(serviced).toMatchObject({ boolean: false, supplied: true });
    const mileage = view.attributes.find((a) => a.attributeId === mileageId);
    expect(mileage).toMatchObject({ number: null, supplied: false });
  });

  it("continues without inventing absent media, description or values", async () => {
    const { offeringSlug } = await publish({});

    const { view } = await present(offeringSlug);

    // AC-4. Nothing was supplied beyond the minimum, and nothing was made up
    // to fill the gap — the Presentation is simply shorter.
    expect(view.visuals).toEqual([]);
    expect(view.description).toBeNull();
    expect(view.attributes.every((a) => !a.supplied)).toBe(true);
    expect(view.attributes.length).toBeGreaterThan(0);
  });

  it("shows no Attribute that does not apply to the Offering's Category", async () => {
    const elsewhere = await send("POST", "/admin/attributes", {
      body: {
        categoryIds: [rootId],
        comparable: false,
        filterable: false,
        name: "Yalnızca kökte",
        stableKey: key(),
        valueKind: "TEXT"
      },
      cookie: admin.cookie
    });
    const { offeringSlug } = await publish({});

    const { view } = await present(offeringSlug);

    // UX-0003 §8.4. Applicability decides the set, so an Attribute defined on
    // another Category is not merely empty here — it is not here.
    expect(
      view.attributes.some(
        (a) => a.attributeId === elsewhere.json<{ id: string }>().id
      )
    ).toBe(false);
  });

  it("excludes protected contact information from the Business identity", async () => {
    const { offeringSlug } = await publish({
      business: {
        contactEmail: "gizli@example.test",
        contactTelephone: "+90 555 000 00 00",
        contactUrl: "https://example.test/iletisim",
        shortDescription: "1998'den beri."
      }
    });

    const { response, view } = await present(offeringSlug);

    // AC-5. The three supplied channels exist on the Business and appear
    // nowhere in the public answer — not as a field, and not as a value.
    expect(view.business.shortDescription).toBe("1998'den beri.");
    expect(response.body).not.toContain("gizli@example.test");
    expect(response.body).not.toContain("555 000");
    expect(response.body).not.toContain("example.test/iletisim");
  });

  it("produces one occurrence for each successful Presentation", async () => {
    const { offeringId, offeringSlug } = await publish({});

    await present(offeringSlug);
    await present(offeringSlug);

    // AC-8. Two people looking is two occurrences; PRD-0006 Basic Analytics
    // will count them and cannot reconstruct them from anything else.
    expect(await opens(offeringId)).toBe(2);
  });

  it("produces no occurrence when Presentation cannot begin", async () => {
    const { businessId, cookie, offeringId, offeringSlug } = await publish({});
    await present(offeringSlug);
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/retirement`,
      { cookie }
    );

    const refused = await send("GET", `/offerings/${offeringSlug}`);

    // AC-8 and AC-9 together. Withholding the content and still counting the
    // open would be the worst of both: no one saw it, and the analytics say
    // they did.
    expect(refused.statusCode).toBe(404);
    expect(await opens(offeringId)).toBe(1);
  });

  it("produces no occurrence for an owner's management view", async () => {
    const { businessId, cookie, offeringId } = await publish({});

    await send("GET", `/businesses/${businessId}/offerings/${offeringId}`, {
      cookie
    });

    // PRD-0001 §8.2.1 excludes a management view in as many words. The owner
    // reading their own Offering is not a stranger evaluating it.
    expect(await opens(offeringId)).toBe(0);
  });
});
