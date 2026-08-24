<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-24
-->

# I33 — There was no site

The Owner said "we still haven't moved to the frontend" twice, and was
answered twice with "the frontend already exists". **The Owner was right both
times and the answer was wrong.** Measured on 2026-08-24, before the third
asking was taken seriously:

| | |
|---|---|
| Routes | 22 |
| Components | 60 |
| Lines of CSS | 587 |
| Site header | **0** |
| Navigation | **0** |
| Footer | **0** |
| Brand mark | **0** |

`layout.tsx` was `<html><body>{children}</body></html>`. Every page was a bare
`<main>` — correct in every rule it enforced, and belonging to nothing.

What had been built was the *behaviour* of an interface. What was being asked
for was a product surface, and the two are not the same thing. **A disagreement
that survives two exchanges is usually not a disagreement about the facts**, and
the fix was to go and measure rather than to explain again.

## The shell

A header with a wordmark that links home from every page, two navigation
entries, a footer, and a skip link.

**A wordmark rather than a logo.** There is no mark and inventing one would be
design work on an asset that has to be right. The brand linking home is not
optional though — it is the one navigation convention nobody has to be taught.

**The header knows two states and no third.** Signed in or not. It does not ask
whether this person owns a Business or holds Admin authorization: that costs an
API call on every page, the answer can change between two of them, and a header
offering `Yönetici` would announce to anybody reading the markup that this
account holds Admin authorization — which UX-0008 §5 keeps behind an explicit
context entry and I7 built three gates for.

The cookie is a hint, not proof. Every protected route re-checks with the API;
this only decides which links to draw, so being wrong costs a wasted click.

**The skip target is a `div`, not a `main`.** Every page brings its own, and two
landmarks with the same name is the defect I9 spent an increment removing.

## The direction the Owner replaced

I26's approved direction was **calm, content-first**. On 2026-08-24 the Owner
replaced it with a **dense listings** direction — which is that document's own
escape clause being used rather than ignored:

> Where density would serve better than calm, this is the wrong foundation and
> should be replaced rather than eroded.

A Turkish listings site is read by people comparing many things quickly, and
generous whitespace makes that slower: four Offerings on a screen instead of
twelve is three times the scrolling for the same comparison.

| Changed | Unchanged |
|---|---|
| Type scale down (`--text-display` 30px → 24px) | `--text-body` at 1rem — the browser default, and the floor below which a phone zooms a focused input |
| `--measure-wide` 60rem → 76rem, and lists get it, not just tables | `--measure` at 46rem for prose: forms, notices, error pages |
| Listing grid `auto-fill minmax(15rem, 1fr)` — five across on a wide screen | Every control still `min-height: 2.75rem` |
| Card visual edge-to-edge, text inset, title at body size | Lines not shadows, one accent, no animation, the focus ring, the measured contrast |

**The reversal is of spaciousness, not of restraint.** The constraints that
survived are accessibility or discipline, and density is not a reason to give
any of them up — density comes from spacing and from the grid, not from smaller
tap targets. Trading a 44px control for two more rows is paying in the wrong
currency.

## Three checks that read files instead of code

Every one of these was the check being wrong, not the code:

1. **`i26` read `480px` out of a comment.** The first version of the listing
   grid wrapped itself in `@media (min-width: 480px)`; `i26` rejected it, the
   comment recording that rejection then *contained* the number, and the
   breakpoint case counted it as a fourth breakpoint.
2. **The 480px query was pointless anyway.** `minmax(15rem, 1fr)` already
   collapses to one column on every phone. `auto-fill` makes the column count a
   consequence of the width rather than a fourth layout to maintain.
3. **`i33` read `fetch` out of `layout.tsx`'s webfont paragraph** while
   asserting the layout does not fetch.

Three times in one increment, after the same thing in I31's struck-through
`lang="en"`. **This is now a rule rather than an anecdote: this repository
comments heavily and on purpose, so every source-reading check must strip
comments first** — otherwise the prose that makes the code legible is the thing
that breaks the tests.

## What was proven

`tests/i33-site-shell.test.ts`, thirteen cases.

| Mutation | Result |
|---|---|
| The skip link points nowhere | 1 failed |
| The skip target becomes a second `main` | 1 failed |
| The navigation loses its accessible name | 2 failed |
| The header names the Admin context | 1 failed |
| Controls shrink to 24px to buy density | 1 failed |
| The grid goes back to a fixed two columns | 1 failed |

## Verification

Format, lint, module boundaries, type check, **100 test files / 933 tests**, no
OpenAPI drift, 0 vulnerabilities, production build.

**The layout is now async.** A nested async `Header` suspends, which
`renderToStaticMarkup` cannot resolve — a shell built that way is a shell no
test can render. One function that awaits once is both simpler and provable.

## Known boundaries

- **Still nobody has looked at it.** Every claim in this increment is computed
  from markup and CSS text. No browser has rendered the header, no screen has
  shown five cards across, and the dense direction is a set of numbers rather
  than something anybody has seen.
- **`Header` is not sticky.** `--header-height` exists for it; scrolling past
  the brand on a long results list is a real cost of not doing it, and doing it
  costs a scroll-offset story on every anchor.
- **The footer links to nothing**, deliberately: terms, privacy and about would
  each be a promise the platform cannot keep, and R4 of the release criteria
  names KVKK documents that have no owner.
- **The brand is the word `İlanlar`.** The platform has no name; naming it in a
  copy module would be that file deciding what the product is called.
- **Nothing is deployed.** The Owner chose Vercel with managed Postgres on
  2026-08-24 and no artefact exists yet: no `vercel.json`, no Dockerfile for the
  API, no deploy workflow. The web is only two of the three services — NestJS
  and the worker need a host that runs a process, and that is the next
  increment.
