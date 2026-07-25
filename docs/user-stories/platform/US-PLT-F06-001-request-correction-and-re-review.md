# US-PLT-F06-001 — Request Correction and Re-Review

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, relationship classification, Capability reference, or UX reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not modify the Frozen Platform Feature Registry, does not change PRD/UX behaviour, and does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story; does not change Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference, PRD/UX behaviour, or the Frozen Platform Feature Registry; does not create a separate Admin identity, account, or login; does not add Admin authorization grant/remove, delegation, tier management, or self-service provisioning; does not grant Business ownership through Admin authorization; does not merge General Moderation with Affiliate Destination Administration; does not treat case state as target state; does not move target-owned results to Platform; does not convert Request Correction into Messaging or automatic closure; does not weaken Category, Domain, retirement, or Attribute mutation-safety rules; does not expand Basic Analytics; does not introduce generic Platform Configuration or Settings scope; does not apply non-blocking observations as candidate changes; and does not update GitHub automatically.

> **Review Entry Note (0.1):** The exact Draft v0.1 candidate entered formal review after internal Feature Registry, PRD/UX, Capability-boundary, cross-domain dependency, and Handbook validation. No Story ID, Feature ID, canonical Feature name, Epic, relationship classification, Capability reference, Acceptance Criterion, BDD scenario, dependency, size, scope, upstream behaviour, approval, Freeze, or GitHub state changed during lifecycle entry.

> **Creation Note (0.1):** First controlled Generated Story candidate for authoritative Platform Feature `F06`. The identifier consumes Domain code `PLT` from `REPOSITORY_GOVERNANCE.md` and Feature ID `F06` from Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-PLT-F06-001` |
| Story Title | Request Correction and Re-Review |
| Parent Story Document | `US-0006 Platform` (`US-0006-platform.md`) |
| Story Domain | Platform |
| Domain Code | `PLT` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Target Moderation and Correction |
| Feature | `F06` — Request Correction and Re-Review |
| Feature ID | `F06` — owned by Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0 |
| Relationship Classification | Supporting relationship |
| Capability Reference | Target-owned Capability by reference |
| Perspective | Authorized Admin initiating and re-reviewing one bounded Business-owned correction |
| Behaviour Owner | `PRD-0006-platform.md` |
| Experience Owner | `UX-0006-admin-dashboard.md` §8; `UX-0005-business-dashboard.md` §§11–12 |
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
| `[DOMAIN]` | `PLT` | `REPOSITORY_GOVERNANCE.md` |
| `[FEATURE_ID]` | `F06` | Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.0 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story belongs to exactly one Parent Story Document, one Epic, and one authoritative Feature.

---

## 3. Purpose

Create one non-Messaging correction requirement, preserve an Open case during bounded owner response, and require explicit re-review and closure.

---

## 4. Business Value

> **As a** authorized Admin reviewing Business-owned information  
> **I want** to identify an exact correction target and re-review the owner response  
> **So that** the case remains controlled without granting unrelated edit authority or changing target state automatically

---

## 5. Description

Request Correction targets are exactly Business Information, Offering content, Affiliate Destination configuration, and Direct Contact information. User Account correction is outside V1.

Request Correction keeps the case Open, changes no target state or eligibility result, and creates a correction notice in UX-0005 without Messaging.

For a Restricted Business Offering-content correction, the bounded path is available only for an Open case, exact Published or Hidden Offering, exact target area, and authorized owner.

The path grants no creation, publication, unrelated edit, lifecycle change, Business moderation/exposure change, public-eligibility restoration, automatic closure, or Messaging.

The saved correction must preserve Universal Publication Minimum. The case remains Open after owner edit; Business remains Restricted, exposure input remains Ineligible, and the Offering remains Published or Hidden and publicly ineligible until re-review.

After re-review, an Admin may apply an approved action or record a no-action decision and then explicitly close. Closing changes no target state.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0006-platform.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `PLT` code |
| Feature Registry | `PLATFORM_FEATURE_REGISTRY.md` | `F06` identity, scope label, references, and relationship classification |
| PRD | `PRD-0006-platform.md` | Platform behaviour and product rules |
| UX Admin | `UX-0006-admin-dashboard.md` §8 | Request Correction, re-review, and closure |
| UX Business | `UX-0005-business-dashboard.md` §§11–12 | Correction notice and bounded owner response |
| Supporting PRD | `PRD-0005-business.md` | Correction notice and Business consequences |
| Supporting PRD | `PRD-0001-offering.md` | Universal Publication Minimum and Offering state |
| Owner Decision | `OWNER-DECISION-D15-D16-RETIREMENT-AND-MODERATION-OUTCOMES-2026-07-21.md` | Correction and moderation boundary |
| Supporting Story | `US-BUS-F07-001-correction-notice-and-owner-response.md` — Frozen v1.0 | Business-side response |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Platform own-domain and direct Offering-Capability authority chain |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Platform Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall accept only Business Information, Offering content, Affiliate Destination configuration, or Direct Contact information as Request Correction targets.
- **AC-2** — The system shall exclude User Account correction from V1.
- **AC-3** — The system shall keep the General Moderation case `Open` after Request Correction.
- **AC-4** — The system shall change no lifecycle, moderation, access, exposure, eligibility, validation, or destination status solely through Request Correction.
- **AC-5** — The system shall create a bounded correction notice in UX-0005 without creating Messaging.
- **AC-6** — The system shall make the Restricted-Business bounded Offering correction path available only for an Open case targeting exact Offering content on an exact Published or Hidden Offering owned by the acting User.
- **AC-7** — The system shall limit bounded correction to the exact Offering and exact targeted content area.
- **AC-8** — The system shall grant no new Offering creation, Draft publication, unrelated edit, lifecycle change, Business moderation or exposure change, public eligibility, automatic case closure, or Messaging.
- **AC-9** — The system shall require the saved correction to preserve the Universal Publication Minimum.
- **AC-10** — The system shall keep the case Open after owner edit and require Admin re-review.
- **AC-11** — The system shall keep the Business Restricted, exposure input Ineligible, and the Offering Published or Hidden and publicly ineligible until re-review.
- **AC-12** — The system shall allow explicit closure after re-review only when an approved action has been applied or a no-action decision recorded.
- **AC-13** — The system shall change no target state solely because the case is explicitly closed.
- **AC-14** — The system shall treat the bounded owner response as part of Request Correction rather than an eighth General Moderation action.

---

## 8. BDD

### Scenario: AC-1 — Correction target set is exact

```gherkin
Given Request Correction is prepared
When the target is selected
Then it is one of the four approved Business-owned target areas
```
### Scenario: AC-2 — User Account correction is unavailable

```gherkin
Given a User Account is reviewed
When Request Correction targets are evaluated
Then User Account correction is unavailable
```
### Scenario: AC-3 — Request Correction preserves Open

```gherkin
Given an Open case
When Request Correction is applied
Then case status remains `Open`
```
### Scenario: AC-4 — Request Correction is state-neutral

```gherkin
Given Request Correction is applied
When target states are evaluated
Then no authoritative product state changes
```
### Scenario: AC-5 — Correction notice is not Messaging

```gherkin
Given Request Correction is applied
When the Business owner receives the requirement
Then a bounded correction notice is available
And no inbox, message, conversation, reply, or ticket discussion is created
```
### Scenario: AC-6 — Bounded path requires all gates

```gherkin
Given a Restricted Business correction is requested
When path eligibility is evaluated
Then the case must be Open
And the target must be Offering content
And the exact Offering must be Published or Hidden
And the acting User must be its authorized owner
```
### Scenario: AC-7 — Bounded edit remains exact

```gherkin
Given the bounded correction path is open
When the owner edits
Then only the identified Offering and target area may change
```
### Scenario: AC-8 — Bounded path grants no unrelated authority

```gherkin
Given the bounded correction path is used
When resulting authority is evaluated
Then no excluded action or state change is granted
```
### Scenario: AC-9 — Correction preserves publication minimum

```gherkin
Given a bounded Offering correction is saved
When PRD-0001 validates publication minimum
Then the minimum remains satisfied
```
### Scenario: AC-10 — Owner response requires re-review

```gherkin
Given the owner saves an authorized correction
When workflow state is evaluated
Then the case remains Open
And Admin re-review is required
```
### Scenario: AC-11 — Owner edit preserves restricted consequences

```gherkin
Given a bounded correction is saved before re-review
When Business and Offering results are evaluated
Then the restricted and publicly ineligible outcomes remain
```
### Scenario: AC-12 — Re-review closure requires resolution

```gherkin
Given re-review is complete
When case closure is requested
Then an approved action or no-action decision must exist
```
### Scenario: AC-13 — Closure remains state-neutral

```gherkin
Given the Admin closes the case
When target state is evaluated
Then closing creates no product-state change
```
### Scenario: AC-14 — Correction response is not an eighth action

```gherkin
Given the owner uses the bounded response
When General Moderation actions are counted
Then the action set remains the exact seven
```

---

## 9. Dependencies

### Depends On

- `US-PLT-F02-001` — an Open General Moderation case exists.
- `US-BUS-F07-001` — Business owns notice and bounded owner response.

### Blocks

- `US-PLT-F02-001` — explicit case closure may proceed after re-review resolution.

---

## 10. Story Size

**L**

One correction-and-re-review workflow with exact targets, non-state-changing notice, bounded owner response, state preservation, re-review, and explicit closure.

---

## 11. Out of Scope

- Messaging, inbox, ticket discussion, or reply workflow.
- User Account correction.
- Automatic state change, public-eligibility restoration, or case closure.
- Target-content behaviour outside the exact correction boundary.

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

F06 owns Platform correction workflow; each target owner retains content and result ownership.

This Approved baseline does not Freeze itself and does not update GitHub automatically.
