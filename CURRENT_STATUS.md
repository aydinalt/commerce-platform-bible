<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      2.41
Last Updated: 2026-08-17
-->

# CURRENT STATUS

## Repository Overview

| Item | Current state |
|---|---|
| Repository | Commerce Platform Bible |
| Repository health | Frozen baselines. Every increment through I13 was proven green in target CI before the next opened; I14 and the documentation changes after it have passed the full chain locally and carry no recorded CI result |
| Current phase | M12 Increment I18 Connection Budget — closed. Nineteen increments, I0 through I18 |
| Development | Every Frozen Generated Story implemented, and every Frozen UX document now has a surface — though not every section of one: UX-0002 §9 Filter Behaviour and §7.2 Search narrowing had none until I15. The surfaces are: authentication and the three context entries, the Business Dashboard through to the bounded correction path and Affiliate Destination management, the Decision flow through to its two Completions, and the Admin Dashboard through to Category and Attribute management. Twenty-two routes, none of which composes an availability rule of its own |
| Delivery Status of Frozen Stories | **50 of 50 `Done`**, none `In Progress`, none `Not Started`. Every criterion is matched to the test that verifies it in `docs/implementation/DELIVERY_STATUS_ADVANCEMENT.md`. `US-OFR-F05-001` was the exception until the Owner read AC-3 as satisfied by one ordered set — `docs/implementation/AC3_ATTRIBUTE_GROUPING_DECISION.md` |

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
their *own* creation and a flow is always built on a set that already exists — so
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
no longer fails for the *driver* reason its name gives: the token is hashed
before it reaches SQL, so a malformed value structurally cannot arrive at a
column. The name is a historical description now, and is left visible as one.

**The adapter left a bypass behind.** `Principal.businessId` was optional, and
every caller read the absent case as *skip the Business context check* — an
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
permanent about the *deployment* rather than the message, and dead-lettering
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
exception is a criterion about an *ending*: `US-DSC-F09-001` AC-3 ends
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
- A migration must match Prisma's generated names *and* spell both referential actions on every foreign key. An inlined `REFERENCES ... ON DELETE` leaves `ON UPDATE` at PostgreSQL's `NO ACTION` while the datamodel means `CASCADE`. The two checks this line claimed and did not have now exist, in `i14-schema-migrations.test.ts`: every relation the datamodel owns has a foreign key, and every foreign key spells the referential actions the datamodel means. They read text and do not replace the CI drift gate, which compares a real database; what they add is catching a migration that says less than the datamodel means before a push rather than after one.
- Category hierarchy invariants, Attribute mutation safety, Select arity and the Affiliate authoring reset are enforced in PostgreSQL rather than in application code. Check constraints, composite foreign keys and triggers are outside what Prisma models, so the schema-drift gate does not see them; the integration suites are what prove they are there.

## Revision History

| Version | Date | Summary |
|---|---|---|
| 2.44 | 2026-08-18 | Closed I18 Connection Budget. Every repository built its own `Pool` — fifteen in the API, ten connections each by `pg`'s default — so one instance could open a hundred and fifty against a PostgreSQL whose default ceiling is a hundred, a second instance was arithmetically impossible, and fourteen pools sat idle while the fifteenth queued. One pool per process now, built by `createDatabasePool()` and passed in, with `DATABASE_POOL_MAX` for the deployment to set. The budget is asserted against `pg_stat_activity` rather than by counting `new Pool(` in the source. The test was wrong twice and both are recorded: it first drove one route, which cannot reveal a second pool and let the mutation pass, and its ceiling assertion would have been satisfied by zero. A comment in `chat.service.ts` claiming a saturated pool stopped every request in the process was false when written and is corrected. Delivery Status unchanged. |
| 2.43 | 2026-08-18 | Closed I17 Retention Sweep, which implements the "session cleanup" ADR-0012 §3 has required since it was accepted. Six tables carried an `expires_at`, five indexed it, and nothing had ever used that index to delete a row — the sharpest consequence being that an abandoned `pending_registration` held an email address and a password hash indefinitely for somebody who never became a User. The windows are Owner decisions taken today, since no Frozen document states a retention policy: identity rows go at expiry, processed outbox events after thirty days, dead letters never. Writing it exposed a real defect: a Decision Flow built on a Comparison Set claimed sixty minutes while the set beneath it had less, and the deliberate `ON DELETE CASCADE` was going to end the flow mid-decision — `enterWithComparisonSet` now caps the flow at its set's expiry. Two of the eight tests were wrong first, both recorded rather than quietly fixed: one seeded a dead letter too fresh for its own mutation to bite, and one reproduced the statement it was checking instead of driving the repository. Delivery Status unchanged. |
| 2.42 | 2026-08-18 | Closed I16 by deleting `TestPrincipalAdapter`, its resolver fallback, `ENABLE_TEST_PRINCIPAL` and the two contract tests that described it. It refused to construct in production and was therefore never a way in, but it was a second code path to who a request is, and I1 had recorded that it should go once nothing depended on it. `m11-http` now registers, confirms by the emailed link and carries a real session; its malformed-principal case presents a malformed session token, which still catches a resolver that admits an unresolvable session but no longer fails for the driver reason its name gives, because the token is hashed before it reaches SQL — recorded rather than renamed. The adapter had also left `Principal.businessId` optional, and every caller read absence as *skip the Business context check*; the field is required now, so that bypass is unrepresentable, and the nine `m11-authorization` cases that had been reaching their denials through it each select the Business they act in. Delivery Status unchanged. |
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
| 2.41 | 2026-08-17 | Closed the gap I15 opened in the same increment: Search narrowing, which §9.1 makes the prerequisite for Search-side Filters. Narrowing keeps the path identifier and stays on the Search entry, because §6 says selecting a Category to narrow an existing Search creates no Browse Discovery Start — making it a Browse selection would have counted a second person and lost the query. Moving leaf drops the Filters the previous leaf offered. Removing a narrowing outright is recorded as a judgement: §12 permits changing Category and §7.2 permits a Search without one, but no line says a narrowing may be removed, and without it a person who narrows cannot get back. The filter forms also stopped submitting a Category identifier — the actions read the carrier, which knows. |
| 2.40 | 2026-08-17 | Closed I15 Attribute Filter Controls. `US-DSC-F05-001` has been implemented in the API since I3 and had no surface for four increments; UX-0002 §9 is a whole section nobody could reach, which also qualified this document's claim that every Frozen UX document has a surface. The offered Filters are read from the API rather than from the form, because a submitted list of what may be applied is one the browser can edit. An empty control is not a value — an empty Number box read as `0` would apply a Filter nobody chose and, since an Offering without a value does not match, would remove results. Search-side Filters remain unreachable: they need a narrowing control that does not exist. Eight tests, three mutations each caught by its own test. |
| 2.39 | 2026-08-17 | Populated `docs/glossary.md`, which had been an outline of placeholder rows since it was created. 36 canonical terms, each assigned to the PRD whose Single Information Owner statement claims it rather than to whichever document uses it most — `Business Profile` and `Business Information` are separately owned terms and were nearly filed as variants of each other. Two genuine variant wordings recorded without picking a winner, with counts: `Affiliate Destination Handoff Eligibility` against the short form, 34 to 13; `final Offering Public Eligibility` against the bare form, 70 to 2. Four deprecated terms. The naming rules are recorded from the documents rather than invented, and every count in the file was checked against the PRDs after it was written. |
| 2.38 | 2026-08-17 | Corrected a claim I had just written. The roadmap and changelog said fifteen increments closed with green CI; I have no CI result for I14 or for the commit the sentence was in, and silence is not a pass. Both now say what is known — green through I13, local-only after that — and the Repository Health row says the same. Left in the same shape as the withdrawals it sits beside: the overstatement is visible rather than quietly replaced. |
| 2.37 | 2026-08-17 | Brought the two navigational documents up to date, having found the same drift the Known Boundaries sweep found. `CHANGELOG.md` stopped at 2.8.0 on 2026-07-25, before the first increment closed, and records none of the fifteen; it now carries one milestone-level entry pointing at the per-increment record rather than fifteen reconstructed ones, because a second account of the same months is a second thing to keep in step. `PROJECT_ROADMAP.md` still said M9 was active and all 50 Stories were Not Started, and its Immediate Sequence still began "Complete I0". Recorded rather than resolved: implementation records name Milestones 11 and 12 that the roadmap's table has no rows for, and `M11_SLICE_SCOPE_RECONCILIATION.md` cites a roadmap sentence no version of that file contains. |
| 2.36 | 2026-08-17 | Wrote the two schema checks yesterday's sweep found missing, rather than leaving the gap as an admission. Every relation `schema.prisma` owns is matched to a foreign key in a migration, and every foreign key is compared against the referential actions the datamodel means — with Prisma's defaults applied, since `onUpdate` defaults to `Cascade` and a migration that spells only `ON DELETE` has silently written `NO ACTION`. 53 relations, 54 keys, no mismatch. Keyed by table *and* columns: keyed by column name alone the same comparison reports sixteen failures that are not real, because `user_id` and `offering_id` appear in several tables under different rules. A third test pins both counts, because the first two pass vacuously against a regex that stopped matching. |
| 2.35 | 2026-08-17 | Swept Known Boundaries against the code, which nothing had done since I4. Six entries described a platform that no longer existed: email and Chat had no vendor, the Decision flow and Business Dashboard had no screens, four of seven moderation actions were missing and nothing wrote `closed_by`, and Basic Analytics did not consume the Discovery Starts it now reads. Two were worse than stale — they claimed local verification checks that **do not exist anywhere in this repository**: a `@prisma/prisma-schema-wasm` syntax check and a pair of schema/foreign-key checks. No test and no script reads `schema.prisma`. Both claims are withdrawn in place rather than deleted, because a reader who believed them was told local verification covered something only CI does. |
| 2.34 | 2026-08-17 | Closed I13 Vendor Selection. The Owner chose Postmark and Anthropic; both adapters were the four and three values I11 and I12 said they would be, plus one judgement each. Email: only an inactive or malformed address refuses permanently, because everything else is permanent about the deployment rather than the message and the ceiling should handle it. Assistant: a refusal is recognised by there being no text rather than by a `stop_reason` enum, because that vocabulary belongs to the vendor and can gain members. Renamed the `http` transport values to the vendors, since `http` named the transport rather than the choice. Found and recorded one assertion of my own that asserted nothing. |
| 2.33 | 2026-08-17 | Answered a `deepmerge-ts` advisory that appeared between two verification runs on an unchanged dependency tree — `npm audit` asks the registry, so the previous commit would fail the same way. `npm audit fix --force` proposes downgrading Prisma across a major version, and there is no fixed 7.x, so `deepmerge-ts` is pinned to `^8.0.0` as six other transitive dependencies already are. Verified that `@prisma/config` still loads its config under the new major, which is the only thing it uses the library for. `db:validate`, `db:deploy` and `db:drift` remain covered by CI rather than here: the sandbox cannot reach the Prisma engine host, and this was checked to fail identically without the override rather than assumed. |
| 2.32 | 2026-08-17 | Prepared the superseding revision of Frozen `docs/traceability.md` as a Draft v1.1 candidate beside it. Two corrections had been queued against that baseline for weeks and could not be applied, because editing a Frozen document in place is what the lifecycle forbids; this is the sanctioned route, taken as far as it goes without the Owner. §5 and §7 no longer assert `Not Started`; §6 records the implementation tier and subsumes the three M11 links; §9 drops lifecycle work its own freeze had completed. The candidate is a separate file on purpose — writing a Draft into the Frozen path would have left the repository with no traceability baseline the moment it was committed. No approval or freeze is claimed. |
| 2.31 | 2026-08-17 | Closed I12 Decision Chat Transport. Wrote the assistant's HTTP path with no vendor in it — the prompt composed in the domain from the brief alone, a bounded wait, nothing logged but the outcome, and the vendor read from configuration validated at boot. Found and fixed something email did not have: the whole act ran inside one database transaction, so a slow vendor held one of the pool's ten connections across a call to somebody else's service and would have presented as a database outage. Separated an assistant that will not answer from a reply the platform refuses; neither records a turn. Eleven tests, each verified to fail against what it replaced. No vendor chosen, no Story touched. |
| 2.30 | 2026-08-17 | Answered the one open Owner decision. `US-OFR-F05-001` AC-3 is read as satisfied by one ordered set, so all **50 Stories are `Done`**. Accepting that reading made the order load-bearing, and it was not one: `attribute_definition.name` is not unique, and three queries ordered by name alone, so two same-named Attributes could swap places between two reads of the same Offering, Comparison Set or Chat brief. All three now break the tie. `category_attribute.sort_order` was deliberately left unused — no PRD names it and nothing writes it, so reading a public order out of it would be the ungoverned classification the decision declines to invent, while looking governed. |
| 2.29 | 2026-08-15 | Closed I11 Email Transport. Choosing a vendor turned out to be one of four missing things rather than the only one; the other three are now written. Bounded every delivery attempt, because an unanswering provider could stall the worker in a way the outbox cannot detect. Separated a permanent refusal from an outage, because everything was retried forever and a suppressed address came back every three minutes indefinitely. Moved the vendor from a source file to configuration validated at boot. Twelve tests, each verified to fail against what it replaced. No vendor chosen, no Story touched. |
| 2.28 | 2026-08-15 | Marked the claim I9 falsified. Fourteen documents said all 50 Stories remain `Not Started`, and each wanted a different repair. Twelve are records and now carry a superseding note beside the sentence rather than a rewrite, because what a record asserted at its close is part of what it records. One, `REPOSITORY_INDEX.md`, is a health snapshot describing the present and was corrected outright — it also still named M9. The fourteenth, Frozen `docs/traceability.md`, is left untouched and named precisely: its §5 validation line is now half wrong, and correcting it needs the controlled revision that was already waiting for the M11 links. |
| 2.27 | 2026-08-15 | Closed I10 Accessibility. Read all twenty-two routes against WCAG 2.1 AA and closed five findings: twenty-two pages sharing one title, seventeen English routes declaring `lang="tr"`, Listing Cards at `h3` directly under an `h1`, two Category controls named only by a `legend`, and an unnamed navigation landmark. Six tests assert the properties across every route, each verified to fail against its own regression. Three of the first six findings were errors in the audit rather than the code, and are recorded as such. No visual design added; no Story touched. |
| 2.26 | 2026-08-15 | Closed I9. Advanced the ten `US-PLT` Platform Stories to `Done`, completing the pass: 49 of 50 Stories are `Done`, one is `In Progress`, none is `Not Started`. All 526 Acceptance Criteria are now recorded against the tests that verify them. Seventeen had no test and were closed by nineteen new tests; one, `US-IDN-F09-001` AC-2, was unmet and is now implemented; ten are covered by absence and marked as such. |
| 2.25 | 2026-08-15 | Advanced the seven `US-DEC` Decision Stories to `Done`. Seventy-one of 72 criteria were already reached; the exception is `US-DEC-F03-001` AC-5's clause about comparable Attribute differences, which no Chat test could show because they all enter with one Offering. Also records that `US-DEC-F06-001` AC-7 and AC-8 were closed by the Identity increment — they are the same requirement as `US-IDN-F09-001` AC-2 from the other side, and read alone AC-7 looks satisfied by the interruption itself. |
| 2.24 | 2026-08-15 | Advanced the ten `US-DSC` Discovery Stories to `Done`. Eighty of 81 criteria were already reached by the I3 and I4 suites; the one exception, `US-DSC-F09-001` AC-3, is a criterion about an ending rather than an action, and is now asserted both from the path that stays unchanged and from the occurrence table's schema, which has no column that could name a Discovery path. |
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
