# Traceability v1.1 — Superseding Revision Record

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft — awaiting Owner review, then approval, then a separate freeze decision
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-17
- **Scope:** Prepares one candidate document. **No Frozen document is edited, and
  no approval or freeze is claimed.**

## What was prepared

`docs/traceability-v1.1-candidate.md` — a superseding revision of Frozen
`docs/traceability.md` v1.0, begun independently at Draft under a new version, as
`DOCUMENT_LIFECYCLE.md` §7 requires.

Two corrections had been queued against that baseline for weeks, and the record
of them said each time that they could not be applied: the document is Frozen,
and editing a Frozen document in place is what the lifecycle forbids. This is
the sanctioned route, taken as far as it can be taken without the Owner.

## Why the candidate is a separate file

`DOCUMENT_LIFECYCLE.md` §7 says the Frozen version "remains preserved as the
baseline until the superseding revision is independently reviewed, Approved, and,
when required, Frozen".

Writing a Draft into `docs/traceability.md` would have satisfied the letter of
"a new version at Draft" and broken that sentence: the repository would have had
no Frozen traceability baseline from the moment of the commit, and two live
documents — `REPOSITORY_INDEX.md` and `CURRENT_STATUS.md` — would have become
wrong for describing one.

So v1.0 stays exactly where it is and the candidate sits beside it. **On
approval the Owner replaces `docs/traceability.md` with the candidate's content
and deletes the candidate file**, which is the shape every earlier superseding
revision in this repository took — PRD-0006 v1.0 → v2.1 among them.

## The three changes, and nothing else

### §5 and §7 — the Delivery Status assertion

v1.0 stated, twice, that all 50 Generated Stories carry Delivery Status
`Not Started`. **True on 2026-07-25 and false since 2026-08-15**, when I9
advanced 49 against per-criterion evidence; the Owner's AC-3 decision of
2026-08-17 advanced the last. Both statements now say `Done` and cite where the
evidence lives.

Nothing else in either sentence moved. The Stories are still Frozen, still 50,
still one per Feature, and their Acceptance Criteria are untouched — and the
candidate says so in as many words, because a reader arriving at "`Done`" in a
traceability baseline could otherwise reasonably wonder what else had shifted.

### §6 — the implementation tier

v1.0 recorded six tiers and stopped, because there was no seventh: no
implementation existed when it was written. There is one now, and a cross-tier
traceability document that does not mention it is incomplete rather than wrong.

The new section records **that the tier exists and where its evidence is**, in
six rows and a total. It deliberately does not restate the evidence:
`DELIVERY_STATUS_ADVANCEMENT.md` holds 526 criteria matched to the tests that
verify them, and copying that into a baseline document would create a second
copy to keep in step with the first.

`M11_STORY_LINK_PROPOSAL.md` recorded three partial Story links and stated that
folding them into this baseline needed exactly this revision. They are subsumed:
every Story it named, and every other, now carries complete per-criterion
coverage, so three partial links have nothing left to add.

### §9 — lifecycle work that had already closed

v1.0's own Remaining Lifecycle Work table listed "Repository-wide traceability
lifecycle | In Review v0.8 | Complete Architecture Review and Final Review before
Owner approval" — work its own approval and freeze had completed on the same day
the document was written. The row is replaced by what is actually outstanding,
including this candidate's own review.

## What was deliberately not changed

| | |
|---|---|
| Any Feature ID, capability mapping or ownership statement | Nothing about what owns what has changed since v1.0 |
| Any PRD or UX reference | Same documents, same versions |
| The `UX-0007 Messaging` scope decision | Still outside the Frozen V1 baseline, on the same terms |
| Story or Feature counts | Still 50, 6 and 56 |
| Section numbering of §1–§5 | Other records cite §5 by number; inserting the new section after it leaves those citations correct |

## Numbers, and where each was checked

Every figure in §6 was read out of `DELIVERY_STATUS_ADVANCEMENT.md` rather than
recalled: Offering 64, Discovery 81, Identity 81, Decision 72, Business 95,
Platform 133, totalling 526. The "ten covered by absence" figure was counted from
the eleven occurrences of that phrase, one of which is the heading that explains
it.

## What the Owner still has to do

1. Review the candidate. `REVIEW_PROCESS.md` governs the form.
2. Approve it as v1.1, as a separate explicit decision.
3. Decide separately whether to freeze it. A Living document may stay Approved.
4. On approval, move the candidate's content to `docs/traceability.md`, delete
   `docs/traceability-v1.1-candidate.md`, and update the `Traceability` rows in
   `CURRENT_STATUS.md` and `REPOSITORY_INDEX.md`, which correctly read
   `Frozen v1.0` until then.

**Until step 2, Frozen v1.0 remains the authoritative traceability baseline** and
the candidate has no authority over anything.
