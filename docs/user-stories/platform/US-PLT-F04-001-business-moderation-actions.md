# US-PLT-F04-001 — Business Moderation Actions

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story; does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, or the Frozen Platform Feature Registry; does not create a separate Admin identity, account, or login; does not add Admin authorization grant/remove, delegation, tier management, or self-service provisioning; does not grant Business ownership through Admin authorization; does not merge General Moderation with Affiliate Destination Administration; does not treat case state as target state; does not move target-owned results to Platform; does not convert Request Correction into Messaging or automatic closure; does not weaken Category, Domain, retirement, or Attribute mutation-safety rules; does not expand Basic Analytics; does not introduce generic Platform Configuration or Settings scope; does not apply non-blocking observations as candidate changes; and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, Capability-boundary, cross-domain dependency, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Platform Feature `F04`. The identifier consumes Domain code `PLT` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F04` from Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-PLT-F04-001` |
| Story Title | Business Moderation Actions |
| Parent Story Document | `US-0006 Platform` (`US-0006-platform.md`) |
| Story Domain | Platform |
| Domain Code | `PLT` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Target Moderation and Correction |
| Feature | `F04` — Business Moderation Actions |
| Feature ID | `F04` — owned by Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | Supporting relationship |
| Capability Reference | Visibility & Eligibility |
| Perspective | Authorized Admin applying Restrict or Restore to one Business |
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
| Freeze State | Not Frozen |
| Supersedes | None — first Story version |

---

## 2. Story Identification

| Segment | Value | Owner by Reference |
|---|---|---|
| Prefix | `US` | `USER_STORY_HANDBOOK.md` |
| `[DOMAIN]` | `PLT` | `REPOSITORY_GOVERNANCE.md` |
| `[FEATURE_ID]` | `F04` | Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Apply exact Business moderation transitions while preserving Offering lifecycle, Identity, Affiliate Destination, ownership, and final-public-eligibility ownership boundaries.

---

## 4. Business Value

> **As a** authorized Admin moderating one Business  
> **I want** to Restrict or Restore the Business through approved actions  
> **So that** Business exposure changes correctly without silently mutating related records

---

## 5. Description

Restrict Business applies only to Unrestricted and consumes PRD-0005 results `Unrestricted → Restricted` and Business Public Exposure Input `Ineligible`.

Restore Business applies only to Restricted and consumes PRD-0005 results `Restricted → Unrestricted` and Business Public Exposure Input `Eligible`.

Restriction changes no Offering lifecycle state. Lifecycle-Published Offerings lose final public eligibility through PRD-0001 composition.

Restoration changes no Offering lifecycle state and only lifecycle-Published Offerings may regain final eligibility through PRD-0001 composition.

Neither action changes Affiliate Destination status or validation, User Account access status, Business ownership, or unrelated state.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0006-platform.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `PLT` code |
| Feature Registry | `PLATFORM_FEATURE_REGISTRY.md` | `F04` identity, scope label, references, and relationship classification |
| PRD | `PRD-0006-platform.md` | Platform behaviour and product rules |
| UX | `UX-0006-admin-dashboard.md` §§7.3–7.4 | Business action availability and consequences |
| Supporting PRD | `PRD-0005-business.md` | Business Moderation Status and exposure input |
| Supporting PRD | `PRD-0001-offering.md` | Final Offering Public Eligibility composition |
| Owner Decision | `OWNER-DECISION-D15-D16-RETIREMENT-AND-MODERATION-OUTCOMES-2026-07-21.md` | Restrict and Restore outcomes |
| Owner Decision | `OWNER-DECISION-D20-OFFERING-PUBLIC-ELIGIBILITY-COMPOSITION-2026-07-21.md` | Business input versus final eligibility |
| Supporting Story | `US-BUS-F03-001-business-moderation-and-public-exposure-input.md` — Frozen v1.0 | Authoritative Business state machine |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Platform own-domain and direct Offering-Capability authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Platform Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall make Restrict Business available only for an `Unrestricted` Business.
- **AC-2** — The system shall consume the PRD-0005-owned outcomes `Restricted` and Business Public Exposure Input `Ineligible` after successful restriction.
- **AC-3** — The system shall change no individual Offering lifecycle state solely because the Business is restricted.
- **AC-4** — The system shall allow lifecycle-Published Offerings to lose final public eligibility only through PRD-0001 composition.
- **AC-5** — The system shall make Restore Business available only for a `Restricted` Business.
- **AC-6** — The system shall consume the PRD-0005-owned outcomes `Unrestricted` and Business Public Exposure Input `Eligible` after successful restoration.
- **AC-7** — The system shall restore no Draft, Hidden, or Archived Offering lifecycle state.
- **AC-8** — The system shall allow only lifecycle-Published Offerings to regain final eligibility through PRD-0001 composition.
- **AC-9** — The system shall change no Affiliate Destination status, validation result, User Account access status, or Business ownership through Restrict or Restore.
- **AC-10** — The system shall keep the moderation case Open until explicit case closure occurs.
- **AC-11** — The system shall claim no Business moderation transition when Restrict or Restore fails.

---

## 8. BDD

### Scenario: AC-1 — Restrict requires Unrestricted

```gherkin
Given a Business is targeted
When Restrict availability is evaluated
Then Business Moderation Status must be `Unrestricted`
```
### Scenario: AC-2 — Restriction consumes exact Business results

```gherkin
Given Restrict Business succeeds
When Business results are consumed
Then status is `Restricted`
And exposure input is `Ineligible`
```
### Scenario: AC-3 — Restriction preserves Offering lifecycle

```gherkin
Given Restrict Business succeeds
When owned Offerings are evaluated
Then no Offering lifecycle state changes
```
### Scenario: AC-4 — Restriction uses Offering eligibility composition

```gherkin
Given the Business becomes Restricted
When final Offering eligibility is evaluated
Then PRD-0001 composes the result from Business exposure input
```
### Scenario: AC-5 — Restore requires Restricted

```gherkin
Given a Business is targeted
When Restore availability is evaluated
Then Business Moderation Status must be `Restricted`
```
### Scenario: AC-6 — Restoration consumes exact Business results

```gherkin
Given Restore Business succeeds
When Business results are consumed
Then status is `Unrestricted`
And exposure input is `Eligible`
```
### Scenario: AC-7 — Restoration preserves Offering lifecycle

```gherkin
Given Restore Business succeeds
When owned Draft, Hidden, or Archived Offerings are evaluated
Then no lifecycle state changes
```
### Scenario: AC-8 — Only Published may regain eligibility

```gherkin
Given the Business becomes Unrestricted
When final Offering eligibility is recomposed
Then only lifecycle-Published Offerings may regain eligibility
```
### Scenario: AC-9 — Business action preserves unrelated state

```gherkin
Given Restrict or Restore succeeds
When unrelated states are evaluated
Then Affiliate Destination, Identity, and ownership results remain unchanged
```
### Scenario: AC-10 — Action does not auto-close

```gherkin
Given Restrict or Restore succeeds in an Open case
When case status is evaluated
Then the case remains Open until explicit closure
```
### Scenario: AC-11 — Failed action claims no transition

```gherkin
Given Restrict or Restore is attempted
When the action fails
Then no Business Moderation Status transition is claimed
```

---

## 9. Dependencies

### Depends On

- `US-PLT-F02-001` — an Open case and currently valid action exist.
- `PRD-0005-business.md` — authoritative Business moderation outcomes.

### Blocks

- `US-PLT-F02-001` — successful action may support later explicit case closure.

---

## 10. Story Size

**M**

One Business-moderation action pair with exact gates, Business-owned outcomes, Offering eligibility boundary, unrelated-state preservation, and closure safety.

---

## 11. Out of Scope

- Business creation, ownership, or information authoring.
- Offering lifecycle changes.
- Final Offering Public Eligibility computation.
- User suspension or Affiliate Destination administration.

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

Platform applies approved Business actions; Business owns moderation status and exposure input.

This Approved baseline does not Freeze itself and does not update GitHub automatically.
