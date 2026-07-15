# US-0004 — Decision User Stories

- **Status:** Draft
- **Version:** 0.1

## 1. Purpose

User stories for the Decision capability, derived only from `PRD-0004-decision.md` and the related UX specifications. Decision covers Compare, Favorites, Contact, Messaging, and the completion flow.

## 2. Related PRDs

- `PRD-0004-decision.md`

## 3. Related UX Specifications

- `UX-0004-compare.md`
- `UX-0003-offering-detail.md`
- `UX-0007-messaging.md`

## 4. User Stories

### US-0004.1 — Compare Offerings

**As a** person (Guest or User)
**I want** to compare up to four Offerings by their Attributes
**So that** I can weigh the differences and decide.

**Acceptance Criteria**
```gherkin
Scenario: Compare up to four Offerings by Attributes
  Given a person comparing Offerings
  When they add Offerings and view the comparison
  Then the comparison operates on their Attributes and does not exceed four Offerings
```

- **Priority:** Critical
- **Dependencies:** US-0001 (Offerings), US-0002 (Discovery)
- **Related PRDs:** `PRD-0004-decision.md`
- **Related UX:** `UX-0004-compare.md`, `UX-0003-offering-detail.md`
- **Business Rules:** Comparison operates on Offerings by Attributes; Compare is available without login; maximum four Offerings.
- **Out of Scope:** Saved comparisons; Sharing; recommendations; AI.

### US-0004.2 — Focus on differences in a comparison

**As a** person
**I want** to highlight differences and optionally show only differing Attributes
**So that** I can focus on what distinguishes the Offerings.

**Acceptance Criteria**
```gherkin
Scenario: Show only differing Attributes
  Given Offerings in Compare
  When the person chooses to show only differing Attributes
  Then only the Attributes that differ are displayed
```

- **Priority:** Medium
- **Dependencies:** US-0004.1
- **Related PRDs:** `PRD-0004-decision.md`
- **Related UX:** `UX-0004-compare.md`
- **Business Rules:** Differences are highlighted; only-differing-Attributes view is available.
- **Out of Scope:** —

### US-0004.3 — Save an Offering as a Favorite

**As a** User
**I want** to mark an Offering as a Favorite
**So that** I can hold it for consideration.

**Acceptance Criteria**
```gherkin
Scenario: Favorite requires login
  Given a Guest attempts to Favorite an Offering
  When the action requires login
  Then it does not succeed until they log in as a User
```

- **Priority:** High
- **Dependencies:** US-0003 (login)
- **Related PRDs:** `PRD-0004-decision.md`, `PRD-0003-identity.md`
- **Related UX:** `UX-0003-offering-detail.md`
- **Business Rules:** Favorites require login.
- **Out of Scope:** Decision Memory.

### US-0004.4 — Contact the Business behind an Offering

**As a** User
**I want** to contact the Business behind an Offering
**So that** I can progress my decision.

**Acceptance Criteria**
```gherkin
Scenario: Contact requires login
  Given a Guest attempts to Contact the Business behind an Offering
  When the action requires login
  Then it does not succeed until they log in as a User
```

- **Priority:** Critical
- **Dependencies:** US-0003 (login), US-0001 (Offering)
- **Related PRDs:** `PRD-0004-decision.md`, `PRD-0003-identity.md`
- **Related UX:** `UX-0003-offering-detail.md`, `UX-0007-messaging.md`
- **Business Rules:** Contact requires login.
- **Out of Scope:** —

### US-0004.5 — Message the Offering's owning Business

**As a** User
**I want** to send messages about an Offering to its owning Business
**So that** I can ask what I need to decide.

**Acceptance Criteria**
```gherkin
Scenario: Message reaches the owning Business
  Given a logged-in User viewing an Offering
  When they send a message about that Offering
  Then the message is directed to the single Business that owns the Offering
```

- **Priority:** Critical
- **Dependencies:** US-0004.4
- **Related PRDs:** `PRD-0004-decision.md`, `PRD-0001-offering.md`
- **Related UX:** `UX-0007-messaging.md`
- **Business Rules:** Sending messages requires login; a message about an Offering goes to its one owning Business.
- **Out of Scope:** Attachments; read receipts; typing indicators.

### US-0004.6 — Complete a decision

**As a** User
**I want** to complete my decision through the completion flow
**So that** I can finish and move on.

**Acceptance Criteria**
```gherkin
Scenario: Reach Completion
  Given a person who has evaluated and contacted the Business
  When they complete the decision through the completion flow
  Then the decision reaches Completion
```

- **Priority:** High
- **Dependencies:** US-0004.4
- **Related PRDs:** `PRD-0004-decision.md`
- **Related UX:** `UX-0004-compare.md`, `UX-0007-messaging.md`
- **Business Rules:** A decision reaches Completion through the completion flow (Affiliate / Contact → Completion).
- **Out of Scope:** Guest completion via affiliate handoff (TODO in `PRD-0004`).

### TODO — Business responses within Messaging

- TODO — A firm story for a Business replying within Messaging cannot be traced to a PRD, because `PRD-0004-decision.md` leaves "whether and how a Business responds within Messaging" as TODO. `UX-0007` implies a two-way exchange and must be reconciled into `PRD-0004`.
