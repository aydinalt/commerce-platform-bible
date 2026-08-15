# US-OFR-F01-001 — Offering Creation

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-22. Frozen v1.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, or reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not update GitHub automatically.

> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-22. The exact In Review v0.5 candidate becomes the authoritative Approved v1.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, or architecture, and does not update GitHub automatically.

> **Review Entry Note (0.5):** Exact Draft candidate entered formal review after internal architecture and handbook validation. No Story ID, Feature ID, Feature name, Capability state, PRD/UX behaviour, Acceptance Criterion, BDD scenario, dependency, size, or scope changed during lifecycle entry.

> **Controlled Revision Note (0.5):** Controlled reconciliation of Draft v0.4 against Frozen PRD-0001 v3.1, PRD-0005 v1.3, UX-0005 v1.0, the Frozen Offering Capability Architecture v2.0, and the Frozen User Story Handbook. Removes resolved creation TODOs and records the Unrestricted Business creation gate, Draft result, owner association, public-ineligibility result, and Restricted-Business denial. Story ID, Feature ID, Feature name, and Capability remain unchanged.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-OFR-F01-001` |
| Story Title | Offering Creation |
| Parent Story Document | `US-0001 Offering` (`US-0001-offering.md`) |
| Story Domain | Offering |
| Domain Code | `OFR` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Offering Authoring |
| Feature | `F01` — Offering Creation |
| Feature ID | `F01` — owned by `OFFERING_CAPABILITY_ARCHITECTURE.md` |
| Capability | Creation — authoritative `F01 → Creation` association |
| Perspective | Business Owner acting in one authorized Business context |
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
| Approved Candidate | In Review v0.5 |
| Freeze State | Frozen |
| Freeze Date | 2026-07-22 |
| Frozen By | Product Owner / Architecture Owner |
| Supersedes | Draft v0.4 |

---

## 2. Story Identification

The identifier follows `USER_STORY_HANDBOOK.md` §5 and consumes identifier components from their authoritative owners.

| Segment | Value | Owner by Reference |
|---|---|---|
| Prefix | `US` | `USER_STORY_HANDBOOK.md` |
| `[DOMAIN]` | `OFR` | `REPOSITORY_GOVERNANCE.md` — Story Domain Code Registry |
| `[FEATURE_ID]` | `F01` | `OFFERING_CAPABILITY_ARCHITECTURE.md` — authoritative Offering Feature Registry |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story is contained by exactly one Parent Story Document and belongs to exactly one Epic and one Feature.

---

## 3. Purpose

Enable an authorized Business owner to create one new Offering as an owned Draft without publishing it or exposing it to public product experiences.

---

## 4. Business Value

> **As a** Business Owner acting for an Unrestricted owned Business  
> **I want** to create a new Offering  
> **So that** the Business can prepare the Offering before publication

---

## 5. Description

Creation acts on the universal Offering object owned by `PRD-0001-offering.md`. The new Offering belongs to exactly one Business and begins in lifecycle state Draft.

The Business-side Create entry is available only where `PRD-0005-business.md` permits it. A Restricted Business cannot create a new Offering. Creation does not publish the Offering, does not produce public eligibility, and does not make it available to Discovery, public Presentation, Compare, Decision Chat, Direct Contact, or Affiliate Handoff.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0001-offering.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `OFR` code |
| Capability Architecture | `OFFERING_CAPABILITY_ARCHITECTURE.md` | `F01` identity and authoritative Capability state |
| PRD | `PRD-0001-offering.md` | Offering behaviour and product rules |
| Supporting PRD | `PRD-0005-business.md`; `PRD-0006-platform.md` | Business access and Platform action surfaces where applicable |
| UX | `UX-0005-business-dashboard.md` | Experience behaviour |
| ADR | `ADR-0003-offering-feature-capability-associations.md` | Architectural constraint |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story standards, DoR, DoD, validation |
| Engineering Governance | `ENGINEERING_CONSTITUTION.md` | Engineering and QA obligations by reference |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall allow an authorized Business owner acting for an Unrestricted Business to create one new Offering.
- **AC-2** — The system shall associate the created Offering with exactly the Business context in which creation was authorized.
- **AC-3** — The system shall place the created Offering in lifecycle state Draft.
- **AC-4** — The system shall produce final Offering Public Eligibility Ineligible for the newly created Draft.
- **AC-5** — The system shall make the new Draft available in the owning Business management inventory.
- **AC-6** — The system shall deny new Offering creation when Business Moderation Status is Restricted.
- **AC-7** — The system shall not publish or expose the Offering to a public product experience as part of creation.

---

## 8. BDD

### Scenario: An authorized Unrestricted Business creates a Draft Offering

```gherkin
Given an Enabled User is acting in one owned Business context
And Business Moderation Status is Unrestricted
When the owner creates a new Offering
Then the Offering belongs to that Business
And the Offering lifecycle state is Draft
And final Offering Public Eligibility is Ineligible
```

### Scenario: A new Draft is available only for management

```gherkin
Given a new Offering has been created as Draft
When the owner returns to the Business Offering inventory
Then the Draft Offering is available for permitted management actions
And it is unavailable to Discovery and public Offering Presentation
```

### Scenario: Restricted Business cannot create a new Offering

```gherkin
Given an Enabled owner acts for a Restricted Business
When the owner attempts to create a new Offering
Then creation is denied
And no new Offering is created
```

---

## 9. Dependencies

### Depends On

- `PRD-0005-business.md` — one authorized owned Business context and the Unrestricted creation gate.

### Blocks

- `US-OFR-F02-001` — the new Draft may later be edited.
- `US-OFR-F04-001` — the Draft may later be published when all gates are satisfied.
- `US-OFR-F06-001` — the owned Draft may later receive an Affiliate Destination.

---

## 10. Story Size

**M**

One bounded creation outcome with ownership, lifecycle, moderation-gate, management-visibility, and public-exclusion rules.

---

## 11. Out of Scope

- The exact Business creation and ownership flow — owned by `PRD-0005-business.md`.
- Editing an existing Offering — `US-OFR-F02-001`.
- Publishing Draft to Published — `US-OFR-F04-001`.
- Admin Hide/Restore, Business restriction, or User suspension actions — owned by Platform/Identity domains.
- Affiliate Destination creation — `US-OFR-F06-001`.
- Visual form design, validation-copy wording, and component behaviour — owned by `UX-0005-business-dashboard.md`.

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
