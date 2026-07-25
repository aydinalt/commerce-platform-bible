<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      3.8
Last Updated: 2026-07-25
-->

# PROJECT ROADMAP

## Purpose

This roadmap records execution order. It does not define product, UX, Story, or implementation behaviour.

## Current Position

The Marketplace Bible and V1 Software Architecture baselines are Frozen. M9 is
active at repository-foundation level: the implementation backlog, delivery
sequence, and TypeScript monorepo skeleton are prepared. All 50 Generated
Stories remain Not Started.

## Milestones

| Milestone | State | Exit condition |
|---|---|---|
| M1 — Governance and Foundation | Complete | Governing documents and Foundation baselines are authoritative |
| M2 — PRD and UX | Complete for current V1 baseline | Six PRDs and the eight current V1 UX documents are Frozen |
| M3 — Story architecture and generation | Complete | 6 Parent Story Documents and 50 Generated Stories are Frozen |
| M4 — Repository reconciliation | Complete | Canonical files, indexes, registries, and ADRs are present in one repository tree |
| M5 — GitHub synchronization | Complete | Reconciled package and final corrections are verified on `main` |
| M6 — Full traceability validation | Complete | Cross-tier chains pass and traceability is Frozen v1.0 |
| M7 — Marketplace Bible v1.0 freeze gate | Complete | Repository-wide documentation readiness is approved and the baseline manifest is Frozen |
| M8 — Software architecture | Complete | ADR-0010–ADR-0014 are Accepted and the exact architecture package is Frozen v1.0 |
| M9 — Development | In Progress | Repository foundation passes and governed vertical increments deliver the Frozen Stories |
| M10 — Release | Not Started | Product meets approved release criteria |

## Immediate Sequence

1. Complete I0 CI, Prisma migration, OpenAPI, boundary-check, and web-build evidence.
2. Approve the first product-bearing vertical slice entry.
3. Implement verified User → Business → Offering → Publish → Discovery with tests and migration controls.

## Gate Rules

- Frozen documents are never edited in place.
- Repository indexes and status reports record source state; they do not confer lifecycle status.
- Architecture changes require the ADR process where applicable.
- Development does not begin merely because Story generation is complete.
- Delivery Status remains `Not Started` until delivery work actually begins.

## Risks

| Risk | Control |
|---|---|
| Uploading stale ZIP variants | Use only the reconciled repository ZIP and verify its checksum |
| Treating audit evidence as canonical product content | Keep audit packages outside the repository baseline |
| Silent modification of Frozen Stories | Compare canonical story hashes before packaging |
| Treating `UX-0007` as current V1 behaviour | Retain it as historical Draft outside V1; no validated V1 Feature chain may depend on it |
| Beginning implementation before traceability closes | Enforce M6 and M7 gates |

## Revision History

| Version | Date | Summary |
|---|---|---|
| 3.0 | 2026-07-25 | Rebased the roadmap on completed six-domain Story recovery and local repository reconciliation. |
| 3.1 | 2026-07-25 | Closed the Offering F06/F07 capability-home gap through Offering Capability Architecture Frozen v2.0. |
| 3.2 | 2026-07-25 | Recorded completion of Feature-level validation and moved traceability into lifecycle review. |
| 3.3 | 2026-07-25 | Closed M6 after explicit Owner Approval and separate Freeze of traceability v1.0. |
| 3.4 | 2026-07-25 | Closed the Engineering Constitution review record and advanced the immediate sequence to the Marketplace Bible v1.0 final freeze gate. |
| 3.5 | 2026-07-25 | Completed M7 and opened M8 Software Architecture after the Marketplace Bible v1.0 baseline Freeze. |
| 3.6 | 2026-07-25 | Accepted ADR-0010–ADR-0014 and advanced the Final Review PASS architecture package to Owner Approval. |
| 3.7 | 2026-07-25 | Recorded Owner Approval and separate Freeze of V1 Software Architecture v1.0; closed M8. |
| 3.8 | 2026-07-25 | Opened M9 with the implementation backlog, delivery sequence, and monorepo foundation; no Generated Story delivery state changed. |
