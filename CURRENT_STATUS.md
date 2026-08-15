<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      2.23
Last Updated: 2026-08-15
-->

# CURRENT STATUS

## Repository Overview

| Item | Current state |
|---|---|
| Repository | Commerce Platform Bible |
| Repository health | Frozen baselines; every increment closed so far proven green in target CI |
| Current phase | M12 Increment I9 Delivery Status Advancement — in progress. Identity, Business and Offering advanced; three domains remain |
| Development | Every Frozen Generated Story implemented, and every Frozen UX document now has a surface: authentication and the three context entries, the Business Dashboard through to the bounded correction path and Affiliate Destination management, the Decision flow through to its two Completions, and the Admin Dashboard through to Category and Attribute management. Twenty-two routes, none of which composes an availability rule of its own |
| Delivery Status of Frozen Stories | 22 of 50 `Done` and 1 `In Progress`, each advanced against per-criterion evidence in `docs/implementation/DELIVERY_STATUS_ADVANCEMENT.md`. `US-OFR-F05-001` is the exception: eight of its nine criteria are verified and AC-3 asks for an Attribute grouping no document governs. The remaining 27 stay `Not Started` |

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

## I4 Closure Evidence

Five Stories delivered across five commits: `US-DSC-F01-001`, `US-DSC-F06-001`,
`US-DSC-F09-001`, `US-OFR-F05-001` and `US-DSC-F10-001`. One migration, and a
suite of 388 tests. Per-Story coverage, the delivery decisions and the
deferrals are recorded in
`docs/implementation/I4_PUBLIC_WEB_JOURNEY_CLOSURE.md`.

The increment turned a correct API into a usable product: a stranger can now
arrive at the Homepage, search or browse, open a Listing Card and read the
complete Presentation of one Offering without signing in. `US-OFR-F05-001` AC-3
is covered except for its grouping half, which has no governed input anywhere in
the datamodel or PRD-0006.

## I5 Closure Evidence

Seven Stories delivered across seven commits: `US-DEC-F01-001` through
`US-DEC-F07-001`. Six migrations, and a suite of 466 tests. Per-Story coverage,
the delivery decisions and the deferrals are recorded in
`docs/implementation/I5_COMPARE_AND_DECISION_CLOSURE.md`.

Every Acceptance Criterion of all seven Stories is covered. The increment adds
the first behaviour that leaves the platform and the first that speaks, and
bounds both: the affiliate address is made active with nothing attached to it,
and Decision Chat is a port with no vendor whose replies are checked against the
Decision Context before they reach a person.

## I6 Closure Evidence

Five Stories delivered across five commits: `US-BUS-F03-001` through
`US-BUS-F07-001`. `US-BUS-F01-001` and `US-BUS-F02-001` were closed in I2. Two
migrations, and a suite of 531 tests. Per-Story coverage, the delivery
decisions and the deferrals are recorded in
`docs/implementation/I6_BUSINESS_MANAGEMENT_CLOSURE.md`.

Every Acceptance Criterion of all seven Business Stories is covered. The
increment's organizing idea is that an offered entry is one the write path
would honour: the Dashboard and the refusal read the same rule twice, and every
entry is proven both ways — absent from the offer and refused by the route.

## I8 Closure Evidence

Nine Frozen UX documents delivered across fifteen commits and fourteen test
files, ending on a suite of 727 tests. UX-0001 through UX-0004 were surfaced in
I4 and I5; I8 adds UX-0005, UX-0006, UX-0008 and UX-0009 and wires the Decision
entries of the earlier ones to a live flow. UX-0007 Messaging is not in V1, and
two screens state its absence where a message box would otherwise be invented.
The delivery decisions, the recorded gaps and the deferrals are in
`docs/implementation/I8_EXPERIENCE_SURFACES_CLOSURE.md`.

The increment's organizing idea is that a screen offers what the write path
would honour, because both read the same answer. No page holds an availability
rule; where one seemed necessary, the API was made to say it instead — the
owner's Offering read carries its Category's applicable Attributes, the Decision
Context says whether an Affiliate path exists and whether a selection was
withdrawn, and the catalogue lists the Categories an Offering may be assigned
to. Each is answered by the same predicate the corresponding write enforces, and
each was something the platform already knew and had not published.

## I9 Delivery Status Advancement

Nine `US-IDN` Identity Stories advanced from `Not Started` to `Done` — the first
Delivery Statuses to move in the repository's life. `DELIVERY_SEQUENCE.md`
allows the move only in a change carrying code, tests and traceability evidence;
the code and tests had existed since I1, and the evidence had not. It is now in
`docs/implementation/DELIVERY_STATUS_ADVANCEMENT.md`, one Acceptance Criterion
at a time.

Reading all 81 Identity criteria against the suite found eight that nothing
asserted, all of the same shape: each is about what an action leaves alone.
Logging out is easy to prove; logging out without quietly dropping a Business
ownership is the part nobody had checked. They are proved by
`tests/i9-identity-delivery.integration.test.ts`.

It also found one criterion the code did not meet. `US-IDN-F09-001` AC-2 puts
the explicitly chosen contact channel in the authentication return context, and
the channel was carried nowhere — somebody who pressed "Telephone", was asked to
sign in and came back found the question unanswered. It now travels in a
flow-keyed cookie holding two names from closed vocabularies, which is a
resumed request rather than a grant: the person returns to a button, and
pressing it re-evaluates every gate.

Five Identity criteria are recorded as covered by absence rather than by
assertion, because they forbid something no route, contract or shape can
express. That is weaker evidence and is marked as such.

Business followed on the same standard. Its seven Stories were the best-covered
in the repository — the four I6 suites line up almost criterion for criterion —
and only two of the 95 had nothing behind them. Both are gates rather than
actions, which is the kind of thing that keeps working until somebody removes
it and nothing notices.

Writing the first found something worth recording. `BusinessService.create`
refuses a suspended holder and audits the denial, but that branch cannot be
reached over HTTP: suspension invalidates the session, so authentication
answers `401` before any Business rule is consulted. Both gates are correct and
the record cites the outer one, because citing a branch nothing can reach would
be evidence that reads as strong and is not.

Offering needed no new test at all. Its 64 criteria were already reached by the
I2 and I3 suites, which were written from the Stories rather than from the code
they were testing, and it shows.

It did produce the first Story that cannot be `Done`. `US-OFR-F05-001` AC-3
asks for Attribute values organized into understandable groups; PRD-0006 gives
a definition a name, a unit, a value kind, comparability, filterability and
required-for-publication, and no group, section or ordering key. Grouping by
any field that happens to be available would be a classification nobody
governs. The Presentation shows one ordered set, which is the whole of what can
be said truthfully, and the Story moves to `In Progress` — delivered,
evidenced, and blocked on a decision that does not belong to delivery.

Nine of the 240 criteria recorded so far are covered by absence. The remaining
27 Stories stay `Not Started`.

## I7 Closure Evidence

Eight Stories delivered across eight commits: `US-PLT-F01-001` through
`US-PLT-F07-001` and `US-PLT-F10-001`. `US-PLT-F08-001` and `US-PLT-F09-001`
were closed in I2. Two migrations, and a suite of 618 tests. Per-Story
coverage, the delivery decisions and the deferrals are recorded in
`docs/implementation/I7_ADMIN_OPERATIONS_CLOSURE.md`.

Every Acceptance Criterion of all ten Platform Stories is covered, which closes
the fiftieth and final Frozen Generated Story. The increment's organizing idea
is that a moderation case is workflow and workflow is not any target's product
state: opening, reviewing and closing a case move nothing, and the actions that
do move something live in their own Stories under their own gates.

Three corrections to existing code were made along the way and are recorded in
that document — a case-matching bug that silently recorded no Offering action,
a missing source-state requirement on Business moderation, and a composed
eligibility that was enacted without being recorded.

## Remaining Work

1. Record the per-criterion evidence for Discovery, Decision and Platform, and advance the 27 Delivery Statuses that evidence supports. One domain per change, on the Identity standard: read the criterion, read the test, and where nothing reaches it, write one.
2. Select an outbound email vendor and add its adapter; nothing else blocks a deployable registration flow.
3. Select a Decision Chat assistant vendor and add its adapter.
4. Fold the recorded implementation links into the Frozen cross-tier traceability baseline through a controlled superseding revision when the Owner chooses to.

## Known Boundaries

- Non-blocking audit observations were not silently applied to Frozen Story content.
- `UX-0007 Messaging` is retained as historical Draft v0.2 outside the Frozen V1 baseline and is not required by any validated V1 Feature chain.
- Platform Parent and Generated Story lifecycle metadata now carries the missing Freeze evidence for the already-authorized 2026-07-25 Owner Freeze; Story behaviour and Delivery Status are unchanged.
- The monorepo skeleton implements only accepted architecture boundaries and technical health checks; it does not claim product behaviour.
- `prisma validate` and `prisma migrate diff` cannot run in the local verification environment because the Prisma engine host is unreachable there. Schema syntax is checked locally through `@prisma/prisma-schema-wasm`, but drift itself is only provable in target CI.
- Authentication is application-owned: Argon2id credentials and server-managed opaque sessions, per `docs/implementation/IDENTITY_IMPLEMENTATION_DECISION.md`. The `TestPrincipalAdapter` survives only as a development affordance that refuses to construct in production, and should be removed once no local workflow depends on it.
- Outbound email has a port, an outbox and a worker, but no vendor adapter. `LoggingEmailDispatcher` refuses to construct in production, so a deployment without an adapter fails loudly rather than accepting registrations nobody can complete.
- Discovery criteria travel in a five-minute `httpOnly` cookie rather than the address, because UX-0002 §4 places persistent or shareable URL state outside V1. A Results page therefore cannot be bookmarked or shared, and refreshing loses the query — an accepted cost of not building something no Story promised.
- No public page may be prerendered or prefetched. Results depend on current eligibility, and opening an Offering produces an occurrence that a speculative fetch would fabricate.
- Decision is a JSON contract except for Compare. The Compare table and its entry from a Presentation are built; Decision Chat, selection, Affiliate Handoff and Direct Contact have no screen, and UX-0009 belongs to a later increment.
- Decision Chat has no assistant vendor. The development adapter restates the Decision Context and refuses to construct in production; the invented-value check that guards `US-DEC-F03-001` AC-6 is numeric only and cannot detect a claim expressed in words.
- Current-flow Decision state expires after an hour and is swept on the next request rather than by a scheduler.
- Attribute Filter controls are absent from the web application. `US-DSC-F05-001` is implemented in the API and has no I4 Story for its surface.
- Web tests render server components through `react-dom/server` rather than in a browser. They prove markup and absence — which is most of what these Stories require — and nothing about layout, focus behaviour or responsive treatment.
- Discovery results are unpaged. No Frozen Discovery Story specifies a page size, a cursor or a "load more" affordance, and `US-DSC-F07-001` AC-3 and AC-5 require a stable deterministic order that a guessed pagination scheme could contradict.
- Discovery Starts are recorded but unread. PRD-0006 Basic Analytics is their only consumer and does not exist; the occurrences are captured now because they cannot be reconstructed afterwards.
- Affiliate Destination Review, Validate, Enable and Disable are implemented as an Admin surface with Handoff Eligibility derived by a database biconditional over the authored pair, so no administration path can leave a changed destination eligible under an earlier validation. The Handoff itself belongs to `US-DEC-F05-001` in I5.
- A moderation case may be opened by any Admin against any target. Surfacing something for review is deliberately the cheap, safe act, so the case list is as disciplined as the people using it.
- An approved action is recorded against whatever Open case its target has, and against none where there is none. Moderation applied outside a case is a real situation and inventing a case for it would be worse — but an action taken while a case happened to be open is recorded against that case either way.
- Basic Analytics bounds occurrences by period and current state by nothing. Three of six core-flow indicators carry a Domain; a Search Discovery Start with no selected leaf Category has none at all, so that breakdown does not sum to its total. The gap is the truth rather than a defect, and a reader who does not know it will misread the figures.
- Admin authorization provisioning, and suspending or reinstating an Admin-authorized account, remain direct database operations reserved to the Product Owner. There is no route, parameter or flag that reaches either.
- Business Public Exposure Input cannot be written directly. A trigger refuses any update that contradicts the moderation status, so exposure changes by moderating the Business and by nothing else.
- Restriction is enforced per owner intent, and the intent is supplied by the calling route. The database cannot know what a caller is about to do, so this gate is code and tests rather than a constraint.
- Only three of PRD-0006's seven General Moderation actions exist: Restrict, Restore and Request Correction. The rest, along with case re-review, approved action, no-action decision and closure, belong to I7 — the `closed_by` and `closed_at` columns are present and nothing writes them.
- The whole Business Dashboard is a JSON contract with no screen. The Dashboard, the Offering and Affiliate Destination management entries and the correction notice are complete as contracts; UX-0005 belongs to a later increment.
- A migration must match Prisma's generated names *and* spell both referential actions on every foreign key. An inlined `REFERENCES ... ON DELETE` leaves `ON UPDATE` at PostgreSQL's `NO ACTION` while the datamodel means `CASCADE`. Two local checks now stand in for the gates that cannot run here: a relation-graph check over `schema.prisma`, and a foreign-key check asserting that every key cascades on update except the one relation that overrides it.
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
| 2.23 | 2026-08-15 | Advanced six of the seven `US-OFR` Offering Stories to `Done` and `US-OFR-F05-001` to `In Progress`. Offering needed no new test: its 64 criteria were already reached by the I2 and I3 suites, which were written from the Stories rather than from the code. It produced the first Story that cannot be `Done` — AC-3 asks for an Attribute grouping PRD-0006 does not define, and grouping by a field that happens to be available would be a classification nobody governs. |
| 2.22 | 2026-08-15 | Advanced the seven `US-BUS` Business Stories to `Done`. The Business Stories were the best-covered in the repository — the four I6 suites line up almost one to one with their criteria — and only two of the 95 had nothing behind them, both gates rather than actions. Writing the first found something worth recording: `BusinessService.create` refuses a suspended holder and audits it, but that branch cannot be reached over HTTP, because suspension invalidates the session and authentication answers first. The record cites the gate that actually runs. |
| 2.21 | 2026-08-15 | Advanced the nine `US-IDN` Identity Stories from `Not Started` to `Done`, each against per-criterion evidence recorded in `DELIVERY_STATUS_ADVANCEMENT.md`. Reading all 81 criteria against the tests found eight nothing asserted — every one of them about what an action leaves alone — and one, `US-IDN-F09-001` AC-2, that the code did not meet: the channel an interrupted person had chosen was carried nowhere, so they returned from signing in to an unanswered question. It now travels in a flow-keyed cookie holding two names from closed vocabularies. Also corrected two stale claims in this document: twenty-two routes, not twenty-one, and the surfaces I8 built are no longer listed as unbuilt. |
| 2.20 | 2026-08-14 | Closed the three gaps I8 recorded. Two were the same mistake — the platform knew something and had not published it — and are now `selectionLost` on the Decision Context and `GET /categories/assignable` behind the Offering create picker. The third was an error in the closure record: the error envelope does carry `fieldErrors`, and the Universal Publication Minimum's shortfalls now reach the person from both the publication and the bounded correction paths. Also loosened the `nanoid` override, which pinned the exact version GHSA-2v37-7h3g-55p8 names. Delivery Status unchanged. |
| 2.19 | 2026-08-14 | Closed I8: every Frozen UX document now has a surface — authentication and context entry, the Business Dashboard with Offering actions, editing, correction notices, the bounded correction path and Affiliate Destination management, the Decision flow through to its two Completions, and the Admin Dashboard with moderation cases, destination administration, Category and Attribute management and Basic Analytics. Added two API answers so that no screen composes an availability rule, and recorded three gaps where a screen can only be as honest as the read it was given. Delivery Status unchanged. |
| 2.18 | 2026-08-12 | Closed I7: the Admin Panel, General Moderation case management, all seven moderation actions across Offering, Business and User Account targets, Request Correction with enforced re-review, Affiliate Destination administration with its derived workload, and Basic Analytics. Recorded three corrections to existing code and the boundaries of case opening and analytics Domain association. This closes the fiftieth and final Frozen Generated Story. Delivery Status unchanged. |
| 2.17 | 2026-08-11 | Closed I6: Business moderation with exposure input bound to it in the datamodel, the Business Dashboard and context selection, the Offering and Affiliate Destination management entries, and the correction notice with its bounded correction-edit path. Recorded that restriction is enforced per owner intent and that only three of the seven General Moderation actions exist. Delivery Status unchanged. |
| 2.16 | 2026-08-11 | Closed I5: the Comparison Set and Compare, the Decision Context, Decision Chat behind a vendorless port, explicit Offering selection, Affiliate Handoff, Direct Contact and the two Decision Completions. Recorded that the assistant has no vendor and that its invented-value guard is numeric only. Delivery Status unchanged. |
| 2.15 | 2026-08-11 | Closed I4: the Homepage entry, Discovery Results and Listing Cards, the Offering Presentation handoff, complete public Offering Presentation with its `Offering Presentation Open` occurrence, and the Compare-preparation Discovery return. Recorded that Discovery criteria are carried in a transient cookie rather than the address, and that `US-OFR-F05-001` AC-3 waits on a governed Attribute grouping. Delivery Status unchanged. |
| 2.14 | 2026-08-11 | Closed I3: Affiliate Destination eligibility governance, Offering publication with its Discovery projection, and the unauthenticated Browse, Search, Category narrowing, Attribute filtering, default ordering and Zero Results recovery read path. Recorded that Discovery is still a JSON contract with no page, and that results are deliberately unpaged. Delivery Status unchanged. |
| 2.13 | 2026-08-10 | Closed I2: Category and Domain management, Attribute definition management, Business information and exposure, and Offering creation, editing, retirement and Affiliate Destination configuration. Aligned the Offering lifecycle, the Attribute value kinds and the required-for-publication flag to their Frozen Stories. Recorded that `US-OFR-F02-001` AC-9 waits for `US-PLT-F06-001`. Delivery Status unchanged. |
