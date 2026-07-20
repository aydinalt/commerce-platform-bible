# CHANGELOG

All notable changes to the **Commerce Platform Bible** repository are documented in this file.

This project follows the principles of:
- Documentation First Development
- Semantic Versioning
- Single Information Owner
- Reference Never Redefine

---

## [Unreleased]

### Planned

- User Story Layer
- Engineering Standards
- Software Architecture
- Development Phase

---

## [1.8.0] - 2026-07-20

### Added or recorded

#### ADR and Governance
- ADR-0004 — Capability Architecture Layer Recognition — **Accepted v1.0** on 2026-07-19.
- `REPOSITORY_GOVERNANCE.md` completed Formal Architecture Review, Final Review, explicit Owner Approval, and separate Owner Freeze — **Frozen v1.0**.
- Repository management-document reconciliation recorded as the immediate follow-up required by Frozen `REPOSITORY_GOVERNANCE.md` §12.

#### Canonical Source-State Inventory
- Governance process documents: `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, `ADR_PROCESS.md` — **Draft v0.1**.
- `USER_STORY_HANDBOOK.md` — **Draft v0.9**.
- PRDs: PRD-0001 **Approved v1.1**; PRD-0003 **Approved v1.0**; PRD-0002 **Draft v0.1**; PRD-0004 **Draft v0.4**; PRD-0005 and PRD-0006 **Draft v0.1**.
- UX: UX-0001 through UX-0008 remain **Draft** (v0.1 or v0.2 according to each canonical header).
- `ENGINEERING_CONSTITUTION.md` — **Draft v1.3**.

### Changed

- `CURRENT_STATUS.md` updated to v1.8 and reconciled to canonical source headers.
- `PROJECT_ROADMAP.md` updated to v2.9 with a source-recovery sequence and explicit readiness gates.
- Completion percentages were suspended during recovery because previous values counted unsupported Baseline/Frozen claims as complete.
- New `US-0002 Discovery` Story Architecture production is blocked until `PRD-0002`, `UX-0001`, `UX-0002`, and `USER_STORY_HANDBOOK.md` complete their lawful lifecycle.

### Corrected

- Corrected the unsupported claim that `USER_STORY_HANDBOOK.md` was Baseline v1.0; its canonical source remains Draft v0.9.
- Corrected the unsupported claim that the complete PRD layer was Frozen; the current PRD sources are mixed Approved/Draft.
- Corrected the unsupported claim that the UX layer was Frozen; all current UX sources remain Draft.
- Corrected the unsupported claim that the governance layer was fully complete; three governance process documents remain Draft v0.1.
- Preserved repository history by annotating earlier entries rather than pretending the unsupported lifecycle events occurred.

### Preserved

- Existing Offering Capability Architecture and F03/F04 reconciliation outcomes remain unchanged.
- ADR-0001 through ADR-0004 remain Accepted.
- F02 remains Deferred / Not Yet Decided and is not recorded as a Feature → Capability association.
- No product behaviour, UX behaviour, Story behaviour, Capability, Feature, Feature ID, Feature → Capability association, implementation decision, or historical source file was changed by this reconciliation.

### Milestone

- Repository source-state recovery opened.
- Next sequence: governance process documents → User Story Handbook → PRDs → UX → `US-0002 Discovery` readiness reassessment.

---

## [1.7.0] - 2026-07-18

### Added or recorded

#### ADR-0003 — Offering Authoring & Publication Feature → Capability Associations (F01–F04) — Accepted v1.0
- F01 → Creation
- F03 → Lifecycle
- F04 → Lifecycle

### Changed through controlled revision

- OFFERING_CAPABILITY_ARCHITECTURE.md reached **Frozen v1.0** and is the authoritative Offering Capability Architecture baseline.
- US-OFR-F03-001 — Offering Retirement reached **Frozen v1.0** and became the current authoritative Golden Baseline.
- US-OFR-F04-001 — Offering Publication reached **Frozen v1.0** and became the current authoritative Golden Baseline.

### Preserved

- The F03 and F04 v0.1 Frozen Golden Baselines remain preserved as historical superseded baselines.
- Story behaviour and all behavioural sections — Purpose, Business Value, Description, Acceptance Criteria, BDD, Dependencies, Out of Scope, Story Size, Delivery Status, and TODOs — remained unchanged.
- F02 — Offering Editing remains **Deferred**; its capability home remains **Not Yet Decided** and is not recorded as an association. Deferred is not a Capability.
- F05 → Presentation remains accepted and recorded under ADR-0002.

### Clarified

- No normative Epic–Capability conflict exists; the Epic–Capability assessment concluded **NO NORMATIVE CONFLICT**.
- Feature → Capability is the authoritative architectural relationship, owned by OFFERING_CAPABILITY_ARCHITECTURE.md.
- No traceability.md change was required.
- Corrected the historical version labels for the preserved F03 and F04 Frozen baselines from v1.0 to v0.1 in the [1.4.0] and [1.5.0] entries.

### Milestone

- Offering Capability and F03/F04 Story reconciliation complete and closed. Approval and freeze were recorded as separate Owner decisions for each document.
- Optional USER_STORY_HANDBOOK.md terminology clarification recorded as non-blocking future maintenance.

---

## [1.6.0] - 2026-07-16

### Added

#### Golden Baseline Story
- US-OFR-F05-001 — Full Offering Detail Presentation — Version 1.0, Status: Golden Baseline

### Story Generation Progress

- Offering Presentation (US-0001 Offering) — **Epic complete**:
  - F05 — Full Offering Detail Presentation (US-OFR-F05-001) — Golden Baseline

### Milestone

- US-OFR-F05-001 review pipeline completed: Architecture Review → ADR-0002 Accepted → Coordinated Controlled Revisions → Final Story Validation → Parent Story Document Reconciliation → Golden Freeze Review → Product Owner / Architecture Owner Approval → Golden Baseline.
- Offering Presentation Epic complete.

---

## [1.5.0] - 2026-07-11

### Added

#### Golden Baseline Story
- US-OFR-F04-001 — Offering Publication — Version 0.1, Status: Frozen Golden Baseline

### Story Generation Progress

- Offering Publication (US-0001 Offering) — **Epic complete**:
  - F04 — Offering Publication (US-OFR-F04-001) — Golden Baseline (Draft → Published)

### Milestone

- US-OFR-F04-001 review pipeline completed: Architecture Review → Story Inventory → Controlled Revision Assessment (No Controlled Revision Required) → Validation (VALIDATED) → Golden Freeze (Ready for Golden Baseline) → Golden Baseline.
- Offering Publication Epic complete.

---

## [1.4.0] - 2026-07-11

### Added

#### Golden Baseline Story
- US-OFR-F03-001 — Offering Retirement — Version 0.1, Status: Frozen Golden Baseline

### Story Generation Progress

- Offering Authoring (US-0001 Offering) — **Epic complete**:
  - F01 — Offering Creation (US-OFR-F01-001) — Golden Baseline
  - F02 — Offering Editing (US-OFR-F02-001) — Golden Baseline
  - F03 — Offering Retirement (US-OFR-F03-001) — Golden Baseline

### Milestone

- US-OFR-F03-001 review pipeline completed: Architecture Review → Architecture Re-Review → Story Inventory → Controlled Revision Assessment (No Controlled Revision Required) → Validation (VALIDATED) → Golden Freeze (Ready for Golden Baseline) → Golden Baseline.
- Offering Authoring Epic complete: F01, F02, and F03 are all Golden Baseline.

---

## [1.3.0] - 2026-07-11

### Added

#### Golden Baseline Story
- US-OFR-F02-001 — Offering Editing — Version 1.0, Status: Golden Baseline

### Story Generation Progress

- Offering Authoring (US-0001 Offering):
  - F01 — Offering Creation (US-OFR-F01-001) — Golden Baseline
  - F02 — Offering Editing (US-OFR-F02-001) — Golden Baseline
  - F03 — Offering Retirement — Next Active Feature

### Milestone

- US-OFR-F02-001 review pipeline completed: Architecture Review → Story Inventory → Controlled Revision Assessment (No Controlled Revision Required) → Validation (VALIDATED) → Golden Freeze (Ready for Golden Baseline) → Golden Baseline.

---

## [1.2.0] - 2026-07-11

> **Correction notice — 2026-07-20:** The Baseline claims recorded in this entry were not supported by the canonical source headers. `REPOSITORY_GOVERNANCE.md` later completed a lawful lifecycle and became Frozen v1.0 on 2026-07-19. `USER_STORY_HANDBOOK.md` remains Draft v0.9. See [1.8.0].

### Added

#### Story Governance Baseline
- USER_STORY_HANDBOOK.md — Version 1.0, Status: Baseline
- REPOSITORY_GOVERNANCE.md — Version 1.0, Status: Baseline
- Story Domain Code Registry (owned by REPOSITORY_GOVERNANCE.md)

### Changed

#### USER_STORY_HANDBOOK.md → Baseline (v1.0)
- Story Governance completed
- Story ID architecture finalized (Generated Story ID: `US-[DOMAIN]-[FEATURE_ID]-[ID]`)
- Story Domain ownership finalized (Domain codes consumed by reference from REPOSITORY_GOVERNANCE.md)
- Feature ID ownership finalized (Feature IDs consumed by reference from OFFERING_CAPABILITY_ARCHITECTURE.md)
- Story Generation Standards finalized

#### REPOSITORY_GOVERNANCE.md → Baseline (v1.0)
- Repository Governance finalized
- Story Domain Registry introduced
- Domain Code ownership finalized
- Repository hierarchy finalized
- Governance ownership model finalized

### Milestone

- USER_STORY_HANDBOOK.md review pipeline completed: Architecture Review → Controlled Revision → Architecture Verification → Validation Review → Freeze Review → Baseline.
- REPOSITORY_GOVERNANCE.md review pipeline completed: Architecture Review → Controlled Revision → Validation Review → Freeze Review → Baseline.
- Story Governance Baseline established; repository Governance phase complete.

---

## [1.1.0] - 2026-07-11

### Added

#### Capability Architecture Layer (Baseline)
- OFFERING_CAPABILITY_ARCHITECTURE.md
- CAPABILITY_COVERAGE_MATRIX.md
- TRACEABILITY_GUIDELINES.md
- Governance recognition of the Capability Architecture layer (Foundation → Capability Architecture → PRD)

### Changed

- Repository Harmonization completed: unified repository layer hierarchy, single owner of the hierarchy established (REPOSITORY_GOVERNANCE.md), Engineering layer recognized in the Layer Authority table, and the traceability status vocabulary single-owned by TRACEABILITY_GUIDELINES.md.
- ENGINEERING_CONSTITUTION.md refactored so detailed User Story standards are governed by USER_STORY_HANDBOOK.md.

### Milestone

- Freeze Review completed.
- Capability Architecture Baseline established.

---

## [1.0.0] - 2026-07-10

> **Correction notice — 2026-07-20:** The layer-wide PRD Frozen and UX Frozen labels below were not supported by the canonical source headers. Current PRD sources are mixed Approved/Draft, and all current UX sources remain Draft. See [1.8.0].

### Added

#### Repository
- Initial repository structure
- Documentation architecture
- Templates
- Repository governance

#### Governance
- REPOSITORY_GOVERNANCE.md
- DOCUMENT_LIFECYCLE.md
- REVIEW_PROCESS.md
- ADR_PROCESS.md
- ADR README

#### Foundation (Frozen)
- VISION.md
- MISSION.md
- PRODUCT_MANIFESTO.md
- PRODUCT_PRINCIPLES.md
- V1_SCOPE.md

#### Architecture Decisions
- ADR-0001 — Decision Chat Ownership (Accepted)

#### PRD Layer (Frozen)
- PRD-0001 Offering
- PRD-0002 Discovery
- PRD-0003 Identity
- PRD-0004 Decision
- PRD-0005 Business
- PRD-0006 Platform

#### UX Layer (Frozen)
- UX-0001 Home
- UX-0002 Discovery
- UX-0003 Offering Detail
- UX-0004 Compare
- UX-0005 Business Dashboard
- UX-0006 Admin Dashboard
- UX-0007 Messaging
- UX-0008 Authentication

#### Repository Management
- CURRENT_STATUS.md
- PROJECT_ROADMAP.md

### Changed

- Decision Chat ownership moved under PRD-0004 through ADR-0001.
- UX layer aligned with Frozen PRDs.
- Compare limit ownership moved to PRD-0004.
- Repository roadmap and status management introduced.

### Fixed

- Cross-layer ownership inconsistencies.
- UX / PRD traceability issues.
- Decision Chat documentation ownership.

---

## Changelog Policy

- Every architectural decision must be reflected here.
- Frozen documents are never edited in place; superseding versions are recorded.
- This file records repository history only and does not replace ADRs or Revision History sections inside documents.
