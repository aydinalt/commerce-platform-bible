# UX-0003 — Offering Detail

> **Freeze Note (1.2):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-07. This exact version must not be edited in place; a further
> change requires a controlled revision under `DOCUMENT_LIFECYCLE.md`,
> `REVIEW_PROCESS.md`, and, where architecture is affected, `ADR_PROCESS.md`.
> Frozen v1.1 is preserved unchanged at
> `UX-0003-offering-detail-v1.1-superseded.md`.
>
> **Approval Note (1.2):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-07 — _"UX-0003 v1.2'yi dondurup
> US-EDT-F01-001'in açık kalan tek bağımlılığını kapatabilirsiniz."_ Approval and
> Freeze were taken in one decision. The Owner recorded his agreement with three
> of this revision's calls in the same message: that §7.3 separates the
> assistant's initiative from the person's own action; that §9.4's button is
> itself the selection and therefore breaks neither `PRD-0004` nor the handoff
> metrics; and that §9.4.1's refusal of a disabled or "coming soon" control is
> the right way to avoid promising what the platform cannot keep.
>
> **Revision Note (1.2):** Superseding revision of Frozen v1.1, begun
> independently at Draft under `DOCUMENT_LIFECYCLE.md` §7. **Two additions, and
> one correction of something this document said about itself.**
>
> **1. §8.9 — the editorial review.** `PRD-0009` was Frozen on 2026-09-07 and
> `EDT F01` has no UX section; `EDITORIAL_FEATURE_REGISTRY.md` carries "section
> pending". §8.9 gives it one, and its harder half is the boundary with §8.6:
> two kinds of review and two scales now sit on the same screen.
>
> **2. §9.4 — the affiliate action offered on this screen.** The Owner's
> decision of 2026-09-07.
>
> **3. A correction.** An implementation assessment written earlier the same day
> said that `PRD-0004` §7.3 forbids a handoff that begins without a person
> choosing, and that this was the obstacle. **Read against the document, §7.3
> constrains Decision _Chat_** — it forbids the assistant from choosing an
> Offering or initiating a handoff. It says nothing about where a person's own
> control may live. A person pressing a button is the person choosing, which is
> the thing §7.3 exists to protect rather than the thing it prohibits.
>
> **What is actually load-bearing is narrower and is set out in §9.4.2:** a
> handoff is defined against a **Selected Offering** (`PRD-0004` §5.8, §9.2),
> and the record of one is written inside a Decision Flow. That is a real
> constraint and this revision honours it rather than amending it.
>
> Nothing in §§1–8.8 changes. The new sections are numbered **8.9** and **9.4**
> so that every existing number, and every reference to one, still points at the
> same content.

> **Freeze Note (1.1):** Explicitly Frozen by the Product Owner /
> Architecture Owner on 2026-09-03, together with the other documents of this
> decision — freezing a subset would leave one of them asserting something its
> own references do not support. This exact version must not be edited in
> place; a further change requires a controlled revision under
> `DOCUMENT_LIFECYCLE.md` §7–§8.
>
> **Approval Note (1.1):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-03 — _"onaylıyorum işleme alabilirsin"_.
> Three regions that were on the screen without a description now have one: the product's reviews, the complementary-product region, and reporting a listing.

> **Revision Note (1.1):** Superseding revision candidate of Frozen v1.0, begun
> independently at Draft under `DOCUMENT_LIFECYCLE.md` §7. **It carries no
> Approval Note and no Freeze Note.** Frozen v1.0 remains authoritative and is
> untouched until the Owner approves a successor.
>
> **Three regions have appeared on this screen and none of them is described
> here.** Each was built from an Owner instruction, and each carries a rule this
> document is the right owner of:
>
> - **§8.6 the product's reviews** — the score has been on this screen since
>   I62 and the sentences behind it were nowhere;
> - **§8.7 the complementary-product region** — advertising, labelled as
>   advertising, in the position the Owner's prototype puts it, and bounded by
>   `PRD-0006-platform.md` v2.3 §20;
> - **§8.8 reporting a listing** — _Hata Bildir_, which replaced a "return to
>   the list" control that duplicated the browser's own back button.
>
> §7, §12 and §13 gain the corresponding lines. Everything else — identity,
> visuals, Attributes, the public Business identity set, the Decision entries,
> the protected-information boundary — is unchanged.

- **UX ID:** UX-0003
- **Title:** Offering Detail
- **Status:** Frozen
- **Version:** 1.2
- **Approval Date:** 2026-09-07
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-09-07
- **Frozen By:** Product Owner / Architecture Owner
- **Supersedes:** Frozen v1.1, preserved at `UX-0003-offering-detail-v1.1-superseded.md`
- **Supersedes:** Frozen v1.0, preserved at `UX-0003-offering-detail-v1.0-superseded.md`
- **Supersedes:** Draft v0.1
- **Approved candidate:** In Review v0.3
- **Approval Date:** 2026-07-22
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-07-22
- **Frozen By:** Product Owner / Architecture Owner
- **Scope level:** UX behaviour (non-visual, non-technical)

**Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-22. Frozen v1.0 is the locked V1 UX baseline for UX-0003 — Offering Detail. This exact version must not be edited in place. Any future change requires a controlled revision under `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, and, where architecture is affected, `ADR_PROCESS.md`. This Freeze does not automatically revise User Stories, traceability, repository indexes, or GitHub content.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-22 after Architecture Review, Final Review, package-level reconciliation, independent Claude UX audit, and focused delta audit. The exact In Review v0.3 content becomes the authoritative UX baseline as Approved v1.0 under the first-approval versioning rule. This historical Approval Note records that approval and Freeze were separate decisions. The document was subsequently Frozen on 2026-07-22. User Stories, traceability, repository indexes, and GitHub content do not change automatically.

**Revision Note (0.3):** Focused independent-audit correction supporting UX-A02. Preserves a transient current-flow Compare-preparation context received from UX-0002 and passes it unchanged to UX-0004 when the person chooses Compare. UX-0003 does not own, save, mutate, or persist the preparation context.

**Revision Note (0.2):** Controlled revision against Frozen PRD-0001 v3.1, PRD-0003 v3.1, PRD-0004 v1.2, PRD-0005 v1.3, and the accepted UX ownership decision. Removes Favorites, Messaging, Related Offerings, featured-entry behaviour, and phone-only gating. Defines complete public Offering Presentation, public Business identity boundaries, `Offering Presentation Open`, and handoff of Decision execution to UX-0004 or UX-0009.

> This document defines experience behaviour only. It does not define product state, visual style, component technology, APIs, storage, or implementation architecture.

---

## 1. Purpose

Offering Detail presents one publicly eligible Offering as a complete, understandable Offering Presentation and gives the person clear entries into optional Compare or the single-Offering Decision flow.

## 2. Business Value

The experience helps a person understand one Offering without unnecessary registration, unsupported recommendations, or protected-contact exposure.

## 3. Scope

- complete public Offering Presentation;
- Offering title or name;
- available visual or visual set;
- Category context;
- available description;
- applicable Attribute values in understandable groups;
- PRD-0005-owned public Business identity set;
- entry to optional Compare;
- entry to single-Offering Decision Flow;
- bounded unavailable and error behaviour;
- `Offering Presentation Open`.

## 4. Out of Scope

- Search, Browse, Filter, Listing Card, or result ordering;
- Compare mechanics;
- Decision Chat;
- Compare mechanics beyond the entry;
- **Affiliate Handoff execution.** Unchanged in v1.2: §9.4 offers the action and
  UX-0009 executes it (§9.4.2). What v1.2 removes is the older reading that this
  screen may not _offer_ it;
- Direct Contact reveal or execution;
- Completion;
- Favorites;
- Messaging;
- Related Offerings or recommendations;
- Business contact-information authoring;
- owner or Admin management views.

## 5. Entry Points

- opening a Listing Card from UX-0002;
- opening a Listing Card from UX-0002 with one transient current-flow Compare-preparation context;
- returning from UX-0004 after removing the Offering from a Comparison Set;
- returning from UX-0009 before handoff, where the Offering remains eligible;
- a direct public Offering route that resolves to an eligible Offering.

## 6. Entry Conditions

The public experience begins only when:

```text
final Offering Public Eligibility = Eligible
```

UX-0003 consumes this authoritative result and does not recalculate it.

## 7. Screen Overview

The screen provides:

- recognizable Offering identity;
- available Offering media;
- active Category context;
- available Offering description;
- applicable Attribute information;
- public Business identity;
- **the listing number**, where a person can read and quote it;
- **the product's reviews and the score they produce**;
- applicable Decision entries;
- **a complementary-product region**, where one is configured;
- **a way to report that something on this listing is wrong**.

Protected telephone, email, and external website or contact URL information is not part of public Presentation.

## 8. Presentation Behaviour

### 8.1 Offering identity

The Offering title or name remains identifiable throughout the screen.

### 8.2 Visual information

Where one or more visuals are supplied, the person may inspect the available set.

Where no visual is supplied, the experience remains complete through the other required Offering information and does not invent media.

### 8.3 Category and description

The active Category context is visible.

The available description is presented without inventing missing content.

### 8.4 Attributes

Applicable Attribute values are organized into understandable groups.

The experience:

- shows authoritative values;
- preserves governed units and allowed-value meaning;
- distinguishes missing optional values without inventing defaults;
- does not expose an Attribute that is not applicable to the Offering Category.

### 8.5 Public Business identity

The experience may present only:

- Business display name;
- Business logo, where supplied;
- public Business description, where supplied.

It does not reveal protected Direct Contact information.

### 8.6 The product's reviews

The screen presents the product's score and the reviews behind it.

**They belong to the product, not to the seller.** Every seller of one product
presents the same reviews and the same score; no surface presents a score for a
Business.

A byline is a masking rule and not a stored value: "Aylin K.", never a full
surname, and an anonymous review where an account carries no name — an invented
byline would be worse than none.

**An outage is not an absence.** Where the reviews cannot be read, the screen
says so. "No reviews yet" is a claim about the product, and a failure is not
entitled to make it.

Writing is offered only to a person the platform will accept a review from. A
form offered to somebody who will be refused on submission is a worse answer
than no form. A person who has already written one is offered **their own review
to change**, not an empty box: one person, one review, and a repeat submission
replaces the previous one.

Where more reviews exist than are shown, the screen says how many.

### 8.7 The complementary-product region

Where a complementary product is configured for this listing's Category, the
screen presents it **directly below the actions**, and **labelled as
advertising** in the person's own language, legibly without colour.

`PRD-0006-platform.md` v2.3 §20 bounds it and this section adds nothing to it:

- the region is **absent, not empty**, where nothing is configured;
- each entry names **whose site** the person is about to be on, before they
  press it rather than after;
- nothing about the region is counted, reported or fed back into what this
  screen shows;
- the region changes nothing about the Offering it sits beside — not its
  eligibility, not its content, not the seller list.

The position is the one thing this document owns and it is deliberate: "you will
also need tyres" is useful to somebody who has decided what to do about the car,
and an interruption to somebody still reading the price.

### 8.8 Reporting a listing

The screen provides a way to say that something here is wrong: a closed list of
reasons and an optional sentence.

- **Open to anybody**, signed in or not. The people best placed to notice a
  stale price are the least likely to have an account.
- **Folded away until it is wanted.** A form of reasons open on every product
  page would say the platform expects its listings to be wrong.
- The answer afterwards is what the platform has actually done — accepted the
  report and will look — and never that the listing will change. Whether a
  price is wrong is not something one report settles.
- A refusal is said plainly, including where too many reports have arrived from
  one caller. A report silently dropped is worse than one refused.

This region **replaces** the earlier "return to the list" control, which
duplicated the browser's own back button.

### 8.9 The editorial review

Where this listing carries a Product Key and an editorial review exists for that
key, the screen presents the review. Behaviour owner: `PRD-0009` **Frozen
v0.3**. Feature: `EDT F01`.

**It belongs to the product, exactly as §8.6's reviews do.** Every seller of one
product presents the same review, and it is the same review — not a copy held
against each listing. It survives a seller withdrawing.

The screen presents the verdict, the score, the headed sections, the pros, the
cons, the author, and **both dates**: when it was first published and when it
was last re-checked.

**The two dates are presented together and neither stands for the other.** A
review's prose ages faster than anything else on this screen, because the prices
around it move weekly. "Written in March" and "written in March, checked last
week" are different claims, and a screen that shows only the first invites a
reader to trust an old one.

### 8.9.1 Two reviews, two scores, one screen — the boundary

This screen now carries two things a reader could mistake for each other, and
the distinction is the reason both are worth having.

|                 | §8.6 — the product's reviews                       | §8.9 — the editorial review                      |
| --------------- | -------------------------------------------------- | ------------------------------------------------ |
| Whose words     | The crowd's, unverified, and labelled so           | The platform's own, attributed to a named author |
| The scale       | `0–5`, one decimal, derived from what people wrote | `0–10`, one decimal, formed by a person          |
| What it answers | "What do buyers say"                               | "What do we think"                               |

**The two scores are never merged, averaged, or presented as one number.** No
third number derived from them appears anywhere on this screen. They answer
different questions, and a blended figure answers neither — nor could it be
explained to a partner who asked how it was calculated.

They are presented as distinguishable regions, so that a reader who reads only
one of them knows which one they read.

### 8.9.2 Absence and outage

- **A listing whose Product Key has no review** presents no review and no
  placeholder for one. Most products will have none, and an empty frame implies
  a missing thing rather than an absent one.
- **A listing with no Product Key** is the same case: nothing is presented, and
  nothing on the screen suggests a review might arrive.
- **Where a review exists and cannot be read**, the screen says the reading
  failed. §8.6's rule applies unchanged and for the same reason: an outage is
  not entitled to make the claim "there is no review".

### 8.9.3 What this screen does not do with a review

- It does not offer to write, edit or withdraw one. No authoring surface is
  defined by any document; `EDITORIAL_FEATURE_REGISTRY.md` §2.1 records that
  deliberately.
- It places **no advertising inside the review**, and presents no review as
  advertising (`PRD-0009` §8). The advertising regions this platform permits are
  named in the Frozen PRDs and this is not one of them.
- It does not use the editorial score to order anything. Ordering is Discovery's
  and is not influenced from this screen.

## 9. Decision Entries

### 9.1 Start Decision

The person may enter UX-0009 with this eligible Offering as a single-Offering Decision Context.

Starting Decision does not require authentication.

### 9.2 Compare

The person may enter UX-0004 to form or continue a valid Comparison Set.

Where UX-0003 received a transient Compare-preparation context from UX-0002:

- the context remains current-flow only;
- UX-0003 does not alter or persist it;
- choosing Compare passes the exact preparation context and the currently viewed Offering to UX-0004.

Without that context, UX-0004 receives only the currently viewed eligible Offering as a new preparation entry.

UX-0003 does not:

- create a valid Compare surface with fewer than two Offerings;
- add a member to the Comparison Set itself;
- compare Attributes;
- enforce replacement at five;
- transfer the Comparison Set into Decision Chat.

Those behaviours belong to UX-0004.

### 9.3 Ownership boundary

UX-0003 presents entries only.

UX-0004 executes Compare.

UX-0009 executes Decision Chat, selection, handoffs, and Completion.

**§9.4 does not change this boundary**, and the way it avoids changing it is the
substance of §9.4.2.

### 9.4 The affiliate action, offered on this screen

The screen offers the affiliate action for **this** listing, where it is
available. Owner decision of 2026-09-07.

Until now a person who had decided reached the destination only by starting a
decision path first. A comparison platform whose price rows lead nowhere is an
odd thing, and the prototype draws the action on the row.

### 9.4.1 When it is offered, and when it is not

The action is offered only when both eligibility results permit it
(`PRD-0004` §9.1, which consumes them and recalculates neither):

```text
final Offering Public Eligibility     = Eligible
AND
Affiliate Destination Handoff Eligibility = Eligible
```

Otherwise **the action is not presented at all.**

**Not disabled, not "coming soon", not a greyed control.** A control a person
can see and cannot use is a promise the screen cannot keep, and "coming soon" is
a claim about the future that nobody on this screen is in a position to make —
an Admin may never enable that destination, and a partner may never sign. The
listing is complete without it: it appears, it compares, it simply cannot be
handed off, which `V1_LAUNCH_RUNBOOK.md` §2.2 already records as a legitimate
state.

**Absence of the action is never explained as a fault of the listing.** No
message, no note, no empty region.

### 9.4.2 Why this is still an entry and not an execution

`PRD-0004` **Frozen v1.2** defines an Affiliate Handoff against a **Selected
Offering** (§5.8, §9.2): it is initiated when _the person selects the approved
affiliate action_, and its record and its Completion evidence live in a Decision
Flow.

Pressing the action on this screen **is** that selection: this listing, chosen
by this person, explicitly. `PRD-0004` already permits a single-Offering path —
§9.1 of this document has always offered exactly that, and Compare is not a
prerequisite for a handoff.

So the action carries this one Offering into UX-0009 as a single-Offering
Decision Context and the handoff executes there, exactly as it does today.
**What changes is where the person may press it, not what happens when they
do.** The handoff record, the Completion evidence and the Affiliate Handoff Rate
are unaffected, because nothing about the handoff itself is new.

The person does not experience a stop on the way. What they experience is
pressing a button and arriving at the seller.

> **Open — the Owner's decision.** The alternative is to let this screen execute
> the handoff itself, without forming a Decision Context. It is one fewer record
> per click and it would require amending `PRD-0004` §5.8 and §9.2, because a
> handoff would no longer be defined against a Selected Offering — and the
> Affiliate Handoff Rate, Completion evidence and every Decision figure that
> counts handoffs would each need re-defining against the new shape.
>
> **This draft recommends the form above**, which costs one Decision Flow row
> per direct handoff and changes no Frozen behaviour. The recommendation is not
> a decision.

### 9.4.3 What the action is not

- It is **not advertising**, is not sold, and its presence or position is never
  purchasable (`PRD-0005` v1.4; `PRD-0009` §8).
- It does not appear inside the editorial review (§8.9.3).
- It is not offered for any listing other than the one being viewed. Where the
  screen shows the other sellers of the same product, this screen offers no
  action on them; that is Compare's and Decision's ground.

## 10. Offering Presentation Open

`Offering Presentation Open` occurs when:

- the Offering is eligible; and
- complete public Presentation successfully begins.

The occurrence is not produced by:

- a management view;
- an unavailable screen;
- an error screen;
- an ineligible Offering.

## 11. Eligibility Change Behaviour

If the Offering is no longer eligible before Presentation begins:

- public Offering content is not presented;
- Decision and Compare entries are unavailable;
- the person receives a bounded unavailable state;
- the person may return to Discovery.

If eligibility becomes invalid before a later Decision action, UX-0009 or UX-0004 handles that action boundary.

## 12. User Actions

- inspect available Offering information;
- inspect available visuals;
- read the product's reviews;
- write or change one's own review, where the platform accepts one;
- keep or release the product;
- open a complementary product, where one is configured;
- report that something on this listing is wrong;
- enter optional Compare;
- enter the single-Offering Decision flow;
- return to Discovery.

## 13. System Responses

- begins complete Presentation only for an eligible Offering;
- preserves authoritative content and missing-information meaning;
- opens UX-0004 or UX-0009 with the exact Offering context;
- preserves and forwards an existing transient Compare-preparation context without owning it;
- prevents protected contact information from appearing publicly;
- presents one score and one set of reviews for every seller of one product;
- distinguishes "no reviews yet" from "the reviews could not be read";
- presents no advertising region where none is configured, and labels every one it presents;
- accepts a report without claiming the listing is wrong, and refuses one out loud rather than dropping it.

## 14. Empty and Missing-Information States

- no visual: continue with the remaining complete Presentation;
- no optional description: omit the missing optional content without invented copy;
- no optional Attribute value: preserve the authoritative missing-value treatment;
- no applicable Decision entry: keep Presentation available without fabricating an action.

## 15. Loading Behaviour

While eligibility and Offering Presentation information are being resolved:

- the experience does not expose partial protected information;
- actions that depend on eligibility are not active;
- the person's navigation context is preserved.

## 16. Error Behaviour

When Presentation cannot begin:

- no `Offering Presentation Open` occurs;
- no Decision or Compare action starts;
- the person may retry or return to Discovery;
- entered or previously selected Decision context is not silently invented.

## 17. Permissions

| Action                                     |       Guest | Enabled User | Business Context | Admin Context |
| ------------------------------------------ | ----------: | -----------: | ---------------: | ------------: |
| View eligible public Offering Presentation |           ✓ |            ✓ |                ✓ |             ✓ |
| Start single-Offering Decision Flow        |           ✓ |            ✓ |                ✓ |             ✓ |
| Enter optional Compare                     | Conditional |  Conditional |      Conditional |   Conditional |
| View protected Direct Contact information  |           ✗ |            ✗ |                ✗ |             ✗ |
| Use Favorites                              |           ✗ |            ✗ |                ✗ |             ✗ |
| Use Messaging                              |           ✗ |            ✗ |                ✗ |             ✗ |

Business and Admin contexts receive only the public person baseline on this screen.

## 18. Accessibility Requirements

- Offering identity and Category context are programmatically distinguishable.
- Every available visual has an accessible equivalent or is marked non-informational.
- Attribute groups and values have a meaningful reading order.
- Missing values are not communicated by visual treatment alone.
- Decision entries are keyboard operable and have unambiguous names.
- Loading, unavailable, and error changes are perceivable without relying only on color or motion.

## 19. Related Documents

- `PRD-0009-editorial-review.md` **Frozen v0.3** — the editorial review's
  behaviour owner; §5 its parts, §5.1 the dates, §5.2 the two scores, §6.1 what
  it attaches to, §8 the integrity rule §8.9.3 and §9.4.3 both rest on.
- `PRD-0001-offering.md` **Frozen v4.3** — §5.12.4 the Product Key material;
  §8.2 the Presentation list that carries it; §9 the Affiliate Destination.
- `PRD-0004-decision.md` **Frozen v1.2** — §5.8 and §9 the Affiliate Handoff and
  the Selected Offering it is defined against; §7.3 the Decision Chat boundary,
  which §9.4.2 does not rely on.
- `PRD-0005-business.md` **Frozen v1.4** — advertising permitted in three named
  regions and nowhere else; paid position in Results forbidden.
- `EDITORIAL_FEATURE_REGISTRY.md` — `EDT F01`, and §2.1's record that no
  authoring Feature is allocated.

- `PRD-0001-offering.md` — Presentation, eligibility, lifecycle, Attribute-value meaning.
- `PRD-0003-identity.md` — public baseline and protected-contact gate.
- `PRD-0004-decision.md` — Decision entry consumption.
- `PRD-0005-business.md` — public Business identity and protected Direct Contact set.
- `UX-0002-discovery.md` — Listing Card entry.
- `UX-0004-compare.md` — Compare execution.
- `UX-0009-decision-flow.md` — Decision execution.

## 20. Acceptance Criteria

```gherkin
Scenario: Eligible Offering opens complete Presentation
  Given final Offering Public Eligibility is Eligible
  When public Offering Presentation successfully begins
  Then the title or name, Category context, available description, applicable Attributes, and public Business identity are available
  And Offering Presentation Open occurs

Scenario: Public Presentation protects Direct Contact
  Given a Guest or authenticated person views Offering Detail
  When Business identity is presented
  Then telephone, email, and external contact URL information are not revealed by UX-0003

Scenario: Start a single-Offering Decision
  Given an eligible Offering Presentation
  When the person starts Decision
  Then UX-0009 receives exactly that Offering as the Decision Context
  And authentication is not required

Scenario: Enter Compare
  Given an eligible Offering
  When the person chooses Compare
  Then UX-0004 receives the Offering
  And UX-0003 does not execute comparison behaviour

Scenario: Preserve Compare preparation context
  Given UX-0003 receives an eligible Offering and one transient Compare-preparation context from UX-0002
  When the person chooses Compare
  Then UX-0004 receives the exact existing preparation context and the current Offering
  And UX-0003 does not save, alter, or complete the Comparison Set

Scenario: Ineligible Offering does not open publicly
  Given final Offering Public Eligibility is Ineligible
  When the public route is opened
  Then complete Offering Presentation does not begin
  And Offering Presentation Open is not produced
  And Decision and Compare entries are unavailable

Scenario: Missing optional information is not invented
  Given an eligible Offering lacks an optional description, visual, or Attribute value
  When Presentation begins
  Then the experience preserves the missing-information meaning
  And does not invent a replacement value

Scenario: Favorites and Messaging are absent
  Given a person views Offering Detail
  When available actions are presented
  Then no Favorites or Messaging action is available
```

### 20A. Editorial review and the affiliate action (1.2)

```gherkin
Scenario: One review, several sellers
  Given three listings carry the same Product Key
  And an editorial review exists for that key
  When a person opens any one of them
  Then the same editorial review is presented

Scenario: The two scores stay two
  Given a product has an editorial score and a crowd average
  When a person reads the screen
  Then both are presented as distinguishable values
  And no number derived from the two is presented anywhere on the screen

Scenario: Both dates
  Given an editorial review was published and later re-checked
  When a person reads it
  Then the publication date and the last-updated date are both presented

Scenario: No review is not a broken review
  Given a listing's Product Key has no editorial review
  When a person opens the listing
  Then no review and no placeholder for one is presented

Scenario: An outage does not claim absence
  Given an editorial review exists and cannot be read
  When a person opens the listing
  Then the screen says the reading failed
  And it does not state that no review exists

Scenario: The affiliate action where both eligibilities permit
  Given a listing is publicly eligible
  And its Affiliate Destination Handoff Eligibility is Eligible
  When a person opens the listing
  Then the affiliate action is offered

Scenario: No destination, no control
  Given a listing has no enabled Affiliate Destination
  When a person opens the listing
  Then no affiliate action is presented
  And no disabled control, "coming soon" state or explanation is presented

Scenario: An Admin disabling a destination removes the action
  Given a listing offered the affiliate action
  When an Admin disables its Affiliate Destination
  Then the action is no longer offered on the listing

Scenario: Pressing the action is the person's selection
  Given the affiliate action is offered
  When the person presses it
  Then this Offering becomes the Selected Offering of a single-Offering Decision Context
  And the handoff is executed by UX-0009
  And the person is not asked to make a further choice on the way

Scenario: The action is not sold
  Given advertising is permitted only in the regions the Frozen PRDs name
  When the screen is composed
  Then no advertising appears within the editorial review
  And neither the presence nor the position of the affiliate action is purchasable
```

## 21. Accepted UX Deferrals

The following do not block review:

- exact visual hierarchy and responsive layout;
- visual-gallery interaction design;
- copywriting for unavailable and error states;
- technical media loading and caching;
- implementation of navigation between UX documents.

No deferral may add Favorites, Messaging, recommendations, protected public contact, or action behaviour owned by UX-0004 or UX-0009.
