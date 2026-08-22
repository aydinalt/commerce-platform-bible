<!--
Owner:        Architecture Owner
Status:       Draft — reconciliation report, not a governing roadmap
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-21
-->

# Commerce Platform Bible Roadmap — Reconciled

**Reconciles the 14-milestone plan dated 2026-07-25 against the repository as it
stands on 2026-08-21.**

> **This document does not govern.** `PROJECT_ROADMAP.md` is the roadmap the
> repository carries, and it has ten milestones rather than fourteen. The two
> disagree, and reconciling them is an Owner governance decision — §"Current
> Position" of `PROJECT_ROADMAP.md` already records the conflict and declines to
> settle it. This report says where the work actually is under *both* numbering
> schemes so the decision can be made on evidence.

---

## Read this first: the road did change

Four things in the 2026-07-25 plan are **no longer true**, and none of them by
drift. Each was overruled by a Frozen document that outranks the roadmap.

| Plan item | What happened | Authority |
|---|---|---|
| M12 Discovery → **Autocomplete** | **Cancelled.** UX-0001 v0.2 removed it and now forbids it — the permission table marks "Use Autocomplete" ✗ for every role. The only `autoComplete` in the search field is `="off"`, actively refusing it | UX-0001 §7.2, §11, AC-7 |
| M12 Platform → **Messaging** | **Out of V1.** UX-0007 stayed Draft v0.2 outside the Frozen baseline; no validated V1 Feature chain depends on it | UX-0007, traceability v1.0 |
| Home **recommendation behaviour** | **Cancelled.** UX-0001 v0.2 removed featured Offerings, popular-Category ordering and recommendation-driven routing. Decision Chat still exists — it advises inside a Decision Flow, it does not route Discovery | UX-0001 §6, §11 |
| M4 → **F02 Offering Editing deferred** | **Resolved and built.** `US-OFR-F02-001` is `Done`, ten of ten criteria verified | I2, DELIVERY_STATUS_ADVANCEMENT |

Two more were in the plan and are **not in the Frozen Story baseline at all**:

- **Pagination** — zero occurrences in the codebase. No Frozen Story requires it.
- **Facets** — zero occurrences. Filters exist (UX-0002 §9); facets do not.

These are not gaps against the Stories. They are gaps against a plan written
before the Stories were frozen. **If they are wanted, they are new scope and
need new Stories**, not implementation against existing ones.

And one thing was **added** that the plan never had:

- **UX-0009 Decision Flow** — a ninth UX document, Frozen v1.0, and the whole
  Compare → Chat → selection → Handoff/Direct Contact → Completion surface.

---

## Milestone 1 — Documentation Foundation ✅ COMPLETED

Unchanged from the 2026-07-25 plan. Governance Living, Foundation Frozen.

## Milestone 2 — Product Requirements Layer ✅ COMPLETED

Unchanged. PRD-0001 through PRD-0006 Frozen.

## Milestone 3 — UX Layer ✅ COMPLETED — **and extended**

* ✅ UX-0001 Home · UX-0002 Discovery · UX-0003 Offering Detail
* ✅ UX-0004 Compare · UX-0005 Business Dashboard · UX-0006 Admin Dashboard
* ✅ UX-0008 Authentication
* ✅ **UX-0009 Decision Flow — added after the plan was written, Frozen v1.0**
* ⏸️ UX-0007 Messaging — **Draft v0.2, deliberately outside the Frozen V1 baseline**

**Eight Frozen, one preserved outside V1.** The plan listed eight documents and
counted Messaging among them; the frozen baseline has eight *without* Messaging
and *with* Decision Flow.

## Milestone 4 — Capability Architecture ✅ COMPLETED

* ✅ F01 Creation · F03 Lifecycle · F04 Lifecycle · F05 Presentation
* ✅ **F02 Offering Editing — deferral resolved, capability associated, built**

## Milestone 5 — User Story Layer ✅ COMPLETED

* ✅ 6 Parent Story documents, 50 Generated Stories, 56 total
* ✅ **Delivery State changed: all 50 now carry `Done`, not `Not Started`**
* ✅ **526 acceptance criteria**, each matched to the test that verifies it

## Milestone 6 — Full Traceability Validation ✅ COMPLETED

* ✅ 50 Feature chains validated, `traceability.md` Frozen v1.0
* ⏳ `docs/traceability-v1.1-candidate.md` — written, **awaiting Owner review**

## Milestone 7 — Engineering Governance and Bible Freeze ✅ COMPLETED

Unchanged. `ENGINEERING_CONSTITUTION.md` Frozen v1.0, Marketplace Bible v1.0
Frozen.

## Milestone 8 — V1 Software Architecture ✅ COMPLETED

Unchanged. ADR-0010–ADR-0014 Accepted. **ADR-0001 through ADR-0014 all Accepted.**

## Milestone 9 — Implementation Planning and Repository Foundation ✅ COMPLETED

*(Was 🚧 IN PROGRESS on 2026-07-25.)*

* ✅ I0 Repository Foundation — **closed**
* ✅ GitHub Actions passing
* ✅ Next.js production build proven
* ✅ PostgreSQL migration execution proven
* ✅ Ten-stage sequence — superseded by **26 governed increments, I0–I25**

## Milestone 10 — Data, Contract and Boundary Foundation ✅ COMPLETED

*(Was 🚧 CURRENT WORK — "⭐ WE ARE HERE" — on 2026-07-25.)*

* ✅ Prisma baseline, **30 migrations applied**
* ✅ OpenAPI 3.1, reproducible, drift gate in CI
* ✅ Module boundaries — **378 modules, 613 relationships, 0 violations**
* ✅ Typed Attribute Engine, Discovery projection, audit, outbox, FTS + trigram

## Milestone 11 — First Safe Vertical Slice ✅ COMPLETED

* ✅ Authentication foundation, identity resolution, Business authorization
* ✅ Tenant-bound Offering creation, draft persistence, read-back
* ✅ Audit recording, transactional outbox event
* ✅ OpenAPI-aligned endpoints, negative authorization tests, tenant isolation

## Milestone 12 — V1 Incremental Development ✅ COMPLETED

**Identity and Access** — ✅ all six: authentication, sessions, user / Business /
Admin authorization, tenant isolation.

**Offering** — ✅ all five: Creation, Editing, Retirement, Publication, Detail
Presentation.

**Discovery**

* ✅ Query · Browse · Filters · Sorting · Zero-result handling
* ❌ **Autocomplete — cancelled by UX-0001, forbidden for every role**
* ⚪ **Pagination — not in the Frozen Story baseline; new scope if wanted**
* ⚪ **Facets — not in the Frozen Story baseline; new scope if wanted**

**Decision** — ✅ Compare, Decision Chat, Decision handoff, **plus** Comparison
Sets, Decision Context, Affiliate Handoff, Direct Contact, and two Completions
(the whole of UX-0009). "Recommendation support" survives only as Chat guidance
inside a flow; Home-level recommendation is forbidden.

**Business** — ✅ Dashboard, Offering management, Publication management,
Business profile, **plus** Affiliate Destination management and the bounded
correction-notice edit path.

**Platform** — ✅ Admin Dashboard, Moderation (7 actions, cases, re-review),
Audit foundation, Basic Analytics. ❌ **Messaging — out of V1.**

**Surface:** 22 web routes, 11 domain modules.

## Milestone 13 — Quality and Release Readiness 🚧 IN PROGRESS

### Quality

* ✅ Unit Tests · Integration Tests · Contract Tests (OpenAPI drift gate)
* ✅ Authorization Tests · Tenant-Isolation Tests · Migration Tests
* ✅ Accessibility Tests — I9, 22 routes audited
* ✅ Security Review — dependency audit, **0 vulnerabilities**
* ✅ **94 test files, 860 tests**, every increment mutation-tested
* ⏳ **End-to-End Tests — none exist.** No Playwright, no Cypress
* ⏳ **Performance Tests — none exist.** Nothing has been run under load

### Operations

* ⏳ **Production infrastructure — none.** 0 Dockerfile, 0 IaC, `infrastructure/` empty
* ⏳ **Deployment pipeline — none.** CI verifies; it does not deploy
* ⏳ **Monitoring — no system.** Metrics exist (I20) and nothing scrapes them
* 🚧 **Logging — structured, correlated end to end (I21).** No aggregator to send it to
* ⏳ **Alerting — none**
* ⏳ **Backup and restore — none**
* ⏳ **Incident procedures — none**
* ⏳ **Rollback validation — none**

**This is where the work actually stands.** Quality is close to done; Operations
is almost entirely open, and every open item waits on the same missing thing.

### Work the plan never anticipated — increments I15–I25

Eleven increments of operability hardening, done **before** infrastructure
exists because none of it needs infrastructure:

| Increment | What it closed |
|---|---|
| I15 | Recorded-gap corrections and the evidence extractor |
| I16 | Real email vendor (Postmark), test-principal affordance deleted |
| I17 | Retention sweep — ADR-0012 §3 "session cleanup" |
| I18 | One connection pool per process — was 15 pools, 150 connections |
| I19 | Database timeouts — §13, statement/idle/acquisition |
| I20 | Metrics in Prometheus format — §12.2, there were none |
| I21 | One correlation identifier across every boundary — §12.3 |
| I22 | Honest degradation when PostgreSQL is unavailable — R3.6 behaviour |
| I23 | Error Behaviour for the public path — 8 UX documents specify it, 0 had it |
| I24 | Distinguishing zero from unavailable — 13 routes were saying "does not exist" |
| I25 | Web request budget — the last untimed dependency edge |

## Milestone 14 — Release ⏳ NOT STARTED

* ⏳ Internal Development Release
* ⏳ Alpha
* ⏳ Closed Beta
* ⏳ **Open Beta**
* ⏳ Release Candidate
* ⏳ Production v1.0

**None of these six has a definition in the repository.** The exit condition
carried by `PROJECT_ROADMAP.md` is "product meets approved release criteria",
and it records that nothing states them.
`docs/releases/V1_RELEASE_CRITERIA_CANDIDATE.md` proposes 24, **unapproved** —
approving release criteria is an Owner act.

Against those 24 candidate criteria, today:

| Gate | Closed | Open |
|---|---|---|
| R1 Observable (4) | R1.1 metrics; R1.3 code half | R1.2, R1.4 — need a deployment and a monitoring system |
| R2 Deployable (6) | none | all six — need a hosting target |
| R3 Survivable (6) | R3.6 behaviour | five — need an environment to restore into and load to measure |
| R4 Lawful (8) | none | all eight — 0 privacy notice, 0 KVKK document, 0 terms |

---

## ⭐ WE ARE HERE

**Between Milestone 13 Quality (nearly closed) and Milestone 13 Operations
(barely opened).** Everything a person can do is built and proven; nothing that
would let a person reach it exists.

The distance to **Open Beta** is not one queue. It is two Owner decisions with
engineering work hanging off each:

1. **Choose the hosting target.** Until then M13 Operations cannot start, M14
   has nowhere to release to, and R2/R3/R1.2/R1.4 are all blocked on the same
   absence. The *size* of that work depends on the choice.
2. **Name who owns KVKK.** R4 is four items of counsel work and **the longest
   lead time in the whole plan**. It cannot be compressed by engineering, and it
   does not get lighter for a beta — real people's personal data is personal
   data whatever the release is labelled.

No date can be given for Open Beta, and the reason is not estimation
difficulty. Two of the three things standing in the way are decisions rather
than tasks, and the third — the operations build — cannot be sized until the
first is made.

## What can proceed without either decision

Named so the queue is visible rather than implied:

1. Error Behaviour for the four remaining UX documents — UX-0003 §16,
   UX-0004 §14, UX-0008 §14, UX-0009 §18
2. Empty and Loading Behaviour — UX-0005 §14, UX-0006 §14; there are 0
   `loading.tsx` files in 22 routes
3. Metrics for the web application — §12.2 has never been read against it, and
   it publishes nothing
4. End-to-End tests — M13 Quality's one genuinely missing row

None of these shortens the path to Open Beta. All of them are things that would
otherwise be discovered by the people in the beta.
