# I15 Attribute Filter Controls — Closure Record

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft — awaiting Owner acceptance
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-17
- **Scope:** Implementation record only. No Frozen Story is edited, no Acceptance
  Criterion changes, and no Delivery Status moves.

## What was missing

`US-DSC-F05-001` was implemented in the API in I3 and has been covered by twelve
tests since. It had no surface. A person browsing to a leaf Category could see
the Offerings in it and could not narrow them, because nothing on the page
offered a Filter — the response carried them and the view ignored the field.

`CURRENT_STATUS.md` recorded this as a known boundary through four increments.

## The claim it also falsifies

The Repository Overview says every Frozen UX document now has a surface. That
was true document by document and not section by section: **UX-0002 §9 is an
entire section on Filter Behaviour** — availability, four value kinds,
combination semantics and change behaviour — and none of it could be reached.

The row is now qualified rather than left to read as more than it meant.

## What the section actually asks for

| | |
|---|---|
| §9.1 | Available only on an active leaf Category, for an applicable filterable Attribute. Text is never a Filter |
| §9.2 | Number takes an inclusive minimum, an inclusive maximum, or both |
| §9.3 | Boolean is an exact true or false selection |
| §9.4, §9.5 | Both Select kinds combine selected values with OR |
| §9.6 | OR within a Select, AND across Attributes, AND with query and Category |
| §9.7 | Applying narrows or preserves; removing expands or preserves; clearing keeps the query and the Category |

**None of the combination semantics are implemented here.** They belong to the
API and were already there; what this increment adds is a page that can express
the question and a carrier that can hold it.

## Three decisions worth the words

**The offered Filters are read from the API, not from the form.** A submitted
list of what may be applied would be a list the browser could edit — the form
deciding its own validity. `applyFilters` fetches the view, reads the submission
against the Filters that view offered, and drops anything else. The API refuses
it a second time if one ever gets through, which is where the refusal is named.

**An empty control is not a value.** An empty Number box read as `0`, or an
unset Boolean read as `false`, would apply a Filter nobody chose — and because
an Offering without a value does not match an applied Filter (§9.2, §9.3), it
would *remove results* rather than merely mislead. Boolean therefore has three
states on the page and two in the contract, and the third is the absence of the
Filter.

**Filters travel in the carrier, not the address.** UX-0002 §4 puts persistent
or shareable URL state outside V1, and a Filter in a query string is that state.
They sit beside the query and the Category because they are part of the same
question, and they are parsed against the published contract on the way back in
— a person can edit a cookie.

## The tests

`i15-attribute-filters.test.ts` — eight tests, no database.

Verified to fail against the behaviour they replaced: making an empty Number box
read as `0` failed two tests and nothing else; trusting the form's option
identifiers instead of the offered list failed the submission test; removing a
per-control label and leaving the `legend` failed the naming test.

The I10 accessibility suite scans every `.tsx` under `apps/web/src`, so the new
controls were held to the rules it already established — each input named on its
own, and the section landmark labelled — without a line being added to it.

## Known boundaries

- **Search-side Filters are still unreachable.** `searchViewSchema` carries
  `filters` and `filtersAvailable`, and §9.1 makes them available once a Search
  is narrowed to an active leaf. The web application offers no narrowing control
  at all, so there is no leaf to filter within; the narrowing surface is the
  prerequisite and is not in this increment.
- No filter is applied to a branch, because the API offers none there. A person
  who wants to narrow must reach a leaf first, which is what §9.1 says.
- The controls are rendered and asserted through `react-dom/server`. That proves
  markup and absence, and nothing about focus order, keyboard behaviour in a
  real browser, or how a long option list behaves on a small screen.
- Nothing debounces or auto-applies. Every change is an explicit submission,
  which is the same choice every other Discovery control here made and for the
  same reason: a Filter that applied itself would produce Results nobody asked
  for.

## Story governance

No Story's behaviour, Acceptance Criteria or Delivery Status changed. All 50
Generated Stories remain `Done`.

`US-DSC-F05-001` was already `Done` on its API evidence, which is what its
Acceptance Criteria are about. This increment gives its behaviour a way to be
used, and adds no criterion that was not already met.
