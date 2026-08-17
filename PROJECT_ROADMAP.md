<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      3.9
Last Updated: 2026-08-17
-->

# PROJECT ROADMAP

## Purpose

This roadmap records execution order. It does not define product, UX, Story, or implementation behaviour.

## Current Position

The Marketplace Bible and V1 Software Architecture baselines are Frozen.
Development is complete against the Frozen baseline: **all 50 Generated Stories
carry Delivery Status `Done`**, each matched criterion by criterion to the test
that verifies it, and fifteen increments (I0–I14) have closed with green CI.
Both outbound integrations have a chosen vendor.

`CURRENT_STATUS.md` is the operational source-state report and is more detailed
and more current than this file; this roadmap records execution order only.

**This section had said M9 was active at repository-foundation level and all 50
Stories remained Not Started.** That was true when it was written on 2026-07-25
and had been false since 2026-08-15.

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
| M9 — Development | Complete | Repository foundation passes and governed vertical increments deliver the Frozen Stories |
| M10 — Release | Not Started | Product meets approved release criteria |

**The numbering below M9 does not agree across the repository, and this roadmap
is not the document that can settle it.** Implementation records name a
Milestone 11 (the first safe vertical slice — `M11_SLICE_SCOPE_RECONCILIATION.md`,
`M11_STORY_LINK_PROPOSAL.md`) and a Milestone 12 (the I1–I14 increments, cited
throughout `CURRENT_STATUS.md`). This table has never had a row for either, and
its M10 is Release rather than anything those records describe.

`M11_SLICE_SCOPE_RECONCILIATION.md` opens by citing "the roadmap lists
`Transactional outbox event` as a Milestone 11 slice item"; no version of this
file in the repository contains that word. Whichever way the Owner resolves it —
renumbering the records or giving this table the missing rows — is a governance
decision rather than a documentation fix, and it is recorded here rather than
guessed at.

## Immediate Sequence

1. Review, approve and — if decided — freeze `docs/traceability-v1.1-candidate.md`.
2. Resolve the milestone numbering above, or record that the records are renumbered to match this table.
3. Send one real message through Postmark and ask one real question through Anthropic. Every test to date drives a stub.
4. Test with a real screen reader.
5. Decide what M10 Release requires. Nothing in the repository states its criteria, and the Stories cannot say — they describe a product, not a launch.

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
| 3.9 | 2026-08-17 | Closed M9 and brought Current Position up to date after fifteen increments; the file had said all 50 Stories were Not Started since 2026-07-25 and they have all been `Done` since 2026-08-15. Replaced an Immediate Sequence whose first item was completing I0. Recorded, rather than resolved, that implementation records name Milestones 11 and 12 which this table has no rows for. |
