import { ForbiddenException, Injectable } from "@nestjs/common";
import type { FastifyRequest } from "fastify";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * The second half of the CSRF defence required by ADR-0012 §2. `SameSite=Strict`
 * stops the cookie riding along on a cross-site request; this rejects any
 * state-changing request whose declared origin is not one we serve, covering
 * clients that ignore or mishandle SameSite.
 *
 * `sessionInvolved` must be true for a request that **carries** a session and
 * for one that **establishes** one. Protecting only the former leaves login
 * CSRF open: a cross-site form post can sign a person into an account they did
 * not choose, and everything they then do lands in someone else's account.
 * Since `SameSite` governs sending rather than setting, it does not close that
 * on its own.
 */
@Injectable()
export class OriginValidator {
  private readonly allowed: ReadonlySet<string>;

  constructor(allowedOrigins: readonly string[]) {
    this.allowed = new Set(allowedOrigins);
  }

  assertAcceptable(request: FastifyRequest, sessionInvolved: boolean): void {
    if (SAFE_METHODS.has(request.method) || !sessionInvolved) return;

    const declared = this.declaredOrigin(request);
    if (declared === null) {
      throw new ForbiddenException({
        code: "ORIGIN_MISSING",
        message: "A cookie-authenticated mutation must declare its origin"
      });
    }
    if (!this.allowed.has(declared)) {
      throw new ForbiddenException({
        code: "ORIGIN_REJECTED",
        message: "Request origin is not allowed"
      });
    }
  }

  private declaredOrigin(request: FastifyRequest): string | null {
    const header = (name: string) => {
      const value = request.headers[name];
      return Array.isArray(value) ? value[0] : value;
    };

    const origin = header("origin");
    if (origin) return origin;

    // Some clients send only `Referer`; its origin is equally authoritative.
    const referer = header("referer");
    if (!referer) return null;
    try {
      return new URL(referer).origin;
    } catch {
      return null;
    }
  }
}
