# ADR-0014 — Decision Chat Provider Boundary and Data Handling

- **Owner:** Product Owner / Architecture Owner
- **Status:** Accepted
- **Version:** 1.0
- **Date:** 2026-07-25
- **Deciders:** Product Owner / Architecture Owner
- **Author:** ChatGPT (architecture and documentation advisor)
- **Supersedes:** none
- **Related:** `ADR-0001-decision-chat-ownership.md`, `V1_SECURITY_ARCHITECTURE.md`, `V1_BACKEND_ARCHITECTURE.md`, `PRD-0004-decision.md`

> **Acceptance note.** The Product Owner / Architecture Owner accepted the exact Proposed v0.1 decision on 2026-07-25.

---

## 1. Context

Decision Chat is in V1 as assistive, contextual support. It must not become the owner of the decision, perform autonomous actions, expose provider credentials or silently expand the data sent to an AI provider.

## 2. Decision

Place all AI-provider access behind an application-owned server-side interface with replaceable provider adapters. Provider credentials, raw provider errors and provider-specific request structures never reach the browser or domain model.

Construct prompts server-side from the current bounded Decision Context and the current bounded chat session. Send only data necessary for the immediate response. Do not provide unrestricted repository, account, Business, Admin, analytics or historical Decision data.

Decision Chat in V1 has no mutation tools, browser control, autonomous action, external contact, purchase execution or persistent cross-decision memory. Provider output is untrusted content: validate the response envelope, render it safely and never treat it as authorization or an authoritative product fact.

Record operational metadata needed for safety, cost and reliability without logging secrets or unnecessary prompt content. Define retention, deletion, provider data-use and regional handling before production.

On provider timeout, quota, safety or availability failure, return a recoverable product-owned state. The User must be able to continue and complete the Decision flow without accepting or receiving an AI recommendation.

## 3. Consequences

- AI providers can be replaced without changing product ownership.
- Tool-based prompt injection cannot directly mutate platform state in V1.
- Context building, redaction, retention and observability need explicit tests.
- Provider capability differences are normalized by the application adapter.
- Adding tools, autonomous actions or long-term memory requires a new product decision, security review and ADR.

## 4. Alternatives Considered

- **Direct browser-to-provider calls:** rejected because they expose credentials and bypass application controls.
- **Provider-specific logic in Decision domain code:** rejected because it creates lock-in and leaks infrastructure concerns.
- **Tool-enabled autonomous agent:** rejected because it conflicts with Frozen V1 scope and Decision ownership.
- **Unbounded conversation/account history:** rejected because it violates minimization and purpose limitation.

## 5. Related PRDs

PRD-0004 and PRD-0006.

## 6. Related ADRs

ADR-0001, ADR-0006, ADR-0008 and ADR-0010 through ADR-0013.

## 7. Notes

The exact provider and model are replaceable deployment configuration subject to current capability, privacy, cost and safety verification.
