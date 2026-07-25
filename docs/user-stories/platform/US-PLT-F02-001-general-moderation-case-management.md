# US-PLT-F02-001 — General Moderation Case Management

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Platform Feature Registry, does not change PRD/UX behaviour, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story; does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, or the Frozen Platform Feature Registry; does not create a separate Admin identity, account, or login; does not add Admin authorization grant/remove, delegation, tier management, or self-service provisioning; does not grant Business ownership through Admin authorization; does not merge General Moderation with Affiliate Destination Administration; does not treat case state as target state; does not move target-owned results to Platform; does not convert Request Correction into Messaging or automatic closure; does not weaken Category, Domain, retirement, or Attribute mutation-safety rules; does not expand Basic Analytics; does not introduce generic Platform Configuration or Settings scope; does not apply non-blocking observations as candidate changes; and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, Capability-boundary, cross-domain dependency, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Platform Feature `F02`. The identifier consumes Domain code `PLT` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F02` from Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-PLT-F02-001` |
| Story Title | General Moderation Case Management |
| Parent Story Document | `US-0006 Platform` (`US-0006-platform.md`) |
| Story Domain | Platform |
| Domain Code | `PLT` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Admin Context and Moderation Workload |
| Feature | `F02` — General Moderation Case Management |
| Feature ID | `F02` — owned by Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | No Capability Architecture required |
| Capability Reference | Not required under ADR-0007 |
| Perspective | Authorized Admin managing an existing approved moderation workload |
| Behaviour Owner | `PRD-0006-platform.md` |
| Experience Owner | `UX-0006-admin-dashboard.md` §§7–8 |
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
| `[DOMAIN]` | `PLT` | `REPOSITORY_GOVERNANCE.md` |
| `[FEATURE_ID]` | `F02` | Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Represent one General Moderation case as Open or Closed, preserve target-state ownership, and require explicit closure after an approved action or no-action decision.

---

## 4. Business Value

> **As a** authorized Admin reviewing an existing approved target  
> **I want** to open, review, and explicitly close a bounded moderation case  
> **So that** workflow status remains distinct from the target's authoritative product state

---

## 5. Description

General Moderation case statuses are exactly `Open` and `Closed`. Surfacing or opening a case produces Open.

Opening, reviewing, or closing a case changes no target lifecycle, moderation, access, visibility, eligibility, or validation state by itself.

The exact seven General Moderation actions are Request Correction, Hide Offering, Restore Offering, Restrict Business, Restore Business, Suspend User, and Reinstate User.

The Admin experience presents only actions currently valid for the target state and acting authority.

Request Correction keeps the case Open. After re-review, an Admin may explicitly close after an approved action or recorded no-action decision.

Affiliate Destination Administration is a separate action family and is not added to General Moderation.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0006-platform.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `PLT` code |
| Feature Registry | `PLATFORM_FEATURE_REGISTRY.md` | `F02` identity, scope label, references, and relationship classification |
| PRD | `PRD-0006-platform.md` | Platform behaviour and product rules |
| UX | `UX-0006-admin-dashboard.md` §§7–8 | Case status, action set, Request Correction, and closure |
| Owner Decision | `OWNER-DECISION-D15-D16-RETIREMENT-AND-MODERATION-OUTCOMES-2026-07-21.md` | Exact moderation action family and outcomes |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Platform own-domain and direct Offering-Capability authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Platform Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall use exactly `Open` and `Closed` as General Moderation Case statuses.
- **AC-2** — The system shall make a surfaced or newly opened case `Open`.
- **AC-3** — The system shall change no target state merely because a case is opened or reviewed.
- **AC-4** — The system shall present only the exact seven General Moderation actions.
- **AC-5** — The system shall present only actions currently valid for the target state and acting authority.
- **AC-6** — The system shall keep a case `Open` after Request Correction.
- **AC-7** — The system shall allow explicit case closure only after an approved action or a recorded no-action decision.
- **AC-8** — The system shall change no target state solely because a case is closed.
- **AC-9** — The system shall keep case status distinct from target lifecycle, moderation, access, visibility, eligibility, and validation states.
- **AC-10** — The system shall keep Affiliate Destination Administration separate from General Moderation.
- **AC-11** — The system shall claim no case closure when the closure operation fails.

---

## 8. BDD

### Scenario: AC-1 — Case statuses are exact

```gherkin
Given a General Moderation case exists
When case status is represented
Then the value is exactly `Open` or `Closed`
```
### Scenario: AC-2 — Surfacing creates Open

```gherkin
Given an approved target requires review
When its General Moderation case is surfaced or opened
Then case status is `Open`
```
### Scenario: AC-3 — Opening and review are state-neutral

```gherkin
Given an Open case
When an Admin opens or reviews it
Then no target lifecycle, moderation, access, visibility, eligibility, or validation state changes
```
### Scenario: AC-4 — General Moderation action set is exhaustive

```gherkin
Given a General Moderation case is open
When the action set is presented
Then only Request Correction, Hide Offering, Restore Offering, Restrict Business, Restore Business, Suspend User, and Reinstate User are included
```
### Scenario: AC-5 — Only valid authorized actions appear

```gherkin
Given one target and acting Admin
When action availability is evaluated
Then only currently valid and authorized actions are available
```
### Scenario: AC-6 — Request Correction keeps the case Open

```gherkin
Given an Open case
When Request Correction is applied
Then case status remains `Open`
```
### Scenario: AC-7 — Closure requires resolution decision

```gherkin
Given an Open case has been re-reviewed
When closure is requested
Then an approved action must have been applied or a no-action decision recorded
```
### Scenario: AC-8 — Closure is workflow-only

```gherkin
Given an Admin closes a case
When target state is evaluated
Then closing the case creates no target-state result
```
### Scenario: AC-9 — Case status is not target status

```gherkin
Given a case and target are displayed
When their statuses are interpreted
Then case status is not treated as any target product state
```
### Scenario: AC-10 — Affiliate administration is separate

```gherkin
Given Platform action families are displayed
When Affiliate Destination Administration is evaluated
Then its actions are not added to the seven-action General Moderation set
```
### Scenario: AC-11 — Failed closure preserves Open

```gherkin
Given an Open case closure is attempted
When closure fails
Then the case remains `Open`
```

---

## 9. Dependencies

### Depends On

- `US-PLT-F01-001` — an authorized active Admin context exists.

### Blocks

- `US-PLT-F03-001` through `US-PLT-F06-001` — exact moderation actions and correction response operate through the case workflow.

---

## 10. Story Size

**M**

One case-workflow outcome with exact statuses, action visibility, state neutrality, closure gate, and separation from Affiliate administration.

---

## 11. Out of Scope

- Moderation detection or case-generation implementation.
- Target-state ownership.
- Affiliate Destination Administration.
- Messaging, ticket discussion, or inbox behaviour.

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

- [x] Represents one bounded Platform outcome
- [x] Provides observable Admin, person, or platform value
- [x] Independently understandable
- [x] Independently testable
- [x] Traceable to one Parent, Epic, Feature, PRD, and exact applicable UX
- [x] Domain code and Feature ID resolve to authoritative owners
- [x] Relationship classification and Capability reference match the Frozen Feature Registry
- [x] No duplicate Story identified in the current Platform package
- [x] No implementation details
- [x] No invented upstream behaviour
- [x] Every Acceptance Criterion begins with “The system shall…”
- [x] Every Acceptance Criterion has one explicitly numbered Story-internal BDD scenario

---

## 15. Notes

F02 owns Platform workflow status; each target-owning PRD owns product-state outcomes.

This Approved baseline does not Freeze itself and does not update GitHub automatically.
