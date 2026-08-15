# Delivery Status Advancement — Per-Criterion Evidence

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft — awaiting Owner acceptance
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-15
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

The Handbook names four planning values — Not Started, Ready, In Progress and
Done. This document uses two of them. `Done` claims §18 in full. `In Progress`
is used exactly once, for a Story whose work is delivered and evidenced but
which has one criterion nothing in delivery can satisfy; it says what is true
where both of the other values would say something false.

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

## Offering — `US-0001`

Seven Stories, 64 Acceptance Criteria. **No new test was needed.** The I2 and I3
suites were written criterion by criterion against these Stories and reach all
64 — which is what a domain looks like when the tests were written from the
Story rather than from the implementation.

**One Story cannot be Done.** `US-OFR-F05-001` AC-3 asks for something no
document governs, and that has been recorded since I4. It is the first Story to
be advanced short of `Done`, and the reason is below.

### `US-OFR-F01-001` — Offering Creation

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | An authorized owner of an Unrestricted Business creates one Offering | Covered | `i2-offering-creation` *creates one Draft for the Business whose context is selected*; `m11-authorization` *refuses a suspended account holder* and *refuses a suspended Business* |
| AC-2 | Associated with exactly the authorized Business context | Covered | `i2-offering-creation` *requires the Business context to be selected* and *hides another Business's inventory*; `m11-authorization` *does not read back an Offering through a different owned Business* |
| AC-3 | Placed in lifecycle state Draft | Covered | `i2-offering-creation` *creates one Draft for the Business whose context is selected* |
| AC-4 | Final eligibility Ineligible for the new Draft | Covered | `i2-offering-creation` *records the new Draft as Ineligible* — a written evaluation rather than an absence, so nothing has to infer it |
| AC-5 | Available in the owning Business management inventory | Covered | `i2-offering-creation` *shows the new Draft in the owning Business inventory* |
| AC-6 | Creation denied while the Business is Restricted | Covered | `i2-offering-creation` *denies creation while the Business is Restricted*; `m11-authorization` *refuses a moderation-restricted Business* |
| AC-7 | Creation neither publishes nor exposes publicly | Covered | `i2-offering-creation` *exposes the new Draft to no public surface* |

### `US-OFR-F02-001` — Offering Editing

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | An authorized owner edits one exact owned Draft | Covered | `i2-offering-editing` *edits an owned Draft and keeps its Business* and *hides another Business's Offering from editing* |
| AC-2 | Every successful edit stays with the same owning Business | Covered | `i2-offering-editing` *edits an owned Draft and keeps its Business* |
| AC-3 | A Published edit only where the access gate permits and the minimum holds | Covered | `i2-offering-editing` *saves a Published edit that keeps the publication minimum* |
| AC-4 | A Hidden edit on the same two conditions | Covered | `i2-offering-editing` *saves a Hidden edit that keeps the publication minimum* |
| AC-5 | A Published or Hidden edit violating the minimum is rejected | Covered | `i2-offering-editing` *rejects a Published edit that drops a required Attribute value* and *rejects a Published edit onto a Category that is not an active leaf* |
| AC-6 | Lifecycle and immutable Initial Published At preserved | Covered | `i2-offering-editing` *preserves lifecycle and Initial Published At across an edit* |
| AC-7 | Editing an Archived Offering denied | Covered | `i2-offering-editing` *denies editing an Archived Offering*; `i2-offering-retirement` asserts the same from the retirement side |
| AC-8 | Normal Published or Hidden editing denied for a Restricted Business | Covered | `i2-offering-editing` *keeps Draft management but denies Published editing for a Restricted Business* |
| AC-9 | The bounded correction path only for the exact Open target and content area | Covered | `i6-correction-notice` *opens the bounded path only when every condition holds*, *limits the edit to the exact targeted content area* and *limits the edit to the exact Offering* |
| AC-10 | Saving an edit creates, publishes, retires, hides, restores, validates, enables or disables nothing | Covered | `i2-offering-editing` *changes no lifecycle, publication or eligibility by saving an edit*; `i2-affiliate-destination` *leaves an administered destination alone when nothing changed* |

### `US-OFR-F03-001` — Offering Retirement

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | An authorized owner retires one owned Draft, Published or Hidden Offering | Covered | `i2-offering-retirement` *retires a Draft, a Published and a Hidden Offering* and *hides another Business's Offering from retirement* |
| AC-2 | The retired Offering becomes Archived | Covered | The same test |
| AC-3 | Final eligibility Ineligible for the Archived Offering | Covered | `i2-offering-retirement` *records a fresh Ineligible evaluation without erasing the earlier one* |
| AC-4 | Unavailable to Discovery, Presentation, Compare, Decision selection, Direct Contact and Affiliate Handoff | Covered | One test per surface, and all six exist: `i2-offering-retirement` *leaves nothing for Discovery to find*; `i4-presentation-handoff` *refuses to open an Offering that stopped being eligible*; `i5-comparison-set` *refuses an Offering that is not publicly eligible*; `i5-offering-selection` *clears the selection when its Offering stops being eligible*; `i5-direct-contact` *refuses once the Selected Offering stops being publicly eligible*; `i5-affiliate-handoff` *refuses once the Offering stops being publicly eligible* |
| AC-5 | Historical Category, Domain, Attribute values and destination preserved | Covered | `i2-offering-retirement` *keeps the Category, Domain and Attribute values as history* |
| AC-6 | Viewable as a historical record to the owner and an authorized Admin | Covered | `i2-offering-retirement` *stays viewable to its owner and to an authorized Admin* and *hides the Admin read from anyone not in an Admin context* |
| AC-7 | Editing and restoration denied in V1 | Covered | `i2-offering-retirement` *denies editing an Archived Offering*; `i6-offering-management` *offers no way to restore a Hidden Offering and no way to delete* |
| AC-8 | An associated destination becomes view-only | Covered | `i2-affiliate-destination` *makes an Archived Offering's destination view-only* and *refuses a destination on an Archived Offering* |
| AC-9 | Admin-initiated archive denied, and no second retirement from Archived | Covered | `i2-offering-retirement` *offers an Admin no way to archive an Offering* and *denies a second retirement* |

### `US-OFR-F04-001` — Offering Publication

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Publication only for an exact owned Draft under an authorized owner | Covered | `i3-offering-publication` *publishes only a Draft* and *hides another Business's Offering from publication* |
| AC-2 | Business Moderation Status Unrestricted required | Covered | `i3-offering-publication` *refuses publication while the Business is Restricted* |
| AC-3 | The Universal Publication Minimum required | Covered | `i3-offering-publication` *refuses publication below the Universal Publication Minimum*; `i2-publication-minimum` names each shortfall separately |
| AC-4 | A valid target moves Draft → Published | Covered | `i3-offering-publication` *publishes an owned Draft and stamps Initial Published At* |
| AC-5 | Immutable Initial Published At on the first transition | Covered | `i3-offering-publication` *never moves Initial Published At once it is set* |
| AC-6 | Eligibility evaluated after publication, without assuming every Published Offering is public | Covered | `i3-offering-publication` *evaluates eligibility after publication rather than assuming it*; `i2-public-eligibility` *is Eligible only for a Published Offering of an Eligible Business* |
| AC-7 | The Offering stays Draft when any gate is unsatisfied | Covered | `i3-offering-publication` *refuses publication while the Business is Restricted* and *refuses publication below the Universal Publication Minimum*, both asserting the state afterwards |
| AC-8 | Business-owned Published → Draft and Hidden → Draft denied | Covered | `i3-offering-publication` *offers no way back to Draft* |

### `US-OFR-F05-001` — Full Offering Detail Presentation

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Complete Presentation begins only when eligibility is Eligible | Covered | `i4-presentation-handoff` *opens one eligible Offering*, *refuses to open an Offering that stopped being eligible* and *does not open a Draft that was never published* |
| AC-2 | Title, Category context, description, Attribute values, public identity, visual set | Covered | `i4-offering-presentation` *presents the product minimum* for title, Category path, description and identity; *keeps the governed unit and the allowed-value labels* for the values; *continues without inventing absent media, description or values* for the visual set |
| AC-3 | Understandable groups, preserving units, allowed-value meaning and missing-value treatment | **Half met** | The preserving half is covered: `i4-offering-presentation` *keeps the governed unit and the allowed-value labels* and *distinguishes an unanswered Attribute from an answered one*. The grouping half has no governed input. See below |
| AC-4 | No media or copy invented where optional content is absent | Covered | `i4-offering-presentation` *continues without inventing absent media, description or values* |
| AC-5 | Protected telephone, email, website and contact URL excluded from public identity | Covered | `i4-offering-presentation` *excludes protected contact information from the Business identity*; `i2-public-business-identity` *excludes every Direct Contact channel* |
| AC-6 | Compare and single-Offering Decision entries presented without executing them | Covered | `i4-compare-preparation` *adds nothing to a Comparison Set and claims no Compare Start*; `i4-presentation-handoff` *begins no Discovery path and no Decision by being opened* |
| AC-7 | The exact eligible Offering and any transient Compare-preparation context passed on | Covered | `i4-compare-preparation` *carries the unchanged context through to Presentation* and *says nothing about preparation when there is none* |
| AC-8 | Offering Presentation Open only when eligible Presentation begins | Covered | `i4-offering-presentation` *produces one occurrence for each successful Presentation* and *produces no occurrence for an owner's management view* |
| AC-9 | Content, entries and the occurrence withheld when Presentation cannot begin | Covered | `i4-offering-presentation` *produces no occurrence when Presentation cannot begin*; `i4-presentation-handoff` *says the same thing about an Offering that never existed* |

### `US-OFR-F06-001` — Affiliate Destination Configuration

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | One destination created for an applicable owned Draft, Published or Hidden Offering when none exists | Covered | `i2-affiliate-destination` *creates a destination that begins Draft, Not Validated and Ineligible* |
| AC-2 | Associated with exactly one Offering and never shared | Covered | `i2-affiliate-destination` *allows one destination per Offering and never a shared one* — a uniqueness constraint, so it holds for writes nobody has written yet |
| AC-3 | Created Draft, Not Validated, Ineligible | Covered | `i2-affiliate-destination` *creates a destination that begins Draft, Not Validated and Ineligible* |
| AC-4 | The owner edits where the Offering and Business gates permit | Covered | `i2-affiliate-destination` *refuses authoring to a Restricted Business but still shows it* and *hides another Business's destination* |
| AC-5 | An edited Draft, Enabled or Disabled destination resets to Draft, Not Validated, Ineligible | Covered | `i2-affiliate-destination` *resets an Enabled destination when its reference changes*, *resets a Disabled destination too* and *resets the results even when the reset is not asked for* |
| AC-6 | The owner sees status, validation result and Handoff Eligibility | Covered | `i2-affiliate-destination` *shows the owner the status, validation result and Handoff Eligibility* |
| AC-7 | View-only once the Offering is Archived | Covered | `i2-affiliate-destination` *makes an Archived Offering's destination view-only* |
| AC-8 | Review, Validate, Enable, Disable and recalculation denied to the owner | Covered | `i2-affiliate-destination` *offers the owner no Review, Validate, Enable or Disable action*; `i6-destination-management` *gives the Business no administration action anywhere* |
| AC-9 | Treated as a Handoff destination, not a Direct Contact channel | Covered | `i2-affiliate-destination` *keeps the destination out of the Business's Direct Contact channels* |

### `US-OFR-F07-001` — Affiliate Destination Eligibility Governance

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Only an authorized Admin may Review, Validate, Enable or Disable | Covered | `i3-affiliate-governance` *admits only an authorized Admin in an entered context* |
| AC-2 | Review alone changes nothing | Covered | `i3-affiliate-governance` *leaves every result unchanged when Review alone is completed* |
| AC-3 | Validate produces exactly one current result, Valid or Invalid | Covered | `i3-affiliate-governance` *produces one current result and leaves the status alone* |
| AC-4 | Validate leaves destination status unchanged | Covered | The same test |
| AC-5 | Handoff Eligibility stays Ineligible after Valid until Enable | Covered | `i3-affiliate-governance` *keeps a Valid destination Ineligible until it is enabled* |
| AC-6 | Enable only when the result is Valid | Covered | `i3-affiliate-governance` *refuses Enable unless the destination is Valid* |
| AC-7 | Enabling a Valid destination produces Enabled and Eligible | Covered | `i3-affiliate-governance` *produces Enabled and Eligible for a Valid destination* |
| AC-8 | Disabling an Enabled destination produces Disabled and Ineligible | Covered | `i3-affiliate-governance` *produces Disabled and Ineligible while keeping the verdict* and *refuses Disable unless the destination is Enabled* |
| AC-9 | Disable preserves the current validation result | Covered | `i3-affiliate-governance` *produces Disabled and Ineligible while keeping the verdict* |
| AC-10 | Eligible only when Enabled and Valid | Covered | `i3-affiliate-governance` *permits no other combination of status and result* and *drops eligibility when an Enabled destination is re-validated as Invalid* |
| AC-11 | Handoff Eligibility separate from final Offering Public Eligibility | Covered | `i3-affiliate-governance` *keeps Handoff Eligibility separate from final Offering Public Eligibility* |
| AC-12 | Destination administration changes no lifecycle, moderation or access status | Covered | `i3-affiliate-governance` *changes no Offering lifecycle, Business moderation or account status* |

## Why `US-OFR-F05-001` stops short of Done

AC-3 asks for applicable Attribute values "organized into understandable groups
while preserving authoritative units, allowed-value meaning, and missing
optional-value treatment". The second half is met and tested. The first half
has no input to work from, and this was recorded in
`I4_PUBLIC_WEB_JOURNEY_CLOSURE.md` when the Presentation was built.

PRD-0006 owns Attribute definition properties and gives each definition a name,
a unit, a value kind, comparability, filterability and
required-for-publication. **There is no group, no section and no ordering key.**
UX-0003 owns visual hierarchy but cannot invent a taxonomy the datamodel does
not hold, so grouping by value kind — or by any other field that happens to be
available — would be a classification nobody governs, presented to the public as
though somebody did.

Presenting one ordered set is the whole of what can be said truthfully. That is
what the Presentation does, and it is why eight of the nine criteria are met.

**This is not a gap a test can close.** AC-3 completes when a governed Attribute
grouping exists, which means a controlled revision of a Frozen PRD — an Owner
decision, not an implementation one. The alternatives are to add the grouping
input upstream, or for the Owner to read AC-3 as satisfied by a single ordered
set, in which case the Story advances with no code change at all.

The Story therefore moves to `In Progress` rather than `Done`. The Handbook
records delivery status as an operational planning signal, and `In Progress`
says what is true: the work is delivered, evidenced and blocked on one decision
that does not belong to delivery. Leaving it at `Not Started` would say the
opposite of what happened.

## Offering advancement

| Story | Criteria | Delivery Status |
|---|---|---|
| `US-OFR-F01-001` Offering Creation | 7 of 7 verified | Not Started → **Done** |
| `US-OFR-F02-001` Offering Editing | 10 of 10 verified | Not Started → **Done** |
| `US-OFR-F03-001` Offering Retirement | 9 of 9 verified | Not Started → **Done** |
| `US-OFR-F04-001` Offering Publication | 8 of 8 verified | Not Started → **Done** |
| `US-OFR-F05-001` Full Offering Detail Presentation | 8 of 9 verified; AC-3 half met | Not Started → **In Progress** |
| `US-OFR-F06-001` Affiliate Destination Configuration | 9 of 9 verified | Not Started → **Done** |
| `US-OFR-F07-001` Affiliate Destination Eligibility Governance | 12 of 12 verified | Not Started → **Done** |

No Offering criterion is covered by absence, and no new test was written for
this domain. Both facts are worth recording together: the I2 and I3 suites were
built from these Stories rather than from the code they were testing, and it
shows.

## Discovery — `US-0002`

Ten Stories, 81 Acceptance Criteria. The I3 and I4 suites reach 80 of them,
often criterion for criterion: `US-DSC-F05-001`'s twelve Filter rules have
twelve tests, and `US-DSC-F07-001`'s seven ordering rules have seven.

**One criterion had no test**, and it is a criterion about an *ending* rather
than an action. It is proved by the two tests in
`i9-discovery-delivery.integration.test.ts`.

### `US-DSC-F01-001` — Homepage Discovery Entry

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | The exact prompt "Bugün ne yapmak istiyorsunuz?" | Covered | `i4-homepage-entry` *presents the exact approved prompt as the label of the Search field* |
| AC-2 | The exact non-empty query passed only after explicit submission | Covered | `i4-homepage-entry` *passes the query exactly, trimming only its edges* |
| AC-3 | The exact selected active root Category passed only after explicit selection | Covered | `i4-homepage-entry` *makes selecting a Category a submission rather than a link* and *refuses a Category it never offered rather than opening another* |
| AC-4 | No authentication required for either entry | Covered | `i4-homepage-entry` *sends no principal with that read* |
| AC-5 | Whitespace-only input does not start Search | Covered | `i4-homepage-entry` *does not start Search from whitespace alone* and *does not start Search from a missing query* |
| AC-6 | The same behaviour for Guest, User, Business, Admin and a Suspended holder | Covered | `i4-homepage-entry` *sends no principal with that read* — the page carries no cookie and no authorization header, so there is nothing that could tell the five apart |
| AC-7 | No hidden route, Autocomplete, invented Category, featured Offering, recommendation, history or personalization | Covered | `i4-homepage-entry` *exposes no Autocomplete, featured Offering or remembered activity*, *offers every active root Category and invents none* and *asks the API for nothing but the active root Categories* |
| AC-8 | Query or Category preserved when the route cannot begin, and no Start claimed | Covered | `i4-homepage-entry` *keeps Search available when the Categories cannot be read* and *says so plainly when no Category is active* |

### `US-DSC-F02-001` — Search

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | One Search Discovery Start per valid explicit submission | Covered | `i3-search` *creates one Search Discovery Start with no Domain* and *refuses an empty query as an invalid submission* |
| AC-2 | Search begins without a leaf and may span several | Covered | `i3-search` *spans several leaf Categories with no Category selected* |
| AC-3 | Meaningful relationships evaluated only against the five approved fields | Covered | `i3-search` *matches each approved kind of information and levels it* and *matches an Attribute by the label a person reads* |
| AC-4 | Contact, Affiliate, owner-only, Admin-only, historical and ineligible excluded from matching | Covered | `i3-search` *excludes protected contact and Affiliate information from matching* and *excludes Draft, Hidden and Archived Offerings* |
| AC-5 | An Offering matching none of the approved information is excluded | Covered | `i3-search` *excludes an Offering that matches none of the searchable information* and *requires every term to relate to something* |
| AC-6 | The exact current query retained as visible criteria | Covered | `i3-search` *retains the exact query as visible criteria* |
| AC-7 | The highest applicable match level identified, without defining a ranking algorithm | Covered | `i3-search` *prefers the highest applicable level when several apply*; the ordering itself belongs to `US-DSC-F07-001` and is tested there |
| AC-8 | The same matching behaviour regardless of login or role | Covered | `i3-search` *behaves identically with and without a session* |

### `US-DSC-F03-001` — Browse

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | One Browse Start on the first Category of a new path | Covered | `i3-browse` *creates one Discovery Start carrying the Category's Domain* |
| AC-2 | The Start carries the Domain inherited from the Category | Covered | The same test |
| AC-3 | Navigation through root, child, parent and alternative branches | Covered | `i3-browse` *navigates children, parents and alternative branches* |
| AC-4 | Retired Categories excluded from destinations | Covered | `i3-browse` *excludes retired Categories from every destination* |
| AC-5 | Results withheld while the Category is non-leaf | Covered | `i3-browse` *withholds Results while the Category is a branch* |
| AC-6 | Results presented only after an active leaf is selected | Covered | `i3-browse` *presents Results only once an active leaf is selected* and *treats a Category as a leaf once its only child retires* |
| AC-7 | No aggregation of descendant Results into a parent | Covered | `i3-browse` *withholds Results while the Category is a branch*; `i4-listing-cards` *withholds Results on a branch instead of gathering descendants* |
| AC-8 | No further Start for descendants within the same path | Covered | `i3-browse` *creates no further Start for descendants of the same path* and *creates a separate Start for a new path* |

### `US-DSC-F04-001` — Search Category Narrowing

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Narrowing available when the result context spans more than one leaf | Covered | `i3-search-narrowing` *offers narrowing when the query reaches more than one leaf* and *offers no narrowing when the query reaches one leaf* |
| AC-2 | The exact current query retained | Covered | `i3-search-narrowing` *retains the exact query and narrows the candidate set* |
| AC-3 | The candidate set narrowed to the selected leaf | Covered | The same test, and *refuses to narrow to a branch or a retired Category* |
| AC-4 | The route stays Search and creates no Browse Start | Covered | `i3-search-narrowing` *stays a Search and creates no Browse Start* |
| AC-5 | The existing Search Start gains the leaf's Domain once available | Covered | `i3-search-narrowing` *gives the existing Search Start its Domain once one is available* and *keeps the Domain the Start first gained* |
| AC-6 | Attribute Filters available only after a leaf, and only through F05 | Covered | `i3-search-narrowing` *opens the Attribute Filter gate only on a leaf*; `i3-attribute-filtering` *offers no Filters on a branch* |
| AC-7 | The current ordering mode preserved for F07 | Covered | `i3-search-narrowing` *preserves the Search ordering mode across narrowing* |

### `US-DSC-F05-001` — Attribute Filtering

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | A Filter offered only on a leaf, for an applicable filterable Attribute | Covered | `i3-attribute-filtering` *offers a Filter only for an applicable filterable Attribute* and *offers no Filters on a branch* |
| AC-2 | Text and non-applicable or non-filterable Attributes excluded | Covered | `i3-attribute-filtering` *never offers a Text Attribute* |
| AC-3 | Number bounds inclusive; a missing value rejected | Covered | `i3-attribute-filtering` *applies inclusive Number bounds and rejects a missing value* |
| AC-4 | Boolean matched exactly; a missing value rejected | Covered | `i3-attribute-filtering` *matches Boolean exactly and rejects a missing value* |
| AC-5 | Values within one Single Select combined with OR | Covered | `i3-attribute-filtering` *combines values within one Single Select using OR* |
| AC-6 | Multi Select matched on intersection | Covered | `i3-attribute-filtering` *matches a Multi Select on any intersection* |
| AC-7 | Different Attribute Filters combined with AND | Covered | `i3-attribute-filtering` *combines different Filters using AND* |
| AC-8 | Search match, leaf Category and all Filters combined with AND | Covered | `i3-attribute-filtering` *combines the Search match, the Category and the Filters* |
| AC-9 | An Offering without a value for an applied Filter does not satisfy it | Covered | `i3-attribute-filtering` *applies inclusive Number bounds and rejects a missing value* and *matches Boolean exactly and rejects a missing value* |
| AC-10 | Applying a Filter narrows or preserves Results | Covered | `i3-attribute-filtering` *narrows on applying a Filter and expands on removing it* |
| AC-11 | Removing a Filter expands or preserves Results | Covered | The same test |
| AC-12 | Query and leaf retained when all Filters are cleared | Covered | `i3-attribute-filtering` *keeps the query and the Category when Filters are cleared* |

### `US-DSC-F06-001` — Discovery Results and Listing Cards

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Only eligible, currently matching Offerings in Results | Covered | `i3-browse` *shows only publicly eligible Offerings*; `i2-public-eligibility` decides the result the projection carries |
| AC-2 | Exactly one Listing Card per Result | Covered | `i4-listing-cards` *represents every Result with exactly one card* |
| AC-3 | Title, leaf Category name, Business name and an open affordance on every card | Covered | `i4-listing-cards` *presents the title, Category, Business and a way to open the Offering* |
| AC-4 | The supplied primary visual where available, with nothing invented | Covered | `i4-listing-cards` *invents no media when none was supplied* |
| AC-5 | Contact, Affiliate, owner-only and Admin-only information excluded | Covered | `i4-listing-cards` *carries no contact or Affiliate Destination information*; `i3-browse` *carries no protected or Affiliate information on a Listing Card* |
| AC-6 | No purchase, transaction, Completion or external-success claim | Covered | `i4-listing-cards` *claims no purchase, transaction or completion* |
| AC-7 | The card executes no Presentation, Compare, Chat, Handoff or Direct Contact | Covered | `i4-listing-cards` *opens the Offering by going somewhere rather than acting here* |
| AC-8 | The same behaviour regardless of login or role | Covered | `i4-listing-cards` *shows the same markup whatever the role, because it holds no role* |

### `US-DSC-F07-001` — Default Result Ordering

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Search ordered by Best Match across the named fields | Covered | `i3-result-ordering` *orders Search by the four Best Match levels* |
| AC-2 | Later Initial Published At first within one match level | Covered | `i3-result-ordering` *places the later Initial Published At first within one level* |
| AC-3 | A stable deterministic order for remaining Search ties | Covered | `i3-result-ordering` *breaks a remaining Search tie the same way every time* |
| AC-4 | Browse ordered by later Initial Published At first | Covered | `i3-result-ordering` *orders Browse by later Initial Published At first*; `i3-browse` asserts the same from the Browse side |
| AC-5 | A stable deterministic order for remaining Browse ties | Covered | `i3-result-ordering` *breaks a remaining Browse tie the same way every time* |
| AC-6 | The ordering mode preserved across Filters | Covered | `i3-result-ordering` *keeps each ordering mode after a Filter is applied* |
| AC-7 | No Sort control, paid placement, sponsorship, override or role advantage | Covered | `i3-result-ordering` *offers no way to ask for a different order* and *gives an owner and an Admin no ordering advantage* |

### `US-DSC-F08-001` — Zero Results Recovery

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Zero Results when nothing eligible matches valid criteria | Covered | `i3-zero-results` *states Zero Results when a Search matches nothing* and *says nothing about Zero Results when something matched* |
| AC-2 | The absence stated, with the query, Category and Filters kept understandable | Covered | `i3-zero-results` *preserves the query, the Category and every Filter* and *names the chosen allowed values rather than their identifiers* |
| AC-3 | One or more Filters removable, and all clearable | Covered | `i3-zero-results` *offers removing one Filter only when more than one is applied* |
| AC-4 | The query changeable or clearable | Covered | `i3-zero-results` *offers changing or clearing the query only in a Search* |
| AC-5 | Movement to a parent or another active Category | Covered | `i3-zero-results` *offers a parent Category only when there is one* and *always offers another Category and the Homepage* |
| AC-6 | Return to the Homepage entry | Covered | The same test |
| AC-7 | No criterion silently removed and no mode switched | Covered | `i3-zero-results` *removes no criterion and switches no mode* |
| AC-8 | No Recommendations, sponsorship, ineligible Offerings, Saved Search, History, Notification, Favorites or Messaging | Covered | `i3-zero-results` *invents nothing beyond the bounded recovery set* |

### `US-DSC-F09-001` — Offering Presentation Handoff

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | One eligible Listing Card may be opened | Covered | `i4-presentation-handoff` *opens one eligible Offering* |
| AC-2 | The exact selected identity supplied to UX-0003 | Covered | The same test — the slug the card carried resolves to the same Offering, unchanged |
| AC-3 | Discovery responsibility for that open action ends | **Newly verified** | `i9-discovery-delivery` *leaves the Discovery path exactly where it was when an Offering opens* and *records the open against the Offering and not against the path* |
| AC-4 | Presentation begins only while eligibility remains Eligible | Covered | `i4-presentation-handoff` *refuses to open an Offering that stopped being eligible* and *does not open a Draft that was never published* |
| AC-5 | The open action is not a Completion | Covered | `i4-presentation-handoff` *begins no Discovery path and no Decision by being opened* |
| AC-6 | No Compare, Chat, Handoff, Direct Contact or transaction begins automatically | Covered | The same test |
| AC-7 | Criteria preserved when the Offering cannot be opened, and no occurrence produced | Covered | `i4-presentation-handoff` *says the same thing about an Offering that never existed*; `i4-offering-presentation` *produces no occurrence when Presentation cannot begin* |

### `US-DSC-F10-001` — Compare Preparation Discovery Return

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | A return carrying exactly one eligible preparation Offering and its leaf | Covered | `i4-compare-preparation` *accepts one eligible preparation Offering with its leaf Category* and *discards a return carrying no usable Offering* |
| AC-2 | The result context constrained to that same leaf | Covered | `i4-compare-preparation` *constrains the context to the one leaf while the return is in force* and *discards a return that names a different Category* |
| AC-3 | The context transient, unsaved, non-restorable and absent from URL state | Covered | `i4-compare-preparation` *keeps the context out of anything durable or shareable* |
| AC-4 | No new Search or Browse Start merely because the return opens | Covered | `i4-compare-preparation` *continues the same Discovery path rather than beginning one* |
| AC-5 | The newly opened Offering and unchanged context passed to UX-0003 | Covered | `i4-compare-preparation` *carries the unchanged context through to Presentation* |
| AC-6 | Nothing added to a Comparison Set and no Compare Start claimed | Covered | `i4-compare-preparation` *adds nothing to a Comparison Set and claims no Compare Start* |
| AC-7 | The context cleared when the person leaves the flow | Covered | `i4-compare-preparation` *offers a way out, and leaving is a submission rather than a link* and *says nothing about preparation when there is none* |
| AC-8 | Normal eligibility, card, ordering, Filter and Zero Results rules apply inside the constraint | Covered | `i4-compare-preparation` *applies the ordinary Result rules inside the constraint* |

## The criterion that was about an ending

`US-DSC-F09-001` AC-3 — "the system shall end Discovery responsibility for that
current open action" — is the only Discovery criterion nothing asserted, and the
reason is worth keeping.

**An ending is only observable as things that stop happening.** Every other
criterion in this domain names something the platform must do or must refuse,
and both are straightforward to assert. A responsibility that finishes produces
no row, no field and no response to check; it shows up as the absence of a
second Start, an unchanged path, and an occurrence that belongs somewhere else.

Two tests, from the two sides that can be seen:

- The path is asked the same question before and after an Offering is opened
  and gives the same answer, and still holds its one Start. Opening is not a
  step in the path.
- The occurrence is asserted against the *schema*: `offering_presentation_open`
  holds the Offering and the Domain it happened in, and has no column that
  could name a Discovery path. Nothing downstream can attribute an open back to
  the route that led there, even by accident. That is a stronger claim than one
  row not carrying the association, because it says the association cannot be
  made.

## Discovery advancement

| Story | Criteria | Delivery Status |
|---|---|---|
| `US-DSC-F01-001` Homepage Discovery Entry | 8 of 8 verified | Not Started → **Done** |
| `US-DSC-F02-001` Search | 8 of 8 verified | Not Started → **Done** |
| `US-DSC-F03-001` Browse | 8 of 8 verified | Not Started → **Done** |
| `US-DSC-F04-001` Search Category Narrowing | 7 of 7 verified | Not Started → **Done** |
| `US-DSC-F05-001` Attribute Filtering | 12 of 12 verified | Not Started → **Done** |
| `US-DSC-F06-001` Discovery Results and Listing Cards | 8 of 8 verified | Not Started → **Done** |
| `US-DSC-F07-001` Default Result Ordering | 7 of 7 verified | Not Started → **Done** |
| `US-DSC-F08-001` Zero Results Recovery | 8 of 8 verified | Not Started → **Done** |
| `US-DSC-F09-001` Offering Presentation Handoff | 7 of 7 verified | Not Started → **Done** |
| `US-DSC-F10-001` Compare Preparation Discovery Return | 8 of 8 verified | Not Started → **Done** |

No Discovery criterion is covered by absence. Every one is asserted against
behaviour, and the closest to an exception — AC-3's second test — is asserted
against the schema, which is checkable rather than merely believable.

## Decision — `US-0004`

Seven Stories, 72 Acceptance Criteria. The I5 suites reach 71 of them, and the
seventy-second is `US-DEC-F03-001` AC-5's clause about **comparable Attribute
differences** — undemonstrated for a structural reason rather than an oversight:
every existing Chat test enters a flow holding one Offering, and a difference
needs two. It is proved by the three tests in
`i9-decision-delivery.integration.test.ts`.

Two of this domain's criteria were closed by the Identity increment rather than
by this one. `US-DEC-F06-001` AC-7 and AC-8 are the same requirement as
`US-IDN-F09-001` AC-2 seen from the other side, and before the resume cookie
existed neither was met.

### `US-DEC-F01-001` — Comparison Set and Compare

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Compare optional; no set required for a single-Offering path | Covered | `i5-decision-context` *enters with one eligible Offering and no Compare*; `i5-offering-selection` *selects the single-Offering context without Compare* |
| AC-2 | A set accepted only at two to five publicly eligible Offerings | Covered | `i5-comparison-set` *begins a set that cannot yet be opened*, *refuses to open a set of one and records nothing* and *refuses a sixth member until one is explicitly replaced* |
| AC-3 | Every member shares the same active leaf Category | Covered | `i5-comparison-set` *refuses a member from another leaf Category and leaves the set alone* |
| AC-4 | An ineligible or wrong-leaf Offering rejected without altering the valid set | Covered | The same test, and *refuses an Offering that is not publicly eligible* |
| AC-5 | Explicit add or remove while the set stays valid | Covered | `i5-comparison-set` *lets a member be removed and the set stay usable* |
| AC-6 | Explicit removal or replacement before a sixth may enter | Covered | `i5-comparison-set` *refuses a sixth member until one is explicitly replaced* |
| AC-7 | Only applicable comparable Attributes for the shared leaf | Covered | `i5-comparison-set` *compares only the Attributes marked comparable* and *keeps every comparable Attribute applicable to every member* |
| AC-8 | The authoritative value where supplied, `Not provided` where missing | Covered | `i5-comparison-set` *states an absent comparable value rather than filling it in* |
| AC-9 | No `Not applicable` result for a same-leaf set | Covered | `i5-comparison-set` *keeps every comparable Attribute applicable to every member* — sharing the leaf makes the case unreachable rather than handled |
| AC-10 | No invented value, default, normalization, ranking, winner or recommendation | Covered | `i5-comparison-set` *ranks nothing, scores nothing and recommends nothing* |
| AC-11 | Compare Start when a valid set is successfully opened | Covered | `i5-comparison-set` *opens Compare on two members and records the occurrence once* and *refuses to open a set of one and records nothing* |
| AC-12 | The unchanged valid set available to F02 | Covered | `i5-decision-context` *enters with the Comparison Set exactly as Compare left it* |

### `US-DEC-F02-001` — Decision Context

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Exactly one eligible Offering or one valid Comparison Set | Covered | `i5-decision-context` *refuses a context that is both, or neither* |
| AC-2 | One eligible Offering accepted without Compare | Covered | `i5-decision-context` *enters with one eligible Offering and no Compare* |
| AC-3 | The unchanged valid set from F01 accepted | Covered | `i5-decision-context` *enters with the Comparison Set exactly as Compare left it* |
| AC-4 | The context limited to the current Decision flow | Covered | `i5-decision-context` *keeps two flows apart*; `i5-decision-chat` *keeps the conversation to this flow and no other* |
| AC-5 | No unrelated Offering, set or prior decision merged in | Covered | `i5-decision-context` *keeps two flows apart*; `i9-decision-delivery` *carries only what the current context contains* |
| AC-6 | No persistent history, cross-decision memory or personal profile | Covered | `i5-decision-context` *stores nothing that ties a flow to a person*; `i5-decision-chat` *takes the conversation with the flow when it expires* |
| AC-7 | Chat and handoff unavailable when no valid context exists | Covered | `i5-decision-chat` *produces no occurrence and no answer on an invalid context*; `i5-offering-selection` *closes the handoff when the context itself becomes invalid* |
| AC-8 | Chat prevented from claiming information of an invalid or removed Offering | Covered | `i5-decision-chat` *withholds a reply that states a figure the context never contained* |
| AC-9 | Repair through UX-0004, another eligible Offering, or leaving | Covered | `i5-decision-context` *offers repairing the set only where there is a set* and *offers no repair while the context is valid* |

### `US-DEC-F03-001` — Decision Chat

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Public to Guest, User, Business, Admin and a Suspended holder's Guest baseline | Covered | `i5-decision-chat` *answers a Guest without an account, and an account no differently* — the route takes no principal, so there is nothing that could tell the five apart |
| AC-2 | No account creation before, during or after Guest Chat | Covered | The same test; `i5-affiliate-handoff` *hands a Guest off without an account before or after* holds the same property at the other end |
| AC-3 | Decision Chat Start only when Chat begins on a valid context | Covered | `i5-decision-chat` *produces Decision Chat Start once, however many questions follow* and *produces no occurrence and no answer on an invalid context* |
| AC-4 | Only authoritative information belonging to the current context | Covered | `i5-decision-chat` *withholds a reply that states a figure the context never contained* and *carries no telephone, email or contact URL into the conversation*; `i9-decision-delivery` *carries only what the current context contains* |
| AC-5 | Explanation of Offering information, comparable differences, authoritative values, `Not provided` and stated priorities | **Newly verified** | Four clauses by `i5-decision-chat` *explains the authoritative values and states what is missing* and *repeats the stated priorities without turning them into an order*; the fifth by `i9-decision-delivery` *puts both members' comparable values where the difference is visible*. See the note below on what explaining a difference means here |
| AC-6 | No invented value, fact, ranking, winner or recommendation | Covered | `i5-decision-chat` *withholds a reply that states a figure the context never contained* and *repeats the stated priorities without turning them into an order*; `i9-decision-delivery` *explains the difference without saying which is better* |
| AC-7 | Chat selects no Offering and begins no handoff | Covered | `i5-decision-chat` *selects nothing and begins nothing*; `i5-offering-selection` *gives Decision Chat no way to select, change or clear* |
| AC-8 | Chat selects no channel and reveals nothing protected to a Guest | Covered | `i5-decision-chat` *carries no telephone, email or contact URL into the conversation* |
| AC-9 | Context kept to the current flow; no saved history, profile, memory, Watch or forced account | Covered | `i5-decision-chat` *keeps the conversation to this flow and no other*, *takes the conversation with the flow when it expires* and *keeps the record that Chat began after the flow is gone* |
| AC-10 | No purchase, sale, contract, contact response or external success claimed | Covered | `i5-decision-chat` *makes no claim about a purchase, a reply or an external result* |

### `US-DEC-F04-001` — Explicit Offering Selection

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Explicit selection before any handoff becomes available | Covered | `i5-offering-selection` *offers no handoff until something is explicitly selected*; `i8-decision-handoff` *offers no path at all until something is selected* |
| AC-2 | The single Offering selectable without Compare | Covered | `i5-offering-selection` *selects the single-Offering context without Compare* |
| AC-3 | A selection from a set must be a current eligible member | Covered | `i5-offering-selection` *refuses an Offering the context does not contain* |
| AC-4 | Non-selected members stay in the set | Covered | `i5-offering-selection` *selects a current member and leaves the others in the set* |
| AC-5 | The person may explicitly change or clear the selection | Covered | `i5-offering-selection` *lets the person change and clear the selection* |
| AC-6 | Selection clears on removal, ineligibility or context replacement | Covered | `i5-offering-selection` *clears the selection when its member is removed from the set* and *clears the selection when its Offering stops being eligible* |
| AC-7 | Handoff and Direct Contact unavailable while no eligible selection exists | Covered | `i5-offering-selection` *offers no handoff until something is explicitly selected*; `i5-direct-contact` *refuses while nothing is selected* |
| AC-8 | Chat cannot select, confirm, change or clear | Covered | `i5-offering-selection` *gives Decision Chat no way to select, change or clear* |
| AC-9 | No Completion when selection clears or becomes invalid before initiation | Covered | `i5-decision-completion` *produces neither Completion before anything has happened*; `i8-recorded-gaps` *tells a selection that fell away apart from one never made* |

### `US-DEC-F05-001` — Affiliate Handoff

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Public, without authentication | Covered | `i5-affiliate-handoff` *hands a Guest off without an account before or after* |
| AC-2 | Both eligibility results required | Covered | `i5-affiliate-handoff` *refuses when the Offering has no eligible Affiliate Destination* and *refuses once the Offering stops being publicly eligible* |
| AC-3 | Both results consumed without recalculation | Covered | `i5-affiliate-handoff` *refuses once the destination is disabled again* — the answer changes because `US-OFR-F07-001` changed it, not because Decision re-derived it |
| AC-4 | Unavailable when either result is Ineligible | Covered | As AC-2, from both sides |
| AC-5 | The person explicitly chooses the action | Covered | `i5-affiliate-handoff` *refuses while nothing is selected, and records nothing*; `i8-decision-handoff` renders it as a submission rather than a link |
| AC-6 | The exact eligible destination becomes the active destination | Covered | `i5-affiliate-handoff` *makes the exact eligible destination active* and *keeps the address that was made active even after it is re-authored* |
| AC-7 | No Registration before or after a Guest handoff | Covered | `i5-affiliate-handoff` *hands a Guest off without an account before or after* |
| AC-8 | One initiation result for F07 | Covered | `i5-affiliate-handoff` *records one initiation for each successful handoff* |
| AC-9 | No result when initiation fails | Covered | `i5-affiliate-handoff` *refuses while nothing is selected, and records nothing*; `i8-decision-handoff` *claims no Completion when a handoff is refused* |
| AC-10 | No Favorites, Messaging, history, destination authoring or success claim | Covered | `i5-affiliate-handoff` *claims nothing about what happens at the destination* and *outlives the flow it belonged to* |

### `US-DEC-F06-001` — Direct Contact

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Enabled status and an authenticated User context required | Covered | `i5-direct-contact` *reveals nothing to a Guest, and says nothing about the values* and *reveals the chosen channel to an Enabled authenticated User* |
| AC-2 | The Selected Offering must remain publicly eligible | Covered | `i5-direct-contact` *refuses once the Selected Offering stops being publicly eligible* |
| AC-3 | At least one approved supplied channel required | Covered | `i5-direct-contact` *says a Business with no channel cannot be contacted* |
| AC-4 | Only telephone, email and contact URL in V1 | Covered | `i5-direct-contact` *supports exactly telephone, email and contact URL* and *refuses a channel the Business never supplied* |
| AC-5 | Explicit selection where more than one channel is available | Covered | `i5-direct-contact` *requires the person to name which channel* |
| AC-6 | Protected information unavailable to a Guest | Covered | `i5-direct-contact` *reveals nothing to a Guest*; `i8-decision-handoff` *tells a Guest nothing protected and asks nothing of the Business* |
| AC-7 | A Guest sent to UX-0008 with the exact interrupted context | Covered | `i9-identity-delivery` *brings the interrupted channel back and asks it again* — the same requirement as `US-IDN-F09-001` AC-2, and unmet until the resume cookie was added |
| AC-8 | Account, Offering, channel and eligibility re-evaluated after the return | Covered | `i9-identity-delivery` *resumes nothing that stopped being on offer*; the resumed request is an ordinary submission and meets the AC-1 to AC-5 gates again |
| AC-9 | Information revealed and the channel made available only after every gate passes | Covered | `i5-direct-contact` *reveals the chosen channel to an Enabled authenticated User* |
| AC-10 | One reveal-and-availability result for F07 | Covered | `i5-direct-contact` *records one reveal result, and not the value it revealed* |
| AC-11 | Nothing continued or revealed when the return or eligibility is invalid | Covered | `i5-direct-contact` *refuses once the Selected Offering stops being publicly eligible*; `i9-identity-delivery` *resumes nothing that stopped being on offer* |
| AC-12 | No message, inbox, conversation, reply, delivery, answer, response state or success confirmation | Covered | `i5-direct-contact` *creates no message, conversation or response state* |

### `US-DEC-F07-001` — Decision Completion

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Affiliate Handoff Completion from a successful initiation | Covered | `i5-decision-completion` *produces Affiliate Handoff Completion from a successful initiation* |
| AC-2 | Direct Contact Completion from a successful reveal | Covered | `i5-decision-completion` *produces Direct Contact Completion from a successful reveal* |
| AC-3 | No additional confirmation after the evidence occurs | Covered | `i5-decision-completion` *stores no Completion of its own* — the Completion is composed from the evidence, so there is no second step it could wait for |
| AC-4 | The two Completions stay separate results | Covered | `i5-decision-completion` *keeps the two Completions apart when both happened*; `i8-decision-handoff` *counts the two Completions as two* |
| AC-5 | Completion means only the end of V1 Decision-support responsibility | Covered | `i5-decision-completion` *claims no purchase, reply or external result* |
| AC-6 | No purchase, sale, booking, contract, call, reply, transaction or external success claimed | Covered | The same test; `i8-decision-handoff` *claims nothing about what happened after the handoff* |
| AC-7 | No Completion when anything required is invalid or unsuccessful | Covered | `i5-decision-completion` *produces no Completion from a refused handoff* and *produces no Completion from a refused reveal* |
| AC-8 | PRD-0006 consumes the results without redefining them | Covered | `i5-decision-completion` *leaves the evidence for Basic Analytics to consume*; `i7-basic-analytics` *keeps the two Completions separate and calls neither a sale* |
| AC-9 | No persistent history, Favorites, Messaging or outcome tracking | Covered | `i5-decision-completion` *stores no Completion of its own*; `i5-affiliate-handoff` *claims nothing about what happens at the destination* |
| AC-10 | The same meaning across all three Domains | Covered | `i5-decision-completion` *means the same thing in every Domain* |

## What "explaining a difference" means here

`US-DEC-F03-001` AC-5 permits Chat to explain five things. Four are
straightforward. The fifth — comparable Attribute differences — sits directly
against AC-6, which forbids a ranking, a winner and a recommendation, and the
two together leave a narrow band.

**The platform's answer is to put both authoritative values where a person can
hold them side by side, and to stop there.** Asked for the mileages of two
compared cars, the reply carries 42000 km and 130000 km, each under the title it
belongs to. The difference is present and legible; nothing says which is
preferable, because that would be the conclusion AC-6 refuses.

The second test asks the harder question outright — *hangisini almalıyım?* —
while handing the assistant a priority that points at one of the two. The reply
still reports: the stated priority comes back as something the person said, and
no comparative or superlative appears. That is asserted against a vocabulary
rather than a sentence, because a recommendation can be phrased many ways and
all of them need those words.

**What this does not claim.** V1 has no assistant vendor. The shipped adapter
restates the brief, and the brief carries every comparable value of every
member, which is why the fifth clause is satisfiable at all. A vendor adapter
would be handed exactly the same brief and would face exactly the same two
tests. The Story is `Done` on the behaviour the platform has, not on a
capability it is waiting for — and if a vendor is ever fitted, these are the
tests that say whether it stayed inside AC-6.

## The criteria the Identity increment closed

`US-DEC-F06-001` AC-7 and AC-8 ask Direct Contact to send an interrupted Guest
to UX-0008 with the exact context, and to re-evaluate everything on the way
back. They are the same requirement as `US-IDN-F09-001` AC-2 from the other
end, and **before the resume cookie was added, none of the three was met**: the
chosen channel was carried nowhere, so a person came back to their own question
unanswered.

Worth recording because it is the case for doing this domain by domain rather
than Story by Story. Read alone, `US-DEC-F06-001` AC-7 looks satisfied by the
`401` that interrupts the Guest. It is only when the criterion on the other side
names the four things the context must contain that the missing one becomes
visible.

## Decision advancement

| Story | Criteria | Delivery Status |
|---|---|---|
| `US-DEC-F01-001` Comparison Set and Compare | 12 of 12 verified | Not Started → **Done** |
| `US-DEC-F02-001` Decision Context | 9 of 9 verified | Not Started → **Done** |
| `US-DEC-F03-001` Decision Chat | 10 of 10 verified | Not Started → **Done** |
| `US-DEC-F04-001` Explicit Offering Selection | 9 of 9 verified | Not Started → **Done** |
| `US-DEC-F05-001` Affiliate Handoff | 10 of 10 verified | Not Started → **Done** |
| `US-DEC-F06-001` Direct Contact | 12 of 12 verified | Not Started → **Done** |
| `US-DEC-F07-001` Decision Completion | 10 of 10 verified | Not Started → **Done** |

No Decision criterion is covered by absence.

## Platform — `US-0006`

Ten Stories, 133 Acceptance Criteria — the largest domain, and the one the
opening scan misread most badly: it credited zero citations to
`US-PLT-F10-001` while eleven tests already covered all eighteen of its
criteria. The I2 and I7 suites reach 132 of the 133.

**One criterion had no test**, and it is the hardest kind to write one for. It
is proved by the three tests in `i9-platform-delivery.integration.test.ts`.

### `US-PLT-F01-001` — Admin Panel Access and Baseline

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Enabled, authorized and explicitly entered before the Panel opens | Covered | `i7-admin-panel` *opens only for an Enabled, authorized, entered account*; `i8-admin-dashboard` *opens for none of the three conditions on its own* |
| AC-2 | Authorization attaches to the existing account; no separate Admin identity | Covered | `i7-admin-panel` *uses the existing account and publishes no separate Admin identity* |
| AC-3 | Status and authorization re-evaluated on every entry | Covered | `i7-admin-panel` *closes the moment the authorization is removed* |
| AC-4 | The Guest and User baseline inherited inside Admin context | Covered | `i7-admin-panel` *takes nothing away by being entered* |
| AC-5 | Admin behaviour available only while the context is active | Covered | `i7-admin-panel` *keeps Admin behaviour unavailable outside the context*; `i2-category-management` *refuses management to an authorized Admin who has not entered the context* |
| AC-6 | No Business ownership or management authority from authorization alone | Covered | `i7-admin-panel` *grants no Business ownership from authorization alone*; `i8-admin-dashboard` *creates no Business ownership by authorizing an account* |
| AC-7 | No grant, remove, transfer, delegate, tier or self-service provisioning in the Panel | Covered | `i7-admin-panel` *offers no way to grant, remove, transfer or delegate Admin*; `i8-admin-dashboard` *offers no way to grant or remove Admin authority* |
| AC-8 | An ordinary Admin cannot provision another Admin | Covered | The same tests — there is no route, so the case is unreachable rather than refused |
| AC-9 | First-Admin and grant or removal reserved to the Owner outside the Panel | Covered | `i7-admin-panel` *reserves authorization changes to an operational path outside the Panel* |
| AC-10 | A Suspended account denied entry, public behaviour preserved | Covered | `i7-admin-panel` *denies a Suspended Admin while leaving public behaviour alone*; `i9-identity-delivery` *leaves a Suspended account everything a Guest has* |
| AC-11 | Logout handed to UX-0008, ending the context without removing authorization | Covered | `i7-admin-panel` *ends the context on logout and keeps the authorization*; `i9-identity-delivery` *logs out of an Admin context and keeps the authorization* |

### `US-PLT-F02-001` — General Moderation Case Management

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Exactly `Open` and `Closed` | Covered | `i7-moderation-case` *has exactly two statuses and starts Open* |
| AC-2 | A surfaced or newly opened case is `Open` | Covered | The same test, and *answers a second surfacing with the case that already exists* |
| AC-3 | Opening or reviewing changes no target state | Covered | `i7-moderation-case` *changes no target state by opening or reading* |
| AC-4 | Exactly the seven General Moderation actions | Covered | `i7-moderation-case` *publishes exactly the seven General Moderation actions* |
| AC-5 | Only actions valid for the target state and authority | Covered | `i7-moderation-case` *offers only actions valid for this target right now* and *offers every action that has a path, and would offer no more* |
| AC-6 | The case stays `Open` after Request Correction | Covered | `i7-moderation-case` *keeps the case Open after Request Correction* |
| AC-7 | Closure only after an approved action or recorded no-action decision | Covered | `i7-moderation-case` *closes only after an approved action or a recorded no-action decision* |
| AC-8 | Closing changes no target state | Covered | `i7-moderation-case` *changes no target state by closing* |
| AC-9 | Case status distinct from every target state | Covered | `i7-moderation-case` *carries no target product state at all* — the case table holds none, so the two cannot be conflated |
| AC-10 | Destination Administration kept separate from General Moderation | Covered | `i7-destination-administration` *is a separate family from General Moderation* |
| AC-11 | No closure claimed when the operation fails | Covered | `i7-moderation-case` *claims no closure when the closure fails* |

### `US-PLT-F03-001` — Offering Moderation Actions

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Hide available only for a `Published` Offering | Covered | `i7-offering-moderation` *hides only a Published Offering, and records the exact transition* |
| AC-2 | Hide applied as the PRD-0001 transition | Covered | The same test |
| AC-3 | Restore available only for a `Hidden` Offering | Covered | `i7-offering-moderation` *restores only a Hidden Offering, and records the exact transition* |
| AC-4 | Restore applied as the PRD-0001 transition | Covered | The same test |
| AC-5 | Lifecycle and eligibility ownership stays with PRD-0001 | Covered | `i7-offering-moderation` *leaves the composed eligibility to PRD-0001* |
| AC-6 | No Archive, un-archive, Hidden-to-Draft or publish action | Covered | `i7-offering-moderation` *has no Archive, un-archive, Hidden-to-Draft or publish-for-Business action* |
| AC-7 | No unrelated state changed by Hide or Restore | Covered | `i7-offering-moderation` *changes no unrelated state* and *keeps the first publication moment through both transitions* |
| AC-8 | No public eligibility claimed merely because Restore returns `Published` | Covered | `i7-offering-moderation` *promises no public eligibility just by restoring* |
| AC-9 | The case stays Open until explicit closure | Covered | `i7-offering-moderation` *leaves the case Open and cites the action that was applied* |
| AC-10 | No transition claimed when the action fails | Covered | `i7-offering-moderation` *claims no transition when the action fails* |

### `US-PLT-F04-001` — Business Moderation Actions

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Restrict available only for an `Unrestricted` Business | Covered | `i7-business-moderation` *restricts only an Unrestricted Business, and produces both outcomes* |
| AC-2 | `Restricted` and exposure `Ineligible` consumed after restriction | Covered | The same test |
| AC-3 | No Offering lifecycle changed by restriction | Covered | `i7-business-moderation` *moves no Offering lifecycle in either direction* |
| AC-4 | Published Offerings lose eligibility only through PRD-0001 composition | Covered | `i7-business-moderation` *records the composed result rather than only acting on it* |
| AC-5 | Restore available only for a `Restricted` Business | Covered | `i7-business-moderation` *restores only a Restricted Business, and produces both outcomes* |
| AC-6 | `Unrestricted` and exposure `Eligible` consumed after restoration | Covered | The same test |
| AC-7 | No Draft, Hidden or Archived lifecycle restored | Covered | `i7-business-moderation` *moves no Offering lifecycle in either direction*; `i6-business-restriction` *publishes nothing and un-hides nothing on restoration* |
| AC-8 | Only Published Offerings regain eligibility through composition | Covered | `i7-business-moderation` *gives no eligibility back to a Draft, Hidden or Archived Offering* |
| AC-9 | No destination, account or ownership change through either action | Covered | `i7-business-moderation` *reaches no Affiliate Destination, account or ownership row* |
| AC-10 | The case stays Open until explicit closure | Covered | `i7-business-moderation` *leaves the case Open and cites the action that was applied* |
| AC-11 | No transition claimed when the action fails | Covered | `i7-business-moderation` *claims no transition when the action fails* |

### `US-PLT-F05-001` — User Access Moderation Actions

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Suspend available to an ordinary Admin only for an Enabled non-Admin account | Covered | `i7-access-moderation` *suspends only an Enabled account, and consumes the exact transition* and *refuses an Admin-authorized account whatever state it is in* |
| AC-2 | `Enabled → Suspended` consumed after suspension | Covered | The same test |
| AC-3 | Reinstate available only for a Suspended non-Admin account | Covered | `i7-access-moderation` *reinstates only a Suspended account, and consumes the exact transition* |
| AC-4 | `Suspended → Enabled` consumed after reinstatement | Covered | The same test |
| AC-5 | An ordinary-Admin attempt against an Admin-authorized account is rejected | Covered | `i7-access-moderation` *refuses an Admin-authorized account whatever state it is in* |
| AC-6 | Suspend or Reinstate of an Admin-authorized account reserved to the Owner | Covered by absence | No route accepts it; `m12-admin-context` *publishes no way to grant or remove Admin authorization* records the same boundary for authorization itself |
| AC-7 | Admin authorization preserved when such an account is Suspended | Covered | `i7-access-moderation` *preserves Admin authorization through suspension* |
| AC-8 | No Business, Offering, destination or eligibility change from either action | Covered | `i7-access-moderation` *leaves the account's Business, Offering and destination alone* |
| AC-9 | No User Account Request Correction target | Covered | `i7-access-moderation` *offers no User Account correction target*; `i6-correction-notice` *has no way to name a User Account as a target* |
| AC-10 | The case stays Open until explicit closure | Covered | `i7-access-moderation` *leaves the case Open and cites the action that was applied* |
| AC-11 | No transition claimed when the action fails | Covered | `i7-access-moderation` *claims no transition when the action fails* |

### `US-PLT-F06-001` — Request Correction and Re-review

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Exactly four correction targets | Covered | `i7-correction-re-review` *accepts the exact four targets and no account correction* |
| AC-2 | User Account excluded from V1 | Covered | The same test |
| AC-3 | The case stays `Open` after Request Correction | Covered | `i7-correction-re-review` *keeps the case Open and changes nothing by requesting a correction* |
| AC-4 | No state changed solely through Request Correction | Covered | The same test |
| AC-5 | A bounded notice created in UX-0005 without Messaging | Covered | `i7-correction-re-review` *creates a notice and no conversation*; `i6-correction-notice` *creates no message, conversation or reply* |
| AC-6 | The bounded path only for an Open case on an exact owned Published or Hidden Offering | Covered | `i6-correction-notice` *opens the bounded path only when every condition holds* |
| AC-7 | Limited to the exact Offering and content area | Covered | `i6-correction-notice` *limits the edit to the exact targeted content area* and *limits the edit to the exact Offering* |
| AC-8 | No creation, publication, unrelated edit, status change, closure or Messaging granted | Covered | `i7-correction-re-review` *grants the owner nothing beyond the bounded edit* |
| AC-9 | The saved correction preserves the Universal Publication Minimum | Covered | `i7-correction-re-review` *requires the saved correction to keep the Offering publishable* |
| AC-10 | The case stays Open after the edit and requires re-review | Covered | `i7-correction-re-review` *refuses closure while the owner's answer is unread* and *allows closure once the answer has been read* |
| AC-11 | Business Restricted, exposure Ineligible and the Offering ineligible until re-review | Covered | `i7-correction-re-review` *keeps everything where it was through the whole exchange* |
| AC-12 | Closure after re-review only on an approved action or no-action decision | Covered | `i7-correction-re-review` *will not let one review stand in for a later answer* |
| AC-13 | No target state changed solely by closing | Covered | `i7-moderation-case` *changes no target state by closing* |
| AC-14 | The bounded response is part of Request Correction, not an eighth action | Covered | `i7-correction-re-review` *is not an eighth General Moderation action* |

### `US-PLT-F07-001` — Affiliate Destination Administration

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Kept separate from General Moderation | Covered | `i7-destination-administration` *is a separate family from General Moderation* |
| AC-2 | Exactly Review, Validate, Enable and Disable | Covered | `i7-destination-administration` and `i8-admin-destinations` publish the same four and no fifth |
| AC-3 | Review alone changes nothing | Covered | `i7-destination-administration` *changes nothing through Review alone*; `i3-affiliate-governance` *leaves every result unchanged when Review alone is completed* |
| AC-4 | `Valid` or `Invalid` consumed while status is preserved | Covered | `i7-destination-administration` *consumes Valid or Invalid while preserving the status* |
| AC-5 | Enable only when validation is `Valid` | Covered | `i7-destination-administration` *enables only a Valid destination, and composes eligibility from the pair* |
| AC-6 | `Enabled` and `Eligible` consumed after Enable | Covered | The same test |
| AC-7 | `Disabled` and `Ineligible` consumed after Disable, validation preserved | Covered | `i7-destination-administration` *disables while preserving the validation result* |
| AC-8 | `Needs Validation` derived from Draft plus Not Validated | Covered | `i7-destination-administration` *derives each workload category from the pair that produces it* |
| AC-9 | `Business Correction Needed` derived from Draft plus Invalid | Covered | The same test |
| AC-10 | `Ready to Enable` derived from Draft plus Valid | Covered | The same test |
| AC-11 | No pending item for Enabled or Disabled | Covered | `i7-destination-administration` *produces no pending item for an Enabled or Disabled destination* |
| AC-12 | No new destination state created from a workload category | Covered | `i7-destination-administration` *stores no workload category anywhere* and *composes the category without a database* |
| AC-13 | No lifecycle, moderation, access status or eligibility changed by administration | Covered | `i7-destination-administration` *reaches no Offering, Business or account*; `i3-affiliate-governance` *changes no Offering lifecycle, Business moderation or account status* |
| AC-14 | No Messaging, network integration, attribution, commission, settlement or conversion tracking | Covered | `i7-destination-administration` *creates no Messaging or commercial behaviour* |
| AC-15 | No result claimed when an action fails | Covered | `i7-destination-administration` *claims no result when an action fails* |

### `US-PLT-F08-001` — Category and Domain Management

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | A root Category created with exactly one V1 Domain | Covered | `i2-category-management` *creates a root under one V1 Domain*, *refuses a root outside the three V1 Domains* and *seeds exactly the three V1 Domains* |
| AC-2 | A child created under one valid parent | Covered | `i2-category-management` *refuses a Category that is both a root and a child* |
| AC-3 | Rename preserves identity | Covered | `i2-category-management` *preserves identity across a rename* |
| AC-4 | Reparenting only within a valid same-Domain hierarchy | Covered | `i2-category-management` *reparents within the same Domain* |
| AC-5 | A Category cannot become its own ancestor | Covered | `i2-category-management` *refuses a Category as its own parent* and *refuses a parent from inside its own subtree* |
| AC-6 | Every root has exactly one V1 Domain | Covered | `i2-category-management` *refuses a root outside the three V1 Domains* |
| AC-7 | Children inherit their root Domain | Covered | `i2-category-management` *makes a child inherit its parent's Domain*; `i8-admin-catalog` *gives a child its parent's Domain and no way to change it* |
| AC-8 | Offering assignment only to an active leaf | Covered | `i2-category-management` *assigns an Offering only to an active leaf*; `i8-recorded-gaps` *offers exactly the Categories creation would accept* |
| AC-9 | An Offering's Domain derived from its leaf | Covered | `i2-category-management` *derives the Offering's Domain from its leaf Category* |
| AC-10 | Cross-Domain reparenting prevented | Covered | `i2-category-management` *refuses a parent in another Domain*; `i8-admin-catalog` *refuses a cross-Domain move and leaves the hierarchy alone* |
| AC-11 | Root Domain fixed once a child or Offering exists beneath it | Covered | `i2-category-management` *keeps a used root's Domain fixed* |
| AC-12 | Retirement only with no active child and no live Offering assigned | Covered | `i2-category-management` *retires a Category with no active dependencies*, *refuses retirement while an active child remains* and *refuses retirement while a Draft Offering remains assigned* |
| AC-13 | Archived history does not block retirement | Covered | `i2-category-management` *lets Archived history keep its Category association*; `i8-admin-catalog` *ARCHIVED_DOES_NOT_BLOCK* is said on the screen before the attempt |
| AC-14 | A retired Category takes no new Offering and leaves active Browse | Covered | `i2-category-management` *refuses a new Offering on a retired Category* and *refuses a child under a retired parent*; `i3-browse` *excludes retired Categories from every destination* |
| AC-15 | No deletion, merge, automated replacement or cross-Domain migration | Covered | `i2-category-management` *offers no way to delete a Category*; the other three have no route and no shape to be expressed in |
| AC-16 | No result claimed when a save fails | Covered | `i2-category-management` *claims no result when an action fails* |

### `US-PLT-F09-001` — Attribute Definition Management

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | The complete property set required | Covered | `i2-attribute-definitions` *creates a definition with the complete property set* |
| AC-2 | Exactly five V1 value kinds | Covered | `i2-attribute-definitions` *supports exactly the five V1 value kinds* |
| AC-3 | Number may define at most one optional unit | Covered | `i2-attribute-definitions` *keeps the unit with Number* |
| AC-4 | Select kinds require at least one allowed value | Covered | `i2-attribute-definitions` *requires a Select kind to have an allowed value* and *refuses to retire the last allowed value of a Select* |
| AC-5 | Text cannot be filterable | Covered | `i2-attribute-definitions` *prevents Text from being filterable*; `i8-admin-catalog` *TEXT_IS_NOT_FILTERABLE* states it beside the control |
| AC-6 | Applicability may be added where the definition stays valid | Covered | `i2-attribute-definitions` *adds applicability freely* |
| AC-7 | Required-for-publication only when every live Offering already has a value | Covered | `i2-attribute-definitions` *allows required-for-publication only when every live Offering has a value* and *never blocks turning required-for-publication off* |
| AC-8 | Applicability removal blocked while a live Offering holds a value | Covered | `i2-attribute-definitions` *blocks removing applicability that an Offering relies on* and *allows removing applicability once only Archived history remains* |
| AC-9 | Value-kind change blocked while a live Offering holds a value | Covered | `i2-attribute-definitions` *blocks a value-kind change while a value exists* and *allows a value-kind change while nothing depends on it* |
| AC-10 | Allowed-value removal or change blocked while in use | Covered | `i2-attribute-definitions` *blocks relabelling and retiring an allowed value in use* |
| AC-11 | Archived values retained as historical and readable | Covered | `i2-attribute-definitions` *retires an unused allowed value while keeping it readable* and *allows removing applicability once only Archived history remains* |
| AC-12 | No existing Offering value silently deleted | Covered | AC-8, AC-9 and AC-10 together: every path that could have deleted one is refused while it exists |
| AC-13 | Filterable or comparable changes affect presentation without touching lifecycle | Covered | `i2-attribute-definitions` *changes filterable and comparable without touching an Offering* |
| AC-14 | Values, Filters and Compare left to their owning PRDs | Covered | `i3-attribute-filtering` and `i5-comparison-set` own those behaviours and are tested there |
| AC-15 | No deletion, merge, replacement, deprecation state or automated migration | Covered | `i2-attribute-definitions` *offers no way to delete a definition*; retirement of an allowed value is the only removal-shaped act and it preserves readability |
| AC-16 | No change claimed when a save fails | Covered | `i2-attribute-definitions` *claims no change when a save fails* |

### `US-PLT-F10-001` — Basic Analytics

| AC | Requirement | State | Evidence |
|---|---|---|---|
| AC-1 | Available only in an authorized active Admin context | Covered | `i7-basic-analytics` *opens only in an authorized active Admin context* |
| AC-2 | Exactly four selectable periods | Covered | `i7-basic-analytics` *offers exactly four periods and no custom range* |
| AC-3 | Overall and by Domain only where the source supplies one | Covered | `i7-basic-analytics` *breaks down by Domain only where the source records one*; `i8-admin-dashboard` *shows a figure with no Domain as having none* |
| AC-4 | A Search Start without a leaf counted only overall | Covered | `i7-basic-analytics` *counts a Search without a leaf Category overall and in no Domain* |
| AC-5 | No Domain inferred from free-text wording | Covered | The same test |
| AC-6 | User Accounts by Enabled and Suspended | Covered | `i7-basic-analytics` *shows every current-state indicator by its authoritative result* |
| AC-7 | Businesses by Unrestricted and Restricted | Covered | The same test |
| AC-8 | Offerings by lifecycle and final eligibility | Covered | The same test |
| AC-9 | Destinations by status, validation result and Handoff Eligibility | Covered | The same test |
| AC-10 | Moderation cases by status and Open cases by target type | Covered | The same test |
| AC-11 | Destination workload by its three categories | Covered | `i7-basic-analytics` *counts the workload with the same rule the queue uses* |
| AC-12 | The six core-flow indicators | Covered | `i7-basic-analytics` *keeps the two Completions separate and calls neither a sale* asserts the `coreFlow` keys equal `CORE_FLOW_INDICATORS` exactly, which is the Story's six |
| AC-13 | The two Completions consumed without redefinition | Covered | The same test |
| AC-14 | No Completion presented as an external success | Covered | The same test; `i8-admin-dashboard` *names a Completion for what the platform did and nothing more* |
| AC-15 | Actionable workload indicators open their queue | Covered | `i7-basic-analytics` *points actionable indicators at their queues and nothing else at all* |
| AC-16 | Informational indicators require no interaction | Covered | The same test |
| AC-17 | No moderation or management action performed automatically | Covered | `i7-basic-analytics` *does nothing by being read* |
| AC-18 | No advanced or predictive analytics, recommendation, report builder, Business-facing analytics, billing, CRM, advertising, transaction, attribution or conversion tracking | **Newly verified** | `i9-platform-delivery` *answers with exactly the groups the Story names and nothing derived*, *counts nothing per Business and offers no Business a figure* and *keeps the period the only thing a reader may choose* |

## Testing a criterion that forbids ten futures

`US-PLT-F10-001` AC-18 names ten things Basic Analytics must never become. Three
clauses were already held: a custom date range is refused, the words that would
turn a Completion into a sale appear nowhere in the response, and
`i6-business-dashboard` *reports no metric, ranking or trend of any kind* covers
the Business-facing clause from the other side.

The rest were carried by nothing, and the reason is instructive: **none of the
forbidden things exists, so there is nothing to call and watch refuse.** Writing
ten assertions that ten absent features are absent would produce ten tests that
pass for as long as nobody adds them and say nothing about why.

The assertion that earns its place is about *shape*:

- The snapshot's top-level keys are asserted as an equality against the nine
  groups the Story names. A forecast, a trend, a score or a recommendation
  would each arrive as a tenth key, and this is the line it would break.
- No Business identifier or name appears anywhere in the Admin figures. The
  platform counts Businesses by moderation status; it does not count *a*
  Business. That is the difference between Basic Analytics and the
  Business-facing analytics AC-18 excludes, and it is worth asserting because
  the two would look similar in a diff.
- A `groupBy` or `businessId` parameter is either refused or ignored — never
  honoured. A report builder grows along that axis, and the answer cannot be
  steered into one by asking differently.

## Platform advancement

| Story | Criteria | Delivery Status |
|---|---|---|
| `US-PLT-F01-001` Admin Panel Access and Baseline | 11 of 11 verified | Not Started → **Done** |
| `US-PLT-F02-001` General Moderation Case Management | 11 of 11 verified | Not Started → **Done** |
| `US-PLT-F03-001` Offering Moderation Actions | 10 of 10 verified | Not Started → **Done** |
| `US-PLT-F04-001` Business Moderation Actions | 11 of 11 verified | Not Started → **Done** |
| `US-PLT-F05-001` User Access Moderation Actions | 11 of 11 verified | Not Started → **Done** |
| `US-PLT-F06-001` Request Correction and Re-review | 14 of 14 verified | Not Started → **Done** |
| `US-PLT-F07-001` Affiliate Destination Administration | 15 of 15 verified | Not Started → **Done** |
| `US-PLT-F08-001` Category and Domain Management | 16 of 16 verified | Not Started → **Done** |
| `US-PLT-F09-001` Attribute Definition Management | 16 of 16 verified | Not Started → **Done** |
| `US-PLT-F10-001` Basic Analytics | 18 of 18 verified | Not Started → **Done** |

One Platform criterion is covered by absence: `US-PLT-F05-001` AC-6.

## What this record superseded

Advancing a Delivery Status made a sentence false in fourteen other documents.
Each said, in its own words, that all 50 Generated Stories remain
`Not Started` — true when written, and true until I9. They divide three ways,
and the division is the point: a record, a snapshot and a Frozen baseline each
want a different repair.

**Twelve are Living, and now carry a superseding note beside the claim rather
than a rewrite.** What a record asserted at its close is part of what it
records; a closure record edited to agree with a later state stops being
evidence of anything. They are `I1` through `I8`,
`IMPLEMENTATION_BACKLOG.md`, `FIRST_VERTICAL_SLICE_READINESS.md`,
`M11_SLICE_SCOPE_RECONCILIATION.md` and `M11_STORY_LINK_PROPOSAL.md`.

**The thirteenth is `docs/repository/REPOSITORY_INDEX.md`, and it was corrected
rather than annotated.** Its Repository Health table describes the present by
design, so a note saying "this was true once" would be the wrong repair for a
row whose whole job is to say what is true now. Its Development row also still
named M9; it now names M12 and the current counts.

**The fourteenth is `docs/traceability.md`, and this record cannot correct it.**
It is Frozen v1.0, and its §5 validation results assert:

> all 50 Generated Stories are `Frozen` with Delivery Status `Not Started`;

That line is now wrong in its second half and still right in its first: the
Stories are all Frozen, and 49 are `Done` with one `In Progress`. Editing a
Frozen document in place is what `DOCUMENT_LIFECYCLE.md` forbids, so it stays
as it is until a controlled superseding revision the Owner calls for.

This is the same open action `implementation/README.md` already records for
folding the M11 implementation links into that baseline. It is now two
corrections waiting on one revision rather than one, which is worth knowing
before deciding when to make it.

## Closure

All six domains are recorded. **526 Acceptance Criteria across 50 Frozen
Generated Stories**, each matched to the test that verifies it by reading both.

| | |
|---|---|
| `Done` | 49 Stories |
| `In Progress` | 1 Story — `US-OFR-F05-001` |
| `Not Started` | none |

`US-OFR-F05-001` AC-3 asks for Attribute values organized into understandable
groups, and PRD-0006 defines no group, section or ordering key to organize them
by. Eight of its nine criteria are verified. It completes when a governed
grouping exists, which is a controlled revision of a Frozen PRD and an Owner
decision rather than a delivery one.

**Seventeen criteria had no test at all** — twelve in Identity, two in
Business, and one each in Discovery, Decision and Platform. Offering needed
none. They were closed by nineteen tests across five new files, and they fall
into recognisable kinds:

- **What an action leaves alone.** Eleven of the twelve Identity gaps. Logging
  out is easy to assert; logging out without dropping a Business ownership is
  the part nobody checked.
- **A gate that already works.** Both Business gaps. Writing the first found
  that `BusinessService.create`'s Enabled check cannot be reached over HTTP,
  because suspension invalidates the session first.
- **An ending.** `US-DSC-F09-001` AC-3. A responsibility that finishes produces
  no row and no field; it shows only as things that stop happening.
- **A case the existing tests could not construct.** `US-DEC-F03-001` AC-5's
  comparable differences — every Chat test entered with one Offering, and a
  difference needs two.
- **A criterion that forbids futures.** `US-PLT-F10-001` AC-18. None of the ten
  excluded things exists, so the assertion had to be about the answer's shape
  rather than about ten absences.

**One criterion was not merely untested — it was unmet.** `US-IDN-F09-001` AC-2
requires the authentication return to carry the explicitly chosen contact
channel, and it was carried nowhere: somebody who pressed "Telephone", was asked
to sign in, and came back found their own question unanswered. It now travels in
a flow-keyed cookie holding two names from closed vocabularies. The same
requirement is `US-DEC-F06-001` AC-7 and AC-8 from the other side, so one change
closed three criteria — and read alone, AC-7 had looked satisfied by the `401`
that interrupts the Guest.

Ten criteria are recorded as **covered by absence** rather than by assertion,
because they forbid something no route, contract or shape can express:
`US-IDN-F06-001` AC-11, `US-IDN-F07-001` AC-5, `US-IDN-F08-001` AC-2, AC-3 and
AC-4, `US-BUS-F01-001` AC-9 and AC-10, `US-BUS-F02-001` AC-14,
`US-BUS-F05-001` AC-12, and `US-PLT-F05-001` AC-6. That is weaker evidence and
is marked as such throughout; a reviewer challenging one of them should look for
the absent route, not for a missing test.

### What the opening scan got wrong

The first pass counted citations and reported 71 of 526. Read as coverage, that
number was badly wrong — the tests were written from the Stories and reach
almost all of them, they simply cite the UX section they were written from
rather than the Story's AC numbering. `US-PLT-F10-001` showed zero citations
while eleven tests covered all eighteen of its criteria.

The scan was still worth running: it said where to look, not what was there.
Every row in this document was settled by reading the criterion and the test
together, which is the only method that would have found the twenty gaps or the
one unmet criterion.

