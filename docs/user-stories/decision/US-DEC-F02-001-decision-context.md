# US-DEC-F02-001 — Decision Context

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Decision Feature Registry, does not make Compare mandatory, does not grant Decision Chat selection or handoff authority, does not make Affiliate Handoff authentication-required, does not convert Direct Contact into Messaging, does not give Completion external-success meaning, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, or the Frozen Decision Feature Registry; does not make Compare mandatory; does not grant Decision Chat selection or handoff authority; does not make Affiliate Handoff authenticated; does not convert Direct Contact into Messaging; does not give Completion external-success meaning; and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, Capability-boundary, cross-domain dependency, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Decision Feature `F02`. The identifier consumes Domain code `DEC` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F02` from Frozen `DECISION_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-DEC-F02-001` |
| Story Title | Decision Context |
| Parent Story Document | `US-0004 Decision` (`US-0004-decision.md`) |
| Story Domain | Decision |
| Domain Code | `DEC` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Comparison and Decision Context |
| Feature | `F02` — Decision Context |
| Feature ID | `F02` — owned by Frozen `DECISION_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | Direct Frozen assignment |
| Capability Reference | Decision Support |
| Perspective | Person entering one current Decision flow |
| Behaviour Owner | `PRD-0004-decision.md` |
| Experience Owner | `UX-0009-decision-flow.md` §6 |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Not Started |
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
| `[FEATURE_ID]` | `F02` | Frozen `DECISION_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Establish exactly one current-flow Decision Context from one eligible Offering or one valid Comparison Set and keep unrelated decisions or persistent personal history outside that context.

---

## 4. Business Value

> **As a** person beginning or continuing one Decision journey  
> **I want** the exact current eligible Offering context to remain bounded and understandable  
> **So that** Decision Chat and selection operate only on the decision I am currently making

---

## 5. Description

Exactly one Decision Context exists for the current Decision flow: one eligible Offering or one valid Comparison Set.

The context may carry applicable authoritative Offering Presentation information, comparable Attribute values, and current-flow Chat inputs. It does not merge unrelated sets or carry cross-decision personal memory.

A valid Comparison Set received from F01 remains unchanged on entry. A single eligible Offering may enter without Compare.

When the context becomes invalid, Decision Chat must not claim invalid Offering information and handoff actions remain unavailable until the person repairs or replaces the context.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0004-decision.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `DEC` code |
| Feature Registry | `DECISION_FEATURE_REGISTRY.md` | `F02` identity, scope label, references, and relationship classification |
| PRD | `PRD-0004-decision.md` | Decision behaviour and product rules |
| UX | `UX-0009-decision-flow.md` §6 | Decision Context form, current-flow boundary, and invalid-context behaviour |
| Supporting UX | `UX-0003-offering-detail.md` | Single eligible Offering entry |
| Supporting Feature | `US-DEC-F01-001` | Valid Comparison Set source |
| Supporting Story | `US-OFR-F05-001-full-offering-detail-presentation.md` — Frozen v2.1 | Complete Offering Presentation source |
| Owner Decision | `OWNER-DECISION-D17-COMPARE-OPTIONALITY-2026-07-21.md` | Single and multi-Offering paths |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Decision own-domain authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Decision Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall contain exactly one eligible Offering or one valid Comparison Set.
- **AC-2** — The system shall accept one eligible Offering without requiring Compare.
- **AC-3** — The system shall accept the unchanged valid Comparison Set supplied by F01.
- **AC-4** — The system shall limit the Decision Context to the current Decision flow.
- **AC-5** — The system shall merge no unrelated Offering, Comparison Set, or prior decision into the current Decision Context.
- **AC-6** — The system shall create no persistent personal Decision history, cross-decision memory, or personal Decision profile.
- **AC-7** — The system shall make Decision Chat and handoff actions unavailable when no valid Decision Context exists.
- **AC-8** — The system shall prevent Decision Chat from claiming information belonging to an invalid or removed Offering.
- **AC-9** — The system shall allow the person to repair the set through UX-0004, choose another eligible Offering, or leave the flow when context becomes invalid.

---

## 8. BDD

### Scenario: AC-1 — Context has one exact form

```gherkin
Given a Decision flow is entered
When Decision Context is established
Then it contains exactly one eligible Offering or one valid Comparison Set
```
### Scenario: AC-2 — Single Offering enters without Compare

```gherkin
Given one Offering is publicly eligible
When the person enters Decision Flow from Offering Detail
Then that Offering becomes the current Decision Context
And no Comparison Set is required
```
### Scenario: AC-3 — Valid Comparison Set enters unchanged

```gherkin
Given F01 supplies one valid Comparison Set
When Decision Context is established
Then the exact unchanged set becomes the current Decision Context
```
### Scenario: AC-4 — Context is current-flow only

```gherkin
Given one Decision Context is active
When the current Decision flow continues
Then the context remains limited to that flow
```
### Scenario: AC-5 — Unrelated decisions are not merged

```gherkin
Given another Offering set or prior decision exists outside the current flow
When the current Decision Context is used
Then the unrelated context is not merged
```
### Scenario: AC-6 — Context creates no persistent personal memory

```gherkin
Given the current Decision flow ends
When Decision Context persistence is evaluated
Then no persistent personal Decision history, cross-decision memory, or Decision profile is created
```
### Scenario: AC-7 — Invalid context blocks downstream actions

```gherkin
Given the current Decision Context is invalid
When Decision Chat and handoff availability are evaluated
Then Decision Chat does not begin
And handoff actions remain unavailable
```
### Scenario: AC-8 — Invalid Offering information is not claimed

```gherkin
Given an Offering is removed or becomes ineligible inside the current context
When Decision Chat content is evaluated
Then Chat does not claim information for that invalid Offering
```
### Scenario: AC-9 — Person controls invalid-context recovery

```gherkin
Given the current Decision Context becomes invalid
When recovery options are presented
Then the person may repair the set in UX-0004, choose another eligible Offering, or leave
And no replacement context is invented
```

---

## 9. Dependencies

### Depends On

- `US-DEC-F01-001` or `UX-0003-offering-detail.md` — a valid multi- or single-Offering source exists.
- `PRD-0001-offering.md` — each current Offering remains publicly eligible.

### Blocks

- `US-DEC-F03-001` — Decision Chat consumes exactly one valid Decision Context.
- `US-DEC-F04-001` — explicit selection occurs inside the current Decision Context.

---

## 10. Story Size

**M**

One bounded-context outcome with two valid forms, current-flow scope, invalidation, non-persistence, and controlled recovery.

---

## 11. Out of Scope

- Comparison mechanics — F01.
- Decision Chat behaviour — F03.
- Offering selection and handoff — F04–F06.
- Saved history, personal memory, profile, or cross-decision merging.

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

F02 owns the bounded input to Decision Support; it does not perform Compare, Chat, selection, or external action.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
