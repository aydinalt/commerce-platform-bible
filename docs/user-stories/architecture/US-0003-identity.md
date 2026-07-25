# US-0003 — Identity User Stories

- **Owner:** Product Owner / Architecture Owner
- **Status:** Frozen
- **Version:** 1.0
- **Last Updated:** 2026-07-25
- **Approval Date:** 2026-07-25
- **Approved By:** Product Owner / Architecture Owner
- **Approved Candidate:** In Review v0.3
- **Freeze State:** Frozen
- **Freeze Date:** 2026-07-25
- **Frozen By:** Product Owner / Architecture Owner
- **Story Domain:** Identity
- **Domain Code:** `IDN`
- **Feature Registry Owner:** Frozen `IDENTITY_FEATURE_REGISTRY.md` v1.0
- **GitHub effect:** None

**Freeze Note (1.0):** Explicitly Frozen by the Product Owner / Architecture Owner on 2026-07-25. Frozen v1.0 is the locked authoritative Identity Parent Story Document baseline. This exact file must not be edited in place. Future Epic placement, Feature placement, relationship classification, Capability reference, Generated Story inventory, UX reference, or scope changes require a controlled revision. This Freeze changes no Generated Story Delivery Status, does not apply the F06 section-level UX citation future-maintenance observation as an authoritative change, and does not update GitHub automatically.

**Approval Note (1.0):** Explicitly approved by the Product Owner / Architecture Owner on 2026-07-25. The exact In Review v0.3 candidate becomes the authoritative Approved v1.0 Identity Parent Story Document baseline. This approval does not Freeze the document, does not change any Generated Story Delivery Status, does not apply the F06 section-level UX citation future-maintenance observation as an authoritative change, and does not update GitHub automatically.

**Revision Note (0.2):** Controlled replacement of documented Draft v0.1 embedded-Story content with the Frozen Handbook Parent → Epic → Feature architecture. Consumes authoritative IDN F01–F09, removes embedded `US-NNNN.n` Story ownership, establishes five bounded Epics, and records nine first Generated Story candidates by reference. It changes no Feature ID, canonical Feature name, relationship classification, Capability, PRD behaviour, UX behaviour, implementation, approval, Freeze, or GitHub file.

**Review Entry Note (0.3):** Bounded SIO-alignment correction after independent Claude audit. Updates only the F06 Primary Experience entry to `UX-0008-authentication.md` and the by-reference F06 candidate state to In Review v0.2. No Epic, Feature, Story ID, relationship classification, Capability reference, PRD/UX behaviour, Acceptance Criterion, BDD, dependency, size, scope, lifecycle authority, or GitHub file changes.

**Review Entry Note (0.2):** The exact Draft v0.2 candidate entered formal review on 2026-07-25. No Feature ID, canonical Feature name, Epic placement, Story identifier, PRD/UX behaviour, relationship classification, Capability reference, approval, Freeze, or GitHub state changed during review entry.

> This Parent Story Document owns Identity Epic → Feature placement and records Generated Story files by reference. It does not own Feature IDs, relationship classifications, Capability references, product behaviour, UX behaviour, Generated Story content, or implementation.

---

## 1. Purpose

Organize the Identity Story Domain into bounded Epics and authoritative Features F01–F09 so every Generated Identity Story has exactly one Parent, one Epic, and one Feature.

## 2. Scope

This Parent owns:

- Identity Epic names and bounded outcomes;
- Feature placement under exactly one Epic;
- by-reference Generated Story inventory;
- Identity package coverage and reconciliation state.

## 3. Out of Scope

This Parent does not own or redefine:

- Feature IDs, canonical names, short scope labels, references, or relationship classifications — Frozen `IDENTITY_FEATURE_REGISTRY.md`;
- product behaviour — Frozen `PRD-0003-identity.md`;
- experience behaviour — referenced Frozen UX documents;
- Generated Story Acceptance Criteria, BDD, dependencies, size, scope, lifecycle, or complete content;
- implementation, technical architecture, delivery sequencing, or Sprint planning.

## 4. Epic Map

| Epic | Bounded Outcome | Features |
|---|---|---|
| Public Access and Account Establishment | Public Guest gates remain low-friction and one Enabled account may be established after email-control proof. | F01, F02 |
| Authentication Lifecycle | Existing account holders may enter and leave authenticated context or recover the ability to attempt Login. | F03, F04, F05 |
| Account Access Governance | Enabled and Suspended states produce authoritative access consequences without mutating unrelated state. | F06 |
| Authorized Context Access | Enabled Users may explicitly enter only owned Business or Owner-authorized Admin contexts. | F07, F08 |
| Authenticated Action Continuity | Exact Direct Contact intent may return through Authentication without creating Messaging or persistence. | F09 |

## 5. Feature Map

| Feature ID | Canonical Feature | Epic | Relationship Classification | Behaviour Owner | Primary Experience |
|---|---|---|---|---|---|
| F01 | Public Guest Access Baseline | Public Access and Account Establishment | Supporting relationship | `PRD-0003-identity.md` | `UX-0001-home.md`; `UX-0002-discovery.md`; `UX-0009-decision-flow.md` |
| F02 | Registration and Email-Control Proof | Public Access and Account Establishment | No Capability Architecture required | `PRD-0003-identity.md` | `UX-0008-authentication.md` |
| F03 | Login | Authentication Lifecycle | No Capability Architecture required | `PRD-0003-identity.md` | `UX-0008-authentication.md` |
| F04 | Logout | Authentication Lifecycle | No Capability Architecture required | `PRD-0003-identity.md` | `UX-0008-authentication.md` |
| F05 | Password Recovery | Authentication Lifecycle | No Capability Architecture required | `PRD-0003-identity.md` | `UX-0008-authentication.md` |
| F06 | User Account Access Status | Account Access Governance | No Capability Architecture required | `PRD-0003-identity.md` | `UX-0008-authentication.md` |
| F07 | Business Context Access | Authorized Context Access | No Capability Architecture required | `PRD-0003-identity.md` | `UX-0008-authentication.md`; `UX-0005-business-dashboard.md` |
| F08 | Admin Authorization and Context Access | Authorized Context Access | No Capability Architecture required | `PRD-0003-identity.md` | `UX-0008-authentication.md`; `UX-0006-admin-dashboard.md` |
| F09 | Direct Contact Authentication Return | Authenticated Action Continuity | Supporting relationship | `PRD-0003-identity.md` | `UX-0008-authentication.md`; `UX-0009-decision-flow.md` |

## 6. Generated Story Inventory

| Feature | Generated Story | Candidate State |
|---|---|---|
| F01 | `US-IDN-F01-001` — Public Guest Access Baseline | In Review v0.1 |
| F02 | `US-IDN-F02-001` — Registration and Email-Control Proof | In Review v0.1 |
| F03 | `US-IDN-F03-001` — Login | In Review v0.1 |
| F04 | `US-IDN-F04-001` — Logout | In Review v0.1 |
| F05 | `US-IDN-F05-001` — Password Recovery | In Review v0.1 |
| F06 | `US-IDN-F06-001` — User Account Access Status | In Review v0.2 |
| F07 | `US-IDN-F07-001` — Business Context Access | In Review v0.1 |
| F08 | `US-IDN-F08-001` — Admin Authorization and Context Access | In Review v0.1 |
| F09 | `US-IDN-F09-001` — Direct Contact Authentication Return | In Review v0.1 |

The candidate-state column is informative and by reference. This Parent advances no Generated Story lifecycle state.

## 7. Coverage and Readiness

| Check | Result |
|---|---|
| Authoritative F01–F09 consumed exactly | PASS |
| Every Feature placed under exactly one Epic | PASS |
| Nine first Generated Story candidates exist | PASS |
| Embedded legacy Stories removed | PASS |
| Parent embeds no Acceptance Criteria or BDD | PASS |
| Relationship classifications match the Frozen registry | PASS |
| No separate Business or Admin login | PASS |
| No Pending or Verified account state | PASS |
| No Favorites, Messaging, social login, SSO, MFA, account deletion, or self-service Admin authorization | PASS |
| GitHub unchanged | PASS |

## 8. Reconciliation Boundary

This Frozen baseline does not:

- permit direct in-place modification;
- approve or Freeze any Generated Story;
- revise the Frozen Feature Registry;
- create a Feature or Capability;
- broaden PRD or UX scope;
- start implementation;
- update traceability, repository indexes, changelog, or GitHub automatically.

## 9. References

- `IDENTITY_FEATURE_REGISTRY.md` — F01–F09 identity and relationship classifications.
- `PRD-0003-identity.md` — Identity behaviour.
- `UX-0008-authentication.md` — Registration, Login, Logout, Recovery, context entry, and Direct Contact return.
- `UX-0005-business-dashboard.md` — Business-context entry conditions.
- `UX-0006-admin-dashboard.md` — Admin-context entry conditions.
- `UX-0001-home.md`, `UX-0002-discovery.md`, `UX-0009-decision-flow.md` — supporting public and Direct Contact experiences.
- `ADR-0007`, `ADR-0009`, Owner Decisions D07 and D22.
- `USER_STORY_HANDBOOK.md`, `REPOSITORY_GOVERNANCE.md`, `DOCUMENT_LIFECYCLE.md`, `REVIEW_PROCESS.md`.
