# US-BUS-F06-001 — Affiliate Destination Management Entry

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Business Feature Registry; does not create a separate Business login identity; does not require prior Admin approval for Business creation; does not merge public Business identity with protected Direct Contact; does not transfer final Offering Public Eligibility ownership to Business; does not add analytics, CRM, Messaging, permanent deletion, transactions, or Affiliate Destination administration authority; and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story; does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, or the Frozen Business Feature Registry; does not create a separate Business login identity; does not add prior Admin approval to Business creation; does not merge public identity with protected Direct Contact; does not move final Offering Public Eligibility ownership to Business; does not add analytics, CRM, Messaging, permanent deletion, transactions, or Affiliate Destination administration authority; and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, Capability-boundary, cross-domain dependency, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Business Feature `F06`. The identifier consumes Domain code `BUS` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F06` from Frozen `BUSINESS_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-BUS-F06-001` |
| Story Title | Affiliate Destination Management Entry |
| Parent Story Document | `US-0005 Business` (`US-0005-business.md`) |
| Story Domain | Business |
| Domain Code | `BUS` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Owned Offering and Handoff Configuration Entry |
| Feature | `F06` — Affiliate Destination Management Entry |
| Feature ID | `F06` — owned by Frozen `BUSINESS_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | Supporting relationship |
| Capability Reference | Handoff Enablement |
| Perspective | Authorized Business owner entering Affiliate Destination management for one owned Offering |
| Behaviour Owner | `PRD-0005-business.md` |
| Experience Owner | `UX-0005-business-dashboard.md` §13 |
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
| `[FEATURE_ID]` | `F06` | Frozen `BUSINESS_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Provide Business-side create, edit, and result-visibility entry for one Offering-associated Affiliate Destination while leaving configuration meaning, review, validation, status, and Handoff Eligibility with their authoritative owners.

---

## 4. Business Value

> **As a** authorized owner of an applicable owner-manageable Offering  
> **I want** to create or edit its Affiliate Destination and view authoritative review results  
> **So that** I can maintain the external destination without self-validating, self-enabling, or redefining Handoff Eligibility

---

## 5. Description

For an applicable owned Draft, Published, or Hidden Offering, and only where Business access rules permit management, the Dashboard may allow create where none exists, edit, and visibility of status, validation result, and Affiliate Destination Handoff Eligibility.

PRD-0001 owns zero-or-one association, configuration behaviour, status, validation meaning, and Handoff Eligibility. Business consumes these results without recalculation.

A Restricted Business may edit only where the associated Offering remains owner-manageable. An Offering-content correction does not grant unrelated Affiliate Destination authority, and an Affiliate Destination correction notice does not bypass the ordinary access gate.

Business cannot Review, Validate, Enable, or Disable. Those are separate PRD-0006 Affiliate Destination Administration actions consuming PRD-0001 effects.

Archived Offering destination information is view-only. A failed save does not claim validation, enablement, status, or eligibility change.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0005-business.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `BUS` code |
| Feature Registry | `BUSINESS_FEATURE_REGISTRY.md` | `F06` identity, scope label, references, and relationship classification |
| PRD | `PRD-0005-business.md` | Business behaviour and product rules |
| UX | `UX-0005-business-dashboard.md` §13 | Business-side destination entry and result visibility |
| Supporting PRD | `PRD-0001-offering.md` | Configuration, status, validation meaning, and Handoff Eligibility |
| Supporting PRD | `PRD-0006-platform.md` | Separate Review/Validate/Enable/Disable action surface |
| Accepted ADR | `ADR-0006-affiliate-destination-ownership.md` | Offering ownership and Business supporting entry |
| Accepted ADR | `ADR-0008-handoff-enablement-capability.md` | Handoff Enablement boundary |
| Owner Decision | `OWNER-DECISION-D03-AFFILIATE-DESTINATION-OWNERSHIP-2026-07-21.md` | Business management-entry boundary |
| Owner Decision | `OWNER-DECISION-D21-AFFILIATE-DESTINATION-ADMIN-ACTIONS-2026-07-21.md` | Separate Administration action family |
| Supporting Story | `US-OFR-F06-001-affiliate-destination-configuration.md` — Frozen v1.0 | Configuration behaviour |
| Supporting Story | `US-OFR-F07-001-affiliate-destination-eligibility-governance.md` — Frozen v1.0 | Eligibility governance |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Business own-domain authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Business Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall allow Affiliate Destination management entry only for an applicable owned Offering that is currently owner-manageable.
- **AC-2** — The system shall allow create entry where the applicable owned Offering has no Affiliate Destination.
- **AC-3** — The system shall allow edit entry for the existing Affiliate Destination where Business access rules permit management.
- **AC-4** — The system shall show authoritative Affiliate Destination status, validation result, and Handoff Eligibility without recalculation.
- **AC-5** — The system shall leave zero-or-one association, configuration consequences, status, validation meaning, and Handoff Eligibility owned by PRD-0001.
- **AC-6** — The system shall allow a Restricted Business to edit only where the associated Offering remains owner-manageable.
- **AC-7** — The system shall grant no unrelated Affiliate Destination authority from an Offering-content correction notice.
- **AC-8** — The system shall allow no Affiliate Destination correction notice to bypass the ordinary Business access gate.
- **AC-9** — The system shall prevent the Business from Review, Validate, Enable, Disable, or Handoff Eligibility recalculation.
- **AC-10** — The system shall make Affiliate Destination information for an Archived Offering view-only.
- **AC-11** — The system shall claim no validation, enablement, status, or Handoff Eligibility change when a destination save fails.
- **AC-12** — The system shall create no affiliate-network integration, attribution, tracking, commission, settlement, or external-conversion behaviour.

---

## 8. BDD

### Scenario: AC-1 — Destination entry requires owner-manageable Offering

```gherkin
Given an applicable owned Offering
When Affiliate Destination management is requested
Then the Offering must be currently owner-manageable
```
### Scenario: AC-2 — Create entry is available where none exists

```gherkin
Given an applicable owner-manageable Offering has no Affiliate Destination
When management entry is requested
Then the PRD-0001 create path may be available
```
### Scenario: AC-3 — Edit entry follows Business permission

```gherkin
Given an Affiliate Destination exists
When the owner requests Edit
Then current Business and Offering management rules must permit the entry
```
### Scenario: AC-4 — Authoritative results are visible by reference

```gherkin
Given destination results exist
When the Business owner views the destination
Then status, validation result, and Handoff Eligibility are shown
And none is recalculated
```
### Scenario: AC-5 — Business does not redefine destination behaviour

```gherkin
Given the Business enters destination management
When product rules or results are needed
Then PRD-0001 remains the authoritative owner
```
### Scenario: AC-6 — Restricted destination edit follows Offering manageability

```gherkin
Given the Business is `Restricted`
When Affiliate Destination edit is requested
Then the associated Offering must remain owner-manageable
```
### Scenario: AC-7 — Offering correction grants no destination authority

```gherkin
Given Request Correction targets Offering content
When the owner enters the bounded correction path
Then unrelated Affiliate Destination management authority is not granted
```
### Scenario: AC-8 — Destination correction preserves ordinary access gate

```gherkin
Given Request Correction targets Affiliate Destination configuration
When the owner opens the notice
Then ordinary Business and Offering management conditions still apply
```
### Scenario: AC-9 — Business has no administration authority

```gherkin
Given the owner manages an Affiliate Destination
When administration actions are evaluated
Then Review, Validate, Enable, Disable, and eligibility recalculation are unavailable
```
### Scenario: AC-10 — Archived destination is view-only

```gherkin
Given the associated Offering is `Archived`
When destination management is evaluated
Then destination information is view-only
```
### Scenario: AC-11 — Failed save claims no authoritative result

```gherkin
Given a destination save is attempted
When the save fails
Then no validation, enablement, status, or Handoff Eligibility change is claimed
```
### Scenario: AC-12 — Business destination entry adds no commercial integration

```gherkin
Given Affiliate Destination management is used
When resulting scope is evaluated
Then no affiliate-network integration, attribution, tracking, commission, settlement, or external conversion behaviour is created
```

---

## 9. Dependencies

### Depends On

- `US-BUS-F04-001` — one exact active Business context exists.
- `US-BUS-F05-001` — the associated Offering is owner-manageable.
- `PRD-0001-offering.md` — Affiliate Destination configuration and authoritative results.

### Blocks

- `PRD-0006-platform.md` — separate Admin review and administration may consume the configured destination.
- `US-DEC-F05-001` — an eligible destination may later support public Affiliate Handoff.

---

## 10. Story Size

**M**

One management-entry outcome with exact Offering gate, create/edit entry, result visibility, Restricted and correction boundaries, Admin separation, archive handling, and failure safety.

---

## 11. Out of Scope

- Affiliate Destination product model, cardinality, status, validation, and Handoff Eligibility.
- Review, Validate, Enable, or Disable action execution.
- Affiliate Handoff and Completion.
- Affiliate-network, attribution, commission, settlement, or technical integration.

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

F06 supports Handoff Enablement without becoming the configuration, eligibility, or administration behaviour owner.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
