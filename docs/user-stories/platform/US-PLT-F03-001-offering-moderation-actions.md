# US-PLT-F03-001 — Offering Moderation Actions

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Platform Feature Registry, does not change PRD/UX behaviour, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story; does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, or the Frozen Platform Feature Registry; does not create a separate Admin identity, account, or login; does not add Admin authorization grant/remove, delegation, tier management, or self-service provisioning; does not grant Business ownership through Admin authorization; does not merge General Moderation with Affiliate Destination Administration; does not treat case state as target state; does not move target-owned results to Platform; does not convert Request Correction into Messaging or automatic closure; does not weaken Category, Domain, retirement, or Attribute mutation-safety rules; does not expand Basic Analytics; does not introduce generic Platform Configuration or Settings scope; does not apply non-blocking observations as candidate changes; and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, Capability-boundary, cross-domain dependency, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Platform Feature `F03`. The identifier consumes Domain code `PLT` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F03` from Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-PLT-F03-001` |
| Story Title | Offering Moderation Actions |
| Parent Story Document | `US-0006 Platform` (`US-0006-platform.md`) |
| Story Domain | Platform |
| Domain Code | `PLT` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Target Moderation and Correction |
| Feature | `F03` — Offering Moderation Actions |
| Feature ID | `F03` — owned by Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | Supporting relationship |
| Capability Reference | Lifecycle; Visibility & Eligibility |
| Perspective | Authorized Admin applying Hide or Restore to one authoritative Offering target |
| Behaviour Owner | `PRD-0006-platform.md` |
| Experience Owner | `UX-0006-admin-dashboard.md` §§7.3–7.4 |
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
| `[FEATURE_ID]` | `F03` | Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Apply only Published-to-Hidden and Hidden-to-Published moderation actions while leaving Offering lifecycle and public-eligibility consequences with PRD-0001.

---

## 4. Business Value

> **As a** authorized Admin moderating one Offering  
> **I want** to Hide or Restore only when the current lifecycle permits it  
> **So that** Platform applies the approved action without inventing another Offering transition

---

## 5. Description

Hide Offering applies only to a Published Offering and consumes the PRD-0001 result `Published → Hidden`.

Restore Offering applies only to a Hidden Offering and consumes the PRD-0001 result `Hidden → Published`.

Platform owns action authorization and application; PRD-0001 owns lifecycle state and final Offering Public Eligibility.

Platform cannot Archive, restore Archived, return Hidden to Draft, or publish Draft on behalf of Business.

Hide or Restore does not change Business Moderation Status, User Account access status, Affiliate Destination status, validation result, or Handoff Eligibility.

Restore does not guarantee final public eligibility; PRD-0001 composes it from all authoritative inputs.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0006-platform.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `PLT` code |
| Feature Registry | `PLATFORM_FEATURE_REGISTRY.md` | `F03` identity, scope label, references, and relationship classification |
| PRD | `PRD-0006-platform.md` | Platform behaviour and product rules |
| UX | `UX-0006-admin-dashboard.md` §§7.3–7.4 | Offering action availability and consequences |
| Supporting PRD | `PRD-0001-offering.md` | Offering lifecycle and final public eligibility |
| Owner Decision | `OWNER-DECISION-D15-D16-RETIREMENT-AND-MODERATION-OUTCOMES-2026-07-21.md` | Hide and Restore outcomes |
| Owner Decision | `OWNER-DECISION-D20-OFFERING-PUBLIC-ELIGIBILITY-COMPOSITION-2026-07-21.md` | Final eligibility composition |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Platform own-domain and direct Offering-Capability authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Platform Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall make Hide Offering available only for a `Published` Offering.
- **AC-2** — The system shall apply Hide Offering as the PRD-0001-owned transition `Published → Hidden`.
- **AC-3** — The system shall make Restore Offering available only for a `Hidden` Offering.
- **AC-4** — The system shall apply Restore Offering as the PRD-0001-owned transition `Hidden → Published`.
- **AC-5** — The system shall leave lifecycle-state and final-public-eligibility ownership with PRD-0001.
- **AC-6** — The system shall provide no Archive, Archived restore, Hidden-to-Draft, or Draft publication action.
- **AC-7** — The system shall change no Business Moderation Status, User Account access status, Affiliate Destination status, validation result, or Handoff Eligibility solely through Hide or Restore.
- **AC-8** — The system shall avoid claiming final Offering Public Eligibility solely because Restore returns lifecycle to `Published`.
- **AC-9** — The system shall keep the moderation case Open until explicit case closure occurs.
- **AC-10** — The system shall claim no lifecycle transition when Hide or Restore fails.

---

## 8. BDD

### Scenario: AC-1 — Hide requires Published

```gherkin
Given an Offering is targeted
When Hide availability is evaluated
Then the Offering lifecycle must be `Published`
```
### Scenario: AC-2 — Hide consumes the exact lifecycle result

```gherkin
Given a Published Offering and authorized Hide action
When Hide succeeds
Then PRD-0001 records `Published → Hidden`
```
### Scenario: AC-3 — Restore requires Hidden

```gherkin
Given an Offering is targeted
When Restore availability is evaluated
Then the Offering lifecycle must be `Hidden`
```
### Scenario: AC-4 — Restore consumes the exact lifecycle result

```gherkin
Given a Hidden Offering and authorized Restore action
When Restore succeeds
Then PRD-0001 records `Hidden → Published`
```
### Scenario: AC-5 — Offering remains the outcome owner

```gherkin
Given Hide or Restore is applied
When product results are determined
Then PRD-0001 remains the authoritative owner
```
### Scenario: AC-6 — Unsupported Offering actions remain absent

```gherkin
Given Offering moderation actions are presented
When available transitions are evaluated
Then Archive, Archived restore, Hidden-to-Draft, and Draft publication are unavailable
```
### Scenario: AC-7 — Offering action preserves unrelated state

```gherkin
Given Hide or Restore succeeds
When unrelated states are evaluated
Then Business, User, and Affiliate Destination results remain unchanged
```
### Scenario: AC-8 — Restore does not promise public eligibility

```gherkin
Given a Hidden Offering is restored to Published
When public eligibility is presented
Then eligibility is not claimed solely from the lifecycle transition
```
### Scenario: AC-9 — Action does not close the case automatically

```gherkin
Given Hide or Restore succeeds in an Open case
When case status is evaluated
Then the case remains Open until explicit closure
```
### Scenario: AC-10 — Failed action claims no transition

```gherkin
Given Hide or Restore is attempted
When the action fails
Then no lifecycle transition is claimed
```

---

## 9. Dependencies

### Depends On

- `US-PLT-F02-001` — an Open case and currently valid action exist.
- `PRD-0001-offering.md` — authoritative Offering lifecycle and public eligibility.

### Blocks

- `US-PLT-F02-001` — successful action may support later explicit case closure.

---

## 10. Story Size

**M**

One Offering-moderation action pair with exact state gates, outcome ownership, prohibited transitions, unrelated-state preservation, and closure boundary.

---

## 11. Out of Scope

- Business owner retirement or publication.
- Offering Archive or Archived restore.
- Final Offering Public Eligibility computation.
- Moderation detection or technical action implementation.

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

Platform owns action execution; Offering owns lifecycle and eligibility results.

This Approved baseline does not Freeze itself and does not update GitHub automatically.
