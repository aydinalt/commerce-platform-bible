# US-OFR-F03-001 — Offering Retirement

> **Freeze Note (2.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-22. Frozen v2.0 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, or reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not update GitHub automatically.

> **Approval Note (2.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-22. The exact In Review v2.0 candidate becomes the authoritative Approved v2.0 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, or architecture, and does not update GitHub automatically.

> **Review Entry Note (2.0):** Exact Draft candidate entered formal review after internal architecture and handbook validation. No Story ID, Feature ID, Feature name, Capability state, PRD/UX behaviour, Acceptance Criterion, BDD scenario, dependency, size, or scope changed during lifecycle entry.

> **Controlled Revision Note (2.0):** Substantive superseding revision of Frozen v1.0. The preserved baseline contained unresolved retirement outcomes from an earlier PRD. This independent Draft/In Review v2.0 candidate consumes the complete Frozen PRD-0001 v3.1 retirement model: Draft/Published/Hidden → Archived, irreversible V1 history, public exclusion, historical Category/Domain/Attribute retention, no edit/restore, Admin no-archive boundary, and archived Affiliate Destination view-only treatment.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-OFR-F03-001` |
| Story Title | Offering Retirement |
| Parent Story Document | `US-0001 Offering` (`US-0001-offering.md`) |
| Story Domain | Offering |
| Domain Code | `OFR` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Offering Lifecycle Control |
| Feature | `F03` — Offering Retirement |
| Feature ID | `F03` — owned by `OFFERING_CAPABILITY_ARCHITECTURE.md` |
| Capability | Lifecycle — authoritative `F03 → Lifecycle` association |
| Perspective | Business Owner authorized to manage one owned Offering |
| Behaviour Owner | `PRD-0001-offering.md` |
| Experience Owner | `UX-0005-business-dashboard.md` |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Done |
| Priority | Must |
| Story Size | M |
| Version | 2.0 |
| Last Updated | 2026-07-22 |
| Approval Date | 2026-07-22 |
| Approved By | Product Owner / Architecture Owner |
| Approved Candidate | In Review v2.0 |
| Freeze State | Frozen |
| Freeze Date | 2026-07-22 |
| Frozen By | Product Owner / Architecture Owner |
| Supersedes | Frozen v1.0 — preserved historical baseline |

---

## 2. Story Identification

The identifier follows `USER_STORY_HANDBOOK.md` §5 and consumes identifier components from their authoritative owners.

| Segment | Value | Owner by Reference |
|---|---|---|
| Prefix | `US` | `USER_STORY_HANDBOOK.md` |
| `[DOMAIN]` | `OFR` | `REPOSITORY_GOVERNANCE.md` — Story Domain Code Registry |
| `[FEATURE_ID]` | `F03` | `OFFERING_CAPABILITY_ARCHITECTURE.md` — authoritative Offering Feature Registry |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story is contained by exactly one Parent Story Document and belongs to exactly one Epic and one Feature.

---

## 3. Purpose

Enable an authorized Business owner to retire one owned Draft, Published, or Hidden Offering into an irreversible historical Archived record.

---

## 4. Business Value

> **As a** Business Owner authorized to manage one owned Draft, Published, or Hidden Offering  
> **I want** to retire the Offering  
> **So that** it leaves active circulation while its historical record is preserved

---

## 5. Description

Owner retirement is the only V1 transition from Draft, Published, or Hidden to Archived. It is not permanent deletion.

Archived is public-ineligible, unavailable to Discovery, public Presentation, Compare, Decision Chat selection, Direct Contact, and Affiliate Handoff. The record remains viewable to the owner and an authorized Admin, retains historical Category, Domain, Attribute values, and associated destination information, and cannot be edited or restored.

An Admin cannot archive an Offering in V1. Admin Hide and Restore remain separate Platform-owned actions.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0001-offering.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `OFR` code |
| Capability Architecture | `OFFERING_CAPABILITY_ARCHITECTURE.md` | `F03` identity and authoritative Capability state |
| PRD | `PRD-0001-offering.md` | Offering behaviour and product rules |
| Supporting PRD | `PRD-0005-business.md`; `PRD-0006-platform.md` | Business access and Platform action surfaces where applicable |
| UX | `UX-0005-business-dashboard.md` | Experience behaviour |
| ADR | `ADR-0003-offering-feature-capability-associations.md` | Architectural constraint |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story standards, DoR, DoD, validation |
| Engineering Governance | `ENGINEERING_CONSTITUTION.md` | Engineering and QA obligations by reference |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall allow an authorized Business owner to retire one exact owned Offering whose lifecycle state is Draft, Published, or Hidden.
- **AC-2** — The system shall transition the retired Offering to lifecycle state Archived.
- **AC-3** — The system shall produce final Offering Public Eligibility Ineligible for the Archived Offering.
- **AC-4** — The system shall make the Archived Offering unavailable to Discovery, public Offering Presentation, Compare, Decision Chat selection, Direct Contact, and Affiliate Handoff.
- **AC-5** — The system shall preserve the Offering's historical Category, derived Domain, Attribute values, and associated Affiliate Destination information.
- **AC-6** — The system shall make the Archived Offering viewable as a historical record to its Business owner and an authorized Admin.
- **AC-7** — The system shall deny editing and restoration of an Archived Offering in V1.
- **AC-8** — The system shall make an associated Affiliate Destination view-only after the Offering is Archived.
- **AC-9** — The system shall deny Admin-initiated archive and deny a second retirement transition from Archived.

---

## 8. BDD

### Scenario: Owner retires an active-lifecycle Offering

```gherkin
Given an authorized Business owner manages an owned Draft, Published, or Hidden Offering
When the owner retires the Offering
Then the Offering lifecycle state becomes Archived
And final Offering Public Eligibility becomes Ineligible
```

### Scenario: Archived Offering leaves every public journey

```gherkin
Given an Offering is Archived
When a public product journey evaluates the Offering
Then the Offering is unavailable to Discovery and public Presentation
And it cannot participate in Compare, Decision Chat selection, Direct Contact, or Affiliate Handoff
```

### Scenario: Archived record preserves history and is immutable

```gherkin
Given an Offering has been retired
When the owner or an authorized Admin views the historical record
Then historical Category, Domain, Attribute values, and destination information remain available
And edit and restore actions are unavailable
```

### Scenario: Admin cannot archive an Offering

```gherkin
Given an authorized Admin targets an Offering
When available moderation actions are resolved
Then Archive Offering is not an Admin action
```

---

## 9. Dependencies

### Depends On

- `US-OFR-F01-001` — the Offering exists and belongs to one Business.

### Blocks

- None.

---

## 10. Story Size

**M**

One irreversible lifecycle transition with deterministic public-exclusion and historical-record consequences.

---

## 11. Out of Scope

- Permanent deletion — absent from V1.
- Admin Hide Offering and Restore Offering — `PRD-0006-platform.md` / `UX-0006-admin-dashboard.md`.
- Business restriction or restoration — `PRD-0005-business.md`.
- Category or Attribute definition retirement — `PRD-0006-platform.md`.
- Restoring Archived to any state — no V1 transition exists.

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
