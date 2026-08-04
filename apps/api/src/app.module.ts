import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";

import { HealthController } from "./health.controller.js";
import { ErrorEnvelopeFilter } from "./http/error-envelope.filter.js";
import { OfferingController } from "./offering/offering.controller.js";
import { OfferingService } from "./offering/offering.service.js";
import { PgCommerceRepository } from "./persistence/pg-commerce.repository.js";
import { PrincipalResolver } from "./security/principal-resolver.js";

@Module({
  controllers: [HealthController, OfferingController],
  providers: [
    OfferingService,
    PgCommerceRepository,
    PrincipalResolver,
    // Registered on the module rather than in `main.ts`, so every instantiation
    // of the application renders errors through the published envelope.
    { provide: APP_FILTER, useClass: ErrorEnvelopeFilter }
  ]
})
export class AppModule {}
