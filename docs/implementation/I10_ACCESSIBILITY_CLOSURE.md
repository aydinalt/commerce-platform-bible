# I10 Accessibility — Closure Record

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft — awaiting Owner acceptance
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-15
- **Scope:** Implementation record only. No Frozen Story is edited, no Acceptance Criterion changes, and no Delivery Status moves.

## What this increment delivered

Every surface was already semantic HTML with no invented styling. This increment
read all twenty-two routes against WCAG 2.1 AA and closed what was missing.

**No visual design was added.** UX documents specify behaviour, not appearance,
and this changes nothing a sighted person sees except two heading levels and one
new label. What changed is what the platform *says about itself* to software
that reads it aloud.

## What was wrong

| Finding | Criterion | Scale |
|---|---|---|
| Twenty-two pages shared one `<title>` | 2.4.2 Page Titled | Every route |
| Seventeen English routes declared `lang="tr"` | 3.1.1, 3.1.2 Language | 17 of 22 routes |
| Listing Cards rendered `h3` directly under an `h1` | 1.3.1 Info and Relationships | Search Results, Compare recovery |
| Two Category controls had only a `<legend>` | 3.3.2, 4.1.2 Labels, Name/Role/Value | Rename, Move |
| One navigation landmark had no accessible name | 1.3.1 | Browse, where two render at once |

### The title, which was the worst of them

Every page returned `Commerce Platform`. A person restoring a browser session,
reading a history list, choosing among open tabs, or hearing the page announced
on arrival received the same six syllables twenty-two times.

Each route now carries **its own `h1` as its title** — `Sign in`, `Categories`,
`Karşılaştırma`, `Correction notice`. Nothing was invented: where a page already
names itself, that name became the title. The Homepage keeps the site's name,
because there the site's name is the honest answer.

### The language, which the Owner's own decision created

The Owner decided the public journey is Turkish and the entered contexts —
authentication, the Business Dashboard, Admin — are English. `<html lang="tr">`
then described seventeen of twenty-two routes wrongly.

This is not cosmetic. A screen reader given `tr` applies Turkish pronunciation
rules to English words, which produces something closer to noise than to an
accent. Each English surface now declares `lang="en"` on its own `<main>` —
WCAG 3.1.2 exactly, a document with a language and a part that says when it
differs.

Declared per page rather than in a shared wrapper, so the statement sits next to
the copy it is about. A page that changed language would change its own
attribute rather than inherit a stale one.

### The heading level

A Listing Card is content directly beneath a page's `h1` — that is true in
Search Results and in the Compare recovery list alike. At `h3`, the level
between them is missing, and somebody navigating by heading hears a section that
is not there. Both are now `h2`.

Browse was already correct: its cards sit after a Category navigation `h2`, so
`h2` cards are its siblings rather than its children.

## What the audit got wrong

Three of the first six findings were mine, not the code's, and each was caught
by checking rather than by trusting the check:

- **"The Homepage has no `h1`."** It has one, inside `SearchEntry`, wrapping the
  approved prompt. The scan read `page.tsx` files and not the components they
  render.
- **"Table headers are missing `scope`."** Every `th` in both tables has it. The
  count compared `grep -c` on two different patterns.
- **"Nine controls are unlabelled."** Two are. The rest use
  `htmlFor={template}` / `id={template}` pairs the first detector could not see.

Recorded because the same mistake is available to anyone reading this later: an
accessibility scan that reads files rather than rendered output will find
component boundaries invisible, and will report absences that are only absences
from where it happened to be looking.

## The tests

`tests/i10-accessibility.test.ts` asserts six properties across every route
rather than the markup that produces them today.

They are file-level on purpose. Most of these are claims about *all twenty-two*
routes, and rendering each would need a session, a database and a fixture per
page — the likely result being two routes checked properly and twenty trusted.
The trade is explicit: these read source text, and in exchange they read all of
it.

**Each was verified to fail.** Five regressions were introduced at once — a
removed title, a removed `lang`, a card returned to `h3`, a removed label, an
unnamed `nav` — and each was caught by its own test and no other. The sixth was
checked separately by removing one `role="alert"`.

## Known boundaries

- The tests read source rather than rendered output. A page could satisfy all
  six and still be unusable in ways only a real screen reader would find.
  Nothing here substitutes for testing with one.
- Colour contrast, focus visibility and touch target size are untested, because
  there is no visual design to test — every surface uses the browser's own
  styling. They become relevant the moment a stylesheet does.
- No skip link was added. With no repeated navigation block before the main
  content on any route, there is nothing yet to skip; a header or a persistent
  menu would change that.
- Keyboard operation was reasoned about rather than driven. Every control is a
  native `button`, `a`, `input`, `select` or `textarea`, and no custom widget,
  `tabindex` or key handler exists to break the browser's own order.

## Story governance

No Story's behaviour, Acceptance Criteria or Delivery Status changed. The
49 `Done` and 1 `In Progress` recorded in
`DELIVERY_STATUS_ADVANCEMENT.md` stand unaltered: accessibility is an
Engineering Constitution obligation rather than a Frozen Story's acceptance
criterion, and closing it neither advances nor weakens any of them.
