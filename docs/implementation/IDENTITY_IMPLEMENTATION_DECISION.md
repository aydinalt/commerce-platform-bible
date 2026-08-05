# Identity Implementation Decision

- **Owner:** Product Owner / Architecture Owner
- **Status:** Accepted
- **Maintenance Mode:** Living
- **Version:** 1.0
- **Last Updated:** 2026-08-04
- **Satisfies:** `ADR-0012-identity-session-and-authorization-architecture.md` §7
- **Scope:** Implementation choice only. No ADR, PRD, UX or Story behaviour changes.

## Why this record exists

ADR-0012 §7 requires that "the identity vendor or library choice must be
documented before implementation". This record closes that precondition for the
Identity and Access baseline increment.

## Decision

Authentication is **application-owned**, using password credentials hashed with
**Argon2id**, and server-managed opaque sessions. No external identity provider
is introduced for V1.

### Why not a managed identity service

| Consideration | Weight |
|---|---|
| `US-IDN-F02-001` AC-1 requires an email address **and password** to begin registration | A passwordless-only provider configuration would contradict a Frozen Story |
| ADR-0012 §7: "Choosing a provider does not permit changes to the product-owned User, Business or Admin model" | Authorization, Business context and Admin provisioning stay ours either way, so a provider removes less work than it appears to |
| The verification suite runs hermetically against a local PostgreSQL with no network | A provider would introduce network dependence or mocking into every authenticated test |
| ADR-0012 already prescribes the full control set | Argon2id, session rotation, CSRF, origin validation and throttling are specified; the design work is done, not deferred |

A managed service remains available later: the session and principal boundaries
in ADR-0012 are provider-neutral, and the credential store is isolated in its own
table precisely so it can be replaced without touching the User model.

### Selected libraries

| Concern | Choice | Note |
|---|---|---|
| Password hashing | `@node-rs/argon2` | Argon2id, native performance, actively maintained |
| Session identifiers | `node:crypto` `randomBytes` | High-entropy opaque tokens; no library needed |
| Token storage | SHA-256 via `node:crypto` | Only digests are persisted, for sessions and proof tokens alike |

## Controls carried from the Frozen baseline

Taken from ADR-0012 §2 and `V1_SECURITY_ARCHITECTURE.md`:

- secure, HTTP-only, SameSite cookies carrying only an opaque session identifier;
- authoritative session and account state server-side;
- session rotation after authentication and after privilege change;
- CSRF protection and origin validation on cookie-authenticated mutations;
- Argon2id password hashing;
- verification and recovery tokens persisted only as hashes;
- login and recovery throttling that does not leak account existence;
- an immutable request principal rebuilt from current server state per request;
- deny-by-default, server-side resource and action policy checks.

## Account status model correction

The M10 schema declared `AccountStatus = {PENDING_VERIFICATION, ACTIVE,
SUSPENDED, CLOSED}`. Two Frozen Stories contradict this:

- `US-IDN-F06-001` AC-1 — "use exactly Enabled and Suspended as V1 User Account access-status values";
- `US-IDN-F02-001` AC-7 — "create no separate Pending or Verified User Account state".

The Stories are Frozen; `schema.prisma` is a Living implementation artefact.
The schema is therefore corrected to `{ENABLED, SUSPENDED}`, and a registration
that has not yet proven email control is held in `pending_registration` rather
than as a `user_account` row. `CLOSED` is removed because no Frozen Story
defines closure behaviour for V1; it can return through a controlled change when
one does.

## Delivery of the registration proof

The proof token is **minted at delivery, not at registration**. Registration
writes `pending_registration` and its outbox event in one transaction and mints
nothing; the worker generates the token when it produces the message and stores
only the digest.

The alternative — minting in the API and carrying the token in the outbox
payload — was rejected because it would place a replayable secret in the
database and undo the property that only digests are stored. Minting at delivery
also makes retries safe: each attempt issues a fresh token and invalidates the
previous one.

`LoggingEmailDispatcher` is the development adapter and refuses to construct when
`NODE_ENV=production`, so an unconfigured deployment fails loudly instead of
silently accepting registrations nobody can complete.

## Origin validation covers session establishment

A review of this increment found that origin validation was applied only to
requests that **carried** a session, not to those that **established** one. That
left login CSRF open: a cross-site form post signs a person into an account they
did not choose, and everything they then do accumulates in someone else's
account. `SameSite=Strict` does not close it, because it governs sending a
cookie rather than setting one.

`POST /auth/sessions` and `POST /auth/registrations/confirmations` therefore now
require a recognised `Origin` or `Referer`. The consequence is deliberate: a
client that establishes a cookie session must declare where it is calling from,
which suits the browser product ADR-0012 describes. A non-browser client would
need a different credential mechanism rather than a cookie.

`POST /auth/registrations` and `POST /auth/password-resets` remain open to an
undeclared origin: they establish nothing and reveal nothing, and throttling
covers abuse.

## Scope of the first increment

Session foundation, registration with email-control proof, login and logout —
`US-IDN-F02-001`, `US-IDN-F03-001`, `US-IDN-F04-001`, and the Guest boundary of
`US-IDN-F01-001`.

Password recovery (`F05`), Business-context selection (`F07`), Admin
authorization (`F08`) and Direct Contact return (`F09`) follow in later
increments. No Delivery Status advances through this record.

## Deferred with reason

| Item | Reason |
|---|---|
| Outbound email vendor | The architecture names an email provider but selects none. The port, the outbox and the worker are implemented; only the vendor adapter is left, and it is the single remaining deployment decision. |
| Distributed throttling state | Throttling is persisted in PostgreSQL. A shared cache belongs with the infrastructure increment that introduces one. |
