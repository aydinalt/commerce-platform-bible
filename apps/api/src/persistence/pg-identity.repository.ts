import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool } from "pg";

import type {
  AccountStatus,
  AuthorizedBusiness,
  ResolvedSession
} from "@commerce/identity";
import { REGISTRATION_REQUESTED } from "@commerce/notification";

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
export class PgIdentityRepository implements OnModuleDestroy {
  private readonly pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

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
         ) as "selectedBusinessId"`,
      [tokenHash]
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
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
  async selectBusinessContext(input: {
    businessId: string;
    sessionId: string;
    userId: string;
  }): Promise<boolean> {
    const result = await this.pool.query(
      `update user_session s
         set selected_business_id = $1
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
