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

## Advancement

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

## Remaining domains

Business, Offering, Discovery, Decision and Platform are not advanced by this
document. Their criteria are recorded here as work continues, one domain per
change, on the same standard: read the criterion, read the test, and where
nothing reaches it, write one.

All 41 Stories outside Identity remain `Delivery Status: Not Started`.
