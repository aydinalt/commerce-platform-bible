<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-27
-->

# I44 — What the API answers, checked against what it publishes

I41 proved the document names every operation served. I42 proved the schemas
carry the right property names. I43 proved they carry the right types. All three
read **two files and compared them with each other**, and I43 wrote down what
none of them could see:

> Nothing here reaches the handlers. Contract and document agree on names and
> types; whether a handler returns what the contract says is proven only where a
> test already asserts a response body.

This drives the API. Every documented operation is called for real, and the
response is checked against the description it publishes.

**It found two things, and neither was visible from either file.**

## The map is derived, not written

All **379 declared responses point at a schema by `$ref`, and none is inlined**,
so the document itself already says which schema each operation returns for each
status. I43's naming rule turns that name into a Zod contract, and all 39 named
schemas pair.

So there is no table here. A hand-written map from operation to contract would
have been the fourth hand-maintained artefact in a repository that has now found
drift in three of them, and it would have been wrong in the same quiet way.

## What it found

### The Direct Contact reveal answers a status it never declared

`POST /api/v1/decision/flows/{decisionFlowId}/direct-contact` declared
`200 400 401 404 422`. Driven, it answers **`403 ORIGIN_MISSING`**.

It is correct to do so: `reveal` calls `OriginValidator` before anything else,
because a reveal carries a session and ADR-0012 §2 refuses a cookie-authenticated
mutation that does not declare an acceptable origin. It is the **only** Decision
operation that carries a session, which is why it is the only one that should
declare `403` — and the only one that did not.

### `503` was declared on one operation out of eighty-seven

`ErrorEnvelopeFilter` is registered as an `APP_FILTER`. Answering
`503 DEPENDENCY_UNAVAILABLE` is therefore not a property of any one operation —
it is a property of **every** operation that reaches the database. The document
declared it for `GET /api/v1/health/ready` and nowhere else, so a client
generated from the published description had **no `503` branch anywhere but
readiness**, and would meet a database outage as an unrecognised response.

Driven with no database reachable at all, thirteen operations answered `503`,
and thirteen is only what an anonymous caller can reach.

It is now added in one pass over the finished document rather than written into
eighty-six operation literals. Writing it per operation would make a
platform-wide response look like eighty-six independent decisions, and lose it
again the ordinary way: an eighty-eighth operation added, and one more literal
not edited.

**The single exception is measured, not assumed.** Driven with nothing behind
it, `GET /api/v1/health/live` answered `200` and `GET /api/v1/health/ready`
answered `503`. Liveness is the one operation that still answers when nothing
behind it can — that is the whole reason it is separate from readiness — so
declaring `503` for it would be a promise the API does not make. Declaring an
unreachable response is the same error as I41's "documents nothing the API does
not serve", pointed the other way.

## What was already right

**73 response bodies validated against their contracts with nothing to repair.**
The refusal envelope the API actually produces — code, correlation identifier,
message, field errors — satisfies the contract the document names for it, on
every operation an anonymous caller can reach.

## What was proven

`tests/i44-served-contract.test.ts`, five cases, run **both with and without a
database reachable** so the result does not depend on which of the two the
runner happens to be.

| Mutation | Result |
|---|---|
| The `403` is dropped from the reveal again | 2 failed |
| The platform-wide `503` pass is removed | 3 failed |
| Liveness declares a `503` it never answers | 1 failed |
| The envelope stops carrying its correlation identifier | 3 failed |
| The naming rule pairs no schema with a contract | 1 failed |

The last is the guard, for the fourth increment running, against the failure
this repository keeps meeting: a comparison that passes because it compared
nothing.

## Verification

Run from a clean tree with every `dist` and `tsbuildinfo` deleted, in `verify`'s
own order.

## Known boundaries

- **The refusal surface, not the success surface.** An anonymous caller with an
  empty body reaches `400`, `401`, `403`, `404` and `503`. The `200` and `201`
  bodies of eighty-odd operations are proven only where an existing integration
  test asserts them, which is most of them but not by this check.
- **One request per operation.** An operation that answers a status only under
  conditions this does not create still goes unchecked for that status — the
  `403` found here was found because a bare request happens to produce it.
- **Path parameters are addressable but absent.** Every `{id}` is a valid UUID
  that matches nothing, so what is exercised is the refusal path rather than the
  resolution path.
- **`503` is now declared everywhere it can occur, which is not the same as
  proving every operation can produce it.** The claim rests on the filter being
  global; thirteen were measured, and the rest are declared because the
  mechanism does not distinguish them.
- **Nothing here reads the Frozen Stories.** The document and the API now agree
  on operations, shapes, types and answers; whether that agreed contract is the
  one the product was specified to have is a different question and remains
  unasked by any automated check.
