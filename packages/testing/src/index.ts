import pino, { type Logger } from "pino";

export function createCorrelationId(): string {
  return "00000000-0000-4000-8000-000000000000";
}

/**
 * A logger that writes nothing.
 *
 * The outbox processor logs each delivery with its correlation identifier
 * (§12.3), which is the point of the column — but sixty-four suites drive it
 * only to move mail along, and their output is not what any of them assert.
 * Silent here so the log lines stay in production where they are read, rather
 * than being removed to keep a test run quiet.
 */
export function silentLogger(): Logger {
  return pino({ level: "silent" });
}
