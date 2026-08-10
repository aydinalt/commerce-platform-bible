import { randomUUID } from "node:crypto";

import {
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { TestPrincipalAdapter, type Principal } from "@commerce/identity";

import { IdentityService } from "../identity/identity.service.js";
import { SESSION_COOKIE } from "../identity/session.cookie.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export function readSessionCookie(request: FastifyRequest): string | undefined {
  return request.cookies[SESSION_COOKIE];
}

/**
 * A correlation identifier reaches a `uuid` column, so a malformed one is
 * replaced rather than trusted.
 */
export function correlationId(request: FastifyRequest): string {
  const header = request.headers["x-correlation-id"];
  const value = Array.isArray(header) ? header[0] : header;
  return value && UUID_PATTERN.test(value) ? value : randomUUID();
}

@Injectable()
export class PrincipalResolver {
  constructor(private readonly identity: IdentityService) {}

  /**
   * The session cookie is authoritative and is re-evaluated against current
   * server state on every request (ADR-0012 §2). The header adapter survives
   * only as a development affordance; `TestPrincipalAdapter` refuses to
   * construct in production, so it is unreachable there.
   */
  async resolve(request: FastifyRequest): Promise<Principal> {
    const token = readSessionCookie(request);
    if (token !== undefined) {
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

    try {
      const environment = process.env.NODE_ENV ?? "development";
      const enabled = process.env.ENABLE_TEST_PRINCIPAL === "true";
      return new TestPrincipalAdapter(environment, enabled).resolve(
        request.headers
      );
    } catch {
      throw new UnauthorizedException("Authentication required");
    }
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
