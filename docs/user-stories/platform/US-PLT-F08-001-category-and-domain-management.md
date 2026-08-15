# US-PLT-F08-001 — Category and Domain Management

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Platform Feature Registry, does not change PRD/UX behaviour, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story; does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, or the Frozen Platform Feature Registry; does not create a separate Admin identity, account, or login; does not add Admin authorization grant/remove, delegation, tier management, or self-service provisioning; does not grant Business ownership through Admin authorization; does not merge General Moderation with Affiliate Destination Administration; does not treat case state as target state; does not move target-owned results to Platform; does not convert Request Correction into Messaging or automatic closure; does not weaken Category, Domain, retirement, or Attribute mutation-safety rules; does not expand Basic Analytics; does not introduce generic Platform Configuration or Settings scope; does not apply non-blocking observations as candidate changes; and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, Capability-boundary, cross-domain dependency, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Platform Feature `F08`. The identifier consumes Domain code `PLT` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F08` from Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-PLT-F08-001` |
| Story Title | Category and Domain Management |
| Parent Story Document | `US-0006 Platform` (`US-0006-platform.md`) |
| Story Domain | Platform |
| Domain Code | `PLT` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Handoff and Representation Administration |
| Feature | `F08` — Category and Domain Management |
| Feature ID | `F08` — owned by Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | Direct Frozen assignment |
| Capability Reference | Representation |
| Perspective | Authorized Admin managing shared Category hierarchy and V1 Domain assignment |
| Behaviour Owner | `PRD-0006-platform.md` |
| Experience Owner | `UX-0006-admin-dashboard.md` §10 |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Done |
| Priority | Must |
| Story Size | L |
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
| `[DOMAIN]` | `PLT` | `REPOSITORY_GOVERNANCE.md` |
| `[FEATURE_ID]` | `F08` | Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Create, rename, reparent, and retire Category definitions under exact hierarchy, Domain, active-leaf, and historical-safety rules.

---

## 4. Business Value

> **As a** authorized Admin managing Category definitions  
> **I want** to maintain a valid hierarchy across the three V1 Domains  
> **So that** Offerings retain stable, safe Category and Domain meaning

---

## 5. Description

An Admin may create a root Category with exactly one Domain from Mobility, Real Estate, or Technology; create a child; rename; reparent within the same Domain; and retire where conditions pass.

A Category has zero or one parent, roots have exactly one Domain, children inherit the root Domain, and a Category cannot become its own ancestor.

Offerings may be assigned only to active leaf Categories and derive Domain from that leaf.

Category identity remains stable on rename. Cross-Domain reparenting is unavailable, and a root Domain cannot change after any child or Offering exists beneath it.

Retirement requires no Draft, Published, or Hidden Offering assigned and no active child. Archived historical association does not block retirement.

A retired Category accepts no new Offering assignment, is absent from active Browse, and remains available for historical Archived records. No permanent deletion, merge, automated replacement, or cross-Domain migration exists.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0006-platform.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `PLT` code |
| Feature Registry | `PLATFORM_FEATURE_REGISTRY.md` | `F08` identity, scope label, references, and relationship classification |
| PRD | `PRD-0006-platform.md` | Platform behaviour and product rules |
| UX | `UX-0006-admin-dashboard.md` §10 | Category actions and invalid-state prevention |
| Supporting PRD | `PRD-0001-offering.md` | Category concept, Offering assignment, Domain derivation, and history |
| Accepted ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Direct Representation assignment |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Platform own-domain and direct Offering-Capability authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Platform Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall allow creation of a root Category only with exactly one Domain from Mobility, Real Estate, or Technology.
- **AC-2** — The system shall allow creation of a child Category under one valid parent.
- **AC-3** — The system shall allow Category rename while preserving Category identity.
- **AC-4** — The system shall allow reparenting only where the result remains a valid hierarchy within the same Domain.
- **AC-5** — The system shall prevent a Category from becoming its own ancestor.
- **AC-6** — The system shall require every root Category to have exactly one V1 Domain.
- **AC-7** — The system shall make child Categories inherit their root Domain.
- **AC-8** — The system shall allow Offering assignment only to an active leaf Category.
- **AC-9** — The system shall derive an Offering's Domain from its active leaf Category.
- **AC-10** — The system shall prevent cross-Domain reparenting.
- **AC-11** — The system shall prevent root Domain change after any child Category or Offering exists beneath the root.
- **AC-12** — The system shall allow Category retirement only when no Draft, Published, or Hidden Offering remains assigned and no active child remains.
- **AC-13** — The system shall allow Archived Offering historical association without blocking Category retirement.
- **AC-14** — The system shall prevent new Offering assignment and active Browse exposure for a retired Category while retaining historical definition.
- **AC-15** — The system shall provide no permanent deletion, merge, automated replacement, or cross-Domain migration.
- **AC-16** — The system shall claim no hierarchy, Domain, rename, or retirement result when the save fails.

---

## 8. BDD

### Scenario: AC-1 — Root creation requires one V1 Domain

```gherkin
Given an Admin creates a root Category
When Domain assignment is validated
Then exactly one of Mobility, Real Estate, or Technology is required
```
### Scenario: AC-2 — Child creation requires a valid parent

```gherkin
Given an Admin creates a child Category
When the hierarchy is saved
Then exactly one valid parent is assigned
```
### Scenario: AC-3 — Rename preserves identity

```gherkin
Given an existing Category
When its display name changes
Then the Category identity remains stable
```
### Scenario: AC-4 — Reparenting is same-Domain and valid

```gherkin
Given an existing Category is reparented
When the result is evaluated
Then the hierarchy remains valid
And the Domain remains unchanged
```
### Scenario: AC-5 — Self-ancestor hierarchy is blocked

```gherkin
Given a proposed parent change
When it would make the Category its own ancestor
Then the change is rejected
```
### Scenario: AC-6 — Every root has one Domain

```gherkin
Given a Category has no parent
When its definition is evaluated
Then exactly one V1 Domain exists
```
### Scenario: AC-7 — Child Domain is inherited

```gherkin
Given a Category is below a root
When Domain is derived
Then it equals the root Domain
```
### Scenario: AC-8 — Offering assignment requires active leaf

```gherkin
Given an Offering is assigned to a Category
When assignment eligibility is evaluated
Then the Category must be active and have no active child
```
### Scenario: AC-9 — Offering Domain comes from leaf Category

```gherkin
Given an Offering has an active leaf Category
When Domain is derived
Then it comes from that Category hierarchy
```
### Scenario: AC-10 — Cross-Domain reparenting is unavailable

```gherkin
Given a proposed parent is in another Domain
When reparenting is requested
Then the action is rejected
```
### Scenario: AC-11 — Used root Domain is immutable

```gherkin
Given a root has a child Category or Offering beneath it
When Domain change is requested
Then the action is rejected
```
### Scenario: AC-12 — Retirement requires no active dependencies

```gherkin
Given Category retirement is requested
When dependencies are evaluated
Then no Draft, Published, or Hidden Offering is assigned
And no active child remains
```
### Scenario: AC-13 — Archived history does not block retirement

```gherkin
Given only Archived Offerings retain association
When retirement conditions are evaluated
Then historical association does not block retirement
```
### Scenario: AC-14 — Retired Category is inactive but historical

```gherkin
Given a Category is retired
When future assignment, Browse, and history are evaluated
Then new assignment is unavailable
And active Browse excludes it
And historical definition remains readable
```
### Scenario: AC-15 — Excluded Category lifecycle remains absent

```gherkin
Given Category management is used
When destructive or migration actions are evaluated
Then permanent deletion, merge, automated replacement, and cross-Domain migration are unavailable
```
### Scenario: AC-16 — Failed Category action claims no result

```gherkin
Given a Category action is attempted
When it fails
Then no authoritative Category result is claimed
```

---

## 9. Dependencies

### Depends On

- `US-PLT-F01-001` — authorized active Admin context.
- `PRD-0001-offering.md` — Category meaning and Offering association.

### Blocks

- `PRD-0001-offering.md` and `PRD-0002-discovery.md` — active Category definitions support Offering assignment and Browse.

---

## 10. Story Size

**L**

One Category-definition management outcome with creation, hierarchy, Domain inheritance, assignment safety, retirement, historical retention, and excluded migration/deletion.

---

## 11. Out of Scope

- Offering assignment editing.
- Category merge, permanent deletion, replacement, or cross-Domain migration.
- Browse behaviour.
- Technical tree storage or migration implementation.

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

Platform directly owns Category definition management in Representation; Offering owns Category association and Domain derivation meaning.

This Approved baseline does not Freeze itself and does not update GitHub automatically.
