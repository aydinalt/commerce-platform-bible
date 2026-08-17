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

/**
 * Which dispatcher the worker builds.
 *
 * `development` is the adapter that records a message instead of sending one,
 * and it refuses to construct in production. Every other value names a vendor
 * adapter, and adding one extends this list — so a deployment that names an
 * adapter nobody wrote fails at boot with the name it was given, rather than
 * starting and quietly delivering nothing.
 */
export const EMAIL_TRANSPORTS = ["development", "http"] as const;

export type EmailTransport = (typeof EMAIL_TRANSPORTS)[number];

export interface EmailConfig {
  /** Absent for the development transport, required for any real one. */
  readonly apiKey: string | undefined;
  readonly sender: string | undefined;
  readonly timeoutMs: number;
  readonly transport: EmailTransport;
}

/**
 * Reads the email configuration, and refuses a deployment that cannot deliver.
 *
 * The port has always said the vendor is a deployment decision rather than a
 * code decision, and until now it was neither: the worker named its dispatcher
 * in a source file. This is the missing half — the decision arrives as
 * configuration, and the shape of it is checked before the process is running
 * rather than at the first registration.
 *
 * A production deployment that names `http` without a credential or a sender
 * fails here. That is deliberate and it is the whole point of validating at
 * boot: the alternative is a worker that starts, looks healthy, and turns every
 * registration into a retry nobody is watching.
 */
export function loadEmailConfig(
  environment = process.env.NODE_ENV ?? "development"
): EmailConfig {
  const transport = z
    .enum(EMAIL_TRANSPORTS)
    .parse(process.env.EMAIL_TRANSPORT ?? "development");

  const config: EmailConfig = {
    apiKey: process.env.EMAIL_API_KEY,
    sender: process.env.EMAIL_SENDER,
    timeoutMs: z.coerce
      .number()
      .int()
      .positive()
      .parse(process.env.EMAIL_TIMEOUT_MS ?? 10_000),
    transport
  };

  if (transport === "development") {
    // The adapter itself also refuses, which is the check that matters. This
    // one exists so the refusal names the configuration rather than the class.
    if (environment === "production")
      throw new Error("EMAIL_TRANSPORT_DEVELOPMENT_IN_PRODUCTION");
    return config;
  }

  if (config.apiKey === undefined || config.apiKey === "")
    throw new Error("EMAIL_API_KEY_MISSING");
  if (config.sender === undefined || config.sender === "")
    throw new Error("EMAIL_SENDER_MISSING");

  return config;
}

/**
 * The Decision Chat transports, on the same terms as the email ones.
 *
 * `development` is the adapter that restates the brief and adds nothing, and it
 * refuses to construct in production. Every other value names a vendor adapter.
 */
export const CHAT_TRANSPORTS = ["development", "http"] as const;

export type ChatTransport = (typeof CHAT_TRANSPORTS)[number];

export interface ChatConfig {
  /** Absent for the development transport, required for any real one. */
  readonly apiKey: string | undefined;
  readonly model: string | undefined;
  readonly timeoutMs: number;
  readonly transport: ChatTransport;
}

/**
 * Reads the assistant configuration, and refuses a deployment that cannot ask.
 *
 * The timeout defaults lower than email's. An undelivered message waits in a
 * queue nobody is watching; an unanswered question has somebody sitting in
 * front of it, and a wait long enough to be worth retrying is already long
 * enough to have lost them.
 */
export function loadChatConfig(
  environment = process.env.NODE_ENV ?? "development"
): ChatConfig {
  const transport = z
    .enum(CHAT_TRANSPORTS)
    .parse(process.env.CHAT_TRANSPORT ?? "development");

  const config: ChatConfig = {
    apiKey: process.env.CHAT_API_KEY,
    model: process.env.CHAT_MODEL,
    timeoutMs: z.coerce
      .number()
      .int()
      .positive()
      .parse(process.env.CHAT_TIMEOUT_MS ?? 8_000),
    transport
  };

  if (transport === "development") {
    if (environment === "production")
      throw new Error("CHAT_TRANSPORT_DEVELOPMENT_IN_PRODUCTION");
    return config;
  }

  if (config.apiKey === undefined || config.apiKey === "")
    throw new Error("CHAT_API_KEY_MISSING");
  // Named separately from the credential because a deployment that has the key
  // and not the model is the likelier mistake, and one error saying "something
  // is missing" makes an operator guess which.
  if (config.model === undefined || config.model === "")
    throw new Error("CHAT_MODEL_MISSING");

  return config;
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
