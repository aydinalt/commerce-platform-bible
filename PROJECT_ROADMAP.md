<!--
Owner:        Architecture Owner
Status:       Living
Version:      2.9
Last Updated: 2026-07-20

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

| Gate | Requirement | Current State |
|------|-------------|---------------|
| Gate 1 | Foundation Frozen | ✅ Met |
| Gate 2 | Governance process documents authoritative | 🚧 Not met — three Draft v0.1 sources |
| Gate 3 | PRD sources approved/frozen as required | 🚧 Not met — 2 Approved, 4 Draft |
| Gate 4 | UX sources Frozen | ❌ Not met — all 8 Draft |
| Gate 5 | User Story Handbook authoritative | ❌ Not met — Draft v0.9 |
| Gate 6 | User Stories Frozen | 🚧 Existing Offering records preserved; new Discovery production blocked |
| Gate 7 | Engineering Standards Approved | ⏳ Planned |
| Gate 8 | Software Architecture Approved | ⏳ Planned |
| Gate 9 | Development Begins | ⏳ Planned |
| Gate 10 | Production Release | ⏳ Planned |

---

# Milestone Overview

| Milestone | Status |
|-----------|--------|
| Foundation | ✅ Completed / Frozen |
| Repository Governance Recovery | ✅ Completed — Frozen v1.0 |
| Repository Management Reconciliation | 🚧 Current |
| Governance Process Documents | 🚧 Next |
| Capability Architecture Layer | ✅ Completed |
| Offering Capability & Story Reconciliation | ✅ Completed |
| PRD Lifecycle Recovery | ⏳ Planned — Discovery priority |
| UX Lifecycle Recovery | ⏳ Planned — Home/Discovery priority |
| M3 User Story Layer | ⏸ Partially preserved / new production blocked |
| M4 Engineering Standards | ⏳ Planned |
| M5 Repository Completion | ⏳ Planned |
| M6 Software Architecture | ⏳ Planned |
| M7 Development | ⏳ Planned |
| M8 Release | ⏳ Planned |

---

# Current Position (WE ARE HERE)

The repository is in **Source-State Recovery and Lifecycle Completion**.

Verified current state:

- `REPOSITORY_GOVERNANCE.md` — Frozen v1.0
- ADR-0004 — Accepted v1.0
- `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, `ADR_PROCESS.md` — Draft v0.1
- `USER_STORY_HANDBOOK.md` — Draft v0.9
- PRD sources — 2 Approved, 4 Draft
- UX sources — all 8 Draft
- `OFFERING_CAPABILITY_ARCHITECTURE.md` — Frozen v1.0
- Offering Capability & Story Reconciliation — complete and preserved

The prior roadmap position that Governance, PRD, UX, and Story Handbook were complete Baselines was not supported by their canonical headers. Those claims are corrected here rather than treated as authority.

**Current work:** reconcile the three repository management documents, then complete the governance process sources, Handbook, PRDs, and UX in dependency order.

**Blocked target:** `US-0002 Discovery` resumes only after `PRD-0002`, `UX-0001`, `UX-0002`, and `USER_STORY_HANDBOOK.md` become authoritative through the lawful lifecycle.

---

# Milestone Details

## M1 Documentation Foundation
Status: 🚧 Partially Complete / Source Recovery

Verified Complete:
- Repository created
- Foundation Frozen
- ADR mechanism in active use
- `REPOSITORY_GOVERNANCE.md` Frozen v1.0

Open:
- `DOCUMENT_LIFECYCLE.md` Draft v0.1
- `REVIEW_PROCESS.md` Draft v0.1
- `ADR_PROCESS.md` Draft v0.1
- Repository management reconciliation

Success condition:
- All governance source documents reach authoritative lifecycle states and Living records match canonical headers.

---

## M2 UX Layer
Status: 🔴 Reopened for Lifecycle Recovery

Canonical Source State:
- UX-0001 Home — Draft v0.1
- UX-0002 Discovery — Draft v0.1
- UX-0003 Offering Detail — Draft v0.1
- UX-0004 Compare — Draft v0.2
- UX-0005 Business Dashboard — Draft v0.1
- UX-0006 Admin Dashboard — Draft v0.2
- UX-0007 Messaging — Draft v0.2
- UX-0008 Authentication — Draft v0.2

Priority:
- Complete PRD upstream recovery first.
- Then review UX-0001 and UX-0002 for Discovery readiness.
- Complete the remaining UX specifications through review, approval, and separate freeze.

Exit:
- Every UX source has completed its lawful lifecycle; no layer-wide freeze is inferred from review history alone.

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

## Offering Capability & Story Reconciliation
Status: ✅ Completed

Objective:
- Decide and record the authoritative Offering-domain Feature → Capability associations, and reconcile the affected Golden Baseline Stories through controlled superseding revisions.

Completed Deliverables:
- ✅ ADR-0003 decision and acceptance — Accepted v1.0
  - ✅ F01 → Creation accepted and recorded
  - ✅ F03 → Lifecycle accepted and recorded
  - ✅ F04 → Lifecycle accepted and recorded
- ✅ OFFERING_CAPABILITY_ARCHITECTURE.md validation, Architecture Review, Final Review, approval, and freeze — Frozen v1.0 (authoritative Offering Capability Architecture baseline)
- ✅ F03 controlled revision validation
- ✅ F03 Architecture Review
- ✅ F03 Final Review
- ✅ F03 approval and freeze at v1.0 — US-OFR-F03-001 Frozen v1.0 Golden Baseline
- ✅ F04 controlled revision validation
- ✅ F04 Architecture Review
- ✅ F04 Final Review
- ✅ F04 approval and freeze at v1.0 — US-OFR-F04-001 Frozen v1.0 Golden Baseline
- ✅ Epic–Capability conflict assessment — verdict **NO NORMATIVE CONFLICT**
- ✅ Offering architecture and Story reconciliation package closure

Preserved / Carried Forward:
- ⏸ F02 — Offering Editing: capability home **Not Yet Decided**, decision status **Deferred**; not recorded as an association (Deferred is a decision status, not a Capability). A future architecture decision is required.
- 📌 Optional `USER_STORY_HANDBOOK.md` terminology clarification (architectural Capability vs Epic delivery grouping) — non-blocking future maintenance.
- 📌 F05 → Presentation remains accepted and recorded under ADR-0002.
- 📌 The F03 and F04 v0.1 Frozen Golden Baselines remain preserved as historical superseded baselines.
- 📌 No traceability.md update required — Feature → Capability associations are owned by OFFERING_CAPABILITY_ARCHITECTURE.md, not by traceability.md.

Success:
- Authoritative Feature → Capability associations recorded in a Frozen baseline, with affected Stories reconciled and no Story behaviour, Acceptance Criteria, BDD, scope, dependencies, Feature IDs, Feature names, PRD/UX meaning, Story Size, Delivery Status, or TODOs changed.

---

## Offering Pilot
Status: ⏸ Paused Pending Upstream Recovery

Objective:
- Resume only after the PRD and UX source layers complete their lawful lifecycles. Existing Offering records are preserved; no new pilot claim is advanced during recovery.

Deliverables:
- TODO — to be defined as the Offering Pilot is planned.

Success:
- Offering piloted end-to-end across the baselined layers.

---

## M3 User Story Layer
Status: ⏸ Existing Offering Records Preserved / New Production Blocked

Canonical Inputs:
- `USER_STORY_HANDBOOK.md` — Draft v0.9
- `ENGINEERING_CONSTITUTION.md` — Draft v1.3
- `REPOSITORY_GOVERNANCE.md` — Frozen v1.0
- `OFFERING_CAPABILITY_ARCHITECTURE.md` — Frozen v1.0

Preserved Work:
- Existing US-0001 Offering records remain present.
- F03 and F04 reconciliation remains complete.
- F02 capability association remains Deferred / Not Yet Decided.

Blocked Next Target:
- `US-0002 Discovery` Story Architecture is blocked by Draft `PRD-0002`, Draft `UX-0001`, Draft `UX-0002`, and Draft `USER_STORY_HANDBOOK.md`.

Recovery Sequence:
1. Governance process documents
2. User Story Handbook
3. PRD lifecycle completion
4. UX lifecycle completion
5. Discovery readiness reassessment

Exit:
- Handbook authoritative
- Required PRD and UX inputs authoritative
- Story documents reviewed and frozen according to the owning lifecycle process

Success:
- Development-ready backlog built only from authoritative upstream sources.

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

| Sequence | Work |
|----------|------|
| Current | Repository management reconciliation |
| Next | Governance process document lifecycle completion |
| Then | USER_STORY_HANDBOOK lifecycle completion |
| Then | PRD lifecycle recovery — Discovery priority |
| Then | UX lifecycle recovery — Home/Discovery priority |
| Then | US-0002 Discovery readiness and production |
| Later | Engineering Standards → Repository Completion → Software Architecture → Development → Release |

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

| Area | Primary Risk | Mitigation |
|------|--------------|------------|
| Repository Management | Living records override canonical headers | Source-header reconciliation and correction notices |
| Governance | Process owners remain Draft | Complete lifecycle before claiming governance completion |
| PRD | Layer-wide Frozen claim masks mixed source states | Review each PRD; prioritize Discovery |
| UX | All source files remain Draft | Recover after PRD authority is established |
| User Stories | Stories produced from non-authoritative upstream sources | Block new production until readiness gate passes |
| Capability Architecture | F02 association undecided | Future ADR / explicit architecture decision |
| Engineering | Governance drift | Reviews and explicit gates |
| Development | Technical debt from premature implementation | No development before authoritative upstream documentation |

---

# Repository Completion Definition

The repository is considered complete when:

- Repository Governance Frozen
- Governance process documents authoritative
- Foundation Frozen
- ADRs accepted where required
- Every PRD source authoritative and frozen where the release requires it
- Every UX source authoritative and frozen where the release requires it
- User Story Handbook authoritative
- User Stories Frozen
- Engineering Standards approved
- Software Architecture approved
- Living management documents match canonical source headers
- Documentation validated
- Marketplace Bible v1.0 Frozen

---

# Progress Dashboard

Percentage reporting is suspended during source-state recovery. Verified lifecycle distribution replaces estimated progress.

| Layer / Group | Verified State |
|---------------|----------------|
| Repository Governance | Frozen v1.0 |
| Governance Process Documents | 3 Draft v0.1 |
| Foundation | Frozen |
| Capability Architecture | Frozen v1.0 |
| ADRs | 4 Accepted |
| PRDs | 2 Approved / 4 Draft |
| UX | 8 Draft |
| User Story Handbook | Draft v0.9 |
| Engineering Constitution | Draft v1.3 |
| New Discovery Story Production | Blocked |

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
| 2.8 | 2026-07-18 | Recorded the **Offering Capability & Story Reconciliation** milestone as Completed: ADR-0003 decision and acceptance (F01 → Creation, F03 → Lifecycle, F04 → Lifecycle); OFFERING_CAPABILITY_ARCHITECTURE.md validation, review, approval, and freeze at v1.0; F03 and F04 controlled-revision validation, Architecture Review, Final Review, approval, and freeze at v1.0; Epic–Capability conflict assessment with verdict NO NORMATIVE CONFLICT; package closure. Preserved F02 as Deferred / Not Yet Decided, the optional USER_STORY_HANDBOOK terminology clarification as non-blocking future maintenance, F05 → Presentation under ADR-0002, the preserved v0.1 Frozen baselines, and the absence of any required traceability.md change. Updated the Current Position and M3 detail to show the next Story Document in the established `US-0001 … US-0006` sequence, and refreshed the progress dashboard. No implementation or development work marked complete; no unrelated Story marked complete; no milestone order, gates, dates, or ownership changed. |
| 2.9 | 2026-07-20 | Repository source-state recovery revision: corrected unsupported Governance/PRD/UX/Handbook completion claims; recorded REPOSITORY_GOVERNANCE Frozen v1.0 and ADR-0004 Accepted v1.0; introduced recovery gates and dependency order; paused new US-0002 production until canonical upstream sources become authoritative; and suspended misleading percentage reporting. No product, UX, Story, Capability, Feature ID, or implementation decision changed. |
