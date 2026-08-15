# US-DSC-F04-001 — Search Category Narrowing

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-24. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, or reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not change the Frozen Discovery Feature Registry, does not claim completion of all ADR-0002 §10 follow-ups, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-24. The exact In Review v0.2 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, architecture, Feature Registry, PRD/UX behaviour, or claim completion of all ADR-0002 §10 follow-ups, and does not update GitHub automatically.

> **Review Entry Note (0.2):** Bounded BDD correction after independent Claude audit. Adds Story-internal Search-order preservation coverage. No Story ID, Feature ID, Epic, Capability assignment, Acceptance Criterion, dependency, size, scope, or upstream behaviour changes.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal architecture, PRD/UX, Feature Registry, and Handbook validation. No Story ID, Feature ID, Feature name, Epic, Capability assignment, Acceptance Criterion, BDD scenario, dependency, size, scope, or upstream behaviour changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Discovery Feature `F04`. The identifier consumes Domain code `DSC` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F04` from Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-DSC-F04-001` |
| Story Title | Search Category Narrowing |
| Parent Story Document | `US-0002 Discovery` (`US-0002-discovery.md`) |
| Story Domain | Discovery |
| Domain Code | `DSC` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Search and Browse Navigation |
| Feature | `F04` — Search Category Narrowing |
| Feature ID | `F04` — owned by Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0 |
| Capability | Discovery — Direct Frozen assignment by reference |
| Perspective | Person narrowing a cross-Category Search |
| Behaviour Owner | `PRD-0002-discovery.md` |
| Experience Owner | `UX-0002-discovery.md` |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Done |
| Priority | Must |
| Story Size | M |
| Version | 1.0 |
| Last Updated | 2026-07-24 |
| Approval Date | 2026-07-24 |
| Approved By | Product Owner / Architecture Owner |
| Approved Candidate | In Review v0.2 |
| Freeze State | Frozen |
| Freeze Date | 2026-07-24 |
| Frozen By | Product Owner / Architecture Owner |
| Supersedes | None — first Story version |

---

## 2. Story Identification

The identifier follows `USER_STORY_HANDBOOK.md` §5 and consumes identifier components from their authoritative owners.

| Segment | Value | Owner by Reference |
|---|---|---|
| Prefix | `US` | `USER_STORY_HANDBOOK.md` |
| `[DOMAIN]` | `DSC` | `REPOSITORY_GOVERNANCE.md` — Story Domain Code Registry |
| `[FEATURE_ID]` | `F04` | Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story is contained by exactly one Parent Story Document and belongs to exactly one Epic and one Feature.

---

## 3. Purpose

Narrow one current Search through the active Category hierarchy while preserving Search origin, query, and Discovery Start identity.

---

## 4. Business Value

> **As a** person viewing Search candidates from multiple leaf Categories  
> **I want** to narrow the current Search to one active leaf Category  
> **So that** I can use category-specific Filters without losing my query or silently starting Browse

---

## 5. Description

Cross-Category Search may initially include candidates from more than one active leaf Category. Category narrowing remains part of the current Search.

Selecting an active leaf Category retains the exact current query, narrows the candidate set, supplies the current Category and Domain context, and enables applicable Attribute Filters.

The selection does not create a Browse Discovery Start. The existing Search Discovery Start gains the available Domain association. This Story does not define Filter matching or result ordering.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0002-discovery.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `DSC` code |
| Feature Registry | `DISCOVERY_FEATURE_REGISTRY.md` | `F04` identity and Direct Frozen assignment to Discovery |
| Capability Architecture | `OFFERING_CAPABILITY_ARCHITECTURE.md` | Discovery Capability boundary by reference |
| PRD | `PRD-0002-discovery.md` | Discovery behaviour and product rules |
| UX | `UX-0002-discovery.md` | Cross-Category Search narrowing, Search-origin Domain association |
| Supporting PRD | `PRD-0006-platform.md` | Active Category hierarchy and Domain source |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Discovery authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Discovery Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story standards, DoR, DoD, validation |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall make active Category narrowing available when one Search result context represents more than one active leaf Category.
- **AC-2** — The system shall retain the exact current Search query when an active Category path or leaf Category is selected.
- **AC-3** — The system shall narrow the current Search candidate set to the selected active leaf Category.
- **AC-4** — The system shall keep the route classified as Search and not create a Browse Discovery Start.
- **AC-5** — The system shall associate the existing Search Discovery Start with the selected leaf Category Domain when that context becomes available.
- **AC-6** — The system shall make category-specific Attribute Filters available only after one active leaf Category is selected and only through F05 rules.
- **AC-7** — The system shall preserve the current Search ordering mode for consumption by F07.

---

## 8. BDD

### Scenario: Cross-Category Search offers narrowing

```gherkin
Given current Search candidates represent more than one active leaf Category
When Discovery presents the current criteria
Then active Category narrowing is available
And category-specific Filters remain unavailable until a leaf is selected
```

### Scenario: Leaf selection preserves Search origin

```gherkin
Given a Search query is active
When the person selects one active leaf Category
Then the exact query remains active
And candidates are constrained to that leaf Category
And no Browse Discovery Start occurs
```

### Scenario: Search start gains Domain association

```gherkin
Given a Search Discovery Start currently has no Domain association
When the current Search is narrowed to one active leaf Category
Then the existing Search Discovery Start gains that Category Domain association
And the occurrence remains a Search Discovery Start
```


### Scenario: Category narrowing preserves the Search ordering mode

```gherkin
Given a Search result context has an active Search ordering mode
When the person narrows the Search to one active leaf Category
Then the current route remains Search
And the existing Search ordering mode remains applicable for F07
```

---

## 9. Dependencies

### Depends On

- `US-DSC-F02-001` — a current Search exists.
- `US-DSC-F03-001` — the active Category hierarchy supplies valid leaf identity.

### Blocks

- `US-DSC-F05-001` — category-specific Filters become available.
- `US-DSC-F06-001` — the narrowed Search result context is presented.

---

## 10. Story Size

**M**

One Search-preserving narrowing outcome with Category traversal, leaf context, Domain attribution, and explicit non-Browse semantics.

---

## 11. Out of Scope

- Beginning a new Browse path — `US-DSC-F03-001`.
- Filter value-kind and combination semantics — `US-DSC-F05-001`.
- Search matching — `US-DSC-F02-001`.
- Result ordering — `US-DSC-F07-001`.

---

## 12. Definition of Ready

Readiness is governed by `USER_STORY_HANDBOOK.md` §11 and is referenced here, not duplicated.

This Story is not committed to delivery merely because its document reaches Approved or Frozen.

---

## 13. Definition of Done

Completion is governed by `USER_STORY_HANDBOOK.md` §18 and is referenced here, not duplicated.

Applicable Engineering and QA obligations will be consumed from `ENGINEERING_CONSTITUTION.md` only after that document becomes authoritative. The current Engineering Constitution Draft is not a Story behaviour owner and does not advance this Story's Delivery Status.

---

## 14. Story Validation Checklist

- [x] Represents one bounded Discovery outcome
- [x] Provides observable person or platform value
- [x] Independently understandable
- [x] Independently testable
- [x] Traceable to one Parent Story Document, Epic, Feature, PRD, and applicable UX
- [x] Domain code and Feature ID resolve to authoritative owners
- [x] No duplicate Story identified in the current Discovery package
- [x] No implementation details
- [x] No invented upstream behaviour
- [x] Acceptance Criteria begin with “The system shall…”
- [x] Acceptance Criteria have corresponding BDD coverage

---

## 15. Notes

The Feature narrows Search; it does not create a saved Category preference or persistent URL state.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
