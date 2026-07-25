# V1 Software Architecture

- **Owner:** Architecture Owner
- **Status:** In Review
- **Version:** 0.2
- **Last Updated:** 2026-07-25
- **Baseline:** Marketplace Bible v1.0 Frozen baseline

## Purpose

This directory translates the Frozen product baseline into an implementation-ready V1 technical design without redefining product behaviour.

## Document Set

| Document | Ownership |
|---|---|
| `V1_SOFTWARE_ARCHITECTURE.md` | System shape, runtime boundaries, cross-cutting flows |
| `V1_BACKEND_ARCHITECTURE.md` | API, modules, commands, queries, jobs and integrations |
| `V1_FRONTEND_ARCHITECTURE.md` | Web applications, route groups, rendering, state and accessibility |
| `V1_DATA_ARCHITECTURE.md` | Data ownership, logical schema, search projection and migrations |
| `V1_SECURITY_ARCHITECTURE.md` | Trust boundaries, authentication, authorization and controls |
| `V1_INFRASTRUCTURE_ARCHITECTURE.md` | Environments, deployment units, CI/CD, observability and recovery |
| `V1_ARCHITECTURE_ADR_ASSESSMENT.md` | Decisions requiring ADR acceptance before production implementation |

**Revision Note (0.2):** ADR-0010 through ADR-0014 were accepted as v1.0. Formal Final Review passed with no blocker or major finding; this exact architecture package is ready for Owner Approval and remains non-Frozen until that separate lifecycle decision.

## Status Meaning

This package is an In Review architecture baseline. Its governing decisions are authoritative through Accepted ADR-0010–ADR-0014, while the package itself awaits Owner Approval and a separate Freeze decision.

## Governing Principles

- modular monolith before microservices;
- one authoritative PostgreSQL database;
- explicit module ownership and no cross-module table writes;
- API-first boundary between web clients and application logic;
- deny-by-default authorization;
- category behaviour driven by metadata and attributes;
- assistive AI behind a replaceable provider adapter;
- asynchronous work only where it creates operational value;
- reversible releases and observable production behaviour;
- V1 scope and thirty-day delivery discipline.
