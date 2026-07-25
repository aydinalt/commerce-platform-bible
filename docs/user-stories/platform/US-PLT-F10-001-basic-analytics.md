# US-PLT-F10-001 — Basic Analytics

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story; does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, or the Frozen Platform Feature Registry; does not create a separate Admin identity, account, or login; does not add Admin authorization grant/remove, delegation, tier management, or self-service provisioning; does not grant Business ownership through Admin authorization; does not merge General Moderation with Affiliate Destination Administration; does not treat case state as target state; does not move target-owned results to Platform; does not convert Request Correction into Messaging or automatic closure; does not weaken Category, Domain, retirement, or Attribute mutation-safety rules; does not expand Basic Analytics; does not introduce generic Platform Configuration or Settings scope; does not apply non-blocking observations as candidate changes; and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, Capability-boundary, cross-domain dependency, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Platform Feature `F10`. The identifier consumes Domain code `PLT` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F10` from Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-PLT-F10-001` |
| Story Title | Basic Analytics |
| Parent Story Document | `US-0006 Platform` (`US-0006-platform.md`) |
| Story Domain | Platform |
| Domain Code | `PLT` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Operational Visibility |
| Feature | `F10` — Basic Analytics |
| Feature ID | `F10` — owned by Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | No Capability Architecture required |
| Capability Reference | Not required under ADR-0007 |
| Perspective | Authorized Admin reviewing bounded current-state, workload, and core-flow indicators |
| Behaviour Owner | `PRD-0006-platform.md` |
| Experience Owner | `UX-0006-admin-dashboard.md` §12 |
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
| `[FEATURE_ID]` | `F10` | Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Present the exact V1 Basic Analytics inventory by approved period and available Domain association without redefining source results or automating action.

---

## 4. Business Value

> **As a** authorized Admin monitoring platform state and core-flow activity  
> **I want** to view bounded indicators and open relevant action areas  
> **So that** I can understand current workload without advanced analytics, autonomous moderation, or external-success claims

---

## 5. Description

Basic Analytics is an Admin-facing product view for operational visibility and action guidance, not instrumentation, advanced analytics, prediction, recommendation, or autonomous action.

Periods are exactly Today, Last 7 days, Last 30 days, and All time.

Indicators appear overall and by Mobility, Real Estate, and Technology where the source supplies Domain association. Search Discovery Start without selected leaf Category has no Domain; Platform never infers Domain from free-text.

Current-state indicators cover User Accounts, Businesses, Offerings by lifecycle and final eligibility, Affiliate Destinations by status/validation/Handoff Eligibility, General Moderation cases, and Affiliate Administration workload.

Core-flow indicators are Discovery Starts, Offering Presentation Opens, Compare Starts, Decision Chat Starts, Affiliate Handoff Completion, and Direct Contact Completion.

PRD-0004 owns Completion meaning. Basic Analytics never represents Completion as purchase, sale, contract, response, or external transaction success.

Actionable indicators may open the relevant queue or management area; informational indicators need not be interactive. No moderation or management action occurs automatically.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0006-platform.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `PLT` code |
| Feature Registry | `PLATFORM_FEATURE_REGISTRY.md` | `F10` identity, scope label, references, and relationship classification |
| PRD | `PRD-0006-platform.md` | Platform behaviour and product rules |
| UX | `UX-0006-admin-dashboard.md` §12 | Periods, grouping, indicators, and action handoff |
| Supporting PRD | `PRD-0002-discovery.md` | Discovery Start and Domain association |
| Supporting PRD | `PRD-0001-offering.md` | Presentation Open and Offering-derived state |
| Supporting PRD | `PRD-0004-decision.md` | Compare Start, Decision Chat Start, and Completion meaning |
| Supporting Story | `US-DEC-F07-001-decision-completion.md` — Frozen v1.0 | Separate Completion results |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Platform own-domain and direct Offering-Capability authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Platform Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall make Basic Analytics available only in an authorized active Admin context.
- **AC-2** — The system shall provide exactly Today, Last 7 days, Last 30 days, and All time as minimum selectable periods.
- **AC-3** — The system shall show indicators overall and by Mobility, Real Estate, and Technology only where the owning source supplies Domain association.
- **AC-4** — The system shall show Search Discovery Start without a selected leaf Category only in overall counts.
- **AC-5** — The system shall infer no Domain from free-text Search wording.
- **AC-6** — The system shall show User Accounts by Enabled and Suspended.
- **AC-7** — The system shall show Businesses by Unrestricted and Restricted.
- **AC-8** — The system shall show Offerings by Draft, Published, Hidden, Archived, and final Offering Public Eligibility Eligible/Ineligible.
- **AC-9** — The system shall show Affiliate Destinations by Draft, Enabled, Disabled, Not Validated, Valid, Invalid, and Handoff Eligibility Eligible/Ineligible.
- **AC-10** — The system shall show General Moderation cases by Open and Closed and Open cases by approved target type.
- **AC-11** — The system shall show Affiliate Destination Administration workload by Needs Validation, Business Correction Needed, and Ready to Enable.
- **AC-12** — The system shall show Discovery Starts, Offering Presentation Opens, Compare Starts, Decision Chat Starts, Affiliate Handoff Completion, and Direct Contact Completion as core-flow indicators.
- **AC-13** — The system shall consume Affiliate Handoff Completion and Direct Contact Completion without redefining their meaning.
- **AC-14** — The system shall present no Completion as purchase, sale, contract, response, or external transaction success.
- **AC-15** — The system shall allow actionable workload indicators to open the relevant queue or management area.
- **AC-16** — The system shall require no interaction from informational core-flow indicators.
- **AC-17** — The system shall perform no moderation or management action automatically.
- **AC-18** — The system shall provide no advanced or predictive analytics, recommendation, custom report builder, Business-facing analytics, billing, CRM, advertising, transaction, affiliate attribution, or external-conversion tracking.

---

## 8. BDD

### Scenario: AC-1 — Analytics requires Admin context

```gherkin
Given a person requests Basic Analytics
When access is evaluated
Then an authorized active Admin context is required
```
### Scenario: AC-2 — Period set is exact

```gherkin
Given an Admin selects a period
When period options are presented
Then Today, Last 7 days, Last 30 days, and All time are available
```
### Scenario: AC-3 — Domain grouping uses authoritative association

```gherkin
Given an indicator has source Domain association
When grouping is presented
Then overall and the applicable V1 Domain grouping are available
```
### Scenario: AC-4 — Uncategorized Search remains overall-only

```gherkin
Given a Search Discovery Start has no selected leaf Category
When Domain grouping is applied
Then the occurrence appears only in overall counts
```
### Scenario: AC-5 — Free text does not create Domain

```gherkin
Given a free-text Search query
When Domain grouping is determined
Then Platform does not infer Domain from query wording
```
### Scenario: AC-6 — User current state is visible

```gherkin
Given User Account current-state indicators are viewed
When status grouping is shown
Then Enabled and Suspended counts are present
```
### Scenario: AC-7 — Business current state is visible

```gherkin
Given Business current-state indicators are viewed
When status grouping is shown
Then Unrestricted and Restricted counts are present
```
### Scenario: AC-8 — Offering current state is visible

```gherkin
Given Offering current-state indicators are viewed
When lifecycle and eligibility grouping is shown
Then all four lifecycle states and both eligibility results are present
```
### Scenario: AC-9 — Destination current state is visible

```gherkin
Given Affiliate Destination indicators are viewed
When status, validation, and eligibility grouping is shown
Then every approved value is present
```
### Scenario: AC-10 — Moderation workload is visible

```gherkin
Given General Moderation indicators are viewed
When case grouping is shown
Then Open, Closed, and Open-by-target counts are present
```
### Scenario: AC-11 — Affiliate workload is visible

```gherkin
Given Affiliate Administration workload is viewed
When workload grouping is shown
Then all three derived categories are present
```
### Scenario: AC-12 — Core-flow indicator set is exact

```gherkin
Given core-flow activity is viewed
When indicators are presented
Then the exact six approved occurrence types are present
```
### Scenario: AC-13 — Completion remains Decision-owned

```gherkin
Given Completion counts are shown
When meaning is interpreted
Then PRD-0004's separate Completion meanings remain unchanged
```
### Scenario: AC-14 — Completion claims no external success

```gherkin
Given a Completion indicator is shown
When its label or explanation is presented
Then no external-success meaning is claimed
```
### Scenario: AC-15 — Actionable indicators hand off

```gherkin
Given an indicator represents actionable workload
When the Admin chooses it
Then the relevant queue or management area may open
```
### Scenario: AC-16 — Informational indicators may remain non-interactive

```gherkin
Given an informational core-flow indicator
When interaction is evaluated
Then an action handoff is not required
```
### Scenario: AC-17 — Analytics does not act

```gherkin
Given Basic Analytics is viewed
When workload or activity changes
Then no moderation or management action is performed automatically
```
### Scenario: AC-18 — Excluded analytics and commercial scope remain absent

```gherkin
Given Basic Analytics scope is evaluated
When additional analytics or commercial functions are considered
Then every excluded function remains unavailable
```

---

## 9. Dependencies

### Depends On

- `US-PLT-F01-001` — authorized active Admin context.
- `PRD-0001` through `PRD-0005` — authoritative source states and occurrences.

### Blocks

- None.

---

## 10. Story Size

**L**

One bounded Admin analytics view with exact periods, grouping, current-state inventory, core-flow occurrences, Completion boundary, action handoff, and strict non-automation/exclusion rules.

---

## 11. Out of Scope

- Analytics instrumentation, event schema, metric calculation, storage, deduplication, or reporting implementation.
- Advanced, predictive, recommendation, or Business-facing analytics.
- Autonomous moderation or management.
- Billing, CRM, advertising, transaction, affiliate attribution, or external conversion.

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

F10 owns the Admin-facing view and consumes source results without redefining them.

This Approved baseline does not Freeze itself and does not update GitHub automatically.
