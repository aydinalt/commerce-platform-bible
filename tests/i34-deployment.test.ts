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
        /*
         * **`.mjs` as well, because `scripts/` is where the operator lives.**
         *
         * This walked `.ts` and `.tsx` under `apps`, `packages` and `modules`
         * only, so the eight operator scripts were outside it — and
         * `IMPORT_PASSWORD` and `IMPORT_EMAIL_DOMAIN`, which
         * `import-catalogue.mjs` has read since I85, were undocumented without
         * anything noticing. The file's own header said it was compared
         * against "every `process.env` read in the repository", which was a
         * wider claim than the walk below made good on.
         *
         * An operator following `.env.example` reaches the catalogue import
         * step and finds the one variable it refuses to start without missing
         * from the only list there is — the same failure the environment
         * contract was written to prevent, one directory over.
         */
        if (
          !entry.name.endsWith(".ts") &&
          !entry.name.endsWith(".tsx") &&
          !entry.name.endsWith(".mjs")
        )
          continue;
        const source = readFileSync(path, "utf8");
        /*
         * **Both notations, because the first version saw only one.**
         *
         * `process.env.NAME` was all this matched, and I38 read
         * `process.env["CRON_SECRET"]` — which the detector could not see. That
         * failed in the harmless direction here, reporting a documented
         * variable as invented, but **the same blindness in the other direction
         * is the failure this whole test exists to prevent**: a variable the
         * code reads only through a bracket would have been invisible, and
         * `.env.example` could have gone on not mentioning it.
         *
         * `noPropertyAccessFromIndexSignature` makes the bracket form the
         * correct one for anything not on a known interface, so this was going
         * to happen; it is a property of the codebase rather than of one
         * increment's style.
         */
        for (const [, dotted, bracketed] of source.matchAll(
          /(?:process\.env|\benv)(?:\.([A-Z][A-Z0-9_]+)|\["([A-Z][A-Z0-9_]*)"\])/gu
        )) {
          const name = dotted ?? bracketed;
          if (name !== undefined) found.add(name);
        }
      }
    };
    for (const root of ["apps", "packages", "modules", "scripts"]) walk(root);
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

    /**
     * Every workspace is in the lock file too.
     *
     * **This is the sibling of the assertion above, and it was written after
     * the failure it describes.** `I93` added `modules/editorial` as a new
     * workspace and committed its `package.json`; the `package-lock.json` that
     * `npm install` updated as a side effect was never committed, because the
     * delivery packed the files that were edited on purpose and not the one
     * that changed by itself. CI checked out a lock file that had never heard
     * of the workspace and `npm ci` refused — `EUSAGE`, "Missing:
     * @commerce/editorial@0.0.0 from lock file" — one second into run #169,
     * before a single test ran.
     *
     * Nothing in the repository could have caught that: the Dockerfile
     * assertion above checks the manifest list, `npm install` keeps working
     * locally because it rewrites the lock file on the spot, and the failure
     * only appears on a clean checkout. This reads the lock file the way `npm
     * ci` does, so the next workspace added without its lock entry fails here
     * rather than in CI.
     */
    it("names every workspace in the lock file", () => {
      const lock = JSON.parse(readFileSync("package-lock.json", "utf8")) as {
        packages: Record<string, unknown>;
      };
      const workspaces = ["apps", "packages", "modules"].flatMap((root) =>
        readdirSync(root, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => `${root}/${entry.name}`)
      );
      expect(workspaces.filter((path) => !(path in lock.packages))).toEqual([]);
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
    it("builds the web workspace and the package it imports, and nothing else", () => {
      /*
       * The build command names the workspaces, so a Vercel project pointed at
       * this repository cannot accidentally build the API — which would succeed
       * and then serve nothing, because Vercel has nowhere to run it.
       *
       * **`@commerce/contracts` is built first, and that is not a convenience.**
       * The package publishes `./dist/index.js` through `exports` and `dist/` is
       * ignored by git, so on a clean checkout the file does not exist until
       * `tsc` has run. A command that built only `@commerce/web` left every
       * `@commerce/contracts` import unresolvable and Turbopack stopped with
       * thirty-two `Module not found` errors — **while this suite and CI stayed
       * green**, because the root `build` script runs `--workspaces
       * --if-present` first and Vercel was the only place that did not.
       *
       * It names that one package rather than the root script because
       * `apps/web/package.json` depends on exactly one workspace package. A
       * second one appearing in this string should be a decision somebody made
       * about what the web deployment needs, not a copy of a build that also
       * compiles the API and the worker.
       */
      const config: unknown = JSON.parse(readFileSync("vercel.json", "utf8"));
      expect(config).toMatchObject({
        buildCommand:
          "npm run build --workspace @commerce/contracts && npm run build --workspace @commerce/web",
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

  describe("what a clean checkout can build", () => {
    /*
     * **Every workspace package publishes a `dist/` that git does not carry.**
     *
     * `packages/*` and `modules/*` all declare `exports: "./dist/index.js"` and
     * `types: "./dist/index.d.ts"`, and `.gitignore` names `dist/`. So on a
     * fresh clone — which is what a deployment host has — none of those files
     * exist until something compiles them. A build that compiles only the
     * application resolves nothing and fails with as many errors as there are
     * imports.
     *
     * That is not hypothetical. Vercel's web build failed exactly this way at
     * `bbaba04`: thirty-two `Module not found: Can't resolve
     * '@commerce/contracts'`, while CI stayed green because the root `build`
     * script compiles `--workspaces --if-present` first and Vercel was the only
     * place that did not.
     *
     * The three applications answer it differently because their builders
     * differ, and the cases below hold each to its own answer:
     *
     *   web   `next build`, which is not TypeScript's, so the Vercel build
     *         command names the one package it imports — see *what Vercel is
     *         told* above.
     *   api   `tsc`, which already has the dependency graph in `references`.
     *   worker  the same.
     */
    const manifest = (path: string): Record<string, unknown> =>
      JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;

    /** Package name → its directory, read from the workspaces themselves. */
    const directoryOf = (): Map<string, string> => {
      const found = new Map<string, string>();
      for (const root of ["apps", "packages", "modules"]) {
        for (const entry of readdirSync(root, { withFileTypes: true })) {
          if (!entry.isDirectory()) continue;
          const directory = `${root}/${entry.name}`;
          const name = manifest(`${directory}/package.json`)["name"];
          if (typeof name === "string") found.set(name, directory);
        }
      }
      return found;
    };

    /** The `@commerce/*` packages an application's own source imports. */
    const imported = (directory: string): string[] => {
      const found = new Set<string>();
      const walk = (dir: string): void => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          const path = `${dir}/${entry.name}`;
          if (entry.isDirectory()) {
            walk(path);
            continue;
          }
          if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".tsx"))
            continue;
          for (const [, name] of readFileSync(path, "utf8").matchAll(
            /["'](@commerce\/[a-z-]+)["']/gu
          ))
            if (name !== undefined) found.add(name);
        }
      };
      walk(`${directory}/src`);
      return [...found].sort();
    };

    const declared = (directory: string): string[] =>
      Object.keys(
        (manifest(`${directory}/package.json`)["dependencies"] ?? {}) as Record<
          string,
          string
        >
      )
        .filter((name) => name.startsWith("@commerce/"))
        .sort();

    const referenced = (directory: string): string[] => {
      const paths = (manifest(`${directory}/tsconfig.json`)["references"] ??
        []) as { path: string }[];
      const names = new Map(
        [...directoryOf()].map(([name, dir]) => [dir, name])
      );
      return paths
        .map(
          (entry) => names.get(entry.path.replace("../../", "")) ?? entry.path
        )
        .sort();
    };

    for (const application of ["apps/api", "apps/worker"]) {
      it(`${application} compiles its dependencies, not just itself`, () => {
        /*
         * **`tsc -b`, not `tsc -p`, and the difference is the deployment.**
         *
         * `-p` compiles one project and takes referenced projects' declarations
         * as given — which is correct locally, where a previous build left them
         * there, and wrong on a host that has never built anything. `-b` builds
         * the references first, which is what `references` is for.
         *
         * Measured on a checkout with every `dist/` and `*.tsbuildinfo`
         * removed: `-p` gives the worker twenty-four `TS2307: Cannot find
         * module '@commerce/…'` and exit 2; `-b` gives exit 0 and compiles
         * exactly the six packages the worker declares, and nothing else.
         */
        const build = (
          manifest(`${application}/package.json`)["scripts"] as Record<
            string,
            string
          >
        )["build"];

        expect(build).toBe("tsc -b tsconfig.json");
      });

      it(`${application} declares every workspace package it imports`, () => {
        /*
         * **`apps/api` imported `@commerce/editorial` in two files and declared
         * it nowhere** — not in its manifest, not in its `references`. It
         * compiled anyway, because npm links every workspace into the root
         * `node_modules` whether or not anybody asked for it, so the import
         * resolved through a package the application had no stated relationship
         * with.
         *
         * Undeclared is not harmless once the build follows the declaration:
         * `tsc -b` compiles what `references` names, and a package named
         * nowhere is a package nobody builds.
         */
        expect(
          imported(application).filter(
            (name) => !declared(application).includes(name)
          )
        ).toEqual([]);
      });

      it(`${application} references every workspace package it declares`, () => {
        /*
         * The manifest and `references` say the same thing to two different
         * readers — npm and TypeScript — and nothing but this keeps them
         * saying it. The build now depends on the second list, so a dependency
         * added to the first alone is a dependency that is not compiled.
         */
        expect(referenced(application)).toEqual(declared(application));
      });
    }
  });
});
