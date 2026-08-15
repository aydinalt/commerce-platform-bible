# US-IDN-F07-001 — Business Context Access

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Identity Feature Registry, does not create a separate Business/Admin login identity, does not add Favorites or Messaging, does not apply the F06 section-level UX citation future-maintenance observation as an authoritative change, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, Identity Feature Registry, or add a separate Business/Admin login identity, Favorites, or Messaging, and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, architecture-boundary, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Identity Feature `F07`. The identifier consumes Domain code `IDN` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F07` from Frozen `IDENTITY_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-IDN-F07-001` |
| Story Title | Business Context Access |
| Parent Story Document | `US-0003 Identity` (`US-0003-identity.md`) |
| Story Domain | Identity |
| Domain Code | `IDN` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Authorized Context Access |
| Feature | `F07` — Business Context Access |
| Feature ID | `F07` — owned by Frozen `IDENTITY_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | No Capability Architecture required |
| Capability Reference | Not required under ADR-0007 |
| Perspective | Enabled authenticated User entering one owned Business context |
| Behaviour Owner | `PRD-0003-identity.md` |
| Experience Owner | `UX-0008-authentication.md`; `UX-0005-business-dashboard.md` |
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
| `[DOMAIN]` | `IDN` | `REPOSITORY_GOVERNANCE.md` |
| `[FEATURE_ID]` | `F07` | Frozen `IDENTITY_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Enter exactly one explicitly selected authorized Business context through the same User Account without creating ownership or a separate Business login.

---

## 4. Business Value

> **As a** Enabled authenticated User authorized for one or more Businesses  
> **I want** to explicitly choose and enter one exact Business context  
> **So that** I can manage that Business without silent selection, cross-Business authority, or another login identity

---

## 5. Description

Business context requires access status Enabled and an authoritative ownership or authorization relationship for the exact selected Business.

UX-0008 passes the authenticated User context and exact selected Business to UX-0005, which reevaluates entry conditions. One Business may be entered directly when explicitly chosen; multiple Businesses require an explicit selection.

The same User Account is used. Entry creates no ownership, grants no authority over another Business, and Admin authorization alone is insufficient. Leaving Business context returns to the authenticated User baseline unless Logout is separately requested.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0003-identity.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `IDN` code |
| Feature Registry | `IDENTITY_FEATURE_REGISTRY.md` | `F07` identity, scope label, references, and relationship classification |
| PRD | `PRD-0003-identity.md` | Identity behaviour and product rules |
| UX Source | `UX-0008-authentication.md` §§8.1–8.2 | Business-context selection and routing |
| UX Target | `UX-0005-business-dashboard.md` §5 | Exact Business entry and reevaluation |
| Supporting PRD | `PRD-0005-business.md` | Business ownership and authorization relationship |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Own-domain authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Identity Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall require User Account access status Enabled before Business-context entry.
- **AC-2** — The system shall require an authoritative ownership or authorization relationship for the exact selected Business.
- **AC-3** — The system shall require the person to explicitly choose the Business where more than one authorized Business exists.
- **AC-4** — The system shall send the exact authenticated User context and exact selected Business to UX-0005 without extra authority.
- **AC-5** — The system shall use the same User Account for User and Business contexts and create no separate Business login identity.
- **AC-6** — The system shall grant no Business ownership or authority over another Business through context entry.
- **AC-7** — The system shall treat Admin authorization alone as insufficient for Business-context entry.
- **AC-8** — The system shall reevaluate access status and Business authorization on entry and after a Business switch.
- **AC-9** — The system shall return the person to the authenticated User baseline when Business context is left without Logout.

---

## 8. BDD

### Scenario: AC-1 — Business context requires Enabled

```gherkin
Given a User Account is not Enabled
When Business-context entry is requested
Then Business context remains unavailable
```
### Scenario: AC-2 — Business context requires exact authorization

```gherkin
Given an Enabled authenticated User selects a Business
When Business-context entry is evaluated
Then entry is permitted only if the User is authorized for that exact Business
```
### Scenario: AC-3 — Multiple Businesses require explicit selection

```gherkin
Given an Enabled User is authorized for more than one Business
When Business context is requested
Then the person explicitly selects one Business
And no Business is chosen silently
```
### Scenario: AC-4 — Exact Business context is routed

```gherkin
Given an Enabled User explicitly selected an authorized Business
When UX-0008 routes the request
Then UX-0005 receives the authenticated User context and exact selected Business
And no extra Business authority is added
```
### Scenario: AC-5 — Business is not a separate login

```gherkin
Given an Enabled authenticated User enters Business context
When identity is evaluated
Then the same User Account is used
And no separate Business login identity is created
```
### Scenario: AC-6 — Context entry grants no ownership

```gherkin
Given a User enters one authorized Business context
When resulting authority is evaluated
Then ownership remains unchanged
And authority over another Business is not granted
```
### Scenario: AC-7 — Admin authorization is not Business ownership

```gherkin
Given an Admin-authorized User has no relationship to a Business
When Business-context entry is requested
Then entry is rejected
```
### Scenario: AC-8 — Entry and switch revalidate conditions

```gherkin
Given a User enters or switches Business context
When the target Business context is evaluated
Then Enabled status and exact Business authorization are reevaluated
```
### Scenario: AC-9 — Leaving Business context retains authentication

```gherkin
Given a person is in Business context
When the person leaves that context without requesting Logout
Then the authenticated User baseline remains active
```

---

## 9. Dependencies

### Depends On

- `US-IDN-F03-001` — authenticated User context exists.
- `US-IDN-F06-001` — access status is Enabled.
- `PRD-0005-business.md` — exact Business ownership or authorization exists.

### Blocks

- None.

---

## 10. Story Size

**M**

One explicit context-entry outcome with exact target selection, authoritative relationship checks, same-account identity, switching validation, and bounded exit.

---

## 11. Out of Scope

- Business creation, fields, dashboard behaviour, moderation, visibility, or lifecycle.
- Delegated access or multiple Business permission levels.
- Separate Business credentials or login.
- Logout, which belongs to F04.

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

Identity owns the context gate; Business owns what an authorized person may do inside that context.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
