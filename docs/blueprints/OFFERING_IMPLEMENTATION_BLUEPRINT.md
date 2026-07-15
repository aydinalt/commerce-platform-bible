# Offering Implementation Blueprint

- **Path:** docs/blueprint/OFFERING_IMPLEMENTATION_BLUEPRINT.md
- **Status:** Draft
- **Version:** 0.4
- **Last Updated:** 2026-07-15
- **Owners:** Architecture Owner, Product Owner
- **Approvers:** Architecture Owner, Product Owner, Lead Engineer

**Revision Note (0.2):** Controlled revision. PRD Alignment (§4) and UX Alignment (§5) moved from Aligned to In Progress, since the complete implementation chain is not yet established. A lightweight Implementation Traceability Matrix was added after §6. The Traceability Check (§7) now validates the complete vertical chain rather than individual layers. Implementation Readiness (§8) remains repository readiness only.

**Revision Note (0.3):** Controlled revision implementing Accepted `ADR-0002-offering-presentation-capability.md` (v1.0). (1) §4 PRD Alignment: PRD-0001's aligned aspects now include Presentation, and the aspect list names Presentation. (2) §5 UX Alignment: `UX-0003-offering-detail.md` is reconciled from the previous Representation alignment to **Presentation** (primary presentation concern) and **Contact & Action** (supported action entries only). (3) §6 Implementation Traceability Matrix: a Presentation row is added (`PRD-0001` / `UX-0003`), and `UX-0003` is removed from the Representation row (Representation retains `UX-0006` for management); `UX-0003` remains under Contact & Action for the action entries. (4) A note records that Business-information display behaviour is owned by `PRD-0005-business.md` and Favorites behaviour by `PRD-0004-decision.md`, with no capability owner asserted for either. Discovery, Representation, Decision, Identity, Business, and Lifecycle boundaries are preserved. Capabilities/aspects remain owned by `OFFERING_CAPABILITY_ARCHITECTURE.md`; behaviour by the PRDs; both referenced, not redefined. Status remains Draft.

**Revision Note (0.4):** Controlled revision. (1) Metadata **Path** corrected from `docs/blueprints/OFFERING_IMPLEMENTATION_BLUEPRINT.md` to `docs/blueprint/OFFERING_IMPLEMENTATION_BLUEPRINT.md`. (2) §6 Implementation Traceability Matrix: the **Presentation** row is reconciled with the verified Epic **Offering Presentation** and Feature **F05 — Full Offering Detail Presentation**, terminating at the Story Document `US-0001 Offering`; no individual Story ID is enumerated, because this Blueprint intentionally terminates at the Story Document. (3) §6 explanatory text is corrected so it no longer states that Epic and Feature are both Pending for the complete matrix: the Presentation chain now has an identified Epic, an identified Feature, and an identified Story Document, while other Capability rows may remain Pending where their Epic and Feature associations have not yet been reconciled, so the complete Blueprint-wide alignment remains In Progress. (4) §7 Traceability Check text is corrected so it no longer states the entire Story layer is still Pending: the Presentation chain is identified through its Story Document, while the complete Blueprint-wide vertical chain remains In Progress because other Capability rows still contain unreconciled Epic and Feature associations; this does not change individual Story ownership and enumerates no individual Story. No PRD behaviour, UX behaviour, Epic ownership, Feature ownership, Story ownership, identifier, Capability definition, or ADR decision changed. Presentation remains `UX-0003`'s primary Capability concern with Contact & Action secondary for the supported action entries; Representation no longer owns `UX-0003` as its primary experience; Business-information behaviour remains owned by `PRD-0005-business.md` and Favorites behaviour by `PRD-0004-decision.md`, with no inferred Capability owner for either; readiness statuses remain Pending; Blueprint-wide alignment remains In Progress; Status remains Draft.

> The first Implementation Blueprint for the Offering capability. It is a working document, not a Baseline. It becomes an Implementation Contract only after approval by the defined approvers. It defines no behaviour, experience, or implementation; those remain owned by their layers and are referenced here, never redefined.

---

## 0. Blueprint Status

This Blueprint moves through the following working states:

- **Draft** — being written; freely editable.
- **In Review** — submitted for review under `REVIEW_PROCESS.md`.
- **Approved** — accepted by the defined approvers; becomes the Implementation Contract for the Offering capability.
- **Ready for Development** — approved and confirmed complete against Section 8; development may begin.

This Blueprint is currently **Draft**. It is a working document and is not a repository Baseline. The state advances only through the review and approval defined in `REVIEW_PROCESS.md` and under the authority defined in `REPOSITORY_GOVERNANCE.md`.

## 1. Purpose

This document is the first Implementation Blueprint for the Offering capability. Its purpose is to bring the frozen documentation for the Offering capability together into a single implementation view that can be approved before development begins.

This document becomes the official Implementation Contract for the Offering capability **only after approval** by the approvers listed in the metadata. Until approved, it is a working document with no contractual authority.

## 2. Capability Scope

This Blueprint covers the Offering capability as defined by `OFFERING_CAPABILITY_ARCHITECTURE.md`. It does not redefine the Offering. The Offering remains the Universal Decision Object, as owned by the Foundation and the capability architecture; this Blueprint references that definition and does not restate it.

For this pilot, the Offering capability is exercised using a **physical retail product** solely as the pilot scenario. The physical retail product is an example instance used to validate implementation readiness; it is not a new Offering type and it does not narrow the Offering. The methodology and this Blueprint structure remain applicable to every future Offering type.

## 3. Capability Boundaries

This section records only what is **out of scope for this pilot**. It does not define global capability limits; capability scope and limits are owned by the PRD layer and the capability architecture.

- Out of scope for this pilot: Offering types other than the physical retail product used as the pilot scenario.
- Out of scope for this pilot: any behaviour, experience, or implementation not required to validate implementation readiness for the pilot scenario.

Global capability boundaries are not defined here; they remain owned by the PRDs and `OFFERING_CAPABILITY_ARCHITECTURE.md`.

## 4. PRD Alignment

**Status: In Progress**

This section records which PRDs the Offering capability aligns to. Each PRD remains the single owner of its own behaviour; the descriptions below reference that ownership and do not restate or redefine it. The capability aspects named (Creation, Representation, Presentation, Discovery, Decision Analysis, Decision Support, Lifecycle, Visibility & Eligibility, Contact & Action) are owned by `OFFERING_CAPABILITY_ARCHITECTURE.md` and mapped to PRDs by `CAPABILITY_COVERAGE_MATRIX.md`.

| PRD | Alignment to the Offering Capability | Status |
|-----|--------------------------------------|--------|
| `PRD-0001-offering.md` | Owns the Offering and its Attributes and Categories as descriptors, the Offering lifecycle, and viewing Offering details. Aligns to the Creation, Representation, Presentation, Lifecycle, and Visibility & Eligibility aspects of the Offering capability. | Aligned |
| `PRD-0002-discovery.md` | Owns discovery of Offerings. Aligns to the Discovery aspect of the Offering capability. | Aligned |
| `PRD-0003-identity.md` | Owns roles and the login gating for actions on Offerings. Aligns to the access and gating of the Contact & Action aspect of the Offering capability. | Aligned |
| `PRD-0004-decision.md` | Owns Compare, Decision Chat, Contact, Messaging, and the decision completion flow on Offerings. Aligns to the Decision Analysis, Decision Support, and Contact & Action aspects of the Offering capability. | Aligned |
| `PRD-0005-business.md` | Owns the Business that creates and is contacted about its Offerings. Aligns to the Creation (Business context) and Contact & Action (recipient) aspects of the Offering capability. | Aligned |
| `PRD-0006-platform.md` | Owns Category and Attribute management and moderation. Aligns to the Representation (management) and Visibility & Eligibility aspects of the Offering capability. | Aligned |

Reference Documents:

- `PRD-0001-offering.md`
- `PRD-0002-discovery.md`
- `PRD-0003-identity.md`
- `PRD-0004-decision.md`
- `PRD-0005-business.md`
- `PRD-0006-platform.md`
- `CAPABILITY_COVERAGE_MATRIX.md`

## 5. UX Alignment

**Status: In Progress**

This section records which UX Specifications the Offering capability aligns to. Each UX Specification remains the single owner of its own experience behaviour, which derives from its owning PRD; the descriptions below reference that experience and do not restate or redefine it. The capability aspects named are owned by `OFFERING_CAPABILITY_ARCHITECTURE.md`.

| UX Specification | Alignment to the Offering Capability | Status |
|------------------|--------------------------------------|--------|
| `UX-0001-home.md` | Presents the entry surface into the discovery of Offerings. Aligns to the Discovery aspect (entry). | Aligned |
| `UX-0002-discovery.md` | Presents the discovery of Offerings. Aligns to the Discovery aspect. | Aligned |
| `UX-0003-offering-detail.md` | Presents a complete Offering to a viewer, and the entry points to act on it. Aligns to the Presentation aspect (primary), and to the Contact & Action aspect for the supported action entries only. | Aligned |
| `UX-0004-compare.md` | Presents comparing Offerings and the assistive Decision Chat step. Aligns to the Decision Analysis and Decision Support aspects. | Aligned |
| `UX-0005-business-dashboard.md` | Presents the Business surface for managing its Offerings. Aligns to the Creation and Representation aspects (Business context). | Aligned |
| `UX-0006-admin-dashboard.md` | Presents administration, moderation, and Category and Attribute management. Aligns to the Visibility & Eligibility and Representation (management) aspects. | Aligned |
| `UX-0007-messaging.md` | Presents contacting and messaging the Business about an Offering. Aligns to the Contact & Action aspect. | Aligned |
| `UX-0008-authentication.md` | Presents the authentication surface that gates actions on Offerings. Aligns to the access and gating of the Contact & Action aspect. | Aligned |

Reference Documents:

- `UX-0001-home.md`
- `UX-0002-discovery.md`
- `UX-0003-offering-detail.md`
- `UX-0004-compare.md`
- `UX-0005-business-dashboard.md`
- `UX-0006-admin-dashboard.md`
- `UX-0007-messaging.md`
- `UX-0008-authentication.md`

## 6. Story Alignment

**Status: In Progress**

Story Alignment is an architectural integration layer. It is **not** the owner of User Stories. It does not own Story identifiers, Story text, Acceptance Criteria, INVEST, BDD, Story lifecycle, or Story status; those remain owned by `USER_STORY_HANDBOOK.md` (the standards) and by the Story Document `US-0001 Offering` (the Offering capability's Stories). This section terminates at the Story Document and references it — it does not enumerate individual Stories.

The alignment terminates at:

```
Capability
  ↓
Epic
  ↓
Feature
  ↓
Story Document
```

Epic is defined by `USER_STORY_HANDBOOK.md` and is instantiated in the Story Document; Feature is the structural unit owned by the Capability Architecture layer (`OFFERING_CAPABILITY_ARCHITECTURE.md`). Both are referenced, not redefined, here. In the Implementation Traceability Matrix below, the Presentation chain now carries an identified Epic (Offering Presentation) and an identified Feature (`F05` — Full Offering Detail Presentation) resolving to the Story Document `US-0001 Offering`; other Capability rows may remain Pending where their Epic and Feature associations have not yet been reconciled, so the complete Blueprint-wide alignment remains In Progress. The Alignment Status column is a Blueprint-local integration status; it is not Story completion, which remains owned by the Story layer.

| Capability | Epic | Feature | Story Document | Alignment Status |
|------------|------|---------|----------------|------------------|
| Offering (see `OFFERING_CAPABILITY_ARCHITECTURE.md`) | Pending | Pending | `US-0001 Offering` | In Progress |

Reference Documents:

- `USER_STORY_HANDBOOK.md`

### Implementation Traceability Matrix

This lightweight matrix connects each Offering capability aspect down the vertical chain. Capability aspects are owned by `OFFERING_CAPABILITY_ARCHITECTURE.md`; capability-to-PRD relationships are drawn from `CAPABILITY_COVERAGE_MATRIX.md`; capability-to-UX relationships are drawn from Section 5 of this Blueprint; Epic is owned by `USER_STORY_HANDBOOK.md` and Feature by the Capability Architecture layer. The Story Document column references only `US-0001 Offering`; no Story is enumerated, no Story identifier is invented, and no PRD, UX, Epic, or Story is redefined. The Alignment Status is a Blueprint-local integration status; Story completion remains owned by the Story layer.

| Capability Aspect | PRD | UX | Epic | Feature | Story Document | Alignment Status |
|-------------------|-----|----|------|---------|----------------|------------------|
| Creation | `PRD-0001-offering.md`, `PRD-0005-business.md` | `UX-0005-business-dashboard.md` | Pending | Pending | `US-0001 Offering` | In Progress |
| Representation | `PRD-0001-offering.md`, `PRD-0006-platform.md` | `UX-0006-admin-dashboard.md` | Pending | Pending | `US-0001 Offering` | In Progress |
| Presentation | `PRD-0001-offering.md` | `UX-0003-offering-detail.md` | Offering Presentation | F05 — Full Offering Detail Presentation | `US-0001 Offering` | In Progress |
| Discovery | `PRD-0002-discovery.md` | `UX-0001-home.md`, `UX-0002-discovery.md` | Pending | Pending | `US-0001 Offering` | In Progress |
| Decision Analysis | `PRD-0004-decision.md` | `UX-0004-compare.md` | Pending | Pending | `US-0001 Offering` | In Progress |
| Decision Support | `PRD-0004-decision.md` | `UX-0004-compare.md` | Pending | Pending | `US-0001 Offering` | In Progress |
| Lifecycle | `PRD-0001-offering.md` | — | Pending | Pending | `US-0001 Offering` | In Progress |
| Visibility & Eligibility | `PRD-0001-offering.md`, `PRD-0006-platform.md` | `UX-0006-admin-dashboard.md` | Pending | Pending | `US-0001 Offering` | In Progress |
| Contact & Action | `PRD-0003-identity.md`, `PRD-0004-decision.md` | `UX-0003-offering-detail.md`, `UX-0007-messaging.md`, `UX-0008-authentication.md` | Pending | Pending | `US-0001 Offering` | In Progress |
| Learning & Evolution | Pending Mapping | — | Pending | Pending | Pending | Pending |

**Entries displayed by Presentation without capability ownership.** On the Offering Detail screen, Presentation displays certain information and action entries whose behaviour is owned elsewhere and which are not mapped to a capability by this Blueprint: the Business information surfaced on the Offering (behaviour owned by `PRD-0005-business.md`) and the Favorites entry (behaviour owned by `PRD-0004-decision.md`). Presenting an entry is not performing its behaviour; no capability owner is asserted for these entries here (see `ADR-0002-offering-presentation-capability.md` §5).

## 7. Traceability Check

Traceability for this Blueprint follows `TRACEABILITY_GUIDELINES.md`; this section records the check, it does not redefine the methodology and it invents no identifiers.

This check validates the **complete vertical chain** end to end rather than individual layer links:

| Vertical Chain | Status |
|----------------|--------|
| Capability Aspect → PRD → UX → Story | In Progress |

The chain is In Progress because, although the Presentation chain is now identified through to its Story Document `US-0001 Offering` (with an identified Epic and Feature recorded in the Implementation Traceability Matrix after Section 6), other Capability rows still contain unreconciled Epic and Feature associations; until those are reconciled, the complete Blueprint-wide vertical chain is not yet unbroken end to end. This check does not change individual Story ownership and enumerates no individual Story. No orphan and no broken chain are recorded above the Story layer.

Reference Documents:

- `TRACEABILITY_GUIDELINES.md`
- `CAPABILITY_COVERAGE_MATRIX.md`

## 8. Implementation Readiness

Repository readiness only. This section confirms only whether the documentation is ready; it does not describe APIs, database, or infrastructure.

| Readiness Check | Status |
|-----------------|--------|
| Capability complete | Pending |
| PRD alignment complete | Pending |
| UX alignment complete | Pending |
| Story alignment complete | Pending |
| No architectural blockers | Pending |
| Ready for Development | Pending |

## 9. Risks

_(Section structure only. To be completed during review.)_

## 10. Open Questions

_(To be completed during review.)_

## 11. Exit Criteria

This Blueprint becomes **Ready for Development** only after:

- Sections 4, 5, 6, 7, and 8 are aligned and their statuses resolved.
- No architectural blocker remains.
- The Blueprint is Approved by all defined approvers: Architecture Owner, Product Owner, and Lead Engineer.

Approval converts this working document into the Implementation Contract for the Offering capability.

## 12. References

- `OFFERING_CAPABILITY_ARCHITECTURE.md`
- `CAPABILITY_COVERAGE_MATRIX.md`
- `TRACEABILITY_GUIDELINES.md`
- `OFFERING_PILOT.md`
- `USER_STORY_HANDBOOK.md`
- `ADR-0002-offering-presentation-capability.md`
- `PRD-0001-offering.md`, `PRD-0002-discovery.md`, `PRD-0003-identity.md`, `PRD-0004-decision.md`, `PRD-0005-business.md`, `PRD-0006-platform.md`
- `VISION.md`, `MISSION.md`, `PRODUCT_MANIFESTO.md`, `PRODUCT_PRINCIPLES.md`, `V1_SCOPE.md`
- `REPOSITORY_GOVERNANCE.md`, `ENGINEERING_CONSTITUTION.md`, `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`
