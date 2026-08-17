# I12 Decision Chat Transport — Closure Record

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft — awaiting Owner acceptance
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-17
- **Scope:** Implementation record only. No Frozen Story is edited, no Acceptance
  Criterion changes, and no Delivery Status moves. **No vendor is chosen.**

## What this increment delivered

Decision Chat has had a port and an adapter that restates the brief since I5,
and the same sentence has stood over it since: choosing an assistant vendor is
the last thing missing.

It was the same four things it turned out to be for email, plus one that email
did not have. This increment writes the four and fixes the one.

## The four, which mirror I11

| | |
|---|---|
| The prompt | Composed in `@commerce/decision` from the brief, so AC-4 is enforced by the shape of the function rather than by a vendor honouring it |
| The wait | Bounded by an `AbortController`, because a person is watching this one |
| The secrets | Nothing logged but the outcome, the vendor's name and the status |
| The vendor | `loadChatConfig` reads it from the environment and validates at boot |

`ChatProvider` is three things — a name, the request that carries a prompt, and
how an answer is read — and `read` takes the body as well as the status for the
reason it did for email: vendors disagree about where a refusal lives. Some
answer `400` for a filtered prompt, others answer `200` with the refusal inside,
and a transport reading only the status would hand a person the refusal text as
though it were the answer to their question.

**The instruction is in the prompt rather than in a vendor's console.** AC-6
forbids a ranking, a winner and a recommendation, and a rule kept in somebody's
dashboard is a rule that no review ever sees and no test can reach.

## The one email did not have

`ChatService.ask` ran the whole act inside a single database transaction: read
the brief, ask the vendor, check the answer, record the turn.

That held one of the connection pool's ten connections open across a call to
somebody else's service. Ten people asking a slow assistant at once would have
stopped every other request in the process — including every request that never
goes near Chat — and a vendor that answered slowly rather than failing would
have presented as a database outage.

It is now three steps: a transaction that reads, the vendor call outside any
transaction, and a transaction that records. Nothing is lost. The brief is a
read and the turn is an append, and neither needed to be atomic with a network
call. A flow that expires in between makes the third step fail, and the person
is told the flow is gone — which is what happened.

## Two ways of not answering, kept apart

`AssistantInventedValueError` is the platform refusing a reply it did receive.
`AssistantUnavailableError` is the assistant not answering at all. The person
sees a different sentence for each, and only one of them invites trying again;
in a log they are the difference between a vendor outage and a safety refusal,
which is exactly the pair an operator must not have to guess between.

Neither records a turn. The invention check sits between the two transactions
rather than after the write, so a refused reply leaves nothing behind in a
conversation the person can read back.

## What is not logged, and why

Not the headers — they carry the credential. Not the prompt: it carries the
Offerings the person is deciding between and the priorities they stated in their
own words, which together are a fairly complete account of what somebody is
shopping for.

Not the question and not the reply. The conversation is held for the life of the
flow and swept when it expires, and a log line is precisely the durable copy
that sweep exists to prevent.

Not the vendor's response body, for the reason it was kept out of the email log:
vendors echo the request inside error payloads, so the string most likely to
contain the conversation is the one explaining why the conversation failed.

## Deliberately not done

| | |
|---|---|
| Choosing a vendor | The Owner's decision, and the only remaining one |
| A vendor adapter | Three values, once a name exists. `buildAssistant` in `app.module.ts` is where it is constructed, and it throws with the name it was given until then |
| Streaming a reply | A different transport shape with its own failure modes, and no Story asks for one |
| Retrying a failed question | Nothing retries a person. They are told it did not work, which is true and is theirs to act on |
| Rate limiting Chat per flow | Worth having and not this increment's; no Story governs a limit, and inventing one here would be a product rule in a transport change |

> **Superseded (2026-08-17):** the Owner chose Anthropic; the adapter is written
> and `buildAssistant` constructs it. The accepted transport value was `http`
> and is now `anthropic`. See `I13_VENDOR_SELECTION_CLOSURE.md`.

## The tests

`i12-chat-transport.test.ts` — eight tests, no database, no vendor.
`i12-chat-connection.integration.test.ts` — three tests against a real pool.

**Each was verified to fail against the behaviour it replaced.** Putting the act
back inside one transaction failed *holds no transaction open while the vendor is
thinking* and left the other two passing. Widening the timeout to nearly forever
hung the timeout test until vitest killed it at twenty seconds. Adding the prompt
and the response body to the log line failed the secret test and nothing else.

The connection test asserts from **inside** the vendor call, by asking a separate
connection how many are `idle in transaction` at that moment. That is the only
instant at which the difference exists.

## Known boundaries

- **No vendor has been exercised.** Every test drives a stub. The first real
  question will still be the first real question.
- **The `ASSISTANT_UNAVAILABLE` response is not exercised end to end.** The
  application composes its assistant at boot from configuration, and the suite
  has no way to substitute one over HTTP without adding a testing container to
  the dependency tree. The mapping is one branch in `DecisionChatController`,
  read rather than executed, and this is recorded rather than glossed.
- The invention check remains what it always was: it catches invented *numbers*,
  which is the dangerous case, and cannot catch an invented sentence.
- `CHAT_TIMEOUT_MS` defaults to eight seconds, below email's ten. An undelivered
  message waits in a queue nobody is watching; an unanswered question has
  somebody sitting in front of it. It is a judgement, not a requirement any
  document states.

## Story governance

No Story's behaviour, Acceptance Criteria or Delivery Status changed. All 50
Generated Stories remain `Done`.

`US-DEC-F03-001` AC-4 and AC-6 are strengthened rather than reinterpreted: the
prompt is now composed in one place that can produce nothing the brief did not
contain, and the two prohibitions are stated in the text the vendor receives as
well as enforced after it answers.
