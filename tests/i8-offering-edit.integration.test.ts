import { randomUUID } from "node:crypto";
import { createElement } from "react";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type {
  EditableOfferingContent,
  ManagedOffering
} from "@commerce/contracts";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import {
  ACTION_IDLE,
  EDIT_REFUSALS
} from "../apps/web/src/business/action-outcome";
import { ContentForm } from "../apps/web/src/app/businesses/[businessId]/offerings/[offeringId]/content-form";
import {
  NOT_SPECIFIED,
  fieldName,
  heldAsText,
  offersEdit,
  submittedValues
} from "../apps/web/src/business/offering-content";

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
 * UX-0005 §9, "Edit".
 *
 * The screen is two things at once — a reading of what an Offering holds and a
 * form for changing it — and which one it is comes from the entries the
 * Dashboard composed, not from a lifecycle test of its own. So these tests
 * check both halves against the platform: that the form is built from the
 * definitions the write path validates against, and that the write path
 * accepts exactly what the form produces.
 */
suite("Increment I8 Offering edit", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;
  let strictCategoryId: string;
  let requiredId: string;
  let textId: string;
  let numberId: string;
  let booleanId: string;
  let selectId: string;
  let selectOptions: { id: string; label: string }[];

  const address = () => `oe-${randomUUID()}@example.test`;
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
    const created = await send("POST", "/businesses", {
      body: { name: "Kartal Motors", slug: slug() },
      cookie: account.cookie
    });
    const businessId = created.json<{ id: string }>().id;
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });
    return { ...account, businessId };
  };

  type Owner = { businessId: string; cookie: string };

  const create = async (business: Owner, category = categoryId) =>
    (
      await send("POST", `/businesses/${business.businessId}/offerings`, {
        body: { categoryId: category, slug: slug(), title: "Kırmızı araba" },
        cookie: business.cookie
      })
    ).json<{ id: string }>().id;

  const read = async (business: Owner, offeringId: string) =>
    (
      await send(
        "GET",
        `/businesses/${business.businessId}/offerings/${offeringId}/content`,
        { cookie: business.cookie }
      )
    ).json<EditableOfferingContent>();

  const save = (business: Owner, offeringId: string, body: unknown) =>
    send(
      "PUT",
      `/businesses/${business.businessId}/offerings/${offeringId}/content`,
      { body, cookie: business.cookie }
    );

  const publish = (business: Owner, offeringId: string) =>
    send(
      "POST",
      `/businesses/${business.businessId}/offerings/${offeringId}/publication`,
      { cookie: business.cookie }
    );

  const defineAttribute = async (input: {
    categories?: string[];
    options?: string[];
    valueKind: string;
  }) => {
    const created = await send("POST", "/admin/attributes", {
      body: {
        categoryIds: input.categories ?? [categoryId],
        comparable: false,
        filterable: false,
        name: `Nitelik ${input.valueKind}`,
        options: (input.options ?? []).map((label) => ({
          label,
          stableKey: key()
        })),
        stableKey: key(),
        valueKind: input.valueKind
      },
      cookie: admin.cookie
    });
    if (created.statusCode !== 201)
      throw new Error(`attribute ${input.valueKind}: ${created.body}`);
    const body = created.json<{
      id: string;
      options: { id: string; label: string }[];
    }>();
    return { id: body.id, options: body.options };
  };

  const category = async (name: string) => {
    const created = await send("POST", "/admin/categories", {
      body: { domain: "MOBILITY", name, slug: slug(), stableKey: key() },
      cookie: admin.cookie
    });
    return created.json<{ id: string }>().id;
  };

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
    strictCategoryId = await category("Ticari");

    textId = (await defineAttribute({ valueKind: "TEXT" })).id;
    numberId = (await defineAttribute({ valueKind: "NUMBER" })).id;
    booleanId = (await defineAttribute({ valueKind: "BOOLEAN" })).id;
    const select = await defineAttribute({
      options: ["Kırmızı", "Mavi"],
      valueKind: "SINGLE_SELECT"
    });
    selectId = select.id;
    selectOptions = select.options;

    const required = await defineAttribute({
      categories: [strictCategoryId],
      valueKind: "TEXT"
    });
    requiredId = required.id;
    await send(
      "PUT",
      `/admin/attributes/${requiredId}/required-for-publication`,
      { body: { requiredForPublication: true }, cookie: admin.cookie }
    );
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

  it("hands the form the Attributes the Category applies, and only those", async () => {
    const business = await owner();
    const offeringId = await create(business);

    const content = await read(business, offeringId);

    // The definitions arrive with the values, so the form is built from what
    // governs this Offering rather than from a second request that could have
    // seen a different Category.
    const ids = content.applicableAttributes.map((a) => a.id).sort();
    expect(ids).toEqual([textId, numberId, booleanId, selectId].sort());
    expect(ids).not.toContain(requiredId);
    expect(
      content.applicableAttributes.find((a) => a.id === selectId)?.options
    ).toHaveLength(2);
    // A Text Attribute has no allowed values, and says so by having none.
    expect(
      content.applicableAttributes.find((a) => a.id === textId)?.options
    ).toEqual([]);
  });

  it("sends the kind each definition declares, whatever the form submitted", async () => {
    const business = await owner();
    const offeringId = await create(business);
    const content = await read(business, offeringId);

    const form = new FormData();
    form.set(fieldName(textId), "  Metin  ");
    form.set(fieldName(numberId), "42");
    form.set(fieldName(booleanId), "true");
    form.set(fieldName(selectId), selectOptions[0]?.id ?? "");

    const values = submittedValues(content.applicableAttributes, form);

    // Four strings went in; four correctly-kinded values came out. Nothing was
    // inferred from the text — each value's kind is its definition's.
    expect(values).toEqual(
      expect.arrayContaining([
        { attributeId: textId, kind: "TEXT", text: "Metin" },
        { attributeId: numberId, kind: "NUMBER", number: 42 },
        { attributeId: booleanId, boolean: true, kind: "BOOLEAN" },
        {
          attributeId: selectId,
          kind: "SELECT",
          optionIds: [selectOptions[0]?.id]
        }
      ])
    );

    // And the platform accepts exactly that, which is the point: the form and
    // the write path agree because they read one description of the Attribute.
    const saved = await save(business, offeringId, {
      attributes: values,
      categoryId: content.categoryId,
      summary: null,
      title: content.title
    });
    expect(saved.statusCode).toBe(200);
  });

  it("treats a blank field as a value the Offering no longer holds", async () => {
    const business = await owner();
    const offeringId = await create(business);
    const content = await read(business, offeringId);

    const filled = new FormData();
    filled.set(fieldName(textId), "Metin");
    await save(business, offeringId, {
      attributes: submittedValues(content.applicableAttributes, filled),
      categoryId: content.categoryId,
      summary: null,
      title: content.title
    });

    const cleared = new FormData();
    cleared.set(fieldName(textId), "   ");
    const values = submittedValues(content.applicableAttributes, cleared);
    expect(values).toEqual([]);

    await save(business, offeringId, {
      attributes: values,
      categoryId: content.categoryId,
      summary: null,
      title: content.title
    });
    const after = await read(business, offeringId);
    // The save is a replacement, so clearing a field is how a Business stops
    // saying something — not a second "remove" action it has to find.
    expect(after.attributes).toEqual([]);
  });

  it("says nothing rather than false for a Boolean the Offering has no answer for", async () => {
    const business = await owner();
    const offeringId = await create(business);
    const content = await read(business, offeringId);

    const form = new FormData();
    form.set(fieldName(booleanId), "");

    expect(submittedValues(content.applicableAttributes, form)).toEqual([]);
    const attribute = content.applicableAttributes.find(
      (a) => a.id === booleanId
    );
    expect(heldAsText(content, attribute!)).toBe(NOT_SPECIFIED);
  });

  it("offers the form only where the Dashboard offered the entry", async () => {
    const business = await owner();
    const offeringId = await create(business);
    await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${offeringId}/retirement`,
      { cookie: business.cookie }
    );

    const dashboard = await send(
      "GET",
      `/businesses/${business.businessId}/dashboard`,
      { cookie: business.cookie }
    );
    const archived = dashboard
      .json<{ inventory: Record<"ARCHIVED", ManagedOffering[]> }>()
      .inventory.ARCHIVED.find((offering) => offering.id === offeringId);

    // The screen consults one answer, and it is the composed one. Nothing here
    // knows that Archived is view-only.
    expect(archived).toBeDefined();
    expect(offersEdit(archived?.entries ?? [])).toBe(false);
    const refused = await save(business, offeringId, {
      attributes: [],
      categoryId,
      summary: null,
      title: "Yeni başlık"
    });
    expect(refused.statusCode).toBe(403);
    expect(refused.json<{ code: string }>().code).toBe("OFFERING_ARCHIVED");
  });

  it("keeps a Restricted Business editing its Draft and nothing published", async () => {
    const business = await owner();
    const draftId = await create(business);
    const publishedId = await create(business);
    const content = await read(business, publishedId);
    await save(business, publishedId, {
      attributes: [],
      categoryId: content.categoryId,
      summary: null,
      title: "Yayınlanacak"
    });
    await publish(business, publishedId);
    await send("POST", `/admin/businesses/${business.businessId}/restriction`, {
      cookie: admin.cookie
    });

    const onDraft = await save(business, draftId, {
      attributes: [],
      categoryId,
      summary: null,
      title: "Hâlâ düzenlenebilir"
    });
    const onPublished = await save(business, publishedId, {
      attributes: [],
      categoryId,
      summary: null,
      title: "Düzenlenemez"
    });

    // `US-BUS-F03-001` AC-5 and `US-OFR-F02-001` AC-8, from the screen's side:
    // a Restricted owner is exactly the person who may need to fix a Draft.
    expect(onDraft.statusCode).toBe(200);
    expect(onPublished.statusCode).toBe(403);
    expect(onPublished.json<{ code: string }>().code).toBe(
      "BUSINESS_RESTRICTED"
    );
    // And the sentence says what was not saved rather than what was refused in
    // the abstract.
    expect(EDIT_REFUSALS.BUSINESS_RESTRICTED).toMatch(/nothing was saved/iu);
  });

  it("refuses a save that would leave a Published Offering incomplete", async () => {
    const business = await owner();
    const offeringId = await create(business, strictCategoryId);
    const content = await read(business, offeringId);
    const form = new FormData();
    form.set(fieldName(requiredId), "34 ABC 123");
    await save(business, offeringId, {
      attributes: submittedValues(content.applicableAttributes, form),
      categoryId: content.categoryId,
      summary: null,
      title: "Tam bir başlık"
    });
    expect((await publish(business, offeringId)).statusCode).toBe(200);

    // The same form with the required field cleared — the ordinary way a
    // person removes a value.
    const refused = await save(business, offeringId, {
      attributes: submittedValues(content.applicableAttributes, new FormData()),
      categoryId: content.categoryId,
      summary: null,
      title: "Tam bir başlık"
    });

    // `US-OFR-F02-001` AC-5. The whole edit is refused rather than partly
    // applied, so something already public never becomes quietly incomplete.
    expect(refused.statusCode).toBe(422);
    expect(refused.json<{ code: string }>().code).toBe(
      "PUBLICATION_MINIMUM_NOT_SATISFIED"
    );
    const after = await read(business, offeringId);
    expect(after.attributes).toHaveLength(1);
    expect(after.status).toBe("PUBLISHED");
    // The sentence names the save, not a publication that was never asked for.
    expect(EDIT_REFUSALS.PUBLICATION_MINIMUM_NOT_SATISFIED).toMatch(
      /not saved/iu
    );
  });

  it("changes no lifecycle by saving", async () => {
    const business = await owner();
    const offeringId = await create(business);
    const content = await read(business, offeringId);
    await save(business, offeringId, {
      attributes: [],
      categoryId: content.categoryId,
      summary: null,
      title: "Yayına hazır"
    });
    await publish(business, offeringId);
    const published = await read(business, offeringId);

    await save(business, offeringId, {
      attributes: [],
      categoryId: content.categoryId,
      summary: "Yeni özet",
      title: "Yayına hazır"
    });
    const after = await read(business, offeringId);

    // AC-6 and AC-10. There is no lifecycle field to send, so this is a fact
    // about the contract's shape rather than about this request's contents.
    expect(after.status).toBe("PUBLISHED");
    expect(after.publishedAt).toBe(published.publishedAt);
    expect(after.summary).toBe("Yeni özet");
  });

  it("names a held value that is no longer offered instead of showing a blank", () => {
    const retired = randomUUID();
    const content: EditableOfferingContent = {
      applicableAttributes: [
        {
          id: selectId,
          name: "Renk",
          options: [{ id: selectOptions[0]!.id, label: "Kırmızı" }],
          requiredForPublication: false,
          unit: null,
          valueKind: "SINGLE_SELECT"
        }
      ],
      attributes: [
        {
          attributeId: selectId,
          booleanValue: null,
          numberValue: null,
          optionIds: [retired],
          textValue: null
        }
      ],
      businessId: randomUUID(),
      categoryId,
      id: randomUUID(),
      publishedAt: null,
      slug: "s",
      status: "DRAFT",
      summary: null,
      title: "t",
      version: 1
    };

    // A retired allowed value may stay on an Offering that already had it, but
    // no save may choose it again — so it has no label to show and the screen
    // says that rather than rendering nothing.
    expect(heldAsText(content, content.applicableAttributes[0]!)).toBe(
      "A value that is no longer offered"
    );
  });

  it("renders one labelled control per applicable Attribute", async () => {
    const business = await owner();
    const offeringId = await create(business);
    const content = await read(business, offeringId);

    const markup = renderToStaticMarkup(
      createElement(ContentForm, {
        action: () => Promise.resolve(ACTION_IDLE),
        content
      })
    );

    // The definition decides the control: a Boolean cannot be a text box and a
    // Select cannot be free text, because the form reads the same kind the API
    // checks the submission against.
    expect(markup).toContain(`id="${fieldName(textId)}"`);
    expect(markup).toContain(`type="number"`);
    expect(markup).toContain(`<select id="${fieldName(booleanId)}"`);
    expect(markup).toContain(`<select id="${fieldName(selectId)}"`);
    expect(markup).toContain(selectOptions[0]?.label);
    // The one thing this screen must not offer: a way to move the lifecycle.
    expect(markup).not.toMatch(/publish|retire/iu);
  });
});
