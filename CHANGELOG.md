# CHANGELOG

All notable changes to the **Commerce Platform Bible** repository are documented in this file.

This project follows the principles of:
- Documentation First Development
- Semantic Versioning
- Single Information Owner
- Reference Never Redefine

---

## [3.3.0] - 2026-08-18

### Fixed

- One API instance could open a hundred and fifty PostgreSQL connections.
  Every repository built its own `Pool` — fifteen of them, ten connections each
  by `pg`'s default — against a database whose own default `max_connections` is
  a hundred. A second instance was arithmetically impossible, one instance could
  exhaust a default-configured database by itself, and the pools could not lend
  each other anything: fourteen sat idle while the fifteenth queued.
- A comment in `chat.service.ts` claimed a saturated pool would stop every
  request in the process. Chat had its own pool when that was written, so it
  starved only Chat. The sentence is true now.

### Changed

- `createDatabasePool()` in `@commerce/database` is the only place a pool is
  built. The API registers it as its `Pool` provider and closes it once through
  `DatabaseLifecycle`; the worker holds it in `main` and shares it between the
  outbox and the retention sweep. Repositories take it as a dependency.
- `DATABASE_POOL_MAX` sets the ceiling, defaulting to ten. The right number is a
  property of the deployment: instances times max must stay under
  `max_connections`.

### Verified

- 87 test files, 811 tests, plus formatting, linting, module boundaries, type
  checking, reproducible OpenAPI with no drift, dependency audit and a Next.js
  production build. The budget is asserted against `pg_stat_activity`, not by
  counting `new Pool(` in the source. Three mutations run, each caught. The new
  test was wrong twice — it drove a single route, which cannot reveal a second
  pool, and its ceiling assertion would have been satisfied by zero — and both
  corrections are recorded rather than quietly applied.

### Known

- Ten is a default, not a measurement. Nothing here has been load-tested.
- Nothing bounds how long one request may hold a connection.

---

## [3.2.0] - 2026-08-18

### Added

- A retention sweep in the worker, on a five-minute interval, implementing the
  "session cleanup" ADR-0012 §3 has named as a mandatory control since it was
  accepted. Six tables carried an `expires_at`, five indexed it, and nothing had
  ever used that index to delete a row.
- Retention windows as an Owner decision of 2026-08-18, recorded in
  `docs/implementation/I17_RETENTION_SWEEP.md`: expired registrations and
  password resets at expiry with no grace, processed outbox events after thirty
  days, dead letters never.

### Fixed

- A Decision Flow built on a Comparison Set could be destroyed mid-decision.
  Both records lived sixty minutes from their own creation and a flow is always
  built on a set that already exists, so the flow always claimed to outlive the
  set whose `ON DELETE CASCADE` was going to take it.
  `enterWithComparisonSet` now caps the flow at its set's expiry.

### Changed

- The two expired-Decision-state statements moved to `@commerce/database`, so
  the four callers that sweep it cannot drift apart. That is the only reason
  `apps/api` and `apps/worker` now depend on that package.

### Verified

- 86 test files, 808 tests, plus formatting, linting, module boundaries, type
  checking, reproducible OpenAPI with no drift, dependency audit and a Next.js
  production build. Four mutations run, each failing exactly one case. Two of
  the eight new cases were wrong on the first attempt — one seeded a dead letter
  too fresh for its own mutation to bite, one reproduced the statement it was
  checking — and both corrections are recorded rather than quietly applied.

### Known

- The sweep has never run against a table with a real backlog.
- Occurrence tables are deliberately untouched. A retention policy for evidence
  is a different decision and has not been asked.

---

## [3.1.0] - 2026-08-18

### Removed

- `TestPrincipalAdapter`, its fallback branch in `PrincipalResolver.resolve`,
  the `ENABLE_TEST_PRINCIPAL` environment variable and the two contract tests
  that described the adapter. It built a principal from `x-test-user-id`
  headers because M11 had an authenticated HTTP surface and identity was two
  increments away; it refused to construct in production, so it was never a way
  in, but it was a second code path to who a request is. `I1` recorded that it
  should go once nothing depended on it — one suite still did.

### Changed

- `tests/m11-http.integration.test.ts` authenticates through a real session:
  register, process the outbox, follow the emailed confirmation link, keep the
  cookie. Its malformed-principal case presents a malformed session token.
- `Principal.businessId` is required (`string | null`). It was optional, and
  every caller read absence as *skip the Business context check* — a bypass
  living in the type as a legitimate state. `null` is the authenticated User
  baseline and is refused like any other Business.

### Verified

- 85 test files, 800 tests, plus formatting, linting, module boundaries, type
  checking, reproducible OpenAPI with no drift, dependency audit and a Next.js
  production build. Three mutations run: removing the Business context check
  and admitting an unresolvable session each fail exactly one test; removing the
  early missing-cookie guard fails nothing, which is recorded in the closure
  rather than papered over. The migration and drift gates remain CI-only.

### Known

- The adapter's production refusal was never exercised in production. It is
  deleted for having no remaining caller, not for evidence it was ever reached.

---

## [3.0.0] - 2026-08-17

### Note on the gap

**This file stopped being maintained at `[2.8.0]` on 2026-07-25, before the
first increment closed.** Everything between — fifteen increments, all 50
Generated Stories delivered, two vendors chosen — was recorded contemporaneously
in `CURRENT_STATUS.md`'s Revision History and in one closure record per
increment, and nowhere here.

This entry does not reconstruct those months as dated releases. Writing
retrospective entries from a record written elsewhere would produce a second
account to keep in step with the first, and this repository's own principle is
Reference Never Redefine. What follows is the milestone-level change and a
pointer to where the detail actually lives.

### Added

- Fifteen delivery increments, I0 through I14. Each through I13 was proven green
  on the target runner before the next opened; I14 has passed the full chain
  locally and its CI result is not recorded here. Per-increment detail is in
  `docs/implementation/I*_*_CLOSURE.md` and in `CURRENT_STATUS.md` §Revision
  History, versions 2.9 through 2.36.
- An executable platform against the Frozen baseline: identity and sessions,
  the catalog and write model, publication and Discovery, the public web
  journey, Compare and the Decision flow, Business management, Admin
  operations, and every Frozen UX document's surface.
- Outbound email through Postmark and Decision Chat through Anthropic, both
  chosen by the Owner on 2026-08-17 and both reached through a port that was
  written and tested before either was named.

### Changed

- All 50 Generated Stories moved `Not Started` → `Done`, each against
  per-criterion evidence recorded in
  `docs/implementation/DELIVERY_STATUS_ADVANCEMENT.md`. 526 Acceptance Criteria
  are matched to the tests that verify them.

### Verified

- 84 test files, 790 tests, module boundaries, type checking, formatting,
  linting, dependency audit, reproducible OpenAPI and a Next.js production
  build. The migration and schema-drift gates run only in CI and are the one
  part of the chain no local run has ever executed.

### Known

- `docs/traceability.md` remains Frozen v1.0; its superseding revision is
  written as a Draft candidate and awaits Owner review.
- Neither vendor has received a real request.

---

## [2.8.0] - 2026-07-25

### Added

- Prisma 7 PostgreSQL schema and controlled initial migration for the first
  vertical-slice data boundary.
- Database-owned typed-value, lifecycle, version, outbox, full-text, and
  trigram invariants.
- Reproducible OpenAPI 3.1 contract generation and contract test.
- Enforced module dependency rules and CI PostgreSQL migration application.
- First safe vertical-slice readiness record and negative authorization matrix.

### Verified

- Prisma validation, formatting, lint, boundary checks, strict TypeScript,
  contract tests, non-Web builds, and dependency audit pass locally.
- No Critical or High dependency vulnerability is reported.
- PostgreSQL migration application and Next.js production build remain target
  CI evidence; I0 is not yet closed.
- All Frozen Generated Stories remain `Delivery Status: Not Started`.

## [2.7.0] - 2026-07-25

### Added

- Living implementation backlog covering all 50 Frozen Generated Stories.
- Governed delivery sequence and first vertical-slice definition.
- TypeScript npm-workspace skeleton for Next.js Web, NestJS API, Worker,
  technical packages, and nine domain-module boundaries.
- Strict TypeScript, ESLint, Prettier, Vitest, structured redacted logging,
  runtime configuration validation, API health endpoints, and local PostgreSQL.

### Verified

- Formatting, lint, strict TypeScript, two contract tests, API build, Worker
  build, shared-package builds, and domain-module builds pass.
- The restricted verification environment lacks the process-memory interface
  required by Next.js production build; target CI must rerun that build before
  I0 closes.
- All 50 Frozen Generated Stories remain `Delivery Status: Not Started`.

## [2.6.0] - 2026-07-25

### Approved

- The Product Owner approved the exact V1 Software Architecture Final Review v0.2 candidate.

### Frozen

- V1 Software Architecture v1.0, covering backend, frontend, data, security, infrastructure and system architecture.

### Confirmed

- The lifecycle transition introduced no technical-behavior or product-scope change.
- ADR-0010 through ADR-0014 remain Accepted v1.0.
- M8 Software Architecture is complete; development remains Not Started.

## [2.5.0] - 2026-07-25

### Accepted

- ADR-0010 — V1 System Shape and Module Boundaries.
- ADR-0011 — Persistence, Projection and Search Architecture.
- ADR-0012 — Identity, Session and Authorization Architecture.
- ADR-0013 — Deployment and Infrastructure Architecture.
- ADR-0014 — Decision Chat Provider Boundary and Data Handling.

### Reviewed

- V1 Software Architecture Final Review passed with zero blocker and zero major finding.
- The exact architecture package advanced to In Review v0.2 and is ready for Owner Approval; it is not yet Frozen.

## [2.4.0] - 2026-07-25

### Frozen

- Marketplace Bible v1.0 documentation baseline.
- Five Foundation documents after lifecycle reconciliation.

### Added

- Marketplace Bible v1.0 baseline manifest.
- Marketplace Bible v1.0 Final Freeze Gate review evidence.

### Clarified

- Closed the obsolete V1 Scope Decision Chat ownership observation through ADR-0001, Frozen PRD-0004, Frozen UX-0009, and Frozen traceability.
- Opened M8 Software Architecture; all Generated Story Delivery Status values remain Not Started.

## [Unreleased]

### Corrected

- Added the missing 2026-07-25 Owner Freeze evidence to the Frozen Platform Parent Story and ten Platform Generated Stories; aligned each Generated Story's `Freeze State`, date, and owner without changing behaviour or Delivery Status.
- Corrected the Draft Offering Implementation Blueprint metadata path to
  `docs/blueprints/OFFERING_IMPLEMENTATION_BLUEPRINT.md` and fixed the direction
  stated in its existing v0.4 revision note.
- Clarified in the living traceability record that Generated Story candidate
  states embedded in Frozen Parent Story Documents are historical review
  snapshots; the current lifecycle authority remains the 50 Generated Story
  files, all `Frozen v1.0` with Delivery Status `Not Started`.
- Preserved all six Frozen Parent Story baselines without editing them in place.

### Planned

- Marketplace Bible v1.0 freeze gate
- Software Architecture
- Development Phase

### Validated

- Completed Feature-level validation for all 50 authoritative Feature IDs across Offering, Discovery, Identity, Decision, Business, and Platform.
- Confirmed one Parent placement and one first Generated Story for every Feature.
- Confirmed all 50 Generated Stories remain Frozen with Delivery Status `Not Started`.
- Resolved `UX-0007 Messaging` treatment for V1: retained as historical Draft v0.2 outside the Frozen V1 baseline and not used by any validated V1 Feature chain.

### Traceability Lifecycle

- Approved the exact reviewed traceability v0.8 candidate as v1.0 after Architecture Review and Final Review passed.
- Separately froze traceability v1.0 as the authoritative current V1 cross-tier baseline.
- Changed no product, UX, Feature, Story, Capability, Delivery Status, or implementation behaviour.

### Engineering Constitution Lifecycle

- Recovered the clean Engineering Constitution Draft v0.1 candidate and validated it against the current Frozen governance, Accepted ADR, Story-standard, and traceability baselines.
- Preserved the historical Draft v1.3 as non-authoritative source history rather than treating its noncanonical pre-approval version as an authoritative baseline.
- Recorded that the recovered Claude package contained an audit prompt but no completed Claude verdict; no independent-audit result was inferred.
- Closed Architecture Review and Final Review with no Blocker, Major, or required correction.
- Approved the exact reviewed candidate as v1.0 and separately froze it as the authoritative universal engineering-governance baseline.
- Changed no product behaviour, Story behaviour, Story Delivery Status, implementation, infrastructure, or ADR.

---

## [2.0.0] - 2026-07-25

### Capability Architecture

- Approved and separately froze the exact reviewed Offering Capability Architecture v2.0 candidate.
- Added Handoff Enablement as the authoritative capability home for F06 and F07 under Accepted ADR-0008.
- Preserved PRD-0001 as sole behaviour owner and PRD-0005/PRD-0006 as supporting relationships.
- Preserved F01–F05 and left F02 Deferred / Not Yet Decided.
- Superseded Frozen v1.0 without editing its historical baseline.

### Repository Reconciliation

- Updated traceability, repository index, current status, roadmap, and changelog records.
- Changed no PRD, UX, Story behaviour, Delivery Status, or implementation decision.

---

## [1.9.0] - 2026-07-25

### Restored

- Recovered and installed the authoritative Frozen PRD-0001 through PRD-0006 sources from the completed audit packages.
- Recovered the current Frozen V1 UX baseline: UX-0001 through UX-0006, UX-0008, and UX-0009.
- Added Accepted ADR-0006 through ADR-0009 and reconciled the ADR index.
- Added Frozen Discovery, Identity, Decision, Business, and Platform Feature Registries. Offering Feature-ID ownership remains with `OFFERING_CAPABILITY_ARCHITECTURE.md`.

### User Story Layer

- Restored 6 Frozen Parent Story Documents.
- Restored 50 Frozen Generated Stories:
  - Offering: 7
  - Discovery: 10
  - Identity: 9
  - Decision: 7
  - Business: 7
  - Platform: 10
- Preserved all Story Delivery Status values as `Not Started`.
- Reconciled the exact Approved Platform Story package to the explicit 2026-07-25 Owner Freeze decision by changing only lifecycle status metadata to `Frozen`; versions and dates remain unchanged.

### Repository Reconciliation

- Reconciled `CURRENT_STATUS.md`, `PROJECT_ROADMAP.md`, `docs/repository/REPOSITORY_INDEX.md`, `docs/README.md`, and `docs/traceability.md` to the recovered canonical source state.
- Renamed the ADR-0003 file to its canonical path without changing its content.
- Preserved `UX-0007 Messaging` as Draft v0.2 because no explicit retirement, deletion, approval, or freeze decision was recovered.
- Did not apply non-blocking audit observations to Frozen Story baselines.
- Created no new Feature, Capability, PRD behaviour, UX behaviour, Story behaviour, Delivery Status, or implementation decision.

### Next Gate

- Upload and verify the reconciled repository on GitHub.
- Complete Feature-level traceability validation before the Marketplace Bible v1.0 freeze gate.

---

## [1.8.0] - 2026-07-20

### Added or recorded

#### ADR and Governance
- ADR-0004 — Capability Architecture Layer Recognition — **Accepted v1.0** on 2026-07-19.
- `REPOSITORY_GOVERNANCE.md` completed Formal Architecture Review, Final Review, explicit Owner Approval, and separate Owner Freeze — **Frozen v1.0**.
- Repository management-document reconciliation recorded as the immediate follow-up required by Frozen `REPOSITORY_GOVERNANCE.md` §12.

#### Canonical Source-State Inventory
- Governance process documents: `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, `ADR_PROCESS.md` — **Draft v0.1**.
- `USER_STORY_HANDBOOK.md` — **Draft v0.9**.
- PRDs: PRD-0001 **Approved v1.1**; PRD-0003 **Approved v1.0**; PRD-0002 **Draft v0.1**; PRD-0004 **Draft v0.4**; PRD-0005 and PRD-0006 **Draft v0.1**.
- UX: UX-0001 through UX-0008 remain **Draft** (v0.1 or v0.2 according to each canonical header).
- `ENGINEERING_CONSTITUTION.md` — **Draft v1.3**.

### Changed

- `CURRENT_STATUS.md` updated to v1.8 and reconciled to canonical source headers.
- `PROJECT_ROADMAP.md` updated to v2.9 with a source-recovery sequence and explicit readiness gates.
- Completion percentages were suspended during recovery because previous values counted unsupported Baseline/Frozen claims as complete.
- New `US-0002 Discovery` Story Architecture production is blocked until `PRD-0002`, `UX-0001`, `UX-0002`, and `USER_STORY_HANDBOOK.md` complete their lawful lifecycle.

### Corrected

- Corrected the unsupported claim that `USER_STORY_HANDBOOK.md` was Baseline v1.0; its canonical source remains Draft v0.9.
- Corrected the unsupported claim that the complete PRD layer was Frozen; the current PRD sources are mixed Approved/Draft.
- Corrected the unsupported claim that the UX layer was Frozen; all current UX sources remain Draft.
- Corrected the unsupported claim that the governance layer was fully complete; three governance process documents remain Draft v0.1.
- Preserved repository history by annotating earlier entries rather than pretending the unsupported lifecycle events occurred.

### Preserved

- Existing Offering Capability Architecture and F03/F04 reconciliation outcomes remain unchanged.
- ADR-0001 through ADR-0004 remain Accepted.
- F02 remains Deferred / Not Yet Decided and is not recorded as a Feature → Capability association.
- No product behaviour, UX behaviour, Story behaviour, Capability, Feature, Feature ID, Feature → Capability association, implementation decision, or historical source file was changed by this reconciliation.

### Milestone

- Repository source-state recovery opened.
- Next sequence: governance process documents → User Story Handbook → PRDs → UX → `US-0002 Discovery` readiness reassessment.

---

## [1.7.0] - 2026-07-18

### Added or recorded

#### ADR-0003 — Offering Authoring & Publication Feature → Capability Associations (F01–F04) — Accepted v1.0
- F01 → Creation
- F03 → Lifecycle
- F04 → Lifecycle

### Changed through controlled revision

- OFFERING_CAPABILITY_ARCHITECTURE.md reached **Frozen v1.0** and is the authoritative Offering Capability Architecture baseline.
- US-OFR-F03-001 — Offering Retirement reached **Frozen v1.0** and became the current authoritative Golden Baseline.
- US-OFR-F04-001 — Offering Publication reached **Frozen v1.0** and became the current authoritative Golden Baseline.

### Preserved

- The F03 and F04 v0.1 Frozen Golden Baselines remain preserved as historical superseded baselines.
- Story behaviour and all behavioural sections — Purpose, Business Value, Description, Acceptance Criteria, BDD, Dependencies, Out of Scope, Story Size, Delivery Status, and TODOs — remained unchanged.
- F02 — Offering Editing remains **Deferred**; its capability home remains **Not Yet Decided** and is not recorded as an association. Deferred is not a Capability.
- F05 → Presentation remains accepted and recorded under ADR-0002.

### Clarified

- No normative Epic–Capability conflict exists; the Epic–Capability assessment concluded **NO NORMATIVE CONFLICT**.
- Feature → Capability is the authoritative architectural relationship, owned by OFFERING_CAPABILITY_ARCHITECTURE.md.
- No traceability.md change was required.
- Corrected the historical version labels for the preserved F03 and F04 Frozen baselines from v1.0 to v0.1 in the [1.4.0] and [1.5.0] entries.

### Milestone

- Offering Capability and F03/F04 Story reconciliation complete and closed. Approval and freeze were recorded as separate Owner decisions for each document.
- Optional USER_STORY_HANDBOOK.md terminology clarification recorded as non-blocking future maintenance.

---

## [1.6.0] - 2026-07-16

### Added

#### Golden Baseline Story
- US-OFR-F05-001 — Full Offering Detail Presentation — Version 1.0, Status: Golden Baseline

### Story Generation Progress

- Offering Presentation (US-0001 Offering) — **Epic complete**:
  - F05 — Full Offering Detail Presentation (US-OFR-F05-001) — Golden Baseline

### Milestone

- US-OFR-F05-001 review pipeline completed: Architecture Review → ADR-0002 Accepted → Coordinated Controlled Revisions → Final Story Validation → Parent Story Document Reconciliation → Golden Freeze Review → Product Owner / Architecture Owner Approval → Golden Baseline.
- Offering Presentation Epic complete.

---

## [1.5.0] - 2026-07-11

### Added

#### Golden Baseline Story
- US-OFR-F04-001 — Offering Publication — Version 0.1, Status: Frozen Golden Baseline

### Story Generation Progress

- Offering Publication (US-0001 Offering) — **Epic complete**:
  - F04 — Offering Publication (US-OFR-F04-001) — Golden Baseline (Draft → Published)

### Milestone

- US-OFR-F04-001 review pipeline completed: Architecture Review → Story Inventory → Controlled Revision Assessment (No Controlled Revision Required) → Validation (VALIDATED) → Golden Freeze (Ready for Golden Baseline) → Golden Baseline.
- Offering Publication Epic complete.

---

## [1.4.0] - 2026-07-11

### Added

#### Golden Baseline Story
- US-OFR-F03-001 — Offering Retirement — Version 0.1, Status: Frozen Golden Baseline

### Story Generation Progress

- Offering Authoring (US-0001 Offering) — **Epic complete**:
  - F01 — Offering Creation (US-OFR-F01-001) — Golden Baseline
  - F02 — Offering Editing (US-OFR-F02-001) — Golden Baseline
  - F03 — Offering Retirement (US-OFR-F03-001) — Golden Baseline

### Milestone

- US-OFR-F03-001 review pipeline completed: Architecture Review → Architecture Re-Review → Story Inventory → Controlled Revision Assessment (No Controlled Revision Required) → Validation (VALIDATED) → Golden Freeze (Ready for Golden Baseline) → Golden Baseline.
- Offering Authoring Epic complete: F01, F02, and F03 are all Golden Baseline.

---

## [1.3.0] - 2026-07-11

### Added

#### Golden Baseline Story
- US-OFR-F02-001 — Offering Editing — Version 1.0, Status: Golden Baseline

### Story Generation Progress

- Offering Authoring (US-0001 Offering):
  - F01 — Offering Creation (US-OFR-F01-001) — Golden Baseline
  - F02 — Offering Editing (US-OFR-F02-001) — Golden Baseline
  - F03 — Offering Retirement — Next Active Feature

### Milestone

- US-OFR-F02-001 review pipeline completed: Architecture Review → Story Inventory → Controlled Revision Assessment (No Controlled Revision Required) → Validation (VALIDATED) → Golden Freeze (Ready for Golden Baseline) → Golden Baseline.

---

## [1.2.0] - 2026-07-11

> **Correction notice — 2026-07-20:** The Baseline claims recorded in this entry were not supported by the canonical source headers. `REPOSITORY_GOVERNANCE.md` later completed a lawful lifecycle and became Frozen v1.0 on 2026-07-19. `USER_STORY_HANDBOOK.md` remains Draft v0.9. See [1.8.0].

### Added

#### Story Governance Baseline
- USER_STORY_HANDBOOK.md — Version 1.0, Status: Baseline
- REPOSITORY_GOVERNANCE.md — Version 1.0, Status: Baseline
- Story Domain Code Registry (owned by REPOSITORY_GOVERNANCE.md)

### Changed

#### USER_STORY_HANDBOOK.md → Baseline (v1.0)
- Story Governance completed
- Story ID architecture finalized (Generated Story ID: `US-[DOMAIN]-[FEATURE_ID]-[ID]`)
- Story Domain ownership finalized (Domain codes consumed by reference from REPOSITORY_GOVERNANCE.md)
- Feature ID ownership finalized (Feature IDs consumed by reference from OFFERING_CAPABILITY_ARCHITECTURE.md)
- Story Generation Standards finalized

#### REPOSITORY_GOVERNANCE.md → Baseline (v1.0)
- Repository Governance finalized
- Story Domain Registry introduced
- Domain Code ownership finalized
- Repository hierarchy finalized
- Governance ownership model finalized

### Milestone

- USER_STORY_HANDBOOK.md review pipeline completed: Architecture Review → Controlled Revision → Architecture Verification → Validation Review → Freeze Review → Baseline.
- REPOSITORY_GOVERNANCE.md review pipeline completed: Architecture Review → Controlled Revision → Validation Review → Freeze Review → Baseline.
- Story Governance Baseline established; repository Governance phase complete.

---

## [1.1.0] - 2026-07-11

### Added

#### Capability Architecture Layer (Baseline)
- OFFERING_CAPABILITY_ARCHITECTURE.md
- CAPABILITY_COVERAGE_MATRIX.md
- TRACEABILITY_GUIDELINES.md
- Governance recognition of the Capability Architecture layer (Foundation → Capability Architecture → PRD)

### Changed

- Repository Harmonization completed: unified repository layer hierarchy, single owner of the hierarchy established (REPOSITORY_GOVERNANCE.md), Engineering layer recognized in the Layer Authority table, and the traceability status vocabulary single-owned by TRACEABILITY_GUIDELINES.md.
- ENGINEERING_CONSTITUTION.md refactored so detailed User Story standards are governed by USER_STORY_HANDBOOK.md.

### Milestone

- Freeze Review completed.
- Capability Architecture Baseline established.

---

## [1.0.0] - 2026-07-10

> **Correction notice — 2026-07-20:** The layer-wide PRD Frozen and UX Frozen labels below were not supported by the canonical source headers. Current PRD sources are mixed Approved/Draft, and all current UX sources remain Draft. See [1.8.0].

### Added

#### Repository
- Initial repository structure
- Documentation architecture
- Templates
- Repository governance

#### Governance
- REPOSITORY_GOVERNANCE.md
- DOCUMENT_LIFECYCLE.md
- REVIEW_PROCESS.md
- ADR_PROCESS.md
- ADR README

#### Foundation (Frozen)
- VISION.md
- MISSION.md
- PRODUCT_MANIFESTO.md
- PRODUCT_PRINCIPLES.md
- V1_SCOPE.md

#### Architecture Decisions
- ADR-0001 — Decision Chat Ownership (Accepted)

#### PRD Layer (Frozen)
- PRD-0001 Offering
- PRD-0002 Discovery
- PRD-0003 Identity
- PRD-0004 Decision
- PRD-0005 Business
- PRD-0006 Platform

#### UX Layer (Frozen)
- UX-0001 Home
- UX-0002 Discovery
- UX-0003 Offering Detail
- UX-0004 Compare
- UX-0005 Business Dashboard
- UX-0006 Admin Dashboard
- UX-0007 Messaging
- UX-0008 Authentication

#### Repository Management
- CURRENT_STATUS.md
- PROJECT_ROADMAP.md

### Changed

- Decision Chat ownership moved under PRD-0004 through ADR-0001.
- UX layer aligned with Frozen PRDs.
- Compare limit ownership moved to PRD-0004.
- Repository roadmap and status management introduced.

### Fixed

- Cross-layer ownership inconsistencies.
- UX / PRD traceability issues.
- Decision Chat documentation ownership.

---

## Changelog Policy

- Every architectural decision must be reflected here.
- Frozen documents are never edited in place; superseding versions are recorded.
- This file records repository history only and does not replace ADRs or Revision History sections inside documents.
