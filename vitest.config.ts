import { readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * Tests run against workspace sources rather than build output, so the suite
 * never depends on a prior `tsc -b` and can never assert against a stale
 * `dist/`.
 */
function workspaceAliases(): Record<string, string> {
  const aliases: Record<string, string> = {};
  for (const group of ["modules", "packages"]) {
    const groupUrl = new URL(`${group}/`, import.meta.url);
    for (const name of readdirSync(groupUrl)) {
      const entry = new URL(`${name}/src/index.ts`, groupUrl);
      if (existsSync(entry))
        aliases[`@commerce/${name}`] = fileURLToPath(entry);
    }
  }
  return aliases;
}

export default defineConfig({
  /**
   * The web application's own tsconfig sets `jsx: "preserve"`, because Next
   * owns that transform. Tests render components outside Next, so they need a
   * transform that actually produces something runnable.
   */
  oxc: { jsx: "automatic" },
  resolve: { alias: workspaceAliases() },
  test: {
    /**
     * Suites share one PostgreSQL instance, and some of them own global rows:
     * a suite draining the outbox would consume another's event, and clearing
     * the throttle counters would reset another's in mid-assertion. Running
     * files one at a time is the honest fix — the shared database is the real
     * constraint, not the test code.
     */
    fileParallelism: false,
    /**
     * The hooks get the budget the test bodies already had, and they are the
     * step that needs it more.
     *
     * `testTimeout` was raised to twenty seconds deliberately; `hookTimeout`
     * was left at Vitest's default of **ten**, which put the heavier half of
     * every integration suite on the shorter clock. **Ninety test files boot
     * the whole Nest application inside `beforeAll`** — compile, wire every
     * module, open the pool — and most of them then register an account,
     * drain the outbox and confirm it before the first case runs. The test
     * bodies that got twenty seconds are usually one query.
     *
     * Measured rather than assumed: two files timed out at exactly
     * `Hook timed out in 10000ms` while this was being written, and one of
     * them passed three times in a row immediately afterwards. That is the
     * signature of a budget sitting near the real cost rather than of a
     * defect — and it fails **the first suite of a run**, which is a different
     * file each time and lands on whichever commit is unlucky.
     *
     * Thirty rather than twenty, because a hook that is cut off takes its
     * whole file's cases with it as `skipped`: the cost of being wrong here is
     * an entire suite reported as red without a single assertion having run.
     * It is a ceiling on waiting, not a target — nothing slow becomes
     * acceptable by being allowed to finish.
     */
    hookTimeout: 30_000,
    include: ["tests/**/*.test.ts"],
    testTimeout: 20_000
  }
});
