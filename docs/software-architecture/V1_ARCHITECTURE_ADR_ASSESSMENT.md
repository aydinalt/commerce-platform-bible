# V1 Architecture ADR Assessment

- **Owner:** Architecture Owner
- **Status:** Draft
- **Version:** 0.1
- **Last Updated:** 2026-07-25

## 1. Purpose

This assessment applies Engineering Constitution §6.2. It distinguishes reversible implementation details from architecture decisions that require Accepted ADRs.

## 2. Required ADR Candidates

| Proposed ADR | Decision | Recommended option | Blocks |
|---|---|---|---|
| ADR-0010 | V1 system shape and module boundaries | TypeScript monorepo; Next.js Web; NestJS modular-monolith API/Worker | production-bound application skeleton |
| ADR-0011 | Persistence, projection and search architecture | PostgreSQL system of record; module-owned schema; PostgreSQL V1 search projection; transactional outbox | schema and search implementation |
| ADR-0012 | Identity, session and authorization architecture | browser cookie session; explicit Business/Admin contexts; policy-based server authorization | protected flows |
| ADR-0013 | Deployment and infrastructure architecture | separate Web/API/Worker deploys; managed PostgreSQL/storage; vendor-portable container backend | production infrastructure |
| ADR-0014 | Decision Chat provider boundary and data handling | server-side replaceable adapter; minimized current context; no tool execution or autonomous actions | production AI integration |

## 3. Decisions That Do Not Yet Need ADRs

- exact component library;
- test runner selection between equivalent supported tools;
- directory names below the approved module boundary;
- formatter/linter configuration;
- a managed vendor choice that is demonstrably replaceable and recorded in deployment documentation;
- index tuning that does not change data ownership or query semantics.

## 4. Deferred Decision Triggers

New ADR assessment is required if V1 proposes:

- a microservice extraction;
- Redis or a dedicated queue as authoritative workflow state;
- a dedicated search engine;
- GraphQL or a public external API;
- event streaming;
- multi-region or multi-database tenancy;
- native mobile applications;
- AI tool calling, autonomous actions or Decision Memory;
- a provider dependency that is difficult to reverse.

## 5. Review Checklist

- Does each recommendation preserve Frozen product ownership?
- Can every module be mapped to PRD/Feature/Story authority?
- Are Business and Admin contexts independent?
- Is Offering universal and metadata-driven?
- Is public eligibility consumed rather than redefined?
- Is Decision Chat assistive and replaceable?
- Are security, recovery and observability enforceable?
- Is the design realistic for the thirty-day V1?

## 6. Current Gate

Verdict: **READY FOR ARCHITECTURE REVIEW — NOT YET READY FOR IMPLEMENTATION**.

The Architecture Owner must accept, reject or revise ADR-0010 through ADR-0014 before their affected implementation work begins.

