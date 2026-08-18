import { Injectable, Module, type OnModuleDestroy } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { Pool } from "pg";

import { loadChatConfig, loadRuntimeConfig } from "@commerce/config";
import { createDatabasePool } from "@commerce/database";
import type { DecisionAssistant } from "@commerce/decision";
import { createLogger } from "@commerce/observability";

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
import { anthropicProvider } from "./decision/anthropic.provider.js";
import { HttpDecisionAssistant } from "./decision/http.assistant.js";
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
 * The vendor arrives as configuration rather than as an import.
 * `loadChatConfig` has already refused a production deployment that named a
 * vendor without a credential or a model, so the values exist by the time this
 * runs. There is no fallback to the brief-restating adapter: a production Chat
 * answered by it would be the platform pretending to have an assistant.
 */
function buildAssistant(): DecisionAssistant {
  const config = loadChatConfig();
  if (config.transport === "development")
    return new RestatingDecisionAssistant(
      process.env.NODE_ENV ?? "development"
    );

  return new HttpDecisionAssistant({
    // The same level the rest of the process logs at, so an assistant outage
    // is not the one thing a quiet deployment still prints.
    logger: createLogger("api", loadRuntimeConfig("api").logLevel),
    provider: anthropicProvider({
      apiKey: config.apiKey ?? "",
      model: config.model ?? ""
    }),
    timeoutMs: config.timeoutMs
  });
}

/**
 * Closes the pool once, when the application does.
 *
 * Each repository used to end its own pool in `onModuleDestroy`, which was
 * correct while each owned one. With a shared pool the first repository
 * destroyed would have closed it under the other fourteen, so the shutdown
 * belongs to whoever owns the pool — which is now the module.
 */
@Injectable()
export class DatabaseLifecycle implements OnModuleDestroy {
  constructor(private readonly pool: Pool) {}

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
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
    /*
     * One pool, for the whole process.
     *
     * Every repository used to build its own — fifteen of them, ten connections
     * each by `pg`'s default, so a single API instance could open a hundred and
     * fifty connections against a database whose own default ceiling is a
     * hundred. Registering it here makes the connection budget a property of
     * the process rather than of how many repositories happen to exist, and
     * makes the pool something a test can substitute.
     */
    { provide: Pool, useFactory: createDatabasePool },
    DatabaseLifecycle,
    { provide: AUDIT_WRITER, useExisting: PgCommerceRepository },
    // Which assistant answers is a deployment decision rather than a source-file
    // one. `buildAssistant` reads it from configuration validated at boot.
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
