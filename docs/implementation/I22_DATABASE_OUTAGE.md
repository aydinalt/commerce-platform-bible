<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-19
-->

# I22 — Honest degradation when PostgreSQL is unavailable

## What was measured

R3.6 of `docs/releases/V1_RELEASE_CRITERIA_CANDIDATE.md` asks for three things at
once:

> The product degrades honestly when PostgreSQL is unavailable: readiness fails,
> requests answer `503 DEPENDENCY_UNAVAILABLE`, **nothing reports a defect**.

Before assuming anything, a real embedded PostgreSQL was stopped underneath a
running API and the same three surfaces were driven. The result:

| Surface | Before I22 |
|---|---|
| `GET /health/ready` | `503 DEPENDENCY_UNAVAILABLE` — already correct |
| `GET /health/live` | `200` — already correct |
| `GET /discovery/browse` | **`500 INTERNAL_ERROR`** |
| `GET /metrics` | **`500`**, message: *"Attempted to send payload of invalid type 'object'"* |

Two of the three parts were not met.

**The route answer is the one that matters.** For the whole duration of somebody
else's outage, on every single request, the platform reported a defect it did not
have. `500` tells a client the request can never succeed and tells a monitoring
system the application is broken — both the opposite of the truth, and both
pointing whoever responds at the wrong system.

**The metrics answer is the one that hurts most.** Monitoring disappears at the
exact moment it is wanted, and two thirds of what that endpoint publishes — pool
gauges, timeout counters — never needed the database at all. One failed
sub-query destroyed the whole scrape.

## Why the gap existed

I19 taught the error filter about **two** database failures: a statement
PostgreSQL cancelled (`57014`) and a connection the pool could not hand out. Both
are failures of a database that is *present but slow*.

A database that is *absent* is neither, so it fell through to the
`INTERNAL_ERROR` branch. The classification knew about slowness and not about
absence, and it lived inside `ErrorEnvelopeFilter` where nothing else could see
it or notice what it was missing.

## What was built

### One classifier, in the package that owns the database

`classifyDatabaseFailure()` now lives in `@commerce/database`, beside the pool it
describes and the timeouts two of its three answers are measured against. It
returns `"acquisition" | "statement" | "unavailable" | null`.

`null` is the important return. A constraint violation, a syntax error and an
ordinary `TypeError` all stay `null` and keep answering `500`, because they *are*
defects. A classifier that widened to swallow them would turn every application
bug into a soothing "try again later" and answer `503` to requests that can never
succeed.

What counts as unavailable:

| Signal | Why |
|---|---|
| SQLSTATE class `08` | connection exception — broke, or never made |
| SQLSTATE class `53` | insufficient resources — no connections, memory or disk |
| SQLSTATE class `57` **except `57014`** | operator intervention: admin shutdown, crash shutdown, still starting up |
| `ECONNREFUSED`, `ECONNRESET`, `ENOENT`, `ENOTFOUND`, … | never reached PostgreSQL, so no SQLSTATE exists |
| `"Connection terminated"`, `"Client has encountered a connection error"` | `pg`'s own plain `Error`s |

`57014` is carved out of class 57 deliberately. It is a cancelled statement, not
an absent server, and I19 made it its own kind because the two call for different
responses.

### The response

All three kinds answer the already-published `503 DEPENDENCY_UNAVAILABLE`, so
nothing is added to the contract. The **message** distinguishes them: "The
database did not answer in time" would be a lie about a server that is not
running.

### The counter

`commerce_db_unavailable_total`, separate from `commerce_db_timeouts_total`
rather than a third `kind` label on it. A series named for timeouts that counts
outages is a metric that lies, and the responses differ: a timeout means find the
query, an outage means find the database.

Logged at `warn`, not `error`. During an outage this line appears once per
request and says nothing the pool's own `database_connection_lost` error line
does not already say — raising it would bury the useful line under thousands of
copies of the useless one.

### The scrape survives

`databaseState()` returns `null` when the database cannot answer, and only for
failures this repository classifies as the database's — anything else is a defect
in the query and is rethrown, because swallowing it would leave a permanently
broken scrape looking like a permanent outage.

**The database-derived gauges are omitted, not zeroed.** Zero is a value:
`commerce_outbox_pending 0` during an outage reads as "mail is flowing" and would
silence the alert that should be loudest. Absent lets a scraper's own staleness
handling apply, and a new `commerce_db_reachable` gauge says why.

### A residue of I20, corrected

I20's closure record says the metrics content-type bug was fixed by moving the
header past the permission check. **It was not fixed.** The header still ran
before `scrape()`, so any failure during collection — which is exactly what an
outage caused — reproduced the identical error.

The bug was never "the decorator applies too early". It was "the header is set
before a body is known to exist", and only the second statement puts it out of
reach. It is set after the body now.

This is worth stating plainly: the earlier record described the mechanism
correctly and then claimed a coverage it did not have.

## What was proven

`tests/i22-database-outage.integration.test.ts`, eight cases against a **real**
refused connection — an app whose pool points at a port where nothing listens.
Portable on purpose: the local environment runs an embedded PostgreSQL and CI
runs a service container, and a test can stop neither.

The classifier's cases use shapes taken from the measured outage rather than
imagined ones — `57P01` with the exact message `pg` raised.

### Mutations

| Mutation | Result |
|---|---|
| Classify only the two timeouts (the pre-I22 state) | 4 of 8 failed |
| Treat everything that is not `57014` as unavailable | 1 of 8 failed |
| Let the scrape die with the database again | 2 of 8 failed |
| Publish zeros instead of omitting the gauges | 2 of 8 failed |
| Set the content type before the body (the I20 residue) | 1 of 8 failed |
| Count the outage as a statement timeout | 1 of 8 failed |

The content-type mutation is worth recording. It was **not caught** by the first
version of that case, which asserted the status and the code — and the bug leaves
both unchanged at `500 INTERNAL_ERROR`. What changes is what the envelope
*says*: Fastify's refusal to serialise replaces the real failure with a complaint
about payload types. Asserting the message is what makes the case load-bearing,
and asserting the status is what let I20 believe it was finished.

## Verification

Format, lint, module boundaries, type check, **91 test files / 837 tests**, no
OpenAPI drift, 0 vulnerabilities, build. `db:validate`, `db:deploy` and
`db:drift` run in target CI only.

## Known boundaries

- **This is R3.6's behaviour, not R3.6's evidence.** The criterion asks for "a
  deliberate dependency outage in a non-production environment", which still
  needs an environment. What is closed is that the behaviour is now correct and
  proven; what remains is performing it somewhere real.
- **The worker was not changed.** A database outage makes `processBatch` throw,
  `main` logs `outbox_batch_failed` and the loop idles — already honest
  degradation, and there is no caller to answer `503` to. Its failures surface as
  the outbox gauges climbing, which is the signal that already exists.
- **The web application's behaviour on a `503` was not assessed.** The API now
  answers honestly; whether every screen presents that honestly is a separate
  question and a separate increment.
- **Nothing retries.** Engineering Constitution §13 lists retry alongside
  timeout, and a database retry policy still has not been designed — the same
  boundary I19 recorded, unchanged.
- **Nothing alerts on `commerce_db_reachable`.** It is the cheapest possible
  outage alert and there is no alerting system, which is R1.4.
