import pino, { type Level, type Logger } from "pino";

export function createLogger(service: string, level: Level): Logger {
  return pino({
    base: { service },
    level,
    redact: {
      paths: [
        "authorization",
        "cookie",
        "*.authorization",
        "*.cookie",
        "*.password",
        "*.token"
      ],
      remove: true
    }
  });
}
