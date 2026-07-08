# US-0005 — Business User Stories

- **Status:** Draft
- **Version:** 0.1

## 1. Purpose

User stories for the Business capability, derived only from `PRD-0005-business.md` and the related UX specification. A Business is a profile managed by a User account that publishes and manages Offerings.

## 2. Related PRDs

- `PRD-0005-business.md`

## 3. Related UX Specifications

- `UX-0005-business-dashboard.md`

## 4. User Stories

### US-0005.1 — Create a Business immediately

**As a** User
**I want** to create a Business immediately, with no admin approval beforehand
**So that** I can start publishing Offerings right away.

**Acceptance Criteria**
```gherkin
Scenario: Create a Business without approval
  Given a User
  When they create a Business
  Then the Business is created immediately with no admin approval and is usable right away
```

- **Priority:** Critical
- **Dependencies:** US-0003 (login)
- **Related PRDs:** `PRD-0005-business.md`, `PRD-0003-identity.md`
- **Related UX:** `UX-0005-business-dashboard.md`
- **Business Rules:** Businesses can be created immediately; no admin approval before creation; a Business is not a separate account.
- **Out of Scope:** Billing; payments; subscription.

### US-0005.2 — Switch between owned Businesses

**As a** User who owns multiple Businesses
**I want** to switch between the Businesses I own
**So that** I can manage each one separately.

**Acceptance Criteria**
```gherkin
Scenario: Switch Business context
  Given a User who owns more than one Business
  When they switch Business in the Dashboard
  Then the Dashboard reflects the selected Business
```

- **Priority:** High
- **Dependencies:** US-0005.1, US-0003.7
- **Related PRDs:** `PRD-0005-business.md`
- **Related UX:** `UX-0005-business-dashboard.md`
- **Business Rules:** One User may own multiple Businesses, all through the same account.
- **Out of Scope:** —

### US-0005.3 — Manage a Business Profile and Information

**As a** Business
**I want** to manage my Business Profile and Business Information
**So that** my Business is represented accurately.

**Acceptance Criteria**
```gherkin
Scenario: Manage the owned Business Profile
  Given a Business
  When it edits its Business Profile and Information
  Then the changes apply to that Business
```

- **Priority:** High
- **Dependencies:** US-0005.1
- **Related PRDs:** `PRD-0005-business.md`
- **Related UX:** `UX-0005-business-dashboard.md`
- **Business Rules:** A Business manages only its own profile.
- **Out of Scope:** The specific Business Information fields (TODO in `PRD-0005`).

### US-0005.4 — Manage owned Offerings from the Dashboard

**As a** Business
**I want** to create, edit, delete, and publish the Offerings I own from my Dashboard
**So that** I can control what I offer.

**Acceptance Criteria**
```gherkin
Scenario: Manage only owned Offerings
  Given a Business
  When it manages Offerings from its Dashboard
  Then it can create, edit, delete, and publish only the Offerings it owns
```

- **Priority:** Critical
- **Dependencies:** US-0005.1, US-0001 (Offering)
- **Related PRDs:** `PRD-0005-business.md`, `PRD-0001-offering.md`
- **Related UX:** `UX-0005-business-dashboard.md`
- **Business Rules:** A Business manages only the Offerings it owns; Publish moves Draft → Published.
- **Out of Scope:** Hide/Archive (states TODO in `PRD-0001`).

### US-0005.5 — See Draft Offerings

**As a** Business
**I want** my Draft Offerings to be visible in the Dashboard
**So that** I can find and finish preparing them.

**Acceptance Criteria**
```gherkin
Scenario: Draft Offerings are visible
  Given a Business with Draft Offerings
  When it opens Offering management
  Then Draft Offerings are visible
```

- **Priority:** High
- **Dependencies:** US-0005.4
- **Related PRDs:** `PRD-0005-business.md`, `PRD-0001-offering.md`
- **Related UX:** `UX-0005-business-dashboard.md`
- **Business Rules:** Draft Offerings are visible to the owning Business.
- **Out of Scope:** —

### US-0005.6 — See limited Dashboard metrics

**As a** Business
**I want** to see a limited set of Dashboard metrics
**So that** I can understand my Business at a glance without advanced analytics.

**Acceptance Criteria**
```gherkin
Scenario: Metrics are limited
  Given a Business Dashboard
  When the metrics are shown
  Then they are limited to Total Offerings, Published Offerings, Draft Offerings, Message count, and Favorites count (if available)
```

- **Priority:** Medium
- **Dependencies:** US-0005.1
- **Related PRDs:** `PRD-0005-business.md`
- **Related UX:** `UX-0005-business-dashboard.md`
- **Business Rules:** Dashboard metrics are limited to the approved set.
- **Out of Scope:** Advanced analytics; analytics implementation (owned elsewhere — TODO).
