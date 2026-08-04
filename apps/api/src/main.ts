import { loadRuntimeConfig } from "@commerce/config";

import { createApiApp } from "./bootstrap.js";

const config = loadRuntimeConfig("api");
const app = await createApiApp(config);

await app.listen(config.port, config.host);
