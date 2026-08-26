<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-26
-->

# I39 — The throttling key

## A claim of mine that was false

Earlier in this session I surveyed what stood between the repository and a
public deployment, and reported:

> There is no rate limiting anywhere in the repository. Registration, login and
> recovery are unthrottled.

**That was wrong.** `auth_throttle` has counted attempts per hashed subject
since I13, across registration, recovery and both sign-in scopes, in a single
atomic `insert … on conflict … returning (attempts > $4) as blocked` — so the
count is shared by every instance and survives a restart. The controller already
answers `RATE_LIMITED`.

The survey was wrong because it searched for **the names of libraries**
(`rate-limit`, `helmet`, `Content-Security-Policy`) rather than for the
behaviour. A grep for a vendor is a test of which vendors are installed, and
this repository deliberately writes such things itself.

The claim is struck through rather than deleted in
`docs/implementation/DEPLOYING_TO_VERCEL.md`, and a case asserts it stays
struck.

## What was actually broken

`identity.controller.ts`:

```ts
/** The caller's address, used only as a throttling key and never stored raw. */
function subjectOf(request: FastifyRequest): string {
  return request.ip;
}
```

Fastify populates `request.ip` from `x-forwarded-for` **only when told to**, and
it had not been told. Measured against a forged
`x-forwarded-for: 9.9.9.9, 8.8.8.8`:

| `trustProxy` | `request.ip` | what that means in production |
|---|---|---|
| unset — *today* | `127.0.0.1` | the **proxy's** address for every caller. The whole platform shares one counter, and the first few dozen attempts globally lock everybody out |
| `true` | `9.9.9.9` | the value the **caller** wrote. Rotate the header and the throttle never fires |
| `1` | `8.8.8.8` | the entry the trusted proxy appended, which a caller cannot forge past |

**Both simple answers are wrong, in opposite directions**, and neither shows up
in a test that does not look for it: one throttles everybody, the other
throttles nobody, and both answer `200` to the request in front of you.

## The number is declared, not detected

`TRUSTED_PROXY_HOPS`, default `0`.

Nothing in a request distinguishes an entry a proxy appended from one a caller
sent — that is the entire problem — so the hop count cannot be inferred. Same
shape as `DATABASE_CONNECTION_MODE` in I36: a property of the deployment that
the code is not in a position to know.

The default fails in the safe direction. A deployment that forgets it throttles
all its callers together: visibly broken, and broken towards refusing. The other
default lets anybody past by writing a header, and nothing looks wrong at all.

### Too high is as bad as trust-all

**A case here was written to assert the opposite of what is true.** It claimed
the leftmost entry is never taken at any hop count. The measurement said no:
when the chain is shorter than the number declared, the resolver runs out of
trusted entries and returns the leftmost one — the value the caller writes.

```
hops = 1 against "9.9.9.9, 8.8.8.8"  →  8.8.8.8   (the proxy's entry)
hops = 3 against "9.9.9.9, 8.8.8.8"  →  9.9.9.9   (the caller's)
```

So this is not a setting with a safe margin. Declaring `3` behind one proxy is
the same failure as trusting the whole chain, which is why `.env.example` says
to **verify the number against a real request** rather than pick something that
sounds generous.

## Two checks that matched themselves

**Governance says a false claim is struck through rather than deleted**, so the
words survive on purpose — and the case asserting the claim was gone matched its
own correction. Struck-through spans are now removed before searching, exactly
as source checks strip comments. Fifth time in this repository.

**A second case matched `TRUSTED_PROXY_HOPS_X`** and called the variable
documented. The same substring collision I29 found. It now matches the
assignment.

## What was proven

`tests/i39-throttling-key.test.ts`, twelve cases. Four drive a real Fastify
instance over a real socket, because `request.ip` is derived from the socket and
the headers together and an injected request has only half of that.

| Mutation | Result |
|---|---|
| `trustProxy` is set to `true` | 1 failed |
| An unreadable value trusts one hop instead of none | 2 failed |
| A negative count is accepted | 1 failed |
| The adapter stops being told | 1 failed |
| The controller stops keying on `request.ip` | 1 failed |
| The false claim is restored as an assertion | 1 failed |
| The setting is renamed | 1 failed |
| The explanation is dropped from `.env.example` | 1 failed |

## Verification

Format, lint, module boundaries, type check, **106 test files / 1000 tests**, no
OpenAPI drift, 0 vulnerabilities, production build.

## Known boundaries

- **The correct hop count for Vercel is documented as `1` and has not been
  measured against a Vercel request.** It is what one proxy implies; whether
  Vercel adds exactly one entry is the first thing to check on deployment.
- **Nothing observes the throttle.** `RATE_LIMITED` is returned and counted
  nowhere, so a deployment locking itself out through a wrong hop count would
  look like silence rather than like an alarm.
- **The limits and windows were not revisited.** They are I13's numbers, chosen
  before there was a deployment to size them against.
- **`trustProxy` also governs `request.protocol` and `request.hostname`.**
  Nothing in the platform makes a security decision from either — the cookie's
  `secure` flag and `ALLOWED_ORIGINS` are configured rather than sniffed — which
  is what makes turning it on safe, and is a property worth re-checking if
  either ever starts being read.
- **The throttle is per address only.** An attacker with many addresses is not
  slowed by it, and that is a deliberate trade: a per-account limit turns into a
  way to lock a named person out of their own account.
