# US-OFR-F07-001 — Affiliate Destination Eligibility Governance

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-22. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, or reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-22. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, or architecture, and does not update GitHub automatically.

> **Review Entry Note (0.1):** Exact Draft candidate entered formal review after internal architecture and handbook validation. No Story ID, Feature ID, Feature name, Capability state, PRD/UX behaviour, Acceptance Criterion, BDD scenario, dependency, size, or scope changed during lifecycle entry.

> **Controlled Revision Note (0.1):** First controlled Story candidate for authoritative Feature F07. Consumes Frozen PRD-0001 v3.1, PRD-0006 v2.1, UX-0006 v1.0, ADR-0006, ADR-0008, and the Offering Capability Architecture v2.0. PRD-0006 owns the administration action surface; PRD-0001 remains the sole behaviour owner of status, validation meaning, and Handoff Eligibility.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-OFR-F07-001` |
| Story Title | Affiliate Destination Eligibility Governance |
| Parent Story Document | `US-0001 Offering` (`US-0001-offering.md`) |
| Story Domain | Offering |
| Domain Code | `OFR` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Affiliate Destination Readiness |
| Feature | `F07` — Affiliate Destination Eligibility Governance |
| Feature ID | `F07` — owned by `OFFERING_CAPABILITY_ARCHITECTURE.md` |
| Capability | Handoff Enablement — authoritative `F07 → Handoff Enablement` association |
| Perspective | Authorized Admin governing one Affiliate Destination |
| Behaviour Owner | `PRD-0001-offering.md` |
| Experience Owner | `UX-0006-admin-dashboard.md` |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Done |
| Priority | Must |
| Story Size | L |
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
| `[FEATURE_ID]` | `F07` | `OFFERING_CAPABILITY_ARCHITECTURE.md` — authoritative Offering Feature Registry |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story is contained by exactly one Parent Story Document and belongs to exactly one Epic and one Feature.

---

## 3. Purpose

Enable an authorized Admin to review, validate, enable, or disable one Affiliate Destination while maintaining its authoritative Handoff Eligibility.

---

## 4. Business Value

> **As a** authorized Admin  
> **I want** to govern one Affiliate Destination through the approved administration actions  
> **So that** only an Enabled and Valid destination becomes eligible for a later Affiliate Handoff

---

## 5. Description

Platform owns the action surface and execution of Review, Validate, Enable, and Disable. PRD-0001 owns the resulting destination status, validation meaning, and Handoff Eligibility.

Review alone changes no state. Validate produces Valid or Invalid without changing destination status. Valid remains Ineligible until Enable. Enable is available only when Valid and produces Enabled plus Eligible. Disable applies to Enabled, produces Disabled plus Ineligible, and preserves the current validation result.

Destination Handoff Eligibility is Eligible only for Enabled + Valid. It remains separate from final Offering Public Eligibility and administration changes no Offering lifecycle, Business Moderation Status, or User Account access.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0001-offering.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `OFR` code |
| Capability Architecture | `OFFERING_CAPABILITY_ARCHITECTURE.md` | `F07` identity and authoritative Capability state |
| PRD | `PRD-0001-offering.md` | Offering behaviour and product rules |
| Supporting PRD | `PRD-0005-business.md`; `PRD-0006-platform.md` | Business access and Platform action surfaces where applicable |
| UX | `UX-0006-admin-dashboard.md` | Experience behaviour |
| ADR | `ADR-0006-affiliate-destination-ownership.md` | Architectural constraint |
| ADR | `ADR-0008-handoff-enablement-capability.md` | Architectural constraint |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story standards, DoR, DoD, validation |
| Engineering Governance | `ENGINEERING_CONSTITUTION.md` | Engineering and QA obligations by reference |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall allow only an authorized Admin to use Review, Validate, Enable, or Disable on an Affiliate Destination.
- **AC-2** — The system shall leave destination status, validation result, and Handoff Eligibility unchanged when Review alone is completed.
- **AC-3** — The system shall produce exactly one current validation result, Valid or Invalid, when Validate is completed.
- **AC-4** — The system shall leave destination status unchanged when Validate is completed.
- **AC-5** — The system shall keep Handoff Eligibility Ineligible after a Valid result until Enable is completed.
- **AC-6** — The system shall allow Enable only when Validation Result is Valid.
- **AC-7** — The system shall produce Destination Status Enabled and Handoff Eligibility Eligible when a Valid destination is enabled.
- **AC-8** — The system shall produce Destination Status Disabled and Handoff Eligibility Ineligible when an Enabled destination is disabled.
- **AC-9** — The system shall preserve the current validation result when Disable is completed.
- **AC-10** — The system shall produce Handoff Eligibility Eligible only when Destination Status is Enabled and Validation Result is Valid.
- **AC-11** — The system shall keep Affiliate Destination Handoff Eligibility separate from final Offering Public Eligibility.
- **AC-12** — The system shall not change Offering lifecycle, Business Moderation Status, or User Account access status through destination administration.

---

## 8. BDD

### Scenario: Review alone changes no destination result

```gherkin
Given an authorized Admin opens an Affiliate Destination workload item
When the Admin completes Review only
Then destination status is unchanged
And validation result is unchanged
And Handoff Eligibility is unchanged
```

### Scenario: Validation produces a result but does not enable

```gherkin
Given an authorized Admin validates a Draft Affiliate Destination
When the current configuration satisfies every PRD-0001 validation condition
Then Validation Result becomes Valid
And Destination Status remains Draft
And Handoff Eligibility remains Ineligible
```

### Scenario: Invalid validation remains ineligible

```gherkin
Given an authorized Admin validates an Affiliate Destination
When one or more PRD-0001 validation conditions are not satisfied
Then Validation Result becomes Invalid
And Handoff Eligibility is Ineligible
```

### Scenario: Valid destination is enabled

```gherkin
Given Validation Result is Valid
When an authorized Admin enables the destination
Then Destination Status becomes Enabled
And Handoff Eligibility becomes Eligible
```

### Scenario: Enabled destination is disabled

```gherkin
Given an Affiliate Destination is Enabled and Valid
When an authorized Admin disables it
Then Destination Status becomes Disabled
And Handoff Eligibility becomes Ineligible
And Validation Result remains Valid
```

### Scenario: Destination administration does not alter adjacent states

```gherkin
Given an authorized Admin performs an Affiliate Destination administration action
When the resulting destination state is recorded
Then Offering lifecycle is unchanged
And Business Moderation Status is unchanged
And User Account access status is unchanged
```

---

## 9. Dependencies

### Depends On

- `US-OFR-F06-001` — an Affiliate Destination configuration exists.
- `PRD-0006-platform.md` — authorized administration action surface.

### Blocks

- Decision-domain Affiliate Handoff Story — it consumes final Offering eligibility and destination Handoff Eligibility.

---

## 10. Story Size

**L**

One governance outcome with four bounded actions and one deterministic eligibility composition. The action family remains cohesive but reaches the handbook's L size.

---

## 11. Out of Scope

- Business creation or editing of destination configuration — `US-OFR-F06-001`.
- Technical validation method, provider integration, URL-security implementation, or evidence collection.
- Final Offering Public Eligibility composition — PRD-0001 separate concern.
- Person-facing Affiliate Handoff and Completion — Decision domain.
- General moderation case actions — `PRD-0006-platform.md`.

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
