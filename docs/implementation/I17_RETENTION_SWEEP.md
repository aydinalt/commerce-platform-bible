# I17 Retention Sweep — Closure Record

- **Owner:** Architecture Owner
- **Status:** Draft — awaiting Owner acceptance
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-18
- **Scope:** Implementation record only. No Frozen Story is edited, no Acceptance
  Criterion changes, and no Delivery Status moves.

## What was missing

ADR-0012 §3 names five mandatory controls: "cookie security, CSRF defense,
rotation, expiry and session cleanup". Four existed. **Session cleanup did
not** — and neither did any other kind.

Six tables carry an `expires_at`. Five index it. Nothing had ever used that
index to delete a row. The pattern was consistent across the whole system:
every record is *filtered out* once it stops being usable and none is removed.

| Table | State that accumulated |
|---|---|
| `user_session` | Expired and revoked sessions, kept indefinitely |
| `pending_registration` | Abandoned signups, kept indefinitely |
| `password_reset` | Abandoned recoveries, kept indefinitely |
| `auth_throttle` | Every subject that never went on to succeed |
| `outbox_event` | Every delivered message, one row per registration and reset |
| `decision_flow`, `comparison_set` | Swept, but only by a request that used Decision |

## Why it matters more than table growth

Unbounded growth is the visible problem. The one that decided this increment's
priority is that **an abandoned `pending_registration` holds an email address
and a password hash for ever, for somebody who never became a User.**

`US-IDN-F02-001` AC-7 is explicit that a pending registration must not be
represented as an account state, which is why it is a separate record that
becomes a `UserAccount` only on proof. Keeping that record indefinitely makes it
one in practice.

## The Owner's decisions

No Frozen document states a retention policy, so both windows were put to the
Owner on 2026-08-18 rather than chosen here.

**Expired registrations and password resets are deleted at expiry, with no
grace.** These rows carry personal data for a person who is not a User, and the
reason to delete them is precisely that they should not linger. `audit_record`
is this repository's forensic store and already carries what happened.

**Processed outbox events are deleted after thirty days; dead letters are never
deleted.** A delivered message answers "did we send it, and when" — a question
with a short useful life. A dead letter is the record of a message that never
arrived, and that is evidence worth keeping.

`THROTTLE_RETENTION_MS` (one day) was not put to the Owner because it is not a
policy choice: `registerAttempt` already resets a row whose fifteen-minute
window has lapsed, so deleting one is exactly what the next attempt would do to
it. A day is far enough past the window that the sweep can forgive nobody.

## One condition, and no rule about dead letters

The outbox statement is `processed_at is not null and processed_at <= now() -
window`. Nothing in it mentions a dead letter.

It does not have to. A dead letter, in `OutboxProcessor`'s own design, is a row
that is **unprocessed** and has stopped being claimed — `attempts` at the
ceiling, `processed_at` still null. `processed_at is not null` therefore
excludes it by construction, along with every event still waiting and every one
still retrying. There is no second rule to keep in step with the first.

## The defect this exposed

Writing the sweep meant reading the Decision expiry statements, and they had a
real problem.

`decision_flow.comparison_set_id` is `ON DELETE CASCADE`, deliberately: the
`decision_context` migration says a flow pointing at a set that no longer exists
would outlive the thing it was about. But `COMPARISON_SET_TTL_MINUTES` and
`DECISION_FLOW_TTL_MINUTES` are both sixty minutes **from each record's own
creation**, and a flow is always built on a set that already exists.

So the flow always claimed to outlive its set. Compare for half an hour, enter
Decision, and the flow said sixty minutes while the cascade was going to end it
in thirty — **mid-decision, and taking with it the very context
`US-DEC-F02-001` says the flow is about.** Not a rare race: it is the ordinary
shape of every set-based flow.

`enterWithComparisonSet` now writes `least(now() + ttl, c.expires_at)`. That
makes the claim true rather than making the cascade wrong: the set keeps exactly
the sixty minutes it is given, and `DECISION_FLOW_TTL_MINUTES` becomes what it
always had to be for this kind of context — a ceiling, not a promise.

**The alternative, recorded because the Owner may prefer it.** Extending the
set's expiry when a flow is built on it would also have removed the
contradiction, and would give the person a full hour of Decision rather than
whatever the set had left. It was not done because no Story says a Comparison
Set lives longer for having been decided upon, and that change alters how long
Compare state is kept. The cap alters nothing about retention; it only stops a
record from promising time it never had.

## Where the shared statements live

Four callers sweep expired Decision state — three request paths and now the
worker. The two statements are exported from `@commerce/database` so they cannot
drift, which is also the only reason `apps/api` and `apps/worker` now depend on
that package.

## Where the sweep runs

The worker's existing loop, on a five-minute interval of its own. Not the
request path: a table-wide `delete` on a page load gets slower as the table
grows, which is the situation being fixed. Not a scheduler: the deployment has
none, and the worker already has a loop, a shutdown signal and a logger.

Sharing the loop rather than taking a timer means the sweep and the outbox never
run at once and a shutdown stops both at the same place. A failed sweep is
logged and the loop continues — nothing downstream waits on a deleted row, and a
worker that stopped delivering mail because a `delete` failed would trade a
large problem for a small one.

Counts are logged on every pass, including passes that removed nothing. A sweep
quietly deleting thousands of rows every cycle is a symptom, and it is only
visible against the cycles that removed none.

## The tests

`i17-retention.integration.test.ts` — eight cases, all against a real database.

They are as much about **what survives** as what goes, because a sweep that
deletes too much is a worse failure than no sweep at all. Every deletion is
paired with the neighbouring row that must not move: the live session, the
registration whose confirmation email the outbox still owes, the throttle row
still inside its counting window, the dead letter, the event still waiting.

Four mutations, each caught by exactly one case:

| Mutation | Failing case |
|---|---|
| Outbox condition keyed on age alone | "keeps every dead letter…" |
| Session sweep drops the revoked arm | "removes sessions that can no longer authenticate…" |
| Throttle window shortened past the counting window | "forgives nobody…" |
| The `least` cap removed from `enterWithComparisonSet` | "never lets a Decision flow outlive…" |

**Two of these cases were wrong first and are recorded as such rather than
quietly fixed.**

The dead-letter case originally seeded its dead letter with a fresh
`occurred_at`, so an age-only condition spared it by accident and the mutation
passed. A real dead letter is old by nature — it stopped being retried and then
sat there. Aged, `processed_at is not null` is the only thing keeping it.

The flow-expiry case originally wrote `least(...)` in the test itself, which
proved only that the same statement could be typed twice. It now drives
`PgDecisionRepository.enterWithComparisonSet` and asserts the property — a flow
never outlives its context — rather than a duration.

## Verification

`format:check`, `lint`, `boundaries`, `typecheck`, `openapi:generate` (no
drift), `test` (**808 passing, 86 files**), `security:audit` (0 vulnerabilities)
and `build` all pass. `db:validate`, `db:deploy` and `db:drift` cannot run
locally — the Prisma engine host answers 403 — and are proven in target CI only.

## Story governance

No Story's behaviour, Acceptance Criteria or Delivery Status changed. All 50
Generated Stories remain `Done`. This increment implements a control ADR-0012
already required and repairs a contradiction between two TTLs.

## Known boundaries

- The sweep has never run against a table with a real backlog. Every one of
  these `delete` statements is index-supported, and none has been measured
  against anything but a test database.
- `auth_throttle.blocked_until` is declared in the datamodel and never written:
  blocking is derived from `attempts` inside the window. The sweep's condition
  does not consult it, which is correct today and would be wrong the moment
  somebody starts writing it.
- The Decision state on the request path is still swept there as well. That was
  left alone: it is what makes an expired flow unreadable *within the request
  that would have read it*, which the worker's five-minute cadence cannot
  promise.
- Nothing sweeps `audit_record`, `discovery_start`, `compare_start` or the other
  occurrence tables, deliberately. They are the platform's evidence and Basic
  Analytics reads them; a retention policy for evidence is a different decision
  from a retention policy for expired state, and it has not been asked.
