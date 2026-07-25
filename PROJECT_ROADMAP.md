<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      3.5
Last Updated: 2026-07-25
-->

# PROJECT ROADMAP

## Purpose

This roadmap records execution order. It does not define product, UX, Story, or implementation behaviour.

## Current Position

The Marketplace Bible v1.0 documentation baseline passed the Final Freeze Gate and is Frozen. All 50 Feature-level chains passed repository-wide validation, traceability and the Engineering Constitution are Frozen v1.0, and all 50 Generated Stories remain Not Started. Software Architecture is now the active phase.

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
| M8 — Software architecture | In Progress | Backend, frontend, infrastructure, security, and data decisions are documented |
| M9 — Development | Not Started | Prior gates pass and delivery planning begins |
| M10 — Release | Not Started | Product meets approved release criteria |

## Immediate Sequence

1. Define the V1 software architecture and required ADRs.
2. Review architecture against the Frozen Marketplace Bible and Engineering Constitution.
3. Prepare development prompts and implementation backlogs.

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
