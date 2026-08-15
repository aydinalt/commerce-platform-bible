# Milestone 11 Story Implementation Links

- **Owner:** Product Owner / Architecture Owner
- **Status:** Accepted
- **Maintenance Mode:** Living
- **Version:** 1.0
- **Last Updated:** 2026-08-04
- **Scope:** Implementation links only. No Frozen Story file is edited and no Delivery Status changes.

> **Acceptance Note (1.0):** Accepted by the Product Owner / Architecture Owner
> on 2026-08-04, after CI run 9 closed the I0 Repository Foundation gate. The
> three Stories below are recorded as **linked but not started**. This
> acceptance changes no Story behaviour, no Acceptance Criterion and no Delivery
> Status; all 50 Generated Stories remain `Not Started`.

> **Superseded (2026-08-15):** true when this record closed, and no longer.
> I9 advanced 49 Stories to `Done` and `US-OFR-F05-001` to `In Progress`,
> each against per-criterion evidence in `DELIVERY_STATUS_ADVANCEMENT.md`.
> The sentence above is left as it was written, because what a record claimed
> at its close is part of what it records.

## Purpose

The roadmap requires the first slice to "record implementation links without
modifying Story intent". This record names the Stories the slice touches and
states, per Acceptance Criterion, exactly what the implementation does and does
not cover.

**No Story reaches `In Progress` or `Done` on the strength of this document.**

## Relationship to the Frozen traceability baseline

`docs/traceability.md` is Frozen v1.0 and must not be edited in place. This
record therefore sits alongside it and does not amend the cross-tier baseline.
Folding these links into that baseline requires a controlled superseding
revision under `DOCUMENT_LIFECYCLE.md`, which remains an open Owner action.

## Linked Stories

Derived from `IMPLEMENTATION_BACKLOG.md`. The slice touches three Stories, all
partially.

| Story | Backlog increment | Claim |
|---|---|---|
| `US-OFR-F01-001` Offering Creation | I2 | Partial — write path only |
| `US-IDN-F07-001` Business Context Access | I1 | Partial — authorization rule only |
| `US-IDN-F06-001` User Account Access Status | I1 | Partial — enforcement only |

## Implementation locations

| Story | Implementation | Evidence |
|---|---|---|
| `US-OFR-F01-001` | `apps/api/src/offering/offering.controller.ts`, `offering.service.ts`, `apps/api/src/persistence/pg-commerce.repository.ts` (`create`, `findOwned`) | `tests/m11-http.integration.test.ts`, `tests/m11-authorization.integration.test.ts`, `tests/m11-postgres.integration.test.ts` |
| `US-IDN-F07-001` | `PgCommerceRepository.canAuthorOfferings`, `modules/business/src/index.ts` | `tests/m11-authorization.integration.test.ts` |
| `US-IDN-F06-001` | `PgCommerceRepository.isEnabled`, `modules/identity/src/index.ts` | `tests/m11-authorization.integration.test.ts`, `tests/m11-contracts.test.ts` |

## `US-OFR-F01-001` — Offering Creation

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Authorized owner of an Unrestricted Business creates one Offering | Covered | `OfferingService.create`; `records successful creation as ALLOWED evidence` |
| AC-2 | Offering is associated with exactly the authorized Business context | Covered | `business_id` taken from the authorized path context; `does not read back an Offering through a different owned Business` |
| AC-3 | Created Offering is in lifecycle state Draft | Covered | `status` is written as `DRAFT` and `findOwned` filters on it |
| AC-4 | Final Offering Public Eligibility is Ineligible for the new Draft | **Not covered** | No `offering_publication` row is written. Eligibility is currently implied by absence, not produced. |
| AC-5 | New Draft is available in the owning Business management inventory | **Not covered** | Read-back is by identifier only; no inventory listing endpoint exists |
| AC-6 | Creation is denied when Business Moderation Status is Restricted | Covered | `refuses a moderation-restricted Business` |
| AC-7 | Creation neither publishes nor exposes the Offering publicly | Covered | No projection or publication write occurs on the create path |

Two of seven Acceptance Criteria are unmet, so this Story cannot be claimed
complete. AC-4 belongs with the publication increment, which owns
`offering_publication`. AC-5 needs an inventory read endpoint.

## `US-IDN-F07-001` — Business Context Access

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Account status Enabled is required before Business-context entry | Covered | `refuses an account that is not yet verified` |
| AC-2 | An authoritative ownership relationship is required for the exact Business | Covered | `business_owner` join; `hides a Business the principal does not own` |
| AC-6 | Context entry grants no authority over another Business | Covered | `allows the same slug inside a different owned Business` and the tenant isolation test |
| AC-8 | Access status and authorization are reevaluated on entry | Covered | Both checks run per request; no context is cached |
| AC-3, AC-4, AC-5, AC-7, AC-9 | Explicit Business selection, UX-0005 handoff, single login identity, Admin insufficiency, context exit | **Not covered** | There is no context-selection surface; `PUT /api/v1/me/business-context` is unimplemented and no Admin surface exists |

The slice enforces the authorization *rule* but implements none of the context
*lifecycle*.

## `US-IDN-F06-001` — User Account Access Status

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-4 | Authenticated contexts are unavailable while status is Suspended | Covered for the Business context | `isEnabled` admits only `ACTIVE`; the denial is audited |
| AC-1, AC-2, AC-3, AC-5, AC-7, AC-8, AC-9, AC-10, AC-11 | Status vocabulary, suspend and reinstate actions, Guest preservation, Admin rules | **Not covered** | No suspend/reinstate action, no Admin authorization model |
| AC-6 | Suspension alone changes no Business or Offering state | Covered by construction | The status check is read-only |

## Conditions for advancing any Delivery Status

None of the three Stories may move while the gaps above remain. Concretely:

1. `US-OFR-F01-001` needs AC-4 (an `offering_publication` row producing
   Ineligible) and AC-5 (a Business inventory listing endpoint).
2. `US-IDN-F07-001` needs the context-selection surface and the Admin boundary.
3. `US-IDN-F06-001` needs the suspend and reinstate actions and the Admin
   authorization model.

Advancing any of them additionally requires a separate change carrying code,
tests, traceability evidence and Product Owner review.

## Open engineering items referenced above

| Item | Owning increment |
|---|---|
| `offering_publication` row producing Ineligible on draft creation | I3 Publication and Discovery Projection |
| Business Offering inventory listing endpoint | I2 Catalog, Business and Offering Write Model |
| `PUT /api/v1/me/business-context` selection surface | I1 Identity and Access Baseline |
