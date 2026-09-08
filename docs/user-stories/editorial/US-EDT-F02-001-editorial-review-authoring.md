# US-EDT-F02-001 — Editorial Review Authoring

> **Freeze Note (0.1):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-08, **fourth and last in the order he set out**, and after
> `EDITORIAL_FEATURE_REGISTRY.md` reached Frozen **v1.1** with `EDT F02`
> authoritative — in that order, so that this Story cites nothing that was not
> authoritative when it was frozen. This exact version must not be edited in
> place; a further change requires a controlled superseding revision under
> `DOCUMENT_LIFECYCLE.md` §7–§8.
>
> **Approval Note (0.1):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-08 — _"EDITORIAL_FEATURE_REGISTRY v1.1 ve
> US-EDT-F02-001 taslaklarını resmi olarak onaylıyorum. İkisini de derhal
> dondurabilirsin."_ Approval and Freeze were taken in one decision.
>
> **This Story is Frozen with one dependency still open, which departs from the
> precedent `US-EDT-F01-001` set eight days earlier, and the departure is
> recorded rather than smoothed over.** That Story was frozen only once its
> §9 list was empty and it could say _"No dependency remains open. This Story is
> deliverable."_ This one cannot say that: **no UX document describes the Admin
> authoring screen.** Freezing it settles what the surface must and must not
> **do** — which is what a Story is for, and what the implementation phase needs
> — and settles nothing about what it looks like.
>
> **The condition that follows is binding on delivery, not on this Freeze.** The
> Owner's standing rule is that everything visible comes from his prototype, and
> that anything not in it must first be drawn in the prototype's language and
> approved. The prototype draws the review as a reader meets it and draws no
> authoring screen at all. **Therefore: no part of this Story that puts pixels on
> a screen may be built until that screen is drawn and approved.** The behaviour
> below — the states, the dates, the refusals, the audit entries, the closed
> shape of §7's AC-16 — is not visual and is not waiting on it.
>
> **Delivery Status is `Not Started`, and this is the second Story in the
> repository to carry it.** The other is `US-EDT-F01-001`. The Owner has
> commissioned them to be built as one sealed architecture.
>
> **Its behaviour owner is already authoritative.** `PRD-0009` **Frozen v0.4**
> §13, frozen earlier the same day, immediately after `PRD-0006` reached Frozen
> **v2.7** §22.2. Every Acceptance Criterion below traces to a subsection of §13
> or to that §22.2 row, and no criterion here decides anything either document
> left open.
>
> **Its Feature is authoritative.** `EDITORIAL_FEATURE_REGISTRY.md` **Frozen
> v1.1** allocates `EDT F02`, frozen immediately before this Story. The Owner
> settled the allocation against the words of his own earlier instruction, which
> had named the Platform registry: the test is which document owns the behaviour,
> and `PRD-0009` §13 owns this one.
>
> **What remains open is §9's second entry, and only that.** `UX-0006` owns the
> Admin dashboard and has no section for this screen; `UX-0003` §8.9 governs only
> the reader's side.
>
> **This Story is deliberately not written from the prototype**, and that is the
> one place it departs from the standing rule that everything visible comes from
> it. The prototype draws the review as a reader meets it and draws no authoring
> screen at all — there is nothing to take from it. The rule is therefore
> discharged the other way: **no visual decision is made here**, and the binding
> condition above keeps it that way until the screen is drawn and approved.

---

## 1. Metadata

- **Story ID:** US-EDT-F02-001
- **Domain:** Editorial (`EDT`)
- **Feature:** `EDT F02` — Editorial Review Authoring (`EDITORIAL_FEATURE_REGISTRY.md` **Frozen v1.1**)
- **Status:** Frozen
- **Version:** 0.1
- **Approval Date:** 2026-09-08
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-09-08
- **Frozen By:** Product Owner / Architecture Owner
- **Delivery Status:** Not Started
- **Behaviour owner:** `PRD-0009-editorial-review.md` **Frozen v0.4** §13
- **Also governed by:** `PRD-0006-platform.md` **Frozen v2.7** §22.2, §22.5, §23
- **Release:** V1.1. Outside the Frozen V1 baseline.

## 2. Story

**As** the platform administrator,
**I want** to write, publish, re-check and withdraw an editorial review through a
surface the platform owns,
**so that** the platform's own judgement of a product reaches readers without
anybody editing rows by hand, and so that a judgement that turns out to be wrong
can be taken down by the surface that published it.

## 3. Purpose

The Owner's three reasons for building this beside the reading surface rather
than after it are recorded in `PRD-0009` §13's opening, and they are the reasons
this Story exists at all:

- **Operator intervention.** Reviews entered by raw SQL or a script bypass the
  data-integrity, audit-trail and author-identity rules this repository spent
  months building. A path that bypasses them is not a temporary convenience; it
  is the path somebody uses again.
- **Blind schema design.** A read model built without knowing what writing
  constrains gets refactored the day writing arrives.
- **Boundaries are tested by opposites.** A reading surface designed with no
  writing surface beside it has boundaries nobody has pushed on.

## 4. Business Value

`PRD-0009` §2 names two: the review is the page a search engine can rank, and it
is the platform's answer to a reader's reasonable suspicion of a site that earns
a commission on the click. **Neither survives an authoring path that is not
answerable.** A judgement nobody can be shown to stand behind answers the
suspicion with another reason for it.

## 5. Description

An editorial review is written by the platform administrator about a **product**,
against the Product Key that groups that product's Offerings. It moves through
three states, carries a byline that is content rather than an identity, and
carries two dates that answer two different questions — when it was first
published, and when it was last re-checked.

Every act on this surface is recorded in the Admin audit trail. Reading a
published review is not: it is published content.

## 6. References

- `PRD-0009` **Frozen v0.4** §13.1 (who may write), §13.2 (byline and account),
  §13.3 (the three states), §13.4 (what moves the dates), §13.5 (what
  publication requires), §13.6 (what the surface cannot express), §13.7
  (cadence), §13.8 (every write recorded); §3 (one review per key), §5 (the
  parts), §5.1 (the two dates), §5.2 (the score), §8 (integrity).
- `PRD-0006` **Frozen v2.7** §22.2 (the row that records these acts), §22.1 (an
  entry carries no name and no email address), §22.3 (append-only, and that a
  failed entry does not fail the act), §22.5 (who may read the trail), §23
  (personal data on Admin surfaces).
- `PRD-0008` **Draft v0.2** §4 — the reason no editor tier is invented here.
- `EDITORIAL_FEATURE_REGISTRY.md` **Frozen v1.1** — `EDT F02`.

## 7. Acceptance Criteria

### Who, and in whose name

- **AC-1** — The system shall permit authoring, publication, revision,
  re-checking and withdrawal of an editorial review **only** to the platform
  administrator. (`PRD-0009` §13.1)
- **AC-2** — The system shall carry a review's byline as authored content, and
  shall not derive it from the account that performed the act. (`PRD-0009`
  §13.2)
- **AC-3** — The system shall not present the acting account to any reader of a
  review. (`PRD-0009` §13.2)

### The three states

- **AC-4** — The system shall hold every editorial review in exactly one of
  three states: Draft, Published, Withdrawn. (`PRD-0009` §13.3)
- **AC-5** — The system shall present no Draft review on any reader-facing
  surface. (`PRD-0009` §13.3)
- **AC-6** — The system shall cease presenting a review when it is withdrawn,
  and shall retain the record that it existed and who withdrew it. (`PRD-0009`
  §13.3)
- **AC-7** — The system shall provide no operation that deletes an editorial
  review. (`PRD-0009` §13.3 — withdrawal exists so that removal is not a
  database operation)

### The two dates — the criteria §5.1 depends on

- **AC-8** — The system shall set a review's first-published date once, at first
  publication, and shall never change it thereafter. (`PRD-0009` §13.4)
- **AC-9** — The system shall move a review's last-updated date **only** when the
  writer states that the review has been re-checked, and shall not move it as a
  consequence of saving. (`PRD-0009` §13.4)
- **AC-10** — The system shall require the re-check statement as an act separate
  from saving, and shall not default it to true. (`PRD-0009` §13.4)
- **AC-11** — The system shall move neither date when a Draft is edited.
  (`PRD-0009` §13.4)

### What publication requires

- **AC-12** — The system shall refuse to publish a review that lacks any of: a
  verdict, a score, at least one section, at least one pro, at least one con, or
  an author byline. (`PRD-0009` §13.5)
- **AC-13** — The system shall refuse a score outside `0`–`10`, and shall hold
  it to one decimal. (`PRD-0009` §5.2, §13.5)
- **AC-14** — The system shall refuse a review whose Product Key the catalogue
  does not carry. (`PRD-0009` §13.5 — a review of a key nothing carries is a
  judgement about nothing)
- **AC-15** — The system shall refuse to create a second editorial review for a
  Product Key that already has one, in any state. (`PRD-0009` §3, §13.5)

### The line against commerce

- **AC-16** — The system shall provide, on the authoring surface and in the
  stored review, **no field, flag, state or note by which a commercial
  relationship — sponsorship, partnership, commission rate, payment — can be
  expressed.** (`PRD-0009` §13.6, §8)

### Cadence, made visible

- **AC-17** — The system shall present, in the administrator's list of reviews,
  how long it has been since each review was last re-checked. (`PRD-0009` §13.7)
- **AC-18** — The system shall enforce no maximum age and shall refuse no act on
  account of a review's age. (`PRD-0009` §13.7 — an interval nobody keeps is
  worse than none)

### The trail

- **AC-19** — The system shall write an Admin audit entry for each of: creating,
  publishing, revising, re-checking and withdrawing an editorial review.
  (`PRD-0006` §22.2)
- **AC-20** — The system shall record no entry when a review is read, by an
  administrator or by anyone else. (`PRD-0009` §13.8)
- **AC-21** — The system shall write no name and no email address into an audit
  entry for these acts. (`PRD-0006` §22.1, §23)
- **AC-22** — The system shall not fail an authoring act because its audit entry
  could not be written, and shall log the lost entry where operators look.
  (`PRD-0006` §22.3)

## 8. BDD

### Scenario: AC-9, AC-11 — a typo is not a re-check

```gherkin
Given a review was published in March and re-checked in June
When the administrator corrects a comma and saves without stating a re-check
Then the last-updated date still reads June
And the first-published date still reads March
```

### Scenario: AC-9, AC-10 — a re-check is a deliberate act

```gherkin
Given a published review last re-checked in June
When the administrator republishes it and states that it has been re-checked
Then the last-updated date moves to today
And the first-published date is unchanged
```

### Scenario: AC-8 — publication happens once

```gherkin
Given a review was first published in March, withdrawn in May and published again in July
When a person reads it
Then the first-published date reads March
```

### Scenario: AC-6, AC-7 — a wrong judgement comes down without a database operation

```gherkin
Given a published review is found to be wrong
When the administrator withdraws it
Then it is presented on no Offering carrying its Product Key
And the audit trail records who withdrew it and when
And no operation exists that removes it from the record
```

### Scenario: AC-5 — a draft reaches nobody

```gherkin
Given a review for a Product Key is in Draft
When a person opens an Offering carrying that key
Then the presentation carries no review and no placeholder for one
```

### Scenario: AC-12 — a review with no cons is an advertisement

```gherkin
Given a review carries a verdict, a score, a section, a byline and two pros
And it carries no cons
When the administrator attempts to publish it
Then publication is refused
And the refusal names what is missing
```

### Scenario: AC-15 — the second review is a revision of the first

```gherkin
Given an editorial review exists for the Product Key "XZ200"
When the administrator attempts to create a second review for "XZ200"
Then creation is refused
```

### Scenario: AC-16 — the request that has nowhere to go

```gherkin
Given a partner asks for their product's review to be marked as sponsored
When the administrator opens the authoring surface
Then no field, flag or note exists in which that could be recorded
```

### Scenario: AC-2, AC-3 — two facts, kept apart

```gherkin
Given the administrator publishes a review under the byline "Editör ekibi"
When a person reads it
Then the byline reads "Editör ekibi"
And the account that published it is not presented
And the audit trail records that account
```

### Scenario: AC-19, AC-20 — writing is recorded, reading is not

```gherkin
Given a published editorial review
When the administrator opens it to read and closes it unchanged
Then no audit entry is written
When the administrator republishes it stating a re-check
Then an audit entry is written for that act
```

## 9. Dependencies

### Depends on

- ~~`EDITORIAL_FEATURE_REGISTRY.md` reaching **Frozen** with `EDT F02`
  authoritative.~~ **Done: Frozen v1.1, 2026-09-08**, frozen immediately before
  this Story.
- **A UX section owning the Admin authoring screen. STILL OPEN.** None exists. `UX-0006`
  owns the Admin dashboard and has no section for this surface. This Story
  makes no visual decision, and the screen must be drawn in the prototype's
  language and approved before any of it is built. The Freeze Note makes that a
  binding condition on delivery.

### Blocks

Nothing yet — but see §11. The implementation the Owner has commissioned builds
reading and writing as one architecture, so `US-EDT-F01-001` and this Story are
delivered together even though neither blocks the other on paper.

## 10. Out of Scope

Named rather than omitted, because each is either open in the Frozen behaviour
owner or deliberately excluded by it:

- **An editor tier.** `PRD-0009` §13.1 reserves authoring to the platform
  administrator and states plainly that this does not scale. A tier is an
  authorization question and belongs in a `PRD-0008` successor, with the audit
  question answered alongside it (`PRD-0006` §22.5).
- **A cadence interval.** `PRD-0009` §13.7 sets none deliberately. AC-17 shows
  the age; AC-18 forbids enforcing one.
- **The reader's side of the review**, which is `US-EDT-F01-001` and `EDT F01`.
- **Editorial selection** — not in `PRD-0009` at all, and no identifier reserved
  for it (`EDITORIAL_FEATURE_REGISTRY.md` §2.2).
- **Any influence of the editorial score on ordering or ranking** (`PRD-0009`
  §9.2, open).
- **Video** (`PRD-0009` §9.4, open) and **whether a review is required at all**
  (`PRD-0009` §9.5, open).
- **Exact field lengths and storage limits.** `PRD-0009` §13.5 leaves these to
  implementation on purpose. They are an engineering decision, to be recorded
  with the implementation rather than in this Story.

## 11. Notes

**AC-9 is the criterion the reading Story depends on**, and it is worth saying so
where an implementer will read it. `US-EDT-F01-001` AC-4 requires the two dates
to be presented as separate values and neither shown in place of the other. That
criterion is only worth meeting if the dates mean different things — and they
stop meaning different things the moment a save moves the second one. **A
correct read surface built over a write surface that touches `updatedAt` on
every save presents a lie carefully.**

**AC-16 is a criterion about the absence of something**, which is the hardest
kind to keep. A test that asserts a field does not exist passes trivially on the
day it is written and is the first thing to rot. The way it stays honest is that
the stored shape and the contract are asserted to be closed — the same
`.strict()` discipline `US-PLT-F13-001` AC-3 relies on — so a field added later
fails a test rather than passing one.

**AC-22 is not leniency.** `PRD-0006` §22.3 decided this for every Admin act: the
act has already happened by the time the entry is written, and refusing it would
report a failure that did not occur. The cost is named there rather than hidden
here.
