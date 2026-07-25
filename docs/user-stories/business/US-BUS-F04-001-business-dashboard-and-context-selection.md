# US-BUS-F04-001 — Business Dashboard and Context Selection

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Business Feature Registry; does not create a separate Business login identity; does not require prior Admin approval for Business creation; does not merge public Business identity with protected Direct Contact; does not transfer final Offering Public Eligibility ownership to Business; does not add analytics, CRM, Messaging, permanent deletion, transactions, or Affiliate Destination administration authority; and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story; does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, or the Frozen Business Feature Registry; does not create a separate Business login identity; does not add prior Admin approval to Business creation; does not merge public identity with protected Direct Contact; does not move final Offering Public Eligibility ownership to Business; does not add analytics, CRM, Messaging, permanent deletion, transactions, or Affiliate Destination administration authority; and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, Capability-boundary, cross-domain dependency, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Business Feature `F04`. The identifier consumes Domain code `BUS` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F04` from Frozen `BUSINESS_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-BUS-F04-001` |
| Story Title | Business Dashboard and Context Selection |
| Parent Story Document | `US-0005 Business` (`US-0005-business.md`) |
| Story Domain | Business |
| Domain Code | `BUS` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Moderation and Business Context Governance |
| Feature | `F04` — Business Dashboard and Context Selection |
| Feature ID | `F04` — owned by Frozen `BUSINESS_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | No Capability Architecture required |
| Capability Reference | Not required under ADR-0007 |
| Perspective | Enabled authenticated owner managing one explicitly selected Business |
| Behaviour Owner | `PRD-0005-business.md` |
| Experience Owner | `UX-0005-business-dashboard.md` §§5–6 |
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
| `[DOMAIN]` | `BUS` | `REPOSITORY_GOVERNANCE.md` |
| `[FEATURE_ID]` | `F04` | Frozen `BUSINESS_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Provide one clearly identified owned-Business management context and explicit switching without changing ownership or granting authority through Admin status alone.

---

## 4. Business Value

> **As a** Enabled authenticated User authorized for one or more Businesses  
> **I want** to enter and switch one exact active Business context  
> **So that** every management action applies only to the Business I explicitly selected

---

## 5. Description

Business Dashboard entry requires an Enabled authenticated User and an authoritative ownership relationship for the exact selected Business.

The active Business display name and Business Moderation Status remain identifiable. Where one Business is owned, UX may enter it directly; where multiple are owned, the active Business is explicit and switching requires person action.

Switching changes only the active management context, not ownership, and never silently applies an action to another Business. Entry and switching reevaluate Enabled status and exact ownership.

Admin authorization alone does not create Business ownership or an entry path. The Dashboard may expose by-reference management areas, lifecycle-organized Offering inventory, correction notices, and Affiliate Destination results without becoming analytics, CRM, Messaging, or transaction behaviour.

A failed switch preserves the last confirmed active Business.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0005-business.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `BUS` code |
| Feature Registry | `BUSINESS_FEATURE_REGISTRY.md` | `F04` identity, scope label, references, and relationship classification |
| PRD | `PRD-0005-business.md` | Business behaviour and product rules |
| UX | `UX-0005-business-dashboard.md` §§5–6 | Entry, active Business context, and switching |
| Supporting PRD | `PRD-0003-identity.md` | Enabled User and Business-context gate |
| Supporting Story | `US-IDN-F07-001-business-context-access.md` — Frozen v1.0 | Exact selected owned-Business entry |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Business own-domain authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Business Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall require an Enabled authenticated User and exact ownership authorization before the Dashboard opens.
- **AC-2** — The system shall identify the active Business display name and Business Moderation Status throughout management.
- **AC-3** — The system shall allow direct entry to the sole owned Business without creating a second identity.
- **AC-4** — The system shall require explicit person selection when the User owns more than one Business.
- **AC-5** — The system shall change only the active management context when the person switches Businesses.
- **AC-6** — The system shall apply no management action silently to a Business other than the current active Business.
- **AC-7** — The system shall reevaluate Enabled status and exact Business authorization on entry and after a switch.
- **AC-8** — The system shall treat Admin authorization alone as insufficient for Business Dashboard entry or Business ownership.
- **AC-9** — The system shall expose only by-reference management areas and authoritative inventory states without redefining their behaviour.
- **AC-10** — The system shall provide no Business analytics, conversion metrics, revenue reporting, ranking, trends, CRM, Messaging, or transaction behaviour.
- **AC-11** — The system shall preserve the last confirmed active Business when a context switch fails.

---

## 8. BDD

### Scenario: AC-1 — Dashboard entry requires exact authorization

```gherkin
Given a person requests Business Dashboard entry
When access conditions are evaluated
Then the User Account must be Enabled
And the User must be authorized for the exact selected Business
```
### Scenario: AC-2 — Active Business identity stays visible

```gherkin
Given the Dashboard is open
When management continues
Then the active Business display name and moderation status remain identifiable
```
### Scenario: AC-3 — One owned Business may open directly

```gherkin
Given the User owns exactly one Business
When Business Dashboard is entered
Then that Business may become the active context
And no separate identity is created
```
### Scenario: AC-4 — Multiple Businesses require explicit selection

```gherkin
Given the User owns multiple Businesses
When Dashboard entry or switching occurs
Then the person explicitly selects the active Business
```
### Scenario: AC-5 — Switching changes context only

```gherkin
Given one Business is active
When the person explicitly switches to another owned Business
Then the active management context changes
And ownership remains unchanged
```
### Scenario: AC-6 — Actions remain inside the exact context

```gherkin
Given one Business context is active
When a management action is requested
Then the action targets only that active Business
```
### Scenario: AC-7 — Entry and switching revalidate access

```gherkin
Given Dashboard entry or Business switching is requested
When access is evaluated
Then Enabled status and exact Business authorization are reevaluated
```
### Scenario: AC-8 — Admin authorization grants no Business entry

```gherkin
Given an Admin-authorized User has no ownership relationship to a Business
When Dashboard entry is requested for that Business
Then entry is rejected
```
### Scenario: AC-9 — Dashboard organizes without redefining

```gherkin
Given the Dashboard presents Business Information, correction notices, Offering inventory, or Affiliate Destination results
When a person enters an area
Then the authoritative owning Feature remains responsible for its behaviour
```
### Scenario: AC-10 — Dashboard has no analytics or CRM expansion

```gherkin
Given the Dashboard is open
When available management functions are evaluated
Then no Business analytics, conversion metrics, revenue reporting, ranking, trends, CRM, Messaging, or transaction behaviour is available
```
### Scenario: AC-11 — Failed switch preserves active context

```gherkin
Given one Business is active
When a switch to another Business fails
Then the last confirmed active Business remains active
```

---

## 9. Dependencies

### Depends On

- `US-IDN-F07-001` — exact authorized Business-context entry.
- `US-BUS-F01-001` — at least one owned Business exists.

### Blocks

- `US-BUS-F02-001` through `US-BUS-F07-001` — management occurs inside the exact active Business context.

---

## 10. Story Size

**M**

One context-management surface with exact entry, explicit switching, active identity, revalidation, no implicit authority, and no analytics expansion.

---

## 11. Out of Scope

- Behaviour inside Business Information, moderation, Offering, Affiliate Destination, or correction areas.
- Business analytics, CRM, Messaging, or transaction functions.
- Business ownership creation or transfer.
- Authentication implementation.

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

- [x] Represents one bounded Business outcome
- [x] Provides observable owner, person, or platform value
- [x] Independently understandable
- [x] Independently testable
- [x] Traceable to one Parent, Epic, Feature, PRD, and exact applicable UX
- [x] Domain code and Feature ID resolve to authoritative owners
- [x] Relationship classification and Capability reference match the Frozen Feature Registry
- [x] No duplicate Story identified in the current Business package
- [x] No implementation details
- [x] No invented upstream behaviour
- [x] Every Acceptance Criterion begins with “The system shall…”
- [x] Every Acceptance Criterion has one explicitly numbered Story-internal BDD scenario

---

## 15. Notes

F04 owns Business Dashboard context; each management Feature remains the owner of its own behaviour.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
