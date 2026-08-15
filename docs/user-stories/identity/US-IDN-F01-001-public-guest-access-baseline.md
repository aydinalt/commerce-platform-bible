# US-IDN-F01-001 — Public Guest Access Baseline

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Identity Feature Registry, does not create a separate Business/Admin login identity, does not add Favorites or Messaging, does not apply the F06 section-level UX citation future-maintenance observation as an authoritative change, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, Identity Feature Registry, or add a separate Business/Admin login identity, Favorites, or Messaging, and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, architecture-boundary, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Identity Feature `F01`. The identifier consumes Domain code `IDN` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F01` from Frozen `IDENTITY_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-IDN-F01-001` |
| Story Title | Public Guest Access Baseline |
| Parent Story Document | `US-0003 Identity` (`US-0003-identity.md`) |
| Story Domain | Identity |
| Domain Code | `IDN` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Public Access and Account Establishment |
| Feature | `F01` — Public Guest Access Baseline |
| Feature ID | `F01` — owned by Frozen `IDENTITY_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | Supporting relationship |
| Capability Reference | Discovery; Decision Support; Contact & Action |
| Perspective | Person using the public platform without an authenticated User context |
| Behaviour Owner | `PRD-0003-identity.md` |
| Experience Owner | `UX-0001-home.md`; `UX-0002-discovery.md`; `UX-0009-decision-flow.md` |
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
| `[FEATURE_ID]` | `F01` | Frozen `IDENTITY_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Apply one consistent public Guest authentication baseline while leaving Search, Offering, Compare, Decision Chat, Affiliate Handoff, Direct Contact, and Completion behaviour with their owning domains.

---

## 4. Business Value

> **As a** person using the platform without an authenticated context  
> **I want** public decision progress to remain available until an authoritative action specifically requires authentication  
> **So that** I can discover, evaluate, compare, use Decision Chat, and use an eligible Affiliate Handoff without premature registration

---

## 5. Description

Identity supplies the access gate only. Public Search, Browse, Filters, Offering Detail, Compare, Decision Chat, and eligible Affiliate Handoff remain owned by their respective PRDs and UX documents.

Direct Contact is the V1 public-to-authenticated boundary. A Guest cannot initiate Direct Contact or see protected telephone, email, or external contact URL information. The exact interrupted action may continue only through F09 after successful authentication.

A Suspended account may use the same public Guest baseline while remaining unable to enter authenticated User, Business, or Admin contexts. Guest use creates no Favorites, Messaging, persistent personal Decision history, or forced registration.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0003-identity.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `IDN` code |
| Feature Registry | `IDENTITY_FEATURE_REGISTRY.md` | `F01` identity, scope label, references, and relationship classification |
| PRD | `PRD-0003-identity.md` | Identity behaviour and product rules |
| Experience Support | `UX-0008-authentication.md` §§5, 12, 15 | Actions that do and do not enter Authentication |
| Supporting PRD | `PRD-0002-discovery.md` | Public Discovery behaviour |
| Supporting PRD | `PRD-0004-decision.md` | Public Decision Chat, Affiliate Handoff, and authenticated Direct Contact |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Own-domain authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Identity Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall provide a public Guest context without requiring a User Account.
- **AC-2** — The system shall permit Search, Browse, Filters, Offering Detail, Compare, and Decision Chat in the Guest context without registration or login.
- **AC-3** — The system shall permit an eligible Affiliate Handoff and its approved Completion path in the Guest context without forced account creation before or after the handoff.
- **AC-4** — The system shall require an authenticated User context before Direct Contact may continue.
- **AC-5** — The system shall keep protected telephone, email, and external contact URL information unavailable to a Guest.
- **AC-6** — The system shall permit a Suspended account holder to use public Guest behaviour while blocking authenticated User, Business, and Admin contexts.
- **AC-7** — The system shall create no Favorites, Messaging, persistent personal Decision history, or forced registration as a consequence of Guest use.
- **AC-8** — The system shall apply the same public authentication baseline across Mobility, Real Estate, and Technology.

---

## 8. BDD

### Scenario: AC-1 — Public Guest context exists

```gherkin
Given a person has no authenticated User context
When the public platform is entered
Then a Guest context is available
And no User Account is required
```
### Scenario: AC-2 — Public discovery and evaluation remain ungated

```gherkin
Given a person is using the Guest context
When the person begins Search, Browse, Filters, Offering Detail, Compare, or Decision Chat
Then Identity does not require Registration or Login
And the owning PRD remains responsible for the action behaviour
```
### Scenario: AC-3 — Eligible Affiliate Handoff remains public

```gherkin
Given a Guest has an eligible Affiliate Handoff path
When the person explicitly initiates that path
Then authentication is not required
And account creation is not required before or after the handoff
```
### Scenario: AC-4 — Direct Contact is authentication-gated

```gherkin
Given a Guest explicitly requests Direct Contact
When Identity evaluates the gate
Then Direct Contact does not continue in Guest context
And Authentication is required
```
### Scenario: AC-5 — Protected contact information stays hidden

```gherkin
Given a Guest is evaluating an Offering with approved Direct Contact information
When the person has not authenticated
Then the telephone number, email address, and external contact URL remain unavailable
```
### Scenario: AC-6 — Suspended account retains only Guest baseline

```gherkin
Given a User Account access status is Suspended
When the person uses the public platform
Then the Guest baseline remains available
And authenticated User, Business, and Admin contexts remain unavailable
```
### Scenario: AC-7 — Excluded persistence is not created

```gherkin
Given a Guest uses public Discovery or Decision behaviour
When Identity consequences are evaluated
Then no Favorites, Messaging, or persistent personal Decision history is created
And no forced registration is introduced
```
### Scenario: AC-8 — Guest baseline is domain-consistent

```gherkin
Given the person enters Mobility, Real Estate, or Technology
When the public authentication baseline is evaluated
Then the same Guest gate rules apply in each Domain
```

---

## 9. Dependencies

### Depends On

- None.

### Blocks

- `US-IDN-F09-001` — Direct Contact may continue after exact authentication return.

---

## 10. Story Size

**M**

One cross-platform access-gate outcome with public allowances, one protected boundary, suspended Guest fallback, and excluded persistence.

---

## 11. Out of Scope

- Search, Browse, Filter, Offering, Compare, Decision Chat, Affiliate Handoff, Direct Contact, and Completion behaviour owned by their applicable PRDs.
- Authentication mechanics owned by F02–F05.
- Favorites and Messaging.
- Persistent personal Decision history.

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

Identity permits or blocks access; it does not redefine the public actions behind the gate.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
