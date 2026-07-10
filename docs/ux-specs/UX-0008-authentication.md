# UX-0008 — Authentication

- **UX ID:** UX-0008
- **Title:** Authentication
- **Status:** Draft
- **Version:** 0.2
- **Scope level:** UX behaviour (non-visual, non-technical)

**Revision Note (0.2):** Controlled revision applying Product Owner decisions. This UX no longer defines behaviour beyond `PRD-0003`. Email verification is not defined here, and no behaviour assuming a completed email-verification flow remains. Where `PRD-0003` intentionally leaves behaviour undecided (registration fields, recovery method, email verification), explicit TODOs are recorded instead of UX behaviour.

> This document describes user, screen, and interaction behaviour only. It does not describe visual design (colors, typography, spacing, icons, animations, components) or implementation (HTML, CSS, frameworks, APIs, database, backend, frontend).

---

## 1. Purpose

Authentication lets a person register, log in, log out, and reset a password, and it returns a person to an interrupted action after they authenticate, as governed by `PRD-0003-identity.md`.

## 2. Business Value

Authentication happens only when necessary, so Guests can experience the platform first. The return-to-action flow respects the user's time by resuming the exact action that required login.

## 3. Scope

- Register.
- Login.
- Logout.
- Password Reset.
- Return-to-action flow after successful authentication.

TODO — email verification, registration fields, and the password-reset recovery method are undecided in `PRD-0003-identity.md`; this UX does not define them and records them as TODOs.

## 4. Out of Scope

- Social login.
- Email verification behaviour (undecided in `PRD-0003`; recorded as a TODO, not defined here).
- Any V2 or excluded-scope capability as defined in `V1_SCOPE.md`.

> **Review Note (registration fields, recovery method, email verification):** `PRD-0003-identity.md` marks the registration identifiers/fields and the password-reset recovery method as TODO and does not define email verification. Per the Product Owner decision, this UX does not define behaviour beyond `PRD-0003`: it defines no email-verification flow and records the undecided items as TODOs. Any such behaviour must first be defined in `PRD-0003`.

## 5. Entry Points

- A Guest attempting a restricted action (for example revealing a Business phone number, using Favorites, Contacting/messaging) is routed here (see `UX-0003`, `UX-0004`, `UX-0007`).
- A person choosing to Register or Login directly.
- A person following a Password Reset step.

## 6. Exit Points

- After successful authentication, returning to the interrupted action (return-to-action).
- After Login/Register with no interrupted action, continuing into the platform.
- After Logout, returning to Guest-level abilities (per `PRD-0003-identity.md`).

## 7. Screen Overview

Authentication presents Register, Login, Logout, and Password Reset, and manages the return-to-action flow that resumes an interrupted action after success.

## 8. Screen Behaviour

- Register creates a User account. TODO — the specific registration fields are undefined (`PRD-0003`), and whether email verification is part of registration is undecided (`PRD-0003`); neither is defined here.
- Login authenticates a User.
- Logout ends the session and returns the person to Guest-level abilities.
- Password Reset lets a User set a new password through a recovery process. TODO — the recovery method is undefined (`PRD-0003`).
- Return-to-action: when authentication was triggered by a restricted action, success returns the person to that action.

## 9. User Actions

- Register.
- Log in.
- Log out.
- Request and complete a Password Reset.

## 10. System Responses

- Successful Register/Login grants User abilities.
- Successful authentication triggered by a restricted action returns the person to that action.
- Logout returns the person to Guest-level abilities.

## 11. Validation Behaviour (Product level)

- Restricted actions are only completed for a logged-in User; Guests are routed here first (per `PRD-0003-identity.md`).
- TODO — field-level validation for Register, Login, and Password Reset is undefined, because the registration fields and recovery method are TODO in `PRD-0003`.

## 12. Empty States

- Not applicable in the usual sense. TODO — any first-time/empty presentation is not defined by approved decisions.

## 13. Loading States

- While an authentication step is being processed, a loading state is shown. TODO — the specific loading behaviour is not defined by approved decisions.

## 14. Error States

- TODO — behaviour for failed Login, failed Register, and failed Password Reset is not defined by approved decisions.

## 15. Permissions

Per `PRD-0003-identity.md`:

- A Guest can Register and Login.
- A User can Logout and reset their password.
- Restricted actions (Favorites, phone reveal, Contact/messaging) require a logged-in User.

## 16. Accessibility Notes

- At the product level, Register, Login, Logout, and Password Reset must be operable without a mouse and perceivable by assistive technology; the return-to-action flow must preserve context.
- TODO — detailed accessibility acceptance criteria are not defined by approved decisions.

## 17. Related PRDs

- `PRD-0003-identity.md` — Register, Login, Logout, Password Reset, roles, and login gating.
- `PRD-0004-decision.md` — the restricted Decision actions that trigger authentication.

## 18. Acceptance Criteria

```gherkin
Scenario: Guest is routed to Authentication for a restricted action
  Given a Guest attempts a restricted action
  When the action requires login
  Then they are routed to Authentication

Scenario: Return to the interrupted action after login
  Given a Guest was routed to Authentication from a restricted action
  When they authenticate successfully
  Then they return to the interrupted action to continue it

Scenario: Register and Login
  Given a Guest
  When they Register or Login successfully
  Then they gain User-level abilities

Scenario: Logout returns to Guest abilities
  Given a logged-in User
  When they Logout
  Then they return to Guest-level abilities

Scenario: No social login
  Given a person on Authentication
  When they view the options
  Then there is no social login
```

## 19. Open Questions (TODO only)

- TODO — Registration fields, email verification, and the recovery method are undefined in `PRD-0003`; this UX records them as TODO and defines no behaviour for them until `PRD-0003` defines them. (Sections 3, 4, 8, 11)
- TODO — Define the password-reset recovery method. (Section 8)
- TODO — Define error behaviour for each authentication step. (Section 14)
- TODO — Define loading behaviour. (Section 13)
