# US-DSC-F11-001 — Price Constraint

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
> **Creation Note (0.1):** First controlled Generated Story candidate for Discovery Feature `F11`. Requested by the Owner on 2026-09-02, with `PRD-0002` v2.5 and `UX-0002` v1.2. This document creates no Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze or GitHub change.
>
> **Why this is a Story of its own rather than criteria added to `US-DSC-F05-001`.** That Story is _Attribute Filtering_, and every one of its criteria begins from an Attribute definition and its `filterable` property. PRD-0002 v2.5 §5.5A defines the Price Constraint as the criterion that is **not** an Attribute — it does not depend on a Category, it is not governed by `PRD-0006-platform.md`, and it compares an amount PRD-0001 §5.10 owns. Folding it into F05 would make that Story assert a model its own §5.5 reference denies.

## 1. Metadata

| Field                 | Value                                                              |
| --------------------- | ------------------------------------------------------------------ |
| Story ID              | `US-DSC-F11-001`                                                   |
| Story Title           | Price Constraint                                                   |
| Parent Story Document | `US-0002 Discovery` (`US-0002-discovery.md`)                       |
| Story Domain          | Discovery                                                          |
| Domain Code           | `DSC` — owned by `REPOSITORY_GOVERNANCE.md`                        |
| Epic                  | Results and Refinement                                             |
| Feature               | `F11` — Price Constraint                                           |
| Feature ID            | `F11` — allocated by Frozen `DISCOVERY_FEATURE_REGISTRY.md` v2.0   |
| Capability            | Discovery — Direct Frozen assignment by reference                  |
| Perspective           | Person narrowing Discovery Results to what they are willing to pay |
| Behaviour Owner       | Frozen `PRD-0002-discovery.md` v3.0                                |
| Experience Owner      | Frozen `UX-0002-discovery.md` v1.3                                 |
| Owner                 | Product Owner / Architecture Owner                                 |
| Status                | Frozen                                                             |
| Delivery Status       | Done                                                               |
| Priority              | Must                                                               |
| Story Size            | M                                                                  |
| Version               | 1.0                                                                |
| Last Updated          | 2026-09-03                                                         |
| Supersedes            | None — first Story version                                         |

---

## 2. Story Identification

| Segment        | Value | Owner by Reference                                      |
| -------------- | ----- | ------------------------------------------------------- |
| Prefix         | `US`  | `USER_STORY_HANDBOOK.md`                                |
| `[DOMAIN]`     | `DSC` | `REPOSITORY_GOVERNANCE.md` — Story Domain Code Registry |
| `[FEATURE_ID]` | `F11` | Frozen `DISCOVERY_FEATURE_REGISTRY.md` v2.0             |
| `[ID]`         | `001` | `USER_STORY_HANDBOOK.md`                                |

---

## 3. Purpose

Narrow Discovery Results to the Offerings whose cost falls within a person's stated bounds, without changing the order those Results appear in and without inventing an amount for an Offering that has none.

---

## 4. Business Value

> **As a** person comparing Offerings that now show prices
> **I want** to state what I am willing to pay and see only what fits
> **So that** I do not have to read past every Offering I could never buy — and so that nothing is quietly re-ordered, converted, or assumed to be free while I do it

---

## 5. Description

A Price Constraint is an inclusive upper bound, an inclusive lower bound, or both, expressed as a currency amount. It is available wherever Discovery Results are — with or without a Search query, with or without an active leaf Category — because the amount belongs to the Offering rather than to a Category.

An Offering satisfies the constraint when the amount a person would pay, as `PRD-0001-offering.md` §5.10.5 defines it, falls within the bounds. An unstated delivery cost is not counted as zero and not guessed; the comparison uses the amount alone, which is the least the Offering could cost.

An Offering with no Fixed amount does not satisfy an applied constraint, and Discovery says that such Offerings are being set aside rather than letting them vanish.

The constraint narrows. It does not order, and no surface presents it as though it did.

---

## 6. References

| Concern               | Document                                              | Referenced For                                                                           |
| --------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Parent Story Document | `US-0002-discovery.md`                                | Epic and Feature placement                                                               |
| Feature Registry      | Frozen `DISCOVERY_FEATURE_REGISTRY.md` v2.0           | `F11` identity                                                                           |
| PRD                   | `PRD-0002-discovery.md` v2.5 (candidate) §§5.5A, 10.6 | Criterion behaviour                                                                      |
| UX                    | `UX-0002-discovery.md` v1.2 (candidate) §9A           | The control and its state                                                                |
| Supporting PRD        | `PRD-0001-offering.md` v4.0 §5.10                     | Pricing Kind, amount, currency, delivery cost, and §5.10.5's "amount a person would pay" |
| Ordering              | `US-DSC-F07-001`                                      | The ordering this Story does not touch                                                   |
| Attribute Filtering   | `US-DSC-F05-001`                                      | The criterion this Story is not                                                          |
| Zero Results          | `US-DSC-F08-001`                                      | Recovery when the constraint admits nothing                                              |
| Story Standards       | `USER_STORY_HANDBOOK.md`                              | Story standards, DoR, DoD, validation                                                    |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall offer a Price Constraint wherever Discovery Results are offered, with or without a Search query and with or without an active leaf Category.
- **AC-2** — The system shall accept an inclusive upper bound, an inclusive lower bound, or both.
- **AC-3** — The system shall include an Offering in constrained Results only where the amount a person would pay, including a stated delivery cost, falls within the applied bounds.
- **AC-4** — The system shall use the amount alone where no delivery cost is stated, and shall not treat an unstated delivery cost as zero.
- **AC-5** — The system shall exclude from constrained Results every Offering whose Pricing Kind is not Fixed.
- **AC-6** — The system shall state that Offerings without a Fixed amount are excluded while a Price Constraint applies.
- **AC-7** — The system shall exclude an Offering whose currency differs from the applied constraint's, and shall convert no amount between currencies.
- **AC-8** — The system shall return no Results where an applied lower bound exceeds an applied upper bound, and shall not reverse the bounds.
- **AC-9** — The system shall combine the Price Constraint with Search, active leaf Category, and Attribute Filters using AND.
- **AC-10** — The system shall preserve the applicable Search or Browse ordering when a Price Constraint is applied, removed, or changed.
- **AC-11** — The system shall allow an applied Price Constraint to be widened, narrowed, or removed without changing the other current criteria.
- **AC-12** — The system shall present the applied bounds while they apply.
- **AC-13** — The system shall produce Zero Results, with the constraint among the criteria recovery may relax, where a valid constraint admits no Offering.
- **AC-14** — The system shall apply the same Price Constraint behaviour regardless of login or role context.

---

## 8. BDD

### Scenario: An amount inside the bound is a Result

```gherkin
Given an eligible Offering has a Fixed amount of 42.990 and no stated delivery cost
And a Price Constraint has an upper bound of 45.000
When Discovery Results are composed
Then that Offering is a Result
```

### Scenario: Delivery is part of what a person would pay

```gherkin
Given an eligible Offering has a Fixed amount of 44.900 and a stated delivery cost of 150
And a Price Constraint has an upper bound of 45.000
When Discovery Results are composed
Then that Offering is not a Result
```

### Scenario: An unstated delivery cost is not counted as free

```gherkin
Given an eligible Offering has a Fixed amount of 44.900 and no stated delivery cost
And a Price Constraint has an upper bound of 45.000
When Discovery Results are composed
Then that Offering is a Result
And no delivery cost has been assumed
```

### Scenario: Quoted work is set aside, and said to be set aside

```gherkin
Given an eligible Offering is quoted on request
And a Price Constraint applies
When Discovery Results are composed
Then that Offering is not a Result
And the experience states that Offerings without a Fixed amount are excluded
```

### Scenario: The order does not change

```gherkin
Given Search Results are in Best Match order
When a Price Constraint is applied
Then the remaining Results keep Best Match order
And no ordering control is offered
```

### Scenario: Reversed bounds are refused rather than corrected

```gherkin
Given a Price Constraint has a lower bound above its upper bound
When Discovery Results are composed
Then no Offering satisfies the constraint
And the bounds are not swapped
```

### Scenario: Removing the constraint leaves the other criteria alone

```gherkin
Given a Search query, an active leaf Category, an Attribute Filter and a Price Constraint apply
When the Price Constraint is removed
Then the query, the Category and the Attribute Filter still apply
```

### Scenario: Role context does not change the constraint

```gherkin
Given the same eligible Offering set and the same Price Constraint
And the person is a Guest, Enabled User, Business, Admin, or Suspended-account Guest baseline
When Discovery Results are composed
Then the same Results are produced
```

---

## 9. Dependencies

### Depends On

- `PRD-0002-discovery.md` v2.5 and `DISCOVERY_FEATURE_REGISTRY.md` v1.1 — Frozen before this Story may be Approved.
- `PRD-0001-offering.md` v4.0 §5.10 — the amount, its currency, its delivery cost and its Pricing Kind.
- `US-DSC-F02-001` or `US-DSC-F03-001` — a Discovery result context exists.

### Blocks

- Nothing. This Story narrows an existing result set; no Story waits on it.

---

## 10. Story Size

**M**

One criterion with a bounded comparison rule, one exclusion rule, one statement obligation, and an explicit non-interaction with ordering.

---

## 11. Out of Scope

- Ordering by price, and any user-controlled Sort — `US-DSC-F07-001`, `PRD-0002` §12.5, §21.5.
- The meaning of an amount, its currency, its delivery cost or its Pricing Kind — `PRD-0001-offering.md` §5.10.
- Currency conversion, in any direction, for any reason.
- Instalments, taxes, discounts as a percentage, and every other derived figure.
- The control's visual design, its ranges and its copy — `UX-0002-discovery.md` §9A.
- Saving a constraint, remembering it across visits, or making it part of an address — `PRD-0002` §21.5.

---

## 12. Definition of Ready

Governed by `USER_STORY_HANDBOOK.md` §11 and referenced here, not duplicated.

This Story is not Ready while its Behaviour Owner and Feature Registry references are candidates.

---

## 13. Definition of Done

Governed by `USER_STORY_HANDBOOK.md` §18 and referenced here, not duplicated.

---

## 14. Story Validation Checklist

- [x] Represents one bounded Discovery outcome
- [x] Provides observable person or platform value
- [x] Independently understandable
- [x] Independently testable
- [x] Traceable to one Parent Story Document, Epic, Feature, PRD, and applicable UX
- [ ] Domain code and Feature ID resolve to authoritative owners — `F11` resolves to a **candidate** registry
- [x] No duplicate Story identified in the current Discovery package
- [x] No implementation details
- [x] No invented upstream behaviour
- [x] Acceptance Criteria begin with “The system shall…”
- [x] Acceptance Criteria have corresponding BDD coverage

---

## 15. Notes

PRD-0002 v2.5 owns the criterion; UX-0002 v1.2 owns the control; PRD-0001 §5.10 owns the amount. This Story owns none of the three and states the outcome they produce together.

The single most likely way to get this wrong in implementation is to treat an unstated delivery cost as `0` — the database column separates _not stated_ from _free_ precisely so that this comparison can keep them apart, and AC-4 is that column's product meaning.
