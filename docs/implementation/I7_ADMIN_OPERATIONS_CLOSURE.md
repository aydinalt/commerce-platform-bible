# I7 Admin Operations — Closure Record

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft — awaiting Owner acceptance
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-12
- **Scope:** Implementation record only. No Frozen Story is edited and no Delivery Status changes.

## What this increment delivered

The last side of the platform. I3 through I5 built what a person does, I6 built
what a Business owner does, and I7 builds what the people running the platform
do about either of them.

The organizing idea is a separation the whole increment turns on: **a moderation
case is workflow, and workflow is not any target's product state.** A case
records that somebody should look, what was decided, and that somebody
explicitly finished — and it moves no lifecycle, no moderation status, no
access status and no eligibility at any point. The actions that do move those
things live in their own Stories, under their own gates, and the case merely
records that one was applied.

Eight Stories across eight commits and two migrations, ending on 618 tests.
This closes the fiftieth and final Frozen Generated Story.

## Per-Story coverage

| Story | State | Notes |
|---|---|---|
| `US-PLT-F01-001` Admin Panel Access and Baseline | Covered | All 11 AC. No provisioning verb is a value the Panel vocabulary can hold, and a test checks every listed function against the committed OpenAPI |
| `US-PLT-F02-001` General Moderation Case Management | Covered | All 11 AC. The case gained a target and a resolution record; closure is refused without something to close on |
| `US-PLT-F03-001` Offering Moderation Actions | Covered | All 10 AC. Restoring an Offering promises nothing about public eligibility — the composition may still answer `INELIGIBLE` |
| `US-PLT-F04-001` Business Moderation Actions | Covered | All 11 AC. Two corrections found here: transitions now require their source state, and the composed eligibility is recorded rather than only enacted |
| `US-PLT-F05-001` User Access Moderation Actions | Covered | All 11 AC. An Admin-authorized account is refused whatever state it is in, and no parameter opts into it |
| `US-PLT-F06-001` Request Correction and Re-review | Covered | All 14 AC. Closure now requires a re-review dated after the owner's most recent answer |
| `US-PLT-F07-001` Affiliate Destination Administration | Covered | All 15 AC. The workload category is derived on every read and stored nowhere |
| `US-PLT-F08-001` Category and Domain Management | Covered in I2 | Closed in `I2_CATALOG_AND_WRITE_MODEL_CLOSURE.md` |
| `US-PLT-F09-001` Attribute Definition Management | Covered in I2 | Closed in I2 |
| `US-PLT-F10-001` Basic Analytics | Covered | All 18 AC. The occurrences recorded since I3 finally have a reader, and reading them does nothing |

## Product decisions taken during delivery

| Decision | Reasoning |
|---|---|
| The Admin Panel lists only Platform behaviour that exists today | The Owner's decision. Every function named has a route behind it, checked against the committed OpenAPI by a test. A Panel that showed something it could not open would be offering an action the platform then declines |
| A case has a target type and three nullable target columns | The Owner's decision. A single `target_id` with no foreign key would have been shorter and would have let an Open case point at an Offering that no longer exists. `business_id` stays populated for an Offering target too, which is why a User Account case can carry no correction request |
| All seven General Moderation actions are named; availability is a separate question | The Owner's decision. `MODERATION_ACTIONS` is what General Moderation *is*; `IMPLEMENTED_MODERATION_ACTIONS` is what the platform can currently keep. Each case began offering an action the moment one existed, without the set or the tests changing |
| Closure requires a resolution, read from records rather than a flag | A flag can be set by something that did not do the work. `moderation_resolution` holds an applied action or a recorded no-action decision, never both and never neither |
| Request Correction is deliberately not a resolution | AC-6 keeps the case Open after it, because a correction asks the Business to do something — the case stays open precisely so somebody comes back and looks |
| Re-review must be dated after the owner's most recent answer | An owner may answer again after a review. A single earlier review standing in for every later response is the same as not requiring one |
| The re-review route takes an optional note and nothing else | The act is the point: somebody looked. Requiring a justification would make the correct thing feel expensive and push people towards closing without it |
| The workload category is derived, never stored | A stored category would eventually disagree with the destination it described. The count and the queue call the same function, so a figure an Admin acts on cannot disagree with the list they arrive at |
| Basic Analytics has one `GET` and no other verb anywhere | AC-17 forbids any moderation happening automatically, and the way to guarantee that of a dashboard is for the dashboard to have nothing that could |
| Current-state indicators are unbounded by period | "How many Businesses are Restricted" is not an occurrence, and asking it of a window would answer a different question |
| The two Decision Completions stay separate figures | AC-13 and AC-14. A combined "conversions" number would lose which end a person reached, and would be the first step towards presenting either as a sale |

## Corrections made to existing code

| What | Why it mattered |
|---|---|
| `recordApplied` matched a case on all three target columns | An Offering case names its Business too, so every Offering action was silently recorded against no case at all. The identifying column now follows from the action |
| Business moderation had no source-state requirement | Restricting an already-Restricted Business rewrote projections and recorded a second approved action for a transition that did not happen |
| Restriction enacted the composed eligibility without recording it | Deleting a projection makes an Offering unfindable; without a matching evaluation in the sequence the recorded result stayed `ELIGIBLE`, so the Business's own Dashboard reported a composition that no longer held |

## Where the guarantees are weaker than they look

**Case closure is enforced by trigger; case *opening* is not gated at all.**
Any Admin may open a case against any target. That is deliberate — surfacing
something for review is the cheap, safe act — but it means the case list is as
disciplined as the people using it.

**`recordApplied` writes to whatever Open case the target has, and silently
does nothing when there is none.** Moderation applied outside a case is a real
situation and inventing a case for it would be worse. But it means an action
taken while a case happened to be open is recorded against that case, whether
or not it was taken because of it.

**The analytics period is applied to occurrence timestamps only.** Three of the
six core-flow indicators carry a Domain and three do not, so a Domain breakdown
is structurally incomplete for the other three — and for Discovery Starts it is
incomplete even within its own indicator, because a Search with no selected
leaf Category has no Domain at all. That gap is the truth rather than a defect,
but a reader who does not know it will misread the numbers.

## Deferred with reason

| Item | Reason |
|---|---|
| Every Admin Dashboard screen | The Panel, the case list, all seven actions, the destination workload and Basic Analytics are complete as contracts and have no screen. UX-0006 belongs to a later increment |
| Admin authorization provisioning | `US-PLT-F01-001` AC-9 reserves first-Admin establishment and every grant or removal to the Product Owner, outside the Panel. It remains a direct database write |
| Suspending or reinstating an Admin-authorized account | Owner Decision D22 reserves it to the Product Owner outside the ordinary Admin surface, so there is no route and no parameter that reaches it |
| Advanced analytics, custom ranges, report building, prediction | `US-PLT-F10-001` AC-18 excludes all of it. Four periods and no date picker |

## Known boundaries

- Opening a case, reading one, recording a re-review and reading Basic
  Analytics all perform no write to any target. Three of the four perform no
  write at all.
- `moderation_case_closure_needs_resolution` enforces both closure conditions
  in one trigger, so a refused closure leaves the case exactly Open rather than
  partly closed.
- The Affiliate Destination administration family and the General Moderation
  action set have an empty intersection, asserted by a test rather than assumed.
- Two local checks now stand in for the gates that cannot run here: a
  relation-graph check over `schema.prisma`, and a foreign-key check asserting
  every key cascades on update except the one relation that overrides it. Both
  were added after target CI caught what they now catch.

## Story governance

All 50 Generated Stories remain `Delivery Status: Not Started`. Every one of
them now has an implementation recorded in a closure record; advancing any
Delivery Status remains a separate change with Product Owner review and green
CI evidence. This record extends the implementation links in
`I1_IDENTITY_BASELINE_CLOSURE.md`,
`I2_CATALOG_AND_WRITE_MODEL_CLOSURE.md`,
`I3_PUBLICATION_AND_DISCOVERY_CLOSURE.md`,
`I4_PUBLIC_WEB_JOURNEY_CLOSURE.md`,
`I5_COMPARE_AND_DECISION_CLOSURE.md` and
`I6_BUSINESS_MANAGEMENT_CLOSURE.md`.

> **Superseded (2026-08-15):** true when this record closed, and no longer.
> I9 advanced 49 Stories to `Done` and `US-OFR-F05-001` to `In Progress`,
> each against per-criterion evidence in `DELIVERY_STATUS_ADVANCEMENT.md`.
> The sentence above is left as it was written, because what a record claimed
> at its close is part of what it records.
