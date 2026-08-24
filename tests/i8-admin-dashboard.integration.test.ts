import { randomUUID } from "node:crypto";
import { createElement } from "react";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { AdminPanel, Analytics } from "@commerce/contracts";

import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import { silentLogger } from "../packages/testing/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";
import { AnalyticsTable } from "../apps/web/src/app/admin/analytics-table";
import {
  ANALYTICS_UNAVAILABLE,
  CORE_FLOW_LABELS,
  DOMAIN_GAP,
  FUNCTION_LABELS,
  PERIODS,
  readPeriod
} from "../apps/web/src/platform/panel";
import { ANALYTICS } from "../apps/web/src/platform/copy";

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
 * UX-0006 §5, §6 and §12.
 *
 * The Admin surface is the one place where every authority in the platform is
 * within reach, so the tests here are mostly about what is *not* within reach:
 * no way in without all three conditions, no provisioning verb, no figure
 * dressed up as a sale, and no Domain invented for something that has none.
 */
suite("Increment I8 Admin Dashboard", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;

  const address = () => `ad-${randomUUID()}@example.test`;

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

  const authorize = (userId: string) =>
    pool.query(
      `insert into admin_authorization (user_id, granted_by) values ($1,'test')`,
      [userId]
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
  });

  beforeEach(async () => {
    await pool.query("delete from auth_throttle");
    dispatcher.delivered.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("opens for none of the three conditions on its own", async () => {
    const unauthorized = await signUp();
    const authorized = await signUp();
    await authorize(authorized.userId);

    const noAuthorization = await send("GET", "/admin/panel", {
      cookie: unauthorized.cookie
    });
    const notEntered = await send("GET", "/admin/panel", {
      cookie: authorized.cookie
    });
    await send("PUT", "/auth/me/admin-context", { cookie: authorized.cookie });
    const entered = await send("GET", "/admin/panel", {
      cookie: authorized.cookie
    });

    // §5.2. Authorization alone opens nothing: being able to enter the Admin
    // surface and being in it are different states, and the second is an act
    // somebody performs.
    expect(noAuthorization.statusCode).toBeGreaterThanOrEqual(400);
    expect(notEntered.statusCode).toBeGreaterThanOrEqual(400);
    expect(entered.statusCode).toBe(200);
    // And the screen cannot tell the failures apart, because the API does not:
    // a page that distinguished them would be a way of testing whether an
    // authorization exists.
    expect(noAuthorization.statusCode).toBe(notEntered.statusCode);
  });

  it("creates no Business ownership by authorizing an account", async () => {
    const account = await signUp();
    await authorize(account.userId);
    await send("PUT", "/auth/me/admin-context", { cookie: account.cookie });

    const panel = (
      await send("GET", "/admin/panel", { cookie: account.cookie })
    ).json<AdminPanel>();

    // §5.2. Admin authorization attaches to the existing account and creates
    // nothing else — the two are different relationships and stay different.
    expect(panel.ownedBusinessIds).toEqual([]);
    expect(panel.inheritedBaselines).toContain("GUEST");
  });

  it("offers no way to grant or remove Admin authority", async () => {
    const account = await signUp();
    await authorize(account.userId);
    await send("PUT", "/auth/me/admin-context", { cookie: account.cookie });

    const panel = (
      await send("GET", "/admin/panel", { cookie: account.cookie })
    ).json<AdminPanel>();

    // §13. Establishing the first Admin, granting and removing authorization,
    // and suspending an Admin-authorized account are Product Owner acts taken
    // outside this application. None is a value the vocabulary can hold, so
    // none can appear on the screen even by accident.
    for (const entry of panel.functions)
      expect(entry).not.toMatch(/grant|remove|revoke|transfer|delegate|tier/iu);
    // Every offered function has a label, so an entry added upstream cannot
    // render as nothing.
    for (const entry of panel.functions)
      expect(FUNCTION_LABELS[entry]).toBeTruthy();
  });

  it("keeps the four periods and invents no fifth", async () => {
    const account = await signUp();
    await authorize(account.userId);
    await send("PUT", "/auth/me/admin-context", { cookie: account.cookie });

    const custom = await send("GET", "/admin/analytics?period=LAST_YEAR", {
      cookie: account.cookie
    });
    const chosen = await send("GET", "/admin/analytics?period=TODAY", {
      cookie: account.cookie
    });

    // §12.1. Four periods and no custom range — a date picker would be the
    // first step towards a report builder this Story excludes.
    expect(custom.statusCode).toBe(400);
    expect(chosen.json<Analytics>().period).toBe("TODAY");
    expect(PERIODS).toHaveLength(4);
    // An address carrying something else falls back rather than failing: the
    // period is navigation, not input.
    expect(readPeriod("LAST_YEAR")).toBe("LAST_7_DAYS");
    expect(readPeriod("TODAY")).toBe("TODAY");
  });

  it("names a Completion for what the platform did and nothing more", () => {
    // §12.4. A column header is where an external-success claim would appear
    // first and be repeated most. Neither Completion is called a sale, a lead,
    // a conversion or a response.
    for (const label of Object.values(CORE_FLOW_LABELS))
      expect(label).not.toMatch(
        /sale|sold|purchase|lead|conversion|revenue|response|reply|success/iu
      );
    expect(CORE_FLOW_LABELS.AFFILIATE_HANDOFF_COMPLETIONS).toMatch(/devir/iu);
    expect(CORE_FLOW_LABELS.DIRECT_CONTACT_COMPLETIONS).toMatch(/gösterildi/u);
  });

  it("shows a figure with no Domain as having none", async () => {
    const account = await signUp();
    await authorize(account.userId);
    await send("PUT", "/auth/me/admin-context", { cookie: account.cookie });
    const analytics = (
      await send("GET", "/admin/analytics?period=ALL_TIME", {
        cookie: account.cookie
      })
    ).json<Analytics>();

    const markup = renderToStaticMarkup(
      createElement(AnalyticsTable, { analytics })
    );

    // §12.2. A Domain breakdown may not sum to the overall figure, and the gap
    // is the truth rather than a defect — said out loud, because an
    // unexplained gap is eventually "fixed" by guessing.
    expect(markup).toContain(DOMAIN_GAP);
    expect(markup).toContain(CORE_FLOW_LABELS.DISCOVERY_STARTS);
    // Lifecycle and public eligibility stay two tables: a Published Offering
    // is not necessarily a publicly visible one.
    expect(markup).toContain(ANALYTICS.lifecycle);
    expect(markup).toContain(ANALYTICS.publicEligibility);

    /*
     * **Rendered, not resolved.** I29 gave the tally keys Turkish names and
     * proved the resolver with a unit case — and a mutation putting
     * `${entry.domain}` back into this cell passed anyway, because a function
     * being right says nothing about whether the screen calls it.
     *
     * So the assertion is against the markup: no contract identifier reaches
     * an Admin. `_` catches the screaming-case keys without naming any one of
     * them, which is the point — a value added upstream and rendered raw fails
     * here without anybody having to remember to add it.
     */
    const rendered = markup.replace(/<[^>]*>/gu, " ");
    expect(rendered).not.toMatch(/\b[A-Z]{2,}(_[A-Z]+)+\b/u);
  });

  it("keeps unavailable and zero apart", () => {
    // §14. One is a figure an Admin may act on; the other is a question that
    // was not answered. A page of quiet zeros would be the worse of the two.
    expect(ANALYTICS_UNAVAILABLE).toMatch(/sıfır demek değildir/iu);
  });
});
