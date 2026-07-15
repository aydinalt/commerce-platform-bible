<!--
Owner:        Architecture Owner
Status:       Living
Version:      2.7
Last Updated: 2026-07-11

Purpose:
Defines the strategic execution roadmap for Commerce Platform Bible.
This document governs milestone progression and execution strategy.
It does not define product behavior.

Authority:
Architecture Owner / Product Owner
-->

# PROJECT ROADMAP

## Executive Summary

This roadmap is the authoritative execution plan for the Commerce Platform Bible.
Its purpose is to describe **how the project progresses**, not **what the product does**.

The roadmap is a Living document and evolves as milestones are completed.

---

# Roadmap Principles

- Documentation First Development
- Architecture Before Development
- Frozen Before Implementation
- Single Information Owner
- Reference Never Redefine
- Long-term Maintainability
- Quality Over Speed
- Incremental Delivery
- Continuous Validation
- AI Assists — Humans Decide

---

# Dependency Matrix

This is the **Repository Layer Hierarchy**, owned by `REPOSITORY_GOVERNANCE.md` and referenced here (not redefined). It describes how documentation layers depend on one another. It is distinct from the Project Delivery Flow below.

Foundation
↓
Capability Architecture
↓
PRD
↓
UX
↓
User Stories
↓
Engineering
↓
Development

| Depends On | Enables |
|------------|----------|
| Foundation | Capability Architecture |
| Capability Architecture | PRD |
| PRD | UX |
| UX | User Stories |
| User Stories | Engineering |
| Engineering | Development |

---

# Project Delivery Flow

This is the **Project Delivery / Milestone Flow**. It is a separate concept from the Repository Layer Hierarchy above. Software Architecture and Release are project delivery milestones, not repository layers.

Foundation
↓
Capability Architecture
↓
PRD
↓
UX
↓
Software Architecture
↓
Development
↓
Release

---

# Decision Gates

| Gate | Requirement |
|------|-------------|
| Gate 1 | Foundation Frozen |
| Gate 2 | PRDs Frozen |
| Gate 3 | UX Frozen |
| Gate 4 | User Stories Frozen |
| Gate 5 | Engineering Standards Approved |
| Gate 6 | Architecture Approved |
| Gate 7 | Development Begins |
| Gate 8 | Production Release |

---

# Milestone Overview

| Milestone | Status |
|-----------|--------|
| M1 Documentation Foundation | ✅ Completed |
| M2 UX Layer | ✅ Completed |
| Capability Architecture Layer | ✅ Completed |
| Offering Pilot | 🚧 In Progress |
| M3 User Story Layer | 🚧 In Progress |
| M4 Engineering Standards | ⏳ Planned |
| M5 Repository Completion | ⏳ Planned |
| M6 Software Architecture | ⏳ Planned |
| M7 Development | ⏳ Planned |
| M8 Release | ⏳ Planned |

---

# Current Position (WE ARE HERE)

The repository completed its **Governance phase** (REPOSITORY_GOVERNANCE.md and USER_STORY_HANDBOOK.md — Baseline v1.0) and is now in **Product Story Generation**.

**Offering Authoring (US-0001 Offering) — ✅ COMPLETED**

- ✅ Offering Creation (F01) — US-OFR-F01-001 — Golden Baseline
- ✅ Offering Editing (F02) — US-OFR-F02-001 — Golden Baseline
- ✅ Offering Retirement (F03) — US-OFR-F03-001 — Golden Baseline

**Offering Publication (US-0001 Offering) — ✅ COMPLETED**

- ✅ Offering Publication (F04) — US-OFR-F04-001 — Golden Baseline (Draft → Published)

The next Epic is **Offering Presentation**.

---

# Milestone Details

## M1 Documentation Foundation
Status: ✅ Completed

Entry:
- Repository created

Exit:
- Governance complete
- Foundation Frozen
- ADR established
- PRDs Frozen

Success:
- Single source of truth established.

---

## M2 UX Layer
Status: ✅ Completed

Exit:
- UX validated
- UX Frozen

Success:
- UX fully traceable to PRDs.

---

## Capability Architecture Layer
Status: ✅ Completed

Completed Stages:
- Architecture Audit
- ADR Decision Analysis
- Controlled Revision
- Validation Review
- Repository Harmonization
- Freeze Review

Exit:
- Capability model, coverage matrix, and traceability methodology established
- Capability Architecture recognized in governance and engineering documentation
- Freeze Review passed
- Capability Architecture Baseline established

Success:
- Capability Architecture frozen as a repository baseline.

---

## Offering Pilot
Status: 🚧 In Progress

Objective:
- Open the next milestone. Apply the baselined Foundation, Capability Architecture, PRD, and UX layers to pilot the Offering through the documentation layers.

Deliverables:
- TODO — to be defined as the Offering Pilot is planned.

Success:
- Offering piloted end-to-end across the baselined layers.

---

## M3 User Story Layer
Status: 🚧 In Progress

Deliverables:
- USER_STORY_HANDBOOK — ✅ Baseline (v1.0)
- ENGINEERING_CONSTITUTION — 🚧 In Progress
- US-0001 … US-0006 — 🚧 In Progress (Product Story Generation)
  - Offering Authoring: ✅ **Epic complete** — F01 Offering Creation (US-OFR-F01-001), F02 Offering Editing (US-OFR-F02-001), F03 Offering Retirement (US-OFR-F03-001), all Golden Baseline
  - Offering Publication: ✅ **Epic complete** — F04 Offering Publication (US-OFR-F04-001), Golden Baseline (Draft → Published)
  - Offering Presentation: ⏳ Next Epic

Supporting Baseline:
- REPOSITORY_GOVERNANCE — ✅ Baseline (v1.0); Story Domain Code Registry established

Exit:
- Handbook Frozen ✅
- Constitution Frozen
- Stories Frozen

Success:
- Development-ready backlog.

---

## M4 Engineering Standards
Status: ⏳ Planned

Deliverables:
- Development Workflow
- Quality Gates
- Testing Strategy
- Release Strategy
- AI Collaboration
- Risk Management

Success:
- Engineering governance finalized.

---

## M5 Repository Completion
Status: ⏳ Planned

Deliverables:
- Traceability completed
- Glossary harmonized
- Cross references verified
- Documentation consistency review
- Marketplace Bible v1.0 Freeze

Success:
- Documentation repository complete.

---

## M6 Software Architecture
Status: ⏳ Planned

Deliverables:
- Backend Architecture
- Frontend Architecture
- Infrastructure Architecture
- Database Review
- API Contracts
- Event Contracts

Success:
- Technical architecture approved.

---

## M7 Development
Status: ⏳ Planned

Deliverables:
- Backend
- Frontend
- Integration
- Testing

Success:
- MVP feature complete.

---

## M8 Release
Status: ⏳ Planned

Release Path:

Alpha
↓
Closed Beta
↓
Open Beta
↓
Release Candidate
↓
Production v1.0

Success:
- Stable production release.

---

# Estimated Timeline

| Milestone | Estimate |
|-----------|----------|
| M1 | Completed |
| M2 | Completed |
| M3 | Current |
| M4 | Next |
| M5 | After M4 |
| M6 | After M5 |
| M7 | After M6 |
| M8 | Final |

---

# Ownership Matrix

| Area | Owner |
|------|-------|
| Governance | Architecture Owner |
| Foundation | Product Owner |
| ADR | Architecture Owner |
| PRDs | Product Owner |
| UX | Product Owner |
| User Stories | Product Owner |
| Engineering Standards | Architecture Owner |
| Architecture | Architecture Owner |
| Development | Development Team |
| QA | QA Team |

---

# Risk Register

| Milestone | Primary Risk | Mitigation |
|-----------|--------------|------------|
| M3 | Scope Creep | INVEST + DoR |
| M4 | Governance Drift | Reviews |
| M5 | Documentation Inconsistency | Traceability |
| M6 | Architectural Drift | ADR Process |
| M7 | Technical Debt | Quality Gates |
| M8 | Release Risk | CI/CD + Validation |

---

# Repository Completion Definition

The repository is considered complete when:

- Governance established
- Foundation Frozen
- ADRs accepted
- PRDs Frozen
- UX Frozen
- User Stories Frozen
- Engineering Standards approved
- Software Architecture approved
- Documentation validated
- Marketplace Bible v1.0 Frozen

---

# Progress Dashboard

| Layer | Progress |
|--------|----------|
| Governance | ██████████ 100% |
| Foundation | ██████████ 100% |
| Capability Architecture | ██████████ 100% |
| PRD | ██████████ 100% |
| UX | ██████████ 100% |
| User Stories | █████░░░░░ 48% |
| Engineering | ░░░░░░░░░░ 0% |
| Development | ░░░░░░░░░░ 0% |

---

# Revision History

| Version | Date | Summary |
|----------|------------|---------|
| 2.0 | 2026-07-10 | Expanded roadmap with dependency matrix, decision gates, ownership, risks, completion definition and dashboard. |
| 2.1 | 2026-07-11 | Marked the Capability Architecture milestone completed (Baseline) and opened the next milestone, Offering Pilot. No other roadmap items changed. |
| 2.2 | 2026-07-11 | Synchronized the Dependency Matrix and Progress Dashboard with the official repository hierarchy (inserted Capability Architecture; aligned layer names). No milestones, dates, status, or planning changed. |
| 2.3 | 2026-07-11 | Editorial separation: kept the Dependency Matrix as the Repository Layer Hierarchy and restored a separate Project Delivery Flow visualization (Software Architecture and Release shown as delivery milestones, not repository layers). No milestones, order, completion, dates, or planning changed. |
| 2.4 | 2026-07-11 | Recorded REPOSITORY_GOVERNANCE.md (v1.0) and USER_STORY_HANDBOOK.md (v1.0) as Baseline; added the Current Position (WE ARE HERE) marker showing the Governance phase complete and Product Story Generation next (first Story US-OFR-F01-001 — Offering Creation); updated M3 deliverable states and the progress dashboard. No milestone order, gates, dates, or ownership changed. |
| 2.5 | 2026-07-11 | Advanced the Current Position within Product Story Generation: Offering Authoring F01 (US-OFR-F01-001) and F02 (US-OFR-F02-001) recorded as Golden Baseline, F03 Offering Retirement marked Next; updated M3 deliverable states and the progress dashboard. No milestone order, gates, dates, or ownership changed. |
| 2.6 | 2026-07-11 | Marked the Offering Authoring Epic COMPLETED (F01, F02, F03 all Golden Baseline; F03 = US-OFR-F03-001); updated the Current Position (WE ARE HERE) and M3 detail to show Offering Publication as the next Epic; updated the progress dashboard. No milestone order, gates, dates, or ownership changed. |
| 2.7 | 2026-07-11 | Marked the Offering Publication Epic COMPLETED (F04 = US-OFR-F04-001, Golden Baseline, Draft → Published); updated the Current Position (WE ARE HERE) and M3 detail to show Offering Presentation as the next Epic; updated the progress dashboard. No milestone order, gates, dates, or ownership changed. |
