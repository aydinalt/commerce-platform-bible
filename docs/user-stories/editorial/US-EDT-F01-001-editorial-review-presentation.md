# US-EDT-F01-001 — Editorial Review Presentation

> **Freeze Note (0.1):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-07, **after** `EDITORIAL_FEATURE_REGISTRY.md` reached Frozen
> **v1.0** and `UX-0003` reached Frozen **v1.2** — in that order, so that this
> Story cites nothing that was not authoritative when it was frozen. This exact
> version must not be edited in place; a further change requires a controlled
> superseding revision under `DOCUMENT_LIFECYCLE.md` §7–§8.
>
> **Approval Note (0.1):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-07 — _"Registry (EDT F01 tahsisi) ve ardından
> US-EDT-F01-001 Story'si onaylanmış ve dondurulmuştur."_ In the same decision
> the Owner recorded that `AC-9` — a review surviving the withdrawal of the
> seller whose listing carried it — is what the Product Key backbone was
> secured for.
>
> **Two citations were corrected in the act of freezing, and both are recorded
> rather than silently fixed.** The draft cited the registry as "Draft v0.1" —
> true when written, and it would have frozen a Story pointing at a version that
> is no longer authoritative. It also sent a reader to §11 for the out-of-scope
> list, which is §10. Neither changes an Acceptance Criterion or a scenario; the
> content the Owner approved is unchanged.
>
> **Its chain is complete.** `PRD-0009` Frozen v0.3 owns the behaviour;
> `PRD-0001` Frozen v4.3 §5.12.4 and §8.2 own what it attaches to and where it
> is carried; `EDITORIAL_FEATURE_REGISTRY.md` Frozen v1.0 allocates `EDT F01`;
> `UX-0003` Frozen v1.2 §8.9 owns the experience. Nothing above this Story is a
> Draft.
>
> **Its behaviour owner is already authoritative.** `PRD-0009` **Frozen v0.3**.
> Every Acceptance Criterion below is traceable to a section of it, and no
> criterion here decides anything that document left open — §9.2 through §9.5
> are open in the Frozen PRD and are therefore **out of scope for this Story**,
> named in §10 rather than quietly resolved.

---

## 1. Metadata

- **Story ID:** US-EDT-F01-001
- **Domain:** Editorial (`EDT`)
- **Feature:** `EDT F01` — Editorial Review Presentation
- **Status:** Frozen
- **Version:** 0.1
- **Approval Date:** 2026-09-07
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-09-07
- **Frozen By:** Product Owner / Architecture Owner
- **Delivery Status:** Not Started
- **Behaviour owner:** `PRD-0009-editorial-review.md` **Frozen v0.3**
- **Release:** V1.1. Outside the Frozen V1 baseline.

## 2. Story

**As** a person deciding whether a product is any good,
**I want** to read the platform's own dated, attributed judgement of it,
**so that** I can weigh something more than a price table before I choose.

## 3. Purpose

A comparison platform answers "which is cheapest" mechanically. This Story
delivers the part that answers "is this one worth buying" — and, as much as
that, the part that lets a reader tell how old the answer is.

## 4. Business Value

`PRD-0009` §2 names two, and they are separable: the review is the page a search
engine can rank, and it is the platform's answer to the reader's reasonable
suspicion of a site that earns a commission on the click.

## 5. Description

An editorial review is written by the platform about a **product**, and hangs on
the Product Key that groups the Offerings of that product (`PRD-0001` Frozen
v4.3 §5.12.4). Where a Product Key has a review, an Offering carrying that key
presents it (`PRD-0001` §8.2).

The review carries a one-line verdict, a score, headed sections of prose, an
explicit list of pros and one of cons, an author, the date it was first
published and the date it was last re-checked.

## 6. References

- `PRD-0009` **Frozen v0.3** §5 (the parts), §5.1 (the two dates), §5.2 (the
  score), §6.1 (what it attaches to), §7 (boundaries), §8 (integrity).
- `PRD-0001` **Frozen v4.3** §5.12.4, §8.2.
- `EDITORIAL_FEATURE_REGISTRY.md` **Frozen v1.0** — `EDT F01`.
- `UX-0003-offering-detail.md` **Frozen v1.2** — §8.9 the review's placement,
  §8.9.1 its boundary with the crowd reviews, §8.9.2 absence and outage.

## 7. Acceptance Criteria

- **AC-1** — The system shall attach an editorial review to a Product Key, and
  shall attach no editorial review to an Offering. (`PRD-0009` §6.1)
- **AC-2** — The system shall hold at most one editorial review for a Product
  Key. (`PRD-0009` §3)
- **AC-3** — The system shall carry, for every editorial review, a verdict, a
  score, its sections, its pros, its cons, an author, the date first published
  and the date last updated. (`PRD-0009` §5)
- **AC-4** — The system shall present the date first published and the date last
  updated as two separate values, and shall present neither in place of the
  other. (`PRD-0009` §5.1)
- **AC-5** — The system shall express the editorial score on a nought-to-ten
  scale with one decimal. (`PRD-0009` §5.2)
- **AC-6** — The system shall present the editorial score and the crowd's
  average as separate values, and shall not merge, average or derive one from
  the other. (`PRD-0009` §5.2)
- **AC-7** — The system shall present the review of a Product Key on the
  presentation of any published Offering carrying that key. (`PRD-0001` §8.2)
- **AC-8** — The system shall present the same review, unduplicated, for every
  Offering sharing the key. (`PRD-0009` §6.1)
- **AC-9** — The system shall retain a Product Key's review when an Offering
  carrying that key is retired, hidden or withdrawn. (`PRD-0009` §6.1)
- **AC-10** — The system shall present a review's author with it. (`PRD-0009`
  §5)
- **AC-11** — The system shall present no editorial review as advertising, and
  shall place no advertising within one. (`PRD-0009` §8)
- **AC-12** — The system shall accept no commercial input — payment,
  commission rate, or partnership status — as a determinant of a review's score,
  its verdict, or whether it exists. (`PRD-0009` §8)
- **AC-13** — The system shall disclose, on a presentation carrying both a
  review and an affiliate handoff, that the platform earns a commission on the
  handoff. (`PRD-0009` §8)
- **AC-14** — The system shall present an Offering with no reviewed Product Key
  exactly as it presents one today, without a placeholder or an empty review.
  (`PRD-0001` §8.2 — presence only where the underlying fact is)

## 8. BDD

### Scenario: AC-1, AC-8 — one review, several sellers

```gherkin
Given three Businesses each publish an Offering carrying the Product Key "XZ200"
And an editorial review exists for "XZ200"
When a person opens any one of the three Offerings
Then the same review is presented
And no copy of it is held against any individual Offering
```

### Scenario: AC-9 — a seller leaving does not delete a judgement

```gherkin
Given an editorial review exists for a Product Key
And the only Offering carrying that key is retired
When the key is carried again by a new Offering
Then the review is presented with it, unchanged
```

### Scenario: AC-4 — the two dates

```gherkin
Given a review was first published in March and last re-checked last week
When a person reads it
Then both dates are presented
And neither is shown in place of the other
```

### Scenario: AC-4 — a review nobody has re-checked

```gherkin
Given a review has never been revised since publication
When a person reads it
Then the presentation does not imply it has been re-checked since
```

### Scenario: AC-6 — two scores, two questions

```gherkin
Given a product has an editorial score of 8.4 and a crowd average of 4.1
When a person reads the product's presentation
Then both are presented as distinct values
And no third number derived from them is presented
```

### Scenario: AC-11, AC-13 — the line against advertising

```gherkin
Given a presentation carries an editorial review and an affiliate handoff
When a person reads it
Then no advertising is placed within the review
And the commission relationship is disclosed on the presentation
```

### Scenario: AC-14 — most products have no review

```gherkin
Given an Offering carries a Product Key with no editorial review
When a person opens it
Then the presentation carries no review and no placeholder for one
```

## 9. Dependencies

### Depends on

- ~~`EDITORIAL_FEATURE_REGISTRY.md` reaching Frozen with `EDT F01` allocated.~~
  **Done: Frozen v1.0, 2026-09-07.**
- ~~`UX-0003-offering-detail.md` — a superseding revision for where the review
  sits on the page.~~ **Done: Frozen v1.2 §8.9, 2026-09-07.** This Story defines
  behaviour; §8.9 owns placement, and §8.9.1 owns the boundary with the crowd
  reviews that share the screen.

**No dependency remains open.** This Story is deliverable.

### Blocks

Nothing. No document waits on this Story.

## 10. Out of Scope

Named rather than omitted, because each is open in the Frozen behaviour owner
and a Story that answered one would be conferring a decision by implementation:

- **Authoring.** No surface for writing, editing or publishing a review is in
  scope. `PRD-0009` §9.3 is open and `EDITORIAL_FEATURE_REGISTRY.md` §2.1
  records that no Feature is allocated for it.
- **Any influence of the editorial score on ordering or ranking** (`PRD-0009`
  §9.2, open — and §8 is the reason it must stay a decision rather than a
  side effect).
- **Video** (`PRD-0009` §9.4, open; the platform has no media pipeline).
- **Whether a review is required, and what a page shows in its absence beyond
  AC-14's "nothing"** (`PRD-0009` §9.5, open).
- **The crowd review surface**, which `PRD-0001` Frozen v4.3 §4.1 records as
  having no behaviour owner and which the Owner deferred to a separate V1.1
  discussion. `PRD-0009` §12 sets the boundary this Story must not cross.

## 11. Notes

**AC-9 is the criterion that justifies the whole architecture**, and it is worth
saying so where an implementer will read it. A review attached to an Offering
would disappear the day that seller withdrew — taking with it a judgement about
a product two other sellers still list. That is the concrete failure the Product
Key backbone exists to prevent, and a test that exercises it is a test of the
decision, not only of the code.
