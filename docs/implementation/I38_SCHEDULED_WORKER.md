<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-26
-->

# I38 — The worker as scheduled invocations

**Until this increment, no email was ever sent on the platform the Owner chose.**

The worker is a `while (running)` loop with a two-second sleep. Vercel runs
functions; there is nowhere to loop. So registration confirmations would have
sat unread in the outbox, nobody could have completed a sign-up, and the
deployment would have looked entirely healthy — the failure nobody notices,
which is the kind this repository keeps finding.

I37's closure record named it as the largest remaining gap. This closes it.

## One draining path, two shapes

`main.ts` stays a loop. The same arrangement I37 made for the API, for the same
reason: **a staged hosting decision is only reversible while both shapes exist.**

- `drain.ts` — the draining, separated from what drives it.
- `main.ts` — calls it in a loop, and is what the Dockerfile starts.
- `handler.ts` — calls it once, invoked by a scheduler.

`buildDispatcher` was lifted out of `main.ts` into `dispatcher.ts`, unchanged.
**A second copy of "does this deployment send real mail" is the duplicate that
matters most**: two copies could disagree, and the disagreement would be one
deployment silently writing every registration to a log while reporting success.

## A deadline rather than "until empty"

A function is killed when it exceeds its duration — mid-statement, without
warning. `processBatch` marks what it delivered before returning, so a kill
*between* batches loses nothing. A kill *inside* a batch is a delivery whose
outcome nobody recorded, and the outbox's retry then sends it again.

So the drain stops **before a batch it could not finish**, not when the time is
gone. `reserveMs` is what one batch is assumed to cost, and it is deliberately
generous: over-reserving costs one fewer batch this minute, and under-reserving
costs a duplicate delivery.

`CRON_BUDGET_MS` is read from the environment because the limit is a property of
the plan rather than of the code — a number compiled in would be wrong on most
deployments.

`drained: false` in the response is not a failure. It is the number an operator
needs: **an outbox that never reports `true` is one the schedule cannot keep up
with**, and that is invisible if a partial drain answers the same as a complete
one.

## Two endpoints, because the cadence had to move into the schedule

In the loop, the sweep is gated by a five-minute timer and the outbox polls
every two seconds. A function has no memory between invocations, so `sweptAt` is
always zero in a fresh process and one shared endpoint would sweep on every
outbox tick — a table-wide `delete` scan every minute.

| Endpoint | Schedule | Job |
|---|---|---|
| `/api/outbox` | `* * * * *` | deliver what is queued |
| `/api/sweep` | `*/5 * * * *` | delete what the platform has finished with |

## Who may invoke it

Vercel sends `Authorization: Bearer ${CRON_SECRET}`. The secret is compared at
full length — `timingSafeEqual` throws on a length mismatch, so lengths are
checked first, and without that the endpoint would answer `500` to a short token
and `404` to a wrong one, which is an oracle for the secret's length.

**An unset or empty `CRON_SECRET` never matches.** A deployment that forgot one
gets an endpoint nobody can reach rather than one everybody can — and this
endpoint sends real email and deletes real rows, so an open one is a way to
exhaust a mail quota from outside.

**Unauthorised gets 404, not 401**, matching what I19 decided for `/metrics`:
`401` confirms there is something here to be authorised against.

## A second finding: I34's detector was half-blind

Adding `CRON_SECRET` to `.env.example` failed `i34-deployment`, which reported
it as a variable nothing reads.

**I34's detector matched `process.env.NAME` and nothing else.** Bracket access —
`process.env["CRON_SECRET"]` — was invisible to it, and
`noPropertyAccessFromIndexSignature` makes the bracket form the correct one for
anything not on a known interface, so this was going to happen.

It failed in the harmless direction here. **The same blindness in the other
direction is the failure that test exists to prevent**: a variable read only
through a bracket would have been invisible, and `.env.example` could have gone
on not mentioning it — which is exactly the boot failure I34 was written about.
Four bracket-notation reads already existed.

The detector now matches both notations, and was checked against a
deliberately-undocumented bracket read.

## What was proven

`tests/i38-scheduled-worker.test.ts`, fifteen cases. Five drive the handler over
a real socket.

| Mutation | Result |
|---|---|
| An empty `CRON_SECRET` matches | 1 failed |
| Unauthorised gets 401 instead of 404 | 4 failed |
| The length check is dropped before `timingSafeEqual` | 3 failed |
| The budget is ignored — drain until empty | 3 failed |
| A partial drain reports `drained: true` | 3 failed |
| The sweep shares the outbox schedule | 1 failed |
| The loop is removed from `main.ts` | 1 failed |
| The scheduled entry builds its own dispatcher | 1 failed |

## Verification

Format, lint, module boundaries, type check, **105 test files / 988 tests**, no
OpenAPI drift, 0 vulnerabilities, production build, **13/13 smoke checks**, and
both scheduled entries resolving through the compiled output to functions.

## Known boundaries

- **Nothing has been scheduled.** No Vercel project exists, no cron has fired,
  and `CRON_SECRET` has never been sent by anything but a test.
- **Vercel's Hobby plan runs a cron once per day.** `vercel.json` asks for every
  minute, which Pro honours and Hobby silently reduces — and a registration
  confirmation arriving up to 24 hours later is not a working sign-up. **The
  worker needs the Pro plan or a process host**, and that is a spend decision
  rather than a code one.
- **Delivery latency goes from ~2 seconds to the cron cadence**, up to 60
  seconds on Pro. That is the price of the shape and it is not recoverable
  within it.
- **Nothing watches `drained: false`.** The signal that the schedule is not
  keeping up is returned and read by nobody; there is still no alerting.
- **`reserveMs` is a guess.** Twelve seconds per batch was chosen as a
  worst-case, not measured — no batch has been timed against a real vendor.
- **The 500 path is untested against a real failure.** A failing invocation
  answers 500 with an empty body; that branch is covered by reading the code
  rather than by making the database fail underneath it.
