import { randomUUID } from "node:crypto";
import { createElement } from "react";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { DestinationManagementEntry } from "@commerce/contracts";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import { silentLogger } from "../packages/testing/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { ACTION_IDLE } from "../apps/web/src/business/action-outcome";
import { DestinationForm } from "../apps/web/src/app/businesses/[businessId]/offerings/[offeringId]/destination/destination-form";
import {
  DESTINATION_ENTRY_LABELS,
  ELIGIBILITY_COPY,
  PLATFORM_OWNS,
  SAVE_CONSEQUENCE,
  offers
} from "../apps/web/src/business/destination";

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
 * UX-0005 §13 Affiliate Destination Management.
 *
 * The section is mostly a list of things a Business may not do: Review,
 * Validate, Enable, Disable, and recalculate Handoff Eligibility. None of them
 * is refused anywhere in the web app, because none of them is expressible —
 * so these tests check that the API has no owner route for them and that the
 * screen offers no control that could reach one.
 */
suite("Increment I8 destination management", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

  const address = () => `dm-${randomUUID()}@example.test`;
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

  type Owner = { businessId: string; cookie: string; userId: string };

  const owner = async (): Promise<Owner> => {
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

  const draft = async (business: Owner) =>
    (
      await send("POST", `/businesses/${business.businessId}/offerings`, {
        body: { categoryId, slug: slug(), title: "Kırmızı araba" },
        cookie: business.cookie
      })
    ).json<{ id: string }>().id;

  const management = async (business: Owner, offeringId: string) =>
    (
      await send(
        "GET",
        `/businesses/${business.businessId}/offerings/${offeringId}/affiliate-destination/management`,
        { cookie: business.cookie }
      )
    ).json<DestinationManagementEntry>();

  const author = (
    business: Owner,
    offeringId: string,
    reference: string,
    method: "POST" | "PUT"
  ) =>
    send(
      method,
      `/businesses/${business.businessId}/offerings/${offeringId}/affiliate-destination`,
      { body: { reference }, cookie: business.cookie }
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

  it("offers Create where none exists, and calls that an opportunity", async () => {
    const business = await owner();
    const offeringId = await draft(business);

    const entry = await management(business, offeringId);

    // The management read answers "what may I do", where absence is the very
    // condition Create exists for. The destination read answers "what is
    // this", where the same absence is a 404 — two questions, two routes.
    expect(entry.destination).toBeNull();
    expect(offers(entry.entries, "CREATE")).toBe(true);
    expect(offers(entry.entries, "EDIT")).toBe(false);
    const missing = await send(
      "GET",
      `/businesses/${business.businessId}/offerings/${offeringId}/affiliate-destination`,
      { cookie: business.cookie }
    );
    expect(missing.statusCode).toBe(404);
  });

  it("returns an Enabled destination to not enabled when its address changes", async () => {
    const business = await owner();
    const offeringId = await draft(business);
    await author(business, offeringId, "https://example.test/a", "POST");
    // Platform's own routes, and note the address: they live under
    // `admin/offerings`, not under the Business's Offering. The four actions
    // AC-8 denies an owner are not refusals at the owner's address — there is
    // no route at the owner's address to refuse them.
    await send(
      "POST",
      `/admin/offerings/${offeringId}/affiliate-destination/validation`,
      { body: { result: "VALID" }, cookie: admin.cookie }
    );
    await send(
      "POST",
      `/admin/offerings/${offeringId}/affiliate-destination/enablement`,
      { cookie: admin.cookie }
    );
    const before = await management(business, offeringId);

    await author(business, offeringId, "https://example.test/b", "PUT");
    const after = await management(business, offeringId);

    // `US-OFR-F06-001` AC-4. This is why the form says so before the field
    // rather than after the save: someone fixing a typo on an Enabled
    // destination is about to disable it.
    expect(before.destination?.handoffEligibility).toBe("ELIGIBLE");
    expect(after.destination?.status).toBe("DRAFT");
    expect(after.destination?.validationResult).toBe("NOT_VALIDATED");
    expect(after.destination?.handoffEligibility).toBe("INELIGIBLE");
    expect(SAVE_CONSEQUENCE).toMatch(/not enabled and not checked/iu);
  });

  it("leaves an Archived Offering's destination readable and nothing more", async () => {
    const business = await owner();
    const offeringId = await draft(business);
    await author(business, offeringId, "https://example.test/c", "POST");
    await send(
      "POST",
      `/businesses/${business.businessId}/offerings/${offeringId}/retirement`,
      { cookie: business.cookie }
    );

    const entry = await management(business, offeringId);
    const refused = await author(
      business,
      offeringId,
      "https://example.test/d",
      "PUT"
    );

    // §13's view-only case, composed by the API rather than tested here: the
    // screen renders no form because it was handed no entry that offers one.
    expect(entry.destination?.reference).toBe("https://example.test/c");
    expect(offers(entry.entries, "EDIT")).toBe(false);
    expect(offers(entry.entries, "CREATE")).toBe(false);
    expect(offers(entry.entries, "VIEW")).toBe(true);
    expect(refused.statusCode).toBe(403);
  });

  it("gives the owner no route to Review, Validate, Enable or Disable", async () => {
    const business = await owner();
    const offeringId = await draft(business);
    await author(business, offeringId, "https://example.test/e", "POST");
    const base = `/businesses/${business.businessId}/offerings/${offeringId}/affiliate-destination`;

    const attempts = [
      await send("POST", `${base}/review`, {
        body: { note: "looks fine" },
        cookie: business.cookie
      }),
      await send("POST", `${base}/validation`, {
        body: { result: "VALID" },
        cookie: business.cookie
      }),
      await send("POST", `${base}/enablement`, { cookie: business.cookie }),
      await send("POST", `${base}/disablement`, { cookie: business.cookie })
    ];

    // AC-8, from the outside — and stronger than a refusal. These four verbs
    // live under `admin/offerings`; at the Business's own address there is no
    // route to refuse. The four absent buttons on the screen are an absence
    // all the way down rather than a decision the browser made.
    expect(attempts.map((r) => r.statusCode)).toEqual([404, 404, 404, 404]);
    const unchanged = await management(business, offeringId);
    expect(unchanged.destination?.status).toBe("DRAFT");
    expect(unchanged.destination?.validationResult).toBe("NOT_VALIDATED");
  });

  it("offers one field and names who owns the rest", () => {
    const markup = renderToStaticMarkup(
      createElement(DestinationForm, {
        action: () => Promise.resolve(ACTION_IDLE),
        label: DESTINATION_ENTRY_LABELS.EDIT,
        reference: "https://example.test/f"
      })
    );

    // One field, because the contract has one field. Status, validation and
    // eligibility appear nowhere as inputs — not even disabled, which would
    // suggest they are things an owner might one day set.
    expect(markup).toContain('name="reference"');
    expect(markup).not.toMatch(/name="(?!reference")/u);
    // No control for the four platform verbs. The consequence copy does say
    // "not enabled", which is a reading of the destination's status and not a
    // button, so the check is against controls rather than against words.
    expect(markup).not.toMatch(
      /<button[^>]*>(?![^<]*Save)|<input(?![^>]*name="reference")/u
    );
    expect(markup).toContain(SAVE_CONSEQUENCE);
  });

  it("says who does what instead of leaving it to be inferred", () => {
    // Four missing buttons explain nothing. An owner who does not know that
    // enabling is the platform's job reads "Not enabled" as something they
    // forgot to do.
    expect(PLATFORM_OWNS).toMatch(/platform/iu);
    expect(ELIGIBILITY_COPY.INELIGIBLE).not.toMatch(/enable|validate/iu);
  });
});
