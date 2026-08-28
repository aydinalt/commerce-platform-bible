<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-27
-->

# I45 — The two identity reads I24 did not reach

I24 taught thirteen routes to tell an outage from an absence, in UX-0006 §14's
five words: **"distinguish zero from unavailable"**. Fourteen readers in
`business/api.ts` and `platform/api.ts` were given `absentUnlessUnavailable`,
which raises on `5xx` and leaves `4xx` meaning absent.

**`identity/api.ts` was not among them.**

| Read | What a `503` became | What that says on screen |
|---|---|---|
| `readSession` | `null` | *you are signed out* |
| `readOwnedBusinesses` | `{ businesses: [] }` | *you own no Businesses* |

So the rule was applied everywhere except the one module whose false answer is
about the **person** rather than about the catalogue. During a database outage
`/account` told somebody holding a perfectly valid token that they were signed
out, and sent them to a sign-in form that calls the same API and would have
failed too.

The second is quieter and worse. Most people own no Business, so **zero is the
ordinary answer** — an outage wearing it looked exactly like the truth, and an
owner of three saw none of them with UX-0008 §8.1's explicit entries silently
absent and nothing on the page saying anything had gone wrong.

`4xx` still means no session, and deliberately: a `401` is a spent token or a
suspended account, and UX-0008 §7 sends that person to sign in. That was never
the defect.

## The module I25 did not reach either

`identity/api.ts` called `fetch` directly. I25 gave twenty-seven read call sites
a ten-second ceiling because Node's `fetch` has none, and these two reads were
not among them — so a hung API held `/account` open with no bound at all, which
is precisely the failure I25 was written to stop.

Both reads are now on the budget. **The eight writes that share the same `call`
are deliberately still off it**, which is I25's decision rather than an
oversight: aborting a write does not undo it, so reporting a timeout as a
failure would claim an outcome this application does not know.

## How the scope was found, and twice corrected

The first probe drove all twenty-two routes over a real socket with the API
pointed at a closed port. Thirteen answered `307` to `/login`, which looked like
the finding.

**It was not, and the probe could not tell.** The probe sent no cookie, so a
redirect to sign in was the correct answer for an anonymous visitor. Reading the
code showed twenty-one of the twenty-two sites redirect only on
`session === undefined` — no cookie at all — and I24's `ServiceUnavailable`
handles the outage. **One site was different**, and only one.

Then the scope corrected the other way. Counting the readers found fourteen
using the shared vocabulary and two not — and a third module was measured rather
than assumed:

| Module | Reads the API | Imports the vocabulary |
|---|---|---|
| `business/api.ts` | yes | yes |
| `platform/api.ts` | yes | yes |
| `identity/api.ts` | yes | **now** |
| `decision/flow.ts` | yes | **no** |
| `decision/comparison.ts` | yes | **no** |

Driven with a `503`, **all fifteen exported Decision functions answered with a
confident nothing** — `readDecision` says there is no Decision in progress,
`currentComparison` says the Comparison is empty, `readCompletions` says nothing
was completed, and the writes return a refusal with an empty reason.

That is the same defect over a wider surface, and it includes writes, where a
failed call must not claim an outcome in either direction. It is left as its own
increment rather than half-done here — and the exact set is **asserted by a
case**, so repairing it fails that case and somebody has to delete a name and
say so, instead of the finding quietly ageing out of a document.

## The check that matched the wrong thing, again

The first version of that guard searched the source for `status !== 200` and
flagged `identity/api.ts` — which by then was **correct**, because the raise on
`5xx` runs first and what remains provably means `4xx`. A repaired module
failing a check written to find unrepaired ones is the seventh time a check in
this repository has matched something other than what it meant.

It measures the population instead.

## What was proven

`tests/i45-identity-outage.integration.test.ts`, six cases.

| Mutation | Result |
|---|---|
| `readSession` collapses a `5xx` back into "signed out" | 2 failed |
| An outage becomes "you own no Businesses" again | 1 failed |
| The reads come off I25's budget | 1 failed |
| The page treats an outage as a refusal again | 1 failed |
| A refusal is presented as an outage — the overshoot | 3 failed |

The last one matters as much as the first four. The obvious fix for "an outage
is reported as a refusal" is to report every failure as an outage, which would
leave a suspended account waiting for an outage to end that was never happening.

## Verification

Run from a clean tree with every `dist` and `tsbuildinfo` deleted, in `verify`'s
own order.

## Known boundaries

- **Fifteen Decision functions still collapse an outage**, measured and named
  above and not repaired here.
- **The status code is still `200`.** `/account` now renders the unavailable
  surface, and it renders it with a success status — as does Home, which says
  "Kategoriler şu anda getirilemedi" under a `200`. A monitor, a crawler and a
  cache all read that as healthy. Next's App Router gives a page no way to set a
  status short of `notFound()` or throwing, so saying `503` needs a design
  decision rather than an edit, and nothing here pretends otherwise.
- **`/offerings/{slug}` answers `500` with an empty shell** when the API is
  unreachable — measured in the same probe, not diagnosed.
- **The transport failure and the `5xx` are not the same path.** An unreachable
  API raises a `TypeError` from `fetch` and reaches the error boundary; a
  reachable API answering `503` reaches the surface built here. Both are
  outages to the person, and only the second is presented as one.
- **No test drives `/account` over a socket.** The cases render the page
  through `renderToStaticMarkup`, which I35 proved cannot see a status code.
