# US-OFR-F05-001 — Full Offering Detail Presentation

> **Reference note (informative only).** This document follows the repository Story structure established by the Golden Baselines `US-OFR-F01-001` through `US-OFR-F04-001`. It reuses that structure only; it copies no behaviour. `USER_STORY_HANDBOOK.md` remains the Single Information Owner of the Story standards, behaviour is owned by `PRD-0001-offering.md`, the viewer experience is owned by `UX-0003-offering-detail.md`, and the Feature ID `F05` is consumed by reference from the authoritative Feature Registry in `OFFERING_CAPABILITY_ARCHITECTURE.md`.

> **Revision Note (0.2):** Controlled revision implementing Accepted `ADR-0002-offering-presentation-capability.md` (v1.0). The inferred Capability value `Representation (presented to a viewer)` is replaced by **Presentation**, consumed by reference from the authoritative `OFFERING_CAPABILITY_ARCHITECTURE.md` under the Accepted ADR-0002 decision; the §6 Capability reference row is updated accordingly. No Story behaviour changed: Story ID, title, Epic, Feature ID `F05`, viewer perspective, Purpose, Business Value, Description, Acceptance Criteria, BDD, Dependencies, Out of Scope, UX-owned TODOs, Story Size, and Delivery Status are unchanged, and UX-0003 TODOs are not resolved.

> **Revision Note (1.0):** Owner-approved Golden Baseline transition. The F05 Golden Freeze Review passed with no blocking findings, and the Product Owner / Architecture Owner explicitly approved this Story. The lifecycle transitions were performed sequentially — Draft → In Review → Approved → Frozen — and the final repository designation is **Golden Baseline** (the repository designation corresponding to the canonical lifecycle state Frozen). Version advanced to 1.0 upon first Approval; Delivery Status remains Not Started. No Story behaviour, Acceptance Criterion, BDD scenario, TODO, dependency, scope boundary, identifier, Capability, Feature, Epic, PRD, UX, or ADR decision changed.

## 1. Metadata

| Field | Value |
|-------|-------|
| Story ID | `US-OFR-F05-001` |
| Story Title | Full Offering Detail Presentation |
| Story Document | `US-0001 Offering` (`US-0001-offering.md`) |
| Story Domain | Offering |
| Domain Code | `OFR` (owned by `REPOSITORY_GOVERNANCE.md`) |
| Epic | Offering Presentation |
| Feature | F05 — Full Offering Detail Presentation |
| Feature ID | `F05` (allocated by `OFFERING_CAPABILITY_ARCHITECTURE.md` — Feature Registry) |
| Capability | Presentation (owned by `OFFERING_CAPABILITY_ARCHITECTURE.md`; `F05 → Presentation` per Accepted `ADR-0002-offering-presentation-capability.md`, consumed by reference) |
| Perspective | Viewer — Guest / User (Decision Journey as owned by `glossary.md`) |
| Behaviour Owner | `PRD-0001-offering.md` |
| Experience Owner | `UX-0003-offering-detail.md` |
| Status | Golden Baseline (canonical lifecycle state: Frozen) |
| Delivery Status | Not Started |
| Story Size | M |
| Version | 1.0 |
| Last Updated | 2026-07-16 |

---

## 2. Story Identification

The Story identifier follows the Generated User Story ID format owned and defined in `USER_STORY_HANDBOOK.md` (§5); that format is referenced here, not restated.

| Segment | Value | Owner (by reference) |
|---------|-------|----------------------|
| Prefix | `US` | `USER_STORY_HANDBOOK.md` |
| `[DOMAIN]` | `OFR` (Offering Story Domain) | `REPOSITORY_GOVERNANCE.md` — Story Domain Code Registry |
| `[FEATURE_ID]` | `F05` (Full Offering Detail Presentation) | `OFFERING_CAPABILITY_ARCHITECTURE.md` — Feature Registry |
| `[ID]` | `001` (first Story of the Feature) | `USER_STORY_HANDBOOK.md` |

This Story is contained by the Story Document `US-0001 Offering` (Document ID owned by `USER_STORY_HANDBOOK.md` §5) and belongs to exactly one Epic (Offering Presentation) and exactly one Feature (F05 — Full Offering Detail Presentation).

---

## 3. Purpose

To let a viewer see a complete Offering in full, so that the viewer can evaluate the Offering thoroughly.

This Story realizes the Full Offering Detail Presentation Feature only: presenting a single Offering in full to a viewer on the Offering Detail screen. Behaviour is owned by `PRD-0001-offering.md`; the viewer experience is owned by `UX-0003-offering-detail.md`; this Story references both and does not redefine them.

---

## 4. Business Value

**As a** viewer (Guest or User),
**I want** to see a complete Offering in full,
**so that** I can evaluate the Offering thoroughly.

The Offering Detail screen is where a person evaluates one Offering in depth: its image gallery, its Attribute groups, and the Business behind it (`UX-0003-offering-detail.md` §1). The value delivered here is the full presentation of the Offering to a viewer; it is not reaching the Offering (Discovery), nor performing any action on it (Compare, Favorites, Contact, phone reveal), each of which is delivered and owned elsewhere.

---

## 5. Description

A viewer on the Offering Detail screen sees a single Offering presented in full: its image gallery, its Attribute groups, and the Business behind it (`PRD-0001-offering.md` §11.13; `UX-0003-offering-detail.md` §1, §3, §7). The entries for Compare, Favorites, and Contact are shown on the screen; performing those actions is outside this Story. A Guest may view the complete Offering; a Guest may not view the Business phone number and may not initiate messaging (`UX-0003-offering-detail.md` §15).

This Story is bounded to the single meaningful viewer outcome of **a viewer seeing a complete Offering in full**. Arriving at the Offering (search/browse) is owned by Discovery (`PRD-0002-discovery.md`) and is out of scope; the behaviour behind the on-screen action entries — Compare, Favorites, Contact, phone reveal — and the authentication routing they may trigger are owned by `PRD-0004-decision.md` and `PRD-0003-identity.md` (via `UX-0004`, `UX-0007`, `UX-0008`) and are out of scope. Defining or authoring the Offering's descriptors, and the Category/Attribute taxonomy, are also out of scope.

Several behaviours of the Offering Detail screen are undecided in the owning experience document and are carried here as TODO, not invented (in accordance with the Documentation-First discipline of `USER_STORY_HANDBOOK.md`): the selection of Related Offerings, the empty state when there are no Related Offerings, the no-gallery-images state, the loading state, the unavailable / not-Published / failed-load state, and detailed accessibility behaviour (see §7, §8, §11).

---

## 6. References

Repository references only; each is consumed by reference and never redefined here.

| Layer | Document | Referenced For |
|-------|----------|----------------|
| Capability | `OFFERING_CAPABILITY_ARCHITECTURE.md` | The Presentation capability (F05 → Presentation, per Accepted `ADR-0002`, consumed by reference) and the Feature ID `F05` (Feature Registry) |
| Implementation Blueprint | `OFFERING_IMPLEMENTATION_BLUEPRINT.md` | The capability-wide integration view |
| PRD (behaviour) | `PRD-0001-offering.md` | Viewing Offering details (Guests and Users can view Offering details) |
| PRD (gated actions) | `PRD-0004-decision.md` | Compare, Favorites, and Contact entries (behaviour out of scope) |
| PRD (access gating) | `PRD-0003-identity.md` | Guest vs User gating for phone number and messaging |
| PRD (Discovery) | `PRD-0002-discovery.md` | Reaching the Offering (out of scope; referenced for the boundary owner) |
| UX | `UX-0003-offering-detail.md` | The Offering Detail screen and viewer behaviour |
| Epic | `US-0001-offering.md` | Epic: Offering Presentation |
| Feature | `US-0001-offering.md` | Feature: Full Offering detail presentation |
| Domain Code | `REPOSITORY_GOVERNANCE.md` | The `OFR` Story Domain code |
| Standards | `USER_STORY_HANDBOOK.md` | Story standards, INVEST, Definition of Ready, Definition of Done, Validation Checklist |

---

## 7. Acceptance Criteria

Each Acceptance Criterion expresses behaviour only and is objectively testable. Behaviour is owned by `PRD-0001-offering.md` and the viewer experience by `UX-0003-offering-detail.md`; these criteria reference that behaviour and do not implement it.

- **AC-1** — The system shall present a complete Offering in full to a viewer on the Offering Detail screen.
- **AC-2** — The system shall present the Offering's image gallery, its Attribute groups, and the Business behind the Offering.
- **AC-3** — The system shall allow a Guest to view the complete Offering.
- **AC-4** — The system shall not disclose the Business phone number to a Guest.
- **AC-5** — The system shall not allow a Guest to initiate messaging.
- **AC-6** — The system shall present the Compare, Favorites, and Contact entries on the Offering Detail screen without performing those actions as part of presentation.

> **TODO (owned by `UX-0003-offering-detail.md`):** The selection of Related Offerings ("newest in the same Category"), and the empty state when there are no Related Offerings in the same Category (§12), are undecided; the corresponding Acceptance Criteria remain a TODO and are not defined in this Story.
> **TODO (owned by `UX-0003-offering-detail.md`):** The behaviour when an Offering has no gallery images (§12), the loading state while the Offering is retrieved (§13), and the behaviour when the Offering fails to load or is unavailable (for example, not Published) (§14) are undecided; the corresponding Acceptance Criteria remain a TODO and are not defined in this Story.
> **TODO (owned by `UX-0003-offering-detail.md`):** Detailed accessibility acceptance criteria (§16) are undecided; the corresponding Acceptance Criteria remain a TODO and are not defined in this Story.

---

## 8. BDD

Given / When / Then scenarios are contained inside this Story. No external test documents are referenced.

### Scenario: A viewer sees a complete Offering in full
```
Given a viewer on the Offering Detail screen for a Published Offering
When the Offering Detail screen is presented
Then the system presents the Offering in full
And the system presents its image gallery, its Attribute groups, and the Business behind it
```

### Scenario: A Guest views the complete Offering but not gated data
```
Given a Guest on the Offering Detail screen
When the Offering Detail screen is presented
Then the system presents the complete Offering to the Guest
And the system does not disclose the Business phone number
And the system does not allow the Guest to initiate messaging
```

### Scenario: The action entries are presented without being performed
```
Given a viewer on the Offering Detail screen
When the Offering Detail screen is presented
Then the system presents the Compare, Favorites, and Contact entries
And presenting them does not perform Compare, Favorites, or Contact
```

> **TODO (owned by `UX-0003-offering-detail.md`):** Scenarios covering Related Offerings selection and the empty, no-image, loading, and unavailable / not-Published states are undecided and are carried as TODO until decided there.
> **TODO (owned by `UX-0003-offering-detail.md`):** Scenarios covering detailed accessibility behaviour are undecided and are carried as TODO until decided there.

---

## 9. Dependencies

Only the `Depends On` and `Blocks` relationships defined by `USER_STORY_HANDBOOK.md` are used.

**Depends On**
- Offering Publication (F04) — an Offering is presented to viewers when it is Published (`UX-0003-offering-detail.md` §14 references the not-Published case as a TODO).
- `PRD-0001-offering.md` — viewing Offering details.
- `UX-0003-offering-detail.md` — the Offering Detail screen and viewer behaviour.
- `PRD-0003-identity.md` — Guest vs User gating for phone number and messaging.

**Blocks**
- None identified at this time.

The listed relationships represent the immediate dependencies of this Story and are not intended to be an exhaustive dependency inventory.

---

## 10. Story Size

**M** (repository T-Shirt sizing per `USER_STORY_HANDBOOK.md`).

No Story Points are used in this document.

---

## 11. Out of Scope

The following behaviour is intentionally excluded from this Story:

- **Reaching the Offering** (search, browse, filter to arrive at it) — owned by `PRD-0002-discovery.md`.
- **Compare behaviour** — owned by `PRD-0004-decision.md` (experience `UX-0004`). The Compare entry is presented; performing Compare is out of scope.
- **Favorites behaviour** — owned by `PRD-0004-decision.md`, gated by `PRD-0003-identity.md`. The Favorites entry is presented; performing Favorites is out of scope.
- **Contact / messaging behaviour** — owned by `PRD-0004-decision.md`, gated by `PRD-0003-identity.md` (experience `UX-0007`). The Contact entry is presented; performing Contact is out of scope.
- **Phone-reveal behaviour** — owned by `PRD-0004-decision.md`, gated by `PRD-0003-identity.md`. The entry is presented; revealing the phone number is out of scope.
- **Authentication flows** (routing a Guest to Authentication and return-to-action) — owned by `PRD-0003-identity.md` (experience `UX-0008`).
- **Descriptor authoring** — assigning Categories or entering Attribute values (Business-side Authoring / Representation-authoring, owned by `PRD-0001-offering.md` and `UX-0005-business-dashboard.md`). This Story presents Attribute groups; it does not author them.
- **Category / Attribute taxonomy management** — owned by `PRD-0006-platform.md`.
- **Related Offerings selection logic, empty / no-image / loading / unavailable (not-Published) / accessibility behaviour** — owned by `UX-0003-offering-detail.md`; carried as TODO where undecided (see §7, §8).
- **Business-side (Business Owner) behaviour** — this Story is written from the viewer (Guest / User) perspective only.

---

## 12. Definition of Ready

This Story's readiness is governed by the Definition of Ready in `USER_STORY_HANDBOOK.md` (§11). It is referenced here and not duplicated.

---

## 13. Definition of Done

This Story's completion is governed by the Definition of Done in `USER_STORY_HANDBOOK.md` (§18). It is referenced here and not duplicated.

---

## 14. Story Validation Checklist

Per the Story Validation Checklist in `USER_STORY_HANDBOOK.md` (§22):

- ☑ Represents one Decision Journey step (Decision Journey as owned by `glossary.md`; here, a viewer sees a complete Offering in full)
- ☑ Provides user value (a viewer can evaluate the complete Offering)
- ☑ Independently understandable
- ☑ Independently testable
- ☑ Traceable (Capability, Blueprint, PRD, UX, Epic, Feature — see §6)
- ☑ References resolve correctly
- ☑ No duplicate Story
- ☑ No implementation details
- ☑ No Story overlap (Discovery, Compare, Favorites, Contact, phone reveal, authentication, descriptor authoring, taxonomy excluded — see §11)
