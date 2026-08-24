<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-24
-->

# I31 — The two screens a person reaches when it breaks

| | Before |
|---|---|
| Routes | 22 |
| `error.tsx` | **0** |
| `global-error.tsx` | **0** |
| `not-found.tsx` | **0** |
| `notFound()` call sites | **29** |

A `TypeError` in any route, or any of those twenty-nine calls, produced Next.js's
built-in screen: English, no route back into the application, nothing a person
could quote to anybody.

**The thirteen `notFound()` calls I24 kept deliberately were being answered in
the wrong language by the increment that made them honest.** I24 spent itself on
not saying "this does not exist" about something that does; the answer it
protected was then delivered by a page nobody here had written.

## Three surfaces, and why they are not one

`service-unavailable.tsx` already existed and is **not** merged into these,
which is the obvious tidying-up and would make one of the two lie.

- **Unavailable** — a read the code *expected* to fail did fail. It knows what
  did not load, and it says records were not deleted, because it knows that too.
- **Unexpected** (`error.tsx`, `global-error.tsx`) — nothing was expected. The
  only honest statements are that the page could not be drawn and that nothing
  was saved by the attempt, which is true because this catches a failure while
  *rendering*, after any save has already resolved.
- **Absent** (`not-found.tsx`) — the thing is not there, and there is nothing to
  retry.

## One message for two situations, on purpose

The twenty-nine calls mean either "no such address" or "this is not yours", and
**the second is exactly why the first cannot be more specific**: a page that told
them apart would answer, to anybody who asked, whether a given Offering or
Business exists. I24 closed that door on the unavailable side; this would have
opened it on the absent side.

The three possible reasons are named without one being claimed, because a person
told only "not found" concludes the platform has lost something.

## `global-error.tsx` declares its own language

It replaces the whole document, so it brings its own `<html lang="tr">` — there
is nothing to inherit from, since the layout that normally declares it is the
thing that failed. Without it a screen reader falls back to its own default and
reads Turkish with English rules on the one screen a person reaches when they
are already confused.

It is also deliberately plainer: the stylesheet is loaded by the layout that is
not running, so an unstyled page that says the right thing beats a styled one
that cannot be drawn.

## `digest` is Next's identifier, and saying so matters

I21 gave the API a correlation ID that travels into the audit record and the
outbox. **It reaches the web application nowhere**, and a render that never
called the API has none to carry. `digest` is what Next writes to the server log
beside the stack, so it is the number that can actually be looked up — and
somebody handed a number will search for it, which is why the copy says what it
is for rather than pretending it is the platform's.

Shown only when present. `digest` is absent for a client-side error, and a label
with nothing after it is worse than no label.

## What was proven

`tests/i31-failure-surfaces.test.ts`, thirteen cases.

| Mutation | Result |
|---|---|
| The reassurance that nothing was saved is dropped | 1 failed |
| The reference label renders with nothing after it | 1 failed |
| The error is visible but not announced | 1 failed |
| `global-error.tsx` stops declaring a language | 1 failed |
| English returns to `failure-copy.ts` | 1 failed *(after the value assertion — it passed before)* |
| The not-found page claims which of the two cases it is | 1 failed |
| `not-found.tsx` is deleted | 4 failed |

**The fifth is the same hole as I30's, in the same kind of file.**
`failure-copy.ts` is a copy module and sits outside every check that walks the
route folders. The conclusion is also the same: a shape rule cannot rescue it,
because `Ara` and `Tekrar dene` are Turkish and contain none of `ç ğ ı ö ş ü`.
Where a property cannot be derived, the value is named.

## Two findings from widening `i27`'s walk

Extending it to the whole application root produced three failures, and all
three were the check being wrong rather than the code:

- **`layout.tsx` was reported as declaring `lang="en"`.** It does not — I29
  struck the paragraph through rather than deleting it, and the marker check
  read a note about the past as the thing it described. Comments are stripped
  now: what a page declares and what a comment says about history are different
  questions.
- **`Ara` and `Tekrar dene` were reported as English.** They are Turkish. This is
  the third time the same fact has surfaced, and it is now recorded in three
  places.

So the walk includes the three failure screens and not the rest of the root.
**Home, `search-entry` and `service-unavailable` predate the consolidation** —
Turkish since I4, with their copy never extracted into a module — so the
extraction rule does not describe them. Including them would report that
difference as a defect instead of recording it, which is what this paragraph is
for.

## Verification

Format, lint, module boundaries, type check, **98 test files / 911 tests**, no
OpenAPI drift, 0 vulnerabilities, production build.

**The production build caught the same class of error it caught in I30**: a
`.js` extension on a relative import, correct for the tests and unresolvable by
the web bundler. The type check and all 911 tests passed over it in silence,
twice now. The web package has no `.js` relative imports left.

## Known boundaries

- **Nothing has seen these screens.** Every claim is computed from rendered
  markup; no browser has thrown a real error into the boundary, and `reset` has
  never been pressed.
- **The failure copy is unextracted from the perspective of i18n** in the same
  way the rest of the root is — it is a module, but §9.1 is still unanswered so
  there is no catalogue for it to join.
- **`digest` is not linked to the platform's correlation ID.** Two identifiers
  for two different things, and a person who has one cannot be found by the
  other. Connecting them means passing a correlation ID into the web
  application, which nothing does yet.
- **The remaining Error Behaviour sections are still queued**: UX-0004 §14,
  UX-0008 §14, UX-0009 §18. UX-0003 §16 was already implemented in I23 and is
  not claimed here.
- **Empty and Loading Behaviour remains untouched.** Eight Frozen sections name
  it and there are still zero `loading.tsx` files.
