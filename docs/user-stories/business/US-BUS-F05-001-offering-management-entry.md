# US-BUS-F05-001 — Offering Management Entry

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Business Feature Registry; does not create a separate Business login identity; does not require prior Admin approval for Business creation; does not merge public Business identity with protected Direct Contact; does not transfer final Offering Public Eligibility ownership to Business; does not add analytics, CRM, Messaging, permanent deletion, transactions, or Affiliate Destination administration authority; and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story; does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, or the Frozen Business Feature Registry; does not create a separate Business login identity; does not add prior Admin approval to Business creation; does not merge public identity with protected Direct Contact; does not move final Offering Public Eligibility ownership to Business; does not add analytics, CRM, Messaging, permanent deletion, transactions, or Affiliate Destination administration authority; and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, Capability-boundary, cross-domain dependency, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Business Feature `F05`. The identifier consumes Domain code `BUS` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F05` from Frozen `BUSINESS_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-BUS-F05-001` |
| Story Title | Offering Management Entry |
| Parent Story Document | `US-0005 Business` (`US-0005-business.md`) |
| Story Domain | Business |
| Domain Code | `BUS` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Owned Offering and Handoff Configuration Entry |
| Feature | `F05` — Offering Management Entry |
| Feature ID | `F05` — owned by Frozen `BUSINESS_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | Supporting relationship |
| Capability Reference | Creation; Lifecycle; Handoff Enablement, as applicable |
| Perspective | Authorized Business owner entering applicable owned-Offering management |
| Behaviour Owner | `PRD-0005-business.md` |
| Experience Owner | `UX-0005-business-dashboard.md` §§8–9 |
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
| `[DOMAIN]` | `BUS` | `REPOSITORY_GOVERNANCE.md` |
| `[FEATURE_ID]` | `F05` | Frozen `BUSINESS_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Expose only the Business-permitted entries to PRD-0001-owned Offering creation, editing, publication, retirement, and historical viewing without redefining lifecycle or public eligibility.

---

## 4. Business Value

> **As a** authorized owner managing Offerings for the active Business  
> **I want** to enter only the Offering actions currently permitted for each owned Offering  
> **So that** I can manage inventory without permanent deletion, silent lifecycle changes, or Business-owned redefinition of Offering rules

---

## 5. Description

The Dashboard organizes owned Offerings by authoritative lifecycle state: Draft, Published, Hidden, and Archived.

It may provide entry to create, edit, publish, retire, and view only where both PRD-0001 lifecycle rules and PRD-0005 Business access rules permit.

Create is available only for an Unrestricted Business and creates a PRD-0001-owned Draft. Publish is available only for an owned Draft when the Business is Unrestricted and the Universal Publication Minimum is satisfied.

Retire may be entered for an owned Draft, Published, or Hidden Offering and produces PRD-0001-owned Archived. Hidden cannot be restored by the Business owner. Archived is historical view only with no edit, restore, or permanent deletion.

Published does not guarantee public Discovery presence; final Offering Public Eligibility remains PRD-0001-owned.

A Restricted Business may manage existing Drafts, view Published/Hidden/Archived, retire where permitted, and use only the exact bounded correction-edit path for Published/Hidden. It cannot create, publish, or normally edit Published/Hidden.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0005-business.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `BUS` code |
| Feature Registry | `BUSINESS_FEATURE_REGISTRY.md` | `F05` identity, scope label, references, and relationship classification |
| PRD | `PRD-0005-business.md` | Business behaviour and product rules |
| UX | `UX-0005-business-dashboard.md` §§8–9 | Lifecycle-organized inventory and Offering action entries |
| Supporting PRD | `PRD-0001-offering.md` | Offering lifecycle, publication, retirement, editability, and final public eligibility |
| Owner Decision | `OWNER-DECISION-D15-D16-RETIREMENT-AND-MODERATION-OUTCOMES-2026-07-21.md` | Retirement and Restricted-management consequences |
| Supporting Story | `US-OFR-F01-001-offering-creation.md` — Frozen v1.0 | Offering creation result |
| Supporting Story | `US-OFR-F03-001-offering-retirement.md` — Frozen v2.0 | Retirement result |
| Supporting Story | `US-OFR-F04-001-offering-publication.md` — Frozen v2.0 | Publication result |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Business own-domain authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Business Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall organize owned Offering inventory by authoritative `Draft`, `Published`, `Hidden`, and `Archived` lifecycle states.
- **AC-2** — The system shall expose only Offering actions currently permitted by PRD-0001 lifecycle rules and PRD-0005 Business access rules.
- **AC-3** — The system shall allow Create Offering only for an Unrestricted active Business.
- **AC-4** — The system shall make a newly created Offering begin as `Draft` under PRD-0001.
- **AC-5** — The system shall allow Edit only where the Offering lifecycle state and current Business access rules both permit editing.
- **AC-6** — The system shall allow Publish only for an owned Draft whose Business is Unrestricted and whose Universal Publication Minimum is satisfied.
- **AC-7** — The system shall present publication validation feedback without redefining the Universal Publication Minimum.
- **AC-8** — The system shall allow Retire entry for an owned Draft, Published, or Hidden Offering where PRD-0001 permits retirement.
- **AC-9** — The system shall consume `Archived` as the retirement result without defining a separate Business-owned lifecycle result.
- **AC-10** — The system shall prevent the Business owner from restoring a Hidden Offering to Published.
- **AC-11** — The system shall make an Archived Offering historical view only with no edit, restore, or new Affiliate Destination authoring.
- **AC-12** — The system shall provide no permanent Offering deletion.
- **AC-13** — The system shall distinguish lifecycle `Published` from final Offering Public Eligibility.
- **AC-14** — The system shall allow a Restricted Business to manage existing Drafts, view Published/Hidden/Archived, retire where permitted, and use only the exact bounded correction-edit path for Published/Hidden.
- **AC-15** — The system shall prevent a Restricted Business from creating a new Offering, publishing a Draft, or normally editing Published or Hidden Offerings.
- **AC-16** — The system shall claim no lifecycle transition when an Offering action fails.

---

## 8. BDD

### Scenario: AC-1 — Inventory uses authoritative lifecycle states

```gherkin
Given the active Business owns Offerings
When the inventory is presented
Then records are organized as Draft, Published, Hidden, and Archived
```
### Scenario: AC-2 — Only currently permitted actions are exposed

```gherkin
Given an owned Offering and current Business status
When management actions are evaluated
Then only actions permitted by both authoritative rule sets are available
```
### Scenario: AC-3 — Create requires Unrestricted Business

```gherkin
Given the active Business is `Unrestricted`
When Create Offering is requested
Then the PRD-0001 creation entry may be available
```
### Scenario: AC-4 — New Offering result remains Offering-owned

```gherkin
Given the owner completes valid Offering creation
When the lifecycle result is consumed
Then the new Offering is `Draft` under PRD-0001
```
### Scenario: AC-5 — Edit requires lifecycle and Business permission

```gherkin
Given an owned Offering
When Edit is requested
Then the lifecycle state and Business access rules must both permit the action
```
### Scenario: AC-6 — Publish has all required gates

```gherkin
Given an owned Draft Offering
When Publish is requested
Then the Business must be `Unrestricted`
And the Universal Publication Minimum must be satisfied
```
### Scenario: AC-7 — Business consumes publication validation

```gherkin
Given a Draft does not satisfy publication conditions
When Publish is requested
Then validation feedback is presented
And the Business Feature does not redefine the minimum
```
### Scenario: AC-8 — Retire entry uses authoritative states

```gherkin
Given an owned Offering is Draft, Published, or Hidden
When retirement is requested
Then the request may enter the PRD-0001 retirement path
```
### Scenario: AC-9 — Retirement result remains Offering-owned

```gherkin
Given PRD-0001 completes retirement
When the Business inventory updates
Then the Offering appears as `Archived`
And no competing Business lifecycle result is created
```
### Scenario: AC-10 — Business cannot restore Hidden

```gherkin
Given an owned Offering is `Hidden`
When the Business owner evaluates available actions
Then Restore to Published is unavailable
```
### Scenario: AC-11 — Archived is historical-only

```gherkin
Given an owned Offering is `Archived`
When management actions are evaluated
Then only historical view is available
And edit, restore, and new Affiliate Destination authoring are unavailable
```
### Scenario: AC-12 — Permanent deletion is absent

```gherkin
Given any owned Offering lifecycle state
When destructive actions are evaluated
Then permanent deletion is unavailable
```
### Scenario: AC-13 — Published does not promise public eligibility

```gherkin
Given an owned Offering is `Published`
When the Dashboard describes public status
Then it does not claim the Offering is publicly eligible solely because of lifecycle state
```
### Scenario: AC-14 — Restricted Business receives bounded Offering access

```gherkin
Given the active Business is `Restricted`
When Offering management is evaluated
Then existing Draft management and viewing of Published, Hidden, and Archived remain available
And retirement may remain available
And Published or Hidden edit is limited to the exact bounded correction path
```
### Scenario: AC-15 — Restricted Business cannot create publish or normally edit

```gherkin
Given the active Business is `Restricted`
When Create, Publish, or ordinary Published/Hidden Edit is requested
Then the action is unavailable
```
### Scenario: AC-16 — Failed action claims no transition

```gherkin
Given an Offering action is attempted
When the action fails
Then no lifecycle transition is claimed
```

---

## 9. Dependencies

### Depends On

- `US-BUS-F03-001` — Business status narrows management permission.
- `US-BUS-F04-001` — one exact active Business context exists.
- `PRD-0001-offering.md` — all Offering action rules and results.

### Blocks

- `US-BUS-F06-001` — Affiliate Destination entry depends on the associated Offering being owner-manageable.

---

## 10. Story Size

**L**

One Business-side Offering-entry outcome with lifecycle-organized inventory, action gates, Restricted rules, archival boundary, failure safety, and no lifecycle redefinition.

---

## 11. Out of Scope

- Offering lifecycle, publication minimum, edit consequences, retirement outcome, public eligibility, or Presentation ownership.
- Admin Hide/Restore actions.
- Permanent deletion.
- Technical forms, APIs, storage, or implementation.

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

F05 owns only Business-side entry and access narrowing; Offering remains the sole owner of action meaning and lifecycle results.

This Frozen baseline must not be edited in place and does not update GitHub automatically.
