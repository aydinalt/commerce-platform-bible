import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { ownedBusinessSchema } from "../packages/contracts/src/index.js";

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
 * `US-BUS-F03-001` Business Moderation and Public Exposure Input.
 *
 * Restriction is often written as though it locked the door. It does not: it
 * withdraws three specific acts and leaves everything else standing. So most of
 * this suite is about what a Restricted owner *keeps* — and about the things
 * restriction and restoration must be careful not to move on their own.
 */
suite("Increment I6 Business restriction and restoration", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let leafId: string;

  const address = () => `mod-${randomUUID()}@example.test`;
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

  /// A Business with one Published Offering and one Draft, which is the
  /// smallest shape that can show what restriction does and does not touch.
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

    const offer = async (publish: boolean) => {
      const offering = await send(
        "POST",
        `/businesses/${businessId}/offerings`,
        {
          body: { categoryId: leafId, slug: slug(), title: "Kırmızı araba" },
          cookie: account.cookie
        }
      );
      const offeringId = offering.json<{ id: string }>().id;
      await send(
        "PUT",
        `/businesses/${businessId}/offerings/${offeringId}/content`,
        {
          body: { attributes: [], categoryId: leafId, title: "Kırmızı araba" },
          cookie: account.cookie
        }
      );
      if (publish)
        await send(
          "POST",
          `/businesses/${businessId}/offerings/${offeringId}/publication`,
          { cookie: account.cookie }
        );
      return offeringId;
    };

    return {
      businessId,
      cookie: account.cookie,
      draftId: await offer(false),
      publishedId: await offer(true),
      userId: account.userId
    };
  };

  const moderate = (
    businessId: string,
    action: "restriction" | "restoration"
  ) =>
    send("POST", `/admin/businesses/${businessId}/${action}`, {
      cookie: admin.cookie
    });

  const businessRow = async (businessId: string) => {
    const row = await pool.query<{ exposure: string; moderation: string }>(
      `select b.public_exposure::text as exposure,
         coalesce(m.status::text, 'UNRESTRICTED') as moderation
       from business b
       left join business_moderation_state m on m.business_id = b.id
       where b.id = $1`,
      [businessId]
    );
    return row.rows[0];
  };

  const findable = async (offeringId: string) => {
    const row = await pool.query(
      `select 1 from offering_search_projection where offering_id = $1`,
      [offeringId]
    );
    return row.rowCount === 1;
  };

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    const { createApiApp } = await import("../apps/api/src/bootstrap.js");
    app = await createApiApp({ logLevel: "fatal" });
    processor = new OutboxProcessor({ dispatcher, pool, publicWebUrl: ORIGIN });

    admin = await signUp();
    await pool.query(
      `insert into admin_authorization (user_id, granted_by) values ($1,'test')`,
      [admin.userId]
    );
    await send("PUT", "/auth/me/admin-context", { cookie: admin.cookie });

    const leaf = await send("POST", "/admin/categories", {
      body: {
        domain: "MOBILITY",
        name: "Otomobil",
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });
    leafId = leaf.json<{ id: string }>().id;
  });

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    dispatcher.delivered.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("uses exactly two moderation values and maps each to one exposure input", async () => {
    const business = await owner();

    const unrestricted = await businessRow(business.businessId);
    await moderate(business.businessId, "restriction");
    const restricted = await businessRow(business.businessId);

    // AC-1, AC-2 and AC-3. Two values, and the exposure input is not a second
    // decision — it follows.
    expect(unrestricted).toEqual({
      exposure: "ELIGIBLE",
      moderation: "UNRESTRICTED"
    });
    expect(restricted).toEqual({
      exposure: "INELIGIBLE",
      moderation: "RESTRICTED"
    });
  });

  it("refuses to let the two disagree", async () => {
    const business = await owner();
    await moderate(business.businessId, "restriction");

    // The mapping is a database rule rather than a habit. A statement that
    // tried to expose a Restricted Business is refused, whoever writes it and
    // whatever it thinks it is doing.
    await expect(
      pool.query(
        `update business set public_exposure = 'ELIGIBLE' where id = $1`,
        [business.businessId]
      )
    ).rejects.toThrow(/EXPOSURE_CONTRADICTS_MODERATION/u);
  });

  it("withdraws public eligibility on restriction and returns it on restoration", async () => {
    const business = await owner();
    expect(await findable(business.publishedId)).toBe(true);

    await moderate(business.businessId, "restriction");
    const whileRestricted = await findable(business.publishedId);
    await moderate(business.businessId, "restoration");

    // AC-4, AC-11 and AC-14. PRD-0001 composes eligibility from the Business
    // input, so restriction removes it and restoration gives it back — to the
    // Published Offering.
    expect(whileRestricted).toBe(false);
    expect(await findable(business.publishedId)).toBe(true);
  });

  it("publishes nothing and un-hides nothing on restoration", async () => {
    const business = await owner();
    await moderate(business.businessId, "restriction");
    await moderate(business.businessId, "restoration");

    // AC-12 and AC-14. The Draft is still a Draft and still not findable;
    // restoration returns permission, not publication.
    const draft = await pool.query<{ status: string }>(
      `select status::text as status from offering where id = $1`,
      [business.draftId]
    );
    expect(draft.rows[0]?.status).toBe("DRAFT");
    expect(await findable(business.draftId)).toBe(false);
  });

  it("lets a Restricted owner manage Business Information and existing Drafts", async () => {
    const business = await owner();
    await moderate(business.businessId, "restriction");

    const information = await send(
      "PUT",
      `/businesses/${business.businessId}/information`,
      {
        body: { name: "Kartal Motors", shortDescription: "1998'den beri." },
        cookie: business.cookie
      }
    );
    const draftEdit = await send(
      "PUT",
      `/businesses/${business.businessId}/offerings/${business.draftId}/content`,
      {
        body: {
          attributes: [],
          categoryId: leafId,
          title: "Kırmızı araba, düzenlendi"
        },
        cookie: business.cookie
      }
    );

    // AC-5. Restriction is not a suspension of the owner.
    expect(information.statusCode).toBe(200);
    expect(draftEdit.statusCode).toBe(200);
  });

  it("lets a Restricted owner see what they own", async () => {
    const business = await owner();
    await moderate(business.businessId, "restriction");

    const inventory = await send(
      "GET",
      `/businesses/${business.businessId}/offerings`,
      { cookie: business.cookie }
    );
    const published = await send(
      "GET",
      `/businesses/${business.businessId}/offerings/${business.publishedId}/content`,
      { cookie: business.cookie }
    );

    // AC-5, and the half this Story corrects: reading an owned Published
    // Offering used to be refused while Restricted.
    expect(inventory.statusCode).toBe(200);
    expect(published.statusCode).toBe(200);
  });

  it("stops a Restricted owner creating an Offering or publishing a Draft", async () => {
    const business = await owner();
    await moderate(business.businessId, "restriction");

    const created = await send(
      "POST",
      `/businesses/${business.businessId}/offerings`,
      {
        body: { categoryId: leafId, slug: slug(), title: "Yeni" },
        cookie: business.cookie
      }
    );
    const publication = await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${business.draftId}/publication`,
      { cookie: business.cookie }
    );

    // AC-6. The two acts that would put something new in front of a person.
    expect(created.statusCode).toBe(403);
    expect(publication.statusCode).toBe(403);
  });

  it("stops normal editing of a Published Offering while Restricted", async () => {
    const business = await owner();
    await moderate(business.businessId, "restriction");

    const edited = await send(
      "PUT",
      `/businesses/${business.businessId}/offerings/${business.publishedId}/content`,
      {
        body: { attributes: [], categoryId: leafId, title: "Değiştirildi" },
        cookie: business.cookie
      }
    );

    // AC-7. The bounded correction-edit path `US-PLT-F06-001` owns is the only
    // way through, and it does not exist yet.
    expect(edited.statusCode).toBe(403);
  });

  it("allows retirement while Restricted", async () => {
    const business = await owner();
    await moderate(business.businessId, "restriction");

    const retired = await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${business.publishedId}/retirement`,
      { cookie: business.cookie }
    );

    // AC-8. A person may always stop offering something.
    expect(retired.statusCode).toBe(200);
  });

  it("allows an Affiliate Destination only where the Offering is still owner-manageable", async () => {
    const business = await owner();
    await moderate(business.businessId, "restriction");

    const onDraft = await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${business.draftId}/affiliate-destination`,
      {
        body: { reference: "https://partner.example.test/a" },
        cookie: business.cookie
      }
    );
    const onPublished = await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${business.publishedId}/affiliate-destination`,
      {
        body: { reference: "https://partner.example.test/b" },
        cookie: business.cookie
      }
    );

    // AC-9. The Draft is still the owner's to manage; the Published Offering
    // is not, so its destination is not either.
    expect(onDraft.statusCode).toBe(201);
    expect(onPublished.statusCode).toBe(403);
  });

  it("moves nothing else by restricting", async () => {
    const business = await owner();
    await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${business.draftId}/affiliate-destination`,
      {
        body: { reference: "https://partner.example.test/c" },
        cookie: business.cookie
      }
    );
    const before = await pool.query<Record<string, string>>(
      `select o.status::text as offering, a.status::text as destination,
         a.validation_result::text as validation, a.handoff_eligibility::text as handoff,
         u.status::text as account, bo.user_id::text as owner
       from offering o
       join affiliate_destination a on a.offering_id = o.id
       join business_owner bo on bo.business_id = o.business_id
       join user_account u on u.id = bo.user_id
       where o.id = $1`,
      [business.draftId]
    );

    await moderate(business.businessId, "restriction");

    // AC-10. Six things that are not restriction's to change, checked as one.
    const after = await pool.query<Record<string, string>>(
      `select o.status::text as offering, a.status::text as destination,
         a.validation_result::text as validation, a.handoff_eligibility::text as handoff,
         u.status::text as account, bo.user_id::text as owner
       from offering o
       join affiliate_destination a on a.offering_id = o.id
       join business_owner bo on bo.business_id = o.business_id
       join user_account u on u.id = bo.user_id
       where o.id = $1`,
      [business.draftId]
    );
    expect(after.rows[0]).toEqual(before.rows[0]);
  });

  it("moves no Affiliate Destination state by restoring", async () => {
    const business = await owner();
    await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${business.draftId}/affiliate-destination`,
      {
        body: { reference: "https://partner.example.test/d" },
        cookie: business.cookie
      }
    );
    await moderate(business.businessId, "restriction");
    const before = await pool.query<Record<string, string>>(
      `select status::text as status, handoff_eligibility::text as handoff
       from affiliate_destination where offering_id = $1`,
      [business.draftId]
    );

    await moderate(business.businessId, "restoration");

    // AC-13. A destination that was never validated does not become eligible
    // because the Business is trusted again.
    const after = await pool.query<Record<string, string>>(
      `select status::text as status, handoff_eligibility::text as handoff
       from affiliate_destination where offering_id = $1`,
      [business.draftId]
    );
    expect(after.rows[0]).toEqual(before.rows[0]);
  });

  it("leaves moderation and exposure alone when the owner is suspended", async () => {
    const business = await owner();
    const before = await businessRow(business.businessId);

    await pool.query(
      `update user_account set status = 'SUSPENDED' where id = $1`,
      [business.userId]
    );
    const context = await send("PUT", "/auth/me/business-context", {
      body: { businessId: business.businessId },
      cookie: business.cookie
    });

    // AC-15 and AC-16. Suspension is about the person, not the Business: the
    // owner cannot enter Business context, and nothing public changes because
    // of it.
    expect(context.statusCode).toBe(401);
    expect(await businessRow(business.businessId)).toEqual(before);
    expect(await findable(business.publishedId)).toBe(true);
  });

  it("answers a Business that does not exist as absent", async () => {
    const missing = await send(
      "POST",
      `/admin/businesses/${randomUUID()}/restriction`,
      { cookie: admin.cookie }
    );
    const guest = await send(
      "POST",
      `/admin/businesses/${randomUUID()}/restriction`
    );

    // Restrict and Restore are Admin actions. A Guest is refused before the
    // Business is even looked for.
    expect(missing.statusCode).toBe(404);
    expect(guest.statusCode).toBe(401);
  });

  it("reports the Business as the owner's list would show it", async () => {
    const business = await owner();

    const restricted = await moderate(business.businessId, "restriction");

    // The published contract, unchanged: restriction is a state of the
    // Business rather than a new kind of object.
    expect(ownedBusinessSchema.parse(restricted.json())).toMatchObject({
      id: business.businessId,
      publicExposure: "INELIGIBLE"
    });
  });
});
