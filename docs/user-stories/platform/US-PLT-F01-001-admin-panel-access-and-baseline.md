# US-PLT-F01-001 — Admin Panel Access and Baseline

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story; does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, or the Frozen Platform Feature Registry; does not create a separate Admin identity, account, or login; does not add Admin authorization grant/remove, delegation, tier management, or self-service provisioning; does not grant Business ownership through Admin authorization; does not merge General Moderation with Affiliate Destination Administration; does not treat case state as target state; does not move target-owned results to Platform; does not convert Request Correction into Messaging or automatic closure; does not weaken Category, Domain, retirement, or Attribute mutation-safety rules; does not expand Basic Analytics; does not introduce generic Platform Configuration or Settings scope; does not apply non-blocking observations as candidate changes; and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, Capability-boundary, cross-domain dependency, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Platform Feature `F01`. The identifier consumes Domain code `PLT` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F01` from Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-PLT-F01-001` |
| Story Title | Admin Panel Access and Baseline |
| Parent Story Document | `US-0006 Platform` (`US-0006-platform.md`) |
| Story Domain | Platform |
| Domain Code | `PLT` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Admin Context and Moderation Workload |
| Feature | `F01` — Admin Panel Access and Baseline |
| Feature ID | `F01` — owned by Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | No Capability Architecture required |
| Capability Reference | Not required under ADR-0007 |
| Perspective | Enabled authenticated User with existing Admin authorization |
| Behaviour Owner | `PRD-0006-platform.md` |
| Experience Owner | `UX-0006-admin-dashboard.md` §§5–6; `UX-0008-authentication.md` §8.3 |
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
| `[FEATURE_ID]` | `F01` | Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Enter one explicit Admin context under the existing User Account while inheriting ordinary baselines and granting no Business ownership or Admin-provisioning authority.

---

## 4. Business Value

> **As a** Admin-authorized Enabled User  
> **I want** to explicitly enter the Admin Panel with my existing authorization  
> **So that** I can use approved Platform functions without receiving unrelated Business or provisioning authority

---

## 5. Description

Admin Panel entry requires User Account access status `Enabled`, an existing Admin authorization relationship, and explicit person entry to Admin context.

Admin authorization attaches to the existing User Account. V1 creates no separate Admin identity, account, login, or operator type.

The Admin context inherits Guest and authenticated User baseline behaviour but exposes Admin-specific Platform behaviour only while that context is active.

Admin authorization does not create Business ownership or authority through an unrelated Business context.

Only Product Owner / Architecture Owner may establish the first Admin, grant or remove Admin authorization, or provision Admin-authorized-account suspension authority. Those controlled operational decisions remain outside the V1 Admin Panel.

Logout is handed to UX-0008 and ends the active privileged context without deleting the account, removing Admin authorization, or preserving privileged access.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0006-platform.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `PLT` code |
| Feature Registry | `PLATFORM_FEATURE_REGISTRY.md` | `F01` identity, scope label, references, and relationship classification |
| PRD | `PRD-0006-platform.md` | Platform behaviour and product rules |
| UX Admin | `UX-0006-admin-dashboard.md` §§5–6 | Entry conditions and Admin overview |
| UX Authentication | `UX-0008-authentication.md` §8.3 | Authorized Admin-context routing |
| Supporting PRD | `PRD-0003-identity.md` | Enabled status and Admin authorization attachment |
| Owner Decision | `OWNER-DECISION-D06-ADMIN-BASELINE-INHERITANCE-2026-07-21.md` | Inherited public and User baseline |
| Owner Decision | `OWNER-DECISION-D07-ADMIN-PROVISIONING-2026-07-21.md` | Owner-only provisioning authority |
| Supporting Story | `US-IDN-F08-001-admin-authorization-and-context-access.md` — Frozen v1.0 | Authorization and exact context-entry boundary |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Platform own-domain and direct Offering-Capability authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Platform Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall require User Account access status `Enabled`, existing Admin authorization, and explicit entry before opening the Admin Panel.
- **AC-2** — The system shall attach Admin authorization to the existing User Account and create no separate Admin account, identity, or login.
- **AC-3** — The system shall reevaluate Enabled status and Admin authorization whenever the Admin Panel is entered.
- **AC-4** — The system shall inherit the Guest and authenticated User baseline inside Admin context.
- **AC-5** — The system shall make Admin-specific Platform behaviour available only while Admin context is active.
- **AC-6** — The system shall grant no Business ownership or unrelated Business-management authority from Admin authorization alone.
- **AC-7** — The system shall provide no grant, remove, transfer, delegate, tier-management, or self-service Admin-provisioning action in the V1 Admin Panel.
- **AC-8** — The system shall prevent an ordinary Admin from provisioning another Admin.
- **AC-9** — The system shall reserve first-Admin establishment and Admin-authorization grant or removal to Product Owner / Architecture Owner outside the V1 Admin Panel.
- **AC-10** — The system shall deny Admin-context entry to a Suspended User Account while preserving public Guest behaviour.
- **AC-11** — The system shall hand Logout to UX-0008 and end the active Admin context without removing Admin authorization.

---

## 8. BDD

### Scenario: AC-1 — Admin entry requires all three gates

```gherkin
Given a person requests Admin Panel entry
When access conditions are evaluated
Then User Account status must be `Enabled`
And Admin authorization must exist
And Admin context must be explicitly entered
```
### Scenario: AC-2 — Admin authorization uses the existing account

```gherkin
Given Admin authorization exists
When identity is evaluated
Then it remains attached to the existing User Account
And no separate Admin account, identity, or login is created
```
### Scenario: AC-3 — Entry is reevaluated

```gherkin
Given Admin Panel entry is requested
When the entry gate runs
Then current Enabled status and Admin authorization are reevaluated
```
### Scenario: AC-4 — Admin inherits ordinary baselines

```gherkin
Given an authorized person enters Admin context
When baseline abilities are evaluated
Then Guest and authenticated User baseline abilities remain available
```
### Scenario: AC-5 — Admin behaviour requires active context

```gherkin
Given an Admin-authorized User is outside Admin context
When Admin-specific Platform actions are evaluated
Then those actions remain unavailable
```
### Scenario: AC-6 — Admin authorization grants no Business ownership

```gherkin
Given an Admin-authorized User has no ownership relationship to a Business
When Business authority is evaluated
Then no ownership or Business-management authority is granted
```
### Scenario: AC-7 — Admin provisioning is absent from the Panel

```gherkin
Given the Admin Panel is open
When available authorization actions are evaluated
Then grant, remove, transfer, delegate, tier management, and self-service provisioning are unavailable
```
### Scenario: AC-8 — Ordinary Admin cannot provision another Admin

```gherkin
Given an ordinary Admin uses the Panel
When another account's Admin authorization is considered
Then no provisioning action is available
```
### Scenario: AC-9 — Owner provisioning remains operational

```gherkin
Given first-Admin establishment or authorization grant/removal is required
When authority is evaluated
Then only Product Owner / Architecture Owner may decide it
And the action occurs outside the V1 Admin Panel
```
### Scenario: AC-10 — Suspended account cannot enter Admin

```gherkin
Given an Admin-authorized account is `Suspended`
When Admin-context entry is requested
Then entry is denied
And public Guest behaviour remains available
```
### Scenario: AC-11 — Logout ends context but preserves authorization

```gherkin
Given an Admin requests Logout
When UX-0008 completes Logout
Then the active Admin context ends
And Admin authorization remains attached to the account
```

---

## 9. Dependencies

### Depends On

- `US-IDN-F08-001` — authoritative Admin authorization and context entry.

### Blocks

- `US-PLT-F02-001` through `US-PLT-F10-001` — Platform functions require one authorized active Admin context.

---

## 10. Story Size

**M**

One access-and-baseline outcome with exact entry gates, inherited baselines, no Business ownership, Owner-only provisioning, suspension, and Logout boundaries.

---

## 11. Out of Scope

- Admin authorization provisioning implementation.
- Separate Admin identity, account, login, roles, or tiers.
- Business ownership or Business-context entry without normal authorization.
- Authentication technology or session implementation.

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

Identity owns authorization; Platform owns the Admin Panel entry experience and Platform action surface.

This Approved baseline does not Freeze itself and does not update GitHub automatically.
