# US-DEC-F04-001 — Explicit Offering Selection

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Decision Feature Registry, does not make Compare mandatory, does not grant Decision Chat selection or handoff authority, does not make Affiliate Handoff authentication-required, does not convert Direct Contact into Messaging, does not give Completion external-success meaning, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, or the Frozen Decision Feature Registry; does not make Compare mandatory; does not grant Decision Chat selection or handoff authority; does not make Affiliate Handoff authenticated; does not convert Direct Contact into Messaging; does not give Completion external-success meaning; and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, Capability-boundary, cross-domain dependency, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Decision Feature `F04`. The identifier consumes Domain code `DEC` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F04` from Frozen `DECISION_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-DEC-F04-001` |
| Story Title | Explicit Offering Selection |
| Parent Story Document | `US-0004 Decision` (`US-0004-decision.md`) |
| Story Domain | Decision |
| Domain Code | `DEC` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Assistive Decision and Selection |
| Feature | `F04` — Explicit Offering Selection |
| Feature ID | `F04` — owned by Frozen `DECISION_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | Direct Frozen assignment |
| Capability Reference | Contact & Action |
| Perspective | Person choosing one eligible Offering before an external handoff |
| Behaviour Owner | `PRD-0004-decision.md` |
| Experience Owner | `UX-0009-decision-flow.md` §8 |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Done |
| Priority | Must |
| Story Size | M |
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
| `[FEATURE_ID]` | `F04` | Frozen `DECISION_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Require one person-controlled Selected Offering from the current valid Decision Context before any handoff path becomes available.

---

## 4. Business Value

> **As a** person ready to move from evaluation toward one approved handoff  
> **I want** to explicitly select, change, or clear one eligible Offering  
> **So that** no Chat, system rule, or handoff path chooses or acts for me

---

## 5. Description

Every handoff requires one explicit Selected Offering. A single-Offering Decision Context still requires explicit selection or confirmation.

For a Comparison Set, selection must be a current eligible member and selecting one member does not remove the others.

Selection clears when the selected member is removed or becomes ineligible, the Decision Context is replaced, or the person changes or clears selection.

No handoff action is active until a current eligible Selected Offering exists. Decision Chat never selects, confirms, or changes selection.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0004-decision.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `DEC` code |
| Feature Registry | `DECISION_FEATURE_REGISTRY.md` | `F04` identity, scope label, references, and relationship classification |
| PRD | `PRD-0004-decision.md` | Decision behaviour and product rules |
| UX | `UX-0009-decision-flow.md` §8 | Explicit selection, single/set behaviour, and clearing |
| Supporting Feature | `US-DEC-F02-001` | Current valid Decision Context |
| Supporting Feature | `US-DEC-F03-001` | Assistive-only Chat boundary |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Decision own-domain authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Decision Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall require explicit person selection or confirmation of one eligible Offering before any handoff becomes available.
- **AC-2** — The system shall allow the one eligible Offering in a single-Offering Decision Context to be explicitly selected without Compare.
- **AC-3** — The system shall require a Selected Offering from a Comparison Set to be a current eligible member of that set.
- **AC-4** — The system shall leave all non-selected Comparison Set members in the current set after one member is selected.
- **AC-5** — The system shall allow the person to explicitly change or clear the Selected Offering.
- **AC-6** — The system shall clear selection when the selected member is removed, becomes ineligible, or the Decision Context is replaced.
- **AC-7** — The system shall keep Affiliate Handoff and Direct Contact unavailable while no current eligible Selected Offering exists.
- **AC-8** — The system shall prevent Decision Chat from selecting, confirming, changing, or clearing the Selected Offering.
- **AC-9** — The system shall produce no Completion when selection clears or becomes invalid before handoff initiation.

---

## 8. BDD

### Scenario: AC-1 — Every handoff requires explicit selection

```gherkin
Given a valid Decision Context exists
When handoff availability is evaluated
Then one eligible Offering must be explicitly selected or confirmed by the person
```
### Scenario: AC-2 — Single Offering may be selected directly

```gherkin
Given the Decision Context contains one eligible Offering
When the person explicitly selects or confirms it
Then it becomes the Selected Offering
And Compare is not required
```
### Scenario: AC-3 — Comparison selection stays inside the set

```gherkin
Given the Decision Context is a Comparison Set
When the person selects an Offering
Then the Offering must be a current eligible member of that set
```
### Scenario: AC-4 — Selection does not remove other members

```gherkin
Given a valid Comparison Set contains multiple members
When one member is selected
Then the remaining members stay in the set
```
### Scenario: AC-5 — Person may change or clear selection

```gherkin
Given one Offering is selected
When the person explicitly changes or clears the selection
Then the requested selection state is applied
```
### Scenario: AC-6 — Invalidated selection clears

```gherkin
Given one Offering is selected
When it is removed, becomes ineligible, or the Decision Context is replaced
Then selection is cleared
```
### Scenario: AC-7 — No selection means no handoff

```gherkin
Given no current eligible Offering is selected
When handoff actions are evaluated
Then Affiliate Handoff and Direct Contact remain unavailable
```
### Scenario: AC-8 — Decision Chat cannot mutate selection

```gherkin
Given Decision Chat is active
When selection state is evaluated
Then Chat does not select, confirm, change, or clear an Offering
```
### Scenario: AC-9 — Selection invalidation produces no Completion

```gherkin
Given the Selected Offering clears or becomes ineligible before handoff initiation
When Completion is evaluated
Then no Completion occurs
```

---

## 9. Dependencies

### Depends On

- `US-DEC-F02-001` — a valid current Decision Context exists.

### Blocks

- `US-DEC-F05-001` — public Affiliate Handoff may become available.
- `US-DEC-F06-001` — authenticated Direct Contact may become available.

---

## 10. Story Size

**M**

One person-controlled selection outcome with single/set rules, explicit change, invalidation, handoff gating, and Chat non-interference.

---

## 11. Out of Scope

- Comparison Set membership — F01.
- Decision Chat assistance — F03.
- Handoff availability and execution — F05/F06.
- Completion — F07.

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

F04 is the person-controlled prerequisite inside Contact & Action; it does not initiate or complete a handoff.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
