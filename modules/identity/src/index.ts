/// `US-IDN-F06-001` AC-1 fixes the V1 vocabulary at exactly these two values.
export type AccountStatus = "ENABLED" | "SUSPENDED";

export interface Principal {
  /** Admin context, entered explicitly and never inferred. */
  adminContext?: boolean;
  /**
   * Two states, and the difference matters:
   *
   * - a Business identifier — that context was explicitly selected;
   * - `null` — a real session that is in the authenticated User baseline, so
   *   acting in any Business must be refused (`US-IDN-F07-001` AC-3).
   *
   * There used to be a third, absence, which meant the principal came from the
   * header adapter and had no session to hold a selection. Every caller read
   * that state as *skip the check* — so the field being optional was not a
   * missing value but a bypass, one forgotten property away from any new
   * caller. The adapter is gone and the field is required, which makes the
   * bypass unrepresentable rather than merely unused.
   */
  businessId: string | null;
  correlationId: string;
  sessionId: string;
  userId: string;
}

export interface AuthorizedBusiness {
  id: string;
  name: string;
  slug: string;
}

export interface IdentityReader {
  isEnabled(userId: string): Promise<boolean>;
}

/**
 * A registration that has proven control of its email address, or the reason it
 * has not. Callers must not be able to tell an unknown token from an expired
 * one, so both collapse to a single failure.
 */
export type RegistrationProof =
  { accepted: true; userId: string } | { accepted: false };

export interface ResolvedSession {
  /**
   * Whether Admin authorization exists right now, and whether Admin context was
   * explicitly entered. Both are re-derived per request, so a removal takes
   * effect immediately (`US-IDN-F08-001` AC-9, AC-11).
   */
  adminAuthorized: boolean;
  adminContext: boolean;
  /**
   * Present only while the selection is still authorized. Ownership is
   * re-checked on every resolution, so a revoked relationship drops the context
   * rather than surviving in the session (`US-IDN-F07-001` AC-8).
   */
  selectedBusinessId?: string;
  sessionId: string;
  status: AccountStatus;
  userId: string;
}

export interface SessionIssue {
  expiresAt: Date;
  sessionId: string;
  token: string;
}

/*
 * A `TestPrincipalAdapter` stood here.
 *
 * It read `x-test-user-id`, `x-test-session-id` and `x-correlation-id` and
 * built a `Principal` out of them, because M11 had an HTTP surface and no way
 * to become anybody: identity was still two increments away. It refused to
 * construct when `NODE_ENV` was `production`, so it was never a way in — but it
 * was a second code path to the answer that decides who a request is, kept
 * alive by one test suite.
 *
 * Session authentication superseded it in I1, and `I1_IDENTITY_BASELINE_CLOSURE`
 * recorded that it should go once no workflow depended on it. The last
 * dependant, `m11-http.integration.test.ts`, now registers and confirms an
 * account like a person does. Nothing replaced this; the edge has one way to
 * resolve a principal, and it is the session cookie.
 */

/**
 * The two User access moderation transitions and the states they start from
 * (`US-PLT-F05-001` AC-1, AC-3).
 *
 * PRD-0003 owns the state machine; this names which action consumes which
 * transition, so the availability question and the application question are
 * one sentence rather than two that can drift.
 */
export const ACCESS_MODERATION_SOURCE = {
  REINSTATE_USER: "SUSPENDED",
  SUSPEND_USER: "ENABLED"
} as const;

export type AccessModerationAction = keyof typeof ACCESS_MODERATION_SOURCE;

export const ACCESS_MODERATION_RESULT = {
  REINSTATE_USER: "ENABLED",
  SUSPEND_USER: "SUSPENDED"
} as const satisfies Record<AccessModerationAction, string>;

/**
 * Whether an ordinary Admin may apply this action to this account
 * (AC-1, AC-3, AC-5).
 *
 * Three conditions, and the third is the one worth stating out loud: an
 * account carrying Admin authorization is not an ordinary Admin's target at
 * all. Owner Decision D22 reserves that to the Product Owner through a
 * controlled operational process, and the reason is structural rather than
 * cautious — an Admin who could suspend other Admins could suspend every other
 * Admin, and the platform would have one.
 */
export function accessModerationPermitted(input: {
  action: AccessModerationAction;
  status: "ENABLED" | "SUSPENDED";
  targetIsAdmin: boolean;
}): boolean {
  if (input.targetIsAdmin) return false;
  return ACCESS_MODERATION_SOURCE[input.action] === input.status;
}

/// Raised when the target's current status does not admit the action.
export class AccessModerationUnavailableError extends Error {
  constructor(
    readonly action: AccessModerationAction,
    readonly status: "ENABLED" | "SUSPENDED"
  ) {
    super("ACCESS_MODERATION_UNAVAILABLE");
    this.name = "AccessModerationUnavailableError";
  }
}

/**
 * Raised when an ordinary Admin names an Admin-authorized account (AC-5).
 *
 * Separate from the unavailability above because it is a different kind of
 * refusal: not "this account is already there" but "this account is not yours
 * to move, whatever state it is in".
 */
export class AdminTargetForbiddenError extends Error {
  constructor() {
    super("ADMIN_TARGET_FORBIDDEN");
    this.name = "AdminTargetForbiddenError";
  }
}

export const identityModule = { name: "identity" } as const;
