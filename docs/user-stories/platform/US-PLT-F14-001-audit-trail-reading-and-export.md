# US-PLT-F14-001 — Audit Trail Reading and Export

> **Freeze Note (0.1):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-07, after `PRD-0006` v2.6 and `PLATFORM_FEATURE_REGISTRY.md`
> v1.3. This exact version must not be edited in place; a further change
> requires a controlled revision under `DOCUMENT_LIFECYCLE.md` §7–§8.
>
> **Approval Note (0.1):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-07 — _"US-PLT-F14-001 taslağını resmi olarak
> onaylıyorum… Belgeyi hemen dondurup izlenebilirlik defterini tamamen
> kapatabilirsin."_ Approval and Freeze were taken in one decision.
>
> **Creation Note (0.1):** First controlled Generated Story for Platform Feature
> `F14`. The identifier consumes Domain code `PLT` from
> `REPOSITORY_GOVERNANCE.md` and Feature ID `F14` from
> `PLATFORM_FEATURE_REGISTRY.md`, Frozen v1.3.
>
> **This Story did not exist when its upstream documents were approved.** The
> Owner approved `PRD-0006` v2.6, the registry v1.3 and `US-PLT-F13-001` on
> 2026-09-06 and commissioned this one in the same message; it was written from
> that commission, held at Draft rather than frozen with them, and approved on
> its own on 2026-09-07 after he had read it.
>
> **Why `F14` exists**, in the Owner's words of 2026-09-06: _"`/admin/audit-logs`
> adresi salt bir veri deposu değil; filtreleme parametreleri, sayfalama mantığı
> ve CSV dışa aktarma (export) işlemlerini barındıran tam teşekküllü bir
> operasyon yüzeyidir. Özellik kimliği atanmamış bir arayüz, yetkilendirme
> açısından sistemde sahipsiz bir kat çıkmak anlamına gelir."_ The distinction he
> drew is the one this Story rests on: **§22 is a rule about a record; this is an
> interface a person operates**, and a later Sub-Admin tier can only be refused
> access to something that has a name.
>
> **The behaviour was built first.** The reading surface shipped on 2026-09-05
> in increment `I84`, with the trail itself in `I83` and its extension to
> affiliate acts in `I87` — before §22 existed and before `F14` was allocated.
> `traceability.md` Frozen v2.2 §5C.2 recorded the gap; `PRD-0006` Frozen v2.6
> §22 closed it; this Story closes the chain.
>
> This document creates no Feature, Capability, PRD/UX behaviour, approval,
> Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-PLT-F14-001` |
| Story Title | Audit Trail Reading and Export |
| Parent Story Document | `US-0006 Platform` (`US-0006-platform.md`) |
| Story Domain | Platform |
| Domain Code | `PLT` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Operational Visibility |
| Feature | `F14` — Audit Trail Reading |
| Feature ID | `F14` — owned by Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.3 |
| Relationship Classification | No Capability Architecture required |
| Capability Reference | Not required under ADR-0007 |
| Perspective | The platform administrator asking what an Admin did, and when |
| Behaviour Owner | `PRD-0006-platform.md` **Frozen v2.6 §22**, and §22.6 for this surface |
| Experience Owner | `UX-0006-admin-dashboard.md` — section pending |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Implemented |
| Priority | Must |
| Story Size | S |
| Version | 0.1 |
| Last Updated | 2026-09-07 |
| Approval Date | 2026-09-07 |
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
| `[FEATURE_ID]` | `F14` | Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.3 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

---

## 3. Purpose

Let the platform administrator ask the audit trail the three questions an audit
is actually asked — who, what, and when — page through the answer, and take it
away as a file, without that surface disclosing a single thing to anybody the
trail is not for.

---

## 4. Business Value

> **As the** platform administrator
> **I want** to narrow the trail by the account that acted, by the act, and by a
> date range
> **So that** "what has this Admin done this month" is a question I can answer
> rather than a query somebody writes against a table

> **As the** platform administrator answering somebody else's question
> **I want** the view I am looking at to be a thing I can send, and to take the
> same entries away as a file
> **So that** the answer I give is the answer the screen showed, and not a
> retyping of it

---

## 5. Description

§22 makes the trail a record: what is written, that it cannot be changed, that
it is never swept, and that it belongs to the platform administrator alone. None
of that is a screen, and a record nobody can interrogate answers no question.

This Story is the interrogation. It is deliberately small — three filters, a
page, and an export — and every one of the three is a decision rather than a
convenience:

**The filters are the questions.** Who acted, what they did, and when. A surface
that offered only "everything, newest first" would satisfy the letter of §22 and
answer nothing an audit asks.

**Paging, with the total.** The trail is searched, not emptied — the opposite of
the moderation queue, which is paged nowhere because choosing which part of a
backlog to ignore is not a feature. A page that does not say how many entries
match cannot tell a reader whether they have seen the one they came for.

**The filters live in the address**, so a view is a thing that can be sent. A
compliance answer that exists only inside one person's browser is an answer that
gets retyped, and retyping is where it stops being the record.

**The export is the same view as a file**, built from the same filters, carrying
no name and no email address — §23.3 forbids them there as everywhere else.

And the whole of the risk is in one sentence: **this is where §22.5's
reservation is kept or lost.** A filter, a page or an export reachable by a tier
§22.5 excludes discloses precisely what the trail exists to protect — which is
why the surface resolves its own authority under its own name, so that the day a
Sub-Admin tier arrives there is one place to change and one word to look for.

Reading is not recorded. §22.6 says why: a log that grows when somebody looks at
it teaches Admins not to look, and an audit of the audit answers no question the
trail does not already answer.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0006-platform.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `PLT` code |
| Feature Registry | `PLATFORM_FEATURE_REGISTRY.md` Frozen v1.3 | `F14` identity and scope label |
| PRD | `PRD-0006-platform.md` Frozen v2.6 §22, §22.6 | The whole of this Feature's behaviour |
| Supporting PRD | `PRD-0006-platform.md` §22.2 | What is recorded — the closed list this surface filters by |
| Supporting PRD | `PRD-0006-platform.md` §22.4 | No retention, which is why the range has no cap |
| Supporting PRD | `PRD-0006-platform.md` §22.5 | Who may read, which is this Feature's whole risk |
| Supporting PRD | `PRD-0006-platform.md` §23.3 | No address in any export, this one included |
| Supporting PRD | `PRD-0006-platform.md` §21.5 | The 180-day retention that belongs to Listing Reports and **not** here |
| UX | `UX-0006-admin-dashboard.md` | The Admin Panel this surface belongs to; its own section is pending |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Platform Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall present the audit trail reading surface and its export only to the platform administrator, and shall refuse every other caller, including any Admin tier §22.5 excludes.
- **AC-2** — The system shall let the reader narrow entries by the acting account, by the act, and by a date range, in any combination.
- **AC-3** — The system shall accept only the acts §22.2 names as the act filter, and shall refuse any other value.
- **AC-4** — The system shall return entries newest first.
- **AC-5** — The system shall page the entries and shall state, with every page, the total number matching the filters.
- **AC-6** — The system shall carry the filters in the address of the view, so that opening the same address reproduces the same view.
- **AC-7** — The system shall show the last thirty days when no range is given.
- **AC-8** — The system shall apply no upper bound to how far back a range may reach, and shall return an entry of any age that matches.
- **AC-9** — The system shall treat the end of a date range as the whole of the day it names.
- **AC-10** — The system shall produce an export containing the entries the current filters match, and no others.
- **AC-11** — The system shall include no email address and no personal name in the export or in the view, per §23.3.
- **AC-12** — The system shall offer no operation that writes, edits or removes an entry.
- **AC-13** — The system shall record nothing in the trail when the trail is read or exported.

---

## 8. BDD

### Scenario: AC-1 — The surface belongs to one reader

```gherkin
Given a caller who is not the platform administrator
When it addresses the reading surface or the export
Then the request is refused
And no entry, count or filter value is disclosed
```

### Scenario: AC-2 — Three filters, in any combination

```gherkin
Given entries by two accounts, of two acts, on two days
When the reader filters by one account
Then only that account's entries are returned
When the reader filters by one account and one act
Then only the entries matching both are returned
```

### Scenario: AC-3 — The act filter is closed

```gherkin
Given the reading surface
When a value that is not one of §22.2's acts is supplied as the act filter
Then the request is refused
```

### Scenario: AC-4 — Newest first

```gherkin
Given entries recorded at different times
When a page is read
Then the entries are ordered from most recent to least
```

### Scenario: AC-5 — A page states the total

```gherkin
Given more matching entries than one page holds
When a page is read
Then it carries the entries of that page
And it states the total number matching the filters
```

### Scenario: AC-6 — A view can be sent

```gherkin
Given a filtered, paged view
When its address is opened again
Then the same filters and the same page apply
```

### Scenario: AC-7 — Thirty days by default

```gherkin
Given no range is supplied
When the surface is read
Then the entries of the last thirty days are returned
```

### Scenario: AC-8 — No cap on the range

```gherkin
Given an entry older than one hundred and eighty days
When the range is widened to include its date
Then the entry is returned
```

### Scenario: AC-9 — A day is a whole day

```gherkin
Given an entry recorded late on the last day of a range
When the range names that day as its end
Then the entry is returned
```

### Scenario: AC-10 — The export is the view

```gherkin
Given a filtered view
When the export is taken
Then the file contains the entries those filters match
And it contains no entry the filters exclude
```

### Scenario: AC-11 — No personal data leaves

```gherkin
Given any view or export of the trail
When it is produced
Then it contains no email address and no personal name
And each account is identified by its identifier
```

### Scenario: AC-12 — Reading is the only operation

```gherkin
Given the reading surface
When any write, edit or removal of an entry is attempted through it
Then no such operation exists
```

### Scenario: AC-13 — Looking is not recorded

```gherkin
Given the trail holds a known number of entries
When the platform administrator reads or exports it
Then the number of entries is unchanged
```

---

## 9. Dependencies

### Depends On

- `US-PLT-F01-001` — the authorized Admin context this surface sits inside.
- `PRD-0006-platform.md` **Frozen v2.6 §22 and §22.6** — the sole behaviour
  owner. Met on 2026-09-07.
- `PLATFORM_FEATURE_REGISTRY.md` **Frozen v1.3** — allocates `F14`. Met on
  2026-09-07.
- `PRD-0006-platform.md` §23 — the rule that keeps addresses out of the export.
  Met.

### Blocks

- A Sub-Admin tier. §22.5 requires that such a tier be refused this surface, and
  refusing it needs this Feature to exist. Any Story that introduces a tier
  depends on this one.

---

## 10. Story Size

**S**

Three filters, a page, an export, and one authorization boundary that carries
all of the risk.

---

## 11. Out of Scope

- **What is recorded, and when.** §22.2 owns the closed list, and every writer
  of an entry belongs to the Feature whose act it is — `F02` to `F07` and the
  case detail of §23.2.
- **The append-only guarantee.** §22.3 owns it and the database enforces it;
  this surface simply has nothing that could test it.
- **Retention.** There is none (§22.4). A sweep would be a revision of §22, not
  a setting on this surface.
- **Recording the reading.** §22.6 decides against it.
- **Any alerting, digest or notification** built on the trail. Nothing is sent;
  the record is read.
- **Analytics.** §11 counts occurrences and may not identify a person; this
  identifies actors and may not be merged with it (§22.7).

---

## 12. Definition of Ready

Readiness is governed by `USER_STORY_HANDBOOK.md` §11 and is referenced here, not duplicated.

**This Story is Ready.** Both upstream documents were Frozen on 2026-09-07
before it, and the Owner read and approved it on the same day.

---

## 13. Definition of Done

Completion is governed by `USER_STORY_HANDBOOK.md` §18 and is referenced here, not duplicated.

**Delivery Status is recorded as Implemented, and the order was wrong here too.**
The surface was built in `I84` on 2026-09-05, two days before §22 or `F14`
existed. Every Acceptance Criterion above is met by what is deployed, including
the ones that were decisions at the time rather than requirements: AC-8's
absence of a cap was raised with the Owner as a conflict — the 180-day figure he
had named belongs to Listing Reports — and he settled it on 2026-09-05, in
favour of no cap.

One criterion is met by a **seam rather than by a boundary**, and that is worth
saying plainly: AC-1 refuses everybody who is not an Admin, and there is exactly
one Admin tier today, so "the platform administrator" and "an Admin" are the
same set. The surface resolves its authority under its own name so that the day
they stop being the same set, one name changes in one place. Until that day, AC-1
is true and is not yet *tested* against a tier that does not exist.

---

## 14. Story Validation Checklist

- [x] Represents one bounded Platform outcome
- [x] Provides observable Admin value
- [x] Independently understandable
- [x] Independently testable
- [x] Traceable to one Parent, Epic, Feature, PRD, and applicable UX
- [x] Domain code and Feature ID resolve to authoritative owners — `F14` in Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.3
- [x] Relationship classification and Capability reference match the Frozen Feature Registry
- [x] No duplicate Story identified in the current Platform package
- [x] No implementation details
- [x] **No invented upstream behaviour** — every clause traces to `PRD-0006` Frozen v2.6 §22
- [x] Every Acceptance Criterion begins with "The system shall…"
- [x] Every Acceptance Criterion has one explicitly numbered Story-internal BDD scenario

---

## 15. Notes

`F14` and §23 were decided together and differently, and the difference is the
useful part of this Story's existence. The Owner, 2026-09-06: the audit reading
surface gets a Feature because it is _"tam teşekküllü bir operasyon yüzeyi"_
with filters, paging and an export; the personal-data rule does not, because it
is _"bağımsız bir etkileşim yüzeyi değil, tüm platformu yatay olarak kesen
yapısal bir kısıtlama"_ — a constraint over every surface, whose one act lives
under `F02`'s case detail as a condition on it.

A Feature is allocated for something a person operates. A rule that applies
everywhere has no surface to allocate, and giving it one would invent a screen
to justify an identifier.
