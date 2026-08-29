<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-28
-->

# I49 — The layer above the public components

I48 gave the seventeen management surfaces a visual system and named the public
side as the Owner's next choice. The Owner chose it, and chose to complete the
approved direction rather than widen it.

**The components there were never the problem.** Measured before anything was
written:

| | |
|---|---|
| `.listing-card` | 13 rules |
| `.comparison` | 4 rules |
| `.category-choices` | its own button treatment |
| Classes declared / referenced | 31 / 29 |

What the public routes lacked was the layer *above* the components: the block a
heading and a row of buttons sit in, the width an entrance should have, and the
rule that separates a results heading from the results. Home's `page.tsx` and
Discovery's view carried **four sections, two navs and two lists with no
structural treatment at all**.

## A public block is not a workspace panel

A panel is a container for work. These are entrances, and a results grid boxed
inside a card reads as a widget rather than as the page — so the treatment is a
rule and a muted label rather than a border on four sides. Lines doing the work,
which is the direction's own instruction rather than a preference of this
increment. A case asserts that neither `.entry` nor `.entry-nav` grows a border
or a radius.

Three patterns, all from existing tokens:

- **`.entry`** — Home's entrance, at the prose measure. A search field is one
  decision and a 76rem input invites nothing.
- **`.entry-nav`** — "or start from a category" on Home, and Discovery's
  narrowing and widening blocks. One pattern for three places, because they are
  the same act.
- **`.results-heading`** — the same 2px rule `.workspace h1` carries. It is the
  single structural idea crossing the boundary, and it crosses deliberately:
  somebody who signs in should not feel they have arrived somewhere else. A case
  asserts the two declarations are **identical**, so a later change to one shows
  up as a divergence from the other rather than as drift.

## I48's forcing function fired, and was answered

I48 asserted that management pages stay bare so that reaching for a class on one
has to be argued for. Adding `.entry` to Home failed that case, exactly as
designed.

The argument, recorded rather than skipped: Home's entrance needs a width
*narrower* than the results grid, and that is a fact about Home rather than a
pattern the layer should carry — an `.entry` rule applied to every public
section would cap the Discovery grid it exists to leave open. So the class went
on the page and I48's list grew by one.

## Three versions of one case, and the ninth wrong match

The case guarding the public components against being "helpfully" rewritten was
defeated twice before it measured anything.

**First**, it asked whether the stylesheet contained `.listing-card`. Renaming
that class away leaves `.listing-cards` behind, and the substring satisfied the
check — the plural covering for the singular. That is the collision I28 found
between four eligibility labels and I29 answered with a pairwise check, met here
in a test of my own: the **ninth** time something in this repository has matched
other than what it meant.

**Second**, matching the name as a whole token **still passed**, because
`.listing-card` appears in `.listing-card h3` and four other selectors. Asking
whether a name is *present* cannot answer whether its *treatment* survived.

**Third**, it asserts the whole vocabulary — all 34 class names, exactly. Any
rename, addition or removal now fails and has to be acknowledged, which is what
the two broken versions were reaching for and could not express.

## What was proven

`tests/i49-public-surfaces.test.ts`, six cases.

| Mutation | Result |
|---|---|
| The entrance takes the wide measure | 1 failed |
| The results heading drifts from the workspace's rule | 1 failed |
| The public block becomes a workspace panel | 1 failed |
| Only one of Discovery's two headings gets the rule | 1 failed |
| The Listing Card is renamed away | 1 failed *(after two versions that passed)* |
| The plural is renamed — the collision from the other side | 1 failed |

The 24 constraints in `i26-design-foundation` and `i33-site-shell` pass
unchanged, which is the arrangement worth having: no shadow, no animation, no
fourth breakpoint, no fifth colour, and no control shortened.

## Verification

Run from a clean tree with every `dist` and `tsbuildinfo` deleted, in `verify`'s
own order: no OpenAPI drift, format, type check, lint, module boundaries,
**116 test files / 1060 tests**, 0 vulnerabilities, production build, 17/17
smoke checks. The suite ran in four parts for the reason I46 recorded.

**One existing case had to be corrected, and it is the tenth wrong match.**
`i10-accessibility` says it checks that the public result lists skip no heading
level, and it did so by matching `<h1>“{view.query}”…` — an attribute-free tag.
Giving that heading a `className` failed a case about *heading levels* for a
reason that has nothing to do with levels. It asserts the level now and permits
attributes, which is what it always claimed to mean.

## Known boundaries

- **Nobody has looked at it**, as in I48. Asserted CSS, no browser, no
  screenshot.
- **Only Home and Discovery gained architecture.** The Offering Presentation,
  Compare and Decision were measured as already carrying their component
  classes, and this increment did not examine whether those components are
  *good* — only that they exist and were not disturbed.
- **The Decision flow is the densest screen in the product and got nothing.**
  Its sections are still separated by margin alone.
- **`.badge` is used on exactly one screen.** The Business Dashboard draws the
  moderation state as a badge; every other state in the product — case status,
  lifecycle, validation, eligibility — is plain text. That is a real
  inconsistency, measured here and not repaired, and it is a decision about
  whether states should read as chips at all rather than a styling task.
- **Two classes are declared and never referenced**: `.badge-critical` and
  `.field-wide`. Both were written for a use that has not arrived.
