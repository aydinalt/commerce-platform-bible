# ADR-0013 — Deployment and Infrastructure Architecture

- **Owner:** Product Owner / Architecture Owner
- **Status:** Accepted
- **Version:** 1.0
- **Date:** 2026-07-25
- **Deciders:** Product Owner / Architecture Owner
- **Author:** ChatGPT (architecture and documentation advisor)
- **Supersedes:** none
- **Related:** `V1_INFRASTRUCTURE_ARCHITECTURE.md`, `V1_SOFTWARE_ARCHITECTURE.md`, `ENGINEERING_CONSTITUTION.md`

> **Acceptance note.** The Product Owner / Architecture Owner accepted the exact Proposed v0.1 decision on 2026-07-25.

---

## 1. Context

V1 needs low-cost delivery, independent scaling for web/API/background work, managed stateful services and a path from entry tiers to production-safe capacity. Infrastructure must remain simple without placing production on tiers that cannot meet backup, privacy, observability or availability requirements.

## 2. Decision

Deploy Web, API and Worker as separate units:

- Web uses a managed Next.js-capable platform.
- API and Worker use a managed container-capable runtime.
- PostgreSQL and S3-compatible object storage use managed services.

API and Worker artifacts remain container-portable. Vendor-specific bindings must be isolated in deployment configuration or adapters and must not enter product-domain modules.

Maintain local, test, staging and production environments. Production secrets and data are not supplied to preview or lower environments. Only required Web/API ingress is public; database and management surfaces are restricted.

CI validates format, types, tests, dependencies, secrets, static analysis, builds, migrations, API contracts and critical accessibility checks. Production promotion requires staging verification, controlled migration, explicit approval, post-deploy checks and a rollback or forward-fix decision.

Entry/free tiers may support development and preview. Production requires the documented security, backup, resource, privacy, recovery and observability controls even when this requires a paid tier.

Exact vendors are recorded in a deployment decision record after cost and capability verification. A vendor change that preserves this architecture does not require a new ADR.

## 3. Consequences

- Web, API and background jobs can scale independently.
- The platform avoids Kubernetes and self-managed stateful infrastructure in V1.
- Container portability reduces backend provider lock-in but does not eliminate migration work.
- Production cost is permitted where required controls are unavailable on free tiers.
- Restore evidence, alerts, runbooks and migration rehearsals are release-gate artifacts.

## 4. Alternatives Considered

- **Single full-stack serverless deployment:** rejected because worker and backend runtime needs require clearer operational boundaries.
- **Kubernetes:** rejected because its operational burden is not justified for V1.
- **Self-hosted database/object storage:** rejected because backup, patching and recovery overhead conflicts with delivery speed.
- **Free-tier-only production rule:** rejected because price cannot override security and recovery requirements.

## 5. Related PRDs

PRD-0006 and all PRDs whose flows depend on availability and recovery.

## 6. Related ADRs

ADR-0004, ADR-0010, ADR-0011 and ADR-0012.

## 7. Notes

Vendor names and regions must be selected after current pricing, data-location, backup, egress and service-limit verification.
