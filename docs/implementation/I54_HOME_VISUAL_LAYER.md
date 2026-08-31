# I54 — Tailwind arrives, on one route, without Preflight

**Status:** Closed
**Governs:** Frozen UX-0001 v1.1 §6–§8; Owner decisions of 2026-08-31 (Path A;
route-at-a-time migration; delete a rule when its last route leaves)

## What this increment did

Home is the first route to take the prototype's visual language. Tailwind v4 is
installed in `apps/web`, Home and its Search entry are rewritten in utilities,
and the three CSS rules only Home used are deleted.

**Nothing about Home's behaviour changed.** UX-0001 v1.1 §6 lists what Home
provides — the exact prompt, one Search entry, active Category Browse entries, an
optional non-interactive value statement — and this increment changed the
appearance of those and nothing else.

## The scope decision, and the thing it refused

The prototype's `/` is a **search-and-results screen**. Home's Frozen screen
overview does not list Results, so the prototype's home page was not brought
here; only its typography, spacing and control language were. Bringing the
results would have been a §6 change, and §6 was not what the Owner approved.

That distinction is asserted, not merely promised:
`tests/i54-home-visual-layer.test.ts` fails if Home's source gains Results.

## Preflight is the whole risk, and it is excluded

`@import "tailwindcss"` — the one line every Tailwind guide shows — carries
**Preflight**, Tailwind's CSS reset. `globals.css` already resets what it
resets, and its 88 rules sit on that base across twenty-two routes. Importing
the usual way would have changed how every page looks, on a commit scoped to one
page, with no test in this repository able to notice: the CSS-reading tests read
rules, and no test renders a page to pixels. It would have been found by a person
saying something looks wrong.

So the theme and utilities are imported by name and Preflight is not — Tailwind's
documented opt-out, not a workaround:

```css
@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);
```

The tokens are bridged with **`@theme inline`**, which makes `bg-accent` compile
to `var(--accent)` rather than to a copied hex value. `globals.css` promises at
the top that "a number that appears here appears nowhere else"; plain `@theme`
would have broken that promise on the first colour.

## Which rules were deleted, and which were not

`.search-entry-row` and its two child rules are gone — Home was the only route
that applied them. **`.entry` and `.entry-nav` stay**, because Discovery still
applies both. Deleting a rule another route uses is not migration; it is
breakage. They leave when Discovery leaves.

This is the Owner's rule of 2026-08-31 stated as a mechanism rather than an
intention, and `tests/i54` asserts the reason rather than the fact: it reads
Discovery's own source to establish that the rules still have a user.

## Evidence

`tests/i54-home-visual-layer.test.ts` — five cases. Two of them compile the
stylesheet with Tailwind's CLI and assert against the **output**, because the
question is what a browser receives.

**Mutation results — 3 of 3 killed:**

| Mutant                                              | Killed by     |
| --------------------------------------------------- | ------------- |
| `@import "tailwindcss"` (Preflight returns)         | I54 §1 and §2 |
| Browse `action={beginBrowse}` → a plain form action | I54 §4        |
| `@theme inline` → `@theme` (tokens copied)          | I54 §3        |

**The first mutation run reported this mutant as surviving, and that report was
wrong.** The replacement string did not match the file, so nothing was mutated
and the suite passed on unmodified code — a mutation test that verified nothing,
which is the eleventh recorded instance of this shape and the reason the second
run asserts the substitution applied before running anything.

## Two mistakes made inside this increment

**`npm install` inside `apps/web` broke the root install.** It rewrote the
workspace tree and dropped an optional native binding (`@rolldown/binding-linux-x64-gnu`),
so `vitest` would not start. Repaired with a root `npm install`. In a workspace,
dependencies are added from the root or not at all.

**A test failed on its own explanation.** The case asserting Home contains no
Results read the source _including comments_, and the comment above it said "the
prototype's home page is a results screen". Fixed with the same comment-stripping
helper `tests/i27` uses, for the same reason.

## What I49 had to be told

Three cases in `tests/i49-public-surfaces.test.ts` failed, correctly, and were
**re-counted rather than relaxed**:

- "one pattern to the three places" is now two — Home left, the two Discovery
  blocks remain, and the case now asserts Home does _not_ apply `.entry-nav`.
- The `.entry` case follows the rule's remaining user (Discovery) instead of
  following Home.
- `search-entry-row` was removed from the declared-vocabulary list, with the
  removal written down, because a vocabulary that shrinks silently is the same
  defect as one that grows silently.

I49's class extractor also read `.css` out of `@import "tailwindcss/theme.css"`
and reported it as a declared class. `@import` lines are now stripped before
extraction — the tenth recorded case of a check matching other than what it
meant, and the same shape as the drift checker that parsed a doc comment.

## What is not proven here

**`next build` does not run in this sandbox** (SIGBUS), so the PostCSS pipeline
is proven by compiling `globals.css` with Tailwind's CLI rather than by building
the application. CI is the first place the Next build sees Tailwind. If it fails
there, the failure is in the build integration and not in the stylesheet, which
compiles.

## What is still open

Twenty-one routes remain on the hand-written rules. Discovery is the natural
next one: it holds `.entry` and `.entry-nav`, and moving it retires them.
