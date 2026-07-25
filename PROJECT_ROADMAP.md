<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      3.2
Last Updated: 2026-07-25
-->

# PROJECT ROADMAP

## Purpose

This roadmap records execution order. It does not define product, UX, Story, or implementation behaviour.

## Current Position

The documentation source-recovery and GitHub synchronization phases are complete. All 50 Feature-level chains passed repository-wide validation. Traceability is In Review v0.8; its Architecture Review, Final Review, Owner Approval, and separate Freeze remain before the Marketplace Bible v1.0 freeze gate.

## Milestones

| Milestone | State | Exit condition |
|---|---|---|
| M1 — Governance and Foundation | Complete | Governing documents and Foundation baselines are authoritative |
| M2 — PRD and UX | Complete for current V1 baseline | Six PRDs and the eight current V1 UX documents are Frozen |
| M3 — Story architecture and generation | Complete | 6 Parent Story Documents and 50 Generated Stories are Frozen |
| M4 — Repository reconciliation | Complete | Canonical files, indexes, registries, and ADRs are present in one repository tree |
| M5 — GitHub synchronization | Complete | Reconciled package and final corrections are verified on `main` |
| M6 — Full traceability validation | Validation complete; lifecycle in progress | Cross-tier chains pass and traceability receives explicit lifecycle decisions |
| M7 — Marketplace Bible v1.0 freeze gate | Pending | Repository-wide documentation readiness is approved and frozen where applicable |
| M8 — Software architecture | Not Started | Backend, frontend, infrastructure, security, and data decisions are documented |
| M9 — Development | Not Started | Prior gates pass and delivery planning begins |
| M10 — Release | Not Started | Product meets approved release criteria |

## Immediate Sequence

1. Complete Architecture Review and Final Review for traceability v0.8.
2. Obtain explicit Owner Approval and a separate Freeze decision.
3. Close the Engineering Constitution open review record.
4. Run the Marketplace Bible v1.0 final freeze gate.
5. Prepare development prompts and implementation backlogs.

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
