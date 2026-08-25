# The API and the worker, which Vercel cannot host (I34).
#
# **Vercel runs functions; NestJS is a process and the worker is a loop.** The
# Owner chose Vercel with managed Postgres on 2026-08-24, and that decision
# covers one of the three services — this image covers the other two, and it is
# deliberately one image rather than two: they share every dependency and
# differ only in which `main.js` they start, so two images would be the same
# bytes twice and one more thing to keep in step.
#
# `SERVICE` picks which. It is a build argument rather than a runtime one so the
# image says what it is, and a host that starts the wrong one fails at build
# instead of at 3am.

# ─── Build ────────────────────────────────────────────────────────────────────
FROM node:22-slim AS build
WORKDIR /app

# The manifests first, so a change to source code does not re-resolve the
# dependency tree. Every workspace's own manifest is needed: npm reads them all
# before it will install anything.
#
# **This list was written from memory and three modules were missing** —
# `analytics`, `audit` and `catalog` — which would have failed `npm ci` on the
# first build rather than at runtime, but only after somebody waited for it.
# `tests/i34-deployment.test.ts` now compares this list against the workspaces
# on disk, so adding a module without adding it here fails in seconds instead.
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY apps/worker/package.json apps/worker/
COPY packages/config/package.json packages/config/
COPY packages/contracts/package.json packages/contracts/
COPY packages/database/package.json packages/database/
COPY packages/observability/package.json packages/observability/
COPY packages/testing/package.json packages/testing/
COPY modules/analytics/package.json modules/analytics/
COPY modules/audit/package.json modules/audit/
COPY modules/business/package.json modules/business/
COPY modules/catalog/package.json modules/catalog/
COPY modules/decision/package.json modules/decision/
COPY modules/discovery/package.json modules/discovery/
COPY modules/identity/package.json modules/identity/
COPY modules/moderation/package.json modules/moderation/
COPY modules/notification/package.json modules/notification/
COPY modules/offering/package.json modules/offering/

RUN npm ci

COPY . .

# `tsc -b` walks the project references, so this builds the packages and modules
# the chosen service depends on and nothing else has to be named here.
ARG SERVICE=api
RUN npm run build --workspace @commerce/${SERVICE}

# ─── Run ──────────────────────────────────────────────────────────────────────
FROM node:22-slim AS run
WORKDIR /app
ENV NODE_ENV=production

# **Not root.** The base image ships a `node` user; using it costs nothing and
# means a compromise inside the process is not a compromise of the container.
USER node

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/apps ./apps
COPY --from=build --chown=node:node /app/packages ./packages
COPY --from=build --chown=node:node /app/modules ./modules

ARG SERVICE=api
ENV SERVICE=${SERVICE}

# `4000` is the API's default and the worker ignores it. Declared rather than
# published: a host maps it or does not, and the worker's host will not.
EXPOSE 4000

# `exec` form, so the process is PID 1 and receives SIGTERM directly. Without it
# a shell sits in between, swallows the signal, and every deploy waits out the
# host's kill timeout instead of shutting down.
CMD ["sh", "-c", "exec node apps/${SERVICE}/dist/main.js"]
