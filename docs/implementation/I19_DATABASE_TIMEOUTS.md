# I19 Database Timeouts — Closure Record

- **Owner:** Architecture Owner
- **Status:** Draft — awaiting Owner acceptance
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-18
- **Scope:** Implementation record only. No Frozen Story is edited, no Acceptance
  Criterion changes, and no Delivery Status moves.

## What was missing

The Engineering Constitution §13 requires every production component to define
behaviour for **timeout**, retry, partial failure and cancellation. The outbox
has retry with bounded attempts and backoff (I11); the email and assistant
vendors have request timeouts (I11–I13). The database dependency had **none**.

A query that hung held its connection until PostgreSQL or TCP gave up. Nothing
in the codebase set `statement_timeout`, `idle_in_transaction_session_timeout`
or `connectionTimeoutMillis`.

**I18 made that sharper in the act of fixing something else.** With fifteen
pools, ten hung queries starved one repository. With one shared pool, ten hung
queries are the whole process. I18's own closure recorded the gap: *"Nothing
bounds how long one request may hold a connection."* This closes it.

## The Owner's decisions

| Setting | Value | Why |
|---|---|---|
| `statement_timeout` | **5s** | No legitimate V1 query should come near it: Discovery is indexed, a Comparison Set holds at most five members, Analytics is bounded by period. Long enough to mean "this has gone wrong", short enough not to keep a person waiting on one that has |
| `connectionTimeoutMillis` | **2s** | `pg` defaults to *wait for ever*. On a saturated pool that is a request hanging silently until the client gives up — the failure that looks like an outage and names nothing |
| `idle_in_transaction_session_timeout` | 10s | Not put to the Owner: a statement timeout does not cover `begin` followed by nothing, which is not a running statement. An idle transaction is a bug rather than a slow query, so this bounds the damage rather than catching it early |

All three are configurable, because the right numbers belong to a deployment
that has been watched. All three are set on the **connection** rather than per
query, so a statement cannot escape them by being written somewhere nobody
thought to look.

## A timeout is not a defect

A cancelled statement previously became `500 INTERNAL_ERROR`, which tells a
client the opposite of the truth: that this is a defect and retrying is
pointless.

`ErrorEnvelopeFilter` now recognises two shapes — SQLSTATE `57014`
(`query_canceled`, what `statement_timeout` raises) and the pool's own
acquisition timeout — and answers `503 DEPENDENCY_UNAVAILABLE`. That code is
**already published for `503`**, so this adds nothing to the contract and the
OpenAPI document is unchanged.

It logs at `warn` rather than `error`: a timeout is the system doing what it was
told, and burying it among unhandled failures would hide the signal that says a
query has gone wrong.

The acquisition timeout is matched by message, which is unpleasant. It is one
named function for exactly that reason — when `pg` changes the wording, one
place is wrong rather than several.

## The defect this would have introduced

**Adding `idle_in_transaction_session_timeout` without an error listener would
have made the API crash on the exact condition the timeout exists to survive.**

A dead connection emits `error`, and an `EventEmitter` with no `error` listener
throws by Node's rule. `createDatabasePool` therefore requires a handler — not
optional and not defaulted, because a default would be a silent swallow and a
connection dying unexpectedly is precisely what an operator needs told.

**The first attempt attached only `pool.on("error")`, and that was not enough.**
`pg` has two cases: a connection sitting idle *in* the pool reports on the pool;
one currently checked out reports on the client, and the pool never sees it. The
idle-transaction test caught it — that test holds its client while the server
kills the session — and the process still came down. Every client now gets the
same handler as it is created.

That is the second time in three increments that writing the test found
something the implementation had assumed. Recorded rather than smoothed over.

## The tests

`i19-database-timeouts.integration.test.ts` — six cases, driving **real hangs
against a real database**. A timeout that is configured and does not fire is
worse than none, because it is believed. Asserting that a number was passed
somewhere would prove only that.

The budgets are shortened to 400ms for the run, so a case that fails to time out
fails fast rather than holding the suite for five seconds; the shipped defaults
are asserted separately.

| Mutation | Failing case |
|---|---|
| `statement_timeout` removed | "cancels a statement that runs past its budget" |
| `idle_in_transaction_session_timeout` removed | "ends a transaction left open and holding its locks" |
| `connectionTimeoutMillis` removed | "refuses rather than hanging when no connection is free" |
| The filter calls every failure a dependency timeout | "still calls an ordinary failure a defect" |
| The filter never recognises a timeout | "answers a timeout as the published dependency failure" |

The last two are a pair on purpose. A filter that answered `503` for everything
would satisfy the timeout case while hiding every real defect behind it, so the
opposite case is what keeps the first honest.

## Verification

`format:check`, `lint`, `boundaries`, `typecheck`, `openapi:generate` (no
drift), `test` (**817 passing, 88 files**), `security:audit` (0 vulnerabilities)
and `build` all pass. `db:validate`, `db:deploy` and `db:drift` remain CI-only.

## Story governance

No Story's behaviour, Acceptance Criteria or Delivery Status changed. All 50
Generated Stories remain `Done`. This increment supplies a definition the
Engineering Constitution already required.

## Known boundaries

- Five seconds is a judgement, not a measurement. It was chosen against what V1
  queries are *supposed* to do; nothing here has been run against a database
  with production volume.
- A timeout now ends the request, and there is **no retry**. §13 lists retry
  alongside timeout, and for a read that would often be right — but a retry
  policy for the database has not been designed, and adding one without deciding
  which operations are safe to repeat would be worse than none.
- The acquisition timeout is recognised by matching `pg`'s message text. It has
  no error code to match instead.
- The worker inherits all three settings through the same factory, but its
  behaviour on timeout is the outbox's existing retry rather than anything this
  increment defined.
