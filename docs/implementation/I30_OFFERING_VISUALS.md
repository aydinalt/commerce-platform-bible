<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-24
-->

# I30 — Offering visuals, and the logo that was stored and hidden

The Owner confirmed on 2026-08-24 that Offerings carry images. **They were
already specified.** The Frozen documents call them *media* and *visuals* rather
than images, which is why an earlier survey for "image" found nothing and
reported the platform had no images by decision. It did not; it had them by
requirement and not by implementation.

## Three acceptance criteria that could only ever half-pass

| Where | What it says | What was true |
|---|---|---|
| `US-DSC-F06-001` AC-4 | present the supplied primary visual, and invent no media when absent | `listingCardSchema` had **no field for a visual** |
| `US-OFR-F05-001` AC-4, UX-0003 §8.2 | inspect the supplied set; stay complete when there is none | `visuals: string[]` existed and the repository filled it from a literal `[]` |
| `US-OFR-F05-001` AC-5 | display name, **supplied logo**, short description | `logoUrl` stored since I1, in the contract, **never rendered** |

Each criterion has two halves and only the second was reachable. **A criterion
that can only fail in one direction is not a criterion that passes.**

The third is the sharpest: the comment above that section said *"Display name,
supplied logo and supplied short description — the three fields the contract can
express"* while the code rendered two. The sentence was false for as long as the
section existed, and it is made true by adding the logo rather than by being
corrected downwards.

## An address, not bytes

`business.logo_url` has held an image this way since I1, so `offering_visual`
follows the platform's existing answer rather than introducing a second one.
Object storage would need a hosting target, and there is none.

`position` is the order and `0` is the primary visual, with a unique constraint
on `(offering_id, position)` — two primaries are unrepresentable rather than
merely unexpected.

**Not a column on `offering_search_projection`.** Every denormalised field
carries a refresh obligation, and visuals are addresses fetched from elsewhere
that will change in bulk — a projected copy would be the field most likely to go
stale, and the staleness would be invisible. Five queries in three repositories
select it through one shared fragment instead.

## Rendering is what made a missing check load-bearing

`US-BUS-F02-001` Out of Scope §11 excludes technical URL validation, so
`logoUrl` has never been checked and an owner may still save whatever they type.
That was harmless while no stored URL became an `src`.

`image-source.ts` decides what this application will **load**, which leaves the
Frozen out-of-scope intact and puts the guard where the risk is. `http:` and
`https:` only; `data:` is refused because an SVG is a document with scripting
rather than a picture, and its inertness inside an `img` is a property of
browsers rather than of this application.

A refused address is treated exactly like an absent one — the surfaces already
know how to say nothing, and that is what AC-4's second half asks for.

## The fifth blind spot, and I29's false claim

**I29's closure record said "all twenty-two routes speak Turkish". It was
wrong.** Sixteen English submit labels were on screen — `Save`, `Create`,
`Define`, `Rename`, `Move`, `Add`, `Send`, `Record` — and all three
consolidation increments passed over them.

The detector reads what sits between tags. A button's label is
`{pending ? "Saving…" : "Save"}`, so the character after `>` is `{` and the
match never begins. **Four earlier corrections each widened what counted as
text between tags; none questioned that copy only appears between tags.**

A sixth correction was attempted and abandoned. Applying the shape rule to the
copy modules produced twenty-five false positives on the first run — `Ekle`,
`Kaydet`, `Nitelik`, `Taslak` — because most Turkish words contain none of
`ç ğ ı ö ş ü`. **Turkish and English are not separable by character class at
word level**, so the submit labels are asserted by value, which is what this
suite already does where a property cannot be derived.

## What was proven

| Mutation | Result |
|---|---|
| The scheme guard accepts `data:` and `javascript:` | 3 of 25 failed |
| The Listing Card renders an `img` unconditionally | 2 of 25 failed |
| An empty visual set renders a `figure` anyway | 2 of 25 failed |
| The Business logo is hidden again | 1 of 25 failed |
| English returns to a submit label | 1 of 25 failed *(after the value assertion — it passed before)* |
| **The Listing Card query takes `position = 1`** | 1 of 16 failed *(after the integration case — it passed before)* |

The last two are the ones worth reading.

**A component test cannot prove which visual the API chose.** `i30` renders
whatever `primaryVisualUrl` it is handed, so pointing the query at the wrong row
passed every case in it. The integration case inserts `position` 1 before
`position` 0, so a query that took whatever the database returned would pick the
wrong one.

**The copy modules are outside every check that walks the routes.** The
extraction that made the copy maintainable moved it one directory up, out of
reach of both detectors — so putting `Save` back into `form-copy.ts` passed.
That is the same failure as the four before it, in a new place: the check
followed the shape of the code rather than the property.

## Verification

Format, lint, module boundaries, type check, **97 test files / 898 tests**, no
OpenAPI drift, 0 vulnerabilities, production build.

**The linter found a real defect.** `String(form.get("visuals"))` stringifies a
`File` to the literal text `[object File]` and would have saved it as an
address. Nothing in this form offers a file today; the guard is there because
what the browser may put in a field is not that module's decision.

**The OpenAPI document is written by hand and nothing checks it against the
contracts.** `openapi.test.ts` asserts the health operations and nothing else,
so the published description said a Listing Card has six fields while the schema
had seven, and `openapi:generate` reported no drift because the generator is the
source it compares against. Updated by hand here; the gap is not closed.

## Known boundaries

- **The Presentation's visual ordering is unproven end to end.** A mutation
  flipping `order by position` to `desc` passes: no integration fixture gives an
  Offering visuals and then reads the Presentation. The Listing Card's choice is
  proven; the set's order is proven only at the component level.
- **Nothing checks the OpenAPI document against the contracts.** Named above,
  not fixed. It is a small test and worth its own increment.
- **`alt=""` on every visual.** Defensible from UX-0003 §8.2 — the document says
  the experience is complete with no visual at all, so by its own construction
  these carry no information the page would otherwise be missing. If that is
  wrong, the fix is an owner-supplied description, which is product surface no
  Frozen document defines.
- **No image is fetched, resized, cached or checked for being an image.** A
  1 GB address is a 1 GB download for every person who opens the page, and a
  dead address is a broken image. `aspect-ratio` reserves the box so the layout
  does not move; nothing else is defended.
- **Image content is unmoderated.** PRD-0006 owns Offering content correction
  and `CONTENT_AREA_LABELS` has three values — Title, Summary, Attributes.
  Adding a fourth would redefine a Frozen enumeration and is not mine to do.
- **"Sitelerden çekeceğiz" is not implemented and has an unasked question.**
  Nothing here fetches from another site; an owner or an operator pastes an
  address. Whether the platform may display images hosted by a merchant is a
  question about that merchant's terms rather than about this code.
