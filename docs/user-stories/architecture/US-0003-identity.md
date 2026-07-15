# US-0003 — Identity User Stories

- **Status:** Draft
- **Version:** 0.1

## 1. Purpose

User stories for the Identity capability, derived only from `PRD-0003-identity.md` and the related UX specifications. Identity covers roles (Guest, User, Business, Admin), authentication, and login gating.

## 2. Related PRDs

- `PRD-0003-identity.md`

## 3. Related UX Specifications

- `UX-0008-authentication.md`
- `UX-0003-offering-detail.md`
- `UX-0007-messaging.md`

## 4. User Stories

### US-0003.1 — Register to become a User

**As a** Guest
**I want** to register
**So that** I can access login-gated abilities.

**Acceptance Criteria**
```gherkin
Scenario: Guest registers
  Given a Guest
  When they complete registration
  Then they become a Registered User with User-level abilities
```

- **Priority:** Critical
- **Dependencies:** —
- **Related PRDs:** `PRD-0003-identity.md`
- **Related UX:** `UX-0008-authentication.md`
- **Business Rules:** A Guest can register to become a User.
- **Out of Scope:** Registration fields and Email verification (TODO in `PRD-0003`); social login.

### US-0003.2 — Log in

**As a** User
**I want** to log in
**So that** I can use my account's abilities.

**Acceptance Criteria**
```gherkin
Scenario: User logs in
  Given a person with a User account
  When they log in
  Then they gain User abilities
```

- **Priority:** Critical
- **Dependencies:** US-0003.1
- **Related PRDs:** `PRD-0003-identity.md`
- **Related UX:** `UX-0008-authentication.md`
- **Business Rules:** A User can log in.
- **Out of Scope:** Social login.

### US-0003.3 — Log out

**As a** User
**I want** to log out
**So that** I can end my session.

**Acceptance Criteria**
```gherkin
Scenario: User logs out
  Given a logged-in User
  When they log out
  Then they return to Guest-level abilities and the account still exists
```

- **Priority:** High
- **Dependencies:** US-0003.2
- **Related PRDs:** `PRD-0003-identity.md`
- **Related UX:** `UX-0008-authentication.md`
- **Business Rules:** Logout returns the person to Guest-level abilities.
- **Out of Scope:** —

### US-0003.4 — Reset a forgotten password

**As a** User
**I want** to reset a forgotten password
**So that** I can regain access.

**Acceptance Criteria**
```gherkin
Scenario: User resets password
  Given a User with a forgotten password
  When they complete the recovery process
  Then they can log in with the new password
```

- **Priority:** High
- **Dependencies:** US-0003.1
- **Related PRDs:** `PRD-0003-identity.md`
- **Related UX:** `UX-0008-authentication.md`
- **Business Rules:** A User can reset a forgotten password.
- **Out of Scope:** The recovery/verification method (TODO in `PRD-0003`).

### US-0003.5 — Explore as a Guest before logging in

**As a** Guest
**I want** to explore the platform without logging in
**So that** I can experience it before authenticating.

**Acceptance Criteria**
```gherkin
Scenario: Guest explores without login
  Given a Guest
  When they search, browse, filter, compare, and view Offering details
  Then all of these succeed without login
```

- **Priority:** High
- **Dependencies:** US-0002, US-0004 (Compare)
- **Related PRDs:** `PRD-0003-identity.md`
- **Related UX:** `UX-0001-home.md`, `UX-0002-discovery.md`, `UX-0003-offering-detail.md`
- **Business Rules:** Guests may search, browse, filter, compare, and view Offering details.
- **Out of Scope:** Favorites, Contact, and Messaging (login-gated).

### US-0003.6 — Authenticate for a gated action and return to it

**As a** Guest
**I want** to be routed to Authentication when I attempt a login-gated action, and returned to that action after logging in
**So that** I can continue without losing my place.

**Acceptance Criteria**
```gherkin
Scenario: Return to the interrupted action
  Given a Guest attempts a login-gated action (phone reveal, Favorites, Contact, or Messaging)
  When they authenticate successfully
  Then they return to the original action to continue it
```

- **Priority:** Critical
- **Dependencies:** US-0003.1, US-0003.2
- **Related PRDs:** `PRD-0003-identity.md`
- **Related UX:** `UX-0003-offering-detail.md`, `UX-0007-messaging.md`, `UX-0008-authentication.md`
- **Business Rules:** Favorites and Contact require login; Guests cannot see Business phone numbers or send messages.
- **Out of Scope:** —

### US-0003.7 — Own multiple Businesses under one account

**As a** User
**I want** to create and own multiple Businesses under my single account
**So that** I can operate more than one Business without separate logins.

**Acceptance Criteria**
```gherkin
Scenario: One User owns multiple Businesses
  Given a User who already owns a Business
  When they create additional Businesses
  Then all are operated through the same single User account with no new identity created
```

- **Priority:** High
- **Dependencies:** US-0003.2, US-0005 (Business creation)
- **Related PRDs:** `PRD-0003-identity.md`, `PRD-0005-business.md`
- **Related UX:** `UX-0005-business-dashboard.md`
- **Business Rules:** A Business is not a separate account; one User may own multiple Businesses.
- **Out of Scope:** Admin provisioning (owned by `PRD-0006`).

### TODO — Email verification

- TODO — A firm story for Email verification cannot be traced to a PRD, because `PRD-0003-identity.md` marks registration identifiers/fields as TODO and does not define Email verification. It appears in `UX-0008` as the approved UX brief and must be reconciled into `PRD-0003` before a story is written.
