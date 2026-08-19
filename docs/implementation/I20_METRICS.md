# I20 Metrics — Closure Record

- **Owner:** Architecture Owner
- **Status:** Draft — awaiting Owner acceptance
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-18
- **Scope:** Implementation record only. No Frozen Story is edited, no Acceptance
  Criterion changes, and no Delivery Status moves.

## What was missing

Engineering Constitution §12.2: *"Each production component shall expose metrics
appropriate to its role."* **There were none.** No endpoint, no counters, no
dependency that could produce them.

This is R1.1 of the release criteria proposed in
`docs/releases/V1_RELEASE_CRITERIA_CANDIDATE.md`, and the first gate in that
document's suggested order — deploying something you cannot observe means the
first production incident is also the first time anybody looks.

## What is published, and why exactly this

§12.2 also warns that *"a metric is useful only when its meaning, unit, owner,
and response are understood"*, which is an argument against publishing
everything measurable. So the set is not a survey. It is **the questions the last
three increments raised and left unanswerable**, each of which ends its own
closure record admitting the same thing:

| Increment | Its own words | The metric that answers it |
|---|---|---|
| I18 | *"Ten is a default, not a measurement"* | `commerce_db_pool_connections`, `commerce_db_pool_max` |
| I19 | *"Five seconds is a judgement, not a measurement"* | `commerce_db_timeouts_total` |
| I17 | The sweep *"has never run against a table with a real backlog"* | `commerce_retention_pending_rows` |
| I11 | Dead letters kept deliberately as evidence | `commerce_outbox_dead_letters`, `commerce_outbox_pending` |

Every series carries a `HELP` line saying **what to do about it**, not only what
it counts. That is §12.2's "response" made part of the artefact rather than left
in somebody's head.

## Almost nothing is instrumented at a call site

The pool is asked what it is holding; the database is asked what it contains.
Only two series are accumulated in process — a cancelled statement and a refused
connection are gone the moment they are answered, so they are counted in
`ErrorEnvelopeFilter`, which already classified them for I19.

A counter incremented in twenty places is twenty places to forget. State read at
scrape time cannot drift from the thing it describes.

## The worker is a separate process, and the answer is better for it

The endpoint lives in the API and cannot see the worker's counters. Giving a
polling loop an HTTP surface purely to publish them would be a worse answer than
the question deserves.

Reading the **state** instead is not a consolation prize. A counter of rows the
sweep deleted says it ran; a gauge of rows *still waiting* to be deleted says
whether it is keeping up — **and if the worker dies, every one of them climbs on
its own.** That is the thing an alert should watch, and it is cheaper and more
honest than a heartbeat.

## Two decisions worth the words

**Hand-written rather than `prom-client`.** The set is counters and gauges with
no histograms, which is about sixty lines of formatting; and `prom-client` would
also register default process metrics nobody has decided to publish. If a
latency histogram is ever wanted that trade reverses, and the dependency becomes
the right answer. Recorded so the reversal is a decision rather than a surprise.

**The gate accepts either a bearer token or an entered Admin context.** The
Owner's decision was "Prometheus text on an Admin-closed `/metrics`", and the
Admin reading cannot work alone: **a Prometheus scraper has no browser, no cookie
and nobody to sign it in.** Requiring an Admin session would have made these
readable only by a person, which is a dashboard rather than monitoring and would
not satisfy R1.4. A token serves the scraper, the Admin context serves a person,
and both readings of the decision are honoured rather than one being quietly
overruled.

It answers `404` rather than `401`. An endpoint that refuses confirms it is
there, and there is no reason to confirm that to somebody who cannot use it.

## The endpoint is deliberately outside the OpenAPI contract

`generate-openapi.ts` composes the published product API from the contract
schemas. This returns Prometheus text to a monitoring system, is not a product
capability, and putting it in the document would advertise it to every client.
Verified: `openapi:generate` produces no drift.

## A bug this increment introduced and then found

`@Header("content-type", "text/plain")` was the obvious way to declare the
response type, and it **broke every failure path**. The decorator applies to the
whole route, so when the handler threw, Fastify was asked to send the JSON error
envelope as text and refused — *"Attempted to send payload of invalid type
'object'"* — turning the `404` into a `500` that described a serialisation
problem rather than the refusal.

The content type is now set inside the handler, after the permission check. The
success path declares its own type and the failure path is left to the envelope
filter, which is the only thing that knows what an error looks like.

Found by the first test written against the endpoint, which is the argument for
writing that test first.

## One constant moved

`IDENTITY_GRACE_MS`, `OUTBOX_RETENTION_MS` and `THROTTLE_RETENTION_MS` moved
from `retention.sweeper.ts` to `@commerce/database`, beside the expired-state SQL
that already lives there for the same reason. The metric had to count rows
*waiting* to be swept using the identical windows the sweeper deletes by, and a
second copy of a window is a second thing to get wrong. Three test files followed
the move.

## The tests

`i20-metrics.integration.test.ts` — eight cases, seeding real state and reading
it back through the endpoint. A metric that renders a plausible number without
being connected to anything is the failure worth guarding against, because it is
believed.

| Mutation | Failing case |
|---|---|
| The gate admits everyone | "tells an unauthorised caller nothing" |
| Dead letters counted from the wrong side of `processed_at` | "counts a dead letter that exists" |
| Label escaping removed | "escapes a label value" |
| The retention gauge ignores the sweeper's window | "sees work the worker has not done" |
| The filter and the collector get separate `Counters` | "keeps the collector and the counters the same object" |

The last mutation is the one that would have been hardest to notice in
production: two instances leave the endpoint reporting zero while the filter
counts, which reads exactly like "no timeouts happened".

The dead-letter case asserts a **difference** rather than a total, because other
suites share this database — the same correction `i11-outbox-dead-letter` needed
once already.

## Verification

`format:check`, `lint`, `boundaries`, `typecheck`, `openapi:generate` (no drift),
`test` (**825 passing, 89 files**), `security:audit` (0 vulnerabilities) and
`build` all pass. `db:validate`, `db:deploy` and `db:drift` remain CI-only.

## Story governance

No Story's behaviour, Acceptance Criteria or Delivery Status changed. All 50
Generated Stories remain `Done`.

## Known boundaries

- **Nothing alerts on any of this.** R1.4 — "somebody is alerted when the outbox
  backlog grows, when dead letters appear, or when readiness fails" — needs a
  monitoring system that does not exist yet, and metrics nobody is paged on are
  a dashboard.
- **Timeouts are counted for the API only.** The worker meets the same budgets
  through the same pool and nothing counts those; its failures surface as a
  stalled outbox, which the gauges do show.
- **Counters reset when the process restarts**, which is ordinary for a counter
  and is what `rate()` exists for — but it means an absolute total read from one
  scrape means very little.
- **No latency, no request volume, no error rate.** The Owner scoped round one
  to the questions the last three increments raised; §12.2's fuller list would
  mean instrumenting every route.
- Each scrape runs one database query with eight sub-selects. On a large table
  those are counts over indexed predicates, but nothing here has been measured
  against a large table — the same boundary I17 recorded, now also true of the
  thing that reports it.
