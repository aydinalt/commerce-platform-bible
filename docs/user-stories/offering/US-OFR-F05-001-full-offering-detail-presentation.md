# US-OFR-F05-001 — Full Offering Detail Presentation

> **Freeze Note (2.1):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-22. Frozen v2.1 is the locked authoritative Story baseline. This exact Story must not be edited in place. Future behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature, or reference changes require a controlled revision. Delivery Status remains Not Started. This Freeze does not update GitHub automatically.

> **Approval Note (2.1):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-22. The exact In Review v2.1 candidate becomes the authoritative Approved v2.1 Story baseline. Delivery Status remains Not Started. This approval does not Freeze the Story, does not change Acceptance Criteria, BDD, dependencies, size, scope, or architecture, and does not update GitHub automatically.

> **Review Entry Note (2.1):** Clerical traceability-only correction after the independent Claude audit. Adds the already-consumed UX-0004 and UX-0009 handoff owners to §6 References. No Story ID, Feature ID, Epic, Capability, behaviour, Acceptance Criterion, BDD scenario, dependency, size, scope, or lifecycle result changes.

> **Review Entry Note (2.0):** Exact Draft candidate entered formal review after internal architecture and handbook validation. No Story ID, Feature ID, Feature name, Capability state, PRD/UX behaviour, Acceptance Criterion, BDD scenario, dependency, size, or scope changed during lifecycle entry.

> **Controlled Revision Note (2.0):** Substantive superseding revision of Frozen v1.0. Removes obsolete Favorites, Messaging, Related Offerings, phone-only gating, and unresolved display-state TODOs. Consumes Frozen PRD-0001 v3.1 and UX-0003 v1.0 for complete eligible public Presentation, optional-missing information, public Business identity, protected contact exclusion, exact Compare/Decision entries, unavailable/error boundaries, and Offering Presentation Open.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-OFR-F05-001` |
| Story Title | Full Offering Detail Presentation |
| Parent Story Document | `US-0001 Offering` (`US-0001-offering.md`) |
| Story Domain | Offering |
| Domain Code | `OFR` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Offering Presentation |
| Feature | `F05` — Full Offering Detail Presentation |
| Feature ID | `F05` — owned by `OFFERING_CAPABILITY_ARCHITECTURE.md` |
| Capability | Presentation — authoritative `F05 → Presentation` association |
| Perspective | Person viewing one publicly eligible Offering; Guest or authenticated User |
| Behaviour Owner | `PRD-0001-offering.md` |
| Experience Owner | `UX-0003-offering-detail.md` |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Done |
| Priority | Must |
| Story Size | M |
| Version | 2.1 |
| Last Updated | 2026-07-22 |
| Approval Date | 2026-07-22 |
| Approved By | Product Owner / Architecture Owner |
| Approved Candidate | In Review v2.1 |
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
| `[FEATURE_ID]` | `F05` | `OFFERING_CAPABILITY_ARCHITECTURE.md` — authoritative Offering Feature Registry |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

This Story is contained by exactly one Parent Story Document and belongs to exactly one Epic and one Feature.

---

## 3. Purpose

Present one publicly eligible Offering completely enough for a person to understand it and choose a next Decision entry.

---

## 4. Business Value

> **As a** person viewing one publicly eligible Offering  
> **I want** to inspect its complete public Offering Presentation  
> **So that** I can understand the Offering and decide whether to compare it or continue to a Decision flow

---

## 5. Description

Public Presentation begins only when final Offering Public Eligibility is Eligible. It provides the recognizable title or name, available visuals, Category context, available description, applicable Attribute values in understandable groups, the public Business identity set, and available Decision entries.

Missing optional visuals, description, or Attribute values do not cause invented content. Protected phone, email, website, or contact URL information is not part of public Presentation.

The surface may present entries to optional Compare and the single-Offering Decision flow but does not execute Compare, Decision Chat, selection, Affiliate Handoff, Direct Contact, or Completion. `Offering Presentation Open` occurs only when eligible complete Presentation successfully begins.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0001-offering.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `OFR` code |
| Capability Architecture | `OFFERING_CAPABILITY_ARCHITECTURE.md` | `F05` identity and authoritative Capability state |
| PRD | `PRD-0001-offering.md` | Offering behaviour and product rules |
| Supporting PRD | `PRD-0005-business.md`; `PRD-0006-platform.md` | Business access and Platform action surfaces where applicable |
| UX | `UX-0003-offering-detail.md` | Offering Detail experience behaviour |
| UX Handoff Owner | `UX-0004-compare.md` | Compare receives the exact eligible Offering context by reference |
| UX Handoff Owner | `UX-0009-decision-flow.md` | Decision Flow receives the exact eligible Offering context by reference |
| ADR | `ADR-0002-offering-presentation-capability.md` | Architectural constraint |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story standards, DoR, DoD, validation |
| Engineering Governance | `ENGINEERING_CONSTITUTION.md` | Engineering and QA obligations by reference |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall begin complete public Offering Presentation only when final Offering Public Eligibility is Eligible.
- **AC-2** — The system shall present the Offering title or name, Category context, available description, applicable Attribute values, public Business identity, and available visual set.
- **AC-3** — The system shall organize applicable Attribute values into understandable groups while preserving authoritative units, allowed-value meaning, and missing optional-value treatment.
- **AC-4** — The system shall continue the complete Presentation without inventing media or copy when optional visuals, description, or Attribute values are absent.
- **AC-5** — The system shall exclude protected telephone, email, external website, and contact URL information from public Business identity.
- **AC-6** — The system shall present available Compare and single-Offering Decision entries without executing their owned behaviours.
- **AC-7** — The system shall pass the exact eligible Offering and any received transient Compare-preparation context to the applicable owning UX.
- **AC-8** — The system shall produce Offering Presentation Open only when eligible complete Presentation successfully begins.
- **AC-9** — The system shall withhold public Offering content, Compare entry, Decision entry, and Offering Presentation Open when eligibility is Ineligible or Presentation cannot begin.

---

## 8. BDD

### Scenario: Eligible Offering begins complete Presentation

```gherkin
Given final Offering Public Eligibility is Eligible
When complete public Offering Presentation successfully begins
Then the title or name, Category context, available description, applicable Attributes, and public Business identity are available
And Offering Presentation Open occurs
```

### Scenario: Optional information is absent without invention

```gherkin
Given an eligible Offering has no optional visual, description, or Attribute value
When Presentation begins
Then the remaining authoritative Offering information is presented
And no missing media, value, or copy is invented
```

### Scenario: Public Presentation protects Direct Contact information

```gherkin
Given a Guest or authenticated person views Offering Detail
When public Business identity is presented
Then protected phone, email, external website, and contact URL information are not revealed
```

### Scenario: Presentation hands off but does not execute Decision behaviour

```gherkin
Given an eligible Offering Presentation
When the person chooses Compare or Start Decision
Then the exact Offering context is passed to UX-0004 or UX-0009
And Presentation does not execute Compare, Decision Chat, selection, handoff, Direct Contact, or Completion
```

### Scenario: Ineligible Offering does not open publicly

```gherkin
Given final Offering Public Eligibility is Ineligible
When a public route attempts to open the Offering
Then complete public Presentation does not begin
And Decision and Compare entries are unavailable
And Offering Presentation Open is not produced
```

---

## 9. Dependencies

### Depends On

- `US-OFR-F04-001` — lifecycle publication is one required input to final public eligibility.
- `PRD-0005-business.md` — public Business identity set.

### Blocks

- Decision-domain Compare and Decision Flow Stories that consume the exact eligible Offering context.

---

## 10. Story Size

**M**

One viewer outcome covering the authoritative product minimum, optional-missing states, protected-contact boundary, action-entry handoff, and open occurrence.

---

## 11. Out of Scope

- Discovery entry, ranking, filtering, or Listing Cards — `PRD-0002-discovery.md`.
- Compare mechanics — `UX-0004-compare.md` and Decision domain.
- Decision Chat, explicit selection, Affiliate Handoff, Direct Contact, and Completion — `PRD-0004-decision.md` / `UX-0009-decision-flow.md`.
- Favorites, Messaging, Related Offerings, recommendations, and featured entries — excluded from the Frozen V1 UX.
- Non-public Draft, Hidden, or Archived management views.
- Visual hierarchy, components, responsive behaviour, and exact state copy — `UX-0003-offering-detail.md`.

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
