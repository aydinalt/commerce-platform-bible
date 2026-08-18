import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { OFFERING_MODERATION_SOURCE } from "../modules/offering/src/index.js";
import {
  moderationCaseSchema,
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
 * `US-PLT-F03-001` Offering Moderation Actions.
 *
 * Two transitions, and the Story is mostly about the ones that are not there.
 * Platform can take a Published Offering out of circulation and put a Hidden
 * one back — and cannot archive, un-archive, send anything to Draft, or publish
 * on a Business's behalf. The other thing worth proving hard is that putting an
 * Offering back does not promise anyone will see it.
 */
suite("Increment I7 Offering moderation actions", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

  const address = () => `omd-${randomUUID()}@example.test`;
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

  const offering = async (
    business: { businessId: string; cookie: string },
    options: { publish?: boolean } = {}
  ) => {
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
      "PUT",
      `/businesses/${business.businessId}/offerings/${offeringId}/content`,
      {
        body: { attributes: [], categoryId, title: "Kırmızı araba" },
        cookie: business.cookie
      }
    );
    if (options.publish !== false)
      await send(
        "POST",
        `/businesses/${business.businessId}/offerings/${offeringId}/publication`,
        { cookie: business.cookie }
      );
    return offeringId;
  };

  const hide = (offeringId: string) =>
    send("POST", `/admin/offerings/${offeringId}/concealment`, {
      cookie: admin.cookie
    });

  const restore = (offeringId: string) =>
    send("POST", `/admin/offerings/${offeringId}/restoration`, {
      cookie: admin.cookie
    });

  const stored = (offeringId: string) =>
    pool.query<{
      eligibility: string;
      lifecycle: string;
      projected: string;
      publishedAt: string | null;
    }>(
      `select o.status::text as lifecycle,
         o.published_at::text as "publishedAt",
         coalesce((select p.status::text from offering_publication p
           where p.offering_id = o.id
           order by p.eligibility_version desc limit 1),'PENDING') as eligibility,
         (select count(*)::text from offering_search_projection s
           where s.offering_id = o.id) as projected
       from offering o where o.id = $1`,
      [offeringId]
    );

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

    const category = await send("POST", "/admin/categories", {
      body: {
        domain: "MOBILITY",
        name: "Otomobil",
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });
    categoryId = category.json<{ id: string }>().id;
  });

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    dispatcher.delivered.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("hides only a Published Offering, and records the exact transition", async () => {
    const business = await owner();
    const published = await offering(business);
    const draft = await offering(business, { publish: false });

    const hidden = await hide(published);
    const refused = await hide(draft);
    const after = await stored(published);

    // AC-1 and AC-2. Published is the one state Hide starts from, and what it
    // produces is PRD-0001's Hidden — not a Platform-owned state of its own.
    expect(hidden.statusCode).toBe(200);
    expect(offeringContentSchema.parse(hidden.json()).status).toBe("HIDDEN");
    expect(after.rows[0]?.lifecycle).toBe("HIDDEN");
    expect(refused.statusCode).toBe(409);
  });

  it("restores only a Hidden Offering, and records the exact transition", async () => {
    const business = await owner();
    const published = await offering(business);
    await hide(published);
    const stillPublished = await offering(business);

    const restored = await restore(published);
    const refused = await restore(stillPublished);

    // AC-3 and AC-4. Hidden is the one state Restore starts from.
    expect(restored.statusCode).toBe(200);
    expect(offeringContentSchema.parse(restored.json()).status).toBe(
      "PUBLISHED"
    );
    expect(refused.statusCode).toBe(409);
  });

  it("leaves the composed eligibility to PRD-0001", async () => {
    const business = await owner();
    const published = await offering(business);

    await hide(published);
    const hidden = await stored(published);
    await restore(published);
    const restored = await stored(published);

    // AC-5. Hiding composes an ineligible result and takes the Offering out of
    // Discovery; restoring composes a fresh one. Neither is asserted — both
    // are what `composePublicEligibility` answered, and the reason it gives
    // for the first is the lifecycle rather than the act of hiding.
    expect(hidden.rows[0]?.eligibility).toBe("INELIGIBLE");
    expect(hidden.rows[0]?.projected).toBe("0");
    expect(restored.rows[0]?.eligibility).toBe("ELIGIBLE");
    expect(restored.rows[0]?.projected).toBe("1");
  });

  it("promises no public eligibility just by restoring", async () => {
    const business = await owner();
    const published = await offering(business);
    await hide(published);
    await send("POST", `/admin/businesses/${business.businessId}/restriction`, {
      cookie: admin.cookie
    });

    const restored = await restore(published);
    const after = await stored(published);

    // AC-8, the heart of the Story. The lifecycle came back to Published and
    // the Offering is still not publicly eligible, because the Business's
    // exposure input is one of the inputs and it says no. Nothing in the
    // restore path could have decided otherwise.
    expect(restored.statusCode).toBe(200);
    expect(after.rows[0]?.lifecycle).toBe("PUBLISHED");
    expect(after.rows[0]?.eligibility).toBe("INELIGIBLE");
    expect(after.rows[0]?.projected).toBe("0");
  });

  it("keeps the first publication moment through both transitions", async () => {
    const business = await owner();
    const published = await offering(business);
    const before = await stored(published);

    await hide(published);
    await restore(published);
    const after = await stored(published);

    // Being taken out of circulation and put back does not make an Offering
    // newly published — which matters because Discovery orders by that moment.
    expect(after.rows[0]?.publishedAt).toBe(before.rows[0]?.publishedAt);
  });

  it("has no Archive, un-archive, Hidden-to-Draft or publish-for-Business action", async () => {
    const business = await owner();
    const published = await offering(business);
    const draft = await offering(business, { publish: false });
    await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${published}/retirement`,
      { cookie: business.cookie }
    );

    const unarchive = await restore(published);
    const publishForThem = await send(
      "POST",
      `/admin/offerings/${draft}/publication`,
      { cookie: admin.cookie }
    );
    const archive = await send("POST", `/admin/offerings/${draft}/retirement`, {
      cookie: admin.cookie
    });

    // AC-6. Two of these are refused because the lifecycle does not admit
    // them; the other two have no route at all. Neither is a value
    // `OFFERING_MODERATION_SOURCE` can hold, so no surface can offer one.
    expect(Object.keys(OFFERING_MODERATION_SOURCE).sort()).toEqual([
      "HIDE_OFFERING",
      "RESTORE_OFFERING"
    ]);
    expect(unarchive.statusCode).toBe(409);
    expect(publishForThem.statusCode).toBe(404);
    expect(archive.statusCode).toBe(404);
  });

  it("changes no unrelated state", async () => {
    const business = await owner();
    const published = await offering(business);
    await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${published}/affiliate-destination`,
      { body: { reference: "https://a.test" }, cookie: business.cookie }
    );
    const before = await pool.query(
      `select b.public_exposure::text as exposure,
         coalesce(m.status::text,'UNRESTRICTED') as moderation,
         u.status::text as account,
         d.status::text as destination,
         d.validation_result::text as validation,
         d.handoff_eligibility::text as handoff
       from business b
       join user_account u on u.id = $2
       left join business_moderation_state m on m.business_id = b.id
       left join affiliate_destination d on d.offering_id = $3
       where b.id = $1`,
      [business.businessId, business.userId, published]
    );

    await hide(published);
    await restore(published);
    const after = await pool.query(
      `select b.public_exposure::text as exposure,
         coalesce(m.status::text,'UNRESTRICTED') as moderation,
         u.status::text as account,
         d.status::text as destination,
         d.validation_result::text as validation,
         d.handoff_eligibility::text as handoff
       from business b
       join user_account u on u.id = $2
       left join business_moderation_state m on m.business_id = b.id
       left join affiliate_destination d on d.offering_id = $3
       where b.id = $1`,
      [business.businessId, business.userId, published]
    );

    // AC-7. Six results that have nothing to do with this action, and none of
    // them moved — because nothing in the path could write any of them.
    expect(after.rows[0]).toEqual(before.rows[0]);
  });

  it("offers the action the case's Offering currently admits", async () => {
    const business = await owner();
    const published = await offering(business);
    const opened = moderationCaseSchema.parse(
      (
        await send("POST", "/admin/moderation-cases", {
          body: { offeringId: published, targetType: "OFFERING" },
          cookie: admin.cookie
        })
      ).json()
    );

    const whilePublished = opened.availableActions;
    await hide(published);
    const whileHidden = moderationCaseSchema.parse(
      (
        await send("GET", `/admin/moderation-cases/${opened.id}`, {
          cookie: admin.cookie
        })
      ).json()
    ).availableActions;

    // `US-PLT-F02-001` AC-5 read through this Story: the offer and the refusal
    // are the same rule. What the case offers is what the route would accept.
    expect(whilePublished).toEqual(["HIDE_OFFERING"]);
    expect(whileHidden).toEqual(["RESTORE_OFFERING"]);
  });

  it("leaves the case Open and cites the action that was applied", async () => {
    const business = await owner();
    const published = await offering(business);
    const opened = moderationCaseSchema.parse(
      (
        await send("POST", "/admin/moderation-cases", {
          body: { offeringId: published, targetType: "OFFERING" },
          cookie: admin.cookie
        })
      ).json()
    );

    await hide(published);
    const after = moderationCaseSchema.parse(
      (
        await send("GET", `/admin/moderation-cases/${opened.id}`, {
          cookie: admin.cookie
        })
      ).json()
    );

    // AC-9. Applying an action does not close anything; it records what was
    // done so an explicit closure has something to stand on.
    expect(after.status).toBe("OPEN");
    expect(after.resolutions.map((r) => r.action)).toEqual(["HIDE_OFFERING"]);
  });

  it("claims no transition when the action fails", async () => {
    const business = await owner();
    const draft = await offering(business, { publish: false });
    const before = await stored(draft);

    const refused = await hide(draft);
    const after = await stored(draft);
    const versions = await pool.query<{ count: string }>(
      `select count(*)::text as count from offering_publication
       where offering_id = $1`,
      [draft]
    );

    // AC-10. The refusal is a refusal all the way down: no lifecycle, no new
    // eligibility evaluation, no projection — the transaction rolled back
    // rather than the service undoing anything.
    expect(refused.statusCode).toBe(409);
    expect(after.rows[0]).toEqual(before.rows[0]);
    expect(versions.rows[0]?.count).toBe("1");
  });
});
