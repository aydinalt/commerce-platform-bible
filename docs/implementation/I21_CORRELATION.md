<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-19
-->

# I21 — Correlation

## What the Constitution required and the repository did not have

Engineering Constitution §12.3:

> Distributed or asynchronous flows shall support correlation across boundaries
> through an appropriate identifier.

The identifier existed. It is in every error envelope a person can quote, and in
every `audit_record`. What it did not do was cross either boundary that an
incident actually starts from.

| Where a person looks | Before I21 |
|---|---|
| Error envelope | The correlation identifier |
| `audit_record.correlation_id` | The correlation identifier |
| Fastify's automatic request and response log lines | `req-1`, `req-2`, … — its own counter |
| `outbox_event` | Nothing |

Two identifiers for one request, related by nothing. Given a correlation id from
a person's error message you could find the failure and not the route, the status
or the duration. Given a slow request in the log you could not find what it did.
And `req-1` is a per-process counter, so it is a different request on every
replica — an identifier that collides by construction is worse than none, because
it looks like one.

The outbox gap is the sharper of the two. "The confirmation email never arrived"
is the most common report this platform will receive, and there was no way to
join it to the request that asked for the email.

## What was built

### One identifier, computed once, at ingress

`apps/api/src/http/correlation.ts` is its single owner. `correlationIdFrom` reads
`x-correlation-id` and mints a UUID when the caller sent nothing usable.

The change that closes the log gap is one line of configuration:

```ts
new FastifyAdapter({ genReqId: correlationIdFrom, … })
```

Fastify calls it once per request, before any route runs, and puts the result in
`request.id` — which is what it stamps as `reqId` on every automatic line.
**Nothing gained a field. One field stopped existing.** The application's
identifier and the framework's identifier are now the same value, so the
automatic request line and the application's own lines join without anybody
writing a join.

Everything downstream reads `request.id` rather than recomputing, which is why
`correlationIdFrom` is exported for the adapter and `correlationId(request)` for
everyone else.

### A malformed identifier is replaced, not trusted

The identifier reaches a `uuid` column. `correlationIdFrom` validates against a
UUID pattern and mints a fresh one otherwise — the same property M11 established
for the principal: a value that reaches a typed column is refused at the edge,
so a request that should be answerable never becomes a `500` inside the driver.

### The caller can learn the identifier of a request that succeeded

An `onSend` hook echoes `x-correlation-id` on every response.

This was not planned. It surfaced while writing the test: Fastify does not echo
its request id, and the envelope only exists on failures — so a caller who wanted
to report *"this request was slow"* had no identifier to quote. The gap was real
and one hook wide.

### The asynchronous boundary

`outbox_event` gained a nullable `correlation_id UUID` with an index
(`20260819000100_outbox_correlation`). `recordPendingRegistration` and
`recordPasswordReset` write the request's identifier into it; the worker's claim
statement selects it back and stamps it on `outbox_delivered` and
`outbox_delivery_failed`.

**Nullable rather than required.** Rows written before this migration have no
identifier and inventing one would be a lie; a row written by a future producer
that has no request behind it — a scheduled job — has none either. A column that
is `null` when nothing is known is honest; a column defaulting to a fresh UUID
would give every such row a unique identifier that joins to nothing while looking
exactly like one that joins.

**Indexed**, because the only reason the column exists is to be searched by.

## Decisions worth recording

**Fastify's request id was made to *be* the correlation identifier, rather than
adding the correlation identifier to Fastify's log lines.** Both would produce
lines carrying the right value. The second leaves two identifiers in existence
and a permanent opportunity for them to diverge; the first removes one. This is
Single Information Owner applied to a value rather than to a document.

**The identifier is not passed as a function argument through the layers.** It
lives on the request, which every layer already has, and on the outbox row, which
the worker already reads. Threading it through signatures would have touched
every service for a value only two places consume.

**The worker logs it as `correlationId`, matching the envelope's field name.**
Two spellings of one concept is the same defect this increment exists to fix.

## What was proven

`tests/i21-correlation.integration.test.ts`, four cases, each following one
identifier across a boundary rather than asserting that a column exists:

1. **Request → outbox row → worker delivery line.** A registration is posted with
   an identifier; the queued `outbox_event` carries it; the processor runs; the
   `outbox_delivered` line carries it.
2. **Fastify's own request line carries it.** Asserted two ways, because either
   alone is weak: the echoed `x-correlation-id` header shows what `request.id`
   holds, and a captured log line shows `reqId` holding the same value. This case
   needed a second application built with a readable logger destination — the
   suite's own app logs at `fatal` and request lines are `info`.
3. **A malformed identifier is minted afresh**, driven with `'; drop table x; --`.
4. **The envelope and the response header agree**, which is the join a person
   actually performs.

### Mutations

| Mutation | Result |
|---|---|
| Remove `genReqId` — Fastify keeps its own counter | 2 of 4 failed |
| Write `null` instead of the identifier into `outbox_event` | 1 of 4 failed |
| Trust the caller's header without validating it | 1 of 4 failed |

## Verification

Format, lint, module boundaries, type check, **90 test files / 829 tests**,
dependency audit, build. `db:validate`, `db:deploy` and `db:drift` cannot run in
the local environment and are proven in target CI only — including this
increment's migration.

## Known boundaries

- **The web application does not send an identifier.** It is minted at the API
  edge for browser traffic, which means a browser-side failure that never reached
  the API has none. Sending one from the client would extend the chain by one hop
  and was not in this increment.
- **Only the two identity producers stamp the outbox.** They are the only ones
  that currently write to it. A future producer must pass its own identifier or
  the column stays `null` — and nothing enforces that, because a `not null`
  constraint would be wrong for producers with no request behind them.
- **Nothing correlates across the API and the worker in a log aggregator**,
  because there is no log aggregator. The identifier is now present on both
  sides; joining them is a deployment capability that does not exist. Same
  boundary R1.2 and R1.4 report.
- **`audit_record.correlation_id` was already correct** and is unchanged. It now
  agrees with the request line by construction rather than by coincidence.
