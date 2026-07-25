# V1 Backend Architecture

- **Owner:** Architecture Owner
- **Status:** In Review
- **Version:** 0.2
- **Last Updated:** 2026-07-25

**Revision Note (0.2):** Governing ADR-0010, ADR-0011, ADR-0012 and ADR-0014 were accepted as v1.0; the exact document passed Final Review without behavior changes.

## 1. Stack

- Node.js current LTS;
- TypeScript strict mode;
- NestJS with Fastify adapter;
- PostgreSQL;
- Prisma for schema/migrations and typed persistence;
- OpenAPI for HTTP contracts;
- Zod or generated DTO validation at trust boundaries;
- OpenTelemetry-compatible instrumentation;
- Vitest/Jest, Supertest and containerized integration tests.

Exact supported versions are pinned in the implementation repository, not in this living architecture draft.

## 2. Code Organization

```text
apps/
  api/
  web/
  worker/
packages/
  contracts/
  config/
  observability/
  testing/
modules/
  identity/
  business/
  catalog/
  offering/
  discovery/
  decision/
  moderation/
  analytics/
  audit/
```

Each module contains `domain`, `application`, `infrastructure` and `interface` boundaries where needed. Shared packages contain technical primitives only; no shared product-domain dumping ground is allowed.

## 3. Application Rules

- Controllers contain no product rules.
- Repositories are module-local interfaces.
- Transactions are opened by application command handlers.
- Product state transitions use named commands, never generic patch endpoints.
- Read models may denormalize; write models remain authoritative.
- Domain events describe completed facts and are stored in the same transaction through an outbox.
- Worker handlers are idempotent and record attempt state.
- External provider adapters map provider errors to application-owned error types.

## 4. Endpoint Families

| Route family | Purpose |
|---|---|
| `/api/v1/auth/*` | registration, verification, login/session and recovery |
| `/api/v1/me/*` | current account and Business contexts |
| `/api/v1/businesses/*` | Business management and correction response |
| `/api/v1/catalog/*` | public category and attribute definitions |
| `/api/v1/offerings/*` | public presentation and authorized management |
| `/api/v1/discovery/*` | search, browse, filters and result pagination |
| `/api/v1/decision/*` | comparison, context, chat, selection and completion |
| `/api/v1/admin/*` | Admin queues, moderation, catalog and analytics |

Admin and Business management operations use explicit verbs when the action is a governed transition, for example `/offerings/{id}:publish` and `/moderation-cases/{id}:requestCorrection`.

## 5. Authentication and Context

The API validates the session/token and constructs an immutable request principal:

```text
userId
accountStatus
authenticated
selectedBusinessId?
businessPermissions[]
adminPermissions[]
sessionId
correlationId
```

Business context is explicitly selected and checked against current ownership on every request. Admin authorization is independently provisioned and never inferred from Business ownership.

## 6. Decision Chat

- Prompt construction happens server-side.
- Input is limited to the current Decision Context and the current bounded conversation.
- The model cannot call mutation tools or act on behalf of the User.
- Provider name and raw credentials never reach the browser.
- Output is treated as untrusted content and rendered safely.
- Provider timeout, quota and safety failure return a recoverable UI state.
- The User can complete the Decision path without accepting an AI recommendation.

## 7. Background Work

Initial job types:

- email delivery;
- media post-processing;
- Discovery projection refresh;
- analytics aggregation;
- AI request execution if synchronous latency proves unsuitable;
- stale upload cleanup.

PostgreSQL outbox plus worker polling is the default. A dedicated queue is deferred until measured load or delivery characteristics justify it.

## 8. Test Boundaries

- unit tests for state transitions and eligibility;
- integration tests against real PostgreSQL for repositories and transactions;
- API contract tests generated from OpenAPI examples;
- authorization matrix tests for Guest/User/Business/Admin contexts;
- provider-adapter tests with recorded synthetic responses;
- end-to-end tests for the Frozen core flow and critical Admin actions.
