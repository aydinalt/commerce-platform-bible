# UX-0008 — Authentication

- **UX ID:** UX-0008
- **Title:** Authentication
- **Status:** Frozen
- **Version:** 1.0
- **Supersedes:** Draft v0.2
- **Approved candidate:** In Review v0.4
- **Approval Date:** 2026-07-22
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-07-22
- **Frozen By:** Product Owner / Architecture Owner
- **Scope level:** UX behaviour (non-visual, non-technical)

**Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-22. Frozen v1.0 is the locked V1 UX baseline for UX-0008 — Authentication. This exact version must not be edited in place. Any future change requires a controlled revision under `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, and, where architecture is affected, `ADR_PROCESS.md`. This Freeze does not automatically revise User Stories, traceability, repository indexes, or GitHub content.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-22 after Architecture Review, Final Review, package-level reconciliation, independent Claude UX audit, and focused delta audit. The exact In Review v0.4 content becomes the authoritative UX baseline as Approved v1.0 under the first-approval versioning rule. This historical Approval Note records that approval and Freeze were separate decisions. The document was subsequently Frozen on 2026-07-22. User Stories, traceability, repository indexes, and GitHub content do not change automatically.

**Revision Note (0.4):** Focused independent-audit correction for UX-A01. Assigns UX-0008 sole experience ownership for authenticated-context entry and Logout execution. Defines explicit entry to owned Business and authorized Admin contexts without granting ownership or authorization. Preserves exact Direct Contact return and all Frozen PRD-0003 gates.

**Revision Note (0.3):** Controlled revision against Frozen PRD-0003 v3.1, PRD-0004 v1.2, and the accepted UX ownership decision. Resolves registration, login, email-control proof, password recovery, Enabled/Suspended consequences, and exact return-to-Direct-Contact. Removes Favorites, Messaging, public Decision gates, unresolved account-verification TODOs, and any separate Pending/Verified state.

> This document defines experience behaviour only. It does not define credential technology, token implementation, visual style, components, APIs, storage, or security architecture.

---

## 1. Purpose

Authentication lets a person register, log in, log out, and recover access while preserving the platform's public Guest baseline and returning the person to an interrupted Direct Contact action where appropriate.

## 2. Business Value

The experience avoids premature registration, protects Direct Contact information, and restores the person's exact intended action after successful authentication.

## 3. Scope

- registration with email address and password;
- email-control proof before completed registration;
- login with registered email address and password;
- logout;
- password recovery through the registered email address;
- one-time email-control proof for recovery;
- new-password entry;
- Enabled and Suspended consequences;
- exact return-to-action for Direct Contact;
- direct Register and Login entry;
- authenticated-context entry selection;
- owned Business-context routing;
- authorized Admin-context routing;
- Logout execution from authenticated contexts.

## 4. Out of Scope

- social login;
- separate Business login;
- separate Admin login;
- self-service Admin authorization;
- separate Pending or Verified User Account state;
- Favorites;
- Messaging;
- authentication for Decision Chat;
- authentication for eligible Affiliate Handoff;
- password-complexity policy;
- credential storage;
- email-provider or token implementation;
- session technology.

## 5. Entry Points

- direct Register;
- direct Login;
- Direct Contact attempted by a Guest in UX-0009;
- password-recovery request;
- authenticated-context access requested from the public platform;
- Business Dashboard entry requested for an owned Business;
- Admin Dashboard entry requested by an Admin-authorized User;
- Logout requested from UX-0005, UX-0006, UX-0009, or another authenticated context.

Decision Chat and eligible Affiliate Handoff do not route to Authentication.

## 6. Registration

### 6.1 Required information

The person supplies:

- email address;
- password.

### 6.2 Email-control proof

Registration is not complete until control of the supplied email address is proven.

Before proof completes:

- no Enabled authenticated context is available;
- the person may continue the proof flow or leave;
- no separate product-level Pending account state is presented.

### 6.3 Completion

Successful registration:

- creates exactly one User Account;
- records the supplied email as the registered email address;
- sets User Account access status to Enabled;
- enters authenticated User context;
- creates no separate Verified state.

### 6.4 Existing registered email

Where the email already identifies an account:

- a second account is not created;
- the person is guided to Login or Password Recovery;
- account-existence disclosure copy remains bounded by trust and security implementation.

## 7. Login

The person supplies:

- registered email address;
- password.

Login succeeds only when:

- credentials are accepted;
- User Account access status is Enabled.

A Suspended account does not enter authenticated User, Business, or Admin context.

Public Guest behaviour remains available.

## 8. Authenticated Context Entry and Exit

UX-0008 is the single experience owner for entering and leaving authenticated contexts.

### 8.1 Direct authentication without interrupted action

After successful direct Registration or Login, the person returns to the public platform with available authenticated-context entries.

Depending on the authoritative relationships, the person may explicitly choose to:

- continue using the authenticated User baseline;
- enter UX-0005 for one owned Business;
- choose one owned Business and enter UX-0005 where more than one is owned;
- enter UX-0006 where Admin authorization is present.

UX-0008 does not:

- create Business ownership;
- choose a Business silently;
- grant Admin authorization;
- enter Admin context automatically;
- treat Business or Admin as a separate login identity.

### 8.2 Business Dashboard routing

UX-0008 sends UX-0005:

- the authenticated User context;
- the exact selected owned Business;
- no extra Business authority.

UX-0005 reevaluates its Entry Conditions.

### 8.3 Admin Dashboard routing

UX-0008 sends UX-0006:

- the authenticated User context;
- the existing Admin authorization relationship;
- no Business ownership.

UX-0006 reevaluates its Entry Conditions.

### 8.4 Logout ownership

Logout may be requested from any authenticated active UX.

The request is handed to UX-0008.

Logout:

- ends the current authenticated User, Business, or Admin context;
- returns the person to Guest-level abilities;
- does not delete the User Account;
- does not remove Business ownership;
- does not remove Admin authorization;
- does not preserve a privileged context after completion.

## 9. Password Recovery

### 9.1 Begin

An unauthenticated person begins recovery using the registered email address.

### 9.2 Proof

The person completes one-time proof of control through that registered email address.

### 9.3 Reset

After successful proof, the person sets a new password.

The same User Account is retained.

Password reset:

- does not change Suspended to Enabled;
- grants no Business authorization;
- grants no Admin authorization;
- allows the person to attempt Login.

## 10. Return-to-Action

### 10.1 Eligible trigger

Exact return-to-action applies when a Guest is interrupted by authenticated-only Direct Contact in UX-0009.

The return context includes:

- the exact Decision flow;
- the exact Selected Offering;
- the exact Direct Contact action;
- the selected channel where a channel was already explicitly chosen and remains available.

### 10.2 Success

After successful Registration or Login:

- the person returns to UX-0009;
- the exact Direct Contact eligibility is reevaluated;
- protected information is revealed only if all PRD-0004 conditions still hold.

### 10.3 Invalid return context

Where the selected Offering or contact channel is no longer eligible:

- Direct Contact does not continue;
- protected information remains unavailable;
- UX-0009 presents its bounded unavailable behaviour.

### 10.4 Direct authentication

Where Authentication was opened directly, successful Registration or Login returns the person to the public platform without inventing an interrupted action.

UX-0008 then presents only the authenticated-context entries supported by the person's existing authoritative relationships under §8.

## 11. User Actions

- register;
- prove control of the supplied email;
- log in;
- choose an available authenticated context;
- enter one owned Business context;
- enter Admin context where authorized;
- request Logout from an authenticated context;
- begin recovery;
- prove control of the registered email;
- set a new password;
- cancel and return to the prior public context.

## 12. System Responses

- prevents completed registration before email-control proof;
- creates one Enabled account after completed registration;
- rejects authenticated-context entry for Suspended accounts;
- retains the same account during recovery;
- preserves exact Direct Contact return context;
- routes only to authoritative owned Business or authorized Admin contexts;
- executes Logout for authenticated active UX documents;
- never gates public Decision Chat or eligible Affiliate Handoff.

## 13. Loading Behaviour

While an authentication step is being resolved:

- duplicate submission is prevented at the experience level;
- entered non-secret context needed for recovery or return is preserved;
- protected Direct Contact information remains unavailable;
- the person can identify the current step.

## 14. Error Behaviour

### Registration or proof failure

- registration remains incomplete;
- no authenticated context is created;
- the person may retry or leave.

### Login failure

- authenticated context is not entered;
- protected Direct Contact remains unavailable;
- the person may retry or begin recovery.

### Suspended account

- authenticated entry remains unavailable;
- the person may continue using public Guest behaviour;
- password recovery does not imply reinstatement.

### Recovery failure

- the existing account remains unchanged;
- the person may retry the proof process or return to Login.

## 15. Permissions

| Action | Guest | Enabled User | Suspended Account |
|---|---:|---:|---:|
| Register | ✓ | ✗ | ✗ |
| Attempt Login | ✓ | Not applicable while authenticated | ✓ |
| Enter an owned Business context | ✗ | Conditional | ✗ |
| Enter Admin context | ✗ | Conditional | ✗ |
| Logout | ✗ | ✓ | ✗ |
| Begin password recovery while unauthenticated | ✓ | Conditional | ✓ |
| Enter authenticated context | Conditional | ✓ | ✗ |
| Return to Direct Contact after successful authentication | Conditional | Conditional | ✗ |
| Use public Decision Chat | ✓ | ✓ | ✓ as Guest context |
| Initiate eligible Affiliate Handoff | Conditional | Conditional | Conditional as Guest context |
| Use Favorites | ✗ | ✗ | ✗ |
| Use Messaging | ✗ | ✗ | ✗ |

## 16. Accessibility Requirements

- Every authentication step has a clear purpose and current-step identity.
- Fields have persistent accessible labels.
- Proof, Login, and recovery errors are associated with the relevant step and are perceivable without color alone.
- Focus moves predictably after validation failure and step completion.
- Return-to-action does not remove the person's understanding of the interrupted Direct Contact purpose.
- Time-sensitive implementation, where used, must provide accessible status and recovery without creating new product behaviour.

## 17. Related Documents

- `PRD-0003-identity.md` — registration, login, recovery, access status, context gates.
- `PRD-0004-decision.md` — Direct Contact authentication condition.
- `UX-0009-decision-flow.md` — exact Direct Contact return destination.
- `UX-0005-business-dashboard.md` — authenticated Business-context entry.
- `UX-0006-admin-dashboard.md` — authorized Admin-context entry.

## 18. Acceptance Criteria

```gherkin
Scenario: Registration requires email-control proof
  Given a Guest supplies an email address and password
  When email control has not been proven
  Then registration is not complete
  And no authenticated User context is available

Scenario: Completed registration creates one Enabled account
  Given the Guest supplies email and password
  And proves control of the email
  When registration completes
  Then exactly one User Account exists
  And its access status is Enabled
  And no separate Pending or Verified state exists

Scenario: Login uses registered email
  Given an Enabled User Account
  When the person supplies the registered email and accepted password
  Then authenticated User context becomes available

Scenario: Suspended account cannot log in
  Given User Account access status is Suspended
  When accepted credentials are supplied
  Then authenticated context remains unavailable
  And public Guest behaviour remains available

Scenario: Recovery retains the account
  Given an unauthenticated account holder proves control through the registered email
  When a new password is set
  Then the same User Account is retained
  And suspension and authorizations are unchanged

Scenario: Direct Login exposes only authoritative context entries
  Given an Enabled User completes direct Login
  When no interrupted Direct Contact action exists
  Then the public platform becomes available
  And UX-0008 presents only owned Business entries and Admin entry where those authoritative relationships exist
  And no Business or Admin context is entered automatically

Scenario: Enter owned Business Dashboard
  Given an Enabled User explicitly selects one owned Business
  When UX-0008 routes the request
  Then UX-0005 receives the exact selected Business context
  And no other Business is selected silently

Scenario: Enter Admin Dashboard
  Given an Enabled User has Admin authorization
  When the person explicitly chooses Admin context
  Then UX-0006 receives the authenticated Admin context
  And no Business ownership is granted

Scenario: Logout is owned by Authentication
  Given Logout is requested from UX-0005 or UX-0006
  When UX-0008 completes Logout
  Then authenticated context ends
  And Guest-level abilities resume
  And Business ownership and Admin authorization remain unchanged

Scenario: Direct Contact returns to the exact action
  Given a Guest was routed from a valid Selected Offering Direct Contact action
  When the person authenticates successfully
  Then UX-0009 receives the exact return context
  And Direct Contact eligibility is reevaluated before protected information is revealed

Scenario: Public Decision behaviour does not trigger Authentication
  Given a Guest uses Decision Chat or an eligible Affiliate Handoff
  When the action begins
  Then UX-0008 is not opened
  And no registration is required

Scenario: Favorites and Messaging do not trigger Authentication
  Given the active V1 Authentication experience
  When authentication triggers are evaluated
  Then Favorites and Messaging are absent
```

## 19. Accepted UX Deferrals

The following do not block review:

- exact authentication copy;
- password-visibility interaction;
- technical email and token delivery;
- technical session handling;
- anti-abuse and throttling implementation;
- visual layout and responsive treatment.

No deferral may add a new account state, social login, alternate login identifier, Favorites, Messaging, or authentication gates for public Decision Chat or eligible Affiliate Handoff.
