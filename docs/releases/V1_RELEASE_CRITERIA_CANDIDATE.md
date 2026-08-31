# V1 Release Criteria — Candidate

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft — candidate, awaiting Owner review and approval
- **Maintenance Mode:** Living until approved
- **Version:** 0.1
- **Last Updated:** 2026-08-18

> **No Approval Note and no Freeze Note.** Approving release criteria is an Owner
> act and is not recorded here by the author. Until that happens this document
> proposes and does not govern, and nothing may cite it as a gate.

## 1. Why this document exists

`PROJECT_ROADMAP.md` states the Release milestone's exit condition as "Product
meets approved release criteria" and then records that **nothing in the
repository states them**:

> "Decide what M10 Release requires. Nothing in the repository states its
> criteria, and the Stories cannot say — they describe a product, not a launch."

The Stories genuinely cannot say. All 50 are `Done` and 526 Acceptance Criteria
are matched to tests; none of that answers whether the thing may be operated in
front of real people. That is a different question with different evidence.

This candidate proposes the answer. It follows the same shape the repository
already uses for a decision that belongs to the Owner: written, complete, and
deliberately unapproved.

## 2. Milestone numbering

`docs/implementation/COMPLETION_AND_MILESTONE_STRUCTURE.md` §3 sets out the
unresolved numbering and two ways to settle it. This document says **"the
Release milestone"** throughout rather than a number, so it stays correct under
either resolution.

## 3. Rules these criteria follow

Written down because criteria that can be argued about are not criteria.

1. **Every criterion is checkable.** Each names something that can be shown to
   be true or not, by a person who was not involved in doing it.
2. **Evidence is named where it does not yet exist**, so a criterion cannot be
   satisfied by assertion.
3. **A criterion that is somebody else's decision says so**, and does not
   pretend engineering can close it.
4. **Nothing here re-states a Story.** Product behaviour is proven by the
   existing suite; this document is only about operability, and duplicating a
   criterion would create a second owner for it.
5. **Meeting a criterion is not the same as it being wise to launch.** These are
   a floor, not a recommendation.

## 4. R1 — Observable

*Can we tell what the system is doing, and would we find out if it stopped?*

| # | Criterion | Evidence |
|---|---|---|
| R1.1 | Metrics exist for the questions I17–I19 raised and cannot currently answer: connection pool saturation, refused connections, timeout counts, outbox backlog depth, dead letters, rows swept | The metrics endpoint, with each series named and its meaning recorded |
| R1.2 | Metrics are reachable from wherever the product runs, and are **not** reachable by the public | An access check against a deployed environment |
| R1.3 | Structured logs from all three processes reach one place a person can search, correlated by `x-correlation-id` | A trace of one request followed end to end in the deployed environment |
| R1.4 | Somebody is alerted when the outbox backlog grows without draining, when dead letters appear, or when readiness fails | The alert definitions, and one deliberately triggered alert that arrived |

**R1.4 is the one that makes the rest worth having.** Metrics nobody is paged
on are a dashboard, and a dashboard nobody is looking at during an incident is
not an operational control.

## 5. R2 — Deployable

*Can a known commit be put in front of people, and taken back?*

| # | Criterion | Evidence |
|---|---|---|
| R2.1 | The API, worker and web app each build and run from a definition committed to this repository | The build definitions, and a running environment produced from them |
| R2.2 | One documented act deploys a named commit to an environment; nobody deploys from a laptop | The pipeline definition and one successful run |
| R2.3 | **Rollback is a defined act with a stated trigger**, not an improvisation | The written procedure, and one rehearsed rollback |
| R2.4 | Migrations run as part of deployment, in a defined order relative to the application starting | The deployment definition; `db:deploy` already runs in CI and this is about production |
| R2.5 | Every secret is supplied by the environment; none is in the repository or in an image | A scan of the tree and of the built images |
| R2.6 | `ALLOWED_ORIGINS`, `PUBLIC_WEB_URL` and both vendor credentials are set correctly in the deployed environment, and the API refuses to start without them | The API already refuses in production — evidence is that it started, and with the right values |

**Blocked by an Owner decision:** R2 cannot start until the hosting target is
chosen. Its size depends almost entirely on that choice, and so does R3.

## 6. R3 — Survivable

*If it breaks or fills up, do we get it back?*

| # | Criterion | Evidence |
|---|---|---|
| R3.1 | Database backups are taken automatically, at a stated frequency, with a stated retention | The backup configuration |
| R3.2 | **A restore has been performed successfully into a separate environment**, and the result was checked | The restore record, with what was verified and how long it took |
| R3.3 | The recovery point and recovery time actually achieved in R3.2 are written down and accepted | The measured numbers, accepted by the Owner |
| R3.4 | `DATABASE_POOL_MAX`, `statement_timeout` and the connection wait have been **measured under load** rather than reasoned about | A load test report, and any revised values |
| R3.5 | The retention sweep has run against a table with a realistic backlog without holding locks that hurt | The sweep's own logged counts and timings under that load |
| R3.6 | The product degrades honestly when PostgreSQL is unavailable: readiness fails, requests answer `503 DEPENDENCY_UNAVAILABLE`, nothing reports a defect | A deliberate dependency outage in a non-production environment |

R3.2 is quoted directly from the Engineering Constitution §13.3: *"A backup that
has never been restored successfully is not sufficient recovery evidence."*

R3.4 exists because three increments shipped numbers their own closure records
call judgements rather than measurements. They are not known to be wrong. They
are not known to be right.

## 7. R4 — Lawful and answerable

*May we operate this, and can we answer for it?*

| # | Criterion | Evidence | Whose |
|---|---|---|---|
| R4.1 | A privacy notice exists, is published, and describes what is collected, why, for how long, and on what lawful basis | The published notice | Owner + counsel |
| R4.2 | A data-subject request path exists — access, correction, deletion — with a named responsible person and a stated response time | The written procedure | Owner + counsel |
| R4.3 | Terms of use and a cookie disclosure exist and are published | The published documents | Owner + counsel |
| R4.4 | The retention windows set in I17 are consistent with what the privacy notice promises | Both documents, read against each other | Owner + counsel |
| R4.5 | **Postmark has delivered one real message** and the failure modes that only appear live have been seen or ruled out | The delivery, and the sender signature verified | Engineering, needs credentials |
| R4.6 | **Anthropic has answered one real question** through the production path | The exchange, with the model name confirmed | Engineering, needs credentials |
| R4.7 | At least one complete journey has been **heard through a real screen reader** | The session notes | Needs hardware and a person |
| R4.8 | ~~`docs/traceability-v1.1-candidate.md` is reviewed and either approved and frozen, or explicitly declined~~ **Met 2026-08-31** — reviewed, approved and frozen as v1.1 | The Approval and Freeze Notes in `docs/traceability.md` | Owner |

**R4 cannot be compressed by working harder.** Every row waits on somebody who
is not writing code, and R4.1–R4.4 need competence this repository does not
contain: the platform will operate in Türkiye and hold personal data — accounts,
email addresses, and contact details revealed through Direct Contact. Nothing in
the repository addresses KVKK, and I am not able to assess it.

## 8. What is deliberately not here

- **Availability, latency and capacity targets.** The Engineering Constitution
  §12.7 says these "are defined by the applicable service or release plan" and
  that the Constitution "does not own one repository-wide numeric target".
  Inventing them here would take an ownership this document does not have. R3.3
  records what was *achieved*; agreeing what is *required* is the Owner's.
- **Anything about product behaviour.** Rule 4 of §3.
- **A launch recommendation.** Rule 5 of §3.

## 9. Suggested order, and why

R1 → R2 → R3, with R4 running alongside from the start.

R1 first because deploying something you cannot observe means the first
production incident is also the first time anyone looks. R2 before R3 because a
restore needs somewhere to restore *into*. **R4 starts now regardless** — it is
the longest lead time and the only group that engineering cannot accelerate.

## 10. Owner decisions this document needs

1. Accept, amend or reject these criteria as the Release milestone's exit
   condition.
2. Choose the hosting target, which unblocks R2 and therefore R3.
3. Say who owns R4.1–R4.4, and whether counsel is already engaged.
4. Resolve the milestone numbering (`COMPLETION_AND_MILESTONE_STRUCTURE.md` §3).

Until 1 is answered, no schedule for release can be built on anything.
