<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      2.14
Last Updated: 2026-08-11
-->

# CURRENT STATUS

## Repository Overview

| Item | Current state |
|---|---|
| Repository | Commerce Platform Bible |
| Repository health | Frozen baselines; every increment closed so far proven green in target CI |
| Current phase | M12 Increment I3 Publication and Discovery Projection — closed |
| Development | Identity baseline, the catalog and Offering write model, and the publication-to-Discovery read path implemented |
| Delivery Status of all Frozen Stories | Not Started — implementation is recorded in closure records, and advancing any Delivery Status is a separate Owner decision |

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

## I2 Closure Evidence

Eight Stories delivered across eight commits, each proven green in target CI:
`US-BUS-F01-001`, `US-BUS-F02-001`, `US-PLT-F08-001`, `US-PLT-F09-001`,
`US-OFR-F01-001`, `US-OFR-F02-001`, `US-OFR-F03-001` and `US-OFR-F06-001`. Seven
migrations, and a suite of 237 tests. Per-Story coverage, the three datamodel
alignments and the deferrals are recorded in
`docs/implementation/I2_CATALOG_AND_WRITE_MODEL_CLOSURE.md`.

The increment made three Frozen-Story vocabularies authoritative over the
datamodel that predated them: the Offering lifecycle gained `Hidden` and renamed
`Retired` to `Archived`; the Attribute value kinds became the five of
`US-PLT-F09-001` AC-2; and required-for-publication moved from the applicability
link to the definition that AC-7 evaluates. None of the affected tables held
data, so each was a rename rather than a migration of meaning.

## I3 Closure Evidence

Eight Stories delivered across eight commits: `US-OFR-F07-001`,
`US-OFR-F04-001`, `US-DSC-F03-001`, `US-DSC-F02-001`, `US-DSC-F04-001`,
`US-DSC-F05-001`, `US-DSC-F07-001` and `US-DSC-F08-001`. Three migrations, and a
suite of 337 tests. Per-Story coverage, the delivery decisions and the deferrals
are recorded in
`docs/implementation/I3_PUBLICATION_AND_DISCOVERY_CLOSURE.md`.

Every Acceptance Criterion of all eight Stories is covered. The increment closes
the gap I2 left open: publication now writes the Discovery projection in the same
transaction, so a Published Offering that nothing can find is not a reachable
state, and an unauthenticated person can browse, search, narrow, filter and be
told honestly when nothing matches.

## Remaining Work

1. Begin I4 Public Web Journey, starting with `US-DSC-F01-001` and `US-DSC-F06-001`.
2. Open `US-OFR-F02-001` AC-9 when `US-PLT-F06-001` introduces the correction case it depends on.
3. Select an outbound email vendor and add its adapter; nothing else blocks a deployable registration flow.
4. Fold the recorded implementation links into the Frozen cross-tier traceability baseline through a controlled superseding revision when the Owner chooses to.

## Known Boundaries

- Non-blocking audit observations were not silently applied to Frozen Story content.
- `UX-0007 Messaging` is retained as historical Draft v0.2 outside the Frozen V1 baseline and is not required by any validated V1 Feature chain.
- Platform Parent and Generated Story lifecycle metadata now carries the missing Freeze evidence for the already-authorized 2026-07-25 Owner Freeze; Story behaviour and Delivery Status are unchanged.
- The monorepo skeleton implements only accepted architecture boundaries and technical health checks; it does not claim product behaviour.
- `prisma validate` and `prisma migrate diff` cannot run in the local verification environment because the Prisma engine host is unreachable there. Schema syntax is checked locally through `@prisma/prisma-schema-wasm`, but drift itself is only provable in target CI.
- Authentication is application-owned: Argon2id credentials and server-managed opaque sessions, per `docs/implementation/IDENTITY_IMPLEMENTATION_DECISION.md`. The `TestPrincipalAdapter` survives only as a development affordance that refuses to construct in production, and should be removed once no local workflow depends on it.
- Outbound email has a port, an outbox and a worker, but no vendor adapter. `LoggingEmailDispatcher` refuses to construct in production, so a deployment without an adapter fails loudly rather than accepting registrations nobody can complete.
- Discovery is a JSON contract, not a page. Browse, Search, narrowing, filtering, ordering and Zero Results are implemented and unauthenticated, but the web application is still the single static route it was after I0; the experience UX-0002 describes begins in I4.
- Discovery results are unpaged. No Frozen Discovery Story specifies a page size, a cursor or a "load more" affordance, and `US-DSC-F07-001` AC-3 and AC-5 require a stable deterministic order that a guessed pagination scheme could contradict.
- Discovery Starts are recorded but unread. PRD-0006 Basic Analytics is their only consumer and does not exist; the occurrences are captured now because they cannot be reconstructed afterwards.
- Affiliate Destination Review, Validate, Enable and Disable are implemented as an Admin surface with Handoff Eligibility derived by a database biconditional over the authored pair, so no administration path can leave a changed destination eligible under an earlier validation. The Handoff itself belongs to `US-DEC-F05-001` in I5.
- Category hierarchy invariants, Attribute mutation safety, Select arity and the Affiliate authoring reset are enforced in PostgreSQL rather than in application code. Check constraints, composite foreign keys and triggers are outside what Prisma models, so the schema-drift gate does not see them; the integration suites are what prove they are there.

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
| 2.12 | 2026-08-05 | Delivered the I1 Identity and Access baseline: sessions, registration with emailed proof, login, logout, password recovery, explicit Business context and operationally provisioned Admin authorization. Gave the transactional outbox its first consumer. Recorded that `US-IDN-F09-001` moves to I5. Delivery Status unchanged. |
| 2.11 | 2026-08-04 | Closed the I0 Repository Foundation gate on CI run 9. Corrected the drift gate to Prisma 7 flag names and declared the trigram index the gate exposed as pre-existing drift. Delivery Status unchanged. |
| 2.14 | 2026-08-11 | Closed I3: Affiliate Destination eligibility governance, Offering publication with its Discovery projection, and the unauthenticated Browse, Search, Category narrowing, Attribute filtering, default ordering and Zero Results recovery read path. Recorded that Discovery is still a JSON contract with no page, and that results are deliberately unpaged. Delivery Status unchanged. |
| 2.13 | 2026-08-10 | Closed I2: Category and Domain management, Attribute definition management, Business information and exposure, and Offering creation, editing, retirement and Affiliate Destination configuration. Aligned the Offering lifecycle, the Attribute value kinds and the required-for-publication flag to their Frozen Stories. Recorded that `US-OFR-F02-001` AC-9 waits for `US-PLT-F06-001`. Delivery Status unchanged. |
