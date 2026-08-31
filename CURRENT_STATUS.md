<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      2.87
Last Updated: 2026-08-31
-->

# CURRENT STATUS

## Repository Overview

| Item                              | Current state                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository                        | Commerce Platform Bible                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Repository health                 | Frozen baselines. Every increment through I13 was proven green in target CI before the next opened, on evidence recorded here run by run. I14 through I19 are green in target CI too, **on the Owner's confirmation of 2026-08-18 rather than on a run recorded in this document** — the distinction is kept because a claim about CI should say how it is known. That confirmation is what closes the three database gates for those six increments: `db:validate`, `db:deploy` and `db:drift` cannot run in the local environment and had gone unproven since I13                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Current phase                     | **The Domain set is open in code and a fourth Domain proves it (I53).** Frozen PRD-0001 v4.0 §E says the set is open; five places in the code said otherwise — a union in `modules/catalog`, `V1_DOMAINS` in `packages/contracts`, two name maps in `apps/web`, six inline enums in the OpenAPI generator — and they agreed only because nobody had added a fourth. Membership moved to the `domain` table, where it always lived; `domainKeySchema` still refuses a malformed key but no longer decides which keys exist, and **`domainName` now travels beside `domain` through every read that mentions a Domain** so no screen translates an identifier. Grouping stays on the stable key, so a rename does not split a Domain's own history. Two of my own errors were corrected inside the increment: an unknown Domain returned **500** once `z.enum` stopped refusing it (now 400 `CATEGORY_DOMAIN_UNKNOWN`), and `domainKeySchema` carried a `.toUpperCase()` that made its own regex decorative — `lower` passed a rule written to refuse it. Evidence is `tests/i53-open-domain-set.integration.test.ts`, six cases against a Domain whose key, slug and name appear in no source file, contract or migration; **6 of 6 mutants killed**. Seven assertions true only of a closed set were replaced by the claim they were trying to make rather than adjusted to keep passing. **Still open: no administrative path creates a Domain** — they arrive by migration, and creating one from the Admin panel needs its own Story. |
| Development                       | Every Frozen Generated Story implemented, and every Frozen UX document now has a surface — though not every section of one: UX-0002 §9 Filter Behaviour and §7.2 Search narrowing had none until I15. The surfaces are: authentication and the three context entries, the Business Dashboard through to the bounded correction path and Affiliate Destination management, the Decision flow through to its two Completions, and the Admin Dashboard through to Category and Attribute management. Twenty-two routes, none of which composes an availability rule of its own                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Delivery Status of Frozen Stories | **50 of 50 `Done`**, none `In Progress`, none `Not Started`. Every criterion is matched to the test that verifies it in `docs/implementation/DELIVERY_STATUS_ADVANCEMENT.md`. `US-OFR-F05-001` was the exception until the Owner read AC-3 as satisfied by one ordered set — `docs/implementation/AC3_ATTRIBUTE_GROUPING_DECISION.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

## Canonical Layer Status

| Layer                    | Authoritative state                                                                                                                                                                                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Governance               | `REPOSITORY_GOVERNANCE.md`, `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, and `ADR_PROCESS.md` are Frozen v1.0                                                                                                                                                                                               |
| Foundation               | Five Foundation documents are Frozen                                                                                                                                                                                                                                                                         |
| ADR                      | ADR-0001 through ADR-0014 are Accepted                                                                                                                                                                                                                                                                       |
| PRD                      | PRD-0001 through PRD-0006 are Frozen. **PRD-0001 is Frozen v4.0** as of 2026-08-30, superseding Frozen v3.1 under `DOCUMENT_LIFECYCLE.md` §7–§8: it adds Offering Price, Offering Source and Product Key, and opens the Domain set. v3.1's Freeze, Approval and Revision Notes are preserved in the document |
| UX                       | UX-0001–UX-0006, UX-0008, and UX-0009 are Frozen v1.0                                                                                                                                                                                                                                                        |
| UX-0007 Messaging        | Draft v0.2; preserved outside the current Frozen V1 UX baseline                                                                                                                                                                                                                                              |
| Story standards          | `USER_STORY_HANDBOOK.md` is Frozen v1.0                                                                                                                                                                                                                                                                      |
| Feature-ID ownership     | Offering Capability Architecture is Frozen v2.0; DSC, IDN, DEC, BUS, and PLT registries are Frozen v1.0                                                                                                                                                                                                      |
| User Stories             | 6 Parent Story Documents and 50 Generated Stories are Frozen                                                                                                                                                                                                                                                 |
| Traceability             | Frozen v1.0; all 50 Feature-level chains validated with PASS                                                                                                                                                                                                                                                 |
| Engineering              | `ENGINEERING_CONSTITUTION.md` is Frozen v1.0                                                                                                                                                                                                                                                                 |
| V1 Software Architecture | Owner Approved and Frozen v1.0                                                                                                                                                                                                                                                                               |

## Frozen User Story Inventory

| Domain    | Parent | Generated Stories |  Total | Freeze date |
| --------- | -----: | ----------------: | -----: | ----------- |
| Offering  |      1 |                 7 |      8 | 2026-07-22  |
| Discovery |      1 |                10 |     11 | 2026-07-24  |
| Identity  |      1 |                 9 |     10 | 2026-07-25  |
| Decision  |      1 |                 7 |      8 | 2026-07-25  |
| Business  |      1 |                 7 |      8 | 2026-07-25  |
| Platform  |      1 |                10 |     11 | 2026-07-25  |
| **Total** |  **6** |            **50** | **56** | —           |

## Reconciliation Outcome

- Frozen Offering, Discovery, Identity, Decision, and Business package files were restored without rewriting their authoritative content.
- The exact Approved Platform Story package was reconciled to the explicit Owner Freeze decision by changing only Story lifecycle metadata from `Approved` to `Frozen`; versions remain `1.0`, dates remain `2026-07-25`, and Delivery Status remains `Not Started`.
- Frozen PRD and UX sources contained in the audit authority packages replaced the stale GitHub copies.
- `UX-0009-decision-flow.md`, ADR-0006–ADR-0009, and all five non-Offering Feature Registries were restored.
- No Feature, Capability, PRD behaviour, UX behaviour, Story behaviour, or Delivery Status was created or changed by repository reconciliation.
- Offering Capability Architecture v2.0 completed Owner Approval and separate Owner Freeze on 2026-07-25, closing the authoritative capability-home gap for F06 and F07.

## Milestone 11 Slice State

| Boundary                                                               | State                                                                  |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Draft Offering aggregate and audit record written atomically           | Implemented                                                            |
| Tenant-scoped authorization with `ALLOWED` and `DENIED` audit evidence | Implemented                                                            |
| Owned read-back scoped by `business_id`                                | Implemented                                                            |
| Published `ErrorEnvelope` on every failure response                    | Implemented                                                            |
| Readiness probe gated on PostgreSQL reachability                       | Implemented                                                            |
| Untrusted identifiers rejected at the edge rather than in the driver   | Implemented                                                            |
| Business creation, publication, Discovery projection, outbox           | Deferred — see `docs/implementation/M11_SLICE_SCOPE_RECONCILIATION.md` |

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

## Three Owner decisions, and what each leaves open

| Decision                                                         | Taken                                                                                                                                           | What is still outstanding                                                                                                          |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Traceability v1.1                                                | **Frozen 2026-08-31.** Review passed on all four claims; approval and freeze taken as separate decisions                                        | Nothing. v1.1 is at `docs/traceability.md`; v1.0 preserved at `docs/traceability-v1.0-superseded.md`                               |
| Prototype integration — **Path A**, and Tailwind into `apps/web` | 2026-08-31                                                                                                                                      | Tailwind's cost is accepted and named: `i26`, `i32`, `i33`, `i48`, `i49`, `i50` all read `globals.css` whole and will be rewritten |
| Discovery Start may occur without a submission                   | **Frozen 2026-08-31** — `PRD-0002` v2.2 and `US-DSC-F02-001` v1.1, frozen simultaneously because the Story consumes the definition the PRD owns | Nothing in governance. The interface change itself is Path A work                                                                  |
| The Domain set is open                                           | Recorded in `DOMAIN_SET_OPEN_DECISION.md`, Draft awaiting acceptance                                                                            | The code — measured at six `z.enum` sites, three declarations, one label map, six OpenAPI enums and **81 tests**                   |

The traceability correction turned out not to need writing: `traceability-v1.1-candidate.md`
was written on 2026-08-17 and had been waiting since then on exactly the review
its own §9 asked for. Counting the repository confirmed all four of its claims —
50 of 50 Stories carry `Delivery Status | Done`, and the per-domain table
(50 Stories, 526 criteria) matches file by file.

**Why v1.0 is wrong rather than merely old.** `REPOSITORY_GOVERNANCE.md` §3 gives
the source document precedence over any record of it, so where the Story files
say `Done` and the traceability record says `Not Started`, the record is what
must change. The trap is that each Story's _Freeze Note_ still reads "Delivery
Status remains Not Started" — true on the day of the freeze, and not the current
status, which the metadata table three lines below states as `Done`.

## The records had drifted from the code, and so had my reading of them

`IMPLEMENTATION_BACKLOG.md` still said the next engineering change was to _"add
CI, Prisma migration baseline, OpenAPI generation and boundary checks"_ — all
four of which have existed for weeks — and stopped at I7, with no sign that
forty-three further increments had closed since. It is refreshed at v0.2, under
its own convention: the superseded sentences are preserved and dated rather than
rewritten.

**The more useful finding was about how I read a repository.** Seven backlog
items were carried as open. All seven were done:

| Carried as open                                                    | Actually                                                                                                                            |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Offering visuals, Listing Card image, Business logo, owner editing | Closed in **I30**; `listing-card.sql.ts`, `listingCardSchema.primaryVisualUrl`, `listing-card.tsx`, `offering-presentation.tsx:156` |
| Uncaught error and `notFound()` surfaces                           | Closed in **I31**                                                                                                                   |
| Loading behaviour                                                  | Closed in **I32**                                                                                                                   |
| Site shell                                                         | Closed in **I33**                                                                                                                   |
| Environment contract, hostable services, migration timing          | Closed in **I34**, decision in `DEPLOYING_TO_VERCEL.md`                                                                             |
| Throttling key behind a proxy                                      | Closed in **I39**                                                                                                                   |
| Admin routes into Turkish                                          | Closed in **I29**; i27's own note reads _"They have met."_                                                                          |

**Every one of the seven was called open for the same reason: I looked at the
head of a list and reported it as the set.** `grep logo` returned thirteen lines;
the first four were `logout`, and I concluded the logo was stored and never
shown — it is rendered at `offering-presentation.tsx:156`. The Listing Card was
called imageless because the grep ran against `discovery-view.tsx` rather than
`listing-card.tsx`, which is the file that draws it.

This is the same shape as the fifteen recorded cases of a check that verifies
something other than what it means, and it is now the fourth in one session. The
pattern that has not failed is **asserting the exact set** — and the failures
keep happening in the place where nothing forces that discipline: reading, not
testing. Every figure in the refreshed record is therefore counted from the
repository, and the groupings were checked against the actual filenames after a
first draft written from memory got several of them wrong.

## Schema drift, and the verification chain that could not see it

|                                               |                                                                                                    |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| CI runs red on schema drift                   | **#149, #150**                                                                                     |
| Cause                                         | `offering_source_idx` created in I52's migration, never declared in `schema.prisma`                |
| Commands CI ran, before / after               | **3 / 1** (`verify:ci` owns the contract)                                                          |
| Commands `npm run verify` reached, before     | **1 of 3** — the failing check was not among them                                                  |
| Tables swept for the same class of divergence | **39**, but the sweep had a hole — see below                                                       |
| Indexes correctly left undeclared             | **8** — partial, expression or non-btree; Prisma cannot express them                               |
| `db:drift` run locally                        | **no** — Prisma fetches its engine from a host that answers 403 here                               |
| Outcome                                       | **CI #152 green.** The index name resolved as declared — the one claim local proof could not reach |

**The failure was procedural before it was technical.** `db:drift` and the
OpenAPI diff lived only in the workflow file, so `npm run verify` — the command
this project treats as _the_ chain — was a strict subset of what CI checks. Both
red builds followed a verification run I had reported as clean, and the report
was accurate: the run simply could not reach the step that failed. `verify:ci`
now defines the whole contract in one place, and `db:drift` moved inside
`verify` so the invariant is a ten-second check rather than a release gate.

The evidence for what the drift check can and cannot see is the repository's own
history rather than an assumption: `offering_published_active_idx` has been
partial and undeclared since the initial migration and has never drifted.

**And the sweep across the other 38 tables was narrower than it was first
reported to be.** It skipped anything that was not a btree over bare columns.
That is right for the four `to_tsvector` expression indexes on
`offering_search_projection` — and wrong for the fifth, because Prisma _can_
express a Gin index with a raw operator class, and
`offering_search_projection_title_trgm_idx` is declared in `schema.prisma`
precisely because it caused this same failure once before. The sweep had a hole
where a drift had already happened, and read clean only because that one had
been closed by hand. **CI #152 and #153 are the evidence that nothing else was
outstanding; the local sweep is corroboration with a known gap.**

## Prototype SEO — the interface as a document, not only as a screen

Findings are in `docs/implementation/PROTOTYPE_SEO.md`. Scope is `prototype/`
only; no platform code, contract, migration or test changed.

|                                                        |                                                                        |
| ------------------------------------------------------ | ---------------------------------------------------------------------- |
| Structured-data nodes on the prototype, before         | **0**                                                                  |
| Category pages that a crawler could tell apart, before | **0 of 11** — one HTML served at eleven addresses                      |
| Routes added                                           | **`/kategori/[slug]` (11 prerendered), robots, sitemap**               |
| JSON-LD node types now emitted                         | **5** — Product, Review, BreadcrumbList, ItemList, WebSite             |
| Owners of the site's own address, before / after       | **2 / 1**                                                              |
| Checks in `preview/seo.mjs`                            | **657**, all against the catalogue rather than a fixture               |
| Mutants applied / killed                               | **15 / 15** — one survived the first pass                              |
| Preview drivers, after                                 | **205 / 205** across six files                                         |
| `next build` in the sandbox                            | **not run — SIGBUS**, an environment limit, stated rather than omitted |

Two results are worth carrying forward. The surviving mutant showed that the
`"all"` guard had become decorative — a second condition was excluding `all`
anyway, so the check was measuring a coincidence rather than the guard; the fix
was to make the guard testable against a catalogue in which it is the only
thing doing the work, not to write a better assertion over the same data. And
the existing drivers caught a defect review did not: `process.env` read bare in
a module that two different bundlers load. It threw on module load and took the
whole preview down, failing checks that had nothing to do with this change.

## I50 The Decision flow's stages, and colour applied to a message

Findings are in `docs/implementation/I50_DECISION_STAGES.md`.

|                                                          |                                              |
| -------------------------------------------------------- | -------------------------------------------- |
| Decision surface, before                                 | **5 files, 557 lines, 0 classes**            |
| `role="alert"` uses: total / on a `<p>` / on a container | **56 / 43 / 4**                              |
| New contrast pairing, measured rather than assumed       | `--text` on `--critical-surface`             |
| Files in the Decision surface edited                     | **0** — one segment layout carries the scope |

## I49 The layer above the public components

Findings are in `docs/implementation/I49_PUBLIC_SURFACES.md`.

|                                                             |                                         |
| ----------------------------------------------------------- | --------------------------------------- |
| Public structures with no treatment, before                 | **4 sections, 2 navs, 2 lists**         |
| Patterns added, all from existing tokens                    | **3**                                   |
| New colours, type sizes or breakpoints                      | **0**                                   |
| Versions of the component guard before it measured anything | **3**                                   |
| `.badge` usage across the product                           | **1 screen**, measured and not repaired |

## I48 The seventeen surfaces that had no visual system

Findings are in `docs/implementation/I48_MANAGEMENT_SURFACES.md`.

|                                                                  |                                     |
| ---------------------------------------------------------------- | ----------------------------------- |
| `page.tsx` files with no `className`, before                     | **20 of 22**                        |
| Management routes with a panel, form grid or page header, before | **0 of 17**                         |
| Page files edited                                                | **0**                               |
| Segment layouts carrying the scope                               | 6 — three `workspace`, three `auth` |
| New colours, type sizes or breakpoints                           | **0**                               |

## I47 A refused connection is the dependency's, not a defect

Findings are in `docs/implementation/I47_TRANSPORT_FAILURE.md`.

| `/offerings/{slug}` with nothing on the port | before                   | after              |
| -------------------------------------------- | ------------------------ | ------------------ |
| status                                       | **500**                  | **200**            |
| visible text                                 | `İlan` — the title alone | the honest surface |
| crash screen in the document                 | no                       | n/a                |

|                                        |                           |
| -------------------------------------- | ------------------------- |
| Reads the single repair reaches        | **19**                    |
| Smoke checks, and against a closed API | **17**, three of them new |
| Mutations caught / survived            | 3 / **1, ours**           |

## I46 The last two modules that reported an outage as an answer

Findings are in `docs/implementation/I46_DECISION_OUTAGE.md`.

| Route       | What a `503` said                    | What was true                          |
| ----------- | ------------------------------------ | -------------------------------------- |
| `/decision` | _Bu karar akışının süresi doldu_     | the flow is fine; it could not be read |
| `/compare`  | _Karşılaştırma oturumunuz sona erdi_ | the set is fine; it could not be read  |

|                                                      |               |
| ---------------------------------------------------- | ------------- |
| Reads separated from an outage and put on the budget | **5**         |
| Writes measured and deliberately left alone          | **8**         |
| Web modules reading the API outside the vocabulary   | **0**, from 2 |

## I45 The two identity reads I24 did not reach

Findings are in `docs/implementation/I45_IDENTITY_OUTAGE.md`.

| Read                  | What a `503` became  | On screen               |
| --------------------- | -------------------- | ----------------------- |
| `readSession`         | `null`               | _you are signed out_    |
| `readOwnedBusinesses` | `{ businesses: [] }` | _you own no Businesses_ |

|                                                         |                            |
| ------------------------------------------------------- | -------------------------- |
| Web readers using the shared vocabulary, before / after | **14 / 16**                |
| Reads brought onto I25's timeout budget                 | 2                          |
| Writes deliberately left off it                         | 8                          |
| Decision functions still collapsing an outage           | **15**, measured and named |

## I44 What the API answers, checked against what it publishes

Findings are in `docs/implementation/I44_SERVED_CONTRACT.md`.

|                                                        |                                     |
| ------------------------------------------------------ | ----------------------------------- |
| Operations driven for real                             | 87                                  |
| Bodies checked against the contract the document names | 73, **0 refused**                   |
| Statuses answered that the document did not declare    | **13** — twelve `503`, one `403`    |
| Operations declaring `503` before / after              | **1 / 86**                          |
| The one operation that declares no `503`               | `GET /api/v1/health/live`, measured |

Run both with and without a database reachable, so the result does not depend
on which of the two the runner happens to be.

## I43 The published types, checked against the contracts

Findings are in `docs/implementation/I43_CONTRACT_TYPES.md`.

I42 closed the names and named what it could not see: types. **301 properties
are now compared and all agree**, so this locks a good state in rather than
repairing a bad one.

**The measurement was wrong before it was right.** The first comparison reported
62 differences out of 301 and every one was the comparison's fault — three
encodings of agreement read as disagreement: `type: ["string","null"]` against
`anyOf: [{string},{null}]`, a `$ref` to a shared enum against the enum inlined,
and `enum: ["ok"]` against `type: "string"`. **Had that number been trusted,
sixty-two correct declarations would have been edited into wrong ones** to
satisfy a naive reader — reached by doing exactly what the increment was for. A
case now asserts on the normaliser itself that a nullable and a plain one still
read as different, because the fix for over-strictness can overshoot.

Eight contracts carry a `transform` and JSON Schema cannot express one. They are
skipped and **the set is asserted rather than a count**: a count is a budget
somebody spends, and naming them means a ninth fails and has to be acknowledged.
The first version of that case guessed "fewer than six" and there were eight.

## I42 The published shapes, checked against the contracts

Findings are in `docs/implementation/I42_CONTRACT_SHAPES.md`.

I41 wrote down what it could not see — _"this compares method and path, not
shape"_ — and **it did not match, and had not since I30.** That increment gave
Offerings visuals and updated the Zod contracts, the migration, the projection,
the repositories, the API and the web application. It did not update the
five-thousand-line hand-written OpenAPI generator, so **`SearchResult` lost
`primaryVisualUrl` and `EditableOfferingContent` lost `visuals` from the
published description for eleven increments.** A client generated from it would
have looked correct and quietly dropped both.

Both are now in the generator. 81 of the document's 92 schemas pair with a Zod
object schema by name and are compared in both directions; the eleven that do
not pair are shapes one side inlines, and they are recorded as unchecked rather
than as fine. The two recovered fields are asserted by name as well as by the
general rule, because a rule that has never been violated is indistinguishable
from one that cannot be.

## I41 The published contract, checked against what is served

Findings are in `docs/implementation/I41_PUBLISHED_CONTRACT.md`.

`generated/openapi.json` is committed and CI runs `git diff --exit-code` against
it, which **proves the generator's output matches the committed file and nothing
else** — and the generator is 5073 hand-written lines with no introspection. The
only assertions on it named six operations out of eighty-seven.

**The document is in good order**: 88 operations served, 87 documented, none
documented that is not served. The one exclusion is `GET /api/v1/metrics`,
I19's decision, named rather than filtered silently. A clean result is the
point — this is the state a five-thousand-line hand-maintained file drifts out of
one commit at a time, and nothing was holding it there.

`createApiApp` gained an optional `onRoute` observer, because **a Fastify
instance cannot be asked what it serves afterwards**. **Mutation testing
corrected a comment written in the same increment**: the hook does not need to
precede `NestFactory.create`, it needs to precede `app.init()`, which is where
Nest mounts the controllers. The case that noticed was the guard against the
comparison passing by emptiness, and it earned its place on the first try.

**A second check passed for the wrong reason.** `scripts/smoke.mjs` has asserted
since I35 that `/metrics` answers 404, and the real path is `/api/v1/metrics` —
so it was asking about a path the application has never had, and 404 was the
answer to a wall rather than to a closed door. Second such check in that script
after the wordmark in I35.

## I40 The first run against an empty database

Nobody had ever pointed the platform at a brand-new database. Findings are in
`docs/implementation/I40_FIRST_RUN.md`.

Walked against 31 migrations and nothing else: **39 tables and three Domains a
migration seeds**; Home answers 200 with _"Şu anda açık bir kategori yok."_;
Discovery redirects to Home having no criteria; registration writes its four
rows; **I38's scheduled endpoint drained a real outbox** —
`{"batches":2,"delivered":1,"drained":true}`, the first time the cron path has
delivered a message a registration actually filled; confirmation, grant and
sign-in all answer 201; and the Admin panel answers **403
`ADMIN_CONTEXT_REQUIRED`**, which is UX-0008 §5 working rather than a bootstrap
failure — authorization does not imply an entered context, and the closure record
says so because it is exactly the result somebody would "fix".

**The one thing missing was a way to get the confirmation link.** `admin.mjs`
refuses anything unconfirmed, and the token is minted at delivery with only its
digest written back — a good decision, and the reason no amount of database
access produces a link. `npm run first-run` **is** the worker, run once by an
operator with a dispatcher that prints instead of sends: same processor, same
minting, same digest. It adds no capability, because anyone who can run it
already holds `DATABASE_URL`. A case asserts **no fourth serverless entry has
appeared** beside the three I37 and I38 declared — everything it does would be a
serious hole as an HTTP endpoint.

**CI caught what this sandbox could not.** The first push failed `verify` with
nineteen `no-unsafe-*` errors in `scripts/first-run.mjs`, every one "a type that
could not be resolved", after passing locally. It is the first script to import
`@commerce/*`, scripts sit outside every tsconfig project, and those imports
resolve through `node_modules` to each package's `dist` — absent on a clean
checkout. `verify` ran `lint` before `typecheck`, so **a type-aware linter was
being run before the types existed**, where every type-aware rule degrades
silently to "unresolved". `typecheck` is `tsc -b` and emits, so it now runs
first, asserted by a case. Every "full chain" reported earlier in this session
ran against a sandbox holding build output CI does not have; the chain has now
been run from a clean tree.

## I39 The throttling key

Findings are in `docs/implementation/I39_THROTTLING_KEY.md`.

**A claim made earlier in this session was false.** The survey of what stood
between the repository and a public deployment reported "there is no rate
limiting anywhere in the repository". `auth_throttle` has counted attempts per
hashed subject since I13, across registration, recovery and both sign-in scopes,
in one atomic statement so the count is shared by every instance. The survey
searched for the names of libraries rather than for the behaviour, and this
repository writes such things itself. Struck through rather than deleted in
`DEPLOYING_TO_VERCEL.md`, and a case asserts it stays struck.

**What was actually broken is the key.** `identity.controller.ts` uses
`request.ip` and calls it "the caller's address"; Fastify populates that from
`x-forwarded-for` only when told to, and it had not been told. Measured against
a forged header: unset gives the **proxy's** address, so the whole platform
shares one counter and locks itself out; `true` gives the value the **caller**
wrote, so the throttle never fires; `1` gives the entry the trusted proxy
appended. **Both simple answers are wrong, in opposite directions**, and both
answer 200 to the request in front of you.

`TRUSTED_PROXY_HOPS` states the number, because nothing in a request
distinguishes an entry a proxy added from one a caller sent. **Too high is as
bad as trust-all**: when the chain is shorter than the number declared the
resolver returns the leftmost entry — the caller's. A case here was written to
assert the opposite and the measurement said no.

Two checks matched themselves: one read its own struck-through correction as the
claim, and one accepted `TRUSTED_PROXY_HOPS_X` as documentation of
`TRUSTED_PROXY_HOPS`.

## I38 The worker as scheduled invocations

**Until this increment no email was ever sent on the platform the Owner chose.**
The worker is a `while (running)` loop and Vercel has nowhere to loop, so
registration confirmations would have sat unread in the outbox, nobody could
have completed a sign-up, and the deployment would have looked entirely healthy.
Findings are in `docs/implementation/I38_SCHEDULED_WORKER.md`.

`main.ts` stays a loop; `drain.ts` is the draining separated from what drives it,
and `handler.ts` calls it once. `buildDispatcher` moved into its own module —
**a second copy of "does this deployment send real mail" is the duplicate that
matters most**, because the two could disagree and one would silently write every
registration to a log while reporting success.

**A deadline rather than "until empty".** A function is killed mid-statement when
it exceeds its duration; `processBatch` marks what it delivered before returning,
so a kill between batches loses nothing but a kill inside one is a delivery
nobody recorded and the outbox then retries it. The drain stops before a batch it
could not finish. `drained: false` is the signal that the schedule is not keeping
up, and nothing watches it yet.

Two endpoints, because the loop's five-minute sweep timer cannot survive a
process with no memory between invocations — the cadence had to move into the
schedule. Unauthorised gets **404, not 401**, and an unset `CRON_SECRET` never
matches: the endpoint sends real email and deletes real rows.

**A second finding: I34's environment detector was half-blind.** It matched
`process.env.NAME` and not `process.env["NAME"]`, and four bracket reads already
existed. It failed harmlessly here, but the same blindness in the other
direction is exactly the boot failure I34 was written about — a variable read
only through a bracket would have been invisible to it.

**Vercel's Hobby plan runs a cron once per day.** Pro runs it every minute. A
confirmation arriving up to 24 hours later is not a working sign-up, so the
worker needs Pro or a process host — a spend decision rather than a code one.

## I37 The API as a function

Vercel runs functions, and until this increment the API had **no way at all** to
run on the platform the Owner chose. Findings are in
`docs/implementation/I37_SERVERLESS_ENTRY.md`; the procedure is in
`docs/implementation/DEPLOYING_TO_VERCEL.md`.

`main.ts` stays, and that is the point: **a staged decision is only reversible
while both shapes exist.** `bootstrap.ts` had already separated building the
application from listening on a port, so `handler.ts` is a second entry rather
than a second copy — one request pipeline, entered two ways.

The application is built once per function instance and the **promise** is what
is cached, so two requests during a cold start await the same build. Building
per request would open a new database pool on every call, which against
Supabase's connection limit is the whole project falling over rather than one
slow response. `fastify.ready()` is awaited first: a request served before
`helmet` and the cookie parser register is not a slow response but a wrong one.

Seven cases drive the handler through a **real `http.createServer` over a real
socket**. One of them failed and the code was right — the case sent a string
that is not a valid UUID, and I17 correctly minted a fresh identifier rather
than propagating it. The behaviour that failure accidentally found now has a
case of its own.

**Two Vercel projects**, because Vercel serves a root `api/` directory itself
and a Next.js project already owns its routing. `apps/api/api/index.js` is plain
JavaScript pointing at `dist`, because `rootDir: "src"` leaves no other option
that keeps `dist/main.js` where the Dockerfile expects it.

**The worker still has no home**, and it is now the largest gap: until it runs,
no email is ever sent, so nobody can complete a sign-up. A deployment made today
would look healthy and be unusable.

## I36 Reaching Supabase through its pooler

The Owner chose **Vercel and Supabase** on 2026-08-26, and chose the staged
route: ship on Vercel first, move the API to a process host if the measurements
demand it. Findings are in `docs/implementation/I36_CONNECTION_MODE.md`.

**A transaction pooler refuses the parameter this platform's timeouts travel
on.** Since I18 `statement_timeout` and `idle_in_transaction_session_timeout`
have been carried on `pg`'s `options` startup parameter — correct while the only
thing between the process and PostgreSQL is a socket. Supabase puts Supavisor in
between: port 5432 accepts `options`, **port 6543 rejects it**, and the code
cannot tell the two apart from the URL. `DATABASE_CONNECTION_MODE` states which,
and an unrecognised value takes `direct` so a typo fails a deploy rather than
silently stripping the timeouts.

On the pooled port the timeouts must come from the database role instead. A
deployment that forgets that gets a working connection, correct results and **no
statement timeout at all** — one hung query from holding the whole pool. So the
API and the worker now ask the server what the settings actually are and refuse
to start when they are not the configured values. The check does not care how
the setting arrived: what matters is the value in force, not the route it took.

**One mutation survived the first attempt.** Deleting the call from the worker
left the suite green, because the case asserted the source contained the _name_
and the import line still did. A check on a name is satisfied by importing it
and never calling it. Fifth check in this repository to match something other
than what it meant.

## I35 The first end-to-end run

Both services started as real processes and driven over `127.0.0.1`. Findings
are in `docs/implementation/I35_END_TO_END.md`.

**All 942 tests called `app.inject()` or `renderToStaticMarkup`.** No socket had
ever been opened, no page had ever been served, and the web application had
never called the API over a network. Five consecutive closure records named the
gap; naming it five times did not close it.

**The first run found a defect.**
`/offerings/there-is-no-such-offering` answered **200 OK** with
`Bu sayfa bulunamadı` in the body. A `loading.tsx` makes Next stream the
segment, and the status is committed at the first flush — before `page.tsx`
calls `notFound()`. The body was right and the status was a lie, which is the
worst of both: a person sees the correct screen, and every crawler, monitor and
cache sees a page that exists. **Twelve pages** under `/admin`, `/businesses`
and `/offerings/[slug]` were affected, and every test in the repository passed
the whole time — `renderToStaticMarkup` has no status code and `app.inject()`
does not stream.

Three of I32's five `loading.tsx` files are removed; `/compare` and `/decision`
contain no `notFound()` and keep their skeleton. **Twelve pages lose a loading
state, because a correct status code outranks a skeleton.** The reversal is
recorded in `tests/i32-loading-behaviour.test.ts` with the original claim struck
through, and a second case derives the rule from the source so it cannot recur.

`npm run smoke` is a script rather than a test, and deliberately outside
`npm run verify`: it needs a production build and a migrated database, and a
test that skips when its preconditions are absent still reports green. **13/13
checks pass against two running processes.** Still nobody has looked at it — no
browser, no client bundle, no viewport.

## I34 Deployment

The Owner chose Vercel with managed Postgres on 2026-08-24, which covers one of
three services. Findings are in `docs/implementation/I34_DEPLOYMENT.md`.

**`.env.example` documented fourteen variables and the code reads
twenty-three.** Two of the nine missing ones stop production from starting:
`EMAIL_TRANSPORT` and `CHAT_TRANSPORT` default to `development` and both
adapters throw under `NODE_ENV=production` — so a deployment following that file
exactly would have failed at boot, naming a variable the file had never heard
of. It is the only instruction sheet a deployment has, and it was missing
exactly the step that fails.

`WEB_PORT` was documented and read by nothing. Removed rather than implemented:
**a variable that does nothing is worse than an absent one**, because absence is
visible.

**Three modules were missing from the Dockerfile's manifest list** — written
from memory. Both directions are now compared against the repository by
`tests/i34-deployment.test.ts`, so neither can drift again.

**Migrations are a release step**, not a build step and not a boot step: the
Vercel build has no reason to hold database credentials and runs on every
preview branch, and two API instances starting together would race.

## I33 Site Shell

A header with a wordmark that links home, two navigation entries, a footer and a
skip link — plus the density pass the Owner asked for. Findings are in
`docs/implementation/I33_SITE_SHELL.md`.

**Measured before it was believed**: 22 routes, 60 components, 587 lines of CSS,
and zero of header, navigation, footer or brand. What had been built was the
_behaviour_ of an interface rather than a product surface, and a disagreement
that survives two exchanges is usually not about the facts.

**The header knows two states and no third.** Signed in or not; it never names
the Admin or Business context, because a header offering `Yönetici` would
announce that this account holds Admin authorization — which UX-0008 §5 keeps
behind an explicit entry.

**The direction reversal is of spaciousness, not of restraint.** The type scale
came down and the grid went to `auto-fill minmax(15rem, 1fr)`; the focus ring,
the contrast, the 44px controls and the no-animation rule are untouched.

**Three checks read files instead of code**, all in one increment, after the
same thing in I31. This repository comments heavily and on purpose, so **every
source-reading check must strip comments first** — otherwise the prose that
makes the code legible is what breaks the tests.

## I32 Loading Behaviour

Five `loading.tsx` files covering fourteen routes. Findings are in
`docs/implementation/I32_LOADING_BEHAVIOUR.md`.

**The interesting half is where a loading state is absent.** There is no root
`app/loading.tsx`, because it would cascade into the two places the Frozen
documents forbid: Home, where UX-0001 §12 requires Search to stay usable while
Categories resolve, and Discovery, where UX-0002 §13 requires the criteria to
remain visible.

**Discovery cannot satisfy §13 either way today.** Without a boundary the
criteria stay but the old result actions stay clickable; with one the actions go
and so do the criteria. The criteria live in the carrier cookie and a
`loading.tsx` is a synchronous fallback that cannot read one — the compliant
answer needs them in the URL, and the cookie was chosen in I4 precisely so a
prefetch cannot record a Discovery Start. **Two Frozen requirements pulling
opposite ways through one design decision.**

**The approved design foundation caught an overreach of mine.** The first
version pulsed the skeleton; `i26-design-foundation` failed on "declares no
animation", a constraint the Owner approved on 2026-08-21. The pulse is gone —
a still skeleton says everything a pulsing one does.

## I31 Failure Surfaces

The two screens a person reaches when the application breaks. Findings are in
`docs/implementation/I31_FAILURE_SURFACES.md`.

**Twenty-two routes, zero error boundaries; twenty-nine `notFound()` calls, no
page.** Every one produced Next.js's built-in screen: English, no route back,
nothing to quote. The thirteen calls I24 kept deliberately — because answering
"unavailable" there would leak that something exists — were being delivered in
the wrong language by the increment that made them honest.

**One message for both `notFound()` situations, on purpose.** They mean either
"no such address" or "not yours", and the second is why the first cannot be more
specific: a page that told them apart would answer whether a given Offering
exists. I24 closed that door on one side; this would have opened it on the
other.

**`global-error.tsx` declares its own `lang="tr"`**, because the layout that
normally declares it is the thing that failed.

**`digest` is Next's identifier, not the platform's correlation ID**, and the
copy says so. I21's correlation ID reaches the web application nowhere.

Widening `i27`'s walk produced three failures and all three were the check being
wrong: `layout.tsx`'s struck-through note read as a live `lang="en"`, and `Ara`
and `Tekrar dene` reported as English — the third time that same fact has
surfaced.

## I30 Offering Visuals

An Offering can hold visuals, and the Business logo the platform has stored
since I1 reaches a screen for the first time. Findings are in
`docs/implementation/I30_OFFERING_VISUALS.md`.

**Three Frozen acceptance criteria could only ever half-pass.**
`US-DSC-F06-001` AC-4 asks for the supplied primary visual and
`listingCardSchema` had no field for one; `US-OFR-F05-001` AC-4 asks for the
set and the repository filled `visuals` from a literal `[]`; AC-5 names the
supplied logo and no surface rendered it. A criterion that can only fail in one
direction is not a criterion that passes.

**A comment claimed three fields and the code rendered two.** It was false for
as long as the section existed, and is made true by adding the logo rather than
by being corrected downwards.

**An address, not bytes**, following `business.logo_url`. The guard on what may
be _rendered_ lives in `apps/web/src/image-source.ts`; what may be stored is
unchanged, because `US-BUS-F02-001` Out of Scope §11 excludes technical URL
validation and rendering is what made the absence load-bearing.

**I29's closure record was wrong.** Sixteen English submit labels survived all
three consolidations — the fifth blind spot in the English-detector, which reads
only what sits between tags and never sees `{pending ? "Saving…" : "Save"}`. A
sixth, general correction was attempted and abandoned: Turkish and English are
not separable by character class at word level, so the labels are asserted by
value.

## I29 Turkish Consolidation — UX-0006

Admin's seven surfaces, and the last of the three. The `platform/*` modules
already owned their words and were translated in place; `platform/copy.ts` holds
only what was inline. Findings are in
`docs/implementation/I29_TURKISH_ADMIN.md`.

**The Analytics tables rendered the contract's own identifiers.** An Admin read
`UNRESTRICTED`, `PUBLISHED`, `NOT_VALIDATED` and `MOBILITY: 3` on the screen
that describes the platform. No source-reading test could have found it: these
strings are never literals in the JSX, they arrive as data — so the
English-detector that had been corrected four times was structurally incapable
of seeing them, and three increments walked past.

**Two comments described an accident as a decision.** `panel.ts` and
`layout.tsx` both explained the English/Turkish division as deliberate, one of
them attributing it to "the Owner's decision". No Owner made it. Both are struck
through rather than deleted.

**A unit test proved a resolver and the screen ignored it.** A mutation putting
the raw Domain key back on screen passed against `tallyLabel`'s own case,
because a function being right says nothing about whether the surface calls it.
The assertion is now against rendered markup.

**The production build caught what nothing else did**: the new imports used
`.js` extensions, correct for the tests and unresolvable by the web bundler,
which the type check and all 883 tests passed over in silence.

## I28 Turkish Consolidation — UX-0005

The Business Dashboard's five surfaces. Most of the copy was already centralised
in the `business/*` modules and merely English, so it was translated in place;
`business/copy.ts` was added only for what remained inline in the pages.
Findings are in `docs/implementation/I28_TURKISH_BUSINESS.md`.

**The translation created a defect and the tests found it.** Three of the four
eligibility labels came out containing the fourth — `Herkese açık değil`
contains `Herkese açık` — so an assertion that a withheld Offering is _not_
shown as public would have passed while the screen said the opposite. The same
shape appeared in the lifecycle: `Arşivle` is a prefix of `Arşivlenmiş`, the
heading an Archived Offering sits under. Both were caught by tests that had been
passing on English, which is the useful part: **a translation re-runs every
string comparison in the suite.**

**The English-detector has now been wrong four times** — too narrow, then wide
enough to catch JavaScript, then correct on sentences but blind to single words.
A mutation put `<h2>Offerings</h2>` back and it passed. Dropping the two-word
minimum immediately found **nine more** untranslated labels that three earlier
versions had walked past.

## I27 Turkish Consolidation

**The application was bilingual and nobody chose it.** The root declared
`<html lang="tr">` and the public journey was Turkish, while **eighteen surfaces
declared `lang="en"` and were written in English** — the Business Dashboard,
every Admin screen and all of authentication. A person searched in Turkish,
pressed _Giriş_, and arrived at **Sign in**. Findings are in
`docs/implementation/I27_TURKISH_CONSOLIDATION.md`.

Following the Owner's sequencing decision of 2026-08-21, this is the first of
three and covers UX-0008's six surfaces.

**The vocabulary comes first**, in `apps/web/src/vocabulary.ts`, so three
translations do not produce three words for one concept — anchored to what
Discovery and Compare have said since I4 rather than freshly chosen.

**Strings are extracted rather than inlined**, following `decision/copy.ts`.
That is what §9.2 of the design foundation asks i18n to need, so doing it as the
translation means i18n later changes one module instead of every route again.

**The test passed while it was wrong.** Its first version listed English words to
look for and missed two whole English sentences that began with words not on the
list. Rewritten to look for the shape — rendered text with no Turkish-specific
letter — it caught both. A test that enumerates what to catch catches what
somebody remembered.

## I26 Design Foundation

**No Frozen UX document specifies visual design.** UX-0001 through UX-0009
specify behaviour; the one colour reference in the baseline is UX-0001 §16's
"perceivable without color alone", which is an accessibility constraint rather
than a palette. So 22 proven, accessible routes were dressed in 263 lines of CSS
written to make pages legible. The Owner approved a foundation —
`docs/design/DESIGN_FOUNDATION_CANDIDATE.md`, direction **calm, content-first**,
no existing brand — and this implements it. Findings are in
`docs/implementation/I26_DESIGN_FOUNDATION.md`.

Three measured defects it replaces: **the typeface was never loaded** (`Inter`
was asked for and nothing fetched it), **there was no responsive design** (zero
media queries), and **a control border failed WCAG 1.4.11** at roughly 1.6:1.

**The proposal's own contrast table was wrong.** It published _estimated_ ratios
and said they were claims until measured. Measured first: `--border-strong` was
given as 3.1:1 and is **1.63:1** — a control boundary a person with low vision
cannot find. Five other estimates were off without changing a verdict. **The
ratios are now a test that reads the real stylesheet**, because a document cannot
fail.

**A deviation, recorded rather than hidden.** §5 asked for Inter to be loaded;
`next/font/google` fetches at build time and fails the build when Google is
unreachable — it did, here. Rather than make every deployment depend on a third
party, the false claim was removed and the platform stack is what renders.
`next/font/local` with committed files is the way back.

## I25 Request Budget

Engineering Constitution §13 requires every production component to define
behaviour for timeout, and every outbound edge had one except the edge a person
waits on: Postmark 10s, the Chat provider 8s, PostgreSQL 5s and 2s — and the web
application's twenty-seven calls to the API, **none**. Node's `fetch` has no
default. Findings are in `docs/implementation/I25_REQUEST_BUDGET.md`.

**This made the two preceding increments hollow in their likeliest case.** I23
and I24 built bounded surfaces for a failed read, and a surface is rendered by
finishing the render — a request that never returns never reaches one.

Ten seconds, chosen by the Owner on 2026-08-19, and derived upward rather than
picked: it must exceed every budget beneath it, or this side would abort a
request the API was about to answer correctly and cut off a healthy Decision Chat
at eight seconds.

A timeout raises `504`, which `isApiUnavailable` already treats as unavailable —
so a hang lands on the existing surfaces with no new branch. A network failure is
left alone, because it is not this request being slow.

**Sixteen reads are budgeted and none of the eight writes.** Aborting a write
does not undo it, so reporting a timeout as failure would claim an outcome this
application does not know — UX-0005 §15 cuts both ways. An honest timed-out write
needs a third answer and a retry-safety story, and neither is designed.

## I24 Zero or Unavailable

UX-0006 §14 states a rule in five words — **"no analytics data: distinguish zero
from unavailable"** — and both authenticated api layers broke it on every read.
`if (!response.ok) return null;` appeared thirteen times, collapsing _this is not
here or not yours_ and _the API did not answer_ into one value; thirteen pages
then turned that value into `notFound()`. Findings are in
`docs/implementation/I24_ZERO_OR_UNAVAILABLE.md`.

So during a database outage the platform said, confidently and falsely: **a
Business owner's own Business does not exist**; **the Admin panel does not
exist**; an owner with a correction notice waiting had none; and the Create
Offering control simply vanished, which reads as a permission being withdrawn.

`404` is not neutral here. It is the deliberate answer the API gives somebody
with no standing to learn a thing exists — which is precisely why it must not
also be given to somebody who owns it.

**A comment already claimed the distinction the screen did not make.** The
notices region said an empty list "would say nothing needs your attention, which
is not what a failed read means" — and rendered nothing at all, which says the
same thing to the person looking.

`4xx` still means absent, deliberately: `401`, `403` and `404` refuse without
confirming existence, and turning them into "unavailable" would leak that there
is something there to be unavailable. Only the primary read gates a page, per
UX-0006 §15's "does not block unrelated actions where their data is available".

## I23 Error Behaviour

**Every one of the eight Frozen UX documents has an "Error Behaviour" section,
and the web application implemented none of them.** Twenty-two routes, zero
error boundaries — no `error.tsx`, no `global-error.tsx`, no `not-found.tsx`
anywhere — so any failed read threw and Next.js replaced the whole page with its
built-in crash screen. Findings and boundaries are in
`docs/implementation/I23_ERROR_BEHAVIOUR.md`.

**Nothing in this repository recorded the gap.** It was neither implemented nor
known, which is why it is stated plainly here rather than as an increment note.

I22 sharpened it. The API now answers a database outage with `503
DEPENDENCY_UNAVAILABLE` — temporary, your request was fine, come back — and the
person was shown an application crash, which says the opposite about a different
system.

The Owner scoped this increment to **the mechanism plus the public path**:
UX-0001 §13's two states and UX-0002 §14's three. Six documents remain queued,
and the adjacent Empty-and-Loading sections were kept separate because "it
failed" and "it has not arrived yet" are different questions.

`ApiRequestError` keeps the status instead of folding it into a message, so a
page can tell a dependency being unavailable from its own code being broken.
`isApiUnavailable` is `5xx` only: a `4xx` is this application's mistake and a
`TypeError` is a defect, and both must keep reaching the crash screen rather
than being hidden behind "please try again".

**No `error.tsx` was added, deliberately.** A Next.js error boundary is a Client
Component that cannot read cookies, so it could not show the person their
criteria — the first thing all five states require.

## I22 Database Outage

R3.6 of the release criteria candidate asks that the product degrade honestly
when PostgreSQL is unavailable: readiness fails, requests answer `503
DEPENDENCY_UNAVAILABLE`, **nothing reports a defect**. A real embedded server was
stopped underneath a running API before anything was changed. Findings and
boundaries are in `docs/implementation/I22_DATABASE_OUTAGE.md`.

Readiness and liveness were already right. **The other two parts were not.** Every
route answered `500 INTERNAL_ERROR` — the platform reporting a defect it did not
have, on every request, for the whole duration of somebody else's outage, while
telling clients not to retry. And `/metrics` answered `500` at the exact moment
monitoring is most wanted, even though two thirds of what it publishes never
needed the database.

I19 taught the filter about a database that is **present but slow**. A database
that is **absent** was neither of its two kinds, so it fell through. The
classification now lives in `@commerce/database` as one function covering all
three, beside the pool it describes.

`null` is the important return: constraint violations, syntax errors and ordinary
bugs stay `500`, because a classifier that swallowed them would answer "try again
later" to requests that can never succeed.

The database-derived gauges are **omitted rather than zeroed** during an outage.
`commerce_outbox_pending 0` reads as "mail is flowing" and would silence the
alert that should be loudest; a new `commerce_db_reachable` says why they are
absent.

**A claim in the I20 record was corrected rather than left standing.** That
record says the metrics content-type bug was fixed by moving the header past the
permission check. It was not — the header still ran before the scrape, so any
collection failure reproduced the identical error, which is exactly what an
outage caused.

## I21 Correlation

Engineering Constitution §12.3 requires asynchronous flows to support correlation
across boundaries. The identifier existed — in every error envelope and every
`audit_record` — and **crossed neither boundary an incident starts from**.
Findings and boundaries are in `docs/implementation/I21_CORRELATION.md`.

Fastify stamped its own `req-1`, `req-2` on the automatic request and response
lines, so the failure a person quotes and the route that produced it could not be
joined; and a per-process counter is a different request on every replica. The
outbox carried nothing, so "the confirmation email never arrived" — the report
this platform will receive most — could not be traced to the request that asked
for it.

**Fastify's request id was made to _be_ the correlation identifier** rather than
adding the identifier to its lines. Both produce correct lines; the second leaves
two identifiers and a permanent chance of divergence. Nothing gained a field —
one field stopped existing.

`outbox_event` gained a nullable, indexed `correlation_id`. **Nullable rather
than required**, because a row with no request behind it has no identifier, and a
default of a fresh UUID would give it one that joins to nothing while looking
exactly like one that joins.

The increment found a gap it did not set out to find: a request that **succeeded**
gave the caller no identifier at all, since the envelope only exists on failures.
An `onSend` hook now echoes `x-correlation-id` on every response.

## I20 Metrics

Engineering Constitution §12.2 requires every production component to expose
metrics appropriate to its role. **There were none** — no endpoint, no counters,
no dependency that could produce them. Findings and boundaries are in
`docs/implementation/I20_METRICS.md`.

The set is not a survey, because §12.2 also warns that "a metric is useful only
when its meaning, unit, owner, and response are understood". It is the questions
the last three increments raised and could not answer: I18 called ten "a default,
not a measurement", I19 called five seconds "a judgement, not a measurement", and
I17's sweep "has never run against a table with a real backlog". Every series
carries a `HELP` line saying what to do about it, not only what it counts.

**Almost nothing is instrumented at a call site.** The pool is asked what it
holds and the database what it contains; only a cancelled statement and a refused
connection are counted in process, because they leave nothing to read afterwards.

**The worker is a separate process, and reading its state beats reading its
counters.** A count of rows the sweep deleted says it ran; a gauge of rows still
waiting says whether it is keeping up — and if the worker dies, every one of them
climbs on its own.

The gate accepts a bearer token or an entered Admin context, because a Prometheus
scraper has no browser and no cookie: requiring an Admin session would have made
these readable only by a person, which is a dashboard rather than monitoring.

## I19 Database Timeouts

Engineering Constitution §13 requires every production component to define
behaviour for timeout. The outbox has retry and backoff, the vendors have
request timeouts — **the database dependency had none**, so a query that hung
held its connection until PostgreSQL or TCP gave up. I18 sharpened that in the
act of fixing something else, and recorded the gap in its own closure. Findings
and boundaries are in `docs/implementation/I19_DATABASE_TIMEOUTS.md`.

The Owner set two of the three budgets on 2026-08-18: a statement is cancelled
after five seconds, and a caller waits two seconds for a free connection before
being refused. `idle_in_transaction_session_timeout` is ten seconds and was not
put to the Owner — a statement timeout does not cover `begin` followed by
nothing. All three are set on the connection rather than per query, so no
statement can escape them.

**A timeout is not a defect.** A cancelled statement used to become
`500 INTERNAL_ERROR`, which tells a client the opposite of the truth. It now
answers `503 DEPENDENCY_UNAVAILABLE` — a code already published for that status,
so the contract is unchanged.

**And it would have introduced one.** A dead connection emits `error`, and an
emitter with no listener throws: adding the idle-transaction timeout without a
handler would have crashed the API on exactly the condition the timeout exists
to survive. The first attempt listened only on the pool, which covers an idle
connection but not a checked-out one — caught by the test that holds its client
while the server kills the session.

## I18 Connection Budget

Every repository built its own `Pool`. There were fifteen in the API and `pg`
defaults `max` to ten, so **one instance could open a hundred and fifty
connections against a database whose own default ceiling is a hundred.** A second
instance was arithmetically impossible, one instance could exhaust a
default-configured PostgreSQL by itself, and the pools could not lend each other
anything — fourteen sat idle while the fifteenth queued. Findings and boundaries
are in `docs/implementation/I18_CONNECTION_BUDGET.md`.

`createDatabasePool()` in `@commerce/database` is now the only place a pool is
built; the API registers it as a provider and the worker holds it in `main`.
`DATABASE_POOL_MAX` exists because the ceiling is a property of the deployment.
It is a factory rather than a singleton on purpose: `m11-health` proves readiness
fails against an unreachable database by handing a repository a pool it closed,
and only a dependency somebody passes in can be substituted that way.

**It also corrected a comment that was wrong when it was written.**
`chat.service.ts` said a saturated pool would stop every request in the process;
Chat had its own pool then, so it starved only Chat. The sentence is true now,
which is why the I12 fix matters more after this increment than before it.

## I17 Retention Sweep

ADR-0012 §3 names "cookie security, CSRF defense, rotation, expiry and session
cleanup" as mandatory controls. Four existed; **session cleanup did not, and
neither did any other kind.** Six tables carry an `expires_at`, five index it,
and nothing had ever used that index to delete a row — every record was filtered
out once it stopped being usable and none was removed. Findings and boundaries
are in `docs/implementation/I17_RETENTION_SWEEP.md`.

Table growth is the visible half. The half that set the priority is that an
abandoned `pending_registration` held an email address and a password hash
indefinitely, for somebody who never became a User — while `US-IDN-F02-001` AC-7
is explicit that a pending registration is not an account state.

The windows are Owner decisions taken on 2026-08-18, because no Frozen document
states a retention policy: expired registrations and password resets go at
expiry with no grace, processed outbox events go after thirty days, and **dead
letters are never deleted**. Nothing in the outbox statement names a dead letter
— it is a row that is unprocessed and has stopped being claimed, so
`processed_at is not null` excludes it by construction, along with every event
still waiting.

**Writing the sweep exposed a real defect.** `decision_flow.comparison_set_id`
cascades on delete, deliberately, but both records lived sixty minutes from
their _own_ creation and a flow is always built on a set that already exists — so
a flow entered half an hour into a Compare claimed sixty minutes while the
cascade was going to end it in thirty, mid-decision, taking the context with it.
`enterWithComparisonSet` now caps the flow at its set's expiry, which makes the
claim true rather than making the cascade wrong. The alternative — extending the
set — is recorded in the closure as the thing an Owner might prefer.

## I16 Test Principal Removal

`TestPrincipalAdapter` minted a `Principal` from `x-test-user-id` headers,
because M11 had an authenticated HTTP surface and identity was two increments
away. It refused to construct in production, so it was never a way in — but it
was a second code path to the answer that decides who a request is, and I1
recorded that it should go once nothing depended on it. Fifteen increments later
one suite still did. Findings and boundaries are in
`docs/implementation/I16_TEST_PRINCIPAL_REMOVAL.md`.

`m11-http.integration.test.ts` now registers, confirms by the emailed link and
carries a real session cookie. Ten of its eleven cases changed only in how they
authenticate. The eleventh — "refuses a malformed principal instead of failing
inside the driver" — presents a malformed session token instead of malformed
headers. It still catches a resolver that admits an unresolvable session, but it
no longer fails for the _driver_ reason its name gives: the token is hashed
before it reaches SQL, so a malformed value structurally cannot arrive at a
column. The name is a historical description now, and is left visible as one.

**The adapter left a bypass behind.** `Principal.businessId` was optional, and
every caller read the absent case as _skip the Business context check_ — an
authorization hole sitting in the type as a legitimate state. It is required
now, so the hole is unrepresentable rather than merely unused, and the nine
`m11-authorization` cases that had been reaching their denials through it each
select the Business they act in.

## I15 Attribute Filter Controls and Search Narrowing

`US-DSC-F05-001` was implemented in the API in I3 and covered by twelve tests.
It had no surface: a person could reach a leaf Category, see the Offerings in it
and not narrow them, because the response carried the Filters and the view
ignored the field. Findings and boundaries are in
`docs/implementation/I15_ATTRIBUTE_FILTERS_CLOSURE.md`.

It also falsified a claim in this document. Every Frozen UX document has a
surface, but not every section of one — **UX-0002 §9 is an entire section on
Filter Behaviour** and none of it could be reached. The Development row above is
now qualified rather than left to read as more than it meant.

Three decisions are worth remembering. The offered Filters are fetched from the
API rather than carried through the form, because a submitted list of what may
be applied is a list the browser can edit. An empty control is not a value: an
empty Number box read as `0` would apply a Filter nobody chose, and since an
Offering without a value does not match an applied Filter, it would remove
results rather than merely mislead. And Filters travel in the same short-lived
carrier as the query, because UX-0002 §4 keeps shareable URL state out of V1 and
a Filter in a query string is that state.

## I13 Vendor Selection

The Owner chose Postmark for outbound email and Anthropic for the Decision Chat
assistant on 2026-08-17, closing the last two items no implementation could
reach. Findings and boundaries are in
`docs/implementation/I13_VENDOR_SELECTION_CLOSURE.md`.

Both adapters were exactly what I11 and I12 promised: four values and three,
plus one judgement each. Nothing about the timeout, the secret handling, the
prompt, the ceiling or what a person is told had to move, which was the point
of writing those first.

**The email judgement is which refusals are permanent.** `REFUSED` stops the
outbox for good, so it must mean asking again gets the same answer about this
recipient: an inactive address and a malformed one. Everything else retries,
including things that look permanent — an unconfirmed sender signature is
permanent about the _deployment_ rather than the message, and dead-lettering
queued registrations because of a five-minute configuration mistake would be the
wrong trade. The ceiling handles those.

**The assistant judgement is what counts as an answer.** A refusal could be read
from `stop_reason` and deliberately is not: that vocabulary belongs to the vendor
and can gain members, so code matching a list would hand an unfamiliar refusal to
a person as an answer. The text is what was asked for, so the question is whether
there is any.

One assertion in the new tests turned out to be worthless — a `toMatchObject`
with a regular expression against a discriminated union, passing against a
pattern that could never match. The mutation check found it, and it is recorded
rather than quietly repaired.

## I12 Decision Chat Transport

The assistant had the same four things missing that email did — the prompt, the
bound on the wait, the secret handling and the vendor as configuration — and one
thing email did not. Findings and boundaries are in
`docs/implementation/I12_CHAT_TRANSPORT_CLOSURE.md`.

**The whole act ran inside one database transaction:** read the brief, ask the
vendor, check the answer, record the turn. That held one of the connection
pool's ten connections open across a call to somebody else's service. Ten people
asking a slow assistant at once would have stopped every other request in the
process — including every request that never goes near Chat — and a vendor that
answered slowly rather than failing would have presented as a database outage.
It is now three steps with the vendor call outside any transaction, and the
integration test asks the database, from inside the vendor call, how many
connections are sitting in an open transaction.

The prompt is composed in `@commerce/decision` from the brief alone, which is
what makes AC-4 a property of a function rather than a promise a vendor keeps.
The two prohibitions AC-6 states are written into the text the vendor receives
as well as enforced after it answers — a rule kept in a vendor's console is a
rule no review sees and no test reaches.

An assistant that will not answer is now separate from a reply the platform
refuses. The person gets a different sentence for each and only one invites
trying again; neither records a turn, because the invention check sits between
the two transactions rather than after the write.

## I11 Email Transport

`CURRENT_STATUS.md` had said since I1 that choosing a vendor was the only thing
blocking a deployable registration flow. **It was one of four, and the only one
needing an Owner.** The other three are now written; findings and boundaries are
in `docs/implementation/I11_EMAIL_TRANSPORT_CLOSURE.md`.

A delivery could hang the worker. `processBatch` awaits the dispatcher and
nothing bounded that wait, so a provider that accepted a connection and then
said nothing would stop every message behind it — not by failing, which the
outbox handles, but by never answering, which it cannot see. Every attempt is
now bounded, and a timeout, a refused connection and a DNS failure are one
answer: ask again later.

Everything was retried forever. Nothing read `attempts` as a limit, so an
address a provider will never accept came back every three minutes for the life
of the deployment. There are now three outcomes rather than two — accepted,
unavailable, refused — and a refusal stops. A dead letter is a row that stopped
rather than a new lifecycle state: no column and no status were added, because
"unprocessed, at the ceiling" already describes it.

The vendor was a code decision despite the port saying otherwise: `main.ts`
named its dispatcher in a source file. `loadEmailConfig` now reads it from the
environment and validates at boot, so a production deployment asking for real
delivery without a credential fails to start rather than starting healthy and
turning every registration into an unwatched retry.

What a provider differs by is four things — a name, where the request goes, what
its body is called, and how its answer is read. `read` takes the response body
as well as the status because providers disagree about where the verdict lives,
and one that only read the status would call a suppressed address delivered.

Twelve tests, each verified to fail against the behaviour it replaced. No vendor
is chosen and no Story is touched.

## I10 Accessibility

Every surface was already semantic HTML with no invented styling, so this
increment changed almost nothing a sighted person sees — two heading levels and
one label — and a great deal of what the platform says about itself to software
that reads it aloud. Findings and boundaries are in
`docs/implementation/I10_ACCESSIBILITY_CLOSURE.md`.

The largest was the page title. **All twenty-two routes returned `Commerce
Platform`**, so a person restoring a session, reading a history list or hearing
the page announced on arrival learned nothing about where they were. Each route
now carries its own `h1` as its title, which invents no copy.

The second came out of the Owner's own language decision. The public journey is
Turkish and the entered contexts are English, and `<html lang="tr">` therefore
described seventeen of twenty-two routes wrongly — a screen reader applies
Turkish pronunciation to English words, which is nearer noise than accent. Each
English surface now declares `lang="en"` on its own `main`.

Three further findings were real: Listing Cards rendered `h3` directly under an
`h1`, two Category controls had only a `legend` to name them, and one navigation
landmark of two rendered together had no accessible name.

**Three of the first six findings were mistakes in the audit rather than in the
code** — a Homepage `h1` that lives in a component, table `scope` attributes
that were all present, and seven of nine "unlabelled" controls that use template
identifiers the first detector could not see. Recorded in the closure, because
a scan that reads files instead of rendered output will always find component
boundaries invisible.

Six tests assert the properties across every route and each was verified to
fail: five regressions were introduced at once and each was caught by its own
test and no other.

No Story's behaviour, criteria or Delivery Status changed.

## I9 Delivery Status Advancement

Nine `US-IDN` Identity Stories advanced from `Not Started` to `Done` — the first
Delivery Statuses to move in the repository's life. `DELIVERY_SEQUENCE.md`
allows the move only in a change carrying code, tests and traceability evidence;
the code and tests had existed since I1, and the evidence had not. It is now in
`docs/implementation/DELIVERY_STATUS_ADVANCEMENT.md`, one Acceptance Criterion
at a time.

Reading all 81 Identity criteria against the suite found twelve that nothing
asserted, eleven of the same shape: each is about what an action leaves alone.
Logging out is easy to prove; logging out without quietly dropping a Business
ownership is the part nobody had checked. They are proved by the eight tests in
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

**Since answered.** The Owner read AC-3 as satisfied by one ordered set, and
`US-OFR-F05-001` is `Done`. Accepting that reading made the order load-bearing
and found it was not actually ordered — `attribute_definition.name` is not
unique, so two same-named Attributes could swap places between two reads. See
`docs/implementation/AC3_ATTRIBUTE_GROUPING_DECISION.md`.

Discovery's ten Stories needed one test. Eighty of its 81 criteria were already
reached — `US-DSC-F05-001`'s twelve Filter rules have twelve tests — and the
exception is a criterion about an _ending_: `US-DSC-F09-001` AC-3 ends
Discovery's responsibility for an open once the Offering is handed on. An
ending is only observable as things that stop happening, which is why it was
easy to leave unasserted. It is now checked from both visible sides: the path
answers identically before and after, and `offering_presentation_open` is
asserted against the schema to have no column that could name a Discovery path.

Decision's 72 criteria needed one test — `US-DEC-F03-001` AC-5's clause about
comparable Attribute differences, undemonstrated because every existing Chat
test enters a flow holding one Offering and a difference needs two. It sits
directly against AC-6, which forbids a ranking, a winner and a recommendation,
so the platform's answer is to put both authoritative values where a person can
hold them side by side and stop.

Platform's 133 needed one, and it is the hardest kind to write: AC-18 forbids
ten things Basic Analytics must never become, none of which exists, so there
was nothing to call and watch refuse. The assertion that earns its place is
about shape — the snapshot's nine top-level keys asserted as an equality, no
Business named anywhere in the Admin figures, and a `groupBy` parameter either
refused or ignored but never honoured.

**Seventeen criteria had no test at all**, closed by nineteen tests across five
new files. Offering needed none: its 64 criteria were already reached by suites
written from the Stories rather than from the code. Ten criteria are covered by
absence rather than assertion, and are marked as such.

**One criterion was not merely untested — it was unmet.** `US-IDN-F09-001` AC-2
requires the authentication return to carry the explicitly chosen contact
channel, and it was carried nowhere. The same requirement is `US-DEC-F06-001`
AC-7 and AC-8 from the other side, so one change closed three criteria — and
read alone, AC-7 had looked satisfied by the `401` that interrupts the Guest.

The opening scan counted citations and reported 71 of 526. Read as coverage
that was badly wrong: the tests were written from the Stories and reach almost
all of them, citing the UX section rather than the AC numbering.
`US-PLT-F10-001` showed zero citations while eleven tests covered all eighteen
of its criteria. The scan said where to look, not what was there; every row was
settled by reading the criterion and the test together.

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

1. ~~Decide `US-OFR-F05-001` AC-3.~~ **Done 2026-08-17.** The Owner read the criterion as met by one ordered set; all 50 Stories are `Done`. See `docs/implementation/AC3_ATTRIBUTE_GROUPING_DECISION.md`.
2. ~~Select an outbound email vendor.~~ **Done 2026-08-17.** Postmark, wired in `buildDispatcher`. The first real send has still not happened.
3. ~~Select a Decision Chat assistant vendor.~~ **Done 2026-08-17.** Anthropic, wired in `buildAssistant`. The first real question has still not happened.
4. Review, approve and — if decided — freeze `docs/traceability-v1.1-candidate.md`. The superseding revision is written and carries both queued corrections plus the implementation tier; it deliberately holds no Approval or Freeze note, because neither decision is mine to record. Frozen v1.0 stays the authoritative baseline until then. `docs/implementation/TRACEABILITY_V1_1_REVISION_RECORD.md` lists the four remaining Owner steps.
5. Test with a real screen reader. `I10_ACCESSIBILITY_CLOSURE.md` closes what could be read from the source; nothing there substitutes for hearing a page.
6. ~~Write the two local schema checks Known Boundaries claimed and did not have.~~ **Done 2026-08-17.** `i14-schema-migrations.test.ts`, three tests, 53 owning relations and 54 foreign keys compared.
7. Send one real message through Postmark and ask one real question through Anthropic. Every test to date drives a stub, and the failures that only appear against a live vendor — an unconfirmed sender signature, a model name that does not exist, a regional restriction — appear then.

## Known Boundaries

- Non-blocking audit observations were not silently applied to Frozen Story content.
- `UX-0007 Messaging` is retained as historical Draft v0.2 outside the Frozen V1 baseline and is not required by any validated V1 Feature chain.
- Platform Parent and Generated Story lifecycle metadata now carries the missing Freeze evidence for the already-authorized 2026-07-25 Owner Freeze; Story behaviour and Delivery Status are unchanged.
- The monorepo skeleton implements only accepted architecture boundaries and technical health checks; it does not claim product behaviour.
- `prisma validate`, `prisma migrate deploy` and `prisma migrate diff` cannot run in the local verification environment: the Prisma engine host answers 403 there. **Nothing stands in for them locally.** An earlier version of this line claimed schema syntax was checked through `@prisma/prisma-schema-wasm`; no such check exists in this repository, and the claim is withdrawn rather than quietly dropped. All three are proven in target CI and nowhere else.
- Authentication is application-owned: Argon2id credentials and server-managed opaque sessions, per `docs/implementation/IDENTITY_IMPLEMENTATION_DECISION.md`. ~~The `TestPrincipalAdapter` survives only as a development affordance.~~ **Deleted in I16.** The session cookie is now the only way to become a principal; `ENABLE_TEST_PRINCIPAL` is gone from the environment and `Principal.businessId` is required, so the "no selection, skip the context check" state the adapter needed no longer exists.
- ~~The Business Dashboard speaks Turkish as of I28. **Admin's seven surfaces remain English**, the last of the three.~~ **Finished in I29: all twenty-two routes are Turkish.** ~~**The substring hazard is fixed where it was found, not prevented**~~ — the pairwise check landed in I29, and it exempts the bare terms, because a label containing a term is the design rather than a defect. **It does not cover sentences**: `i24` asserted on the word `yüklenemedi`, which two different messages now share, and that was found by breaking rather than by the check. `toLocaleUpperCase("tr")` now has its first use, lower-casing a term mid-sentence where a plain `toLowerCase()` would turn `İlan` into `i̇lan`.
- Authentication speaks Turkish as of I27, with the domain vocabulary owned in one module and every string extracted. **Twelve surfaces remain English** — the Business Dashboard's five and Admin's seven — and they are the next two increments. **The Turkish has not been read by a Turkish speaker other than its author**; it is consistent, and consistency is not the same as sounding right. **`toLocaleUpperCase("tr")` is used nowhere yet** because nothing upper-cases user text, and a plain `toUpperCase()` would turn _ilan_ into _ILAN_ rather than _İLAN_.
- The application has a visual design foundation as of I26, and **nobody has seen it**: every claim is computed — contrast from hex, layout from CSS rules — with no screenshot, no device and no person. R4.7's screen-reader session remains open. **No webfont is loaded**, deliberately, so a build cannot fail because a third party is down. **Dark mode is absent** and would double every contrast check. **No `loading.tsx` exists**, so the Skeleton component was not built. **The application is still bilingual** — fourteen surfaces remain `lang="en"` with English copy, which is the next increment in the approved sequence.
- The web application's reads are bounded by a ten-second budget as of I25, per Engineering Constitution §13 and the Owner's decision of 2026-08-19. **The eight writes are deliberately unbudgeted** — an aborted write may already have happened, and calling that a failure claims an outcome nothing knows. **Ten seconds is a judgement, not a measurement**, the third such number after `DATABASE_POOL_MAX` and `statement_timeout`; R3.4 asks for all of them under load. **Nothing counts web timeouts**: the web application publishes no metrics at all, so a deployment cannot see whether the number is right — §12.2 has never been read against it.
- Absence and unavailability are separate answers on every authenticated route as of I24, per UX-0006 §14. **Only reads were changed**: UX-0005 §15's failed-save and failed-action lines concern the mutation paths, which were not re-examined. **Four of the eight Error Behaviour documents remain queued** — UX-0003 §16, UX-0004 §14, UX-0008 §14, UX-0009 §18.
- The public path presents the Error Behaviour its Frozen UX documents specify as of I23: UX-0001 §13's two states and UX-0002 §14's three. **Six of the eight documents are still untouched** — UX-0003 §16 beyond the Listing Card case, UX-0004 §14, UX-0005 §15, UX-0006 §15, UX-0008 §14 and UX-0009 §18 — so a failure on those routes still reaches Next.js's crash screen. **Empty and Loading Behaviour is a separate gap**: UX-0005 §14 and UX-0006 §14 are unimplemented and there are 0 `loading.tsx` files. **Nothing distinguishes a slow API from an unavailable one**, because the web application sets no `fetch` timeout — the same §13 gap I19 recorded for the database, one layer up. The bounded surface has not been heard through a screen reader.
- The API degrades honestly when PostgreSQL is unavailable as of I22, per Engineering Constitution §13 and R3.6: readiness fails, liveness keeps answering, every route gives `503 DEPENDENCY_UNAVAILABLE`, and `/metrics` still serves the pool gauges and counters with `commerce_db_reachable 0`. **This is R3.6's behaviour and not its evidence** — the criterion asks for a deliberate outage in a non-production environment, and there is no environment. The worker was not changed: its outage handling is already honest and it has no caller to answer. **The web application's behaviour on a `503` was not assessed.** Nothing retries, which is the same §13 gap I19 recorded.
- One correlation identifier crosses every boundary as of I21, per Engineering Constitution §12.3: computed at ingress, carried as Fastify's `request.id`, echoed on every response, written to `outbox_event` and read back by the worker. **Nothing joins the two processes' logs, because there is no log aggregator** — the identifier is present on both sides and correlating them is a deployment capability that does not exist, the same boundary R1.2 and R1.4 report. The web application does not send an identifier of its own, so a browser-side failure that never reached the API has none. Only the two identity producers stamp the outbox, since they are the only ones that write to it; a future producer that forgets leaves `null`, and nothing enforces otherwise because a `not null` constraint would be wrong for a producer with no request behind it.
- Metrics exist as of I20 and **nothing alerts on them.** R1.4 of the release criteria — somebody paged when the outbox stops draining, when dead letters appear, or when readiness fails — needs a monitoring system that does not exist, and metrics nobody is paged on are a dashboard. Timeouts are counted for the API only; the worker meets the same budgets and its failures surface as a stalled outbox instead. No latency, request volume or error rate: round one was scoped to what I17–I19 left unanswerable.
- The database dependency's timeout behaviour is defined as of I19, per Engineering Constitution §13: five seconds per statement, ten for an idle transaction, two to acquire a connection, all configurable and all set on the connection. **Five seconds is a judgement, not a measurement** — chosen against what V1 queries are supposed to do, never run against production volume. A timeout ends the request and **nothing retries**: §13 lists retry alongside timeout, and a database retry policy has not been designed, which is better than one that repeats an operation nobody decided was safe to repeat.
- One PostgreSQL connection pool per process, built by `createDatabasePool()` and capped by `DATABASE_POOL_MAX` (default ten), added in I18. **Ten is a default, not a measurement** — nothing here has been load-tested, and the right number for a real deployment comes from watching one. The budget is proven for the API against `pg_stat_activity`; the worker's single pool is asserted only by construction, having no HTTP surface to drive. Nothing bounds how long one request may hold a connection.
- Expired state is deleted by a retention sweep in the worker, every five minutes, added in I17 against ADR-0012 §3. The windows are Owner decisions of 2026-08-18: identity rows at expiry, processed outbox events after thirty days, dead letters never. **The sweep has never run against a table with a real backlog** — every statement is index-supported and none has been measured outside a test database. Occurrence tables are deliberately untouched: a retention policy for evidence is a separate decision and has not been asked.
- Outbound email is delivered by Postmark, chosen by the Owner on 2026-08-17 and wired in `buildDispatcher`. **No message has been sent through it.** `LoggingEmailDispatcher` remains the development adapter and still refuses to construct in production.
- Discovery criteria travel in a five-minute `httpOnly` cookie rather than the address, because UX-0002 §4 places persistent or shareable URL state outside V1. A Results page therefore cannot be bookmarked or shared, and refreshing loses the query — an accepted cost of not building something no Story promised.
- No public page may be prerendered or prefetched. Results depend on current eligibility, and opening an Offering produces an occurrence that a speculative fetch would fabricate.
- The Decision flow has a surface: Compare, Chat, selection, Affiliate Handoff and Direct Contact through to the two Completions, built in I8 against UX-0009.
- Decision Chat is answered by Anthropic, chosen by the Owner on 2026-08-17 and wired in `buildAssistant`. **No question has been asked through it.** The brief-restating adapter remains for development and refuses to construct in production. The invented-value check that guards `US-DEC-F03-001` AC-6 is numeric only and cannot detect a claim expressed in words.
- Current-flow Decision state expires after an hour. It is swept both on the next request that uses Decision — which is what makes an expired flow unreadable within the request that would have read it — and by the worker's retention sweep, which is what makes that true of a platform nobody is using. As of I17 a flow built on a Comparison Set expires no later than the set does, so the deliberate `ON DELETE CASCADE` can no longer end a live flow early.
- Attribute Filter controls exist on Browse and on Search as of I15, against UX-0002 §9, with Search narrowing (§7.2) as their prerequisite. Removing a narrowing outright is a judgement rather than a stated rule and is recorded as one in the closure.
- Web tests render server components through `react-dom/server` rather than in a browser. They prove markup and absence — which is most of what these Stories require — and nothing about layout, focus behaviour or responsive treatment.
- Discovery results are unpaged. No Frozen Discovery Story specifies a page size, a cursor or a "load more" affordance, and `US-DSC-F07-001` AC-3 and AC-5 require a stable deterministic order that a guessed pagination scheme could contradict.
- Discovery Starts are read by Basic Analytics, built in I7. They were captured from I3 onward, before anything consumed them, because occurrences cannot be reconstructed afterwards.
- Affiliate Destination Review, Validate, Enable and Disable are implemented as an Admin surface with Handoff Eligibility derived by a database biconditional over the authored pair, so no administration path can leave a changed destination eligible under an earlier validation. The Handoff itself belongs to `US-DEC-F05-001` in I5.
- A moderation case may be opened by any Admin against any target. Surfacing something for review is deliberately the cheap, safe act, so the case list is as disciplined as the people using it.
- An approved action is recorded against whatever Open case its target has, and against none where there is none. Moderation applied outside a case is a real situation and inventing a case for it would be worse — but an action taken while a case happened to be open is recorded against that case either way.
- Basic Analytics bounds occurrences by period and current state by nothing. Three of six core-flow indicators carry a Domain; a Search Discovery Start with no selected leaf Category has none at all, so that breakdown does not sum to its total. The gap is the truth rather than a defect, and a reader who does not know it will misread the figures.
- Admin authorization provisioning, and suspending or reinstating an Admin-authorized account, remain direct database operations reserved to the Product Owner. There is no route, parameter or flag that reaches either.
- Business Public Exposure Input cannot be written directly. A trigger refuses any update that contradicts the moderation status, so exposure changes by moderating the Business and by nothing else.
- Restriction is enforced per owner intent, and the intent is supplied by the calling route. The database cannot know what a caller is about to do, so this gate is code and tests rather than a constraint.
- All seven of PRD-0006's General Moderation actions exist, along with case re-review, approved action, no-action decision and closure. `closed_by` and `closed_at` are written when a case is closed. I7 completed this.
- The Business Dashboard has a surface, built in I8 against UX-0005: the Dashboard, Offering management, Affiliate Destination management and the bounded correction path.
- A migration must match Prisma's generated names _and_ spell both referential actions on every foreign key. An inlined `REFERENCES ... ON DELETE` leaves `ON UPDATE` at PostgreSQL's `NO ACTION` while the datamodel means `CASCADE`. The two checks this line claimed and did not have now exist, in `i14-schema-migrations.test.ts`: every relation the datamodel owns has a foreign key, and every foreign key spells the referential actions the datamodel means. They read text and do not replace the CI drift gate, which compares a real database; what they add is catching a migration that says less than the datamodel means before a push rather than after one.
- Category hierarchy invariants, Attribute mutation safety, Select arity and the Affiliate authoring reset are enforced in PostgreSQL rather than in application code. Check constraints, composite foreign keys and triggers are outside what Prisma models, so the schema-drift gate does not see them; the integration suites are what prove they are there.

## Revision History

| Version | Date       | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.54    | 2026-08-21 | Closed I28 Turkish Consolidation for UX-0005, the second of three. Most of the area's copy was already centralised in the `business/*` modules and merely English, so it was translated in place; a new `copy.ts` holds only what was inline in the pages. **The translation created a defect and the suite caught it**: three of four eligibility labels contained the fourth as a substring, so `not.toContain(ELIGIBLE)` would have passed against `Herkese açık değil` while the screen said the opposite — and `Arşivle` was a prefix of `Arşivlenmiş`, the heading an Archived Offering sits under, so "this screen offers no Retire action" would have been satisfied by the heading. Both were found by tests that had been passing on English, because a translation re-runs every string comparison in the suite. **The English-detector has now been wrong four times** and each correction found real defects the previous one missed; dropping its two-word minimum found nine more untranslated single-word labels. Nine existing tests updated, none weakened. Delivery Status unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2.53    | 2026-08-21 | Closed I27 Turkish Consolidation for UX-0008, the first of three under the Owner's sequencing decision. The application was bilingual by accident: the root declared `lang="tr"`, the public journey was Turkish, and eighteen surfaces declared `lang="en"` and were written in English — so a person who searched in Turkish and signed in changed language mid-journey. The vocabulary was built first so three translations could not produce three words for one concept, anchored to what Discovery and Compare have said since I4; `Arşivlenmiş` rather than `Silinmiş` because nothing here deletes an Offering, and `Kısıtlı` rather than `Yasaklı` because the restriction is bounded. Strings are extracted rather than inlined, which is exactly the shape §9.2 says i18n needs. Two security properties were asserted rather than assumed across the translation: the sign-in refusal still names neither half, and a spent, expired or forged link still get one message. **The test passed while it was wrong** — its first version listed English words to look for and missed two entire English sentences whose first words were not on the list; rewritten to look for text containing no Turkish-specific letter, it caught both immediately. Eight tests, seven mutations each caught. Delivery Status unchanged.                                                                                                                                                                                                                                                                                                    |
| 2.52    | 2026-08-21 | Closed I26 Design Foundation, the first visual-design work in the repository and the first thing built from a document that had to be written before it: no Frozen UX specifies visual design, so the Owner approved a foundation and this implements §11 of it. Three measured defects replaced — a typeface that was asked for and never fetched, zero media queries across the whole application, and an input border at roughly 1.6:1 against WCAG 1.4.11's 3:1. **The proposal's own contrast table was wrong and measuring caught it**: `--border-strong` was published at 3.1:1 and measures 1.63:1, so the approved palette would have shipped a control boundary a person with low vision could not find; five other estimates were off without changing a verdict. The ratios are now a test that parses the real stylesheet, because a document cannot fail. **One deviation from the approved proposal, recorded**: §5 asked for Inter to be loaded, `next/font/google` fetches at build time and failed the build here, and rather than make every deployment depend on Google the false claim was removed instead. What the direction forbids is enforced rather than remembered — no shadow, no animation, no removed focus ring, seven colour tokens, three breakpoints. Both tables stack into labelled rows below 768px. Eleven tests, seven mutations each caught. Delivery Status unchanged.                                                                                                                                                                                                                          |
| 2.51    | 2026-08-19 | Closed I25 Request Budget, supplying the timeout Engineering Constitution §13 required on the one outbound edge that had none. Postmark had ten seconds, the Chat provider eight, PostgreSQL five and two — and the web application's twenty-seven calls to the API had nothing, because Node's `fetch` has no default. That made I23 and I24 hollow in their likeliest case: their bounded surfaces are rendered by finishing a render, and a request that never returns never reaches one. Ten seconds, an Owner decision derived upward from the budgets beneath it rather than picked, since a shorter one would abort a request the API was about to answer correctly. A timeout raises `504`, which the existing `isApiUnavailable` already covers, so a hang reaches the existing surfaces with no new branch; a network failure propagates untouched, because it is not this request being slow. Sixteen reads are budgeted and none of the eight writes: aborting a write does not undo it, and reporting a timeout as failure would claim an outcome nothing knows. Eight tests against a `fetch` that answers only when aborted, six mutations each caught. **The module-realm trap I23 recorded caught me again** — recording it did not prevent the recurrence, so the class is now taken from the same import as the function under test rather than remembered. Delivery Status unchanged.                                                                                                                                                                                                                                 |
| 2.50    | 2026-08-19 | Closed I24 Zero or Unavailable, against a defect one line long and repeated thirteen times: `if (!response.ok) return null;` in both authenticated api layers, collapsing "not here or not yours" and "the API did not answer" into one value that thirteen pages turned into `notFound()`. During an outage the platform therefore told a Business owner that their own Business does not exist and an Admin that the Admin panel does not exist — the same answer the API deliberately gives somebody with no standing to learn a thing exists, which is exactly why it must not be given to somebody who owns it. Two further silences: the correction-notices region rendered nothing, under a comment claiming it distinguished a failed read from an empty one, and the Create Offering control vanished, which reads as a withdrawn permission. `4xx` still means absent so the API's refusals keep working; a symbol rather than another `null` carries the third answer, because the whole defect was two facts sharing one value. Only the primary read gates a page, per UX-0006 §15. Seven tests, six mutations. **One mutation passed and was right to**: three comments claimed the order of the two checks was the requirement, and it is not — the checks are mutually exclusive, and what matters is that the facts stopped sharing a value. The comments are corrected rather than deleted. Delivery Status unchanged.                                                                                                                                                                                                  |
| 2.49    | 2026-08-19 | Closed I23 Error Behaviour for the public path, against a gap nothing in this repository had recorded: all eight Frozen UX documents specify Error Behaviour and the web application implemented none of it, across twenty-two routes with zero error boundaries. I22 had sharpened it — the API now answers an outage honestly and the person was shown an application crash saying the opposite about a different system. Scoped by the Owner to the mechanism plus UX-0001 §13 and UX-0002 §14, with the adjacent Empty-and-Loading sections kept separate because "it failed" and "it has not arrived yet" are different questions. `ApiRequestError` keeps the status rather than folding it into a message, and `isApiUnavailable` is `5xx` only so a `4xx` and a `TypeError` keep reaching the crash screen instead of being hidden behind a retry that cannot work. One surface serves both documents, because "the route did not begin" and "the results did not arrive" are one moment; it fetches nothing, so no occurrence can arise from a failure. Every recovery is a submission rather than a link, since a prefetched link into Discovery would record the Discovery Start the failure specifically did not claim. No `error.tsx` was added: a Next.js boundary is a Client Component that cannot read cookies and so could not show the criteria all five states require. Eight tests, six mutations each caught. Delivery Status unchanged.                                                                                                                                                                            |
| 2.48    | 2026-08-19 | Closed I22 Database Outage, supplying R3.6's behaviour and Engineering Constitution §13's graceful degradation. Measured before changing anything: a real embedded PostgreSQL stopped underneath a running API showed readiness and liveness already correct, every route answering `500 INTERNAL_ERROR`, and `/metrics` answering `500` — the platform reporting a defect it did not have for the whole duration of somebody else's outage, and losing its monitoring at the moment monitoring matters. I19 had taught the filter about a database that is present but slow; one that is absent was neither of its kinds. The classifier moved to `@commerce/database` and now covers all three, with `null` deliberately preserved for constraint violations and syntax errors, because a classifier that swallowed those would answer "try again later" to requests that can never succeed. Counted as its own series rather than a third kind of timeout, since a series named for timeouts that counts outages is a metric that lies. The database-derived gauges are omitted rather than zeroed, because `commerce_outbox_pending 0` reads as healthy; `commerce_db_reachable` says why. **A claim in the I20 record was corrected**: its content-type fix was incomplete, the header still ran before the scrape, and an outage reproduced the identical serialisation error. Eight tests against a genuinely refused connection, six mutations each caught — one of which the first version of the test missed, because the bug leaves the status and the code unchanged and only the message differs. Delivery Status unchanged. |
| 2.47    | 2026-08-19 | Closed I21 Correlation, supplying what Engineering Constitution §12.3 required across the two boundaries where the existing identifier stopped. Fastify stamped its own per-process counter on every automatic request line, so the failure a person quotes and the route that produced it could not be joined — and `req-1` is a different request on every replica. The outbox carried nothing, so the report this platform will receive most often could not be traced to the request behind it. Fastify's request id was made to _be_ the correlation identifier rather than adding a second field to its lines: nothing gained a field, one field stopped existing. A malformed header is minted afresh rather than trusted, since the value reaches a `uuid` column. `outbox_event.correlation_id` is nullable and indexed, because a row with no request behind it has no identifier and a default would give it one that joins to nothing. The increment found a gap it did not set out to find — a request that _succeeded_ gave the caller no identifier, the envelope existing only on failures — and an `onSend` hook now echoes it on every response. Four tests following one identifier end to end, three mutations each caught. Delivery Status unchanged.                                                                                                                                                                                                                                                                                                                                                                |
| 2.46    | 2026-08-18 | Closed I20 Metrics, the first control Engineering Constitution §12.2 requires and the repository had none of. Scoped by the Owner to the questions I17–I19 raised and left unanswerable, because §12.2 warns that a metric is useful only when its response is understood — so every series carries a HELP line saying what to do about it. Almost nothing is instrumented at a call site: the pool is asked what it holds and the database what it contains, and only the two events that leave no trace are counted in process. The worker is a separate process, so its work is read as database state rather than as its counters — which is the better measurement, since rows waiting to be swept climb on their own if it dies. The gate takes a bearer token or an entered Admin context, because a scraper cannot hold a session. It answers 404 rather than 401. The increment introduced and then found one bug: `@Header` on the route broke every failure path, turning a 404 into a 500 about serialisation. Three retention windows moved to `@commerce/database` so the gauge and the sweeper cannot disagree. Delivery Status unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2.45    | 2026-08-18 | Closed I19 Database Timeouts, supplying the definition Engineering Constitution §13 already required and closing the gap I18 recorded in its own closure. The Owner set a five-second statement budget and a two-second wait for a free connection; `idle_in_transaction_session_timeout` is ten seconds, since a statement timeout does not cover `begin` followed by nothing. All three sit on the connection, so no statement escapes them. A cancelled statement now answers the already-published `503 DEPENDENCY_UNAVAILABLE` rather than `500 INTERNAL_ERROR`, which told a client the opposite of the truth; the contract is unchanged. The increment would also have introduced a defect: a dead connection emits `error` and an emitter with no listener throws, so the idle-transaction timeout without a handler would have crashed the API on the condition it exists to survive — and the first attempt listened only on the pool, missing the checked-out client, which the test caught. Six tests against real hangs, five mutations each caught. Delivery Status unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2.44    | 2026-08-18 | Closed I18 Connection Budget. Every repository built its own `Pool` — fifteen in the API, ten connections each by `pg`'s default — so one instance could open a hundred and fifty against a PostgreSQL whose default ceiling is a hundred, a second instance was arithmetically impossible, and fourteen pools sat idle while the fifteenth queued. One pool per process now, built by `createDatabasePool()` and passed in, with `DATABASE_POOL_MAX` for the deployment to set. The budget is asserted against `pg_stat_activity` rather than by counting `new Pool(` in the source. The test was wrong twice and both are recorded: it first drove one route, which cannot reveal a second pool and let the mutation pass, and its ceiling assertion would have been satisfied by zero. A comment in `chat.service.ts` claiming a saturated pool stopped every request in the process was false when written and is corrected. Delivery Status unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2.43    | 2026-08-18 | Closed I17 Retention Sweep, which implements the "session cleanup" ADR-0012 §3 has required since it was accepted. Six tables carried an `expires_at`, five indexed it, and nothing had ever used that index to delete a row — the sharpest consequence being that an abandoned `pending_registration` held an email address and a password hash indefinitely for somebody who never became a User. The windows are Owner decisions taken today, since no Frozen document states a retention policy: identity rows go at expiry, processed outbox events after thirty days, dead letters never. Writing it exposed a real defect: a Decision Flow built on a Comparison Set claimed sixty minutes while the set beneath it had less, and the deliberate `ON DELETE CASCADE` was going to end the flow mid-decision — `enterWithComparisonSet` now caps the flow at its set's expiry. Two of the eight tests were wrong first, both recorded rather than quietly fixed: one seeded a dead letter too fresh for its own mutation to bite, and one reproduced the statement it was checking instead of driving the repository. Delivery Status unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2.42    | 2026-08-18 | Closed I16 by deleting `TestPrincipalAdapter`, its resolver fallback, `ENABLE_TEST_PRINCIPAL` and the two contract tests that described it. It refused to construct in production and was therefore never a way in, but it was a second code path to who a request is, and I1 had recorded that it should go once nothing depended on it. `m11-http` now registers, confirms by the emailed link and carries a real session; its malformed-principal case presents a malformed session token, which still catches a resolver that admits an unresolvable session but no longer fails for the driver reason its name gives, because the token is hashed before it reaches SQL — recorded rather than renamed. The adapter had also left `Principal.businessId` optional, and every caller read absence as _skip the Business context check_; the field is required now, so that bypass is unrepresentable, and the nine `m11-authorization` cases that had been reaching their denials through it each select the Business they act in. Delivery Status unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 1.9     | 2026-07-25 | Reconciled PRD, UX, ADR, Feature Registry, and all six Frozen Story-domain packages from the recovered ZIP set.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2.0     | 2026-07-25 | Recorded Offering Capability Architecture Frozen v2.0 and closed the F06/F07 capability-home gap.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2.1     | 2026-07-25 | Recorded repository-wide Feature-level PASS, resolved UX-0007 treatment for V1, and completed Platform Freeze evidence reconciliation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2.2     | 2026-07-25 | Recorded explicit Owner Approval and separate Freeze of traceability v1.0.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2.3     | 2026-07-25 | Closed the Engineering Constitution review record and recorded explicit Owner Approval followed by a separate Freeze of v1.0.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2.4     | 2026-07-25 | Closed the Marketplace Bible v1.0 Final Freeze Gate, reconciled Foundation lifecycle metadata, and opened the Software Architecture phase.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2.5     | 2026-07-25 | Accepted ADR-0010–ADR-0014, recorded V1 Software Architecture Final Review PASS, and opened the Owner Approval gate.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2.6     | 2026-07-25 | Recorded Owner Approval and the separate V1 Software Architecture v1.0 Freeze; closed M8 and opened development planning.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2.7     | 2026-07-25 | Added the 50-Story implementation backlog, delivery sequence, and executable TypeScript monorepo foundation; opened M9 without starting a product Story.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2.8     | 2026-07-25 | Prepared the initial Prisma/PostgreSQL migration, reproducible OpenAPI contract, module-boundary enforcement, security audit gate, and first vertical-slice entry evidence; I0 remains open pending target CI.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2.9     | 2026-08-04 | Implemented the first safe vertical slice: database-level identifier and timestamp defaults, tenant-scoped authorization with DENIED audit evidence, published error envelope, conflict reporting, dependency-gated readiness, negative authorization coverage, and a schema-drift gate. Recorded the outbox descope. Delivery Status unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2.10    | 2026-08-04 | Hardened the input boundary after review: principal headers and path identifiers are validated before reaching PostgreSQL, unknown body fields are refused in line with the published contract, and framework failures carry stable codes. Added HTTP-level coverage of the whole surface.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2.12    | 2026-08-05 | Delivered the I1 Identity and Access baseline: sessions, registration with emailed proof, login, logout, password recovery, explicit Business context and operationally provisioned Admin authorization. Gave the transactional outbox its first consumer. Recorded that `US-IDN-F09-001` moves to I5. Delivery Status unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2.11    | 2026-08-04 | Closed the I0 Repository Foundation gate on CI run 9. Corrected the drift gate to Prisma 7 flag names and declared the trigram index the gate exposed as pre-existing drift. Delivery Status unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2.41    | 2026-08-17 | Closed the gap I15 opened in the same increment: Search narrowing, which §9.1 makes the prerequisite for Search-side Filters. Narrowing keeps the path identifier and stays on the Search entry, because §6 says selecting a Category to narrow an existing Search creates no Browse Discovery Start — making it a Browse selection would have counted a second person and lost the query. Moving leaf drops the Filters the previous leaf offered. Removing a narrowing outright is recorded as a judgement: §12 permits changing Category and §7.2 permits a Search without one, but no line says a narrowing may be removed, and without it a person who narrows cannot get back. The filter forms also stopped submitting a Category identifier — the actions read the carrier, which knows.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2.40    | 2026-08-17 | Closed I15 Attribute Filter Controls. `US-DSC-F05-001` has been implemented in the API since I3 and had no surface for four increments; UX-0002 §9 is a whole section nobody could reach, which also qualified this document's claim that every Frozen UX document has a surface. The offered Filters are read from the API rather than from the form, because a submitted list of what may be applied is one the browser can edit. An empty control is not a value — an empty Number box read as `0` would apply a Filter nobody chose and, since an Offering without a value does not match, would remove results. Search-side Filters remain unreachable: they need a narrowing control that does not exist. Eight tests, three mutations each caught by its own test.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2.39    | 2026-08-17 | Populated `docs/glossary.md`, which had been an outline of placeholder rows since it was created. 36 canonical terms, each assigned to the PRD whose Single Information Owner statement claims it rather than to whichever document uses it most — `Business Profile` and `Business Information` are separately owned terms and were nearly filed as variants of each other. Two genuine variant wordings recorded without picking a winner, with counts: `Affiliate Destination Handoff Eligibility` against the short form, 34 to 13; `final Offering Public Eligibility` against the bare form, 70 to 2. Four deprecated terms. The naming rules are recorded from the documents rather than invented, and every count in the file was checked against the PRDs after it was written.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2.38    | 2026-08-17 | Corrected a claim I had just written. The roadmap and changelog said fifteen increments closed with green CI; I have no CI result for I14 or for the commit the sentence was in, and silence is not a pass. Both now say what is known — green through I13, local-only after that — and the Repository Health row says the same. Left in the same shape as the withdrawals it sits beside: the overstatement is visible rather than quietly replaced.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2.37    | 2026-08-17 | Brought the two navigational documents up to date, having found the same drift the Known Boundaries sweep found. `CHANGELOG.md` stopped at 2.8.0 on 2026-07-25, before the first increment closed, and records none of the fifteen; it now carries one milestone-level entry pointing at the per-increment record rather than fifteen reconstructed ones, because a second account of the same months is a second thing to keep in step. `PROJECT_ROADMAP.md` still said M9 was active and all 50 Stories were Not Started, and its Immediate Sequence still began "Complete I0". Recorded rather than resolved: implementation records name Milestones 11 and 12 that the roadmap's table has no rows for, and `M11_SLICE_SCOPE_RECONCILIATION.md` cites a roadmap sentence no version of that file contains.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2.36    | 2026-08-17 | Wrote the two schema checks yesterday's sweep found missing, rather than leaving the gap as an admission. Every relation `schema.prisma` owns is matched to a foreign key in a migration, and every foreign key is compared against the referential actions the datamodel means — with Prisma's defaults applied, since `onUpdate` defaults to `Cascade` and a migration that spells only `ON DELETE` has silently written `NO ACTION`. 53 relations, 54 keys, no mismatch. Keyed by table _and_ columns: keyed by column name alone the same comparison reports sixteen failures that are not real, because `user_id` and `offering_id` appear in several tables under different rules. A third test pins both counts, because the first two pass vacuously against a regex that stopped matching.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2.35    | 2026-08-17 | Swept Known Boundaries against the code, which nothing had done since I4. Six entries described a platform that no longer existed: email and Chat had no vendor, the Decision flow and Business Dashboard had no screens, four of seven moderation actions were missing and nothing wrote `closed_by`, and Basic Analytics did not consume the Discovery Starts it now reads. Two were worse than stale — they claimed local verification checks that **do not exist anywhere in this repository**: a `@prisma/prisma-schema-wasm` syntax check and a pair of schema/foreign-key checks. No test and no script reads `schema.prisma`. Both claims are withdrawn in place rather than deleted, because a reader who believed them was told local verification covered something only CI does.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2.34    | 2026-08-17 | Closed I13 Vendor Selection. The Owner chose Postmark and Anthropic; both adapters were the four and three values I11 and I12 said they would be, plus one judgement each. Email: only an inactive or malformed address refuses permanently, because everything else is permanent about the deployment rather than the message and the ceiling should handle it. Assistant: a refusal is recognised by there being no text rather than by a `stop_reason` enum, because that vocabulary belongs to the vendor and can gain members. Renamed the `http` transport values to the vendors, since `http` named the transport rather than the choice. Found and recorded one assertion of my own that asserted nothing.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2.33    | 2026-08-17 | Answered a `deepmerge-ts` advisory that appeared between two verification runs on an unchanged dependency tree — `npm audit` asks the registry, so the previous commit would fail the same way. `npm audit fix --force` proposes downgrading Prisma across a major version, and there is no fixed 7.x, so `deepmerge-ts` is pinned to `^8.0.0` as six other transitive dependencies already are. Verified that `@prisma/config` still loads its config under the new major, which is the only thing it uses the library for. `db:validate`, `db:deploy` and `db:drift` remain covered by CI rather than here: the sandbox cannot reach the Prisma engine host, and this was checked to fail identically without the override rather than assumed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2.32    | 2026-08-17 | Prepared the superseding revision of Frozen `docs/traceability.md` as a Draft v1.1 candidate beside it. Two corrections had been queued against that baseline for weeks and could not be applied, because editing a Frozen document in place is what the lifecycle forbids; this is the sanctioned route, taken as far as it goes without the Owner. §5 and §7 no longer assert `Not Started`; §6 records the implementation tier and subsumes the three M11 links; §9 drops lifecycle work its own freeze had completed. The candidate is a separate file on purpose — writing a Draft into the Frozen path would have left the repository with no traceability baseline the moment it was committed. No approval or freeze is claimed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2.31    | 2026-08-17 | Closed I12 Decision Chat Transport. Wrote the assistant's HTTP path with no vendor in it — the prompt composed in the domain from the brief alone, a bounded wait, nothing logged but the outcome, and the vendor read from configuration validated at boot. Found and fixed something email did not have: the whole act ran inside one database transaction, so a slow vendor held one of the pool's ten connections across a call to somebody else's service and would have presented as a database outage. Separated an assistant that will not answer from a reply the platform refuses; neither records a turn. Eleven tests, each verified to fail against what it replaced. No vendor chosen, no Story touched.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2.30    | 2026-08-17 | Answered the one open Owner decision. `US-OFR-F05-001` AC-3 is read as satisfied by one ordered set, so all **50 Stories are `Done`**. Accepting that reading made the order load-bearing, and it was not one: `attribute_definition.name` is not unique, and three queries ordered by name alone, so two same-named Attributes could swap places between two reads of the same Offering, Comparison Set or Chat brief. All three now break the tie. `category_attribute.sort_order` was deliberately left unused — no PRD names it and nothing writes it, so reading a public order out of it would be the ungoverned classification the decision declines to invent, while looking governed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2.29    | 2026-08-15 | Closed I11 Email Transport. Choosing a vendor turned out to be one of four missing things rather than the only one; the other three are now written. Bounded every delivery attempt, because an unanswering provider could stall the worker in a way the outbox cannot detect. Separated a permanent refusal from an outage, because everything was retried forever and a suppressed address came back every three minutes indefinitely. Moved the vendor from a source file to configuration validated at boot. Twelve tests, each verified to fail against what it replaced. No vendor chosen, no Story touched.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2.28    | 2026-08-15 | Marked the claim I9 falsified. Fourteen documents said all 50 Stories remain `Not Started`, and each wanted a different repair. Twelve are records and now carry a superseding note beside the sentence rather than a rewrite, because what a record asserted at its close is part of what it records. One, `REPOSITORY_INDEX.md`, is a health snapshot describing the present and was corrected outright — it also still named M9. The fourteenth, Frozen `docs/traceability.md`, is left untouched and named precisely: its §5 validation line is now half wrong, and correcting it needs the controlled revision that was already waiting for the M11 links.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2.27    | 2026-08-15 | Closed I10 Accessibility. Read all twenty-two routes against WCAG 2.1 AA and closed five findings: twenty-two pages sharing one title, seventeen English routes declaring `lang="tr"`, Listing Cards at `h3` directly under an `h1`, two Category controls named only by a `legend`, and an unnamed navigation landmark. Six tests assert the properties across every route, each verified to fail against its own regression. Three of the first six findings were errors in the audit rather than the code, and are recorded as such. No visual design added; no Story touched.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2.26    | 2026-08-15 | Closed I9. Advanced the ten `US-PLT` Platform Stories to `Done`, completing the pass: 49 of 50 Stories are `Done`, one is `In Progress`, none is `Not Started`. All 526 Acceptance Criteria are now recorded against the tests that verify them. Seventeen had no test and were closed by nineteen new tests; one, `US-IDN-F09-001` AC-2, was unmet and is now implemented; ten are covered by absence and marked as such.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2.25    | 2026-08-15 | Advanced the seven `US-DEC` Decision Stories to `Done`. Seventy-one of 72 criteria were already reached; the exception is `US-DEC-F03-001` AC-5's clause about comparable Attribute differences, which no Chat test could show because they all enter with one Offering. Also records that `US-DEC-F06-001` AC-7 and AC-8 were closed by the Identity increment — they are the same requirement as `US-IDN-F09-001` AC-2 from the other side, and read alone AC-7 looks satisfied by the interruption itself.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2.24    | 2026-08-15 | Advanced the ten `US-DSC` Discovery Stories to `Done`. Eighty of 81 criteria were already reached by the I3 and I4 suites; the one exception, `US-DSC-F09-001` AC-3, is a criterion about an ending rather than an action, and is now asserted both from the path that stays unchanged and from the occurrence table's schema, which has no column that could name a Discovery path.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2.23    | 2026-08-15 | Advanced six of the seven `US-OFR` Offering Stories to `Done` and `US-OFR-F05-001` to `In Progress`. Offering needed no new test: its 64 criteria were already reached by the I2 and I3 suites, which were written from the Stories rather than from the code. It produced the first Story that cannot be `Done` — AC-3 asks for an Attribute grouping PRD-0006 does not define, and grouping by a field that happens to be available would be a classification nobody governs.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2.22    | 2026-08-15 | Advanced the seven `US-BUS` Business Stories to `Done`. The Business Stories were the best-covered in the repository — the four I6 suites line up almost one to one with their criteria — and only two of the 95 had nothing behind them, both gates rather than actions. Writing the first found something worth recording: `BusinessService.create` refuses a suspended holder and audits it, but that branch cannot be reached over HTTP, because suspension invalidates the session and authentication answers first. The record cites the gate that actually runs.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2.21    | 2026-08-15 | Advanced the nine `US-IDN` Identity Stories from `Not Started` to `Done`, each against per-criterion evidence recorded in `DELIVERY_STATUS_ADVANCEMENT.md`. Reading all 81 criteria against the tests found eight nothing asserted — every one of them about what an action leaves alone — and one, `US-IDN-F09-001` AC-2, that the code did not meet: the channel an interrupted person had chosen was carried nowhere, so they returned from signing in to an unanswered question. It now travels in a flow-keyed cookie holding two names from closed vocabularies. Also corrected two stale claims in this document: twenty-two routes, not twenty-one, and the surfaces I8 built are no longer listed as unbuilt.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2.20    | 2026-08-14 | Closed the three gaps I8 recorded. Two were the same mistake — the platform knew something and had not published it — and are now `selectionLost` on the Decision Context and `GET /categories/assignable` behind the Offering create picker. The third was an error in the closure record: the error envelope does carry `fieldErrors`, and the Universal Publication Minimum's shortfalls now reach the person from both the publication and the bounded correction paths. Also loosened the `nanoid` override, which pinned the exact version GHSA-2v37-7h3g-55p8 names. Delivery Status unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2.19    | 2026-08-14 | Closed I8: every Frozen UX document now has a surface — authentication and context entry, the Business Dashboard with Offering actions, editing, correction notices, the bounded correction path and Affiliate Destination management, the Decision flow through to its two Completions, and the Admin Dashboard with moderation cases, destination administration, Category and Attribute management and Basic Analytics. Added two API answers so that no screen composes an availability rule, and recorded three gaps where a screen can only be as honest as the read it was given. Delivery Status unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2.18    | 2026-08-12 | Closed I7: the Admin Panel, General Moderation case management, all seven moderation actions across Offering, Business and User Account targets, Request Correction with enforced re-review, Affiliate Destination administration with its derived workload, and Basic Analytics. Recorded three corrections to existing code and the boundaries of case opening and analytics Domain association. This closes the fiftieth and final Frozen Generated Story. Delivery Status unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2.17    | 2026-08-11 | Closed I6: Business moderation with exposure input bound to it in the datamodel, the Business Dashboard and context selection, the Offering and Affiliate Destination management entries, and the correction notice with its bounded correction-edit path. Recorded that restriction is enforced per owner intent and that only three of the seven General Moderation actions exist. Delivery Status unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2.16    | 2026-08-11 | Closed I5: the Comparison Set and Compare, the Decision Context, Decision Chat behind a vendorless port, explicit Offering selection, Affiliate Handoff, Direct Contact and the two Decision Completions. Recorded that the assistant has no vendor and that its invented-value guard is numeric only. Delivery Status unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2.15    | 2026-08-11 | Closed I4: the Homepage entry, Discovery Results and Listing Cards, the Offering Presentation handoff, complete public Offering Presentation with its `Offering Presentation Open` occurrence, and the Compare-preparation Discovery return. Recorded that Discovery criteria are carried in a transient cookie rather than the address, and that `US-OFR-F05-001` AC-3 waits on a governed Attribute grouping. Delivery Status unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2.14    | 2026-08-11 | Closed I3: Affiliate Destination eligibility governance, Offering publication with its Discovery projection, and the unauthenticated Browse, Search, Category narrowing, Attribute filtering, default ordering and Zero Results recovery read path. Recorded that Discovery is still a JSON contract with no page, and that results are deliberately unpaged. Delivery Status unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2.13    | 2026-08-10 | Closed I2: Category and Domain management, Attribute definition management, Business information and exposure, and Offering creation, editing, retirement and Affiliate Destination configuration. Aligned the Offering lifecycle, the Attribute value kinds and the required-for-publication flag to their Frozen Stories. Recorded that `US-OFR-F02-001` AC-9 waits for `US-PLT-F06-001`. Delivery Status unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
