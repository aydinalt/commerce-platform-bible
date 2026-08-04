<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      2.11
Last Updated: 2026-08-04
-->

# CURRENT STATUS

## Repository Overview

| Item | Current state |
|---|---|
| Repository | Commerce Platform Bible |
| Repository health | Frozen baselines; first safe vertical slice implemented and proven green in target CI |
| Current phase | M11 First Safe Vertical Slice complete; I0 Repository Foundation gate closed |
| Development | Draft Offering write and owned read path implemented; no product Story started |
| Delivery Status of all Frozen Stories | Not Started |

## Canonical Layer Status

| Layer | Authoritative state |
|---|---|
| Governance | `REPOSITORY_GOVERNANCE.md`, `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, and `ADR_PROCESS.md` are Frozen v1.0 |
| Foundation | Five Foundation documents are Frozen |
| ADR | ADR-0001 through ADR-0014 are Accepted |
| PRD | PRD-0001 through PRD-0006 are Frozen |
| UX | UX-0001–UX-0006, UX-0008, and UX-0009 are Frozen v1.0 |
| UX-0007 Messaging | Draft v0.2; preserved outside the current Frozen V1 UX baseline |
| Story standards | `USER_STORY_HANDBOOK.md` is Frozen v1.0 |
| Feature-ID ownership | Offering Capability Architecture is Frozen v2.0; DSC, IDN, DEC, BUS, and PLT registries are Frozen v1.0 |
| User Stories | 6 Parent Story Documents and 50 Generated Stories are Frozen |
| Traceability | Frozen v1.0; all 50 Feature-level chains validated with PASS |
| Engineering | `ENGINEERING_CONSTITUTION.md` is Frozen v1.0 |
| V1 Software Architecture | Owner Approved and Frozen v1.0 |

## Frozen User Story Inventory

| Domain | Parent | Generated Stories | Total | Freeze date |
|---|---:|---:|---:|---|
| Offering | 1 | 7 | 8 | 2026-07-22 |
| Discovery | 1 | 10 | 11 | 2026-07-24 |
| Identity | 1 | 9 | 10 | 2026-07-25 |
| Decision | 1 | 7 | 8 | 2026-07-25 |
| Business | 1 | 7 | 8 | 2026-07-25 |
| Platform | 1 | 10 | 11 | 2026-07-25 |
| **Total** | **6** | **50** | **56** | — |

## Reconciliation Outcome

- Frozen Offering, Discovery, Identity, Decision, and Business package files were restored without rewriting their authoritative content.
- The exact Approved Platform Story package was reconciled to the explicit Owner Freeze decision by changing only Story lifecycle metadata from `Approved` to `Frozen`; versions remain `1.0`, dates remain `2026-07-25`, and Delivery Status remains `Not Started`.
- Frozen PRD and UX sources contained in the audit authority packages replaced the stale GitHub copies.
- `UX-0009-decision-flow.md`, ADR-0006–ADR-0009, and all five non-Offering Feature Registries were restored.
- No Feature, Capability, PRD behaviour, UX behaviour, Story behaviour, or Delivery Status was created or changed by repository reconciliation.
- Offering Capability Architecture v2.0 completed Owner Approval and separate Owner Freeze on 2026-07-25, closing the authoritative capability-home gap for F06 and F07.

## Milestone 11 Slice State

| Boundary | State |
|---|---|
| Draft Offering aggregate and audit record written atomically | Implemented |
| Tenant-scoped authorization with `ALLOWED` and `DENIED` audit evidence | Implemented |
| Owned read-back scoped by `business_id` | Implemented |
| Published `ErrorEnvelope` on every failure response | Implemented |
| Readiness probe gated on PostgreSQL reachability | Implemented |
| Untrusted identifiers rejected at the edge rather than in the driver | Implemented |
| Business creation, publication, Discovery projection, outbox | Deferred — see `docs/implementation/M11_SLICE_SCOPE_RECONCILIATION.md` |

Prisma's `@default(uuid())` and `@updatedAt` are Prisma Client behaviours and were
never emitted as database defaults, so every raw-SQL insert violated a NOT NULL
constraint. Migration `20260804000100_updated_at_defaults` moves both
responsibilities into PostgreSQL, where the raw-SQL persistence layer can rely on
them.

## I0 Closure Evidence

CI run 9 (`2781f02`) passed the full chain on `ubuntu-latest` against PostgreSQL
17 in 1m39s: `npm ci`, `prisma migrate deploy`, `npm run verify`
(schema validation, OpenAPI generation, formatting, linting, module boundaries,
type checking, 38 tests, dependency audit, Next.js production build), the
committed-OpenAPI drift check, and the schema-drift gate.

The drift gate earned its place on its first working run by catching a
pre-existing mismatch: `20260725000100_initial_platform` creates a trigram index
on `offering_search_projection(title)` that the datamodel never declared. Prisma
can see column indexes, so the omission read as drift. It is now declared. The
sibling full-text and partial indexes in that migration are expression-based and
stay outside what Prisma models.

## Remaining Work

1. Select the Frozen Stories this slice implements and record implementation links without changing Story intent.
2. Begin the publication and Discovery projection increment, which introduces the first outbox event with a real consumer.

## Known Boundaries

- Non-blocking audit observations were not silently applied to Frozen Story content.
- `UX-0007 Messaging` is retained as historical Draft v0.2 outside the Frozen V1 baseline and is not required by any validated V1 Feature chain.
- Platform Parent and Generated Story lifecycle metadata now carries the missing Freeze evidence for the already-authorized 2026-07-25 Owner Freeze; Story behaviour and Delivery Status are unchanged.
- The monorepo skeleton implements only accepted architecture boundaries and technical health checks; it does not claim product behaviour.
- `prisma validate` and `prisma migrate diff` cannot run in the local verification environment because the Prisma engine host is unreachable there. Schema syntax is checked locally through `@prisma/prisma-schema-wasm`, but drift itself is only provable in target CI.
- Authentication is still the `TestPrincipalAdapter` stub. It refuses to construct when `NODE_ENV=production` and `ENABLE_TEST_PRINCIPAL=true`, and every authenticated route answers 401 while the flag is unset. Real authentication belongs to the Identity baseline increment.

## Revision History

| Version | Date | Summary |
|---|---|---|
| 1.9 | 2026-07-25 | Reconciled PRD, UX, ADR, Feature Registry, and all six Frozen Story-domain packages from the recovered ZIP set. |
| 2.0 | 2026-07-25 | Recorded Offering Capability Architecture Frozen v2.0 and closed the F06/F07 capability-home gap. |
| 2.1 | 2026-07-25 | Recorded repository-wide Feature-level PASS, resolved UX-0007 treatment for V1, and completed Platform Freeze evidence reconciliation. |
| 2.2 | 2026-07-25 | Recorded explicit Owner Approval and separate Freeze of traceability v1.0. |
| 2.3 | 2026-07-25 | Closed the Engineering Constitution review record and recorded explicit Owner Approval followed by a separate Freeze of v1.0. |
| 2.4 | 2026-07-25 | Closed the Marketplace Bible v1.0 Final Freeze Gate, reconciled Foundation lifecycle metadata, and opened the Software Architecture phase. |
| 2.5 | 2026-07-25 | Accepted ADR-0010–ADR-0014, recorded V1 Software Architecture Final Review PASS, and opened the Owner Approval gate. |
| 2.6 | 2026-07-25 | Recorded Owner Approval and the separate V1 Software Architecture v1.0 Freeze; closed M8 and opened development planning. |
| 2.7 | 2026-07-25 | Added the 50-Story implementation backlog, delivery sequence, and executable TypeScript monorepo foundation; opened M9 without starting a product Story. |
| 2.8 | 2026-07-25 | Prepared the initial Prisma/PostgreSQL migration, reproducible OpenAPI contract, module-boundary enforcement, security audit gate, and first vertical-slice entry evidence; I0 remains open pending target CI. |
| 2.9 | 2026-08-04 | Implemented the first safe vertical slice: database-level identifier and timestamp defaults, tenant-scoped authorization with DENIED audit evidence, published error envelope, conflict reporting, dependency-gated readiness, negative authorization coverage, and a schema-drift gate. Recorded the outbox descope. Delivery Status unchanged. |
| 2.10 | 2026-08-04 | Hardened the input boundary after review: principal headers and path identifiers are validated before reaching PostgreSQL, unknown body fields are refused in line with the published contract, and framework failures carry stable codes. Added HTTP-level coverage of the whole surface. |
| 2.11 | 2026-08-04 | Closed the I0 Repository Foundation gate on CI run 9. Corrected the drift gate to Prisma 7 flag names and declared the trigram index the gate exposed as pre-existing drift. Delivery Status unchanged. |
