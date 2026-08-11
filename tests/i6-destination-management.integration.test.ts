import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import {
  DESTINATION_ENTRIES,
  permittedDestinationEntries
} from "../modules/offering/src/index.js";
import { destinationManagementEntrySchema } from "../packages/contracts/src/index.js";

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
 * `US-BUS-F06-001` Affiliate Destination Management Entry.
 *
 * The Story gives Business an entry, not an authority. So most of what is
 * proven here is what the entry cannot do: it cannot review, validate, enable
 * or disable; it cannot recompute Handoff Eligibility; and it cannot widen
 * itself for a Restricted Business or an Archived Offering. What it can do is
 * report what PRD-0001 recorded and offer exactly the writes that would be
 * honoured.
 */
suite("Increment I6 Affiliate Destination management entry", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

  const address = () => `dme-${randomUUID()}@example.test`;
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

  const owner = async () => {
    const account = await signUp();
    const created = await send("POST", "/businesses", {
      body: { name: "Destination Owner", slug: slug() },
      cookie: account.cookie
    });
    const businessId = created.json<{ id: string }>().id;
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });
    return { ...account, businessId };
  };

  const draft = async () => {
    const business = await owner();
    const created = await send(
      "POST",
      `/businesses/${business.businessId}/offerings`,
      {
        body: { categoryId, slug: slug(), title: "Original" },
        cookie: business.cookie
      }
    );
    const offeringId = created.json<{ id: string }>().id;
    await send(
      "PUT",
      `/businesses/${business.businessId}/offerings/${offeringId}/content`,
      {
        body: { attributes: [], categoryId, title: "Original" },
        cookie: business.cookie
      }
    );
    return { ...business, offeringId };
  };

  const publish = (
    business: { businessId: string; cookie: string },
    id: string
  ) =>
    send(
      "POST",
      `/businesses/${business.businessId}/offerings/${id}/publication`,
      { cookie: business.cookie }
    );

  const path = (businessId: string, offeringId: string) =>
    `/businesses/${businessId}/offerings/${offeringId}/affiliate-destination`;

  const entry = async (
    business: { businessId: string; cookie: string },
    offeringId: string
  ) => {
    const response = await send(
      "GET",
      `${path(business.businessId, offeringId)}/management`,
      { cookie: business.cookie }
    );
    return {
      body: destinationManagementEntrySchema.parse(response.json()),
      statusCode: response.statusCode
    };
  };

  const author = (
    business: { businessId: string; cookie: string },
    offeringId: string,
    reference: string,
    method: "POST" | "PUT" = "POST"
  ) =>
    send(method, path(business.businessId, offeringId), {
      body: { reference },
      cookie: business.cookie
    });

  /**
   * The state Platform administration produces, set up directly because
   * PRD-0006 owns the actions that reach it and a Business owner never can.
   *
   * The evidence columns are written with the result: `US-OFR-F07-001` made a
   * validation result and the record of who reached it inseparable in the
   * datamodel, so a result without evidence is not a row this table accepts.
   */
  const administer = (offeringId: string) =>
    pool.query(
      `update affiliate_destination
         set status = 'ENABLED'::"AffiliateDestinationStatus",
             validation_result = 'VALID'::"AffiliateValidationResult",
             validated_at = now(),
             validated_by = $2,
             handoff_eligibility = 'ELIGIBLE'::"HandoffEligibility"
       where offering_id = $1`,
      [offeringId, admin.userId]
    );

  const restrict = (businessId: string) =>
    send("POST", `/admin/businesses/${businessId}/restriction`, {
      cookie: admin.cookie
    });

  const recorded = (offeringId: string) =>
    pool.query<{
      eligibility: string;
      result: string;
      status: string;
      version: number;
    }>(
      `select status::text as status,
         validation_result::text as result,
         handoff_eligibility::text as eligibility,
         version
       from affiliate_destination where offering_id = $1`,
      [offeringId]
    );

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

  it("gives the entry only for an owned Offering", async () => {
    const mine = await draft();
    const theirs = await draft();

    const trespass = await send(
      "GET",
      `${path(mine.businessId, theirs.offeringId)}/management`,
      { cookie: mine.cookie }
    );

    // AC-1. Not refused — not there. The answer for someone else's Offering is
    // the answer for an Offering that never existed.
    expect(trespass.statusCode).toBe(404);
  });

  it("offers Create where the Offering has no destination", async () => {
    const business = await draft();

    const before = await entry(business, business.offeringId);
    const created = await author(
      business,
      business.offeringId,
      "https://a.test"
    );

    // AC-2. Absence is reportable rather than a failure: `destination` is null
    // and the entry that answers it is offered.
    expect(before.body.destination).toBeNull();
    expect(before.body.entries).toEqual(["CREATE"]);
    expect(created.statusCode).toBe(201);
  });

  it("offers Edit once a destination exists, and Create no longer", async () => {
    const business = await draft();
    await author(business, business.offeringId, "https://a.test");

    const after = await entry(business, business.offeringId);
    const edited = await author(
      business,
      business.offeringId,
      "https://b.test",
      "PUT"
    );

    // AC-3 and AC-5. Zero-or-one is PRD-0001's rule, and the entry consumes it:
    // Create and Edit are the same permission asked of two different worlds, so
    // exactly one of them can ever be on offer.
    expect(after.body.entries.sort()).toEqual(["EDIT", "VIEW"]);
    expect(edited.statusCode).toBe(200);
  });

  it("reports the authoritative results without recalculating them", async () => {
    const business = await draft();
    await author(business, business.offeringId, "https://a.test");
    await administer(business.offeringId);

    const shown = await entry(business, business.offeringId);
    const stored = await recorded(business.offeringId);

    // AC-4. Every result the entry shows is the row PRD-0006's actions wrote.
    // Handoff Eligibility especially: Business does not compose it from the
    // pair, it reads the answer.
    expect(shown.body.destination?.status).toBe(stored.rows[0]?.status);
    expect(shown.body.destination?.validationResult).toBe(
      stored.rows[0]?.result
    );
    expect(shown.body.destination?.handoffEligibility).toBe(
      stored.rows[0]?.eligibility
    );
    expect(shown.body.destination?.handoffEligibility).toBe("ELIGIBLE");
  });

  it("changes nothing by being read", async () => {
    const business = await draft();
    await author(business, business.offeringId, "https://a.test");
    await administer(business.offeringId);

    const first = await entry(business, business.offeringId);
    const second = await entry(business, business.offeringId);

    // AC-5. A read that recalculated would eventually disagree with itself.
    expect(second.body.destination).toEqual(first.body.destination);
  });

  it("lets a Restricted Business manage a Draft's destination and no other", async () => {
    const drafted = await draft();
    await author(drafted, drafted.offeringId, "https://a.test");
    const live = await draft();
    await author(live, live.offeringId, "https://a.test");
    await publish(live, live.offeringId);
    await restrict(drafted.businessId);
    await restrict(live.businessId);

    const draftEntry = await entry(drafted, drafted.offeringId);
    const liveEntry = await entry(live, live.offeringId);
    const refused = await author(
      live,
      live.offeringId,
      "https://c.test",
      "PUT"
    );

    // AC-6. Owner-manageability is the whole condition, and the entry and the
    // write path read it from the same sentence: the Published Offering is
    // visible and unchangeable, the Draft is still the owner's.
    expect(draftEntry.body.entries).toContain("EDIT");
    expect(liveEntry.body.entries).toEqual(["VIEW"]);
    expect(refused.statusCode).toBe(403);
  });

  it("makes an Archived Offering's destination view-only", async () => {
    const business = await draft();
    await author(business, business.offeringId, "https://a.test");
    await administer(business.offeringId);
    await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${business.offeringId}/retirement`,
      { cookie: business.cookie }
    );

    const archived = await entry(business, business.offeringId);
    const refused = await author(
      business,
      business.offeringId,
      "https://c.test",
      "PUT"
    );

    // AC-10. View-only, which is not the same as invisible — the results stay
    // legible after the Offering stops being offered.
    expect(archived.body.offering.status).toBe("ARCHIVED");
    expect(archived.body.entries).toEqual(["VIEW"]);
    expect(archived.body.destination?.handoffEligibility).toBe("ELIGIBLE");
    expect(refused.statusCode).toBe(403);
  });

  it("claims no result when a save fails", async () => {
    const business = await draft();
    await author(business, business.offeringId, "https://a.test");
    await administer(business.offeringId);
    const before = await recorded(business.offeringId);

    const duplicate = await author(
      business,
      business.offeringId,
      "https://c.test"
    );
    const after = await recorded(business.offeringId);
    const shown = await entry(business, business.offeringId);

    // AC-11. The refusal is a refusal all the way down: not a version, not a
    // status, not a validation result and not an eligibility moved by it.
    expect(duplicate.statusCode).toBe(409);
    expect(after.rows[0]).toEqual(before.rows[0]);
    expect(shown.body.destination?.reference).toBe("https://a.test");
  });

  it("gives the Business no administration action anywhere", async () => {
    const business = await draft();
    await author(business, business.offeringId, "https://a.test");

    const shown = await entry(business, business.offeringId);
    const attempts = await Promise.all(
      ["review", "validation", "enablement", "disablement"].map((action) =>
        send(
          "POST",
          `${path(business.businessId, business.offeringId)}/${action}`,
          {
            body: {},
            cookie: business.cookie
          }
        )
      )
    );

    // AC-9. Twice over: the four actions are not values the entry vocabulary
    // can hold, and no Business-scoped route spells any of them.
    expect(DESTINATION_ENTRIES).toEqual(["VIEW", "CREATE", "EDIT"]);
    expect(JSON.stringify(shown.body.entries)).not.toMatch(
      /review|validat|enabl|disabl/iu
    );
    for (const attempt of attempts) expect(attempt.statusCode).toBe(404);
  });

  it("composes the entry from the Offering's condition and nothing else", () => {
    // AC-7 and AC-8. Correction notices are `US-BUS-F07-001`'s subject, and
    // this is the reason one could never widen destination authority: the
    // composition takes three inputs, none of which a notice can supply. There
    // is no fourth argument for "but a correction was requested".
    expect(
      permittedDestinationEntries({
        exists: true,
        lifecycle: "PUBLISHED",
        restricted: true
      })
    ).toEqual(["VIEW"]);
    expect(
      permittedDestinationEntries({
        exists: false,
        lifecycle: "ARCHIVED",
        restricted: false
      })
    ).toEqual([]);
    expect(
      permittedDestinationEntries({
        exists: false,
        lifecycle: "HIDDEN",
        restricted: false
      })
    ).toEqual(["CREATE"]);
  });

  it("creates no commercial behaviour by being used", async () => {
    const business = await draft();
    await author(business, business.offeringId, "https://a.test");

    const shown = await entry(business, business.offeringId);

    // AC-12. The entry carries a reference and three authoritative results.
    // Nothing in it can express a click, an attribution, a commission or a
    // settlement, so nothing downstream can read one out of it.
    expect(Object.keys(shown.body).sort()).toEqual([
      "destination",
      "entries",
      "offering"
    ]);
    expect(JSON.stringify(shown.body)).not.toMatch(
      /attribution|commission|settlement|conversion|tracking/iu
    );
  });
});
