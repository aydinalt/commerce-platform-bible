# US-DSC-F05-001 — Attribute Filtering

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-24. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, or reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not change the Frozen Discovery Feature Registry, does not claim completion of all ADR-0002 §10 follow-ups, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-24. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, architecture, Feature Registry, PRD/UX behaviour, or claim completion of all ADR-0002 §10 follow-ups, and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal architecture, PRD/UX, Feature Registry, and Handbook validation. No Story ID, Feature ID, Feature name, Epic, Capability assignment, Acceptance Criterion, BDD scenario, dependency, size, scope, or upstream behaviour changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Discovery Feature `F05`. The identifier consumes Domain code `DSC` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F05` from Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-DSC-F05-001` |
| Story Title | Attribute Filtering |
| Parent Story Document | `US-0002 Discovery` (`US-0002-discovery.md`) |
| Story Domain | Discovery |
| Domain Code | `DSC` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Results and Refinement |
| Feature | `F05` — Attribute Filtering |
| Feature ID | `F05` — owned by Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0 |
| Capability | Discovery — Direct Frozen assignment by reference |
| Perspective | Person refining one leaf-Category Discovery context |
| Behaviour Owner | `PRD-0002-discovery.md` |
| Experience Owner | `UX-0002-discovery.md` |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Not Started |
| Priority | Must |
| Story Size | L |
| Version | 1.0 |
| Last Updated | 2026-07-24 |
| Approval Date | 2026-07-24 |
| Approved By | Product Owner / Architecture Owner |
| Approved Candidate | In Review v0.1 |
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
| `[FEATURE_ID]` | `F05` | Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story is contained by exactly one Parent Story Document and belongs to exactly one Epic and one Feature.

---

## 3. Purpose

Refine one Search or Browse result context through authoritative, applicable, filterable Attribute definitions and deterministic value-kind semantics.

---

## 4. Business Value

> **As a** person with one active leaf Category selected  
> **I want** to apply only meaningful Attribute Filters  
> **So that** I can narrow eligible Offerings predictably without hidden defaults or invented values

---

## 5. Description

A Filter is available only when one active leaf Category is selected, the Attribute applies to that Category, and the PRD-0006-owned `filterable` property is true. Text Attributes are not Filters in V1.

Number uses inclusive minimum and/or maximum bounds. Boolean uses exact true/false. Single Select and Multi Select allow one or more selected values combined with OR. Different Attribute Filters combine with AND. Search query, selected leaf Category, and all Filters combine with AND.

An Offering missing the value for an applied Filter does not match. Applying a Filter narrows or preserves the current result set; removing a Filter expands or preserves it. Clearing all Filters retains the current query and leaf Category unless the person separately changes them.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0002-discovery.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `DSC` code |
| Feature Registry | `DISCOVERY_FEATURE_REGISTRY.md` | `F05` identity and Direct Frozen assignment to Discovery |
| Capability Architecture | `OFFERING_CAPABILITY_ARCHITECTURE.md` | Discovery Capability boundary by reference |
| PRD | `PRD-0002-discovery.md` | Discovery behaviour and product rules |
| UX | `UX-0002-discovery.md` | Filter availability, value kinds, combination, criteria preservation |
| Supporting PRD | `PRD-0006-platform.md` | Attribute definition, applicability, value kind, filterable property |
| Supporting PRD | `PRD-0001-offering.md` | Authoritative Offering Attribute values and meaning |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Discovery authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Discovery Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story standards, DoR, DoD, validation |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall present an Attribute as a Filter only when one active leaf Category is selected, the Attribute applies to that Category, and filterable equals true.
- **AC-2** — The system shall exclude Text Attributes and non-applicable or non-filterable Attributes from V1 Filters.
- **AC-3** — The system shall apply Number minimum and maximum values as inclusive bounds and reject a missing Offering value for the applied Number Filter.
- **AC-4** — The system shall match Boolean only to the exact selected true or false value and reject a missing Offering value.
- **AC-5** — The system shall combine multiple selected values within one Single Select Filter using OR.
- **AC-6** — The system shall match a Multi Select Filter when the Offering value set intersects at least one selected value.
- **AC-7** — The system shall combine different Attribute Filters using AND.
- **AC-8** — The system shall combine the current Search match, active leaf Category, and all applied Attribute Filters using AND.
- **AC-9** — The system shall treat an Offering without a value for any applied Filter as not satisfying that Filter.
- **AC-10** — The system shall narrow or preserve Results when a Filter is applied.
- **AC-11** — The system shall expand or preserve Results when a Filter is removed.
- **AC-12** — The system shall retain the current query and active leaf Category when all Filters are cleared unless the person changes them separately.

---

## 8. BDD

### Scenario: Only authoritative Filters are available

```gherkin
Given one active leaf Category is selected
When Filters are presented
Then only applicable Attributes with filterable true are available
And Text Attributes are absent
```

### Scenario: Number uses inclusive bounds

```gherkin
Given a filterable Number Attribute and supplied inclusive minimum and maximum
When Results are evaluated
Then an Offering matches only when its authoritative numeric value is inside both bounds
And an Offering without a value does not match
```

### Scenario: Select values use OR

```gherkin
Given more than one allowed value is selected within one Single Select or Multi Select Filter
When Results are evaluated
Then an Offering may satisfy that Filter through at least one selected value
```

### Scenario: Different Filters use AND

```gherkin
Given two different Attribute Filters are applied
When Results are evaluated
Then an Offering must satisfy both Filters
```

### Scenario: Search, leaf, and Filters combine

```gherkin
Given a Search query, one active leaf Category, and applied Filters
When Results are evaluated
Then an Offering must satisfy the Search relationship, leaf Category, and every applied Filter
```

### Scenario: Clearing Filters preserves other criteria

```gherkin
Given current query, active leaf Category, and applied Filters
When the person clears all Filters
Then the query and active leaf Category remain
And no hidden default Filter is invented
```

---

## 9. Dependencies

### Depends On

- `US-DSC-F03-001` or `US-DSC-F04-001` — one active leaf Category is established.
- `PRD-0006-platform.md` — authoritative Attribute definition and filterable properties.

### Blocks

- `US-DSC-F06-001` — filtered candidates are represented as Results.
- `US-DSC-F07-001` — filtering preserves the applicable order.
- `US-DSC-F08-001` — filters may produce Zero Results.

---

## 10. Story Size

**L**

One cohesive filtering outcome with four value kinds, missing-value semantics, OR/AND composition, and criteria-preservation behaviour.

---

## 11. Out of Scope

- Attribute definition, value-kind creation, applicability management, or filterable-property management — `PRD-0006-platform.md`.
- Offering Attribute authoring — `PRD-0001-offering.md`.
- Text filtering, Recommendations, saved Filters, persistent URL state, or user-controlled Sort.
- Filter visual layout and control design — `UX-0002-discovery.md`.

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

The Story consumes Attribute ownership by reference and does not define or manage Attributes.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
