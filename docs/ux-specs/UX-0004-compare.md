# UX-0004 — Compare

- **UX ID:** UX-0004
- **Title:** Compare
- **Status:** Draft
- **Version:** 0.2
- **Scope level:** UX behaviour (non-visual, non-technical)

**Revision Note (0.2):** Controlled revision applying Product Owner decisions. Decision Chat is integrated into this surface as an assistive step between Compare and Contact (assistive only; never decides for the user), owned by `PRD-0004` per `ADR-0001`. The comparison limit is updated to a maximum of 5 Offerings. Unresolved Decision Chat login gating is preserved as an explicit TODO matching `PRD-0004`.

> This document describes user, screen, and interaction behaviour only. It does not describe visual design (colors, typography, spacing, icons, animations, components) or implementation (HTML, CSS, frameworks, APIs, database, backend, frontend).

---

## 1. Purpose

Compare lets a person evaluate multiple Offerings side by side by their Attributes and move toward completing a decision, as defined in `PRD-0004-decision.md`. Within this surface, assistive Decision Chat helps the person reach that decision between Compare and Contact.

## 2. Business Value

Compare helps people reach a decision faster by making differences between Offerings clear, and assistive Decision Chat supports reaching the decision with confidence. Compare is available without login (per `PRD-0003-identity.md`), so a Guest can experience it before authenticating.

## 3. Scope

- Comparing up to a maximum of 5 Offerings.
- Attribute comparison across the selected Offerings.
- Highlighting differences.
- An option to display only differing Attributes.
- Removing an Offering from the comparison.
- Clearing the comparison.
- An assistive Decision Chat step between Compare and Contact (assistive only).
- Continuing into the decision completion flow.

## 4. Out of Scope

- Saved comparisons and Sharing (per `PRD-0004-decision.md`).
- Recommendations and recommendation engines.
- Autonomous AI, or AI that decides on the user's behalf (Decision Chat is assistive only — see Scope).
- Any V2 or excluded-scope capability as defined in `V1_SCOPE.md`.

## 5. Entry Points

- Adding Offerings to Compare from Offering Detail (see `UX-0003`).
- Adding Offerings to Compare from Discovery results, where offered (see `UX-0002`).

## 6. Exit Points

- Using assistive Decision Chat within this surface, then continuing into the decision completion flow (Contact → Completion, see `UX-0007` and `PRD-0004-decision.md`), which for a Guest first routes to Authentication (see `UX-0008`).
- Returning to Discovery or an Offering Detail.

## 7. Screen Overview

Compare presents the selected Offerings (up to 5) side by side with their Attributes, highlights differences, offers a toggle to show only differing Attributes, and provides controls to remove an Offering and clear the comparison. Between Compare and Contact, an assistive Decision Chat step helps the person reach a decision. The person can then continue toward completing the decision.

## 8. Screen Behaviour

- Offerings are compared by their Attributes side by side.
- Differences between Offerings are highlighted.
- A person can choose to display only the differing Attributes.
- A person can remove an individual Offering or clear the whole comparison.
- Between Compare and Contact, the person may use assistive Decision Chat to help reach a decision. Decision Chat is assistive only: it supports the person and never makes the decision for them or acts on their behalf (per `PRD-0004-decision.md` and `ADR-0001`).
- A person can continue into the decision completion flow.

## 9. User Actions

- Add an Offering to Compare (from `UX-0002` / `UX-0003`).
- Toggle "show only differing Attributes."
- Remove an Offering from the comparison.
- Clear the comparison.
- Use assistive Decision Chat to help reach a decision.
- Continue into the decision completion flow.

## 10. System Responses

- Adding an Offering updates the comparison, up to the maximum of 5.
- The differences highlight and the "only differing Attributes" toggle update the displayed Attributes.
- Removing an Offering or clearing updates the comparison accordingly.
- Decision Chat provides assistive help toward the decision; it does not decide for the person or act on their behalf.
- Continuing routes into the decision completion flow (login-gated Contact where required).

## 11. Validation Behaviour (Product level)

- A comparison holds at most 5 Offerings; attempting to add a 6th is not accepted. TODO — the exact behaviour shown when the maximum is reached is not defined by approved decisions.

## 12. Empty States

- TODO — behaviour of Compare when no Offerings have been added is not defined by approved decisions.

## 13. Loading States

- While the compared Offerings' details are being retrieved, a loading state is shown. TODO — the specific loading behaviour is not defined by approved decisions.

## 14. Error States

- TODO — behaviour when a compared Offering becomes unavailable is not defined by approved decisions.

## 15. Permissions

- Compare is available to Guests and Users without login (per `PRD-0003-identity.md`).
- Continuing into completion via Contact requires login; a Guest is routed to Authentication first (see `UX-0008`).
- TODO — whether a Guest may use Decision Chat is intentionally undecided, matching `PRD-0004-decision.md`; this document neither asserts nor denies Guest access to Decision Chat.

## 16. Accessibility Notes

- At the product level, adding/removing Offerings, the "only differing Attributes" toggle, clearing, using Decision Chat, and continuing must be operable without a mouse and perceivable by assistive technology; the side-by-side comparison must be navigable by assistive technology.
- TODO — detailed accessibility acceptance criteria are not defined by approved decisions.

## 17. Related PRDs

- `PRD-0004-decision.md` — Compare, Decision Chat, and the decision completion flow.
- `PRD-0001-offering.md` — comparison by Attributes.
- `PRD-0003-identity.md` — Compare available to Guests; Contact login-gated.
- `ADR-0001-decision-chat-ownership.md` — Decision Chat is owned by `PRD-0004` and is part of the Decision capability.

## 18. Acceptance Criteria

```gherkin
Scenario: Compare up to five Offerings
  Given a person is comparing Offerings
  When they attempt to add a sixth Offering
  Then the comparison does not exceed five Offerings

Scenario: Compare by Attributes
  Given two or more Offerings in Compare
  When they are compared
  Then the comparison operates on their Attributes

Scenario: Show only differing Attributes
  Given Offerings in Compare
  When the person chooses to show only differing Attributes
  Then only the Attributes that differ are displayed

Scenario: Remove and clear
  Given Offerings in Compare
  When the person removes an Offering or clears the comparison
  Then the comparison updates accordingly

Scenario: Decision Chat assists but does not decide
  Given a person comparing Offerings
  When they use Decision Chat between Compare and Contact
  Then Decision Chat helps them reach a decision without making the decision for them or acting on their behalf

Scenario: Compare is available without login
  Given a Guest
  When they compare Offerings
  Then the comparison succeeds without login

Scenario: Continuing to completion requires login
  Given a Guest in Compare
  When they continue into the completion flow via Contact
  Then they are routed to Authentication first
```

## 19. Open Questions (TODO only)

- TODO — Define the behaviour shown when the 5-Offering maximum is reached. (Section 11)
- TODO — Decide whether a Guest may use Decision Chat; login gating is intentionally undecided, matching `PRD-0004`. (Section 15)
- TODO — Define the empty Compare state. (Section 12)
- TODO — Define loading and error behaviour, including unavailable compared Offerings. (Sections 13–14)
