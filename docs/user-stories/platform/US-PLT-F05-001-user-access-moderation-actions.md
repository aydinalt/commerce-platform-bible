# US-PLT-F05-001 — User Access Moderation Actions

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story; does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, or the Frozen Platform Feature Registry; does not create a separate Admin identity, account, or login; does not add Admin authorization grant/remove, delegation, tier management, or self-service provisioning; does not grant Business ownership through Admin authorization; does not merge General Moderation with Affiliate Destination Administration; does not treat case state as target state; does not move target-owned results to Platform; does not convert Request Correction into Messaging or automatic closure; does not weaken Category, Domain, retirement, or Attribute mutation-safety rules; does not expand Basic Analytics; does not introduce generic Platform Configuration or Settings scope; does not apply non-blocking observations as candidate changes; and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, Capability-boundary, cross-domain dependency, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Platform Feature `F05`. The identifier consumes Domain code `PLT` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F05` from Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-PLT-F05-001` |
| Story Title | User Access Moderation Actions |
| Parent Story Document | `US-0006 Platform` (`US-0006-platform.md`) |
| Story Domain | Platform |
| Domain Code | `PLT` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Target Moderation and Correction |
| Feature | `F05` — User Access Moderation Actions |
| Feature ID | `F05` — owned by Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | No Capability Architecture required |
| Capability Reference | Not required under ADR-0007 |
| Perspective | Authorized Admin applying Suspend or Reinstate within the Admin-authorized-account boundary |
| Behaviour Owner | `PRD-0006-platform.md` |
| Experience Owner | `UX-0006-admin-dashboard.md` §§7.3–7.4, 13 |
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
| `[FEATURE_ID]` | `F05` | Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Apply Identity-owned Enabled/Suspended transitions only to permitted targets and reject ordinary-Admin action against Admin-authorized accounts.

---

## 4. Business Value

> **As a** authorized Admin moderating a User Account  
> **I want** to Suspend or Reinstate only targets within my authority  
> **So that** User access changes without silently changing Businesses, Offerings, eligibility, or Admin authorization

---

## 5. Description

Ordinary Admin may suspend Enabled non-Admin-authorized accounts and reinstate Suspended non-Admin-authorized accounts.

Ordinary Admin may not suspend or reinstate an account carrying Admin authorization.

Only Product Owner / Architecture Owner may suspend or reinstate an Admin-authorized account through a controlled operational process outside the ordinary Admin UI.

Suspend consumes PRD-0003 result `Enabled → Suspended`; Reinstate consumes `Suspended → Enabled`.

Suspension does not remove Admin authorization and does not automatically restrict a Business, hide or archive an Offering, or change public eligibility.

User Account correction is outside V1.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0006-platform.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `PLT` code |
| Feature Registry | `PLATFORM_FEATURE_REGISTRY.md` | `F05` identity, scope label, references, and relationship classification |
| PRD | `PRD-0006-platform.md` | Platform behaviour and product rules |
| UX | `UX-0006-admin-dashboard.md` §§7.3–7.4, 13 | Action availability and authority boundaries |
| Supporting PRD | `PRD-0003-identity.md` | Enabled/Suspended state and consequences |
| Owner Decision | `OWNER-DECISION-D07-ADMIN-PROVISIONING-2026-07-21.md` | Owner-only Admin authorization |
| Owner Decision | `OWNER-DECISION-D22-ADMIN-AUTHORIZED-ACCOUNT-SUSPENSION-2026-07-21.md` | Admin-authorized target restriction |
| Supporting Story | `US-IDN-F06-001-user-account-access-status.md` — Frozen v1.0 | Authoritative access-status state machine |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Platform own-domain and direct Offering-Capability authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Platform Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall make Suspend User available to an ordinary Admin only for an `Enabled` non-Admin-authorized User Account.
- **AC-2** — The system shall consume the PRD-0003-owned transition `Enabled → Suspended` after successful suspension.
- **AC-3** — The system shall make Reinstate User available to an ordinary Admin only for a `Suspended` non-Admin-authorized User Account.
- **AC-4** — The system shall consume the PRD-0003-owned transition `Suspended → Enabled` after successful reinstatement.
- **AC-5** — The system shall reject an ordinary-Admin Suspend or Reinstate attempt against an Admin-authorized account.
- **AC-6** — The system shall reserve Suspend or Reinstate of an Admin-authorized account to Product Owner / Architecture Owner outside the ordinary Admin UI.
- **AC-7** — The system shall preserve Admin authorization when an Admin-authorized account is Suspended.
- **AC-8** — The system shall change no Business Moderation Status, Offering lifecycle, Affiliate Destination result, or public eligibility solely through User suspension or reinstatement.
- **AC-9** — The system shall provide no User Account Request Correction target.
- **AC-10** — The system shall keep the moderation case Open until explicit case closure occurs.
- **AC-11** — The system shall claim no access-status transition when Suspend or Reinstate fails.

---

## 8. BDD

### Scenario: AC-1 — Suspend target is bounded

```gherkin
Given an ordinary Admin targets a User Account
When Suspend availability is evaluated
Then the account must be Enabled
And it must not carry Admin authorization
```
### Scenario: AC-2 — Suspend consumes Identity result

```gherkin
Given an authorized Suspend User action succeeds
When access status is consumed
Then PRD-0003 records `Enabled → Suspended`
```
### Scenario: AC-3 — Reinstate target is bounded

```gherkin
Given an ordinary Admin targets a User Account
When Reinstate availability is evaluated
Then the account must be Suspended
And it must not carry Admin authorization
```
### Scenario: AC-4 — Reinstate consumes Identity result

```gherkin
Given an authorized Reinstate User action succeeds
When access status is consumed
Then PRD-0003 records `Suspended → Enabled`
```
### Scenario: AC-5 — Ordinary Admin cannot target Admin-authorized account

```gherkin
Given the target account carries Admin authorization
When an ordinary Admin attempts Suspend or Reinstate
Then the action is rejected
```
### Scenario: AC-6 — Owner-only target action remains operational

```gherkin
Given an Admin-authorized account requires Suspend or Reinstate
When authority is evaluated
Then only Product Owner / Architecture Owner may decide the action
And it occurs outside the ordinary Admin UI
```
### Scenario: AC-7 — Suspension preserves authorization

```gherkin
Given Product Owner / Architecture Owner suspends an Admin-authorized account
When authorization is evaluated
Then Admin authorization remains attached
```
### Scenario: AC-8 — User action preserves unrelated state

```gherkin
Given Suspend or Reinstate succeeds
When related Business, Offering, Affiliate, and eligibility states are evaluated
Then they remain unchanged
```
### Scenario: AC-9 — User Account correction is absent

```gherkin
Given a User Account moderation case
When correction actions are presented
Then Request Correction for the User Account is unavailable
```
### Scenario: AC-10 — User action does not auto-close

```gherkin
Given Suspend or Reinstate succeeds in an Open case
When case status is evaluated
Then the case remains Open until explicit closure
```
### Scenario: AC-11 — Failed user action claims no transition

```gherkin
Given Suspend or Reinstate is attempted
When the action fails
Then no User Account access-status transition is claimed
```

---

## 9. Dependencies

### Depends On

- `US-PLT-F02-001` — an Open case and currently valid action exist.
- `US-IDN-F06-001` — authoritative User access-status behaviour.

### Blocks

- `US-PLT-F02-001` — successful action may support later explicit case closure.

---

## 10. Story Size

**M**

One User-access moderation pair with exact status gates, Admin-authorized target restriction, Owner operational boundary, unrelated-state preservation, and closure safety.

---

## 11. Out of Scope

- Admin authorization grant or removal.
- User Account correction.
- Business, Offering, or Affiliate state changes.
- Credential, session, or identity-provider implementation.

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

Platform owns approved action application; Identity owns User Account access-status results.

This Approved baseline does not Freeze itself and does not update GitHub automatically.
