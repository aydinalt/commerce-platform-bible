<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-26
-->

# I42 — The published shapes, checked against the contracts

I41 compared the OpenAPI document with the routes the API serves and found it
complete. It also wrote down what it could not see:

> This compares method and path, not shape. A response schema that no longer
> matches what the handler returns would pass every case here.

**It did not match, and had not since I30.**

## Two fields the published contract had been hiding for eleven increments

| Schema | Field the contract declares | In the document |
|---|---|---|
| `SearchResult` | `primaryVisualUrl` | **absent** |
| `EditableOfferingContent` | `visuals` | **absent** |

I30 gave Offerings visuals. It updated the Zod contracts, the migration, the
projection, the repositories, the API and the web application. It did not update
the **five-thousand-line hand-written OpenAPI generator**, and nothing in the
repository could tell — I41's comparison was about paths, and CI's
`git diff --exit-code` only ever proved the generator matches its own committed
output.

So a client generated from the published description would have had no
`primaryVisualUrl` on a Listing Card and no `visuals` on an Offering. **It would
have looked correct and quietly dropped both**, which is the failure mode a
published contract exists to prevent.

Both are now in the generator and the document is regenerated.

## How the comparison works

81 of the document's 92 schemas correspond by name to a Zod object schema —
`searchResultSchema` is `SearchResult` once the trailing `Schema` and the casing
are normalised away. For each pair the property names are compared, in both
directions.

The eleven that do not pair are shapes one side names and the other inlines.
Comparing those needs a mapping nobody has written, and inventing one would make
the check look more complete than it is.

## The guard, again

I41's own comparison would have passed by emptiness if its route observer had
stopped firing, and the case that noticed was a guard on the number of things
compared. **The same guard is here**, against the same shape of failure: a
rename on either side would silently reduce the pairs to zero and leave both
directions comparing nothing to nothing.

The two recovered fields are also asserted **by name**, not only by the general
rule. A general rule that has never been violated is indistinguishable from one
that cannot be, and these two were violated for eleven increments.

## What was proven

`tests/i42-contract-shapes.test.ts`, four cases.

| Mutation | Result |
|---|---|
| `primaryVisualUrl` removed from the document again | 2 failed |
| `visuals` removed from the document again | 2 failed |
| A field nobody declares is published | 1 failed |
| The pairing breaks, so nothing is compared | 1 failed |

The first two are I30's actual state, replayed.

## Verification

Run from a clean tree with every `dist` and `tsbuildinfo` deleted, in `verify`'s
own order: format, type check, lint, module boundaries, no OpenAPI drift,
**109 test files / 1019 tests**, 0 vulnerabilities, production build, 14/14
smoke checks.

## Known boundaries

- **Property names only, not types.** A field whose declared type stopped
  matching what the handler returns — `string` where a number is sent, a widened
  enum, a nullable that is not — passes every case here. That is a smaller gap
  than the one just closed and a real one.
- **Eleven document schemas are not compared at all**, because nothing pairs
  them with a contract. They are the shapes one side inlines, and the honest
  statement is that they are unchecked rather than that they are fine.
- **Nothing compares the document with the handlers.** Contract and document now
  agree; whether the handler returns what the contract says is proven only where
  a test already asserts a response body.
- **The regenerated document has not been read by any client.** It is correct
  against the contracts and has never been fed to a generator.
