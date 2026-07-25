# V1 Software Architecture — Formal Architecture Review

- **Owner:** Architecture Owner
- **Status:** Complete
- **Version:** 1.0
- **Review Date:** 2026-07-25
- **Reviewed Baseline:** commit `21dfdef` — `Add V1 software architecture draft`
- **Scope:** `docs/software-architecture/` Draft v0.1 package and ADR candidates ADR-0010–ADR-0014

## 1. Verdict

**PASS — READY FOR ADR OWNER DECISION**

The V1 Software Architecture is consistent with the Frozen Marketplace Bible v1.0 and Engineering Constitution. No blocker or major product-scope conflict was found.

The architecture package remains non-authoritative until the Product Owner / Architecture Owner accepts, revises or rejects ADR-0010 through ADR-0014.

## 2. Review Results

| Area | Result | Evidence |
|---|---|---|
| Frozen scope preservation | PASS | No payment, logistics, inventory, native mobile, autonomous agent or external API scope added |
| Universal Offering / Attribute Engine | PASS | Metadata-driven typed attributes; no category-specific domain tables or pages |
| Identity and Business ownership | PASS | Business remains a User-owned context, not a separate identity |
| Admin authority separation | PASS | Admin permission is independently provisioned and server-authorized |
| Decision ownership | PASS | Chat remains optional, assistive, bounded and non-autonomous |
| Module boundaries | PASS | Modular monolith with explicit ownership and no cross-module table writes |
| Data integrity | PASS | PostgreSQL authority, constraints, transactional outbox and rebuildable projections |
| Security | PASS | Deny-by-default server policies, secure session boundary and production security gate |
| Infrastructure | PASS | Separate deploy units, managed state, recovery evidence and no mandatory Kubernetes |
| V1 delivery realism | PASS | Architecture minimizes operational systems and defers unproven scaling components |

## 3. ADR Classification

Five decisions meet the Frozen ADR Process significance test:

| ADR | Decision | Review result |
|---|---|---|
| ADR-0010 | V1 system shape and module boundaries | Proposed v0.1 ready for Owner decision |
| ADR-0011 | Persistence, projection and search architecture | Proposed v0.1 ready for Owner decision |
| ADR-0012 | Identity, session and authorization architecture | Proposed v0.1 ready for Owner decision |
| ADR-0013 | Deployment and infrastructure architecture | Proposed v0.1 ready for Owner decision |
| ADR-0014 | Decision Chat provider boundary and data handling | Proposed v0.1 ready for Owner decision |

The ADRs are intentionally not added to the authoritative ADR index while Proposed. The index states that it lists Accepted ADRs only.

## 4. Findings

- **Blocker:** 0
- **Major:** 0
- **Minor:** 0
- **Advisory:** 4

Advisories:

1. Pin supported runtime and dependency versions in the implementation repository.
2. Record the selected identity implementation before protected-flow coding.
3. Record verified hosting vendors, regions, limits and production tier before infrastructure provisioning.
4. Define numeric SLO, RPO/RTO, retention and AI-provider data handling before the production gate.

These advisories do not block ADR acceptance or repository skeleton work after acceptance. They do block their named later gates.

## 5. Final Review Gate

Final Review of the software-architecture document set occurs after exact ADR candidates are explicitly accepted or revised. The Architecture Owner must not mark the architecture set Approved/Frozen or begin affected implementation before that decision.

## 6. Required Owner Decision

For each ADR-0010 through ADR-0014, record one outcome:

- Accept exact Proposed v0.1 as Accepted v1.0;
- request a controlled revision;
- reject/withdraw the proposal.

