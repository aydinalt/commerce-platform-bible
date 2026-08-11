# I4 Public Web Journey — Closure Record

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft — awaiting Owner acceptance
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-11
- **Scope:** Implementation record only. No Frozen Story is edited and no Delivery Status changes.

## What this increment delivered

The first thing a person can actually use. I3 ended with Discovery answering
correctly in JSON and nothing rendering it; the web application was still the
single static route it had been since I0.

After I4 a stranger can arrive at the Homepage, read the approved prompt, either
search or choose a Category, walk the active hierarchy, see Listing Cards in the
defined order, open one, and read the complete Presentation of that Offering —
without signing in, and without the system inferring anything on their behalf.

Five Stories across five commits and one migration, ending on 388 tests.

## Per-Story coverage

| Story | State | Notes |
|---|---|---|
| `US-DSC-F01-001` Homepage Discovery Entry | Covered | All 8 AC. Both entries are submissions rather than links, so a route cannot begin from a bookmark, a prefetch or a crawler |
| `US-DSC-F06-001` Discovery Results and Listing Cards | Covered | All 8 AC. AC-5 holds by contract rather than by discipline: `ListingCard` has no field that could carry contact or Affiliate Destination information |
| `US-DSC-F09-001` Offering Presentation Handoff | Covered | All 7 AC. Eligibility is decided at the moment of opening, not at the moment the card was drawn |
| `US-OFR-F05-001` Full Offering Detail Presentation | Partial | AC-1, AC-2, AC-4 to AC-9 covered. AC-3's grouping half has no governed input — see below |
| `US-DSC-F10-001` Compare Preparation Discovery Return | Covered | All 8 AC. The return continues the path it came from, so it records no second Discovery Start |

## Product decisions taken during delivery

| Decision | Reasoning |
|---|---|
| Discovery criteria travel in a short-lived cookie rather than the address | UX-0002 §4 places persistent or shareable URL state outside V1. A `?q=` would have been that state under another name, and would have raised the same question again at every Filter. The cost is accepted: refreshing loses the query and a Results page cannot be shared |
| One Discovery route rather than a Search route and a Browse route | Two addresses would themselves have been URL state. The criteria decide which view is rendered |
| Selecting a Category is a submission, not a link | `US-DSC-F01-001` AC-3 and `US-DSC-F03-001` AC-1 both say a route begins on explicit selection. A link can be followed by a prefetch or a crawler, and each following would have recorded a Discovery Start nobody made |
| The Discovery path identifier is issued by the server action, not taken from the API's answer | A page render cannot write a cookie. Issuing it where the person acts is also the more honest place: the path begins with the act, and the API is told which path a Start belongs to instead of inventing one per request |
| Opening an Offering is a link to `/offerings/{slug}` | `US-DSC-F06-001` AC-7 forbids the card from *performing* Presentation, Compare, Decision Chat, Handoff or Direct Contact. A link goes somewhere; a control does something. An Offering address is resource identity rather than criteria state, so it is not the URL state UX-0002 defers |
| `Offering Presentation Open` is written in the same transaction that composes the Presentation | AC-8 makes the occurrence conditional on Presentation successfully beginning and AC-9 withholds everything when it cannot. Separating them would allow an occurrence for a person who saw nothing |
| `supplied` is carried beside each Attribute value rather than inferred from `null` | A `false` Boolean and an absent Boolean are different statements. AC-4 forbids inventing a default, and something has to say the value is absent |
| `publicBusinessIdentity` now takes the four fields it reads rather than the whole owner record | Composing a public identity should not require holding a Business's protected contact channels. The narrower parameter makes the dependency honest |
| A Compare-preparation return naming a different Category is discarded, not reconciled | `US-DSC-F10-001` AC-2 constrains Results to *that same* leaf. A return claiming one leaf while showing another cannot satisfy it, and Discovery is not entitled to decide which half the person meant |

## Why `US-OFR-F05-001` AC-3 is only half implementable

AC-3 asks for applicable Attribute values "organized into understandable groups
while preserving authoritative units, allowed-value meaning, and missing
optional-value treatment".

The second half is covered: the governed `unit` travels verbatim from the
definition, Select values are presented as the labels a person chose rather than
the identifiers that stored them, and an unanswered Attribute keeps its name and
is marked absent instead of vanishing.

The grouping half has no input. PRD-0006 owns Attribute definition properties
and defines name, unit, value kind, comparability, filterability and
required-for-publication — no group, no section, no ordering key. UX-0003 owns
visual hierarchy but cannot invent a taxonomy the datamodel does not hold.
Presenting one ordered set is therefore the whole of what can be said truthfully;
grouping by value kind or by any other available field would be a classification
nobody governs.

**AC-3 completes when a governed Attribute grouping exists.**

## Deferred with reason

| Item | Reason |
|---|---|
| Compare and Decision Chat entries | UX-0003 §9.3 gives Compare to UX-0004 and Decision to UX-0009, both in I5. The entries are present and inert — rendered disabled rather than linked to a route that does not exist, because a control that looks live and leads nowhere is the worse lie |
| The producer of a Compare-preparation return | UX-0004 does not exist. Discovery's side of `US-DSC-F10-001` is complete and tested; nothing calls it yet |
| Offering visuals | No Offering can hold media. `visuals` is present and always empty, which states that the Offering supplied none rather than implying that media is outside the product minimum |
| Result paging | Unchanged from I3: no Frozen Story specifies a page size or a cursor, and `US-DSC-F07-001` AC-3 and AC-5 require a stable deterministic order a guessed scheme could contradict |
| Attribute Filter controls | `US-DSC-F05-001` is implemented in the API and has no I4 Story for its surface. Discovery returns the available Filters and the web application offers none |

## Known boundaries

- Every public page is server-rendered per request. Nothing in the journey may
  be prerendered or prefetched: Results depend on current eligibility, and
  opening an Offering produces an occurrence that a speculative fetch would
  fabricate.
- The Discovery criteria cookie is `httpOnly`, `SameSite=Lax` and expires in
  five minutes. It identifies nobody and is not a session. A person who edits it
  gets their entry discarded rather than repaired.
- `Offering Presentation Open` is recorded on a `GET`. The API cannot observe a
  browser finishing a render, so composing an eligible complete Presentation is
  the closest observable event to Presentation beginning. UX-0003 §10's
  exclusions — management views, unavailable screens, error screens, ineligible
  Offerings — are each distinguishable at that point and each produce nothing.
- Tests render the web application's server components directly through
  `react-dom/server` rather than in a browser. This proves markup and absence,
  which is what these Stories are mostly about; it proves nothing about layout,
  focus behaviour or responsive treatment.

## Story governance

All 50 Generated Stories remain `Delivery Status: Not Started`. This record
extends the implementation links in `I1_IDENTITY_BASELINE_CLOSURE.md`,
`I2_CATALOG_AND_WRITE_MODEL_CLOSURE.md` and
`I3_PUBLICATION_AND_DISCOVERY_CLOSURE.md`; advancing any Delivery Status
requires a separate change with Product Owner review and green CI evidence.
