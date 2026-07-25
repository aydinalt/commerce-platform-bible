<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.2
Last Updated: 2026-07-25
-->

# DOCUMENT DEPENDENCY MAP

## Purpose

This document records dependency direction between documentation layers. It does not redefine the authority or content owned by those layers.

## Official Documentation Flow

```text
Governance
  → Foundation
  → Capability Architecture where applicable
  → PRD
  → UX
  → Parent Story Document
  → Generated Stories
  → Engineering Standards
  → Software Architecture
  → Development
  → Testing
  → Release
```

ADRs record accepted architectural decisions that may affect one or more layers. They are referenced at the affected point in the flow and do not replace an owning layer.

## Dependency Matrix

| Layer or document type | Depends on | Owns or produces |
|---|---|---|
| Governance | Explicit Owner authority | Repository, lifecycle, review, and ADR-process rules |
| Foundation | Governance | Vision, mission, principles, manifesto, and V1 scope |
| Capability Architecture | Governance, Foundation, Accepted ADRs where applicable | Capability definitions and applicable Feature → Capability associations |
| PRD | Foundation, applicable Capability Architecture and ADRs | Product behaviour |
| UX | Frozen PRD behaviour and applicable upstream references | Experience behaviour |
| Feature Registry | Governance, ADR-0007, ADR-0009, PRD, UX | Non-Offering Story-domain Feature identity |
| Parent Story Document | User Story Handbook, Feature-ID owner, PRD, UX | Domain Epic → Feature placement and Generated Story inventory |
| Generated Story | Parent Story, Feature-ID owner, PRD, UX, applicable Capability references | Testable delivery intent |
| Engineering Standards | Governance and documentation baseline | Engineering rules |
| Software Architecture | Frozen product documentation and engineering standards | Technical design |
| Development | Approved technical design and Stories | Source code |
| Testing | Stories, requirements, and implementation | Quality evidence |
| Release | Validated implementation | Production delivery |

## Current Feature-ID Ownership

| Domain | Owner |
|---|---|
| Offering | `OFFERING_CAPABILITY_ARCHITECTURE.md` |
| Discovery | `DISCOVERY_FEATURE_REGISTRY.md` |
| Identity | `IDENTITY_FEATURE_REGISTRY.md` |
| Decision | `DECISION_FEATURE_REGISTRY.md` |
| Business | `BUSINESS_FEATURE_REGISTRY.md` |
| Platform | `PLATFORM_FEATURE_REGISTRY.md` |

## Rules

- Lower layers reference higher-layer owners and never redefine them.
- A Feature Registry identifies Features but defines no product or UX behaviour.
- A Parent Story Document owns placement and inventory, not Generated Story content.
- A Generated Story consumes upstream behaviour; it does not change it.
- Repository indexes and status reports record state but cannot confer lifecycle status.
- Frozen baselines change only through controlled superseding revisions.

## Current Gate

The Marketplace Bible v1.0 documentation baseline passed the Final Freeze Gate and is Frozen. Software Architecture is the next downstream layer; it must consume the Frozen baseline and Engineering Constitution without redefining product behaviour.

## Revision History

| Version | Date | Summary |
|---|---|---|
| 1.1 | 2026-07-25 | Reconciled the map to the official Capability Architecture layer, Feature Registries, and Parent → Generated Story structure. |
| 1.2 | 2026-07-25 | Recorded completion of the Marketplace Bible v1.0 Final Freeze Gate and opened the Software Architecture dependency step. |
