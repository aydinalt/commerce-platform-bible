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
- US-OFR-F04-001 — Offering Publication — Version 1.0, Status: Golden Baseline

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
- US-OFR-F03-001 — Offering Retirement — Version 1.0, Status: Golden Baseline

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
