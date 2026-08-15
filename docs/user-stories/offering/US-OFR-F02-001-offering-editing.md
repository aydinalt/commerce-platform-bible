# US-OFR-F02-001 — Offering Editing

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-22. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, or reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-22. The exact In Review v0.2 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, or architecture, and does not update GitHub automatically.

> **Review Entry Note (0.2):** Exact Draft candidate entered formal review after internal architecture and handbook validation. No Story ID, Feature ID, Feature name, Capability state, PRD/UX behaviour, Acceptance Criterion, BDD scenario, dependency, size, or scope changed during lifecycle entry.

> **Controlled Revision Note (0.2):** Controlled reconciliation of Draft v0.1. Replaces the invented `Creation (Offering Authoring family)` Capability value with the authoritative Deferred / Not Yet Decided state. Removes resolved edit TODOs and records the Draft, Published, Hidden, Archived, Restricted-Business bounded-correction, Universal Publication Minimum, lifecycle-preservation, and Initial Published At rules from Frozen PRD-0001 v3.1 and PRD-0005 v1.3.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-OFR-F02-001` |
| Story Title | Offering Editing |
| Parent Story Document | `US-0001 Offering` (`US-0001-offering.md`) |
| Story Domain | Offering |
| Domain Code | `OFR` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Offering Authoring |
| Feature | `F02` — Offering Editing |
| Feature ID | `F02` — owned by `OFFERING_CAPABILITY_ARCHITECTURE.md` |
| Capability | Deferred — Capability home Not Yet Decided; decision status owned by ADR-0003 |
| Perspective | Business Owner acting in one authorized Business context |
| Behaviour Owner | `PRD-0001-offering.md` |
| Experience Owner | `UX-0005-business-dashboard.md` |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Done |
| Priority | Must |
| Story Size | L |
| Version | 1.0 |
| Last Updated | 2026-07-22 |
| Approval Date | 2026-07-22 |
| Approved By | Product Owner / Architecture Owner |
| Approved Candidate | In Review v0.2 |
| Freeze State | Frozen |
| Freeze Date | 2026-07-22 |
| Frozen By | Product Owner / Architecture Owner |
| Supersedes | Draft v0.1 |

---

## 2. Story Identification

The identifier follows `USER_STORY_HANDBOOK.md` §5 and consumes identifier components from their authoritative owners.

| Segment | Value | Owner by Reference |
|---|---|---|
| Prefix | `US` | `USER_STORY_HANDBOOK.md` |
| `[DOMAIN]` | `OFR` | `REPOSITORY_GOVERNANCE.md` — Story Domain Code Registry |
| `[FEATURE_ID]` | `F02` | `OFFERING_CAPABILITY_ARCHITECTURE.md` — authoritative Offering Feature Registry |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story is contained by exactly one Parent Story Document and belongs to exactly one Epic and one Feature.

---

## 3. Purpose

Enable an authorized Business owner to keep one owned Offering accurate while preserving the lifecycle and access invariants of its current state.

---

## 4. Business Value

> **As a** Business Owner authorized to manage one owned Offering  
> **I want** to edit the Offering information that the current Business and lifecycle rules permit  
> **So that** the Offering remains accurate without silently changing its lifecycle or authority state

---

## 5. Description

Editing acts on one selected Offering owned by the active Business. Draft Offerings are editable under the normal Business access gate. Published and Hidden Offerings may be saved only when the Universal Publication Minimum remains satisfied and the applicable Business access gate permits the edit.

An invalid Published or Hidden edit is rejected. A successful edit preserves the current lifecycle state and immutable `Initial Published At`. Archived Offerings are historical and not editable.

A Restricted Business retains Draft management but has no normal Published/Hidden edit permission. The only exception is the exact bounded correction-edit path owned by `PRD-0005-business.md`, which requires an Open Offering-content correction case, exact ownership, exact targeted content, preserved publication minimum, and later Platform re-review.

The Capability home of F02 remains Deferred / Not Yet Decided. This Story consumes that upstream state and does not infer a Capability.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0001-offering.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `OFR` code |
| Capability Architecture | `OFFERING_CAPABILITY_ARCHITECTURE.md` | `F02` identity and authoritative Capability state |
| PRD | `PRD-0001-offering.md` | Offering behaviour and product rules |
| Supporting PRD | `PRD-0005-business.md`; `PRD-0006-platform.md` | Business access and Platform action surfaces where applicable |
| UX | `UX-0005-business-dashboard.md` | Experience behaviour |
| ADR | `ADR-0003-offering-feature-capability-associations.md` | Architectural constraint |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story standards, DoR, DoD, validation |
| Engineering Governance | `ENGINEERING_CONSTITUTION.md` | Engineering and QA obligations by reference |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall allow an authorized Business owner to edit one exact owned Draft Offering.
- **AC-2** — The system shall keep every successful edit associated with the same owning Business.
- **AC-3** — The system shall allow a Published Offering edit only when the applicable Business access gate permits it and the Universal Publication Minimum remains satisfied.
- **AC-4** — The system shall allow a Hidden Offering edit only when the applicable Business access gate permits it and the Universal Publication Minimum remains satisfied.
- **AC-5** — The system shall reject a Published or Hidden edit that would violate the Universal Publication Minimum.
- **AC-6** — The system shall preserve lifecycle Published or Hidden and preserve immutable Initial Published At after a successful edit.
- **AC-7** — The system shall deny editing of an Archived Offering.
- **AC-8** — The system shall deny normal Published or Hidden editing for a Restricted Business.
- **AC-9** — The system shall allow the bounded correction-edit path only for the exact Open correction target and targeted Offering-content area under `PRD-0005-business.md`.
- **AC-10** — The system shall not create, publish, retire, hide, restore, validate, enable, or disable an Offering or Affiliate Destination merely because an Offering edit is saved.

---

## 8. BDD

### Scenario: Owner edits an owned Draft

```gherkin
Given an authorized Business owner manages an owned Draft Offering
When the owner saves an allowed edit
Then the Offering remains associated with the same Business
And the lifecycle state remains Draft
```

### Scenario: Valid Published edit preserves publication invariants

```gherkin
Given an authorized owner may edit an owned Published Offering
And the edit preserves the Universal Publication Minimum
When the owner saves the edit
Then the Offering remains Published
And Initial Published At remains unchanged
```

### Scenario: Invalid Hidden edit is rejected

```gherkin
Given an authorized owner may edit an owned Hidden Offering
When the edit would violate the Universal Publication Minimum
Then the edit is rejected
And the Offering remains Hidden with its prior values
```

### Scenario: Archived Offering is historical only

```gherkin
Given an Offering is Archived
When the Business owner opens the record
Then the Offering is view-only
And editing is unavailable
```

### Scenario: Restricted owner uses only the exact bounded correction path

```gherkin
Given Business Moderation Status is Restricted
And an Open Request Correction targets exact Offering content on an owned Published or Hidden Offering
When the owner edits the exact targeted content area
Then the edit may proceed only under the bounded correction rules
And no unrelated Published or Hidden Offering becomes editable
And Platform re-review remains required
```

---

## 9. Dependencies

### Depends On

- `US-OFR-F01-001` — the Offering exists and is owned by one Business.
- `PRD-0005-business.md` — applicable normal and bounded correction access gates.

### Blocks

- `US-OFR-F04-001` — publication depends on a Draft satisfying the authoritative publication minimum.
- `US-OFR-F05-001` — public Presentation consumes the current authoritative Offering information.

---

## 10. Story Size

**L**

The single edit outcome spans four lifecycle states and a bounded Restricted-Business exception, but remains one coherent actor behaviour and is capped at the handbook's L size.

---

## 11. Out of Scope

- The Capability-home decision for F02 — Deferred / Not Yet Decided by ADR-0003.
- Creating a new Offering — `US-OFR-F01-001`.
- Draft → Published — `US-OFR-F04-001`.
- Owner retirement — `US-OFR-F03-001`.
- Admin Hide/Restore and correction-case closure — Platform-domain behaviour.
- Affiliate Destination configuration — `US-OFR-F06-001`.
- Attribute-definition or Category-definition management — `PRD-0006-platform.md`.

---

## 12. Definition of Ready

Readiness is governed by `USER_STORY_HANDBOOK.md` §11 and is referenced here, not duplicated.

This Story is not committed to delivery merely because its document reaches Approved or Frozen.

---

## 13. Definition of Done

Completion is governed by `USER_STORY_HANDBOOK.md` §18 and is referenced here, not duplicated.

Applicable Engineering and QA obligations are consumed by reference from `ENGINEERING_CONSTITUTION.md`.

---

## 14. Story Validation Checklist

- [x] Represents one bounded actor outcome
- [x] Provides observable user or business value
- [x] Independently understandable
- [x] Independently testable
- [x] Traceable to one Parent Story Document, Epic, Feature, PRD, and applicable UX
- [x] Domain code and Feature ID resolve to authoritative owners
- [x] No duplicate Story identified in the current Offering package
- [x] No implementation details
- [x] No invented upstream behaviour
- [x] Acceptance Criteria begin with “The system shall…”
- [x] Acceptance Criteria have corresponding BDD coverage

---

## 15. Notes

No additional product, UX, architecture, lifecycle, or implementation decision is recorded here.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
