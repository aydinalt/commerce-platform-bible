<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-19
-->

# I25 — The web application's request budget

## The last untimed edge

Engineering Constitution §13 requires every production component to define
behaviour for timeout. Every outbound edge in this repository had one except the
edge a person actually waits on:

| Edge | Budget | Since |
|---|---|---|
| Worker → Postmark | 10s | I16 |
| API → Chat provider | 8s | I5 |
| API → PostgreSQL | 5s statement, 2s connection, 10s idle transaction | I19 |
| **Web → API** | **none, across 27 call sites, 0 with a signal** | — |

Node's `fetch` has no default timeout, so a hung API hung the page until the
socket or the browser gave up.

**That made the two preceding increments hollow in their most likely case.** I23
and I24 built bounded surfaces for a failed read — and those surfaces are
rendered *by finishing the render*. A request that never returns never reaches
one. Both closure records named this as the largest remaining hole; this closes
it.

## The number

**Ten seconds, chosen by the Owner on 2026-08-19**, and it is a floor derived
from the budgets underneath rather than a round number.

The API already bounds its own worst honest answer: eight seconds for the Chat
provider, five for a statement, two to acquire a connection. A shorter budget
here would abort a request the API was about to answer **correctly** — replacing
a precise `503 DEPENDENCY_UNAVAILABLE` with a vague "could not load", and timing
out a healthy Decision Chat answer at eight seconds.

So the constraint runs upward: this budget must exceed every budget below it.
`API_TIMEOUT_MS` exists because the right number is a property of a deployment,
and a malformed setting takes the default rather than the process — `Number("")`
is `0`, and a zero-millisecond budget aborts every request before it is sent.

## What a timeout means

`fetchWithBudget` raises `ApiRequestError` with **`504`**, which
`isApiUnavailable` already treats as unavailable. A hang therefore lands on
exactly the surfaces I23 and I24 built, with no new branch anywhere.

That is the honest mapping rather than a convenience. To the person, and to the
retry they are about to make, "the API did not answer in time" and "the API is
not there" are one situation.

**A network failure is left alone.** `ECONNREFUSED` and DNS failures arrive as
`TypeError` and propagate untouched, because they are not this request being too
slow. Relabelling them would be the same overreach I22 refused when it kept
constraint violations answering `500`.

**The timer is cleared in a `finally`.** An un-cleared ten-second timer per
request keeps the event loop alive; on a server rendering thousands of requests
that is a slow leak, invisible until it is not.

## Sixteen reads, and none of the eight writes

The budget is applied to every read and to no write, deliberately.

Aborting a write does not undo it. The API may have created the Offering, saved
the information or closed the case a moment after this side stopped listening —
so reporting a timeout as a *failure* would claim an outcome this application
does not know. UX-0005 §15's "a failed Offering action does not claim a
lifecycle transition" cuts both ways: claiming the transition did **not** happen
is the same kind of invention.

Saying so honestly needs a third answer for writes — *this may or may not have
happened* — and, for the ones that are not naturally idempotent, a way to retry
safely. Neither is designed. A timeout added before them would trade an
unbounded wait for a confident wrong answer, which is the worse of the two.

## What was proven

`tests/i25-request-budget.integration.test.ts`, eight cases. The central one
drives a `fetch` that resolves **only when its signal aborts** — which is what a
hung API is from this side: connection open, request accepted, nothing ever
coming back. A rejected promise would have proven nothing, because that path
already worked.

### Mutations

| Mutation | Result |
|---|---|
| No signal at all (the pre-I25 state) | 2 of 8 failed |
| The timer is never cleared | 1 of 8 failed |
| A network failure is relabelled as a timeout | 1 of 8 failed |
| A malformed budget takes the process | 1 of 8 failed |
| A write is budgeted too | 1 of 8 failed |
| The budget drops below the Chat provider's | 1 of 8 failed |

### A trap that caught me twice

The first version of the central case asserted `rejects.toBeInstanceOf(
ApiRequestError)` using this file's top-level import. `vi.resetModules()` gives
each case a fresh registry, so that class object is not the one
`fetchWithBudget` throws, and `instanceof` is false between them.

**I23 hit this exact trap and recorded it.** Recording it did not prevent the
recurrence. The fix is structural rather than mnemonic: the class is taken from
the same `await import` as the function under test, so the two cannot drift.

## Verification

Format, lint, module boundaries, type check, **94 test files / 860 tests**, no
OpenAPI drift, 0 vulnerabilities, production build.

## Known boundaries

- **Writes are unbudgeted**, and the reason is a missing design rather than an
  oversight: an honest timed-out write needs a third answer and a retry-safety
  story, neither of which exists.
- **The number is a judgement, not a measurement** — the third such number in
  this repository, after `DATABASE_POOL_MAX` and `statement_timeout`. It is
  derived from budgets that are themselves judgements. R3.4 of the release
  criteria asks for all of them to be measured under load.
- **Nothing counts timeouts.** The API publishes `commerce_db_timeouts_total`;
  the web application publishes no metrics at all, so a deployment cannot see
  whether ten seconds is right. That is a larger gap than this increment —
  §12.2 applies to the web application too, and it has never been read against
  it.
- **UX-0003 §16, UX-0004 §14, UX-0008 §14 and UX-0009 §18 remain queued**,
  unchanged by this increment.
