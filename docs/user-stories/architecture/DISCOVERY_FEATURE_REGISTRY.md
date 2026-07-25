# Discovery Story Domain Feature Registry

- **Owner:** Product Owner / Architecture Owner
- **Status:** Frozen
- **Version:** 1.0
- **Date:** 2026-07-22
- **Approval Date:** 2026-07-22
- **Approved By:** Product Owner / Architecture Owner
- **Approved candidate:** In Review v0.1
- **Freeze state:** Frozen
- **Freeze Date:** 2026-07-22
- **Frozen By:** Product Owner / Architecture Owner
- **Story Domain:** Discovery
- **Domain Code:** DSC
- **Parent Story Document:** US-0002
- **Authority:** `ADR-0009-story-domain-feature-registry-ownership.md`
- **Generated Story allocation:** Available from Frozen v1.0 Feature IDs
- **GitHub effect:** None

**Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-22. Frozen v1.0 is the locked authoritative Feature Registry baseline for Story Domain `DSC`. Its Active Feature IDs may now be consumed by authoritative Generated Story identifiers under the Frozen User Story Handbook. This exact registry must not be edited in place. Future Feature ID allocation, retirement, canonical-name correction, authority-reference change, or relationship-classification change requires a controlled revision. This Freeze creates no Capability, Capability Architecture, Epic, Generated Story, PRD/UX behaviour, implementation, or automatic GitHub change.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-22. The exact In Review v0.1 candidate becomes the authoritative Approved v1.0 Feature Registry baseline under the first-approval versioning rule. All registry Feature entry statuses become Active. This historical Approval Note records that approval and Freeze were separate decisions. The registry was subsequently Frozen on 2026-07-22, making its Active Feature IDs available for authoritative Generated Story allocation. This approval creates no Capability, Capability Architecture, Epic, Generated Story, PRD/UX behaviour, implementation, or automatic GitHub change.

**Creation Note (0.1):** Initial controlled Feature-ID allocation proposal for Story Domain `DSC`, authorized by Accepted `ADR-0009-story-domain-feature-registry-ownership.md`. All Feature entries are Active, but they cannot be consumed by authoritative Generated Story IDs until this registry is Frozen. No Capability, Capability Map, PRD/UX behaviour, Epic placement, Story content, or implementation is created.

**Review Entry Note (0.1):** The exact Draft v0.1 content entered formal review without changing Feature IDs, Feature names, scope labels, authority references, relationship classifications, or lifecycle gates. The registry is now authoritative as Approved v1.0 and its entries are Active; Story allocation remains blocked until Freeze.

> This document is the Single Information Owner for `DSC` Feature IDs and bounded Feature identity metadata. It is not a Capability Architecture document and defines no product behaviour, UX behaviour, Epic placement, Story content, or implementation.

---

## 1. Purpose

Provide stable, domain-local Feature identities that may later be consumed by Generated User Story identifiers for the Discovery Story Domain.

## 2. Scope

This registry owns only:

- Feature ID allocation within `DSC`;
- canonical Feature names;
- Feature identity status;
- Feature-ID reservation and retirement;
- short non-behavioural Feature scope labels;
- behaviour-owner references;
- applicable UX references;
- Capability relationship classifications by reference.

## 3. Out of Scope

- product behaviour or business rules;
- UX interaction or visual design;
- Capability definitions or Capability Maps;
- Epic placement;
- Generated Story content, identifiers, lifecycle, estimation, or delivery planning;
- implementation architecture, APIs, storage, or technology;
- changes to PRD, UX, ADR, governance, or Offering Feature ownership.

## 4. Governing Rules

1. Feature IDs are unique within Story Domain `DSC`.
2. The complete Story identifier remains globally unambiguous through the Domain code.
3. Feature IDs are never allocated by Parent Story Documents or Generated Stories.
4. Active entries in this Frozen registry are authoritative for Story ID allocation.
5. A Feature ID is available for authoritative Generated Story use because this registry is Approved and Frozen.
6. Feature IDs are never recycled after authoritative use.
7. A Frozen registry is never edited in place.
8. Behaviour remains owned by `PRD-0002-discovery.md`.
9. UX behaviour remains owned by the referenced Frozen UX documents.
10. Capability names and boundaries are referenced, never redefined.

## 5. Relationship Classification Vocabulary

This registry uses only:

- **Direct Frozen assignment** — the governing Accepted ADR or Frozen Capability Map directly assigns the behaviour to an existing Offering Capability.
- **Supporting relationship** — the domain Feature supports or governs access/action around an existing Capability-owned flow without becoming its behaviour owner.
- **No Capability Architecture required** — own-domain V1 behaviour follows the direct ADR-0007 authority chain.

Relationship classification is descriptive by reference and does not create a Feature → Capability decision beyond the cited authority.

## 6. Authoritative Feature Registry

| Feature ID | Canonical Feature Name | Entry Status | Short Scope Label | Behaviour Owner Reference | Applicable UX Reference | Relationship Type | Capability Reference | Notes |
|---|---|---|---|---|---|---|---|---|
| F01 | Homepage Discovery Entry | Active | Public Search and Browse entry into Discovery. | `PRD-0002-discovery.md` §§5.1, 6 | `UX-0001-home.md`; `UX-0002-discovery.md` | Direct Frozen assignment | Discovery | Includes the exact Home prompt and explicit Search/Browse routing; defines no visual layout. |
| F02 | Search | Active | Person-submitted query Discovery across the approved searchable-information set. | `PRD-0002-discovery.md` §§5.2, 8, 12.2 | `UX-0002-discovery.md` §§5.1, 7 | Direct Frozen assignment | Discovery | Includes Search Discovery Start and product matching priority by reference. |
| F03 | Browse | Active | Active Category-hierarchy Discovery ending in active-leaf Results. | `PRD-0002-discovery.md` §§5.3, 9, 12.3 | `UX-0002-discovery.md` §§5.2, 8 | Direct Frozen assignment | Discovery | Includes Browse Discovery Start and leaf-only result context. |
| F04 | Search Category Narrowing | Active | Narrowing cross-Category Search through one active Category path. | `PRD-0002-discovery.md` §8.3 | `UX-0002-discovery.md` §§5.5, 7.2 | Direct Frozen assignment | Discovery | Keeps Search origin; Category selection does not become a new Browse Start. |
| F05 | Attribute Filtering | Active | Leaf-Category filtering through authoritative filterable Attribute definitions. | `PRD-0002-discovery.md` §10 | `UX-0002-discovery.md` §9 | Direct Frozen assignment | Discovery | Includes value-kind semantics and OR-within / AND-across combination by reference. |
| F06 | Discovery Results and Listing Cards | Active | Publicly eligible result presentation through the bounded Listing Card minimum. | `PRD-0002-discovery.md` §§5.7–5.8, 11 | `UX-0002-discovery.md` §10 | Direct Frozen assignment | Discovery | Owns no Offering Presentation or visual component design. |
| F07 | Default Result Ordering | Active | Product-defined Search and Browse result ordering without a user Sort control. | `PRD-0002-discovery.md` §12 | `UX-0002-discovery.md` §§7.3, 8.3 | Direct Frozen assignment | Discovery | Includes stable tie behaviour and Initial Published At consumption by reference. |
| F08 | Zero Results Recovery | Active | Bounded recovery from a valid Discovery criteria set with no matching Results. | `PRD-0002-discovery.md` §13 | `UX-0002-discovery.md` §12 | Direct Frozen assignment | Discovery | No silent broadening, recommendation, or sponsored replacement. |
| F09 | Offering Presentation Handoff | Active | Opening one eligible Discovery Result and handing it to Offering Presentation. | `PRD-0002-discovery.md` §§5.11, 14 | `UX-0002-discovery.md` §11; `UX-0003-offering-detail.md` | Direct Frozen assignment | Discovery | Ends the current Discovery action; does not start Compare or Decision automatically. |
| F10 | Compare Preparation Discovery Return | Active | Current-flow return to the same leaf Category to find a second Compare candidate. | `PRD-0002-discovery.md` §§14, 16.5 | `UX-0002-discovery.md` §5.3; `UX-0003-offering-detail.md` §9.2; `UX-0004-compare.md` §6 | Direct Frozen assignment | Discovery | Transient only; no saved Search, URL state, or persistent Comparison state. |

## 7. Feature Entry Records

### F01 — Homepage Discovery Entry

- **Entry status:** Active
- **Short scope label:** Public Search and Browse entry into Discovery.
- **Behaviour owner reference:** `PRD-0002-discovery.md` §§5.1, 6
- **Applicable UX reference:** `UX-0001-home.md`; `UX-0002-discovery.md`
- **Capability relationship type:** Direct Frozen assignment
- **Capability reference:** Discovery
- **Boundary note:** Includes the exact Home prompt and explicit Search/Browse routing; defines no visual layout.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F02 — Search

- **Entry status:** Active
- **Short scope label:** Person-submitted query Discovery across the approved searchable-information set.
- **Behaviour owner reference:** `PRD-0002-discovery.md` §§5.2, 8, 12.2
- **Applicable UX reference:** `UX-0002-discovery.md` §§5.1, 7
- **Capability relationship type:** Direct Frozen assignment
- **Capability reference:** Discovery
- **Boundary note:** Includes Search Discovery Start and product matching priority by reference.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F03 — Browse

- **Entry status:** Active
- **Short scope label:** Active Category-hierarchy Discovery ending in active-leaf Results.
- **Behaviour owner reference:** `PRD-0002-discovery.md` §§5.3, 9, 12.3
- **Applicable UX reference:** `UX-0002-discovery.md` §§5.2, 8
- **Capability relationship type:** Direct Frozen assignment
- **Capability reference:** Discovery
- **Boundary note:** Includes Browse Discovery Start and leaf-only result context.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F04 — Search Category Narrowing

- **Entry status:** Active
- **Short scope label:** Narrowing cross-Category Search through one active Category path.
- **Behaviour owner reference:** `PRD-0002-discovery.md` §8.3
- **Applicable UX reference:** `UX-0002-discovery.md` §§5.5, 7.2
- **Capability relationship type:** Direct Frozen assignment
- **Capability reference:** Discovery
- **Boundary note:** Keeps Search origin; Category selection does not become a new Browse Start.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F05 — Attribute Filtering

- **Entry status:** Active
- **Short scope label:** Leaf-Category filtering through authoritative filterable Attribute definitions.
- **Behaviour owner reference:** `PRD-0002-discovery.md` §10
- **Applicable UX reference:** `UX-0002-discovery.md` §9
- **Capability relationship type:** Direct Frozen assignment
- **Capability reference:** Discovery
- **Boundary note:** Includes value-kind semantics and OR-within / AND-across combination by reference.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F06 — Discovery Results and Listing Cards

- **Entry status:** Active
- **Short scope label:** Publicly eligible result presentation through the bounded Listing Card minimum.
- **Behaviour owner reference:** `PRD-0002-discovery.md` §§5.7–5.8, 11
- **Applicable UX reference:** `UX-0002-discovery.md` §10
- **Capability relationship type:** Direct Frozen assignment
- **Capability reference:** Discovery
- **Boundary note:** Owns no Offering Presentation or visual component design.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F07 — Default Result Ordering

- **Entry status:** Active
- **Short scope label:** Product-defined Search and Browse result ordering without a user Sort control.
- **Behaviour owner reference:** `PRD-0002-discovery.md` §12
- **Applicable UX reference:** `UX-0002-discovery.md` §§7.3, 8.3
- **Capability relationship type:** Direct Frozen assignment
- **Capability reference:** Discovery
- **Boundary note:** Includes stable tie behaviour and Initial Published At consumption by reference.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F08 — Zero Results Recovery

- **Entry status:** Active
- **Short scope label:** Bounded recovery from a valid Discovery criteria set with no matching Results.
- **Behaviour owner reference:** `PRD-0002-discovery.md` §13
- **Applicable UX reference:** `UX-0002-discovery.md` §12
- **Capability relationship type:** Direct Frozen assignment
- **Capability reference:** Discovery
- **Boundary note:** No silent broadening, recommendation, or sponsored replacement.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F09 — Offering Presentation Handoff

- **Entry status:** Active
- **Short scope label:** Opening one eligible Discovery Result and handing it to Offering Presentation.
- **Behaviour owner reference:** `PRD-0002-discovery.md` §§5.11, 14
- **Applicable UX reference:** `UX-0002-discovery.md` §11; `UX-0003-offering-detail.md`
- **Capability relationship type:** Direct Frozen assignment
- **Capability reference:** Discovery
- **Boundary note:** Ends the current Discovery action; does not start Compare or Decision automatically.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.

### F10 — Compare Preparation Discovery Return

- **Entry status:** Active
- **Short scope label:** Current-flow return to the same leaf Category to find a second Compare candidate.
- **Behaviour owner reference:** `PRD-0002-discovery.md` §§14, 16.5
- **Applicable UX reference:** `UX-0002-discovery.md` §5.3; `UX-0003-offering-detail.md` §9.2; `UX-0004-compare.md` §6
- **Capability relationship type:** Direct Frozen assignment
- **Capability reference:** Discovery
- **Boundary note:** Transient only; no saved Search, URL state, or persistent Comparison state.

This entry identifies a Feature only. It defines no behaviour, Acceptance Criteria, Epic placement, Generated Story, or implementation.


## 8. Identifier Examples

After this registry is Frozen, Generated Stories may use identifiers such as:

```text
US-DSC-F01-001
US-DSC-F02-001
```

The `[ID]` segment remains owned by the User Story Handbook rules.

## 9. Story Generation Gate

Current state:

```text
Registry status: Frozen v1.0
Feature entry status: Active
Generated Story allocation: Available
```

The gate is open because the registry completed:

```text
Architecture Review
→ Final Review
→ explicit Owner Approval
→ separate Owner Freeze
```

The applicable registry is now Frozen; its Active Feature IDs may be consumed by authoritative Generated Story identifiers.

## 10. Change Rules

A controlled revision is required for:

- allocating another Feature ID;
- correcting a canonical Feature name;
- changing a scope label;
- changing an authority or UX reference;
- changing a relationship classification;
- retiring a Feature.

No revision may silently renumber an ID already consumed by an authoritative Story.

## 11. Related Documents

- `ADR-0009-story-domain-feature-registry-ownership.md`
- `ADR-0007-domain-scope-of-capability-first-rule.md`
- `USER_STORY_HANDBOOK.md`
- `REPOSITORY_GOVERNANCE.md`
- `OFFERING_CAPABILITY_ARCHITECTURE.md`
- `PRD-0002-discovery.md`
- `US-0002`

## 12. Readiness

The registry is ready for review when:

- every Feature is independently identifiable;
- no two entries duplicate the same bounded Feature concern;
- every entry has a behaviour-owner reference;
- every applicable UX reference is recorded;
- every Capability relationship follows ADR-0007 and ADR-0009;
- no entry defines behaviour or Epic placement;
- no Feature ID is missing or duplicated.

This document is Frozen v1.0 and must not be edited in place.
