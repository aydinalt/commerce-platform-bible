import {
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import type { Principal } from "@commerce/identity";

import { correlationId } from "../http/correlation.js";
import { IdentityService } from "../identity/identity.service.js";
import { SESSION_COOKIE } from "../identity/session.cookie.js";

export function readSessionCookie(request: FastifyRequest): string | undefined {
  return request.cookies[SESSION_COOKIE];
}

export { correlationId };

@Injectable()
export class PrincipalResolver {
  constructor(private readonly identity: IdentityService) {}

  /**
   * The session cookie is the only way to become a principal.
   *
   * It is authoritative and re-evaluated against current server state on every
   * request (ADR-0012 §2). There used to be a second way — a header adapter
   * that minted a principal from `x-test-user-id`, added in M11 because
   * identity did not exist yet and the HTTP suite needed somebody to be. It
   * refused to construct in production, so it was never reachable there, but it
   * was a second code path to the most consequential answer the edge gives.
   * Identity arrived in I1 and the affordance outlived its reason; it is gone,
   * and that suite now registers and signs in like a person does.
   */
  async resolve(request: FastifyRequest): Promise<Principal> {
    const token = readSessionCookie(request);
    if (token === undefined) {
      throw new UnauthorizedException("Authentication required");
    }

    const session = await this.identity.resolveSession(token);
    // A Suspended holder keeps public Guest behaviour but enters no
    // authenticated context (`US-IDN-F01-001` AC-6, `US-IDN-F03-001` AC-4).
    if (session === null || session.status !== "ENABLED") {
      throw new UnauthorizedException("Authentication required");
    }
    return {
      // Carried from the session rather than inferred from authorization:
      // being able to enter the Admin surface and being in it are different
      // states (`US-IDN-F08-001` AC-5).
      adminContext: session.adminContext,
      correlationId: correlationId(request),
      sessionId: session.sessionId,
      userId: session.userId,
      // Always declared for a session, `null` included: the baseline is a
      // real state, distinct from having no session at all.
      businessId: session.selectedBusinessId ?? null
    };
  }

  /**
   * The principal for an Admin-only surface.
   *
   * Authorization alone is not enough: `US-IDN-F08-001` AC-5 makes the Admin
   * surface something a person enters explicitly, so an authorized Admin who
   * has not entered it is refused here exactly like anyone else. Without that,
   * every Admin action would be one stray request away from an ordinary
   * browsing session.
   */
  async resolveAdmin(request: FastifyRequest): Promise<Principal> {
    const principal = await this.resolve(request);
    if (principal.adminContext !== true)
      throw new ForbiddenException({
        code: "ADMIN_CONTEXT_REQUIRED",
        message: "This action requires an entered Admin context"
      });
    return principal;
  }
}
