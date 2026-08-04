import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";

import { HealthController } from "./health.controller.js";
import { ErrorEnvelopeFilter } from "./http/error-envelope.filter.js";
import { IdentityController } from "./identity/identity.controller.js";
import { AUDIT_WRITER, IdentityService } from "./identity/identity.service.js";
import { PasswordHasher } from "./identity/password.hasher.js";
import { OfferingController } from "./offering/offering.controller.js";
import { OfferingService } from "./offering/offering.service.js";
import { PgCommerceRepository } from "./persistence/pg-commerce.repository.js";
import { PgIdentityRepository } from "./persistence/pg-identity.repository.js";
import { OriginValidator } from "./security/origin.guard.js";
import { PrincipalResolver } from "./security/principal-resolver.js";

/**
 * Origins permitted to make cookie-authenticated mutations. Configured rather
 * than hard-coded, but with a development default so the local web app works
 * without setup.
 */
function allowedOrigins(): readonly string[] {
  const configured = process.env.ALLOWED_ORIGINS;
  return configured
    ? configured
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)
    : ["http://localhost:3000"];
}

@Module({
  controllers: [HealthController, IdentityController, OfferingController],
  providers: [
    IdentityService,
    OfferingService,
    PasswordHasher,
    PgCommerceRepository,
    PgIdentityRepository,
    PrincipalResolver,
    { provide: AUDIT_WRITER, useExisting: PgCommerceRepository },
    {
      provide: OriginValidator,
      useFactory: () => new OriginValidator(allowedOrigins())
    },
    // Registered on the module rather than in `main.ts`, so every instantiation
    // of the application renders errors through the published envelope.
    { provide: APP_FILTER, useClass: ErrorEnvelopeFilter }
  ]
})
export class AppModule {}
