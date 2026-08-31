# I55 — Discovery takes the visual layer, and nine rules leave with it

**Status:** Closed
**Governs:** Frozen UX-0002 v1.1; Owner decisions of 2026-08-31 (visual layer
only; a rule leaves when its last route leaves)

## What this increment did

Discovery is the second route to move. Its page chrome — the entrance blocks,
the Category rows, the results headings, Zero Results and the
Compare-preparation notice — is written in Tailwind utilities, and the **nine
rule blocks** that had no other user are deleted from `globals.css`.

**No behaviour changed.** UX-0002 v1.1 now permits filter-as-you-type; this
increment did not implement it. Discovery still submits, still records one
Discovery Start per path, and still offers exactly the controls it offered
yesterday. The Owner scoped this to the visual layer and a server-action flow
rewritten as client state is not a visual change.

## What moved, and what deliberately did not

| Moved to utilities                             | Left on its class     |
| ---------------------------------------------- | --------------------- |
| `.entry`, `.entry-nav`                         | `.listing-card`       |
| `.category-choices` (and its two button rules) | `.listing-card-facts` |
| `.results-heading`, `.zero-results`            | `.listing-cards`      |
| `.preparation-notice` (and its three rules)    |                       |

**Discovery's Listing Card was not moved, and that is the whole reason those
three rules survive.** Compare hand-writes the same markup on its own route with
the same three class names. Moving Discovery's card alone would have left one
object looking like two different things depending on which page it was seen
from — worse than a stylesheet holding three rules that are waiting for their
second route.

## The trap this increment nearly walked into

`globals.css` carried two `:has()` layout hooks:

```css
main:has(.listing-cards) > *,
main:has(.category-choices) > * {
  max-width: var(--measure-wide);
}
```

Discovery was the only route carrying `.category-choices`. Deleting the class
without noticing would have **silently narrowed and re-centred a Browse branch
page** — the one case with Category choices and no Results, where the
`.listing-cards` hook could not have covered for it.

It was found by reading the stylesheet before deleting from it, not by a test.
Discovery's `main` now sets its own width, and the hooks are gone.

## Evidence

`tests/i49-public-surfaces.test.ts` — the public-architecture block was
**re-pointed rather than deleted**. I49's decisions are unchanged: a public
block is still not a workspace panel, both ways into Discovery still get the
same heading, an entrance is still narrow and a results grid still wide. Each is
now asserted where it is now stated. If a claim cannot be re-pointed, the claim
was about the selector rather than about the product — and all five could be.

**Mutation results — 3 of 3 killed:**

| Mutant                                           | Killed by                           |
| ------------------------------------------------ | ----------------------------------- |
| Discovery's grid narrowed to Home's measure      | I49 "narrow entrance, wide results" |
| One of the two results headings loses its rule   | I49 "same heading both ways"        |
| `.listing-card` renamed (Compare's rule removed) | I49 "keeps what Compare applies"    |

**The first mutant survived the first run, and the case that should have caught
it was one I wrote in this increment.** Re-pointing I49's cases, I dropped the
width comparison — the single claim that made "narrows the entrance without
narrowing the grid" mean anything — and kept the ones that were easier to
restate. The mutation test found it; the case is back, asserted about both sides
because a comparison with one side is not a comparison.

## Three tests corrected, each for a reason worth keeping

- **I54** ended by asserting `.entry` and `.entry-nav` survived, and said why:
  Discovery still applied them, and if it stopped, _"that is the next
  increment's cleanup"_. This was that increment, so the assertion is inverted.
  The promise was that a rule outlives its last user by exactly nothing.
- **I49's vocabulary list** lost six names. It failed first and the removal had
  to be written down, which is the forcing function working: a migration is
  exactly when a vocabulary shrinks, and a silent shrink is the same defect as a
  silent growth.
- **I10's heading-level case failed a third time for a reason that is not about
  heading levels.** Its own comment records the second time — I49 gave the
  heading a `className` and an attribute-free pattern broke. This time the
  Tailwind class list is long enough that Prettier breaks the tag across lines,
  and `[^>]*` stopped matching. The pattern is now whitespace-tolerant.

## What is still open

Twenty routes remain on the hand-written rules. Compare is the natural next one:
it holds the three `.listing-card` rules, and moving it lets Discovery's card
move with it — the two must go together or the card acquires two appearances.

**Filter-as-you-type is unbuilt.** UX-0002 v1.1 and PRD-0002 v2.3 permit it and
nothing implements it. It needs its own increment, and the thing to prove there
is the bound: at most one Search Discovery Start per Discovery path, which is
what Basic Analytics has been counting since I3.
