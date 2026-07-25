# V1 Delivery Sequence

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-07-25
- **Applies To:** V1 implementation planning

## Sequencing Rule

Implementation proceeds through vertical increments. A later increment may be
prepared in parallel, but it cannot bypass the entry dependencies, security
checks, tests, migration safety, or evidence required by the Engineering
Constitution.

## Increments

| Order | Increment | Exit evidence |
|---:|---|---|
| 0 | Repository foundation | install, format, lint, typecheck, unit test and build pass; local PostgreSQL is reproducible |
| 1 | Identity baseline | Guest/User session boundary, registration, verification, login, logout and recovery pass authorization tests |
| 2 | Catalog and Attribute Engine | Domain, Category and typed Attribute Definition schema supports metadata-driven forms |
| 3 | Business and Offering write path | owner creates Business and draft Offering; authorization and audit evidence pass |
| 4 | Publish and discover | governed publication updates the eligible PostgreSQL search projection |
| 5 | Public decision entry | Home → Discovery → Offering Detail journey works with empty/error states |
| 6 | Compare and decide | compare, bounded Decision Context, optional assistive chat, explicit choice and handoff work |
| 7 | Business operations | Business dashboard exposes only owned contexts and governed management actions |
| 8 | Admin operations | independently authorized Admin moderates, requests correction and manages catalog inputs |
| 9 | Release hardening | analytics minimum, accessibility, load, security, backup/restore and rollback evidence pass |

## First Vertical Slice

The first product-bearing vertical slice spans increments 1–4:

`verified User → owned Business → draft Offering → publish → public Discovery`

It proves the critical module, authorization, transaction, outbox, projection
and public-eligibility boundaries before Decision Chat or broad dashboard work.

## Story Status Rule

Creating this plan or repository skeleton does not start any Generated Story.
A Story changes from `Delivery Status: Not Started` only in a separately
approved implementation change that includes its code, tests, and traceability
evidence.
