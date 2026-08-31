# `US-OFR-F05-001` AC-3 — Attribute Grouping Decision

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft — awaiting Owner acceptance
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-17
- **Scope:** One Owner decision, its consequences in code, and one Delivery
  Status move. No Frozen document is edited, and no Acceptance Criterion
  changes.

## The question that was open

AC-3 asks that applicable Attribute values be "organized into understandable
groups while preserving authoritative units, allowed-value meaning, and missing
optional-value treatment".

The second half has been met and tested since I4. The first half had no input.
PRD-0006 v2.1 gives an Attribute definition a name, a value kind, an optional
unit label for Number, and the required-for-publication, filterable and
comparable flags. **There is no group, no section and no ordering property.**

`DELIVERY_STATUS_ADVANCEMENT.md` recorded this in I9 and advanced the Story to
`In Progress` rather than `Done`, naming two ways it could close: add a governed
grouping to PRD-0006 by controlled revision, or read AC-3 as satisfied by one
ordered set.

## The decision

**The Owner reads AC-3 as satisfied by one ordered set.**

The reasoning that made this the recommendation stands as the reasoning for the
decision: a grouping composed from whatever field happens to be available —
value kind, filterability, definition order — is a classification nobody
governs, shown to the public as though somebody did. One ordered set is the
whole of what can be said truthfully from the inputs that exist, so it is what
"understandable" amounts to here.

This is a reading of an existing criterion, not a change to one. AC-3's text is
untouched, the Story stays Frozen at v2.1, and a future governed grouping
remains available as a controlled revision of PRD-0006 without contradicting
anything decided today.

## What the decision cost, which was not nothing

Accepting "one ordered set" as the answer makes the set's order load-bearing,
and it was not ordered.

`attribute_definition.name` is not unique — only `stable_key` is — and three
queries ordered by name alone. Two Attributes sharing a display name therefore
came back in whatever order the query plan produced, which can differ between
two reads of the same Offering. A set that reorders itself between readings is
not an ordered set, and until today nothing depended on the difference.

`d.id` now breaks the tie in all three:

| Surface | Why it is in this change |
|---|---|
| `pg-presentation.repository.ts` | The criterion this decision is about |
| `pg-comparison.repository.ts` | Rows of a comparison table swapping places between two reads of the same Set is the one thing a comparison must not do |
| `pg-chat.repository.ts` | Reads the same comparable set Compare does, and the two must not disagree about its order |

The last two are not `US-OFR-F05-001`. They are the same latent defect found
while looking at the first, and leaving a known nondeterminism in place with a
paper trail is worse than removing it. No criterion of theirs changes, and no
Delivery Status other than `US-OFR-F05-001` moves.

## The column that looks like an answer and is not

`category_attribute` carries a `sort_order` integer, and the owner's editing
read orders by it. It is tempting to call that the governed ordering AC-3
wanted.

**It is not, and it is deliberately still unused here.** No PRD names it, no
Admin surface writes it, and no code path sets it to anything — every row holds
the default `0`, so `order by ca.sort_order, d.name` has always been `order by
d.name` wearing a hat. Reading a public presentation order out of a dormant
column would be exactly the ungoverned classification this decision declines to
invent, with the added problem of looking governed.

It is left alone. If a governed ordering is wanted later, the column is a
plausible place to put it — after a PRD says what it means.

## Evidence

`i4-offering-presentation` — *returns one ordered set, and the same one on every
read*. Attributes are created sharing one display name until their identifiers
disagree with the order the rows were written in, the Presentation is read
twice, and the readings are asserted identical and ordered as specified.

**This test does not fail against the behaviour it replaced, and the reason
matters.** Removing the tie-break and running it three times passed three times:
PostgreSQL returns these rows in identifier order without being asked to,
because the join scans the definitions by primary key and the sort on one key
leaves that order intact.

So the tie-break changes no observed output today. It is written, and the test
pins it, because the current order is an accident of one query plan on one
table with five rows — the kind of thing that changes when an index is added,
when the table grows, or when the planner picks differently. A guarantee that
holds by accident is one nobody notices breaking.

The honest description of the test is therefore a regression guard on a stated
contract, not a demonstration that the contract is currently doing work. Saying
otherwise would be claiming an experiment that was run and came out the other
way.

## Delivery Status

`US-OFR-F05-001` moves `In Progress` → `Done`. All nine criteria are met and
evidenced.

**This makes all 50 Generated Stories `Done`.** The count recorded across the
implementation records — 49 `Done`, 1 `In Progress` — is superseded by this
document from today.

## What this record supersedes

`DELIVERY_STATUS_ADVANCEMENT.md` §"Why `US-OFR-F05-001` stops short of Done"
described an open question and named the alternatives. The question is answered
and the second alternative was taken. That section is left exactly as written —
it records what was true at its close, and a record edited to agree with a later
decision stops being evidence of anything — and now carries a note pointing
here.

> **Superseded (2026-08-31):** the paragraph below described a correction that
> was still waiting. It is no longer. `traceability-v1.1-candidate.md` — written
> on 2026-08-17 and carrying exactly the two corrections named here — passed
> independent review and was approved and frozen as v1.1 on 2026-08-31. It is
> now `docs/traceability.md`; v1.0 is preserved at
> `docs/traceability-v1.0-superseded.md`. The paragraph is left as written,
> because what a record claimed at its close is part of what it records.

Frozen `docs/traceability.md` §5 still asserts that all 50 Generated Stories
carry `Delivery Status: Not Started`. It remains untouched, for the same reason
as before: `DOCUMENT_LIFECYCLE.md` forbids editing a Frozen document in place.
Still two corrections waiting on one controlled superseding revision, not three
— what changed is what the second one should say. After I9 it was "49 `Done`,
1 `In Progress`"; it is now "50 `Done`".
