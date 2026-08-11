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
  comparisonSetSchema,
  comparisonViewSchema,
  errorEnvelopeSchema
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
 * `US-DEC-F01-001` Comparison Set and Compare.
 *
 * A Comparison Set is defined almost entirely by what it refuses, so most of
 * this suite pushes at the bounds: a sixth member, an ineligible one, one from
 * another leaf. Each refusal is checked together with the set it left behind,
 * because AC-4 is a promise about the set as much as about the answer.
 */
suite("Increment I5 Comparison Set and Compare", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let leafId: string;
  let otherLeafId: string;
  let mileageId: string;
  let noteId: string;

  const address = () => `cmp-${randomUUID()}@example.test`;
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

  /// One published Offering, reached through the real path rather than planted.
  const publish = async (
    input: { attributes?: unknown[]; categoryId?: string; title?: string } = {}
  ) => {
    const categoryId = input.categoryId ?? leafId;
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
    const title = input.title ?? "Kırmızı araba";
    const offering = await send("POST", `/businesses/${businessId}/offerings`, {
      body: { categoryId, slug: slug(), title },
      cookie: account.cookie
    });
    const offeringId = offering.json<{ id: string }>().id;
    await send(
      "PUT",
      `/businesses/${businessId}/offerings/${offeringId}/content`,
      {
        body: { attributes: input.attributes ?? [], categoryId, title },
        cookie: account.cookie
      }
    );
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/publication`,
      { cookie: account.cookie }
    );
    return { businessId, cookie: account.cookie, offeringId };
  };

  const begin = async (offeringId: string) => {
    const created = await send("POST", "/decision/comparison-sets", {
      body: { offeringId }
    });
    return comparisonSetSchema.parse(created.json());
  };

  const add = (
    comparisonSetId: string,
    offeringId: string,
    replaces?: string
  ) =>
    send("POST", `/decision/comparison-sets/${comparisonSetId}/members`, {
      body: { offeringId, ...(replaces === undefined ? {} : { replaces }) }
    });

  const compare = (comparisonSetId: string) =>
    send("POST", `/decision/comparison-sets/${comparisonSetId}/compare`);

  const starts = async (comparisonSetId: string) => {
    const counted = await pool.query<{ count: string }>(
      `select count(*)::text as count
       from compare_start where comparison_set_id = $1`,
      [comparisonSetId]
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

    const other = await send("POST", "/admin/categories", {
      body: {
        domain: "MOBILITY",
        name: "Motosiklet",
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });
    otherLeafId = other.json<{ id: string }>().id;

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

    // Deliberately not comparable: AC-7 admits only the comparable ones.
    const note = await send("POST", "/admin/attributes", {
      body: {
        categoryIds: [leafId],
        comparable: false,
        filterable: false,
        name: "Satıcı notu",
        stableKey: key(),
        valueKind: "TEXT"
      },
      cookie: admin.cookie
    });
    noteId = note.json<{ id: string }>().id;
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

  it("begins a set that cannot yet be opened", async () => {
    const first = await publish();

    const set = await begin(first.offeringId);

    // AC-2's floor. One member is a set being formed, not a broken one — so it
    // is stored, and simply not openable.
    expect(set.members).toHaveLength(1);
    expect(set.openable).toBe(false);
    expect(set.full).toBe(false);
  });

  it("opens Compare on two members and records the occurrence once", async () => {
    const first = await publish();
    const second = await publish();
    const set = await begin(first.offeringId);
    await add(set.comparisonSetId, second.offeringId);

    const opened = await compare(set.comparisonSetId);
    await compare(set.comparisonSetId);

    // AC-2 and AC-11. Reopening the same set is the same person still
    // comparing the same things, so Basic Analytics sees one comparison.
    expect(opened.statusCode).toBe(200);
    expect(comparisonViewSchema.parse(opened.json()).members).toHaveLength(2);
    expect(await starts(set.comparisonSetId)).toBe(1);
  });

  it("refuses to open a set of one and records nothing", async () => {
    const first = await publish();
    const set = await begin(first.offeringId);

    const refused = await compare(set.comparisonSetId);

    expect(refused.statusCode).toBe(422);
    expect(errorEnvelopeSchema.parse(refused.json()).code).toBe(
      "COMPARISON_SET_NOT_OPENABLE"
    );
    expect(await starts(set.comparisonSetId)).toBe(0);
  });

  it("refuses a member from another leaf Category and leaves the set alone", async () => {
    const first = await publish();
    const second = await publish();
    const elsewhere = await publish({ categoryId: otherLeafId });
    const set = await begin(first.offeringId);
    await add(set.comparisonSetId, second.offeringId);

    const refused = await add(set.comparisonSetId, elsewhere.offeringId);

    // AC-3 and AC-4. The refusal names the rule, and the set the person built
    // is exactly where they left it.
    expect(refused.statusCode).toBe(422);
    expect(errorEnvelopeSchema.parse(refused.json()).code).toBe(
      "MEMBER_OTHER_CATEGORY"
    );
    const after = comparisonSetSchema.parse(
      (await send("GET", `/decision/comparison-sets/${set.comparisonSetId}`))
        .json()
    );
    expect(after.members.map((m) => m.offeringId).sort()).toEqual(
      [first.offeringId, second.offeringId].sort()
    );
  });

  it("refuses an Offering that is not publicly eligible", async () => {
    const first = await publish();
    const retired = await publish();
    await send(
      "POST",
      `/businesses/${retired.businessId}/offerings/${retired.offeringId}/retirement`,
      { cookie: retired.cookie }
    );
    const set = await begin(first.offeringId);

    const refused = await add(set.comparisonSetId, retired.offeringId);

    // AC-4. Eligibility is asked at the moment of joining, not at the moment
    // the person saw the Listing Card.
    expect(refused.statusCode).toBe(422);
    expect(errorEnvelopeSchema.parse(refused.json()).code).toBe(
      "MEMBER_INELIGIBLE"
    );
  });

  it("refuses a sixth member until one is explicitly replaced", async () => {
    const members = [];
    for (let index = 0; index < 5; index += 1)
      members.push((await publish()).offeringId);
    const sixth = (await publish()).offeringId;
    const set = await begin(members[0] as string);
    for (const offeringId of members.slice(1))
      await add(set.comparisonSetId, offeringId);

    const refused = await add(set.comparisonSetId, sixth);
    const replaced = await add(set.comparisonSetId, sixth, members[1]);

    // AC-6. The system never chooses whom to drop; the person names them.
    expect(refused.statusCode).toBe(422);
    expect(errorEnvelopeSchema.parse(refused.json()).code).toBe("SET_FULL");
    const after = comparisonSetSchema.parse(replaced.json());
    expect(after.members).toHaveLength(5);
    expect(after.members.map((m) => m.offeringId)).toContain(sixth);
    expect(after.members.map((m) => m.offeringId)).not.toContain(members[1]);
    expect(after.full).toBe(true);
  });

  it("lets a member be removed and the set stay usable", async () => {
    const first = await publish();
    const second = await publish();
    const third = await publish();
    const set = await begin(first.offeringId);
    await add(set.comparisonSetId, second.offeringId);
    await add(set.comparisonSetId, third.offeringId);

    const removed = await send(
      "DELETE",
      `/decision/comparison-sets/${set.comparisonSetId}/members/${third.offeringId}`
    );

    // AC-5. Removing is as explicit as adding, and the remaining two are still
    // a valid comparison.
    const after = comparisonSetSchema.parse(removed.json());
    expect(after.members).toHaveLength(2);
    expect(after.openable).toBe(true);
  });

  it("compares only the Attributes marked comparable", async () => {
    const first = await publish({
      attributes: [{ attributeId: mileageId, kind: "NUMBER", number: 10_000 }]
    });
    const second = await publish({
      attributes: [
        { attributeId: mileageId, kind: "NUMBER", number: 55_000 },
        { attributeId: noteId, kind: "TEXT", text: "Tek elden" }
      ]
    });
    const set = await begin(first.offeringId);
    await add(set.comparisonSetId, second.offeringId);

    const view = comparisonViewSchema.parse(
      (await compare(set.comparisonSetId)).json()
    );

    // AC-7. The Text Attribute is answered and applicable, and still absent —
    // its definition is not comparable, and that is the whole test.
    expect(view.rows.map((row) => row.attributeId)).toEqual([mileageId]);
    expect(view.rows[0]?.unit).toBe("km");
    expect(view.rows[0]?.values.map((value) => value?.number)).toEqual([
      10_000, 55_000
    ]);
  });

  it("states an absent comparable value rather than filling it in", async () => {
    const first = await publish({
      attributes: [{ attributeId: mileageId, kind: "NUMBER", number: 10_000 }]
    });
    const second = await publish();
    const set = await begin(first.offeringId);
    await add(set.comparisonSetId, second.offeringId);

    const view = comparisonViewSchema.parse(
      (await compare(set.comparisonSetId)).json()
    );

    // AC-8 and AC-10. The second Offering has no mileage, and nothing stands
    // in for it — no zero, no average, no "unknown" value pretending to be one.
    expect(view.rows[0]?.values[0]?.number).toBe(10_000);
    expect(view.rows[0]?.values[1]).toBeNull();
  });

  it("keeps every comparable Attribute applicable to every member", async () => {
    const first = await publish();
    const second = await publish();
    const set = await begin(first.offeringId);
    await add(set.comparisonSetId, second.offeringId);

    const view = comparisonViewSchema.parse(
      (await compare(set.comparisonSetId)).json()
    );

    // AC-9. Every member shares one leaf, so applicability is the same for all
    // of them — there is no "not applicable" result, and the response has no
    // shape that could express one. An unanswered row is present and empty.
    expect(view.rows).toHaveLength(1);
    expect(view.rows[0]?.values).toEqual([null, null]);
  });

  it("ranks nothing, scores nothing and recommends nothing", async () => {
    const first = await publish({
      attributes: [{ attributeId: mileageId, kind: "NUMBER", number: 10_000 }]
    });
    const second = await publish({
      attributes: [{ attributeId: mileageId, kind: "NUMBER", number: 55_000 }]
    });
    const set = await begin(first.offeringId);
    await add(set.comparisonSetId, second.offeringId);

    const response = await compare(set.comparisonSetId);

    // AC-10. One of these has half the mileage of the other, and the answer
    // says so only by reporting both numbers. There is no winner, no score and
    // no field in which either could have been expressed.
    const body = response.json<Record<string, unknown>>();
    expect(Object.keys(body).sort()).toEqual([
      "categoryId",
      "categoryName",
      "comparisonSetId",
      "full",
      "members",
      "openable",
      "rows"
    ]);
    expect(response.body).not.toMatch(/winner|score|rank|best|recommend/iu);
  });

  it("answers a set that has expired or never existed the same way", async () => {
    const first = await publish();
    const set = await begin(first.offeringId);
    await pool.query(
      `update comparison_set set expires_at = now() - interval '1 minute'
       where id = $1`,
      [set.comparisonSetId]
    );

    const expired = await send(
      "GET",
      `/decision/comparison-sets/${set.comparisonSetId}`
    );
    const never = await send("GET", `/decision/comparison-sets/${randomUUID()}`);

    // Current-flow state is allowed to disappear; that is what makes it
    // current-flow rather than history.
    expect(expired.statusCode).toBe(404);
    expect(never.statusCode).toBe(404);
    expect(errorEnvelopeSchema.parse(expired.json()).code).toBe(
      "COMPARISON_SET_NOT_FOUND"
    );
  });

  it("needs no account, and answers one no differently", async () => {
    const first = await publish();
    const second = await publish();
    const account = await signUp();
    const set = await begin(first.offeringId);
    await add(set.comparisonSetId, second.offeringId);

    const anonymous = await compare(set.comparisonSetId);
    const signedIn = await send(
      "POST",
      `/decision/comparison-sets/${set.comparisonSetId}/compare`,
      { cookie: account.cookie }
    );

    // PRD-0003 makes Compare part of a person's decision rather than a feature
    // of an account.
    expect(signedIn.statusCode).toBe(200);
    expect(signedIn.json()).toEqual(anonymous.json());
  });
});
