<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-24
-->

# I32 — Loading Behaviour, and the two places it must not go

Eight Frozen sections name Loading Behaviour and there were **zero `loading.tsx`
files**. Next.js keeps the previous page on screen until the next one is ready,
so clicking a Listing Card did nothing visible for as long as the API took — up
to the ten-second budget I25 set. A person who presses a link and sees no change
presses it again.

I26's design foundation named a Skeleton component and did not build one,
because there was no loading state to put it in.

## Five files, fourteen routes

A segment inherits its nearest ancestor's loading state, so `/admin`,
`/businesses`, `/compare`, `/decision` and `/offerings/[slug]` cover everything
that waits. **The placement is the decision**: one directory higher would
swallow a sibling that must not have one, one lower would leave routes
uncovered.

## The interesting half is where it is absent

**There is no `app/loading.tsx`, deliberately.** A root file applies to every
segment beneath it that does not define its own, and there is no way to opt one
out — so it would reach the two places the Frozen documents forbid.

### Home — UX-0001 §12

> The person may still use Search where Search entry is available.

A `loading.tsx` replaces the whole segment, Search entry included. The compliant
loading state keeps Search and marks only the Categories as resolving, which is
a Suspense boundary *inside* the page rather than a file beside it.

### Discovery — UX-0002 §13

> current criteria remain visible … result actions are unavailable until
> confirmed

**Neither option available today is fully compliant, and that is the finding
rather than something to paper over.**

| | criteria visible | old actions inert |
|---|---|---|
| No boundary *(today)* | ✅ | ❌ |
| A `loading.tsx` | ❌ | ✅ |

The criteria live in the carrier cookie. `loading.tsx` is a synchronous
fallback — an async one suspends itself and shows nothing — so it cannot read
them. The compliant answer needs the criteria knowable synchronously, which
means the URL; **and the cookie was chosen deliberately in I4 so that a prefetch
cannot record a Discovery Start.** Two Frozen requirements pulling opposite ways
through one design decision, which is an Owner question rather than a
refactoring.

Leaving it as it is keeps the half that matters more: a person still sees what
they searched for.

## The approved design foundation caught me

The first version pulsed the skeleton, with a `prefers-reduced-motion` guard I
was pleased with. `i26-design-foundation` failed on **"declares no animation"** —
a constraint the Owner approved on 2026-08-21, for a stated reason: *"motion
needs a `prefers-reduced-motion` story that would otherwise be discovered by
someone it harms."*

The reasoning survives contact with this case. A pulsing skeleton says nothing a
still one does not — the sentence carries the state and the shapes carry where
the content will be — so the motion was decoration bought at the price of a
decision somebody had already made. **The pulse is gone**, and the constraint is
now asserted in `i32` as well, because a loading screen is the one surface that
seems to need movement.

## What the surface says, and what it refuses to

- **Words, not only shapes.** `role="status"` and `aria-busy`, because I9
  established that a state a person cannot hear is a state they do not have —
  and a silent loading screen is indistinguishable from nothing happening.
- **`status`, not `alert`.** This is progress, not a problem, and `alert`
  interrupts whatever is being read.
- **The shapes are `aria-hidden`.** Grey rectangles carry nothing a reader can
  use, and saying "loading" once per line is worse than saying it once.
- **No progress bar and no estimate.** The platform has no such number, and
  I25's budget is a limit rather than a prediction.

## What was proven

`tests/i32-loading-behaviour.test.ts`, nine cases.

| Mutation | Result |
|---|---|
| The state is visible but not announced | 1 failed |
| The skeleton shapes are announced too | 1 failed |
| `prefers-reduced-motion` is inverted to opt-out | 1 failed *(before the pulse was removed)* |
| A root `loading.tsx` is added | 4 failed |
| A segment loses its own | 1 failed |

## Verification

Format, lint, module boundaries, type check, **99 test files / 920 tests**, no
OpenAPI drift, 0 vulnerabilities, production build.

The linter caught an unused import. Nothing else new; the `.js`-extension trap
that the build caught in I30 and I31 did not recur, because the web package has
none left.

## Known boundaries

- **Nothing has seen a loading state.** Every claim is computed from rendered
  markup; no navigation has been slow enough, in a browser, for anybody to watch
  one appear.
- **Discovery and Home have no loading state at all**, for the reasons above.
  Discovery's is an Owner question about the carrier; Home's is a Suspense
  boundary inside the page and is the smaller of the two.
- **UX-0005 §14 and UX-0006 §14's "Empty" halves are untouched.** This increment
  is Loading only — I26 kept Empty and Loading separate on the Owner's
  instruction, and the empty states are already implemented where they were
  named (`NO_CASES`, `NO_ATTRIBUTES`, the Dashboard's own).
- **UX-0008 §13's "duplicate submission is prevented" was already true** via
  `useActionState`'s pending state disabling the fieldset, from I8. Not claimed
  here.
- The remaining Error Behaviour sections stay queued: UX-0004 §14, UX-0008 §14,
  UX-0009 §18.
