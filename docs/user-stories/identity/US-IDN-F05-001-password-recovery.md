# US-IDN-F05-001 — Password Recovery

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Identity Feature Registry, does not create a separate Business/Admin login identity, does not add Favorites or Messaging, does not apply the F06 section-level UX citation future-maintenance observation as an authoritative change, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, Identity Feature Registry, or add a separate Business/Admin login identity, Favorites, or Messaging, and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, architecture-boundary, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Identity Feature `F05`. The identifier consumes Domain code `IDN` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F05` from Frozen `IDENTITY_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-IDN-F05-001` |
| Story Title | Password Recovery |
| Parent Story Document | `US-0003 Identity` (`US-0003-identity.md`) |
| Story Domain | Identity |
| Domain Code | `IDN` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Authentication Lifecycle |
| Feature | `F05` — Password Recovery |
| Feature ID | `F05` — owned by Frozen `IDENTITY_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | No Capability Architecture required |
| Capability Reference | Not required under ADR-0007 |
| Perspective | Unauthenticated holder of an existing User Account |
| Behaviour Owner | `PRD-0003-identity.md` |
| Experience Owner | `UX-0008-authentication.md` |
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
| `[DOMAIN]` | `IDN` | `REPOSITORY_GOVERNANCE.md` |
| `[FEATURE_ID]` | `F05` | Frozen `IDENTITY_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Let an unauthenticated account holder set a new password after one-time registered-email control proof while preserving the same account, status, and authorizations.

---

## 4. Business Value

> **As a** unauthenticated account holder who cannot use the current password  
> **I want** to prove control of my registered email and set a new password  
> **So that** I can attempt Login again without creating a new account or changing suspension and authorization state

---

## 5. Description

Password Recovery begins while unauthenticated and uses the registered email address.

After one-time email-control proof succeeds, the person may set a new password. The same User Account remains.

Recovery changes no access status, Business authorization, or Admin authorization. A Suspended account remains Suspended and may only attempt Login after reset.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0003-identity.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `IDN` code |
| Feature Registry | `IDENTITY_FEATURE_REGISTRY.md` | `F05` identity, scope label, references, and relationship classification |
| PRD | `PRD-0003-identity.md` | Identity behaviour and product rules |
| UX | `UX-0008-authentication.md` §§9, 14 | Recovery, proof, reset, and failure behaviour |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Own-domain authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Identity Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall allow Password Recovery to begin while the account holder is unauthenticated.
- **AC-2** — The system shall use the registered email address to identify the existing User Account for Recovery.
- **AC-3** — The system shall require one-time proof of control through the registered email address before a new password may be set.
- **AC-4** — The system shall retain the same User Account after a successful password reset.
- **AC-5** — The system shall allow the person to attempt Login after a successful password reset.
- **AC-6** — The system shall leave User Account access status unchanged after Password Recovery.
- **AC-7** — The system shall leave Business ownership and authorization relationships unchanged after Password Recovery.
- **AC-8** — The system shall leave Admin authorization unchanged after Password Recovery.
- **AC-9** — The system shall keep a Suspended account Suspended after a successful password reset.

---

## 8. BDD

### Scenario: AC-1 — Recovery begins without authentication

```gherkin
Given a person is unauthenticated
When Password Recovery is requested for an existing account
Then the Recovery flow may begin
```
### Scenario: AC-2 — Recovery uses the registered email

```gherkin
Given an existing User Account
When Recovery is begun
Then the registered email address identifies that account
```
### Scenario: AC-3 — One-time proof gates password reset

```gherkin
Given Recovery has begun
When control of the registered email has not been proven
Then a new password cannot be set
```
### Scenario: AC-4 — Reset preserves the account

```gherkin
Given one-time email-control proof succeeds
When the person sets a new password
Then the same User Account is retained
```
### Scenario: AC-5 — Reset permits a later Login attempt

```gherkin
Given a new password was set successfully
When Recovery completes
Then the person may attempt Login
```
### Scenario: AC-6 — Recovery does not change access status

```gherkin
Given an Enabled or Suspended User Account enters Recovery
When Password Recovery completes
Then the existing access status remains unchanged
```
### Scenario: AC-7 — Recovery preserves Business relationships

```gherkin
Given the User Account has Business relationships
When Password Recovery completes
Then those Business relationships remain unchanged
```
### Scenario: AC-8 — Recovery preserves Admin authorization

```gherkin
Given the User Account carries or does not carry Admin authorization
When Password Recovery completes
Then Admin authorization remains unchanged
```
### Scenario: AC-9 — Password reset does not reinstate suspension

```gherkin
Given User Account access status is Suspended
When the account holder completes Password Recovery
Then User Account access status remains Suspended
And authenticated contexts remain unavailable
```

---

## 9. Dependencies

### Depends On

- `US-IDN-F02-001` — an existing registered account and registered email exist.
- `US-IDN-F06-001` — access status is preserved as Enabled or Suspended.

### Blocks

- `US-IDN-F03-001` — the person may attempt Login with the new password.

---

## 10. Story Size

**M**

One recovery outcome with proof gating, same-account preservation, and explicit non-effects on status and authorizations.

---

## 11. Out of Scope

- Email delivery, proof token, expiration, password policy, credential storage, or session implementation.
- Suspension or reinstatement.
- Business or Admin authorization changes.

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

Recovery restores only the ability to attempt Login; it is not an account-status or authorization transition.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
