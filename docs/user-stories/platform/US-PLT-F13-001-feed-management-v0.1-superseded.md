# US-PLT-F13-001 — Feed Management

> **Freeze Note (0.1):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-07, **third of three and never earlier**: `PRD-0006` v2.6
> §24, then `PLATFORM_FEATURE_REGISTRY.md` v1.3, then this Story. This exact
> version must not be edited in place; a further change requires a controlled
> revision under `DOCUMENT_LIFECYCLE.md` §7–§8.
>
> **Approval Note (0.1):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-06 — _"Hazırladığın PRD-0006 v2.6, Registry v1.3
> ve US-PLT-F13-001 taslaklarını resmi olarak onaylıyorum."_
>
> **Creation Note (0.1):** First controlled Generated Story for Platform Feature
> `F13`. The identifier consumes Domain code `PLT` from
> `REPOSITORY_GOVERNANCE.md` and Feature ID `F13` from
> `PLATFORM_FEATURE_REGISTRY.md`, Frozen v1.3.
>
> **Two Acceptance Criteria are not met by the code, and the Owner knew that
> when he approved.** §13 names them — AC-3 and AC-9 — and he set the order:
> _"F13 taslağında tespit ettiğin iki dürüstlük notu … için gereken teknik
> düzeltmeleri ise belgeler dondurulduktan sonraki ilk kod artışında
> tamamlayabilirsin."_ The document is the requirement; the code follows it.
>
> **The behaviour was built first.** Feed management shipped on 2026-09-03 in
> increment `I76`, at the Owner's request that partner catalogues arrive _"as an
> affiliate feed rather than as scraping"_, with no PRD section, no Feature and
> no Story. `traceability.md` Frozen v2.2 §5C.2 recorded that gap, and the Owner
> commissioned this chain on 2026-09-06: _"PRD-0006'daki Feature listesine
> F13'ü ekleyerek, yöneticinin feed kaynaklarını tanımladığı, eşleştirmeleri
> yönettiği ve çalışma loglarını okuduğu yüzeyi tanımla."_
>
> The Story is written from the requirement rather than from the implementation.
> Where they disagree, §24 wins and the code changes.
>
> **What an intake may do to a listing is not this Story's.** `PRD-0001` §5.11
> owns that, and its Frozen v4.2 narrowed it to price and stock. This Story owns
> the surface that configures a feed and nothing that happens afterwards.
>
> This document creates no Feature, Capability, PRD/UX behaviour, approval,
> Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-PLT-F13-001` |
| Story Title | Feed Management |
| Parent Story Document | `US-0006 Platform` (`US-0006-platform.md`) |
| Story Domain | Platform |
| Domain Code | `PLT` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Operational Visibility |
| Feature | `F13` — Feed Management |
| Feature ID | `F13` — owned by Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.3 |
| Relationship Classification | No Capability Architecture required |
| Capability Reference | Not required under ADR-0007 |
| Perspective | The Admin who registers a partner's feed and has to know what it did |
| Behaviour Owner | `PRD-0006-platform.md` **Frozen v2.6 §24** |
| Experience Owner | `UX-0006-admin-dashboard.md` — section pending |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Implemented |
| Priority | Must |
| Story Size | M |
| Version | 0.1 |
| Last Updated | 2026-09-07 |
| Approval Date | 2026-09-06 |
| Approved By | Product Owner / Architecture Owner |
| Freeze State | Frozen |
| Freeze Date | 2026-09-07 |
| Frozen By | Product Owner / Architecture Owner |
| Supersedes | None — first Story version |

---

## 2. Story Identification

| Segment | Value | Owner by Reference |
|---|---|---|
| Prefix | `US` | `USER_STORY_HANDBOOK.md` |
| `[DOMAIN]` | `PLT` | `REPOSITORY_GOVERNANCE.md` |
| `[FEATURE_ID]` | `F13` | Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.3 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

---

## 3. Purpose

Let an authorized Admin point the platform at a partner's document, describe
which field in it means what, stop it when it should stop, and read exactly what
each run did — without that surface being able to create, publish or edit a
single listing.

---

## 4. Business Value

> **As an** authorized Admin
> **I want** to register a partner's feed and describe its fields once
> **So that** the prices and stock states of listings we already carry stay
> current without anybody retyping them

> **As an** authorized Admin whose feed is not doing what I expected
> **I want** each run to say what it read, what it updated, what it passed over
> and what it refused — with a reason
> **So that** I can tell a partner's broken document from my own wrong mapping,
> which are two different jobs for two different people

---

## 5. Description

A feed is somebody else's document, read on a schedule. Everything that makes it
useful and everything that makes it dangerous comes from that one sentence: the
platform does not control its shape, its availability or its truthfulness, and
it changes prices on a live catalogue.

So the surface is deliberately small. An Admin says **whose** feed it is, **where**
it is, **what shape** it has, and **which field means what**. That is the whole
of the configuration, and §24.4 forbids it accepting anything else — a mapping
describes another party's document, and is not a place to put a setting nobody
agreed to add.

What an Admin gets back is a **run record**, and it is the reason this Feature
exists at all rather than being a configuration file. A run says what it read,
what it updated, what it **passed over** — a partner's document is their whole
catalogue and the platform carries a curated part of it, so a healthy run passes
over most of what it reads — and what it **refused**, with a reason for each.
Passed over and refused are counted apart on purpose: a run that reported four
thousand ordinary skips as failures would bury the one row an operator has to
fix.

**Pausing stops reading. It does not withdraw anything.** A paused feed's
listings stay exactly as they are, because withdrawing them is a moderation
decision and §7 owns those. An Admin who wants that takes it deliberately.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0006-platform.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `PLT` code |
| Feature Registry | `PLATFORM_FEATURE_REGISTRY.md` Frozen v1.3 | `F13` identity and scope label |
| PRD | `PRD-0006-platform.md` Frozen v2.6 §24 | The whole of this Feature's behaviour |
| Supporting PRD | `PRD-0006-platform.md` §12 | The exhaustive list of places operational rules live, which §24 joins |
| Supporting PRD | `PRD-0001-offering.md` Frozen v4.2 §5.11 | What an intake may do to an Offering — not this Story's, and the boundary this surface may not cross |
| Supporting PRD | `PRD-0006-platform.md` §7 | Moderation, which pausing a feed is not |
| UX | `UX-0006-admin-dashboard.md` | The Admin Panel this surface belongs to; its own section is pending |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Platform Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall present every feed management surface only in an authorized active Admin context, and shall refuse every other caller.
- **AC-2** — The system shall let an Admin register a feed carrying the partner it may touch, the heading its products are filed under, the document address, the document format, and the field mapping.
- **AC-3** — The system shall accept in the mapping only the fields §24.1 names, and shall refuse a mapping that carries any other key.
- **AC-4** — The system shall let an Admin pause an active feed and start a paused one, and shall not read a paused feed on the schedule.
- **AC-5** — The system shall leave the lifecycle state and the public eligibility of every listing unchanged when a feed is paused.
- **AC-6** — The system shall record every run with its outcome, its start and its finish.
- **AC-7** — The system shall record, for a run that succeeded, the number of products read, the number of listings updated, the number of products passed over, and the number of rows refused.
- **AC-8** — The system shall count a product the platform does not carry, and a product whose listing is not published, as passed over rather than refused.
- **AC-9** — The system shall record, for a run that failed, a reason that distinguishes a server that refused, a document that could not be parsed, and a mapping that names a field the document does not have.
- **AC-10** — The system shall keep a bounded sample of refusals with the reason for each, and shall record the full refusal count whatever the sample size.
- **AC-11** — The system shall create no Offering, publish no Offering, and change no Offering field other than those `PRD-0001` §5.11.1 permits, through this surface or anything it configures.
- **AC-12** — The system shall disclose no feed, run, mapping or refusal to any caller outside an authorized active Admin context.

---

## 8. BDD

### Scenario: AC-1 — The surface requires Admin context

```gherkin
Given a signed-in account without Admin authorization
When it addresses any feed management surface
Then the request is refused
And nothing about any feed is disclosed
```

### Scenario: AC-2 — Registering a feed

```gherkin
Given an authorized Admin
When a partner, a heading, an address, a format and a mapping are supplied
Then the feed exists
And it is active
```

### Scenario: AC-3 — The mapping is closed

```gherkin
Given an authorized Admin registering a feed
When the mapping carries a key §24.1 does not name
Then the registration is refused
And the refusal names the key
```

### Scenario: AC-4 — Pausing stops the reading

```gherkin
Given an active feed
When an Admin pauses it
Then the scheduled reading does not include it
When the Admin starts it again
Then the scheduled reading includes it
```

### Scenario: AC-5 — Pausing withdraws nothing

```gherkin
Given a feed that maintains published listings
When the feed is paused
Then those listings are still Published
And their public eligibility is unchanged
```

### Scenario: AC-6 — Every run is recorded

```gherkin
Given a feed that is read
When the run ends, successfully or not
Then a run record exists carrying its outcome, its start and its finish
```

### Scenario: AC-7 — A successful run says what it did

```gherkin
Given a feed whose document offers products
When the run succeeds
Then the record carries the number read, the number updated, the number passed over and the number refused
```

### Scenario: AC-8 — Passed over is not refused

```gherkin
Given a document offering a product the platform does not carry
And a document offering a product whose listing is not Published
When the run succeeds
Then both are counted as passed over
And neither is counted as refused
```

### Scenario: AC-9 — A failed run says why, usefully

```gherkin
Given a feed whose server refuses the request
When the run ends
Then the recorded reason identifies the server's refusal
Given a feed whose document cannot be parsed
When the run ends
Then the recorded reason identifies the document
Given a feed whose mapping names a field the document does not carry
When the run ends
Then the recorded reason identifies the mapping
```

### Scenario: AC-10 — Refusals are sampled and counted

```gherkin
Given a run refusing more rows than the platform stores
When the run is recorded
Then a bounded sample of refusals with reasons is kept
And the recorded refusal count is the full number
```

### Scenario: AC-11 — The surface creates and publishes nothing

```gherkin
Given a feed whose document offers a product the platform does not carry
When the run completes
Then no Offering is created
Given a feed matched to a listing that is not Published
When the run completes
Then that listing is neither published nor repriced
```

### Scenario: AC-12 — Runs are not public

```gherkin
Given any caller outside an authorized active Admin context
When it addresses a feed's runs
Then the request is refused
And no refusal reason, mapping or partner address is disclosed
```

---

## 9. Dependencies

### Depends On

- `US-PLT-F01-001` — authorized active Admin context for every surface here.
- `PRD-0006-platform.md` **Frozen v2.6 §24** — the sole behaviour owner. Met on
  2026-09-07.
- `PLATFORM_FEATURE_REGISTRY.md` **Frozen v1.3** — allocates `F13`. Met on
  2026-09-07.
- `PRD-0001-offering.md` Frozen v4.2 §5.11.1 — what an intake may do once
  configured. Met.

### Blocks

- None.

---

## 10. Story Size

**M**

One bounded configuration surface, one run record, and one boundary — that the
surface which configures an intake may not do what the intake may not do.

---

## 11. Out of Scope

- What an intake does to a listing once it is configured. `PRD-0001` §5.11 owns
  it, and Frozen v4.2 narrowed it to price and stock.
- How a document row is matched to a listing. `PRD-0001` v4.2 §5.11.1 calls the
  match rule an engineering concern governed by its own documents.
- The 72-hour missing-product tolerance and the withdrawal at the end of it:
  `PRD-0001` §5.11.1a owns the Intake Availability Input.
- Any partner-facing surface. A partner does not register their own feed at V1;
  the Owner's decision of 2026-09-05 keeps every partner account under platform
  management.
- Notifying anybody when a run fails. The record is read; nothing is sent.

---

## 12. Definition of Ready

Readiness is governed by `USER_STORY_HANDBOOK.md` §11 and is referenced here, not duplicated.

**This Story is Ready.** Both preconditions of §9 were met on 2026-09-07, in the
order the Freeze Note records.

---

## 13. Definition of Done

Completion is governed by `USER_STORY_HANDBOOK.md` §18 and is referenced here, not duplicated.

**Delivery Status is recorded as Implemented, and the order was wrong.** The
surface was built in `I76` on 2026-09-03, three days before any document owned
it. Recording it as `Not Started` would be false; recording it as Implemented
without saying that the governance chain closed behind it rather than ahead of
it would be worse. `I88` and `I89` later narrowed what the configured intake may
do, under `PRD-0001` v4.2, which is the part of this history that happened in
the right order.

Two Acceptance Criteria are **not** met by what exists today and are written as
the requirement rather than as a description: **AC-3** (the mapping is not
refused for carrying an unnamed key) and **AC-9** (a failed run records a
message, and the three causes are distinguishable in its text rather than as a
recorded kind). Both are small, and both change code rather than this Story.

---

## 14. Story Validation Checklist

- [x] Represents one bounded Platform outcome
- [x] Provides observable Admin value
- [x] Independently understandable
- [x] Independently testable
- [x] Traceable to one Parent, Epic, Feature, PRD, and applicable UX
- [x] Domain code and Feature ID resolve to authoritative owners — `F13` in Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.3
- [x] Relationship classification and Capability reference match the proposed Feature Registry row
- [x] No duplicate Story identified in the current Platform package
- [x] No implementation details
- [x] **No invented upstream behaviour** — every clause traces to `PRD-0006` Frozen v2.6 §24
- [x] Every Acceptance Criterion begins with "The system shall…"
- [x] Every Acceptance Criterion has one explicitly numbered Story-internal BDD scenario

---

## 15. Notes

`F13` exists because none of `F01`–`F12` covers it and one of them nearly does.
`F07` Affiliate Destination Administration is also an Admin surface over a
partner-supplied address, and folding feed management into it would have put two
unrelated things behind one Feature: `F07` decides whether **one** handoff may
earn, one address at a time, and this decides whether a **document** is read at
all. The first is a judgement about a partner's link; the second is a schedule.

The harder question was whether this belongs in `PRD-0001` beside §5.11, which
owns what an intake may do. It does not: §5.11 governs the effect on an
Offering, and this governs an Admin capability — and `PRD-0006` §12 is explicit
that every Admin-held operational rule must be named in a section of this
document, which is exactly the rule that was broken while this surface had none.
