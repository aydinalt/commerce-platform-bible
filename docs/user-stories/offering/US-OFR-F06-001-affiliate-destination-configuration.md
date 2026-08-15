# US-OFR-F06-001 — Affiliate Destination Configuration

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-22. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, or reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-22. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, or architecture, and does not update GitHub automatically.

> **Review Entry Note (0.1):** Exact Draft candidate entered formal review after internal architecture and handbook validation. No Story ID, Feature ID, Feature name, Capability state, PRD/UX behaviour, Acceptance Criterion, BDD scenario, dependency, size, or scope changed during lifecycle entry.

> **Controlled Revision Note (0.1):** First controlled Story candidate for authoritative Feature F06. Consumes Frozen PRD-0001 v3.1, PRD-0005 v1.3, UX-0005 v1.0, ADR-0006, ADR-0008, and the Offering Capability Architecture v2.0. No Feature ID or Capability is created by this Story.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-OFR-F06-001` |
| Story Title | Affiliate Destination Configuration |
| Parent Story Document | `US-0001 Offering` (`US-0001-offering.md`) |
| Story Domain | Offering |
| Domain Code | `OFR` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Affiliate Destination Readiness |
| Feature | `F06` — Affiliate Destination Configuration |
| Feature ID | `F06` — owned by `OFFERING_CAPABILITY_ARCHITECTURE.md` |
| Capability | Handoff Enablement — authoritative `F06 → Handoff Enablement` association |
| Perspective | Business Owner authorized to manage one applicable owned Offering |
| Behaviour Owner | `PRD-0001-offering.md` |
| Experience Owner | `UX-0005-business-dashboard.md` |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Done |
| Priority | Must |
| Story Size | M |
| Version | 1.0 |
| Last Updated | 2026-07-22 |
| Approval Date | 2026-07-22 |
| Approved By | Product Owner / Architecture Owner |
| Approved Candidate | In Review v0.1 |
| Freeze State | Frozen |
| Freeze Date | 2026-07-22 |
| Frozen By | Product Owner / Architecture Owner |
| Supersedes | None — first Story version |

---

## 2. Story Identification

The identifier follows `USER_STORY_HANDBOOK.md` §5 and consumes identifier components from their authoritative owners.

| Segment | Value | Owner by Reference |
|---|---|---|
| Prefix | `US` | `USER_STORY_HANDBOOK.md` |
| `[DOMAIN]` | `OFR` | `REPOSITORY_GOVERNANCE.md` — Story Domain Code Registry |
| `[FEATURE_ID]` | `F06` | `OFFERING_CAPABILITY_ARCHITECTURE.md` — authoritative Offering Feature Registry |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story is contained by exactly one Parent Story Document and belongs to exactly one Epic and one Feature.

---

## 3. Purpose

Enable an authorized Business owner to create or edit the one Affiliate Destination associated with an applicable owned Offering.

---

## 4. Business Value

> **As a** Business Owner authorized to manage one applicable owned Draft, Published, or Hidden Offering  
> **I want** to configure its Affiliate Destination  
> **So that** the destination can later be reviewed for possible Affiliate Handoff enablement

---

## 5. Description

An Offering may have zero or one Affiliate Destination in V1. The destination is a distinct object, belongs to exactly one Offering, and cannot be shared.

Creation or any edit produces Destination Status Draft, Validation Result Not Validated, and Affiliate Destination Handoff Eligibility Ineligible. Editing an Enabled or Disabled destination resets those values so an earlier validation cannot remain authoritative for changed configuration.

Business-side management is available only for an applicable owned Draft, Published, or Hidden Offering and only where the Business access gate permits it. Archived Offering destination information is view-only. The Business cannot Review, Validate, Enable, Disable, or recalculate Handoff Eligibility.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0001-offering.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `OFR` code |
| Capability Architecture | `OFFERING_CAPABILITY_ARCHITECTURE.md` | `F06` identity and authoritative Capability state |
| PRD | `PRD-0001-offering.md` | Offering behaviour and product rules |
| Supporting PRD | `PRD-0005-business.md`; `PRD-0006-platform.md` | Business access and Platform action surfaces where applicable |
| UX | `UX-0005-business-dashboard.md` | Experience behaviour |
| ADR | `ADR-0006-affiliate-destination-ownership.md` | Architectural constraint |
| ADR | `ADR-0008-handoff-enablement-capability.md` | Architectural constraint |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story standards, DoR, DoD, validation |
| Engineering Governance | `ENGINEERING_CONSTITUTION.md` | Engineering and QA obligations by reference |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall allow an authorized Business owner to create one Affiliate Destination for an applicable owned Draft, Published, or Hidden Offering when none exists.
- **AC-2** — The system shall associate the Affiliate Destination with exactly one Offering and prevent it from being shared across Offerings.
- **AC-3** — The system shall produce Destination Status Draft, Validation Result Not Validated, and Handoff Eligibility Ineligible when a destination is created.
- **AC-4** — The system shall allow an authorized Business owner to edit the associated destination where the Offering and Business access gates permit management.
- **AC-5** — The system shall reset an edited Draft, Enabled, or Disabled destination to Draft, Not Validated, and Ineligible.
- **AC-6** — The system shall show the Business owner the current destination status, validation result, and Handoff Eligibility.
- **AC-7** — The system shall make destination information view-only when the associated Offering is Archived.
- **AC-8** — The system shall deny the Business owner Review, Validate, Enable, Disable, or direct Handoff Eligibility recalculation actions.
- **AC-9** — The system shall treat the configured destination as an Affiliate Handoff destination rather than a Direct Contact channel.

---

## 8. BDD

### Scenario: Owner creates the destination for an owned Offering

```gherkin
Given an authorized Business owner manages an applicable owned Draft, Published, or Hidden Offering
And no Affiliate Destination exists
When the owner creates the Affiliate Destination
Then it belongs only to that Offering
And Destination Status is Draft
And Validation Result is Not Validated
And Handoff Eligibility is Ineligible
```

### Scenario: Editing invalidates earlier enablement

```gherkin
Given an owned Affiliate Destination is Enabled or Disabled
When the authorized Business owner edits its configuration
Then Destination Status becomes Draft
And Validation Result becomes Not Validated
And Handoff Eligibility becomes Ineligible
```

### Scenario: Archived destination is historical only

```gherkin
Given the associated Offering is Archived
When the Business owner opens its Affiliate Destination information
Then the information is view-only
And create and edit actions are unavailable
```

### Scenario: Business cannot self-administer eligibility

```gherkin
Given an Affiliate Destination exists
When the Business owner opens its management surface
Then Review, Validate, Enable, and Disable actions are unavailable
```

---

## 9. Dependencies

### Depends On

- `US-OFR-F01-001` — an owned Offering exists.
- `PRD-0005-business.md` — applicable Business and Offering management gate.

### Blocks

- `US-OFR-F07-001` — administration requires an existing configured Affiliate Destination.

---

## 10. Story Size

**M**

One Business-authoring outcome with object association, create/edit reset semantics, access gates, and Archived view-only treatment.

---

## 11. Out of Scope

- Review, Validate, Enable, and Disable action surfaces — `PRD-0006-platform.md` / `UX-0006-admin-dashboard.md`.
- Validation algorithms, provider integration, security implementation, or evidence collection.
- Direct Contact information — `PRD-0005-business.md` and Decision domain.
- Person-facing Affiliate Handoff and Completion — Decision domain.
- Offering creation or general Offering editing — F01/F02.

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
