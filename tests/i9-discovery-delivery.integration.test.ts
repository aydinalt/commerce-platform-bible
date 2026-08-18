import { randomUUID } from "node:crypto";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";

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
 * The one Discovery criterion nothing yet asserted.
 *
 * Reading all 81 against the suite found the ten `US-DSC` Stories covered
 * almost exactly by the I3 and I4 suites — `US-DSC-F05-001`'s twelve Filter
 * criteria have twelve tests, and `US-DSC-F03-001` AC-4's six surfaces have one
 * each. `US-DSC-F09-001` AC-3 is the exception, and it is a criterion about an
 * *ending* rather than an action: Discovery's responsibility for an open finishes
 * when the Offering is handed to UX-0003.
 *
 * An ending is only observable by what stops happening, which is why it is easy
 * to leave unasserted.
 */
suite("Increment I9 Discovery delivery evidence", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let leafId: string;

  const address = () => `dd-${randomUUID()}@example.test`;
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

  /** A publicly eligible Offering in the shared leaf Category. */
  const publish = async (title = "Kırmızı spor araba") => {
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
    const offeringSlug = slug();
    const offering = await send("POST", `/businesses/${businessId}/offerings`, {
      body: { categoryId: leafId, slug: offeringSlug, title },
      cookie: account.cookie
    });
    const offeringId = offering.json<{ id: string }>().id;
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/publication`,
      { cookie: account.cookie }
    );
    return { offeringId, offeringSlug };
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
    const root = await send("POST", "/admin/categories", {
      body: {
        domain: "MOBILITY",
        name: "Araçlar",
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });
    const leaf = await send("POST", "/admin/categories", {
      body: {
        name: "Otomobil",
        parentId: root.json<{ id: string }>().id,
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

  it("leaves the Discovery path exactly where it was when an Offering opens", async () => {
    const { offeringSlug } = await publish();
    const pathId = randomUUID();
    const before = await send(
      "POST",
      `/discovery/browse/categories/${leafId}`,
      { body: { discoveryPathId: pathId } }
    );

    const opened = await send("GET", `/offerings/${offeringSlug}`);
    const after = await send("POST", `/discovery/browse/categories/${leafId}`, {
      body: { discoveryPathId: pathId }
    });
    const starts = await pool.query<{ total: number }>(
      `select count(*)::int as total from discovery_start where path_id = $1`,
      [pathId]
    );

    // `US-DSC-F09-001` AC-3. Discovery's responsibility for this open ends when
    // the Offering is handed over, and an ending shows only as things that do
    // not happen: the path still has its one Start, and the same request
    // answers exactly as it did before. Opening is not a step in the path.
    expect(opened.statusCode).toBe(200);
    expect(starts.rows[0]?.total).toBe(1);
    expect(after.json()).toEqual(before.json());
  });

  it("records the open against the Offering and not against the path", async () => {
    const { offeringId, offeringSlug } = await publish("Mavi sedan");
    const pathId = randomUUID();
    await send("POST", `/discovery/browse/categories/${leafId}`, {
      body: { discoveryPathId: pathId }
    });

    await send("GET", `/offerings/${offeringSlug}`);
    const occurrence = await pool.query<{ offering_id: string }>(
      `select offering_id from offering_presentation_open where offering_id = $1`,
      [offeringId]
    );
    const columns = await pool.query<{ column_name: string }>(
      `select column_name from information_schema.columns
       where table_name = 'offering_presentation_open'`
    );
    const names = columns.rows.map((r) => r.column_name);

    // AC-3 again, from the side that lasts. The occurrence belongs to the
    // Offering and the Domain it happened in; the table has no column that
    // could name a Discovery path, so nothing downstream can attribute an open
    // back to the route that led there even by accident.
    //
    // Asserted against the schema rather than against one row, because the
    // claim is that the association cannot be made, not that it was not made
    // this time.
    expect(occurrence.rowCount).toBe(1);
    expect(names).toContain("offering_id");
    expect(names).toContain("domain_id");
    expect(names).not.toContain("path_id");
    expect(names).not.toContain("discovery_path_id");
  });
});
