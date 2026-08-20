<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-19
-->

# I24 — Distinguishing zero from unavailable

## The rule, and the defect

UX-0006 §14, Frozen:

> **no analytics data: distinguish zero from unavailable**

Five words naming a rule about honesty, not about analytics. The two
authenticated api layers broke it on every read:

```ts
if (!response.ok) return null;
```

Thirteen occurrences — six in `business/api.ts`, seven in `platform/api.ts` —
each collapsing two unrelated facts into one value. *This is not here or not
yours* is a fact about the world. *The API did not answer* is a fact about this
request. Thirteen pages then turned `null` into `notFound()`.

## What the platform said during an outage

| Who | What they were told | What was true |
|---|---|---|
| A Business owner on their own Dashboard | this Business does not exist | the database was down |
| An Admin on any of seven Admin routes | the Admin panel does not exist | the database was down |
| An owner with a correction notice waiting | *(the notices region rendered nothing)* | a notice was waiting |
| An owner permitted to create an Offering | *(the control vanished)* | the permission was unchanged |

`404` is not a neutral answer here. It is the deliberate answer the API gives
somebody with **no standing to learn a thing exists** — which is exactly why it
must not also be given to somebody who owns it and is looking at an outage.

The third row is the one worth dwelling on. The code carried this comment:

> *"Rendered only where the notices could actually be read: an empty list would
> say 'nothing needs your attention', which is not what a failed read means."*

…and then rendered **nothing at all**, which says the same thing to the person
looking at the screen. The distinction existed in the code and not in the
output. A person with a correction notice waiting is the one who can least
afford to be told there is none.

## What was built

### `absentUnlessUnavailable`

One function replacing all thirteen call sites. `5xx` throws; everything else
returns `null`.

**`4xx` still means absent, deliberately.** `401`, `403` and `404` are how the
API refuses without confirming existence, and that answer is load-bearing —
turning it into "unavailable" would leak that there is something there to be
unavailable.

### `orUnavailable` and `isUnavailable`

A symbol, not another `null`, an empty object or a string. The entire defect was
two facts sharing one value; a value that cannot be produced by accident and
cannot be confused with anything the API returns is the point.

Defects still propagate, for the reason I23 established: a page that caught
everything would answer "temporarily unavailable" to its own bugs.

**Not an `error.tsx`.** A boundary would be far less repetitive across thirteen
call sites, and cannot be used: in production Next sanitises the error it hands
the boundary down to a `digest`, so it cannot tell an outage from a defect.

### Partial failure does not blank the page

UX-0006 §15's last line: *"analytics failure does not block unrelated moderation
actions where their data is available."*

So only the **primary** read gates a page. On the Business Dashboard the
Dashboard read gates; the notices and the assignable Categories degrade in
place, each saying what could not be read. On the Admin routes the panel read
gates and analytics degrades in place — where the existing "could not be loaded"
messages were already honest, and only needed to keep being reachable now that a
`5xx` throws instead of returning `null`.

## What was proven

`tests/i24-zero-or-unavailable.integration.test.ts`, seven cases rendering the
real pages with `next/headers`, `next/navigation` and the api layers mocked.

The second case is the one that keeps the fix honest in both directions: a
Business that genuinely is not the caller's **still answers `notFound()`**.
Separating the two facts is worthless if the separation only runs one way.

### Mutations

| Mutation | Result |
|---|---|
| `5xx` collapses back into absent | 1 of 7 failed |
| Check absent before unavailable | **0 of 7 failed — see below** |
| Notices go back to rendering nothing | 1 of 7 failed |
| The create control vanishes again | 1 of 7 failed |
| The Admin gate goes back to `notFound()` only | 1 of 7 failed |
| `orUnavailable` returns `null` instead of the symbol | 4 of 7 failed |

### A comment that was wrong, and the mutation that found it

Three files said *"unavailable is checked before absent, and the order is the
requirement"*. **It is not.** The two checks are mutually exclusive — an
unavailable read is a symbol and `null` is `null` — so swapping them changes
nothing, and the mutation passed.

What makes the fix correct is that the two facts stopped sharing a value, which
is what the sixth mutation demonstrates by putting them back together. The
comments are corrected in all three places rather than quietly deleted, because
a closure record that only lists the mutations that failed is describing a
different exercise from the one that was run.

## Verification

Format, lint, module boundaries, type check, **93 test files / 852 tests**, no
OpenAPI drift, 0 vulnerabilities, production build.

## Known boundaries

- **Actions were not touched, only reads.** UX-0005 §15's "a failed save
  preserves the last confirmed information" and "a failed Offering action does
  not claim a lifecycle transition" concern the mutation paths, which already
  carry `status` through their refusal shapes and were not re-examined here.
- **UX-0003 §16, UX-0004 §14, UX-0008 §14 and UX-0009 §18 remain queued** — four
  of the six documents I23 named, now two fewer.
- **Empty and Loading Behaviour is still separate**, at the Owner's direction.
  There are still 0 `loading.tsx` files.
- **Nothing distinguishes a slow API from an unavailable one.** There is no
  `fetch` timeout anywhere in the web application — 27 call sites, 0 with a
  signal — so a hanging API hangs the page and reaches none of these surfaces.
  Unchanged from I23, and now the largest remaining hole in the honesty of all
  of this.
