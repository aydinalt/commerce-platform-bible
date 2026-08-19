import {
  Catch,
  HttpException,
  HttpStatus,
  type ArgumentsHost,
  type ExceptionFilter
} from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";

import { errorEnvelopeSchema, type ErrorEnvelope } from "@commerce/contracts";
import {
  classifyDatabaseFailure,
  type DatabaseFailure
} from "@commerce/database";
import { Counters } from "@commerce/observability";

import { DB_TIMEOUT, DB_UNAVAILABLE } from "../metrics/metrics.collector.js";
import { correlationId as readCorrelationId } from "./correlation.js";

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

/**
 * What a caller is told for each kind of database failure.
 *
 * All three answer `503 DEPENDENCY_UNAVAILABLE`, because to a client they mean
 * the same thing — the database did not serve this, and the request was not at
 * fault. They are still distinguished here, because the *message* is the only
 * part of the envelope that can say which, and "did not answer in time" would be
 * a lie about a server that is not running at all.
 */
const DEPENDENCY_MESSAGE: Record<DatabaseFailure, string> = {
  acquisition: "The database did not answer in time",
  statement: "The database did not answer in time",
  unavailable: "The database is not available"
};

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
       * A database that did not serve us is not a server defect, and saying
       * `INTERNAL_ERROR` tells a client the opposite of what to do.
       *
       * Three kinds arrive here: a statement PostgreSQL cancelled, a connection
       * the pool could not hand out, and a server that is not there at all. All
       * render as the `DEPENDENCY_UNAVAILABLE` already published for `503`, so
       * none of them adds a code to the contract.
       *
       * **The third was missing and mattered most.** A statement timeout is one
       * request going wrong; an absent database is every request going wrong at
       * once, and until this the platform answered every one of them with
       * `INTERNAL_ERROR` — reporting a defect it did not have, for the entire
       * duration of somebody else's outage, while telling clients not to retry.
       *
       * Counted separately from the timeouts rather than as a third `kind` of
       * them, because an outage is not a timeout and a series named
       * `db_timeouts_total` that counts outages is a metric that lies. The two
       * also call for different responses: a timeout means find the query, an
       * outage means find the database.
       *
       * Logged at `warn` rather than `error` for the same reason a timeout is:
       * this is the system doing what it was told. During an outage this line
       * appears once per request and diagnoses nothing that the pool's own
       * `database_connection_lost` error line does not already say — so raising
       * it to `error` would bury the useful line under thousands of copies of
       * the useless one.
       */
      const failure = classifyDatabaseFailure(exception);
      if (failure !== null) {
        this.count(failure);
        request.log.warn(
          { correlationId, err: exception, failure },
          failure === "unavailable"
            ? "database_unavailable"
            : "database_timeout"
        );
        void reply.status(HttpStatus.SERVICE_UNAVAILABLE).send({
          code: "DEPENDENCY_UNAVAILABLE",
          correlationId,
          message: DEPENDENCY_MESSAGE[failure]
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

  /** Two series, because an outage and a timeout are answered differently. */
  private count(failure: DatabaseFailure): void {
    if (failure === "unavailable") this.counters.increment(DB_UNAVAILABLE);
    else this.counters.increment(DB_TIMEOUT, { kind: failure });
  }
}
