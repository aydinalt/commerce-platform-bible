import type { IncomingMessage, ServerResponse } from "node:http";

import { loadRuntimeConfig } from "@commerce/config";
import { createDatabasePool, verifyDatabaseTimeouts } from "@commerce/database";

import { createApiApp } from "./bootstrap.js";

/**
 * The API as a function rather than a process (I37).
 *
 * The Owner chose Vercel and Supabase on 2026-08-26, staged: ship on Vercel
 * first and move to a process host if the measurements demand it. Vercel runs
 * functions, so `main.ts` — which calls `listen` and never returns — has
 * nowhere to run there.
 *
 * **`main.ts` is not replaced by this and must not be.** The staged decision
 * only works while both shapes exist: the same application, entered two ways.
 * `bootstrap.ts` already separated building the app from listening on a port,
 * which is what makes that possible without a second copy of anything.
 *
 * ## Why the app is built at module scope
 *
 * A function instance is reused across invocations while it stays warm.
 * Building the Nest container per request would pay the whole cost — module
 * graph, providers, plugin registration — on every call, and open a new
 * database pool each time, which against Supabase's connection limit is the
 * failure that takes the whole project down rather than one request.
 *
 * So it is built once and awaited per invocation. The promise is the thing
 * that is cached, not the app: two requests arriving before the first build
 * finishes both await the same promise rather than starting a second build.
 */

/**
 * Built once per instance, awaited per request.
 *
 * `undefined` until the first request rather than eagerly at import, because a
 * cold start that fails at import has no request to answer and no way to say
 * why — the platform reports it as a crash. Failing inside the handler means
 * the caller gets a response and the reason reaches a log line.
 */
let starting:
  | Promise<(request: IncomingMessage, response: ServerResponse) => void>
  | undefined;

const build = async (): Promise<
  (request: IncomingMessage, response: ServerResponse) => void
> => {
  const config = loadRuntimeConfig("api");

  /*
   * The same boot check the process path runs (I36), for the same reason and
   * with one difference that matters: **a function instance that skipped it
   * would be one of many.** A transaction pooler can drop the `options`
   * parameter carrying `statement_timeout` and answer the connection anyway,
   * and Supabase's pooled port is the one a Vercel deployment will use — so
   * this is the deployment where the check earns its place.
   *
   * Its own pool, opened and closed here, because the application's pool lives
   * inside the Nest container that does not exist yet.
   */
  const probe = createDatabasePool((error) => {
    process.stderr.write(`${error.message}\n`);
  });
  try {
    await verifyDatabaseTimeouts(probe);
  } finally {
    await probe.end();
  }

  const app = await createApiApp(config);
  const fastify = app.getHttpAdapter().getInstance();

  /*
   * `ready()` resolves once every plugin and route is registered. Without it
   * the first request can arrive before `helmet` and the cookie parser are in
   * place — which is not a slow response but a wrong one, served without the
   * headers and without a session.
   */
  await fastify.ready();

  /*
   * Fastify's documented way to be driven by a server it did not create. The
   * `request` event is what Node's own HTTP server emits, so the whole
   * pipeline — parsing, hooks, routing, serialisation — runs exactly as it
   * does behind `listen`, and there is no second request path to keep in step
   * with the first.
   */
  return (request, response) => {
    fastify.server.emit("request", request, response);
  };
};

/**
 * The function Vercel invokes.
 *
 * Exported as the default because that is the shape Vercel's Node runtime
 * looks for. It is a plain `(req, res)` handler, so anything that speaks
 * Node's HTTP interface can drive it — which is how it is tested: a real
 * `http.createServer` in front of it, answering real requests over a real
 * socket.
 */
export default async function handler(
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  starting ??= build();
  (await starting)(request, response);
}
