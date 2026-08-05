# Implementation

This directory owns delivery planning beneath the Frozen product and software
architecture baselines.

- `IMPLEMENTATION_BACKLOG.md` maps all 50 Generated Stories into executable
  increments without changing their Delivery Status.
- `DELIVERY_SEQUENCE.md` defines gates and the recommended development order.
- `FIRST_VERTICAL_SLICE_READINESS.md` defines the entry gate, transaction
  boundaries, planned API surface, and required negative tests without starting
  a product Story.
- `M11_SLICE_SCOPE_RECONCILIATION.md` records what the first slice implements,
  what it defers, and why, where the roadmap and the readiness record differ.
- `IDENTITY_IMPLEMENTATION_DECISION.md` closes the ADR-0012 §7 precondition and
  records the account-status correction and the registration-delivery design.
- `I1_IDENTITY_BASELINE_CLOSURE.md` records what the Identity increment covered
  per Story, and why `US-IDN-F09-001` moves to I5.
- `M11_STORY_LINK_PROPOSAL.md` records which Frozen Stories the first slice
  touches, with per-Acceptance-Criterion coverage and the code and tests behind
  each. It edits no Story file and advances no Delivery Status, and it does not
  amend the Frozen cross-tier traceability baseline.
- Code under `apps/`, `packages/`, and `modules/` is the implementation
  repository skeleton.

The Generated Story files remain the authority for product behaviour and
acceptance criteria.
