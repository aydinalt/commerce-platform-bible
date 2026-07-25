# US-PLT-F09-001 — Attribute Definition Management

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Platform Feature Registry, does not change PRD/UX behaviour, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story; does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, or the Frozen Platform Feature Registry; does not create a separate Admin identity, account, or login; does not add Admin authorization grant/remove, delegation, tier management, or self-service provisioning; does not grant Business ownership through Admin authorization; does not merge General Moderation with Affiliate Destination Administration; does not treat case state as target state; does not move target-owned results to Platform; does not convert Request Correction into Messaging or automatic closure; does not weaken Category, Domain, retirement, or Attribute mutation-safety rules; does not expand Basic Analytics; does not introduce generic Platform Configuration or Settings scope; does not apply non-blocking observations as candidate changes; and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, Capability-boundary, cross-domain dependency, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Platform Feature `F09`. The identifier consumes Domain code `PLT` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F09` from Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-PLT-F09-001` |
| Story Title | Attribute Definition Management |
| Parent Story Document | `US-0006 Platform` (`US-0006-platform.md`) |
| Story Domain | Platform |
| Domain Code | `PLT` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Handoff and Representation Administration |
| Feature | `F09` — Attribute Definition Management |
| Feature ID | `F09` — owned by Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | Direct Frozen assignment |
| Capability Reference | Representation |
| Perspective | Authorized Admin managing shared Attribute definitions safely |
| Behaviour Owner | `PRD-0006-platform.md` |
| Experience Owner | `UX-0006-admin-dashboard.md` §11 |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Not Started |
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
| `[FEATURE_ID]` | `F09` | Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Create and edit exact Attribute definition properties while preventing silent reinterpretation or deletion of existing Offering values.

---

## 4. Business Value

> **As a** authorized Admin managing Attribute definitions  
> **I want** to configure applicability and approved properties under mutation-safety rules  
> **So that** Offering, Discovery, and Compare can consume stable authoritative metadata

---

## 5. Description

Every Attribute definition has a non-empty display name, one value kind, applicable Categories, required-for-publication, filterable, and comparable properties.

V1 value kinds are Text, Number, Boolean, Single Select, and Multi Select. Number may have one optional unit; Select kinds require at least one governed allowed value.

Text cannot be filterable in V1.

Required-for-publication may become true only when every Published and Hidden Offering in each applicable Category already has a value.

Removing applicability, changing value kind, or changing/removing an allowed Select value is blocked while any Draft, Published, or Hidden Offering uses the affected definition or value.

Archived values remain historical and readable. Existing Offering values are never silently deleted.

Changing filterable or comparable affects future Discovery or Compare presentation but changes no Offering lifecycle.

No permanent deletion, merge, replacement, deprecation state, or automated value migration exists.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0006-platform.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `PLT` code |
| Feature Registry | `PLATFORM_FEATURE_REGISTRY.md` | `F09` identity, scope label, references, and relationship classification |
| PRD | `PRD-0006-platform.md` | Platform behaviour and product rules |
| UX | `UX-0006-admin-dashboard.md` §11 | Attribute properties and mutation-safety feedback |
| Supporting PRD | `PRD-0001-offering.md` | Offering Attribute values and publication consequences |
| Supporting PRD | `PRD-0002-discovery.md` | Filter consumption |
| Supporting PRD | `PRD-0004-decision.md` | Compare consumption |
| Accepted ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Direct Representation assignment |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Platform own-domain and direct Offering-Capability authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Platform Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall require a non-empty display name, one V1 value kind, applicable Categories, required-for-publication, filterable, and comparable properties.
- **AC-2** — The system shall support exactly Text, Number, Boolean, Single Select, and Multi Select as V1 value kinds.
- **AC-3** — The system shall allow Number to define at most one optional governed unit label.
- **AC-4** — The system shall require at least one governed allowed value for Single Select and Multi Select.
- **AC-5** — The system shall prevent Text from being filterable in V1.
- **AC-6** — The system shall allow Category applicability to be added where the definition remains valid.
- **AC-7** — The system shall allow `required for publication = true` only when every Published and Hidden Offering in every applicable Category already has an authoritative value.
- **AC-8** — The system shall block removal of Category applicability while any Draft, Published, or Hidden Offering in that Category contains a value.
- **AC-9** — The system shall block value-kind change while any Draft, Published, or Hidden Offering contains a value.
- **AC-10** — The system shall block removal or change of an allowed Select value while any Draft, Published, or Hidden Offering uses it.
- **AC-11** — The system shall retain Archived values as historical and readable.
- **AC-12** — The system shall silently delete no existing Offering value.
- **AC-13** — The system shall allow filterable or comparable changes to affect future Discovery or Compare presentation without changing Offering lifecycle.
- **AC-14** — The system shall leave Offering values, Filter behaviour, and Compare behaviour with PRD-0001, PRD-0002, and PRD-0004 respectively.
- **AC-15** — The system shall provide no permanent deletion, merge, replacement, deprecation state, or automated value migration.
- **AC-16** — The system shall claim no definition change when a save fails.

---

## 8. BDD

### Scenario: AC-1 — Definition has the complete property set

```gherkin
Given an Attribute definition is created or edited
When required properties are validated
Then every approved definition property is present
```
### Scenario: AC-2 — Value kind set is exact

```gherkin
Given value kind is selected
When V1 options are presented
Then only Text, Number, Boolean, Single Select, and Multi Select are available
```
### Scenario: AC-3 — Number has one optional unit

```gherkin
Given value kind is Number
When unit configuration is evaluated
Then zero or one governed unit label is allowed
```
### Scenario: AC-4 — Select kinds require allowed values

```gherkin
Given value kind is Single Select or Multi Select
When the definition is saved
Then at least one governed allowed value exists
```
### Scenario: AC-5 — Text cannot be filterable

```gherkin
Given value kind is Text
When filterable is enabled
Then the change is rejected
```
### Scenario: AC-6 — Applicability may be added

```gherkin
Given an Attribute definition
When an applicable Category is added validly
Then the new applicability may be saved
```
### Scenario: AC-7 — Required flag is mutation-safe

```gherkin
Given required-for-publication is enabled
When existing Published and Hidden Offerings are evaluated
Then every applicable Offering has an authoritative value
```
### Scenario: AC-8 — Used applicability cannot be removed

```gherkin
Given active-lifecycle Offerings contain a value in a Category
When applicability removal is requested
Then the change is rejected
```
### Scenario: AC-9 — Used value kind cannot change

```gherkin
Given active-lifecycle Offerings contain values
When value-kind change is requested
Then the change is rejected
```
### Scenario: AC-10 — Used Select value cannot change or disappear

```gherkin
Given an allowed Select value is used by an active-lifecycle Offering
When removal or change is requested
Then the change is rejected
```
### Scenario: AC-11 — Archived values remain readable

```gherkin
Given an Archived Offering has Attribute values
When the definition changes validly
Then historical values remain readable
```
### Scenario: AC-12 — Existing values are never silently deleted

```gherkin
Given an Attribute definition mutation is requested
When existing Offering values are evaluated
Then no value is silently deleted
```
### Scenario: AC-13 — Presentation flags do not alter lifecycle

```gherkin
Given filterable or comparable changes validly
When future consumption and Offering lifecycle are evaluated
Then future Discovery or Compare may change
And Offering lifecycle remains unchanged
```
### Scenario: AC-14 — Consumers retain behaviour ownership

```gherkin
Given an Attribute definition is consumed
When value, Filter, or Compare behaviour is needed
Then the applicable consuming PRD remains authoritative
```
### Scenario: AC-15 — Excluded Attribute lifecycle remains absent

```gherkin
Given Attribute management is used
When lifecycle and migration actions are evaluated
Then permanent deletion, merge, replacement, deprecation, and automated migration are unavailable
```
### Scenario: AC-16 — Failed Attribute action claims no result

```gherkin
Given an Attribute definition save is attempted
When it fails
Then no authoritative definition change is claimed
```

---

## 9. Dependencies

### Depends On

- `US-PLT-F01-001` — authorized active Admin context.
- `PRD-0001-offering.md` — Attribute value and publication ownership.

### Blocks

- `PRD-0002-discovery.md` and `PRD-0004-decision.md` — Filter and Compare consume authoritative definition flags.

---

## 10. Story Size

**L**

One Attribute-definition management outcome with complete property set, value-kind constraints, mutation safety, historical retention, consumer ownership, and excluded lifecycle.

---

## 11. Out of Scope

- Offering Attribute value authoring.
- Filter or Compare behaviour.
- Permanent deletion, merge, deprecation, or automated migration.
- Technical schema or migration implementation.

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

Platform directly owns Attribute definition management in Representation; consuming PRDs own values and experience behaviour.

This Approved baseline does not Freeze itself and does not update GitHub automatically.
