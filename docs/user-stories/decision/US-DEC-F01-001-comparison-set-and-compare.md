# US-DEC-F01-001 — Comparison Set and Compare

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Decision Feature Registry, does not make Compare mandatory, does not grant Decision Chat selection or handoff authority, does not make Affiliate Handoff authentication-required, does not convert Direct Contact into Messaging, does not give Completion external-success meaning, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, or the Frozen Decision Feature Registry; does not make Compare mandatory; does not grant Decision Chat selection or handoff authority; does not make Affiliate Handoff authenticated; does not convert Direct Contact into Messaging; does not give Completion external-success meaning; and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, Capability-boundary, cross-domain dependency, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Decision Feature `F01`. The identifier consumes Domain code `DEC` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F01` from Frozen `DECISION_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-DEC-F01-001` |
| Story Title | Comparison Set and Compare |
| Parent Story Document | `US-0004 Decision` (`US-0004-decision.md`) |
| Story Domain | Decision |
| Domain Code | `DEC` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Comparison and Decision Context |
| Feature | `F01` — Comparison Set and Compare |
| Feature ID | `F01` — owned by Frozen `DECISION_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | Direct Frozen assignment |
| Capability Reference | Decision Analysis |
| Perspective | Person optionally comparing eligible same-leaf Offerings |
| Behaviour Owner | `PRD-0004-decision.md` |
| Experience Owner | `UX-0004-compare.md` |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Done |
| Priority | Must |
| Story Size | L |
| Version | 1.0 |
| Last Updated | 2026-07-25 |
| Approval Date | 2026-07-25 |
| Approved By | Product Owner / Architecture Owner |
| Approved Candidate | In Review v0.1 |
| Freeze State | Frozen |
| Freeze Date | 2026-07-25 |
| Frozen By | Product Owner / Architecture Owner |
| Supersedes | None — first Story version |

---

## 2. Story Identification

| Segment | Value | Owner by Reference |
|---|---|---|
| Prefix | `US` | `USER_STORY_HANDBOOK.md` |
| `[DOMAIN]` | `DEC` | `REPOSITORY_GOVERNANCE.md` |
| `[FEATURE_ID]` | `F01` | Frozen `DECISION_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Maintain and present one valid Comparison Set containing two to five eligible same-leaf Offerings without inventing values, silently removing members, or making Compare mandatory.

---

## 4. Business Value

> **As a** person evaluating more than one eligible Offering  
> **I want** to explicitly add, remove, replace, and compare two to five compatible Offerings  
> **So that** I can inspect authoritative comparable values and continue with the current valid set while retaining full control

---

## 5. Description

Compare is optional. A valid Comparison Set contains two to five publicly eligible Offerings assigned to the same active leaf Category.

The person explicitly adds, removes, or replaces members. A sixth Offering is never added by silently removing an existing member.

Compare consumes only applicable Attributes whose authoritative `comparable` property is enabled. It presents an authoritative formatted value where supplied and `Not provided` where the Attribute applies but the Offering has no value.

`Not applicable` is not a V1 same-leaf Comparison result. Compare invents no value, default, applicability, unit, allowed value, normalization, ranking, winner, or recommendation.

Compare Start occurs when a valid Comparison Set opens. The current valid set may be passed to F02 as Decision Context without requiring the person to complete another Compare step.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0004-decision.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `DEC` code |
| Feature Registry | `DECISION_FEATURE_REGISTRY.md` | `F01` identity, scope label, references, and relationship classification |
| PRD | `PRD-0004-decision.md` | Decision behaviour and product rules |
| UX | `UX-0004-compare.md` | Comparison Set management, Attribute rows, invalid states, and Decision-flow continuation |
| Supporting PRD | `PRD-0001-offering.md` | Final Offering Public Eligibility and authoritative Offering values |
| Supporting PRD | `PRD-0006-platform.md` | Attribute definition, applicability, value kind, and comparable property |
| Owner Decision | `OWNER-DECISION-D17-COMPARE-OPTIONALITY-2026-07-21.md` | Compare optionality and two-to-five rule |
| Supporting Story | `US-DSC-F10-001-compare-preparation-discovery-return.md` — Frozen v1.0 | Transient same-leaf Compare-preparation return |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Decision own-domain authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Decision Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall make Compare optional and require no Comparison Set for a single-Offering Decision path.
- **AC-2** — The system shall accept a Comparison Set only when it contains between two and five publicly eligible Offerings.
- **AC-3** — The system shall require every Comparison Set member to share the same active leaf Category.
- **AC-4** — The system shall reject an ineligible Offering or an Offering from another leaf Category without altering the current valid set.
- **AC-5** — The system shall allow the person to explicitly add or remove an eligible same-leaf Offering while the resulting set remains valid.
- **AC-6** — The system shall require explicit removal or explicit replacement before a sixth Offering may enter a full five-member set.
- **AC-7** — The system shall present only applicable authoritative Attributes marked comparable for the shared active leaf Category.
- **AC-8** — The system shall present the authoritative formatted value where supplied and `Not provided` where an applicable comparable value is missing.
- **AC-9** — The system shall produce no `Not applicable` result for a V1 same-leaf Comparison Set.
- **AC-10** — The system shall invent no value, default, normalization, ranking, winner, or recommendation.
- **AC-11** — The system shall produce Compare Start when a valid Comparison Set is successfully opened in Compare.
- **AC-12** — The system shall make the unchanged current valid Comparison Set available to F02 when the person continues to Decision Flow.

---

## 8. BDD

### Scenario: AC-1 — Compare remains optional

```gherkin
Given one eligible Offering is being evaluated
When the person continues toward Decision without creating a Comparison Set
Then Compare is not required
And the single-Offering route remains available
```
### Scenario: AC-2 — A valid set contains two to five eligible members

```gherkin
Given a proposed set contains two to five publicly eligible Offerings
When Compare entry is evaluated
Then the member-count and eligibility conditions are satisfied
```
### Scenario: AC-3 — Every member shares one active leaf Category

```gherkin
Given Offerings are proposed for one Comparison Set
When their active leaf Categories are evaluated
Then every accepted member belongs to the same active leaf Category
```
### Scenario: AC-4 — Invalid member is rejected without set mutation

```gherkin
Given a current valid Comparison Set
When the person attempts to add an ineligible Offering or an Offering from another leaf Category
Then the attempted Offering is not added
And the current valid set remains unchanged
```
### Scenario: AC-5 — Person explicitly adds or removes a member

```gherkin
Given a Comparison Set can remain within the two-to-five bounds
When the person explicitly adds or removes an eligible same-leaf Offering
Then the requested membership change is applied
And no other member is changed silently
```
### Scenario: AC-6 — Sixth member requires explicit replacement

```gherkin
Given a Comparison Set contains five Offerings
When the person attempts to add a sixth eligible same-leaf Offering
Then no existing member is removed automatically
And the person must explicitly remove or replace one member
And the resulting set contains no more than five Offerings
```
### Scenario: AC-7 — Only authoritative comparable Attributes are presented

```gherkin
Given a valid same-leaf Comparison Set
When comparison rows are composed
Then only applicable Attributes with comparable enabled are presented
```
### Scenario: AC-8 — Value and missing value remain distinct

```gherkin
Given one applicable comparable Attribute
When an Offering has an authoritative value
Then the authoritative formatted value is presented
When another Offering has no supplied value
Then `Not provided` is presented
```
### Scenario: AC-9 — Same-leaf Compare produces no Not applicable

```gherkin
Given every Comparison Set member shares the same active leaf Category
When applicable comparable rows are presented
Then `Not applicable` is not produced
```
### Scenario: AC-10 — Compare remains authoritative and non-prescriptive

```gherkin
Given Compare presents the current valid set
When values and differences are shown
Then no value, default, normalization, ranking, winner, or recommendation is invented
```
### Scenario: AC-11 — Valid Compare entry produces Compare Start

```gherkin
Given a valid Comparison Set exists
When the set successfully opens in Compare
Then Compare Start occurs
```
### Scenario: AC-12 — Current valid set continues unchanged

```gherkin
Given a valid Comparison Set is open
When the person continues to Decision Flow
Then F02 receives the unchanged current Comparison Set
And Compare does not select an Offering or handoff path
```

---

## 9. Dependencies

### Depends On

- `PRD-0001-offering.md` — public eligibility, Category assignment, and authoritative Offering values.
- `PRD-0006-platform.md` — Attribute applicability and comparable properties.

### Blocks

- `US-DEC-F02-001` — a valid Comparison Set may become the current Decision Context.

---

## 10. Story Size

**L**

One cohesive comparison outcome with bounded set membership, explicit replacement, authoritative Attribute presentation, optionality, invalid-member handling, and Compare Start.

---

## 11. Out of Scope

- Single-Offering or Comparison-Set Decision Context ownership — F02.
- Decision Chat, Offering selection, handoff, and Completion — F03–F07.
- Cross-category comparison, ranking, recommendation, winner selection, or normalization.
- Implementation of set storage, URL state, session state, APIs, or analytics events.

---

## 12. Definition of Ready

Readiness is governed by `USER_STORY_HANDBOOK.md` §11 and is referenced here, not duplicated.

Approval or Freeze of this document does not itself commit the Story to delivery.

---

## 13. Definition of Done

Completion is governed by `USER_STORY_HANDBOOK.md` §18 and is referenced here, not duplicated.

Applicable Engineering and QA obligations may be consumed from `ENGINEERING_CONSTITUTION.md` only after that document becomes authoritative. Its current Draft state is not a Story behaviour owner and does not advance Delivery Status.

---

## 14. Story Validation Checklist

- [x] Represents one bounded Decision outcome
- [x] Provides observable person or platform value
- [x] Independently understandable
- [x] Independently testable
- [x] Traceable to one Parent, Epic, Feature, PRD, and exact applicable UX
- [x] Domain code and Feature ID resolve to authoritative owners
- [x] Relationship classification and Capability reference match the Frozen Feature Registry
- [x] No duplicate Story identified in the current Decision package
- [x] No implementation details
- [x] No invented upstream behaviour
- [x] Every Acceptance Criterion begins with “The system shall…”
- [x] Every Acceptance Criterion has one explicitly numbered Story-internal BDD scenario

---

## 15. Notes

F01 owns Compare mechanics under Decision Analysis; it does not own Decision Context, selection, handoff, or Completion.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
