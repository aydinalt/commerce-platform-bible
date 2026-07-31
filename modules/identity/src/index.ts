export interface Principal {
  correlationId: string;
  sessionId: string;
  userId: string;
}

export interface IdentityReader {
  isEnabled(userId: string): Promise<boolean>;
}

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
    return { correlationId, sessionId, userId };
  }
}

export const identityModule = { name: "identity" } as const;
