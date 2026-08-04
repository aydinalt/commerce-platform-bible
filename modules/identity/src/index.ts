export interface Principal {
  correlationId: string;
  sessionId: string;
  userId: string;
}

export interface IdentityReader {
  isEnabled(userId: string): Promise<boolean>;
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
