<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-26
-->

# I41 — The published contract, checked against what is served

`generated/openapi.json` is committed, and CI runs `git diff --exit-code`
against it. **That step proves the generator's output matches the committed file
and nothing else.**

The generator is `apps/api/src/openapi/generate-openapi.ts`: **5073 hand-written
lines with no introspection**. So the published description of this API could
have drifted from the API in every direction — an operation served and
undocumented, an operation documented and unserved, either arriving by the
ordinary means of a route changed and a file not edited — and every check in the
repository would have stayed green.

Until now the only assertions on it named **six operations out of eighty-seven**.

## What the comparison found

**The document is in good order.**

| | |
|---|---|
| operations served | 88 |
| documented | 87 |
| served but undocumented | **1** — `GET /api/v1/metrics`, deliberately |
| documented but not served | **0** |

`/metrics` is I19's decision: a Prometheus endpoint is operational surface
rather than product surface, and documenting it would announce it. It is named
as the one exclusion rather than filtered silently, so documenting it later
fails a case and the person has to argue with I19 instead of with a filter.

**A clean result is the point.** This is the state a five-thousand-line
hand-maintained file drifts out of one commit at a time, and nothing was
holding it there.

## How the served set is obtained

`createApiApp` gained an optional `onRoute` observer — the same shape of
concession as `loggerDestination`, for the same reason: **a Fastify instance
cannot be asked what it serves afterwards.** There is no enumerable route table,
and the hook fires forward only.

## Mutation testing corrected a comment I had just written

The first version said the hook must be attached **before `NestFactory.create`**.
Moving it to just after `create` was expected to collect nothing; it collected
all eighty-eight routes.

`create` builds the container; **`app.init()` mounts the controllers**. Moving
the hook after `init` collects nothing. The boundary is `init`, and the comment
now says so — a comment naming the wrong line is how somebody later moves the
hook somewhere that looks equivalent and is not.

The case that noticed was the guard: *"has more than a handful of operations, so
the comparison means something"*, failing with `expected 0 to be greater than
80` while the two comparisons that matter happily compared nothing to nothing.
**It was written against exactly this and earned its place on the first try.**

## A second check that passed for the wrong reason

`scripts/smoke.mjs` has asserted since I35 that `/metrics` answers 404 to an
anonymous caller. **The real path is `/api/v1/metrics`** — the global prefix
applies — so the check was requesting a path the application has never had, and
404 was the answer to a wall rather than to a closed door.

That is the second check in this script to pass for the wrong reason, after the
wordmark in I35.

Measured, and I19's property is real:

```
/metrics                    → 404   (nothing is there at all)
/api/v1/metrics  no token   → 404
/api/v1/metrics  bad token  → 404   (not 401 — 401 would confirm it exists)
/api/v1/metrics  real token → 200
```

The script now asks the right path, and asks the second half too: a wrong token
is refused **the same way** as none. A check that only ever sees 404 cannot tell
a closed door from a wall, which is precisely the mistake it just made.

## What was proven

`tests/i41-published-contract.test.ts`, four cases.

| Mutation | Result |
|---|---|
| An operation is dropped from the document | 1 failed |
| An operation nobody serves is documented | 1 failed |
| `/metrics` is documented after all | 1 failed |
| The observer is never wired, so nothing is collected | 3 failed |
| The hook is attached after `NestFactory.create` | **survived — and the claim was wrong, not the code** |
| The hook is attached after `app.init()` | 3 failed |

## Verification

Run from a **clean tree with every `dist` and `tsbuildinfo` deleted**, in
`verify`'s own order — the practice I40 established after CI caught what the
sandbox could not.

Format, type check, lint, module boundaries, no OpenAPI drift, **108 test files
/ 1015 tests**, 0 vulnerabilities, production build, and **14/14 smoke checks**
against two running processes.

## Known boundaries

- **This compares method and path, not shape.** A response schema that no longer
  matches what the handler returns would pass every case here. Comparing the
  document's schemas against the Zod contracts is a larger increment and the
  obvious next one.
- **Nothing checks the document against the Frozen Stories.** An operation can
  be served, documented, consistent, and still not be the thing a Story asked
  for.
- **`onRoute` is a test-only concession in production code.** It is unset in
  production and costs nothing there, but it is the second such parameter on
  `createApiApp` and a third would be a sign the seam belongs somewhere else.
- **The `/metrics` exclusion is asserted, not justified here.** The reasoning is
  I19's and this increment takes it as given.
