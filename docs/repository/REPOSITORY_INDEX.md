<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.8
Last Updated: 2026-07-25
-->

# REPOSITORY INDEX

## Root Documents

| Document | Purpose |
|---|---|
| `README.md` | Repository entry point |
| `CURRENT_STATUS.md` | Current operational source-state report |
| `PROJECT_ROADMAP.md` | Milestones and execution gates |
| `CHANGELOG.md` | Repository change history |

## Repository Management

| Document | Purpose |
|---|---|
| `docs/repository/REPOSITORY_INDEX.md` | Canonical document inventory |
| `docs/repository/DOCUMENT_DEPENDENCY_MAP.md` | Documentation dependency direction |
| `docs/traceability.md` | Frozen v1.0 cross-tier traceability baseline |

## Governance and Standards

| Path | State |
|---|---|
| `docs/governance/REPOSITORY_GOVERNANCE.md` | Frozen v1.0 |
| `docs/governance/DOCUMENT_LIFECYCLE.md` | Frozen v1.0 |
| `docs/governance/REVIEW_PROCESS.md` | Frozen v1.0 |
| `docs/governance/ADR_PROCESS.md` | Frozen v1.0 |
| `docs/user-stories/USER_STORY_HANDBOOK.md` | Frozen v1.0 |
| `docs/engineering/ENGINEERING_CONSTITUTION.md` | Frozen v1.0 |

## Review Evidence

| Path | Purpose |
|---|---|
| `docs/reviews/TRACEABILITY_ARCHITECTURE_AND_FINAL_REVIEW_2026-07-25.md` | Repository-wide Feature-level traceability validation |
| `docs/reviews/ENGINEERING_CONSTITUTION_REVIEW_CLOSURE_2026-07-25.md` | Engineering Constitution repository-current closure validation and lifecycle evidence |
| `docs/reviews/MARKETPLACE_BIBLE_V1_FINAL_FREEZE_GATE_2026-07-25.md` | Repository-wide Final Freeze Gate evidence |
| `docs/reviews/V1_SOFTWARE_ARCHITECTURE_REVIEW_2026-07-25.md` | V1 Software Architecture formal Architecture Review evidence |
| `docs/reviews/V1_SOFTWARE_ARCHITECTURE_FINAL_REVIEW_2026-07-25.md` | V1 Software Architecture Final Review and ADR acceptance evidence |
| `docs/reviews/V1_SOFTWARE_ARCHITECTURE_OWNER_APPROVAL_AND_FREEZE_2026-07-25.md` | Exact v0.2 Owner Approval and separate V1 Software Architecture v1.0 Freeze evidence |

## Release Baseline

| Path | State |
|---|---|
| `docs/releases/MARKETPLACE_BIBLE_V1_BASELINE.md` | Frozen v1.0 |

## Foundation

`docs/foundation/` contains five Frozen documents: Vision, Mission, Product Manifesto, Product Principles, and V1 Scope.

## Architecture Decisions

`docs/adr/` contains Accepted ADR-0001 through ADR-0014. `docs/adr/README.md` is the authoritative ADR index.

## V1 Software Architecture

`docs/software-architecture/` contains the Owner Approved and Frozen V1
Software Architecture v1.0 baseline.

## Implementation

| Path | Purpose |
|---|---|
| `docs/implementation/IMPLEMENTATION_BACKLOG.md` | Orders all 50 Frozen Generated Stories into delivery increments |
| `docs/implementation/DELIVERY_SEQUENCE.md` | Defines increment gates and the first vertical slice |
| `apps/` | Independently deployable Web, API, and Worker processes |
| `packages/` | Shared technical contracts, configuration, observability, and test utilities |
| `modules/` | Reserved product-domain ownership boundaries |

## PRD Layer

| Document | State |
|---|---|
| PRD-0001 Offering | Frozen v3.1 |
| PRD-0002 Discovery | Frozen v2.1 |
| PRD-0003 Identity | Frozen v3.1 |
| PRD-0004 Decision | Frozen v1.2 |
| PRD-0005 Business | Frozen v1.3 |
| PRD-0006 Platform | Frozen v2.1 |

## UX Layer

| Document | State |
|---|---|
| UX-0001 Home | Frozen v1.0 |
| UX-0002 Discovery | Frozen v1.0 |
| UX-0003 Offering Detail | Frozen v1.0 |
| UX-0004 Compare | Frozen v1.0 |
| UX-0005 Business Dashboard | Frozen v1.0 |
| UX-0006 Admin Dashboard | Frozen v1.0 |
| UX-0007 Messaging | Draft v0.2; outside the current Frozen V1 baseline |
| UX-0008 Authentication | Frozen v1.0 |
| UX-0009 Decision Flow | Frozen v1.0 |

## Capability and Feature-ID Ownership

| Path | Scope | State |
|---|---|---|
| `docs/capabilities/OFFERING_CAPABILITY_ARCHITECTURE.md` | Offering Feature IDs and applicable Feature → Capability associations | Frozen v2.0 |
| `docs/user-stories/architecture/DISCOVERY_FEATURE_REGISTRY.md` | Discovery Feature IDs | Frozen v1.0 |
| `docs/user-stories/architecture/IDENTITY_FEATURE_REGISTRY.md` | Identity Feature IDs | Frozen v1.0 |
| `docs/user-stories/architecture/DECISION_FEATURE_REGISTRY.md` | Decision Feature IDs | Frozen v1.0 |
| `docs/user-stories/architecture/BUSINESS_FEATURE_REGISTRY.md` | Business Feature IDs | Frozen v1.0 |
| `docs/user-stories/architecture/PLATFORM_FEATURE_REGISTRY.md` | Platform Feature IDs | Frozen v1.0 |

## User Story Layer

| Domain | Parent path | Generated Story path | Count | State |
|---|---|---|---:|---|
| Offering | `docs/user-stories/architecture/US-0001-offering.md` | `docs/user-stories/offering/` | 7 | Frozen |
| Discovery | `docs/user-stories/architecture/US-0002-discovery.md` | `docs/user-stories/discovery/` | 10 | Frozen |
| Identity | `docs/user-stories/architecture/US-0003-identity.md` | `docs/user-stories/identity/` | 9 | Frozen |
| Decision | `docs/user-stories/architecture/US-0004-decision.md` | `docs/user-stories/decision/` | 7 | Frozen |
| Business | `docs/user-stories/architecture/US-0005-business.md` | `docs/user-stories/business/` | 7 | Frozen |
| Platform | `docs/user-stories/architecture/US-0006-platform.md` | `docs/user-stories/platform/` | 10 | Frozen |

## Repository Health

| Check | Result |
|---|---|
| Parent Story Documents | 6 present |
| Generated Stories | 50 present |
| Current Frozen Story total | 56 |
| Feature Registries | 5 present; Offering uses Capability Architecture |
| ADR sequence | ADR-0001–ADR-0014 present and Accepted |
| Development | M9 foundation In Progress; all 50 Generated Stories remain Not Started |

## Revision History

| Version | Date | Summary |
|---|---|---|
| 1.1 | 2026-07-25 | Reconciled the index to recovered Frozen PRD, UX, registry, ADR, and six-domain Story baselines. |
| 1.2 | 2026-07-25 | Recorded Offering Capability Architecture Frozen v2.0 and authoritative F06/F07 → Handoff Enablement mappings. |
| 1.3 | 2026-07-25 | Recorded traceability as Frozen v1.0 after completed validation, Owner Approval, and separate Freeze. |
| 1.4 | 2026-07-25 | Recorded Engineering Constitution as Frozen v1.0 and added its review-closure evidence. |
| 1.5 | 2026-07-25 | Added the Frozen Marketplace Bible v1.0 baseline manifest and Final Freeze Gate evidence. |
| 1.6 | 2026-07-25 | Registered Accepted ADR-0010–ADR-0014 and the V1 Software Architecture Final Review evidence. |
| 1.7 | 2026-07-25 | Registered Owner Approval and the separate V1 Software Architecture v1.0 Freeze. |
| 1.8 | 2026-07-25 | Registered the implementation backlog, delivery sequence, and TypeScript monorepo foundation. |
