import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import type { Server } from "node:http";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import handler from "../apps/api/src/handler.js";

/**
 * The API as a function (I37).
 *
 * The Owner chose Vercel and Supabase on 2026-08-26, staged: ship on Vercel
 * first and move to a process host if the measurements demand it. Vercel runs
 * functions, and `main.ts` calls `listen` and never returns — so it has nowhere
 * to run there.
 *
 * **`main.ts` stays.** The staged decision only works while both shapes exist,
 * and `bootstrap.ts` already separated building the application from listening
 * on a port, so neither entry is a copy of the other.
 *
 * These cases drive the handler through a **real `http.createServer` over a
 * real socket**, which is as close to Vercel's invocation as anything here can
 * get: Vercel hands a Node `IncomingMessage` and `ServerResponse` to an
 * exported function, and so does this. What it cannot prove is the platform
 * configuration around it — see the closure record.
 */
describe("Increment I37 the API as a function", () => {
  let server: Server;
  let origin: string;

  beforeAll(async () => {
    server = createServer((request, response) => {
      void handler(request, response);
    });
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    if (address === null || typeof address === "string")
      throw new Error("the test server did not take a port");
    origin = `http://127.0.0.1:${String(address.port)}`;
  }, 60_000);

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error === undefined) resolve();
        else reject(error);
      });
    });
  });

  describe("what it serves", () => {
    it("answers the same readiness the process answers", async () => {
      /*
       * The whole point of the shape: one application, two entries. If this
       * differed from what `npm run smoke` gets from `main.js`, there would be
       * two request paths to keep in step and one of them would drift.
       */
      const response = await fetch(`${origin}/api/v1/health/ready`);
      expect(response.status).toBe(200);
      expect(await response.text()).toContain('"status":"ok"');
    });

    it("keeps the path prefix, which is the whole routing contract", async () => {
      /*
       * `setGlobalPrefix("api/v1")` runs inside `createApiApp`, so the handler
       * inherits it. Asserted because a serverless entry is exactly where
       * somebody would be tempted to strip it — Vercel already routes on
       * `/api`, and a prefix removed here would silently move every route the
       * web application calls.
       */
      const unprefixed = await fetch(`${origin}/health/ready`);
      expect(unprefixed.status).toBe(404);
    });

    it("registered its plugins before answering", async () => {
      /*
       * `fastify.ready()` is awaited in the handler, and this is what would
       * fail without it: a first request served before `helmet` registered is
       * not a slow response, it is a wrong one — no security headers, and no
       * cookie parser, so no session.
       *
       * Checked through a header `helmet` sets rather than by inspecting the
       * instance, because what matters is what a caller receives.
       */
      const response = await fetch(`${origin}/api/v1/health/ready`);
      expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    });

    it("echoes the caller's correlation identifier", async () => {
      /*
       * §12.3, through the function entry rather than through `inject()`. The
       * `onSend` hook lives in `bootstrap.ts`, so this proves the handler gets
       * the configured application and not a bare Fastify instance.
       *
       * **The first version of this case failed and the code was right.** It
       * sent `11111111-2222-3333-4444-555555555555`, which is not a valid
       * UUID: the variant nibble must be one of `89ab` and that one is `4`.
       * I17 minted a fresh identifier instead, exactly as it should — a caller
       * who sends a malformed identifier gets a real one rather than having
       * their malformed string propagated into the audit record.
       */
      const sent = "11111111-2222-4333-8444-555555555555";
      const response = await fetch(`${origin}/api/v1/health/ready`, {
        headers: { "x-correlation-id": sent }
      });
      expect(response.headers.get("x-correlation-id")).toBe(sent);
    });

    it("mints its own when the caller's is malformed", async () => {
      /*
       * The other half, which is what the failure above turned out to be
       * testing. A malformed identifier is not propagated — it is replaced, so
       * nothing downstream stores a string that was never an identifier.
       */
      const response = await fetch(`${origin}/api/v1/health/ready`, {
        headers: { "x-correlation-id": "not-an-identifier" }
      });
      const echoed = response.headers.get("x-correlation-id");
      expect(echoed).not.toBe("not-an-identifier");
      expect(echoed).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu
      );
    });

    it("does not announce /metrics to an anonymous caller", async () => {
      // I19's property, asserted against the entry a public deployment will
      // actually expose. 404 rather than 401, so the endpoint's existence is
      // not confirmed to somebody guessing.
      const response = await fetch(`${origin}/metrics`);
      expect(response.status).toBe(404);
    });

    it("parses a POST body and applies the origin rule", async () => {
      /*
       * A registration is the shortest path that touches Fastify's body
       * parsing, the origin check, and a write. Serving it through the
       * function entry proves the request pipeline is the real one rather than
       * a routing shim that happens to answer `GET`.
       */
      const response = await fetch(`${origin}/api/v1/auth/registrations`, {
        body: JSON.stringify({
          email: `handler-${String(Date.now())}@example.test`,
          password: "Correct-Horse-Battery-9!"
        }),
        headers: { "content-type": "application/json" },
        method: "POST"
      });
      expect(response.status).toBe(202);
    });
  });

  describe("how it is built", () => {
    /** Comments and imports stripped — I36's finding, kept. */
    const source = (path: string): string =>
      readFileSync(path, "utf8")
        .replaceAll(/\/\*[\s\S]*?\*\//gu, "")
        .replaceAll(/^\s*\/\/.*$/gmu, "")
        .replaceAll(/^import[\s\S]*?;$/gmu, "");

    it("builds once per instance rather than once per request", () => {
      /*
       * **The failure this prevents is not slowness.** A function instance is
       * reused while it stays warm, so building the container per request
       * would open a new database pool on every call — and against Supabase's
       * connection limit that is the whole project falling over, not one slow
       * response.
       *
       * `??=` on the promise rather than on the app: two requests arriving
       * during a cold start both await the same build instead of starting a
       * second one.
       */
      expect(source("apps/api/src/handler.ts")).toMatch(
        /starting \?\?= build\(\)/u
      );
    });

    it("verifies the database timeouts, like the process entry", () => {
      /*
       * I36 added this to `main.ts` and the worker, and predicted the gap:
       * "the cost of that choice is that a third entrypoint could forget".
       * This is the third entrypoint, and it is the one that will actually run
       * against Supabase's pooled port.
       */
      expect(source("apps/api/src/handler.ts")).toMatch(
        /verifyDatabaseTimeouts\(\w/u
      );
    });

    it("does not replace the process entry", () => {
      /*
       * The staged decision the Owner took — Vercel now, a process host if the
       * measurements demand it — is only available while both exist. Deleting
       * `main.ts` would quietly convert a reversible choice into a permanent
       * one.
       */
      expect(source("apps/api/src/main.ts")).toMatch(/app\.listen\(/u);
    });

    it("is reachable from the file Vercel invokes", () => {
      /*
       * Plain JavaScript pointing at `dist`, because `apps/api/tsconfig.json`
       * sets `rootDir: "src"` — a TypeScript file here would either be left out
       * of the build or force the output layout to move, and `dist/main.js` is
       * what the Dockerfile and the process host start.
       */
      const entry = readFileSync("apps/api/api/index.js", "utf8");
      expect(entry).toContain("../dist/handler.js");
    });
  });
});
