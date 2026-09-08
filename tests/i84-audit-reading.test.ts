import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { adminAuditEventsSchema } from "../packages/contracts/src/index.js";
import { PgAuditRepository } from "../apps/api/src/persistence/pg-audit.repository.js";

/**
 * `I84` — reading the audit trail.
 *
 * The Owner's four decisions of 2026-09-05: super-admin only, thirty days by
 * default, filtered by actor / action / date, exportable as CSV.
 *
 * Two of them are the kind that look done and are not.
 *
 * **The access rule.** *"Gelecekte eklenecek Sub-Admin veya moderatörler bu
 * kütüğe erişemez."* There is one Admin tier today, so no check written now can
 * exclude a tier that does not exist. What can be done is to make the widening
 * impossible to do by accident: these routes name a *different resolver* from
 * every other Admin route, so a Sub-Admin revision has one place to change and
 * a reviewer has one name to grep. Asserted here, because the seam is worth
 * nothing if a later edit quietly swaps it back.
 *
 * **The date range.** The Owner described the window as reaching back to "the
 * 180-day retention limit we set". That limit belongs to Listing Reports; the
 * audit trail has no retention and cannot acquire one by accident, because the
 * table refuses DELETE and TRUNCATE. Capping the view at 180 days would hide
 * rows that exist — from the one surface built to disclose them.
 */
const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

suite("Increment I84 the audit trail, filtered", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const repository = new PgAuditRepository(pool);
  let actorId = "";
  let otherId = "";

  beforeAll(async () => {
    const make = async () =>
      (
        await pool.query<{ id: string }>(
          `insert into user_account
             (id, email, email_verified_at, status, updated_at)
           values (gen_random_uuid(), $1, now(), 'ENABLED', now())
           returning id`,
          [`audit-read-${randomUUID()}@example.test`]
        )
      ).rows[0]?.id ?? "";
    actorId = await make();
    otherId = await make();

    await repository.record({
      action: "PII_VIEW",
      actorId,
      caseId: randomUUID()
    });
    await repository.record({
      action: "CASE_OPEN",
      actorId,
      targetId: randomUUID()
    });
    await repository.record({ action: "SUSPEND_USER", actorId: otherId });
  });

  afterAll(async () => {
    await pool.end();
  });

  const read = (overrides: Record<string, unknown> = {}) =>
    repository.list({
      action: null,
      actorId: null,
      from: null,
      limit: 100,
      offset: 0,
      to: null,
      ...overrides
    });

  it("narrows by who acted", async () => {
    const mine = await read({ actorId });
    expect(mine.events.length).toBeGreaterThanOrEqual(2);
    expect(mine.events.every((event) => event.actorId === actorId)).toBe(true);
    expect(mine.events.some((event) => event.actorId === otherId)).toBe(false);
  });

  it("narrows by what was done", async () => {
    const views = await read({ action: "PII_VIEW", actorId });
    expect(views.events.every((e) => e.actionType === "PII_VIEW")).toBe(true);
    expect(views.total).toBeGreaterThanOrEqual(1);
  });

  it("excludes what happened outside the window", async () => {
    const future = new Date(Date.now() + 60 * 60 * 1000);
    const none = await read({ actorId, from: future });
    expect(none.events).toEqual([]);
    expect(none.total).toBe(0);

    const past = new Date(Date.now() - 60 * 60 * 1000);
    const some = await read({ actorId, from: past });
    expect(some.total).toBeGreaterThanOrEqual(2);
  });

  it("reports the unpaged total beside a page", async () => {
    /*
     * The count is what makes paging honest: a page of one hundred that does
     * not say how many there are cannot tell a reader whether they have seen
     * the record they came for.
     */
    const page = await read({ actorId, limit: 1 });
    expect(page.events).toHaveLength(1);
    expect(page.total).toBeGreaterThanOrEqual(2);
  });

  it("orders newest first", async () => {
    const found = await read({ actorId });
    const times = found.events.map((event) => event.occurredAt.getTime());
    expect([...times].sort((a, b) => b - a)).toEqual(times);
  });
});

describe("Increment I84 the reading surface", () => {
  const controller = readFileSync(
    "apps/api/src/platform/audit.controller.ts",
    "utf8"
  );
  const strip = (source: string): string =>
    source
      .replaceAll(/\/\*[\s\S]*?\*\//gu, " ")
      .replaceAll(/^\s*\/\/.*$/gmu, " ");

  it("gates every audit route on the super-admin seam", () => {
    const code = strip(controller);
    /*
     * **The whole point of the seam.** `resolveSuperAdmin` is `resolveAdmin`
     * today; if a later edit "simplifies" it back to the general resolver, the
     * Sub-Admin revision inherits the log that exists to watch it. Asserted as
     * the absence of the general call rather than the presence of the specific
     * one, because a route could call both.
     */
    expect(code).not.toMatch(/resolveAdmin\(/u);
    const gates = code.match(/resolveSuperAdmin\(/gu) ?? [];
    // One per route: the list and the export.
    expect(gates).toHaveLength(2);
  });

  it("has no route that writes, edits or deletes", () => {
    const code = strip(controller);
    for (const verb of ["@Post", "@Put", "@Patch", "@Delete"])
      expect(code, `audit controller must not expose ${verb}`).not.toContain(
        verb
      );
  });

  it("quotes and escapes every CSV field", () => {
    /*
     * No value in these columns can contain a comma today — they are UUIDs, an
     * enum and a timestamp. That is precisely why the escaping is asserted now:
     * the first field that can will be added later, by somebody who is not
     * thinking about the CSV.
     */
    expect(controller).toContain(`replaceAll('"', '""')`);
    expect(controller).toContain("\\r\\n");
    // The BOM, so Excel does not read a UTF-8 export as the local codepage.
    expect(controller).toContain("\\uFEFF");
  });

  it("builds the export link from the same filters as the page", () => {
    /*
     * One query string for both. A file that describes a different set of rows
     * from the screen it was downloaded off is the way an export quietly
     * becomes wrong, and it is invisible until somebody relies on it.
     */
    const page = readFileSync(
      "apps/web/src/app/admin/audit-logs/page.tsx",
      "utf8"
    );
    expect(page).toContain("auditQuery(");
    expect(page).toContain("/api/v1/admin/audit-events/export?${query}");
  });

  it("does not cap the range at the report-retention figure", () => {
    /*
     * The Owner's 180 days belongs to Listing Reports. The trail is never
     * swept, so a 180-day cap would hide existing rows from the surface built
     * to disclose them. The distinction is reported to him rather than silently
     * resolved either way — but the page must not carry the cap meanwhile.
     */
    const page = readFileSync(
      "apps/web/src/app/admin/audit-logs/page.tsx",
      "utf8"
    ).replaceAll(/\/\*[\s\S]*?\*\//gu, " ");
    expect(page).not.toMatch(/180/u);
    expect(page).toContain("DEFAULT_DAYS = 30");
  });

  it("keeps the trail free of names and addresses", () => {
    // Ids only, like every other Admin surface.
    const parsed = adminAuditEventsSchema.safeParse({
      events: [
        {
          actionType: "PII_VIEW",
          actorEmail: "someone@example.test",
          actorId: randomUUID(),
          caseId: null,
          id: "1",
          occurredAt: new Date().toISOString(),
          targetId: null
        }
      ],
      offset: 0,
      total: 1
    });
    expect(parsed.success).toBe(false);
  });
});
