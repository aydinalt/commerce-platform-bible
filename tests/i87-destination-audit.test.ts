import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_AUDIT_ACTIONS } from "../packages/contracts/src/index.js";
import { OutboxProcessor } from "../apps/worker/src/outbox.processor.js";
import { silentLogger } from "../packages/testing/src/index.js";
import type {
  EmailDispatcher,
  EmailMessage
} from "../modules/notification/src/index.js";

/**
 * `I87` — the affiliate destination's Admin acts join the central trail.
 *
 * The Owner, 2026-09-05: _"Affiliate hedefleri üzerindeki işlemler (inceleme,
 * doğrulama, etkinleştirme) platformun para kazandıran en kritik eylemleridir.
 * Bu eylemlerin merkezi denetim izinde (`admin_audit_event`) yer almaması kabul
 * edilemez. Bir eylemin kendi yerel geçmişinde tutulması, merkezi kütüğün
 * varoluş amacıyla çelişir."_
 *
 * Two things were wrong, and only one of them was the one reported.
 *
 * **The reported one.** Review, validation and enablement each wrote their own
 * row and nothing else, so "who turned this handoff on" was answerable only by
 * knowing which local history to open.
 *
 * **The one found while fixing it.** `HIDE_OFFERING`, `RESTORE_OFFERING`,
 * `RESTRICT_BUSINESS`, `RESTORE_BUSINESS` and `REQUEST_CORRECTION` have been in
 * the audit enum since I83 with *nothing writing them* — the case note was
 * doing duty as the audit record, which is the same substitution in a place
 * nobody had looked. An enum value with no writer is worse than a missing one:
 * it makes the trail look complete.
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

suite("Increment I87 the destination acts in the trail", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dispatcher = new RecordingDispatcher();
  let app: NestFastifyApplication;
  let processor: OutboxProcessor;
  let admin: { cookie: string; userId: string };
  let categoryId: string;

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
    const email = `i87-${randomUUID()}@example.test`;
    await send("POST", "/auth/registrations", {
      body: { email, password: PASSWORD }
    });
    await processor.processBatch();
    const message = dispatcher.delivered.find((one) => one.recipient === email);
    if (!message) throw new Error("NO_MESSAGE_DELIVERED");
    const link = /https?:\/\/\S+/u.exec(message.body)?.[0];
    if (!link) throw new Error("NO_LINK_IN_MESSAGE");
    const confirmed = await send("POST", "/auth/registrations/confirmations", {
      body: { token: new URL(link).searchParams.get("token") }
    });
    const cookies = confirmed.cookies as { name: string; value: string }[];
    return {
      cookie: `commerce_session=${cookies.find((one) => one.name === "commerce_session")?.value ?? ""}`,
      userId: confirmed.json<{ userId: string }>().userId
    };
  };

  /** A listing with an authored destination, ready to be administered. */
  const listing = async () => {
    const account = await signUp();
    const created = await send("POST", "/businesses", {
      body: { name: "I87 Partner", slug: slug() },
      cookie: account.cookie
    });
    const businessId = created.json<{ id: string }>().id;
    await send("PUT", "/auth/me/business-context", {
      body: { businessId },
      cookie: account.cookie
    });
    const offering = await send("POST", `/businesses/${businessId}/offerings`, {
      body: { categoryId, slug: slug(), title: "I87" },
      cookie: account.cookie
    });
    const offeringId = offering.json<{ id: string }>().id;
    await send(
      "POST",
      `/businesses/${businessId}/offerings/${offeringId}/affiliate-destination`,
      {
        body: { reference: "https://partner.example/i87" },
        cookie: account.cookie
      }
    );
    return { businessId, cookie: account.cookie, offeringId };
  };

  /**
   * The same listing, published.
   *
   * Hiding refuses anything that is not Published — correctly, it is a
   * transition and not a status field — so the moderation cases below have to
   * take a listing all the way there: a display name on the Business and a
   * price on the Offering are both publication gates.
   */
  const published = async () => {
    const made = await listing();
    await send(`PUT`, `/businesses/${made.businessId}/information`, {
      body: { name: "I87 Partner", shortDescription: "I87" },
      cookie: made.cookie
    });
    const content = await send(
      "GET",
      `/businesses/${made.businessId}/offerings/${made.offeringId}/content`,
      { cookie: made.cookie }
    );
    await send(
      "PUT",
      `/businesses/${made.businessId}/offerings/${made.offeringId}/content`,
      {
        body: {
          attributes: [],
          categoryId: content.json<{ categoryId: string }>().categoryId,
          pricing: {
            amount: "1299.90",
            currency: "TRY",
            kind: "FIXED",
            stockState: "IN_STOCK"
          },
          title: "I87"
        },
        cookie: made.cookie
      }
    );
    await send(
      "POST",
      `/businesses/${made.businessId}/offerings/${made.offeringId}/publication`,
      { cookie: made.cookie }
    );
    return made;
  };

  const trail = async (targetId: string) =>
    (
      await pool.query<{ actionType: string; actorId: string }>(
        `select action_type::text as "actionType", actor_id as "actorId"
           from admin_audit_event where target_id = $1
          order by occurred_at, id`,
        [targetId]
      )
    ).rows;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    // Registration is throttled per address and per address family; a suite
    // that inherits another run's counters spends its setup being refused.
    await pool.query("delete from auth_throttle");
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
        name: "I87",
        slug: slug(),
        stableKey: key()
      },
      cookie: admin.cookie
    });
    categoryId = category.json<{ id: string }>().id;
    /*
     * Longer than the default hook timeout: this setup registers an account,
     * drains the outbox for its confirmation link and creates a Category, and
     * ten seconds is not reliably enough for all three on a loaded machine.
     */
  }, 60_000);

  afterAll(async () => {
    await app.close();
    await pool.end();
  }, 30_000);

  it("records the review, the result, the enablement and the disablement", async () => {
    const { offeringId } = await listing();
    const admins = `/admin/offerings/${offeringId}/affiliate-destination`;

    await send("POST", `${admins}/review`, {
      body: { note: "I87" },
      cookie: admin.cookie
    });
    await send("POST", `${admins}/validation`, {
      body: { result: "VALID" },
      cookie: admin.cookie
    });
    await send("POST", `${admins}/enablement`, { cookie: admin.cookie });
    await send("POST", `${admins}/disablement`, { cookie: admin.cookie });

    /*
     * In order, because the order is the story: reviewed, judged, switched on,
     * switched off. A set would answer "did these happen" and not "what
     * happened to this listing".
     */
    expect((await trail(offeringId)).map((row) => row.actionType)).toEqual([
      "REVIEW_DESTINATION",
      "VALIDATE_DESTINATION_VALID",
      "ENABLE_DESTINATION",
      "DISABLE_DESTINATION"
    ]);
    expect(
      (await trail(offeringId)).every((row) => row.actorId === admin.userId)
    ).toBe(true);
  });

  it("distinguishes a refused address from an approved one", async () => {
    /*
     * The row carries no free text, so a single `VALIDATE_DESTINATION` would
     * record that somebody judged an address and lose the judgement — and the
     * judgement is the half that explains a handoff which never went live.
     */
    const { offeringId } = await listing();
    await send(
      "POST",
      `/admin/offerings/${offeringId}/affiliate-destination/validation`,
      { body: { reason: "404", result: "INVALID" }, cookie: admin.cookie }
    );

    expect((await trail(offeringId)).map((row) => row.actionType)).toEqual([
      "VALIDATE_DESTINATION_INVALID"
    ]);
  });

  it("writes nothing when the act itself is refused", async () => {
    /*
     * Enabling a destination that was never validated fails, and a trail that
     * recorded the attempt would say a handoff was switched on that was not.
     * The record follows the act; it never anticipates it.
     */
    const { offeringId } = await listing();
    const refused = await send(
      "POST",
      `/admin/offerings/${offeringId}/affiliate-destination/enablement`,
      { cookie: admin.cookie }
    );

    expect(refused.statusCode).toBeGreaterThanOrEqual(400);
    expect(await trail(offeringId)).toEqual([]);
  });

  it("records hiding and restoring an Offering, which nothing wrote before", async () => {
    const { offeringId } = await published();

    await send("POST", `/admin/offerings/${offeringId}/concealment`, {
      cookie: admin.cookie
    });
    await send("POST", `/admin/offerings/${offeringId}/restoration`, {
      cookie: admin.cookie
    });

    expect((await trail(offeringId)).map((row) => row.actionType)).toEqual([
      "HIDE_OFFERING",
      "RESTORE_OFFERING"
    ]);
  });

  it("records restricting and restoring a Business", async () => {
    const { businessId } = await listing();

    await send("POST", `/admin/businesses/${businessId}/restriction`, {
      cookie: admin.cookie
    });
    await send("POST", `/admin/businesses/${businessId}/restoration`, {
      cookie: admin.cookie
    });

    expect((await trail(businessId)).map((row) => row.actionType)).toEqual([
      "RESTRICT_BUSINESS",
      "RESTORE_BUSINESS"
    ]);
  });

  it("records a correction request", async () => {
    const { businessId, offeringId } = await listing();

    await send("POST", `/admin/businesses/${businessId}/correction-requests`, {
      body: {
        contentArea: "TITLE",
        note: "Başlık ürünle uyuşmuyor.",
        offeringId,
        target: "OFFERING_CONTENT"
      },
      cookie: admin.cookie
    });

    expect((await trail(businessId)).map((row) => row.actionType)).toContain(
      "REQUEST_CORRECTION"
    );
  });

  it("keeps the database enum and the contract in step", async () => {
    /*
     * Two lists of the same thing in two languages. They drift the first time
     * somebody adds a value to one of them, and the symptom is a `22P02` in
     * production on the action nobody tested — long after the deploy.
     */
    const values = (
      await pool.query<{ value: string }>(
        `select unnest(enum_range(null::"AdminAuditAction"))::text as value`
      )
    ).rows.map((row) => row.value);

    expect([...values].sort()).toEqual([...ADMIN_AUDIT_ACTIONS].sort());
  });

  it("gives every action a label on the reading surface", () => {
    /*
     * A new enum value with no copy renders as a blank cell in the filter and
     * in the table, which reads as "no action" rather than as "an action this
     * screen has not been taught".
     */
    const copy = readFileSync("apps/web/src/platform/copy.ts", "utf8");
    for (const action of ADMIN_AUDIT_ACTIONS)
      expect(copy, `${action} needs a label`).toMatch(
        new RegExp(`${action}:\\s*[\`"]`, "u")
      );
  });
});
