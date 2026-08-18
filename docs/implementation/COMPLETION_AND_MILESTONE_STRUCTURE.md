# Completion Picture and Milestone Structure

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft — awaiting Owner decisions
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-18
- **Purpose:** Answer "how far is this from going live" with what the repository
  can actually show, and set out the milestone structure the answer needs.
- **Scope:** No Frozen document is edited. Every milestone decision below is
  proposed, not recorded as taken.

## 1. The short answer

**The product is built. The launch has not been started.**

That is not a hedge — it is the shape of the situation. Nothing about the
product is waiting on engineering judgement. Everything about *shipping it* is
waiting on decisions nobody has made and infrastructure nobody has written.

**A date cannot be given yet, and the reason is recorded in the repository
itself**, in `PROJECT_ROADMAP.md`:

> `M10 — Release | Not Started | Product meets approved release criteria`
>
> "Decide what M10 Release requires. **Nothing in the repository states its
> criteria**, and the Stories cannot say — they describe a product, not a
> launch."

A schedule estimated against undefined criteria would be a number with nothing
underneath it. Section 5 proposes the criteria; once they are agreed, the
remaining work becomes countable.

## 2. What is done, counted rather than asserted

| | Verified against the repository on 2026-08-18 |
|---|---|
| Frozen Generated Stories | **50 of 50 `Done`**, each Acceptance Criterion matched to the test that verifies it |
| Acceptance Criteria traced | 526, in `DELIVERY_STATUS_ADVANCEMENT.md` |
| API routes | 87 handlers |
| Web routes | 22 pages |
| Tests | **817 across 88 files** |
| Verification chain | format, lint, module boundaries, types, OpenAPI (no drift), tests, dependency audit, production build — all green |
| Target CI | green through I19, on the Owner's confirmation of 2026-08-18 |
| Delivery increments closed | **20**, I0 through I19 |

Every Frozen UX document has a surface. Both outbound integrations have a chosen
vendor and a working adapter.

## 3. The milestone numbering has to be settled first

`PROJECT_ROADMAP.md` flags this itself and declines to fix it, correctly:

> "**The numbering below M9 does not agree across the repository**, and this
> roadmap is not the document that can settle it. […] Whichever way the Owner
> resolves it — renumbering the records or giving this table the missing rows —
> is a governance decision rather than a documentation fix."

The disagreement, concretely:

| Source | Says |
|---|---|
| `PROJECT_ROADMAP.md` milestone table | M9 Development → **M10 Release**. No M11, no M12 |
| `M11_SLICE_SCOPE_RECONCILIATION.md` | A **Milestone 11** = the first safe vertical slice |
| `CURRENT_STATUS.md`, throughout | A **Milestone 12** = the I1–I19 increments |

So "M10" means *Release* in one document and is skipped entirely in the others,
and the twenty increments actually delivered live under numbers the roadmap has
never had a row for.

**Two ways out, and the choice is the Owner's:**

- **(a) Give the roadmap the missing rows.** M10 becomes First Vertical Slice,
  M11 becomes Story Delivery, M12 becomes Release. The implementation records
  stay as written; the roadmap gains two rows and Release moves to M12.
- **(b) Renumber the implementation records.** The roadmap's table stands, M10
  stays Release, and the M11/M12 references in the records are corrected to the
  increment numbering (I0–I19) they actually describe.

(a) touches one Living document and leaves twenty closure records untouched.
(b) touches many records to protect one table. **(a) is recommended** for that
reason alone, but it is a governance decision and is not taken here.

Section 5 is written for (a) and uses **M12 — Release**; if (b) is chosen, read
it as M10 throughout. Nothing else in it changes.

## 4. What actually stands between here and live

Grouped by what kind of thing it is, because that determines who can move it.

### 4.1 There is no deployment. At all.

This is the largest single gap and it is not partially done:

- **No `Dockerfile`**, anywhere in the tree.
- **No infrastructure definition.** `infrastructure/` exists and is **empty**.
- **No hosting configuration** — no Terraform, no `fly.toml`, no `render.yaml`,
  no `vercel.json`.
- `compose.yaml` is **PostgreSQL for local development only**. It does not
  build or run the API, the worker or the web app.
- CI **verifies and does not deploy**. `.github/workflows/ci.yml` runs the
  chain and the two database gates, then stops.

Nothing here is a defect — none of it was ever in scope for an increment. It is
simply absent, and it is the work that a release milestone is mostly made of.

### 4.2 Controls the Engineering Constitution requires and that do not exist

| Requirement | State |
|---|---|
| §12.2 Metrics — "Each production component shall expose metrics appropriate to its role" | **None.** No metrics of any kind. Planned as the next increment |
| §13.3 Recovery evidence — "A backup that has never been restored successfully is not sufficient recovery evidence" | **No backup, and no restore ever attempted** |
| §10.2 Performance and resilience tests — "Required before release" | **None.** No load test, no concurrency test, no soak test |
| §13 Retry / cancellation behaviour | Defined for the outbox and the two vendors. **Undefined for the database** — I19 supplied timeout and recorded that retry was deliberately not designed |

### 4.3 Numbers that are judgements and have never been measured

Three increments shipped values chosen by reasoning, each recorded as such in
its own closure:

- `DATABASE_POOL_MAX = 10` (I18) — *"Ten is a default, not a measurement."*
- `statement_timeout = 5s` (I19) — *"Five seconds is a judgement, not a
  measurement."*
- The retention windows (I17) — the sweep *"has never run against a table with a
  real backlog."*

None of them is wrong. None of them is known to be right either, and only load
against a realistic dataset can settle that. This is why §10.2 exists.

### 4.4 Things only a real request can prove

- **Postmark has never sent a message.** Every test drives a stub. The failures
  that appear only against a live vendor — an unconfirmed sender signature, a
  domain not verified, a regional restriction — appear the first time and not
  before.
- **Anthropic has never answered a question.** Same shape: a model name that
  does not exist, a rate limit, a regional block.
- **No page has been heard through a real screen reader.** I10 closed what could
  be read from the source and said plainly that nothing there substitutes.

### 4.5 Owner decisions still open

- Review, approve and — if decided — freeze `docs/traceability-v1.1-candidate.md`.
  The superseding revision is written and deliberately carries no Approval note.
- Resolve the milestone numbering (§3 above).
- Agree the release criteria (§5 below).

### 4.6 Outside the repository entirely, and outside my competence

Raised because it is missing rather than because I can assess it: this is a
commerce platform that will operate in Türkiye and hold personal data — accounts,
email addresses, contact details revealed through Direct Contact. The repository
contains **no privacy notice, no data-subject request path, no terms of use, no
cookie disclosure**, and no document naming who is responsible for them.

I17 set data retention windows with the Owner, which is one input to that work
and not a substitute for it. **This needs someone qualified in KVKK**, and it is
the kind of gap that stops a launch rather than delaying one.

## 5. Proposed structure for the Release milestone

M12 (or M10 — see §3) is too large to be one gate. Proposed as four, each with
an exit condition that can be checked rather than felt.

| Gate | Exit condition | Blocked by |
|---|---|---|
| **R1 — Observable** | Metrics exist for the questions I17–I19 raised and cannot answer; logs and metrics are reachable from wherever the product runs | Engineering only |
| **R2 — Deployable** | The API, worker and web app build and run from a definition in the repository; one command puts a known commit in an environment; rollback is a defined act | Owner picks the hosting target |
| **R3 — Survivable** | A backup exists, **a restore has been performed successfully**, and the §4.3 numbers have been measured under load rather than reasoned about | R2 |
| **R4 — Lawful and answerable** | Privacy notice, terms, data-subject request path and cookie disclosure exist and are approved; both vendors have handled one real request; one page has been heard through a screen reader | Owner and outside counsel |

**R4 is the one that cannot be compressed by working harder.** Everything in it
waits on somebody who is not writing code.

## 6. Why there is still no date, stated plainly

Three things are unknown to me, and each of them alone prevents an estimate:

1. **The criteria are not agreed.** §5 is a proposal. Until it — or something
   else — is accepted, "done" has no definition and a schedule has nothing to
   measure against.
2. **The hosting target is not chosen.** R2's size depends entirely on it, and
   R3 depends on R2.
3. **I do not know the capacity.** How many people, how much of their week, and
   whether counsel is already engaged are facts I have never been told and
   should not assume.

What can be said without any of that: **the product work is finished and the
launch work has not started.** The next useful act is agreeing §5, because it
converts an unanswerable question into a countable list.
