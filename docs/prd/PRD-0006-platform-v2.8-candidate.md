# PRD-0006 — Platform

> **Draft Note (2.8):** This is a **candidate** and carries no authority.
> **Frozen v2.7 remains the baseline** until the Owner approves and, separately,
> freezes this revision.
>
> **Revision Note (2.8):** Superseding revision of Frozen v2.7, begun
> independently at Draft under `DOCUMENT_LIFECYCLE.md` §7. **One word in §22.2,
> and the word is "Creating".**
>
> **This corrects a defect introduced in v2.7, by me, and found the next day
> while writing the schema the row governs.** `PRD-0009` **Frozen v0.4** §13.8
> names five acts — _"Creating, publishing, revising, re-checking and
> withdrawing"_ — and the row added to §22.2 in v2.7 names four. "Creating" was
> dropped when the amendment was drafted in `PRD-0009` §14, and both documents
> were frozen with the discrepancy in them.
>
> **It was not a harmless difference.** §22.2 says of itself that the list is
> exhaustive and that _"An Admin act that is not on it is not recorded"_, so the
> two available readings each contradicted a Frozen document: record the
> creation and §22.2 is wrong about what is recorded; do not record it and
> §13.8 is wrong about what reaches the trail. There was no third reading in
> which both documents were true.
>
> **The Owner decided on 2026-09-09 that all five are recorded**, and the reason
> is the one §22 was written around: under-recording is the failure this section
> exists to prevent, and over-recording harms nobody. The implementation carries
> five `AdminAuditAction` values from `I93` onward; this revision makes the
> document say what the platform does.
>
> **Nothing else changes.** Not §22.1, not §22.3's append-only enforcement, not
> §22.4's retention, not §22.5's exclusion, not §22.6's reading surface, not
> §22.8's Acceptance Criterion — which reads _"an act listed in §22.2"_ and
> therefore covers the corrected row without amendment, as it covered the
> original one.
>
> **Why a whole revision for one word.** Because §22.2 declares its own list
> exhaustive and makes adding to it a revision of the section, in those words. A
> repository that edited the row quietly would be one where that sentence had
> stopped meaning anything.

> **Freeze Note (2.7):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-08, **first in a four-step order the Owner set out in the same
> message** — this document, then `PRD-0009` v0.4, then the registry's authoring
> Feature, then the Story. This exact version must not be edited in place; a
> further change requires a controlled revision under `DOCUMENT_LIFECYCLE.md`
> §7–§8. Frozen v2.6 is preserved unchanged at
> `PRD-0006-platform-v2.6-superseded.md`.
>
> **Approval Note (2.7):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-08 — _"PRD-0009 v0.4-candidate ve PRD-0006 v2.7
> taslaklarını resmi olarak onaylıyorum. Belgeleri derhal dondur (Freeze)."_
> Approval and Freeze were taken in one decision, and the Owner restated the
> order they run in.
>
> **What the Owner approved, stated precisely, because no separate v2.7 candidate
> file was ever put in front of him.** The amendment below was written verbatim
> in `PRD-0009` **v0.4-candidate §14** and approved as part of that text - which
> was deliberate and is recorded in §14's own words: the amendment was stated
> there — _"so that the second candidate is mechanical rather than a fresh
> design"_. This revision adds that row and changes nothing else. A reader who
> wants to see what was approved should read §14 of `PRD-0009` v0.4; a reader who
> wants to see what changed here should read the one row.
>
> **Revision Note (2.7):** Superseding revision of Frozen v2.6, begun
> independently at Draft under `DOCUMENT_LIFECYCLE.md` §7.
>
> **One row in §22.2, and the reason it could not be left out.** §22.2's opening
> sentence is _"Every act by which an Admin changes something"_, and its closing
> sentence is _"This list is exhaustive and adding to it is a revision of this
> section."_ Writing, publishing, re-checking and withdrawing an editorial review
> are acts by which an Admin changes something. Without this row the two
> sentences of one Frozen document would disagree, and the platform would be
> promising **not** to record acts it also promises to record. That is why
> `PRD-0009` could not be frozen first.
>
> **Nothing else changes, and each of those is a deliberate finding rather than
> an omission:**
>
> - **§22.3** (append-only at the database) already covers these entries, because
>   it constrains the trail rather than the acts that reach it.
> - **§22.5** (the platform administrator alone reads it) is unchanged and
>   applies. An editor tier, if one is ever designed, would be an Admin whose
>   acts are recorded and who still may not read the trail.
> - **§23** (no personal data on operational surfaces) applies unchanged: an
>   entry names the acting account as an identifier, never a person, and the
>   published byline is a different fact entirely — `PRD-0009` §13.2 draws that
>   line.
> - **§22.8's Acceptance Criterion** reads _"an act listed in §22.2"_ rather than
>   naming acts, so it covers the new row without amendment. This was checked
>   rather than assumed.
> - **§16** carries no Acceptance Criterion that enumerates recorded acts. Also
>   checked.
>
> **Reading a review records nothing** — by an Admin or by anyone else. It is
> published content, not an act on a target, and §22.5's own rule that reading
> the trail is unrecorded is the same reasoning.

> **Freeze Note (2.6):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-07. This exact version must not be edited in place; a further
> change requires a controlled revision under `DOCUMENT_LIFECYCLE.md` §7–§8.
> Frozen v2.5 is preserved unchanged at `PRD-0006-platform-v2.5-superseded.md`.
>
> **Approval Note (2.6):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-06 — _"Hazırladığın PRD-0006 v2.6, Registry v1.3
> ve US-PLT-F13-001 taslaklarını resmi olarak onaylıyorum."_
>
> **Amendment after approval, on the Owner's instruction in the same message.**
> The approved text carried §22 without a description of the surface that reads
> the trail. In the same message the Owner allocated `F14` for that surface and
> asked for it before the Freeze: _"Kesinlikle F14'ü (Denetim İzi Okuma Yüzeyi)
> açıyoruz… Bu belgeleri dondurmadan önce, Registry v1.3 taslağına F14'ü dahil
> etmeni ve `US-PLT-F14-001` … Story'sini oluşturmanı rica ediyorum."_ **§22.6
> and the seven Acceptance Criteria that follow from it were written after the
> approval and are Frozen with it.** They are recorded here rather than folded
> in silently, because a Freeze Note that did not say so would make an approval
> cover text the Owner had not read.
>
> **Revision Note (2.6):** Superseding revision of Frozen v2.5, begun
> independently at Draft under `DOCUMENT_LIFECYCLE.md` §7.
>
> **Three additions, all of them commissioned by the Owner on 2026-09-06** after
> `traceability.md` v2.2 §5C.2 recorded that they were built and owned by
> nothing: _"Platformun en kritik kalkanlarının (denetim izi, kişisel veri
> koruması, feed yönetimi) sohbet geçmişine ve kod satırlarına emanet edilmesine
> izin veremeyiz."_
>
> | New                                     | What it does                                                                                                                                                                                                        |
> | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | **§22 Admin Audit Trail**               | Makes the trail a binding commitment rather than an implementation detail: what is recorded, that it is append-only **at the database**, that it is never swept, and that it is closed to any future Sub-Admin tier |
> | **§23 Personal Data on Admin Surfaces** | States the Owner's rule of 2026-09-04 as a **Security Requirement**: no address on any operational surface, revealed only by a deliberate act on one case, and that act recorded in §22's trail                     |
> | **§22.6 Reading the trail**             | Added after the Owner's approval of 2026-09-06, on his instruction in the same message: `F14` is allocated for the reading surface, and a Feature needs a section that describes what it is                         |
> | **§24 Feed Management**                 | The behaviour owner for the Admin surface that registers a partner feed, holds its mapping, pauses it and reads its runs — Feature `F13`                                                                            |
>
> **What it does not change.** No lifecycle state, no moderation action, no
> eligibility composition, no Capability, no ownership boundary, and no existing
> section's meaning. §12's exhaustive list gains two entries because two of the
> three additions are places where platform-owned operational rules live, and
> §12 is precisely the section that fails when that is forgotten — as it did
> once already, recorded in its own text.
>
> **The behaviour was built first, again, and that is recorded rather than
> tidied.** The audit trail shipped in `I83`, its reading surface in `I84`, its
> extension to affiliate acts in `I87`; the disclosure rule in `I82`; feed
> management in `I76`. This revision is written from the requirement, and where
> it disagrees with what exists, the document wins and the code changes.

> **Freeze Note (2.5):** Explicitly Frozen by the Product Owner / Architecture
> Owner on 2026-09-03, together with `PRD-0001-offering.md` v4.1. This exact
> version must not be edited in place; a further change requires a controlled
> revision under `DOCUMENT_LIFECYCLE.md` §7–§8. Frozen v2.3 is preserved
> unchanged at `PRD-0006-platform-v2.3-superseded.md`, and Draft v2.4 — which
> was never Frozen — at `PRD-0006-platform-v2.4-candidate.md`, because a
> candidate that was superseded before Freeze is still evidence of what was
> proposed and when.
>
> **Approval Note (2.5):** Explicitly approved by the Product Owner /
> Architecture Owner on 2026-09-03 — _"Gösterimi olmayan ilanın oranını '%0'
> yerine 'Yok (Null)' olarak tanımlaman veri okuryazarlığı açısından çok
> isabetli. CTR'ın Discovery (sıralama) algoritmasını kesinlikle etkilememesi
> kuralı da platformun güvenilirliğini koruyor… taslaklarını resmi olarak
> onaylıyorum."_ Approval and Freeze were separate decisions taken on the same
> day.
>
> **Revision Note (2.5):** Superseding revision of Draft v2.4, begun under
> `DOCUMENT_LIFECYCLE.md` §7.
>
> **v2.4 is superseded before it was Frozen, and that is deliberate.** Freezing
> v2.4 and then immediately revising it would put two decisions in front of the
> Owner where one will do, and would leave a Frozen version whose only life was
> a few hours. v2.5 carries everything v2.4 carried, with two changes.
>
> **(a) §21.5's retention period is decided rather than proposed.** The Owner
> took the decision on 2026-09-03: _"Önerdiğin 180 gün kuralını onaylıyorum.
> Altı ay, yasal veya operasyonel bir itirazı geçmişe dönük incelemek için
> fazlasıyla yeterli ve makul bir veri tutma süresidir."_ The section now states
> the rule instead of asking for it, and records who decided and when.
>
> **(b) §11.2 gains one indicator: Affiliate Handoff Rate.** The Owner asked for
> per-link click-through reporting, and asked for this revision by name —
> _"analitik kapsamına CTR metriğini resmi olarak dahil edecek revizyon
> taslağını da eşzamanlı olarak hazırla"_ — because §11.2's inventory is a
> closed list and a Story may not widen it.
>
> **Three things make this a small change rather than a new capability**, and
> each is stated in §11.6 so that a later reader does not have to reconstruct
> them:
>
> - it **measures nothing new**. Both terms are occurrences §11.2 already counts:
>   `Offering Presentation Open` (PRD-0001) and `Affiliate Handoff Completion`
>   (PRD-0004). No event is added, no counter is created, and nothing is recorded
>   about a person;
> - it is **not advertising reporting**. §20.5 excludes impression, click,
>   revenue and fill-rate reporting for advertising, and that exclusion is
>   unchanged. An Affiliate Handoff is not an advertisement: it is a person
>   choosing to go to a seller they were comparing, and §11.2 has counted it
>   since v1.0;
> - it **may not reach Discovery**. A rate that could order Results would be
>   ranking by commercial performance, which PRD-0002 forbids outright and §20.3
>   forbids for advertising. §11.6 says so, and §11.5's action-handoff boundary
>   already forbids Analytics from acting.

- **Owner:** Product Owner / Architecture Owner
- **PRD ID:** PRD-0006
- **Title:** Platform
- **Status:** Draft
- **Version:** 2.8
- **Approval Date:** Not approved
- **Approved By:** —
- **Freeze state:** Not frozen
- **Freeze Date:** —
- **Frozen By:** —
- **Supersedes:** Nothing yet. **Frozen v2.7 remains the baseline** and would be
  preserved at `PRD-0006-platform-v2.7-superseded.md` only if this candidate is
  approved and, separately, frozen
- **Raised by:** a defect in v2.7's own §22.2 row, found on 2026-09-09 while
  implementing `I93`; the Owner's decision of the same day
- **Supersedes:** Frozen v2.6, preserved at `PRD-0006-platform-v2.6-superseded.md`
- **Raised by:** `PRD-0009` v0.4-candidate §14, approved by the Owner on 2026-09-08
- **Supersedes:** Frozen v2.5, preserved at `PRD-0006-platform-v2.5-superseded.md`
- **Raised by:** Owner commission of 2026-09-06, recorded in `traceability.md`
  Frozen v2.2 §5C.2
- **Supersedes:** Frozen v2.3, preserved at `PRD-0006-platform-v2.3-superseded.md`; Draft v2.4, preserved at `PRD-0006-platform-v2.4-candidate.md`
- **Supersedes:** Frozen v2.2, preserved at `PRD-0006-platform-v2.2-superseded.md`
- **Supersedes:** Frozen v2.1 (preserved at `PRD-0006-platform-v2.1-superseded.md`)
- **Approval Date:** 2026-08-31
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-08-31
- **Frozen By:** Product Owner / Architecture Owner
- **Last Updated:** 2026-07-21
- **Scope level:** Product behaviour (non-technical)

> **Freeze Note (2.2):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-08-31, simultaneously with the other three documents of this decision, because a Freeze of any subset would reintroduce the contradiction these revisions exist to prevent. This exact version must not be edited in place; a further change requires a controlled revision under `DOCUMENT_LIFECYCLE.md` §7–§8. Frozen together: `PRD-0002-discovery.md` v2.4, `PRD-0005-business.md` v1.4, `PRD-0006-platform.md` v2.2, and `PRD-0007-member-area.md` v1.0. This Freeze does not change Delivery Status, traceability, repository indexes, or GitHub content.
>
> **Approval Note (2.2):** Explicitly approved by the Product Owner / Architecture Owner on 2026-08-31. The four were approved together because they state one decision between them: advertising is permitted in three named regions and nowhere else, Favorites and the Member Profile become a capability the platform owns, and Results are delivered a page at a time. Approving a subset would have left a document forbidding what another permits — the defect the 2026-08-31 Discovery Start round was spent removing. This Approval Note records that approval and Freeze were separate decisions.
>
> **Revision Note (2.2):** Controlled superseding revision of Frozen
> v2.1, opened by Owner decision of 2026-08-31 to permit **externally served
> advertising in three named regions** and to give an Admin the settings that
> configure it.
>
> §4 excluded _"billing, payments, subscriptions, CRM, advertising, or
> transaction processing"_ as one line. That line bundles six things and only
> one is being reconsidered: the platform still takes no payment, issues no
> invoice, holds no subscription and runs no CRM. **Advertising is separated out
> and bounded**, because a blanket word in an exclusion list cannot express
> "yes here, no there" — and "yes here, no there" is the whole of the decision.
>
> Three things that sound like advertising stay excluded and are now named
> individually rather than covered by one word: the platform does not **sell**
> advertising, does not **moderate** advertising creative, and does not
> **report** advertising performance. An external network does all three. What
> the platform owns is _where_ advertising may appear and _whether_ it appears
> at all — and both are settings, which is why they belong to PRD-0006.
>
> **What stays excluded, and it is most of it.** Sponsored, paid or promoted
> _ordering_ remains forbidden — an advertiser may buy a region of the page and
> may not buy a position in the Results. Advertising may not read, receive or
> influence a Discovery path, a Comparison Set, a Decision Chat, or any
> protected contact information. No advertising appears on Home, in Decision
> Chat, in the comparison table, or in a Zero Results statement.
>
> §20 is new and is the only section added. It is appended rather than
> inserted, because renumbering nineteen sections would break every
> reference in the repository to make room for one.

- **Supersedes:** Approved v1.0
- **Approved candidate:** In Review v2.1
- **Approval Date:** 2026-07-21
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-07-21
- **Frozen By:** Product Owner / Architecture Owner

> This document is the Single Information Owner of Platform product behaviour: the action-oriented Admin Panel, general moderation cases and action surfaces, Affiliate Destination Administration action surfaces, Category Management, Attribute Management, and Admin-facing Basic Analytics. It consumes User Account, Business, Offering, Affiliate Destination, and Completion outcomes from their owning PRDs. It defines no technical provisioning mechanism, moderation-detection algorithm, analytics instrumentation, metric query, identity-provider mechanism, API, database, storage, security implementation, frontend component, backend service, audit-log implementation, logging system, monitoring system, or infrastructure.

**Freeze Note (2.1):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-21. Frozen v2.1 is the locked V1 PRD baseline for PRD-0006 — Platform. This exact version must not be edited in place. Any future change requires a controlled revision under `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, and, where architecture is affected, `ADR_PROCESS.md`. This Freeze does not automatically revise UX, User Stories, traceability, repository indexes, or GitHub content.

**Approval Note (2.1):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-21 after Architecture Review, Final Review, package-level reconciliation, independent Claude audit, and all bounded audit corrections. Approved v2.1 supersedes Approved v1.0 and is the authoritative PRD baseline for PRD-0006 — Platform. This historical Approval Note records that approval and Freeze were separate decisions. The PRD was subsequently Frozen on 2026-07-21. No UX, User Story, traceability, or GitHub file changes automatically.

**Revision Note (2.1):** Controlled post-Claude correction applying accepted Owner Decision A-05 Option B. Defines Platform enforcement and re-review for the bounded correction-edit path available to the authorized owner of a Restricted Business when an Open Request Correction case targets exact Published/Hidden Offering content. Preserves the seven-action General Moderation set, target states, restriction, public ineligibility, lifecycle, and no-Messaging boundary.

**Revision Note (2.0):** Controlled post-approval Freeze-correction candidate applying Owner Decisions P-03, P-04, P-05, and P-06. Defines Open/Closed moderation-case status and close behaviour, aligns Request Correction targets, derives Affiliate Destination workload categories, adds V1 Domain management and inheritance rules, corrects Category retirement for Archived history, completes the Attribute definition/value-kind and mutation-safety contract, and consumes Discovery Start Domain, Offering Presentation Open, and immutable publication recency from their owning PRDs. Preserves the seven-action General Moderation set and the separate four-action Affiliate Destination Administration family. Status remains In Review v2.0. Approved v1.0 remains authoritative until explicit approval.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-21 after Architecture Review and Final Review verdict `PASS — READY FOR OWNER APPROVAL`. Approved v1.0 becomes the authoritative product-behaviour source for the action-oriented Admin Panel, General Moderation, Affiliate Destination Administration, Category Management, Attribute Management, and Admin-facing Basic Analytics. It preserves target-owned outcomes, Owner-only Admin provisioning and Admin-authorized-account suspension boundaries, Frozen F06/F07 supporting relationships, and the absence of a standalone generic Platform Settings area. It is not Frozen. Freeze requires a separate Product Owner / Architecture Owner decision.

**Revision Note (0.3):** Controlled correction of In Review v0.2 following the independent Cross-PRD Architecture Audit and explicit Owner Decisions D-04, D-05, D-06, D-07, D-15/D-16, D-21, and D-22. Closes the Admin-reachability blocker; consumes Admin baseline inheritance from Identity; replaces unresolved moderation outcomes with the exact seven-action V1 general moderation set and target-owned effects; preserves the Owner-only restriction for suspending Admin-authorized accounts; introduces the separate four-action Affiliate Destination Administration family under Frozen Handoff Enablement Features F06/F07; defines Category and Attribute management actions consistent with Approved PRD-0001 v2.1; defines the minimum Admin Basic Analytics inventory and Completion consumption; removes the standalone generic Platform Configuration deliverable; closes the prior open questions on Admin provisioning, moderation actions, Category and Attribute management, Affiliate Destination administration, Completion analytics, and configuration inventory. Approved v1.0 is authoritative from 2026-07-21. No other repository document changes automatically.

---

## 1. Purpose

Platform defines how authorized Admins operate and protect the product after Users, Businesses, Offerings, and applicable content exist.

Platform provides:

- an action-oriented Admin Panel;
- post-creation general moderation;
- Affiliate Destination Administration;
- Category Management;
- Attribute Management;
- Admin-facing Basic Analytics.

Platform consumes:

- User Account access status, Admin authorization, and Admin-context entry from `PRD-0003-identity.md`;
- Business Moderation Status and Business Public Exposure Input from `PRD-0005-business.md`;
- Offering lifecycle, final Offering Public Eligibility, Category and Attribute concepts, and Affiliate Destination outcomes from `PRD-0001-offering.md`;
- Discovery activity from `PRD-0002-discovery.md`;
- Compare, Decision Chat, Affiliate Handoff, Direct Contact, and Completion results from `PRD-0004-decision.md`;
- Handoff Enablement structure from Frozen `OFFERING_CAPABILITY_ARCHITECTURE.md`.

Platform does not replace those owners.

---

## 2. Business Value

Platform allows the product to operate safely without turning administration into a pre-participation gate.

It supports the Foundation by:

- allowing Users, Businesses, and Offerings to exist before moderation;
- guiding Admins toward concrete work rather than reports alone;
- applying only approved outcomes owned by the affected product domain;
- managing Categories and Attributes as shared metadata;
- providing bounded operational visibility through Basic Analytics;
- preserving one universal administration model across Mobility, Real Estate, and Technology;
- keeping technical implementation outside the PRD layer.

Platform succeeds when an authorized Admin can:

1. understand the current operational state;
2. identify work requiring attention;
3. select an approved action;
4. apply the target-owned outcome;
5. manage shared metadata without redefining downstream behaviour.

---

## 3. Scope

V1 Platform includes:

- an Admin Panel available only in an authorized Admin context;
- an operational overview combining action guidance and Basic Analytics;
- general moderation cases for Users, Businesses, Offerings, and applicable Business contact information;
- the exact seven-action V1 general moderation action set;
- enforcement of target restrictions for Suspend User and Reinstate User;
- the separate four-action Affiliate Destination Administration family;
- Category definition creation, rename, hierarchy management, and retirement;
- Attribute definition creation and editing;
- Attribute-to-Category applicability management;
- management of the approved Attribute properties:
  - required for publication;
  - filterable;
  - comparable;
- Admin-facing Basic Analytics;
- Advertising Placement Settings (§20);
- Listing Reports and their review (§21);
- consistent Platform behaviour across Mobility, Real Estate, and Technology.

The Admin Panel must combine visibility with action.

Basic Analytics supports Admin decisions but does not perform moderation or management automatically.

---

## 4. Out of Scope

The following are outside PRD-0006:

- prior Admin approval for User Account, Business, Offering, or Affiliate Destination authoring;
- redefining User Account access status;
- redefining Admin authorization;
- granting or removing Admin authorization through the Admin Panel;
- a separate Admin identity type;
- self-service or delegated Admin provisioning;
- granular Admin tiers or role management;
- redefining Business Moderation Status;
- redefining Offering lifecycle;
- redefining final Offering Public Eligibility;
- redefining Affiliate Destination status, validation meaning, or Handoff Eligibility;
- Offering Archive or Archived restore by Admin;
- autonomous moderation;
- AI agents;
- recommendation systems;
- advanced analytics;
- predictive analytics;
- Business-facing analytics;
- custom report builders;
- billing, payments, subscriptions, CRM, or transaction processing;
- selling, brokering, pricing, invoicing, or reconciling advertising — the platform configures an external network and does not run an advertising business;
- advertising creative review, approval, or moderation, which belongs to the external network;
- advertising performance reporting, revenue reporting, or attribution;
- affiliate-network integration, attribution, commission, settlement, or external conversion tracking;
- in-platform Messaging or a Business inbox;
- message moderation;
- replying to, notifying, or corresponding with the person who sent a Listing Report;
- forwarding a Listing Report to the Business or the partner it concerns;
- any Listing Report count entering Discovery ordering, an indicator inventory, or a public surface;
- user impersonation;
- permanent Category deletion;
- Category merge or automated replacement;
- permanent Attribute deletion;
- Attribute merge, replacement, or lifecycle states;
- a standalone generic Platform Configuration or Settings capability;
- technical provisioning;
- identity-provider configuration;
- moderation-detection implementation;
- analytics instrumentation or metric calculation implementation;
- audit-log implementation;
- API, database, storage, frontend, backend, security, logging, monitoring, deployment, or infrastructure;
- any V2 or excluded capability in `V1_SCOPE.md`.

A capability or setting does not enter V1 merely because an Admin interface could theoretically expose it.

---

## 5. Core Concepts

### 5.1 Admin context

An authenticated operating context available only when Identity confirms Admin authorization.

Admin authorization attaches to an existing User Account.

Admin context inherits the Guest and authenticated User baseline defined by Identity but grants no automatic Business ownership.

### 5.2 Admin Panel

The working surface combining:

- operational visibility;
- items requiring attention;
- approved moderation and administration actions;
- Category and Attribute management;
- Basic Analytics.

### 5.3 Moderation case

The Admin-facing representation of an existing approved target requiring review or an approved action.

Authoritative V1 case statuses:

```text
Open
Closed
```

Rules:

- surfacing or opening a case produces Open;
- opening or reviewing changes no target state;
- Request Correction keeps the case Open until re-review;
- an Admin may close after an approved action or a no-action decision;
- closing creates no target state, lifecycle, access, moderation, or eligibility result.

Case status is a Platform workflow result and not a lifecycle or access state of the target.

### 5.4 General Moderation

The exhaustive V1 action family defined by D-15/D-16:

```text
Request Correction
Hide Offering
Restore Offering
Restrict Business
Restore Business
Suspend User
Reinstate User
```

### 5.5 Affiliate Destination Administration

A separate action family defined by D-21:

```text
Review Affiliate Destination
Validate Affiliate Destination
Enable Affiliate Destination
Disable Affiliate Destination
```

These actions are not additions to General Moderation.

### 5.6 Category definition

Shared metadata organizing Offerings and deriving V1 Domain association.

`PRD-0001-offering.md` owns the Category product concept, Offering association, historical association, and Domain derivation meaning.

Platform owns authorized management actions over Category definitions, including root Domain assignment.

V1 Domain values:

```text
Mobility
Real Estate
Technology
```

### 5.7 Attribute definition

Shared metadata describing Offerings.

Every V1 definition includes:

- non-empty display name;
- value kind;
- applicable Categories;
- required-for-publication flag;
- filterable flag;
- comparable flag.

V1 value kinds:

```text
Text
Number
Boolean
Single Select
Multi Select
```

Additional definition properties:

- Number may define one optional governed unit label;
- Single Select and Multi Select require governed allowed values.

`PRD-0001-offering.md` owns the meaning of Offering Attribute values.

Platform owns definition management and mutation-safety enforcement.

### 5.8 Basic Analytics

Bounded Admin-facing product visibility into:

- current platform state;
- operational workload;
- core-flow activity;
- approved Completion results.

Basic Analytics is not instrumentation, advanced analytics, or autonomous action.

---

## 6. Admin Authorization and Context Rules

### 6.1 Authorization attachment

Admin authorization attaches to an existing authenticated User Account.

V1 introduces no separate Admin account or operator identity.

### 6.2 Provisioning authority

Only the Product Owner / Architecture Owner may decide to:

- establish the first Admin;
- grant Admin authorization;
- remove Admin authorization.

The decision is carried out through a controlled operational process outside the PRD layer.

### 6.3 Admin Panel boundary

The V1 Admin Panel does not provide:

- grant Admin;
- remove Admin;
- transfer Admin;
- delegate Admin;
- manage Admin tiers;
- self-service Admin provisioning.

Holding Admin authorization does not grant authority to provision another Admin.

### 6.4 Baseline inheritance

An Admin-authorized account retains ordinary authenticated User behaviour.

Admin-specific Platform behaviour is available only in Admin context.

Admin authorization does not grant:

- ownership of a Business;
- Business-management authority without the normal Business relationship;
- authority to act through an unrelated Business context.

### 6.5 Suspension boundary for Admin-authorized accounts

An ordinary Admin may suspend or reinstate a non-Admin-authorized User Account.

An ordinary Admin may not suspend or reinstate a User Account carrying Admin authorization.

Only the Product Owner / Architecture Owner may suspend or reinstate an Admin-authorized User Account.

Suspension does not remove Admin authorization.

Platform must reject an unauthorized attempt to target an Admin-authorized account.

---

## 7. General Moderation

### 7.1 Moderation principles

1. Moderation occurs only after the target exists.
2. Opening or reviewing a case changes no target state.
3. Platform presents and applies only approved actions.
4. The target-owning PRD owns the resulting state and consequences.
5. Platform invents no User, Business, Offering, or eligibility state.
6. General Moderation is separate from Affiliate Destination Administration.
7. Request Correction must not create Messaging.

### 7.2 Action-to-outcome map

| Platform action    | Target                                                                                                     | Outcome owner                             | Approved product result                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Request Correction | Business Information, Offering content, Affiliate Destination configuration, or Direct Contact information | PRD-0005 notice; applicable content owner | No lifecycle, moderation-status, access-status, or eligibility change by itself; case remains Open |
| Hide Offering      | Published Offering                                                                                         | PRD-0001                                  | `Published → Hidden`                                                                               |
| Restore Offering   | Hidden Offering                                                                                            | PRD-0001                                  | `Hidden → Published`                                                                               |
| Restrict Business  | Unrestricted Business                                                                                      | PRD-0005                                  | `Unrestricted → Restricted`; lifecycle-Published Offerings lose public eligibility                 |
| Restore Business   | Restricted Business                                                                                        | PRD-0005                                  | `Restricted → Unrestricted`; only lifecycle-Published Offerings may regain public eligibility      |
| Suspend User       | Enabled non-Admin-authorized User Account                                                                  | PRD-0003                                  | `Enabled → Suspended`                                                                              |
| Reinstate User     | Suspended non-Admin-authorized User Account                                                                | PRD-0003                                  | `Suspended → Enabled`                                                                              |

User Account correction is outside V1.

For an Admin-authorized User Account, Suspend User and Reinstate User are reserved to the Product Owner / Architecture Owner and are unavailable to an ordinary Admin.

Case closure is a separate Platform workflow operation and does not expand the seven-action General Moderation set.

### 7.3 Request Correction, bounded correction edit, and case closure

Request Correction:

- applies only to the approved Business-owned target set;
- records that correction is required through the approved Admin experience;
- keeps the General Moderation Case Open;
- changes no target status by itself;
- changes no eligibility result by itself;
- creates no in-platform conversation, inbox, ticket discussion, or reply workflow.

### 7.3.1 Restricted Business bounded correction-edit path

Where Request Correction targets Offering content owned by a Restricted Business, Platform makes the bounded path available only when:

```text
General Moderation Case = Open
AND
Request Correction target = Offering content
AND
target Offering lifecycle = Published or Hidden
AND
acting User = authorized owner of the owning Business
```

Platform restricts the path to:

- the exact Offering identified by the correction notice; and
- the exact targeted content area.

Platform must deny:

- creation of a new Offering;
- publication of a Draft Offering;
- editing of another Published or Hidden Offering;
- editing of an untargeted content area;
- any Offering lifecycle change through the correction path;
- any Business Moderation Status change through the correction path;
- any Business Public Exposure Input change through the correction path;
- any public-eligibility restoration through the correction path;
- automatic case closure;
- Messaging, inbox, conversation, ticket discussion, or reply behaviour.

The correction save must preserve the PRD-0001-owned Universal Publication Minimum.

The case remains Open after the owner edit.

Platform re-review is required.

### 7.3.2 Re-review and closure

After re-review, an Admin may close the case when:

- an approved action has been applied; or
- the Admin records a no-action decision.

Closing a case changes no target state.

The bounded correction-edit path is not an eighth General Moderation action. It is the constrained owner response to Request Correction.

### 7.4 Offering actions

Platform may:

```text
Published → Hidden
Hidden → Published
```

Platform may not:

- archive an Offering;
- restore an Archived Offering;
- return Hidden to Draft;
- publish a Draft on behalf of the Business.

### 7.5 Business actions

Restrict Business and Restore Business apply the Business-owned moderation status.

Platform does not alter individual Offering lifecycle states when Business restriction changes.

### 7.6 User actions

Suspend User and Reinstate User apply the Identity-owned access status.

Suspending a User does not automatically:

- restrict a Business;
- hide an Offering;
- archive an Offering;
- change public eligibility.

Separate Business or Offering actions are required where public restriction is intended.

### 7.7 Direct Contact oversight

Platform may:

- review Business-owned contact information;
- request correction;
- apply an approved visibility outcome through the applicable Business or Offering moderation action.

Platform does not own:

- telephone, email, or external contact URL authoring;
- Direct Contact handoff;
- external communication;
- Messaging.

---

## 8. Affiliate Destination Administration

### 8.1 Capability relationship

Affiliate Destination Administration supports Frozen Handoff Enablement.

Structural Features:

```text
F06 — Affiliate Destination Configuration
F07 — Affiliate Destination Eligibility Governance
```

`PRD-0001-offering.md` remains the sole Handoff Enablement behaviour owner.

PRD-0006 provides only the supporting Admin action surface.

### 8.2 Action family

```text
Review Affiliate Destination
Validate Affiliate Destination
Enable Affiliate Destination
Disable Affiliate Destination
```

### 8.3 Action effects consumed from PRD-0001

| Action                         | PRD-0001-owned product result                                                                 |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| Review Affiliate Destination   | No status, validation, or Handoff Eligibility change by itself                                |
| Validate Affiliate Destination | Produces `Valid` or `Invalid`; status unchanged                                               |
| Enable Affiliate Destination   | Requires `Valid`; produces `Enabled` and Handoff Eligibility `Eligible`                       |
| Disable Affiliate Destination  | Produces `Disabled` and Handoff Eligibility `Ineligible`; current validation result preserved |

PRD-0006 does not define or modify:

- Affiliate Destination status values;
- validation meaning;
- Affiliate Destination Handoff Eligibility composition;
- final Offering Public Eligibility.

### 8.4 Separation from General Moderation

Affiliate Destination Administration:

- is not part of the seven-action General Moderation set;
- is not automatically represented as a General Moderation Case;
- uses the derived work queue below;
- may have distinct analytics;
- does not change Offering lifecycle, Business Moderation Status, or User Account access status.

### 8.5 Derived workload

| PRD-0001-owned result | Platform workload category |
| --------------------- | -------------------------- |
| Draft + Not Validated | Needs Validation           |
| Draft + Invalid       | Business Correction Needed |
| Draft + Valid         | Ready to Enable            |
| Enabled               | No pending item            |
| Disabled              | No pending item            |

`Business Correction Needed` may be surfaced through the PRD-0005 Business Dashboard correction notice.

No Messaging is created.

The workload category is derived and does not create a new Affiliate Destination state.

---

## 9. Category and Domain Management

### 9.1 V1 actions

An authorized Admin may:

- create a root Category and assign exactly one V1 Domain;
- create a child Category;
- rename a Category;
- change a Category's parent where the result remains a valid hierarchy and the same Domain;
- retire a Category when retirement conditions are satisfied.

### 9.2 Hierarchy and Domain rules

- a Category has zero or one parent;
- a Category with no parent is a root Category;
- a Category cannot become its own ancestor;
- every root Category has exactly one Domain;
- child Categories inherit their root Domain;
- an Offering may be assigned only to an active leaf Category;
- an Offering derives its Domain from that leaf Category;
- Category identity remains stable when its display name changes;
- reparenting across Domains is unavailable in V1;
- a root Domain assignment cannot change after any child Category or Offering exists beneath it.

### 9.3 Retirement rules

A Category may be retired only when:

- no Draft, Published, or Hidden Offering remains assigned; and
- no active child Category remains beneath it.

Archived Offerings may retain historical Category association and do not block retirement.

A retired Category:

- cannot receive new Offering assignments;
- does not appear as an active Browse destination;
- remains available as a historical definition for Archived records.

V1 provides no permanent deletion, merge, automated replacement, or cross-Domain migration.

## 10. Attribute Management

### 10.1 V1 actions

An authorized Admin may:

- create an Attribute definition;
- edit its non-empty display name;
- choose one V1 value kind;
- define one optional unit label for Number;
- define allowed values for Single Select or Multi Select;
- associate the Attribute with applicable Categories;
- remove future applicability where mutation-safety conditions permit;
- set whether the Attribute is required for publication;
- set whether the Attribute is filterable;
- set whether the Attribute is comparable.

### 10.2 Value-kind constraints

- Text is not filterable in V1.
- Number may define one unit label.
- Single Select and Multi Select require at least one governed allowed value.
- Definition changes may not silently reinterpret existing Offering values.

### 10.3 Mutation safety

`required for publication = true` may be enabled only when every Published and Hidden Offering in every applicable Category already has an authoritative value.

Removing Category applicability is blocked while any Draft, Published, or Hidden Offering in that Category contains a value for the Attribute.

Changing value kind is blocked while any Draft, Published, or Hidden Offering contains a value.

Removing or changing an allowed Select value is blocked while any Draft, Published, or Hidden Offering uses it.

Archived values remain historical and readable.

Existing Offering values are never silently deleted.

Changing `filterable` or `comparable` affects future Discovery or Compare presentation but does not change Offering lifecycle.

### 10.4 Ownership boundary

Platform manages definition properties and enforces the mutation-safety rules.

Consumers own behaviour:

- PRD-0001 owns Offering Attribute values and publication consequences;
- PRD-0002 owns Filter behaviour;
- PRD-0004 owns Compare behaviour.

### 10.5 V1 lifecycle boundary

V1 defines no permanent Attribute deletion, merge, replacement, deprecation state, or automated value migration.

## 11. Basic Analytics

### 11.1 Ownership and use

PRD-0006 owns the Admin-facing Basic Analytics product view.

Basic Analytics:

- provides operational visibility;
- supports action guidance;
- does not redefine source results;
- does not perform moderation or management automatically.

### 11.2 Minimum V1 inventory

The Admin Panel provides the following product indicators.

#### Current-state indicators

- User Accounts by `Enabled` and `Suspended`;
- Businesses by `Unrestricted` and `Restricted`;
- Offerings by `Draft`, `Published`, `Hidden`, and `Archived`;
- Offerings by final Offering Public Eligibility `Eligible` and `Ineligible`;
- Affiliate Destinations by `Draft`, `Enabled`, and `Disabled`;
- Affiliate Destinations by `Not Validated`, `Valid`, and `Invalid`;
- Affiliate Destinations by Handoff Eligibility `Eligible` and `Ineligible`;
- General Moderation cases by `Open` and `Closed`, including Open cases by approved target type;
- Affiliate Destination Administration workload by `Needs Validation`, `Business Correction Needed`, and `Ready to Enable`.

#### Core-flow activity indicators

- Discovery Starts, with Domain grouping where PRD-0002 supplies a Domain association;
- Offering Presentation Opens as defined by PRD-0001;
- Compare starts;
- Decision Chat starts;
- Affiliate Handoff Completion count;
- Direct Contact Completion count;
- **Affiliate Handoff Rate**, per Offering and overall (§11.6).

### 11.3 Completion consumption

PRD-0004 is the Single Information Owner of Completion.

Platform consumes:

```text
Affiliate Handoff initiated
→ Affiliate Handoff Completion

approved contact information revealed
AND external contact channel made available
→ Direct Contact Completion
```

Basic Analytics does not interpret Completion as purchase, sale, contract, response, or external transaction success.

### 11.6 Affiliate Handoff Rate

**What it is.** For one Offering, the number of Affiliate Handoff Completions
divided by the number of Offering Presentation Opens, over the selected period.
Overall, the same ratio across every Offering in the selection.

```text
Affiliate Handoff Rate = Affiliate Handoff Completion ÷ Offering Presentation Open
```

**Per link means per Offering.** PRD-0001 §9.1 gives an Offering zero or one
Affiliate Destination, so an Offering _is_ the link. There is no second level to
report at, and inventing one would mean counting something the platform does not
have.

#### 11.6.1 It adds no measurement

Both terms are occurrences this document already consumes and §11.2 already
counts. **No new event, counter, identifier or record is created**, and nothing
about a person is stored — which is why this is an addition to an inventory
rather than a new capability, and why §19's deferral of technical analytics
measurement is untouched.

#### 11.6.2 It is not advertising reporting

§20.5 excludes impression, click, revenue and fill-rate reporting for
advertising, **and that exclusion is unchanged.** An Affiliate Handoff is not an
advertisement: it is a person who was comparing sellers choosing to go to one,
and §11.2 has counted it since v1.0. The platform still sells no advertising,
prices none, moderates no creative and reports no advertising performance.

The distinction is worth stating because the two look alike from outside and are
governed oppositely. An advertisement is a placement somebody bought; an
Affiliate Handoff is the outcome of the comparison this platform exists to
provide.

#### 11.6.3 What it may never do

- **order, weight or mark anything in Discovery Results.** A rate that could
  move a listing would be ranking by commercial performance — forbidden by
  PRD-0002 for Results and by §20.3 for advertising, and no less forbidden for
  arriving through Analytics;
- appear on any public surface, or on a Business-facing one. §4 excludes
  Business-facing analytics and this is Admin-facing like every other indicator;
- be interpreted as purchase, sale, contract, response or external transaction
  success (§11.3);
- be reported where the denominator is zero. An Offering nobody has opened has
  **no rate**, and that is stated as _no rate_ rather than as `0%` — a zero
  would read as "nobody chose this" when the truth is "nobody has looked".

#### 11.6.4 Acceptance Criteria

```gherkin
Scenario: The rate is derived rather than measured
  Given Offering Presentation Opens and Affiliate Handoff Completions are counted
  When the Affiliate Handoff Rate is presented
  Then it is computed from those two counts
  And no additional event, counter or record exists to produce it

Scenario: An Offering nobody has opened has no rate
  Given an Offering with no Offering Presentation Open in the selected period
  When the Affiliate Handoff Rate is presented for it
  Then no rate is shown
  And the absence is stated as no rate rather than as zero

Scenario: The rate cannot move a listing
  Given Offerings with different Affiliate Handoff Rates
  When Discovery Results containing them are ordered
  Then the order is the product-defined order
  And no Offering is advanced, delayed or marked by its rate

Scenario: The rate stays inside the Admin surface
  Given an Affiliate Handoff Rate exists for an Offering
  When any public or Business-facing surface is presented
  Then the rate does not appear
```

### 11.4 Time and grouping

Minimum selectable periods:

```text
Today
Last 7 days
Last 30 days
All time
```

Indicators are shown:

- overall;
- by the derived Domain values `Mobility`, `Real Estate`, and `Technology` where the owning PRD supplies a Domain association.

Domain source rules:

- Offering and Offering-derived activity use the Domain derived from the Offering's active leaf Category;
- Browse Discovery Start uses the selected Category Domain;
- Search Discovery Start without a selected leaf Category has no Domain association and appears only in overall counts;
- Platform does not infer Domain from free-text query wording.

### 11.5 Action handoff

Where an indicator represents actionable workload, the Admin may open the relevant:

- moderation queue;
- Affiliate Destination Administration queue;
- Category Management area;
- Attribute Management area.

Informational core-flow indicators need not open an action.

---

## 12. No Standalone Platform Configuration

V1 has no standalone generic Platform Configuration or Settings deliverable.

Platform-owned operational rules are represented only through explicit approved behaviour in:

- General Moderation;
- Affiliate Destination Administration;
- Category Management;
- Attribute Management;
- Basic Analytics periods and groupings;
- Advertising Placement Settings (§20);
- Listing Reports (§21);
- Feed Management (§24).

The Admin Audit Trail (§22) is not on this list and is not a settings area: it
holds no setting, has no form, and offers reading only. Personal Data on Admin
Surfaces (§23) is a Security Requirement over every surface rather than a place
where operational rules live, so it is not on this list either. Both are named
here so that a reader who checks this list against the section numbers finds the
answer rather than a gap.

No Admin setting may introduce a new capability, role, state, action, metric meaning, or ownership boundary.

**This list is exhaustive and is the test.** A screen is permitted here when
every field on it is named by one of the sections above; it is the standalone
Settings area this section refuses when it accepts a key nobody wrote down. The
difference is not the number of fields — it is whether adding one requires a
decision. A settings store with an Admin form in front of it is precisely the
shape in which a new capability arrives without anybody agreeing to add it, and
that is what §12 exists to prevent.

**§24 was built before it was listed.** Feed Management shipped in `I76` on
2026-09-03 and this list did not name it until v2.6 — the same failure as the one
recorded below, two revisions later, and recorded the same way rather than
quietly repaired.

**§20 was missing from this list from 2026-08-31 until v2.3.** v2.2
added Advertising Placement Settings as a sixth place where platform-owned
operational rules live and did not add it here, so the document said "these
five" on one page and described a sixth on another. The omission is recorded
rather than silently repaired: it is the exact failure mode this section
describes — a capability arriving without the document that forbids ungoverned
capabilities noticing.

---

## 13. Permissions Matrix

Legend:

- `✓` — permitted;
- `✗` — not permitted;
- `Conditional` — permitted only when the target and action conditions are satisfied;
- `Owner only` — reserved to Product Owner / Architecture Owner.

| Action                                                     | Guest | User | Business | Ordinary Admin |                     Product Owner / Architecture Owner |
| ---------------------------------------------------------- | ----: | ---: | -------: | -------------: | -----------------------------------------------------: |
| Enter Admin Panel                                          |     ✗ |    ✗ |        ✗ |              ✓ |                                                      ✓ |
| View Admin action guidance                                 |     ✗ |    ✗ |        ✗ |              ✓ |                                                      ✓ |
| View Basic Analytics                                       |     ✗ |    ✗ |        ✗ |              ✓ |                                                      ✓ |
| Request Correction                                         |     ✗ |    ✗ |        ✗ |    Conditional |                                            Conditional |
| Hide Offering                                              |     ✗ |    ✗ |        ✗ |    Conditional |                                            Conditional |
| Restore Offering                                           |     ✗ |    ✗ |        ✗ |    Conditional |                                            Conditional |
| Restrict Business                                          |     ✗ |    ✗ |        ✗ |    Conditional |                                            Conditional |
| Restore Business                                           |     ✗ |    ✗ |        ✗ |    Conditional |                                            Conditional |
| Suspend non-Admin-authorized User                          |     ✗ |    ✗ |        ✗ |    Conditional |                                            Conditional |
| Reinstate non-Admin-authorized User                        |     ✗ |    ✗ |        ✗ |    Conditional |                                            Conditional |
| Suspend Admin-authorized User                              |     ✗ |    ✗ |        ✗ |              ✗ |                                             Owner only |
| Reinstate Admin-authorized User                            |     ✗ |    ✗ |        ✗ |              ✗ |                                             Owner only |
| Review / Validate / Enable / Disable Affiliate Destination |     ✗ |    ✗ |        ✗ |    Conditional |                                            Conditional |
| Manage Categories                                          |     ✗ |    ✗ |        ✗ |              ✓ |                                                      ✓ |
| Manage Attributes                                          |     ✗ |    ✗ |        ✗ |              ✓ |                                                      ✓ |
| Manage Advertising Placement Settings                      |     ✗ |    ✗ |        ✗ |              ✓ |                                                      ✓ |
| Submit a Listing Report                                    |     ✓ |    ✓ |        ✓ |              ✓ |                                                      ✓ |
| Read or review the Listing Report queue                    |     ✗ |    ✗ |        ✗ |              ✓ |                                                      ✓ |
| Grant or remove Admin authorization                        |     ✗ |    ✗ |        ✗ |              ✗ | Owner only through controlled operational provisioning |
| Use Messaging moderation                                   |     ✗ |    ✗ |        ✗ |              ✗ |                                                      ✗ |
| Use generic Platform Settings                              |     ✗ |    ✗ |        ✗ |              ✗ |                                                      ✗ |

Admin authorization does not grant automatic Business-management authority.

---

## 14. Product Flows

### 14.1 Admin entry

```text
Authenticated User Account
→ Identity confirms Admin authorization
→ Admin context becomes available
→ Admin Panel
```

### 14.2 General moderation

```text
Existing target
→ surfaced or selected for review
→ moderation case opened
→ Admin reviews
→ approved General Moderation action selected
→ target-owning PRD outcome applied
```

Restricted Offering-content correction:

```text
Open case
→ Request Correction targets exact Published/Hidden Offering content
→ authorized Restricted Business owner edits exact targeted area
→ Universal Publication Minimum remains satisfied
→ case remains Open
→ Admin re-reviews
→ approved action or no-action decision
→ optional case closure
```

### 14.3 Affiliate Destination Administration

```text
Affiliate Destination authored or edited by Business
→ Draft / Not Validated / Ineligible
→ Admin Review
→ Validate
→ Valid or Invalid
→ if Valid, Enable
→ Enabled / Eligible
```

### 14.4 Category Management

```text
Admin creates or edits Category
→ hierarchy rule checked
→ active Category available to Offering / Browse
```

Retirement:

```text
no Draft / Published / Hidden Offering
AND no active child
→ Retire Category
→ Archived historical associations remain renderable
```

### 14.5 Attribute Management

```text
Admin creates or edits Attribute definition
→ assigns applicable Categories
→ sets required / filterable / comparable properties
→ consuming PRDs use the definition by reference
```

### 14.6 Basic Analytics

```text
Admin opens operational overview
→ current-state and activity indicators shown
→ actionable workload identified
→ Admin opens applicable work area
```

---

## 15. Functional Requirements

### Admin access

1. Platform shall provide the Admin Panel only in an authorized Admin context.
2. Admin authorization shall attach to an existing User Account.
3. The Admin Panel shall not grant or remove Admin authorization.
4. Ordinary Admins shall not provision another Admin.
5. Admin context shall not grant automatic Business ownership.

### General Moderation

6. Platform shall provide exactly the seven General Moderation actions defined in §7.2.
7. Opening or reviewing a moderation case shall not change target state.
8. Each action shall apply only the target-owned outcome in §7.2.
9. Platform shall not archive an Offering or restore an Archived Offering.
10. Request Correction shall change no status by itself and shall create no Messaging workflow.
11. Ordinary Admins shall not suspend or reinstate Admin-authorized accounts.
12. Platform shall reject unauthorized targeting of an Admin-authorized account.
13. Suspension shall not automatically restrict a Business or hide an Offering.

### Affiliate Destination Administration

14. Platform shall provide the four actions defined in §8.2.
15. Affiliate Destination Administration shall remain separate from General Moderation.
16. Platform shall consume PRD-0001 status, validation, and eligibility outcomes.
17. Platform shall not invent an Affiliate Destination state or eligibility rule.

### Category Management

18. Platform shall support Category create, rename, hierarchy management, and retirement.
19. Platform shall prevent hierarchy cycles.
20. Platform shall allow Offering assignment only to an active leaf Category.
21. Platform shall permit Category retirement only when no Draft, Published, or Hidden Offering and no active child remains; Archived historical associations shall not block retirement.
22. Platform shall not permanently delete, merge, or automatically replace a Category in V1.

### Attribute Management

23. Platform shall support Attribute create and edit.
24. Platform shall manage applicable Categories.
25. Platform shall manage required-for-publication, filterable, and comparable properties.
26. Platform shall not redefine Offering, Filter, or Compare behaviour.
27. Platform shall not permanently delete, merge, or replace an Attribute in V1.

### Basic Analytics

28. Platform shall provide the minimum indicator inventory in §11.2.
29. Platform shall consume Completion from PRD-0004.
30. Platform shall separate Affiliate Handoff Completion and Direct Contact Completion.
31. Platform shall provide Today, Last 7 days, Last 30 days, and All time periods.
32. Platform shall support overall and applicable domain grouping.
33. Analytics shall not perform actions automatically.
    33a. Platform shall present Affiliate Handoff Rate as Affiliate Handoff Completion divided by Offering Presentation Open, per Offering and overall.
    33b. Affiliate Handoff Rate shall be derived from counted occurrences and shall create no additional event, counter or record.
    33c. Platform shall present no Affiliate Handoff Rate where Offering Presentation Open is zero, and shall state the absence as no rate rather than as zero.
    33d. Affiliate Handoff Rate shall not order, weight or mark anything in Discovery Results, and shall not appear on any public or Business-facing surface.

### Configuration boundary

34. Platform shall provide no standalone generic Settings area in V1.
35. No configuration shall introduce unapproved product behaviour.
36. General Moderation Case statuses shall be Open and Closed.
37. Request Correction shall keep the case Open until re-review.
38. Admin may close a case after an approved action or no-action decision without changing target state.
39. Request Correction targets shall be limited to Business Information, Offering content, Affiliate Destination configuration, and Direct Contact information.
40. Affiliate Destination workload categories shall be derived as defined in §8.5.
41. Every root Category shall receive exactly one V1 Domain at creation.
42. Child Categories shall inherit root Domain and reparenting shall remain inside the same Domain.
43. Category retirement shall ignore Archived historical assignments while requiring no Draft, Published, or Hidden assignment and no active child.
44. Attribute value kinds shall be Text, Number, Boolean, Single Select, or Multi Select.
45. Text Attributes shall not be filterable.
46. Attribute changes shall enforce §10.3 mutation safety and never silently delete Offering values.
47. Basic Analytics shall consume Offering Presentation Open from PRD-0001.
48. Basic Analytics shall use only owning-PRD-supplied Domain association and shall not infer Domain from query text.
49. Platform shall expose the bounded correction-edit path only when every §7.3.1 condition is satisfied.
50. Platform shall constrain the path to the exact Offering and targeted content area.
51. Platform shall deny creation, Draft publication, unrelated edit, lifecycle change, moderation change, exposure change, eligibility restoration, automatic case closure, and Messaging through the bounded path.
52. Platform shall require the corrected Offering to preserve the Universal Publication Minimum.
53. Platform shall keep the case Open after the owner edit and require re-review.
54. The bounded path shall not expand the seven-action General Moderation set.

### Advertising Placement Settings

55. Platform shall hold exactly the settings named in §20.4 and no key an Admin may invent.
56. Advertising shall be absent until configured, and an empty publisher identifier shall mean none anywhere.
57. The master switch shall suppress every region of §20.1, including the region the platform serves itself.
58. A Category on the exclusion list shall keep advertising out of that Category and every Category beneath it.
59. Suppressing advertising shall not discard the identifiers or the exclusion list.
60. Platform shall record no impression, click, revenue or fill-rate figure for any region.

### Listing Reports

61. Platform shall accept a report about a publicly eligible listing from anybody, signed in or not, without requesting identity.
62. A report shall carry a reason from the closed list in §21.2 and, optionally, the person's own words.
63. Report statuses shall be Open, Accepted and Dismissed, and a non-Open report shall record its reviewer and review time.
64. Reviewing a report shall change nothing about the listing and shall open no Moderation Case automatically.
65. A report count shall not order, demote or mark a listing anywhere in Discovery, and shall not enter the §11.2 indicator inventory.
66. A dismissed report shall be kept as evidence for the retention period in §21.5.
67. Platform shall delete a reviewed report, and the words it carries, 180 days after its review, and shall never delete an Open report.
68. Platform shall bound the number of reports one source may send within an hour.

---

## 16. Acceptance Criteria

```gherkin
Scenario: Admin context is reachable through an authorized User Account
  Given an authenticated User Account has Admin authorization
  When the account enters Admin context
  Then the Admin Panel is available
  And ordinary User behaviour remains available outside Admin context

Scenario: Ordinary Admin cannot provision another Admin
  Given an ordinary Admin is in the Admin Panel
  When Admin authorization management is evaluated
  Then grant and removal actions are unavailable

Scenario: Admin does not gain Business ownership
  Given an Admin-authorized account owns no Business
  When it enters Admin context
  Then Platform moderation is available
  And unrelated Business-management authority is not granted

Scenario: Opening a moderation case changes nothing
  Given an existing target is opened in a moderation case
  When the Admin takes no approved action
  Then the target state and eligibility remain unchanged

Scenario: Admin hides an Offering
  Given a Published Offering
  When an authorized Admin applies Hide Offering
  Then PRD-0001 outcome Published to Hidden is applied
  And Platform invents no additional state

Scenario: Admin restricts a Business
  Given an Unrestricted Business
  When an authorized Admin applies Restrict Business
  Then PRD-0005 outcome Unrestricted to Restricted is applied
  And Offering lifecycle states remain unchanged

Scenario: Admin suspends a non-Admin-authorized User
  Given an Enabled User Account without Admin authorization
  When an authorized Admin applies Suspend User
  Then PRD-0003 outcome Enabled to Suspended is applied

Scenario: Ordinary Admin cannot suspend an Admin-authorized account
  Given a User Account carries Admin authorization
  When an ordinary Admin attempts Suspend User
  Then the action is rejected
  And User Account access status and Admin authorization remain unchanged

Scenario: Request Correction creates no Messaging
  Given an Admin requests correction
  When the request is recorded
  Then no lifecycle or eligibility result changes by itself
  And no inbox, thread, or reply workflow is created

Scenario: Affiliate administration is a separate action family
  Given an Affiliate Destination requires review
  When the Admin opens Affiliate Destination Administration
  Then Review, Validate, Enable, and Disable are available subject to target conditions
  And the seven-action General Moderation set remains unchanged

Scenario: Enabling consumes the Offering-owned outcome
  Given an Affiliate Destination is Valid
  When Enable Affiliate Destination is applied
  Then PRD-0001 outcome Enabled and Handoff Eligibility Eligible is applied
  And final Offering Public Eligibility remains unchanged

Scenario: Category retirement is safe
  Given a Category has no Draft, Published, or Hidden Offering
  And has no active child
  When an authorized Admin retires it
  Then it cannot receive new Offering assignments
  And it no longer appears as an active Browse destination
  And Archived historical associations remain renderable

Scenario: Category retirement is blocked while actively in use
  Given a Category has a Draft, Published, or Hidden Offering or an active child
  When retirement availability is evaluated
  Then Retire Category is unavailable

Scenario: Attribute properties are managed centrally
  Given an authorized Admin edits an Attribute definition
  When required-for-publication, filterable, or comparable is changed
  Then the property is available to the applicable consuming PRD
  And Platform does not perform publication, Filter, or Compare behaviour

Scenario: Basic Analytics consumes Completion
  Given PRD-0004 produces Affiliate Handoff Completion and Direct Contact Completion
  When Basic Analytics is presented
  Then the two indicators are shown separately
  And neither is described as purchase or external transaction success

Scenario: Analytics guides but does not act
  Given an indicator represents actionable workload
  When the Admin selects it
  Then the relevant work area may open
  And no moderation or administration action occurs automatically

Scenario: Moderation case closes without changing target state
  Given a General Moderation Case is Open
  And an approved action or no-action decision has been recorded
  When the Admin closes the case
  Then case status becomes Closed
  And no target lifecycle, moderation, access, or eligibility result changes because of closure

Scenario: Request Correction remains Open for re-review
  Given an Admin applies Request Correction to an approved Business-owned target
  When the Business owner edits the information
  Then the case remains Open
  And Platform re-review is required

Scenario: Affiliate workload is derived
  Given an Affiliate Destination is Draft and Valid
  When Platform composes the administration queue
  Then the workload category is Ready to Enable
  And no new Destination state is created

Scenario: Category retires with Archived history
  Given a Category has no Draft, Published, or Hidden Offering
  And has no active child
  And an Archived Offering retains a historical association
  When the Admin retires the Category
  Then retirement is allowed
  And the Archived record remains renderable

Scenario: Cross-Domain reparenting is unavailable
  Given two Category branches belong to different V1 Domains
  When an Admin attempts to move a Category between them
  Then the change is rejected

Scenario: Required Attribute activation is safe
  Given an Attribute is applicable to a Category
  And one Published Offering lacks a value
  When an Admin attempts to set required for publication to true
  Then the change is rejected
  And the Published Offering remains unchanged

Scenario: Platform exposes bounded correction edit only for the exact case
  Given Business Moderation Status is Restricted
  And a General Moderation Case is Open
  And Request Correction targets Offering content
  And the target Offering is Published or Hidden
  And the acting User is the authorized owner
  When Platform evaluates the correction path
  Then the exact Offering and targeted content area are editable
  And no unrelated edit authority is granted

Scenario: Platform preserves restriction and public ineligibility
  Given the Restricted owner saves the correction
  When Platform evaluates the result
  Then Offering lifecycle remains unchanged
  And Business Moderation Status remains Restricted
  And Business Public Exposure Input remains Ineligible
  And public eligibility is not restored

Scenario: Platform requires re-review
  Given a bounded correction edit succeeds
  When the edit is recorded
  Then the General Moderation Case remains Open
  And Admin re-review is required
  And the case does not close automatically
  And no Messaging workflow is created

Scenario: Platform rejects incomplete bounded-path conditions
  Given at least one condition in §7.3.1 is absent
  When the Restricted owner attempts to edit Published or Hidden Offering content
  Then Platform denies the correction edit

Scenario: Generic Platform Settings are absent
  Given an Admin enters the Admin Panel
  When Platform management areas are shown
  Then no generic Settings area can introduce unapproved product behaviour
```

---

## 17. Related PRDs

### PRD-0001 — Offering

Owns:

- Offering lifecycle;
- final Offering Public Eligibility;
- Category and Attribute product concepts;
- Affiliate Destination status, validation meaning, and Handoff Eligibility.

Platform applies those outcomes by reference.

### PRD-0002 — Discovery

Consumes:

- active Categories;
- filterable Attribute definitions;
- final Offering Public Eligibility;
- Discovery activity indicators consumed by Basic Analytics.

### PRD-0003 — Identity

Owns:

- User Account access status;
- Admin authorization attachment;
- Admin-context entry;
- baseline inheritance;
- suspension and reinstatement consequences.

Platform consumes those results.

### PRD-0004 — Decision

Owns:

- Compare;
- Decision Chat;
- Affiliate Handoff;
- Direct Contact;
- Completion.

Platform consumes activity and Completion results without redefining them.

### PRD-0005 — Business

Owns:

- Business Profile;
- Business Information;
- Business Moderation Status;
- Business Public Exposure Input.

Platform applies Restrict and Restore outcomes by reference.

---

## 18. Related ADRs and Owner Decisions

### Accepted ADRs

- `ADR-0006 — Affiliate Destination Ownership`
- `ADR-0007 — Domain Scope of the Capability First Rule`
- `ADR-0008 — Handoff Enablement Capability`

### Frozen Capability Architecture

- `OFFERING_CAPABILITY_ARCHITECTURE.md` Frozen v2.0
  - Handoff Enablement;
  - F06 Affiliate Destination Configuration;
  - F07 Affiliate Destination Eligibility Governance;
  - PRD-0006 supporting relationship boundary.

### Applied Owner Decisions

- D-04 — Direct Contact Model;
- D-05 — Completion Evidence;
- D-06 — Admin Baseline Inheritance;
- D-07 — Admin Provisioning;
- D-15/D-16 — Retirement and Moderation Outcomes;
- D-21 — Affiliate Destination Administration Actions;
- D-22 — Admin-Authorized Account Suspension.

---

## 19. Accepted Deferrals

The following are accepted V1 deferrals and do not block Freeze:

1. **Attention-source implementation**
   - Technical signals that surface or prioritize a moderation case remain outside the PRD.
   - Every surfaced case must use the approved Open/Closed model.

2. **Technical analytics measurement**
   - Event schemas, persistence, deduplication, and queries remain outside the PRD.

3. **Technical Admin provisioning**
   - The controlled mechanism attaching or removing Admin authorization remains outside the PRD.

4. **Future Category migration**
   - Merge, automated replacement, cross-Domain movement, and bulk migration remain outside V1.

5. **Future Attribute lifecycle**
   - Deprecation, replacement, permanent deletion, and automated value migration remain outside V1.

No downstream UX or User Story may broaden these deferrals.

---

## 20. Advertising Placement Settings

The platform does not sell, price, moderate or report advertising. It configures
an external network and decides **where** advertising may appear and **whether**
it appears at all. Both are Admin settings.

### 20.1 The permitted regions

Advertising may appear in exactly these regions and nowhere else:

| Region                 | Position                                                | Served by            |
| ---------------------- | ------------------------------------------------------- | -------------------- |
| Discovery Results      | Between Listing Cards, no earlier than the sixth        | the external network |
| Offering Presentation  | Below the seller list                                   | the external network |
| Category page          | Below the results grid                                  | the external network |
| Complementary products | On an Offering Presentation, directly below the actions | the platform         |

The fourth region is the platform's own: a **Complementary Placement** is a
label, a partner name, an optional line and an outbound address, written by an
Admin against a Category and inherited by every listing under it. No external
network is involved, and no creative is served — what a person reads is exactly
what was written.

Its position is above the seller list because it answers a question a person
has _after_ deciding what to do about the listing and not before: a car needs
tyres, a laptop needs a bag. It is the only region whose position is set by what
it says rather than by keeping it out of the way.

Every unit is **labelled as advertising** in the person's own language, in a way
that is legible without colour.

### 20.2 Where advertising may never appear

- Home;
- Decision Chat;
- the comparison table;
- a Zero Results statement;
- above the sixth Listing Card;
- any Admin or Business surface.

### 20.3 What advertising may never do

- occupy, influence, or purchase a **position in Discovery Results** — sponsored,
  paid and promoted ordering remain excluded under PRD-0002;
- receive a Discovery path identifier, a Comparison Set, Decision Chat content,
  or any protected telephone number, email address, or contact URL;
- change what is publicly eligible, what matches a query, or what a Listing Card
  contains.

### 20.4 The settings an Admin holds

- a **publisher identifier** for the external network;
- one **unit identifier per region**, three in total;
- a **master switch** that suppresses all advertising immediately;
- a **Category exclusion list**, so a Category may be marked ad-free.

Advertising is **absent by default**. A setting left empty means no advertising
in that region, and an empty publisher identifier means none anywhere. The
platform never invents an identifier and never falls back to one.

**The master switch covers every region in §20.1, including the fourth.** Off,
no external unit is requested and no Complementary Placement is served. This is
stated rather than left to be inferred, because the whole value of a single
control is that the person pressing it does not have to remember what it does
not cover — and the fourth region arrived one version after the switch was
written, which is exactly when a gap of that kind opens.

**A Category exclusion is inherited downwards.** A Category on the list, and
every Category beneath it, is ad-free — the same inheritance §20.1 gives a
Complementary Placement, and for the same reason: the decision is about a
section of the catalogue, and one that stopped at the heading it names would
leave a sector marked ad-free advertising everywhere under it.

**Off is a state, not an erasure.** Turning the master switch off does not
discard the publisher identifier, the unit identifiers or the exclusion list. An
operator who suppressed advertising in a hurry has not lost the configuration
they will restore.

### 20.5 What the settings do not do

They do not report impressions, clicks, revenue or fill rate; they do not
review creative; and they do not target. Targeting, if the network performs any,
is the network's behaviour on the person's own browser, and the platform sends
it nothing about the person.

**This applies to the platform's own region too**, and there it is a decision
rather than a consequence: the platform could count a press on a Complementary
Placement and does not. A count would make the placement a thing to optimise,
and the next question after "which one is pressed most" is "which one should be
shown first" — which is advertising deciding an order, one region away from the
Results where §20.3 forbids it outright.

### 20.6 Acceptance Criteria

```gherkin
Scenario: Advertising is absent until configured
  Given no publisher identifier is set
  When any public page is presented
  Then no advertising appears anywhere
  And the page is complete without it

Scenario: The master switch suppresses everything
  Given advertising is configured in all three regions
  When an Admin turns the master switch off
  Then no advertising appears in any region

Scenario: A Category may be ad-free
  Given a Category is on the exclusion list
  When Discovery Results within that Category are presented
  Then no advertising appears among them

Scenario: Advertising never precedes the sixth Result
  Given advertising is configured for Discovery Results
  When Results are presented
  Then the first five Listing Cards are consecutive
  And no advertising appears before the sixth

Scenario: Advertising cannot buy a position
  Given advertising is configured
  When Results are ordered
  Then the order is the product-defined order
  And no Offering is advanced, delayed, or marked by any advertising decision

Scenario: A complementary placement is inherited by the headings beneath it
  Given a Complementary Placement is written against a sector
  When an Offering Presentation under any heading of that sector is presented
  Then the placement appears there
  And a placement written against one heading replaces the sector's under that
    heading rather than appearing beside it

Scenario: A complementary placement is not part of the listing
  Given a Complementary Placement applies to a listing
  When that Offering's Presentation content is composed
  Then the Presentation carries no advertising
  And the placement is presented beside it rather than within it

Scenario: The master switch suppresses the platform's own region too
  Given a Complementary Placement applies to a listing
  And the master switch is off
  When that Offering's Presentation is presented
  Then no complementary placement appears
  And no external advertising appears

Scenario: An ad-free Category covers the Categories beneath it
  Given a sector is on the Category exclusion list
  And a Complementary Placement is written against that sector
  When an Offering Presentation under any heading of that sector is presented
  Then no advertising appears
  And removing the sector from the exclusion list restores it

Scenario: Suppressing advertising does not discard its configuration
  Given a publisher identifier and unit identifiers are set
  When an Admin turns the master switch off
  Then no advertising appears anywhere
  And the identifiers are unchanged
  And turning the switch on restores advertising without them being re-entered
```

---

## 21. Listing Reports

A **Listing Report** is an unverified claim by a member of the public that
something on one listing is wrong, and an Admin's decision about whether it is.
It is the platform's only inbound signal about facts only a partner can correct
— a price that has moved, stock that has gone, a link that no longer resolves —
and before it existed the platform had no way to hear any of them.

### 21.1 Why it is not a Moderation Case

§5.3 defines a Moderation Case: opened by an Admin with authority, carrying a
lifecycle other sections govern, and able to change a target's state through the
seven actions of §7.2. A report is none of those things.

|                      | General Moderation Case               | Listing Report            |
| -------------------- | ------------------------------------- | ------------------------- |
| Opened by            | an Admin                              | anybody, signed in or not |
| Concerns             | a Business, an Offering or an account | one listing               |
| Changes target state | yes, through §7.2                     | **never**                 |
| Produces             | an action                             | a judgement               |

Folding the two together would make the queue an Admin reviews indistinguishable
from a queue anybody can fill, and would give a member of the public a route into
a lifecycle §7 reserves to Admins. They are separate, and §21.4 is explicit that
accepting a report performs no moderation action.

### 21.2 What a report carries

- the **listing** it concerns;
- a **reason**, from a closed list: the price is wrong, the stock state is wrong,
  it is in the wrong Category, the information is misleading, the link is broken;
- optionally, the person's **own words**, bounded to a sentence rather than a
  document;
- the **account** that sent it, where there was one.

The reason is a closed list because a report that is only free text is a report
nobody can count, and the value of the queue is that five reports about one
listing reads differently from one.

**No identity is requested.** A person is not asked for a name, an email address
or a telephone number, and a Guest may report. The account is recorded when the
person happens to be signed in, so that a pattern of reports from one source is
visible; it is never a condition of being heard. Requiring an account first
would collect fewer reports from exactly the people who noticed.

### 21.3 The states a report has

`Open` until an Admin has looked at it, and then `Accepted` or `Dismissed`.

A dismissed report is kept rather than deleted, because it is evidence too:
five dismissed reports about one listing is a different fact from one, and a
queue that forgot what it had already answered would ask an Admin the same
question repeatedly.

A report that is no longer Open records **who** reviewed it and **when**, and one
that is Open records neither. This is the same evidence rule §7.3.2 applies to
case closure.

### 21.4 What reviewing a report does, and what it does not

Accepting a report records that an Admin agrees there is something to fix. **It
changes nothing about the listing.** Whatever is then done happens through the
sections that own the consequences — a Moderation Case under §7, a Request
Correction under §7.3, or a message to the partner outside this platform.

- A report shall not hide, restore, restrict or retire anything.
- A report shall not open a Moderation Case automatically.
- A count of reports shall not order, demote or mark a listing anywhere in
  Discovery. This is the same boundary §20.3 draws around advertising, and for
  the same reason: an unverified claim that could move a listing is a way to
  move a listing by making claims.
- The reporter is not told the outcome. The platform does not hold an address to
  tell them at, and asking for one would change what §21.2 collects.

### 21.5 Retention

A report holds a member of the public's own words about a third party's listing.
That is the reason a retention period exists at all: everything else on the row
is a reason code and a timestamp.

**Decided by the Product Owner on 2026-09-03** — _"Önerdiğin 180 gün kuralını
onaylıyorum. Altı ay, yasal veya operasyonel bir itirazı geçmişe dönük
incelemek için fazlasıyla yeterli ve makul bir veri tutma süresidir."_

- an **Open** report is kept until it is reviewed, **whatever its age**. A queue
  that deleted work nobody had done would lose the report _and_ the fact that it
  was never answered — and the second is the more damaging loss, because it is
  the one that hides a queue nobody is reading;
- a **reviewed** report is deleted **180 days** after its review;
- the person's own words are deleted **with** the report and not before. A row
  that outlived its note would keep the fact that somebody complained without
  keeping what they said, which is the worst of both.

**Why 180 days.** Long enough that an Admin can re-read a decision across two
quarters and that a repeated claim about one listing is still visible as a
repetition; short enough that free text written by the public is not held
indefinitely for a purpose nobody can name.

**Deletion is deletion.** The report is removed, not anonymised into a row that
survives for ever without its content.

### 21.6 Volume

A single source may send a bounded number of reports in an hour. The bound is
deliberately generous: somebody working through a Category and finding four
stale prices is the best thing that can happen to a comparison platform, and a
limit that punished them would cost more than the noise it prevents. What the
bound stops is one source producing volume.

### 21.7 What Listing Reports do not do

- They do not measure anything. A report count is a queue depth, not an
  indicator, and §11.2's Basic Analytics inventory does not include it. Adding it
  is a change to §11, not something a report queue may do on its own.
- They do not carry a conversation. There is no reply, no thread and no
  notification.
- They do not reach the Business. What a partner is told, and by whom, is
  outside this platform.

### 21.8 Acceptance Criteria

```gherkin
Scenario: Anybody may report a listing
  Given a publicly eligible listing
  When a person who is not signed in submits a reason
  Then the report is recorded
  And no identity is requested

Scenario: A report changes nothing about the listing
  Given an Open report about a listing
  When an Admin accepts it
  Then the report is Accepted
  And the listing's exposure, eligibility and lifecycle are unchanged
  And no Moderation Case is opened automatically

Scenario: A dismissed report is kept
  Given an Open report about a listing
  When an Admin dismisses it
  Then the report is Dismissed
  And it remains readable as evidence

Scenario: A reviewed report records who and when
  Given an Open report
  Then it records no reviewer and no review time
  When an Admin reviews it
  Then it records both

Scenario: A report cannot move a listing in Results
  Given a listing with several reports about it
  When Results containing that listing are ordered
  Then the order is the product-defined order
  And no report has advanced, delayed or marked it

Scenario: An Open report is never swept
  Given an Open report older than the retention period
  When retention is applied
  Then the report is kept
  And the fact that it was never answered is kept with it

Scenario: A reviewed report is deleted with its words
  Given a report reviewed longer ago than the retention period
  When retention is applied
  Then the report is deleted
  And the words it carried are deleted with it

Scenario: A report about a listing nobody can open is not accepted
  Given an address that is not a publicly eligible listing
  When a report is submitted against it
  Then the report is refused
  And the refusal says nothing about whether the listing ever existed
```

---

## 22. Admin Audit Trail

Every Admin action this document governs changes something a person can see: a
listing disappears, an account cannot sign in, a partner's handoff starts
earning. The platform has always recorded the **consequences** of those acts in
the places that own them — a case note, a validation result, a moderation
status. It records the **acts** here.

A case note answers _"what happened to this Business"_. It cannot answer _"what
has this Admin done this month"_, and it cannot answer it in a way that survives
somebody who would rather it did not. Those are the two questions this section
exists for, and they are questions about people rather than about targets.

### 22.1 What the trail is

An **append-only record of Admin acts**, held separately from the records those
acts produce. Each entry states:

- **who** acted — the account, as an identifier;
- **what** they did, from the closed list of §22.2;
- **what it concerned** — the target, where the act has one outside its case;
- **which case** it was taken under, where there was one;
- **when** it happened.

An entry carries **no name and no email address**, for the reason §23 gives: a
trail that named people would be a second place personal data lives, and the one
place nobody would think to look for it.

### 22.2 What is recorded

Every act by which an Admin changes something, and one act by which an Admin
merely _sees_ something:

| Recorded                                                                               | Why                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The seven General Moderation actions (§7.2)                                            | They change a target's state                                                                                                                                                                   |
| Opening a Moderation Case (§5.3)                                                       | It is the act that starts a governed process                                                                                                                                                   |
| **Revealing a personal email address** (§23)                                           | It is a disclosure of personal data, and §23 makes the record a condition of the disclosure                                                                                                    |
| Affiliate Destination review, validation result, enablement and disablement (§8)       | They decide whether a handoff earns. The Owner, 2026-09-05: _"platformun para kazandıran en kritik eylemleridir"_                                                                              |
| **Creating**, publishing, revising, re-checking and withdrawing an editorial review (`PRD-0009` §13) | They change what the platform says in its own voice about a product, on a page that earns a commission. `PRD-0009` §8 makes the judgement unpurchasable; the trail is what makes it answerable |

A validation is recorded **by its result**, because "an address was judged" and
"an address was judged invalid" are different facts and only the second explains
a handoff that never went live.

**This list is exhaustive and adding to it is a revision of this section.** An
Admin act that is not on it is not recorded, which is a statement about what the
platform promises rather than about what an implementation happens to do.

### 22.3 Append-only, and where that is enforced

The trail **shall not be editable or deletable by any surface, any Admin, or any
application code.** This is a technical commitment and not a convention:

- the enforcement lives **at the database**, in constraints the application
  cannot ask nicely to be excused from;
- it covers `UPDATE`, `DELETE` **and** whole-table truncation, because a
  guarantee that stops at row-level deletion is one somebody steps over with a
  single statement — this was found by testing, not by reasoning;
- the platform exposes **no route** that writes, edits or removes an entry.
  Reading is the only operation any surface offers;
- an account that has acted as an Admin **cannot be deleted** while its entries
  exist. Removing a person must not erase the record of what they did.

**Failure to write an entry shall not fail the act it describes.** The act has
already happened by then — the address was read, the account was suspended — and
refusing it would report a failure that did not occur. A lost entry is logged
where operators look. The cost is named rather than hidden: a database fault can
lose an entry while its act succeeds, and the alternative loses the act _and_
misreports it.

### 22.4 Retention: none

The trail is **kept indefinitely.** No sweep, no window, no archival.

The 180-day retention of §21.5 belongs to Listing Reports and to nothing else.
The two were conflated once, in conversation, and the distinction is the whole
point: a report is a claim that stops being useful, and an audit entry is
evidence whose value **increases** with age. A trail that forgets cannot answer
the question it exists for, which is always asked about the past.

### 22.5 Who may read it

**The platform administrator alone.**

V1 has one Admin tier, so today this is every Admin. The commitment is about
what happens when that stops being true: a later tier — a Sub-Admin, a
moderator, a partner-support role — **shall not reach this trail**, and admitting
one is a revision of this section rather than a configuration change.

The reason is structural. The trail exists to record what Admins do; a tier that
can read it can see what is recorded about it, and a tier that can be _given_
access can be given it by somebody who is recorded in it.

Reading the trail is **not itself recorded**. An audit of the audit answers no
question the trail does not already answer, and a log that grows when somebody
looks at it teaches Admins not to look.

### 22.6 Reading the trail — Feature `F14`

Reading is an **operational surface** and not a query somebody runs against a
table. It carries filters, paging and an export, each of which is a decision:

- **Filters** — by the account that acted, by the act, and by a date range.
  Those are the three questions an audit is asked, and a surface answering only
  "everything, newest first" cannot answer any of them.
- **Paging** — the trail is a record being searched rather than a queue being
  emptied, and a record nobody can page through is a record nobody can audit.
  The page states **how many entries match** as well as which page it is, because
  a page that does not say how many there are cannot tell a reader whether they
  have seen the entry they came for.
- **The filters travel in the address.** A compliance question is answered by
  sending somebody a view, and a view held only inside a screen cannot be sent.
- **Export.** The same entries the screen describes, as a file, built from the
  **same filters** — an export that describes a different set of rows from the
  screen it came from is how a file quietly becomes wrong. It carries no email
  address and no name, per §23.3.

The default view is the **last thirty days**, and the range may reach back as far
as the trail goes. There is no cap: §22.4 keeps every entry, and a view that
hid entries which exist would be hiding them from the one surface built to
disclose them.

**Authorization is this Feature's whole risk.** §22.5 reserves the trail to the
platform administrator, and this surface is where that reservation is either
kept or lost: a filter, a page or an export reachable by a tier §22.5 excludes
discloses exactly what the trail exists to protect. The surface therefore
resolves its own authority — the same check by a different name from every other
Admin surface — so that a later Sub-Admin revision has one place to change and a
reviewer has one name to look for.

### 22.7 What the trail does not do

- It **grants nothing**. An entry confers no authority and removes none.
- It **judges nothing**. It records that an act happened, never whether it was
  right; that judgement belongs to a person reading it.
- It is **not a moderation record**. §7's case history remains the account of
  what happened to a target; this is the account of who acted.
- It is **not analytics**. §11's indicators count occurrences for a dashboard;
  this identifies actors for accountability, and the two must not be merged —
  §11.4 forbids Analytics from identifying a person, and this section requires
  it. They answer to different rules because they are for different things.

### 22.8 Acceptance Criteria

```gherkin
Scenario: An Admin act is recorded with its actor
  Given an authorized Admin performs an act listed in §22.2
  When the act succeeds
  Then the trail holds an entry naming the acting account, the act and the time

Scenario: A refused act is not recorded
  Given an Admin attempts an act the platform refuses
  When the refusal is returned
  Then no entry describing that act exists

Scenario: A validation is recorded by its result
  Given an Admin records an Affiliate Destination validation result
  When the result is Invalid
  Then the entry distinguishes it from a result of Valid

Scenario: The trail cannot be edited
  Given an entry exists
  When any actor attempts to change or remove it
  Then the attempt is refused by the database

Scenario: The trail cannot be emptied
  Given entries exist
  When any actor attempts to truncate the record
  Then the attempt is refused

Scenario: An acting account cannot be erased
  Given an account has entries in the trail
  When deletion of that account is attempted
  Then the deletion is refused

Scenario: The trail is not swept
  Given an entry older than any retention period applied elsewhere
  When the platform performs its retention work
  Then the entry remains

Scenario: A losable entry does not lose its act
  Given the trail cannot be written for a technical reason
  When an Admin performs an act
  Then the act completes
  And the failure to record is reported to operators

Scenario: Reading is the only operation
  Given any Admin surface
  When it addresses the trail
  Then it may read
  And no surface offers a write, an edit or a removal

Scenario: The reading surface narrows by actor, act and date
  Given entries by two accounts, of two kinds, on two days
  When the surface is filtered by one account, one act or one day
  Then only the matching entries are returned

Scenario: A page says how many there are
  Given more entries than one page holds
  When a page is read
  Then it states the total number matching the filters

Scenario: The filters are in the address
  Given a filtered view
  When its address is opened again
  Then the same filters apply

Scenario: The export describes the screen
  Given a filtered view
  When the export is taken
  Then it contains the entries those filters match
  And it contains no email address and no name

Scenario: The range is not capped
  Given an entry older than any retention period applied elsewhere on the platform
  When the range is widened to include its date
  Then the entry is returned

Scenario: The surface is closed to anybody the trail is not for
  Given a caller who is not the platform administrator
  When it addresses the reading surface or its export
  Then the request is refused
  And no entry, count or filter value is disclosed
```

---

## 23. Personal Data on Admin Surfaces

**Security Requirement.** This section states a data-protection commitment, not
a preference about screen layout. It is stated here because the Owner set it on
2026-09-04 and it existed nowhere any reader could hold the platform to:

> _"E-posta adresleri hassas kişisel veridir. Operasyonel ekranlarda (örneğin
> liste veya vaka kuyruğu görünümlerinde) e-posta adreslerini kesinlikle açıkça
> göstermiyoruz."_

### 23.1 The rule

**No email address shall appear on any operational Admin surface.** Operational
means every list, queue, table, dashboard, export and analytics view — anywhere
an Admin is working through more than one subject at a time.

Where a person must be identified, the surface shows the **account identifier**,
or an alias the account has chosen. That is enough to act, to open a case, and
to find the same person again.

### 23.2 The single exception, and its conditions

An address may be disclosed **only** when all four hold:

1. it is on the **detail of one Moderation Case**, never in a list;
2. the case's target **is a user account** — a case about an Offering or a
   Business reveals nothing, because no address is needed to act on either;
3. an Admin **asks for it deliberately**, in an act of its own. It is never part
   of what a surface returns because it was opened;
4. the request **is recorded in §22's trail** before the address reaches the
   screen. The record is a condition of the disclosure and not a consequence of
   it: an address disclosed without a record is a breach of this section, not an
   incomplete log.

### 23.3 What this forbids

- A surface **shall not fetch an address and hide it** behind a control. What is
  sent has been disclosed, whatever the screen chooses to paint; the address
  must not leave the platform until condition 3 is met.
- A search, filter or sort **shall not accept an address** as its input on an
  operational surface. Answering "which account is this address" for anybody who
  can type is disclosure by another route.
- An export **shall not carry addresses**, including the audit export of §22.
- An address **shall not appear** in analytics, in a report queue, in a
  moderation queue, or in any list of accounts.

### 23.4 Why the mechanism is the rule

A rule enforced by a screen is a rule until the next screen. This section
therefore requires the **absence of the data** rather than its concealment: the
address is not in what an operational surface receives, so no future page, export
or debugging view can display what it was never given. A toggle over data
already sent satisfies the sentence and defeats the purpose.

### 23.5 Beyond email

Email is the address the platform holds. The rule is about **personal data
reaching an operational surface**, and any further personal datum the platform
ever holds — a telephone number, a postal address, a document identifier — falls
under §23.1 by default, and reaches a surface only through a revision of this
section that says so.

### 23.6 Acceptance Criteria

```gherkin
Scenario: A queue never carries an address
  Given a moderation case queue containing cases about user accounts
  When an Admin views the queue
  Then no email address appears
  And each subject is identified by its account identifier or alias

Scenario: An address is not sent before it is asked for
  Given the detail of a Moderation Case whose target is a user account
  When the case is opened
  Then the response carries no email address

Scenario: A deliberate request discloses it, and is recorded
  Given an Admin on the detail of a case whose target is a user account
  When the Admin requests the address
  Then the address is returned
  And an entry recording the disclosure exists in the §22 trail

Scenario: A case about an Offering discloses nothing
  Given a Moderation Case whose target is an Offering
  When an Admin requests an address
  Then none is returned

Scenario: An export carries no address
  Given any Admin export, including the audit trail export
  When the file is produced
  Then it contains no email address

Scenario: An operational surface cannot be searched by address
  Given an Admin list of accounts
  When an email address is supplied as a filter
  Then the surface does not answer with the matching account
```

---

## 24. Feed Management

`PRD-0001-offering.md` §5.11 governs what an automated intake may do to an
Offering. **This section governs the Admin surface where an intake is configured
at all** — the thing that exists between "a partner publishes a document" and "a
price on this platform changes", and which no section owned until now.

It is Feature `F13`.

### 24.1 What an Admin holds

A **feed** is a partner's document the platform reads on a schedule. An Admin
registers one, and what they register is:

- the **partner** whose listings it may touch, and the **heading** its products
  are filed under;
- the **address** of the document and its **format**;
- the **mapping** — which field in the partner's document is the identifier, the
  title, the price, the currency, the stock state, the product key;
- whether it is **active**.

An Admin may **pause** a feed and start it again. A paused feed is not read.

### 24.2 What an Admin reads

For each feed, the record of its **runs**: when it ran, whether it succeeded,
and — for a run that succeeded — how many products were read, how many listings
were updated, how many were passed over, and how many rows were refused with the
reason for each.

A run that failed carries **the reason in words an operator can act on**: that
the partner's server refused, that the document is malformed, or that the mapping
names a field that is not there. Those are three different jobs for three
different people, and a feed that reports only "failed" sends all three to the
same person.

Refusals are **sampled rather than exhaustive**. A feed that refuses forty
thousand rows has one problem, not forty thousand, and a platform that stored
every one of them would make the run that reports a problem the run that fills
the disk.

### 24.3 What pausing does not do

Pausing says _"stop reading this partner's document"_. It does not withdraw the
listings that feed maintains, does not hide them, and does not retire them —
those are moderation and lifecycle decisions that §7 and `PRD-0001` §6 own, and
an Admin who wanted them would take them deliberately.

### 24.4 What this surface may not do

- It **shall not create a listing**, directly or by configuring something that
  does. `PRD-0001` §5.11.1 removes that capability from every intake.
- It **shall not publish, hide or retire** anything.
- It **shall not edit** a listing's title, summary, heading, product key or any
  other authored content, through the mapping or otherwise.
- It **shall not accept a setting this section does not name.** §12's rule
  applies here in full: a mapping is a description of somebody else's document,
  not a place to put a key nobody wrote down.

### 24.5 Acceptance Criteria

```gherkin
Scenario: An Admin registers a feed
  Given an authorized Admin
  When a partner, a heading, an address, a format and a mapping are supplied
  Then the feed exists and is active

Scenario: The surface is closed to everybody else
  Given a signed-in account without Admin authorization
  When it addresses any feed management surface
  Then the request is refused

Scenario: A paused feed is not read
  Given an active feed
  When an Admin pauses it
  Then the scheduled reading does not include it

Scenario: Pausing withdraws nothing
  Given a feed that maintains published listings
  When the feed is paused
  Then those listings remain published
  And their public eligibility is unchanged

Scenario: A failed run says why
  Given a feed whose document cannot be read
  When the run completes
  Then the run is recorded as failed
  And its reason distinguishes a refused server, a malformed document and a mapping that names a missing field

Scenario: A successful run reports what it did and what it passed over
  Given a feed whose document offers products the platform does not carry
  When the run completes
  Then the count of listings updated and the count of products passed over are both recorded
  And products passed over are not counted as refusals

Scenario: Refusals are sampled
  Given a run that refuses more rows than the platform stores
  When the run is recorded
  Then a bounded sample of refusals with reasons is kept
  And the full count is recorded
```
