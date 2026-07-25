# Commerce Platform Bible

The authoritative documentation repository for the decision-completion marketplace platform.

## Navigation

- [Current Status](CURRENT_STATUS.md)
- [Project Roadmap](PROJECT_ROADMAP.md)
- [Documentation Index](docs/README.md)
- [Repository Index](docs/repository/REPOSITORY_INDEX.md)
- [Traceability](docs/traceability.md)
- [ADR Index](docs/adr/README.md)
- [Marketplace Bible v1.0 Baseline](docs/releases/MARKETPLACE_BIBLE_V1_BASELINE.md)

The Marketplace Bible v1.0 and V1 Software Architecture v1.0 baselines are
Frozen. Implementation now proceeds through the living backlog without editing
those baselines or silently changing Story Delivery Status.

## Local Foundation

Requirements: Node.js 24+, npm 11+, and Docker for local PostgreSQL.

```bash
npm install
docker compose up -d postgres
npm run verify
```

Development commands:

```bash
npm run dev
npm run dev:api
npm run dev:worker
```

The backlog and delivery order are under [`docs/implementation/`](docs/implementation/README.md).
