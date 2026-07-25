# Engineering Constitution

- **Owner:** Product Owner / Architecture Owner
- **Status:** Frozen
- **Maintenance Mode:** Living
- **Version:** 1.0
- **Last Updated:** 2026-07-25
- **Applies To:** Application code, infrastructure, data changes, APIs, events, CI/CD, operations, and AI-assisted engineering work
- **Authority State:** Authoritative engineering-governance baseline
- **Freeze State:** Frozen baseline; superseding changes require a new Draft
- **GitHub Effect:** Canonical repository baseline

> **Approval Note (1.0):** Approved by explicit decision of the Product Owner / Architecture Owner on 2026-07-25 after the exact Draft v0.1 candidate completed Architecture Review, Final Review, and a repository-current closure validation with no Blocker, Major, or required correction. The first approval advances the candidate through In Review to Approved v1.0 and establishes this document as the authoritative owner of universal engineering-governance rules. The approval changes no product behaviour, Story Delivery Status, implementation, infrastructure, or ADR automatically.

> **Freeze Note (1.0):** Frozen by separate Product Owner / Architecture Owner direction on 2026-07-25 to close the Engineering Constitution gate before the Marketplace Bible v1.0 freeze gate. This locks the Approved v1.0 baseline. `Maintenance Mode: Living` does not weaken the freeze: future change requires a separate superseding Draft under `DOCUMENT_LIFECYCLE.md`. No downstream document is modified automatically.

> **Review Closure Note (1.0):** The preserved independent-audit package contained a Claude audit prompt but no Claude verdict. Frozen `REVIEW_PROCESS.md` v1.0 makes an independent second review recommended, not mandatory, for this non-ADR governance document and permits disclosed reviewer role overlap. Closure therefore relies only on recorded evidence actually present: Architecture Review PASS, Final Review PASS, and the 2026-07-25 repository-current closure validation. No Claude result is claimed.

> **Creation Note (0.1):** Clean source-state recovery candidate prepared from the current Frozen governance baseline. Earlier local `ENGINEERING_CONSTITUTION.md` Draft v1.1 and Draft v1.2 files are preserved as non-authoritative historical drafts; they are not edited in place or promoted. This Draft removes stale product decisions, restores pre-approval `0.x` versioning, recognizes current layer authority, and establishes universal engineering-quality, testing, security, observability, release, exception, and AI-collaboration boundaries. It changes no Story, PRD, UX, ADR, Capability, Feature Registry, code, infrastructure, or GitHub file automatically.

---

## 1. Purpose

This Constitution defines the universal engineering rules required to turn authoritative product documentation into safe, testable, observable, secure, maintainable, and releasable software.

It establishes minimum engineering governance for:

- implementation entry;
- technical design;
- source-control workflow;
- code and merge quality;
- testing;
- security and privacy;
- observability and operational readiness;
- reliability and performance;
- releases and rollback;
- exceptions and hotfixes;
- AI-assisted engineering;
- engineering evidence and traceability.

This Constitution governs engineering practice. It does not own product behaviour.

---

## 2. Authority and Information Ownership

### 2.1 Governing authority chain

Engineering consumes authoritative upstream decisions through the repository hierarchy:

```text
Foundation
→ Capability Architecture, where applicable
→ PRD
→ UX
→ User Story
→ Engineering Design
→ Code and Configuration
→ Tests
→ Release
→ Telemetry and Operational Evidence
```

No engineering artifact may silently redefine an upstream owner.

### 2.2 This Constitution owns

This document is the Single Information Owner for universal engineering-governance rules concerning:

- engineering entry and exit gates;
- mandatory code-quality and merge controls;
- minimum testing classes and test-quality rules;
- universal security and privacy controls;
- universal observability and operational-readiness controls;
- default development and release workflow;
- hotfix, spike, and exception boundaries;
- AI-assisted engineering safeguards;
- engineering risk classification;
- engineering evidence and conformance.

### 2.3 This Constitution references and does not redefine

- `REPOSITORY_GOVERNANCE.md` — repository authority, roles, Single Information Owner, AI authority, and source-of-truth principles;
- `DOCUMENT_LIFECYCLE.md` — document states, versioning, Approval, Freeze, and controlled revision;
- `REVIEW_PROCESS.md` — review stages, severities, verdicts, and records;
- `ADR_PROCESS.md` — ADR requirement, proposal, acceptance, immutability, and supersession;
- `USER_STORY_HANDBOOK.md` — Story structure, Acceptance Criteria, BDD, Definition of Ready, Definition of Done, dependency vocabulary, sizing, and Story validation;
- PRDs — product rules and product-owned outcomes;
- UX specifications — experience behaviour and states;
- Capability Architecture and Feature Registries — Capability and Feature identity ownership;
- implementation-specific technical designs — concrete technology and component decisions.

### 2.4 Final authority

The Product Owner / Architecture Owner is the final decision authority for:

- approval and Freeze of this Constitution;
- disputed engineering-risk classification;
- time-bounded exceptions;
- decisions requiring an ADR;
- release acceptance where risk remains;
- emergency deviations from the default workflow.

AI may draft, review, test, and recommend. AI may not substitute for Owner authority.

---

## 3. Non-Goals

This Constitution does not:

- define product features, business rules, user journeys, or visual design;
- define Feature IDs, Capability names, Story IDs, or Epic placement;
- select a programming language, framework, database, cloud provider, vendor, or deployment platform;
- define one universal numeric test-coverage target;
- define one universal latency, availability, capacity, or retention target;
- define detailed API, event, database, analytics, or moderation contracts;
- create an implementation plan or Sprint;
- approve code, merge a branch, deploy a release, or modify GitHub automatically;
- grant an exception merely because a deadline exists;
- replace detailed subordinate standards where those standards are separately authorized.

A subordinate technical standard may add stricter rules. It may not weaken this Constitution without an explicit governed exception or superseding Constitution revision.

---

## 4. Engineering Principles

Every engineering decision shall follow these principles:

1. **Documentation First** — implementation consumes current authoritative documentation.
2. **Reference Never Redefine** — engineering references product and governance owners.
3. **Evidence Before Change** — claims are supported by tests, analysis, metrics, or review.
4. **Small Safe Changes** — changes are bounded, independently reviewable, and reversible where practical.
5. **Secure by Default** — access is denied unless explicitly authorized.
6. **Observable by Default** — production behaviour must be diagnosable without reproducing every failure locally.
7. **Automate Repeatable Verification** — machines perform deterministic checks; humans evaluate judgement.
8. **Compatibility Is Deliberate** — contracts and migrations change through explicit compatibility decisions.
9. **Failure Must Be Actionable** — errors produce useful evidence without exposing secrets or personal data.
10. **No Silent Assumptions** — unresolved requirements, architecture, security, or operational questions block implementation or are explicitly recorded.
11. **Simplicity Over Cleverness** — choose the least complex design that satisfies authoritative requirements and risk.
12. **Maintainability Is Product Value** — readability, testability, security, operability, and reversibility are delivery outcomes.
13. **Production Is Not a Test Environment** — experiments require controlled isolation and exit criteria.
14. **Ownership Is Explicit** — every production component, alert, exception, and operational risk has an accountable owner.

---

## 5. Engineering Entry Gate

Production-bound implementation may begin only when the applicable work satisfies all required conditions.

### 5.1 Required authority

- applicable PRD behaviour is authoritative;
- applicable UX behaviour is authoritative and Frozen where required by repository governance;
- applicable Capability, Feature, and Story identifiers resolve to authoritative owners;
- the applicable Generated Story is ready under `USER_STORY_HANDBOOK.md`;
- no unresolved `Review Needed` trigger materially affects the work;
- required ADR decisions are Accepted;
- traceability from Story to upstream owners is available.

### 5.2 Required engineering preparation

Before implementation begins:

- the intended technical boundary is understood;
- dependencies and affected contracts are identified;
- data classification and security impact are identified;
- test approach is identified;
- observability expectations are identified;
- migration and rollback needs are identified;
- risk level is classified under Section 19;
- unresolved assumptions are recorded and assigned.

### 5.3 Blocked work

Implementation is blocked when:

- product or UX behaviour is ambiguous;
- a required Story or Feature identity is missing;
- an architectural decision requires an ADR that is not Accepted;
- required authorization, data-protection, migration, rollback, or operational ownership is unknown;
- a proposed change contradicts a Frozen upstream baseline;
- a Critical or High unaccepted security risk is known.

A deadline does not convert a blocked condition into permission.

---

## 6. Technical Design and ADR Gate

### 6.1 Technical design

Every non-trivial change shall record enough technical design to explain:

- affected components and boundaries;
- data flow and ownership;
- API, event, or persistence impact;
- authorization and trust boundaries;
- failure modes;
- compatibility and migration impact;
- testing approach;
- observability and rollback;
- known risks and alternatives.

The design may be recorded in a pull request, technical design document, or ADR according to decision weight.

### 6.2 ADR assessment required

An ADR assessment is mandatory for decisions involving:

- new system or domain boundaries;
- new source-of-truth or data ownership;
- security architecture or trust-model changes;
- authorization-model changes;
- cross-domain communication patterns;
- public API or event-contract strategy;
- database or persistence architecture;
- multi-tenant strategy;
- infrastructure or deployment architecture;
- event-driven architecture;
- identity-provider or authentication architecture;
- major observability architecture;
- vendor dependency that is difficult to reverse;
- repository-wide engineering-governance change;
- a change that supersedes an Accepted ADR.

### 6.3 ADR normally not required

An ADR is normally unnecessary for:

- implementation detail already constrained by authoritative architecture;
- local refactoring with unchanged boundaries and behaviour;
- test additions;
- non-architectural bug fixes;
- minor dependency updates with no material risk or boundary change;
- documentation alignment with an already Accepted decision.

Uncertainty is recorded and resolved under `ADR_PROCESS.md`; AI does not make the final classification.

---

## 7. Source Control and Development Workflow

### 7.1 Default model

The repository default is protected-main, short-lived-branch development with trunk-based intent.

- `main` represents the integration baseline.
- Direct production-bound pushes to `main` are prohibited.
- Changes enter through a reviewed pull request.
- Branches remain short-lived and focused on one bounded change.
- Long-lived divergence is avoided.
- Incomplete production code is isolated by an approved feature flag or does not merge.

### 7.2 Branch categories

Recommended branch prefixes:

```text
feature/
fix/
hotfix/
refactor/
chore/
docs/
```

A branch name should include the work identifier and a short bounded description.

### 7.3 Commit rules

- commits are understandable and attributable;
- Conventional Commits are the repository default;
- secrets, credentials, personal data, generated local artifacts, and unrelated changes are not committed;
- a commit must not claim a lifecycle, review, approval, or Freeze decision that did not occur;
- history-rewriting practices must not erase authoritative review or release evidence.

### 7.4 Pull-request scope

A pull request should:

- implement one coherent change;
- identify the Story or authorized maintenance source;
- describe risk, test evidence, migration, and rollback;
- identify AI assistance when materially used;
- separate unrelated refactoring where practical;
- identify documentation affected by the change.

---

## 8. Code Quality Gate

Production-bound code shall pass the applicable automated quality checks.

### 8.1 Mandatory baseline

Where applicable, CI shall verify:

- clean build;
- type checking or equivalent compile-time validation;
- formatting and lint;
- static analysis;
- unit tests;
- relevant integration and contract tests;
- dependency vulnerability scan;
- secret scan;
- license or provenance checks for third-party and generated code;
- migration validation;
- generated-artifact consistency;
- documentation and contract consistency checks.

### 8.2 Code-quality expectations

Code shall be:

- readable without hidden context;
- modular within authoritative boundaries;
- deterministic where the domain requires it;
- explicit about errors and failure handling;
- free from known dead code and accidental duplication;
- testable without production-only dependencies;
- backward compatible where compatibility is required;
- documented where public contracts or non-obvious constraints exist.

### 8.3 Coverage policy

This Constitution defines no single global coverage percentage.

Coverage is evidence, not the objective.

A testing strategy may define numeric thresholds by risk, domain, or component. A threshold never replaces testing of critical behaviour, negative cases, authorization boundaries, migrations, or failure paths.

---

## 9. Pull Request and Merge Gate

A production-bound pull request may merge only when:

- required automated checks are green;
- required human reviews are complete;
- no unresolved BLOCKER or MAJOR engineering finding remains;
- branch conflicts and required baseline updates are resolved;
- the change remains within the authorized Story or maintenance scope;
- Acceptance Criteria and applicable BDD scenarios are covered by evidence;
- security, privacy, migration, and rollback impacts are addressed;
- new or changed production behaviour is observable;
- required documentation and contracts are updated;
- no secret or prohibited personal data is present;
- required exception records are attached.

### 9.1 Review independence

The author shall not be the sole approver of a production-bound change.

High-risk, security-sensitive, cross-domain, migration-heavy, or architecture-significant changes require an appropriately independent reviewer.

### 9.2 Review focus

Human review evaluates:

- architecture and ownership boundaries;
- correctness against product and UX authority;
- security and privacy;
- failure behaviour;
- complexity and maintainability;
- performance and resource impact;
- compatibility and migration;
- test sufficiency;
- observability and rollback.

Automated success does not eliminate human judgement.

---

## 10. Testing Constitution

### 10.1 Risk-based testing

Testing depth is proportional to user impact, security impact, data impact, reversibility, and architectural reach.

Every production-bound change requires the smallest complete test set that gives credible evidence for its risk.

### 10.2 Mandatory test classes

#### Unit tests

Required for:

- business calculations and decision logic implemented in code;
- transformations, validation, and state transitions;
- error and boundary behaviour that can be isolated;
- regression of a defect where unit-level reproduction is appropriate.

#### Integration tests

Required for interactions with:

- persistence;
- queues or event infrastructure;
- external adapters;
- authentication and authorization infrastructure;
- file or object storage;
- caches;
- service boundaries where real integration behaviour matters.

#### Contract tests

Required for versioned:

- APIs;
- events;
- webhooks;
- schemas;
- provider adapters;
- inter-service expectations.

Contract tests shall cover compatibility and failure semantics, not only happy paths.

#### End-to-end tests

Required for critical user and administrative journeys where component-level evidence is insufficient.

The E2E suite shall remain bounded to high-value journeys and must not replace lower-level tests.

#### Security tests

Required according to risk, including:

- authentication;
- authorization;
- privilege boundaries;
- input and output handling;
- session or token behaviour;
- secret exposure;
- dependency and supply-chain risk;
- abuse cases.

#### Accessibility tests

Required for user-facing experiences. Automated checks are supplemented by manual validation for critical flows.

#### Performance and resilience tests

Required before release where a change affects:

- critical latency;
- throughput;
- concurrency;
- resource consumption;
- large data volume;
- external dependency behaviour;
- recovery or degradation.

### 10.3 Test-quality rules

Tests shall be:

- deterministic;
- isolated at the correct level;
- readable as behaviour evidence;
- independent of execution order;
- safe to run repeatedly;
- free of production personal data and secrets;
- maintained with the behaviour they protect.

### 10.4 Flaky tests

A flaky test is a defect.

It must be:

- fixed promptly; or
- quarantined through a time-bounded record with owner, reason, risk, and removal condition.

A quarantined test cannot silently count as passing release evidence.

### 10.5 Regression rule

Every confirmed production defect should produce regression evidence at the lowest effective test level unless the defect is proven non-repeatable and that conclusion is recorded.

---

## 11. Security and Privacy Baseline

### 11.1 Universal rules

Engineering shall apply:

- least privilege;
- deny by default;
- explicit authentication and authorization checks;
- separation of duties for privileged actions;
- secure secret storage;
- encryption in transit;
- encryption at rest where data sensitivity or infrastructure requires it;
- input validation and output encoding;
- secure dependency and supply-chain management;
- safe error handling;
- logging redaction;
- data minimization;
- explicit retention and deletion handling;
- secure defaults and safe failure.

### 11.2 Secrets

Secrets shall not appear in:

- source code;
- committed configuration;
- test fixtures;
- logs;
- screenshots;
- issue text;
- pull-request text;
- AI prompts or AI attachments unless an explicitly approved secure environment and handling rule exists.

Secrets are stored in approved secret-management systems and rotated after suspected exposure.

### 11.3 Authentication and authorization

- authentication does not imply authorization;
- every privileged action requires server-side authorization;
- authorization is checked at the resource and action boundary;
- client-side hiding is not access control;
- ownership and administrative permissions are independently validated;
- suspended, restricted, or disabled access states are enforced at every relevant entry.

### 11.4 Data protection

- collect only required data;
- classify personal, sensitive, operational, and public data;
- avoid production personal data in development and test;
- redact or tokenize where practical;
- define access, retention, deletion, export, and recovery behaviour;
- preserve auditability without exposing protected data;
- review cross-border, vendor, and third-party processing before use.

### 11.5 Vulnerability gate

- unresolved Critical vulnerabilities block merge and release;
- unresolved High vulnerabilities block release unless the Product Owner / Architecture Owner records an explicit, time-bounded risk acceptance with remediation owner;
- Medium and Low findings are triaged by impact, exploitability, exposure, and compensating controls;
- accepted risk has an owner, expiry, monitoring condition, and remediation path;
- security findings are not hidden by test exemptions or warning suppression.

### 11.6 Threat modelling

A threat model is required for changes involving:

- authentication or authorization;
- privileged administration;
- personal or sensitive data;
- external inputs or uploads;
- payment or affiliate redirection;
- public APIs or webhooks;
- cross-domain trust;
- new infrastructure exposure;
- significant abuse or fraud risk.

---

## 12. Observability Baseline

Production behaviour shall be diagnosable through appropriate logs, metrics, traces, health signals, and audit evidence.

### 12.1 Logs

Production logs shall be:

- structured;
- timestamped;
- severity-classified;
- attributable to service and environment;
- correlated to a request, job, or flow where applicable;
- useful for action;
- protected from secrets and unnecessary personal data;
- access-controlled and retained according to policy.

### 12.2 Metrics

Each production component shall expose metrics appropriate to its role, including where applicable:

- request or job volume;
- success and failure rate;
- latency;
- saturation and resource use;
- queue or backlog depth;
- dependency health;
- retries and timeouts;
- critical domain-flow occurrences.

A metric is useful only when its meaning, unit, owner, and response are understood.

### 12.3 Tracing and correlation

Distributed or asynchronous flows shall support correlation across boundaries through an appropriate identifier.

Tracing is required where logs and metrics alone cannot reliably locate latency or failure across components.

### 12.4 Health and readiness

Production services shall expose appropriate:

- liveness;
- readiness;
- dependency-health;
- startup and shutdown;
- migration or maintenance-state signals.

Health endpoints must not expose secrets or internal details unnecessarily.

### 12.5 Audit evidence

Security-sensitive and privileged administrative actions shall produce tamper-resistant audit evidence appropriate to risk.

Audit evidence identifies:

- actor or service identity;
- target;
- action;
- result;
- time;
- relevant reason or correlation;
- prior and resulting state where required.

### 12.6 Alerts

Alerts shall:

- reflect actionable user, security, data, or operational impact;
- identify an owner;
- define severity;
- link to diagnostic context or a runbook;
- avoid permanent noise;
- be reviewed after false positives and missed incidents.

### 12.7 Service objectives

Availability, latency, capacity, and recovery targets are defined by the applicable service or release plan.

This Constitution owns the requirement to define and monitor them where material; it does not own one repository-wide numeric target.

---

## 13. Reliability, Failure, and Recovery

Production components shall define behaviour for:

- timeout;
- retry;
- duplicate delivery;
- partial failure;
- dependency unavailability;
- cancellation;
- idempotency where repeated execution is possible;
- data consistency;
- graceful degradation;
- backup and restore where state is durable;
- rollback or forward recovery.

### 13.1 Retry safety

Retries require:

- bounded attempts;
- backoff where appropriate;
- idempotency or duplicate protection;
- observability;
- a terminal failure path.

Infinite, silent, or synchronized retry storms are prohibited.

### 13.2 Data changes

Data migrations shall be:

- reviewed;
- tested against representative data shapes;
- compatible with the deployment plan;
- observable;
- recoverable or explicitly irreversible with Owner acceptance;
- separated from destructive cleanup where safe rollout requires stages.

### 13.3 Recovery evidence

Stateful production systems require tested recovery evidence appropriate to their impact.

A backup that has never been restored successfully is not sufficient recovery evidence.

---

## 14. Performance and Resource Discipline

Performance work is based on defined user or system objectives, not intuition alone.

Engineering shall:

- identify critical paths;
- measure before and after material optimization;
- avoid unbounded queries, loops, queues, memory growth, and payloads;
- define pagination, batching, streaming, or limits where volume requires them;
- protect shared dependencies from overload;
- record significant performance trade-offs;
- test representative load before risky releases.

Performance optimization must not silently change product behaviour, correctness, security, or accessibility.

---

## 15. Release and Change Management

### 15.1 Release principle

Deploy independently. Release intentionally.

A deployment is a technical change to an environment. A release is an intentional exposure of behaviour.

### 15.2 Feature flags

Feature flags are required where they materially improve:

- safe incomplete integration;
- progressive exposure;
- emergency disablement;
- controlled migration;
- experiment isolation.

Every flag has:

- owner;
- purpose;
- default state;
- environment scope;
- removal condition;
- expiry or review date.

Permanent forgotten flags are prohibited.

### 15.3 Release gate

Before production release, the applicable evidence includes:

- green build and required tests;
- Acceptance Criteria validation;
- critical-flow regression and smoke tests;
- security review and unresolved-risk decision;
- migration readiness;
- rollback or forward-recovery plan;
- observability and alert readiness;
- operational owner and runbook where required;
- release notes and compatibility impact;
- feature-flag state and removal plan;
- required approval.

### 15.4 Versioning

- versioned public APIs, packages, and contracts use a deliberate compatibility strategy;
- Semantic Versioning is the default where `MAJOR.MINOR.PATCH` accurately communicates compatibility;
- application releases carry an identifiable release version or build identifier;
- database, event, and API compatibility is managed explicitly and not inferred from a repository tag alone.

### 15.5 Progressive delivery

High-risk changes should use the safest available rollout method, such as:

- internal exposure;
- feature-flagged exposure;
- staged percentage rollout;
- canary;
- blue/green;
- shadow validation.

The rollout method is selected by risk and infrastructure capability.

---

## 16. Incident, Hotfix, and Emergency Rules

### 16.1 Incident priority

During an incident, priorities are:

1. protect people, data, and security;
2. stop or limit harm;
3. restore safe service;
4. preserve evidence;
5. communicate status;
6. learn and improve.

### 16.2 Hotfix minimum gate

A hotfix may shorten the normal workflow but shall not bypass:

- identified owner;
- bounded change;
- independent technical review where feasible;
- build and applicable automated tests;
- secret and vulnerability scanning;
- rollback or containment plan;
- deployment observation;
- post-release verification;
- retrospective follow-up.

### 16.3 Post-incident work

A material incident produces:

- timeline;
- impact;
- detection and response analysis;
- root and contributing causes;
- corrective and preventive actions;
- owners and target dates;
- test, monitoring, documentation, or architecture follow-ups;
- ADR assessment where architecture or governance changed.

Blame is not an engineering control.

---

## 17. PoC, Spike, and Internal-Tool Boundaries

### 17.1 Proof of concept and spike

A PoC or spike may bypass selected product-document gates only when it is:

- explicitly labelled non-production;
- isolated from production data and credentials;
- time-bounded;
- owned;
- given exit criteria;
- excluded from production deployment.

PoC code must not become production code merely by continued use. Production adoption requires normal design, review, tests, security, observability, and documentation gates.

### 17.2 Internal tools

Internal tools may use a lighter UX process where authorized.

They may not bypass:

- authentication and authorization;
- security and privacy;
- data handling;
- source review;
- tests proportional to risk;
- observability;
- production release controls.

---

## 18. AI-Assisted Engineering Constitution

### 18.1 Authority boundary

AI may:

- draft code and documentation;
- propose architecture and alternatives;
- generate tests;
- review changes;
- identify risks and inconsistencies;
- explain code;
- assist incident analysis;
- prepare bounded correction candidates.

AI may not:

- make Product Owner or Architecture Owner decisions;
- approve or Freeze documents;
- accept or supersede ADRs;
- allocate authority to itself;
- merge, push, deploy, delete, or modify GitHub without explicit authorized action;
- waive a Quality Gate;
- accept security risk;
- treat generated output as verified evidence.

### 18.2 Data boundary

Do not provide an AI system with:

- production secrets;
- credentials or tokens;
- unnecessary personal data;
- protected customer content;
- confidential vendor data;
- private keys;
- unredacted incident evidence;
- proprietary code outside the approved data-handling environment.

AI data handling must follow the same classification and vendor-review requirements as any other external processor.

### 18.3 Output verification

AI-generated code, tests, documentation, commands, migrations, and configurations are untrusted until:

- reviewed by a responsible human;
- tested through the applicable gates;
- checked against authoritative requirements;
- checked for security, privacy, license, and supply-chain risk;
- checked for invented dependencies or APIs;
- checked for destructive or irreversible effects.

### 18.4 Provenance

Where AI materially contributes to a production-bound change, the pull request or review record should identify:

- the nature of assistance;
- the human owner;
- material limitations or uncertainty;
- verification performed.

The Constitution does not require generated code to carry tool branding in source files.

### 18.5 Role separation

AI roles may be assigned for drafting, architecture review, independent audit, coding, or testing.

Role assignment is maintained in workflow or project-status records, not hard-coded to one model name in this Constitution.

Where the same AI drafts and reviews a high-risk change, reviewer overlap is disclosed and an independent human or AI review is added when materially valuable.

### 18.6 Prompt and command safety

AI-suggested commands shall be reviewed before execution, especially when they:

- delete or overwrite files;
- change access or permissions;
- modify databases;
- rotate or expose secrets;
- change infrastructure;
- install dependencies;
- publish artifacts;
- interact with production;
- alter Git history.

No instruction to “skip checks” overrides this Constitution.

---

## 19. Engineering Risk Classification

| Level | Typical Characteristics | Required Authority |
|---|---|---|
| Low | Local, reversible, no sensitive data, no contract or boundary change | Domain reviewer |
| Medium | Multi-component effect, moderate migration or operational risk | Senior technical review |
| High | Security, authorization, critical data, major migration, cross-domain or availability impact | Architecture Owner review; ADR assessment; specialist review where applicable |
| Critical | Potential severe data, security, legal, financial, or platform-wide impact | Product Owner / Architecture Owner decision; formal risk plan; ADR where required |

Risk is determined by impact and reversibility, not code size.

A small code change may be Critical.

---

## 20. Exception Policy

An exception is permitted only when recorded with:

- exact rule being deviated from;
- reason;
- scope;
- risk;
- owner;
- approving authority;
- compensating controls;
- expiry or review date;
- remediation path;
- evidence required for closure.

Exceptions are:

- explicit;
- time-bounded;
- reviewable;
- visible to affected reviewers;
- never inherited silently by later work.

A recurring exception indicates a policy, architecture, or process defect and requires review.

No exception may authorize unlawful, unsafe, or knowingly deceptive behaviour.

---

## 21. Engineering Evidence and Traceability

Every production-bound change shall be traceable to an authorized source, such as:

- Generated Story;
- defect;
- incident action;
- security remediation;
- approved maintenance task;
- Accepted ADR follow-up.

The change record shall link, where applicable:

```text
Authority
→ Technical Design
→ Code and Configuration
→ Tests
→ Review
→ Release
→ Telemetry / Incident Evidence
```

Engineering evidence includes:

- pull-request review;
- automated pipeline results;
- test results;
- security findings;
- migration results;
- release record;
- feature-flag state;
- deployment verification;
- operational metrics;
- incident follow-up.

No orphan code, contract, migration, or production configuration is permitted.

---

## 22. Conformance and Maintenance

### 22.1 Conformance

A change conforms when it:

- respects authoritative ownership;
- passes applicable gates;
- records required evidence;
- has no unresolved prohibited risk;
- follows approved exceptions only;
- remains within the intended scope.

### 22.2 Non-conformance

Non-conforming production-bound work is blocked or returned for correction.

A reviewer records the exact rule, evidence, severity, and required correction.

### 22.3 Maintenance classification

`Maintenance Mode: Living` means controlled revisions are expected as engineering practice evolves.

It does not:

- confer authority by itself;
- bypass review;
- bypass versioning;
- bypass Owner approval;
- prevent a release Freeze;
- permit editing a Frozen baseline in place.

### 22.4 Lifecycle

The reviewed Draft v0.1 candidate completed the controlled lifecycle and is now the Frozen v1.0 baseline:

```text
Draft v0.1
→ In Review v0.1
→ Approved v1.0
→ Frozen v1.0
```

Approval and Freeze were separate Owner decisions. A Frozen baseline is changed only through a separate superseding Draft revision under `DOCUMENT_LIFECYCLE.md`.

---

## 23. Product and Repository Boundaries

This Constitution contains no V1 product decision table.

Product-specific decisions remain in their authoritative Foundation, PRD, UX, Capability, Feature Registry, Story, and ADR owners.

Changes in product scope do not require rewriting this Constitution unless the universal engineering rule itself changes.

Repository synchronization records this Frozen v1.0 baseline only; it creates no code, infrastructure, product, or delivery-state change.

---

## 24. References

- `REPOSITORY_GOVERNANCE.md`
- `DOCUMENT_LIFECYCLE.md`
- `REVIEW_PROCESS.md`
- `ADR_PROCESS.md`
- `USER_STORY_HANDBOOK.md`
- `ADR-0005-living-document-classification.md`
- applicable Accepted ADRs
- applicable Frozen PRDs and UX specifications
- applicable Frozen Capability Architecture and Feature Registries
- applicable Parent Story Documents and Generated Stories
- future subordinate testing, security, observability, release, and operational standards where separately authorized
