import "reflect-metadata";

import helmet from "@fastify/helmet";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication
} from "@nestjs/platform-fastify";

import { loadRuntimeConfig } from "@commerce/config";
import { createLogger } from "@commerce/observability";

import { AppModule } from "./app.module.js";

const config = loadRuntimeConfig("api");
const logger = createLogger("api", config.logLevel);
const adapter = new FastifyAdapter({ loggerInstance: logger });
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  adapter
);

await app.register(helmet);
app.setGlobalPrefix("api/v1");
app.enableShutdownHooks();

await app.listen(config.port, config.host);
