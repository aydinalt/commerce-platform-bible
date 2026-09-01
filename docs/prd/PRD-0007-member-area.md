# PRD-0007 — Member Area

- **Owner:** Product Owner / Architecture Owner
- **PRD ID:** PRD-0007
- **Title:** Member Area
- **Status:** Frozen
- **Version:** 1.0
- **Supersedes:** Nothing — this is a new document
- **Approval Date:** 2026-08-31
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-08-31
- **Frozen By:** Product Owner / Architecture Owner
- **Last Updated:** 2026-08-31
- **Scope level:** Product behaviour (non-technical)

> **Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-08-31, simultaneously with the other three documents of this decision, because a Freeze of any subset would reintroduce the contradiction these revisions exist to prevent. This exact version must not be edited in place; a further change requires a controlled revision under `DOCUMENT_LIFECYCLE.md` §7–§8. Frozen together: `PRD-0002-discovery.md` v2.4, `PRD-0005-business.md` v1.4, `PRD-0006-platform.md` v2.2, and `PRD-0007-member-area.md` v1.0. This Freeze does not change Delivery Status, traceability, repository indexes, or GitHub content.
>
> **Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-08-31. The four were approved together because they state one decision between them: advertising is permitted in three named regions and nowhere else, Favorites and the Member Profile become a capability the platform owns, and Results are delivered a page at a time. Approving a subset would have left a document forbidding what another permits — the defect the 2026-08-31 Discovery Start round was spent removing. This Approval Note records that approval and Freeze were separate decisions.
>
> **Drafting Note (1.0):** Opened by Owner decision of 2026-08-31,
> which asked for Favorites and a Member Profile and chose a **new PRD** over
> extending PRD-0002 or PRD-0004.
>
> The reason that choice was right is visible in what the existing documents
> say. PRD-0002 listed *Favorites* among the things outside it and PRD-0004 does
> not mention the word. Both are about **flows** — a Discovery path, a Compare
> session, a Decision Chat — and every one of them is bounded: it begins, it is
> narrowed, it ends. A Favorite is the opposite kind of thing. It survives the
> path that created it, it survives the session, and a person expects to find it
> a week later. Putting a persistent record inside a document about paths would
> have made "path" mean two things, and the whole reason those documents are
> readable is that it means one.
>
> **What this document is not.** It is not a membership tier, not a paid plan,
> not a permission system, and not a second identity. A Member is a User Account
> that has signed in — PRD-0003 owns what that means, and this document changes
> none of it.

> This document defines product behaviour only. It does not define visual style,
> components, APIs, storage, or technical routing.

---

## 1. Purpose

To give a signed-in person a place of their own: a short list of Offerings they
kept, and the few facts about themselves the platform holds.

---

## 2. Business Value

The platform's public surfaces work without an account and will keep working
without one. That is deliberate and it leaves one question unanswered: **why
would anybody sign in?**

Today the honest answer is "no reason". A Guest can Search, Browse, Compare,
open a Decision Chat and reveal a contact. Registration exists and buys nothing.

A Favorite is the smallest true answer. Somebody comparing eleven Offerings
across three evenings needs the shortlist to still be there on the third
evening, and no amount of session state will do it. The Member Profile is the
second: a person who has told the platform their name should not be asked again.

**Neither is a wall.** Nothing that works for a Guest today stops working. What
signing in adds is memory, and only memory.

---

## 3. Scope

PRD-0007 includes:

- saving a publicly eligible Offering as a **Favorite**;
- removing a Favorite;
- reading the Favorites a Member holds, most recently saved first;
- a **Member Profile**: display name and contact preference;
- reading and editing that Profile;
- the bounded meaning of "signed in" for both, deferring to PRD-0003;
- the same behaviour across every Domain.

---

## 4. Out of Scope

The following are outside PRD-0007:

- membership tiers, plans, paid membership, or any priced capability;
- a separate Member identity, login, or credential — PRD-0003 owns identity;
- gating Search, Browse, Compare, Decision Chat, Affiliate Handoff, or Direct
  Contact behind sign-in;
- Offering authoring by a Member — an Offering belongs to a Business (PRD-0005);
- Saved Search, Search History, price watching, alerts, or Notifications;
- sharing, publishing, or exporting a Favorites list;
- Favorites-derived recommendation, ranking, or ordering anywhere;
- Business-facing or Admin-facing analytics of Favorites;
- avatars, profile photographs, biographies, or public Member pages;
- Messaging between Members, or between a Member and a Business;
- API, database, storage, frontend, backend, security, logging, monitoring,
  deployment, or infrastructure;
- any V2 or excluded capability in `V1_SCOPE.md`.

**A Favorite is private and stays private.** No Business learns that its
Offering was saved, no Admin surface counts Favorites, and nothing a Member
saves changes what any other person sees.

---

## 5. Core Concepts and Ownership

### 5.1 Member

A User Account with an active session. **PRD-0003 owns the account, the session,
and access status**; this document adds no state to any of them and reads all
three rather than recomputing them.

A Member whose account is suspended is not a Member for this document's
purposes: the Favorites and the Profile remain stored and are not readable until
the account is enabled again. Nothing is deleted by a suspension.

### 5.2 Favorite

A Member's record that an Offering was kept. It carries the Member, the
Offering, and when it was saved — and nothing else. There is no note, no rating,
no folder and no ordering the Member controls.

**A Favorite is a reference, not a copy.** It does not preserve a price, a
title, or a photograph as they were. An Offering that changes shows its change;
an Offering that stops being publicly eligible stops being shown, and the
Favorite is neither deleted nor silently repaired — §6.4.

### 5.3 Member Profile

Two facts and no more:

- a **display name**, which the Member may set and may leave empty;
- a **contact preference**, which records how the Member prefers to be reached
  when they choose to reveal a contact.

The email address that identifies the account is **not** part of the Profile;
PRD-0003 owns it, and a document that let it be edited here would be a second
owner of an identity.

---

## 6. Favorites Behaviour

### 6.1 Saving

A Member saves an Offering that is **publicly eligible at the moment of saving**.
Saving is explicit: it follows an action the person took, never a page they
opened, a Result they scrolled past, or an Offering they compared.

Saving the same Offering twice leaves one Favorite. The second save is not an
error and not a duplicate; it is the state the Member asked for, already true.

### 6.2 Removing

A Member removes a Favorite explicitly. Removing one that is already gone is
likewise not an error — the state asked for is the state that holds.

### 6.3 Reading

Favorites are presented **most recently saved first**. The Member cannot reorder
them and the platform does not reorder them by price, popularity, or anything
else: a shortlist a person did not order themselves is a recommendation wearing
a shortlist's clothes.

### 6.4 An Offering that is no longer eligible

A saved Offering may be hidden, archived, or restricted after it was saved.
When that happens:

- it is **not presented among the Favorites**, because presenting it would show
  a person something the platform has withdrawn from everybody;
- the Favorite is **not deleted**, because the Offering may return, and deleting
  a person's record on the platform's behalf is a decision the platform does not
  get to make;
- the Member is told that **a saved Offering is currently unavailable**, without
  being told which one or why. Naming it would republish what was withdrawn.

### 6.5 A Guest

A Guest has no Favorites and is not offered one. Where a Member would see the
action, a Guest sees the invitation to sign in — an invitation, not a refusal,
and nothing else on the page changes.

### 6.6 Bound

A Member holds **at most a product-defined number of Favorites**. The bound
exists so a shortlist stays a shortlist; a person who reaches it is told, and is
asked to remove one rather than having one removed for them.

---

## 7. Member Profile Behaviour

- Both fields are **optional**. A Profile that has never been edited is a valid
  Profile, and no surface demands it be completed.
- A change is a **replacement of the whole Profile**, stated and confirmed. A
  partial save that leaves the Member unsure which half was kept is the defect
  this rule exists to prevent.
- The contact preference **records a preference and enforces nothing**. PRD-0004
  owns Direct Contact and Affiliate Handoff; a preference recorded here does not
  change what either does.
- The display name is **not published**. It is not shown on an Offering, beside
  a Business, or anywhere another person can read it.

---

## 8. Related PRDs

| PRD | Relationship |
| --- | --- |
| PRD-0003 Identity | Owns the account, session, and access status this document reads |
| PRD-0002 Discovery | Owned the Favorites exclusion until 2026-08-31; the concept moved here |
| PRD-0004 Decision | Owns Compare, Decision Chat, Handoff, and Direct Contact — none of which sign-in gates |
| PRD-0001 Catalog | Owns the Offering and its public eligibility, which §6.4 reads |

---

## 9. Acceptance Criteria

```gherkin
Scenario: A Member keeps an Offering
  Given a Member is signed in
  And an Offering is publicly eligible
  When the Member saves it
  Then it appears among their Favorites
  And nothing about the Offering changes for anybody else

Scenario: Saving twice keeps one
  Given a Member has already saved an Offering
  When they save it again
  Then they hold exactly one Favorite for it
  And no error is stated

Scenario: Favorites are ordered by when they were saved
  Given a Member holds several Favorites
  When they read them
  Then the most recently saved is first
  And the order follows no price, popularity, or platform judgement

Scenario: A withdrawn Offering is neither shown nor deleted
  Given a Member saved an Offering
  And that Offering is no longer publicly eligible
  When the Member reads their Favorites
  Then the Offering is not presented
  And the Member is told a saved Offering is currently unavailable
  And the Favorite is still held

Scenario: A Guest is invited rather than refused
  Given a person is not signed in
  When they view an Offering
  Then they are invited to sign in to save it
  And every other action remains available to them

Scenario: The bound is stated rather than enforced silently
  Given a Member holds the maximum number of Favorites
  When they try to save another
  Then they are told the list is full
  And no existing Favorite is removed on their behalf

Scenario: A suspended account keeps what it saved
  Given a Member's account is suspended
  When the account is enabled again
  Then their Favorites and Profile are as they were

Scenario: The Profile is optional
  Given a Member has never edited their Profile
  When they use the platform
  Then nothing demands they complete it
  And every capability remains available

Scenario: The display name stays private
  Given a Member has set a display name
  When any other person views any public surface
  Then the display name appears nowhere
```

---

## 10. Accepted Deferrals

- **The two numbers** — how many Favorites a Member may hold — are product
  decisions to be recorded in the Story that implements this, not here.
- **Notifications** about a saved Offering's price or availability are outside
  V1 and outside this document.
- **Members publishing their own Offerings** was raised by the Owner on
  2026-08-31 as a later capability. It is deliberately absent: an Offering
  belongs to a Business today (PRD-0005), and letting a Member hold one is a
  change to what an Offering *is* rather than an addition to the Member Area.
