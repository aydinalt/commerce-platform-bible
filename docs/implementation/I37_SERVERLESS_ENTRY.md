<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-26
-->

# I37 — The API as a function

The Owner chose **Vercel and Supabase** on 2026-08-26, staged: ship on Vercel
first, move the API to a process host if the measurements demand it.

Vercel runs functions. `apps/api/src/main.ts` calls `listen` and never returns,
so it has nowhere to run there — and until this increment the API had **no way
at all** to run on the platform the Owner chose.

## One application, two entries

`main.ts` stays, and that is the point rather than an oversight. **A staged
decision is only reversible while both shapes exist**; deleting the process
entry would quietly convert "Vercel for now" into "Vercel permanently".

`bootstrap.ts` already separated building the application from listening on a
port — a decision made for testability that turns out to be what makes this
possible without a second copy of anything:

| Entry | Shape | Runs on |
|---|---|---|
| `src/main.ts` | builds, then `listen` | a process host, the Dockerfile, `npm run smoke` |
| `src/handler.ts` | builds, then answers `(req, res)` | Vercel |

Both call `createApiApp`. There is one request pipeline, not two.

## Built once per instance, not once per request

A function instance is reused across invocations while it stays warm, so the
handler caches its build at module scope.

**The failure this avoids is not slowness.** Building the container per request
would open a new database pool on every call, and against Supabase's connection
limit that is the whole project falling over rather than one slow response.

The **promise** is cached, not the application: two requests arriving during a
cold start both await the same build rather than starting a second one. It is
built lazily rather than at import, because a cold start that fails at import
has no request to answer and no way to say why — the platform reports it as a
crash.

`fastify.ready()` is awaited before the first request is passed in. Without it a
request can be served before `helmet` and the cookie parser register, which is
not a slow response but a wrong one: no security headers, and no session.

The handler drives Fastify by emitting `request` on its server — Fastify's
documented way to be driven by a server it did not create. The whole pipeline
runs exactly as it does behind `listen`, which is why the tests below can
compare the two entries at all.

## I36's predicted gap, closed

I36 wired the timeout verification into two entrypoints and wrote down the cost:

> The cost of that choice is that a third entrypoint could forget.

This is the third entrypoint, and it is the one that will actually run against
Supabase's pooled port — where the pooler can drop the `options` parameter
carrying `statement_timeout` and answer the connection anyway. It runs the check.

## Two Vercel projects

Vercel serves a project's root `api/` directory as functions itself, and a
Next.js project already owns its routing. The two conflict, and the documented
answer is two projects, which a monorepo supports with each project's Root
Directory pointing at a workspace.

`apps/api/api/index.js` is **plain JavaScript pointing at `dist`**, and both
halves are forced: `apps/api/tsconfig.json` sets `rootDir: "src"`, so a
TypeScript file there would either be excluded from the build or force
`dist/main.js` to move — and that path is what the Dockerfile and the process
host start.

The procedure, including the Supabase steps and the environment variables that
are not obvious, is in `docs/implementation/DEPLOYING_TO_VERCEL.md`.

## A failure that was the test's fault

The correlation-echo case failed, and the code was right.

It sent `11111111-2222-3333-4444-555555555555`, which is **not a valid UUID** —
the variant nibble must be one of `89ab` and that one is `4`. I17 minted a fresh
identifier instead, exactly as it should: a caller who sends a malformed
identifier gets a real one rather than having their string propagated into the
audit record.

The case was corrected and **the behaviour it accidentally found got a case of
its own**, because that half had never been asserted through a real request.

## What was proven

`tests/i37-serverless-entry.test.ts`, eleven cases. Seven of them drive the
handler through a **real `http.createServer` over a real socket** — Vercel hands
a Node `IncomingMessage` and `ServerResponse` to an exported function, and so
does this.

| Mutation | Result |
|---|---|
| The app is rebuilt on every request | 1 failed |
| `fastify.ready()` is not awaited | 7 failed |
| The timeout check is dropped from the handler | 1 failed |
| The global prefix is stripped | 3 failed |
| `main.ts` stops listening | 1 failed |
| The Vercel entry points somewhere else | 1 failed |

Separately, and outside the suite: after `npm run build`, importing
`apps/api/api/index.js` resolves through the compiled output and yields a
function. The import chain Vercel will follow is real.

## Verification

Format, lint, module boundaries, type check, **104 test files / 973 tests**, no
OpenAPI drift, 0 vulnerabilities, production build, and **13/13 smoke checks**
against two running processes — which is what proves the process entry still
works after gaining a sibling.

## Known boundaries

- **No Vercel project exists.** Nothing here has been deployed, no `vercel.json`
  has been read by Vercel, and the two-project layout is written from Vercel's
  documentation rather than from a build that ran. The first person to follow
  `DEPLOYING_TO_VERCEL.md` should expect to correct it.
- **The worker still has no home**, and that is the largest remaining gap: it is
  a 2-second poll loop with nowhere to loop. Until it runs, **no email is ever
  sent** — registration confirmations sit unread in the outbox, so nobody can
  complete a sign-up. A deployment made today would look healthy and be unusable.
- **`/metrics` counts in memory.** Each function instance has its own counters
  and they reset when it recycles. I19's design assumed a process, and this
  increment does not fix it.
- **`DATABASE_POOL_MAX` is unchanged at 10**, which is right for a process host
  and wrong here. It is documented as `1` for Vercel rather than enforced,
  because the correct number is a property of the deployment and the code has no
  way to know which one it is in.
- **Cold-start duration is unmeasured.** Building a Nest container and verifying
  the database timeouts both happen on the first request of a cold instance, and
  Vercel's function timeout is a real limit this has never been held against.
- **No authenticated journey runs through the handler.** Registration is
  accepted and stops there, because confirming it needs the worker.
