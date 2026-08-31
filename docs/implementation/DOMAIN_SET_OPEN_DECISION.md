# `US-PLT-F08-001` AC-1 — Domain Set Openness Decision

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft — awaiting Owner acceptance
- **Maintenance Mode:** Living
- **Version:** 0.1
- **Last Updated:** 2026-08-31
- **Scope:** One Owner decision resolving a conflict between two Frozen
  documents, and its consequences in code. No Frozen document is edited, no
  Acceptance Criterion is rewritten, and no Delivery Status moves.

## The conflict

Two Frozen documents disagree about the same thing, at the level of an
Acceptance Criterion.

| Document | Frozen | What it says |
|---|---|---|
| `US-PLT-F08-001` v1.0 **AC-1** | 2026-07-25 | *"The system shall allow creation of a root Category only with exactly one Domain from Mobility, Real Estate, or Technology."* |
| `PRD-0001-offering.md` v4.0 §E, Business Rule 39 | 2026-08-30 | *"a Domain is a governed record and **the set is open**… Mobility, Real Estate and Technology were the first three, not the whole set"* |

PRD-0001 v4.0's own Revision Note is explicit that this was intended: it
*"Lifts the V1 restriction of the Domain set to three."* Its Approval Note
records that the Owner approved that on 2026-08-30, five weeks after the Story
was Frozen.

`REPOSITORY_GOVERNANCE.md` makes each named document authoritative for its own
concern and gives neither precedence over the other. It also draws the boundary
that made this a question rather than a change: **recording an Owner decision is
expressly distinguished from making one.** So the code was left untouched and
the conflict brought back.

## The decision

**The Owner decides that PRD-0001 v4.0 governs the membership of the Domain set,
and that AC-1's enumeration of three is superseded as a statement of that
membership.**

The reading this rests on is that **AC-1 says two things, and only one of them
is about the set**:

1. *"only with exactly one Domain"* — a rule about root Categories. One Domain,
   never zero, never two. **This is what AC-1 is for, and it is untouched.**
2. *"from Mobility, Real Estate, or Technology"* — the membership of the set at
   the time the Story was written, when PRD-0001 v3.1 fixed it at three.

PRD-0001 v4.0 changed the second and said so. It did not touch the first, and
neither does this decision: a root Category still names exactly one Domain, a
child still inherits it, and cross-Domain reparenting is still unavailable. Every
other criterion of `US-PLT-F08-001` — AC-2 through AC-16 — stands unchanged and
untouched, including the Approval Note's undertaking not to weaken Category,
Domain, retirement or Attribute mutation-safety rules. Opening a set is not
weakening a rule about how members of it are used.

This is not a licence to read Frozen criteria loosely. It is available here for
one narrow reason: **the later Frozen document names the earlier restriction and
lifts it in terms.** Where no such statement exists, an Acceptance Criterion
means what it says.

## What this decision does not decide

**There is no path by which a Domain can be created.** No endpoint, no service
method, no contract, no Admin surface. The three that exist were inserted by
`20260810000200_category_management/migration.sql`, and a fourth would arrive the
same way.

Business Rule 39 says the set is *"extended by Platform administration"*, and
that half is unimplemented. This decision does not implement it and does not
claim it is implemented. What it unblocks is narrower and worth stating exactly:
**after this change, a Domain added by migration works** — it can hold a root
Category, appear in Browse, be carried by Search, and show its own name. Before
it, such a Domain would have been created successfully and then failed contract
validation on the way out of every read that mentioned it.

An administrative path to create a Domain is a separate increment against
`US-PLT-F08-001`, and it is recorded in `IMPLEMENTATION_BACKLOG.md` as the
follow-up rather than folded in here.

## What the decision costs

The closed set is stated in five places, which is itself the finding. It is one
fact with five owners, and they agree only because nobody has added a Domain.

| Where | What it holds |
|---|---|
| `packages/contracts/src/index.ts` | `V1_DOMAINS`, and six `z.enum(V1_DOMAINS)` — one request schema, five response schemas |
| `modules/catalog/src/index.ts` | A second declaration. Shared packages may not import product modules, so the list was restated and a test kept the two in agreement |
| `apps/web/src/platform/catalog.ts` | A third copy, driving the create-root form's options |
| `apps/web/src/vocabulary.ts` | `MOBILITY → "Ulaşım"` and two more — the Turkish labels |
| `apps/api/src/openapi/generate-openapi.ts` | Three published `enum` arrays |

**The label map is the one that matters, and it points at the deeper fix.** A
Domain record already has a `name` column; Categories take their names from their
records and Domains did not. Opening the set without moving the name would have
put a raw `GARDEN` on a Turkish page — the class of defect this repository has
called out before. So the name now travels from the record, the three-entry map
is deleted, and a Domain added tomorrow displays correctly without a code change.

`byDomain` in the analytics contract was **already** `z.string()`, in the same
file. It stays a key rather than a name, and correctly: analytics groups
historical occurrences, and a Domain renamed last month must not split its own
tallies. The stable key is the right identifier precisely because it is stable.

## What this record supersedes

Nothing is edited. `US-PLT-F08-001` stays Frozen at v1.0 with AC-1's text
unchanged, and this record is what a reader is pointed to when the enumeration
and PRD-0001 v4.0 appear to disagree.

The alternative was a controlled superseding revision of the Story under
`DOCUMENT_LIFECYCLE.md` §7–§8, which remains available and would be the right
instrument if AC-1 ever needs to say something different rather than to be read
against a later PRD. `AC3_ATTRIBUTE_GROUPING_DECISION.md` is the precedent for
this form: an Owner decision recorded as its own document, leaving the Frozen
text alone.
