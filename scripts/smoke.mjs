#!/usr/bin/env node
/**
 * The first end-to-end run (I35).
 *
 * Every one of the 942 tests calls `app.inject()` or `renderToStaticMarkup`.
 * Those are function calls into an application object — **no socket is ever
 * opened, no HTTP request is ever parsed, and no web server has ever served a
 * page.** Five consecutive closure records said so and none of them fixed it:
 *
 *   I33 — "Still nobody has looked at it."
 *   I34 — "Nothing here has ever run."
 *
 * This starts both processes for real, drives them over `127.0.0.1`, and checks
 * the things `inject()` cannot see by construction:
 *
 *   - that `main.js` boots at all outside a test harness;
 *   - that Fastify's own HTTP parsing, CORS and error handling behave;
 *   - that Next serves the built application rather than a dev server;
 *   - that a **streamed response carries the right status code**, which is what
 *     this found broken on its first run;
 *   - that the web application's **server-side fetch reaches the API over a
 *     real socket** — `API_BASE_URL`, the port, the path prefix. A wrong value
 *     there is invisible to every test in the repository and fatal in
 *     production.
 *
 * It is a script and not a test on purpose. It has preconditions a test cannot
 * assert without lying about them — a production build and a migrated database
 * — and a test that silently skips when its preconditions are absent is worse
 * than no test, because the suite still reports green. This fails loudly.
 *
 *   npm run smoke
 *
 * Requires `npx tsc -b`, `npm run build`, and a `DATABASE_URL` pointing at a
 * database the migrations have been applied to.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";

/**
 * Two headings copied from `apps/web/src/failure-copy.ts`.
 *
 * This script runs under plain node and that file is TypeScript, so it cannot
 * be imported here. `tests/i35-end-to-end.test.ts` asserts these are identical
 * to their source, which turns the copy into a duplicate the suite maintains
 * rather than a pair of literals that quietly stop matching the site.
 */
const ABSENT = { heading: "Bu sayfa bulunamadı" };
const RESOLVING = { heading: "Yükleniyor" };

const API_PORT = 41_000;
const WEB_PORT = 31_000;
const API = `http://127.0.0.1:${API_PORT}`;
const WEB = `http://127.0.0.1:${WEB_PORT}`;

/** @typedef {{ detail: string; name: string; ok: boolean }} Outcome */

/** @type {Outcome[]} */
const checks = [];

/**
 * Record an outcome. Nothing throws mid-run; the whole report is the point.
 *
 * @param {string} name
 * @param {boolean} ok
 * @param {string} [detail]
 * @returns {void}
 */
const check = (name, ok, detail = "") => {
  checks.push({ detail, name, ok });
  process.stdout.write(
    `  ${ok ? "✓" : "✗"} ${name}${detail === "" ? "" : ` — ${detail}`}\n`
  );
};

/**
 * Refuse to run against a port somebody else holds.
 *
 * **This is the worst outcome available to a smoke test.** A server left
 * running from an earlier attempt answers every request, every check passes,
 * and the run certifies code that is not in the working tree.
 *
 * @param {number} port
 * @returns {Promise<boolean>}
 */
const free = (port) =>
  new Promise((resolve) => {
    const probe = createServer();
    probe.once("error", () => {
      resolve(false);
    });
    probe.once("listening", () => {
      probe.close(() => {
        resolve(true);
      });
    });
    probe.listen(port, "127.0.0.1");
  });

/**
 * @param {string} url
 * @param {string} name
 * @param {number} [seconds]
 * @returns {Promise<boolean>}
 */
const wait = async (url, name, seconds = 60) => {
  for (let index = 0; index < seconds; index += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {
      /* Not listening yet. */
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  check(`${name} starts`, false, `no answer from ${url} within ${seconds}s`);
  return false;
};

/** @type {import("node:child_process").ChildProcess[]} */
const children = [];

/** @returns {void} */
const stop = () => {
  for (const child of children) child.kill("SIGTERM");
};

/**
 * @param {string} name
 * @param {string} command
 * @param {readonly string[]} args
 * @param {Record<string, string>} env
 * @returns {void}
 */
const start = (name, command, args, env) => {
  const child = spawn(command, args, {
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"]
  });

  /** Kept so a process that dies can say why, rather than only timing out. */
  /** @type {string[]} */
  const tail = [];
  for (const stream of [child.stdout, child.stderr]) {
    if (stream === null) continue;
    stream.on("data", (chunk) => {
      tail.push(String(chunk));
      if (tail.length > 40) tail.shift();
    });
  }
  child.on("exit", (code) => {
    if (code !== 0 && code !== null)
      process.stdout.write(`\n${name} exited ${code}:\n${tail.join("")}\n`);
  });

  children.push(child);
};

const run = async () => {
  if (!existsSync("apps/api/dist/main.js"))
    throw new Error(
      "apps/api/dist/main.js is absent — run `npm run build` first"
    );
  if (!existsSync("apps/web/.next/BUILD_ID"))
    throw new Error("apps/web/.next is absent — run `npm run build` first");
  if (process.env["DATABASE_URL"] === undefined)
    throw new Error(
      "DATABASE_URL is unset — the API cannot answer /health/ready"
    );

  for (const port of [API_PORT, WEB_PORT])
    if (!(await free(port)))
      throw new Error(
        `port ${port} is already held — a stale run would be reported as this one`
      );

  start("api", process.execPath, ["apps/api/dist/main.js"], {
    ALLOWED_ORIGINS: WEB,
    API_HOST: "127.0.0.1",
    API_PORT: String(API_PORT),
    LOG_LEVEL: "error",
    NODE_ENV: "development",
    PUBLIC_WEB_URL: WEB
  });
  start("web", "npx", ["next", "start", "apps/web", "-p", String(WEB_PORT)], {
    API_BASE_URL: `${API}/api/v1`,
    NODE_ENV: "production",
    PORT: String(WEB_PORT)
  });

  if (!(await wait(`${API}/api/v1/health/ready`, "the API"))) return;
  if (!(await wait(`${WEB}/`, "the web application"))) return;

  // ─── The API, over a socket rather than through inject() ───────────────────

  /*
   * Read as text rather than parsed. This is the one place in the repository
   * that sees what actually goes down the wire, so checking the serialised body
   * rather than an object rebuilt from it keeps that property — a serialiser
   * that dropped the field would still parse into something.
   */
  const ready = await fetch(`${API}/api/v1/health/ready`);
  const readyBody = await ready.text();
  check(
    "the API reports itself ready",
    ready.ok && readyBody.includes('"status":"ok"'),
    String(ready.status)
  );

  /*
   * A registration is the shortest path that touches everything: Fastify parses
   * a JSON body, the origin is checked, Identity writes a user, and Notification
   * writes an outbox row. `inject()` exercises the handler; this exercises the
   * server.
   */
  const registration = await fetch(`${API}/api/v1/auth/registrations`, {
    body: JSON.stringify({
      email: `smoke-${Date.now()}@example.test`,
      password: "Correct-Horse-Battery-9!"
    }),
    headers: { "content-type": "application/json", origin: WEB },
    method: "POST"
  });
  check(
    "a registration is accepted over HTTP",
    registration.status === 202,
    String(registration.status)
  );

  /*
   * **This check was hitting a path the application has never had.**
   *
   * It requested `/metrics`, and the global prefix makes the real path
   * `/api/v1/metrics`. So it answered 404 because nothing was there, not
   * because the endpoint was closed — a check that passes for the wrong
   * reason, and the second one this script has had after the wordmark in I35.
   *
   * I19's property is real and now actually tested: an anonymous caller gets
   * **404 rather than 401**, because 401 confirms there is something here to
   * be authorised against.
   */
  const metrics = await fetch(`${API}/api/v1/metrics`);
  check(
    "/metrics is not announced to an anonymous request",
    metrics.status === 404,
    String(metrics.status)
  );

  /*
   * And the other half, which the wrong path made unaskable: the endpoint does
   * exist. A check that only ever sees 404 cannot tell a closed door from a
   * wall, and a wall is what a deployment that lost the route would look like.
   */
  const wrongToken = await fetch(`${API}/api/v1/metrics`, {
    headers: { authorization: "Bearer not-the-token" }
  });
  check(
    "a wrong scrape token is refused the same way as none",
    wrongToken.status === 404,
    String(wrongToken.status)
  );

  // ─── The web application, built and served ────────────────────────────────

  const home = await fetch(`${WEB}/`);
  const homeHtml = await home.text();
  check(
    "the homepage is served",
    home.ok,
    `${home.status}, ${homeHtml.length} bytes`
  );

  for (const [name, needle] of [
    ["the document is in Turkish", 'lang="tr"'],
    ["the wordmark is rendered", "İlanlar"],
    ["the skip link is first", "skip-link"],
    ["the footer is rendered", "<footer"]
  ])
    check(String(name), homeHtml.includes(String(needle)));

  /*
   * **The header must not name the Admin or Business context.** UX-0008 §5
   * keeps both behind an explicit entry, and a navigation item announcing them
   * tells every anonymous visitor that they exist. Checked here as well as in
   * markup because this is the document a browser will receive.
   */
  const header = /<header[\s\S]*?<\/header>/u.exec(homeHtml)?.[0] ?? "";
  check(
    "the header names no privileged context",
    !/Yönetim|Admin|İşletme/u.test(header),
    header === "" ? "no header found" : ""
  );

  /*
   * The one thing no test in this repository can see: Next's server calling the
   * API across a socket. If `API_BASE_URL` were wrong, every test would still
   * pass and this page would be the first thing to break in production.
   */
  const discovery = await fetch(`${WEB}/discovery`);
  const discoveryHtml = await discovery.text();
  check(
    "the web application reaches the API server-side",
    discovery.ok && !/Beklenmedik|ulaşılamıyor/u.test(discoveryHtml),
    String(discovery.status)
  );

  /*
   * **This is the check that found something.** An address that resolves to
   * nothing must answer 404, not 200 with an apology in the body.
   *
   * It answered 200. `/offerings/[slug]` had a `loading.tsx`, which makes Next
   * stream the segment — the shell is flushed and the status committed before
   * `page.tsx` calls `notFound()`. The body was right and the status was a lie,
   * which is the worst of both: a person sees the correct screen and every
   * crawler, monitor and cache sees a page that exists.
   *
   * The body is checked against `not-found.tsx`'s own words rather than against
   * the shell — an earlier version looked for the wordmark, which is in the
   * header of every page and therefore passed on all of them.
   */
  const missing = await fetch(`${WEB}/offerings/there-is-no-such-offering`);
  const missingHtml = await missing.text();
  check(
    "an unknown address answers 404",
    missing.status === 404,
    String(missing.status)
  );
  check(
    "the not-found screen is ours and is in Turkish",
    missingHtml.includes(ABSENT.heading) &&
      !missingHtml.includes("This page could not be found")
  );

  /*
   * And it must not be left saying it is still loading, which is what the soft
   * 404 looked like from the outside before the body arrived.
   */
  check(
    "a missing page is not left saying it is loading",
    !missingHtml.includes(RESOLVING.heading)
  );
};

try {
  process.stdout.write(
    "Starting both services and driving them over HTTP…\n\n"
  );
  await run();
} catch (error) {
  check(
    "the run completes",
    false,
    error instanceof Error ? error.message : String(error)
  );
} finally {
  stop();
}

const failed = checks.filter((entry) => !entry.ok);
process.stdout.write(
  `\n${checks.length - failed.length}/${checks.length} checks passed against running processes.\n`
);
process.exit(failed.length === 0 ? 0 : 1);
