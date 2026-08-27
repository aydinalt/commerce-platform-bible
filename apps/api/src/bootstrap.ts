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
import { correlationIdFrom } from "./http/correlation.js";
import { trustProxySetting } from "./http/trusted-proxy.js";

/**
 * Single definition of how the API is assembled, so tests exercise the same
 * middleware, prefix and filter wiring that production runs. Anything
 * configured only in `main.ts` would be untestable and could drift.
 */
export async function createApiApp(
  config: Pick<RuntimeConfig, "logLevel"> & {
    /**
     * Where log lines go, for the one case that has to read them.
     *
     * `i21-correlation` asserts that Fastify's automatic request line carries
     * the caller's identifier in `reqId`, which cannot be checked without
     * seeing the line. Optional and unset in production, where pino's default
     * destination is what a deployment collects.
     */
    loggerDestination?: { write: (line: string) => void };
    /**
     * Told about every route as it is registered.
     *
     * The same shape of concession as `loggerDestination` above, for the same
     * reason: **a Fastify instance cannot be asked what it serves after the
     * fact.** `onRoute` fires during registration and there is no enumerable
     * route table afterwards, so the only way to compare the published OpenAPI
     * document against reality is to be listening while reality is assembled.
     *
     * Optional and unset in production, where nothing needs to know.
     */
    onRoute?: (route: { method: string | string[]; url: string }) => void;
  }
): Promise<NestFastifyApplication> {
  const adapter = new FastifyAdapter({
    /*
     * The caller's correlation identifier *is* the request id (§12.3).
     *
     * Fastify would otherwise generate `req-1`, `req-2`, … and stamp that on
     * every automatic request and response line, while the application
     * stamped the correlation identifier on its own — two identifiers for one
     * request, joined by nothing. A per-process counter also collides across
     * instances, so `req-1` means a different request on every replica.
     */
    genReqId: correlationIdFrom,
    loggerInstance: createLogger(
      "api",
      config.logLevel,
      config.loggerDestination
    ),
    /*
     * How far `request.ip` may look into `x-forwarded-for` (I39).
     *
     * `identity.controller.ts` uses it as the throttling key. Left unset it
     * is the socket address — **the proxy's, identical for every caller
     * behind one** — so the platform's whole traffic would share a single
     * counter and lock itself out. Set to `true` it is the leftmost entry,
     * which the caller writes, so the throttle would never fire.
     *
     * The hop count is stated rather than detected, because nothing in a
     * request distinguishes an entry a proxy appended from one a caller sent.
     */
    trustProxy: trustProxySetting()
  });

  /*
   * Attached before `app.init()`, because that is where Nest registers routes
   * and `onRoute` only fires forward (I41).
   *
   * **A first version of this comment said "before `NestFactory.create`" and
   * the mutation testing proved it wrong**: moving the hook to just after
   * `create` still collects all eighty-eight routes, because `create` builds
   * the container and `init` is what mounts the controllers. Moving it after
   * `init` collects nothing.
   *
   * The boundary is `init`, and it is written here rather than assumed because
   * a comment naming the wrong line is how somebody later moves the hook to a
   * place that looks equivalent and is not.
   */
  if (config.onRoute !== undefined)
    adapter.getInstance().addHook("onRoute", config.onRoute);

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter
  );

  /*
   * Every response says which request it was (§12.3).
   *
   * The identifier reached a caller only through the error envelope, so a
   * person whose request *succeeded* slowly, or returned the wrong thing, had
   * nothing to quote — and support had nothing to search. Echoing it costs one
   * header and closes the browser-to-API boundary the same way the outbox
   * column closes the API-to-worker one.
   *
   * It is the caller's own value when they sent a usable one, so a client that
   * generates its own identifier sees it come back rather than a second one.
   */
  app
    .getHttpAdapter()
    .getInstance()
    .addHook("onSend", (request, reply, payload, done) => {
      void reply.header("x-correlation-id", request.id);
      done(null, payload);
    });

  await app.register(helmet);
  // Session cookies are read on every protected request, so the parser must be
  // registered before any route runs.
  await app.register(cookie);
  app.setGlobalPrefix("api/v1");
  app.enableShutdownHooks();
  await app.init();

  return app;
}
