<!--
Owner:        Architecture Owner
Status:       Living
Version:      1.0
Last Updated: 2026-07-10

Purpose:
Provides a single authoritative index of all repository documentation.

Authority:
Architecture Owner / Product Owner
-->

# REPOSITORY INDEX

## Repository Structure

```
/
├── README.md
├── CURRENT_STATUS.md
├── PROJECT_ROADMAP.md
├── CHANGELOG.md
├── REPOSITORY_INDEX.md
├── DOCUMENT_DEPENDENCY_MAP.md
└── docs/
```

---

# Root Documents

| Document | Purpose | Status |
|----------|---------|--------|
| README.md | Repository entry point | Living |
| CURRENT_STATUS.md | Operational status | Living |
| PROJECT_ROADMAP.md | Strategic roadmap | Living |
| CHANGELOG.md | Repository history | Living |
| REPOSITORY_INDEX.md | Documentation index | Living |
| DOCUMENT_DEPENDENCY_MAP.md | Dependency map | Planned |

---

# Governance

| Document | Lifecycle | Owner |
|----------|-----------|-------|
| REPOSITORY_GOVERNANCE.md | Living | Architecture Owner |
| DOCUMENT_LIFECYCLE.md | Living | Architecture Owner |
| REVIEW_PROCESS.md | Living | Architecture Owner |
| ADR_PROCESS.md | Living | Architecture Owner |
| docs/adr/README.md | Living | Architecture Owner |

---

# Foundation

| Document | Lifecycle |
|----------|-----------|
| VISION.md | Frozen |
| MISSION.md | Frozen |
| PRODUCT_MANIFESTO.md | Frozen |
| PRODUCT_PRINCIPLES.md | Frozen |
| V1_SCOPE.md | Frozen |

---

# Architecture Decision Records

| ADR | Status |
|-----|--------|
| ADR-0001 Decision Chat Ownership | Accepted |

---

# PRD Layer

| Document | Status |
|----------|--------|
| PRD-0001 Offering | Frozen |
| PRD-0002 Discovery | Frozen |
| PRD-0003 Identity | Frozen |
| PRD-0004 Decision | Frozen |
| PRD-0005 Business | Frozen |
| PRD-0006 Platform | Frozen |

---

# UX Layer

| Document | Status |
|----------|--------|
| UX-0001 Home | Frozen |
| UX-0002 Discovery | Frozen |
| UX-0003 Offering Detail | Frozen |
| UX-0004 Compare | Frozen |
| UX-0005 Business Dashboard | Frozen |
| UX-0006 Admin Dashboard | Frozen |
| UX-0007 Messaging | Frozen |
| UX-0008 Authentication | Frozen |

---

# User Story Layer

| Document | Status |
|----------|--------|
| USER_STORY_HANDBOOK.md | Draft |
| ENGINEERING_CONSTITUTION.md | Draft |
| US-0001 – US-0006 | Planned |

---

# Repository Health Summary

| Layer | State |
|--------|-------|
| Governance | Living |
| Foundation | Frozen |
| ADR | Accepted |
| PRD | Frozen |
| UX | Frozen |
| User Story | In Progress |
| Development | Not Started |

---

# Ownership Principles

- Every document has exactly one authoritative owner.
- Lower layers reference higher layers; they never redefine them.
- Frozen documents change only through versioned superseding revisions.
- Living documents are updated as repository state evolves.

---

# Revision History

| Version | Date | Summary |
|----------|------------|---------|
| 1.0 | 2026-07-10 | Initial repository index. |
