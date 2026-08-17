# I13 Vendor Selection — Closure Record

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft — awaiting Owner acceptance
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-17
- **Scope:** Implementation record only. No Frozen Story is edited, no Acceptance
  Criterion changes, and no Delivery Status moves.

## The two decisions

The Owner selected **Postmark** for outbound email and **Anthropic** for the
Decision Chat assistant on 2026-08-17. Those were the last two items on the
roadmap that no amount of implementation could close.

Both adapters are what I11 and I12 said they would be: four values and three
values respectively, plus one judgement each.

## What each adapter actually contains

| | Postmark | Anthropic |
|---|---|---|
| Endpoint | `POST https://api.postmarkapp.com/email` | `POST https://api.anthropic.com/v1/messages` |
| Credential | `X-Postmark-Server-Token` | `x-api-key` with `anthropic-version: 2023-06-01` |
| Body | `From`, `To`, `Subject`, `TextBody`, `MessageStream: outbound` | `model`, `max_tokens`, one `user` message |
| The judgement | which `ErrorCode` values are permanent | what counts as an answer |

Nothing else moved. The timeout, the secret handling, the prompt composition,
the outbox's ceiling, the two ways of not answering and what a person is told
were all written and tested before either vendor had a name — which was the
point of doing it in that order.

## The judgement in the email adapter

`REFUSED` stops the outbox permanently, so the line has to mean *asking again
gets the same answer about this recipient*. Two Postmark codes qualify:

- **`406`** — the recipient is inactive: a hard bounce, a spam complaint or a
  manual suppression. Postmark will refuse the address until somebody
  reactivates it, and every retry is the platform mailing itself.
- **`300`** — the request is invalid, which for a message this simple means a
  malformed address. A retry sends the same malformed address.

**Everything else retries, including things that look permanent.** An
unconfirmed sender signature, a rejected token, an account pending approval:
each is permanent until an operator acts, but permanent about the *deployment*
rather than the message. Fix the signature and the queued registrations should
still go out. Dead-lettering them instantly would turn a five-minute
configuration mistake into lost registrations, so the attempt ceiling handles
them — eight tries, then the row stops, which is the outcome I11 built.

A body that is not JSON is an outage rather than a refusal. A gateway error
page or a captive portal is not Postmark declining this recipient, and reading
it as one would dead-letter a message because somebody's network misbehaved.

## The judgement in the assistant adapter

A refusal could be recognised from `stop_reason`, and deliberately is not. That
vocabulary belongs to the vendor and can gain members, so code matching a list
would read an unfamiliar refusal as an answer and hand it to a person.

**The text is the thing being asked for**, so the question the adapter asks is
whether there is any. An answer with no text is not an answer, whatever it is
called, and the `stop_reason` is carried into the reason so a log still says
which kind it was without the code having to know the list in advance.

Text blocks are joined and non-text blocks ignored, so a future block type
cannot turn a good answer into an empty one.

## A configuration rename

`EMAIL_TRANSPORT` and `CHAT_TRANSPORT` accepted `http` while no vendor existed.
That named the transport rather than the thing being chosen, and would have made
a second provider unnameable. They now accept `postmark` and `anthropic`.

The two tests asserting that an unknown transport fails with the name it was
given used `postmark` and `anthropic` as their examples of names nobody had
written. They now use `sendgrid` and `openai`, because the point of those tests
is a name nobody wrote and it has to keep being one.

## The tests

`i13-vendor-providers.test.ts` — eleven tests, no database, **no vendor
contacted**. `read` is a pure function of a status and a body, which is the
property that makes a vendor adapter testable without an account.

Verified to fail against the behaviour they replaced: making every non-zero
Postmark code permanent failed *asks again about anything wrong with the
deployment* and nothing else; removing the empty-text check failed *treats an
answer with no text as a refusal* and nothing else.

**One assertion in this file was worthless and was caught by that check.** The
refusal-reason test used `toMatchObject` with a regular expression against a
discriminated union, and it passed against a pattern that could never match — an
assertion asserting nothing. It is now a narrowing check and a `toContain`, and
was re-verified to fail against a wrong expectation.

## Known boundaries

- **Neither vendor has been contacted.** Every test drives a status and a body
  the test wrote. The first real send and the first real question will still be
  the first of each, and the things that only appear then — a sender signature
  that is not confirmed, a model name that does not exist, a regional
  restriction — will appear then.
- `MAX_TOKENS` is 1024. Decision Chat answers a question about Offerings from a
  brief that holds their values and nothing else, and a ceiling keeps a runaway
  answer from becoming a wall of text in a surface meant for comparing two cars.
  It is a judgement, not a requirement any document states.
- No bounce or complaint webhook. Postmark will suppress an address after a hard
  bounce and `406` will then stop the outbox for it, so the platform learns the
  same fact one message later without a second inbound integration. Whether that
  latency is acceptable is an operations decision with no Frozen owner.
- The `anthropic-version` header is pinned to `2023-06-01`, the version
  Anthropic's documentation names. Pinned rather than tracked deliberately: an
  API version that changes under a running deployment is a change nobody
  reviewed.

## Story governance

No Story's behaviour, Acceptance Criteria or Delivery Status changed. All 50
Generated Stories remain `Done`.

`US-DEC-F03-001` AC-6 is unaffected in either direction. The prohibition on a
ranking, a winner and a recommendation is stated in the prompt and enforced
after the answer by `inventsValue`, and neither belongs to the vendor.
