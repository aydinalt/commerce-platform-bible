# I2 Catalog, Business and Offering Write Model — Closure Record

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft — awaiting Owner acceptance
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-10
- **Scope:** Implementation record only. No Frozen Story is edited and no Delivery Status changes.

## What this increment delivered

The write model behind a marketplace listing. Before I2, a Category, an
Attribute definition and a Business could each exist only by direct SQL; an
Offering existed but reached no Story. After I2 a person can walk the whole path
without leaving the product: register, create a Business, describe it, have an
Admin define the catalog it sells into, write an Offering, give it Attribute
values, attach an Affiliate Destination, and retire it.

Eight Stories across eight commits and seven migrations, ending on 237 tests.

## Per-Story coverage

| Story | State | Notes |
|---|---|---|
| `US-PLT-F08-001` Category and Domain Management | Covered | All 16 AC. Hierarchy, Domain inheritance and cross-Domain refusal are database constraints; ancestry cycles are a trigger |
| `US-PLT-F09-001` Attribute Definition Management | Covered | All 16 AC. Every mutation-safety refusal is enforced inside the write transaction against active-lifecycle Offerings |
| `US-BUS-F01-001` Business Creation and Ownership | Covered | All 10 AC. Exactly one owner is a database constraint, not a convention |
| `US-BUS-F02-001` Business Information and Exposure | Partial | AC-1 to AC-6, AC-8, AC-12, AC-13 covered. AC-7, AC-10, AC-11 and the Guest half of AC-9 need a public surface and PRD-0004 Direct Contact — I4 and I5 |
| `US-OFR-F01-001` Offering Creation | Covered | All 7 AC. The created Draft carries a recorded final Offering Public Eligibility rather than one a consumer would have to compute |
| `US-OFR-F02-001` Offering Editing | Partial | AC-1 to AC-8 and AC-10 covered. AC-9 is blocked — see below |
| `US-OFR-F03-001` Offering Retirement | Covered | All 9 AC. AC-8 was left open when the Story landed and closed by `US-OFR-F06-001` in the same increment |
| `US-OFR-F06-001` Affiliate Destination Configuration | Covered | All 9 AC. The authoring reset is a database trigger so it survives the Platform administration paths PRD-0006 will add |

## Why `US-OFR-F02-001` AC-9 is not implementable in this increment

AC-9 permits the bounded correction-edit path "only for the exact Open
correction target and targeted Offering-content area". That path requires an
Open Offering-content correction case, which `US-PLT-F06-001 — Request
Correction and Re-review` owns. No correction concept exists anywhere in the
datamodel.

The criterion is permissive, not prohibitive, so leaving the path unbuilt does
not violate it: with no Open correction case able to exist, there is nothing the
exception could apply to. What the system does today is refuse a Restricted
Business's Published and Hidden edits unconditionally, which is AC-8.

**AC-9 opens when `US-PLT-F06-001` lands.**

## Product decisions taken during delivery

Three places where the datamodel and a Frozen Story disagreed. Each was resolved
toward the Story, and each is recorded here because the alternative — writing
code around a datamodel that says something different — would have made an
Acceptance Criterion unwritable.

| Disagreement | Resolution |
|---|---|
| `OfferingStatus` was `DRAFT, PUBLISHED, RETIRED`; PRD-0001 §6 defines Draft, Published, Hidden, Archived | Enum aligned, `retired_at` renamed `archived_at`. Without `HIDDEN`, `US-PLT-F08-001` AC-12 could not name one of the three states that block Category retirement |
| `AttributeValueKind` was `TEXT, INTEGER, DECIMAL, BOOLEAN, DATE, OPTION`; `US-PLT-F09-001` AC-2 fixes five kinds | Enum aligned to Text, Number, Boolean, Single Select, Multi Select. `unit`, `comparable` and `required_for_publication` added |
| `category_attribute.required` placed the required flag on each applicability link; `US-PLT-F09-001` AC-7 evaluates it across every applicable Category at once | Moved to the definition. Two answers to one question is one too many |

No table involved carried data at the time of the change, so each alignment was
a rename rather than a migration of meaning.

## Deferred with reason

| Item | Reason |
|---|---|
| Offering publication and the Discovery projection | `US-OFR-F04-001` in I3. Retirement already deletes the projection row so the promise holds the moment something writes one |
| Affiliate Destination Review, Validate, Enable and Disable | PRD-0006 owns the action surface. `US-OFR-F07-001` in I3. The three authored results reset on any reference change, enforced by trigger, so a later administration path cannot leave a changed destination eligible |
| Public Offering Presentation and the public Business identity set | `US-OFR-F05-001` in I4. The composition function and its refusal to compose while exposure is Ineligible are implemented and tested; nothing consumes them yet |
| `nanoid` advisory GHSA-2v37-7h3g-55p8 | Transitive through `next` → `postcss`, unrelated to any Story. Pinned to 3.3.17 through `overrides` to keep the security gate green |

## Test-suite correction

The four Milestone 11 and 12 suites seeded their own `domain` rows, which was
the only option before `US-PLT-F08-001` seeded the three V1 Domains. Those rows
made `GET /admin/categories` fail on a second run against the same database,
because a Category under a non-V1 Domain does not satisfy the published
contract. Production has no path that creates a fourth Domain; the test seam
did. The suites now read the seeded `MOBILITY` Domain, and the whole suite is
verified against both a fresh and an already-used database.

## Story governance

All 50 Generated Stories remain `Delivery Status: Not Started`. This record
extends the implementation links in `M11_STORY_LINK_PROPOSAL.md` and
`I1_IDENTITY_BASELINE_CLOSURE.md`; advancing any Delivery Status requires a
separate change with Product Owner review and green CI evidence.

> **Superseded (2026-08-15):** true when this record closed, and no longer.
> I9 advanced 49 Stories to `Done` and `US-OFR-F05-001` to `In Progress`,
> each against per-criterion evidence in `DELIVERY_STATUS_ADVANCEMENT.md`.
> The sentence above is left as it was written, because what a record claimed
> at its close is part of what it records.
