/*
 * The scheduled outbox drain (I38).
 *
 * Plain JavaScript pointing at the compiled output, for the same reason as the
 * API's entry: `apps/worker/tsconfig.json` sets `rootDir: "src"`, and
 * `dist/main.js` is what the Dockerfile and the process host start.
 */
export { outboxHandler as default } from "../dist/handler.js";
