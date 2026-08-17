# Milestone 11 Slice Scope Reconciliation

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-04
- **Applies To:** Milestone 11 — First Safe Vertical Slice

## Why this record exists

The roadmap lists `Transactional outbox event` as a Milestone 11 slice item.
`FIRST_VERTICAL_SLICE_READINESS.md` — the controlling preparation record — does
not require one for the implemented step. This record reconciles the two so the
absence of outbox code is a recorded decision rather than an omission.

## Controlling text

`FIRST_VERTICAL_SLICE_READINESS.md` → **Transaction Boundaries**:

| # | Boundary | Outbox event required |
|---:|---|---|
| 1 | Business creation writes `business`, `business_owner`, `audit_record` and its outbox event atomically | Yes |
| 2 | Offering creation writes the draft aggregate and audit evidence atomically | **No** |
| 3 | Publication locks the aggregate version, records eligibility, transitions the Offering and writes an outbox event atomically | Yes |
| 4 | The idempotent worker consumes the publication event and upserts the Discovery projection | Consumer |

Boundary 2 is the only one implemented by this slice. It is deliberately
specified without an outbox event, because a draft Offering is private to its
owning Business and produces no state any downstream consumer may observe.

## Decision

Milestone 11 implements boundary 2 only. No outbox event is written on
`offering.draft.create`, and `outbox_event` remains an empty table after this
slice. This satisfies the readiness record as written.

The roadmap's `Transactional outbox event` item is **deferred to the publication
increment** (Delivery Sequence order 4, `Publish and discover`), where boundary 3
introduces the first event with a real consumer.

### Rejected alternative

Emitting an `offering.draft.created` event now would add a published event with
no consumer, no replay test and no projection contract. The readiness record
requires that replaying an outbox event cannot duplicate or corrupt the
projection; that property cannot be demonstrated before a projection exists, so
publishing the event early would create untested surface area.

## Slice implementation status

| Roadmap item | State | Evidence |
|---|---|---|
| Authentication foundation | Stub, fails closed | `TestPrincipalAdapter` refuses to construct in production; real authentication belongs to Delivery Sequence order 1 |
| User identity resolution | Done | `IdentityReader.isEnabled` |
| Business profile authorization | Done | `BusinessAccessReader.canAuthorOfferings` (`NOT_FOUND` / `RESTRICTED` / `SUSPENDED`) |
| Tenant-bound Offering creation | Done | `POST /api/v1/businesses/{businessId}/offerings` |
| Offering draft persistence | Done | `offering` insert inside one transaction with its audit record |
| Offering read-back | Done | `findOwned` is scoped by `business_id` |
| Audit recording | Done | `ALLOWED` and `DENIED` records, both asserted |
| Transactional outbox event | **Deferred** | This record |
| OpenAPI-aligned endpoint implementation | Done | `generated/openapi.json`, including `ErrorEnvelope` on every failure response |
| Negative authorization tests | Done | `tests/m11-authorization.integration.test.ts` |
| Tenant-isolation integration tests | Done | `tests/m11-postgres.integration.test.ts` |

## Input-boundary hardening

A review of the slice found that untrusted input reached PostgreSQL `uuid`
columns without validation. Parameterised queries meant there was no injection
path, but requests that should have been refused became `500` responses
instead. Each is now rejected at the edge and covered by a test.

| Input | Previous behaviour | Now |
|---|---|---|
| `x-correlation-id`, `x-test-user-id`, `x-test-session-id` | Checked only for presence; a malformed value failed inside the driver | `TestPrincipalAdapter` requires a UUID and fails closed with `401` |
| `businessId`, `offeringId` path parameters | Passed straight into `uuid` predicates | Rejected with `400` and a naming `fieldErrors` entry |
| Unknown request-body fields | Silently dropped, contradicting the published `additionalProperties: false` | `createDraftOfferingSchema` is `.strict()`, so the response matches the contract |
| Framework failures such as `413` | Rendered as `INTERNAL_ERROR`, implying a retry could succeed | Carry their own stable codes |

Attempting to set `status`, `version` or `businessId` through the request body
has no effect: the write path reads only named fields and takes `businessId`
from the authorized path context.

Rate limiting is **not** implemented. An authorized principal can force a
`DENIED` audit row per request. This is intended evidence, but audit writes must
be brought inside the rate-limiting boundary when it is introduced.

## Negative test coverage

Readiness scenarios reachable by this slice are covered. The rest depend on
increments this slice does not implement.

| Readiness scenario | State |
|---|---|
| Non-owner cannot read or mutate another Business context | Covered |
| Unverified User cannot author | Covered (account not `ACTIVE`) |
| Suspended or moderation-restricted Business cannot author | Covered |
| Inactive Category cannot be used | Covered |
| Tenant-scoped slug uniqueness holds, and is reported as a conflict | Covered |
| Unverified User cannot create a Business | Not reachable — Business creation is not in this slice |
| Business ownership never grants Admin access | Not reachable — no Admin surface exists yet |
| Stale aggregate version cannot publish | Not reachable — publication deferred |
| Incomplete or ineligible Offering cannot publish | Not reachable — publication deferred |
| Draft, suspended, retired or withdrawn data never enters Discovery | Not reachable — projection deferred |
| Replaying an outbox event does not corrupt the projection | Not reachable — outbox deferred |

## Story governance

Frozen Stories remain `Delivery Status: Not Started`. This record changes no
Story intent, no Acceptance Criteria and no Delivery Status. Advancing any Story
requires a separate change with Product Owner review and green CI evidence.

> **Superseded (2026-08-15):** true when this record closed, and no longer.
> I9 advanced 49 Stories to `Done` and `US-OFR-F05-001` to `In Progress`;
> the Owner's AC-3 decision of 2026-08-17 advanced that one too, so all 50
> are now `Done` — `AC3_ATTRIBUTE_GROUPING_DECISION.md`. Each Story moved
> against per-criterion evidence in `DELIVERY_STATUS_ADVANCEMENT.md`.
> The sentence above is left as it was written, because what a record claimed
> at its close is part of what it records.
