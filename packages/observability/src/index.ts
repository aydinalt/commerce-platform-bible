import pino, { type Level, type Logger } from "pino";

/**
 * Metrics, in the Prometheus text exposition format.
 *
 * Engineering Constitution §12.2 requires every production component to expose
 * metrics appropriate to its role, and none existed. §12.2 also warns that "a
 * metric is useful only when its meaning, unit, owner, and response are
 * understood", which is why every series this repository publishes carries a
 * `HELP` line saying what to do about it rather than only what it counts.
 *
 * **Written here rather than taken from `prom-client`.** The set is counters and
 * gauges with no histograms, which is perhaps sixty lines of formatting — and
 * `prom-client` would also register default process metrics that nobody has
 * decided to publish. If a latency histogram is ever wanted, that trade reverses
 * and the dependency is the right answer.
 */

/** Prometheus reserves backslash, double quote and newline inside a label. */
function escapeLabelValue(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"')
    .replaceAll("\n", "\\n");
}

export interface MetricSample {
  labels?: Record<string, string>;
  value: number;
}

export interface MetricSeries {
  help: string;
  kind: "counter" | "gauge";
  name: string;
  samples: MetricSample[];
}

/**
 * Renders one scrape.
 *
 * A series with no samples still prints its `HELP` and `TYPE`, so a scraper sees
 * that the series exists and is currently empty rather than that it has gone
 * away — the two mean very different things when an alert is written against it.
 */
export function renderMetrics(series: MetricSeries[]): string {
  const lines: string[] = [];
  for (const metric of series) {
    lines.push(`# HELP ${metric.name} ${metric.help}`);
    lines.push(`# TYPE ${metric.name} ${metric.kind}`);
    for (const sample of metric.samples) {
      const labels = Object.entries(sample.labels ?? {})
        .map(([key, value]) => `${key}="${escapeLabelValue(value)}"`)
        .join(",");
      lines.push(
        `${metric.name}${labels === "" ? "" : `{${labels}}`} ${sample.value}`
      );
    }
  }
  // Prometheus requires the body to end with a newline.
  return `${lines.join("\n")}\n`;
}

/**
 * The counters a process accumulates in memory.
 *
 * Deliberately tiny and deliberately not a general-purpose metrics library.
 * Everything else this repository publishes is read at scrape time — from the
 * pool object or from the database — so almost nothing needs instrumenting at
 * the call site. These are the exceptions: events that happen and leave no
 * trace anybody could count afterwards.
 */
export class Counters {
  private readonly totals = new Map<string, number>();

  increment(name: string, labels: Record<string, string> = {}): void {
    this.totals.set(
      key(name, labels),
      (this.totals.get(key(name, labels)) ?? 0) + 1
    );
  }

  /** Zero rather than absent, so a series exists before the first event. */
  total(name: string, labels: Record<string, string> = {}): number {
    return this.totals.get(key(name, labels)) ?? 0;
  }
}

function key(name: string, labels: Record<string, string>): string {
  return `${name}|${Object.entries(labels)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join(",")}`;
}

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
