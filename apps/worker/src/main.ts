import { loadRuntimeConfig } from "@commerce/config";
import { createLogger } from "@commerce/observability";

const config = loadRuntimeConfig("worker");
const logger = createLogger("worker", config.logLevel);

logger.info("worker ready");

const stop = (signal: NodeJS.Signals): void => {
  logger.info({ signal }, "worker stopping");
  process.exitCode = 0;
};

process.once("SIGINT", stop);
process.once("SIGTERM", stop);
