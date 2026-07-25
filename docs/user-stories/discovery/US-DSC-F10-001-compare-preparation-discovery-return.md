# US-DSC-F10-001 — Compare Preparation Discovery Return

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-24. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, or reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not change the Frozen Discovery Feature Registry, does not claim completion of all ADR-0002 §10 follow-ups, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-24. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, architecture, Feature Registry, PRD/UX behaviour, or claim completion of all ADR-0002 §10 follow-ups, and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal architecture, PRD/UX, Feature Registry, and Handbook validation. No Story ID, Feature ID, Feature name, Epic, Capability assignment, Acceptance Criterion, BDD scenario, dependency, size, scope, or upstream behaviour changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Discovery Feature `F10`. The identifier consumes Domain code `DSC` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F10` from Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-DSC-F10-001` |
| Story Title | Compare Preparation Discovery Return |
| Parent Story Document | `US-0002 Discovery` (`US-0002-discovery.md`) |
| Story Domain | Discovery |
| Domain Code | `DSC` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Discovery Continuity and Handoff |
| Feature | `F10` — Compare Preparation Discovery Return |
| Feature ID | `F10` — owned by Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0 |
| Capability | Discovery — Direct Frozen assignment by reference |
| Perspective | Person returning from one-Offering Compare preparation to find a second candidate |
| Behaviour Owner | `PRD-0002-discovery.md` |
| Experience Owner | `UX-0002-discovery.md`; `UX-0003-offering-detail.md`; `UX-0004-compare.md` |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Not Started |
| Priority | Must |
| Story Size | M |
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
| `[FEATURE_ID]` | `F10` | Frozen `DISCOVERY_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story is contained by exactly one Parent Story Document and belongs to exactly one Epic and one Feature.

---

## 3. Purpose

Preserve one transient Compare-preparation context while Discovery helps the person find another eligible Offering from the same active leaf Category.

---

## 4. Business Value

> **As a** person holding one eligible Compare-preparation Offering  
> **I want** to return to the same leaf Category and inspect another eligible Offering  
> **So that** I can resume Compare preparation without saved Discovery state or Discovery adding members to the Comparison Set

---

## 5. Description

UX-0004 may return exactly one eligible preparation Offering, its active leaf Category, and an instruction to find another eligible Offering in that same leaf Category.

The context is current-flow-only, transient, unsaved, non-restorable after the flow ends, and not represented as persistent or shareable URL state. Opening the return does not create a Discovery Start.

UX-0002 constrains Results to the same active leaf Category. When the person opens another eligible Offering, Discovery passes the exact new Offering and the unchanged preparation context to UX-0003. Discovery does not add either Offering to the Comparison Set. Leaving the preparation flow clears the transient context.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0002-discovery.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `DSC` code |
| Feature Registry | `DISCOVERY_FEATURE_REGISTRY.md` | `F10` identity and Direct Frozen assignment to Discovery |
| Capability Architecture | `OFFERING_CAPABILITY_ARCHITECTURE.md` | Discovery Capability boundary by reference |
| PRD | `PRD-0002-discovery.md` | Discovery behaviour and product rules |
| UX Return Source | `UX-0004-compare.md` | One-Offering preparation return contract |
| UX Discovery | `UX-0002-discovery.md` | Same-leaf constrained return and transient state |
| UX Handoff | `UX-0003-offering-detail.md` | Unchanged context forwarding back to Compare |
| Supporting PRD | `PRD-0004-decision.md` | Comparison Set and Compare behaviour owner |
| Feature Dependency | `DECISION_FEATURE_REGISTRY.md` F01 | Comparison Set and Compare identity by reference |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Discovery authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Discovery Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story standards, DoR, DoD, validation |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall accept a current-flow Compare-preparation return containing exactly one eligible preparation Offering and its active leaf Category.
- **AC-2** — The system shall constrain the Discovery result context to that same active leaf Category.
- **AC-3** — The system shall keep the preparation context transient, unsaved, non-restorable after the flow ends, and absent from persistent or shareable URL state.
- **AC-4** — The system shall not create a new Search or Browse Discovery Start merely because the preparation return opens.
- **AC-5** — The system shall pass the exact newly opened eligible Offering and the unchanged preparation context to UX-0003.
- **AC-6** — The system shall not add an Offering to the Comparison Set or claim Compare Start.
- **AC-7** — The system shall clear the transient preparation context when the person leaves the current preparation flow.
- **AC-8** — The system shall apply normal public eligibility, Listing Card, ordering, Filter, and Zero Results rules inside the constrained leaf context.

---

## 8. BDD

### Scenario: Preparation return constrains the leaf context

```gherkin
Given UX-0004 returns one eligible preparation Offering and its active leaf Category
When UX-0002 opens the preparation return
Then Results are constrained to that same active leaf Category
And no new Discovery Start occurs
```

### Scenario: Preparation context remains transient

```gherkin
Given a Compare-preparation context is active
When the current Discovery flow continues
Then the context is not saved, persisted, shared, or restored after the flow ends
```

### Scenario: Second Offering is passed unchanged through Detail

```gherkin
Given the person opens another eligible same-leaf Offering
When Discovery hands off to UX-0003
Then UX-0003 receives the exact new Offering and unchanged preparation context
And Discovery does not add a Comparison Set member
```

### Scenario: Leaving the preparation flow clears context

```gherkin
Given a transient preparation context is active
When the person leaves the current Compare-preparation flow
Then the preparation context is cleared
And no saved Comparison Set or saved Discovery state is created
```

---

## 9. Dependencies

### Depends On

- `UX-0004-compare.md` and Decision Feature `DEC F01` — valid one-Offering preparation context.
- `US-DSC-F03-001` — authoritative active leaf Category context.
- `US-DSC-F06-001` and `US-DSC-F09-001` — result presentation and exact Offering handoff.

### Blocks

- Future Decision-domain Compare Story continuation after another eligible Offering returns through UX-0003.

---

## 10. Story Size

**M**

One transient continuity outcome spanning UX-0004 → UX-0002 → UX-0003 with strict same-leaf, no-start, no-save, and no-set-mutation boundaries.

---

## 11. Out of Scope

- Comparison Set creation, membership, Compare Start, remove/replace, and Decision continuation — Decision domain / UX-0004.
- Saved Comparison Sets, saved Discovery criteria, persistent URL state, Search History, or Favorites.
- General Offering Presentation — `US-DSC-F09-001` and Offering domain.

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

This Story preserves a current-flow context; it does not make transient state a persistent Discovery or Identity capability.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
