# V1 Infrastructure Architecture

- **Owner:** Architecture Owner
- **Status:** Frozen
- **Version:** 1.0
- **Last Updated:** 2026-07-25

**Freeze Note (1.0):** Owner Approved and separately Frozen on 2026-07-25 from the exact Final Review v0.2 candidate; no technical behavior changed.

## 1. Deployment Units

| Unit | Responsibility | Scaling |
|---|---|---|
| Web | Next.js rendering and assets | horizontal/stateless |
| API | public and protected application API | horizontal/stateless |
| Worker | outbox and background jobs | independent replicas |
| PostgreSQL | authoritative data and derived projections | managed service |
| Object storage | media | managed service |

Recommended V1 hosting shape: Vercel for Web; a managed container platform for API/Worker; managed PostgreSQL and S3-compatible storage. Exact vendors remain ADR/deployment-record decisions and must support the controls below.

## 2. Environments

- `local` — developer machine and disposable dependencies;
- `test` — automated integration environment;
- `staging` — production-like release candidate and migration rehearsal;
- `production` — restricted customer environment.

Production data is never copied into lower environments unless irreversibly anonymized through an approved process.

## 3. Network and Access

- only Web/API ingress is public;
- database and internal management endpoints are private/restricted;
- provider egress is allowlisted where practical;
- production administration uses named accounts, MFA and least privilege;
- no shared root credentials;
- preview environments must not receive production secrets.

## 4. CI/CD

Pull request pipeline:

1. format/lint/type check;
2. unit tests;
3. dependency, secret and SAST scans;
4. build;
5. PostgreSQL integration and migration checks;
6. API contract tests;
7. critical accessibility checks;
8. ephemeral preview where safe.

Main/release pipeline:

1. immutable artifact build and provenance;
2. staging deploy;
3. migration rehearsal;
4. smoke/end-to-end/security checks;
5. explicit production approval;
6. controlled migration;
7. Web/API/Worker deployment;
8. post-deploy checks and rollback decision.

## 5. Configuration

Configuration is validated at process startup. Environment-specific values are externalized. Feature flags default off, have owners and expiry criteria, and cannot bypass authorization or migration safety.

## 6. Observability

- JSON logs with timestamp, severity, service, environment and correlation ID;
- request rate, latency, error and saturation metrics;
- database connection/query health;
- worker backlog, retries and terminal failures;
- authentication and authorization anomaly indicators;
- AI-provider latency, failure and cost without logging sensitive prompts;
- distributed trace/correlation across Web → API → Worker/provider;
- liveness and readiness endpoints;
- alerts routed to an accountable owner with runbook link.

## 7. Reliability and Recovery

- zero-downtime-compatible application releases where practical;
- graceful shutdown and connection draining;
- idempotent jobs with bounded exponential retry and dead-letter state;
- automated database backups and restore test;
- object recovery;
- last-known-good application rollback;
- database changes prefer forward-fix after an irreversible migration;
- incident and hotfix flow follows the Engineering Constitution.

## 8. Cost Discipline

Start on managed entry tiers that meet security and backup requirements. Free tiers may be used for non-production and early preview, but production is not accepted on a tier that lacks required backup, availability, privacy, observability or resource guarantees. Add Redis, dedicated search or additional services only with measured need.

## 9. Production Readiness Evidence

- environment inventory and owners;
- architecture/deployment diagram;
- secret inventory without secret values;
- backup/restore evidence;
- migration and rollback record;
- dashboards, alerts and runbooks;
- capacity/load-test result;
- security scan and threat-model closure;
- release checklist and incident contacts.
