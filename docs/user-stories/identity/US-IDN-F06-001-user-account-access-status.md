# US-IDN-F06-001 — User Account Access Status

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Identity Feature Registry, does not create a separate Business/Admin login identity, does not add Favorites or Messaging, does not apply the F06 section-level UX citation future-maintenance observation as an authoritative change, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.2 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, Identity Feature Registry, or add a separate Business/Admin login identity, Favorites, or Messaging, and does not update GitHub automatically.

> **Review Entry Note (0.2):** Bounded SIO-alignment correction after independent Claude audit. Aligns F06 Experience Owner with Frozen `IDENTITY_FEATURE_REGISTRY.md` v1.0 by keeping only `UX-0008-authentication.md` as applicable experience ownership and retaining `UX-0006-admin-dashboard.md` only as a Supporting UX / Admin Action Surface reference. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, behaviour, Acceptance Criterion, BDD scenario, dependency meaning, size, scope, lifecycle state, or GitHub file changes.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, architecture-boundary, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Identity Feature `F06`. The identifier consumes Domain code `IDN` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F06` from Frozen `IDENTITY_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-IDN-F06-001` |
| Story Title | User Account Access Status |
| Parent Story Document | `US-0003 Identity` (`US-0003-identity.md`) |
| Story Domain | Identity |
| Domain Code | `IDN` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Account Access Governance |
| Feature | `F06` — User Account Access Status |
| Feature ID | `F06` — owned by Frozen `IDENTITY_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | No Capability Architecture required |
| Capability Reference | Not required under ADR-0007 |
| Perspective | Platform authority governing access to one User Account |
| Behaviour Owner | `PRD-0003-identity.md` |
| Experience Owner | `UX-0008-authentication.md` |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Not Started |
| Priority | Must |
| Story Size | L |
| Version | 1.0 |
| Last Updated | 2026-07-25 |
| Approval Date | 2026-07-25 |
| Approved By | Product Owner / Architecture Owner |
| Approved Candidate | In Review v0.2 |
| Freeze State | Frozen |
| Freeze Date | 2026-07-25 |
| Frozen By | Product Owner / Architecture Owner |
| Supersedes | None — first Story version |

---

## 2. Story Identification

| Segment | Value | Owner by Reference |
|---|---|---|
| Prefix | `US` | `USER_STORY_HANDBOOK.md` |
| `[DOMAIN]` | `IDN` | `REPOSITORY_GOVERNANCE.md` |
| `[FEATURE_ID]` | `F06` | Frozen `IDENTITY_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Govern the exact Enabled and Suspended state machine and its access consequences without changing Business, Offering, or Admin-authorization state.

---

## 4. Business Value

> **As a** authorized platform actor applying an approved account-access decision  
> **I want** Suspend User or Reinstate User to produce one authoritative access-status result  
> **So that** authenticated contexts are consistently blocked or restored without mutating unrelated ownership, moderation, or authorization state

---

## 5. Description

V1 User Account access statuses are exactly Enabled and Suspended. Registration creates Enabled; approved moderation actions may request Enabled → Suspended or Suspended → Enabled.

Suspended blocks authenticated User, Business, and Admin contexts while preserving public Guest behaviour. Active private contexts become unavailable.

Suspension changes no Business or Offering state, public eligibility, or Admin authorization. Reinstatement restores context-entry eligibility only where separate ownership or authorization still exists.

An ordinary Admin may suspend or reinstate only a non-Admin-authorized User Account. Only Product Owner / Architecture Owner may suspend or reinstate an Admin-authorized account.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0003-identity.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `IDN` code |
| Feature Registry | `IDENTITY_FEATURE_REGISTRY.md` | `F06` identity, scope label, references, and relationship classification |
| PRD | `PRD-0003-identity.md` | Identity behaviour and product rules |
| UX | `UX-0008-authentication.md` §§7, 14, 15 | Suspended authentication consequences |
| Supporting UX / Admin Action Surface | `UX-0006-admin-dashboard.md` | Approved action request surface only; not F06 Experience Owner |
| Supporting PRD | `PRD-0006-platform.md` | Admin action enforcement and target restrictions |
| Owner Decision | `OWNER-DECISION-D22-ADMIN-AUTHORIZED-ACCOUNT-SUSPENSION-2026-07-21.md` | Owner-only action against Admin-authorized accounts |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Own-domain authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Identity Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall use exactly Enabled and Suspended as V1 User Account access-status values.
- **AC-2** — The system shall produce Enabled to Suspended when an authorized Suspend User action is accepted for an Enabled account.
- **AC-3** — The system shall produce Suspended to Enabled when an authorized Reinstate User action is accepted for a Suspended account.
- **AC-4** — The system shall make authenticated User, Business, and Admin contexts unavailable while access status is Suspended.
- **AC-5** — The system shall preserve public Guest behaviour while access status is Suspended.
- **AC-6** — The system shall leave Business state, Offering lifecycle, and Offering public eligibility unchanged as a consequence of suspension alone.
- **AC-7** — The system shall leave Admin authorization unchanged through suspension and reinstatement.
- **AC-8** — The system shall restore only context-entry eligibility after reinstatement and require all separate Business and Admin relationships to remain valid.
- **AC-9** — The system shall permit an ordinary Admin to suspend or reinstate only a target User Account that has no Admin authorization.
- **AC-10** — The system shall reject an ordinary Admin attempt to suspend or reinstate an Admin-authorized User Account.
- **AC-11** — The system shall permit only Product Owner or Architecture Owner to suspend or reinstate an Admin-authorized User Account.

---

## 8. BDD

### Scenario: AC-1 — V1 access statuses are exact

```gherkin
Given a V1 User Account
When access status is represented
Then the value is exactly Enabled or Suspended
```
### Scenario: AC-2 — Suspend User changes Enabled to Suspended

```gherkin
Given a target User Account is Enabled
And the acting authority is permitted for that target
When Suspend User is accepted
Then User Account access status becomes Suspended
```
### Scenario: AC-3 — Reinstate User changes Suspended to Enabled

```gherkin
Given a target User Account is Suspended
And the acting authority is permitted for that target
When Reinstate User is accepted
Then User Account access status becomes Enabled
```
### Scenario: AC-4 — Suspension blocks every private context

```gherkin
Given User Account access status is Suspended
When context availability is evaluated
Then authenticated User context is unavailable
And Business and Admin contexts are unavailable
```
### Scenario: AC-5 — Suspension preserves Guest behaviour

```gherkin
Given User Account access status is Suspended
When the person uses the public platform
Then public Guest behaviour remains available
```
### Scenario: AC-6 — Suspension does not mutate owned products

```gherkin
Given a User Account owns a Business or Offering
When the User Account becomes Suspended
Then Business state remains unchanged
And Offering lifecycle and public eligibility remain unchanged by suspension alone
```
### Scenario: AC-7 — Access-status changes preserve Admin authorization

```gherkin
Given a User Account carries Admin authorization
When the account is suspended or reinstated
Then Admin authorization remains unchanged
```
### Scenario: AC-8 — Reinstatement restores eligibility, not relationships

```gherkin
Given a Suspended account becomes Enabled
When context entry is reevaluated
Then authenticated User context may become available
And Business or Admin context remains conditional on its separate relationship
```
### Scenario: AC-9 — Ordinary Admin is restricted by target authorization

```gherkin
Given an ordinary Admin targets a User Account without Admin authorization
When Suspend User or Reinstate User is otherwise valid
Then the action may be accepted
```
### Scenario: AC-10 — Ordinary Admin cannot act on Admin-authorized target

```gherkin
Given the target User Account carries Admin authorization
When an ordinary Admin attempts Suspend User or Reinstate User
Then the action is rejected
And access status and Admin authorization remain unchanged
```
### Scenario: AC-11 — Owner authority governs Admin-authorized target

```gherkin
Given the target User Account carries Admin authorization
When suspension or reinstatement is requested
Then only Product Owner or Architecture Owner may authorize the transition
```

---

## 9. Dependencies

### Depends On

- `PRD-0006-platform.md` — an approved moderation action request and target rule where Admin initiates the action.
- `OWNER-DECISION-D22-ADMIN-AUTHORIZED-ACCOUNT-SUSPENSION-2026-07-21.md` — Owner-only target authority.

### Blocks

- `US-IDN-F03-001` — Login requires Enabled.
- `US-IDN-F07-001` — Business context requires Enabled.
- `US-IDN-F08-001` — Admin context requires Enabled.

---

## 10. Story Size

**L**

One cohesive access-status state machine with exact transitions, private/public consequences, cross-domain non-effects, and target-authority rules.

---

## 11. Out of Scope

- Admin UI implementation, audit-log implementation, notifications, appeals, sanctions, or automated moderation.
- Business moderation and Offering lifecycle.
- Admin authorization grant or removal.

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

- [x] Represents one bounded Identity outcome
- [x] Provides observable person or platform value
- [x] Independently understandable
- [x] Independently testable
- [x] Traceable to one Parent, Epic, Feature, PRD, and applicable UX
- [x] Domain code and Feature ID resolve to authoritative owners
- [x] Relationship classification matches the Frozen Feature Registry
- [x] No duplicate Story identified in the current Identity package
- [x] No implementation details
- [x] No invented upstream behaviour
- [x] Every Acceptance Criterion begins with “The system shall…”
- [x] Every Acceptance Criterion has one explicitly numbered Story-internal BDD scenario

---

## 15. Notes

PRD-0006 may expose and enforce approved actions; Identity owns the authoritative Enabled/Suspended result.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
