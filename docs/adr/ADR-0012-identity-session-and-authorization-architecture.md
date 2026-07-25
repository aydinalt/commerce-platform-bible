# ADR-0012 — Identity, Session and Authorization Architecture

- **Owner:** Product Owner / Architecture Owner
- **Status:** Accepted
- **Version:** 1.0
- **Date:** 2026-07-25
- **Deciders:** Product Owner / Architecture Owner
- **Author:** ChatGPT (architecture and documentation advisor)
- **Supersedes:** none
- **Related:** `V1_SECURITY_ARCHITECTURE.md`, `V1_BACKEND_ARCHITECTURE.md`, `V1_FRONTEND_ARCHITECTURE.md`, `PRD-0003-identity.md`

> **Acceptance note.** The Product Owner / Architecture Owner accepted the exact Proposed v0.1 decision on 2026-07-25.

---

## 1. Context

V1 supports Guest, authenticated User, Business-context and separately authorized Admin behavior. Business is a User-owned profile, not a second identity. Browser authentication must be secure while authorization remains current, resource-scoped and auditable.

## 2. Decision

Use server-managed browser sessions represented by secure, HTTP-only, SameSite cookies. Persist only a high-entropy opaque session identifier in the browser; authoritative session and account state remain server-side. Apply CSRF protection and origin validation to cookie-authenticated mutations.

Authentication may use a managed standards-based identity service or a maintained audited library, selected during implementation. The selected option must preserve the session, audit, export/deletion and authorization boundaries in this ADR. If application-owned passwords are used, hash them with Argon2id and store verification/recovery tokens only as hashes.

Construct an immutable request principal from current server state for every protected request. It includes the User identity, account state, session identity, selected Business context, current Business permissions, independently provisioned Admin permissions and correlation identifier.

Business context must be explicitly selected and revalidated against current ownership. Business ownership never grants Admin permission. Admin permission never silently bypasses governed resource transitions.

Authorization is deny-by-default and implemented as server-side resource/action policy checks. Frontend route guards improve navigation only and are never an authorization boundary.

## 3. Consequences

- Session revocation and privilege changes can take effect from current server state.
- Browser tokens do not contain stale Business/Admin authority.
- Cookie security, CSRF defense, rotation, expiry and session cleanup become mandatory controls.
- A managed identity provider must integrate without becoming the owner of product authorization.
- Authorization requires negative matrix tests across Guest, User, Business and Admin contexts.

## 4. Alternatives Considered

- **Long-lived browser JWT authorization:** rejected because embedded permissions become stale and revocation is harder.
- **Business as a separate login/account:** rejected because it contradicts the Frozen Identity and Business model.
- **Frontend-only role checks:** rejected because the browser is untrusted.
- **Admin inferred from Business ownership:** rejected because the authority domains are separate.

## 5. Related PRDs

PRD-0003, PRD-0005 and PRD-0006.

## 6. Related ADRs

ADR-0006, ADR-0007 and ADR-0010.

## 7. Notes

The identity vendor or library choice must be documented before implementation. Choosing a provider does not permit changes to the product-owned User, Business or Admin model.
