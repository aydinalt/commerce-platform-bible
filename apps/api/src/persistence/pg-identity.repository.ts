import { Injectable } from "@nestjs/common";
import { Pool } from "pg";

import {
  ACCESS_MODERATION_RESULT,
  AccessModerationUnavailableError,
  accessModerationPermitted,
  AdminTargetForbiddenError,
  type AccessModerationAction,
  type AccountStatus,
  type AuthorizedBusiness,
  type ResolvedSession
} from "@commerce/identity";
import {
  PASSWORD_RESET_REQUESTED,
  REGISTRATION_REQUESTED
} from "@commerce/notification";

export interface PendingRegistrationRow {
  email: string;
  id: string;
  passwordHash: string;
}

export interface CredentialRow {
  passwordHash: string;
  status: AccountStatus;
  userId: string;
}

/**
 * Identity persistence is deliberately separate from `PgCommerceRepository`.
 * Credentials and sessions are the highest-value rows in the system, and
 * keeping their queries in one small surface makes that surface reviewable.
 */
@Injectable()
export class PgIdentityRepository {
  constructor(private readonly pool: Pool) {}

  async accountExists(email: string): Promise<boolean> {
    const result = await this.pool.query(
      `select 1 from user_account where email = $1`,
      [email]
    );
    return result.rowCount === 1;
  }

  /**
   * One live registration per address, recorded together with the event that
   * will deliver its message. Writing both in one transaction is what makes the
   * outbox trustworthy: a registration can never exist without its delivery
   * having been scheduled, and no message is scheduled for a registration that
   * was rolled back.
   *
   * No token is minted here. A repeated attempt replaces the previous record,
   * so an abandoned link cannot be resurrected later.
   */
  async recordPendingRegistration(input: {
    email: string;
    expiresAt: Date;
    passwordHash: string;
  }): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const pending = await client.query<{ id: string }>(
        `insert into pending_registration (email, password_hash, expires_at)
         values ($1,$2,$3)
         on conflict (email) do update
           set password_hash = excluded.password_hash,
               expires_at    = excluded.expires_at,
               token_hash    = null,
               dispatched_at = null,
               created_at    = now()
         returning id`,
        [input.email, input.passwordHash, input.expiresAt]
      );
      const id = pending.rows[0]?.id;
      if (!id) throw new Error("PENDING_REGISTRATION_FAILED");
      await client.query(
        `insert into outbox_event (aggregate_type, aggregate_id, event_type, payload)
         values ('PendingRegistration', $1, $2, '{}'::jsonb)`,
        [id, REGISTRATION_REQUESTED]
      );
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async takePendingRegistration(
    tokenHash: string
  ): Promise<PendingRegistrationRow | null> {
    const result = await this.pool.query<PendingRegistrationRow>(
      `delete from pending_registration
       where token_hash = $1 and expires_at > now()
       returning id, email, password_hash as "passwordHash"`,
      [tokenHash]
    );
    return result.rows[0] ?? null;
  }

  /**
   * The account and its credential are created together or not at all: an
   * account without a credential could never be signed into, and a credential
   * without an account is an orphaned secret.
   */
  async createAccount(input: {
    email: string;
    passwordHash: string;
  }): Promise<string> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const account = await client.query<{ id: string }>(
        `insert into user_account (email, status, email_verified_at)
         values ($1,'ENABLED',now())
         returning id`,
        [input.email]
      );
      const userId = account.rows[0]?.id;
      if (!userId) throw new Error("ACCOUNT_INSERT_FAILED");
      await client.query(
        `insert into user_credential (user_id, password_hash) values ($1,$2)`,
        [userId, input.passwordHash]
      );
      await client.query("commit");
      return userId;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Schedules a recovery for an existing account, together with the event that
   * will deliver its message. Reports whether an account was found so the
   * caller can audit the outcome — the caller must not let that difference
   * reach the response.
   *
   * Access status is deliberately not consulted: `US-IDN-F05-001` AC-9 requires
   * a Suspended account to be able to complete a reset and stay Suspended.
   */
  async recordPasswordReset(input: {
    email: string;
    expiresAt: Date;
  }): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const reset = await client.query<{ id: string }>(
        `insert into password_reset (user_id, expires_at)
         select u.id, $2 from user_account u where u.email = $1
         on conflict (user_id) do update
           set expires_at    = excluded.expires_at,
               token_hash    = null,
               dispatched_at = null,
               created_at    = now()
         returning id`,
        [input.email, input.expiresAt]
      );
      const id = reset.rows[0]?.id;
      if (id !== undefined) {
        await client.query(
          `insert into outbox_event (aggregate_type, aggregate_id, event_type, payload)
           values ('PasswordReset', $1, $2, '{}'::jsonb)`,
          [id, PASSWORD_RESET_REQUESTED]
        );
      }
      await client.query("commit");
      return id !== undefined;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Consumes the proof and sets the new credential in one transaction, then
   * revokes every session for that account: whoever asked for the reset may not
   * be who was signed in.
   *
   * Nothing here touches access status, Business ownership or Admin
   * authorization (`US-IDN-F05-001` AC-6 through AC-9).
   */
  async completePasswordReset(input: {
    passwordHash: string;
    tokenHash: string;
  }): Promise<string | null> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const consumed = await client.query<{ userId: string }>(
        `delete from password_reset
         where token_hash = $1 and expires_at > now()
         returning user_id as "userId"`,
        [input.tokenHash]
      );
      const userId = consumed.rows[0]?.userId;
      if (userId === undefined) {
        await client.query("rollback");
        return null;
      }
      await client.query(
        `update user_credential set password_hash = $2 where user_id = $1`,
        [userId, input.passwordHash]
      );
      await client.query(
        `update user_session set revoked_at = now()
         where user_id = $1 and revoked_at is null`,
        [userId]
      );
      await client.query("commit");
      return userId;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async findCredential(email: string): Promise<CredentialRow | null> {
    const result = await this.pool.query<CredentialRow>(
      `select u.id as "userId", u.status, c.password_hash as "passwordHash"
       from user_account u
       join user_credential c on c.user_id = u.id
       where u.email = $1`,
      [email]
    );
    return result.rows[0] ?? null;
  }

  async createSession(input: {
    expiresAt: Date;
    tokenHash: string;
    userId: string;
  }): Promise<string> {
    const result = await this.pool.query<{ id: string }>(
      `insert into user_session (user_id, token_hash, expires_at)
       values ($1,$2,$3) returning id`,
      [input.userId, input.tokenHash, input.expiresAt]
    );
    const id = result.rows[0]?.id;
    if (!id) throw new Error("SESSION_INSERT_FAILED");
    return id;
  }

  /**
   * Resolves against current server state on every request, so a suspension or
   * revocation takes effect immediately rather than at the next login
   * (ADR-0012 §2).
   *
   * The selected Business is returned only while the ownership relationship
   * still holds. A stored selection whose authorization has since been removed
   * resolves to no context at all, which is what `US-IDN-F07-001` AC-8 requires
   * of re-evaluation.
   */
  async resolveSession(tokenHash: string): Promise<ResolvedSession | null> {
    const result = await this.pool.query<{
      adminAuthorized: boolean;
      adminContext: boolean;
      selectedBusinessId: string | null;
      sessionId: string;
      status: ResolvedSession["status"];
      userId: string;
    }>(
      `update user_session s
         set last_seen_at = now()
       from user_account u
       where s.user_id = u.id
         and s.token_hash = $1
         and s.revoked_at is null
         and s.expires_at > now()
       returning s.id as "sessionId", u.id as "userId", u.status,
         (
           select bo.business_id from business_owner bo
           where bo.business_id = s.selected_business_id and bo.user_id = u.id
         ) as "selectedBusinessId",
         exists (
           select 1 from admin_authorization a where a.user_id = u.id
         ) as "adminAuthorized",
         (
           s.admin_context and exists (
             select 1 from admin_authorization a where a.user_id = u.id
           )
         ) as "adminContext"`,
      [tokenHash]
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      // Admin context cannot outlive the authorization it depends on (AC-9).
      adminAuthorized: row.adminAuthorized,
      adminContext: row.adminContext,
      sessionId: row.sessionId,
      status: row.status,
      userId: row.userId,
      ...(row.selectedBusinessId === null
        ? {}
        : { selectedBusinessId: row.selectedBusinessId })
    };
  }

  /** Businesses the person may enter, so a choice can be made explicitly. */
  async listAuthorizedBusinesses(
    userId: string
  ): Promise<AuthorizedBusiness[]> {
    const result = await this.pool.query<AuthorizedBusiness>(
      `select b.id, b.slug, b.name
       from business b
       join business_owner bo on bo.business_id = b.id and bo.user_id = $1
       order by b.name`,
      [userId]
    );
    return result.rows;
  }

  /**
   * Records the selection only when the relationship exists right now
   * (`US-IDN-F07-001` AC-2), and reports whether it was accepted rather than
   * assuming it was.
   */
  /**
   * Entering a Business context (`US-IDN-F07-001`, `US-BUS-F04-001`).
   *
   * The ownership test is inside the same statement that writes the selection,
   * which is what makes `US-BUS-F04-001` AC-11 true without a second thought:
   * a switch that is not authorized updates no row, so the last confirmed
   * active Business is still there afterwards. There is no window in which the
   * context is cleared while a new one is being checked.
   *
   * The session conditions re-evaluate liveness on every switch (AC-7); a
   * Suspended holder never reaches here, because the session does not resolve.
   */
  async selectBusinessContext(input: {
    businessId: string;
    sessionId: string;
    userId: string;
  }): Promise<boolean> {
    const result = await this.pool.query(
      `update user_session s
         set selected_business_id = $1, admin_context = false
       where s.id = $2
         and s.revoked_at is null
         and s.expires_at > now()
         and exists (
           select 1 from business_owner bo
           where bo.business_id = $1 and bo.user_id = $3
         )`,
      [input.businessId, input.sessionId, input.userId]
    );
    return result.rowCount === 1;
  }

  /**
   * Enters Admin context only while authorization exists right now (AC-5, AC-11).
   * The selected Business is cleared: AC-6 routes the Admin surface without
   * Business ownership, and AC-7 grants none through Admin.
   */
  async enterAdminContext(input: {
    sessionId: string;
    userId: string;
  }): Promise<boolean> {
    const result = await this.pool.query(
      `update user_session s
         set admin_context = true, selected_business_id = null
       where s.id = $1
         and s.revoked_at is null
         and s.expires_at > now()
         and exists (
           select 1 from admin_authorization a where a.user_id = $2
         )`,
      [input.sessionId, input.userId]
    );
    return result.rowCount === 1;
  }

  async leaveAdminContext(sessionId: string): Promise<void> {
    await this.pool.query(
      `update user_session set admin_context = false where id = $1`,
      [sessionId]
    );
  }

  /** Returns to the authenticated User baseline without ending the session. */
  async clearBusinessContext(sessionId: string): Promise<void> {
    await this.pool.query(
      `update user_session set selected_business_id = null where id = $1`,
      [sessionId]
    );
  }

  async revokeSession(tokenHash: string): Promise<void> {
    await this.pool.query(
      `update user_session set revoked_at = now()
       where token_hash = $1 and revoked_at is null`,
      [tokenHash]
    );
  }

  /** Logout must leave no privileged context anywhere (`US-IDN-F04-001` AC-7). */
  async revokeAllSessions(userId: string): Promise<void> {
    await this.pool.query(
      `update user_session set revoked_at = now()
       where user_id = $1 and revoked_at is null`,
      [userId]
    );
  }

  /**
   * Suspend and Reinstate User (`US-PLT-F05-001`).
   *
   * One method for two actions, and almost all of it is refusal. What it
   * actually writes is a single column — PRD-0003 owns the state machine, so
   * consuming its transition means changing the status and nothing else.
   *
   * AC-7 and AC-8 are absences with teeth. Nothing here touches
   * `admin_authorization`, so a suspended Admin keeps what they were granted;
   * nothing here reads or writes a Business, an Offering, an Affiliate
   * Destination or a projection, so no eligibility moves because somebody lost
   * access. A suspended owner's Offerings stay exactly as public as they were,
   * which is the right answer: the account was moderated, not the Business.
   *
   * Sessions are revoked because `US-IDN-F06-001` AC-4 already requires it —
   * a Suspended holder keeps public Guest behaviour and enters no
   * authenticated context. That is Identity's rule being honoured rather than
   * a consequence this Story invents.
   */
  async moderateAccess(input: {
    action: AccessModerationAction;
    userId: string;
  }): Promise<{ status: "ENABLED" | "SUSPENDED"; userId: string } | null> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");

      const locked = await client.query<{
        status: "ENABLED" | "SUSPENDED";
        targetIsAdmin: boolean;
      }>(
        `select u.status::text as status,
           exists (
             select 1 from admin_authorization a where a.user_id = u.id
           ) as "targetIsAdmin"
         from user_account u where u.id = $1 for update`,
        [input.userId]
      );
      const current = locked.rows[0];
      if (!current) {
        await client.query("rollback");
        return null;
      }

      // AC-5. Checked before the state, because "not yours to move" is true
      // whatever state the account is in.
      if (current.targetIsAdmin) throw new AdminTargetForbiddenError();
      if (
        !accessModerationPermitted({
          action: input.action,
          status: current.status,
          targetIsAdmin: false
        })
      )
        throw new AccessModerationUnavailableError(
          input.action,
          current.status
        );

      // AC-2 and AC-4. One column, because that is the whole of PRD-0003's
      // transition.
      const status = ACCESS_MODERATION_RESULT[input.action];
      await client.query(
        `update user_account set status = $2::"AccountStatus" where id = $1`,
        [input.userId, status]
      );

      if (status === "SUSPENDED")
        await client.query(
          `update user_session set revoked_at = now()
           where user_id = $1 and revoked_at is null`,
          [input.userId]
        );

      await client.query("commit");
      return { status, userId: input.userId };
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Counts an attempt and reports whether the subject is now blocked. Keyed by
   * digest so neither an address nor an email is stored in clear text.
   */
  async registerAttempt(input: {
    limit: number;
    scope: string;
    subjectHash: string;
    windowMs: number;
  }): Promise<boolean> {
    const result = await this.pool.query<{ blocked: boolean }>(
      `insert into auth_throttle (scope, subject_hash, attempts, first_seen_at)
       values ($1,$2,1,now())
       on conflict (scope, subject_hash) do update
         set attempts = case
               when auth_throttle.first_seen_at < now() - ($3::int * interval '1 millisecond')
                 then 1
               else auth_throttle.attempts + 1
             end,
             first_seen_at = case
               when auth_throttle.first_seen_at < now() - ($3::int * interval '1 millisecond')
                 then now()
               else auth_throttle.first_seen_at
             end
       returning (attempts > $4) as blocked`,
      [input.scope, input.subjectHash, input.windowMs, input.limit]
    );
    return result.rows[0]?.blocked ?? false;
  }

  async clearAttempts(scope: string, subjectHash: string): Promise<void> {
    await this.pool.query(
      `delete from auth_throttle where scope = $1 and subject_hash = $2`,
      [scope, subjectHash]
    );
  }
}
