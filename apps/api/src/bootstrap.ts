import "reflect-metadata";

import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication
} from "@nestjs/platform-fastify";

import { createLogger } from "@commerce/observability";
import type { RuntimeConfig } from "@commerce/config";

import { AppModule } from "./app.module.js";

/**
 * Single definition of how the API is assembled, so tests exercise the same
 * middleware, prefix and filter wiring that production runs. Anything
 * configured only in `main.ts` would be untestable and could drift.
 */
export async function createApiApp(
  config: Pick<RuntimeConfig, "logLevel">
): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      loggerInstance: createLogger("api", config.logLevel)
    })
  );

  await app.register(helmet);
  // Session cookies are read on every protected request, so the parser must be
  // registered before any route runs.
  await app.register(cookie);
  app.setGlobalPrefix("api/v1");
  app.enableShutdownHooks();
  await app.init();

  return app;
}
