import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { adminUserAccountsSchema } from "../packages/contracts/src/index.js";

/**
 * `I83` — the audit trail and the register of accounts.
 *
 * Two Owner instructions of 2026-09-05.
 *
 * **The trail.** *"`actor_id`, `action_type`, `target_id`, `case_id` ve
 * `timestamp` tutacak değiştirilemez (append-only) bir tablo."* The word doing
 * the work is *değiştirilemez*. A table nobody currently writes an `UPDATE`
 * against is not immutable — it is a table that has not been edited yet, and an
 * audit trail exists precisely for the situation where somebody has a reason to
 * edit it. So the cases below try to change it and expect the database to
 * refuse, rather than reading the code and trusting that it never asks.
 *
 * **The register.** *"bu listede e-posta adresleri yer almamalıdır."* The
 * enforcement is in the contract rather than in a query remembering to drop a
 * field, so that is where it is checked.
 */
const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

suite("Increment I83 the audit trail", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let actorId = "";

  beforeAll(async () => {
    const account = await pool.query<{ id: string }>(
      `insert into user_account
         (id, email, email_verified_at, status, updated_at)
       values (gen_random_uuid(), $1, now(), 'ENABLED', now())
       returning id`,
      [`audit-${randomUUID()}@example.test`]
    );
    actorId = account.rows[0]?.id ?? "";
  });

  afterAll(async () => {
    await pool.end();
  });

  const write = async (action = "PII_VIEW") =>
    (
      await pool.query<{ id: string }>(
        `insert into admin_audit_event (actor_id, action_type, target_id, case_id)
         values ($1, $2::"AdminAuditAction", $3, $4) returning id`,
        [actorId, action, randomUUID(), randomUUID()]
      )
    ).rows[0]?.id ?? "";

  it("records who acted, on what, under which case, and when", () => {
    return (async () => {
      const id = await write();
      const found = await pool.query<{
        actionType: string;
        actorId: string;
        caseId: string | null;
        occurredAt: Date;
        targetId: string | null;
      }>(
        `select actor_id as "actorId", action_type::text as "actionType",
           target_id as "targetId", case_id as "caseId",
           occurred_at as "occurredAt"
         from admin_audit_event where id = $1`,
        [id]
      );
      const row = found.rows[0];
      expect(row?.actorId).toBe(actorId);
      expect(row?.actionType).toBe("PII_VIEW");
      expect(row?.targetId).not.toBeNull();
      expect(row?.caseId).not.toBeNull();
      expect(row?.occurredAt).toBeInstanceOf(Date);
    })();
  });

  it("refuses UPDATE, DELETE and TRUNCATE alike", async () => {
    const id = await write();

    /*
     * **All three, and TRUNCATE is the one that matters.** Row triggers do not
     * fire on it, so a table guarded only against UPDATE and DELETE is
     * append-only against the two statements nobody would reach for and open to
     * the one somebody would. Found by testing the first two, watching
     * `truncate` empty the table anyway, and adding a statement-level trigger.
     */
    await expect(
      pool.query(`update admin_audit_event set action_type = 'CASE_OPEN'`)
    ).rejects.toThrow(/append-only/u);
    await expect(
      pool.query(`delete from admin_audit_event where id = $1`, [id])
    ).rejects.toThrow(/append-only/u);
    await expect(pool.query(`truncate admin_audit_event`)).rejects.toThrow(
      /append-only/u
    );

    // The row is still there, unchanged, after all three attempts.
    const after = await pool.query<{ actionType: string }>(
      `select action_type::text as "actionType" from admin_audit_event
       where id = $1`,
      [id]
    );
    expect(after.rows[0]?.actionType).toBe("PII_VIEW");
  });

  it("will not let an acting account be deleted out from under its rows", async () => {
    await write();
    /*
     * `ON DELETE RESTRICT`, and it is load-bearing: cascading would let
     * removing a user erase the record of what that user did, which is the one
     * deletion an audit trail must survive.
     */
    await expect(
      pool.query(`delete from user_account where id = $1`, [actorId])
    ).rejects.toThrow(/violates foreign key constraint/u);
  });

  it("names its actions exactly as the moderation vocabulary does", async () => {
    const values = await pool.query<{ value: string }>(
      `select unnest(enum_range(null::"AdminAuditAction"))::text as value`
    );
    const names = values.rows.map((row) => row.value);
    /*
     * The Owner wrote `USER_SUSPEND` as an example; the seven General
     * Moderation actions have been `SUSPEND_USER` and `REINSTATE_USER` since
     * `US-PLT-F02-001`. Matching the existing vocabulary means an action is
     * recorded without a translation table, and a translation table between two
     * spellings of the same seven things is where the eighth spelling comes
     * from.
     */
    expect(names).toContain("SUSPEND_USER");
    expect(names).toContain("REINSTATE_USER");
    expect(names).not.toContain("USER_SUSPEND");
    expect(names).toContain("PII_VIEW");
  });
});

describe("Increment I83 the register of accounts", () => {
  it("has nowhere to put an email address", () => {
    /*
     * The Owner's PII rule, enforced by the shape rather than by a query
     * remembering to drop a column. `.strict()` means a response carrying an
     * `email` would be rejected rather than passed along.
     */
    const parsed = adminUserAccountsSchema.safeParse({
      accounts: [
        {
          businessCount: 0,
          email: "someone@example.test",
          isAdmin: false,
          registeredAt: new Date().toISOString(),
          reviewCount: 0,
          status: "ENABLED",
          userId: randomUUID()
        }
      ],
      total: 1
    });
    expect(parsed.success).toBe(false);
  });

  it("shows no address and offers no moderation verb of its own", () => {
    const page = readFileSync(
      "apps/web/src/app/admin/users/page.tsx",
      "utf8"
    ).replaceAll(/\/\*[\s\S]*?\*\//gu, " ");
    expect(page).not.toMatch(/email/iu);
    /*
     * No Suspend button here. The action belongs to a Moderation Case, which
     * composes which of the seven a target currently admits; a button on a
     * register would be a second path to the same effect with none of that
     * reasoning behind it. The register opens a case, and the case acts.
     */
    /*
     * The *action*, not the word. A first version forbade `susp` anywhere,
     * which also matched `SUSPENDED` in the status filter — a status the
     * register exists to display. Forbidding that would have demanded a
     * register that cannot show which accounts are suspended.
     */
    expect(page).not.toMatch(/suspension|reinstatement/iu);
    expect(page).not.toMatch(/<form/u);
    expect(page).toContain("<OpenCase");
  });

  it("says why an Admin-authorized account carries no control", () => {
    /*
     * AC-5 and Owner Decision D22: such an account is moderated by the Product
     * Owner outside this surface. The row says so where the control would have
     * been, rather than offering one that submission would refuse.
     */
    const page = readFileSync("apps/web/src/app/admin/users/page.tsx", "utf8");
    expect(page).toContain("account.isAdmin ?");
    expect(page).toContain("ACCOUNTS.protectedNote");
  });
});
