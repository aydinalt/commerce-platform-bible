# US-DSC-F12-001 — Product Score Floor

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
> Discovery Feature `F12`. **Written after the behaviour shipped**, in I62, from
> the Owner's own instruction; the Acceptance Criteria below are the rules the
> platform already enforces, written down so they can be reviewed and argued
> with rather than only read out of a repository. This document creates no
> Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze or
> GitHub change.
>
> **Why this is a Story of its own rather than criteria added to `US-DSC-F11-001`.**
> A Price Constraint compares an amount the Offering carries; a score floor
> compares an aggregate over _other people's reviews of a product_. They behave
> alike — neither depends on a Category, neither orders anything — and they are
> about different things, which is what a Feature identity is for.

## 1. Metadata

| Field                 | Value                                                            |
| --------------------- | ---------------------------------------------------------------- |
| Story ID              | `US-DSC-F12-001`                                                 |
| Story Title           | Product Score Floor                                              |
| Parent Story Document | `US-0002 Discovery` (`US-0002-discovery.md`)                     |
| Story Domain          | Discovery                                                        |
| Domain Code           | `DSC` — owned by `REPOSITORY_GOVERNANCE.md`                      |
| Epic                  | Results and Refinement                                           |
| Feature               | `F12` — Product Score Floor                                      |
| Feature ID            | `F12` — allocated by Frozen `DISCOVERY_FEATURE_REGISTRY.md` v2.0 |
| Capability            | Discovery — Direct Frozen assignment by reference                |
| Perspective           | Person who will not consider a poorly rated product              |
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
| `[FEATURE_ID]` | `F12` | Frozen `DISCOVERY_FEATURE_REGISTRY.md` v2.0             |
| `[ID]`         | `001` | `USER_STORY_HANDBOOK.md`                                |

---

## 3. Purpose

Let a person narrow Results to products other buyers scored at or above a
level they choose, without the platform inventing a score for a product nobody
has reviewed.

---

## 4. Business Value

> **As a** person choosing between products I cannot handle before buying
> **I want** to see only what other buyers scored well
> **So that** the shortlist is made of things people have actually been happy with

---

## 5. Description

A Product Score floor is the lowest score a person will consider. It applies
with or without a Search query and with or without a Category, because a
product's score is a fact about the product.

**The score is the product's, never the seller's.** It is the aggregate over
the reviews of the Offerings sharing a Product Key (`PRD-0001-offering.md`
§5.12), so three partners listing one phone answer with one score. This is the
Owner's rule — _puanlama ürüne ait olacak, satıcıya değil_ — and it is also what
keeps `PRD-0006-platform.md`'s exclusion of seller reputation intact: nothing
here scores a Business.

A product **nobody has scored does not satisfy a floor**, by the missing-value
rule every other criterion follows. Because that removes a whole class of
product from the list — including every newly listed one — the exclusion is
stated while the floor applies.

---

## 6. References

| Concern               | Document                                  | Referenced For                                    |
| --------------------- | ----------------------------------------- | ------------------------------------------------- |
| Parent Story Document | `US-0002-discovery.md`                    | Epic and Feature placement                        |
| Domain Code Owner     | `REPOSITORY_GOVERNANCE.md`                | `DSC` code                                        |
| Feature Registry      | `DISCOVERY_FEATURE_REGISTRY.md` v2.0      | `F12` identity — **candidate**                    |
| PRD                   | `PRD-0002-discovery.md` v3.0 §§5.5B, 10.7 | The behaviour — **candidate**                     |
| UX                    | `UX-0002-discovery.md` §9A                | The control and what is readable while it applies |
| Supporting PRD        | `PRD-0001-offering.md` §5.12              | The Product Key grouping the score is taken over  |
| Supporting PRD        | `PRD-0006-platform.md`                    | Seller reputation remains excluded from V1        |
| Story Standards       | `USER_STORY_HANDBOOK.md`                  | Story standards, DoR, DoD, validation             |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall offer a Product Score floor wherever Discovery Results are offered, with or without a Search query and with or without an active leaf Category.
- **AC-2** — The system shall compare the floor against the aggregate score of the product group the Offering belongs to, and never against a score attributed to its Business.
- **AC-3** — The system shall include an Offering in floored Results only where that aggregate is greater than or equal to the applied floor.
- **AC-4** — The system shall exclude a product with no reviews from floored Results.
- **AC-5** — The system shall state that unscored products are excluded while a Product Score floor applies.
- **AC-6** — The system shall present one score for every Offering of one product group, regardless of which seller's listing is shown.
- **AC-7** — The system shall combine the floor with Search, active leaf Category, Attribute Filters and every other applied criterion using AND.
- **AC-8** — The system shall leave the applicable Result arrangement unchanged when a floor is applied, removed or changed.
- **AC-9** — The system shall present the applied floor while it applies.
- **AC-10** — The system shall produce Zero Results, with the floor among the criteria recovery may relax, where a valid floor admits no product.
- **AC-11** — The system shall apply the same floor behaviour regardless of login or role context.

---

## 8. BDD

### Scenario: The floor compares the product's score

```gherkin
Given two partners list one product with a Product Key
And that product's reviews average four
When a floor of four applies
Then both listings remain eligible under the floor
And the same score is presented for each
```

### Scenario: An unscored product is set aside, and said to be set aside

```gherkin
Given a product has no reviews
When a Product Score floor applies
Then that product is not a Result
And the surface states that unscored products are excluded
```

### Scenario: A floor is not a seller judgement

```gherkin
Given a Business lists several products with different scores
When a Product Score floor applies
Then each product is judged by its own score
And no score is attributed to the Business
```

### Scenario: The order does not change

```gherkin
Given a Product Score floor applies
When Results are arranged
Then the arrangement is the one that applied without the floor
```

---

## 9. Dependencies

### Depends On

- `PRD-0001-offering.md` §5.12 — the Product Key grouping.
- `DISCOVERY_FEATURE_REGISTRY.md` v2.0 — `F12` allocation.
- `PRD-0002-discovery.md` v3.0 §§5.5B, 10.7 — the behaviour.

### Blocks

- `US-DSC-F06-001` — floored candidates are represented as Results.
- `US-DSC-F08-001` — a floor may produce Zero Results.

---

## 10. Story Size

**M**

One criterion over an existing aggregate, with a missing-value rule and a stated
exclusion, and no ordering behaviour of its own.

---

## 11. Out of Scope

- Writing, moderating or displaying reviews themselves.
- Seller reputation, which `PRD-0006-platform.md` continues to exclude.
- Sorting by score — the arrangement is `F14`.
- Control layout — `UX-0002-discovery.md`.

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

The floor consumes the product grouping by reference and defines none of it. A
half-star floor is a control decision UX owns; this Story requires only that the
comparison be inclusive.
