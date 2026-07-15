# Engineering Constitution

- **Owner:** Product Owner / Architecture Owner
- **Status:** Draft
- **Version:** 1.3
- **Last Updated:** 2026-07-09

**Revision Note (1.1):** Controlled refactoring. Detailed User Story standards are no longer owned here; they are governed by `USER_STORY_HANDBOOK.md` and referenced from this document. High-level gates and principles are retained; the engineering-governance sections (Philosophy, Layer Authority, Quality Gates, Exception Policy, ADR Strategy, Development Workflow, Review Methodology, Testing Strategy, Release Strategy, AI Collaboration Model, Decision Matrix, Risk Management, Product Owner Decisions) are preserved unchanged.

**Revision Note (1.2):** Recognized the Capability Architecture layer between Foundation and PRD. Added a Capability Architecture row to the Layer Authority table (owns the Capability Model) and inserted it into the traceability chain. No other section changed; the capability model itself is owned by `OFFERING_CAPABILITY_ARCHITECTURE.md` and referenced, not redefined.

**Revision Note (1.3):** Harmonization. Recognized the Engineering layer in the Layer Authority table (consistent with the official repository hierarchy owned by `REPOSITORY_GOVERNANCE.md`), and stated that this table follows — and does not redefine — that hierarchy. The lower-level traceability chain wording (Story → Code → Tests → Release → Telemetry) is retained as a traceability chain. Engineering philosophy is unchanged.

> The engineering-governance document for the repository: engineering philosophy, layer authority, quality gates, workflow, review, testing, release, AI collaboration, and risk. Detailed User Story standards are governed by `USER_STORY_HANDBOOK.md` and are referenced here, never redefined.

---

## 1. Engineering Philosophy (Constitution)

### Core Values

- Documentation First Development
- Workshop Before Production
- Single Source of Truth
- Single Information Owner
- Reference, Never Redefine
- Traceability by Design
- Frozen Baseline Development
- Decision-Driven Product Design
- Evidence Before Change
- Explicit Decisions Only (silent assumptions are forbidden)
- Simplicity Wins (when two solutions provide the same value, the simpler one is preferred)
- Trust Before Conversion
- Architecture over Shortcuts
- Clarity over Cleverness
- Small Safe Changes
- Long-term Maintainability

### Antifragility

The platform should not merely survive failures; it should learn from them. Failures must produce:

- Logs
- Metrics
- Actionable insights
- Architectural improvements when necessary

### Developer Experience (DevEx)

Complexity must be encapsulated. Developers should be able to work safely inside their domain without understanding unrelated infrastructure concerns.

## 2. Layer Authority

Every layer owns exactly one concern. No layer may redefine the responsibility of another layer. The official repository layer hierarchy is owned by `REPOSITORY_GOVERNANCE.md`; this table expresses per-layer authority consistent with that hierarchy and does not redefine it.

| Layer | Owns | Cannot Change |
|---|---|---|
| Foundation | Vision & Product Direction | Governance |
| Capability Architecture | Capability Model | Foundation |
| PRD | Business Rules | Foundation / Capability Model |
| UX | User Experience | Business Rules |
| User Stories | Functional Behaviour | PRD / UX |
| Engineering | Technical Architecture & Engineering Decisions | Product Behaviour |
| Development | Technical Implementation | Product Behaviour |
| QA | Product Validation | Requirements |
| AI | Suggestions, Reviews, Alternatives | Final Decisions |

### Mandatory Principles

- Upward Dependency Forbidden
- Zero Initiative Rule
- Layer Boundaries are Mandatory
- Performance Budgets may be defined by UX, but implementation belongs to Development.

## 3. Documentation Lifecycle

Governed by `DOCUMENT_LIFECYCLE.md`.

## 4. Quality Gates

### Principle

Everything that can be verified automatically should be verified automatically. Human reviewers focus only on judgement.

### Design Gate

No implementation starts before UX is Frozen.

### Requirement Gate

Before entering Sprint:

- PRD Approved
- UX Frozen
- INVEST satisfied
- Acceptance Criteria completed
- BDD completed
- Traceability established

Detailed User Story standards (INVEST, Acceptance Criteria, BDD, Traceability, and Definition of Ready) are governed by `USER_STORY_HANDBOOK.md`. This gate references those standards; it does not redefine them.

### Architecture Gate

Any architectural change requiring an ADR must be approved before implementation.

### Code Quality Gate

CI pipeline must validate:

- Build
- Static Analysis
- Lint
- Security Scan
- Unit Tests
- Coverage Threshold

### Merge Gate

Merge requires:

- Required Reviews
- Green Pipeline
- Up-to-date Branch
- Documentation Updated

### Exception Policy

**Production Feature** — must pass every Quality Gate.

**Hotfix** — emergency workflow:

```
Ticket
  ↓
Fast Technical Review
  ↓
Automated Tests
  ↓
Deploy
  ↓
Retrospective
```

**PoC / Spike** — may bypass UX and Story gates. Must never reach Production. Must never become permanent code without normal workflow.

**Internal Tools** — UX rules may be relaxed. Security and Architecture rules remain mandatory.

## 5. ADR Strategy

ADR is the historical memory of the architecture.

### Mandatory

- Core Architecture
- Domain Boundaries
- Ownership Changes
- Security Architecture
- Multi-tenant Strategy
- Infrastructure Strategy
- Event-driven Communication
- Core Design System Paradigm
- New Core Domain

### Not Required

- Minor library updates
- Small refactorings
- UI adjustments

### Workflow

Anyone may propose an ADR. The Architecture Workshop determines whether it is required.

### Superseded

ADRs are never deleted. They are superseded by newer ADRs.

## 6. Development Workflow

### Model

Trunk-Based Development.

### Branches

- main
- feature/*
- bugfix/*
- hotfix/*

Feature branches should remain short-lived and be integrated as early as possible.

### Branch Naming

Every branch must contain:

- Ticket ID
- Domain / Feature name

### Commit Convention

Conventional Commits.

### Versioning

Semantic Versioning: MAJOR.MINOR.PATCH.

## 7. Definition of Ready / Done

### PRD Done

- Business Rules complete
- Edge Cases documented
- Success Metrics defined

### UX Done

- Frozen
- Error States defined
- Empty States defined
- Developer Handoff completed

### Story Ready / Story Done

Detailed User Story standards, including the Story-level Definition of Ready and Definition of Done, are governed by `USER_STORY_HANDBOOK.md`.

### Development Done

- Code Complete
- Unit Tests Passed
- Lint Clean
- Review Approved

### QA Done

- Acceptance Criteria validated
- Regression Passed
- Critical Flows validated

## 8. Review Methodology

### Principle

Machines detect defects. Humans evaluate architecture.

### AI Review

Used primarily for:

- High-risk changes
- Architectural changes
- Security-sensitive code
- Cross-domain reviews

### Human Review

Focus:

- Architecture
- Business Logic
- Complexity
- Performance
- Memory
- Security
- Layer Authority

### SLA

Reviews should normally complete within 24 hours. Reviews are asynchronous by default. Architecture Workshops occur only when necessary.

## 9. Traceability

Every feature must follow:

```
Vision
  ↓
Foundation
  ↓
Capability Architecture
  ↓
PRD
  ↓
UX
  ↓
Story
  ↓
Code
  ↓
Tests
  ↓
Release
  ↓
Telemetry
```

Nothing may exist outside this chain. No orphan documentation. No orphan code. No orphan UI.

Detailed User Story traceability is governed by `USER_STORY_HANDBOOK.md`.

## 10. Testing Strategy

### Mandatory

- Unit Tests
- Integration Tests
- Contract Tests

### Critical Flows

Business-critical paths require:

- End-to-End Tests

### Release Validation

- Smoke Tests
- Security Tests
- Performance Tests (before release)

## 11. Release Strategy

### Mandatory

Feature Flags.

### Recommended

Progressive Rollout. Examples include Canary deployments when supported.

### Principle

Deploy independently. Release intentionally.

## 12. AI Collaboration Model

### Product Owner

Final authority.

### ChatGPT

- Product Architecture
- System Architecture
- Strategic Reviews
- Risk Analysis
- Architectural Challenge

### Claude

- Documentation Engineering
- Technical Architecture
- Code Generation
- Technical Reviews
- Implementation Guidance

### Collaboration Rule

AI proposes. Humans decide.

## 13. Decision Matrix

| Decision | Authority | Consultation | Documentation | ADR |
|---|---|---|---|---|
| UI | UX | Product | UX Spec | No |
| User Journey | UX + Product | Architecture | UX Spec | No |
| Business Rules | Product Owner | UX | PRD | No |
| Technical Refactoring | Senior Developer | Architecture | Pull Request | No* |
| Library Selection | Tech Lead | Architecture | Pull Request | No* |
| AI Behaviour | Product + Architecture | AI | PRD | Sometimes |
| Infrastructure | Architecture Workshop | Product | ADR | Yes |
| Domain Model | Architecture Workshop | Product | ADR + PRD | Yes |
| Event Architecture | Architecture Workshop | Product | ADR | Yes |
| Security Architecture | Architecture Workshop | Product | ADR | Yes |

\* Required if architectural boundaries change.

## 14. Risk Management

| Risk | Decision Authority |
|---|---|
| Low | Domain Owner |
| Medium | Product Owner |
| High | Architecture Workshop |
| Critical | Architecture Workshop + ADR |

Workshops are triggered when:

- AI recommendations conflict
- Architectural boundaries change
- High-risk decisions are identified
- Product Owner requests architectural evaluation
- An ADR may be required

## 15. Product Owner Decisions (V1 Baseline)

| Topic | Decision |
|---|---|
| Decision Chat UX | Part of UX-0004 |
| Compare Limit | Maximum 5 Offerings |
| Decision Flow | Compare → Decision Chat → Contact → Completion |
| Decision Chat | Assistive only |
| Email Verification | Mandatory before account activation |
| Guest Access | Discovery, Compare, Decision Chat |
| Messaging | Minimal two-way messaging |
| Popular Categories | Manually ordered by Admin |
| Moderation | Post Moderation |
| Offering States | Active / Hidden / Archived |
