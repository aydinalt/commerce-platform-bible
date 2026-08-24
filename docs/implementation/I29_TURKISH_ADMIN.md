<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-22
-->

# I29 — Turkish consolidation, UX-0006

Last of three. Authentication's six surfaces became Turkish in I27, the Business
Dashboard's five in I28, and Admin's seven here. **The application now speaks one
language, and that is now a property rather than a plan.**

## The copy was already in the right place, again

`moderation.ts`, `catalog.ts`, `destinations.ts` and `panel.ts` each already
owned the words for what they model, so the translation happened **in place**.
`platform/copy.ts` holds only what was left inline in the pages.

## Two comments described accidents as decisions

`panel.ts` opened with a paragraph explaining that the entered contexts are
English and the public journey Turkish, calling the division "not arbitrary".
`layout.tsx` attributed it to "the Owner's decision".

**No Owner ever made that decision.** It was the order the surfaces happened to
be written in, and these two comments are how it acquired the appearance of a
rule — I27 and I28 had already falsified both halves before this file was
reached. Both are **struck through rather than deleted**: a reader who saw them
disappear would not learn that the platform once had an unowned design decision
living in a comment.

## The Analytics tables rendered the contract's identifiers

An Admin looking at the platform's own numbers read `UNRESTRICTED`,
`PUBLISHED`, `NOT_VALIDATED`, `USER_ACCOUNT` and `MOBILITY: 3` — English enum
identifiers in a screaming case no interface uses.

**No source-reading test could have found this and none did.** These strings are
never literals in the JSX; they arrive as data, so the English-detector that had
been corrected four times across I27 and I28 was structurally incapable of
seeing them. Three increments walked past.

`tallyLabel` resolves them, with the **raw key as a deliberate fallback**: the
tallies are `Record<string, number>` on the wire rather than a union, so a total
mapping cannot be type-checked into existence. An untranslated key is visibly
wrong and gets fixed; a blank row is invisible and does not.

## The pairwise check I28 left open, and why the first version was wrong

I28 fixed four substring collisions where it found them and prevented nothing.
The full label set exists now, so the check does.

**Its first version flagged `Bu İlanı gizle` for containing `İlan`** — which is
not a defect but the design: labels compose from the vocabulary rather than
repeat it. A rule that reports the design as a bug gets deleted by the next
person. So a bare term is allowed to be contained and nothing else is, which
keeps both of I28's defects: `Herkese açık değil` ⊃ `Herkese açık` is two
labels, and `Arşivlenmiş` ⊃ `Arşivle` crosses two sets — the reason a
within-set rule would have missed it.

## The same hazard reappeared between two sentences

`i24` asserted that an analytics failure does not take the Admin Dashboard down,
using `not.toContain("yüklenemedi")`. That word now belongs to both the
page-level heading and `ANALYTICS_UNAVAILABLE`. While the two were English they
shared no word **by luck**.

The copy is right; the assertion was fragile. `PAGE_UNAVAILABLE` is exported so
the test names the message it means. **The pairwise check does not cover this** —
these are sentences, not labels.

## What was proven

| Mutation | Result |
|---|---|
| An English heading returns to `/admin` | 2 of 18 failed |
| `lang="en"` returns to an Admin route | 2 of 18 failed |
| The Admin copy stops composing from the vocabulary | 1 of 18 failed |
| The tally resolver loses the lifecycle names | 1 of 18 failed |
| A lifecycle label becomes a superstring of an action | 1 of 18 failed |
| **The raw Domain key goes back on screen** | 1 of 7 failed *(after the render assertion — it passed before)* |
| **A raw tally key goes back on screen** | 1 of 7 failed |

The sixth is the one worth reading. `tallyLabel` was proven by a unit case and
the mutation **passed anyway**, because a function being right says nothing
about whether the screen calls it. The assertion is now against rendered markup
and matches the shape of a contract identifier rather than any particular one,
so a value added upstream and rendered raw fails without anybody remembering to
add it.

Sixteen existing tests were updated and none weakened: each asserted an English
string for behaviour that has not changed.

## Verification

Format, lint, module boundaries, type check, **96 test files / 883 tests**, no
OpenAPI drift, 0 vulnerabilities, production build.

**The production build caught what nothing else did.** The new `platform/*`
imports used `.js` extensions — correct for the tests, and unresolvable by the
web bundler, which the type check and the whole test suite passed over in
silence. The web package imports extensionless.

## Known boundaries

- **The Turkish still has not been read by a Turkish speaker other than its
  author**, and there is now three times as much of it. Unchanged since I27 and
  now the largest open item on this thread.
- **`Ulaşım` for Mobility rather than `Vasıta`.** Turkish listing sites use
  *vasıta* and it would read as more familiar, but it names the vehicle where
  Mobility is the grouping. Worth revisiting with somebody who knows the market.
- **The sentence-level collision is unprevented.** The pairwise check covers
  labels; nothing stops two messages from sharing a distinctive word, and the
  next fragile assertion will be found the same way this one was — by breaking.
- **`tallyLabel`'s fallback means an upstream addition renders in English.** The
  render assertion now fails when that happens, which is the intended trade.
- **§9.1 remains unanswered** and now blocks i18n alone: the consolidation it
  was waiting behind is finished.
