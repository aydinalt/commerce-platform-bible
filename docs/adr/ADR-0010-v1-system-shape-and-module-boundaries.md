# ADR-0010 — V1 System Shape and Module Boundaries

- **Owner:** Product Owner / Architecture Owner
- **Status:** Proposed
- **Version:** 0.1
- **Date:** 2026-07-25
- **Deciders:** Product Owner / Architecture Owner
- **Author:** ChatGPT (architecture and documentation advisor)
- **Supersedes:** none
- **Related:** `V1_SOFTWARE_ARCHITECTURE.md`, `V1_BACKEND_ARCHITECTURE.md`, `V1_FRONTEND_ARCHITECTURE.md`, `ENGINEERING_CONSTITUTION.md`

> **Proposal note.** This candidate is non-authoritative until explicitly accepted by the Product Owner / Architecture Owner. Acceptance would authorize the system shape and module boundaries, not product-scope changes or production release.

---

## 1. Context

The Frozen Marketplace Bible v1.0 must be implemented quickly without losing the domain boundaries established by the product documentation. A distributed microservice design would add deployment, consistency and operational cost before the platform has measured scaling evidence. A single unstructured application would be faster initially but would weaken ownership boundaries and make later extraction difficult.

## 2. Decision

Implement V1 as one TypeScript monorepo with three independently deployable runtime processes:

1. a Next.js `web` application;
2. a NestJS modular-monolith `api`;
3. a NestJS `worker` using the same application modules without public HTTP.

The backend is organized into explicit Identity, Business, Catalog, Offering, Discovery, Decision, Moderation, Analytics, Platform and Audit modules.

Each module owns its domain model and persistence access. A module may consume another module only through a published application interface, query contract or domain event. It must not write another module's tables.

Shared packages contain technical primitives and contracts only. They must not become an ownerless shared product-domain layer.

Web and API remain an explicit network boundary. Server-side authorization is performed by the API even when route-level checks also exist in the web application.

## 3. Consequences

- V1 has one primary codebase and one principal transactional boundary.
- Web, API and worker can scale and deploy independently.
- Domain ownership is enforceable without microservice operations.
- Cross-module transactions remain possible where the application boundary requires them, but coupling must remain explicit.
- Later service extraction is possible only after measured need and a new ADR.
- The team must enforce module-boundary tests and dependency rules; directory names alone are insufficient.

## 4. Alternatives Considered

- **Microservices:** rejected for V1 because operational and consistency costs exceed demonstrated needs.
- **Single Next.js full-stack application:** rejected because Business/Admin/application boundaries and worker workloads require a clearer backend authority.
- **Multiple repositories:** rejected because coordinated contracts and thirty-day delivery benefit from one versioned workspace.
- **Unstructured monolith:** rejected because it would not preserve information ownership or support controlled future extraction.

## 5. Related PRDs

`PRD-0001` through `PRD-0006`.

## 6. Related ADRs

ADR-0001, ADR-0004, ADR-0006, ADR-0007, ADR-0008 and ADR-0009.

## 7. Notes

Exact package versions, internal directory names and component-library selection are implementation details unless they materially change this decision.

