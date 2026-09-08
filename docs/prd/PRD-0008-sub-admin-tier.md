# PRD-0008 — Sub-Admin Authorization Tier

- **Owner:** Product Owner / Architecture Owner
- **PRD ID:** PRD-0008
- **Title:** Sub-Admin Authorization Tier
- **Status:** Draft
- **Version:** 0.2
- **Supersedes:** Draft v0.1 of the same day, which carried §9.3 as an open question.
- **Approval Date:** Not approved
- **Approved By:** —
- **Freeze state:** Not frozen
- **Freeze Date:** —
- **Frozen By:** —
- **Last Updated:** 2026-09-07
- **Scope level:** Product behaviour (non-technical)
- **Release:** **V1.1. Outside the Frozen V1 baseline**, in the manner
  `UX-0007-messaging.md` is outside it.

> **Draft Note (0.2):** This is still a **candidate** and carries no authority.
> It defines no behaviour the platform must have and permits nothing.
> Commissioned by the Owner on 2026-09-07 — _"V1.1 için ertelediğimiz Sub-Admin
> Katmanı … mimarilerinin PRD taslaklarına şimdiden girişelim"_ — to be drafted
> while the V1 launch waits on affiliate agreements.
>
> **Revision Note (0.2):** The Owner took two of the questions v0.1 left open,
> on 2026-09-07, and they are recorded where they were asked: §8 and §9.3. Both
> confirmed what v0.1 recommended, so no reasoning in this document changes —
> what changes is that two of its sentences are now decisions rather than
> proposals, and the document says which.
>
> **Nothing in this document may be built while it is a Draft.** A second Admin
> tier is the one change in this platform that cannot be delivered incrementally
> and corrected afterwards: a tier that exists before its boundaries are frozen
> is a tier whose boundaries are whatever the first implementation happened to
> do.
>
> **What this draft is for.** It separates three things that a conversation
> about "adding a Sub-Admin" runs together: what is **already decided** by
> Frozen documents and is therefore not open (§5); what is **the Owner's to
> decide** and is left open here on purpose (§9); and what is a **technical
> precondition** that must be true before the first line of tier code is written
> (§8).

---

## 1. Purpose

Today the platform has one Admin tier. Everyone who can moderate a listing can
also read the audit trail, restrict a Business, and see the acts of every other
Admin. That is correct for a platform operated by its owner and stops being
correct the moment somebody is hired to do moderation and nothing else.

This document defines a **second, narrower authorization tier** — a Sub-Admin —
so that operational work can be delegated without delegating the authority to
oversee it.

## 2. Business Value

The value is not efficiency. It is **the ability to hire**.

Moderation is the work that scales with the catalogue: reports to review,
corrections to request, destinations to validate. Every one of those is
delegable. What is not delegable is the record of who did them, the power to
restrict a partner Business, and the power to change who may act at all — and
today those come in the same bundle as the delegable work.

A platform that cannot hire a moderator without handing over its audit trail
either does not hire, or hands over the trail. Both are worse than this
document.

## 3. Scope

- A named authorization tier below the platform administrator.
- The set of acts that tier may perform, and the set it may not.
- How the tier is granted and removed.
- How the tier appears in the audit trail.
- The rules that must **not** change when the tier is introduced.

## 4. Out of Scope

- Any third tier, and any per-person permission editing. This document defines
  **one** additional tier with a fixed act set, not a permission system. A
  platform with configurable roles has an authorization model that no document
  describes, because the model becomes whatever the checkboxes were left at.
- Partner (Business) self-management. That is a **handover**, governed
  separately; `V1_LAUNCH_RUNBOOK.md` §5 records the Owner's decision that
  partner accounts stay under platform management for V1.
- Any change to what an act _does_. This document changes who may perform an
  act, never the act's own behaviour, which stays owned by the PRD that owns it.

## 5. What is already decided, and is therefore not open here

These are not proposals. Each is a rule in a Frozen document, and this section
exists so that drafting the tier does not quietly reopen them.

### 5.1 The Sub-Admin shall not reach the audit trail

`PRD-0006` **Frozen v2.7 §22.5** is explicit, and it names this tier by name: a
later tier — a Sub-Admin, a moderator, a partner-support role — **shall not
reach this trail**, and admitting one is a revision of that section rather than
a configuration change.

Its reasoning is structural and survives any argument about convenience: the
trail exists to record what Admins do; a tier that can read it can see what is
recorded about it, and a tier that can be _given_ access can be given it by
somebody who is recorded in it.

`UX-0006` **Frozen v1.1** §12B.1 and §16 carry the same rule into the
experience: reading the trail is Owner-only, and **writing to it is refused to
everyone, including the Owner**.

**Consequence for this document:** the exclusion is an input, not a decision.
Nothing in §9's open questions may be answered in a way that admits the tier to
the trail, including partially — see §9.3, where the tempting version of that
mistake is set out.

### 5.2 The personal-data rule binds the tier exactly as it binds the Owner

`PRD-0006` **Frozen v2.7 §23** is a Security Requirement, not a Feature: no
email address appears on any operational surface, and an address is revealed
only by a deliberate act, on one case, and that act is recorded.

A Sub-Admin is on operational surfaces all day. The rule therefore applies to
them without amendment, and the reveal act, when they perform it, is recorded
against them — which is one of the reasons the trail must record their acts even
though they may not read it (§7).

### 5.3 Admin authorization is not granted through the interface

`UX-0006` §16 refuses "Grant/remove Admin authorization in UI" to every column,
Owner included. Whatever this document decides about granting the tier (§9.4)
must either keep that rule or supersede it deliberately.

### 5.4 Suspending an Admin-authorized account is Owner-only

`UX-0006` §16 already reserves it. A tier that could suspend the accounts of
people who oversee it would be the same defect as §5.1 wearing different
clothes.

## 6. The tier, as proposed

A Sub-Admin is an authorization attached to an existing Enabled User Account, in
the same way the Admin authorization is (`PRD-0003`). It is not a separate kind
of account and creates no Business ownership.

**The proposed division is by consequence, not by screen.** An act belongs to
the Sub-Admin tier when its consequence is bounded and reversible by a person
who can see it; it belongs to the platform administrator when its consequence is
the platform's relationship with a partner, its record of itself, or its own
authority.

| Act                                                        | Proposed tier                               | Why                                                                                    |
| ---------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------- |
| Read the moderation queue; open a case                     | Sub-Admin                                   | The work being delegated                                                               |
| Hide and restore an Offering                               | Sub-Admin                                   | Bounded, reversible, and recorded                                                      |
| Request a correction; run a re-review                      | Sub-Admin                                   | A conversation with a partner, not a sanction                                          |
| Close a case; record a no-action decision                  | Sub-Admin                                   | The queue is unusable if it cannot be emptied                                          |
| Review, validate, enable, disable an affiliate destination | **Open — §9.1**                             | Enabling a handoff is the act that makes money; disabling one stops it                 |
| Restrict and restore a Business                            | Platform administrator                      | The platform's relationship with a partner                                             |
| Suspend and reinstate a User Account                       | Platform administrator                      | §5.4 already reserves the Admin-authorized case; this extends the reservation          |
| Reveal an email address on a case                          | Sub-Admin, recorded                         | §5.2. Refusing it would make cases unworkable; the record is what makes it safe        |
| Manage Categories and Attributes                           | Platform administrator                      | Taxonomy is the shape of the catalogue, and a wrong move is visible everywhere at once |
| Register, map or pause a partner feed (`F13`)              | Platform administrator                      | A feed is a standing agreement with a partner, not a piece of daily work               |
| Read the audit trail (`F14`)                               | **Never** — §5.1                            |                                                                                        |
| Grant or remove any authorization                          | **Never** by anyone in the interface — §5.3 |                                                                                        |

## 7. The tier in the audit trail

**Every act a Sub-Admin performs is recorded exactly as an Admin's act is.**
`PRD-0006` §22 already records the acting account for every act it covers, and
nothing about a narrower tier makes its acts less worth recording — the
opposite: delegated work is the work an owner most needs a record of.

The trail therefore gains no new mechanism and no new column. It gains people.

**The tier is recorded in the trail and cannot read it.** That asymmetry is the
whole point and should be stated plainly to anybody given the tier, at the
moment they are given it. A record kept secretly from the person it describes is
a different thing, ethically and legally, from a record they know exists and
cannot alter.

## 8. Technical precondition, before any tier code

`US-PLT-F14-001` **Frozen v0.1** §13 records that its `AC-1` — the trail is
reserved to the platform administrator — is today met by **a seam rather than a
boundary**. There is one Admin tier, so the check that would refuse a Sub-Admin
has nothing to refuse, and an authorization check that has never refused
anything has never been tested.

**That seam must become a boundary before the tier exists, not alongside it.**

> **Owner decision, 2026-09-07:** _"Sub-Admin katmanını inşa etmeden önce, o
> katmanı reddedecek güvenlik sınırını (AC-1) test edilebilir, sert bir duvara
> dönüştürmeliyiz. Sub-Admin geliştirmesindeki ilk kod artışı kesinlikle bu
> sınırı inşa etmek olacak."_
>
> The order below is therefore settled rather than proposed: the first increment
> of Sub-Admin development is the boundary, and it is delivered with a test that
> fails without it. No part of the tier is built in the same increment.

The order matters and is not a preference:

1. The refusal is written and proved by a test that fails without it.
2. Only then is the tier introduced.

Reversed, there is a window — a commit, an afternoon, a release — in which a
Sub-Admin exists and the trail's authorization is still a seam. `PRD-0006` §22.6
anticipated exactly this by requiring the audit surface to resolve its own
authority, so that a later Sub-Admin revision has **one place to change and a
reviewer has one name to look for**. This document is that later revision's
first half.

## 9. Open — the Owner's decisions

Each of these changes what the tier is. **§9.3 was decided on 2026-09-07 and is
kept here with its answer**; the rest are open.

### 9.1 May a Sub-Admin enable an affiliate destination?

Enabling a handoff is the act that makes the platform's money, and it is the
one delegable-looking act whose consequence is commercial rather than editorial.

Three positions, and each is defensible:

- **No.** Review and validation are delegable; enablement is the moment a
  partner starts earning and stays with the Owner.
- **Yes.** The three acts are deliberately separate (`UX-0006` §9) and splitting
  them across tiers reintroduces the bottleneck the separation was meant to make
  visible rather than to create.
- **Review and validate, not enable or disable.** The workload surface then
  shows the Owner a queue of "Ready to Enable", which is a smaller thing to look
  at than the whole queue.

### 9.2 May a Sub-Admin act on a partner they are connected to?

The platform has no notion of a conflict of interest today. If Sub-Admins are
ever recruited from, or connected to, partner businesses, the question becomes
real and the answer has to be in a document before it is in a policy.

### 9.3 May a Sub-Admin see their **own** acts in the trail? — **Decided: no**

> **Owner decision, 2026-09-07:** _"Sub-Admin kendi eylemlerini dahi
> görememeli. Kendi ayak izini görebilen bir aktör, sistemin neyi kaydetmediğini
> de çözebilir. Denetim izi paneli, platform yöneticisi (Owner) dışındaki
> herkese mutlak surette kapalı kalacak."_

The question is kept in place rather than deleted, because it is the version of
§5.1 that sounds reasonable, and a reader who meets it for the first time in six
months needs to find the answer where the question is.

"Let them see only their own entries" is still a view of the trail. Its costs
are specific: it tells a person which of their acts were recorded, which is the
information needed to work out what is **not** recorded; and it makes the
trail's authorization a filter rather than a refusal, which is a materially
weaker thing to get right and to review.

**The trail is closed to every account except the platform administrator, with
no partial view of any kind.** This is now an input to the tier's design, in the
same way §5.1 is, and it is no longer an open question.

### 9.4 Who grants the tier, and how?

Today nothing in the interface grants any authorization (§5.3), and the Admin
authorization is written by an operator command. That is workable for a handful
of Admins and does not obviously scale to moderators who join and leave.

Whatever is chosen, granting an authorization is itself an act, and an act that
changes who may act is the most consequential kind — it belongs in the trail.

### 9.5 What is the tier called, to the people who have it?

"Sub-Admin" is this document's working name and is a poor name for a person's
role. The name reaches the interface, so it is a product decision.

## 10. Related documents

- `PRD-0003-identity.md` — Admin authorization attaches to a User Account.
- `PRD-0006-platform.md` **Frozen v2.7** — §7 the acts; §22 the audit trail;
  §22.5 the exclusion this document must honour; §23 the personal-data rule.
- `UX-0006-admin-dashboard.md` **Frozen v1.1** — §12B the reading surface, §16
  the permissions matrix this document would revise.
- `US-PLT-F14-001-audit-trail-reading-and-export.md` **Frozen v0.1** — §13, the
  seam that must become a boundary first.
- `traceability.md` **Frozen v2.3** §5D.2 — why the personal-data rule has no
  Feature, which is the reasoning this document reuses in §5.2.

## 11. What approving this document would require

Recorded here so the size of the decision is visible before it is taken. This
document cannot be frozen alone:

- `PRD-0006` §22.5 and §22.6 — a superseding revision, because §22.5 says in as
  many words that admitting a tier is a revision of that section.
- `UX-0006` §16 — a superseding revision of the permissions matrix.
- `PRD-0003` — whatever §9.4 decides about granting.
- `PLATFORM_FEATURE_REGISTRY.md` — if any of the above becomes a Feature.

Freezing a subset would leave one document permitting what another forbids,
which is the defect the 2026-08-31 round was spent removing.
