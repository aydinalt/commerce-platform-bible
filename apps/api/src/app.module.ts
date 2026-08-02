import { Module } from "@nestjs/common";

import { HealthController } from "./health.controller.js";
import { OfferingController } from "./offering/offering.controller.js";
import { OfferingService } from "./offering/offering.service.js";
import { PgCommerceRepository } from "./persistence/pg-commerce.repository.js";
import { PrincipalResolver } from "./security/principal-resolver.js";

@Module({
  controllers: [HealthController, OfferingController],
  providers: [OfferingService, PgCommerceRepository, PrincipalResolver]
})
export class AppModule {}
