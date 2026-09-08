# US-DSC-F14-001 — Result Arrangement

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-03, together with Frozen `PRD-0002-discovery.md` v3.0,
> Frozen `UX-0002-discovery.md` v1.3, Frozen `DISCOVERY_FEATURE_REGISTRY.md`
> v2.0 and the other five Stories of this decision. This exact Story must not be
> edited in place; a future change requires a controlled revision.
>
> **Approval Note (1.0):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-03 — _"onaylıyorum işleme alabilirsin"_.
>
> **Delivery Status is `Done` on approval, and the order is worth stating.**
> This Story was written after its behaviour shipped: the Acceptance Criteria
> below were extracted from an implementation the Owner had already accepted on
> the running platform, and every one of them is covered by the test suite. The
> Story records what was built; it did not commission it.

> **Candidate Status (0.1) — historical.** This Story was a Draft candidate
> whose identifier and behaviour owner were both unfrozen. **The condition it
> named has since been met**: the registry and the PRD were Frozen together with
> this Story on 2026-09-03, which is what the Freeze Note above records. The
> note is kept because a superseded state is evidence of what was true and when.
>
> **Creation Note (0.1):** First controlled Generated Story candidate for
> Discovery Feature `F14`. **Written after the behaviour shipped**, in I68, from
> the Owner's own instruction; the Acceptance Criteria below are the rules the
> platform already enforces, written down so they can be reviewed and argued
> with rather than only read out of a repository. This document creates no
> Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze or
> GitHub change.
>
> **Why this Story needs the PRD revision first.** Frozen `PRD-0002` §12.5
> excludes a user-controlled Sort from V1. What this Story describes is
> deliberately narrower than the thing that section refuses — four arrangements
> the platform defines, from facts it already records, applied identically to
> every listing — and the four exclusions beside it stand untouched. Approving
> the Story without the PRD would be a Story contradicting its own behaviour
> owner.

## 1. Metadata

| Field                 | Value                                                            |
| --------------------- | ---------------------------------------------------------------- |
| Story ID              | `US-DSC-F14-001`                                                 |
| Story Title           | Result Arrangement                                               |
| Parent Story Document | `US-0002 Discovery` (`US-0002-discovery.md`)                     |
| Story Domain          | Discovery                                                        |
| Domain Code           | `DSC` — owned by `REPOSITORY_GOVERNANCE.md`                      |
| Epic                  | Results and Refinement                                           |
| Feature               | `F14` — Result Arrangement                                       |
| Feature ID            | `F14` — allocated by Frozen `DISCOVERY_FEATURE_REGISTRY.md` v2.0 |
| Capability            | Discovery — Direct Frozen assignment by reference                |
| Perspective           | Person deciding which end of a list to read                      |
| Behaviour Owner       | Frozen `PRD-0002-discovery.md` v3.0                              |
| Experience Owner      | Frozen `UX-0002-discovery.md` v1.3                               |
| Owner                 | Product Owner / Architecture Owner                               |
| Status                | Frozen                                                           |
| Delivery Status       | Done                                                             |
| Priority              | Must                                                             |
| Story Size            | M                                                                |
| Version               | 1.0                                                              |
| Last Updated          | 2026-09-03                                                       |
| Freeze State          | Frozen                                                           |
| Supersedes            | None — first Story version                                       |

---

## 2. Story Identification

| Segment        | Value | Owner by Reference                                      |
| -------------- | ----- | ------------------------------------------------------- |
| Prefix         | `US`  | `USER_STORY_HANDBOOK.md`                                |
| `[DOMAIN]`     | `DSC` | `REPOSITORY_GOVERNANCE.md` — Story Domain Code Registry |
| `[FEATURE_ID]` | `F14` | Frozen `DISCOVERY_FEATURE_REGISTRY.md` v2.0             |
| `[ID]`         | `001` | `USER_STORY_HANDBOOK.md`                                |

---

## 3. Purpose

Let a person choose among four platform-defined arrangements of a Result list,
without admitting an ordering anyone can buy, request or compose.

---

## 4. Business Value

> **As a** person reading a list of products
> **I want** to switch between the cheapest, the newest, and what other people are looking at
> **So that** the list answers the question I have now

---

## 5. Description

Four arrangements, and the set is closed: **Tümü** (the platform's own — stated
unavailable last, then the lowest amount a person would pay), **En yeni** (later
Initial Published At first), **Popüler** (more Presentation Opens over thirty
days) and **Yükselenler** (the higher average of Opens, Affiliate Handoffs and
reviews over the same window).

**An arrangement leads; it does not replace.** Where its leading fact cannot
separate two products, the Default arrangement decides — so a list is never
arbitrary, and a newly listed product appears where its price puts it rather
than at the bottom of a list of zeroes.

Everything counted is counted over the **product group** and comes from
occurrences the platform recorded. Nothing a Business supplies, states or pays
for may enter an arrangement, and the counts are not published: an arrangement
changes the order of a list and states no figure on a Listing Card.

Inside Search the arrangement orders **within** a match level; §12.2 still
decides which level a result is in.

---

## 6. References

| Concern               | Document                              | Referenced For                                                |
| --------------------- | ------------------------------------- | ------------------------------------------------------------- |
| Parent Story Document | `US-0002-discovery.md`                | Epic and Feature placement                                    |
| Domain Code Owner     | `REPOSITORY_GOVERNANCE.md`            | `DSC` code                                                    |
| Feature Registry      | `DISCOVERY_FEATURE_REGISTRY.md` v2.0  | `F14` identity — **candidate**                                |
| PRD                   | `PRD-0002-discovery.md` v3.0 §12.6    | The behaviour — **candidate**                                 |
| UX                    | `UX-0002-discovery.md` §§7.3, 8.3     | The control and what is readable while it applies             |
| Supporting PRD        | `PRD-0001-offering.md` §§5.10.5, 5.12 | Total cost and the product grouping the counts are taken over |
| Story Standards       | `USER_STORY_HANDBOOK.md`              | Story standards, DoR, DoD, validation                         |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall offer exactly the four arrangements the PRD names and no other.
- **AC-2** — The system shall refuse a requested arrangement that is not one of the four, rather than approximating it.
- **AC-3** — The system shall apply the Default arrangement where a request names none.
- **AC-4** — The system shall resolve, by the Default arrangement, every pair of products the chosen arrangement's leading fact cannot separate.
- **AC-5** — The system shall count Presentation Opens, Affiliate Handoffs and reviews over the product group rather than over a single Offering.
- **AC-6** — The system shall count only occurrences the platform recorded, and shall admit nothing a Business supplies, states or pays for into an arrangement.
- **AC-7** — The system shall apply a chosen arrangement within a Search match level and shall not reorder the match levels themselves.
- **AC-8** — The system shall publish no impression, open, handoff or review count on a Listing Card as a result of any arrangement.
- **AC-9** — The system shall keep the chosen arrangement readable while it applies.
- **AC-10** — The system shall preserve the other current criteria when the arrangement changes.
- **AC-11** — The system shall apply the same arrangement behaviour regardless of login or role context.

---

## 8. BDD

### Scenario: The set is closed

```gherkin
Given a request names an arrangement outside the four
When Results are requested
Then the request is refused
And no Results are produced under an invented arrangement
```

### Scenario: An arrangement leads and does not replace

```gherkin
Given two products neither of which has been opened in the last thirty days
When the Popular arrangement applies
Then the Default arrangement decides between them
```

### Scenario: Attention belongs to the product

```gherkin
Given one product is listed by two partners
And each listing has been opened three times in the last thirty days
When the Popular arrangement applies
Then the product is arranged on six opens rather than on three
```

### Scenario: An arrangement cannot be bought

```gherkin
Given any arrangement applies
When Results are ordered
Then no Offering is advanced, delayed or marked by a payment, a Business request or a sponsorship
```

### Scenario: Relevance still decides the tier

```gherkin
Given a Search query matches one Offering by title and another by description
When any arrangement applies
Then the title match precedes the description match
And the arrangement orders within each match level
```

---

## 9. Dependencies

### Depends On

- `PRD-0002-discovery.md` v3.0 §12.6 — the behaviour.
- `DISCOVERY_FEATURE_REGISTRY.md` v2.0 — `F14` allocation.
- `US-DSC-F07-001` — the Default arrangement this one departs from and falls back to.

### Blocks

- `US-DSC-F06-001` — arranged candidates are represented as Results.

---

## 10. Story Size

**M**

Four arrangements over two existing event streams, with a fallback rule, a
match-level boundary and a publication prohibition.

---

## 11. Out of Scope

- Any ordering that can be sold, requested by a Business or granted to one.
- Impression, click, revenue or fill-rate reporting — excluded by `PRD-0006-platform.md` §20.5.
- Personalised or learned ordering of any kind.
- Tab layout and labels — `UX-0002-discovery.md`.

---

## 12. Definition of Ready

Readiness is governed by `USER_STORY_HANDBOOK.md` §11 and is referenced here,
not duplicated.

**This Story is Ready.** Its Feature ID is allocated by Frozen
`DISCOVERY_FEATURE_REGISTRY.md` v2.0 and its behaviour owner is Frozen
`PRD-0002-discovery.md` v3.0, both Frozen on 2026-09-03.

---

## 13. Definition of Done

Completion is governed by `USER_STORY_HANDBOOK.md` §18 and is referenced here,
not duplicated.

---

## 14. Story Validation Checklist

- [x] Represents one bounded Discovery outcome
- [x] Provides observable person or platform value
- [x] Independently understandable
- [x] Independently testable
- [x] Acceptance Criteria begin with "The system shall…"
- [x] Acceptance Criteria have corresponding BDD coverage
- [x] No implementation details
- [x] Traceable to an authoritative Feature ID — `DISCOVERY_FEATURE_REGISTRY.md`
      v2.0 Frozen 2026-09-03
- [x] Traceable to an authoritative behaviour owner — `PRD-0002-discovery.md`
      v3.0 Frozen 2026-09-03

---

## 15. Notes

`F07` continues to own the Default arrangement; this Story owns the choice among
the four and the rule that a chosen one never replaces the Default outright.
