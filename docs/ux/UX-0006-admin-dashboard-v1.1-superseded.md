# UX-0006 — Admin Dashboard

- **UX ID:** UX-0006
- **Title:** Admin Dashboard
- **Status:** Frozen
- **Version:** 1.1
- **Supersedes:** Frozen v1.0, preserved unchanged at
  `UX-0006-admin-dashboard-v1.0-superseded.md`
- **Approval Date:** 2026-09-07
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-09-07
- **Frozen By:** Product Owner / Architecture Owner
- **Scope level:** UX behaviour (non-visual, non-technical)

**Freeze Note (1.1):** Explicitly Frozen by the Product Owner / Architecture
Owner on 2026-09-07. Frozen v1.1 is the locked V1 UX baseline for UX-0006 —
Admin Dashboard. This exact version must not be edited in place. Any future
change requires a controlled revision under `DOCUMENT_LIFECYCLE.md`,
`REVIEW_PROCESS.md`, and, where architecture is affected, `ADR_PROCESS.md`.
Frozen v1.0 is preserved unchanged at
`UX-0006-admin-dashboard-v1.0-superseded.md`.

**Approval Note (1.1):** Explicitly approved by the Product Owner / Architecture
Owner on 2026-09-07 — _"UX-0006 v1.1 taslağını resmi olarak onaylıyorum."_
Approval and Freeze were taken in one decision. The Owner recorded his reasons
for three structural choices in the same message: the `12A`/`12B` numbering,
which keeps every existing section number and therefore every external reference
intact; the permission row that closes writing to the audit trail to everyone
including the Owner, which seals the immutability rule on paper as well as in
the database; and the reading restriction written before a Sub-Admin tier
exists, which removes a decision that would otherwise be taken under pressure.

**Revision Note (1.1):** Superseding revision of Frozen v1.0, begun
independently at Draft under `DOCUMENT_LIFECYCLE.md` §7. **It adds two sections
and amends three; it alters no existing behaviour.**

Frozen `traceability.md` v2.3 §5D.4 names the one gap this closes: `PLT F13`
(Feed Management) and `PLT F14` (Audit Trail Reading) were Frozen on 2026-09-07
with behaviour owners and Stories, and are the only two Admin surfaces in the
platform with no UX section. `PLATFORM_FEATURE_REGISTRY.md` v1.3 carries
"section pending" in their UX column; this revision is what discharges it.

**Both surfaces already exist and are in use.** `I76` built feed management and
`I84` built the audit reading surface. This document therefore records what they
do rather than proposing what they might do — with one exception, stated so it
is not mistaken for description: **§22's reading rules for `F14` are stricter
than the surface enforces today.** `US-PLT-F14-001` §13 records that `AC-1` is
met by a seam rather than a boundary, because the platform has one Admin tier
and no Sub-Admin exists yet to be refused. The rule is written here as the rule,
and the day a second tier is added it is the thing that must already have been
written down.

Three amendments to existing sections: §5.1 gains the two subareas, §16 gains
their permission rows — including the row that distinguishes them — and §18
gains the two Stories and the registry.

**Nothing in §§6–12 changes.** The two new sections are numbered 12A and 12B
rather than inserted as 13 and 14, so that every existing section number in this
document, and every reference to one from another document, still points at the
same content.

**Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-22. Frozen v1.0 is the locked V1 UX baseline for UX-0006 — Admin Dashboard. This exact version must not be edited in place. Any future change requires a controlled revision under `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, and, where architecture is affected, `ADR_PROCESS.md`. This Freeze does not automatically revise User Stories, traceability, repository indexes, or GitHub content.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-22 after Architecture Review, Final Review, package-level reconciliation, independent Claude UX audit, and focused delta audit. The exact In Review v0.4 content becomes the authoritative UX baseline as Approved v1.0 under the first-approval versioning rule. This historical Approval Note records that approval and Freeze were separate decisions. The document was subsequently Frozen on 2026-07-22. User Stories, traceability, repository indexes, and GitHub content do not change automatically.

**Revision Note (0.4):** Focused independent-audit correction for UX-A01. Declares reachable Admin Dashboard entry from UX-0008 using an Enabled User Account with existing Admin authorization and hands Logout execution back to UX-0008. No Admin action, authorization, moderation, or analytics behaviour changes.

**Revision Note (0.3):** Controlled revision against Frozen PRD-0001 v3.1, PRD-0003 v3.1, PRD-0005 v1.3, and PRD-0006 v2.1. Removes obsolete Active/Hidden/Archived case states, generic Platform Configuration, and unresolved provisioning TODOs. Defines Open/Closed General Moderation cases, the exact seven actions, bounded correction re-review, separate Affiliate Destination Administration, Category/Domain and Attribute management, Basic Analytics, Owner-only authorization boundaries, and target-state-safe errors.

> This document defines experience behaviour only. It does not define target states, product transitions, visual style, analytics implementation, components, APIs, storage, or Admin provisioning technology.

---

## 1. Purpose

Admin Dashboard gives an authorized Admin an actionable operational view for General Moderation, Affiliate Destination Administration, Category and Attribute management, and Basic Analytics without inventing states or a generic settings surface.

## 2. Business Value

The experience supports trust and operational clarity by guiding the Admin from authoritative workload to an approved action and visible result.

## 3. Scope

- Admin-context entry;
- action guidance;
- General Moderation cases;
- Open and Closed case status;
- exact seven General Moderation actions;
- Request Correction and re-review;
- separate Affiliate Destination Administration;
- Category and Domain management;
- Attribute-definition management and mutation-safety feedback;
- Admin-facing Basic Analytics;
- approved time periods and Domain grouping;
- ordinary Admin and Owner-only boundaries;
- loading, empty, validation, and error behaviour.

## 4. Out of Scope

- Admin authorization grant/removal UI;
- separate Admin account;
- Admin tiers or delegation;
- generic Platform Settings or Configuration;
- Offering archive by Admin;
- Draft publication by Admin;
- Business or Offering state invention;
- Messaging moderation;
- payment, billing, CRM, marketing, or recommendations;
- automated moderation;
- analytics implementation or external-success inference.

## 5. Entry Points and Conditions

### 5.1 Entry Points

UX-0006 may be entered when UX-0008 sends:

- one Enabled authenticated User context;
- an existing Admin authorization relationship;
- an explicit person choice to enter Admin context.

UX-0006 may resume from one of its own Admin subareas while preserving the same authorized Admin context. Its subareas include Feed Management (§12A) and Audit Trail Reading (§12B); the second is reachable only by the platform administrator, per §12B.1.

Audit Trail Reading may also be entered by an address carrying filters (§12B.2). The entry conditions in §5.2 are evaluated first: a filtered address is a view of the trail, not a way into it.

Logout requested from UX-0006 is handed to UX-0008 for execution.

### 5.2 Entry Conditions

Admin Dashboard opens only when:

```text
User Account access status = Enabled
AND
Admin authorization is present
AND
Admin context is explicitly entered
```

UX-0006 reevaluates these conditions on entry.

Admin authorization attaches to the existing User Account.

It does not create Business ownership.

## 6. Admin Overview

The overview provides:

- actionable General Moderation workload;
- Affiliate Destination Administration workload;
- Category and Attribute management entry;
- Basic Analytics;
- clear separation between informational indicators and action queues.

No generic configuration area is shown.

## 7. General Moderation Cases

### 7.1 Case status

Authoritative case statuses:

```text
Open
Closed
```

Opening or reviewing a case changes no target state.

### 7.2 Approved targets

Request Correction may target:

- Business Information;
- Offering content;
- Affiliate Destination configuration;
- Direct Contact information.

User Account correction is absent.

### 7.3 Exact action set

The seven General Moderation actions are:

1. Request Correction;
2. Hide Offering;
3. Restore Offering;
4. Restrict Business;
5. Restore Business;
6. Suspend User;
7. Reinstate User.

The experience presents only actions currently valid for the target state and authority.

### 7.4 Action consequences

The Dashboard explains and then consumes the result owned by the target PRD.

It does not redefine the result.

Examples:

- Hide Offering: Published → Hidden;
- Restore Offering: Hidden → Published;
- Restrict Business: Unrestricted → Restricted;
- Restore Business: Restricted → Unrestricted;
- Suspend User: Enabled → Suspended;
- Reinstate User: Suspended → Enabled.

### 7.5 Case closure

An Admin may close an Open case after:

- an approved action; or
- a no-action decision.

Closing a case creates no target state.

## 8. Request Correction and Re-Review

Request Correction:

- keeps the case Open;
- changes no lifecycle, moderation, access, or eligibility state by itself;
- creates a correction notice in UX-0005;
- creates no Messaging.

For a Restricted Business bounded Offering correction:

- the exact target and content area are visible;
- the Business owner may use the bounded path through UX-0005;
- the case remains Open after owner edit;
- Admin re-review is required;
- closure remains an explicit Admin action after re-review.

The bounded owner response is not an eighth General Moderation action.

## 9. Affiliate Destination Administration

This is separate from General Moderation.

Approved actions:

- Review;
- Validate;
- Enable;
- Disable.

### Workload

```text
Draft + Not Validated → Needs Validation
Draft + Invalid → Business Correction Needed
Draft + Valid → Ready to Enable
Enabled or Disabled → no pending item
```

### Results

- Review changes no state by itself.
- Validate produces Valid or Invalid.
- Enable requires Valid and produces Enabled/Handoff Eligible.
- Disable produces Disabled/Handoff Ineligible and preserves validation result.

The experience does not recalculate destination states or Handoff Eligibility.

## 10. Category and Domain Management

The Admin may:

- create a root Category with exactly one V1 Domain;
- create a child Category;
- rename a Category;
- reparent within the same Domain;
- retire a Category where permitted.

V1 Domains:

```text
Mobility
Real Estate
Technology
```

The experience prevents:

- self-ancestor hierarchy;
- cross-Domain reparenting;
- root Domain change after child or Offering use;
- retirement while Draft, Published, or Hidden Offering remains assigned;
- retirement while an active child remains.

Archived historical association does not block retirement.

## 11. Attribute Management

The Admin may manage:

- non-empty display name;
- value kind;
- optional Number unit;
- allowed Single/Multi Select values;
- applicable Categories;
- required-for-publication;
- filterable;
- comparable.

Value kinds:

```text
Text
Number
Boolean
Single Select
Multi Select
```

The experience prevents or explains mutation-safety violations, including:

- making an Attribute required while a Published/Hidden Offering lacks a value;
- removing applicability while active lifecycle Offerings contain values;
- changing value kind while active lifecycle Offerings contain values;
- changing/removing used Select values;
- silently deleting existing values;
- making Text filterable.

## 12. Basic Analytics

### 12.1 Periods

- Today;
- Last 7 days;
- Last 30 days;
- All time.

### 12.2 Grouping

Indicators appear:

- overall;
- by Mobility, Real Estate, and Technology where the source provides Domain association.

Free-text Search wording is not used to infer Domain.

### 12.3 Current-state indicators

- User Accounts by Enabled/Suspended;
- Businesses by Unrestricted/Restricted;
- Offerings by Draft/Published/Hidden/Archived;
- Offerings by final public eligibility;
- Affiliate Destinations by status, validation, and Handoff Eligibility;
- General Moderation cases by Open/Closed and Open target type;
- Affiliate workload categories.

### 12.4 Core-flow indicators

- Discovery Starts;
- Offering Presentation Opens;
- Compare Starts;
- Decision Chat Starts;
- Affiliate Handoff Completion count;
- Direct Contact Completion count.

Completion is not presented as purchase, sale, contract, response, or external success.

### 12.5 Action handoff

Actionable indicators may open the relevant queue or management area.

Informational indicators need not be interactive.

## 12A. Feed Management

The surface where an Admin registers a partner's product document, sets how its
fields are read, pauses it, and reads what each run did. Behaviour owner:
`PRD-0006` v2.6 §24. Story: `US-PLT-F13-001` v0.2.

**What it is not** is the more useful half of the definition. This surface
configures an intake; it does not curate a catalogue. It creates no listing,
publishes no listing, and changes no word a person wrote. A feed reaches only
price and stock, and only on a listing that is already published and already
matched — `PRD-0001` v4.2 §5.11.1 owns that boundary and this experience
neither widens nor restates it.

### 12A.1 Registering a feed

A registration carries five things and no more:

```text
the partner the feed may touch
the heading its products are filed under
the document address
the document format
the field mapping
```

**The mapping is a closed list.** It names which field in the partner's document
carries the identifier, the title, the price, the currency, the stock and the
product key — the fields §24.1 names, and nothing else. A mapping carrying any
other key is refused rather than stored and ignored.

The reason is worth stating in a UX document, because it is the difference the
person filling the form experiences: an unnamed key that is quietly dropped
looks like it was accepted, and the Admin learns otherwise weeks later from a
column that was never read. A refusal is the only outcome that reaches them
while they are still looking at the form.

The mapping's help text says which fields are required. Where the document's
product list can be found automatically, the path is optional and says so.

### 12A.2 Pausing

An Admin may pause a running feed and start a paused one.

```text
Active   → read on the schedule
Paused   → not read at all
```

**Pausing withdraws nothing.** Every listing keeps its lifecycle state, its
price, its stock and its public eligibility exactly as the last run left them.
The surface says so where the pause is offered, because "pause" is a word a
person can reasonably read as "take these down", and the two would be very
different acts.

### 12A.3 Reading a run

Every run is recorded with its outcome, its start and its finish. A run that
succeeded reports four numbers:

```text
read      — products in the document
updated   — listings whose price or stock changed
skipped   — products the platform does not carry, or whose listing is not published
rejected  — rows the run could not use
```

**Skipped and rejected must not be presented as one number.** A partner's
document is their whole catalogue and the platform carries a part of it, so a
healthy run skips most of what it reads. Folded into "rejected", every run would
look broken, and the one row that genuinely needs reading would sit inside four
thousand ordinary ones.

Refusals are shown as a bounded sample with a reason for each, beside the full
count. The count is never the sample size: a surface that showed twenty
refusals when there were four hundred would be lying by omission.

### 12A.4 Reading a failure

A failed run says **what kind** of failure it was, and the kind is separate from
the message:

```text
the partner's server could not be reached
the document arrived and could not be read
the mapping fits nothing in the document
a failure that could not be classified
```

The message keeps the partner's own words — often their server's. The kind
answers the question an Admin actually decides in the first seconds: whose job
this is. The first belongs to the partner's engineer, the second to whoever
publishes their document, the third to the Admin's own mapping.

**A failure that cannot be classified is named as such rather than hidden.** An
unexplained failure that says nothing is worse than one that admits it does not
know, because the first invites an Admin to invent an explanation.

A document that parses and yields nothing usable is a failure, not a success
with refusals. A run reported green beside a feed that has updated nothing for a
week is the shape in which a misconfigured feed looks healthy.

### 12A.5 Empty, loading, error

- No feed registered yet is stated as a fact, not as an error.
- A feed that has never run says so, rather than showing an empty history.
- A feed list that cannot be read says the reading failed. It does not present
  an empty list, which would read as "no feeds" and is a different claim.
- A registration that is refused says which of the partner, the heading and the
  address to check.

### 12A.6 Not in this surface

- Creating, publishing, retiring or editing any listing.
- Anything a feed may write beyond price and stock.
- Any disclosure of a feed, a run, a mapping or a refusal outside an authorized
  active Admin context.

## 12B. Audit Trail Reading

The surface where the platform administrator reads what Admins have done.
Behaviour owner: `PRD-0006` v2.6 §22, and §22.6 for this surface. Story:
`US-PLT-F14-001` v0.1.

### 12B.1 Who may read it

**The platform administrator, and no one else.** §22.5 excludes every future
Sub-Admin or moderator tier from this trail, and the exclusion is part of the
experience rather than a technical footnote: a trail readable by the people it
records is not an audit trail.

The platform has one Admin tier today, so there is currently no tier to refuse.
This rule is written in advance deliberately. The moment a second tier is added,
the question "may they read the trail?" must already have an answer, because
that is not a question anybody wants to answer under time pressure while
building the tier.

### 12B.2 Reading

Entries are returned **newest first**, paged, and every page states the total
number matching the current filters — not the number on the page. A reader who
cannot see the total cannot tell a narrow filter from an empty trail.

Filters may be combined freely:

```text
the acting account
the act
a date range
```

The act filter offers only the acts §22.2 names. It is a closed list for the
same reason the feed mapping is: an act the trail does not record is not a
filter that returns nothing, it is a question the surface should not have
allowed.

**The filters live in the address of the view.** Opening the same address
reproduces the same view — which is what makes a finding shareable, citable in a
case, and returnable to.

With no range given, the last thirty days are shown, and the surface says that
is what is being shown. A range reaches back **without limit**: the trail is
never swept, so an entry of any age is returnable, and a reader who narrows to
last year gets last year rather than nothing.

The end of a range means the whole of the day it names. A person who types
today's date and gets nothing from today has been given a correct answer to a
question they did not ask.

### 12B.3 Exporting

The export contains exactly the entries the current filters match, and no
others.

**Where the export would be truncated, the surface says so before it is taken.**
An export that silently stops short is worse than no export at all, because it
looks complete — and it is the file somebody will later attach to something that
matters.

### 12B.4 What the trail never shows

No email address and no personal name appears in this view or in its export
(§23.3). Accounts are identified the way every other operational surface
identifies them.

This is the personal-data rule applied here, not a rule of this surface. It has
no Feature of its own by the Owner's decision, precisely because it binds every
operational surface rather than describing one.

### 12B.5 Reading is not writing

- The surface offers no operation that writes, edits or removes an entry. There
  is no such control to find, not a control that refuses.
- **Reading the trail records nothing in the trail.** A read that wrote an entry
  would make the trail grow by being looked at, and the record of Admin acts
  would fill with the act of reading it.
- The surface states that entries are never deleted and cannot be altered at the
  database. The immutability is the reason the trail is worth reading, so it is
  said where it is read rather than left in an engineering document.

### 12B.6 Empty, loading, error

- No entry matching the filters is stated as a fact about the filters.
- A trail that cannot be read says the reading failed, and does not show an
  empty table — which would say "nothing has happened", the most misleading
  sentence this surface could produce.

## 13. User and Owner Authority Boundaries

Ordinary Admin may suspend or reinstate only non-Admin-authorized User Accounts.

Ordinary Admin may not suspend or reinstate an Admin-authorized account.

Only Product Owner / Architecture Owner may:

- establish first Admin;
- grant/remove Admin authorization;
- suspend/reinstate an Admin-authorized account.

These Owner actions occur outside the V1 Admin UI.

## 14. Empty and Loading Behaviour

- no Open cases: identify that no current General Moderation case needs action;
- no Affiliate workload: do not create a General Moderation substitute;
- no analytics data: distinguish zero from unavailable;
- loading: preserve selected period, queue, and target context;
- actions remain unavailable until authoritative target state is resolved.

## 15. Error Behaviour

- failed action does not claim a target transition;
- failed close leaves the case Open;
- failed Category/Attribute change preserves the last confirmed definition;
- failed validation does not claim Valid/Invalid;
- unauthorized Admin-authorized account suspension is rejected;
- analytics failure does not block unrelated moderation actions where their data is available.

## 16. Permissions

| Action                                               | Guest | User | Business | Ordinary Admin | Product Owner / Architecture Owner |
| ---------------------------------------------------- | ----: | ---: | -------: | -------------: | ---------------------------------: |
| Enter Admin Dashboard                                |     ✗ |    ✗ |        ✗ |              ✓ |                                  ✓ |
| View Basic Analytics                                 |     ✗ |    ✗ |        ✗ |              ✓ |                                  ✓ |
| Use seven General Moderation actions                 |     ✗ |    ✗ |        ✗ |    Conditional |                        Conditional |
| Suspend/Reinstate Admin-authorized User              |     ✗ |    ✗ |        ✗ |              ✗ |                         Owner only |
| Review/Validate/Enable/Disable Affiliate Destination |     ✗ |    ✗ |        ✗ |    Conditional |                        Conditional |
| Manage Categories                                    |     ✗ |    ✗ |        ✗ |              ✓ |                                  ✓ |
| Manage Attributes                                    |     ✗ |    ✗ |        ✗ |              ✓ |                                  ✓ |
| Register, map or pause a partner feed                |     ✗ |    ✗ |        ✗ |              ✓ |                                  ✓ |
| Read feed runs and refusals                          |     ✗ |    ✗ |        ✗ |              ✓ |                                  ✓ |
| Read or export the Admin audit trail                 |     ✗ |    ✗ |        ✗ |              ✗ |                         Owner only |
| Write, edit or remove an audit entry                 |     ✗ |    ✗ |        ✗ |              ✗ |                                  ✗ |
| Grant/remove Admin authorization in UI               |     ✗ |    ✗ |        ✗ |              ✗ |                                  ✗ |
| Use generic Platform Settings                        |     ✗ |    ✗ |        ✗ |              ✗ |                                  ✗ |
| Use Messaging moderation                             |     ✗ |    ✗ |        ✗ |              ✗ |                                  ✗ |

Two rows above say something the others do not, and both are deliberate.

**Reading the audit trail is Owner-only**, unlike every other Admin capability in this table. §22.5 excludes any future Sub-Admin or moderator tier. The platform has one Admin tier today, so the row describes a boundary with nothing yet on the far side of it; it is written now so that adding a tier is a decision about that tier and not a rediscovery of this rule.

**Writing to the trail is refused to everyone, including the Owner.** It is not an authority anybody holds. The trail is append-only at the database, and no interface in this document offers a control that edits or removes an entry.

## 17. Accessibility Requirements

- Current Admin context, selected queue, case status, target identity, and selected period are perceivable.
- Action names and their expected target effect are explicit.
- Confirmation for consequential actions is understandable and keyboard operable.
- Validation and mutation-safety errors identify the blocked rule.
- Tables and indicator groups have meaningful headers and reading order.
- State changes and failed actions are announced.
- Focus returns to a predictable location after action or case closure.

## 18. Related Documents

- `PRD-0001-offering.md` — Offering and Affiliate Destination results.
- `PRD-0003-identity.md` — Admin authorization and suspension boundaries.
- `PRD-0005-business.md` — Business status and correction response.
- `PRD-0006-platform.md` — Admin action surface, queues, management, analytics.
- `UX-0005-business-dashboard.md` — Business correction notice and bounded response.
- `UX-0008-authentication.md` — authenticated Admin-context entry and Logout execution.
- `PRD-0006-platform.md` v2.6 §22 — the Admin audit trail: what is recorded, that it is append-only, who may read it, and that it is never swept; §22.6 owns the reading surface.
- `PRD-0006-platform.md` v2.6 §23 — personal data on Admin surfaces, as a Security Requirement. It has no Feature by the Owner's decision; §12B.4 applies it here.
- `PRD-0006-platform.md` v2.6 §24 — Admin feed management, and §24.1 the closed field list.
- `PRD-0001-offering.md` v4.2 §5.11.1 — what a feed intake may touch. §12A does not restate it.
- `US-PLT-F13-001-feed-management.md` v0.2 — Feed Management. The authoritative version is **v0.2**; Frozen v0.1 is preserved with a statement about the code that was wrong.
- `US-PLT-F14-001-audit-trail-reading-and-export.md` v0.1 — Audit Trail Reading and export.
- `PLATFORM_FEATURE_REGISTRY.md` v1.3 — `F13` and `F14`, and the record that no Feature is allocated for §23.
- `traceability.md` v2.3 §5D — the chains these two sections complete.

## 19. Acceptance Criteria

```gherkin
Scenario: Reach Admin Dashboard from Authentication
  Given an Enabled User Account has Admin authorization
  When the person explicitly chooses Admin context through UX-0008
  Then UX-0006 receives that authorized context
  And the Admin Dashboard may open

Scenario: Logout returns to Authentication owner
  Given the Admin Dashboard is open
  When the person requests Logout
  Then UX-0008 executes Logout
  And UX-0006 does not retain Admin context

Scenario: Admin Panel requires authorized Enabled account
  Given an account lacks Admin authorization or is Suspended
  When Admin Dashboard entry is attempted
  Then the Admin experience is unavailable

Scenario: General Moderation uses Open and Closed
  Given a moderation case exists
  When its status is presented
  Then the value is Open or Closed
  And no Active, Hidden, or Archived case status is used

Scenario: Exact seven actions are available conditionally
  Given an Open case
  When valid actions are presented
  Then only Request Correction, Hide Offering, Restore Offering, Restrict Business, Restore Business, Suspend User, or Reinstate User may appear
  And target-state conditions determine availability

Scenario: Request Correction requires re-review
  Given Request Correction is applied
  When the Business owner submits a correction
  Then the case remains Open
  And Admin re-review is required
  And no Messaging flow exists

Scenario: Affiliate administration is separate
  Given an Affiliate Destination workload item
  When the Admin opens it
  Then Review, Validate, Enable, and Disable belong to the separate administration family
  And no eighth General Moderation action is created

Scenario: Category cannot cross Domains
  Given a Category belongs to Mobility
  When the Admin attempts to reparent it under Technology
  Then the change is rejected

Scenario: Required Attribute activation is blocked safely
  Given a Published Offering lacks a value
  When the Admin attempts to make the Attribute required
  Then the change is rejected
  And the Offering remains unchanged

Scenario: Basic Analytics uses approved periods
  Given Basic Analytics
  When the period control is available
  Then Today, Last 7 days, Last 30 days, and All time are the available product periods

Scenario: Ordinary Admin cannot suspend Admin-authorized account
  Given a target User Account carries Admin authorization
  When an ordinary Admin attempts Suspend User
  Then the action is unavailable or rejected
  And Admin authorization remains unchanged

Scenario: Generic Platform Configuration is absent
  Given the Admin Dashboard
  When primary areas are presented
  Then no generic Settings or Platform Configuration area exists
```

### 19A. Feed Management and Audit Trail Reading (1.1)

```gherkin
Scenario: A mapping key nobody named is refused, not ignored
  Given an Admin is registering a partner feed
  When the mapping carries a field name §24.1 does not list
  Then the registration is refused
  And the refusal reaches the Admin while the form is still open

Scenario: Pausing a feed takes nothing down
  Given a running feed maintains the price of published listings
  When an Admin pauses it
  Then the feed is not read on the schedule
  And every listing keeps its lifecycle state and public eligibility
  And the surface says so where the pause is offered

Scenario: A healthy run does not look broken
  Given a partner document carries the partner's whole catalogue
  When a run updates the listings the platform carries and passes over the rest
  Then passed over and refused are reported as separate numbers
  And the run is not presented as a failure

Scenario: A failed run says whose job it is
  Given a run has failed
  When an Admin reads it
  Then the kind of failure is stated separately from the message
  And the kind distinguishes the partner's server, the document, and the mapping

Scenario: A document that yields nothing is a failure
  Given a partner document parses and every row is unusable
  When the run finishes
  Then the run is recorded as failed
  And it is not recorded as a success carrying refusals

Scenario: Refusals are sampled and the true count is shown
  Given a run refused more rows than the surface displays
  When an Admin reads the refusals
  Then a bounded sample is shown with a reason for each
  And the full refusal count is shown beside it

Scenario: The audit trail is not readable by a tier §22.5 excludes
  Given a caller is not the platform administrator
  When the caller requests the audit trail or its export
  Then the request is refused

Scenario: A filtered view is reproducible
  Given the platform administrator has narrowed the trail by account, act and date
  When the same address is opened again
  Then the same view is reproduced

Scenario: The default window is stated
  Given no date range is given
  When the trail is read
  Then the last thirty days are shown
  And the surface says that is what is being shown

Scenario: A range has no floor
  Given an entry is older than any retention period other tables use
  When a range reaching that far back is given
  Then the entry is returned

Scenario: The end of a range is the whole of its day
  Given a range ends on a named day
  When entries from later in that day exist
  Then they are returned

Scenario: An export says when it would be short
  Given the current filters match more entries than an export may carry
  When the export is offered
  Then the surface says the file would be truncated before it is taken

Scenario: Reading the trail writes nothing to it
  Given the platform administrator reads or exports the trail
  When the read completes
  Then no entry is recorded for the read

Scenario: No surface offers to change an entry
  Given the platform administrator is reading the trail
  When the available operations are examined
  Then no operation writes, edits or removes an entry

Scenario: No personal identifier appears
  Given entries name the accounts that acted
  When the trail is read or exported
  Then no email address and no personal name appears in either
```

## 20. Accepted UX Deferrals

The following do not block review:

- exact dashboard layout;
- technical analytics instrumentation;
- technical Admin provisioning;
- exact confirmation copy;
- bulk administration;
- visual chart form;
- technical queue retrieval.

No deferral may add generic settings, automated moderation, unapproved actions, Messaging, Admin tiers, or authority beyond Frozen PRDs.
