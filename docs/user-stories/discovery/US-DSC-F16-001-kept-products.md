# US-DSC-F16-001 — Kept Products

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
> Discovery Feature `F16`. **Written after the behaviour shipped**, in I64, from
> the Owner's own instruction; the Acceptance Criteria below are the rules the
> platform already enforces, written down so they can be reviewed and argued
> with rather than only read out of a repository. This document creates no
> Feature, Capability, PRD/UX behaviour, implementation, approval, Freeze or
> GitHub change.
>
> **Why Discovery and not the Member Area alone.** `PRD-0007-member-area.md`
> owns the Member Profile and what a person may keep; what this Story owns is
> the Discovery half — the mark on a card, and the fact that what is kept is the
> **product** rather than one seller's listing of it.

## 1. Metadata

| Field                 | Value                                                            |
| --------------------- | ---------------------------------------------------------------- |
| Story ID              | `US-DSC-F16-001`                                                 |
| Story Title           | Kept Products                                                    |
| Parent Story Document | `US-0002 Discovery` (`US-0002-discovery.md`)                     |
| Story Domain          | Discovery                                                        |
| Domain Code           | `DSC` — owned by `REPOSITORY_GOVERNANCE.md`                      |
| Epic                  | Results and Refinement                                           |
| Feature               | `F16` — Kept Products                                            |
| Feature ID            | `F16` — allocated by Frozen `DISCOVERY_FEATURE_REGISTRY.md` v2.0 |
| Capability            | Discovery — Direct Frozen assignment by reference                |
| Perspective           | Person coming back to something they found                       |
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
| `[FEATURE_ID]` | `F16` | Frozen `DISCOVERY_FEATURE_REGISTRY.md` v2.0             |
| `[ID]`         | `001` | `USER_STORY_HANDBOOK.md`                                |

---

## 3. Purpose

Let a person keep a product and find it again, on today's price, without a
seller's decision deleting what they kept.

---

## 4. Business Value

> **As a** person comparing over days rather than minutes
> **I want** to keep the things I am considering
> **So that** I can come back to them and see what they cost now

---

## 5. Description

**What is kept is the product, not the listing.** Keeping a phone from the
cheapest seller and returning through a dearer one shows it already kept,
because they are one product under `PRD-0001-offering.md` §5.12.

A kept product is read back as a Listing Card drawn from the **cheapest
currently eligible seller**, so a person sees today's price rather than the
price it carried when they kept it.

A seller withdrawing does not delete what somebody kept: a person kept a
product, and the catalogue losing a way to buy it is not them changing their
mind. What is kept and no longer reachable is counted and said, rather than
silently disappearing.

Keeping requires an account, because a favourite is a fact about a person. A
Guest pressing the control is taken to sign in and the action is theirs to
repeat; nothing is kept on their behalf.

---

## 6. References

| Concern               | Document                                                        | Referenced For                                    |
| --------------------- | --------------------------------------------------------------- | ------------------------------------------------- |
| Parent Story Document | `US-0002-discovery.md`                                          | Epic and Feature placement                        |
| Domain Code Owner     | `REPOSITORY_GOVERNANCE.md`                                      | `DSC` code                                        |
| Feature Registry      | `DISCOVERY_FEATURE_REGISTRY.md` v2.0                            | `F16` identity — **candidate**                    |
| PRD                   | `PRD-0002-discovery.md` v3.0 §5.8 and `PRD-0007-member-area.md` | The behaviour — **candidate**                     |
| UX                    | `UX-0002-discovery.md` §10                                      | The control and what is readable while it applies |
| Supporting PRD        | `PRD-0007-member-area.md`                                       | The Member Profile and what a person may keep     |
| Supporting PRD        | `PRD-0001-offering.md` §5.12                                    | The product grouping a keep is recorded against   |
| Story Standards       | `USER_STORY_HANDBOOK.md`                                        | Story standards, DoR, DoD, validation             |

---

## 7. Acceptance Criteria

- **AC-1** — The system shall record a keep against the product group rather than against one Offering.
- **AC-2** — The system shall present a product as kept on every Listing Card of that product group.
- **AC-3** — The system shall require an authenticated person to keep or release a product.
- **AC-4** — The system shall take a Guest who presses the control to sign in, and shall keep nothing on their behalf.
- **AC-5** — The system shall present a kept product from its cheapest currently publicly eligible seller.
- **AC-6** — The system shall retain a keep when every seller of the product withdraws.
- **AC-7** — The system shall state how many kept products are not currently reachable, rather than omitting them silently.
- **AC-8** — The system shall present no keep marks for a person who is not signed in, rather than presenting them empty.
- **AC-9** — The system shall leave Discovery Results and their arrangement unchanged by what a person has kept.

---

## 8. BDD

### Scenario: The product is kept, not the listing

```gherkin
Given two partners list one product with a Product Key
And a person keeps it from the cheaper listing
When they open the dearer listing
Then it is presented as already kept
```

### Scenario: Today's price

```gherkin
Given a person kept a product at one price
And a cheaper eligible seller appears afterwards
When they read what they kept
Then the cheaper current price is presented
```

### Scenario: A withdrawal does not delete a decision

```gherkin
Given a person kept a product
And every seller of it withdraws
Then the keep is retained
And the surface states that a kept product is not currently listed
```

### Scenario: Keeping changes no Results

```gherkin
Given a person has kept several products
When they search or browse
Then the Results and their arrangement are what they would be for anyone else
```

---

## 9. Dependencies

### Depends On

- `PRD-0007-member-area.md` — the Member Profile.
- `PRD-0001-offering.md` §5.12 — the product grouping.
- `DISCOVERY_FEATURE_REGISTRY.md` v2.0 — `F16` allocation.

### Blocks

- `US-DSC-F06-001` — the Listing Card carries the mark.

---

## 10. Story Size

**M**

One keep recorded against a grouping, read back as cards, with an unreachable
count and an authentication boundary.

---

## 11. Out of Scope

- Price-drop alerts, notifications or any message about a kept product.
- Sharing, exporting or publishing what a person has kept.
- Any effect of keeps on Results, ordering or recommendations.
- List layout and the control's glyph — `UX-0002-discovery.md`.

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

Nothing here reads what a person kept into Discovery: AC-9 is the boundary, and
it is stated because a "because you kept" ordering is exactly the personalised
ranking V1 excludes.
