# V1 Implementation Backlog

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft
- **Maintenance Mode:** Living
- **Version:** 0.2
- **Last Updated:** 2026-08-31
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

> **Superseded (2026-08-31):** the last line describes work that was done long
> ago. CI runs on every push, 32 migrations are applied by `db:deploy`,
> `openapi:generate` writes `generated/openapi.json` and CI fails on a diff, and
> `security:audit` runs inside `verify`. The line is left as written, because
> what a record claimed at the time is part of what it records.

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

## After I7 — what the Story backlog does not cover

**I1–I7 above are the fifty Stories. They closed, and the work did not stop.**
**Forty-three further closure records** sit in `docs/implementation/`, numbered
I8 to I52 — I9 and I14 have no file of their own; I9's outcome is in
`DELIVERY_STATUS_ADVANCEMENT.md`.

None of them appears in the sequencing above, because none claims a Story. They
are engineering changes against Frozen behaviour that was already specified,
defects found by running the thing, and one prototype built to let the Owner see
a direction before committing to it. This section exists so that a reader of
*this* document does not conclude that I7 is where the repository stands.

Grouped by what they were about, with the record names as they exist:

- **I8, I10** — the experience surfaces; accessibility.
- **I11–I13** — the vendor boundary: email transport, chat transport, and
  selecting a provider from configuration rather than from code.
- **I15–I19** — Attribute Filters, removal of the test principal, the retention
  sweep, one connection pool, one definition of a database timeout.
- **I20–I25** — metrics, correlation, and then the long one: **an unreachable
  database being reported as "no results".** Told apart from emptiness in the
  API layer, then in thirteen routes, then in Identity and Decision, with a
  request budget so a hung read is cut rather than waited on.
- **I26–I33** — the design foundation, the whole application into Turkish
  (public, Business, Admin), Offering visuals, and the failure, loading and
  site-shell surfaces.
- **I34–I40** — deployment: three hostable services, connection mode, the
  serverless entry, the scheduled worker, the throttling key behind a proxy,
  and the first run against an empty database.
- **I41–I44** — what the API actually answers, checked operation by operation
  against what it publishes.
- **I45–I52** — the remaining outage gaps, a transport failure, the visual
  layer for management and public surfaces, page titles, and Offering Price,
  Source and Product Key against PRD-0001 v4.0.
- **The prototype** — `prototype/`, a single self-contained HTML file the Owner
  can open, plus the SEO work in `PROTOTYPE_SEO.md`. It is committed but it is
  **not** the platform: not a workspace, not in the root `tsconfig`, not covered
  by `format:check`. Its purpose is to make a direction visible before it is
  built.

## Measured position

Counted from the repository on 2026-08-31 rather than carried forward, because
a number copied into a document is a number that goes stale silently.

| | |
|---|---:|
| Frozen Stories | 50 |
| Migrations applied | 32 |
| Tables in the datamodel | 39 |
| Published API operations | 87 across 73 paths |
| Web routes | 22 |
| Domain modules | 10 |
| Test files / tests | 120 / 1113 |
| Implementation records | 66 |
| Frozen UX documents / PRDs | 8 / 6 |

## Next Ready Work

> **Superseded (2026-08-31):** this section read *"The next engineering change
> is I0 completion: add CI, Prisma migration baseline, OpenAPI generation and
> boundary checks. No product Story should be marked started until that
> foundation gate passes."* All four exist and all fifty Stories are `Done`.
> The sentence is preserved because what a record claimed at the time is part
> of what it records.

**Open the Domain set in the code.** The governance question is settled —
`DOMAIN_SET_OPEN_DECISION.md` records the Owner's decision of 2026-08-31 that
PRD-0001 v4.0 governs the membership of the set and that `US-PLT-F08-001` AC-1's
enumeration of three is superseded as a statement of it. AC-1's actual rule,
*one* Domain per root Category, is untouched.

What remains is the code, and **the surface was measured before it was planned,
because a first attempt underestimated it.** The closed set is stated in five
places and published in six:

| | |
|---|---:|
| `z.enum(V1_DOMAINS)` sites in `packages/contracts` | 6 — one request, five responses |
| Independent declarations of the list | 3 — contracts, `modules/catalog`, `apps/web/src/platform/catalog.ts` |
| Turkish label maps holding Domain names in code | 1 — `apps/web/src/vocabulary.ts` |
| `enum` arrays in the OpenAPI generator | 6 |
| **Tests that fail once responses carry the Domain's name** | **81** |

Three things the measurement turned up that a smaller plan would have missed:

- **The name has to come from the record.** Categories take their names from
  their records; Domains took theirs from a three-entry map. Opening the set
  without moving the name would print a raw `GARDEN` on a Turkish page.
- **The admin catalogue read must carry the Domain records.** A root Category
  names a Domain, so the create form needs the list — and deriving it from
  existing Categories fails for exactly the Domain somebody is opening the
  first Category in.
- **Analytics is correctly excluded.** `byDomain.domain` is already
  `z.string()`, and it should stay a key: those tallies group history by
  `stable_key` so a renamed Domain does not split its own past.

**Still not decided by any of this: there is no path to create a Domain.** No
endpoint, no service, no contract, no Admin surface — the three that exist were
inserted by `20260810000200_category_management/migration.sql`. Business Rule 39
says the set is *"extended by Platform administration"*, and that half is
unimplemented. Opening the contract makes a Domain added by migration work end
to end; giving an Admin a way to add one is a separate increment against
`US-PLT-F08-001`.

**The remaining blockers are the Owner's, not the code's.** No Vercel project
and no Supabase instance; the catalogue is empty; there are no KVKK or legal
pages at all; backups, a restore rehearsal and alerting are unarranged; the
Postmark and Anthropic credentials are not issued. None of these is engineering
work that can be done from inside the repository.
