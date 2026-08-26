<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-26
-->

# I35 — The first end-to-end run

Five consecutive closure records ended with a version of the same sentence.

> I33 — **Still nobody has looked at it.** Every claim in this increment is
> computed from markup and CSS text.
>
> I34 — **Nothing here has ever run.** No image has been built, no `vercel.json`
> has been read by Vercel, no migration applied to a hosted database.

Naming a gap five times does not close it. This increment starts both processes,
drives them over `127.0.0.1`, and **found a defect on the first attempt**.

## What had never happened

All 942 tests called `app.inject()` or `renderToStaticMarkup`. Both are function
calls into an application object. Across the whole repository:

- no TCP socket had ever been opened;
- no HTTP request had ever been parsed by Fastify;
- no page had ever been served by Next;
- **the web application had never called the API over a network.** Every test
  substitutes the client, so `API_BASE_URL`, the port and the `/api/v1` prefix
  were unverified — three values that are invisible to the suite and fatal in
  production.

The first real run:

```
$ node apps/api/dist/main.js &
$ curl http://127.0.0.1:4100/api/v1/health/ready
{"service":"api","status":"ok"}
```

## The defect: a 404 that answered 200

`/offerings/there-is-no-such-offering` returned **200 OK**, with
`Bu sayfa bulunamadı` in the body.

The cause is `loading.tsx`, added one increment earlier in I32. A `loading.tsx`
makes Next stream the segment: the shell and the fallback are flushed
immediately, and **the HTTP status is committed at that flush** — before
`page.tsx` has decided anything. The `notFound()` raised afterwards still swaps
in the correct body, so a person sees the right screen. Everything that reads
status codes — crawlers, uptime monitors, caches, `curl -f` — sees a page that
exists.

Measured over a real socket, on the same build, one file apart:

| `/offerings/[slug]/loading.tsx` | Status | Body |
|---|---|---|
| present | **200** | `Bu sayfa bulunamadı` |
| absent | **404** | `Bu sayfa bulunamadı` |

**Twelve pages were affected**, under `/admin`, `/businesses` and
`/offerings/[slug]`. Every test in the repository passed the whole time, and
would have kept passing forever: `renderToStaticMarkup` has no status code and
`app.inject()` does not stream.

### The fix, and what it costs

Three of the five `loading.tsx` files are removed. `/compare` and `/decision`
contain no `notFound()` at all, so streaming costs them nothing and they keep
their skeleton.

**This reverses part of I32 and the reversal is recorded where the decision
was**, in `tests/i32-loading-behaviour.test.ts`, with the original claim struck
through rather than deleted. A second case there derives the rule from the
source — a `loading.tsx` beside anything that calls `notFound()` now fails the
suite — so the twelve pages cannot silently become soft 404s again.

The cost is real: twelve pages lose their loading state. **A correct status code
outranks a skeleton**, and there was no third option that kept both cheaply. The
one that exists is written down under Known boundaries.

## Why the run is a script and not a test

`scripts/smoke.mjs`, run with `npm run smoke`.

It has two preconditions this suite cannot meet: a production build of the web
application, and a `DATABASE_URL` pointing at a migrated database. A test that
skips when its preconditions are absent is worse than no test, because the suite
still reports green — the script refuses loudly instead.

It is deliberately **not** part of `npm run verify`. `verify` ends with `build`,
so at the moment it starts there is no `.next` to serve, and it holds no
database URL. `verify` proves the code; `smoke` proves the deployment. They run
at different moments against different things, and `tests/i35-end-to-end.test.ts`
asserts the separation so nobody closes the gap in the direction that breaks
both.

Three refusals are built in, each for a failure that would otherwise be silent:

- **A held port is refused.** A server left running from an earlier attempt
  answers every request, every check passes, and the run certifies code that is
  not in the working tree. This is the worst outcome available to a smoke test.
- **A missing build is refused** by name, rather than becoming a sixty-second
  connection-refused loop that reads as a broken application.
- **The exit code is not the report.** The report is for a person; a script that
  printed failures and exited `0` would make CI green while the page was broken.

## Thirteen checks against running processes

```
✓ the API reports itself ready — 200
✓ a registration is accepted over HTTP — 202
✓ /metrics is not announced to an anonymous request — 404
✓ the homepage is served — 200
✓ the document is in Turkish
✓ the wordmark is rendered
✓ the skip link is first
✓ the footer is rendered
✓ the header names no privileged context
✓ the web application reaches the API server-side — 200
✓ an unknown address answers 404 — 404
✓ the not-found screen is ours and is in Turkish
✓ a missing page is not left saying it is loading
```

The registration is the shortest path that touches everything at once: Fastify
parses a JSON body, the origin is checked against `ALLOWED_ORIGINS`, Identity
writes a user and Notification writes an outbox row. `inject()` exercises the
handler; this exercises the server.

`/metrics` answering 404 rather than 401 has been asserted since I19 — against
the injected app. It is now asserted against the server that will actually be
exposed.

## A check that passed everywhere

The first version of the not-found check looked for the wordmark `İlanlar`. The
site header puts it on every page, so the check passed on the homepage, on
Discovery, and on the soft 404 it was written to catch. **A check that passes
everywhere is not a check.** It now looks for `not-found.tsx`'s own heading, and
`tests/i35-end-to-end.test.ts` asserts the wordmark is not what the script looks
for.

The two headings the script needs are copied from `apps/web/src/failure-copy.ts`
— a `.mjs` script cannot import a `.ts` module — and the same test asserts the
copies are identical to their source. A duplicate nobody checks is a duplicate
that drifts, and a smoke run looking for a sentence the site stopped saying is
the case where green means least.

## What was proven

`tests/i35-end-to-end.test.ts` (8 cases) and the two rewritten cases in
`tests/i32-loading-behaviour.test.ts`.

| Mutation | Result |
|---|---|
| `loading.tsx` restored to a segment that can 404 | 2 failed |
| The not-found heading changes and the script is not updated | 1 failed |
| The not-found check goes back to looking for the wordmark | 1 failed |
| The build precondition is dropped | 1 failed |
| A stale process is allowed to answer | 1 failed |
| The script always exits `0` | 1 failed |
| `smoke` is folded into `verify` | 1 failed |
| The processes are not stopped | 1 failed |

And the mutation that matters most is not in the suite at all: restoring
`/offerings/[slug]/loading.tsx` and rebuilding turns the run's `404` back into
`200`. That was measured, not reasoned about.

## Verification

Format, lint, module boundaries, type check, **102 test files / 951 tests**, no
OpenAPI drift, 0 vulnerabilities, production build — and **13/13 smoke checks
against two running processes**.

## Known boundaries

- **Still nobody has looked at it.** This drives HTTP and reads markup; it does
  not run a browser, execute the client bundle, or render anything visually. A
  page that is correct in HTML and broken in a viewport still passes.
- **No authenticated journey is driven.** Registration is accepted and stops
  there: confirming it needs the worker's outbox delivery, so the Business and
  Admin surfaces — nine of the twelve pages the soft 404 affected — are checked
  by removing the cause rather than by visiting them.
- **The soft-404 fix removes loading states rather than fixing streaming.** The
  option that keeps both is a `layout.tsx` per segment that resolves existence
  outside the Suspense boundary, so the status is settled before the flush. It
  costs a second resolution per request and a layout at each of several nesting
  levels, and it was not needed to make the status correct.
- **`error.tsx` has the same shape of problem and was not measured.** An error
  thrown after the first flush cannot set `500` either. `/compare` and
  `/decision` are the only streamed segments left, which bounds it, but bounding
  is not measuring.
- **The homepage measured 134 KB against a database the 951-test suite had
  filled.** That number describes the sandbox, not production, and no page-size
  budget exists to compare it against.
- **The API's host is still unchosen**, so this proves the two processes run
  together on one machine and nothing about them running apart. `NODE_ENV` is
  `development` for the API here, because `production` refuses the development
  email and chat transports by design.
- **Nothing was deployed.** No image built, no `vercel.json` read by Vercel, no
  migration applied to a hosted database. I34's boundary stands unchanged.
