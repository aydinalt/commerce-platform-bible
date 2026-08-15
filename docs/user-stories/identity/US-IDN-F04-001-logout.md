# US-IDN-F04-001 — Logout

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Identity Feature Registry, does not create a separate Business/Admin login identity, does not add Favorites or Messaging, does not apply the F06 section-level UX citation future-maintenance observation as an authoritative change, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, Identity Feature Registry, or add a separate Business/Admin login identity, Favorites, or Messaging, and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, architecture-boundary, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Identity Feature `F04`. The identifier consumes Domain code `IDN` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F04` from Frozen `IDENTITY_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-IDN-F04-001` |
| Story Title | Logout |
| Parent Story Document | `US-0003 Identity` (`US-0003-identity.md`) |
| Story Domain | Identity |
| Domain Code | `IDN` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Authentication Lifecycle |
| Feature | `F04` — Logout |
| Feature ID | `F04` — owned by Frozen `IDENTITY_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | No Capability Architecture required |
| Capability Reference | Not required under ADR-0007 |
| Perspective | Person leaving an authenticated User, Business, or Admin context |
| Behaviour Owner | `PRD-0003-identity.md` |
| Experience Owner | `UX-0008-authentication.md` |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Done |
| Priority | Must |
| Story Size | S |
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
| `[FEATURE_ID]` | `F04` | Frozen `IDENTITY_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

End the current authenticated context and return to the public Guest baseline without deleting the account or removing authoritative relationships.

---

## 4. Business Value

> **As a** person currently using an authenticated context  
> **I want** to log out from any authenticated area  
> **So that** no privileged context remains active while my account, Business ownership, and Admin authorization remain intact

---

## 5. Description

Logout may be requested from any authenticated active UX and is executed by UX-0008.

Completion ends the current authenticated User, Business, or Admin context and restores Guest-level abilities.

Logout does not delete the User Account, remove Business ownership, remove Admin authorization, or preserve a privileged context.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0003-identity.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `IDN` code |
| Feature Registry | `IDENTITY_FEATURE_REGISTRY.md` | `F04` identity, scope label, references, and relationship classification |
| PRD | `PRD-0003-identity.md` | Identity behaviour and product rules |
| UX | `UX-0008-authentication.md` §8.4 | Logout ownership and result |
| Supporting UX | `UX-0005-business-dashboard.md` §5 | Business Dashboard logout handoff |
| Supporting UX | `UX-0006-admin-dashboard.md` §5 | Admin Dashboard logout handoff |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Own-domain authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Identity Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall accept a Logout request from any authenticated active UX.
- **AC-2** — The system shall end the current authenticated User, Business, or Admin context when Logout completes.
- **AC-3** — The system shall return the person to Guest-level abilities after Logout.
- **AC-4** — The system shall retain the User Account after Logout.
- **AC-5** — The system shall retain Business ownership relationships after Logout.
- **AC-6** — The system shall retain Admin authorization after Logout.
- **AC-7** — The system shall leave no authenticated or privileged context active after Logout completes.

---

## 8. BDD

### Scenario: AC-1 — Logout may originate from any authenticated context

```gherkin
Given a person is in an authenticated User, Business, or Admin context
When Logout is requested
Then UX-0008 accepts the Logout request
```
### Scenario: AC-2 — Logout ends the active authenticated context

```gherkin
Given Logout was accepted from an authenticated context
When Logout completes
Then the current authenticated context ends
```
### Scenario: AC-3 — Guest baseline resumes after Logout

```gherkin
Given the authenticated context ended through Logout
When the platform remains available
Then Guest-level abilities resume
```
### Scenario: AC-4 — Logout does not delete the account

```gherkin
Given a person logs out
When account persistence is evaluated
Then the User Account continues to exist
```
### Scenario: AC-5 — Logout preserves Business ownership

```gherkin
Given the account owns one or more Businesses
When Logout completes
Then Business ownership relationships remain unchanged
```
### Scenario: AC-6 — Logout preserves Admin authorization

```gherkin
Given the User Account carries Admin authorization
When Logout completes
Then Admin authorization remains unchanged
```
### Scenario: AC-7 — No privileged context survives Logout

```gherkin
Given Logout completes
When current context is evaluated
Then no authenticated User, Business, or Admin context remains active
```

---

## 9. Dependencies

### Depends On

- `US-IDN-F03-001`, `US-IDN-F07-001`, or `US-IDN-F08-001` — an authenticated context is active.

### Blocks

- None.

---

## 10. Story Size

**S**

One exit outcome with uniform origin handling and explicit preservation of account and authorization relationships.

---

## 11. Out of Scope

- Account deletion or voluntary deactivation.
- Session, cookie, token, or device implementation.
- Leaving Business or Admin context while staying authenticated, which belongs to F07 or F08.

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

Logout ends authentication; it does not mutate ownership or authorization.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
