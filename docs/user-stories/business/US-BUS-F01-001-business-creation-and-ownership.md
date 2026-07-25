# US-BUS-F01-001 — Business Creation and Ownership

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Business Feature Registry; does not create a separate Business login identity; does not require prior Admin approval for Business creation; does not merge public Business identity with protected Direct Contact; does not transfer final Offering Public Eligibility ownership to Business; does not add analytics, CRM, Messaging, permanent deletion, transactions, or Affiliate Destination administration authority; and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story; does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, or the Frozen Business Feature Registry; does not create a separate Business login identity; does not add prior Admin approval to Business creation; does not merge public identity with protected Direct Contact; does not move final Offering Public Eligibility ownership to Business; does not add analytics, CRM, Messaging, permanent deletion, transactions, or Affiliate Destination administration authority; and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, Capability-boundary, cross-domain dependency, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Business Feature `F01`. The identifier consumes Domain code `BUS` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F01` from Frozen `BUSINESS_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-BUS-F01-001` |
| Story Title | Business Creation and Ownership |
| Parent Story Document | `US-0005 Business` (`US-0005-business.md`) |
| Story Domain | Business |
| Domain Code | `BUS` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Business Establishment and Information |
| Feature | `F01` — Business Creation and Ownership |
| Feature ID | `F01` — owned by Frozen `BUSINESS_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | No Capability Architecture required |
| Capability Reference | Not required under ADR-0007 |
| Perspective | Enabled authenticated User establishing one owned Business Profile |
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
| `[FEATURE_ID]` | `F01` | Frozen `BUSINESS_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Create one immediately manageable Business Profile with exactly one owning User Account and no separate Business login identity.

---

## 4. Business Value

> **As a** Enabled authenticated User creating a Business  
> **I want** to create one Business Profile with a required display name  
> **So that** I can immediately enter and manage that Business through my existing User Account

---

## 5. Description

Business creation requires one Enabled authenticated User Account and one non-empty Business display name. Prior Admin approval is not required.

A newly created Business begins with Business Moderation Status `Unrestricted` and Business Public Exposure Input `Eligible`, and becomes immediately available to the owner for management.

Each Business has exactly one owner in V1. One User Account may own multiple Businesses, but ownership transfer, co-ownership, delegated access, team members, invitations, and internal Business roles are outside V1.

Business is a profile and context under the same User Account, not a separate login identity. Immediate management creates no dedicated public Business Profile page.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0005-business.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `BUS` code |
| Feature Registry | `BUSINESS_FEATURE_REGISTRY.md` | `F01` identity, scope label, references, and relationship classification |
| PRD | `PRD-0005-business.md` | Business behaviour and product rules |
| UX | `UX-0005-business-dashboard.md` §§5–6 | Business entry conditions and active Business context |
| Supporting PRD | `PRD-0003-identity.md` | Enabled authenticated User and same-account Business context |
| Supporting Story | `US-IDN-F07-001-business-context-access.md` — Frozen v1.0 | Exact authorized Business-context entry |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Business own-domain authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Business Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall require an Enabled authenticated User Account before Business creation may begin.
- **AC-2** — The system shall require an owning User Account and a non-empty Business display name.
- **AC-3** — The system shall require no prior Admin approval for Business creation.
- **AC-4** — The system shall create the Business with Business Moderation Status `Unrestricted`.
- **AC-5** — The system shall create the Business with Business Public Exposure Input `Eligible`.
- **AC-6** — The system shall make the newly created Business immediately available to its owner for management.
- **AC-7** — The system shall allow one User Account to own multiple Businesses.
- **AC-8** — The system shall assign exactly one owner to each Business in V1.
- **AC-9** — The system shall use the same User Account for User and Business contexts and create no separate Business login identity.
- **AC-10** — The system shall create no ownership transfer, co-owner, delegated-access, team-member, invitation, or internal-role behaviour.
- **AC-11** — The system shall create no dedicated public Business Profile page through immediate management.

---

## 8. BDD

### Scenario: AC-1 — Business creation requires Enabled authentication

```gherkin
Given a person requests Business creation
When identity eligibility is evaluated
Then an Enabled authenticated User Account must exist
```
### Scenario: AC-2 — Creation requires owner and display name

```gherkin
Given an Enabled authenticated User begins Business creation
When required information is validated
Then one owning User Account is required
And the Business display name must be non-empty
```
### Scenario: AC-3 — No prior Admin approval is required

```gherkin
Given valid Business creation information
When creation is requested
Then prior Admin approval is not required
```
### Scenario: AC-4 — New Business begins Unrestricted

```gherkin
Given valid Business creation completes
When the initial Business Moderation Status is established
Then the status is `Unrestricted`
```
### Scenario: AC-5 — New Business begins exposure Eligible

```gherkin
Given valid Business creation completes
When the initial Business Public Exposure Input is established
Then the input is `Eligible`
```
### Scenario: AC-6 — New Business is immediately manageable

```gherkin
Given a Business was created successfully
When the owner continues to Business management
Then the Business is immediately available
```
### Scenario: AC-7 — One User may own multiple Businesses

```gherkin
Given one User Account already owns a Business
When another valid Business is created by that User
Then the User Account may own both Businesses
```
### Scenario: AC-8 — Each Business has exactly one owner

```gherkin
Given a V1 Business exists
When its ownership is evaluated
Then exactly one User Account is the owner
```
### Scenario: AC-9 — Business is a context, not a login

```gherkin
Given the owner enters the new Business context
When identity is evaluated
Then the same User Account is used
And no separate Business login identity is created
```
### Scenario: AC-10 — Unsupported ownership models remain absent

```gherkin
Given V1 Business ownership is established
When available ownership behaviours are evaluated
Then no transfer, co-owner, delegated access, team member, invitation, or internal role exists
```
### Scenario: AC-11 — Creation does not create a public Business page

```gherkin
Given the Business is immediately manageable
When public presence is evaluated
Then no dedicated public Business Profile page is created
```

---

## 9. Dependencies

### Depends On

- `US-IDN-F07-001` — an Enabled authenticated User may enter an exact owned Business context after creation.

### Blocks

- `US-BUS-F02-001` — the owner may manage Business Information.
- `US-BUS-F04-001` — the Business may become the active Dashboard context.

---

## 10. Story Size

**M**

One establishment outcome with exact identity, initial status, ownership cardinality, immediate management, and explicit V1 ownership exclusions.

---

## 11. Out of Scope

- Business ownership transfer, co-ownership, delegated access, teams, invitations, or internal roles.
- Business closure, archival, deletion, restoration, or full lifecycle.
- Dedicated public Business page.
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

F01 owns Business creation and one-owner identity; Identity owns authentication and context-entry eligibility.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
