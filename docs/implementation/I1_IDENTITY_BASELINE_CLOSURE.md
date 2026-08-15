# I1 Identity and Access Baseline — Closure Record

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft — awaiting Owner acceptance
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-05
- **Scope:** Implementation record only. No Frozen Story is edited and no Delivery Status changes.

## What this increment delivered

Server-managed sessions, registration with emailed email-control proof, login,
logout, password recovery, explicit Business-context selection and operationally
provisioned Admin authorization — all under the controls of ADR-0012 and
`V1_SECURITY_ARCHITECTURE.md`.

## Per-Story coverage

| Story | State | Notes |
|---|---|---|
| `US-IDN-F02-001` Registration and Email-Control Proof | Covered | Account created only on proof; one account per address; no Pending account state |
| `US-IDN-F03-001` Login | Covered | Registered address and password; Enabled required; wrong credentials, unknown address and suspension are indistinguishable |
| `US-IDN-F04-001` Logout | Covered | Context ends, account and relationships retained |
| `US-IDN-F05-001` Password Recovery | Covered | Unauthenticated start, one-time proof, status and relationships untouched, Suspended stays Suspended |
| `US-IDN-F06-001` User Account Access Status | Partial | Enforcement covered; the suspend and reinstate **actions** belong to `US-PLT-F05-001` in I7 |
| `US-IDN-F07-001` Business Context Access | Partial | AC-1, AC-2, AC-3, AC-5, AC-6, AC-7, AC-8, AC-9 covered. AC-4 is a UX-0005 routing obligation with no web surface yet |
| `US-IDN-F08-001` Admin Authorization and Context | Partial | AC-1 through AC-5 and AC-7 through AC-11 covered. AC-6 is a UX-0006 routing obligation with no web surface yet |
| `US-IDN-F01-001` Public Guest Access Baseline | Partial | AC-4 and AC-6 covered — the authenticated boundary. The public surface itself (Search, Browse, Compare, Chat) belongs to I4 and I5 |
| `US-IDN-F09-001` Direct Contact Authentication Return | **Blocked** | See below |

## Why `US-IDN-F09-001` is not implementable in this increment

AC-2 requires the return context to carry "the exact Decision flow, Selected
Offering, Direct Contact action, and explicitly selected still-available
channel". AC-5 and AC-6 require re-evaluating contact-channel and Direct Contact
eligibility before protected information is revealed.

Three of those four concepts do not exist anywhere in the system:

| Concept | Owning Story | Increment |
|---|---|---|
| Direct Contact and its channels | `US-DEC-F06-001` | I5 |
| Decision flow and Decision Context | `US-DEC-F02-001` | I5 |
| Selected Offering | `US-DEC-F04-001` | I5 |

The schema contains no contact, channel or decision concept, and `modules/decision`
and `modules/discovery` remain one-line stubs. Implementing F09 now would mean
inventing models that Frozen Stories in I5 own, which is exactly the kind of
guess the Story sequence exists to prevent.

**F09 moves to I5**, alongside the Direct Contact capability it returns to. The
session and principal foundations it needs are already in place.

## Deferred with reason

| Item | Reason |
|---|---|
| Outbound email vendor adapter | Deployment decision. The port, outbox and worker are implemented; `LoggingEmailDispatcher` refuses to construct in production so an unconfigured deployment fails loudly. |
| Rate limiting on authenticated write paths | Authentication endpoints are throttled. General request throttling belongs with the infrastructure increment. |
| `TestPrincipalAdapter` | A development affordance that fails closed in production. It is superseded by session authentication and should be removed once no local workflow depends on it. |

## Story governance

All 50 Generated Stories remain `Delivery Status: Not Started`. Implementation
links are recorded in `M11_STORY_LINK_PROPOSAL.md` and extended by this record;
advancing any Delivery Status requires a separate change with Product Owner
review and green CI evidence.

> **Superseded (2026-08-15):** true when this record closed, and no longer.
> I9 advanced 49 Stories to `Done` and `US-OFR-F05-001` to `In Progress`,
> each against per-criterion evidence in `DELIVERY_STATUS_ADVANCEMENT.md`.
> The sentence above is left as it was written, because what a record claimed
> at its close is part of what it records.
