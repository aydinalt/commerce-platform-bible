<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-28
-->

# I50 — The Decision flow's stages, and colour applied to a message

I49 closed the public entrances and wrote down what it had not touched:

> The Decision flow is the densest screen in the product and got nothing. Its
> sections are still separated by margin alone.

Measured: **five files, 557 lines, and not one `className` between them.** Five
sections — an invalidity notice, the members, the Chat, the two ways forward,
and what was completed — with nothing between them but the margin above a
heading.

## Stages, not panels

A person moves through these in one sitting and needs to see *where they are*,
not to work inside each one. So the treatment is a rule between them, which is
the answer I49 gave the public entrances and for the same reason: **a card
around a step makes the step look optional.**

The first stage is spared its rule. A line directly under the page heading would
be the second horizontal rule in eighty pixels — the doubling I criticised in
the management surfaces two increments ago, and would have repeated here.

The scope arrives through one segment layout, I48's pattern unchanged, so none
of the five files was touched.

## What was found while looking

`[role="alert"]` sets `color: var(--critical)`. Measured across the web
application:

| | |
|---|---|
| Total uses | **56** |
| On a `<p>` — a red sentence, exactly right | **43** |
| On a container | **4** |

The four are three `div`s wrapping a list of shortfalls and the Decision flow's
own "Devam edilemiyor" `section`, whose heading, explanation **and list of
recovery links** were all painted red.

The direction's own words are the argument: *colour marks what is interactive or
what demands attention; a screen where four things are coloured has said
nothing.* A block where everything is coloured has said it four times.

A container now announces itself with a tinted surface and a rule and keeps
`--critical` for the part that is the refusal. `--text` on `--critical-surface`
is a pairing that did not exist before, so it was **added to
`i26-design-foundation`'s contrast list rather than assumed** — every other
pairing in this palette is measured, and a new one arriving unmeasured is how a
palette stops being measured at all.

**The overshoot this could have been**, and a case guards it: narrowing the base
rule to `p[role="alert"]` was the obvious move and would have taken the colour
off every refusal message in the product to fix four containers. A repair that
breaks forty-three things to mend four.

## I49's forcing function fired, one increment after it was built

Adding `.flow` failed I49's case asserting the exact class vocabulary. The list
grew by one deliberately, with the reason recorded — the second time in two
increments that a check written to make somebody argue has made somebody argue.

## The eleventh wrong match, and the third of mine in three increments

The case protecting the forty-three inline alerts asserted that
`[role="alert"] { … color: var(--critical) }` was still present. **The mutation
it exists to catch passed it**, because `p[role="alert"] {` contains
`[role="alert"] {`. It is anchored to the start of a line now.

Three increments, three substring failures — I48's comment match, I49's plural,
this one — and they share a shape: **asking whether a substring is present in a
large blob keeps failing where the blob holds near-identical strings.** The
pattern that has not failed is asserting the exact set, as I49's vocabulary case
does.

## What was proven

`tests/i50-decision-stages.test.ts`, six cases.

| Mutation | Result |
|---|---|
| The stage becomes a card | 1 failed |
| The first stage gets the doubled rule back | 1 failed |
| The container keeps painting everything critical | 1 failed |
| The base rule is narrowed to a paragraph | 1 failed *(after one version that passed)* |
| The flow loses its scope | 1 failed |
| A fifth container quietly carries the role | 1 failed |

## Verification

Run from a clean tree with every `dist` and `tsbuildinfo` deleted, in `verify`'s
own order: no OpenAPI drift, format, type check, lint, module boundaries,
**117 test files / 1066 tests**, 0 vulnerabilities, production build, 17/17
smoke checks. The suite ran in four parts for the reason I46 recorded.

## Known boundaries

- **Nobody has looked at it**, for the third increment running.
- **The four containers were treated as one kind of thing.** Three are shortfall
  lists in a form and one is a flow-level invalidity notice; they now look
  identical, and whether a refusal inside a form should look like a refusal of
  the whole page is a question this did not ask.
- **The stage rule is uniform.** The invalidity notice and the completion notice
  are exceptional moments in the flow and get the same separator as the
  ordinary ones — the tinted alert distinguishes the first, and nothing
  distinguishes the second.
- **`.badge` is still used on one screen**, named in I49 and still not decided.
- **Nothing in the Decision flow's copy or structure changed.** Fourteen states
  were inventoried in `SURFACE_INVENTORY.md`; this gave five of them a
  separator.
