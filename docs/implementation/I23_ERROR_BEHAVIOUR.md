<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-19
-->

# I23 — Error Behaviour, the public path

## The gap

**Every one of the eight Frozen UX documents has an "Error Behaviour" section.
The web application implemented none of them.**

| Document | Section |
|---|---|
| UX-0001 Home | §13 |
| UX-0002 Discovery | §14 |
| UX-0003 Offering Detail | §16 |
| UX-0004 Compare | §14 |
| UX-0005 Business Dashboard | §15 |
| UX-0006 Admin Dashboard | §15 |
| UX-0008 Authentication | §14 |
| UX-0009 Decision Flow | §18 |

Counted against the code: **22 routes, 0 error boundaries.** No `error.tsx`, no
`global-error.tsx`, no `not-found.tsx` anywhere. Every read threw a bare
`Error("BROWSE_ROOTS_503")` and Next.js replaced the whole page with its built-in
crash screen.

Nothing in this repository recorded it — not `CURRENT_STATUS.md`, not any
closure record, not the traceability work. It was neither implemented nor known.

**I22 made it worse rather than better.** The API now answers a database outage
with `503 DEPENDENCY_UNAVAILABLE`, which tells a client the truth: this is
temporary, your request was fine, come back. The person was shown an application
crash, which says the opposite, about a different system.

## Scope

The Owner scoped the first increment to **the mechanism plus the public path**:
UX-0001 §13's two states and UX-0002 §14's three. The remaining six documents
follow in later increments, and the adjacent "Empty and Loading Behaviour"
sections (UX-0001 §12, UX-0005 §14, UX-0006 §14 — and 0 `loading.tsx` files)
were deliberately kept separate, because "it failed" and "it has not arrived
yet" are different questions and mixing them would weaken the evidence for both.

## The shape all five share

Reading the five states together, they ask for the same four things:

1. **What the person had remains** — the query, the criteria, the selection.
2. **Nothing is invented** — no other Category opens, no alternative query, no
   silent eviction.
3. **No occurrence is claimed** — no Discovery Start, no `Offering Presentation
   Open`.
4. **A bounded set of recoveries is offered** — and only those.

The crash screen violated all four at once, because the page itself was gone.

## What was built

### Telling a dependency failure from a defect

`apps/web/src/api-error.ts` holds `ApiRequestError`, which **keeps the status**
rather than folding it into a message. `Error("BROWSE_ROOTS_503")` carried the
number in a string nobody could branch on, so no page could tell "the API is
unavailable" from "my code is broken".

`isApiUnavailable()` is `5xx` only:

- **`4xx` is not unavailable.** A `400` or `409` from a page read means this
  application sent something wrong. Presenting it as "temporarily unavailable"
  would promise a retry that can never succeed.
- **A non-`ApiRequestError` is never unavailable.** A `TypeError` or a contract
  parse failure is a defect and must keep reaching the crash screen. This is the
  same trade I22 refused when it kept constraint violations answering `500`: a
  handler that catches everything hides its own bugs behind "please try again",
  for ever.

### One surface, because two documents describe one moment

`ResultsUnavailable` serves UX-0001 §13 and UX-0002 §14 together. From the
person's side "the route did not begin" and "the results did not arrive" are the
same event, and two surfaces would eventually give it two behaviours.

**Nothing on it fetches.** The read that failed is not retried to draw the page,
so the surface cannot fail the way the page did — and no occurrence can arise
from a failure, which is requirement 3 satisfied by there being nothing to be
careful about.

It also means a Browse failure does **not** list other active Categories:
obtaining them needs the API that just refused. "Choose another active Category"
is served by Home, which owns that list.

### The criteria are shown, not merely retained

The carrier cookie already survives, but a person cannot see a cookie. The
surface prints the query, and for a Search re-offers **the same `SearchEntry`
component Home uses**, pre-filled — so "the entered query remains" and "the
person may retry or edit the query" are one field, and there is one Search entry
in this application rather than two that will eventually disagree.

### Every recovery is a submission

A `Link` to `/discovery` would be prefetched, and a prefetched Discovery route
records a **Discovery Start for somebody who never asked for one** — on the one
surface whose entire point is that nothing was claimed. A link back to an
Offering would record `Offering Presentation Open` the same way.

This is not a new rule. It is the reason every entry into Discovery has been a
`POST` since I4, applied to the surface that had not existed yet.

### The Filter error is one absence

UX-0002 §14 asks for three things when a Filter cannot be applied. All three are
`applyFilters` **returning without writing the carrier**: the last confirmed
criteria remain because nothing removed them, the Filter is not applied because
it never reached the cookie, and retry and removal are still on the page because
the controls are.

Applying it anyway would be this application deciding what may be filtered by,
which §9.1 makes a property of the Category and the Attribute definition.

## Decisions worth recording

**No `error.tsx` was added, and that is deliberate.** A Next.js error boundary is
a Client Component that cannot read cookies, so it could not show the person
their criteria — the first thing all five states require. Catching inside the
page keeps the criteria in reach and keeps the distinction between a dependency
failure and a defect, which a boundary would flatten.

**`retryDiscovery` and `retryOffering` read the carrier.** Not for
lint's sake: the carrier lives five minutes, and a retry after it expires has
nothing to retry. Sending such a person to `/discovery` would bounce them Home
by way of a route claiming to show them results; Home is where criteria are
entered, so that is where an expired retry belongs.

**No `eslint-disable` was introduced.** There are none in this repository and
this increment did not become the first. Where the linter objected, the code was
made genuinely better rather than silenced.

## What was proven

`tests/i23-error-behaviour.integration.test.ts`, eight cases, rendering the real
pages through `renderToStaticMarkup` with `next/headers` and the API layer
mocked.

### Mutations

| Mutation | Result |
|---|---|
| Catch everything, defects included | 1 of 8 failed |
| Treat `4xx` as unavailable too | 1 of 8 failed |
| Apply the Filter the API never confirmed | 1 of 8 failed |
| Make retry a prefetchable link | 1 of 8 failed |
| Stop showing the criteria | 1 of 8 failed |
| Make the Offering retry a link | 1 of 8 failed |

### One thing the tests got wrong first

The first version built its `ApiRequestError` from this test file's own
top-level import. `vi.resetModules()` gives each case a fresh registry, so that
class object is **not** the one the page imports and `instanceof` is false
between them — the failure escaped the page's `catch` and three cases failed
against correct code. Recorded because the failure mode is quiet in the other
direction: had the assertion been weaker, it would have passed while testing
nothing.

## Verification

Format, lint, module boundaries, type check, **92 test files / 845 tests**, no
OpenAPI drift, 0 vulnerabilities, production build.

## Known boundaries

- **Six of the eight documents are untouched**: UX-0003 §16 (beyond what the
  Listing Card open error covers), UX-0004 §14, UX-0005 §15, UX-0006 §15,
  UX-0008 §14 and UX-0009 §18. Named here so the remainder is a queue rather
  than a discovery.
- **Empty and Loading Behaviour is not done.** UX-0001 §12 is implemented on
  Home; UX-0005 §14 and UX-0006 §14 are not, and there are 0 `loading.tsx` files
  in the application.
- **The bounded surface has not been seen by a person or heard through a screen
  reader.** It carries `role="status"` and a labelled heading, on the same
  reasoning I9 used, but R4.7 remains open.
- **Nothing distinguishes a slow API from an unavailable one.** There is no
  timeout on the web application's `fetch` calls, so a hanging API hangs the
  page rather than reaching this surface — the same §13 retry-and-timeout gap
  I19 recorded for the database, one layer up.
