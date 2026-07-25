# First Safe Vertical Slice Readiness

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-07-25
- **Scope:** Preparation only; no Generated Story is started by this record

## Target

`verified User → owned Business → draft Offering → publish → public Discovery`

The slice will be implemented only after the I0 foundation gate passes. It must
prove ownership, explicit state transitions, a transactional outbox, a
rebuildable public projection, and negative authorization behavior.

## Entry Gate

- CI runs `npm ci` and `npm run verify` on the exact commit.
- The initial PostgreSQL migration applies to an empty database and its schema
  drift check is clean.
- Generated OpenAPI is committed and reproducible.
- Module-boundary rules pass.
- The Next.js production build passes in the target CI environment.
- No Critical or High dependency vulnerability is unaccepted.

## Planned API Surface

The routes below are reserved for the implementation change; they are not
implemented by this preparation package.

| Action | Planned route | Principal and policy |
|---|---|---|
| Create Business | `POST /api/v1/businesses` | verified active User |
| Select owned context | `PUT /api/v1/me/business-context` | current owner |
| Create draft Offering | `POST /api/v1/businesses/{businessId}/offerings` | selected current owner |
| Publish Offering | `POST /api/v1/offerings/{offeringId}:publish` | current owner + eligible aggregate |
| Discover Offering | `GET /api/v1/discovery` | Guest or User; projection only |

## Transaction Boundaries

1. Business creation writes `business`, `business_owner`, `audit_record`, and
   its outbox event atomically.
2. Offering creation writes the draft aggregate and audit evidence atomically.
3. Publication locks/checks the current aggregate version, records eligibility,
   transitions the Offering, and writes an outbox event atomically.
4. The idempotent worker consumes the publication event and upserts the public
   Discovery projection. The write model is never queried as a public fallback.

## Required Negative Tests

- unverified User cannot create a Business;
- non-owner cannot select, read, mutate, or publish another Business context;
- Business ownership never grants Admin access;
- stale aggregate version cannot publish;
- incomplete/ineligible Offering cannot publish;
- draft, suspended, retired, or withdrawn data never enters public Discovery;
- replaying an outbox event does not duplicate or corrupt the projection.

## Story Status

Relevant Frozen Stories remain `Delivery Status: Not Started`. Their transition
requires a separate implementation change containing code, tests, traceability
evidence, and Product Owner review.
