# I16 Test Principal Removal — Closure Record

- **Owner:** Architecture Owner
- **Status:** Draft — awaiting Owner acceptance
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-18
- **Scope:** Implementation record only. No Frozen Story is edited, no Acceptance
  Criterion changes, and no Delivery Status moves.

## What was removed

`TestPrincipalAdapter` built a `Principal` out of three request headers —
`x-test-user-id`, `x-test-session-id`, `x-correlation-id` — and
`PrincipalResolver.resolve` fell back to it whenever no session cookie was
presented. It existed for an honest reason: M11 had an authenticated HTTP
surface and identity was still two increments away, so there was no way for a
request to be anybody.

It refused to construct when `NODE_ENV` was `production`, which is why it was
never a way in. But it was a second code path to the most consequential answer
the edge gives, kept alive by exactly one test file.

`I1_IDENTITY_BASELINE_CLOSURE.md` recorded in I1 that it should go "once no
local workflow depends on it". Fifteen increments later one still did.

Deleted: the class, the fallback branch in `PrincipalResolver.resolve`, the
`ENABLE_TEST_PRINCIPAL` environment variable and its `.env.example` entry, and
the 64 test files that set it defensively to `"false"`.

## The suite that depended on it

`tests/m11-http.integration.test.ts` — eleven cases, the only ones in the
repository that go over the wire rather than calling a service. It now registers
an account, processes the outbox, follows the emailed confirmation link and
keeps the `commerce_session` cookie, which is the pattern
`i2-business-creation.integration.test.ts` already established.

Ten cases changed only in how they authenticate. One needed rereading:

**"refuses a malformed principal instead of failing inside the driver."** The
untrusted identifier used to be the three headers; it is the session token now.
The case presents `"'; drop table x; --"`, `"not-a-token"` and `""` as the
cookie value and requires `401` in the published envelope each time.

That case is not vacuous — mutating the resolver to admit an unresolvable
session as a principal fails it and nothing else. But it no longer fails for the
*driver* reason its name gives: the token is hashed by `digest()` before it
reaches SQL, so a malformed value structurally cannot arrive at a column. The
protection moved from a check to an arrangement, which is better, and the name
is now a historical description rather than a live claim. Recorded rather than
quietly renamed.

## Two adapter tests were deleted, not moved

`m11-contracts.test.ts` asserted that the adapter refused to construct under
`NODE_ENV=production` and refused a malformed identifier. Both described a thing
that no longer exists, so there was nowhere to move them to. A comment stands
where they were, saying what they protected and where that protection lives now.

The suite drops from four cases to two; the repository total goes from 802 to
**800 across 85 files**, all passing.

## The bypass the adapter left behind

`Principal.businessId` was optional, and every caller read the absent case as
*skip the Business context check*:

```ts
if (principal.businessId === undefined) return true;
```

That existed because the header adapter had no session to hold a selection. It
was not a missing value — it was an authorization bypass, one forgotten property
away from any new caller, sitting in the type as a legitimate state.

The field is now required (`string | null`). `null` is the authenticated User
baseline and is refused like any other Business, per `US-IDN-F07-001` AC-3.
`actsFor` reduces to one comparison and the five `!== undefined` guards in
`correction.service.ts`, `affiliate.service.ts` and `offering-content.service.ts`
now read as what they always meant.

`m11-authorization.integration.test.ts` was the only place constructing a
`Principal` by hand, and every one of its nine cases was reaching its own denial
through that hole. Each now selects the Business it acts in, so it is refused for
the reason its name gives rather than for a missing context.

## Mutation checks

| Mutation | Result |
|---|---|
| `actsFor` returns `true` unconditionally | `i2-offering-creation` "requires the Business context to be selected" fails; nothing else |
| Resolver admits an unresolvable session as a principal | `m11-http` "refuses a malformed principal" fails; nothing else |
| The early `token === undefined` guard removed | **Nothing fails** |

The third is worth stating plainly. That guard is not load-bearing: an empty
token resolves to no session and produces the same `401` a paragraph later. It
is kept because it avoids a pointless query and says what it means, not because
a test holds it.

`m11-authorization` also survives the first mutation, and should — its nine
cases are about ownership, suspension and moderation, and every one of them now
has the context it needs. The context question is asked in three other files.

## Verification

`format:check`, `lint`, `boundaries`, `typecheck`, `openapi:generate` (no drift),
`test` (800 passing, 85 files), `security:audit` (0 vulnerabilities) and `build`
all pass. `db:validate`, `db:deploy` and `db:drift` cannot run in the local
environment — the Prisma engine host answers 403 there — and are proven in target
CI only, as every increment before this one has been.

## Story governance

No Story's behaviour, Acceptance Criteria or Delivery Status changed. All 50
Generated Stories remain `Done`. This increment removes a code path that no
criterion described and tightens a type that no criterion required to be loose.

## Known boundaries

- The header adapter's production refusal was itself never exercised in
  production. It is deleted on the strength of it having no remaining caller,
  not on evidence that it was ever reached.
- `m11-http` now depends on registration, the outbox and email confirmation to
  obtain a session. A failure in any of those makes eleven HTTP-surface cases
  fail for a reason that has nothing to do with the HTTP surface. That is the
  price of not having a second way to mint a principal, and it is the right
  price.
