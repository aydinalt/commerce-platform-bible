# I3 Publication and Discovery Projection — Closure Record

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft — awaiting Owner acceptance
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-11
- **Scope:** Implementation record only. No Frozen Story is edited and no Delivery Status changes.

## What this increment delivered

The moment an Offering becomes findable, and everything that follows from it.
I2 ended with a write model nobody could see: an Offering could be authored,
valued and made eligible, but no path existed from that state to a stranger
looking at it. I3 builds that path in one direction — from publication into a
projection, and from a person's criteria back out of it.

A person who has never signed in can now walk the active Category hierarchy,
search, narrow to a leaf, filter on Attributes, receive results in a defined
order, and — when nothing matches — be told so without losing what they asked.

Eight Stories across eight commits and three migrations, ending on 337 tests.

## Per-Story coverage

| Story | State | Notes |
|---|---|---|
| `US-OFR-F07-001` Affiliate Destination Eligibility Governance | Covered | All 12 AC. Handoff Eligibility is a database biconditional over the authored pair rather than a field an administration path could set independently |
| `US-OFR-F04-001` Offering Publication | Covered | All 8 AC. Publication and the projection row are one transaction, so a Published Offering that nothing can find is not a reachable state |
| `US-DSC-F03-001` Browse | Covered | All 8 AC. A non-leaf Category withholds Results rather than aggregating descendants, and one path yields exactly one Discovery Start |
| `US-DSC-F02-001` Search | Covered | All 8 AC. The four ranked relationships are projected as separate columns because a single blob can decide whether something matched but not what matched |
| `US-DSC-F04-001` Search Category Narrowing | Covered | All 7 AC. A retired, branch or unknown Category answer identically — absent rather than refused |
| `US-DSC-F05-001` Attribute Filtering | Covered | All 12 AC. PRD-0002 §10.3 combination semantics: OR within one Select, AND across Attributes. A Filter that is not offered in the current context is refused, never silently dropped |
| `US-DSC-F07-001` Default Result Ordering | Covered | All 7 AC. AC-7 is satisfied by absence: no sort parameter, no placement column and no role reaches the ordering |
| `US-DSC-F08-001` Zero Results Recovery | Covered | All 8 AC. The recovery set is a closed enum, which is what makes AC-8's "invent nothing" checkable rather than aspirational |

## Product decisions taken during delivery

| Decision | Reasoning |
|---|---|
| The Discovery projection is written inside the publication transaction, not by the outbox worker | AC-4 makes a Published Offering discoverable. An eventually-consistent projection would make "Published but not yet findable" a real state the Story does not describe |
| `searchable_text` was kept and four typed columns added beside it | PRD-0002 §12.2 ranks five relationships and `US-DSC-F02-001` AC-7 requires the highest applicable one to be named. The blob still backs the existing full-text index; the columns answer the level question |
| Discovery Start is a bounded occurrence keyed by a server-issued path identifier, not a session | PRD-0002 §5.10. It records that someone began looking, once, and nothing about who. Its only consumer — PRD-0006 Basic Analytics — does not exist yet, but the occurrence cannot be reconstructed later from anything else stored |
| A Search Start may carry no Domain; a Browse Start always carries one | AC-2 inherits the Domain from the selected Category, and a Browse always begins at one. A Search has no Category until narrowing, and §5.10 forbids the absence from blocking the count. Enforced as a conditional NOT NULL rather than left to the writer |
| Handoff Eligibility is derived by a CHECK over the authored validation and enablement pair | PRD-0006 will add an administration surface this increment does not build. A biconditional means that surface cannot leave a changed destination eligible under an earlier validation, whatever it does |
| Zero Results carries structured criteria, not rendered copy | Filter summaries name the Attribute and its chosen option labels. The sentence a person reads belongs to UX-0002, and putting it here would fix in the API something the experience owner is entitled to change |

## Deferred with reason

| Item | Reason |
|---|---|
| Homepage Discovery entry | `US-DSC-F01-001` in I4. Zero Results already offers `RETURN_TO_HOMEPAGE`; the entry it names is the one I4 builds |
| Listing Card rendering | `US-DSC-F06-001` in I4. Browse and Search return the Listing Card data set; nothing renders it. The web application is still the single static route it was after I0 |
| Offering Presentation handoff and Compare return | `US-DSC-F09-001` and `US-DSC-F10-001` in I4 and I5. A result carries the identifiers a handoff would need and no navigation consumes them |
| Result paging | No Frozen Discovery Story specifies a page size, a cursor or a "load more" affordance, and `US-DSC-F07-001` AC-3 and AC-5 require a stable deterministic order that a guessed pagination scheme could contradict. Deliberately absent rather than invented |
| Basic Analytics over Discovery Starts | PRD-0006. The occurrences are recorded and indexed by kind and time; nothing reads them |

## Known boundaries

- Every I3 surface is a JSON contract. The increment adds no page, and the
  public experience UX-0002 describes begins in I4.
- The Filter combination semantics are implemented in one SQL fragment against
  the projection's `filter_values` JSONB. Each clause is guarded by a key-presence
  test, so an Offering that never stated an Attribute is excluded by a Filter on
  it rather than accidentally admitted.
- Search ordering is computed in an inner query and applied in an outer one,
  because PostgreSQL treats an output alias inside an `ORDER BY` expression as an
  input column. The shape is deliberate and load-bearing, not incidental.
- The `discovery_start` conditional NOT NULL, the Affiliate eligibility
  biconditional and the projection's field-level indexes are database objects
  outside what Prisma models, so the schema-drift gate does not see them. The
  integration suites are what prove they are there.

## Story governance

All 50 Generated Stories remain `Delivery Status: Not Started`. This record
extends the implementation links in `I1_IDENTITY_BASELINE_CLOSURE.md` and
`I2_CATALOG_AND_WRITE_MODEL_CLOSURE.md`; advancing any Delivery Status requires
a separate change with Product Owner review and green CI evidence.

> **Superseded (2026-08-15):** true when this record closed, and no longer.
> I9 advanced 49 Stories to `Done` and `US-OFR-F05-001` to `In Progress`;
> the Owner's AC-3 decision of 2026-08-17 advanced that one too, so all 50
> are now `Done` — `AC3_ATTRIBUTE_GROUPING_DECISION.md`. Each Story moved
> against per-criterion evidence in `DELIVERY_STATUS_ADVANCEMENT.md`.
> The sentence above is left as it was written, because what a record claimed
> at its close is part of what it records.
