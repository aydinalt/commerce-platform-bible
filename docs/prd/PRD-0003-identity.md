# PRD-0003 — Identity

- **Owner:** Product Owner / Architecture Owner
- **PRD ID:** PRD-0003
- **Title:** Identity
- **Status:** Frozen
- **Version:** 3.1
- **Last Updated:** 2026-07-21
- **Scope level:** Product behaviour (non-technical)
- **Supersedes:** Approved v2.1
- **Approved candidate:** In Review v3.1
- **Approval Date:** 2026-07-21
- **Approved By:** Product Owner / Architecture Owner
- **Freeze state:** Frozen
- **Freeze Date:** 2026-07-21
- **Frozen By:** Product Owner / Architecture Owner

> This document is the Single Information Owner of Identity product behaviour: User Accounts, Guest and authenticated access contexts, registration, login, logout, password recovery, the Business context relationship, the Admin context relationship, and authentication gates consumed by other PRDs. It defines no credential technology, session implementation, identity provider, API, database, storage, encryption, security mechanism, frontend flow, or infrastructure.

**Freeze Note (3.1):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-21. Frozen v3.1 is the locked V1 PRD baseline for PRD-0003 — Identity. This exact version must not be edited in place. Any future change requires a controlled revision under `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`, and, where architecture is affected, `ADR_PROCESS.md`. This Freeze does not automatically revise UX, User Stories, traceability, repository indexes, or GitHub content.

**Approval Note (3.1):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-21 after Architecture Review, Final Review, package-level reconciliation, independent Claude audit, and all bounded audit corrections. Approved v3.1 supersedes Approved v2.1 and is the authoritative PRD baseline for PRD-0003 — Identity. This historical Approval Note records that approval and Freeze were separate decisions. The PRD was subsequently Frozen on 2026-07-21. No UX, User Story, traceability, or GitHub file changes automatically.

**Revision Note (3.1):** Controlled Claude-audit correction for findings A-03 and A-06. Renumbers Business Rules as one unambiguous sequence without changing rule content and removes embedded lifecycle-status assertions about related PRDs. No identity, gate, role, authorization, or access-status behaviour changes.

**Revision Note (3.0):** Controlled post-approval Freeze-correction candidate applying Owner Decision P-01. Completes the V1 registration, login, email-control proof, password-recovery, and verification contract without introducing a new User Account state. Registration completes only after control of the supplied email address is proven and then creates one Enabled User Account. Login uses the registered email address and password. Recovery uses one-time proof through the registered email address and cannot reinstate suspension or grant authorization. Removes stale candidate and cross-PRD wording. Status remains In Review v3.0. Approved v2.1 remains authoritative until explicit approval.

**Approval Note (2.1):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-21 after Architecture Review and Final Review verdict `PASS — READY FOR OWNER APPROVAL`. Approved v2.1 supersedes Approved v1.0 and becomes the authoritative product-behaviour source for User Account access status, Guest and authenticated User contexts, Business and Admin context gates, Admin authorization attachment, public Decision Chat and Affiliate Handoff gates, authenticated-only Direct Contact, and suspension/reinstatement consequences. Registration information, login identifier, password-recovery verification, and optional account verification remain controlled pre-Freeze questions. This approval does not freeze PRD-0003, redefine downstream behaviour, modify another document, or update GitHub automatically.

**Revision Note (2.1):** Controlled correction of In Review v2.0 after the independent Cross-PRD Architecture Audit and explicit Owner Decisions D-01/D-02, D-04, D-06, D-07, D-15/D-16, and D-38. Records Decision Chat and eligible Affiliate Handoff as public Guest behaviours; preserves Direct Contact and approved telephone, email, and external contact URL information as authenticated-only; introduces the User Account access statuses Enabled and Suspended; defines suspension and reinstatement consequences; preserves public Guest access while Suspended; records Owner-only suspension and reinstatement of Admin-authorized accounts; records that Admin authorization attaches to an existing User Account and is granted or removed only by the Product Owner / Architecture Owner through controlled operational provisioning; removes the resolved Guest-gate, Direct Contact, and separate-operator Open Questions; and aligns Identity with Approved PRD-0006 v1.0. Approved v2.1 is authoritative from 2026-07-21 and supersedes Approved v1.0.

**Revision Note (2.0):** Substantive post-approval revision of Approved v1.0. The candidate enters In Review v2.0 under `DOCUMENT_LIFECYCLE.md`. It narrows Identity to account, authentication, access-context, and authentication-gate ownership; treats Business and Admin as authorized contexts rather than separate login identities; moves Business creation and management behaviour to `PRD-0005-business.md`, Admin provisioning and moderation behaviour to `PRD-0006-platform.md`, and Decision behaviour to `PRD-0004-decision.md`; removes Favorites and Messaging from the V1 Identity baseline because they are not included in Frozen `V1_SCOPE.md`; corrects password recovery so it can begin while the account holder is unauthenticated; separates access-context progression from Business and content lifecycles; and records unresolved Decision Chat and affiliate-handoff gating without inventing a decision. This historical v2.0 revision note records the earlier candidate state; Approved v2.1 now supersedes Approved v1.0.

**Review Completion Note (2.1):** The decision-reconciled candidate entered formal review on 2026-07-21 and completed Architecture Review and Final Review. Explicit Owner approval changed the lifecycle from Approved v1.0 → Approved v2.1. No Freeze or automatic downstream change is inferred.

---

## 1. Purpose

Identity defines who is acting, whether that person is authenticated, which authorized context they are using, and which product actions require authentication.

Identity provides a consistent access model for all other PRDs while keeping capability-specific behaviour in its owning document.

The V1 identity model consists of:

- a public Guest context;
- a persistent User Account;
- an authenticated User context;
- a Business context exercised through an owned Business profile;
- an Admin context exercised by an authenticated account with Admin authorization.

A Business is never a separate login identity.

---

## 2. Business Value

Identity allows people to begin the decision journey without unnecessary friction while protecting actions that require an accountable identity.

It supports the Foundation by:

- allowing public discovery, Offering evaluation, and comparison without registration;
- requiring authentication only where the approved product gate requires it;
- keeping one User Account across all Businesses owned by that person;
- avoiding a separate Business login;
- keeping Admin authority distinct from ordinary User and Business contexts;
- helping the platform remain simple, trustworthy, and consistent across domains.

---

## 3. Scope

V1 Identity includes:

- User Account creation through registration;
- login;
- logout;
- password recovery and reset behaviour;
- Guest access;
- authenticated User access;
- the rule that a Business is a profile managed through a User Account, not a separate account;
- the rule that one User may own multiple Businesses;
- entry into an owned Business context;
- recognition of an Admin context for an Enabled authenticated account with Admin authorization;
- the relationship between User Account access status and authenticated-context availability;
- the relationship between Admin authorization and the existing User Account;
- authentication gates for public versus login-required behaviour;
- the product-level permissions matrix in this PRD;
- consistent identity behaviour across Mobility, Real Estate, and Technology.

Identity owns whether authentication or an authorized context is required. The PRD that owns an action owns what that action does.

---

## 4. Out of Scope

The following are outside this PRD:

- Business Profile creation, fields, management, visibility, dashboard, or lifecycle;
- Offering creation, editing, publication, retirement, lifecycle, or ownership behaviour;
- technical Admin provisioning mechanism;
- Admin authorization grant/removal interface;
- moderation actions and moderation outcomes;
- Category and Attribute management;
- Compare behaviour;
- Decision Chat behaviour;
- Contact behaviour beyond its authentication gate;
- affiliate-handoff behaviour;
- Favorites;
- Messaging;
- account deletion and voluntary account deactivation;
- identity verification policy;
- multi-factor authentication;
- social login;
- single sign-on;
- organization membership;
- delegated Business access;
- multiple permission levels inside one Business;
- impersonation;
- age or legal-eligibility verification;
- any V2 or excluded-scope capability in `V1_SCOPE.md`;
- credential format, password policy, recovery channel, token, session, cookie, device, API, database, encryption, storage, frontend, backend, security implementation, or infrastructure.

Favorites and Messaging require an explicit V1 scope revision before Identity may define their authentication gates as launch requirements.

---

## 5. Core Concepts

- **Guest** — the current unauthenticated access context. A person may be a Guest whether or not they already possess a User Account.
- **User Account** — the persistent account created through registration.
- **Authenticated User** — a person currently authenticated through a User Account.
- **Business** — a profile owned and managed through a User Account. It is not a separate account or login identity.
- **Business context** — an authenticated User acting for a Business they own. The Business PRD owns Business behaviour and ownership rules.
- **Admin context** — an authenticated account acting with Admin authorization. PRD-0003 owns the authorization relationship and context gate; the Product Owner / Architecture Owner decides grant or removal; PRD-0006 owns Admin Panel behaviour.
- **Authentication gate** — a product rule that requires the actor to be authenticated before an owning capability may complete an action.
- **Authorization context** — the authorized context in which an authenticated person acts, such as User, owned Business, or Admin.
- **Logout** — ending the current authenticated context and returning to Guest-level access without deleting the User Account.
- **Registered email address** — the email address that uniquely identifies one User Account for V1 login and account recovery.
- **Email-control proof** — product-level evidence that the person controls the supplied or registered email address. Delivery provider and token mechanism are implementation concerns.
- **Registration** — the process that begins in Guest context and completes only after email-control proof; completed registration creates one Enabled User Account.
- **Login** — entering an authenticated User context through the registered email address and password.
- **Password recovery** — setting a new password after one-time proof of control through the registered email address.

- **User Account access status** — the authoritative account-level result `Enabled` or `Suspended`.
- **Enabled** — the account may authenticate and enter authorized User, Business, or Admin contexts.
- **Suspended** — the account may not authenticate or enter User, Business, or Admin contexts but may still use public Guest behaviour.
- **Admin authorization** — an authorization attached to an existing User Account that permits Admin-context entry only while the account is Enabled.


---

## 6. Business Rules

1. Public product behaviour does not require a User Account unless an authoritative authentication gate states otherwise.
2. Search, Browse, Filters, Offering Detail, Compare, Decision Chat, and eligible Affiliate Handoff are available in the Guest context.
3. Guest Affiliate Handoff may reach Completion without registration or login.
4. The platform must not require account creation before or after Guest Affiliate Handoff.
5. Direct Contact requires an authenticated User context.
6. Telephone number, email address, and external website or contact URL information used for Direct Contact are unavailable to Guests.
7. V1 registration requires an email address and password.
8. Registration completes only after control of the supplied email address is proven.
9. Completed registration creates exactly one User Account with access status `Enabled`.
10. V1 creates no separate Pending, Verified, or post-registration verification state.
11. One registered email address identifies one User Account.
12. Login uses the registered email address and password.
13. Successful login establishes an authenticated User context only when User Account access status is `Enabled`.
14. Logout ends the current authenticated context and returns the person to Guest-level access; it does not delete the User Account.
15. Password recovery may begin while the account holder is unauthenticated.
16. Password recovery requires one-time proof of control through the registered email address.
17. Successful password reset retains the same User Account and restores only the ability to attempt login.
18. Password recovery does not change Suspended to Enabled and grants no Business or Admin authorization.
19. A Business is a profile managed through a User Account and never a separate login identity.
20. One User may own multiple Businesses.
21. A person may act in a Business context only for a Business they are authorized to operate and only while the User Account is Enabled.
22. Business creation, management, and moderation behaviour are owned by `PRD-0005-business.md`.
23. Admin authorization attaches to an existing User Account and does not create a separate Admin identity.
24. The Product Owner / Architecture Owner is the sole authority for first-Admin establishment and Admin authorization grant or removal.
25. Admin authorization is applied through a controlled operational provisioning process outside the PRD layer.
26. An existing Admin may not grant, remove, delegate, transfer, or tier Admin authorization through V1 product behaviour.
27. Admin context is available only when the User Account is Enabled and Admin authorization is present.
28. Admin context inherits the public Guest and authenticated User baseline.
29. Admin authorization grants no automatic Business ownership or unrelated Business-management authority.
30. `PRD-0006-platform.md` owns Admin Panel behaviour and enforcement of approved Admin actions.
31. User Account access status values are exactly `Enabled` and `Suspended` in V1.
32. A Suspended User Account cannot enter authenticated User, Business, or Admin contexts.
33. A Suspended account may still use public Guest behaviour.
34. Suspension does not hide or restrict a Business or Offering and does not change Offering public eligibility.
35. Reinstatement changes `Suspended → Enabled` and restores eligibility to enter authorized contexts.
36. Suspension and reinstatement do not grant, remove, or modify Admin authorization.
37. An ordinary Admin may suspend or reinstate only a non-Admin-authorized User Account.
38. Only the Product Owner / Architecture Owner may suspend or reinstate an Admin-authorized User Account.
39. Identity defines authentication, access-status, and context gates only; each owning PRD defines the behaviour behind the gate.
40. Guest access does not create Favorites, Messaging, persistent Decision history, or forced registration.

## 7. User Behaviour

### Guest

A Guest may:

- Search and Browse eligible Offerings;
- apply Filters;
- view Offering Detail;
- Compare Offerings;
- use Decision Chat;
- initiate eligible Affiliate Handoff;
- reach Completion through eligible Affiliate Handoff;
- register;
- log in using an existing Enabled User Account;
- begin password recovery for an existing User Account.

A Guest may not:

- initiate Direct Contact;
- view telephone number, email address, or external contact URL information protected by the Direct Contact gate;
- act in a Business context;
- act in an Admin context.

Guest Decision Chat and Affiliate Handoff create no Favorites, Messaging, persistent personal Decision history, or forced account creation.

### Authenticated User

An authenticated User may:

- perform all public Guest actions;
- initiate Direct Contact;
- view approved Direct Contact information;
- create a Business under `PRD-0005-business.md`;
- act in the context of an owned or otherwise authorized Business;
- own multiple Businesses through the same User Account;
- log out;
- use password-reset behaviour when applicable.

Authenticated User behaviour is available only while User Account access status is Enabled.

### Business context

“Business” in a permissions matrix means an authenticated User acting in an authorized Business context.

The Business context:

- uses the same User Account;
- is not a separate account;
- inherits the authenticated User baseline;
- is available only while User Account access status is Enabled;
- permits only behaviour authorized for that Business;
- grants no authority over an unrelated Business;
- consumes Business and Offering behaviour from their owning PRDs.

### Admin context

An Admin context:

- uses an existing User Account;
- requires User Account access status Enabled;
- requires Admin authorization;
- inherits the public Guest and authenticated User baseline;
- allows Platform administration behaviour owned by `PRD-0006-platform.md`;
- grants no automatic Business ownership;
- becomes unavailable while the User Account is Suspended;
- does not itself grant, remove, or change Admin authorization.


---

## 8. Permissions Matrix

Legend:

- `✓` — the Identity gate permits the action;
- `✗` — the Identity gate does not permit the action;
- `Conditional` — permitted only when the applicable account, ownership, authorization, and target rules are satisfied;
- `Owner only` — reserved to Product Owner / Architecture Owner;
- `—` — not applicable in the current context.

| Action | Guest | Enabled User | Business Context | Admin Context |
|---|---:|---:|---:|---:|
| Search / Browse / Filter | ✓ | ✓ | ✓ | ✓ |
| View Offering Detail | ✓ | ✓ | ✓ | ✓ |
| Compare Offerings | ✓ | ✓ | ✓ | ✓ |
| Use Decision Chat | ✓ | ✓ | ✓ | ✓ |
| Use eligible Affiliate Handoff | ✓ | ✓ | ✓ | ✓ |
| Reach Completion through Affiliate Handoff | ✓ | ✓ | ✓ | ✓ |
| View protected Direct Contact information | ✗ | ✓ | ✓ | ✓ |
| Initiate Direct Contact | ✗ | ✓ | ✓ | ✓ |
| Register a new User Account | ✓ | — | — | — |
| Login with an existing Enabled User Account | ✓ | — | — | — |
| Logout | — | ✓ | ✓ | ✓ |
| Begin password recovery for an existing account | ✓ | ✓ | ✓ | ✓ |
| Create a Business | ✗ | ✓ | ✓ | ✓ |
| Act for an authorized Business | ✗ | Conditional | ✓ | Conditional |
| Act for a Business without authorization | ✗ | ✗ | ✗ | ✗ |
| Enter Admin context | ✗ | Conditional | Conditional | ✓ |
| Perform Platform administration | ✗ | ✗ | ✗ | ✓ |
| Suspend or reinstate a non-Admin-authorized account | ✗ | ✗ | ✗ | Conditional |
| Suspend or reinstate an Admin-authorized account | ✗ | ✗ | ✗ | Owner only |
| Grant or remove Admin authorization | ✗ | ✗ | ✗ | Owner only through controlled operational provisioning |

Notes:

- Public actions remain available even where a person possesses no account or their account is Suspended.
- Authenticated, Business, and Admin contexts require User Account access status Enabled.
- Admin context additionally requires Admin authorization.
- Business context additionally requires the normal ownership or authorization relationship.
- The matrix records Identity gates only. The owning PRD may impose additional target and product rules.
- Favorites and Messaging are omitted because they are outside Frozen V1 scope.
- Platform administration and enforcement are owned by `PRD-0006-platform.md`.


---

## 9. State Transitions

### 9.1 User Account access status

V1 User Account access statuses:

```text
Enabled
Suspended
```

Registration creates:

```text
User Account access status = Enabled
```

Approved moderation transitions:

```text
Enabled → Suspended
Suspended → Enabled
```

Consequences:

- Enabled permits authentication and authorized context entry.
- Suspended blocks authenticated User, Business, and Admin context entry.
- Suspended preserves public Guest behaviour.
- Suspension changes no Business or Offering state.
- Suspension changes no Admin authorization.
- Reinstatement restores context-entry eligibility but does not restore or modify separate Business or Offering moderation outcomes.

### 9.2 Access-context progression

```text
Guest
  ├─ Register → Enabled User Account + Authenticated User
  └─ Login with existing Enabled User Account → Authenticated User

Authenticated User
  ├─ Logout → Guest
  ├─ Authorized Business → Business Context
  └─ Admin authorization → Admin Context

Business Context
  └─ Leave Business Context → Authenticated User

Admin Context
  └─ Leave Admin Context → Authenticated User
```

A Suspended account cannot enter any authenticated branch.

### 9.3 Password recovery

Password recovery is not an access-status transition:

```text
Unauthenticated account holder
  → Begin password recovery
  → Complete approved verification
  → Set new password
  → May attempt Login
```

A successful password reset does not:

- change Suspended to Enabled;
- grant Business authorization;
- grant Admin authorization.

### 9.4 Admin authorization relationship

```text
Existing Enabled User Account
  → Product Owner / Architecture Owner decision
  → controlled operational provisioning
  → Admin authorization present
  → Admin context available
```

Admin authorization may coexist with:

```text
User Account access status = Suspended
```

In that case Admin authorization remains present, but Admin context is unavailable until Owner-authorized reinstatement returns the account to Enabled.


---

## 10. User Flows

### 10.1 Public exploration and Decision

1. A person arrives in the Guest context.
2. The Guest searches, browses, filters, views Offering Detail, and compares eligible Offerings.
3. The Guest may enter Decision Chat from one eligible Offering or an eligible Comparison Set.
4. The Guest may initiate eligible Affiliate Handoff.
5. The Guest may reach Completion through that handoff.
6. Registration is not required before or after the handoff.
7. Capability behaviour remains owned by the applicable PRD.

### 10.2 Encountering Direct Contact

1. A Guest reaches a Direct Contact action.
2. Identity identifies Direct Contact as login-required.
3. Protected telephone, email, and external contact URL information remains unavailable.
4. The person registers or logs in with an Enabled account.
5. After authentication, `PRD-0004-decision.md` may continue the Direct Contact behaviour.

### 10.3 Registration

1. A Guest chooses to register.
2. The Guest supplies:
   - an email address;
   - a password.
3. The person completes proof of control of the supplied email address.
4. Registration completes.
5. Exactly one User Account is created with access status Enabled.
6. The registered email address identifies that User Account for V1 login and recovery.
7. The person enters an authenticated User context.
8. No separate Pending or Verified state is created.

### 10.4 Login and logout

1. A person supplies the registered email address and password.
2. Identity locates the single corresponding User Account.
3. Login succeeds only when the credentials are accepted and access status is Enabled.
4. The person enters the authenticated User context.
5. The person may enter an authorized Business or Admin context.
6. Logout ends the current authenticated context and resumes Guest access.
7. The User Account continues to exist.

### 10.5 Password recovery

1. An unauthenticated person begins recovery using the registered email address.
2. The person completes one-time proof of control through that registered email address.
3. The person sets a new password.
4. The same User Account is retained.
5. The person may attempt login.
6. A Suspended account remains Suspended.
7. Business and Admin authorization remain unchanged.

### 10.6 Business context

1. An Enabled authenticated User owns or is authorized for a Business under `PRD-0005-business.md`.
2. The User enters that Business context through the same User Account.
3. No separate Business login is created.
4. The person may leave the Business context and continue as the authenticated User.

### 10.7 Admin provisioning and entry

1. An existing Enabled User Account is selected by the Product Owner / Architecture Owner.
2. Controlled operational provisioning attaches Admin authorization.
3. Identity permits Admin-context entry while the account remains Enabled.
4. `PRD-0006-platform.md` provides Admin Panel behaviour.
5. The account retains ordinary User behaviour outside Admin context.

### 10.8 Suspension and reinstatement

1. An approved authority applies Suspend User.
2. Identity changes `Enabled → Suspended`.
3. Authenticated User, Business, and Admin contexts become unavailable.
4. Public Guest behaviour remains available.
5. An approved authority applies Reinstate User.
6. Identity changes `Suspended → Enabled`.
7. Contexts become available again only where the separate Business or Admin authorization still exists.


---

## 11. Functional Requirements

### Public and authenticated gates

1. The platform shall provide a public Guest context.
2. Guest shall access Search, Browse, Filter, Offering Detail, Compare, Decision Chat, and eligible Affiliate Handoff without login.
3. Guest shall be able to reach Completion through eligible Affiliate Handoff without forced registration.
4. Direct Contact shall require an authenticated User context.
5. Telephone number, email address, and external contact URL information protected by Direct Contact shall be unavailable to Guests.

### Account and authentication

6. Registration shall require an email address and password.
7. Registration shall complete only after proof of control of the supplied email address.
8. Completed registration shall create exactly one Enabled User Account.
9. One registered email address shall identify one User Account.
10. V1 shall create no separate Pending or Verified User Account state.
11. Login shall use the registered email address and password.
12. Login shall establish an authenticated User context only for an Enabled User Account.
13. Logout shall end the authenticated context without deleting the User Account.
14. Password recovery shall be available while unauthenticated.
15. Password recovery shall require one-time proof of control through the registered email address.
16. Password reset shall retain the existing User Account.
17. Password reset shall not change Suspended to Enabled.
18. Password recovery shall not grant Business or Admin authorization.

### Business context

19. Business shall be represented as a profile managed through a User Account and never as a separate login identity.
20. One User Account may own multiple Businesses under `PRD-0005-business.md`.
21. Business-context entry shall require User Account status Enabled and the applicable Business authorization.
22. Admin authorization shall not grant automatic Business ownership or authority.

### Admin authorization and context

23. Admin authorization shall attach to an existing User Account.
24. Admin shall not be represented as a separate login identity.
25. Admin-context entry shall require User Account status Enabled and Admin authorization.
26. Admin context shall inherit the public Guest and authenticated User baseline.
27. Only the Product Owner / Architecture Owner may decide first-Admin establishment and Admin authorization grant or removal.
28. V1 shall provide no self-service, delegated, transferred, tiered, or Admin-managed Admin provisioning.

### User Account access status

29. V1 User Account access statuses shall be Enabled and Suspended.
30. Suspend User shall produce `Enabled → Suspended`.
31. Reinstate User shall produce `Suspended → Enabled`.
32. Suspended shall block authenticated User, Business, and Admin contexts.
33. Suspended shall preserve public Guest behaviour.
34. Suspension shall not change Business or Offering state or public eligibility.
35. Suspension and reinstatement shall not grant, remove, or modify Admin authorization.
36. Ordinary Admin shall not suspend or reinstate an Admin-authorized User Account.
37. Only the Product Owner / Architecture Owner may suspend or reinstate an Admin-authorized User Account.

### Scope discipline

38. Identity shall define gates and access consequences without redefining the owning PRD's behaviour.
39. Identity shall not authorize Favorites, Messaging, persistent personal Decision history, or forced registration as V1 behaviour.
40. The same Identity model shall apply across Mobility, Real Estate, and Technology.


---

## 12. Non-functional Requirements

These are qualitative product expectations, not technical requirements:

- **Low friction.** Public decision progress must not require premature registration.
- **Trust.** Direct Contact and protected contact information must not become available in an unauthenticated context.
- **Simplicity.** One User Account carries the person's authenticated, Business, and authorized Admin contexts.
- **Continuity.** Suspension blocks private contexts without removing public Guest access or silently changing Business, Offering, or Admin-authorization state.
- **Context clarity.** A person should understand whether they are acting as themselves, for an owned Business, or as Admin.
- **Ownership safety.** A Business context must never grant authority over another Business without authorization.
- **Recovery.** Losing the current password must not require creating a second User Account.
- **Scope discipline.** Identity must not silently introduce login-gated capabilities that are outside V1.
- **Implementation neutrality.** Identity behaviour must remain valid if credential, recovery, session, and identity-provider technology changes.

---

## 13. Acceptance Criteria

```gherkin
Scenario: Guest explores and uses Decision Chat without login
  Given a person is using the platform in the Guest context
  When they Search, Browse, Filter, view Offering Detail, Compare, or use Decision Chat
  Then the action does not require registration or login

Scenario: Guest completes eligible Affiliate Handoff
  Given a Guest has an eligible Affiliate Handoff path
  When the Guest initiates the handoff
  Then authentication is not required
  And Completion may be reached through PRD-0004
  And account creation is not required before or after the handoff

Scenario: Direct Contact requires authentication
  Given a Guest requests Direct Contact
  When the authentication gate is evaluated
  Then Direct Contact does not continue
  And protected telephone, email, and external contact URL information remains unavailable
  And the person must register or log in before continuing

Scenario: Registration requires email-control proof
  Given a Guest supplies an email address and password
  When control of the supplied email address has not been proven
  Then registration is not complete
  And no Enabled authenticated context is available

Scenario: Registration creates an Enabled account
  Given a Guest supplies an email address and password
  And proves control of the supplied email address
  When registration completes
  Then exactly one User Account exists
  And the registered email address identifies that account
  And User Account access status is Enabled
  And no separate Verified or Pending state exists
  And the person enters an authenticated User context

Scenario: Login uses registered email
  Given an Enabled User Account exists
  When the person supplies its registered email address and accepted password
  Then the authenticated User context becomes available

Scenario: Recovery uses one-time email control proof
  Given an existing User Account
  When the account holder proves control through the registered email address
  And sets a new password
  Then the same User Account is retained
  And no Business or Admin authorization is granted

Scenario: Suspended account cannot authenticate
  Given a User Account access status is Suspended
  When the account holder attempts login
  Then authenticated User context is unavailable
  And public Guest behaviour remains available

Scenario: Suspension blocks every private context
  Given an authenticated User, Business, or Admin context is active
  When the User Account changes from Enabled to Suspended
  Then authenticated User context becomes unavailable
  And Business context becomes unavailable
  And Admin context becomes unavailable
  And public Guest behaviour remains available

Scenario: Suspension does not change owned products
  Given a User Account owns a Business or Offering
  When the User Account is suspended
  Then Business Moderation Status remains unchanged
  And Offering lifecycle remains unchanged
  And Offering public eligibility is not changed by suspension alone

Scenario: Reinstatement restores context eligibility
  Given a User Account is Suspended
  When an approved authority applies Reinstate User
  Then User Account access status becomes Enabled
  And authorized contexts may become available again
  And separate Business and Offering moderation outcomes remain unchanged

Scenario: Admin authorization attaches to the User Account
  Given an existing Enabled User Account
  When the Product Owner or Architecture Owner authorizes controlled provisioning
  Then Admin authorization attaches to that User Account
  And no separate Admin login identity is created
  And the account retains ordinary User behaviour

Scenario: Admin context grants no Business ownership
  Given an Admin-authorized account has no relationship to a Business
  When the account enters Admin context
  Then Platform administration is available
  And that Business context is unavailable

Scenario: Ordinary Admin cannot suspend an Admin-authorized account
  Given a target User Account carries Admin authorization
  When an ordinary Admin attempts Suspend User or Reinstate User
  Then the action is rejected
  And access status and Admin authorization remain unchanged

Scenario: Owner suspends an Admin-authorized account
  Given a target User Account carries Admin authorization and is Enabled
  When the Product Owner or Architecture Owner applies suspension
  Then User Account access status becomes Suspended
  And Admin authorization remains present
  And Admin context becomes unavailable

Scenario: Password reset does not reinstate suspension
  Given a Suspended account holder completes password recovery
  When a new password is set
  Then the existing User Account is retained
  And User Account access status remains Suspended

Scenario: Business is not a separate login
  Given an Enabled authenticated User is authorized for a Business
  When they enter Business context
  Then the same User Account is used
  And no separate Business login identity is created

Scenario: Identity excludes non-V1 persistence
  Given a Guest uses Decision Chat or Affiliate Handoff
  When Identity consequences are evaluated
  Then no Favorites, Messaging, persistent personal Decision history, or forced registration is created
```

Registration, login, recovery, and verification product contracts are complete. Technical security and delivery implementation remain outside this PRD.


---

## 14. Related PRDs

- **`PRD-0001-offering.md` — Offering**
  - owns Offering behaviour and the relationship between an Offering and its owning Business;
  - consumes Identity gates for viewer and Business contexts.

- **`PRD-0002-discovery.md` — Discovery**
  - owns Search, Browse, Filters, Results, and public Discovery behaviour;
  - consumes the rule that Discovery does not require login.

- **`PRD-0004-decision.md` — Decision**
  - owns Compare, Decision Chat, Affiliate Handoff, Direct Contact, and Completion;
  - consumes the public Guest gates for Decision Chat and Affiliate Handoff;
  - consumes the authenticated-only Direct Contact gate;
  - consumes the authoritative Identity gates.

- **`PRD-0005-business.md` — Business**
  - owns Business creation, management, ownership behaviour, visibility, dashboard, moderation status, and Business Public Exposure Input;
  - consumes the rule that a Business is not a separate login identity.

- **`PRD-0006-platform.md` — Platform**
  - owns Admin Panel behaviour, action enforcement, moderation, and Platform operations;
  - consumes Identity-owned Admin authorization, access status, context entry, and target restrictions;
  - does not own Admin authorization grant/removal decisions.

Approval of this superseding candidate would make directly affected UX and User Story documents Review Needed under `REVIEW_PROCESS.md`. Review Needed is a trigger, not a lifecycle state.

---

## 15. Related ADRs and Owner Decisions

### Accepted ADR

- `ADR-0007 — Domain Scope of the Capability First Rule`
  - confirms that Identity own-domain behaviour follows Foundation → Identity PRD → Identity UX → Identity User Story unless directly assigned to an Offering Capability.

### Applied Owner Decisions

- D-01 / D-02 — public Guest Decision Chat and Affiliate Handoff;
- D-04 — authenticated-only Direct Contact and protected contact information;
- D-06 — Admin baseline inheritance;
- D-07 — Admin authorization provisioning and first-Admin bootstrap;
- D-15 / D-16 — User Account Enabled / Suspended outcomes;
- D-22 — suspension authority for Admin-authorized accounts.

No new ADR is required because this revision applies recorded product and ownership decisions within the existing Identity responsibility.

---

## 16. Accepted Deferrals

The V1 registration, login, recovery, verification, role, gate, and access-status product contracts are complete.

The following remain implementation concerns and do not block Freeze:

- password-complexity and credential-storage implementation;
- email delivery provider;
- one-time proof token format, lifetime, replay protection, and transport;
- session and cookie implementation;
- abuse prevention, throttling, and monitoring;
- identity-provider or framework selection.

No downstream UX or User Story may introduce a new User Account state, login identifier, recovery channel, role type, or authentication gate without a controlled PRD revision.

