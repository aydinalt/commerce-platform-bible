<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-28
-->

# I47 — A refused connection is the dependency's, not a defect

I23 and I24 built the surfaces that say *the read did not come back* rather than
inventing an answer. I45 and I46 brought the last four modules under the same
rule. Every one of them is reached by an `ApiRequestError`, and only two things
produced one: a `5xx` the API answered, and a timeout this application imposed.

**Nothing listening on the port produced neither.** `fetch` throws a `TypeError`,
`api-error.ts` deliberately let it propagate, and the whole page came down — so
every honest surface in the repository was unreachable in the plainest failure
of the three.

I45's probe measured this as `/offerings/{slug}` answering `500` and left it
undiagnosed for two increments. This is the diagnosis, and it is not where it
looked.

## The page was already right

`apps/web/src/app/offerings/[slug]/page.tsx` has caught `isApiUnavailable` and
rendered `PresentationUnavailable` since I24. **It was never wrong.** One
classification three files away made it unreachable — which is why a repair at
the route would have fixed the symptom that happened to be looked at and left
the other eighteen reads exactly as they were.

## The old reasoning was right and its classification was wrong

> ~~only what is known to be the dependency's is presented as retryable~~

That discipline is what stops an application answering "please try again" to its
own bugs for ever, and it is kept in full. A refused connection simply **is**
known to be the dependency's, and Node says so. Measured:

| | `cause.syscall` | `cause.code` |
|---|---|---|
| connection refused | `connect` | `ECONNREFUSED` |
| DNS failure | `getaddrinfo` | `EAI_AGAIN` |
| unsupported scheme | *absent* | *absent* |
| malformed URL | *absent* | `ERR_INVALID_URL` |

**A system call is the discriminator, not a list of codes.** A list is a budget
somebody spends: the next code nobody enumerated arrives, falls to the crash
screen, and nobody decides. `syscall` says something structural — the request
reached the operating system and the network answered — while every way this
application can construct a request wrongly fails before that point.

The struck-through sentence stays in `api-error.ts` rather than being deleted,
with the correction beside it. Two paragraphs above it, that same file already
argued that *"the API did not answer in time" and "the API is not there" are one
situation* to the person — and then treated the second as a crash.

## What the visitor actually saw, measured

With nothing on the port, `/offerings/any-offering` answered:

- status **`500`**
- 7188 bytes of HTML whose **visible text was `İlan`** — the page title, alone
- and the crash screen's own heading was **not in the document**

So `error.tsx` produced nothing server-side; it is a client boundary, and a
server render that throws sends a shell. A visitor without JavaScript, or before
hydration, met a blank page.

After: **`200`, 9321 bytes, saying what is true.**

## A mutation survived, and it was mine

The case asserting that a timeout keeps its `504` claimed the abort check must
run *before* the transport check or a timeout would be reclassified. A mutation
swapping the two **passed**.

Measured: an aborted `fetch` throws an `AbortError`, and an `AbortError` is not
a `TypeError`. The two classifications are disjoint, the ordering is genuinely
incidental, and **the comment was asserting a property that does not exist**.
Worse, the stub rejected with a `TypeError` — a shape `fetch` never produces on
abort — so the case had been passing against a fabrication.

Both are corrected, and the disjointness is now asserted directly rather than
described.

## What was proven

`tests/i47-transport-failure.integration.test.ts`, five cases, and **three new
smoke checks against a second web instance pointed at a closed port**.

| Mutation | Result |
|---|---|
| The transport failure is left to propagate again | 2 failed, **and smoke 15/17** |
| Any `TypeError` counts — the overshoot | 1 failed |
| A read leaves the budget | 1 failed |
| The abort check runs after the transport check | **survived — see above** |

The smoke row is the one that matters. `app.inject()` has no socket and
`renderToStaticMarkup` has no status code, so this defect is invisible from
inside the suite — which is how I45 found it with a script and could not have
found it with a test.

## Verification

Run from a clean tree with every `dist` and `tsbuildinfo` deleted, in `verify`'s
own order: no OpenAPI drift, format, type check, lint, module boundaries,
**114 test files / 1047 tests**, 0 vulnerabilities, production build,
**17/17 smoke checks**.

The suite ran in four parts for the reason I46 recorded: the sandbox's time
limit, in file order, against one database and without resetting between
parts.

## Known boundaries

- **`https` against a plain-http port also reports `ECONNREFUSED`.** A wrong
  scheme in `API_BASE_URL` is therefore presented as an outage. Measured, and
  not fixable here: at the socket level it is indistinguishable from the API
  genuinely being down, because the operating system gives the same answer.
- **Reads only.** The writes still let a transport failure propagate, which is
  I25's decision: aborting or losing a write does not undo it, and nothing here
  changes what may be claimed about an outcome.
- **The status code is still `200`** on the surface that now renders. Unchanged
  since I45 named it, and still a design decision rather than an edit.
- **`error.tsx` produces nothing server-side.** Made unreachable for outages
  here, and still exactly what a genuine defect produces — a blank page with a
  title for anybody without JavaScript.
- **Nothing measured how often a refused connection happens** against a real
  deployment, because there is no deployment.
