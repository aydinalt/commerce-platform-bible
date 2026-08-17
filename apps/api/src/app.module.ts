import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";

import { loadChatConfig } from "@commerce/config";
import type { DecisionAssistant } from "@commerce/decision";

import {
  AdminBusinessController,
  BusinessController
} from "./business/business.controller.js";
import { BusinessService } from "./business/business.service.js";
import { CorrectionService } from "./business/correction.service.js";
import { AttributeController } from "./catalog/attribute.controller.js";
import { AttributeService } from "./catalog/attribute.service.js";
import {
  AssignableCategoryController,
  CatalogController
} from "./catalog/catalog.controller.js";
import { CatalogService } from "./catalog/catalog.service.js";
import { ChatService, DECISION_ASSISTANT } from "./decision/chat.service.js";
import {
  DecisionChatController,
  DecisionController,
  DecisionFlowController
} from "./decision/decision.controller.js";
import { RestatingDecisionAssistant } from "./decision/restating.assistant.js";
import { AccessModerationController } from "./platform/access-moderation.controller.js";
import { AdminPanelController } from "./platform/admin-panel.controller.js";
import { AnalyticsController } from "./platform/analytics.controller.js";
import { ModerationCaseController } from "./platform/moderation.controller.js";
import { DiscoveryController } from "./discovery/discovery.controller.js";
import { HealthController } from "./health.controller.js";
import { ErrorEnvelopeFilter } from "./http/error-envelope.filter.js";
import { IdentityController } from "./identity/identity.controller.js";
import { AUDIT_WRITER, IdentityService } from "./identity/identity.service.js";
import { PasswordHasher } from "./identity/password.hasher.js";
import { OfferingContentService } from "./offering/offering-content.service.js";
import { AffiliateService } from "./offering/affiliate.service.js";
import {
  AdminOfferingController,
  AffiliateDestinationController,
  OfferingController
} from "./offering/offering.controller.js";
import { OfferingService } from "./offering/offering.service.js";
import { PublicOfferingController } from "./offering/public-offering.controller.js";
import { PgAffiliateRepository } from "./persistence/pg-affiliate.repository.js";
import { PgAttributeRepository } from "./persistence/pg-attribute.repository.js";
import { PgBusinessRepository } from "./persistence/pg-business.repository.js";
import { PgCorrectionRepository } from "./persistence/pg-correction.repository.js";
import { PgCatalogRepository } from "./persistence/pg-catalog.repository.js";
import { PgChatRepository } from "./persistence/pg-chat.repository.js";
import { PgCommerceRepository } from "./persistence/pg-commerce.repository.js";
import { PgComparisonRepository } from "./persistence/pg-comparison.repository.js";
import { PgDecisionRepository } from "./persistence/pg-decision.repository.js";
import { PgDiscoveryRepository } from "./persistence/pg-discovery.repository.js";
import { PgIdentityRepository } from "./persistence/pg-identity.repository.js";
import { PgAnalyticsRepository } from "./persistence/pg-analytics.repository.js";
import { PgModerationRepository } from "./persistence/pg-moderation.repository.js";
import { PgOfferingContentRepository } from "./persistence/pg-offering-content.repository.js";
import { PgPresentationRepository } from "./persistence/pg-presentation.repository.js";
import { OriginValidator } from "./security/origin.guard.js";
import { PrincipalResolver } from "./security/principal-resolver.js";

/**
 * Origins permitted to establish or use a cookie session.
 *
 * Getting this wrong is silent and total: every login would be refused and the
 * product would look broken for no visible reason. So production refuses to
 * start without it rather than falling back to a development default that could
 * never be correct there.
 */
function allowedOrigins(): readonly string[] {
  const configured = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (configured.length > 0) return configured;
  if ((process.env.NODE_ENV ?? "development") === "production") {
    throw new Error("ALLOWED_ORIGINS_REQUIRED_IN_PRODUCTION");
  }
  return ["http://localhost:3000"];
}

/**
 * The assistant the deployment asked for.
 *
 * The vendor arrives as configuration rather than as an import. `loadChatConfig`
 * has already refused a production deployment that named `http` without a
 * credential or a model, so what is left here is the one thing configuration
 * cannot supply: an adapter for the vendor named. There is none yet, and this
 * says so with the name it was given rather than falling back to the stub —
 * a production Chat answered by a brief-restating adapter would be the platform
 * pretending to have an assistant.
 */
function buildAssistant(): DecisionAssistant {
  const config = loadChatConfig();
  if (config.transport === "development")
    return new RestatingDecisionAssistant(
      process.env.NODE_ENV ?? "development"
    );
  throw new Error(`CHAT_PROVIDER_NOT_IMPLEMENTED: ${config.transport}`);
}

@Module({
  controllers: [
    AccessModerationController,
    AdminBusinessController,
    AdminPanelController,
    AnalyticsController,
    ModerationCaseController,
    AdminOfferingController,
    AffiliateDestinationController,
    AttributeController,
    BusinessController,
    AssignableCategoryController,
    CatalogController,
    DecisionChatController,
    DecisionController,
    DecisionFlowController,
    DiscoveryController,
    HealthController,
    IdentityController,
    OfferingController,
    PublicOfferingController
  ],
  providers: [
    AffiliateService,
    AttributeService,
    BusinessService,
    CorrectionService,
    CatalogService,
    ChatService,
    IdentityService,
    OfferingContentService,
    OfferingService,
    PasswordHasher,
    PgAffiliateRepository,
    PgAttributeRepository,
    PgBusinessRepository,
    PgCorrectionRepository,
    PgCatalogRepository,
    PgChatRepository,
    PgCommerceRepository,
    PgComparisonRepository,
    PgDecisionRepository,
    PgDiscoveryRepository,
    PgIdentityRepository,
    PgAnalyticsRepository,
    PgModerationRepository,
    PgOfferingContentRepository,
    PgPresentationRepository,
    PrincipalResolver,
    { provide: AUDIT_WRITER, useExisting: PgCommerceRepository },
    // V1 has no assistant vendor, and which one it will be is a deployment
    // decision rather than a source-file one. `buildAssistant` reads it from
    // configuration validated at boot.
    { provide: DECISION_ASSISTANT, useFactory: buildAssistant },
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
