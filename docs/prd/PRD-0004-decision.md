# PRD-0004 — Decision

- **PRD ID:** PRD-0004
- **Title:** Decision
- **Status:** Draft
- **Version:** 0.3
- **Scope level:** Product behaviour (non-technical)

**Revision Note (0.2):** Decision Chat is now owned by the Decision capability and integrated into this PRD as an assistive capability, per accepted architecture. The prior exclusion of the Decision Assistant / assistive AI has been removed. Decision Chat is assistive only — it helps a person reach a decision and never decides for them or acts on their behalf — consistent with the Frozen Foundation (`V1_SCOPE.md`).

**Revision Note (0.3):** Per Product Owner clarification, Decision Chat login gating is intentionally undecided. This revision neither asserts nor denies Guest access to Decision Chat; every Guest permission regarding Decision Chat is recorded as a TODO pending a Product Owner decision.

> This document describes product behaviour only. It describes Decision Chat only as assistive product behaviour; it does not describe APIs, databases, frameworks, AI implementation, ranking algorithms, recommendation engines, storage, security, or frontend implementation.

---

## 1. Purpose

Define the Decision capability of the platform. Decision helps people evaluate Offerings and complete decisions with confidence. It covers comparing Offerings, saving them as Favorites, using assistive Decision Chat to help reach a decision, contacting and messaging the Business behind an Offering, and completing the decision.

Decision operates on Offerings (see `PRD-0001-offering.md`) and follows the roles and gating defined in `PRD-0003-identity.md`.

## 2. Business Value

Decision exists to help people complete decisions faster and with confidence. Comparison lets a person weigh Offerings side by side; Favorites let them hold options for consideration; Decision Chat offers assistive help toward reaching a decision; and Contact and Messaging let them reach the Business behind an Offering, so the completion flow lets them finish and move on. Consistent with the Foundation, the platform's purpose is fulfilled when the decision is completed and the person leaves the platform, rather than staying longer than their decision requires.

## 3. Scope

V1 Decision includes only:

- Compare
- Favorites
- Decision Chat (assistive)
- Contact
- Messaging
- Decision completion flow

All of the above operate on Offerings, and their gating follows `PRD-0003-identity.md`.

## 4. Out of Scope

Decision does not include:

- AI recommendations
- Decision Memory
- Reviews
- Ratings
- Price history
- Recommendation engine
- Saved comparisons
- Sharing
- Notifications
- Any V2 or excluded-scope capability as defined in `V1_SCOPE.md`.

Decision describes Decision Chat only as assistive product behaviour; it does not describe AI implementation or any other technical implementation.

> **Review Note (affiliate handoff):** `V1_SCOPE.md` includes "Affiliate links" and defines completion as "Affiliate / Contact → Completion." This document treats the affiliate/contact handoff as the mechanism of the completion flow, but does not define affiliate-link configuration. TODO — confirm which PRD owns affiliate-link behaviour (possibly PRD-0006 Platform).

## 5. Core Concepts

These concepts use Foundation terminology and are referenced, not redefined.

- **Offering** — the universal object of the platform; every discoverable item is an Offering (see `PRD-0001-offering.md`). Decision acts on Offerings.
- **Compare** — evaluating two or more Offerings side by side. Per `PRD-0001-offering.md`, comparison operates on Offerings by Attributes. Compare is available without login (per `PRD-0003-identity.md`).
- **Favorites** — a logged-in User marking Offerings to hold for consideration. Favorites require login.
- **Decision Chat** — assistive help that supports a person in reaching a decision within the decision flow. Per `V1_SCOPE.md`, Decision Chat is assistive only: it helps the person decide and does not act on their behalf or make the decision for them.
- **Contact** — a logged-in User reaching the Business behind an Offering. Contact requires login.
- **Messaging** — sending messages between a User and a Business about an Offering. Sending messages requires login.
- **Completion** — the terminal step of the core flow, where the decision is completed and the person leaves the platform.

## 6. Business Rules

Only approved behaviour is included.

1. Comparison operates on Offerings by Attributes.
2. Compare is available without login.
3. Favorites require login.
4. Contact requires login.
5. Sending messages requires login; Guests cannot send messages.
6. A Contact or message about an Offering is directed to that Offering's owning Business (every Offering belongs to exactly one Business, per `PRD-0001-offering.md`).
7. A decision reaches Completion through the completion flow (Affiliate / Contact → Completion, per `V1_SCOPE.md`).
8. Decision Chat is assistive only: it helps a person reach a decision and never makes the decision for them or acts on their behalf.
9. Within the decision flow, Decision Chat follows Compare and precedes the Affiliate / Contact handoff (per the core flow in `V1_SCOPE.md`).

## 7. User Behaviour

Permissions are referenced from approved decisions (`V1_SCOPE.md`, `PRD-0003-identity.md`); none are invented.

- **Guest** — may Compare Offerings and view Offering details. A Guest cannot use Favorites, cannot Contact a Business, and cannot send messages. TODO — whether a Guest may use Decision Chat is intentionally undecided; Decision Chat login gating is not approved (see Open Questions).
- **User** — may do everything a Guest can, and may additionally use Favorites, Contact the Business behind an Offering, send messages, and complete a decision.
- **Business** — a User acting in the context of an owned Business has the same Decision abilities as any User. In Decision, a Business is also the party a User Contacts or messages about that Business's Offerings. TODO — whether and how a Business responds within Messaging is not defined by approved decisions.
- **Admin** — moderates Decision-related content after it exists (moderation happens afterwards). Admin's abilities beyond moderation are owned by PRD-0006 Platform, not by Decision.

Decision Chat login gating is intentionally undecided. Whether a Guest may use Decision Chat is a TODO pending a Product Owner decision; this document neither asserts nor denies Guest access. See Open Questions.

## 8. Permissions Matrix

Legend: ✓ = allowed, ✗ = not allowed, TODO = owned by PRD-0006 Platform (not defined in the approved decisions for this document).

| Action | Guest | User | Business | Admin |
|---|---|---|---|---|
| Compare | ✓ | ✓ | ✓ | TODO |
| Use Decision Chat | TODO | ✓ | ✓ | TODO |
| Use Favorites | ✗ | ✓ | ✓ | TODO |
| Create Favorite | ✗ | ✓ | ✓ | TODO |
| Contact a Business | ✗ | ✓ | ✓ | TODO |
| Send message | ✗ | ✓ | ✓ | TODO |
| Complete a decision (reach Completion) | TODO | ✓ | ✓ | TODO |

Notes:

- The **Business** column represents a User acting in the context of an owned Business profile; it inherits all User permissions. This is consistent with `PRD-0003-identity.md`.
- Compare, Favorites, Contact, and Send message match the corresponding rows in the `PRD-0003-identity.md` permissions matrix.
- **Use Decision Chat** — Decision Chat login gating is intentionally undecided. The Guest cell is **TODO** pending a Product Owner decision on whether a Guest may use Decision Chat; here this TODO denotes an undecided gating decision, not PRD-0006 ownership (see Open Questions).
- Businesses are the recipients of Contact and Messaging about their own Offerings; the recipient side is described in Section 7 and is not a separate permission here.
- **Complete a decision** is ✓ for a User because completion follows a login-gated Contact. For a Guest it is **TODO**: whether a Guest can reach Completion depends on the handoff path (for example an affiliate-link handoff versus a login-gated Contact), which is not defined by approved decisions (see the affiliate Review Note in Section 4).
- Every **Admin** cell marked TODO is owned by PRD-0006 Platform.

## 9. State Transitions

Decision progresses through the approved core-flow steps rather than a formal object lifecycle. Only approved steps are shown.

```
Evaluate (Compare, optionally Favorites)
  ▼
Decision Chat (assistive)
  ▼
Contact / Message the Business   (login-gated)
  ▼
Completion
```

- **Evaluate → Decision Chat** — after Comparing Offerings (and optionally using Favorites once logged in), a person may use assistive Decision Chat to help reach a decision. Decision Chat is assistive only.
- **Decision Chat → Contact/Message** — having reached a decision, the person, as a logged-in User, Contacts or messages the Business behind an Offering.
- **Contact/Message → Completion** — the decision reaches Completion through the completion flow (Affiliate / Contact → Completion).

TODO — No formal decision-state object model is defined by approved decisions. The steps above are core-flow steps, not a defined state machine; if a formal Decision state model is required, it must be specified by a decision-maker.

## 10. User Flows

Complete product flows using only approved, in-scope behaviour.

### 10.1 Compare flow

1. A person arrives at Offerings from Discovery (see `PRD-0002-discovery.md`).
2. The person opens Offering details and selects Offerings to Compare.
3. The Offerings are compared side by side by their Attributes.
4. The person uses the comparison to narrow toward a decision.
5. Compare is available without login.

### 10.2 Favorites flow

1. A logged-in User marks one or more Offerings as Favorites to hold for consideration.
2. The User returns to their Favorites to continue evaluating.
3. Favorites require login; a Guest attempting to use Favorites must log in first (per `PRD-0003-identity.md`).

### 10.3 Decision Chat flow

1. Within the decision flow, after evaluating Offerings, a person uses Decision Chat for assistive help in reaching a decision.
2. Decision Chat supports the person's own evaluation; it does not make the decision or act on the person's behalf.
3. The person remains in control of the decision; Decision Chat is assistive only.

### 10.4 Contact and Messaging flow

1. A logged-in User chooses to Contact the Business behind an Offering.
2. The User sends a message about that Offering; it is directed to the Offering's owning Business.
3. Contact and Messaging require login; a Guest attempting them must log in first.
4. TODO — whether and how the Business responds within Messaging is not defined by approved decisions.

### 10.5 Completion flow

1. After evaluating and contacting, the person completes the decision through the completion flow (Affiliate / Contact → Completion, per `V1_SCOPE.md`).
2. The decision reaches Completion.
3. Consistent with the Foundation, the person leaves the platform once the decision is completed.

### 10.6 End-to-end decision flow

```
Discovery
  ↓  open Offering
Offering Detail
  ↓
Compare
  ↓  (optional) Favorite
Favorites
  ↓
Decision Chat (assistive)
  ↓  Login/Register if not already a User
Contact / Message the Business
  ↓
Completion
```

Upstream Discovery is defined in `PRD-0002-discovery.md`; login gating is defined in `PRD-0003-identity.md`.

## 11. Functional Requirements

Product behaviour only.

1. A person can Compare two or more Offerings by their Attributes.
2. Compare is available to a person without logging in.
3. A logged-in User can mark an Offering as a Favorite.
4. A logged-in User can view and return to their Favorites.
5. Using Favorites requires the actor to be logged in as a User.
6. A logged-in User can Contact the Business behind an Offering.
7. A logged-in User can send messages about an Offering to that Offering's owning Business.
8. Contact and Messaging require the actor to be logged in as a User.
9. A Contact or message about an Offering is directed to that Offering's single owning Business.
10. A person can complete a decision through the completion flow, reaching Completion.
11. A person can use Decision Chat as an assistive aid to help reach a decision.
12. Decision Chat is assistive only; it supports the person and never decides for them or acts on their behalf.
13. Admin can moderate Decision-related content after it exists.

## 12. Non-functional Requirements

Stated as qualitative expectations derived only from Foundation principles. These are not technical metrics.

- **Respects the user's time.** Decision helps people evaluate and finish quickly, without friction.
- **Helps complete decisions faster and with confidence.** Compare, Favorites, Decision Chat, Contact, and Messaging all serve reaching a completed decision.
- **Assistive, not autonomous.** Decision Chat helps the person decide and never decides for them or acts on their behalf, consistent with the Foundation.
- **Users leave after completing.** Completion is the goal; the platform does not try to keep people longer than their decision requires.
- **Trust over growth.** Login gating on Favorites, Contact, and Messaging protects trust rather than maximising engagement.
- **Simplicity over complexity.** Decision keeps evaluation and completion simple and consistent across domains.

## 13. Acceptance Criteria

Written in Gherkin (Given / When / Then).

```gherkin
Scenario: Compare Offerings by Attributes
  Given two or more Offerings
  When a person compares them
  Then the comparison operates on those Offerings by their Attributes

Scenario: Compare is available without login
  Given a person using the platform as a Guest
  When they compare Offerings
  Then the comparison succeeds without requiring login

Scenario: Decision Chat assists but does not decide
  Given a person in the decision flow
  When they use Decision Chat
  Then Decision Chat helps them reach a decision without making the decision for them or acting on their behalf

Scenario: Decision Chat is available within the decision flow
  Given a person evaluating Offerings
  When they reach the Decision Chat step
  Then they may use Decision Chat as an assistive aid

Scenario: Favorites require login
  Given a person using the platform as a Guest
  When they attempt to mark an Offering as a Favorite
  Then the action does not succeed until they log in as a User

Scenario: Contact requires login
  Given a person using the platform as a Guest
  When they attempt to Contact the Business behind an Offering
  Then the action does not succeed until they log in as a User

Scenario: Messaging requires login
  Given a person using the platform as a Guest
  When they attempt to send a message about an Offering
  Then the action does not succeed until they log in as a User

Scenario: A message reaches the Offering's owning Business
  Given a logged-in User viewing an Offering
  When they send a message about that Offering
  Then the message is directed to the single Business that owns the Offering

Scenario: A decision reaches Completion
  Given a person who has evaluated and contacted the Business
  When they complete the decision through the completion flow
  Then the decision reaches Completion

Scenario: Admin moderates Decision content after it exists
  Given Decision-related content already exists
  When an Admin performs moderation
  Then moderation is applied after the content exists rather than beforehand
```

TODO — Additional acceptance criteria for Business responses within Messaging and for Guest completion via the affiliate handoff depend on the items marked TODO in Sections 4, 7, and 8.

## 14. Related PRDs

- **PRD-0001 — Offering** — defines the Offering and its Attributes that Compare operates on.
- **PRD-0002 — Discovery** — defines the Discovery steps that precede Decision.
- **PRD-0003 — Identity** — defines the roles and the login gating for Favorites, Contact, and Messaging.
- **PRD-0005 — Business** — defines the Business that is Contacted and messaged about its Offerings.
- **PRD-0006 — Platform** — owns Admin abilities beyond moderation and, pending confirmation, affiliate-link behaviour.

## 15. Related ADRs

TODO — No Architecture Decision Records are referenced yet.

## 16. Open Questions

- TODO — Decide Decision Chat login gating: whether a Guest may use Decision Chat is intentionally undecided and requires a Product Owner decision; this document neither asserts nor denies Guest access. (Sections 7, 8)
- TODO — Confirm which PRD owns affiliate-link behaviour within the completion flow. (Section 4)
- TODO — Define whether and how a Business responds within Messaging. (Sections 7, 10.4)
- TODO — Define whether a Guest can reach Completion via an affiliate-link handoff, and the gating for it. (Section 8)
- TODO — Define whether a formal Decision state model is required. (Section 9)
