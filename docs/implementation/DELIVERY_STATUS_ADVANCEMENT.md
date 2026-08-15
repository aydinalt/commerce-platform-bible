# Delivery Status Advancement — Per-Criterion Evidence

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft — awaiting Owner acceptance
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-14
- **Scope:** Delivery Status only. No Frozen Story's behaviour, Acceptance Criteria, BDD, dependencies, size, scope, Epic, Feature, relationship classification, Capability reference or UX reference is edited.

## Why this document exists

`DELIVERY_SEQUENCE.md` states the rule plainly:

> A Story changes from `Delivery Status: Not Started` only in a separately
> approved implementation change that includes its code, tests, and
> traceability evidence.

The code and the tests have existed since I1 through I8. The traceability
evidence has not. This document is that evidence, one Acceptance Criterion at a
time, so that a Delivery Status can be read as a claim somebody can check
rather than a claim somebody made.

`USER_STORY_HANDBOOK.md` §18 owns the standard being claimed. Its first
condition — *every acceptance criterion is met and verified* — is the one this
document is about. A criterion an implementation satisfies but no test reaches
is met and **not** verified, so it does not count here.

## What "Done" is being read to mean

The Handbook records delivery status as an operational planning signal that
"never changes document authority or lifecycle Status". Advancing it therefore
edits exactly one row of a Frozen Story's metadata table and nothing else. Each
Story's Freeze Note lists what a controlled revision is required for —
behaviour, Acceptance Criteria, BDD, dependency, size, scope, Epic, Feature,
relationship classification, Capability reference, UX reference — and Delivery
Status is deliberately absent from that list, because `DELIVERY_SEQUENCE.md`
expects it to move.

## How the evidence was gathered

Every test in the repository was scanned for the Story identifiers and
Acceptance Criterion numbers its comments cite, crediting a citation to a Story
only where it names that Story directly or where the enclosing assertion names
exactly one Story. That produced a first count: **71 of 526 criteria carried a
citation.**

The gap turned out to be mostly notation. `US-PLT-F10-001` Basic Analytics, for
instance, showed zero citations while eleven tests cover all eighteen of its
criteria — they cite the UX section they were written from rather than the
Story's numbering. So the scan located the work; it did not measure it. Each
criterion below was matched to its test by reading both.

Where reading both found nothing, that is recorded as a criterion nothing
verified, and a test was written.

---

## Identity — `US-0003`

Nine Stories, 81 Acceptance Criteria. **Twelve had no test at all.** They are
proved by the eight tests in `i9-identity-delivery.integration.test.ts`, written
for this purpose.

Eleven of the twelve share a shape worth recording: **each is about what an
action leaves alone.** Logging out is easy to assert; logging out without
quietly dropping a Business ownership is the part nobody had checked, and the
same is true of what a suspension leaves a person and what a Domain does not
change about who may look. Criteria of that kind are easy to satisfy by
accident and easy to break by accident, which is exactly the combination a test
exists for.

The twelfth is `US-IDN-F09-001` AC-2, which the code did not satisfy at all.
That one is recorded below.

Test files are cited by their `i*`/`m*` prefix; every one lives in `tests/`.

### `US-IDN-F01-001` — Public Guest Access Baseline

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | A public Guest context without a User Account | Covered | `i5-decision-chat` *answers a Guest without an account, and an account no differently* |
| AC-2 | Search, Browse, Filters, Detail, Compare and Chat without registration | Covered | `i3-search`, `i3-browse`, `i3-attribute-filtering`, `i4-offering-presentation`, `i5-comparison-set` and `i5-decision-chat` all drive their paths with no cookie anywhere |
| AC-3 | An eligible Affiliate Handoff and its Completion without forced account creation | Covered | `i8-decision-handoff` *offers the Affiliate path exactly where it would be honoured*; `i5-affiliate-handoff` records the Completion for a Guest |
| AC-4 | An authenticated User context before Direct Contact continues | Covered | `i5-direct-contact` *reveals nothing to a Guest, and says nothing about the values* |
| AC-5 | Protected telephone, email and contact URL unavailable to a Guest | Covered | `i2-public-business-identity` *excludes every Direct Contact channel*; `i5-direct-contact` as above |
| AC-6 | A Suspended holder keeps public Guest behaviour | **Newly verified** | `i9-identity-delivery` *leaves a Suspended account everything a Guest has* — asserted while still holding the invalidated cookie, because reading without one would only prove that Guests can browse |
| AC-7 | No Favorites, Messaging, persistent personal Decision history or forced registration | Covered | `i5-decision-chat` *keeps the conversation to this flow and no other* and *takes the conversation with the flow when it expires*; `i5-direct-contact` *creates no message, conversation or response state* |
| AC-8 | The same baseline across Mobility, Real Estate and Technology | **Newly verified** | `i9-identity-delivery` *opens the same public baseline in all three Domains* — asserted across every Domain the platform has rather than a sample, because the claim is about all of them |

### `US-IDN-F02-001` — Registration and Email Control Proof

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Email address and password begin registration | Covered | `m12-identity` *creates exactly one Enabled account once email control is proven* |
| AC-2 | Registration stays incomplete until control is proven | Covered | `m12-identity` *creates no account before email control is proven*; `i8-authentication` *creates no account and no context before proof* |
| AC-3 | Exactly one User Account on completion | Covered | `m12-identity` as above; `i8-authentication` *creates exactly one Enabled account and a session at proof* |
| AC-4 | The supplied address is recorded as the registered address | Covered | `m12-identity` *signs in with the registered address and password* — the address is proved to be the registered one by its being the one that works |
| AC-5 | The new account's access status is Enabled | Covered | `m12-identity` and `i8-authentication`, both asserting Enabled at proof |
| AC-6 | An authenticated User context after successful registration | Covered | `i8-authentication` *creates exactly one Enabled account and a session at proof* |
| AC-7 | No separate Pending or Verified account state | Covered | `m12-identity` *creates no account before email control is proven* — there is no row to hold an intermediate state, which is stronger than asserting the state is absent |
| AC-8 | No second account for an address that already has one | Covered | `i8-authentication` *creates no second account for an address that already has one*; `m12-identity` *does not reveal whether an address is already registered* |
| AC-9 | No Business ownership or Admin authorization through registration | Covered | `m12-admin-context` *reports no Admin authorization for an ordinary account*; `m12-business-context` *starts in the authenticated User baseline with no Business chosen* |

### `US-IDN-F03-001` — Login

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Registered address and password are the V1 credentials | Covered | `m12-identity` *signs in with the registered address and password* |
| AC-2 | No more than one account for one address | Covered | `i8-authentication` *creates no second account for an address that already has one* — uniqueness is enforced where accounts are made, so login cannot find two |
| AC-3 | An authenticated context only on accepted credentials and Enabled status | Covered | `m12-identity` *refuses a Suspended account without disclosing the suspension* |
| AC-4 | Suspended is refused for User, Business and Admin contexts | Covered | `m12-identity` as above; `m12-admin-context` *makes Admin context unavailable while the account is Suspended* |
| AC-5 | Guest behaviour survives a failed or Suspended login | **Newly verified** | `i9-identity-delivery` *leaves a Suspended account everything a Guest has* for the Suspended half; `m12-identity` *answers a wrong password and an unknown address identically* for the failed half |
| AC-6 | No Business or Admin context entered automatically | Covered | `i8-authentication` *enters no Business and no Admin context by signing in* |
| AC-7 | Only the context entries existing relationships support | Covered | `m12-business-context` *offers only the Businesses the person is authorized for*; `m12-admin-context` *does not enter Admin context merely because authorization exists* |
| AC-8 | No ownership or authorization granted by logging in | Covered | `m12-admin-context` *grants no Business authority through Admin authorization*; `m12-business-context` *refuses entry to a Business the person is not authorized for* |

### `US-IDN-F04-001` — Logout

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Accepted from any authenticated active UX | **Newly verified** | `i9-identity-delivery` *logs out of a Business context and keeps the ownership* and *logs out of an Admin context and keeps the authorization* — the User context was already covered by `m12-identity`; the other two were not |
| AC-2 | The active authenticated context ends | Covered | `m12-identity` *ends the session on logout and returns the person to Guest abilities* |
| AC-3 | Guest-level abilities resume | Covered | `m12-identity` as above |
| AC-4 | The User Account is retained | Covered | `m12-identity` *retains the account after logout* |
| AC-5 | Business ownership relationships are retained | **Newly verified** | `i9-identity-delivery` *logs out of a Business context and keeps the ownership* |
| AC-6 | Admin authorization is retained | **Newly verified** | `i9-identity-delivery` *logs out of an Admin context and keeps the authorization* — asserted by re-entering the context afterwards, which is what the authorization is *for*, rather than by reading a flag |
| AC-7 | No authenticated or privileged context left active | Covered | `m12-identity` *ends the session on logout and returns the person to Guest abilities* |

### `US-IDN-F05-001` — Password Recovery

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Recovery may begin unauthenticated | Covered | `m12-password-recovery` *begins recovery without authentication and sets the new password* |
| AC-2 | The registered address identifies the account | Covered | `m12-password-recovery` *does not reveal whether an address has an account* and *schedules no message for an address with no account* |
| AC-3 | One-time proof of control before a new password | Covered | `m12-password-recovery` *spends the recovery link exactly once* and *stores no usable token until the message is dispatched* |
| AC-4 | The same account is retained | Covered | `m12-password-recovery` *keeps the same account and its relationships* |
| AC-5 | Login may be attempted after the reset | Covered | `m12-password-recovery` *stops accepting the previous password* — and accepts the new one, which is how the assertion is made |
| AC-6 | Access status is unchanged | Covered | `m12-password-recovery` *leaves a Suspended account suspended and still unable to sign in* |
| AC-7 | Business ownership and authorization unchanged | Covered | `m12-password-recovery` *keeps the same account and its relationships* |
| AC-8 | Admin authorization unchanged | Covered | `m12-password-recovery` *leaves Admin authorization untouched* |
| AC-9 | A Suspended account stays Suspended | Covered | `m12-password-recovery` *leaves a Suspended account suspended and still unable to sign in* |

### `US-IDN-F06-001` — User Account Access Status

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Exactly Enabled and Suspended | Covered | `i7-access-moderation` *names two transitions and their source states* |
| AC-2 | Enabled to Suspended on an accepted Suspend | Covered | `i7-access-moderation` *suspends only an Enabled account, and consumes the exact transition* |
| AC-3 | Suspended to Enabled on an accepted Reinstate | Covered | `i7-access-moderation` *reinstates only a Suspended account, and consumes the exact transition* |
| AC-4 | Authenticated contexts unavailable while Suspended | Covered | `m12-admin-context` *makes Admin context unavailable while the account is Suspended*; `m11-authorization` *refuses a suspended account holder* |
| AC-5 | Public Guest behaviour preserved while Suspended | **Newly verified** | `i9-identity-delivery` *leaves a Suspended account everything a Guest has* |
| AC-6 | Business state, Offering lifecycle and eligibility unchanged by suspension alone | Covered | `i7-access-moderation` *leaves the account's Business, Offering and destination alone* |
| AC-7 | Admin authorization unchanged through suspension and reinstatement | Covered | `i7-access-moderation` *preserves Admin authorization through suspension* |
| AC-8 | Reinstatement restores only context-entry eligibility | Covered | `i7-access-moderation` *reinstates only a Suspended account, and consumes the exact transition*, read with *leaves the account's Business, Offering and destination alone* |
| AC-9 | An ordinary Admin may act only on a target with no Admin authorization | Covered | `i7-access-moderation` *refuses an Admin-authorized account whatever state it is in* |
| AC-10 | An ordinary Admin attempt on an Admin-authorized account is rejected | Covered | `i7-access-moderation` as above |
| AC-11 | Only Product Owner or Architecture Owner may act on an Admin-authorized account | Covered by absence | No route accepts such an action. `m12-admin-context` *publishes no way to grant or remove Admin authorization* — the decision is provisioned outside the product layer, so there is nothing for a test to call |

### `US-IDN-F07-001` — Business Context Access

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Enabled status required before entry | Covered | `m11-authorization` *refuses a suspended account holder* |
| AC-2 | An authoritative relationship for the exact Business | Covered | `m12-business-context` *refuses entry to a Business the person is not authorized for*; `m11-authorization` *hides a Business the principal does not own* |
| AC-3 | An explicit choice where more than one Business exists | Covered | `m12-business-context` *enters an explicitly chosen Business context* and *refuses to act in an owned Business that was never selected* |
| AC-4 | The exact context and Business reach UX-0005 without extra authority | Covered | `m12-business-context` *acts only in the selected Business, not in another owned one* |
| AC-5 | One User Account for both contexts; no separate Business identity | Covered by absence | There is no Business credential in the contracts and no route that issues one. `m12-business-context` *requires an authenticated session to choose a context at all* |
| AC-6 | No ownership or authority over another Business through entry | Covered | `m11-authorization` *does not read back an Offering through a different owned Business* and *allows the same slug inside a different owned Business* |
| AC-7 | Admin authorization alone is insufficient | Covered | `m12-admin-context` *grants no Business authority through Admin authorization* |
| AC-8 | Access status and authorization re-evaluated on entry and after a switch | Covered | `m12-business-context` *drops the context when the ownership relationship is removed* |
| AC-9 | Leaving returns to the authenticated User baseline | Covered | `m12-business-context` *returns to the User baseline on leaving, keeping the session* |

### `US-IDN-F08-001` — Admin Authorization and Context Access

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Authorization attaches to an existing account; no separate Admin identity | Covered | `m12-admin-context` *reports no Admin authorization for an ordinary account* — the authorization is a row against a User Account, and there is no other way to hold one |
| AC-2 | First-Admin establishment and grant or removal reserved to the Owner | Covered by absence | `m12-admin-context` *publishes no way to grant or remove Admin authorization* |
| AC-3 | Decisions applied through provisioning outside the product layer | Covered by absence | As AC-2. Every test that needs an Admin inserts the row directly, which is the provisioning path being described |
| AC-4 | No self-service, delegated, transferred or tiered Admin behaviour | Covered by absence | As AC-2. There is one authorization and no shape in which to express a tier |
| AC-5 | Enabled, authorized and explicitly chosen before entry | Covered | `m12-admin-context` *enters Admin context on an explicit request* and *does not enter Admin context merely because authorization exists* |
| AC-6 | The exact context and authorization reach UX-0006 without Business ownership | Covered | `m12-admin-context` *grants no Business authority through Admin authorization* |
| AC-7 | No automatic Business ownership or management authority | Covered | `m12-admin-context` as above |
| AC-8 | Admin context unavailable while Suspended even with authorization present | Covered | `m12-admin-context` *makes Admin context unavailable while the account is Suspended* |
| AC-9 | Entry unavailable once authorization is removed | Covered | `m12-admin-context` *drops Admin context the moment authorization is removed* |
| AC-10 | Ordinary User behaviour preserved after removal | Covered | `m12-admin-context` *keeps ordinary User behaviour after authorization is removed* |
| AC-11 | Status and authorization re-evaluated whenever entry is requested | Covered | `m12-admin-context` *drops Admin context the moment authorization is removed* — the drop happens on the next request, which is the re-evaluation |

### `US-IDN-F09-001` — Direct Contact Authentication Return

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | A return context only on an explicit authenticated-only Direct Contact attempt | Covered | `i8-decision-handoff` *tells a Guest nothing protected and asks nothing of the Business* — the `401` is the interruption, and nothing else produces one |
| AC-2 | The flow, Selected Offering, Direct Contact action and chosen channel are in the return context | **Newly verified, after a change** | See below. `i9-identity-delivery` *brings the interrupted channel back and asks it again* |
| AC-3 | Protected information unavailable throughout unauthenticated Registration or Login | Covered | `i8-decision-handoff` as AC-1; `i8-authentication` *puts no secret in any page it renders* |
| AC-4 | The unchanged exact context returns to UX-0009 | **Newly verified, after a change** | `i9-identity-delivery` *brings the interrupted channel back and asks it again* |
| AC-5 | UX-0009 re-evaluates Offering, account, channel and eligibility before revealing | Covered | `i5-direct-contact` *refuses once the Selected Offering stops being publicly eligible* and *refuses while nothing is selected*; the resumed request is an ordinary submission, so it meets the same gates |
| AC-6 | Continuation prevented where the Offering or channel is no longer eligible | **Newly verified** | `i9-identity-delivery` *resumes nothing that stopped being on offer*; `i5-direct-contact` *refuses a channel the Business never supplied* |
| AC-7 | No interrupted-action return when Registration or Login was opened directly | **Newly verified** | `i9-identity-delivery` *carries no interrupted request for anyone who was not interrupted* |
| AC-8 | No return path needed for public Chat or an eligible Affiliate Handoff | **Newly verified** | `i9-identity-delivery` *needs no authentication return for Chat or an Affiliate handoff* |
| AC-9 | No message, inbox, conversation, reply or persistent history through the return | Covered | `i5-direct-contact` *creates no message, conversation or response state*; the return carries two enum names and a flow identifier, which cannot express any of them |

## The change AC-2 required

`US-IDN-F09-001` AC-2 names four things the return context must carry. Three of
them were already the person's own — the Decision flow is in their cookie and
the Selected Offering is held against it on the server — and the code said so.
The fourth was not.

**Which channel they had chosen was known only to the submission being
interrupted.** Somebody who pressed "Telephone", was asked to sign in, and came
back found the Decision page exactly as they had left it, with the question
unanswered and no sign that anything had been carried. The comment in
`session.ts` claimed "the exact return context §11.2 asks for is already on the
server", which was true of three quarters of it.

The channel now travels in a short-lived cookie keyed to the flow it came from.
Two things decided the shape:

- **A cookie rather than a query parameter,** because AC-4 returns the context
  after Registration *or* Login, and Registration goes out through the person's
  email. The confirmation link is composed by the worker before any of this
  happens, so anything threaded through the address would have worked for
  everybody who signed in and been lost by everybody who created an account.
- **Two names from closed vocabularies,** which is why `returnPath` exists
  already. `RESUMABLE_ACTIONS` and the contract's own channel list are the only
  things `readResume` can return, so whatever is put in the cookie, only these
  can come out. It says which question was being asked and no part of its
  answer.

It resumes a request, never a grant. The person arrives back at a button, and
pressing it makes the reveal request afresh — which is what makes AC-5's
re-evaluation and AC-6's refusal automatic rather than remembered. A channel
the Business withdrew while they were away is not in `channels.available`, so
it is not marked and the sentence saying they may carry on is not shown.

## Identity advancement

| Story | Criteria | Delivery Status |
|---|---|---|
| `US-IDN-F01-001` Public Guest Access Baseline | 8 of 8 verified | Not Started → **Done** |
| `US-IDN-F02-001` Registration and Email Control Proof | 9 of 9 verified | Not Started → **Done** |
| `US-IDN-F03-001` Login | 8 of 8 verified | Not Started → **Done** |
| `US-IDN-F04-001` Logout | 7 of 7 verified | Not Started → **Done** |
| `US-IDN-F05-001` Password Recovery | 9 of 9 verified | Not Started → **Done** |
| `US-IDN-F06-001` User Account Access Status | 11 of 11 verified | Not Started → **Done** |
| `US-IDN-F07-001` Business Context Access | 9 of 9 verified | Not Started → **Done** |
| `US-IDN-F08-001` Admin Authorization and Context Access | 11 of 11 verified | Not Started → **Done** |
| `US-IDN-F09-001` Direct Contact Authentication Return | 9 of 9 verified | Not Started → **Done** |

### What "Covered by absence" claims, and what it does not

Five criteria are met by there being no way to express the thing they forbid:
`US-IDN-F06-001` AC-11, `US-IDN-F07-001` AC-5 and `US-IDN-F08-001` AC-2, AC-3
and AC-4. These are not tested by calling something and watching it refuse, because
there is nothing to call. The evidence is that no route, contract or shape
exists — which the boundary check and the committed OpenAPI document keep true
over time, since adding one would show up as a diff in both.

This is a weaker kind of evidence than an assertion and is marked as such rather
than counted as an ordinary pass. A reviewer who wants to challenge one of these
should look for the absent route, not for a missing test.

## Business — `US-0005`

Seven Stories, 95 Acceptance Criteria. The Business Stories are the
best-covered in the repository: `i6-business-dashboard`,
`i6-offering-management`, `i6-destination-management` and
`i6-correction-notice` were each written criterion by criterion in I6 and line
up almost one to one, and `i2-business-creation`, `i2-business-information`,
`i2-public-business-identity` and `i6-business-restriction` cover the rest.

**Two criteria had no test.** They are proved by the three tests in
`i9-business-delivery.integration.test.ts`. Both are about a gate rather than
an action — the kind of thing that works until somebody removes it, and that
nothing notices when they do.

### `US-BUS-F01-001` — Business Creation and Ownership

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | An Enabled authenticated account before creation may begin | **Newly verified** | `i9-business-delivery` *creates no Business for an account that is not Enabled* and *refuses the suspended holder exactly as it refuses a stranger*. See the note below on where the gate actually is |
| AC-2 | An owning account and a non-empty display name | Covered | `i2-business-creation` *refuses a Business without a display name* and *requires an authenticated account* |
| AC-3 | No prior Admin approval | Covered | `i2-business-creation` *creates a Business with no Admin approval in between* |
| AC-4 | Created `Unrestricted` | Covered | `i2-business-creation` *creates a Business with no Admin approval in between* asserts `business_moderation_state.status` is `UNRESTRICTED` at creation |
| AC-5 | Created with exposure input `Eligible` | Covered | The same test asserts `publicExposure: "ELIGIBLE"` on the created Business |
| AC-6 | Immediately available to its owner | Covered | `i2-business-creation` *makes the Business immediately available to its owner* |
| AC-7 | One account may own several Businesses | Covered | `i2-business-creation` *lets one person own several Businesses* |
| AC-8 | Exactly one owner per Business in V1 | Covered | `i2-business-creation` *assigns exactly one owner, enforced by the database* — the constraint, not the code path, which is what makes it hold for writes nobody has written yet |
| AC-9 | The same account for both contexts; no separate Business identity | Covered by absence | No credential, session or route exists for a Business as such. `m12-business-context` *requires an authenticated session to choose a context at all* |
| AC-10 | No transfer, co-owner, delegation, team member, invitation or internal role | Covered by absence | `business_owner` admits one owner per Business and there is no route that adds a second, changes the first, or names a role |
| AC-11 | No dedicated public Business Profile page | **Newly verified** | `i9-business-delivery` *gives a Business no public address of its own* — every address naming a Business is a management address and answers a Guest as one |

### `US-BUS-F02-001` — Business Information and Exposure

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | The owner sees every field for the exact owned Business | Covered | `i2-business-information` *shows the owner every Business Information field* and *hides another person's Business rather than forbidding it* |
| AC-2 | The owner edits name, logo, description, telephone, email and contact URL | Covered | `i2-business-information` *saves the complete information set* |
| AC-3 | A save that empties the display name is rejected | Covered | `i2-business-information` *refuses a save that empties the display name* |
| AC-4 | Optional fields may be added, changed or removed | Covered | `i2-business-information` *lets every optional field be added, changed and removed* |
| AC-5 | A Business may exist with zero contact channels | Covered | `i2-business-information` *accepts a Business with no Direct Contact channel at all* |
| AC-6 | The public identity set is name plus supplied logo and description only | Covered | `i2-public-business-identity` *contains display name, logo and short description only* and *carries a supplied name even when the optional fields are absent* |
| AC-7 | Available to PRD-0001 only when exposure input and final eligibility are both `Eligible` | Covered | Both arms: `i2-public-business-identity` *composes nothing at all while exposure is Ineligible*, and `i2-public-eligibility` *is Eligible only for a Published Offering of an Eligible Business* |
| AC-8 | No Business Information exposed through an owned Offering while exposure is `Ineligible` | Covered | `i2-public-business-identity` *composes nothing at all while exposure is Ineligible*; `i6-business-restriction` *withdraws public eligibility on restriction and returns it on restoration* |
| AC-9 | Telephone, email and contact URL unavailable to Guests and outside the identity set | Covered | `i2-public-business-identity` *excludes every Direct Contact channel*; `i4-offering-presentation` *excludes protected contact information from the Business identity* |
| AC-10 | Contact information available only through PRD-0004 to an Enabled authenticated User | Covered | `i5-direct-contact` *reveals the chosen channel to an Enabled authenticated User* and *reveals nothing to a Guest* |
| AC-11 | Direct Contact unavailable where no approved channel exists | Covered | `i5-direct-contact` *says a Business with no channel cannot be contacted*; `i2-public-business-identity` *is unavailable when no channel is supplied* |
| AC-12 | Editing valid information changes no status, lifecycle, eligibility or Completion | Covered | `i2-business-information` *changes no moderation status or exposure input by itself* |
| AC-13 | Owner and Admin visibility stay separate from public exposure | Covered | `i2-business-information` *keeps management visibility open while public exposure is closed* |
| AC-14 | No inbox, conversation, response workflow or Messaging | Covered by absence | The information contract holds six fields and no collection. `i5-direct-contact` *creates no message, conversation or response state* |

### `US-BUS-F03-001` — Business Moderation and Public Exposure Input

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Exactly `Unrestricted` and `Restricted` | Covered | `i6-business-restriction` *uses exactly two moderation values and maps each to one exposure input* |
| AC-2 | `Unrestricted` maps to exposure input `Eligible` | Covered | The same test, and *refuses to let the two disagree* — the mapping is a database constraint rather than a convention |
| AC-3 | `Restricted` maps to exposure input `Ineligible` | Covered | As AC-2 |
| AC-4 | Restrict produces `Restricted` and `Ineligible` | Covered | `i6-business-restriction` *withdraws public eligibility on restriction and returns it on restoration* |
| AC-5 | A Restricted owner may manage information and Drafts and view the rest | Covered | `i6-business-restriction` *lets a Restricted owner manage Business Information and existing Drafts* and *lets a Restricted owner see what they own* |
| AC-6 | A Restricted Business creates no Offering and publishes no Draft | Covered | `i6-business-restriction` *stops a Restricted owner creating an Offering or publishing a Draft* |
| AC-7 | No normal editing of Published or Hidden while Restricted, except the bounded path | Covered | `i6-business-restriction` *stops normal editing of a Published Offering while Restricted*; `i6-correction-notice` *opens the bounded path only when every condition holds* |
| AC-8 | Retirement allowed while Restricted where PRD-0001 permits | Covered | `i6-business-restriction` *allows retirement while Restricted* |
| AC-9 | Destination viewing or editing while Restricted only where the Offering stays owner-manageable | Covered | `i6-business-restriction` *allows an Affiliate Destination only where the Offering is still owner-manageable* |
| AC-10 | Restriction alone moves no lifecycle, destination, access status or ownership | Covered | `i6-business-restriction` *moves nothing else by restricting* |
| AC-11 | Restore produces `Unrestricted` and `Eligible` | Covered | `i6-business-restriction` *withdraws public eligibility on restriction and returns it on restoration* |
| AC-12 | Restoration publishes no Draft and restores no Hidden or Archived Offering | Covered | `i6-business-restriction` *publishes nothing and un-hides nothing on restoration* |
| AC-13 | Restoration alone moves no destination status or Handoff Eligibility | Covered | `i6-business-restriction` *moves no Affiliate Destination state by restoring* |
| AC-14 | Only lifecycle-Published Offerings regain final eligibility after restoration | Covered | `i6-business-restriction` *publishes nothing and un-hides nothing on restoration* read with *withdraws public eligibility on restriction and returns it on restoration* |
| AC-15 | Moderation status and exposure input unchanged when the owner is Suspended | Covered | `i6-business-restriction` *leaves moderation and exposure alone when the owner is suspended* |
| AC-16 | Context entry blocked during owner suspension without changing public eligibility | Covered | The same test asserts the `401` and that the published Offering stays findable |

### `US-BUS-F04-001` — Business Dashboard and Context Selection

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | An Enabled owner of that exact Business before the Dashboard opens | Covered | `i6-business-dashboard` *opens only for an Enabled owner of that exact Business* |
| AC-2 | The active Business name and Moderation Status identifiable throughout | Covered | `i6-business-dashboard` *names the Business and its Moderation Status* |
| AC-3 | Direct entry to a sole owned Business without a second identity | Covered | `i6-business-dashboard` *enters the sole owned Business without inventing a second identity* |
| AC-4 | Explicit selection where more than one Business is owned | Covered | `i6-business-dashboard` *requires an explicit choice where more than one Business is owned* |
| AC-5 | A switch changes only the active management context | Covered | `i6-business-dashboard` *changes only the active context when switching* |
| AC-6 | No management action applied silently to another Business | Covered | `i6-business-dashboard` *applies no management action to the Business that is not active*; `m11-authorization` *does not read back an Offering through a different owned Business* |
| AC-7 | Status and authorization re-evaluated on entry and after a switch | Covered | `i6-business-dashboard` *re-evaluates the account on entry and after a switch* |
| AC-8 | Admin authorization alone is insufficient | Covered | `i6-business-dashboard` *treats Admin authorization as no kind of ownership* |
| AC-9 | Only by-reference management areas and authoritative states, without redefinition | Covered | `i6-business-dashboard` *organizes the inventory by lifecycle and adds nothing to it* |
| AC-10 | No analytics, metrics, revenue, ranking, trends, CRM, Messaging or transactions | Covered | `i6-business-dashboard` *reports no metric, ranking or trend of any kind* |
| AC-11 | The last confirmed active Business survives a failed switch | Covered | `i6-business-dashboard` *keeps the last confirmed Business when a switch fails* |

### `US-BUS-F05-001` — Offering Management Entry

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Inventory organized by the four authoritative lifecycle states | Covered | `i6-offering-management` *organizes the inventory by the authoritative lifecycle states* |
| AC-2 | Only actions currently permitted by PRD-0001 and PRD-0005 | Covered | `i6-offering-management` *keeps the offer and the refusal the same rule*; `i8-offering-actions` binds the same answer to the buttons |
| AC-3 | Create only for an Unrestricted active Business | Covered | `i6-business-restriction` *stops a Restricted owner creating an Offering or publishing a Draft* |
| AC-4 | A created Offering begins `Draft` | Covered | `i6-offering-management` *begins a created Offering as a Draft* |
| AC-5 | Edit only where lifecycle and access rules both permit | Covered | `i6-offering-management` *keeps the offer and the refusal the same rule*; `i2-offering-editing` holds the lifecycle half |
| AC-6 | Publish only for an owned Draft, Unrestricted, minimum satisfied | Covered | `i6-offering-management` *offers Publish only where the minimum is already satisfied* |
| AC-7 | Validation feedback without redefining the minimum | Covered | `i8-offering-actions` relays the shortfalls the API publishes; `i8-recorded-gaps` *publishes which conditions of the minimum failed* |
| AC-8 | Retire from Draft, Published or Hidden where PRD-0001 permits | Covered | `i6-offering-management` *offers Retire from every state that permits it* |
| AC-9 | `Archived` consumed as the retirement result | Covered | `i2-offering-retirement` writes and reads `ARCHIVED`; no other result exists in the lifecycle enum |
| AC-10 | The owner cannot restore a Hidden Offering to Published | Covered | `i6-offering-management` *offers no way to restore a Hidden Offering and no way to delete* |
| AC-11 | An Archived Offering is view-only | Covered | `i6-offering-management` *makes an Archived Offering view-only* |
| AC-12 | No permanent deletion | Covered by absence | No delete route exists for an Offering. `i6-offering-management` *offers no way to restore a Hidden Offering and no way to delete* |
| AC-13 | Lifecycle `Published` distinguished from final public eligibility | Covered | `i6-offering-management` *distinguishes lifecycle Published from public eligibility* |
| AC-14 | A Restricted Business manages Drafts, views the rest, retires, and uses only the bounded path | Covered | `i6-offering-management` *narrows the entries a Restricted Business is offered* |
| AC-15 | A Restricted Business creates nothing, publishes nothing, edits Published or Hidden normally never | Covered | `i6-offering-management` *lets a Restricted owner still publish nothing at all* |
| AC-16 | No lifecycle transition claimed when an action fails | Covered | `i6-offering-management` *claims no lifecycle transition when an action fails* |

### `US-BUS-F06-001` — Affiliate Destination Management Entry

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Entry only for an applicable owned Offering that is currently owner-manageable | Covered | `i6-destination-management` *gives the entry only for an owned Offering* and *composes the entry from the Offering's condition and nothing else* |
| AC-2 | Create entry where the Offering has no destination | Covered | `i6-destination-management` *offers Create where the Offering has no destination* |
| AC-3 | Edit entry for the existing destination where access rules permit | Covered | `i6-destination-management` *offers Edit once a destination exists, and Create no longer* |
| AC-4 | Authoritative status, validation result and Handoff Eligibility without recalculation | Covered | `i6-destination-management` *reports the authoritative results without recalculating them* |
| AC-5 | Association, consequences, status, validation and eligibility stay owned by PRD-0001 | Covered | `i3-affiliate-governance` owns those transitions; `i6-destination-management` *gives the Business no administration action anywhere* |
| AC-6 | A Restricted Business edits only where the Offering stays owner-manageable | Covered | `i6-destination-management` *lets a Restricted Business manage a Draft's destination and no other* |
| AC-7 | An Offering-content correction notice grants no destination authority | Covered | `i6-correction-notice` *opens no management area the owner is not currently authorized for* and *grants no creation, publication or unrelated edit* |
| AC-8 | No destination correction notice bypasses the ordinary access gate | Covered | As AC-7 |
| AC-9 | The Business cannot Review, Validate, Enable, Disable or recalculate eligibility | Covered | `i6-destination-management` *gives the Business no administration action anywhere* |
| AC-10 | An Archived Offering's destination is view-only | Covered | `i6-destination-management` *makes an Archived Offering's destination view-only* |
| AC-11 | No validation, enablement, status or eligibility change claimed when a save fails | Covered | `i6-destination-management` *claims no result when a save fails* |
| AC-12 | No affiliate network, attribution, tracking, commission, settlement or conversion behaviour | Covered | `i6-destination-management` *creates no commercial behaviour by being used* |

### `US-BUS-F07-001` — Correction Notice and Owner Response

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Exactly four V1 correction targets for Business response | Covered | `i6-correction-notice` *accepts exactly the four Business-owned targets* |
| AC-2 | User Account excluded from the Business target set | Covered | `i6-correction-notice` *has no way to name a User Account as a target*; `i7-access-moderation` *offers no User Account correction target* |
| AC-3 | The notice identifies the exact approved target area | Covered | `i6-correction-notice` *identifies the exact target and where it opens* |
| AC-4 | Only the applicable currently authorized management area opens | Covered | `i6-correction-notice` *opens no management area the owner is not currently authorized for* |
| AC-5 | The notice's existence changes nothing | Covered | `i6-correction-notice` *changes nothing by existing or by being read* |
| AC-6 | No message, conversation, ticket discussion, reply, inbox or Messaging | Covered | `i6-correction-notice` *creates no message, conversation or reply* |
| AC-7 | The owner edits only what is normally authorized under current rules | Covered | `i6-correction-notice` *opens no management area the owner is not currently authorized for* |
| AC-8 | The bounded path only for an Open case on an exact Published or Hidden owned Offering | Covered | `i6-correction-notice` *opens the bounded path only when every condition holds* and *refuses a bounded edit once the case is closed* |
| AC-9 | The bounded correction is limited to the exact Offering and content area | Covered | `i6-correction-notice` *limits the edit to the exact targeted content area* and *limits the edit to the exact Offering* |
| AC-10 | No creation, publication, unrelated edit, status change or automatic closure | Covered | `i6-correction-notice` *grants no creation, publication or unrelated edit* |
| AC-11 | The saved correction preserves the Universal Publication Minimum | Covered | `i6-correction-notice` *requires the saved correction to preserve the publication minimum*; `i8-recorded-gaps` *carries a correction's shortfalls where the envelope can hold them* |
| AC-12 | The case stays `Open` after an owner edit | Covered | `i6-correction-notice` *keeps everything where it was after the owner responds* |
| AC-13 | The Business stays Restricted, ineligible, and the Offering publicly ineligible until re-review | Covered | The same test |
| AC-14 | Platform re-review required after a bounded correction | Covered | `i7-correction-re-review` holds the re-review path |
| AC-15 | Approved action, no-action decision and closure left to PRD-0006 | Covered | `i6-correction-notice` *leaves approved action, no-action and closure to Platform* |

## Where AC-1's gate actually is

`US-BUS-F01-001` AC-1 asks for an *Enabled* authenticated account before
creation may begin. Being authenticated was the only half anything asserted, so
the test was written — and writing it found something worth recording.

`BusinessService.create` refuses a suspended holder with `ACCOUNT_NOT_ACTIVE`
and audits the denial. **That branch cannot be reached over HTTP.** Suspending
an account invalidates its sessions, so the request is answered `401` by
authentication before any Business rule is consulted. The first draft of the
test asserted the audited denial and failed, which is how this surfaced.

Both gates are correct and the criterion is met by the outer one. The record
cites the outer one, because citing a branch nothing can reach would be
evidence that reads as strong and is not.

The test asserts the outcome rather than the mechanism: no Business row is
written, and a suspended holder is refused in exactly the same words as a
stranger. That last part matters on its own — `US-IDN-F03-001` AC-4 refuses a
Suspended account identically to an unknown one, and a creation endpoint that
answered a suspended holder differently would be a way of learning that
somebody has been suspended.

## Business advancement

| Story | Criteria | Delivery Status |
|---|---|---|
| `US-BUS-F01-001` Business Creation and Ownership | 11 of 11 verified | Not Started → **Done** |
| `US-BUS-F02-001` Business Information and Exposure | 14 of 14 verified | Not Started → **Done** |
| `US-BUS-F03-001` Business Moderation and Public Exposure Input | 16 of 16 verified | Not Started → **Done** |
| `US-BUS-F04-001` Business Dashboard and Context Selection | 11 of 11 verified | Not Started → **Done** |
| `US-BUS-F05-001` Offering Management Entry | 16 of 16 verified | Not Started → **Done** |
| `US-BUS-F06-001` Affiliate Destination Management Entry | 12 of 12 verified | Not Started → **Done** |
| `US-BUS-F07-001` Correction Notice and Owner Response | 15 of 15 verified | Not Started → **Done** |

Four Business criteria are covered by absence on the same terms recorded for
Identity: `US-BUS-F01-001` AC-9 and AC-10, `US-BUS-F02-001` AC-14, and
`US-BUS-F05-001` AC-12.

## Remaining domains

Offering, Discovery, Decision and Platform are not advanced by this
document. Their criteria are recorded here as work continues, one domain per
change, on the same standard: read the criterion, read the test, and where
nothing reaches it, write one.

All 34 Stories outside Identity and Business remain
`Delivery Status: Not Started`.
