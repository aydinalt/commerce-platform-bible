# US-DSC-F13-001 — Stated Availability

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
> Discovery Feature `F13`. **Written after the behaviour shipped**, in I64, from
> the Owner's own instruction; the Acceptance Criteria below are the rules the
> platform already enforces, written down so they can be reviewed and argued
> with rather than only read out of a repository. This document creates no
> Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze or
> GitHub change.
>
> **Why this is a Story of its own.** Availability looks like an Attribute and is
> not one: `PRD-0001-offering.md` §5.10.3 owns it as a property of the Offering
> with three states, and the third state — _not known_ — is what makes this a
> Story with something to say.

## 1. Metadata

| Field                 | Value                                                            |
| --------------------- | ---------------------------------------------------------------- |
| Story ID              | `US-DSC-F13-001`                                                 |
| Story Title           | Stated Availability                                              |
| Parent Story Document | `US-0002 Discovery` (`US-0002-discovery.md`)                     |
| Story Domain          | Discovery                                                        |
| Domain Code           | `DSC` — owned by `REPOSITORY_GOVERNANCE.md`                      |
| Epic                  | Results and Refinement                                           |
| Feature               | `F13` — Stated Availability                                      |
| Feature ID            | `F13` — allocated by Frozen `DISCOVERY_FEATURE_REGISTRY.md` v2.0 |
| Capability            | Discovery — Direct Frozen assignment by reference                |
| Perspective           | Person who wants to buy the thing today                          |
| Behaviour Owner       | Frozen `PRD-0002-discovery.md` v3.0                              |
| Experience Owner      | Frozen `UX-0002-discovery.md` v1.3                               |
| Owner                 | Product Owner / Architecture Owner                               |
| Status                | Frozen                                                           |
| Delivery Status       | Done                                                             |
| Priority              | Must                                                             |
| Story Size            | S                                                                |
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
| `[FEATURE_ID]` | `F13` | Frozen `DISCOVERY_FEATURE_REGISTRY.md` v2.0             |
| `[ID]`         | `001` | `USER_STORY_HANDBOOK.md`                                |

---

## 3. Purpose

Let a person see only what a seller has stated is available, without treating a
seller's silence as either a promise or a fault.

---

## 4. Business Value

> **As a** person who needs the thing rather than a listing of the thing
> **I want** to see only what a seller says is in stock
> **So that** I do not spend the comparison on things I cannot buy

---

## 5. Description

`PRD-0001-offering.md` §5.10.3 gives stock three states: available,
unavailable, and not known. This criterion asks for the first.

**Unstated stock does not satisfy the request.** An unstated stock level is not
a statement of availability, so §10.4's missing-value rule applies unchanged —
and, as with every criterion that removes a class, the exclusion is stated while
the request applies.

**The arrangement treats silence differently, deliberately.** The Default Result
Arrangement places last only what a seller has stated is _unavailable_, and
leaves unstated stock where its price puts it. Absence of a claim is not a claim
of absence: a filter for a stated fact requires the statement, and an ordering
that punished silence would demote every Offering whose seller simply has not
said.

---

## 6. References

| Concern               | Document                                  | Referenced For                                    |
| --------------------- | ----------------------------------------- | ------------------------------------------------- |
| Parent Story Document | `US-0002-discovery.md`                    | Epic and Feature placement                        |
| Domain Code Owner     | `REPOSITORY_GOVERNANCE.md`                | `DSC` code                                        |
| Feature Registry      | `DISCOVERY_FEATURE_REGISTRY.md` v2.0      | `F13` identity — **candidate**                    |
| PRD                   | `PRD-0002-discovery.md` v3.0 §§5.5C, 10.8 | The behaviour — **candidate**                     |
| UX                    | `UX-0002-discovery.md` §9A                | The control and what is readable while it applies |
| Supporting PRD        | `PRD-0001-offering.md` §5.10.3            | The three stock states and their meaning          |
| Story Standards       | `USER_STORY_HANDBOOK.md`                  | Story standards, DoR, DoD, validation             |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall offer a request for stated availability wherever Discovery Results are offered, with or without a Search query and with or without an active leaf Category.
- **AC-2** — The system shall include in Results, while the request applies, only Offerings whose stock state is stated as available.
- **AC-3** — The system shall exclude an Offering whose stock state is not stated while the request applies.
- **AC-4** — The system shall state that Offerings without a stated stock level are excluded while the request applies.
- **AC-5** — The system shall not exclude an Offering with unstated stock when no availability request applies.
- **AC-6** — The system shall place an Offering with unstated stock by the applicable arrangement rather than last, when no availability request applies.
- **AC-7** — The system shall combine the request with every other applied criterion using AND.
- **AC-8** — The system shall leave the applicable Result arrangement unchanged when the request is applied or removed.
- **AC-9** — The system shall present the applied request while it applies.
- **AC-10** — The system shall apply the same behaviour regardless of login or role context.

---

## 8. BDD

### Scenario: Only what a seller has stated

```gherkin
Given one Offering is stated available and another has no stated stock
When stated availability is requested
Then only the stated-available Offering is a Result
And the surface states that Offerings without a stated stock level are excluded
```

### Scenario: Silence is not punished when nothing was asked

```gherkin
Given an Offering has no stated stock level
And no availability request applies
When Results are arranged
Then that Offering is placed by the applicable arrangement
And it is not placed last
```

### Scenario: Stated unavailability is placed last

```gherkin
Given an Offering is stated unavailable
And no availability request applies
When Results are arranged under the Default Result Arrangement
Then that Offering appears after every Offering not stated unavailable
```

---

## 9. Dependencies

### Depends On

- `PRD-0001-offering.md` §5.10.3 — the stock states.
- `DISCOVERY_FEATURE_REGISTRY.md` v2.0 — `F13` allocation.
- `PRD-0002-discovery.md` v3.0 §§5.5C, 10.8 — the behaviour.

### Blocks

- `US-DSC-F06-001` — the admitted candidates are represented as Results.
- `US-DSC-F08-001` — the request may produce Zero Results.

---

## 10. Story Size

**S**

One criterion over one existing field, whose whole difficulty is the third state
and the asymmetry with the arrangement.

---

## 11. Out of Scope

- Stock authoring, feeds or accuracy — `PRD-0001-offering.md`.
- Any inference of availability from price, recency or seller behaviour.
- Sorting by availability — the arrangement is `F14`.

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

The asymmetry in AC-5 and AC-6 is the substance of this Story and is stated so
that a later increment does not "fix" it into consistency.
