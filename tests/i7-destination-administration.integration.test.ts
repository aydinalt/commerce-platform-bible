import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import { MODERATION_ACTIONS } from "../modules/moderation/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import {
  DESTINATION_ADMINISTRATION_ACTIONS,
  destinationWorkload
} from "../modules/offering/src/index.js";
import {
  affiliateDestinationSchema,
  destinationWorkloadSchema
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
 * `US-PLT-F07-001` Affiliate Destination Administration.
 *
 * A separate action family from General Moderation, and the separation is what
 * this Story is for. The four actions were built in I3 with their own
 * acceptance criteria; here they are checked at their edges — that they belong
 * to no other family, that they reach past nothing, and that the workload an
 * Admin sees is a way of looking at destinations rather than a state they are
 * in.
 */
suite("Increment I7 Affiliate Destination administration", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

  const address = () => `ada-${randomUUID()}@example.test`;
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

  /// A Published Offering with a freshly authored destination: Draft, Not
  /// Validated, Ineligible — the state every administration path starts from.
  const destination = async () => {
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
    const offering = await send("POST", `/businesses/${businessId}/offerings`, {
      body: { categoryId, slug: slug(), title: "Kırmızı araba" },
      cookie: account.cookie
    });
    const offeringId = offering.json<{ id: string }>().id;
    await send(
      "PUT",
      `/businesses/${businessId}/offerings/${offeringId}/content`,
      {
        body: { attributes: [], categoryId, title: "Kırmızı araba" },
        cookie: account.cookie
      }
    );
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/publication`,
      { cookie: account.cookie }
    );
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/affiliate-destination`,
      { body: { reference: "https://a.test" }, cookie: account.cookie }
    );
    return { ...account, businessId, offeringId };
  };

  const administer = (
    offeringId: string,
    action: "disablement" | "enablement" | "review" | "validation",
    body?: unknown
  ) =>
    send(
      "POST",
      `/admin/offerings/${offeringId}/affiliate-destination/${action}`,
      {
        ...(body === undefined ? {} : { body }),
        cookie: admin.cookie
      }
    );

  const read = async (offeringId: string) =>
    affiliateDestinationSchema.parse(
      (
        await send(
          "GET",
          `/admin/offerings/${offeringId}/affiliate-destination`,
          {
            cookie: admin.cookie
          }
        )
      ).json()
    );

  const workload = async () =>
    destinationWorkloadSchema.parse(
      (
        await send("GET", "/admin/offerings/affiliate-destinations/workload", {
          cookie: admin.cookie
        })
      ).json()
    ).items;

  const categoryFor = async (offeringId: string) =>
    (await workload()).find(
      (item) => item.destination.offeringId === offeringId
    )?.category;

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
    await processor.close();
    await pool.end();
  });

  it("is a separate family from General Moderation", () => {
    const overlap = DESTINATION_ADMINISTRATION_ACTIONS.filter((action) =>
      (MODERATION_ACTIONS as readonly string[]).includes(action)
    );

    // AC-1 and AC-2. Four actions here, seven there, and nothing in both. The
    // way this boundary ends is somebody adding one verb to the wrong list, so
    // the emptiness of the intersection is worth asserting rather than
    // assuming.
    expect([...DESTINATION_ADMINISTRATION_ACTIONS]).toEqual([
      "REVIEW",
      "VALIDATE",
      "ENABLE",
      "DISABLE"
    ]);
    expect(overlap).toEqual([]);
    expect(MODERATION_ACTIONS).toHaveLength(7);
  });

  it("changes nothing through Review alone", async () => {
    const business = await destination();
    const before = await read(business.offeringId);

    const reviewed = await administer(business.offeringId, "review", {
      note: "Adres makul görünüyor"
    });
    const after = await read(business.offeringId);

    // AC-3. Review records that somebody looked. Status, validation result and
    // Handoff Eligibility are all where they were.
    expect(reviewed.statusCode).toBe(200);
    expect(after).toEqual(before);
  });

  it("consumes Valid or Invalid while preserving the status", async () => {
    const valid = await destination();
    const invalid = await destination();

    await administer(valid.offeringId, "validation", { result: "VALID" });
    await administer(invalid.offeringId, "validation", {
      reason: "Adres yanıt vermiyor",
      result: "INVALID"
    });
    const afterValid = await read(valid.offeringId);
    const afterInvalid = await read(invalid.offeringId);

    // AC-4. Validation is a verdict on the configuration, not a decision about
    // whether to use it — so both destinations are still Draft.
    expect(afterValid.validationResult).toBe("VALID");
    expect(afterValid.status).toBe("DRAFT");
    expect(afterInvalid.validationResult).toBe("INVALID");
    expect(afterInvalid.status).toBe("DRAFT");
  });

  it("enables only a Valid destination, and composes eligibility from the pair", async () => {
    const business = await destination();

    const premature = await administer(business.offeringId, "enablement");
    await administer(business.offeringId, "validation", { result: "VALID" });
    const enabled = await administer(business.offeringId, "enablement");
    const after = await read(business.offeringId);

    // AC-5 and AC-6. Enabling an unvalidated destination would make it
    // publicly reachable on the strength of a check nobody performed.
    expect(premature.statusCode).toBe(409);
    expect(enabled.statusCode).toBe(200);
    expect(after.status).toBe("ENABLED");
    expect(after.handoffEligibility).toBe("ELIGIBLE");
  });

  it("disables while preserving the validation result", async () => {
    const business = await destination();
    await administer(business.offeringId, "validation", { result: "VALID" });
    await administer(business.offeringId, "enablement");

    const disabled = await administer(business.offeringId, "disablement");
    const after = await read(business.offeringId);

    // AC-7. Disabling is a decision about whether to use the destination, and
    // says nothing about whether the address was ever any good.
    expect(disabled.statusCode).toBe(200);
    expect(after.status).toBe("DISABLED");
    expect(after.handoffEligibility).toBe("INELIGIBLE");
    expect(after.validationResult).toBe("VALID");
  });

  it("derives each workload category from the pair that produces it", async () => {
    const fresh = await destination();
    const rejected = await destination();
    await administer(rejected.offeringId, "validation", {
      reason: "Adres yanıt vermiyor",
      result: "INVALID"
    });
    const ready = await destination();
    await administer(ready.offeringId, "validation", { result: "VALID" });

    // AC-8, AC-9 and AC-10. Three categories, each from one exact pair.
    expect(await categoryFor(fresh.offeringId)).toBe("NEEDS_VALIDATION");
    expect(await categoryFor(rejected.offeringId)).toBe(
      "BUSINESS_CORRECTION_NEEDED"
    );
    expect(await categoryFor(ready.offeringId)).toBe("READY_TO_ENABLE");
  });

  it("produces no pending item for an Enabled or Disabled destination", async () => {
    const live = await destination();
    await administer(live.offeringId, "validation", { result: "VALID" });
    await administer(live.offeringId, "enablement");
    const stopped = await destination();
    await administer(stopped.offeringId, "validation", { result: "VALID" });
    await administer(stopped.offeringId, "enablement");
    await administer(stopped.offeringId, "disablement");

    // AC-11. Both have had their decision taken. A Disabled destination is not
    // unfinished work — somebody decided it, and re-deciding is a new act.
    expect(await categoryFor(live.offeringId)).toBeNull();
    expect(await categoryFor(stopped.offeringId)).toBeNull();
  });

  it("stores no workload category anywhere", async () => {
    const business = await destination();
    const before = await categoryFor(business.offeringId);

    await administer(business.offeringId, "validation", { result: "VALID" });
    const after = await categoryFor(business.offeringId);
    const columns = await pool.query<{ column: string }>(
      `select column_name as "column" from information_schema.columns
       where table_name = 'affiliate_destination'`
    );

    // AC-12. The category moved because the two results it is derived from
    // moved, and there is no column it could have been written to. A stored
    // category would eventually disagree with the destination it described.
    expect(before).toBe("NEEDS_VALIDATION");
    expect(after).toBe("READY_TO_ENABLE");
    expect(columns.rows.map((row) => row.column)).not.toContain("workload");
    expect(JSON.stringify(columns.rows)).not.toMatch(/category/iu);
  });

  it("reaches no Offering, Business or account", async () => {
    const business = await destination();
    const unrelated = () =>
      pool.query(
        `select o.status::text as lifecycle,
           coalesce((select p.status::text from offering_publication p
             where p.offering_id = o.id
             order by p.eligibility_version desc limit 1),'PENDING') as eligibility,
           b.public_exposure::text as exposure,
           coalesce(m.status::text,'UNRESTRICTED') as moderation,
           u.status::text as account
         from offering o
         join business b on b.id = o.business_id
         join user_account u on u.id = $2
         left join business_moderation_state m on m.business_id = b.id
         where o.id = $1`,
        [business.offeringId, business.userId]
      );
    const before = await unrelated();

    await administer(business.offeringId, "review", { note: null });
    await administer(business.offeringId, "validation", { result: "VALID" });
    await administer(business.offeringId, "enablement");
    await administer(business.offeringId, "disablement");
    const after = await unrelated();

    // AC-13. All four actions applied in turn, and the Offering's lifecycle,
    // its final public eligibility, the Business's moderation and exposure and
    // the owner's account status are all exactly where they were. Handoff
    // Eligibility is not final Offering Public Eligibility, and this is what
    // that distinction looks like from the outside.
    expect(after.rows[0]).toEqual(before.rows[0]);
  });

  it("creates no Messaging or commercial behaviour", async () => {
    const business = await destination();
    await administer(business.offeringId, "validation", { result: "VALID" });

    const items = await workload();
    const item = items.find(
      (each) => each.destination.offeringId === business.offeringId
    );

    // AC-14. The workload carries a reference, two results and a category.
    // Nothing in it can express a click, an attribution, a commission or a
    // settlement, and no route here begins a conversation with anybody.
    expect(Object.keys(item ?? {}).sort()).toEqual([
      "businessId",
      "category",
      "destination"
    ]);
    expect(JSON.stringify(items)).not.toMatch(
      /attribution|commission|settlement|conversion|tracking|message/iu
    );
  });

  it("claims no result when an action fails", async () => {
    const business = await destination();
    const before = await read(business.offeringId);

    const refused = await administer(business.offeringId, "enablement");
    const after = await read(business.offeringId);
    const category = await categoryFor(business.offeringId);

    // AC-15. The refusal left the destination exactly as it found it, and the
    // workload still shows the thing that actually needs doing.
    expect(refused.statusCode).toBe(409);
    expect(after).toEqual(before);
    expect(category).toBe("NEEDS_VALIDATION");
  });

  it("composes the category without a database", () => {
    // The rules read on their own. Every category has Draft on one side,
    // because a decision once taken is not pending work.
    expect(
      destinationWorkload({
        status: "DRAFT",
        validationResult: "NOT_VALIDATED"
      })
    ).toBe("NEEDS_VALIDATION");
    expect(
      destinationWorkload({ status: "DRAFT", validationResult: "INVALID" })
    ).toBe("BUSINESS_CORRECTION_NEEDED");
    expect(
      destinationWorkload({ status: "DRAFT", validationResult: "VALID" })
    ).toBe("READY_TO_ENABLE");
    expect(
      destinationWorkload({ status: "ENABLED", validationResult: "VALID" })
    ).toBeNull();
    expect(
      destinationWorkload({ status: "DISABLED", validationResult: "INVALID" })
    ).toBeNull();
  });
});
