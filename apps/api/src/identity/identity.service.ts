import { Inject, Injectable } from "@nestjs/common";

import type { AuditWriter } from "@commerce/audit";
import type {
  AuthorizedBusiness,
  RegistrationProof,
  ResolvedSession,
  SessionIssue
} from "@commerce/identity";

import { PgIdentityRepository } from "../persistence/pg-identity.repository.js";
import { PasswordHasher } from "./password.hasher.js";
import { REGISTRATION_TTL_MS, SESSION_TTL_MS } from "./session.cookie.js";
import { digest, issueSecret } from "./secret.js";

/** Injection token for the shared append-only audit writer. */
export const AUDIT_WRITER = Symbol("AuditWriter");

const LOGIN_SCOPE = "login";
const LOGIN_CALLER_SCOPE = "login-caller";
/**
 * Higher than the per-account limit: one address may legitimately carry several
 * people behind a shared network, but not an unbounded sweep of accounts.
 */
const CALLER_ATTEMPT_LIMIT = 50;
const REGISTRATION_SCOPE = "registration";
const RECOVERY_SCOPE = "recovery";
/** A recovery link must expire quickly enough to limit mailbox exposure. */
const RECOVERY_TTL_MS = 30 * 60 * 1000;
const ATTEMPT_LIMIT = 10;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

export interface RegistrationOutcome {
  throttled: boolean;
}

@Injectable()
export class IdentityService {
  private decoy?: Promise<string>;

  constructor(
    private readonly repository: PgIdentityRepository,
    private readonly passwords: PasswordHasher,
    // An interface cannot be an injection token, and identity evidence belongs
    // in the same append-only record as everything else.
    @Inject(AUDIT_WRITER) private readonly audit: AuditWriter
  ) {}

  /**
   * Always behaves identically whether or not the address is already
   * registered. `V1_SECURITY_ARCHITECTURE.md` requires that registration and
   * recovery leak no account existence, so the caller learns nothing from the
   * response, the status code or the latency.
   */
  async beginRegistration(input: {
    correlationId: string;
    email: string;
    password: string;
    subject: string;
  }): Promise<RegistrationOutcome> {
    const throttled = await this.repository.registerAttempt({
      limit: ATTEMPT_LIMIT,
      scope: REGISTRATION_SCOPE,
      subjectHash: digest(input.subject),
      windowMs: ATTEMPT_WINDOW_MS
    });
    if (throttled) return { throttled: true };

    // Hashing runs on both paths so an existing address cannot be detected by
    // the response time of a skipped hash.
    const passwordHash = await this.passwords.hash(input.password);

    if (await this.repository.accountExists(input.email)) {
      await this.record({
        action: "identity.registration.begin",
        correlationId: input.correlationId,
        reason: "EMAIL_ALREADY_REGISTERED",
        result: "DENIED"
      });
      return { throttled: false };
    }

    // The record and its delivery event are written together; the proof token
    // is minted by the dispatcher, not here.
    await this.repository.recordPendingRegistration({
      correlationId: input.correlationId,
      email: input.email,
      expiresAt: new Date(Date.now() + REGISTRATION_TTL_MS),
      passwordHash
    });
    await this.record({
      action: "identity.registration.begin",
      correlationId: input.correlationId,
      result: "ALLOWED"
    });

    return { throttled: false };
  }

  /** Proves control of the email address and creates the account (AC-2, AC-3). */
  async confirmRegistration(input: {
    correlationId: string;
    token: string;
  }): Promise<RegistrationProof> {
    const pending = await this.repository.takePendingRegistration(
      digest(input.token)
    );
    if (!pending) {
      await this.record({
        action: "identity.registration.confirm",
        correlationId: input.correlationId,
        reason: "TOKEN_INVALID_OR_EXPIRED",
        result: "DENIED"
      });
      return { accepted: false };
    }

    // The address may have been claimed while this link was outstanding.
    if (await this.repository.accountExists(pending.email)) {
      await this.record({
        action: "identity.registration.confirm",
        correlationId: input.correlationId,
        reason: "EMAIL_ALREADY_REGISTERED",
        result: "DENIED"
      });
      return { accepted: false };
    }

    const userId = await this.repository.createAccount({
      email: pending.email,
      passwordHash: pending.passwordHash
    });
    await this.record({
      action: "identity.registration.confirm",
      actorUserId: userId,
      correlationId: input.correlationId,
      result: "ALLOWED",
      targetId: userId
    });
    return { accepted: true, userId };
  }

  /**
   * Returns a session only for accepted credentials on an Enabled account
   * (`US-IDN-F03-001` AC-3). A Suspended account is refused with the same
   * response as a wrong password, so suspension is not observable from outside
   * (AC-4, AC-5).
   */
  async login(input: {
    correlationId: string;
    email: string;
    password: string;
    subject: string;
  }): Promise<SessionIssue | null> {
    // Two counters, because they stop different attacks. The per-account one
    // stops guessing a single password list against one address; the per-caller
    // one stops trying a single common password against many addresses, which
    // the per-account counter never sees because each address starts fresh.
    const subjectHash = digest(`${input.subject}|${input.email}`);
    const callerHash = digest(input.subject);
    const [accountThrottled, callerThrottled] = await Promise.all([
      this.repository.registerAttempt({
        limit: ATTEMPT_LIMIT,
        scope: LOGIN_SCOPE,
        subjectHash,
        windowMs: ATTEMPT_WINDOW_MS
      }),
      this.repository.registerAttempt({
        limit: CALLER_ATTEMPT_LIMIT,
        scope: LOGIN_CALLER_SCOPE,
        subjectHash: callerHash,
        windowMs: ATTEMPT_WINDOW_MS
      })
    ]);
    if (accountThrottled || callerThrottled) {
      await this.record({
        action: "identity.login",
        correlationId: input.correlationId,
        reason: "THROTTLED",
        result: "DENIED"
      });
      return null;
    }

    const credential = await this.repository.findCredential(input.email);
    const accepted = credential
      ? await this.passwords.matches(credential.passwordHash, input.password)
      : // Spend comparable time on an unknown address so the absence of an
        // account cannot be timed.
        await this.passwords.matches(await this.decoyHash(), input.password);

    if (!credential || !accepted || credential.status !== "ENABLED") {
      await this.record({
        action: "identity.login",
        ...(credential === null ? {} : { actorUserId: credential.userId }),
        correlationId: input.correlationId,
        reason: !credential
          ? "UNKNOWN_ACCOUNT"
          : !accepted
            ? "CREDENTIAL_REJECTED"
            : "ACCOUNT_SUSPENDED",
        result: "DENIED"
      });
      return null;
    }

    // Only the per-account counter is forgiven. Clearing the per-caller one too
    // would let a sweep reset itself by signing into an account it owns.
    await this.repository.clearAttempts(LOGIN_SCOPE, subjectHash);
    const session = await this.issueSession(credential.userId);
    await this.record({
      action: "identity.login",
      actorUserId: credential.userId,
      correlationId: input.correlationId,
      result: "ALLOWED",
      targetId: credential.userId
    });
    return session;
  }

  /**
   * Begins recovery for an unauthenticated caller (`US-IDN-F05-001` AC-1). The
   * outcome is audited but never signalled: an unknown address and a known one
   * are indistinguishable from outside, and a Suspended account is accepted
   * because AC-9 requires it to be able to complete a reset.
   */
  async beginPasswordReset(input: {
    correlationId: string;
    email: string;
    subject: string;
  }): Promise<{ throttled: boolean }> {
    const throttled = await this.repository.registerAttempt({
      limit: ATTEMPT_LIMIT,
      scope: RECOVERY_SCOPE,
      subjectHash: digest(input.subject),
      windowMs: ATTEMPT_WINDOW_MS
    });
    if (throttled) return { throttled: true };

    const scheduled = await this.repository.recordPasswordReset({
      correlationId: input.correlationId,
      email: input.email,
      expiresAt: new Date(Date.now() + RECOVERY_TTL_MS)
    });
    await this.record({
      action: "identity.password-reset.begin",
      correlationId: input.correlationId,
      result: scheduled ? "ALLOWED" : "DENIED",
      ...(scheduled ? {} : { reason: "UNKNOWN_ACCOUNT" })
    });
    return { throttled: false };
  }

  /** Sets the new password once the one-time proof is presented (AC-3). */
  async completePasswordReset(input: {
    correlationId: string;
    password: string;
    token: string;
  }): Promise<boolean> {
    const passwordHash = await this.passwords.hash(input.password);
    const userId = await this.repository.completePasswordReset({
      passwordHash,
      tokenHash: digest(input.token)
    });
    await this.record({
      action: "identity.password-reset.complete",
      ...(userId === null ? {} : { actorUserId: userId, targetId: userId }),
      correlationId: input.correlationId,
      result: userId === null ? "DENIED" : "ALLOWED",
      ...(userId === null ? { reason: "TOKEN_INVALID_OR_EXPIRED" } : {})
    });
    return userId !== null;
  }

  /** Session rotation after authentication, required by the security baseline. */
  async issueSession(userId: string): Promise<SessionIssue> {
    const token = issueSecret();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    const sessionId = await this.repository.createSession({
      expiresAt,
      tokenHash: digest(token),
      userId
    });
    return { expiresAt, sessionId, token };
  }

  resolveSession(token: string): Promise<ResolvedSession | null> {
    return this.repository.resolveSession(digest(token));
  }

  listAuthorizedBusinesses(userId: string): Promise<AuthorizedBusiness[]> {
    return this.repository.listAuthorizedBusinesses(userId);
  }

  /**
   * Entering a Business context changes what the person is acting as, so it is
   * recorded as audit evidence like any other authorization decision.
   */
  async selectBusinessContext(input: {
    businessId: string;
    correlationId: string;
    sessionId: string;
    userId: string;
  }): Promise<boolean> {
    const accepted = await this.repository.selectBusinessContext({
      businessId: input.businessId,
      sessionId: input.sessionId,
      userId: input.userId
    });
    await this.record({
      action: "identity.business-context.enter",
      actorUserId: input.userId,
      correlationId: input.correlationId,
      result: accepted ? "ALLOWED" : "DENIED",
      ...(accepted ? {} : { reason: "NOT_AUTHORIZED_FOR_BUSINESS" }),
      targetId: input.businessId
    });
    return accepted;
  }

  /**
   * Entering the Admin surface is an authorization decision like any other, so
   * it is audited whether or not it is granted.
   */
  async enterAdminContext(input: {
    correlationId: string;
    sessionId: string;
    userId: string;
  }): Promise<boolean> {
    const accepted = await this.repository.enterAdminContext({
      sessionId: input.sessionId,
      userId: input.userId
    });
    await this.record({
      action: "identity.admin-context.enter",
      actorUserId: input.userId,
      correlationId: input.correlationId,
      result: accepted ? "ALLOWED" : "DENIED",
      ...(accepted ? {} : { reason: "ADMIN_NOT_AUTHORIZED" }),
      targetId: input.userId
    });
    return accepted;
  }

  async leaveAdminContext(input: {
    correlationId: string;
    sessionId: string;
    userId: string;
  }): Promise<void> {
    await this.repository.leaveAdminContext(input.sessionId);
    await this.record({
      action: "identity.admin-context.leave",
      actorUserId: input.userId,
      correlationId: input.correlationId,
      result: "ALLOWED",
      targetId: input.userId
    });
  }

  async clearBusinessContext(input: {
    correlationId: string;
    sessionId: string;
    userId: string;
  }): Promise<void> {
    await this.repository.clearBusinessContext(input.sessionId);
    await this.record({
      action: "identity.business-context.leave",
      actorUserId: input.userId,
      correlationId: input.correlationId,
      result: "ALLOWED",
      targetId: input.userId
    });
  }

  async logout(input: {
    correlationId: string;
    token: string;
    userId?: string;
  }): Promise<void> {
    await this.repository.revokeSession(digest(input.token));
    if (input.userId) {
      await this.record({
        action: "identity.logout",
        actorUserId: input.userId,
        correlationId: input.correlationId,
        result: "ALLOWED",
        targetId: input.userId
      });
    }
  }

  /**
   * A genuine Argon2id digest of an unguessable value, computed once. Verifying
   * against it makes the unknown-account path cost what the known-account path
   * costs. A hand-written constant would not do: an invalid digest fails
   * instantly and would reintroduce the timing signal it is meant to remove.
   */
  private async decoyHash(): Promise<string> {
    this.decoy ??= this.passwords.hash(issueSecret());
    return this.decoy;
  }

  private async record(entry: {
    action: string;
    actorUserId?: string;
    correlationId: string;
    reason?: string;
    result: "ALLOWED" | "DENIED";
    targetId?: string;
  }): Promise<void> {
    await this.audit.record({
      action: entry.action,
      correlationId: entry.correlationId,
      result: entry.result,
      targetType: "UserAccount",
      ...(entry.actorUserId === undefined
        ? {}
        : { actorUserId: entry.actorUserId }),
      ...(entry.reason === undefined ? {} : { reason: entry.reason }),
      ...(entry.targetId === undefined ? {} : { targetId: entry.targetId })
    });
  }
}
