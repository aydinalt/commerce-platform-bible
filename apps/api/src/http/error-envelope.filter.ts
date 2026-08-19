import { randomUUID } from "node:crypto";

import {
  Catch,
  HttpException,
  HttpStatus,
  type ArgumentsHost,
  type ExceptionFilter
} from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";

import { errorEnvelopeSchema, type ErrorEnvelope } from "@commerce/contracts";
import { Counters } from "@commerce/observability";

import { DB_TIMEOUT } from "../metrics/metrics.collector.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

// Framework-raised failures need codes too. Labelling a 413 as INTERNAL_ERROR
// would tell a client to retry a request that can never succeed unchanged.
const CODE_BY_STATUS = new Map<number, string>([
  [HttpStatus.BAD_REQUEST, "VALIDATION_FAILED"],
  [HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED"],
  [HttpStatus.FORBIDDEN, "FORBIDDEN"],
  [HttpStatus.NOT_FOUND, "NOT_FOUND"],
  [HttpStatus.METHOD_NOT_ALLOWED, "METHOD_NOT_ALLOWED"],
  [HttpStatus.CONFLICT, "CONFLICT"],
  [HttpStatus.PAYLOAD_TOO_LARGE, "PAYLOAD_TOO_LARGE"],
  [HttpStatus.UNSUPPORTED_MEDIA_TYPE, "UNSUPPORTED_MEDIA_TYPE"],
  [HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMITED"],
  [HttpStatus.SERVICE_UNAVAILABLE, "DEPENDENCY_UNAVAILABLE"]
]);

interface ExceptionPayload {
  code?: unknown;
  fieldErrors?: unknown;
  message?: unknown;
}

/** `query_canceled`, which is what `statement_timeout` raises. */
const STATEMENT_TIMEOUT_CODE = "57014";

/**
 * Which kind of timeout a failure is, or `null` if it is not one.
 *
 * The two are distinguished rather than merged because they call for different
 * responses: statements outgrowing five seconds is a query problem, and a pool
 * that cannot hand out a connection is a capacity one.
 *
 * Two shapes, because the two timeouts arrive differently. `statement_timeout`
 * comes back from the server with a SQLSTATE; the pool's acquisition timeout
 * never reaches the server at all and `pg` throws a plain `Error` whose message
 * is the only thing distinguishing it. Matching that message is unpleasant and
 * is the reason this is one named function rather than a condition inlined at
 * the call site: when `pg` changes the wording, exactly one place is wrong.
 */
function dependencyTimeout(
  exception: unknown
): "acquisition" | "statement" | null {
  if (typeof exception !== "object" || exception === null) return null;
  const candidate = exception as { code?: unknown; message?: unknown };
  if (candidate.code === STATEMENT_TIMEOUT_CODE) return "statement";
  return typeof candidate.message === "string" &&
    candidate.message.includes("timeout exceeded when trying to connect")
    ? "acquisition"
    : null;
}

function readCorrelationId(request: FastifyRequest): string {
  const header = request.headers["x-correlation-id"];
  const value = Array.isArray(header) ? header[0] : header;
  return value && UUID_PATTERN.test(value) ? value : randomUUID();
}

function readFieldErrors(
  payload: ExceptionPayload
): Record<string, string[]> | undefined {
  const parsed = errorEnvelopeSchema.shape.fieldErrors.safeParse(
    payload.fieldErrors
  );
  return parsed.success ? parsed.data : undefined;
}

/**
 * Renders every failure as the `ErrorEnvelope` published in the OpenAPI
 * contract. Without this filter the framework's default body shape would drift
 * from the generated contract, and internal failure detail could leak.
 */
@Catch()
export class ErrorEnvelopeFilter implements ExceptionFilter {
  /**
   * Counted here because this is already the one place that classifies a
   * timeout, and because a cancelled statement leaves nothing to count
   * afterwards — unlike every other metric this repository publishes, which is
   * read from the pool or the database at scrape time.
   */
  constructor(private readonly counters: Counters) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const reply = http.getResponse<FastifyReply>();
    const correlationId = readCorrelationId(request);

    if (!(exception instanceof HttpException)) {
      /*
       * A statement PostgreSQL cancelled is not a server defect, and saying
       * `INTERNAL_ERROR` would tell a client the opposite of what to do.
       *
       * `57014` is raised when `statement_timeout` fires, and `pg` surfaces the
       * pool's own acquisition timeout as a plain `Error`. Both mean the same
       * thing to a caller — the database did not answer in the time this
       * deployment allows — so both render as the `DEPENDENCY_UNAVAILABLE`
       * already published for `503`, and neither adds a code to the contract.
       *
       * Logged at `warn` rather than `error`: a timeout is the system doing
       * what it was told, and burying it among unhandled failures would hide
       * the very signal that says a query has gone wrong.
       */
      const timeout = dependencyTimeout(exception);
      if (timeout !== null) {
        this.counters.increment(DB_TIMEOUT, { kind: timeout });
        request.log.warn({ correlationId, err: exception }, "database_timeout");
        void reply.status(HttpStatus.SERVICE_UNAVAILABLE).send({
          code: "DEPENDENCY_UNAVAILABLE",
          correlationId,
          message: "The database did not answer in time"
        } satisfies ErrorEnvelope);
        return;
      }

      request.log.error({ correlationId, err: exception }, "unhandled_error");
      void reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        code: "INTERNAL_ERROR",
        correlationId,
        message: "Unexpected server error"
      } satisfies ErrorEnvelope);
      return;
    }

    const status = exception.getStatus();
    const response = exception.getResponse();
    const payload: ExceptionPayload =
      typeof response === "object" ? response : { message: response };

    const fieldErrors = readFieldErrors(payload);
    const envelope = errorEnvelopeSchema.parse({
      code:
        typeof payload.code === "string"
          ? payload.code
          : (CODE_BY_STATUS.get(status) ?? "INTERNAL_ERROR"),
      correlationId,
      ...(fieldErrors === undefined ? {} : { fieldErrors }),
      message:
        typeof payload.message === "string"
          ? payload.message
          : exception.message
    });

    void reply.status(status).send(envelope);
  }
}
