# I6 Business Management — Closure Record

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft — awaiting Owner acceptance
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-11
- **Scope:** Implementation record only. No Frozen Story is edited and no Delivery Status changes.

## What this increment delivered

The other side of the platform. I3 through I5 built what a person sees and does;
I6 builds what the Business owner sees and does — a place to stand, an inventory
organized by lifecycle, entries offered only where they would be honoured, and
one narrow way to answer a correction while Restricted.

The increment's centre is restriction. `US-BUS-F03-001` made moderation status
and public exposure input one mapping the database keeps rather than two fields
someone has to keep in step, and the four Stories after it are all consequences
of that: which entries survive restriction, which destination writes survive it,
and the single bounded door `US-BUS-F07-001` opens through it.

Five Stories across five commits and two migrations, ending on 531 tests. The
other two Business Stories were closed in I2. Two further commits corrected the
datamodel after target CI: a relation field with no opposite end, and foreign
keys whose update action had been left at PostgreSQL's default.

## Per-Story coverage

| Story | State | Notes |
|---|---|---|
| `US-BUS-F01-001` Business Creation and Ownership | Covered in I2 | Closed in `I2_CATALOG_AND_WRITE_MODEL_CLOSURE.md`; unchanged here |
| `US-BUS-F02-001` Business Information and Exposure | Covered in I2 | Closed in I2. One test was corrected here: writing `public_exposure` directly is now refused by trigger, so the test restricts the Business instead |
| `US-BUS-F03-001` Moderation and Public Exposure Input | Covered | All 16 AC. Exposure follows moderation by trigger, and a write that contradicts it raises `EXPOSURE_CONTRADICTS_MODERATION`. Restriction was narrowed from a blanket refusal to an intent-aware decision |
| `US-BUS-F04-001` Business Dashboard and Context Selection | Covered | All 11 AC. The Dashboard is reached by naming the Business, not by reading the selected context, so a management action never depends on state the request did not mention |
| `US-BUS-F05-001` Offering Management Entry | Covered | All 16 AC. `permittedOfferingEntries` composes PRD-0001's lifecycle rules with PRD-0005's access rules — the same two authorities the write path consults |
| `US-BUS-F06-001` Affiliate Destination Management Entry | Covered | All 12 AC. A separate management read, because absence of a destination is the condition Create is offered for rather than a failure |
| `US-BUS-F07-001` Correction Notice and Owner Response | Covered | All 15 AC. The bounded correction-edit path of PRD-0005 §8.3.1, with the minimum Platform action needed to have anything to answer |

## Product decisions taken during delivery

| Decision | Reasoning |
|---|---|
| Moderation status is the source and exposure input follows it | AC-2 and AC-3 are a mapping, not two decisions. Two columns a writer keeps in step would eventually disagree, and the day they did, a Restricted Business would still be publicly exposed |
| Restriction withdraws three named intents rather than all authoring | AC-5, AC-8 and AC-9 leave the owner their Business Information, their existing Drafts, viewing, retirement and a Draft's Affiliate Destination. A single "may this Business author" question was always going to answer too many things at once |
| An offered entry is one the write path would honour | The Dashboard and the refusal read the same rule twice. Every entry in `US-BUS-F05-001` and `US-BUS-F06-001` is proven twice in the tests: absent from the offer *and* refused by the route |
| Forbidden actions are absent from the type, not filtered out | There is no `RESTORE` or `DELETE` in `OFFERING_ENTRIES`, no administration verb in `DESTINATION_ENTRIES`, no `USER_ACCOUNT` in `CorrectionTarget`. None can be offered by mistake, because none is a value the type can hold |
| The destination management entry is a separate read from the destination itself | `US-OFR-F06-001` makes an absent destination a `404` on its read, and that Story owns that answer. The management entry answers a different question — "what may I do about it" — where `null` is a fact rather than a failure |
| Category is not a correctable content area | The Owner's decision. A correction fixes what an Offering says; moving a Published Offering across the catalogue while its Business is Restricted is a different act with different consequences for Discovery |
| Request Correction gets a minimal Admin route now | The Owner's decision. The Business response path is provable end-to-end rather than through seeded rows. Closure, re-review and the seven-action General Moderation set stay unimplemented, so AC-15 holds because those actions do not exist |
| The bounded correction permission is addressed by the correction | The route names the notice, not the Offering. There is no way to spell "use this authority on a different Offering", so AC-9's exact-Offering limit is the absence of a way to ask rather than a check |
| The record of a correction edit *is* the re-review requirement | AC-14 needs no flag anybody must remember to raise. Writing the edit and recording the outstanding re-review are the same act |
| One Open case per Business at a time | A second correction against the same Business joins the Open case. Two cases would be two things to answer separately for what Platform treated as one concern |

## Where the guarantees are weaker than they look

**Restriction is enforced per intent, and the intent is supplied by the
caller.** `canAuthorOfferings` answers correctly for the intent it is given, but
a future route that asks with the wrong intent gets a wrong answer. The
database does not know what a caller is about to do, so this one is code and
tests rather than a constraint.

**The publication-minimum refusal does not say which condition failed.** The
error envelope publishes `code` and `message` only, so a `422` on a bounded
correction tells the owner the Offering would become unpublishable without
naming the missing piece. Existing behaviour, not introduced here — but visible
now that an owner can hit it while correcting.

**`boundedEditAvailable` is composed from three inputs, not five.** Ownership
and the acting user are settled before the composition is reached, by the query
that found the correction at all. That is correct, and it means reading the
function alone does not show all five conditions of §8.3.1.

## Deferred with reason

| Item | Reason |
|---|---|
| Every Business Dashboard screen in the web application | The Dashboard, the Offering and destination entries and the correction notice are complete as contracts and have no screen. UX-0005 belongs to a later increment |
| The seven-action General Moderation set | PRD-0006 and Increment I7. Only Restrict, Restore and Request Correction exist, because those three are what the Business-side Stories consume |
| Case re-review, approved action, no-action decision and closure | `US-BUS-F07-001` AC-15 places all four with PRD-0006. The `closed_by` and `closed_at` columns exist and nothing in this Increment writes them |
| Business analytics, CRM, Messaging, ownership transfer and team access | Excluded from V1 by PRD-0005 §4 |
| Permanent Offering deletion | `US-BUS-F05-001` AC-12. V1 has none at all, which is why `DELETE` is not a value the entry vocabulary can take |

## Known boundaries

- Exposure input cannot be written directly. `business_exposure_matches_moderation`
  refuses any update that contradicts the moderation status, so a Business's
  exposure is changed by moderating it and by nothing else.
- The composite foreign keys on `correction_request` make "the corrected
  Offering belongs to the case's Business" a fact the database holds. They need
  unique indexes on `moderation_case(id, business_id)` and
  `offering(id, business_id)`, which is why those exist.
- `correction_edit_requires_open_case` re-checks the Open case *and* the exact
  target on insert. The service checks both first; the trigger is what holds if
  a later path forgets.
- A migration's constraint and index names must match what Prisma would
  generate, and every foreign key must spell both referential actions —
  inlining a foreign key in `CREATE TABLE` leaves `ON UPDATE` at PostgreSQL's
  `NO ACTION` while the datamodel means `CASCADE`. Both were learned here, from
  target CI, because `db:validate` and `db:drift` cannot run locally.

## Story governance

All 50 Generated Stories remain `Delivery Status: Not Started`. This record
extends the implementation links in `I1_IDENTITY_BASELINE_CLOSURE.md`,
`I2_CATALOG_AND_WRITE_MODEL_CLOSURE.md`,
`I3_PUBLICATION_AND_DISCOVERY_CLOSURE.md`,
`I4_PUBLIC_WEB_JOURNEY_CLOSURE.md` and
`I5_COMPARE_AND_DECISION_CLOSURE.md`; advancing any Delivery Status requires a
separate change with Product Owner review and green CI evidence.

> **Superseded (2026-08-15):** true when this record closed, and no longer.
> I9 advanced 49 Stories to `Done` and `US-OFR-F05-001` to `In Progress`,
> each against per-criterion evidence in `DELIVERY_STATUS_ADVANCEMENT.md`.
> The sentence above is left as it was written, because what a record claimed
> at its close is part of what it records.
