import { z } from "zod";

const logLevelSchema = z.enum([
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace"
]);

export type ProcessName = "api" | "worker";

export interface RuntimeConfig {
  readonly host: string;
  readonly logLevel: z.infer<typeof logLevelSchema>;
  readonly port: number;
}

export function loadRuntimeConfig(processName: ProcessName): RuntimeConfig {
  const port = processName === "api" ? process.env.API_PORT : undefined;

  return {
    host: process.env.API_HOST ?? "0.0.0.0",
    logLevel: logLevelSchema.parse(process.env.LOG_LEVEL ?? "info"),
    port: z.coerce
      .number()
      .int()
      .positive()
      .parse(port ?? 4000)
  };
}
