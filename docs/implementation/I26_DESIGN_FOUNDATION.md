<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-21
-->

# I26 — The design foundation

Implements §11 of `docs/design/DESIGN_FOUNDATION_CANDIDATE.md`, approved by the
Owner on 2026-08-21 with the direction **calm, content-first**, no existing
brand, and the palette proposed from scratch.

## Three measured defects this replaces

**The typeface was never loaded.** `globals.css` asked for `Inter` and nothing
fetched it — no `next/font`, no `@font-face`, no link. Every visitor without
Inter already installed fell back to their system UI font, so the application
had been rendering in a typeface nobody chose.

**There was no responsive design.** Zero media queries in the whole application.
`main` was a centred grid with a `46rem` cap, which survives a phone by accident.

**A control border failed WCAG 1.4.11, in the code and in the proposal.** The
existing input border was `#c3cbd9` — roughly 1.6:1 against the page. The
proposal's replacement was `#C3C7CE` at a *claimed* 3.1:1, which measures
**1.63:1**. Both are boundaries a person with low vision cannot find.

## The correction that mattered

The proposal published estimated contrast ratios and said they were "claims
until they are measured in place". They were measured before anything was
written, and **one was wrong in a way that would have shipped**:

| Token | Claimed | Measured | Now |
|---|---|---|---|
| `--border-strong` | 3.1:1 ✅ | **1.63:1 ❌** | `#818894` at **3.42:1** ✅ |
| `--text` | 14.8:1 | 15.72:1 | unchanged |
| `--text-muted` | 6.4:1 | 5.65:1 | unchanged, still AA |
| `--accent` | 6.1:1 | 6.47:1 | unchanged |
| `--accent-strong` | 8.9:1 | 9.33:1 | unchanged |
| `--critical` | 7.4:1 | 7.21:1 | unchanged |

Five estimates were off without changing a verdict. One changed the verdict.
The candidate document is corrected in place with the measured values and a note
saying what it had said.

**The ratios are now a test, not a table.** `tests/i26-design-foundation.test.ts`
reads `globals.css` — the stylesheet the browser actually gets — parses the
tokens out of `:root` and computes the ratios. A token edited without
re-checking its contrast fails there instead of in front of somebody.

A document cannot fail. That is the whole argument for moving the claim.

## A deviation from the approved proposal

§5 said "Inter, actually loaded". **It is not loaded, and the false claim was
removed instead.**

`next/font/google` fetches the face from Google **at build time** and fails the
build when it cannot reach them. It was tried here and the build failed for
exactly that reason — which is evidence rather than inconvenience: it would make
every deployment depend on a third party being up, for a reason unrelated to the
code. This repository refuses that shape of fragility everywhere else.

`--font-sans` is now the platform UI stack. It costs nothing to fetch, cannot
shift the layout because it is already present, and carries the full Turkish set
including the dotted and dotless *i*.

**The way back is `next/font/local`** with the `.woff2` files committed — no
build-time network, and a small separate task for whoever can supply them. A
test case fails if `Inter` reappears in the token without that conversation
happening again.

## What the direction forbids, made checkable

"Calm, content-first" is only useful if it rules things out, so the rules are
enforced rather than remembered:

- **No `box-shadow`** — elevation signals depth and a list of listings has none.
- **No animation** — motion needs a `prefers-reduced-motion` story, and the
  alternative to writing one is not writing motion.
- **No `outline: none`** — I9 established focus visibility across 22 routes and
  one edit could undo all of it.
- **Seven colour tokens, no more** — one accent and two states. There is
  deliberately no success green: this application has three things to say about
  a state, and a fourth colour invites a fifth.
- **Three breakpoints and no others** — an unexpected width means somebody added
  a one-off instead of using the scale.

## Responsive behaviour

| Breakpoint | Behaviour |
|---|---|
| base | single column, 16px gutters |
| 768px | Listing Cards go two-up; padding opens out |
| 1120px | tabular Admin surfaces widen to `--measure-wide` |
| ≤767px | **both tables become stacked labelled rows** |

The last is the one that matters. Horizontal scroll inside a page is the gesture
people reliably fail to discover, and an Admin moderation queue that can only be
read by scrolling sideways on a phone is a queue that does not get worked.

## What was proven

`tests/i26-design-foundation.test.ts`, eleven cases against the real stylesheet.

| Mutation | Result |
|---|---|
| The original wrong border colour returns | 1 of 11 failed |
| A `box-shadow` appears | 1 of 11 failed |
| A focus ring is removed | 1 of 11 failed |
| A success green joins the palette | 1 of 11 failed |
| Body text drops below the browser default | 1 of 11 failed |
| A fourth breakpoint is added | 1 of 11 failed |
| Muted text is lightened past AA | 1 of 11 failed |

## Verification

Format, lint, module boundaries, type check, **95 test files / 871 tests**, no
OpenAPI drift, 0 vulnerabilities, production build.

## Known boundaries

- **Nobody has seen this.** Every claim here is computed — contrast from hex,
  layout from CSS rules. No screenshot, no device, no person. R4.7's screen
  reader session is still open and this increment did not close it.
- **No `loading.tsx` exists**, so the Skeleton component in the proposal's
  inventory was not built. Empty and Loading Behaviour is its own increment at
  the Owner's direction.
- **The application is still bilingual.** Fourteen surfaces remain `lang="en"`
  with English copy. That is the next increment in the approved sequence
  (§9.4: Turkish consolidation first, i18n second), and it is why the Business
  Dashboard badge added here still reads `Restricted`.
- **Dark mode is deliberately absent.** It doubles every contrast check above,
  and this palette has not survived contact with a real screen yet.
- **§9.1 is unanswered** — interface-only, content too, or locale-scoped
  catalogue. It does not block the Turkish consolidation; it blocks i18n.
