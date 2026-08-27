<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-26
-->

# I43 — The published types, checked against the contracts

I42 compared property *names* and found two the document had been hiding since
I30. It wrote down what it still could not see:

> Property names only, not types. A field whose declared type stopped matching
> what the handler returns — `string` where a number is sent, a widened enum, a
> nullable that is not — passes every case here.

This closes it. **301 properties compared, all in agreement**, so this locks a
good state in rather than repairing a bad one.

## The measurement was wrong before it was right

The first comparison reported **62 differences out of 301**. Every one was the
comparison's fault.

| the document says | the contract says | what it is |
|---|---|---|
| `type: ["string", "null"]` | `anyOf: [{string}, {null}]` | the same nullable string |
| `$ref` to a shared enum | the enum inlined | the same enum |
| `enum: ["ok"]` | `type: "string"` | the same string |

**Three encodings of agreement, read as disagreement.** Had I trusted the first
number and "fixed" the document, sixty-two correct declarations would have been
edited into wrong ones to satisfy a naive reader — a worse outcome than the gap
this increment was written to close, and reached by doing exactly what the
increment was for.

So both sides are reduced to the same pair before anything is compared: a
primitive kind and whether null is permitted. `$ref` is resolved, an `anyOf`
with a null branch collapses to nullable, an enum of strings is a string.

**The fix for over-strictness can overshoot into over-permissiveness**, so a
case asserts directly on the normaliser that a nullable and a plain one still
read as different. It is the instrument that is checked there, not the document.

## Eight contracts JSON Schema cannot express

`z.toJSONSchema` refuses a schema carrying a `transform` — "Transforms cannot be
represented in JSON Schema" — which is correct: a transform is code and JSON
Schema describes data. All eight are **input** schemas that trim or normalise
before validating, and none describes a response.

They are skipped, and the **set is asserted rather than a count**. A count is a
budget somebody spends: add a transform to a ninth contract and a "fewer than
ten" bound absorbs it silently, the comparison shrinks by one subject, and
nobody decides. Naming them means the next one fails and has to be acknowledged.

The first version of that case guessed "fewer than six" and there were eight.
The guess was wrong in the direction that blocks a correct state — the better
direction — and it was replaced by a measurement rather than by a larger guess.

## What was proven

`tests/i43-contract-types.test.ts`, five cases.

| Mutation | Result |
|---|---|
| A string is published as a number | 1 failed |
| A nullable is published as non-nullable | 1 failed |
| A non-nullable is published as nullable | 1 failed |
| The normaliser stops distinguishing nullable | 1 failed |
| A ninth contract becomes unrenderable | 1 failed |

## Verification

Run from a clean tree with every `dist` and `tsbuildinfo` deleted, in `verify`'s
own order: format, type check, lint, module boundaries, no OpenAPI drift,
**110 test files / 1024 tests**, 0 vulnerabilities, production build, 14/14
smoke checks.

## Known boundaries

- **Kind and nullability only.** Not `format`, `minimum`, `maxLength`,
  `pattern` or `description`. Comparing those needs a vocabulary for what
  "equivalent" means when one side says `format: "uuid"` and the other says a
  regular expression — a decision nobody has taken, and this says so rather than
  letting silence imply coverage.
- **A union of two non-null branches is compared as a shape, not member by
  member.** Both sides currently agree; a union whose members changed while the
  member *types* stayed the same would pass.
- **Nothing here reaches the handlers.** Contract and document agree on names
  and types; whether a handler returns what the contract says is proven only
  where a test already asserts a response body.
- **The three checks now standing on the document are all structural.** They
  would all pass a document whose every `description` was nonsense.
