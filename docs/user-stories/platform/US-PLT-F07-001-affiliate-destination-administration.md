# US-PLT-F07-001 — Affiliate Destination Administration

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story; does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, or the Frozen Platform Feature Registry; does not create a separate Admin identity, account, or login; does not add Admin authorization grant/remove, delegation, tier management, or self-service provisioning; does not grant Business ownership through Admin authorization; does not merge General Moderation with Affiliate Destination Administration; does not treat case state as target state; does not move target-owned results to Platform; does not convert Request Correction into Messaging or automatic closure; does not weaken Category, Domain, retirement, or Attribute mutation-safety rules; does not expand Basic Analytics; does not introduce generic Platform Configuration or Settings scope; does not apply non-blocking observations as candidate changes; and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, Capability-boundary, cross-domain dependency, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Platform Feature `F07`. The identifier consumes Domain code `PLT` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F07` from Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-PLT-F07-001` |
| Story Title | Affiliate Destination Administration |
| Parent Story Document | `US-0006 Platform` (`US-0006-platform.md`) |
| Story Domain | Platform |
| Domain Code | `PLT` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Handoff and Representation Administration |
| Feature | `F07` — Affiliate Destination Administration |
| Feature ID | `F07` — owned by Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | Supporting relationship |
| Capability Reference | Handoff Enablement |
| Perspective | Authorized Admin administering one existing Affiliate Destination |
| Behaviour Owner | `PRD-0006-platform.md` |
| Experience Owner | `UX-0006-admin-dashboard.md` §9 |
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
| Freeze State | Not Frozen |
| Supersedes | None — first Story version |

---

## 2. Story Identification

| Segment | Value | Owner by Reference |
|---|---|---|
| Prefix | `US` | `USER_STORY_HANDBOOK.md` |
| `[DOMAIN]` | `PLT` | `REPOSITORY_GOVERNANCE.md` |
| `[FEATURE_ID]` | `F07` | Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Apply the separate Review, Validate, Enable, and Disable action family while consuming PRD-0001-owned destination states, validation, and Handoff Eligibility.

---

## 4. Business Value

> **As a** authorized Admin reviewing an Affiliate Destination  
> **I want** to apply only the approved administration action currently valid  
> **So that** the destination reaches the correct authoritative result without becoming General Moderation or changing unrelated state

---

## 5. Description

Affiliate Destination Administration is separate from General Moderation and contains exactly Review, Validate, Enable, and Disable.

Review changes no status, validation, or Handoff Eligibility by itself.

Validate produces PRD-0001-owned `Valid` or `Invalid` while preserving destination status.

Enable requires `Valid`, produces `Enabled`, and Handoff Eligibility `Eligible`.

Disable produces `Disabled`, Handoff Eligibility `Ineligible`, and preserves the current validation result.

Derived workload categories are Needs Validation, Business Correction Needed, and Ready to Enable; Enabled or Disabled has no pending item. These categories create no new destination state.

Administration changes no Offering lifecycle, Business Moderation Status, User Account access status, or final Offering Public Eligibility and creates no Messaging or affiliate-network behaviour.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0006-platform.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `PLT` code |
| Feature Registry | `PLATFORM_FEATURE_REGISTRY.md` | `F07` identity, scope label, references, and relationship classification |
| PRD | `PRD-0006-platform.md` | Platform behaviour and product rules |
| UX | `UX-0006-admin-dashboard.md` §9 | Administration actions, workload, and results |
| Supporting PRD | `PRD-0001-offering.md` | Destination state, validation, and Handoff Eligibility |
| Accepted ADR | `ADR-0006-affiliate-destination-ownership.md` | Offering ownership |
| Accepted ADR | `ADR-0008-handoff-enablement-capability.md` | Handoff Enablement boundary |
| Owner Decision | `OWNER-DECISION-D21-AFFILIATE-DESTINATION-ADMIN-ACTIONS-2026-07-21.md` | Separate action family |
| Owner Decision | `OWNER-DECISION-D23-HANDOFF-ENABLEMENT-CAPABILITY-2026-07-21.md` | Capability assignment |
| Supporting Story | `US-OFR-F06-001-affiliate-destination-configuration.md` — Frozen v1.0 | Configuration behaviour |
| Supporting Story | `US-OFR-F07-001-affiliate-destination-eligibility-governance.md` — Frozen v1.0 | Eligibility governance |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Platform own-domain and direct Offering-Capability authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Platform Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall keep Affiliate Destination Administration separate from General Moderation.
- **AC-2** — The system shall provide exactly Review, Validate, Enable, and Disable as Affiliate Destination Administration actions.
- **AC-3** — The system shall change no status, validation result, or Handoff Eligibility through Review alone.
- **AC-4** — The system shall consume `Valid` or `Invalid` from PRD-0001 after Validate while preserving destination status.
- **AC-5** — The system shall make Enable available only when validation is `Valid`.
- **AC-6** — The system shall consume destination status `Enabled` and Handoff Eligibility `Eligible` after successful Enable.
- **AC-7** — The system shall consume destination status `Disabled` and Handoff Eligibility `Ineligible` after successful Disable while preserving validation.
- **AC-8** — The system shall derive `Needs Validation` from Draft plus Not Validated.
- **AC-9** — The system shall derive `Business Correction Needed` from Draft plus Invalid.
- **AC-10** — The system shall derive `Ready to Enable` from Draft plus Valid.
- **AC-11** — The system shall produce no pending workload item for Enabled or Disabled.
- **AC-12** — The system shall create no new Affiliate Destination state from a workload category.
- **AC-13** — The system shall change no Offering lifecycle, Business Moderation Status, User Account access status, or final Offering Public Eligibility solely through Affiliate Destination Administration.
- **AC-14** — The system shall create no Messaging, affiliate-network integration, attribution, commission, settlement, or external-conversion tracking.
- **AC-15** — The system shall claim no result when an administration action fails.

---

## 8. BDD

### Scenario: AC-1 — Administration is a separate family

```gherkin
Given Platform action families are presented
When Affiliate Destination Administration is evaluated
Then it is separate from General Moderation
```
### Scenario: AC-2 — Administration action set is exact

```gherkin
Given an Affiliate Destination is reviewed
When administration actions are presented
Then only Review, Validate, Enable, and Disable belong to this action family
```
### Scenario: AC-3 — Review is state-neutral

```gherkin
Given Review Affiliate Destination is applied
When destination results are evaluated
Then status, validation, and Handoff Eligibility remain unchanged
```
### Scenario: AC-4 — Validate consumes exact result

```gherkin
Given Validate Affiliate Destination succeeds
When results are consumed
Then validation is Valid or Invalid
And destination status remains unchanged
```
### Scenario: AC-5 — Enable requires Valid

```gherkin
Given Enable Affiliate Destination is requested
When its gate is evaluated
Then validation must be `Valid`
```
### Scenario: AC-6 — Enable consumes exact results

```gherkin
Given valid Enable succeeds
When results are consumed
Then status is Enabled
And Handoff Eligibility is Eligible
```
### Scenario: AC-7 — Disable consumes exact results

```gherkin
Given Disable succeeds
When results are consumed
Then status is Disabled
And Handoff Eligibility is Ineligible
And validation is preserved
```
### Scenario: AC-8 — Needs Validation workload is derived

```gherkin
Given destination status is Draft and validation is Not Validated
When workload is derived
Then category is Needs Validation
```
### Scenario: AC-9 — Business Correction Needed is derived

```gherkin
Given destination status is Draft and validation is Invalid
When workload is derived
Then category is Business Correction Needed
```
### Scenario: AC-10 — Ready to Enable is derived

```gherkin
Given destination status is Draft and validation is Valid
When workload is derived
Then category is Ready to Enable
```
### Scenario: AC-11 — Terminal statuses have no pending item

```gherkin
Given destination status is Enabled or Disabled
When workload is derived
Then no pending item is produced
```
### Scenario: AC-12 — Workload is not destination state

```gherkin
Given a workload category is shown
When destination state is evaluated
Then no new status, validation, or eligibility value is created
```
### Scenario: AC-13 — Administration preserves unrelated state

```gherkin
Given an administration action succeeds
When unrelated states are evaluated
Then they remain unchanged
```
### Scenario: AC-14 — Administration adds no excluded commercial scope

```gherkin
Given Affiliate Destination Administration is used
When resulting scope is evaluated
Then no Messaging or excluded affiliate-commercial behaviour is created
```
### Scenario: AC-15 — Failed administration claims no result

```gherkin
Given an administration action is attempted
When it fails
Then no status, validation, eligibility, or workload result is claimed
```

---

## 9. Dependencies

### Depends On

- `US-PLT-F01-001` — authorized active Admin context.
- `PRD-0001-offering.md` — authoritative destination results.

### Blocks

- `US-DEC-F05-001` — an Eligible destination may later support public Affiliate Handoff.

---

## 10. Story Size

**L**

One administration family with four actions, exact results, derived workload, ownership boundaries, unrelated-state preservation, and excluded commercial scope.

---

## 11. Out of Scope

- Affiliate Destination configuration authoring.
- General Moderation.
- Affiliate Handoff and Completion.
- Affiliate-network integration, attribution, commission, settlement, or external conversion.

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

Platform owns the Admin action surface; Offering owns destination product results.

This Approved baseline does not Freeze itself and does not update GitHub automatically.
