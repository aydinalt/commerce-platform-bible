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
    include: ["tests/**/*.test.ts"],
    testTimeout: 20_000
  }
});
