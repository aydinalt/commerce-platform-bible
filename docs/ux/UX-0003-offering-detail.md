# UX-0003 — Offering Detail

- **UX ID:** UX-0003
- **Title:** Offering Detail
- **Status:** Draft
- **Version:** 0.1
- **Scope level:** UX behaviour (non-visual, non-technical)

> This document describes user, screen, and interaction behaviour only. It does not describe visual design (colors, typography, spacing, icons, animations, components) or implementation (HTML, CSS, frameworks, APIs, database, backend, frontend).

---

## 1. Purpose

The Offering Detail screen presents a single Offering in full: its image gallery, its Attribute groups, and the Business behind it, with entries into Compare, Favorites, and Contact.

## 2. Business Value

Offering Detail helps a person evaluate one Offering thoroughly and move toward a decision, while gating Contact and phone number behind login to protect trust (per `PRD-0003-identity.md`).

## 3. Scope

- A large image gallery with thumbnail navigation, a full-screen gallery, and zoom support.
- Attribute groups displayed clearly.
- The Business profile visible.
- Entries into Compare, Favorites, and Contact.
- A sticky contact panel on desktop and a sticky bottom action bar on mobile.
- Related Offerings showing the newest Offerings from the same Category only.

## 4. Out of Scope

- Attribute-based similarity for Related Offerings (out of scope for V1).
- Recommendations or AI.
- Any V2 or excluded-scope capability as defined in `V1_SCOPE.md`.

> **Terminology note:** The UX brief uses "Favourite"; this document uses "Favorites" to match the approved PRD terminology (`PRD-0003`, `PRD-0004`). No behaviour is changed.

## 5. Entry Points

- Selecting an Offering from Discovery (see `UX-0002`).
- Selecting a featured Offering from Home (see `UX-0001`).
- Selecting a Related Offering on another Offering Detail screen.
- Returning here after Authentication (return-to-action, see `UX-0008`).

## 6. Exit Points

- Entering Compare (see `UX-0004`).
- Entering Contact / Messaging (see `UX-0007`), which for a Guest first routes to Authentication (see `UX-0008`).
- Selecting a Related Offering (another Offering Detail).
- Returning to Discovery.

## 7. Screen Overview

Offering Detail shows the Offering's image gallery, its Attribute groups, the Business profile, entries for Compare/Favorites/Contact, and a Related Offerings section (newest in the same Category). Desktop shows a sticky contact panel; mobile shows a sticky bottom action bar.

## 8. Screen Behaviour

- The gallery supports thumbnail navigation, a full-screen view, and zoom.
- Attribute groups present the Offering's Attributes clearly.
- The Business profile behind the Offering is visible.
- The contact entry is sticky (desktop panel; mobile bottom action bar).
- Related Offerings show the newest Offerings from the same Category only; attribute-based similarity is not used in V1.

## 9. User Actions

- Browse the gallery (thumbnails, full-screen, zoom).
- View Attribute groups and the Business profile.
- Add the Offering to Compare.
- Add the Offering to Favorites (login-gated).
- Reveal the Business phone number (login-gated).
- Contact the Business / initiate messaging (login-gated).
- Open a Related Offering.

## 10. System Responses

- Compare entry adds the Offering to Compare (see `UX-0004`).
- Favorites entry, phone reveal, and Contact each require login: for a Guest, the action routes to Authentication and, after success, returns to this Offering (see Section on Authentication behaviour and `UX-0008`).
- Selecting a Related Offering opens that Offering's detail.

## 11. Validation Behaviour (Product level)

- Login-gated actions (Favorites, phone reveal, Contact/messaging) are only completed for a logged-in User; a Guest is routed to Authentication first.
- TODO — behaviour when Compare already holds the maximum number of Offerings is defined in `UX-0004`.

## 12. Empty States

- TODO — behaviour when there are no Related Offerings in the same Category is not defined by approved decisions.
- TODO — behaviour when an Offering has no gallery images is not defined by approved decisions.

## 13. Loading States

- While the Offering and its Related Offerings are being retrieved, a loading state is shown. TODO — the specific loading behaviour is not defined by approved decisions.

## 14. Error States

- TODO — behaviour when the Offering fails to load, or is unavailable (for example not Published), is not defined by approved decisions.

## 15. Permissions

Per `PRD-0003-identity.md`:

- **Guest** — may view the complete Offering, but may NOT view the Business phone number and may NOT initiate messaging.
- **User** — may view the phone number, use Favorites, and Contact / message the Business.

### Authentication behaviour

- Attempting to reveal the phone number or send a message must route a Guest to Authentication.
- After successful authentication, the user returns to the original Offering to continue the interrupted action (return-to-action, see `UX-0008`).

## 16. Accessibility Notes

- At the product level, the gallery (including full-screen and zoom), Attribute groups, Business profile, and Compare/Favorites/Contact entries must be operable without a mouse and perceivable by assistive technology. Full-screen gallery must be dismissible and preserve context on return.
- TODO — detailed accessibility acceptance criteria are not defined by approved decisions.

## 17. Related PRDs

- `PRD-0001-offering.md` — the Offering, its Attributes, and the owning Business.
- `PRD-0003-identity.md` — Guest vs User gating for phone and messaging.
- `PRD-0004-decision.md` — Compare, Favorites, and Contact entries.
- `PRD-0005-business.md` — the Business profile shown.

## 18. Acceptance Criteria

```gherkin
Scenario: Guest views the complete Offering
  Given a Guest on an Offering Detail screen
  When they view the Offering
  Then they can see the complete Offering including its gallery and Attribute groups

Scenario: Guest cannot see the phone number
  Given a Guest on an Offering Detail screen
  When they attempt to reveal the Business phone number
  Then they are routed to Authentication instead

Scenario: Guest cannot initiate messaging
  Given a Guest on an Offering Detail screen
  When they attempt to send a message
  Then they are routed to Authentication instead

Scenario: Return-to-action after authentication
  Given a Guest was routed to Authentication from an Offering
  When they authenticate successfully
  Then they return to the original Offering to continue the action

Scenario: Related Offerings are newest in the same Category
  Given an Offering in a Category
  When Related Offerings are shown
  Then they are the newest Offerings from the same Category only, without attribute-based similarity

Scenario: Compare entry adds the Offering
  Given a person on an Offering Detail screen
  When they use the Compare entry
  Then the Offering is added to Compare
```

## 19. Open Questions (TODO only)

- TODO — Define behaviour when there are no Related Offerings in the same Category. (Section 12)
- TODO — Define behaviour when an Offering has no gallery images. (Section 12)
- TODO — Define loading and error behaviour, including unavailable/unpublished Offerings. (Sections 13–14)
