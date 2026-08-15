# US-BUS-F03-001 — Business Moderation and Public Exposure Input

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Business Feature Registry; does not create a separate Business login identity; does not require prior Admin approval for Business creation; does not merge public Business identity with protected Direct Contact; does not transfer final Offering Public Eligibility ownership to Business; does not add analytics, CRM, Messaging, permanent deletion, transactions, or Affiliate Destination administration authority; and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story; does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, or the Frozen Business Feature Registry; does not create a separate Business login identity; does not add prior Admin approval to Business creation; does not merge public identity with protected Direct Contact; does not move final Offering Public Eligibility ownership to Business; does not add analytics, CRM, Messaging, permanent deletion, transactions, or Affiliate Destination administration authority; and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, Capability-boundary, cross-domain dependency, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Business Feature `F03`. The identifier consumes Domain code `BUS` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F03` from Frozen `BUSINESS_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-BUS-F03-001` |
| Story Title | Business Moderation and Public Exposure Input |
| Parent Story Document | `US-0005 Business` (`US-0005-business.md`) |
| Story Domain | Business |
| Domain Code | `BUS` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Moderation and Business Context Governance |
| Feature | `F03` — Business Moderation and Public Exposure Input |
| Feature ID | `F03` — owned by Frozen `BUSINESS_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | Supporting relationship |
| Capability Reference | Visibility & Eligibility |
| Perspective | Business owner and Platform consuming one authoritative Business moderation result |
| Behaviour Owner | `PRD-0005-business.md` |
| Experience Owner | `UX-0005-business-dashboard.md` §10; `UX-0006-admin-dashboard.md` §7 |
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
| `[DOMAIN]` | `BUS` | `REPOSITORY_GOVERNANCE.md` |
| `[FEATURE_ID]` | `F03` | Frozen `BUSINESS_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Own the exact Unrestricted/Restricted moderation state and Business Public Exposure Input consequences while leaving final Offering Public Eligibility and Admin action execution with their authoritative owners.

---

## 4. Business Value

> **As a** platform and authorized Business owner responding to Business moderation state  
> **I want** restriction and restoration to produce consistent management and exposure consequences  
> **So that** Business access narrows correctly without silently changing Offering lifecycle, Affiliate Destination state, User status, or ownership

---

## 5. Description

Business Moderation Status values are exactly `Unrestricted` and `Restricted`. Business Public Exposure Input is `Eligible` for Unrestricted and `Ineligible` for Restricted.

Restrict Business produces Unrestricted → Restricted and exposure input → Ineligible. Restore Business produces Restricted → Unrestricted and exposure input → Eligible.

A Restricted Business remains accessible to its Enabled owner for Business Information management, existing Draft management, viewing owned Published/Hidden/Archived Offerings, permitted retirement, and exact bounded correction editing. It cannot create a new Offering, publish a Draft, or normally edit Published/Hidden Offerings.

Restriction does not change Offering lifecycle, Affiliate Destination status or validation, User Account access status, or Business ownership. PRD-0001 composes final Offering Public Eligibility from the Business-owned input.

Restoration restores normal Business-management permission but does not automatically publish Draft, restore Hidden/Archived Offering, change Affiliate Destination status or Handoff Eligibility, or bypass PRD-0001 publication/public-eligibility rules.

User suspension is independent: Business moderation and exposure input remain unchanged, public eligibility is unchanged from suspension alone, and the owner cannot enter Business context until reinstated.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0005-business.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `BUS` code |
| Feature Registry | `BUSINESS_FEATURE_REGISTRY.md` | `F03` identity, scope label, references, and relationship classification |
| PRD | `PRD-0005-business.md` | Business behaviour and product rules |
| UX Business | `UX-0005-business-dashboard.md` §10 | Restricted Business management consequences |
| UX Admin | `UX-0006-admin-dashboard.md` §7 | Restrict/Restore action surface |
| Supporting PRD | `PRD-0001-offering.md` | Final Offering Public Eligibility composition |
| Supporting PRD | `PRD-0003-identity.md` | Independent User suspension |
| Supporting PRD | `PRD-0006-platform.md` | Admin action surface and approved outcomes by reference |
| Owner Decision | `OWNER-DECISION-D15-D16-RETIREMENT-AND-MODERATION-OUTCOMES-2026-07-21.md` | Restrict/Restore outcomes |
| Owner Decision | `OWNER-DECISION-D20-OFFERING-PUBLIC-ELIGIBILITY-COMPOSITION-2026-07-21.md` | Business input versus final Offering eligibility |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Business own-domain authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Business Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall use exactly `Unrestricted` and `Restricted` as V1 Business Moderation Status values.
- **AC-2** — The system shall map `Unrestricted` to Business Public Exposure Input `Eligible`.
- **AC-3** — The system shall map `Restricted` to Business Public Exposure Input `Ineligible`.
- **AC-4** — The system shall produce `Unrestricted` to `Restricted` and exposure input `Ineligible` when an approved Restrict Business action is applied.
- **AC-5** — The system shall allow an Enabled owner of a Restricted Business to manage Business Information and existing Draft Offerings and to view owned Published, Hidden, and Archived Offerings.
- **AC-6** — The system shall prevent a Restricted Business from creating a new Offering or publishing a Draft.
- **AC-7** — The system shall prevent normal editing of Published or Hidden Offerings while Restricted except through the exact bounded correction-edit path.
- **AC-8** — The system shall allow retirement of an owned Draft, Published, or Hidden Offering while Restricted where PRD-0001 permits retirement.
- **AC-9** — The system shall allow Affiliate Destination viewing or editing while Restricted only where the associated Offering remains owner-manageable.
- **AC-10** — The system shall change no Offering lifecycle, Affiliate Destination status, Affiliate Destination validation result, User Account access status, or Business ownership solely because the Business becomes Restricted.
- **AC-11** — The system shall produce `Restricted` to `Unrestricted` and exposure input `Eligible` when an approved Restore Business action is applied.
- **AC-12** — The system shall restore normal Business-management permissions without automatically publishing Draft or restoring Hidden or Archived Offerings.
- **AC-13** — The system shall change no Affiliate Destination status or Handoff Eligibility solely because the Business is restored.
- **AC-14** — The system shall allow only lifecycle-Published Offerings to regain final public eligibility through PRD-0001 composition after restoration.
- **AC-15** — The system shall keep Business Moderation Status and Business Public Exposure Input unchanged when the owner's User Account is Suspended.
- **AC-16** — The system shall block Business-context entry during owner suspension without changing public eligibility from suspension alone.

---

## 8. BDD

### Scenario: AC-1 — Business moderation states are exact

```gherkin
Given a V1 Business
When Business Moderation Status is represented
Then the value is exactly `Unrestricted` or `Restricted`
```
### Scenario: AC-2 — Unrestricted produces exposure Eligible

```gherkin
Given Business Moderation Status is `Unrestricted`
When Business Public Exposure Input is derived
Then the input is `Eligible`
```
### Scenario: AC-3 — Restricted produces exposure Ineligible

```gherkin
Given Business Moderation Status is `Restricted`
When Business Public Exposure Input is derived
Then the input is `Ineligible`
```
### Scenario: AC-4 — Restrict Business applies exact outcomes

```gherkin
Given a Business is `Unrestricted`
When approved Restrict Business is applied
Then status becomes `Restricted`
And Business Public Exposure Input becomes `Ineligible`
```
### Scenario: AC-5 — Restricted owner retains bounded management

```gherkin
Given the Business is `Restricted` and the owner is Enabled
When the owner enters the exact Business context
Then Business Information and existing Draft management remain available
And Published, Hidden, and Archived Offerings remain viewable
```
### Scenario: AC-6 — Restricted Business cannot create or publish

```gherkin
Given the Business is `Restricted`
When Create Offering or Publish Draft is requested
Then the action is unavailable
```
### Scenario: AC-7 — Restricted Published or Hidden edit is bounded

```gherkin
Given the Business is `Restricted`
When a Published or Hidden Offering edit is requested
Then normal edit is unavailable
And only the exact bounded correction-edit path may permit the targeted edit
```
### Scenario: AC-8 — Restricted Business may retire eligible lifecycle states

```gherkin
Given a Restricted Business owns a Draft, Published, or Hidden Offering
When the owner requests retirement
Then the request may enter the PRD-0001 retirement path
```
### Scenario: AC-9 — Restricted destination management follows Offering manageability

```gherkin
Given the Business is `Restricted`
When Affiliate Destination management is requested
Then it is available only if the associated Offering remains owner-manageable
```
### Scenario: AC-10 — Restriction preserves unrelated state

```gherkin
Given Restrict Business is applied
When related states are evaluated
Then Offering lifecycle, destination status, validation result, User access status, and ownership remain unchanged
```
### Scenario: AC-11 — Restore Business applies exact outcomes

```gherkin
Given a Business is `Restricted`
When approved Restore Business is applied
Then status becomes `Unrestricted`
And Business Public Exposure Input becomes `Eligible`
```
### Scenario: AC-12 — Restoration does not mutate Offering lifecycle

```gherkin
Given Restore Business completes
When owned Offerings are evaluated
Then normal Business-management permissions return
And no Draft is automatically published
And no Hidden or Archived Offering is automatically restored
```
### Scenario: AC-13 — Restoration preserves destination state

```gherkin
Given Restore Business completes
When Affiliate Destination results are evaluated
Then destination status and Handoff Eligibility remain unchanged
```
### Scenario: AC-14 — Final eligibility remains Offering-owned

```gherkin
Given the Business becomes `Unrestricted`
When PRD-0001 composes final Offering Public Eligibility
Then only lifecycle-Published Offerings may regain eligibility through that composition
```
### Scenario: AC-15 — User suspension does not alter Business moderation

```gherkin
Given the Business has an owner whose User Account becomes Suspended
When Business moderation and exposure are evaluated
Then both Business results remain unchanged
```
### Scenario: AC-16 — Suspension blocks context, not Business exposure

```gherkin
Given the owner User Account is Suspended
When Business context and public eligibility are evaluated
Then Business-context entry is unavailable
And public eligibility is unchanged from suspension alone
```

---

## 9. Dependencies

### Depends On

- `PRD-0006-platform.md` — an approved Restrict Business or Restore Business action is applied.
- `PRD-0001-offering.md` — final Offering Public Eligibility consumes the Business-owned input.

### Blocks

- `US-BUS-F05-001` — Business moderation narrows Offering-management entry.
- `US-BUS-F06-001` — Business moderation narrows Affiliate Destination-management entry.

---

## 10. Story Size

**L**

One authoritative moderation-and-exposure state machine with exact transitions, restricted/restored permissions, unrelated-state preservation, final-eligibility boundary, and suspension independence.

---

## 11. Out of Scope

- Admin moderation-case workflow and action authorization.
- Final Offering Public Eligibility computation.
- Offering lifecycle or Affiliate Destination state ownership.
- User Account suspension and reinstatement.
- Complete Business lifecycle.

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

- [x] Represents one bounded Business outcome
- [x] Provides observable owner, person, or platform value
- [x] Independently understandable
- [x] Independently testable
- [x] Traceable to one Parent, Epic, Feature, PRD, and exact applicable UX
- [x] Domain code and Feature ID resolve to authoritative owners
- [x] Relationship classification and Capability reference match the Frozen Feature Registry
- [x] No duplicate Story identified in the current Business package
- [x] No implementation details
- [x] No invented upstream behaviour
- [x] Every Acceptance Criterion begins with “The system shall…”
- [x] Every Acceptance Criterion has one explicitly numbered Story-internal BDD scenario

---

## 15. Notes

Business owns the moderation result and exposure input; Platform applies approved actions and Offering composes final public eligibility.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
