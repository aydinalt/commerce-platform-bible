import { randomUUID } from "node:crypto";

import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PgDecisionRepository } from "../apps/api/src/persistence/pg-decision.repository.js";
import { OUTBOX_RETENTION_MS } from "../packages/database/src/index.js";
import { RetentionSweeper } from "../apps/worker/src/retention.sweeper.js";

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;

/**
 * Deleting what the platform has finished with.
 *
 * ADR-0012 §3 names session cleanup a mandatory control and it did not exist:
 * six tables carried an `expires_at`, five of them had an index on it, and
 * nothing ever used it to remove a row. The sharpest consequence was not table
 * growth — it was that an abandoned `pending_registration` held somebody's
 * email address and password hash indefinitely, for a person who never became a
 * User.
 *
 * These cases are as much about **what survives** as about what goes. A sweep
 * that deletes too much is a worse failure than no sweep at all, so every
 * deletion here is paired with the neighbouring row that must not move.
 *
 * Every assertion names its own identifiers. The sweep is global and other
 * suites share this database, so counting rows would be counting their work
 * too.
 */
suite("Increment I17 retention sweep", () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const sweeper = new RetentionSweeper(pool);
  const decisions = new PgDecisionRepository(pool);

  const userId = randomUUID();
  const liveSessionId = randomUUID();
  const expiredSessionId = randomUUID();
  const revokedSessionId = randomUUID();
  let categoryId: string;

  const exists = async (table: string, id: string): Promise<boolean> => {
    const found = await pool.query(`select 1 from ${table} where id = $1`, [
      id
    ]);
    return found.rowCount === 1;
  };

  /**
   * A digest column is `char(64)` and unique, so a stand-in has to be the right
   * width and has to differ from every other suite's — this database is shared
   * and a fixed literal collides on the second run.
   */
  const hash = () =>
    (randomUUID() + randomUUID())
      .replaceAll("-", "")
      .padEnd(64, "0")
      .slice(0, 64);

  beforeAll(async () => {
    await pool.query(
      `insert into user_account (id,email,status,email_verified_at)
       values ($1,$2,'ENABLED',now())`,
      [userId, `retention-${userId}@example.test`]
    );

    const domainId = (
      await pool.query<{ id: string }>(
        `select id from domain where stable_key = 'MOBILITY'`
      )
    ).rows[0]!.id;
    categoryId = randomUUID();
    await pool.query(
      `insert into category (id,domain_id,stable_key,slug,name)
       values ($1,$2,$3,$4,'Retention')`,
      [categoryId, domainId, `ret-${categoryId}`, `ret-${categoryId}`]
    );
  });

  afterAll(async () => {
    await pool.end();
  });

  it("removes sessions that can no longer authenticate and keeps the one that can", async () => {
    await pool.query(
      `insert into user_session (id,user_id,token_hash,expires_at,revoked_at)
       values ($1,$4,$5,now() + interval '1 hour',null),
              ($2,$4,$6,now() - interval '1 minute',null),
              ($3,$4,$7,now() + interval '1 hour',now() - interval '1 minute')`,
      [
        liveSessionId,
        expiredSessionId,
        revokedSessionId,
        userId,
        hash(),
        hash(),
        hash()
      ]
    );

    await sweeper.sweep();

    // Expiry and revocation are two ways of being finished; the resolver
    // already refuses both, so removing them changes nothing a request can see.
    expect(await exists("user_session", expiredSessionId)).toBe(false);
    expect(await exists("user_session", revokedSessionId)).toBe(false);
    // The one that matters. A sweep that took this row would sign somebody out.
    expect(await exists("user_session", liveSessionId)).toBe(true);
  });

  it("removes an abandoned registration and leaves one whose message is still owed", async () => {
    const abandoned = randomUUID();
    const undispatched = randomUUID();
    await pool.query(
      `insert into pending_registration (id,email,password_hash,expires_at,dispatched_at)
       values ($1,$3,'x',now() - interval '1 minute',now()),
              ($2,$4,'x',now() + interval '30 minutes',null)`,
      [
        abandoned,
        undispatched,
        `abandoned-${abandoned}@example.test`,
        `waiting-${undispatched}@example.test`
      ]
    );

    await sweeper.sweep();

    /*
     * The reason this increment exists. An abandoned registration holds an
     * email address and a password hash for somebody who is not a User, and the
     * Owner's reading is that there is no window in which keeping that is
     * better than deleting it.
     */
    expect(await exists("pending_registration", abandoned)).toBe(false);
    /*
     * And the row the sweep must never take: inside its window, with no
     * `dispatched_at`, which means the outbox still owes this person their
     * confirmation link. Deleting it would strand a signup silently.
     */
    expect(await exists("pending_registration", undispatched)).toBe(true);
  });

  it("removes an expired password reset and leaves a live one", async () => {
    const expired = randomUUID();
    const live = randomUUID();
    const other = randomUUID();
    await pool.query(
      `insert into user_account (id,email,status,email_verified_at)
       values ($1,$2,'ENABLED',now())`,
      [other, `reset-${other}@example.test`]
    );
    await pool.query(
      `insert into password_reset (id,user_id,expires_at)
       values ($1,$3,now() - interval '1 minute'),
              ($2,$4,now() + interval '30 minutes')`,
      [expired, live, userId, other]
    );

    await sweeper.sweep();

    expect(await exists("password_reset", expired)).toBe(false);
    expect(await exists("password_reset", live)).toBe(true);
  });

  it("forgives nobody when it removes a lapsed throttle row", async () => {
    const stale = randomUUID();
    const counting = randomUUID();
    await pool.query(
      `insert into auth_throttle (id,scope,subject_hash,attempts,first_seen_at)
       values ($1,'login',$3,9,now() - interval '2 days'),
              ($2,'login',$4,9,now())`,
      [stale, counting, hash(), hash()]
    );

    await sweeper.sweep();

    // `registerAttempt` already resets a row whose window has lapsed, so
    // deleting one is exactly what the next attempt would have done to it.
    expect(await exists("auth_throttle", stale)).toBe(false);
    // A subject still inside the fifteen-minute window is still being counted,
    // and removing this row would hand a blocked attacker a clean slate.
    expect(await exists("auth_throttle", counting)).toBe(true);
  });

  it("keeps every dead letter while removing delivered mail past its window", async () => {
    const old = randomUUID();
    const recent = randomUUID();
    const deadLetter = randomUUID();
    const waiting = randomUUID();
    const days = Math.ceil(OUTBOX_RETENTION_MS / (24 * 60 * 60 * 1000)) + 1;
    /*
     * The dead letter and the waiting event are seeded **old**, which is the
     * point of the case rather than a detail of it.
     *
     * A dead letter is old by nature — it stopped being retried and then sat
     * there. If it were seeded fresh, any age-based condition would spare it by
     * accident and this case would pass without `processed_at is not null`
     * doing any work at all. Aged, the guard is the only thing keeping either
     * row, which is what the case is for.
     */
    await pool.query(
      `insert into outbox_event (id,aggregate_type,aggregate_id,event_type,payload,occurred_at,processed_at,attempts)
       values ($1,'T',$5,'e','{}'::jsonb, now() - ($6 || ' days')::interval, now() - ($6 || ' days')::interval, 1),
              ($2,'T',$5,'e','{}'::jsonb, now(), now(), 1),
              ($3,'T',$5,'e','{}'::jsonb, now() - ($6 || ' days')::interval, null, 8),
              ($4,'T',$5,'e','{}'::jsonb, now() - ($6 || ' days')::interval, null, 0)`,
      [old, recent, deadLetter, waiting, randomUUID(), String(days)]
    );

    await sweeper.sweep();

    expect(await exists("outbox_event", old)).toBe(false);
    expect(await exists("outbox_event", recent)).toBe(true);
    /*
     * The Owner's decision, and the one the condition has to earn: a dead
     * letter is the record of a message that never arrived, and it is kept.
     *
     * Nothing in the statement names it. A dead letter is a row that is
     * unprocessed and has stopped being claimed, so `processed_at is not null`
     * excludes it by construction — along with the event still waiting to be
     * delivered, which the same one condition also protects.
     */
    expect(await exists("outbox_event", deadLetter)).toBe(true);
    expect(await exists("outbox_event", waiting)).toBe(true);
  });

  it("removes an expired Decision flow with its conversation", async () => {
    const flowId = randomUUID();
    const setId = randomUUID();
    await pool.query(
      `insert into comparison_set (id,category_id,expires_at)
       values ($1,$2,now() - interval '1 minute')`,
      [setId, categoryId]
    );
    await pool.query(
      `insert into decision_flow (id,comparison_set_id,expires_at)
       values ($1,$2,now() - interval '1 minute')`,
      [flowId, setId]
    );
    const turnId = randomUUID();
    await pool.query(
      `insert into decision_chat_turn (id,decision_flow_id,position,question,reply)
       values ($1,$2,1,'q','a')`,
      [turnId, flowId]
    );

    await sweeper.sweep();

    // `US-DEC-F03-001` AC-9 holds the conversation for the current flow only.
    // Until now that was true of a platform somebody was using and not of a
    // quiet one: the request-path sweep only runs when a request uses Decision.
    expect(await exists("decision_flow", flowId)).toBe(false);
    expect(await exists("decision_chat_turn", turnId)).toBe(false);
    expect(await exists("comparison_set", setId)).toBe(false);
  });

  it("never lets a Decision flow outlive the Comparison Set it is about", async () => {
    // A set already half-way through its own hour, which is the ordinary case:
    // a person compares for a while and only then enters Decision.
    const setId = randomUUID();
    await pool.query(
      `insert into comparison_set (id,category_id,expires_at)
       values ($1,$2,now() + interval '2 minutes')`,
      [setId, categoryId]
    );

    // Driven through the repository, not through SQL written here. A case that
    // reproduces the statement it is checking proves only that the author can
    // copy it twice.
    const entered = await decisions.enterWithComparisonSet(setId);

    const flow = await pool.query<{ within: boolean }>(
      `select f.expires_at <= c.expires_at as within
       from decision_flow f
       join comparison_set c on c.id = f.comparison_set_id
       where f.id = $1`,
      [entered.decisionFlowId]
    );

    /*
     * The defect this pairing exposes.
     *
     * `decision_flow.comparison_set_id` is `ON DELETE CASCADE`, deliberately:
     * the migration says a flow pointing at a set that no longer exists would
     * outlive the thing it was about. But both records lived sixty minutes from
     * their *own* creation, and a flow is always built on a set that already
     * exists — so a flow entered half an hour into a Compare claimed sixty
     * minutes while the cascade was going to end it in thirty, mid-decision.
     *
     * The cap makes the claim true instead of making the cascade wrong.
     * Asserted as the property rather than as a duration: a flow never outlives
     * its context, whatever the two constants happen to say.
     */
    expect(flow.rows[0]?.within).toBe(true);

    // And both survive a sweep, because neither has expired.
    await sweeper.sweep();
    expect(await exists("decision_flow", entered.decisionFlowId)).toBe(true);
    expect(await exists("comparison_set", setId)).toBe(true);
  });

  it("reports what it removed so an unremarkable sweep is distinguishable", async () => {
    const counts = await sweeper.sweep();

    // A second pass over ground already swept. The shape is what a caller logs,
    // and a sweep that removed nothing has to be able to say so — otherwise a
    // sweep deleting thousands of rows every cycle looks like every other one.
    expect(Object.keys(counts).sort()).toEqual([
      "authThrottles",
      "comparisonSets",
      "decisionFlows",
      "outboxEvents",
      "passwordResets",
      "pendingRegistrations",
      "sessions"
    ]);
    expect(Object.values(counts).every((n) => Number.isInteger(n))).toBe(true);
  });
});
