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
  browseViewSchema,
  searchViewSchema
} from "../packages/contracts/src/index.js";

/**
 * `I61` — the budget (`US-DSC-F11-001`, PRD-0002 v2.5 §10.6).
 *
 * **The prototype has had a budget bar since the beginning and the platform
 * could not answer it.** Not because nobody had written the query, but because
 * PRD-0002 §5.6 closed the Discovery criteria to three and §5.5 required every
 * Filter to be an Attribute — and a price is not an Attribute. The criterion
 * was excluded by construction, so this increment is a Frozen-document
 * revision first and a `where` clause second.
 *
 * The cases below are the acceptance criteria that are easy to get wrong, and
 * each of them is a way of *inventing a number*, which is the one thing a
 * platform that reports other people's prices may never do:
 *
 * - counting an unstated delivery cost as zero (AC-4);
 * - admitting a quoted Offering because it *might* be cheap (AC-5);
 * - converting a currency to compare it (AC-7);
 * - swapping a person's reversed bounds into the ones they "meant" (AC-8).
 */
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

suite("Increment I61 the budget", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let categoryId: string;

  const address = () => `bdg-${randomUUID()}@example.test`;
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

  const list = async (input: {
    amount: string | null;
    currency?: string;
    deliveryCost?: string;
    title: string;
  }) => {
    const account = await signUp();
    const business = await send("POST", "/businesses", {
      body: { name: `Mağaza ${randomUUID().slice(0, 6)}`, slug: slug() },
      cookie: account.cookie
    });
    const businessId = business.json<{ id: string }>().id;
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });
    const offering = await send("POST", `/businesses/${businessId}/offerings`, {
      body: { categoryId, slug: slug(), title: input.title },
      cookie: account.cookie
    });
    const offeringId = offering.json<{ id: string }>().id;
    await send(
      "PUT",
      `/businesses/${businessId}/offerings/${offeringId}/content`,
      {
        body: {
          attributes: [],
          categoryId,
          pricing:
            input.amount === null
              ? { kind: "ON_REQUEST", stockState: "UNKNOWN" }
              : {
                  amount: input.amount,
                  currency: input.currency ?? "TRY",
                  ...(input.deliveryCost === undefined
                    ? {}
                    : { deliveryCost: input.deliveryCost }),
                  kind: "FIXED",
                  stockState: "IN_STOCK"
                },
          title: input.title
        },
        cookie: account.cookie
      }
    );
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/publication`,
      { cookie: account.cookie }
    );
    return { offeringId };
  };

  /** Browse this Category, optionally under a budget. */
  const browse = async (price?: unknown) =>
    browseViewSchema.parse(
      (
        await send("POST", `/discovery/browse/categories/${categoryId}`, {
          body: price === undefined ? {} : { price }
        })
      ).json()
    );

  const titles = async (price?: unknown) =>
    ((await browse(price)).results ?? []).map((card) => card.title);

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

    const admin = await signUp();
    await pool.query(
      `insert into admin_authorization (user_id, granted_by) values ($1,'test')`,
      [admin.userId]
    );
    await send("PUT", "/auth/me/admin-context", { cookie: admin.cookie });
    const category = await send("POST", "/admin/categories", {
      body: {
        domain: "TECHNOLOGY",
        name: `Bütçe ${randomUUID().slice(0, 8)}`,
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

  it("keeps what fits and sets aside what does not", async () => {
    const cheap = `Ucuz ${randomUUID().slice(0, 8)}`;
    const dear = `Pahalı ${randomUUID().slice(0, 8)}`;
    await list({ amount: "42990.00", title: cheap });
    await list({ amount: "61900.00", title: dear });

    const within = await titles({ currency: "TRY", maxAmount: "45000.00" });
    expect(within).toContain(cheap);
    expect(within).not.toContain(dear);

    // AC-11. Removing the constraint restores the set rather than a subset of
    // it: a criterion that could not be undone would be a trap.
    const all = await titles();
    expect(all).toContain(cheap);
    expect(all).toContain(dear);
  });

  it("counts a stated delivery cost against the budget", async () => {
    /*
     * AC-3. The amount alone is not what a person pays, and a comparison that
     * admitted this Offering would be telling somebody with 45.000 that they
     * can afford something that costs 45.050 at the till.
     */
    const title = `Kargolu ${randomUUID().slice(0, 8)}`;
    await list({ amount: "44900.00", deliveryCost: "150.00", title });

    expect(
      await titles({ currency: "TRY", maxAmount: "45000.00" })
    ).not.toContain(title);
    expect(await titles({ currency: "TRY", maxAmount: "45050.00" })).toContain(
      title
    );
  });

  it("does not treat an unstated delivery cost as free — or as anything", async () => {
    /*
     * AC-4, and the single most likely way to get this wrong. §5.10.5 keeps
     * `null` (not stated) apart from `0` (free), so the comparison uses the
     * amount alone: the least the Offering could cost. Guessing a figure here
     * would exclude an Offering because of a number nobody wrote down.
     */
    const title = `Kargosuz ${randomUUID().slice(0, 8)}`;
    await list({ amount: "44900.00", title });

    expect(await titles({ currency: "TRY", maxAmount: "45000.00" })).toContain(
      title
    );
  });

  it("sets aside an Offering that has no amount at all", async () => {
    /*
     * AC-5. Not a judgement that quoted work is expensive — §10.4's rule,
     * unchanged: an Offering with no value for an applied criterion does not
     * satisfy it. A person who stated a budget asked to see things whose cost
     * is known.
     */
    const title = `Teklifli ${randomUUID().slice(0, 8)}`;
    await list({ amount: null, title });

    expect(
      await titles({ currency: "TRY", maxAmount: "999999.00" })
    ).not.toContain(title);
    expect(await titles()).toContain(title);
  });

  it("refuses to compare across currencies rather than converting", async () => {
    // AC-7. A converted amount is a figure no partner quoted.
    const title = `Dolarlı ${randomUUID().slice(0, 8)}`;
    await list({ amount: "1000.00", currency: "USD", title });

    expect(
      await titles({ currency: "TRY", maxAmount: "50000.00" })
    ).not.toContain(title);
    expect(await titles({ currency: "USD", maxAmount: "1500.00" })).toContain(
      title
    );
  });

  it("honours both bounds, inclusively", async () => {
    // AC-2. The boundary is inclusive so that a person who types their exact
    // limit sees the thing that costs exactly that.
    const exact = `Tam ${randomUUID().slice(0, 8)}`;
    const under = `Altında ${randomUUID().slice(0, 8)}`;
    await list({ amount: "20000.00", title: exact });
    await list({ amount: "5000.00", title: under });

    const between = await titles({
      currency: "TRY",
      maxAmount: "20000.00",
      minAmount: "10000.00"
    });
    expect(between).toContain(exact);
    expect(between).not.toContain(under);
  });

  it("answers reversed bounds with nothing, and does not swap them", async () => {
    /*
     * AC-8. The honest answer to "between 50.000 and 10.000" is "nothing",
     * beside the two figures the person typed — not the answer to a different
     * question the platform decided they meant.
     */
    const title = `Ters ${randomUUID().slice(0, 8)}`;
    await list({ amount: "30000.00", title });

    const reversed = await titles({
      currency: "TRY",
      maxAmount: "10000.00",
      minAmount: "50000.00"
    });
    expect(reversed).not.toContain(title);
    expect(reversed).toHaveLength(0);
  });

  it("refuses a constraint with no bound at all", async () => {
    // A constraint that narrows nothing is not a criterion; accepting it would
    // put a bound on screen whose effect a person could never see.
    const refused = await send(
      "POST",
      `/discovery/browse/categories/${categoryId}`,
      { body: { price: { currency: "TRY" } } }
    );
    expect(refused.statusCode).toBe(400);
  });

  it("narrows a Search the same way, with no Category chosen", async () => {
    /*
     * AC-1, the difference between this criterion and an Attribute Filter.
     * §10.1 can only offer a Filter once a leaf Category is selected, because
     * an Attribute is governed for a Category. An amount is carried by the
     * Offering, so the budget applies to a cross-Category Search too.
     */
    const stem = `Kulaklık${randomUUID().slice(0, 6)}`;
    await list({ amount: "4290.00", title: `${stem} ucuz` });
    await list({ amount: "18400.00", title: `${stem} pahalı` });

    const found = searchViewSchema.parse(
      (
        await send("POST", "/discovery/search", {
          body: {
            price: { currency: "TRY", maxAmount: "5000.00" },
            query: stem
          }
        })
      ).json()
    );

    expect(found.categoryId).toBeNull();
    expect(found.results.map((result) => result.title)).toEqual([
      `${stem} ucuz`
    ]);
  });

  it("leaves the ordering exactly where §12 put it", async () => {
    /*
     * AC-10, and the line this whole revision walks. §12.5 and §21.5 still
     * refuse a user-controlled Sort: the budget decides *which* Offerings are
     * Results and nothing about the order they appear in.
     *
     * **What that order is changed underneath this case in I63**, and the case
     * is the better for it. It used to assert Initial-Published-At — the dearer
     * one published last, so first — which made "the budget does not reorder"
     * indistinguishable from "the budget happens to agree with recency". The
     * order is now the Owner's, cheapest delivered first, and the assertion is
     * the same statement against a rule the budget could actually disturb:
     * under a ceiling that admits both, the cheaper one leads exactly as it
     * does with no ceiling at all.
     */
    const stem = `Sıra${randomUUID().slice(0, 6)}`;
    await list({ amount: "1000.00", title: `${stem} ucuz` });
    await list({ amount: "9000.00", title: `${stem} pahalı` });

    const unconstrained = (await titles()).filter((title) =>
      title.startsWith(stem)
    );
    const mine = (
      await titles({ currency: "TRY", maxAmount: "10000.00" })
    ).filter((title) => title.startsWith(stem));
    expect(mine).toEqual([`${stem} ucuz`, `${stem} pahalı`]);
    expect(mine).toEqual(unconstrained);
  });

  it("produces Zero Results a person can undo", async () => {
    /*
     * AC-13. The most common empty catalogue in a priced marketplace will be a
     * budget somebody forgot they set, so the recovery has to be reachable
     * from what comes back rather than from memory.
     */
    const view = await browse({ currency: "TRY", maxAmount: "1.00" });

    expect(view.results).toEqual([]);
    expect(view.zeroResults).not.toBeNull();
  });
});
