import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import type { Server } from "node:http";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { DEFAULT_RESERVE_MS, drainOutbox } from "../apps/worker/src/drain.js";
import { outboxHandler } from "../apps/worker/src/handler.js";

/**
 * The worker as scheduled invocations (I38).
 *
 * **Until this existed no email was ever sent on the platform the Owner chose.**
 * The worker is a `while (running)` loop and Vercel has nowhere to loop, so
 * registration confirmations would have sat unread in the outbox and nobody
 * could have completed a sign-up. A deployment made before this would have
 * looked healthy and been unusable — the failure nobody notices, which is the
 * kind this repository keeps finding.
 *
 * `main.ts` stays a loop. This is the same draining entered by a scheduler, the
 * arrangement I37 made for the API: **a staged hosting decision is only
 * reversible while both shapes exist.**
 */
describe("Increment I38 the scheduled worker", () => {
  describe("draining inside a budget", () => {
    /** A processor that reports a fixed backlog, one batch at a time. */
    const backlog = (batches: number[]) => {
      let index = 0;
      return {
        processBatch: () => Promise.resolve(batches[index++] ?? 0)
      };
    };

    it("stops when the outbox is empty", async () => {
      const result = await drainOutbox({
        budgetMs: 600_000,
        processor: backlog([20, 20, 3, 0])
      });
      expect(result).toEqual({ batches: 4, delivered: 43, drained: true });
    });

    it("stops before a batch it could not finish", async () => {
      /*
       * **The whole reason this takes a budget.** A function is killed when it
       * exceeds its duration, mid-statement and without warning. `processBatch`
       * marks what it delivered before returning, so a kill *between* batches
       * loses nothing — but a kill *inside* one is a delivery whose outcome
       * nobody recorded, and the outbox's retry then sends it again.
       *
       * The clock is driven rather than waited on, so this measures the
       * decision rather than the machine.
       */
      let clock = 0;
      const result = await drainOutbox({
        budgetMs: DEFAULT_RESERVE_MS * 3,
        now: () => {
          clock += DEFAULT_RESERVE_MS;
          return clock;
        },
        processor: backlog([20, 20, 20, 20, 20])
      });

      expect(result.drained).toBe(false);
      expect(result.batches).toBeLessThan(5);
    });

    it("does nothing at all when the budget cannot hold one batch", async () => {
      /*
       * Checked before the first batch too. A budget smaller than one batch
       * should start no work rather than start work it cannot finish, and the
       * boundary is where an off-by-one would hide.
       */
      let called = 0;
      const result = await drainOutbox({
        budgetMs: 1,
        processor: {
          processBatch: () => {
            called += 1;
            return Promise.resolve(0);
          }
        }
      });
      expect(called).toBe(0);
      expect(result).toEqual({ batches: 0, delivered: 0, drained: false });
    });

    it("reports when it did not finish, rather than reporting success", async () => {
      /*
       * `drained: false` is not a failure — it is the number an operator needs.
       * **An outbox that never reports `true` is one the schedule cannot keep
       * up with**, and that is invisible if a partial drain answers the same as
       * a complete one.
       */
      let clock = 0;
      const result = await drainOutbox({
        budgetMs: DEFAULT_RESERVE_MS * 2,
        now: () => {
          clock += DEFAULT_RESERVE_MS;
          return clock;
        },
        processor: backlog([5, 5, 5, 5])
      });
      expect(result.drained).toBe(false);
      expect(result.delivered).toBeGreaterThan(0);
    });
  });

  describe("who may invoke it", () => {
    let server: Server;
    let origin: string;

    beforeAll(async () => {
      server = createServer((request, response) => {
        void outboxHandler(request, response);
      });
      await new Promise<void>((resolve) => {
        server.listen(0, "127.0.0.1", resolve);
      });
      const address = server.address();
      if (address === null || typeof address === "string")
        throw new Error("the test server did not take a port");
      origin = `http://127.0.0.1:${String(address.port)}`;
    });

    afterAll(async () => {
      delete process.env["CRON_SECRET"];
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error === undefined) resolve();
          else reject(error);
        });
      });
    });

    it("answers 404 with no secret set, rather than running", async () => {
      /*
       * **An unset `CRON_SECRET` must never match.** A deployment that forgot
       * one gets an endpoint nobody can reach, rather than one everybody can —
       * and this endpoint sends real email and deletes real rows, so an open
       * one is a way to exhaust a mail quota from the outside.
       */
      delete process.env["CRON_SECRET"];
      const response = await fetch(`${origin}/api/outbox`);
      expect(response.status).toBe(404);
    });

    it("answers 404 to a wrong secret, not 401", async () => {
      /*
       * I19 decided this for `/metrics` and the reason carries: **`401`
       * confirms there is something here to be authorised against.** A
       * scheduled endpoint's existence is not worth announcing to somebody
       * walking paths.
       */
      process.env["CRON_SECRET"] = "the-real-secret";
      const response = await fetch(`${origin}/api/outbox`, {
        headers: { authorization: "Bearer not-the-secret" }
      });
      expect(response.status).toBe(404);
    });

    it("answers 404 to a secret of the wrong length", async () => {
      /*
       * `timingSafeEqual` **throws** when the buffers differ in length, so the
       * lengths are compared first. Without that check this endpoint would
       * answer 500 to a short token — which is a different answer from the one
       * a wrong token gets, and therefore an oracle for the secret's length.
       */
      process.env["CRON_SECRET"] = "the-real-secret";
      const response = await fetch(`${origin}/api/outbox`, {
        headers: { authorization: "Bearer short" }
      });
      expect(response.status).toBe(404);
    });

    it("ignores a secret sent without the Bearer scheme", async () => {
      // The scheduler sends `Bearer <secret>`. Accepting a bare value would
      // widen what counts as authorised for no benefit.
      process.env["CRON_SECRET"] = "the-real-secret";
      const response = await fetch(`${origin}/api/outbox`, {
        headers: { authorization: "the-real-secret" }
      });
      expect(response.status).toBe(404);
    });

    it("runs and reports counts when the secret matches", async () => {
      process.env["CRON_SECRET"] = "the-real-secret";
      const response = await fetch(`${origin}/api/outbox`, {
        headers: { authorization: "Bearer the-real-secret" }
      });
      expect(response.status).toBe(200);
      /*
       * Read into `unknown` and narrowed by hand rather than matched with
       * `expect.any`. What comes back over a socket is not typed by anything,
       * and `expect.any(Number)` is itself `any` — so the looser assertion is
       * also the one that stops type checking noticing a shape change.
       */
      const body = (await response.json()) as Record<string, unknown>;
      expect(typeof body["batches"]).toBe("number");
      expect(typeof body["delivered"]).toBe("number");
      expect(typeof body["drained"]).toBe("boolean");
    });
  });

  describe("how it is wired", () => {
    /** Comments and imports stripped — I36's finding, kept. */
    const source = (path: string): string =>
      readFileSync(path, "utf8")
        .replaceAll(/\/\*[\s\S]*?\*\//gu, "")
        .replaceAll(/^\s*\/\/.*$/gmu, "")
        .replaceAll(/^import[\s\S]*?;$/gmu, "");

    const config = (): {
      crons?: { path: string; schedule: string }[];
    } =>
      JSON.parse(readFileSync("apps/worker/vercel.json", "utf8")) as {
        crons?: { path: string; schedule: string }[];
      };

    it("schedules the two jobs separately", () => {
      /*
       * **The cadence had to move into the schedule.** In the loop the sweep is
       * gated by a five-minute timer and the outbox polls every two seconds; a
       * function has no memory between invocations, so `sweptAt` is always zero
       * in a fresh process and one shared endpoint would sweep on every tick.
       */
      const paths = (config().crons ?? []).map((entry) => entry.path).sort();
      expect(paths).toEqual(["/api/outbox", "/api/sweep"]);
    });

    it("sweeps less often than it delivers", () => {
      // Nothing waits on a deleted row. Sweeping as often as delivering would
      // buy nothing and cost a table-wide scan every minute.
      const crons = config().crons ?? [];
      const outbox = crons.find((entry) => entry.path === "/api/outbox");
      const sweep = crons.find((entry) => entry.path === "/api/sweep");
      expect(outbox?.schedule).toBe("* * * * *");
      expect(sweep?.schedule).not.toBe("* * * * *");
    });

    it("keeps the loop, so the hosting decision stays reversible", () => {
      /*
       * The Owner chose Vercel *first*, not Vercel *only*. Deleting the loop
       * would quietly convert that into a permanent choice, and the loop is
       * also what the Dockerfile starts.
       */
      expect(source("apps/worker/src/main.ts")).toMatch(/while \(running\)/u);
    });

    it("builds one dispatcher for both entries", () => {
      /*
       * **The duplicate this avoids is the worst kind.** Two copies of "does
       * this deployment send real mail" could disagree, and the disagreement
       * would be one deployment silently writing every registration to a log
       * while looking healthy.
       */
      for (const path of [
        "apps/worker/src/main.ts",
        "apps/worker/src/handler.ts"
      ])
        expect(source(path)).toMatch(/buildDispatcher\(\w/u);
    });

    it("verifies the database timeouts, like the other two entries", () => {
      // I36's check, at the fourth entrypoint. The sweep is the one statement
      // that scans whole tables.
      expect(source("apps/worker/src/handler.ts")).toMatch(
        /verifyDatabaseTimeouts\(\w/u
      );
    });

    it("is reachable from the files Vercel invokes", () => {
      for (const [file, name] of [
        ["apps/worker/api/outbox.js", "outboxHandler"],
        ["apps/worker/api/sweep.js", "sweepHandler"]
      ]) {
        const entry = readFileSync(String(file), "utf8");
        expect(entry).toContain("../dist/handler.js");
        expect(entry).toContain(String(name));
      }
    });
  });
});
