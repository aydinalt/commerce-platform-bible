# ADR Index

- **Owner:** Architecture Owner
- **Status:** Living
- **Version:** 1.1
- **Last Updated:** 2026-07-20

**Revision Note (1.1):** Registered ADR-0005 — Living Document Classification and Lifecycle Relationship (Accepted v1.0, 2026-07-20). This controlled index update adds an Accepted ADR only. The existing `Status: Living` metadata is preserved temporarily; its reconciliation to a valid lifecycle Status plus optional `Maintenance Mode: Living`, as required by Accepted ADR-0005, is a separate controlled change and is not performed by this index-entry update.

---

## Purpose

This document is the index and entry point for all Architecture Decision Records (ADRs) within the Commerce Platform Bible.

It provides a single place to discover accepted architectural decisions and their relationships to the product documentation.

The rules governing ADR creation, review, approval, lifecycle, and supersession are defined exclusively in:

`docs/governance/ADR_PROCESS.md`

This document is an index only and must never duplicate or redefine those rules.

---

## ADR Index

| ADR ID | Title | Status | Date | Related Documents |
|--------|-------|--------|------------|-----------------------------|
| [ADR-0001](ADR-0001-decision-chat-ownership.md) | Decision Chat Ownership | Accepted | 2026-07-09 | PRD-0004, V1_SCOPE |
| [ADR-0002](ADR-0002-offering-presentation-capability.md) | Offering Presentation Capability | Accepted (v1.0) | 2026-07-15 | OFFERING_CAPABILITY_ARCHITECTURE, PRD-0001, UX-0003 |
| [ADR-0003](ADR-0003-offering-feature-capability-associations.md) | Offering Authoring & Publication Feature → Capability Associations (F01–F04) | Accepted (v1.0) | 2026-07-17 | OFFERING_CAPABILITY_ARCHITECTURE, ADR-0002 |
| [ADR-0004](ADR-0004-capability-architecture-layer-recognition.md) | Capability Architecture Layer Recognition | Accepted (v1.0) | 2026-07-19 | REPOSITORY_GOVERNANCE, ENGINEERING_CONSTITUTION, OFFERING_CAPABILITY_ARCHITECTURE, ADR-0002, ADR-0003 |
| [ADR-0005](ADR-0005-living-document-classification.md) | Living Document Classification and Lifecycle Relationship | Accepted (v1.0) | 2026-07-20 | DOCUMENT_LIFECYCLE, REVIEW_PROCESS, REPOSITORY_GOVERNANCE, CURRENT_STATUS, PROJECT_ROADMAP, CHANGELOG |

---

## Principles

This index follows the governance principles of the repository:

- Single Source of Truth
- Single Information Owner
- Reference, Never Redefine

Only accepted ADRs are listed here.

Each ADR remains the authoritative source for its own architectural decision.

---

## Next Recommended Reading

- `docs/governance/ADR_PROCESS.md`
- `docs/governance/REPOSITORY_GOVERNANCE.md`
