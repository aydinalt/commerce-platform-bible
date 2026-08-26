import { loadRuntimeConfig } from "@commerce/config";
import { createDatabasePool, verifyDatabaseTimeouts } from "@commerce/database";

import { createApiApp } from "./bootstrap.js";

const config = loadRuntimeConfig("api");

/**
 * Prove the timeouts before serving anything (I36).
 *
 * A pool of its own, opened and closed here rather than the one the application
 * holds. The application's pool is built inside the Nest container and this runs
 * before the container exists, so borrowing it would mean reaching into the
 * module graph from outside — and one connection for one query is cheaper than
 * the coupling.
 *
 * **This throws and the process ends.** Refusing to start is the point: a
 * transaction pooler can drop the `options` parameter that carries
 * `statement_timeout` and answer the connection anyway, and an API serving
 * traffic without a statement timeout is one slow query away from holding every
 * connection in its pool.
 */
const probe = createDatabasePool((error) => {
  process.stderr.write(`${error.message}\n`);
});
try {
  await verifyDatabaseTimeouts(probe);
} finally {
  await probe.end();
}

const app = await createApiApp(config);

await app.listen(config.port, config.host);
