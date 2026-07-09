# ADR-0001 — Decision Chat Ownership

- **ADR ID:** ADR-0001
- **Title:** Decision Chat Ownership
- **Owner:** Product Owner / Architecture Owner
- **Status:** Accepted
- **Version:** 1.0
- **Last Updated:** 2026-07-09

---

## 1. Purpose

Record the accepted architectural decision that assigns ownership of Decision Chat. This ADR documents a decision that has already been made by the Product Owner / Architecture Owner. It also serves as the reference standard for the form and rigour of all future ADRs in this repository. It does not reconsider, re-open, or propose alternatives to the decision it records.

## 2. Context

The Frozen Foundation includes Decision Chat as a V1 capability and places it as a fixed step in the core decision flow, immediately after Compare and before the Affiliate / Contact handoff. The Foundation also fixes Decision Chat as assistive only: it supports a person in reaching a decision and does not act on their behalf or decide for them.

A PRD architecture audit identified that Decision Chat, though present in the Frozen Foundation, was owned by no PRD: the Decision PRD had excluded it. Because the documentation-first architecture treats the Frozen Foundation as authoritative, a capability present in the Foundation must have exactly one owning PRD. A decision was therefore required to assign that ownership. This ADR records the decision that resolved it.

Decision Chat is the same capability referred to as the "Decision Assistance capability" in the Identity PRD; the two names denote one assistive capability. Terminology harmonization is tracked in the glossary and is outside the scope of this ADR.

## 3. Decision

- Decision Chat belongs to the Decision capability.
- Decision Chat is owned by PRD-0004.
- A separate PRD for Decision Chat is not created.
- Future extraction of Decision Chat into its own document is not planned.
- If the architecture ever requires extraction, that change must be made through a new ADR that supersedes this one.
- No assumption is made that extraction will occur.

## 4. Architectural Rationale

- **Capability ownership.** Decision Chat operates inside the decision flow, on the same Offerings, with the same actors, and toward the same terminal Completion as the rest of the Decision capability. It is a member of the Decision capability, and a capability's members are owned by that capability's PRD.
- **Information ownership.** The governance principle of a single owning document requires exactly one owner for each capability. Assigning Decision Chat to PRD-0004 gives it one unambiguous owner and prevents the information from being split or duplicated across documents.
- **Single Responsibility.** The Decision capability's responsibility is to help a person evaluate Offerings and reach a completed decision. Assistive Decision Chat serves that same responsibility. Scoped as assistive only, it does not introduce a second, unrelated responsibility into PRD-0004.
- **Documentation First Development.** The Frozen Foundation is authoritative and already places Decision Chat within the decision flow. Assigning ownership to the Decision PRD brings the PRD layer into conformance with the Foundation rather than reshaping the Foundation to fit the PRD layer.
- **Traceability.** A single owning PRD produces a clean Foundation → PRD mapping for Decision Chat and closes the coverage gap without adding a new capability row, keeping traceability complete and simple.
- **Long-term maintainability.** One owner means one place to review, version, and freeze the decision behaviour, with fewer cross-document references to keep consistent over time.
- **Avoiding unnecessary architectural complexity.** Creating a separate document or boundary for Decision Chat today would introduce a cross-document contract and an additional capability with no present need. The decision avoids that complexity by keeping ownership where the capability naturally lives.

## 5. Consequences

- PRD-0004 owns Decision Chat, and the prior exclusion of the assistive capability is removed.
- The Decision capability's scope now includes assistive Decision Chat, described only as assistive product behaviour and constrained to assistive-only (it never decides for the person or acts on their behalf).
- Foundation → PRD coverage for Decision Chat is complete, and traceability reflects a single owner.
- PRD-0004 now spans deterministic decision actions and an assistive capability under one owner; this is an accepted, monitored trade-off governed by the reconsideration criteria in Section 6.
- Any product-level detail that remains undecided within the Decision capability (for example login gating specifics) is tracked in PRD-0004 and is not the subject of this ADR.
- This ADR is immutable. If the decision changes, it is not edited; a new ADR supersedes it.

## 6. Future Reconsideration Criteria

The following objective criteria would justify **opening a new ADR** to reconsider ownership. Each describes a condition under which the current ownership may no longer be the best fit:

- Decision Assistance becomes independently consumed by more than one capability.
- Decision Assistance develops an independent lifecycle, distinct from the Decision flow.
- Decision Assistance owns independent persistent state (for example memory or knowledge) of its own.
- Decision Assistance becomes an autonomous architectural subsystem.

Meeting any of these criteria does **not** automatically trigger extraction and does not change ownership on its own. These criteria only justify opening a new ADR. Ownership changes only through a new Accepted ADR that supersedes this one. No assumption is made here that any criterion will be met.

## 7. Related Documents

- `docs/adr/README.md` — the ADR index.

## 8. Related PRDs

- `PRD-0004-decision.md` — owns Decision Chat as an assistive capability (the subject of this ADR).
- `PRD-0003-identity.md` — refers to the same capability as the "Decision Assistance capability."

## 9. Related Foundation Documents

- `V1_SCOPE.md` — includes Decision Chat in V1 scope and the core flow, and fixes it as assistive only.
- `VISION.md`, `PRODUCT_MANIFESTO.md`, `PRODUCT_PRINCIPLES.md` — establish that AI assists but never replaces human decisions.

## 10. Related Governance Documents

- `docs/governance/ADR_PROCESS.md` — the process this ADR follows.
- `docs/governance/REPOSITORY_GOVERNANCE.md` — the authority under which the decision was accepted.
- `docs/governance/DOCUMENT_LIFECYCLE.md`, `docs/governance/REVIEW_PROCESS.md` — lifecycle and review context.

## 11. References

- The decision recorded here was accepted by the Product Owner / Architecture Owner under the authority defined in `REPOSITORY_GOVERNANCE.md`, following `ADR_PROCESS.md`.
