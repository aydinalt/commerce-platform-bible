# UX-0007 — Messaging

- **UX ID:** UX-0007
- **Title:** Messaging
- **Status:** Draft
- **Version:** 0.1
- **Scope level:** UX behaviour (non-visual, non-technical)

> This document describes user, screen, and interaction behaviour only. It does not describe visual design (colors, typography, spacing, icons, animations, components) or implementation (HTML, CSS, frameworks, APIs, database, backend, frontend).

---

## 1. Purpose

Messaging lets a logged-in User contact and exchange messages with the Business behind an Offering, as part of the Decision capability (`PRD-0004-decision.md`). It presents a conversation list and a conversation detail.

## 2. Business Value

Messaging helps people move a decision forward by reaching the Business behind an Offering. Login gating protects trust, consistent with the Foundation.

## 3. Scope

- A conversation list.
- A conversation detail.
- Send message.
- Receive message.
- Authentication required.

## 4. Out of Scope

- Attachments.
- Read receipts.
- Typing indicators.
- Any V2 or excluded-scope capability as defined in `V1_SCOPE.md`.

> **Review Note (two-way messaging):** `PRD-0004-decision.md` defines that a User can Contact and send messages to the Business behind an Offering, but leaves "whether and how a Business responds within Messaging" as TODO. This UX brief includes "Receive message" and a conversation detail, which imply a two-way exchange. It is documented here as the approved UX brief; a decision-maker should resolve the corresponding TODO in `PRD-0004`. No decision has been made here.

## 5. Entry Points

- Contacting the Business from an Offering Detail (see `UX-0003`), which for a Guest first routes to Authentication (see `UX-0008`).
- Opening Messaging to view existing conversations.

## 6. Exit Points

- Returning to the Offering or to Discovery.
- Continuing toward Completion of the decision (`PRD-0004-decision.md`).

## 7. Screen Overview

Messaging presents a list of conversations and, for a selected conversation, a conversation detail where messages are sent and received.

## 8. Screen Behaviour

- The conversation list shows the User's conversations.
- The conversation detail shows the messages in a selected conversation and lets the User send a message.
- A message about an Offering is directed to that Offering's owning Business (per `PRD-0004-decision.md`).
- Received messages appear in the conversation detail. TODO — how and when a Business responds is undefined (see Review Note).

## 9. User Actions

- Open the conversation list.
- Open a conversation to view its detail.
- Send a message.

## 10. System Responses

- Sending a message adds it to the conversation, directed to the Offering's owning Business.
- Received messages appear in the relevant conversation.

## 11. Validation Behaviour (Product level)

- Sending a message requires the actor to be a logged-in User; Guests cannot send messages (per `PRD-0003-identity.md`).
- TODO — message content constraints (for example maximum length) are not defined by approved decisions.

## 12. Empty States

- When the User has no conversations, the conversation list shows an empty state. TODO — the exact empty-state content is not defined by approved decisions.

## 13. Loading States

- While conversations or a conversation's messages are being retrieved, a loading state is shown. TODO — the specific loading behaviour is not defined by approved decisions.

## 14. Error States

- TODO — behaviour when a message fails to send, or a conversation fails to load, is not defined by approved decisions.

## 15. Permissions

Per `PRD-0003-identity.md` and `PRD-0004-decision.md`:

- **Guest** — cannot send messages; attempting to message routes to Authentication (see `UX-0008`).
- **User** — can send and receive messages.
- **Business** — as the recipient, receives messages about its Offerings. TODO — how a Business responds within Messaging is undefined (see Review Note).

## 16. Accessibility Notes

- At the product level, the conversation list, conversation detail, and sending a message must be operable without a mouse and perceivable by assistive technology.
- TODO — detailed accessibility acceptance criteria are not defined by approved decisions.

## 17. Related PRDs

- `PRD-0004-decision.md` — Contact and Messaging.
- `PRD-0003-identity.md` — messaging login gating; Guests cannot send messages.
- `PRD-0005-business.md` — the Business that receives messages about its Offerings.

## 18. Acceptance Criteria

```gherkin
Scenario: Authentication required to message
  Given a Guest
  When they attempt to send a message
  Then they are routed to Authentication and cannot send until logged in

Scenario: Send a message to the Offering's Business
  Given a logged-in User viewing an Offering
  When they send a message about that Offering
  Then the message is directed to the single Business that owns the Offering

Scenario: Conversation list and detail
  Given a logged-in User with conversations
  When they open Messaging
  Then they see a conversation list and can open a conversation's detail

Scenario: No attachments, read receipts, or typing indicators
  Given a User in a conversation
  When they use Messaging
  Then there are no attachments, no read receipts, and no typing indicators
```

## 19. Open Questions (TODO only)

- TODO — Resolve whether and how a Business responds within Messaging, per the `PRD-0004` TODO. (Section 4)
- TODO — Define message content constraints. (Section 11)
- TODO — Define empty, loading, and error behaviour. (Sections 12–14)
