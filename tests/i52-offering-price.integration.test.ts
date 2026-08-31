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
import { offeringContentSchema } from "../packages/contracts/src/index.js";

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
 * `I52` end to end: an Offering's price survives the write, the read and the
 * column definitions (PRD-0001 v4.0 §5.10, §5.11, §5.12).
 *
 * The contract cases in `i52-offering-price.test.ts` prove what a request may
 * say. These prove what the **database** will hold, which is the part no
 * request can be trusted to enforce: rows arrive by paths that are not
 * requests, and the automated intakes §5.11 anticipates are exactly such a
 * path.
 */
suite("Increment I52 Offering price end to end", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

  const address = () => `prc-${randomUUID()}@example.test`;
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

  const draft = async () => {
    const account = await signUp();
    const created = await send("POST", "/businesses", {
      body: { name: "Author", slug: slug() },
      cookie: account.cookie
    });
    const businessId = created.json<{ id: string }>().id;
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });
    const offering = await send("POST", `/businesses/${businessId}/offerings`, {
      body: { categoryId, slug: slug(), title: "Original" },
      cookie: account.cookie
    });
    return {
      ...account,
      businessId,
      offeringId: offering.json<{ id: string }>().id
    };
  };

  const edit = (
    business: { businessId: string; cookie: string },
    offeringId: string,
    body: Record<string, unknown> = {}
  ) =>
    send(
      "PUT",
      `/businesses/${business.businessId}/offerings/${offeringId}/content`,
      {
        body: { attributes: [], categoryId, title: "Edited", ...body },
        cookie: business.cookie
      }
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
    const category = await send("POST", "/admin/categories", {
      body: {
        domain: "MOBILITY",
        name: "Cars",
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
    await app?.close();
    await pool.end();
  });

  describe("what a new Offering says about price before anyone sets one", () => {
    it("starts Unknown rather than free, and its Source is the owner", () => {
      /*
       * `UNKNOWN` is the honest default and the one true of every Offering
       * that existed before this migration. A `0` default would have published
       * a catalogue of free things.
       */
      return draft().then(async (business) => {
        const read = await send(
          "GET",
          `/businesses/${business.businessId}/offerings/${business.offeringId}/content`,
          { cookie: business.cookie }
        );
        const body = read.json<{
          pricing: { kind: string; stockState: string };
          productKey: string | null;
          source: string;
        }>();
        expect(body.pricing).toEqual({
          kind: "UNKNOWN",
          stockState: "UNKNOWN"
        });
        expect(body.productKey).toBeNull();
        expect(body.source).toBe("BUSINESS");
      });
    });
  });

  describe("a Fixed price written and read back", () => {
    it("returns the exact decimal it was given, as text", async () => {
      const business = await draft();
      const saved = await edit(business, business.offeringId, {
        pricing: {
          amount: "42990.90",
          currency: "TRY",
          deliveryCost: "0",
          kind: "FIXED",
          priorAmount: "49990.00",
          stockState: "IN_STOCK"
        },
        productKey: "EAN123"
      });
      expect(saved.statusCode).toBe(200);
      const body = offeringContentSchema.parse(saved.json());
      // Named field by field rather than compared to one object, so the
      // instant — which the server chooses — is asserted as *present* without
      // the whole comparison having to admit an `any`.
      expect(body.pricing.kind).toBe("FIXED");
      if (body.pricing.kind !== "FIXED") throw new Error("NOT_FIXED");
      expect(body.pricing.amount).toBe("42990.90");
      expect(body.pricing.currency).toBe("TRY");
      // `0` survives as `0.00`: `NUMERIC(12,2)` keeps its scale, and free
      // delivery reads back as free rather than as unstated.
      expect(body.pricing.deliveryCost).toBe("0.00");
      expect(body.pricing.priorAmount).toBe("49990.00");
      expect(body.pricing.stockState).toBe("IN_STOCK");
      expect(typeof body.pricing.amountSetAt).toBe("string");
      expect(body.productKey).toBe("EAN123");
    });

    it("stamps the instant the amount was established", async () => {
      /*
       * §5.10.3. The instant comes from the server, so a submission cannot
       * name it and a stale amount cannot arrive dressed as a fresh one.
       */
      const business = await draft();
      const before = Date.now();
      const saved = await edit(business, business.offeringId, {
        pricing: { amount: "1.00", currency: "TRY", kind: "FIXED" }
      });
      const body = offeringContentSchema.parse(saved.json());
      const stamped =
        body.pricing.kind === "FIXED"
          ? Date.parse(body.pricing.amountSetAt)
          : Number.NaN;
      expect(stamped).toBeGreaterThanOrEqual(before - 1000);
      expect(stamped).toBeLessThanOrEqual(Date.now() + 1000);
    });

    it("clears the instant when the Offering stops having an amount", async () => {
      // A price that is no longer stated leaves nothing behind that a surface
      // could read as "last known price, as of…".
      const business = await draft();
      await edit(business, business.offeringId, {
        pricing: { amount: "1.00", currency: "TRY", kind: "FIXED" }
      });
      const cleared = await edit(business, business.offeringId, {
        pricing: { kind: "ON_REQUEST" }
      });
      expect(offeringContentSchema.parse(cleared.json()).pricing).toEqual({
        kind: "ON_REQUEST",
        stockState: "UNKNOWN"
      });
      const row = await pool.query<{
        amount: string | null;
        amountSetAt: Date | null;
      }>(
        `select amount, amount_set_at as "amountSetAt" from offering where id = $1`,
        [business.offeringId]
      );
      expect(row.rows[0]?.amount).toBeNull();
      expect(row.rows[0]?.amountSetAt).toBeNull();
    });
  });

  describe("an edit that says nothing about price says the price is gone", () => {
    it("clears a stated price and leaves the Offering publishable", async () => {
      /*
       * The write shape is a replacement, and price is not exempt from it.
       * §5.10.2 is what makes that safe: clearing a price is not a withdrawal,
       * so a Published Offering stays Published.
       */
      const business = await draft();
      await edit(business, business.offeringId, {
        pricing: { amount: "5.00", currency: "TRY", kind: "FIXED" }
      });
      await pool.query(
        `update offering set status = 'PUBLISHED', published_at = now()
         where id = $1`,
        [business.offeringId]
      );
      const saved = await edit(business, business.offeringId);
      expect(saved.statusCode).toBe(200);
      const body = offeringContentSchema.parse(saved.json());
      expect(body.pricing).toEqual({ kind: "UNKNOWN", stockState: "UNKNOWN" });
      expect(body.status).toBe("PUBLISHED");
    });
  });

  describe("Source is not something a request can set", () => {
    it("keeps an owner's edit from relabelling where the record came from", async () => {
      /*
       * §5.11.1 stops an intake overwriting a human decision, which is worth
       * nothing if a human can label their own Offering `FEED` and hand it to
       * the intake. The refusal is the shape's, not a rule someone checks.
       */
      const business = await draft();
      const refused = await edit(business, business.offeringId, {
        source: "FEED"
      });
      expect(refused.statusCode).toBe(400);
      const row = await pool.query<{ source: string }>(
        `select source::text as source from offering where id = $1`,
        [business.offeringId]
      );
      expect(row.rows[0]?.source).toBe("BUSINESS");
    });
  });

  describe("the columns refuse what the contract refuses", () => {
    /*
     * Written against the table rather than the API. A `CHECK` and a Zod schema
     * saying the same thing are not redundant: the schema guards requests and
     * the column guards rows, and the feed intakes §5.11 anticipates will
     * write rows without ever making a request.
     */
    const insert = async (columns: Record<string, unknown>) => {
      const business = await draft();
      const names = ["business_id", "category_id", "slug", "title"];
      const values: unknown[] = [
        business.businessId,
        categoryId,
        slug(),
        "Row"
      ];
      for (const [name, value] of Object.entries(columns)) {
        names.push(name);
        values.push(value);
      }
      try {
        await pool.query(
          `insert into offering (${names.map((n) => `"${n}"`).join(",")})
           values (${values.map((_, index) => `$${index + 1}`).join(",")})`,
          values
        );
        return null;
      } catch (error) {
        return (error as { constraint?: string }).constraint ?? "UNNAMED";
      }
    };

    it("accepts a complete Fixed price", async () => {
      expect(
        await insert({
          amount: "10.00",
          amount_set_at: new Date(),
          currency: "TRY",
          pricing_kind: "FIXED"
        })
      ).toBeNull();
    });

    it("refuses a Fixed price missing its amount or its instant", async () => {
      expect(await insert({ pricing_kind: "FIXED" })).toBe(
        "offering_fixed_price_is_complete"
      );
      expect(
        await insert({
          amount: "10.00",
          currency: "TRY",
          pricing_kind: "FIXED"
        })
      ).toBe("offering_fixed_price_is_complete");
    });

    it("refuses an unpriced Offering carrying an amount", async () => {
      expect(
        await insert({
          amount: "10.00",
          amount_set_at: new Date(),
          currency: "TRY",
          pricing_kind: "ON_REQUEST"
        })
      ).toBe("offering_unpriced_carries_no_amount");
    });

    it("refuses negative money", async () => {
      expect(
        await insert({
          amount: "-1.00",
          amount_set_at: new Date(),
          currency: "TRY",
          pricing_kind: "FIXED"
        })
      ).toBe("offering_amounts_are_not_negative");
    });

    it("refuses a prior amount that is not a reduction", async () => {
      expect(
        await insert({
          amount: "10.00",
          amount_set_at: new Date(),
          currency: "TRY",
          pricing_kind: "FIXED",
          prior_amount: "8.00"
        })
      ).toBe("offering_prior_amount_is_a_reduction");
    });

    it("lets several Offerings share one Product Key", async () => {
      // §5.12.1. Not unique: Offerings sharing a key is the entire point.
      expect(await insert({ product_key: "EAN999" })).toBeNull();
      expect(await insert({ product_key: "EAN999" })).toBeNull();
    });
  });
});
