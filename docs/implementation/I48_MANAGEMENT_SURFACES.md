<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-28
-->

# I48 — The seventeen surfaces that had no visual system

I26 built the token layer. I33 turned the direction from "calm" to "dense
listings". Both landed on the **public** surfaces, where Discovery, the Listing
Card and Compare each got the classes they needed as they were built.

Measured before anything was written:

| | |
|---|---|
| `page.tsx` files with no `className` at all | **20 of 22** |
| Stylesheet | 740 lines, 60 class selectors, 15 element selectors |
| Management routes with a panel, a form grid or a page header | **0 of 17** |

So the Business Dashboard, every Admin screen, sign-in, registration and
recovery were headings, paragraphs, forms and tables on a bare page — styled
only by the element selectors every page shares.

**The site was never unstyled.** It was typographically dressed and
architecturally undressed, which is a harder thing to notice than a plain page.

## Nothing here is a new direction

The Owner replaced the direction on 2026-08-24 and listed what survives
regardless: lines rather than shadows, one accent and two states, no animation,
the focus ring, the measured contrast, `min-height: 2.75rem` on every control.

Every rule added is built from tokens that already existed. No colour, no type
size, no new component vocabulary — the Owner's instruction was to *complete*
the approved direction, and completing it is not the moment to widen it.

**`i26-design-foundation` reads the whole of `globals.css`.** A shadow, an
animation, a fourth breakpoint or a fifth colour added here fails that suite
rather than this one, which is why this increment's own cases assert what the
layer positively *is* rather than repeating what the file may not contain.

## No page file was touched

The markup was already semantic — `main`, `section`, `h1`, `form`, `table`,
`ul` — so the scope arrives through **six one-element segment layouts** and
everything else is a selector.

| Segment | Scope |
|---|---|
| `admin`, `businesses`, `account` | `workspace` — wide, panelled, dense |
| `login`, `register`, `recover` | `auth` — the prose measure, one card |

`/register/confirm` and `/recover/reset` inherit, which is why they need
nothing.

Seventeen page edits would have bought nothing but seventeen chances to style
one of them differently — and the eighteenth page, added later, would have been
styled by whoever wrote it. A case now asserts the pages stay bare, so reaching
for a class on one of them fails and the question gets asked: does this pattern
belong in the layer, or is this page genuinely different?

## The selector that had to be careful

`.workspace ul` would have redrawn `.listing-cards` on the Business Dashboard as
a bordered row list — the Offering inventory silently losing the card treatment
the public side uses, on the one screen where an owner compares their own
listings with what a visitor sees. `:not([class])` keeps the row treatment to
lists that have not already said what they are.

## Two of my own cases were wrong, and one in the way this repository keeps
## finding

**The breakpoint check matched a comment.** It searched `globals.css` for
`@media` widths and found `480` — inside a sentence explaining a breakpoint that
had been *removed*. A check written to catch a fourth breakpoint was failed by
prose saying there were only three.

That is the **eighth** time a check here has matched something other than what
it meant, and it happened in the increment that added the most prose to the file
it checks. It strips comments now.

**The control-height check matched the value it existed to permit.** The pattern
meant to find anything below `2.75rem` had `[0-2]` followed by an optional
decimal, which matches `2.75` itself. It compares numbers now, and asserts only
the negative — `i33-site-shell` already names the two rules positively, and
repeating that would be two places to update when a third control arrives.

A third guess was also wrong and cheaper: "more than two control declarations"
was asserted, and there are exactly two, covering four control types.

## What was proven

`tests/i48-management-surfaces.test.ts`, seven cases, and the wrapper confirmed
over a real socket on six routes rather than in a render.

| Mutation | Result |
|---|---|
| The panel is drawn with elevation instead of a line | 2 failed |
| The unclassed-list guard is dropped, so Listing Cards get redrawn | 1 failed |
| The form reaches for a width of its own | 2 failed |
| A control is shrunk to buy density | 1 failed |

Each mutation fails **both** this suite and I26's, which is the arrangement
worth having: the direction's constraints were not re-litigated here, they were
inherited.

## Verification

Run from a clean tree with every `dist` and `tsbuildinfo` deleted, in `verify`'s
own order: no OpenAPI drift, format, type check, lint, module boundaries,
**115 test files / 1054 tests**, 0 vulnerabilities, production build, 17/17
smoke checks. The suite ran in four parts for the reason I46 recorded.

## Known boundaries

- **Nobody has looked at it.** This is asserted markup and asserted CSS; no
  browser rendered it for a human, and no screenshot exists. I26's contrast
  figures are computed, not seen.
- **The public surfaces are untouched**, by the Owner's choice of priority.
  Whether the dense direction is fully expressed there is unmeasured.
- **A panel is `section`, and that is a bet on the markup.** A management page
  that groups content without a `section` gets no panel, and one that nests
  `section` gets two. Neither happens today; both are one page away.
- **The two-column form assumes fields are of similar weight.** A long textarea
  beside a short input will look wrong, and `.field-wide` exists for it but no
  page uses it yet — so the escape hatch is untested by anything but its own
  rule.
- **No page's copy or structure changed.** An empty state that reads poorly
  still reads poorly; this gave it a panel to read poorly inside.
