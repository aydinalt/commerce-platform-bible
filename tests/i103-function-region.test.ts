import { existsSync, readFileSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * Where the functions run (I103).
 *
 * **The Owner created the production Supabase project in `eu-central-1` on
 * 2026-09-26**, and none of the three `vercel.json` files named a region.
 * Vercel's default is `iad1`, Washington D.C. — so every one of the three
 * services would have run a continent away from its own database, and each
 * query would have crossed the Atlantic twice.
 *
 * **That is a failure nothing else here would have caught.** The build is
 * green, the deployment succeeds, the smoke checks in `DEPLOYING_TO_VERCEL.md`
 * all pass; the platform is merely slow, in a way that looks like the code
 * being slow. The region is configuration, so the only place it can be held is
 * a test that reads the configuration — the shape `tests/i38` uses for the cron
 * expressions and for the same reason.
 *
 * `fra1` is Vercel's Frankfurt region and Supabase's `eu-central-1` is AWS
 * Frankfurt: the same city, which is as close as the two vendors' region names
 * get to each other.
 *
 * **This file asserts the exact set of configuration files, not a list of three
 * paths.** A fourth Vercel project added later would otherwise be unpinned and
 * silently default to Washington — the same class of gap as a rule with more
 * than one owner, which this repository has now found often enough to check for
 * by habit.
 */
describe("Increment I103 the function region", () => {
  /** Where a Vercel project root could be: the repository root, or a workspace. */
  const searched = [
    ".",
    ...["apps", "modules", "packages"].flatMap((group) =>
      readdirSync(group, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => `${group}/${entry.name}`)
    )
  ];

  const configs = (): string[] =>
    searched
      .map((directory) => `${directory}/vercel.json`.replace(/^\.\//u, ""))
      .filter((path) => existsSync(path));

  const regions = (path: string): unknown =>
    (JSON.parse(readFileSync(path, "utf8")) as { regions?: unknown }).regions;

  it("finds exactly the three deployed projects and no unpinned fourth", () => {
    /*
     * The set rather than a membership check. `toContain` per path would pass
     * for a repository that had grown a fourth `vercel.json` nobody pinned,
     * which is precisely the case this file exists to refuse.
     */
    expect(configs().sort()).toEqual([
      "apps/api/vercel.json",
      "apps/worker/vercel.json",
      "vercel.json"
    ]);
  });

  it("names one region in every project, and the same one", () => {
    /*
     * **Same, because the three talk to each other.** The web application
     * calls the API on every server-rendered page (`API_BASE_URL`), so a web
     * project in Frankfurt and an API project in Washington would put an
     * ocean inside a single page render — twice, once to the API and once
     * again from the API to the database.
     */
    const named = configs().map(regions);
    expect(named).not.toContain(undefined);
    expect(new Set(named.map((value) => JSON.stringify(value))).size).toBe(1);
  });

  it("asks for a single region, which is all the Hobby plan allows", () => {
    /*
     * **The Owner chose Hobby on 2026-09-25 and ruled out paid upgrades**
     * (`DEPLOYING_TO_VERCEL.md`). Hobby permits one function region; a second
     * entry is a deployment that does not happen, which is the same failure
     * mode I38 recorded for a too-frequent cron — refused at deploy time
     * rather than quietly reduced.
     */
    for (const path of configs()) {
      const value = regions(path);
      expect(Array.isArray(value)).toBe(true);
      expect(value).toHaveLength(1);
    }
  });

  it("puts the functions in the same city as the database", () => {
    /*
     * The database is the reason the number is this one, so the assertion
     * names the database rather than just the region: `eu-central-1` is AWS
     * Frankfurt and `fra1` is Vercel Frankfurt. If the Owner ever moves the
     * Supabase project, this case is the one that should fail.
     *
     * It is also the KVKK-defensible answer — personal data and the functions
     * that read it stay inside the EU — which is a reason not to change it
     * without a decision recorded somewhere other than a config file.
     */
    for (const path of configs()) expect(regions(path)).toEqual(["fra1"]);
  });
});
