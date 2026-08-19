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
  errorEnvelopeSchema,
  offeringContentSchema
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
 * `US-OFR-F04-001` Offering Publication.
 *
 * Three gates that fail separately, and one promise about what happens when any
 * of them does: the Offering is still a Draft. So most of these cases check the
 * refusal *and* the state it left behind.
 *
 * This is also the first thing in the system that writes the Discovery
 * projection. `US-OFR-F03-001` already removed it on retirement, which made the
 * removal provable before there was anything to remove; the pair is complete
 * here.
 */
suite("Increment I3 Offering publication", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

  const address = () => `pub-${randomUUID()}@example.test`;
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

  const leafCategory = async () => {
    const created = await send("POST", "/admin/categories", {
      body: {
        domain: "MOBILITY",
        name: "Leaf",
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });
    return created.json<{ id: string }>().id;
  };

  const draft = async (inCategory = categoryId, businessName = "Author") => {
    const account = await signUp();
    const created = await send("POST", "/businesses", {
      body: { name: businessName, slug: slug() },
      cookie: account.cookie
    });
    const businessId = created.json<{ id: string }>().id;
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });
    const offering = await send("POST", `/businesses/${businessId}/offerings`, {
      body: { categoryId: inCategory, slug: slug(), title: "A listing" },
      cookie: account.cookie
    });
    return {
      ...account,
      businessId,
      offeringId: offering.json<{ id: string }>().id
    };
  };

  const publish = (
    business: { businessId: string; cookie: string },
    offeringId: string
  ) =>
    send(
      "POST",
      `/businesses/${business.businessId}/offerings/${offeringId}/publication`,
      { cookie: business.cookie }
    );

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
    categoryId = await leafCategory();
  });

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    dispatcher.delivered.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("publishes an owned Draft and stamps Initial Published At", async () => {
    const business = await draft();

    const published = await publish(business, business.offeringId);

    // AC-1, AC-4 and AC-5.
    expect(published.statusCode).toBe(200);
    const content = offeringContentSchema.parse(published.json());
    expect(content.status).toBe("PUBLISHED");
    expect(content.publishedAt).not.toBeNull();
  });

  it("never moves Initial Published At once it is set", async () => {
    const business = await draft();
    await publish(business, business.offeringId);
    const first = await pool.query<{ publishedAt: Date }>(
      `select published_at as "publishedAt" from offering where id = $1`,
      [business.offeringId]
    );

    await send(
      "PUT",
      `/businesses/${business.businessId}/offerings/${business.offeringId}/content`,
      {
        body: { attributes: [], categoryId, title: "Renamed" },
        cookie: business.cookie
      }
    );

    // AC-5. `coalesce` makes it write-once, and the edit path cannot name the
    // column at all — two independent reasons it cannot move.
    const after = await pool.query<{ publishedAt: Date }>(
      `select published_at as "publishedAt" from offering where id = $1`,
      [business.offeringId]
    );
    expect(after.rows[0]?.publishedAt).toEqual(first.rows[0]?.publishedAt);
  });

  it("refuses publication while the Business is Restricted", async () => {
    const business = await draft();
    await pool.query(
      `update business_moderation_state set status = 'RESTRICTED'
       where business_id = $1`,
      [business.businessId]
    );

    const published = await publish(business, business.offeringId);

    // AC-2 and AC-7. The refusal names moderation rather than completeness —
    // PRD-0001 §6.1.1 keeps them separate so the remedies stay separate.
    expect(published.statusCode).toBe(403);
    expect(errorEnvelopeSchema.parse(published.json()).code).toBe(
      "BUSINESS_RESTRICTED"
    );
    const still = await pool.query<{ status: string }>(
      `select status::text as status from offering where id = $1`,
      [business.offeringId]
    );
    expect(still.rows[0]?.status).toBe("DRAFT");
  });

  it("refuses publication below the Universal Publication Minimum", async () => {
    const ownCategory = await leafCategory();
    const business = await draft(ownCategory);
    const definition = await send("POST", "/admin/attributes", {
      body: {
        categoryIds: [ownCategory],
        comparable: false,
        filterable: false,
        name: "Colour",
        stableKey: key(),
        valueKind: "TEXT"
      },
      cookie: admin.cookie
    });
    await send(
      "PUT",
      `/admin/attributes/${definition.json<{ id: string }>().id}/required-for-publication`,
      { body: { requiredForPublication: true }, cookie: admin.cookie }
    );

    const published = await publish(business, business.offeringId);

    // AC-3 and AC-7, on §6.1.1's third condition.
    expect(published.statusCode).toBe(422);
    expect(
      errorEnvelopeSchema.parse(published.json()).fieldErrors
        ?.publicationMinimum
    ).toEqual(["REQUIRED_ATTRIBUTE_MISSING"]);
    const still = await pool.query<{ status: string }>(
      `select status::text as status from offering where id = $1`,
      [business.offeringId]
    );
    expect(still.rows[0]?.status).toBe("DRAFT");
  });

  it("evaluates eligibility after publication rather than assuming it", async () => {
    const business = await draft();

    await publish(business, business.offeringId);

    // AC-6. A second evaluation, recorded beside the first, with no reason —
    // because this time nothing withheld the result.
    const evaluations = await pool.query<{
      reason: string | null;
      status: string;
    }>(
      `select status::text as status, reason_code as reason
       from offering_publication where offering_id = $1
       order by eligibility_version`,
      [business.offeringId]
    );
    expect(evaluations.rows).toEqual([
      { reason: "LIFECYCLE_DRAFT", status: "INELIGIBLE" },
      { reason: null, status: "ELIGIBLE" }
    ]);
  });

  it("projects the published Offering for Discovery", async () => {
    const ownCategory = await leafCategory();
    const business = await draft(ownCategory, "Kadıköy Motors");
    const definition = await send("POST", "/admin/attributes", {
      body: {
        categoryIds: [ownCategory],
        comparable: false,
        filterable: true,
        name: "Fuel",
        options: [
          { label: "Petrol", stableKey: "PETROL" },
          { label: "Diesel", stableKey: "DIESEL" }
        ],
        stableKey: key(),
        valueKind: "MULTI_SELECT"
      },
      cookie: admin.cookie
    });
    const attribute = definition.json<{
      id: string;
      options: { id: string }[];
    }>();
    await send(
      "PUT",
      `/businesses/${business.businessId}/offerings/${business.offeringId}/content`,
      {
        body: {
          attributes: [
            {
              attributeId: attribute.id,
              kind: "SELECT",
              optionIds: attribute.options.map((o) => o.id)
            }
          ],
          categoryId: ownCategory,
          summary: "Well kept",
          title: "A listing"
        },
        cookie: business.cookie
      }
    );

    await publish(business, business.offeringId);

    // The projection is a denormalisation of rows that already exist. Building
    // half of it would guarantee rewriting it when Discovery arrives, so the
    // derived Domain, the Business display name and the Attribute values are
    // all there from the start.
    const projected = await pool.query<{
      businessName: string;
      domain: string;
      filterValues: Record<string, unknown>;
      searchableText: string;
    }>(
      `select p.business_name as "businessName", p.searchable_text as "searchableText",
         p.filter_values as "filterValues", d.stable_key as domain
       from offering_search_projection p
       join domain d on d.id = p.domain_id
       where p.offering_id = $1`,
      [business.offeringId]
    );
    const row = projected.rows[0];
    expect(row?.domain).toBe("MOBILITY");
    expect(row?.businessName).toBe("Kadıköy Motors");
    expect(row?.searchableText).toContain("Well kept");
    expect(row?.filterValues[attribute.id]).toEqual(
      attribute.options.map((o) => o.id).sort()
    );
  });

  it("projects nothing for an Offering that never published", async () => {
    const business = await draft();

    const projected = await pool.query<{ total: number }>(
      `select count(*)::int as total from offering_search_projection
       where offering_id = $1`,
      [business.offeringId]
    );
    expect(projected.rows[0]?.total).toBe(0);
  });

  it("publishes only a Draft", async () => {
    const business = await draft();
    await publish(business, business.offeringId);

    const again = await publish(business, business.offeringId);

    // AC-1. Published is not a publication target, which is also why AC-8
    // needs no refusal: there is no transition to ask for.
    expect(again.statusCode).toBe(409);
    expect(errorEnvelopeSchema.parse(again.json()).code).toBe(
      "OFFERING_NOT_DRAFT"
    );
  });

  it("offers no way back to Draft", async () => {
    const business = await draft();
    await publish(business, business.offeringId);

    const attempts = await Promise.all([
      send(
        "POST",
        `/businesses/${business.businessId}/offerings/${business.offeringId}/draft`,
        { cookie: business.cookie }
      ),
      send(
        "PUT",
        `/businesses/${business.businessId}/offerings/${business.offeringId}/content`,
        {
          body: {
            attributes: [],
            categoryId,
            status: "DRAFT",
            title: "Back to draft"
          },
          cookie: business.cookie
        }
      )
    ]);

    // AC-8. Absent, not refused — and the edit body has no `status` field to
    // smuggle one through, so the second attempt fails whole.
    expect(attempts.map((a) => a.statusCode)).toEqual([404, 400]);
    const still = await pool.query<{ status: string }>(
      `select status::text as status from offering where id = $1`,
      [business.offeringId]
    );
    expect(still.rows[0]?.status).toBe("PUBLISHED");
  });

  it("removes the projection again when the Offering is retired", async () => {
    const business = await draft();
    await publish(business, business.offeringId);

    await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${business.offeringId}/retirement`,
      { cookie: business.cookie }
    );

    // The pair `US-OFR-F03-001` AC-4 promised, now with something real to
    // remove.
    const projected = await pool.query<{ total: number }>(
      `select count(*)::int as total from offering_search_projection
       where offering_id = $1`,
      [business.offeringId]
    );
    expect(projected.rows[0]?.total).toBe(0);
  });

  it("hides another Business's Offering from publication", async () => {
    const business = await draft();
    const stranger = await draft();

    const published = await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${business.offeringId}/publication`,
      { cookie: stranger.cookie }
    );

    expect(published.statusCode).toBe(404);
  });

  it("records the publication as audit evidence", async () => {
    const business = await draft();

    await publish(business, business.offeringId);

    const audited = await pool.query<{ total: number }>(
      `select count(*)::int as total from audit_record
       where action = 'offering.publish' and target_id = $1
         and actor_user_id = $2 and result = 'ALLOWED'`,
      [business.offeringId, business.userId]
    );
    expect(audited.rows[0]?.total).toBe(1);
  });
});
