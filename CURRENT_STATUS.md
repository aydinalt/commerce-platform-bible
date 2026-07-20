<!--
Owner:        Architecture Owner
Status:       Living
Version:      1.8
Last Updated: 2026-07-20

Purpose:
Provides the authoritative operational status of the Commerce Platform Bible repository.

Authority:
Architecture Owner / Product Owner

Governance:
This document is Living and must be updated whenever a milestone,
layer state, or major architectural decision changes.
-->

# CURRENT STATUS

## Repository Overview

| Item | Value |
|------|-------|
| Repository | Commerce Platform Bible |
| Repository Health | 🟠 Recovery Required |
| Overall Status | 🟢 Active |
| Current Phase | Repository Source Recovery |

---

## Current Milestone

**Repository Source Recovery and Lifecycle Completion**

**Status:** 🚧 In Progress

**Objective**

Reconcile repository management records to canonical source headers, complete the remaining governance and upstream document lifecycles lawfully, and remove the blockers that currently prevent `US-0002 Discovery` Story Architecture.

---

## Layer Status

| Layer / Source Group | Canonical Lifecycle State | Current State |
|----------------------|---------------------------|---------------|
| Repository Governance | Frozen | ✅ `REPOSITORY_GOVERNANCE.md` Frozen v1.0 |
| Governance Process Documents | Draft | 🚧 `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, `ADR_PROCESS.md` — Draft v0.1 |
| Foundation | Frozen | ✅ Complete |
| Capability Architecture | Frozen | ✅ `OFFERING_CAPABILITY_ARCHITECTURE.md` Frozen v1.0 |
| ADR | Accepted | ✅ ADR-0001 through ADR-0004 Accepted |
| PRD | Mixed | 🚧 PRD-0001 Approved v1.1; PRD-0003 Approved v1.0; PRD-0002, PRD-0004, PRD-0005, PRD-0006 remain Draft |
| UX | Draft | 🚧 UX-0001 through UX-0008 remain Draft |
| User Story Handbook | Draft | 🚧 `USER_STORY_HANDBOOK.md` Draft v0.9 |
| Engineering Constitution | Draft | 🚧 `ENGINEERING_CONSTITUTION.md` Draft v1.3 |
| Existing Offering Story Records | Preserved | 📌 Existing Offering records remain present; no new Discovery Story production proceeds until upstream recovery completes |
| Development Planning | Not Started | ⏳ Pending |
| Development | Not Started | ⏳ Pending |

Canonical source headers govern these states. Earlier layer-wide Baseline/Frozen summaries do not confer lifecycle status and are superseded by this reconciliation.

---

## Offering Capability Architecture

| Item | Value |
|------|-------|
| OFFERING_CAPABILITY_ARCHITECTURE.md | 🟢 Frozen v1.0 |
| Role | Authoritative Offering Capability Architecture baseline |
| Feature → Capability associations | Owned and recorded here (authoritative Feature Registry) |

**Recorded Feature → Capability associations**

| Feature | Capability | Decided by |
|---------|------------|------------|
| F01 — Offering Creation | Creation | ADR-0003 (Accepted v1.0) |
| F03 — Offering Retirement | Lifecycle | ADR-0003 (Accepted v1.0) |
| F04 — Offering Publication | Lifecycle | ADR-0003 (Accepted v1.0) |
| F05 — Full Offering Detail Presentation | Presentation | ADR-0002 (Accepted v1.0) |

**F02 — Offering Editing:** capability home **Not Yet Decided**; decision status **Deferred**. F02 is not recorded as an association. Deferred is a decision status, not a Capability.

---

## Offering Reconciliation Status

| Item | State |
|------|-------|
| Offering Capability + F03/F04 reconciliation | ✅ Completed and closed |
| OFFERING_CAPABILITY_ARCHITECTURE.md | ✅ Frozen v1.0 |
| ADR-0003 | ✅ Accepted v1.0 |
| US-OFR-F03-001 — Offering Retirement | ✅ Frozen v1.0 Golden Baseline |
| US-OFR-F04-001 — Offering Publication | ✅ Frozen v1.0 Golden Baseline |
| F02 association | ⏸ Deferred / Not Yet Decided |
| Epic–Capability assessment | ✅ NO NORMATIVE CONFLICT — no active blocker |
| traceability.md update from this reconciliation | ✅ None pending — Feature → Capability is owned by OFFERING_CAPABILITY_ARCHITECTURE.md, not by traceability.md |

The F03 and F04 v1.0 documents are the current authoritative Golden Baselines. Their previous v0.1 Frozen Golden Baselines remain preserved as historical superseded baselines. No Story behaviour, Acceptance Criteria, BDD, scope, dependencies, Feature IDs, Feature names, PRD/UX meaning, Story Size, Delivery Status, or TODOs changed during the reconciliation. The optional `USER_STORY_HANDBOOK.md` terminology clarification is non-blocking future maintenance.

---

## Verified Completed Work

### ✅ Foundation

- VISION.md
- MISSION.md
- PRODUCT_MANIFESTO.md
- PRODUCT_PRINCIPLES.md
- V1_SCOPE.md

### ✅ Capability Architecture and Offering Reconciliation

- `OFFERING_CAPABILITY_ARCHITECTURE.md` — Frozen v1.0
- ADR-0002 — Accepted v1.0
- ADR-0003 — Accepted v1.0
- F01 → Creation, F03 → Lifecycle, F04 → Lifecycle, F05 → Presentation recorded
- F02 remains Deferred / Not Yet Decided
- US-OFR-F03-001 and US-OFR-F04-001 reconciled as Frozen v1.0 Golden Baselines
- Epic–Capability assessment — NO NORMATIVE CONFLICT

### ✅ Repository Governance Recovery

- ADR-0004 — Capability Architecture Layer Recognition — Accepted v1.0
- `REPOSITORY_GOVERNANCE.md` — formal review → approval → freeze — Frozen v1.0
- Repository management-document reconciliation opened as an immediate follow-up

### ⚠️ Previously Reported as Complete but Not Supported by Canonical Headers

- PRD layer — not Frozen as a layer; current sources are mixed Approved/Draft
- UX layer — not Frozen; all current UX source files are Draft
- `USER_STORY_HANDBOOK.md` — not Baseline v1.0; current source is Draft v0.9
- Governance process set — not complete; three process documents remain Draft v0.1

---

## Story Generation Progress

> **Recovery boundary:** Existing Offering Story records are preserved as repository history. New Story Architecture, including `US-0002 Discovery`, is blocked until its canonical upstream PRD, UX, Handbook, and governance inputs complete the required lifecycle.

**Offering Authoring (US-0001 Offering) — Epic Status: ✅ 100% Complete**

| Feature | Story | State |
|---------|-------|-------|
| F01 — Offering Creation | US-OFR-F01-001 | ✅ Golden Baseline |
| F02 — Offering Editing | US-OFR-F02-001 | ✅ Golden Baseline |
| F03 — Offering Retirement | US-OFR-F03-001 | ✅ Golden Baseline (Frozen v1.0) |

**Offering Publication (US-0001 Offering) — Epic Status: ✅ 100% Complete**

| Feature | Story | State |
|---------|-------|-------|
| F04 — Offering Publication | US-OFR-F04-001 | ✅ Golden Baseline (Frozen v1.0) |

**Offering Presentation (US-0001 Offering) — Epic Status: ✅ 100% Complete**

| Feature | Story | State |
|---------|-------|-------|
| F05 — Full Offering Detail Presentation | US-OFR-F05-001 | ✅ Golden Baseline |

Next Story target after recovery: **US-0002 Discovery**. Production remains blocked until the canonical upstream PRD, UX, Handbook, and governance inputs become authoritative. See `PROJECT_ROADMAP.md`.

---

## Current Work

### Active Documents

- `CURRENT_STATUS.md` — source-state reconciliation
- `PROJECT_ROADMAP.md` — recovery roadmap alignment
- `CHANGELOG.md` — historical correction annotation
- `DOCUMENT_LIFECYCLE.md` — Draft v0.1, next governance-process lifecycle target
- `REVIEW_PROCESS.md` — Draft v0.1
- `ADR_PROCESS.md` — Draft v0.1

### Current Focus

Complete the repository source-state reconciliation required by Frozen `REPOSITORY_GOVERNANCE.md` §12. Then complete the remaining governance process documents, `USER_STORY_HANDBOOK.md`, the PRD lifecycle, and the UX lifecycle before reopening Discovery Story Architecture.

`US-0002 Discovery` is not abandoned; it is intentionally blocked until the canonical upstream package is lawful and internally consistent.

---

## Next Deliverables

1. Commit the reconciled `CURRENT_STATUS.md`, `PROJECT_ROADMAP.md`, and `CHANGELOG.md`.
2. Complete `DOCUMENT_LIFECYCLE.md` through Architecture Review → Final Review → Owner Approval → separate Freeze.
3. Complete `REVIEW_PROCESS.md` and `ADR_PROCESS.md` through the same lawful lifecycle.
4. Complete `USER_STORY_HANDBOOK.md` from Draft v0.9 through review, approval, and separate freeze.
5. Complete the PRD source lifecycles; prioritize `PRD-0002-discovery.md` for Discovery readiness.
6. Complete the UX source lifecycles; prioritize `UX-0001-home.md` and `UX-0002-discovery.md`.
7. Re-run the `US-0002 Discovery` Story Architecture Readiness Assessment.

Non-blocking future maintenance:

- Future architecture decision for the F02 capability home (currently Deferred / Not Yet Decided)
- Basic Analytics ownership
- Moderation workflow completion
- Hidden / Archived Offering behaviour

---

## Architecture Status

| Area | Canonical Status |
|------|------------------|
| Foundation | 🟢 Frozen |
| Capability Architecture | 🟢 Frozen v1.0 |
| Repository Governance | 🟢 Frozen v1.0 |
| Governance Process Documents | 🟠 Draft v0.1 |
| ADRs | 🟢 ADR-0001 through ADR-0004 Accepted |
| PRDs | 🟠 Mixed — 2 Approved, 4 Draft |
| UX | 🔴 All 8 source documents Draft |
| User Story Handbook | 🟠 Draft v0.9 |
| Engineering Constitution | 🟠 Draft v1.3 |

**Active documentation blocker:** `US-0002 Discovery` cannot lawfully proceed while `PRD-0002-discovery.md`, `UX-0001-home.md`, `UX-0002-discovery.md`, and `USER_STORY_HANDBOOK.md` remain Draft. Governance process documents also remain Draft and are part of the recovery sequence.

---

## Documentation Progress

Percentage reporting is temporarily suspended during source-state recovery because the previous percentages treated unsupported lifecycle claims as completed work.

| Document Group | Verified State |
|----------------|----------------|
| Repository Governance | Frozen v1.0 |
| Governance Process Documents | 3 Draft v0.1 |
| Foundation | Frozen |
| Capability Architecture | Frozen v1.0 |
| ADR | 4 Accepted |
| PRD | 2 Approved, 4 Draft |
| UX | 8 Draft |
| User Story Handbook | Draft v0.9 |
| Engineering Constitution | Draft v1.3 |
| New Discovery Story Production | Blocked pending upstream lifecycle completion |

A new completion percentage will be established only after the canonical source inventory is reconciled and the recovery sequence is complete.

---

## Active ADRs

| ADR | Status |
|-----|--------|
| ADR-0001 — Decision Chat Ownership | Accepted |
| ADR-0002 — Offering Presentation Capability | Accepted v1.0 |
| ADR-0003 — Offering Authoring & Publication Feature → Capability Associations (F01–F04) | Accepted v1.0 |
| ADR-0004 — Capability Architecture Layer Recognition | Accepted v1.0 |

---

## Active Risks

| Risk | State | Mitigation |
|------|-------|------------|
| Repository summaries previously overrode source headers | Active recovery | Reconcile all Living management documents to canonical sources |
| Governance process documents remain Draft | Active | Complete lifecycle before further governance closure claims |
| PRD layer previously reported Frozen despite mixed sources | Active | Review each PRD source; prioritize PRD-0002 |
| UX layer previously reported Frozen although all sources are Draft | Active | Review all UX sources; prioritize UX-0001 and UX-0002 |
| USER_STORY_HANDBOOK previously reported Baseline v1.0 | Active | Complete lawful lifecycle from Draft v0.9 |
| F02 capability home | Deferred | Future ADR / architecture decision |
| Basic Analytics ownership | Open | Assign owning PRD/capability |
| Moderation and Hidden/Archived behaviour | Open | Resolve in owning PRDs before downstream freeze |

---

## Blocking Issues

### `US-0002 Discovery` upstream blocker

The following canonical sources are not authoritative baselines:

- `PRD-0002-discovery.md` — Draft v0.1
- `UX-0001-home.md` — Draft v0.1
- `UX-0002-discovery.md` — Draft v0.1
- `USER_STORY_HANDBOOK.md` — Draft v0.9

Discovery Story Architecture remains blocked until these documents complete their lawful lifecycle. This is a documentation-authority blocker, not a product redesign.

---

## Repository Statistics

| Source Group | Canonical Distribution |
|--------------|------------------------|
| Repository Governance | 1 Frozen v1.0 |
| Governance Process Documents | 3 Draft v0.1 |
| ADRs | 4 Accepted |
| Foundation Documents | 5 Frozen |
| Capability Architecture | 1 principal Offering document Frozen v1.0 |
| PRDs | 2 Approved / 4 Draft |
| UX Specifications | 8 Draft |
| User Story Handbook | 1 Draft v0.9 |
| Engineering Constitution | 1 Draft v1.3 |
| Existing Offering Story Records | 5 preserved records; not re-lifecycled in this reconciliation |

---

## Next Architecture Step

**Repository Source Recovery Sequence**

Repository management reconciliation

↓

Governance process documents (`DOCUMENT_LIFECYCLE`, `REVIEW_PROCESS`, `ADR_PROCESS`)

↓

`USER_STORY_HANDBOOK.md`

↓

PRD lifecycle completion — Discovery priority

↓

UX lifecycle completion — Home and Discovery priority

↓

`US-0002 Discovery` Story Architecture Readiness Assessment

No new Discovery Feature ID, Capability association, product behaviour, UX behaviour, or Story behaviour is decided by this recovery sequence.

---

## Repository Principles

- Documentation First Development
- Architecture Before Implementation
- Frozen Before Development
- Single Information Owner
- Reference Never Redefine
- AI Assists — Humans Decide

---

## Revision History

| Version | Date | Summary |
|----------|------------|---------|
| 1.0 | 2026-07-10 | Initial CURRENT_STATUS document. |
| 1.1 | 2026-07-11 | Recorded Capability Architecture Baseline; added its completed review stages and updated repository status. |
| 1.2 | 2026-07-11 | Recorded USER_STORY_HANDBOOK.md (v1.0) and REPOSITORY_GOVERNANCE.md (v1.0) as Baseline; Governance phase complete; next phase Product Story Generation (first Story US-OFR-F01-001 — Offering Creation). |
| 1.3 | 2026-07-11 | Recorded US-OFR-F02-001 — Offering Editing as Golden Baseline; marked Offering Authoring progress (F01, F02 Golden Baseline; F03 next active); updated Current Focus to Offering Retirement (F03) and refreshed progress and statistics. |
| 1.4 | 2026-07-11 | Recorded US-OFR-F03-001 — Offering Retirement as Golden Baseline; Offering Authoring Epic 100% complete (F01, F02, F03 Golden Baseline); updated Current Focus and Next Deliverables to the next Epic (Offering Publication); refreshed progress and statistics. |
| 1.5 | 2026-07-11 | Recorded US-OFR-F04-001 — Offering Publication as Golden Baseline; Offering Publication Epic 100% complete (F04, Draft → Published); advanced Current Focus and Next Deliverables to the next Epic (Offering Presentation); refreshed progress and statistics. |
| 1.6 | 2026-07-18 | Recorded the completed Offering Capability and Story reconciliation: OFFERING_CAPABILITY_ARCHITECTURE.md Frozen v1.0; ADR-0002 and ADR-0003 added to Active ADRs (both Accepted); recorded associations F01 → Creation, F03 → Lifecycle, F04 → Lifecycle (ADR-0003) and F05 → Presentation (ADR-0002); F02 recorded as Deferred / Not Yet Decided and not mapped; US-OFR-F03-001 and US-OFR-F04-001 recorded as Frozen v1.0 Golden Baselines with their v0.1 baselines preserved historically; Epic–Capability assessment recorded as NO NORMATIVE CONFLICT with no active blocker; no traceability update pending from this reconciliation; refreshed statistics and the next documentation-production target. No Story behaviour, Acceptance Criteria, BDD, scope, dependencies, Feature IDs, Feature names, PRD/UX meaning, Story Size, Delivery Status, or TODOs changed. |
| 1.7 | 2026-07-18 | Cross-document consistency corrections only: aligned the Documentation Progress User Stories value with PROJECT_ROADMAP.md (12% → 55%); restated the Milestone 3 Objective as completing the remaining User Story documents (the Story governance layer is already Baseline v1.0); and restated Next Deliverable 3 as completing the remaining Story Documents US-0002 through US-0006, since US-0001 Offering is complete. No architecture, ADR, Story, milestone, lifecycle outcome, Feature → Capability association, F02 status, or estimated completion percentage changed. |
| 1.8 | 2026-07-20 | Repository source-state reconciliation: recorded REPOSITORY_GOVERNANCE.md Frozen v1.0 and ADR-0004 Accepted v1.0; corrected unsupported Baseline/Frozen claims for USER_STORY_HANDBOOK, governance process documents, PRDs, and UX; recorded canonical PRD and UX distributions; suspended misleading completion percentages; and marked US-0002 Discovery blocked pending lawful upstream lifecycle completion. No product, UX, Story, Capability, Feature ID, or implementation decision changed. |
