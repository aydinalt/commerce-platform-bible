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
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const reply = http.getResponse<FastifyReply>();
    const correlationId = readCorrelationId(request);

    if (!(exception instanceof HttpException)) {
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
