# US-PLT-F11-001 — Advertising Placement Settings

> **Freeze Note (0.1):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-04, together with `PLATFORM_FEATURE_REGISTRY.md` v1.2,
> `US-PLT-F12-001` v0.1 and `traceability.md` v2.1. This exact version must not
> be edited in place; a further change requires a controlled revision under
> `DOCUMENT_LIFECYCLE.md` §7–§8.
>
> **Approval Note (0.1):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-04 — _"Bekleyen dört aday belgeyi … resmi
> olarak onaylıyorum. Belgeleri dondurup (Freeze) F12'nin §21'e bağlanma
> sürecini tamamlayabilir ve eski sürümleri arşive kaldırabilirsin."_
>
> **Creation Note (0.1):** First controlled Generated Story for Platform
> Feature `F11`. The identifier consumes Domain code `PLT` from
> `REPOSITORY_GOVERNANCE.md` and Feature ID `F11` from
> `PLATFORM_FEATURE_REGISTRY.md`, Frozen v1.1 when this Story was drafted and
> Frozen v1.2 as it is Frozen.
>
> **Two things are recorded rather than tidied away.**
>
> **The behaviour was built before this Story existed.** `PRD-0006-platform.md`
> §20 was approved on 2026-08-31 and extended on 2026-09-03; the settings it
> names were implemented on 2026-09-03 in increment `I75`, and the Story that
> should have preceded them is this one. The order was wrong. Writing the Story
> afterwards to describe what exists would be worse — so this Story is written
> from §20 and §20.4, and where the implementation and the section disagree the
> section wins.
>
> **It depended on a Draft, and that dependency is now discharged.** Two of its
> Acceptance Criteria — AC-6 and AC-7 — are owned by `PRD-0006-platform.md`
> §20.4. Frozen v2.3 says nothing about whether the master switch covers the
> platform's own advertising region, or about a Category exclusion being
> inherited downwards. While this Story was a Draft that section existed only in
> the Draft revision v2.4, so the Story recorded that it could not be Approved
> first. **The owning revision is v2.5, Approved and Frozen on 2026-09-03 — not
> the v2.4 this Story named at Draft.** v2.4 was superseded before it was ever
> Frozen, so the references below name v2.5; citing v2.4 in a Frozen Story would
> point at a version that never became authoritative.
>
> This document creates no Feature, Capability, PRD/UX behaviour, approval,
> Freeze, or GitHub change.

## 1. Metadata

| Field | Value |
|---|---|
| Story ID | `US-PLT-F11-001` |
| Story Title | Advertising Placement Settings |
| Parent Story Document | `US-0006 Platform` (`US-0006-platform.md`) |
| Story Domain | Platform |
| Domain Code | `PLT` — owned by `REPOSITORY_GOVERNANCE.md` |
| Epic | Operational Configuration |
| Feature | `F11` — Advertising Placement Settings |
| Feature ID | `F11` — owned by Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.2 |
| Relationship Classification | No Capability Architecture required |
| Capability Reference | Not required under ADR-0007 |
| Perspective | Authorized Admin deciding whether advertising runs and where it may not |
| Behaviour Owner | `PRD-0006-platform.md` §20 — v2.3 Frozen, **AC-6 and AC-7 owned by Frozen v2.5 §20.4** |
| Experience Owner | `UX-0006-admin-dashboard.md`; `UX-0003-offering-detail.md` §8.7 |
| Owner | Product Owner / Architecture Owner |
| Status | Frozen |
| Delivery Status | Implemented |
| Priority | Must |
| Story Size | M |
| Version | 0.1 |
| Last Updated | 2026-09-04 |
| Approval Date | 2026-09-04 |
| Approved By | Product Owner / Architecture Owner |
| Freeze State | Frozen |
| Freeze Date | 2026-09-04 |
| Frozen By | Product Owner / Architecture Owner |
| Supersedes | None — first Story version |

---

## 2. Story Identification

| Segment | Value | Owner by Reference |
|---|---|---|
| Prefix | `US` | `USER_STORY_HANDBOOK.md` |
| `[DOMAIN]` | `PLT` | `REPOSITORY_GOVERNANCE.md` |
| `[FEATURE_ID]` | `F11` | Frozen `PLATFORM_FEATURE_REGISTRY.md` v1.2 |
| `[ID]` | `001` | `USER_STORY_HANDBOOK.md` |

---

## 3. Purpose

Give an authorized Admin the exact settings `PRD-0006-platform.md` §20.4 names —
a publisher identifier, one unit identifier per permitted region, a master switch
and a Category exclusion list — without introducing a generic Settings area, a
measurement, or any way for advertising to reach what §20.3 keeps it out of.

---

## 4. Business Value

> **As an** authorized Admin responsible for what appears on the platform
> **I want** one place that says whether advertising runs and where it may not
> **So that** advertising can be configured, and stopped, without a deployment
> and without anybody having to remember which regions a control covers

---

## 5. Description

§20 gives the platform two powers over advertising and only two: **where** it may
appear and **whether** it appears. This Story is the second, together with the
part of the first that is a setting rather than a placement.

Four things an Admin holds, and nothing else: the external network's publisher
identifier; one unit identifier for each of the three externally served regions
of §20.1; a master switch; and a list of Categories that must stay clean.

The Story is deliberately small, and the smallness is the point. §12 refuses a
standalone generic Platform Configuration capability, and the distinction that
makes this permissible is that every field is named in an approved section — an
Admin may change a value and may not introduce a key. A settings store with a
form in front of it would satisfy the same requirement and violate §12, because
the next field would arrive without a decision.

Nothing here measures anything. §20.5 excludes impression, click, revenue and
fill-rate reporting, including for the region the platform serves itself, and
that exclusion is a boundary rather than a missing feature: a count makes a
placement a thing to optimise, and the question after "which is pressed most" is
"which should be shown first" — which is advertising deciding an order, one
region away from the Results where §20.3 forbids it outright.

---

## 6. References

| Concern | Document | Referenced For |
|---|---|---|
| Parent Story Document | `US-0006-platform.md` | Epic and Feature placement |
| Domain Code Owner | `REPOSITORY_GOVERNANCE.md` | `PLT` code |
| Feature Registry | `PLATFORM_FEATURE_REGISTRY.md` v1.2 | `F11` identity, scope label, references, and relationship classification |
| PRD | `PRD-0006-platform.md` §20 | Permitted regions, prohibitions, the settings, and the exclusions |
| PRD | `PRD-0006-platform.md` Frozen v2.5 §20.4 | Master-switch coverage of the platform's own region; exclusion inheritance — **AC-6, AC-7** |
| Supporting PRD | `PRD-0002-discovery.md` | Results ordering, which advertising may not influence |
| Supporting PRD | `PRD-0001-offering.md` | Offering Presentation content, which advertising is not part of |
| UX | `UX-0006-admin-dashboard.md` | Where an Admin works |
| UX | `UX-0003-offering-detail.md` §8.7 | The complementary region on a listing |
| ADR | `ADR-0007-domain-scope-of-capability-first-rule.md` | Platform own-domain authority |
| ADR | `ADR-0009-story-domain-feature-registry-ownership.md` | Platform Feature-ID ownership |
| Story Standards | `USER_STORY_HANDBOOK.md` | Story form, validation, DoR, and DoD |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall make Advertising Placement Settings readable and changeable only in an authorized active Admin context.
- **AC-2** — The system shall hold exactly a publisher identifier, one unit identifier per region of §20.1, a master switch, and a Category exclusion list, and shall accept no other setting key.
- **AC-3** — The system shall treat advertising as absent until configured, and shall answer an unconfigured platform with "no advertising" rather than with an absence.
- **AC-4** — The system shall show no advertising anywhere while the publisher identifier is empty, whatever the unit identifiers hold.
- **AC-5** — The system shall show nothing in a region whose unit identifier is empty, and shall treat that as a configuration state rather than a fault.
- **AC-6** — The system shall suppress every region of §20.1 while the master switch is off, including the complementary region the platform serves itself.
- **AC-7** — The system shall keep advertising out of a Category on the exclusion list and out of every Category beneath it.
- **AC-8** — The system shall preserve the publisher identifier, the unit identifiers and the exclusion list when the master switch is turned off.
- **AC-9** — The system shall record no impression, click, revenue or fill-rate figure for any region.
- **AC-10** — The system shall change nothing about Discovery ordering, public eligibility, query matching or Listing Card content when any of these settings change.
- **AC-11** — The system shall invent no publisher identifier and no unit identifier, and shall fall back to none.

---

## 8. BDD

### Scenario: AC-1 — The settings require Admin context

```gherkin
Given a person who is not in an authorized active Admin context
When they attempt to read or change Advertising Placement Settings
Then the attempt is refused
And nothing about the current settings is disclosed
```

### Scenario: AC-2 — Only the named settings exist

```gherkin
Given an authorized active Admin context
When the Advertising Placement Settings are presented
Then exactly the publisher identifier, the per-region unit identifiers, the master switch and the Category exclusion list are offered
And no field accepts a setting name the Admin supplies
```

### Scenario: AC-3 — An unconfigured platform answers rather than omits

```gherkin
Given no advertising setting has ever been changed
When the settings are read
Then the answer is that advertising is off and nothing is configured
And the answer is not an absence a surface must interpret
```

### Scenario: AC-4 — An empty publisher identifier means none anywhere

```gherkin
Given the publisher identifier is empty
And a unit identifier is set for every region
When any public page is presented
Then no advertising appears anywhere
And the page is complete without it
```

### Scenario: AC-5 — An empty unit identifier empties one region

```gherkin
Given the publisher identifier is set
And the Discovery Results unit identifier is empty
When Results are presented
Then no advertising appears among them
And no fault is reported
```

### Scenario: AC-6 — The master switch covers the platform's own region

```gherkin
Given a Complementary Placement applies to a listing
And external advertising is configured in all three network regions
When an Admin turns the master switch off
Then no external advertising appears in any region
And no complementary placement appears on that listing
```

### Scenario: AC-7 — An excluded Category covers the Categories beneath it

```gherkin
Given a sector is on the Category exclusion list
And advertising is configured and the master switch is on
When any surface under any heading of that sector is presented
Then no advertising appears
And removing the sector from the list restores it
```

### Scenario: AC-8 — Off does not erase

```gherkin
Given a publisher identifier, unit identifiers and an exclusion list are set
When an Admin turns the master switch off
Then no advertising appears anywhere
And the identifiers and the exclusion list are unchanged
And turning the switch on restores advertising without them being re-entered
```

### Scenario: AC-9 — Nothing is counted

```gherkin
Given advertising is configured and running
When an Admin reads the Advertising Placement Settings
Then no impression, click, revenue or fill-rate figure is present
And no such figure is recorded anywhere for any region
```

### Scenario: AC-10 — A setting cannot move a listing

```gherkin
Given advertising is configured
When any advertising setting is changed
Then Results are ordered by the product-defined order
And public eligibility, query matching and Listing Card content are unchanged
```

### Scenario: AC-11 — No identifier is invented

```gherkin
Given no publisher identifier has been entered
When any public page is presented
Then no advertising request is made
And no default, sample or inherited identifier is used
```

---

## 9. Dependencies

### Depends On

- `US-PLT-F01-001` — authorized active Admin context.
- `PRD-0006-platform.md` **v2.5** — Approved and Frozen on 2026-09-03, carrying §20.4 for AC-6 and AC-7. This precondition is met.

### Blocks

- None.

---

## 10. Story Size

**M**

Four settings, two of which are gates in front of behaviour another Story
already delivers, and a strict exclusion of measurement.

---

## 11. Out of Scope

- Selling, brokering, pricing, invoicing or reconciling advertising.
- Creative review, approval or moderation.
- Impression, click, revenue, fill-rate or attribution reporting.
- Targeting, and anything sent to a network about a person.
- Any generic Settings area, or any setting key not named in §20.4.
- The Complementary Placement rows themselves, which are `F11`'s sibling
  behaviour under §20.1 and are configured through the placement surface.

---

## 12. Definition of Ready

Readiness is governed by `USER_STORY_HANDBOOK.md` §11 and is referenced here, not duplicated.

Approval or Freeze of this document does not itself commit the Story to delivery.

---

## 13. Definition of Done

Completion is governed by `USER_STORY_HANDBOOK.md` §18 and is referenced here, not duplicated.

**Delivery Status is recorded as Implemented — awaiting Story approval**, which
is not a status the Handbook defines and is stated deliberately. The behaviour
exists; the Story does not yet. Recording it as `Done` would claim a governance
chain that was never followed, and recording it as `Not Started` would be false.

---

## 14. Story Validation Checklist

- [x] Represents one bounded Platform outcome
- [x] Provides observable Admin, person, or platform value
- [x] Independently understandable
- [x] Independently testable
- [x] Traceable to one Parent, Epic, Feature, PRD, and exact applicable UX
- [x] Domain code and Feature ID resolve to authoritative owners
- [x] Relationship classification and Capability reference match the Frozen Feature Registry
- [x] No duplicate Story identified in the current Platform package
- [x] No implementation details
- [x] **No invented upstream behaviour** — AC-6 and AC-7 are owned by `PRD-0006-platform.md` Frozen v2.5 §20.4. The revision this box waited on was Approved and Frozen on 2026-09-03.
- [x] Every Acceptance Criterion begins with "The system shall…"
- [x] Every Acceptance Criterion has one explicitly numbered Story-internal BDD scenario

---

## 15. Notes

`F11` owns *whether* advertising runs and *where it may not*. It does not own
what any advertisement says, who is paid for it, or how often it is seen — the
first belongs to the network, and the last two belong to nobody on this
platform by decision rather than by omission.
