# US-PLT-F12-001 — Listing Reports

> **Freeze Note (0.1):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-04, together with `PLATFORM_FEATURE_REGISTRY.md` v1.2,
> `US-PLT-F11-001` v0.1 and `traceability.md` v2.1. This exact version must not
> be edited in place; a further change requires a controlled revision under
> `DOCUMENT_LIFECYCLE.md` §7–§8.
>
> **Approval Note (0.1):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-04 — _"Bekleyen dört aday belgeyi … resmi
> olarak onaylıyorum. Belgeleri dondurup (Freeze) F12'nin §21'e bağlanma
> sürecini tamamlayabilir ve eski sürümleri arşive kaldırabilirsin."_
>
> **Creation Note (0.1):** First controlled Generated Story for Platform
> Feature `F12`. The identifier consumes Domain code `PLT` from
> `REPOSITORY_GOVERNANCE.md` and Feature ID `F12` from
> `PLATFORM_FEATURE_REGISTRY.md`, Frozen v1.1 when this Story was drafted and
> Frozen v1.2 as it is Frozen.
>
> **This Story could not exist until §21 did, and the registry said so.**
> `PLATFORM_FEATURE_REGISTRY.md` v1.1 allocated `F12` with its behaviour-owner
> reference recorded as **Pending** and stated: _"Until one exists, no Generated
> Story may be written against `F12`."_ `PRD-0006-platform.md` **§21** is that
> owner, and it became authoritative on 2026-09-03 when **v2.5** was Approved
> and Frozen.
>
> **The owning revision is v2.5, not the v2.4 this Story named at Draft.** v2.4
> carried §21 but was superseded before it was ever Frozen, so every reference
> below was re-pointed at v2.5 before Freeze. A Frozen Story citing v2.4 would
> point at a version that never became authoritative — the same defect the
> registry's Pending marker existed to prevent.
>
> **The behaviour was built first.** Listing Reports were implemented on
> 2026-09-03 in increment `I69`, at the Owner's request (_"Hata Bildir"_), with
> no PRD section and no Story. The order was wrong. This Story and §21 are
> written from the requirement rather than from the implementation, and where
> they disagree §21 wins.
>
> **§21.5's retention period was a question when this Story was drafted; it is
> now decided.** The Owner set it at 180 days on 2026-09-03, v2.5 §21.5 records
> the decision, and increment `I77` implements the sweep. AC-11 names the period
> rather than proposing it.
>
> This document creates no Feature, Capability, PRD/UX behaviour, approval,
> Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-PLT-F12-001` |
| Story Title | Listing Reports |
| Parent Story Document | `US-0006 Platform` (`US-0006-platform.md`) |
| Story Domain | Platform |
| Domain Code | `PLT` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Operational Visibility |
| Feature | `F12` — Listing Reports |
| Feature ID | `F12` — owned by Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.2 |
| Relationship Classification | No Capability Architecture required |
| Capability Reference | Not required under ADR-0007 |
| Perspective | A reader who can see that a listing is wrong, and the Admin who decides about it |
| Behaviour Owner | `PRD-0006-platform.md` **Frozen v2.5 §21** |
| Experience Owner | `UX-0006-admin-dashboard.md`; `UX-0003-offering-detail.md` §8.8 |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Implemented |
| Priority | Must |
| Story Size | M |
| Version | 0.1 |
| Last Updated | 2026-09-04 |
| Approval Date | 2026-09-04 |
| Approved By | Product Owner / Architecture Owner |
| Freeze State | Frozen |
| Freeze Date | 2026-09-04 |
| Frozen By | Product Owner / Architecture Owner |
| Supersedes | None — first Story version |

---

## 2. Story Identification

| Segment | Value | Owner by Reference |
|---|---|---|
| Prefix | `US` | `USER_STORY_HANDBOOK.md` |
| `[DOMAIN]` | `PLT` | `REPOSITORY_GOVERNANCE.md` |
| `[FEATURE_ID]` | `F12` | Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.2 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

---

## 3. Purpose

Let anybody reading a listing say that something on it is wrong, give an Admin a
queue of those claims to judge, and keep the judgement strictly separate from
every action that can change a listing.

---

## 4. Business Value

> **As a** person reading a listing whose price, stock or link is wrong
> **I want** to say so in one press, without an account and without a form
> **So that** the platform learns a fact only the partner can correct, and the
> next reader is not sent to the same wrong page

> **As an** authorized Admin
> **I want** those claims as a queue with the reason and the pattern visible
> **So that** I can act through the sections that own actions, rather than
> having reports act on my behalf

---

## 5. Description

The platform had exactly one way to say something was wrong with a listing, and
it was an Admin opening a Moderation Case. That is a governed act by a person
with authority; a reader who can see that a price is stale had no way to say so,
and the platform lost the only signal it can get about facts only a partner can
correct.

A report is an **unverified claim by anybody, about one listing**. It carries a
reason from a closed list, optionally the person's own words, and nothing else —
no name, no address, no telephone number. Signing in is not a condition of being
heard; the account is recorded when it happens to be there, so a pattern from one
source is visible.

The whole design turns on one boundary: **a report changes nothing**. Accepting
one records that an Admin agrees there is something to fix; what is then done
happens through §7, §7.3, or a conversation outside this platform. A report count
never orders, demotes or marks a listing anywhere — the same boundary §20.3 draws
around advertising, and for the same reason: an unverified claim that could move
a listing is a way to move a listing by making claims.

A dismissed report is kept, because it is evidence too: five dismissed reports
about one listing is a different fact from one.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0006-platform.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `PLT` code |
| Feature Registry | `PLATFORM_FEATURE_REGISTRY.md` v1.2 | `F12` identity, scope label, and the behaviour-owner reference that discharges v1.1's Pending marker |
| PRD | `PRD-0006-platform.md` Frozen v2.5 §21 | The whole of this Feature's behaviour |
| Supporting PRD | `PRD-0006-platform.md` §5.3, §7 | Moderation Case, which a report is not |
| Supporting PRD | `PRD-0002-discovery.md` | Results ordering, which a report count may not influence |
| Supporting PRD | `PRD-0001-offering.md` | Public eligibility, which decides what may be reported |
| UX | `UX-0006-admin-dashboard.md` | The queue |
| UX | `UX-0003-offering-detail.md` §8.8 | Where a person reports |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Platform Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall accept a report about a publicly eligible listing from anybody, whether or not they are signed in, and shall request no identity.
- **AC-2** — The system shall require a reason from the closed list in §21.2 and shall accept the person's own words as optional and bounded.
- **AC-3** — The system shall record the reporting account when the person is signed in, and shall record none when they are not.
- **AC-4** — The system shall refuse a report against anything that is not a publicly eligible listing, and shall say nothing about whether that listing exists.
- **AC-5** — The system shall present the report queue only in an authorized active Admin context.
- **AC-6** — The system shall hold a report as Open until an Admin reviews it, and then as Accepted or Dismissed.
- **AC-7** — The system shall record the reviewer and the review time on a report that is not Open, and neither on one that is.
- **AC-8** — The system shall change nothing about the listing when a report is reviewed, and shall open no Moderation Case automatically.
- **AC-9** — The system shall let no report count order, demote or mark a listing anywhere in Discovery, and shall include no report count in the §11.2 indicator inventory.
- **AC-10** — The system shall keep a dismissed report as evidence rather than deleting it on review.
- **AC-11** — The system shall delete a reviewed report, together with the words it carries, 180 days after its review, and shall keep an Open report whatever its age, per §21.5.
- **AC-12** — The system shall bound the number of reports one source may send within an hour.
- **AC-13** — The system shall send the reporter no reply, notification or outcome.

---

## 8. BDD

### Scenario: AC-1 — Anybody may report

```gherkin
Given a publicly eligible listing
And a person who is not signed in
When they submit a reason about that listing
Then the report is recorded
And no name, address or telephone number is requested
```

### Scenario: AC-2 — A reason is required and the words are not

```gherkin
Given a publicly eligible listing
When a report is submitted with a reason and no words
Then the report is recorded
When a report is submitted with words and no reason
Then it is refused
```

### Scenario: AC-3 — A signed-in reporter is recorded

```gherkin
Given a signed-in person reports a listing
Then the report records their account
Given a person who is not signed in reports a listing
Then the report records no account
And both reports are otherwise equal
```

### Scenario: AC-4 — An ineligible listing cannot be reported

```gherkin
Given an address that is not a publicly eligible listing
When a report is submitted against it
Then the report is refused
And the refusal does not say whether that listing ever existed
```

### Scenario: AC-5 — The queue requires Admin context

```gherkin
Given a person who is not in an authorized active Admin context
When they attempt to read the report queue
Then the attempt is refused
And nothing about any report is disclosed
```

### Scenario: AC-6 — Three states and no more

```gherkin
Given a submitted report
Then it is Open
When an Admin reviews it
Then it is Accepted or Dismissed
And no other state is reachable
```

### Scenario: AC-7 — Review evidence

```gherkin
Given an Open report
Then it records no reviewer and no review time
When an Admin reviews it
Then it records both
```

### Scenario: AC-8 — Reviewing changes nothing about the listing

```gherkin
Given an Open report about a listing
When an Admin accepts it
Then the report is Accepted
And the listing's exposure, eligibility and lifecycle are unchanged
And no Moderation Case is opened automatically
```

### Scenario: AC-9 — A report cannot move a listing

```gherkin
Given a listing with several open reports about it
When Results containing that listing are ordered
Then the order is the product-defined order
And no report has advanced, delayed or marked it
And no indicator reports the number of reports
```

### Scenario: AC-10 — A dismissal is kept

```gherkin
Given an Open report about a listing
When an Admin dismisses it
Then the report is Dismissed
And it remains readable beside the other reports about that listing
```

### Scenario: AC-11 — A reviewed report is eventually deleted

```gherkin
Given a report that was reviewed longer ago than the retention period
When retention is applied
Then the report is deleted
And the words it carried are deleted with it
Given an Open report of any age
Then it is not deleted
```

### Scenario: AC-12 — One source is bounded

```gherkin
Given a source that has sent the permitted number of reports within an hour
When it sends another
Then that report is refused
And the bound is generous enough that a person working through a Category is not stopped
```

### Scenario: AC-13 — The reporter hears nothing back

```gherkin
Given a report is reviewed
Then no reply, notification or outcome is sent to the reporter
And the platform holds no address to send one to
```

---

## 9. Dependencies

### Depends On

- `US-PLT-F01-001` — authorized active Admin context for the queue.
- `PRD-0006-platform.md` **v2.5 §21** — Approved and Frozen on 2026-09-03, the sole behaviour owner of this Story. This precondition is met.
- The Owner's §21.5 retention decision, for AC-11 — taken on 2026-09-03 at 180 days.

### Blocks

- None.

---

## 10. Story Size

**M**

One public action with no identity, one Admin queue with three states, and a
strict separation from every action that can change a listing.

---

## 11. Out of Scope

- Replying to, notifying or corresponding with the reporter.
- Forwarding a report to the Business or the partner it concerns.
- Any automatic moderation, hide, restore, restrict or retire.
- Any report count in Discovery ordering, in an indicator inventory, or on a
  public surface.
- Verifying a report. A report is a claim; the platform records it and an Admin
  judges it.

---

## 12. Definition of Ready

Readiness is governed by `USER_STORY_HANDBOOK.md` §11 and is referenced here, not duplicated.

**This Story is not Ready.** Its only behaviour owner is a Draft PRD revision,
and one Acceptance Criterion depends on a decision the Owner has not taken.

---

## 13. Definition of Done

Completion is governed by `USER_STORY_HANDBOOK.md` §18 and is referenced here, not duplicated.

**Delivery Status is recorded as Implemented.** The behaviour was built in
`I69` before this Story or §21 existed, and the governance chain closed behind
it rather than ahead of it: §21 was Frozen in `PRD-0006` v2.5 on 2026-09-03 and
this Story was Frozen on 2026-09-04. Recording it as `Not Started` would be
false, and the out-of-order history is recorded above rather than smoothed away.
Retention (AC-11) — neither built nor decided when this Story was drafted — was
decided by the Owner on 2026-09-03 and implemented in `I77`.

---

## 14. Story Validation Checklist

- [x] Represents one bounded Platform outcome
- [x] Provides observable Admin, person, or platform value
- [x] Independently understandable
- [x] Independently testable
- [x] Traceable to one Parent, Epic, Feature, PRD, and exact applicable UX
- [x] Domain code and Feature ID resolve to authoritative owners
- [x] Relationship classification and Capability reference match the Frozen Feature Registry
- [x] No duplicate Story identified in the current Platform package
- [x] No implementation details
- [x] **No invented upstream behaviour** — the whole Story is owned by `PRD-0006-platform.md` Frozen v2.5 §21, Approved and Frozen on 2026-09-03.
- [x] Every Acceptance Criterion begins with "The system shall…"
- [x] Every Acceptance Criterion has one explicitly numbered Story-internal BDD scenario

---

## 15. Notes

`F12` exists because `F02` General Moderation is the wrong shape for it. A case
is opened by an Admin with authority and can change a target's state; a report is
opened by anybody and can change nothing. Folding them together would have made
the queue an Admin reviews indistinguishable from a queue anybody can fill.
