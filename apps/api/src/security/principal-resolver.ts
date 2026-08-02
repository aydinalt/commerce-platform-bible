import { Injectable, UnauthorizedException } from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { TestPrincipalAdapter, type Principal } from "@commerce/identity";

@Injectable()
export class PrincipalResolver {
  resolve(request: FastifyRequest): Principal {
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
}
