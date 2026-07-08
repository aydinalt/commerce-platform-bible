# PRD-0003 — Identity

- **PRD ID:** PRD-0003
- **Title:** Identity
- **Status:** Approved
- **Version:** 1.0
- **Scope level:** Product behaviour (non-technical)

> This document describes product behaviour only. It does not describe APIs, database tables, frameworks, or implementation.

---

## 1. Purpose

Define the Identity capability of the platform: who can use the platform, how they authenticate, and what each role is permitted to do. Identity establishes the roles (Guest, User, Business, Admin) and the rules that govern access to platform behaviour, so that every other capability can rely on a consistent understanding of who is acting.

## 2. Business Value

Identity lets people begin using the platform immediately as Guests and complete decisions faster, while giving Users and Businesses the access they need without unnecessary friction. Consistent with the Foundation, it keeps the experience simple, respects the user's time, and treats Businesses as partners by letting them participate without heavyweight onboarding barriers.

## 3. Scope

This capability covers:

- The role model: Guest, User, Business, and Admin.
- Authentication behaviour: Register, Login, Logout, Password Reset.
- Authorization: what each role may and may not do.
- The relationship between Users and Businesses (a Business is not a separate account; a User may own multiple Businesses).
- The rules governing which actions are available without login and which require login.

## 4. Out of Scope

- Any technical implementation (APIs, data models, frameworks, storage).
- The behaviour of capabilities that merely *depend on* Identity (for example Discovery, Offering management, Compare, Decision Assistance capability, Contact) except where an Identity rule directly gates them.
- Admin moderation workflows beyond stating that moderation happens after a Business is created; moderation behaviour is defined by its owning capability/PRD (see Section 15).
- Admin provisioning and Admin's broader platform-operation abilities, which are owned by PRD-0006 Platform (see Sections 7 and 9).
- Any V2 or excluded-scope capability as defined in `V1_SCOPE.md`.

## 5. User Roles

- **Guest** — an unauthenticated visitor. A Guest may search, browse, filter, compare, and view Offering details.
- **User** — an authenticated person with an account. A User has all Guest abilities plus the login-gated abilities described in Section 7.
- **Business** — a User acting in the context of a Business profile they own. Per the Foundation, a Business is **not** a separate account; the Business role is exercised by a User who owns one or more Business profiles. One User may own multiple Businesses.
- **Admin** — an operator responsible for moderation and platform operation. Admin acts after Businesses and content exist (moderation happens afterwards). Admin provisioning and platform-operation abilities are defined in PRD-0006 Platform.

> **Review Note:** The Foundation states that a Business is a profile managed by a User account, not a separate login identity. This document therefore treats "Business" as a role/context exercised by a User, not as a separate account. This is consistent with the approved decisions ("Business is NOT a separate account"), but because the request lists "Business" as a distinct User Role, a decision-maker may wish to confirm this framing of the role name. No decision has been changed.

## 6. Authentication

### Register

A Guest can register to become a User. TODO — the specific identifiers/fields required to register (for example what a User provides to create an account) are not defined in the approved decisions and must be specified by a decision-maker.

### Login

A User can log in to access User (and, where applicable, Business and Admin) abilities.

### Logout

A User can log out, ending their authenticated session and returning to Guest-level abilities.

### Password Reset

A User can reset a forgotten password and set a new one through a recovery process. TODO — the recovery/verification method is not defined in the approved decisions and must be specified by a decision-maker. (Kept implementation-neutral: no delivery mechanism is assumed here.)

## 7. Authorization

**Guest may:**

- Search, browse, filter, compare, and view Offering details.

**Guest may not:**

- See Business phone numbers.
- Send messages.
- Use Favorites (Favorites require login).
- Contact (Contact requires login).

**User may:**

- Do everything a Guest may do.
- Use Favorites.
- Contact a Business.
- Send messages, and see Business phone numbers.
- Own and create Businesses (see Business Rules).

> The "User may" abilities above are inferred from the approved Guest restrictions ("Guest users cannot see business phone numbers", "Guest users cannot send messages", "Favorites require login", "Contact requires login"), which frame these limits as specific to Guests and gated behind login. See Open Questions if any of these inferences require confirmation.

**Business (a User acting for an owned Business) may:**

- Manage the Business profile(s) they own and the Offerings under them, consistent with the Offering management and Business profile scope approved in `V1_SCOPE.md`.
- Create Businesses immediately, with no admin approval required beforehand.

**Admin may:**

- Perform moderation after Businesses and content exist. Admin's abilities beyond moderation, and how Admin accounts are provisioned, are defined in PRD-0006 Platform, not in Identity.

## 8. Permissions Matrix

Legend: ✓ = allowed, ✗ = not allowed, TODO = owned by PRD-0006 Platform (not defined in Identity's approved decisions).

| Action | Guest | User | Business | Admin |
|---|---|---|---|---|
| Search | ✓ | ✓ | ✓ | TODO |
| Browse | ✓ | ✓ | ✓ | TODO |
| Filter | ✓ | ✓ | ✓ | TODO |
| Compare | ✓ | ✓ | ✓ | TODO |
| View Offering details | ✓ | ✓ | ✓ | TODO |
| View Business phone number | ✗ | ✓ | ✓ | TODO |
| Send messages | ✗ | ✓ | ✓ | TODO |
| Use Favorites | ✗ | ✓ | ✓ | TODO |
| Contact a Business | ✗ | ✓ | ✓ | TODO |
| Register (Guest → User) | ✓ | — | — | TODO |
| Login | ✓ | — | — | TODO |
| Logout | ✗ | ✓ | ✓ | TODO |
| Password reset | ✗ | ✓ | ✓ | TODO |
| Create a Business | ✗ | ✓ | ✓ | TODO |
| Manage owned Business profile & Offerings | ✗ | ✗ | ✓ | TODO |
| Create Offering | ✗ | ✗ | ✓ | TODO |
| Edit Offering | ✗ | ✗ | ✓ | TODO |
| Delete Offering | ✗ | ✗ | ✓ | TODO |
| View Dashboard | ✗ | ✗ | ✓ | TODO |
| Create Favorite | ✗ | ✓ | ✓ | TODO |
| Moderate Businesses / content | ✗ | ✗ | ✗ | ✓ |

Notes:

- The **Business** column represents a User acting in the context of an owned Business profile; it therefore inherits all User permissions and adds management of the owned Business profile(s) and their Offerings. This is consistent with the Business behaviour defined in `PRD-0001-offering.md` (create, edit, delete, and publish owned Offerings; view dashboard).
- "—" marks actions that do not apply to an already-authenticated role (for example a logged-in User does not "Register" or "Login" again).
- "Manage owned Business profile & Offerings" is ✗ for a plain User because that action only exists once the User owns a Business, at which point the User is acting in the Business role.
- The Offering actions (Create/Edit/Delete Offering) and View Dashboard are ✓ only in the owned-Business context, consistent with the row above; they are ✗ for a plain User and ✗ for a Guest.
- "Create Favorite" follows the existing Favorites rule (Favorites require login): ✗ for a Guest, ✓ for a User, and ✓ for a Business through inherited User permissions.
- Every **Admin** cell other than moderation is **TODO** here because Admin's broader abilities and provisioning are owned by PRD-0006 Platform, not by Identity's approved decisions.

## 9. State Transitions

The identity lifecycle below includes only transitions supported by approved decisions.

```
Guest
  │  Register (Guest becomes a User)
  ▼
Registered User
  │  Create a Business (immediate, no admin approval required)
  ▼
Business Owner  ── may own multiple Businesses (one User → many Businesses)
```

- **Guest → Registered User** — supported by the approved decision that a Guest can register to become a User.
- **Registered User → Business Owner** — supported by the approved decisions that Businesses can be created immediately, with no admin approval required before creation. A Business Owner remains the same User identity; ownership is a capability of the User, not a separate account.
- **Business Owner → Business Owner (multiple)** — supported by "one User may own multiple Businesses." Creating additional Businesses does not create additional identities.

Session state (authenticated vs. unauthenticated) is layered on top of the Registered User identity via Login and Logout; logging out returns the person to Guest-level abilities without removing the underlying User identity.

> **Admin lifecycle:** The transition into the Admin role — how an Admin comes to exist and is provisioned — is not part of the Identity lifecycle and is owned by PRD-0006 Platform. It is intentionally not shown above and is not an open Identity question.

## 10. Business Rules

The following approved rules govern Identity:

1. Guest users may search, browse, filter, compare, and view Offering details.
2. Guest users cannot see Business phone numbers.
3. Guest users cannot send messages.
4. Favorites require login.
5. Contact requires login.
6. A Business is **not** a separate account.
7. One User may own multiple Businesses.
8. Businesses can be created immediately.
9. No admin approval is required before creating a Business.
10. Admin moderation happens afterwards.

## 11. User Flows

Described at the behaviour level only.

### 11.1 Guest exploration

1. A person arrives as a Guest without logging in.
2. The Guest searches for Offerings, browses results, and applies filters.
3. The Guest opens an Offering to view its details.
4. The Guest compares multiple Offerings.
5. Throughout, the Guest cannot see Business phone numbers, cannot send messages, cannot use Favorites, and cannot Contact a Business.

### 11.2 Encountering a login-gated action

1. As a Guest, the person moves through Discovery, opens an Offering's details, and compares Offerings.
2. The Guest attempts a login-gated action — Contacting a Business (or using Favorites).
3. Because Contact and Favorites require login, the action does not complete for a Guest.
4. The Guest logs in or registers to proceed.
5. Once authenticated as a User, they can Message / Contact the Business and complete their decision.
6. This connects back to the V1 core flow:
   `Guest → Discovery → Offering Detail → Compare → Contact → Login/Register → Message/Contact → Completion`
7. TODO — the exact experience for prompting or redirecting the Guest to log in is implementation-neutral and not specified here.

### 11.3 Registration (Guest → User)

1. A Guest chooses to register.
2. The Guest provides the required registration information. TODO — the specific identifiers/fields are undefined (see Section 6).
3. On successful registration, the Guest becomes a Registered User with User-level abilities.

### 11.4 Login

1. A person with an account provides their credentials to log in.
2. On success, they gain User abilities (and Business or Admin abilities where applicable).

### 11.5 Logout

1. A logged-in User logs out.
2. Their authenticated session ends, and they return to Guest-level abilities.
3. The underlying User account continues to exist.

### 11.6 Password reset

1. A User initiates a password reset for a forgotten password.
2. The User completes a recovery process and sets a new password. TODO — the recovery/verification method is undefined (see Section 6).
3. On success, the User can log in with the new password.

### 11.7 Business creation

1. A Registered User chooses to create a Business.
2. The Business is created immediately; no admin approval is required beforehand.
3. The Business becomes usable right away, and the User is now acting as a Business Owner.
4. Admin moderation may occur afterwards.

### 11.8 Owning multiple Businesses

1. A Registered User who already owns a Business creates one or more additional Businesses.
2. Each Business is created immediately without prior admin approval.
3. All Businesses are owned and operated through the same single User account; no additional identities are created.

### 11.9 Admin moderation

1. A Business (and its content) exists, having been created without prior approval.
2. Admin performs moderation on the Business or its content afterwards.
3. TODO — the specific moderation actions and their outcomes are defined by the moderation capability/PRD (see Section 15), not here.

## 12. Functional Requirements

1. A Guest can search for Offerings without logging in.
2. A Guest can browse Offerings without logging in.
3. A Guest can filter Offerings without logging in.
4. A Guest can compare Offerings without logging in.
5. A Guest can view Offering details without logging in.
6. A Guest cannot see Business phone numbers.
7. A Guest cannot send messages.
8. Using Favorites requires the actor to be logged in as a User.
9. Contacting a Business requires the actor to be logged in as a User.
10. Once logged in, a User can use Favorites, Contact a Business, send messages, and see Business phone numbers.
11. A Guest can register to become a User.
12. A User can log in.
13. A User can log out, after which they return to Guest-level abilities.
14. A User can reset a forgotten password.
15. A User can create a Business immediately, without any prior admin approval, and the Business is usable immediately.
16. A User can own multiple Businesses, all operated through the same single User account.
17. A Business is never a separate account; every Business action is performed through the owning User account.
18. Admin can moderate Businesses and their content after they exist.

## 13. Non-functional Requirements

Stated as qualitative expectations derived only from Foundation principles. These are not technical requirements.

- **Respect the user's time.** Identity must not add unnecessary friction: Guests can search, browse, filter, compare, and view Offering details without any login step, and Businesses can be created immediately without a pre-approval wait.
- **Simplicity over complexity.** The identity model stays simple: a Business is not a separate account, and a single User account carries all of a person's Businesses rather than fragmenting into multiple logins.
- **Trust over growth.** Access gating exists to protect trust rather than to maximise sign-ups: Contact and Favorites require login, and Business phone numbers are hidden from Guests.
- **Businesses are partners.** Businesses can participate immediately, reflecting a partnership posture rather than a gatekeeping one, with moderation applied afterwards.

## 14. Acceptance Criteria

Written in Gherkin (Given / When / Then).

```gherkin
Scenario: Guest explores without logging in
  Given a person is using the platform as a Guest
  When they search, browse, filter, compare, and open an Offering's details
  Then all of these actions succeed without requiring login

Scenario: Guest cannot see a Business phone number
  Given a person is using the platform as a Guest
  When they view an Offering that has an associated Business phone number
  Then the phone number is not shown to them

Scenario: Guest cannot send messages
  Given a person is using the platform as a Guest
  When they attempt to send a message
  Then the action does not succeed

Scenario: Favorites require login
  Given a person is using the platform as a Guest
  When they attempt to use Favorites
  Then the action does not succeed until they log in as a User

Scenario: Contact requires login
  Given a person is using the platform as a Guest
  When they attempt to Contact a Business
  Then the action does not succeed until they log in as a User

Scenario: Guest registers to become a User
  Given a person is using the platform as a Guest
  When they complete registration
  Then they become a Registered User with User-level abilities

Scenario: User logs in and out
  Given a person has a User account
  When they log in and later log out
  Then logging in grants User abilities and logging out returns them to Guest-level abilities

Scenario: User resets a forgotten password
  Given a person has a User account with a forgotten password
  When they complete the password reset recovery process
  Then they can log in with the new password

Scenario: User creates a Business without approval
  Given a person is a Registered User
  When they create a Business
  Then the Business is created immediately with no admin approval step and is usable right away

Scenario: One User owns multiple Businesses
  Given a Registered User who already owns a Business
  When they create additional Businesses
  Then all Businesses are owned and operated through the same single User account with no new identity created

Scenario: A Business is never a separate account
  Given the platform's identity model
  When any Business action is performed
  Then it is performed through the owning User account and never through a separate Business login

Scenario: Admin moderates after creation
  Given a Business and its content already exist
  When an Admin performs moderation
  Then moderation is applied after creation rather than as a pre-creation approval
```

TODO — Additional acceptance criteria depend on the Section 6 registration fields and the password-reset method once those are specified.

## 15. Related PRDs

- **PRD-0001 — Offering** — defines the Offering that roles act upon; Business Offering permissions here mirror its Business behaviour.
- **PRD-0002 — Discovery** — defines the Discovery actions (Search, Browse, Filter) that Guests and Users perform.
- **PRD-0004 — Decision** — defines downstream core-flow steps (for example Compare and the path to Completion) that follow login-gated actions.
- **PRD-0005 — Business** — defines Business profile and Offering management referenced in Sections 7 and 8.
- **PRD-0006 — Platform** — owns Admin provisioning, Admin's platform-operation abilities, and the Admin lifecycle referenced in Sections 7, 8, and 9.

## 16. Related ADRs

No Architecture Decision Records are linked from this product document. ADR references belong to the Architecture workstream and will be recorded there.

## 17. Open Questions (TODO only)

- TODO — What identifiers/fields are required for a Guest to register as a User? (Section 6)
- TODO — What is the password-reset recovery/verification method? (Section 6)
- TODO — Confirm that logged-in Users may see Business phone numbers and send messages, as inferred from the Guest-specific restrictions. (Section 7)
