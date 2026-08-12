import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { describe, expect, it, beforeAll, beforeEach, afterAll } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import {
  DIRECT_CONTACT_FIELDS,
  FIELD_LABELS,
  formValues,
  GROUP_COPY,
  PUBLIC_IDENTITY_FIELDS,
  REQUIRED_FIELD
} from "../apps/web/src/business/information";
import { publicBusinessIdentity } from "../modules/business/src/index.js";

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
 * UX-0005 §7 Business Information.
 *
 * The screen's one real responsibility is a distinction: what strangers can
 * read, and what only a signed-in person who asks to make contact can. The
 * data model already separates them; this makes sure the form does too, and
 * that saving is a replacement rather than a merge — because removal is
 * expressed by leaving a field blank and nothing else.
 */
suite("Increment I8 Business Information", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;

  const address = () => `inf-${randomUUID()}@example.test`;
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

  const owner = async () => {
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
    const cookie = `commerce_session=${cookies.find((c) => c.name === "commerce_session")?.value ?? ""}`;
    const created = await send("POST", "/businesses", {
      body: { name: "Kartal Motors", slug: slug() },
      cookie
    });
    return { businessId: created.json<{ id: string }>().id, cookie };
  };

  const information = async (business: {
    businessId: string;
    cookie: string;
  }) =>
    (
      await send("GET", `/businesses/${business.businessId}/information`, {
        cookie: business.cookie
      })
    ).json<Record<string, string | null>>();

  const complete = {
    contactEmail: "satis@kartal.test",
    contactTelephone: "+90 212 000 0000",
    contactUrl: "https://kartal.test",
    logoUrl: "https://kartal.test/logo.png",
    name: "Kartal Motors",
    shortDescription: "İkinci el araç"
  };

  beforeAll(async () => {
    process.env.ENABLE_TEST_PRINCIPAL = "false";
    process.env.NODE_ENV = "test";
    const { createApiApp } = await import("../apps/api/src/bootstrap.js");
    app = await createApiApp({ logLevel: "fatal" });
    processor = new OutboxProcessor({ dispatcher, publicWebUrl: ORIGIN });
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

  it("keeps the public identity set and Direct Contact in two groups", () => {
    // §7. Two lists rather than one annotated list, because the distinction is
    // the reason the form has two headings. `US-BUS-F02-001` AC-6 fixes the
    // public set at exactly these three.
    expect([...PUBLIC_IDENTITY_FIELDS]).toEqual([
      "name",
      "logoUrl",
      "shortDescription"
    ]);
    expect([...DIRECT_CONTACT_FIELDS]).toEqual([
      "contactTelephone",
      "contactEmail",
      "contactUrl"
    ]);
    for (const field of DIRECT_CONTACT_FIELDS)
      expect(PUBLIC_IDENTITY_FIELDS).not.toContain(field);
  });

  it("says on screen which half strangers can read", () => {
    // The person filling the form in is exactly who needs to know, so it is
    // stated rather than left to be inferred from the grouping.
    expect(GROUP_COPY.identity).toMatch(/publicly/u);
    expect(GROUP_COPY.contact).toMatch(/never on the public site/u);
  });

  it("composes a public identity that carries no contact channel", async () => {
    const business = await owner();
    await send("PUT", `/businesses/${business.businessId}/information`, {
      body: complete,
      cookie: business.cookie
    });
    const stored = await information(business);

    const composed = publicBusinessIdentity({
      logoUrl: stored.logoUrl,
      name: stored.name ?? "",
      publicExposure: "ELIGIBLE",
      shortDescription: stored.shortDescription
    });

    // The screen's two groups and the domain's public composition agree: what
    // the form calls public is exactly what a stranger can be shown, and the
    // three contact channels have no representation in it at all.
    expect(Object.keys(composed ?? {}).sort()).toEqual([
      "logoUrl",
      "name",
      "shortDescription"
    ]);
    expect(JSON.stringify(composed)).not.toContain("satis@kartal.test");
    expect(JSON.stringify(composed)).not.toContain("+90 212 000 0000");
  });

  it("fills the form from what is stored, blank for absent", async () => {
    const business = await owner();
    const stored = await information(business);

    const values = formValues({
      contactEmail: stored.contactEmail,
      contactTelephone: stored.contactTelephone,
      contactUrl: stored.contactUrl,
      id: stored.id ?? "",
      logoUrl: stored.logoUrl,
      name: stored.name ?? "",
      publicExposure: "ELIGIBLE",
      shortDescription: stored.shortDescription,
      slug: stored.slug ?? "",
      status: stored.status ?? ""
    });

    // A newly created Business supplies nothing optional, and the form shows
    // that as empty fields rather than as absent ones — a field that was not
    // rendered could never be filled in.
    expect(values.name).toBe("Kartal Motors");
    expect(values.contactEmail).toBe("");
    expect(values.logoUrl).toBe("");
    expect(Object.keys(values).sort()).toEqual(
      [...DIRECT_CONTACT_FIELDS, ...PUBLIC_IDENTITY_FIELDS].sort()
    );
  });

  it("treats a blank optional field as removal", async () => {
    const business = await owner();
    await send("PUT", `/businesses/${business.businessId}/information`, {
      body: complete,
      cookie: business.cookie
    });
    const before = await information(business);

    await send("PUT", `/businesses/${business.businessId}/information`, {
      body: { ...complete, contactTelephone: "", logoUrl: "" },
      cookie: business.cookie
    });
    const after = await information(business);

    // `US-BUS-F02-001` AC-4. Leaving a field blank is how a Business stops
    // supplying it, which is why the form submits every field every time —
    // an omitted field would make removal and "unchanged" the same request.
    expect(before.contactTelephone).toBe("+90 212 000 0000");
    expect(after.contactTelephone).toBeNull();
    expect(after.logoUrl).toBeNull();
    expect(after.contactEmail).toBe("satis@kartal.test");
  });

  it("refuses to save an empty display name", async () => {
    const business = await owner();
    await send("PUT", `/businesses/${business.businessId}/information`, {
      body: complete,
      cookie: business.cookie
    });

    const emptied = await send(
      "PUT",
      `/businesses/${business.businessId}/information`,
      { body: { ...complete, name: "   " }, cookie: business.cookie }
    );
    const after = await information(business);

    // §7 and AC-3. The one field that cannot be removed, and the refusal
    // leaves the last confirmed information exactly as it was (§15).
    expect(REQUIRED_FIELD).toBe("name");
    expect(emptied.statusCode).toBe(400);
    expect(after.name).toBe("Kartal Motors");
    expect(after.contactEmail).toBe("satis@kartal.test");
  });

  it("changes no moderation, exposure or lifecycle by saving", async () => {
    const business = await owner();
    const before = await pool.query<{ exposure: string; moderation: string }>(
      `select b.public_exposure::text as exposure,
         coalesce(m.status::text,'UNRESTRICTED') as moderation
       from business b
       left join business_moderation_state m on m.business_id = b.id
       where b.id = $1`,
      [business.businessId]
    );

    await send("PUT", `/businesses/${business.businessId}/information`, {
      body: complete,
      cookie: business.cookie
    });
    const after = await pool.query<{ exposure: string; moderation: string }>(
      `select b.public_exposure::text as exposure,
         coalesce(m.status::text,'UNRESTRICTED') as moderation
       from business b
       left join business_moderation_state m on m.business_id = b.id
       where b.id = $1`,
      [business.businessId]
    );

    // §7. Editing information changes no moderation status, no exposure input,
    // no Offering lifecycle and no Completion — and the save path has no
    // statement that could.
    expect(after.rows[0]).toEqual(before.rows[0]);
  });

  it("has a label for every field it renders", () => {
    // A field added to either group without a label would render with an empty
    // one, so the two lists are checked against each other.
    expect(Object.keys(FIELD_LABELS).sort()).toEqual(
      [...DIRECT_CONTACT_FIELDS, ...PUBLIC_IDENTITY_FIELDS].sort()
    );
  });
});
