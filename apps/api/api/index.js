/*
 * What Vercel invokes (I37).
 *
 * Vercel's Node runtime serves each file in a project's `api/` directory as a
 * function, so this is the whole surface: one entry, delegating to the handler
 * that builds the same application `main.ts` does.
 *
 * **Plain JavaScript, pointing at the compiled output, and both halves of that
 * are deliberate.** `apps/api/tsconfig.json` sets `rootDir: "src"`, so a
 * TypeScript file here would either be excluded from the build or force the
 * output layout to move — and `dist/main.js` is what the Dockerfile and the
 * process host start. A `.js` file importing `../dist/` disturbs neither, and
 * the API's own `build` script is what produces what it imports.
 *
 * This file is why the API is **its own Vercel project** rather than part of
 * the web's. Vercel serves a root `api/` directory itself, and a Next.js
 * project already owns its routing; the two conflict, and the documented
 * answer is two projects — which a monorepo supports, with each project's Root
 * Directory pointing at its workspace.
 */
export { default } from "../dist/handler.js";
