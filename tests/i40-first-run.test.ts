import { readFileSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * The first run against an empty database (I40).
 *
 * Everything I35 through I39 built assumed a database with rows in it. **Nobody
 * had ever pointed the platform at a brand-new one**, and the questions that
 * only a fresh database asks were unanswered: what does a first visitor see,
 * and how does the first Admin come to exist?
 *
 * Walked, against 31 migrations and nothing else:
 *
 * | step | result |
 * |---|---|
 * | tables and seeded rows | 39 tables, 3 Domains from a migration, nothing else |
 * | Home | 200, *"Şu anda açık bir kategori yok."* — the empty catalogue said plainly |
 * | Discovery | 307 to Home, because it has no criteria to work from |
 * | registration | 202, writing `outbox_event`, `pending_registration`, `auth_throttle` and `audit_record` |
 * | the scheduled drain (I38) | `{"batches":2,"delivered":1,"drained":true}` — **the cron path delivering for real** |
 * | confirmation → grant → sign in | 201, granted, 201 |
 * | the Admin panel | **403 `ADMIN_CONTEXT_REQUIRED`**, which is correct |
 *
 * That last one is UX-0008 §5 working: Admin authorization does not imply an
 * entered Admin context, and the API says so rather than letting a granted
 * account walk in.
 *
 * **The one thing missing was a way to get the confirmation link.**
 */
describe("Increment I40 the first run", () => {
  const script = (): string => readFileSync("scripts/first-run.mjs", "utf8");

  /** Comments stripped — the standing rule since I31. */
  const code = (): string =>
    script()
      .replaceAll(/\/\*[\s\S]*?\*\//gu, "")
      .replaceAll(/^\s*\/\/.*$/gmu, "");

  describe("why the link cannot simply be looked up", () => {
    it("is minted at delivery, with only its digest written back", () => {
      /*
       * **The bootstrap constraint is a consequence of a good decision, not a
       * defect.** `outbox.processor.ts` mints the registration token at the
       * moment of delivery and stores only its digest, so the token exists in
       * memory and in the message and never at rest.
       *
       * That is why no amount of database access recovers a confirmation link,
       * and why the first Admin depends on a message actually being delivered.
       * Asserted here so that a future change to make bootstrapping easier
       * cannot quietly make it easier by storing the token.
       */
      const processor = readFileSync(
        "apps/worker/src/outbox.processor.ts",
        "utf8"
      );
      expect(processor).toMatch(/set token_hash = \$1/u);
      expect(processor).toMatch(/digest\(token\)/u);
    });
  });

  describe("what the script is", () => {
    it("runs the real processor rather than a copy of it", () => {
      /*
       * **This is what makes it add no capability.** It is the worker with a
       * dispatcher that prints instead of sends: same processor, same minting,
       * same digest written back. A reimplementation would be a second place
       * where the token is handled, and the second place is always the one that
       * gets it wrong.
       */
      expect(code()).toMatch(/new OutboxProcessor\(/u);
      expect(code()).toMatch(/outbox\.processor\.js/u);
    });

    it("refuses to run without the operator's own credential", () => {
      /*
       * `DATABASE_URL` is the whole gate, and it is enough: anyone holding it
       * can already read and write every row directly, so nothing here is a
       * privilege they did not have. Refusing loudly is better than connecting
       * to whatever `localhost` happens to be.
       */
      expect(code()).toMatch(/DATABASE_URL.*undefined/su);
      expect(code()).toMatch(/process\.exit\(1\)/u);
    });

    it("verifies the database timeouts, like every other entry", () => {
      // I36's check. This writes to the database, and I36 predicted each new
      // entrypoint would have to remember.
      expect(code()).toMatch(/verifyDatabaseTimeouts\(\w/u);
    });

    it("drains to empty rather than one batch", () => {
      /*
       * Unlike the scheduled endpoint there is no function timeout to respect,
       * and an operator wants every pending link rather than the first twenty.
       * The loop ends on an empty batch.
       */
      expect(code()).toMatch(/if \(count === 0\) break;/u);
    });

    it("says what to do when nothing was waiting", () => {
      /*
       * The likeliest way to run this is too early, before registering. An
       * empty answer with no next step reads as a broken script rather than as
       * a missing prerequisite.
       */
      expect(code()).toMatch(/Nothing was waiting/u);
      expect(code()).toMatch(/admin:grant/u);
    });
  });

  describe("where it sits", () => {
    const scripts = (): Record<string, string> =>
      (
        JSON.parse(readFileSync("package.json", "utf8")) as {
          scripts: Record<string, string>;
        }
      ).scripts;

    it("can be run by name", () => {
      expect(scripts()["first-run"]).toBe("node scripts/first-run.mjs");
    });

    it("is linted after the types it needs have been emitted", () => {
      /*
       * **CI caught this and the sandbox could not.**
       *
       * `first-run.mjs` is the first script to import `@commerce/*`. Scripts sit
       * outside every tsconfig project, so those imports resolve through
       * `node_modules` to each package's `dist` — which does not exist on a
       * clean checkout. `verify` ran `lint` before `typecheck`, so on CI the
       * type-aware rules saw nineteen unresolved types and refused, while here
       * they saw a `dist` left over from an earlier build and passed.
       *
       * **The ordering was a latent bug in the chain rather than in the
       * script**: a type-aware linter was being run before the types existed,
       * and every type-aware rule silently degrades to "unresolved" in that
       * state. It went unnoticed only because nothing linted outside a project
       * had ever imported a workspace package.
       *
       * `typecheck` is `tsc -b`, which emits. Running it first is what gives
       * lint something to read. Asserted as an order rather than a presence,
       * because both were already present.
       */
      const verify = scripts()["verify"] ?? "";
      expect(verify.indexOf("typecheck")).toBeGreaterThan(-1);
      expect(verify.indexOf("typecheck")).toBeLessThan(verify.indexOf("lint"));
    });

    it("is not in `verify`, because it writes to a real database", () => {
      // Same separation as `smoke`: `verify` proves the code and never touches
      // a deployment's data.
      expect(scripts()["verify"]).not.toContain("first-run");
    });

    it("is an operator script, not a route", () => {
      /*
       * **The property that matters most.** Everything this does would be a
       * serious hole as an HTTP endpoint — it hands out confirmation links —
       * and nothing but its location stops somebody adding one. Asserted as the
       * absence of any new entry file beside the ones I37 and I38 declared.
       */
      const entries = ["apps/api/api", "apps/worker/api"].flatMap((dir) =>
        readdirSync(dir).map((name) => `${dir}/${name}`)
      );
      expect(entries.sort()).toEqual([
        "apps/api/api/index.js",
        "apps/worker/api/outbox.js",
        "apps/worker/api/sweep.js"
      ]);
    });
  });

  describe("what a deployment is told", () => {
    it("documents the bootstrap as a sequence rather than a hint", () => {
      /*
       * A fresh deployment is unusable until an Admin exists, and the steps are
       * not guessable: register through the real screen, run this, open the
       * link, grant, then **enter the Admin context** — which is a separate act
       * and the one that surprises, because authorization alone answers 403.
       */
      const guide = readFileSync(
        "docs/implementation/DEPLOYING_TO_VERCEL.md",
        "utf8"
      );
      expect(guide).toMatch(/npm run first-run/u);
      expect(guide).toMatch(/ADMIN_CONTEXT_REQUIRED/u);
    });
  });
});
