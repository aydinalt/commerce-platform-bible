# I5 Compare and Decision Completion — Closure Record

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft — awaiting Owner acceptance
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-11
- **Scope:** Implementation record only. No Frozen Story is edited and no Delivery Status changes.

## What this increment delivered

The end of the journey. I4 let a person find one Offering and read it; I5 lets
them weigh several, ask about them, choose one, and act — either out to an
affiliate destination or by being shown a Business's contact channel.

It is also the first increment that touches the world outside the platform, and
the first that speaks. Both are bounded hard: the affiliate address is made
active with nothing attached to it, and the assistant is told only what the
Decision Context contains.

Seven Stories across seven commits and six migrations, ending on 466 tests.

## Per-Story coverage

| Story | State | Notes |
|---|---|---|
| `US-DEC-F01-001` Comparison Set and Compare | Covered | All 12 AC. The two-to-five bound, the shared leaf and eligibility are database rules; only the floor of two is read at open time, because a set passes through one member on its way to two |
| `US-DEC-F02-001` Decision Context | Covered | All 9 AC. "Exactly one of" is a CHECK, and the request body is a union — a context holding two things cannot be expressed, let alone stored |
| `US-DEC-F03-001` Decision Chat | Covered | All 10 AC. The assistant is a port with no vendor; AC-6 is additionally enforced by a check that does not depend on the adapter — see below |
| `US-DEC-F04-001` Explicit Offering Selection | Covered | All 9 AC. Selection is restricted to the context by trigger, and cleared by trigger when the selected member leaves the set |
| `US-DEC-F05-001` Affiliate Handoff | Covered | All 10 AC. Both eligibility results are read in one query and neither is recalculated; a refusal records nothing, so Completion sees none |
| `US-DEC-F06-001` Direct Contact | Covered | All 12 AC. The only authenticated Decision path. A Guest is told a channel exists and never what it is |
| `US-DEC-F07-001` Decision Completion | Covered | All 10 AC. Derived from the evidence F05 and F06 already recorded; nothing is written to produce it |

## Product decisions taken during delivery

| Decision | Reasoning |
|---|---|
| Decision Chat is a port with a development adapter and no vendor | The Owner's decision. It is the same shape outbound email takes: the adapter refuses to construct in production, so a deployment without a real one fails loudly rather than answering people with a stub. The hard part of the Story — never inventing a value — is built independently of whatever vendor arrives |
| A reply stating a figure the brief did not contain is withheld | AC-6 cannot rest on a vendor honouring its instructions. The check is deliberately narrow and worth being honest about: it catches an invented *number* — a mileage, a capacity, a year nobody published — and cannot catch an invented sentence |
| Current-flow state lives in expiring server rows, with only an opaque identifier in the browser | The Owner's decision. A chat transcript does not fit in a cookie, and "no saved history" is stronger as an expiry the database enforces than as a promise about the browser |
| The Comparison Set, the Decision flow and the conversation expire together | A flow that outlived its set would be a context about nothing, and a transcript that outlived its flow would be exactly the saved Chat history AC-9 forbids. The foreign keys cascade in that direction on purpose |
| Every evidence row outlives the flow that produced it | Compare Start, Decision Chat Start, the Affiliate Handoff initiation and the Direct Contact reveal are facts about the past. A Completion that vanished when its flow lapsed would be a Completion nobody could count |
| The Direct Contact reveal records the channel, never the value | No criterion asks for the number, and writing it down would create a second place a Business's protected information could leak from |
| Completion is derived rather than declared | AC-3 forbids asking for another confirmation, so the initiation and the reveal *are* the Completions. There is no completion table — which is also how AC-9's "no personal Decision history" holds by construction |
| The two Completions are never combined | AC-4. A person handed off to an affiliate and a person shown a telephone number reached different ends; a single `completed` flag would lose which |
| Direct Contact's authentication return needs no separate mechanism | A Guest is refused with `401` and told nothing. The interrupted action is the request itself, repeated unchanged after signing in — and every gate is re-evaluated because the request is simply made again (AC-8) |

## Where the guarantees are weaker than they look

**The invented-value check is numeric only.** `inventsValue` compares every
figure in a reply against the figures the brief contained. It is the one
protection that survives a vendor change, and it protects against the most
damaging failure — a value attributed to an Offering that never claimed it. It
does not detect an invented claim expressed in words.

**No assistant vendor exists.** The development adapter restates the brief. It
satisfies AC-5's floor honestly and can form no ranking, but it is not a
conversation, and no Story is closed on the strength of a vendor's behaviour.

## Deferred with reason

| Item | Reason |
|---|---|
| The Compare, Decision and handoff surfaces in the web application | Only the Compare table and its entry from a Presentation are built. Decision Chat, selection, Affiliate Handoff and Direct Contact are complete as contracts and have no screen; UX-0009 belongs to a later increment |
| Assistant vendor selection and its adapter | An Owner decision, like the outbound email vendor. Nothing else blocks a working Decision Chat |
| Basic Analytics over the four occurrences | PRD-0006. Compare Start, Decision Chat Start and the two Completion evidences are recorded and indexed; nothing reads them |
| Post-handoff outcome tracking, attribution and affiliate-network integration | `US-DEC-F05-001` places redirect technology, attribution and external-success tracking outside V1, and AC-10 forbids the claim outright |

## Known boundaries

- Every Decision route except the Direct Contact reveal is public and resolves
  no principal. That is the Story's requirement, not an oversight: PRD-0003
  makes deciding part of a person's journey rather than a feature of an account.
- Current-flow state expires after an hour and is swept opportunistically on
  the next request rather than by a scheduler. The sweep runs outside the
  request's transaction, because a refusal that rolled it back would resurrect
  state that should already be gone.
- The Comparison Set ceiling, the shared-leaf rule, the exactly-one-context
  CHECK and both selection triggers are database objects outside what Prisma
  models. The integration suites are what prove they are there.
- Constraint names in a migration must match what Prisma would generate, or be
  mapped in the datamodel. `decision_chat_turn_unique_position` is mapped for
  that reason; the drift gate cannot run locally and only target CI catches it.

## Story governance

All 50 Generated Stories remain `Delivery Status: Not Started`. This record
extends the implementation links in `I1_IDENTITY_BASELINE_CLOSURE.md`,
`I2_CATALOG_AND_WRITE_MODEL_CLOSURE.md`,
`I3_PUBLICATION_AND_DISCOVERY_CLOSURE.md` and
`I4_PUBLIC_WEB_JOURNEY_CLOSURE.md`; advancing any Delivery Status requires a
separate change with Product Owner review and green CI evidence.
