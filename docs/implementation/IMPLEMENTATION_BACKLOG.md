# V1 Implementation Backlog

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-07-25
- **Source:** 50 Frozen Generated Stories

## Backlog Policy

This backlog orders delivery; it does not redefine Story behaviour or acceptance
criteria. Every implementation item references the canonical Story file. All
Stories remain `Delivery Status: Not Started` at this planning stage.

> **Superseded (2026-08-15):** true when this record closed, and no longer.
> I9 advanced 49 Stories to `Done` and `US-OFR-F05-001` to `In Progress`;
> the Owner's AC-3 decision of 2026-08-17 advanced that one too, so all 50
> are now `Done` — `AC3_ATTRIBUTE_GROUPING_DECISION.md`. Each Story moved
> against per-criterion evidence in `DELIVERY_STATUS_ADVANCEMENT.md`.
> The sentence above is left as it was written, because what a record claimed
> at its close is part of what it records.

## I0 — Repository Foundation

Engineering work with no product Story claim:

- npm workspaces for `web`, `api`, `worker`, technical packages and domain modules;
- strict TypeScript, formatting, linting, tests and builds;
- configuration validation, redacted structured logging and health endpoints;
- reproducible local PostgreSQL;
- CI, migration, OpenAPI and security-scan expansion in the next foundation change.

## I1 — Identity and Access Baseline

1. `US-IDN-F01-001` Public Guest Access Baseline
2. `US-IDN-F02-001` Registration and Email-Control Proof
3. `US-IDN-F03-001` Login
4. `US-IDN-F04-001` Logout
5. `US-IDN-F05-001` Password Recovery
6. `US-IDN-F06-001` User Account Access Status
7. `US-IDN-F07-001` Business Context Access
8. `US-IDN-F08-001` Admin Authorization and Context Access
9. `US-IDN-F09-001` Direct Contact Authentication Return

## I2 — Catalog, Business and Offering Write Model

1. `US-PLT-F08-001` Category and Domain Management
2. `US-PLT-F09-001` Attribute Definition Management
3. `US-BUS-F01-001` Business Creation and Ownership
4. `US-BUS-F02-001` Business Information and Exposure
5. `US-OFR-F01-001` Offering Creation
6. `US-OFR-F02-001` Offering Editing
7. `US-OFR-F03-001` Offering Retirement
8. `US-OFR-F06-001` Affiliate Destination Configuration

## I3 — Publication and Discovery Projection

1. `US-OFR-F07-001` Affiliate Destination Eligibility Governance
2. `US-OFR-F04-001` Offering Publication
3. `US-DSC-F03-001` Browse
4. `US-DSC-F02-001` Search
5. `US-DSC-F04-001` Search Category Narrowing
6. `US-DSC-F05-001` Attribute Filtering
7. `US-DSC-F07-001` Default Result Ordering
8. `US-DSC-F08-001` Zero Results Recovery

## I4 — Public Web Journey

1. `US-DSC-F01-001` Homepage Discovery Entry
2. `US-DSC-F06-001` Discovery Results and Listing Cards
3. `US-DSC-F09-001` Offering Presentation Handoff
4. `US-OFR-F05-001` Full Offering Detail Presentation
5. `US-DSC-F10-001` Compare Preparation Discovery Return

## I5 — Compare and Decision Completion

1. `US-DEC-F01-001` Comparison Set and Compare
2. `US-DEC-F02-001` Decision Context
3. `US-DEC-F03-001` Decision Chat
4. `US-DEC-F04-001` Explicit Offering Selection
5. `US-DEC-F05-001` Affiliate Handoff
6. `US-DEC-F06-001` Direct Contact
7. `US-DEC-F07-001` Decision Completion

## I6 — Business Operations

1. `US-BUS-F03-001` Business Moderation and Public Exposure Input
2. `US-BUS-F04-001` Business Dashboard and Context Selection
3. `US-BUS-F05-001` Offering Management Entry
4. `US-BUS-F06-001` Affiliate Destination Management Entry
5. `US-BUS-F07-001` Correction Notice and Owner Response

## I7 — Admin Operations

1. `US-PLT-F01-001` Admin Panel Access and Baseline
2. `US-PLT-F02-001` General Moderation Case Management
3. `US-PLT-F03-001` Offering Moderation Actions
4. `US-PLT-F04-001` Business Moderation Actions
5. `US-PLT-F05-001` User Access Moderation Actions
6. `US-PLT-F06-001` Request Correction and Re-review
7. `US-PLT-F07-001` Affiliate Destination Administration
8. `US-PLT-F10-001` Basic Analytics

## Count Reconciliation

| Domain | Story count |
|---|---:|
| Identity | 9 |
| Platform | 10 |
| Business | 7 |
| Offering | 7 |
| Discovery | 10 |
| Decision | 7 |
| **Total** | **50** |

## Next Ready Work

The next engineering change is I0 completion: add CI, Prisma migration baseline,
OpenAPI generation and boundary checks. No product Story should be marked
started until that foundation gate passes.
