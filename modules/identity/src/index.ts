/// `US-IDN-F06-001` AC-1 fixes the V1 vocabulary at exactly these two values.
export type AccountStatus = "ENABLED" | "SUSPENDED";

export interface Principal {
  /** Admin context, entered explicitly and never inferred. */
  adminContext?: boolean;
  /**
   * Three distinct states, and the difference matters:
   *
   * - a Business identifier — that context was explicitly selected;
   * - `null` — a real session that is in the authenticated User baseline, so
   *   acting in any Business must be refused (`US-IDN-F07-001` AC-3);
   * - absent — the principal came from the header adapter, which has no session
   *   to hold a selection and exists only outside production.
   */
  businessId?: string | null;
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

/**
 * Every field of a `Principal` is carried into a PostgreSQL `uuid` column or
 * predicate. Admitting a malformed value would push the rejection down to the
 * driver, where a request that should have been refused becomes a server
 * error instead.
 */
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export class TestPrincipalAdapter {
  constructor(
    private readonly environment: string,
    private readonly enabled: boolean
  ) {
    if (environment === "production" && enabled) {
      throw new Error("TEST_PRINCIPAL_FORBIDDEN_IN_PRODUCTION");
    }
  }

  resolve(headers: Record<string, string | string[] | undefined>): Principal {
    if (!this.enabled) throw new Error("TEST_PRINCIPAL_DISABLED");
    const value = (name: string) => {
      const item = headers[name];
      return Array.isArray(item) ? item[0] : item;
    };
    const userId = value("x-test-user-id");
    const sessionId = value("x-test-session-id");
    const correlationId = value("x-correlation-id");
    if (!userId || !sessionId || !correlationId) {
      throw new Error("TEST_PRINCIPAL_INCOMPLETE");
    }
    if (
      !UUID_PATTERN.test(userId) ||
      !UUID_PATTERN.test(sessionId) ||
      !UUID_PATTERN.test(correlationId)
    ) {
      throw new Error("TEST_PRINCIPAL_MALFORMED");
    }
    return { correlationId, sessionId, userId };
  }
}

export const identityModule = { name: "identity" } as const;
