# V1 Software Architecture

- **Owner:** Architecture Owner
- **Status:** Draft
- **Version:** 0.1
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

## Status Meaning

This package is an Architecture Draft. It selects a recommended implementation direction, but the decisions listed as ADR-required are not authoritative until the corresponding ADRs are Accepted.

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

