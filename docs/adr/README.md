# ADR Index

- **Owner:** Architecture Owner
- **Status:** Living
- **Version:** 1.0
- **Last Updated:** 2026-07-19

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
