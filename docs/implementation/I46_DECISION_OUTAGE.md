<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-27
-->

# I46 — The last two modules that reported an outage as an answer

I24 taught thirteen routes UX-0006 §14's *distinguish zero from unavailable*.
I45 found `identity/api.ts` outside that rule and, in closing it, measured which
modules were still outside — **asserting the set** so that repairing it would
fail a case and have to be acknowledged rather than quietly forgotten.

This is that acknowledgement. Both names are deleted from I45's list, which is
the forcing function working as designed rather than a check loosened to pass.

## These two lie harder, because they tell the person to throw work away

| Route | What a `503` said | What was true |
|---|---|---|
| `/decision` | *Bu karar akışının süresi doldu* | the flow is fine; it could not be read |
| `/compare` | *Karşılaştırma oturumunuz sona erdi* | the set is fine; it could not be read |

Everywhere else the false claim costs a reload. Here it costs a Decision in
progress and a Comparison Set built one Offering at a time — because both
screens follow the claim with an invitation to start again, and a person who
takes it loses what they had.

`/compare` had a comment reasoning about exactly two states, *not openable* and
*gone*, told apart by whether anything was left to describe. **A third state
broke that**: during an outage there is nothing left to describe either.

## The rule is derived from the method

A read is a `GET`, and that is the whole rule. I25 split reads from writes and
I24 split an outage from an absence, and both distinctions land on the same
line: the `GET`s report what is, and everything else changes something.

A hand-kept list of read function names would have been a fifth place to forget
one — which is how these two modules came to be outside **both** rules at once.
Five reads now raise on `5xx` and sit on I25's ten-second ceiling; eight writes
stay untimed, because aborting a write does not undo it.

## The writes were already honest, and are left alone

The obvious symmetry says reads raise, so writes should too. **Measured rather
than assumed**, their fallback copy claims nothing a `5xx` would make untrue:

> İşlem tamamlanamadı. Hiçbir şey başlatılmadı ve hiçbir bilgi paylaşılmadı.

That is as true of an outage as of a refusal, because the API refuses inside the
transaction that would have recorded a Completion. Changing it would have been
motion rather than repair — and worse, it would have taken a refusal a person is
entitled to see and hidden it behind an outage screen. A case now asserts the
sentence, so a later increment does not "fix" what is already right.

## Three readings of the same probe, two of them wrong

The socket probe that opened I45 pointed the web application at a closed port
and drove every route. Read naively it said three different things, and only the
third was true.

1. **Thirteen routes redirect to `/login`** — not the finding. The probe sent no
   cookie, so that is the correct answer for an anonymous visitor.
2. **`/decision` and `/compare` say you have nothing** — not the finding either.
   That copy is reached when the *cookie* is absent, which is also true.
3. **With the cookie present**, the same routes say the flow expired and the set
   ended. That is the finding, and it took reading the code to reach.

Twice the obvious reading would have sent an increment at correct behaviour.

## What was proven

`tests/i46-decision-outage.integration.test.ts`, seven cases.

| Mutation | Result |
|---|---|
| The flow read collapses a `5xx` back into "expired" | 2 failed |
| The comparison read collapses a `5xx` back into "ended" | 2 failed |
| A write is put on the read budget too | 1 failed |
| The Decision page draws itself from three of four reads | 1 failed |
| An expiry that really happened is reported as an outage | 4 failed |

The last is the overshoot, and it matters as much as the first two: a flow is
current-flow state and is *allowed* to disappear, so §16 requires the page to
say so. Reporting every failure as an outage would leave somebody waiting for
one to end that had never begun.

## Verification

Run from a clean tree with every `dist` and `tsbuildinfo` deleted, in `verify`'s
own order: no OpenAPI drift, format, type check, lint, module boundaries,
**113 test files / 1042 tests**, 0 vulnerabilities, production build, 14/14
smoke checks.

**The suite was run in four parts, and the reason is worth recording.** The
sandbox's `/tmp` was destroyed mid-run and PostgreSQL went with it, which
surfaced as twenty-odd identity integration failures — `connect ENOENT
/tmp/.s.PGSQL.5433` wearing the costume of a regression in the module this
increment touches. The database was rebuilt from the 31 migrations and the
suite re-run in four parts within the sandbox's own time limit, in file order,
against one database and without resetting between parts, which is what a single
run does.

## Known boundaries

- **The status code is still `200`**, as it is for `/account` and Home. A
  monitor, a crawler and a cache read the unavailable surface as healthy, and
  Next's App Router gives a page no way to set a status short of `notFound()` or
  throwing. Unchanged since I45 named it, and still a design decision rather
  than an edit.
- **The Decision page is all-or-nothing.** All four reads are wrapped together,
  so an outage affecting only the Chat takes the whole page to the unavailable
  surface. That is deliberate — a page drawn from three of four would be the
  dashboard-of-zeroes §14 forbids — but it is coarser than the API is.
- **`/offerings/{slug}` still answers `500` with an empty shell** when the API
  is unreachable, measured in I45's probe and still not diagnosed.
- **No test drives these two routes over a socket.** The cases render through
  `renderToStaticMarkup`, which I35 proved cannot see a status code.
- **Nothing was measured about how often this happens.** The repair is about
  what is said when the API does not answer, not about making it answer.
