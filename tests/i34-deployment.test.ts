import { readFileSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * The deployment's own contract (I34).
 *
 * The Owner chose Vercel with managed Postgres on 2026-08-24, which covers one
 * of three services. **Vercel runs functions; the NestJS API is a process and
 * the worker is a loop**, so the other two need an image and a host that runs
 * one.
 *
 * These cases check the *content* of files that describe a deployment. **Nothing
 * here has ever run** — no image built, no `vercel.json` read by Vercel, no
 * migration applied to a hosted database — and a test that reads a Dockerfile is
 * not evidence that it builds. What it is evidence of is the two things that go
 * wrong silently: a variable nothing documents, and a workspace nobody copied.
 */
describe("Increment I34 deployment", () => {
  /** Every `process.env` read in the repository's own source. */
  const read = (): string[] => {
    const found = new Set<string>();
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = `${dir}/${entry.name}`;
        if (entry.isDirectory()) {
          if (entry.name === "node_modules" || entry.name === "dist") continue;
          walk(path);
          continue;
        }
        if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".tsx"))
          continue;
        const source = readFileSync(path, "utf8");
        for (const [, name] of source.matchAll(
          /(?:process\.env|\benv)\.([A-Z][A-Z0-9_]+)/gu
        ))
          if (name !== undefined) found.add(name);
      }
    };
    for (const root of ["apps", "packages", "modules"]) walk(root);
    return [...found].sort();
  };

  const documented = (): string[] =>
    [...readFileSync(".env.example", "utf8").matchAll(/^([A-Z][A-Z0-9_]*)=/gmu)]
      .map(([, name]) => name ?? "")
      .sort();

  describe("the environment contract", () => {
    it("documents every variable the code reads", () => {
      /*
       * **Nine were missing and two of them stop production from starting.**
       * `EMAIL_TRANSPORT` and `CHAT_TRANSPORT` default to `development` and
       * both adapters throw when `NODE_ENV=production` — deliberately, since
       * I13 and I15. So a deployment following `.env.example` exactly would
       * have failed at boot with an error naming a variable the file had never
       * heard of.
       *
       * `.env.example` is the only instruction sheet a deployment has, and an
       * instruction sheet missing the step that fails is worse than none.
       */
      const missing = read().filter((name) => !documented().includes(name));
      expect(missing).toEqual([]);
    });

    it("documents nothing the code ignores", () => {
      /*
       * The other direction, and it is not symmetry for its own sake.
       * `WEB_PORT` was documented and read by nothing — Next reads `PORT` — so
       * somebody could set it, watch nothing happen, and have no way to tell
       * whether the variable or their value was wrong. **A variable that does
       * nothing is worse than an absent one**, because absence is visible.
       */
      const invented = documented().filter((name) => !read().includes(name));
      expect(invented).toEqual([]);
    });

    it("marks what production must set", () => {
      // A list of twenty-three names with no priority is a list somebody reads
      // once. `R` is what turns it into a checklist.
      const file = readFileSync(".env.example", "utf8");
      for (const required of [
        "DATABASE_URL",
        "ALLOWED_ORIGINS",
        "PUBLIC_WEB_URL",
        "EMAIL_TRANSPORT",
        "CHAT_TRANSPORT"
      ])
        expect(file).toMatch(
          new RegExp(`# R[\\s\\S]{0,600}?^${required}=`, "mu")
        );
    });
  });

  describe("the image the two processes run in", () => {
    const dockerfile = () => readFileSync("Dockerfile", "utf8");

    it("copies every workspace manifest", () => {
      /*
       * **Three were missing** — `analytics`, `audit` and `catalog` — because
       * the list was written from memory. `npm ci` would have failed on the
       * first build, after somebody waited for it.
       *
       * A hand-maintained list of the workspaces is a list that goes stale, so
       * it is compared against the directories rather than trusted.
       */
      const workspaces = ["apps", "packages", "modules"].flatMap((root) =>
        readdirSync(root, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => `${root}/${entry.name}`)
      );
      const copied = dockerfile();
      expect(
        workspaces.filter((path) => !copied.includes(`${path}/package.json`))
      ).toEqual([]);
    });

    it("runs as somebody other than root", () => {
      // The base image ships a `node` user. Using it costs nothing and means a
      // compromise inside the process is not a compromise of the container.
      expect(dockerfile()).toMatch(/^USER node$/mu);
    });

    it("lets the process be PID 1 so a deploy can stop it", () => {
      /*
       * `exec` is the whole line. Without it a shell sits between the host and
       * node, swallows SIGTERM, and every deploy waits out the kill timeout
       * instead of shutting down — which looks like a slow platform rather than
       * a missing word.
       *
       * **The first version of this Dockerfile had the comment and not the
       * `exec`.** The prose described the fix while the command did the thing
       * it warned about.
       */
      expect(dockerfile()).toMatch(/CMD \[.*exec node apps\/\$\{SERVICE\}/u);
    });

    it("names which service it is at build rather than at run", () => {
      // A host that starts the wrong one should fail while somebody is
      // watching, not at 3am.
      expect(dockerfile()).toMatch(/^ARG SERVICE=api$/mu);
    });
  });

  describe("what Vercel is told", () => {
    it("builds the web workspace and nothing else", () => {
      /*
       * The build command names the workspace, so a Vercel project pointed at
       * this repository cannot accidentally build the API — which would succeed
       * and then serve nothing, because Vercel has nowhere to run it.
       */
      const config: unknown = JSON.parse(readFileSync("vercel.json", "utf8"));
      expect(config).toMatchObject({
        buildCommand: "npm run build --workspace @commerce/web",
        framework: "nextjs",
        outputDirectory: "apps/web/.next"
      });
    });
  });

  describe("when the database changes", () => {
    it("has a deploy command that is not tied to a build", () => {
      /*
       * **Migrations are a release step, not a build step and not a boot step.**
       *
       * Not the Vercel build: it builds the web, has no reason to hold the
       * database's credentials, and runs again on every preview deployment —
       * thirty preview branches would each migrate production.
       *
       * Not at API boot: two instances starting together race, and an instance
       * that cannot migrate refuses traffic it could have served.
       *
       * This asserts only that the command exists and stands alone. **It has
       * never run against a hosted database**, and cannot run here at all:
       * `binaries.prisma.sh` answers 403 in this environment, which is why
       * `db:deploy` has been proven in CI and nowhere else since I14.
       */
      const scripts = (
        JSON.parse(readFileSync("package.json", "utf8")) as {
          scripts: Record<string, string>;
        }
      ).scripts;

      expect(scripts["db:deploy"]).toBe("prisma migrate deploy");
      // Not reachable from the build, which is what keeps a preview deployment
      // from touching a production database.
      expect(scripts["build"] ?? "").not.toContain("db:deploy");
      expect(readFileSync("vercel.json", "utf8")).not.toContain("db:deploy");
    });
  });
});
