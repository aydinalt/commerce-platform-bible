# I11 Email Transport — Closure Record

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft — awaiting Owner acceptance
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-15
- **Scope:** Implementation record only. No Frozen Story is edited, no Acceptance Criterion changes, and no Delivery Status moves. **No vendor is chosen.**

## What this increment delivered

The outbound email port has existed since I1 with one adapter that records a
message instead of sending it. `CURRENT_STATUS.md` has said since then that
selecting a vendor "is the only thing blocking a deployable registration flow".

**That was not quite true.** Choosing a vendor was one of four things missing,
and it was the only one that needed an Owner. This increment writes the other
three, so that fitting a provider is filling in four small values rather than
building a delivery path.

## What a provider actually differs by

Postmark, SES, Resend, SendGrid and Mailgun are the same shape: an HTTP request
carrying a credential and a JSON body, answered by a status code. They differ in
exactly four places, and `EmailProvider` is those four:

| | |
|---|---|
| `name` | For logs and configuration. Never a credential |
| `request(message)` | Where it goes, how the credential is presented, what the body's fields are called |
| `read(status, body)` | How an answer is read |

Everything else was written here and is tested here.

**`read` takes the body as well as the status deliberately.** Providers disagree
about where the verdict lives: some answer `422` for a suppressed address,
others answer `200` with an error object inside. An adapter reading only the
status would call the second one delivered, and the person would wait for an
email that was refused.

## The three things that were missing

### A delivery could hang the worker

`processBatch` awaits `deliver`. Nothing bounded that wait, so a provider that
accepted a connection and then said nothing would stop every message behind it —
not by failing, which the outbox handles, but by never answering, which it
cannot detect. The visibility timeout would eventually let another worker claim
the event, so the shape of the failure was a silently stalled process and a
growing queue.

`HttpEmailDispatcher` bounds every attempt with an `AbortController`. A
timeout, a refused connection and a DNS failure are one answer: not now, ask
again.

### Everything was retried forever

`recordFailure` grew `attempts` and backed off, capped at thirty seconds times
six. Nothing read `attempts` as a limit, so **an address the provider will never
accept came back every three minutes for the life of the deployment** — the
platform sending itself the same refused message indefinitely, while the person
waiting was no closer either way.

The outcome is now three answers rather than two. `ACCEPTED` is done;
`UNAVAILABLE` is retried; `REFUSED` stops. A refusal sets `attempts` to the
ceiling, and the claim excludes rows that have reached it.

**A dead letter is therefore a row that stopped, not a new lifecycle state.**
No column and no status were added: the table already counted attempts, and
"unprocessed, at the ceiling" is exactly the thing being described. One rule
stops both kinds of dead letter, so there is one place to get it wrong instead
of two.

### The vendor was a code decision

The port's own comment said the vendor is "a deployment decision rather than a
code decision", and `main.ts` named `LoggingEmailDispatcher` in a source file.
Fitting a provider meant editing and redeploying the worker.

`loadEmailConfig` reads `EMAIL_TRANSPORT`, `EMAIL_API_KEY`, `EMAIL_SENDER` and
`EMAIL_TIMEOUT_MS`, and validates at boot. A production deployment that asks for
real delivery without a credential or a sender **fails to start**. That is
deliberate: the alternative is a worker that starts, looks healthy, and turns
every registration into a retry nobody is watching.

An unknown transport name fails with the name it was given, rather than falling
back to something that delivers nothing.

## What is not logged, and why

Not the request headers — they carry the credential. Not the request body or the
message — it carries the single-use registration or recovery token, and a log is
exactly the durable place the token is minted to avoid.

Not the recipient. Knowing which provider answered how does not require knowing
whose message it was, and the existing development adapter logs it only because
it refuses to run outside development.

**Not the provider's response body**, which is the most tempting field on that
page and the least safe: providers echo the request back inside error payloads,
so the one string most likely to contain the token is the one explaining why the
token was not delivered.

## Deliberately not done

| | |
|---|---|
| Choosing a provider | The Owner's decision, and the only remaining one |
| A provider adapter | Four values, once a name exists. `buildDispatcher` in `main.ts` is where it is constructed, and it throws until then |
| Alerting on dead letters | The rows are queryable and Basic Analytics does not count them. Whether an operator is paged is an operations decision with no Frozen owner |
| Bounce and complaint webhooks | Inbound provider callbacks are a second integration with its own surface, and no Story asks for one |

## The tests

`i11-email-transport.test.ts` — eight tests, no database, no provider.
`i11-outbox-dead-letter.integration.test.ts` — four tests against a real queue.

**Each was verified to fail against the behaviour it replaced.** Reverting the
outbox to retry everything failed the two tests asserting the new rule and left
the two asserting unchanged behaviour passing. Widening the timeout to nearly
forever hung the timeout test until vitest killed it. Adding the response body
to the log line failed the secret test and nothing else.

## Known boundaries

- **No provider has been exercised.** Every test drives a stub, so this proves
  the transport and not any vendor's API. The first real send will still be the
  first real send.
- `MAX_DELIVERY_ATTEMPTS` is eight, roughly fifteen minutes under the existing
  backoff. Long enough to outlast an ordinary provider incident, short enough
  that a permanent problem stops being load. It is a judgement, not a
  requirement any document states.
- A dead letter is visible only by querying `outbox_event`. Nothing surfaces it
  in the Admin Panel, and `US-PLT-F10-001` AC-18 forbids inventing an indicator
  there without a governed source.
- The development adapter still refuses to construct in production, and
  `loadEmailConfig` now refuses the same configuration a step earlier. Two
  refusals for one mistake is deliberate: the configuration one names the
  setting, which is what an operator can act on.

## Story governance

No Story's behaviour, Acceptance Criteria or Delivery Status changed. The 49
`Done` and 1 `In Progress` recorded in `DELIVERY_STATUS_ADVANCEMENT.md` stand
unaltered.

`US-IDN-F02-001` AC-2 — registration stays incomplete until control of the
address is proven — is unaffected in either direction: a refused or undelivered
message leaves the registration incomplete, which is what that criterion already
requires and what `m12-registration-delivery` already tests.
