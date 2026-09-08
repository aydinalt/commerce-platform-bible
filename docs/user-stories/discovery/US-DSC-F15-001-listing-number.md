# US-DSC-F15-001 — Listing Number

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
> Discovery Feature `F15`. **Written after the behaviour shipped**, in I67, from
> the Owner's own instruction; the Acceptance Criteria below are the rules the
> platform already enforces, written down so they can be reviewed and argued
> with rather than only read out of a repository. This document creates no
> Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze or
> GitHub change.
>
> **Why this is Discovery's Story and not Offering's.** `PRD-0001-offering.md`
> owns the Offering and its identity; what this Story adds is a Discovery
> behaviour — typing the number finds the listing — and the surface obligation
> that the number is where a person can read it.

## 1. Metadata

| Field                 | Value                                                            |
| --------------------- | ---------------------------------------------------------------- |
| Story ID              | `US-DSC-F15-001`                                                 |
| Story Title           | Listing Number                                                   |
| Parent Story Document | `US-0002 Discovery` (`US-0002-discovery.md`)                     |
| Story Domain          | Discovery                                                        |
| Domain Code           | `DSC` — owned by `REPOSITORY_GOVERNANCE.md`                      |
| Epic                  | Results and Refinement                                           |
| Feature               | `F15` — Listing Number                                           |
| Feature ID            | `F15` — allocated by Frozen `DISCOVERY_FEATURE_REGISTRY.md` v2.0 |
| Capability            | Discovery — Direct Frozen assignment by reference                |
| Perspective           | Person who wrote a listing number down                           |
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
| `[FEATURE_ID]` | `F15` | Frozen `DISCOVERY_FEATURE_REGISTRY.md` v2.0             |
| `[ID]`         | `001` | `USER_STORY_HANDBOOK.md`                                |

---

## 3. Purpose

Give every listing a short, stable, public number a person can read, quote and
type back, and answer that number with the listing it names.

---

## 4. Business Value

> **As a** person who found something and came back later
> **I want** to type the number I wrote down
> **So that** I reach the same listing without searching for it again

---

## 5. Description

Every way to name a listing before this was addressed to a machine: a UUID
nobody reads aloud, and a slug that changes when a title is corrected.

The listing number is assigned once, never reassigned, and printed with the
`İLN-` prefix on the card and on the page the card opens. The prefix is how the
number is read out; the number itself is digits.

**Typing it is a lookup, not a match.** A query that names one listing number
and nothing else returns that listing, or nothing. A query that describes
something — `16 gb ram laptop`, `mavi 482007` — is a Search, because the words
beside the digits mean the person is describing rather than naming.

---

## 6. References

| Concern               | Document                             | Referenced For                                    |
| --------------------- | ------------------------------------ | ------------------------------------------------- |
| Parent Story Document | `US-0002-discovery.md`               | Epic and Feature placement                        |
| Domain Code Owner     | `REPOSITORY_GOVERNANCE.md`           | `DSC` code                                        |
| Feature Registry      | `DISCOVERY_FEATURE_REGISTRY.md` v2.0 | `F15` identity — **candidate**                    |
| PRD                   | `PRD-0002-discovery.md` v3.0 §8.2    | The behaviour — **candidate**                     |
| UX                    | `UX-0002-discovery.md` §10           | The control and what is readable while it applies |
| Supporting PRD        | `PRD-0001-offering.md` §5            | Offering identity, which the number joins         |
| Story Standards       | `USER_STORY_HANDBOOK.md`             | Story standards, DoR, DoD, validation             |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall assign every Offering exactly one listing number, unique across the platform.
- **AC-2** — The system shall never reassign a listing number, and shall not change one when the Offering's title, slug, price or Category changes.
- **AC-3** — The system shall present the listing number on the Listing Card and on the complete Offering Presentation.
- **AC-4** — The system shall return only the named listing where a query names one listing number and nothing else.
- **AC-5** — The system shall accept the number written with or without the printed prefix, in either Turkish or ASCII spelling.
- **AC-6** — The system shall treat a query carrying a descriptive term beside the digits as a Search rather than as a listing lookup.
- **AC-7** — The system shall produce Zero Results, and not an error, where the named number belongs to no publicly eligible listing.
- **AC-8** — The system shall apply every other current criterion to a listing lookup as it does to a Search.
- **AC-9** — The system shall present no listing number for an Offering that is not publicly eligible.

---

## 8. BDD

### Scenario: The number survives an edit

```gherkin
Given a listing has a listing number
When its title is corrected and it is republished
Then the listing number is unchanged
```

### Scenario: Typing the number finds the listing

```gherkin
Given a listing carries the number 482007
When a person searches for "İLN-482007", "ILN-482007", "iln 482007" or "482007"
Then that listing is the only Result
```

### Scenario: A description is not a lookup

```gherkin
Given a person searches for "mavi 482007"
When Results are produced
Then the query is answered as a Search
```

### Scenario: An unknown number is an empty answer

```gherkin
Given no listing carries the named number
When Results are produced
Then Zero Results is stated
And the query remains visible beside the recovery
```

---

## 9. Dependencies

### Depends On

- `PRD-0001-offering.md` §5 — Offering identity.
- `DISCOVERY_FEATURE_REGISTRY.md` v2.0 — `F15` allocation.
- `PRD-0002-discovery.md` v3.0 §8.2 — the behaviour.

### Blocks

- `US-DSC-F06-001` — the Listing Card carries the number.
- `US-OFR-F05-001` — the Presentation carries the same number.

---

## 10. Story Size

**S**

One identifier, one lookup rule and one surface obligation.

---

## 11. Out of Scope

- Any meaning read into the number beyond identity — it encodes no Category, no seller and no date.
- Vanity or purchasable numbers of any kind.
- Prefix wording and placement — `UX-0002-discovery.md`.

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

A running number discloses roughly how many listings exist. That is what every
classified site discloses by the same means, and the alternative — a code long
enough not to collide — is a code nobody can read over the telephone, which is
the property the number exists to have.
