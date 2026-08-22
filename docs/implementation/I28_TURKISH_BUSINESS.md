<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-21
-->

# I28 — Turkish consolidation, UX-0005

Second of three. UX-0008's six surfaces became Turkish in I27; this is the
Business Dashboard's five. Admin's seven remain.

## Most of the copy was already in the right place

`inventory.ts`, `destination.ts`, `corrections.ts`, `information.ts`,
`offering-content.ts` and `action-outcome.ts` each already owned the words for
the thing they model. They were centralised and English, so the translation
happened **in place** rather than by moving anything.

`business/copy.ts` was added only for what was left inline in the pages —
headings, empty states and the sentences that wrap a link. A refusal message
stays beside the refusal codes it maps from, so a code added upstream breaks the
file that has to answer for it.

## The translation created a defect, and a test found it

Four eligibility labels came out as:

| | First translation | Problem |
|---|---|---|
| `ELIGIBLE` | Herkese açık | — |
| `INELIGIBLE` | Herkese açık **değil** | contains `ELIGIBLE` |
| `PENDING` | **Herkese açık**lığı henüz belirlenmedi | contains `ELIGIBLE` |
| `WITHDRAWN` | **Herkese açık** görünümden çıkarıldı | contains `ELIGIBLE` |

`expect(withheld).not.toContain(ELIGIBILITY_COPY.ELIGIBLE)` therefore failed —
and had it been written the other way round it would have **passed while the
screen said the opposite**.

The same shape appeared in the lifecycle: `RETIRE` was `Arşivle`, which is a
prefix of `Arşivlenmiş`, the heading an Archived Offering sits under. "This
screen offers no Retire action" would have been satisfied by the heading.

Fixed so no label is a substring of another:

- `INELIGIBLE` → `Herkese kapalı`
- `PENDING` → `Görünürlüğü henüz belirlenmedi`
- `WITHDRAWN` → `Görünümden çıkarıldı`
- `RETIRE` → `Arşive kaldır`

**Both were found by tests that had been passing on English.** The English
wording had the same hazard and got away with it, which is the useful part: a
translation is a re-run of every string comparison in the suite.

## The detector has now been wrong four times

`i27`'s "leaves no English sentence" case, in order:

1. **Listed English words to look for.** Missed two whole English sentences
   whose first words were not on the list.
2. **Looked for text with no Turkish letter.** Caught those, and started
   reporting JavaScript, because the arrow in `=>` reads as a closing tag.
3. **Added `(?<!=)`.** Correct on sentences.
4. **Still required two or more words.** A mutation put `<h2>Offerings</h2>`
   back and the case passed. Single English words are most of what a heading is.

Now: any rendered literal that is ASCII-only prose. Dropping the word minimum
immediately found **nine more** — `Title`, `Address`, `Category`, `Attributes`,
`Saved.`, `Status`, `Checked`, `Handoff` — that three earlier versions had all
walked past.

A literal between tags is copy by construction, because anything from the data
is an `{expression}` and never matches. A brand name would be the exception to
add when one exists, rather than a hole to leave open now.

## What was proven

`tests/i27-turkish-consolidation.test.ts`, widened from four route folders to
five, nine cases.

| Mutation | Result |
|---|---|
| An English heading returns to a Business page | 1 of 9 failed *(after the fourth fix — it passed before)* |
| `lang="en"` returns to a Business route | 1 of 9 failed |
| The retire label collides with the archived heading again | 1 of 9 failed |
| The Business copy stops composing from the vocabulary | 1 of 9 failed |
| A Turkish sentence goes back inline | 1 of 9 failed |

Nine existing tests were updated, none weakened: each asserted an English string
for behaviour that has not changed. `i10-accessibility`'s `ENGLISH` pattern
shrinks to `admin` alone.

## Verification

Format, lint, module boundaries, type check, **96 test files / 880 tests**, no
OpenAPI drift, 0 vulnerabilities, production build.

## Known boundaries

- **Admin's seven surfaces remain English.** Last of the three.
- **The substring hazard is fixed where it was found, not prevented.** Nothing
  stops a future label from being a prefix of another; the one case asserting it
  covers `Arşivle` and `Arşivlenmiş` only. A general check would need to compare
  every pair of exported labels, which is worth doing when the third area lands
  and the full set exists.
- **The Turkish still has not been read by a Turkish speaker other than its
  author.** Unchanged from I27, and now twice as much of it.
- **`toLocaleUpperCase("tr")` is used in `copy.ts` for lower-casing a term
  mid-sentence** — the first use of Turkish-aware casing in the application. A
  plain `toLowerCase()` would turn `İlan` into `i̇lan`.
- **§9.1 remains unanswered** and blocks i18n rather than the last
  consolidation.
