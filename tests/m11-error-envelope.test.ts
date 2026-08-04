import { randomUUID } from "node:crypto";

import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  type ArgumentsHost
} from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import { errorEnvelopeSchema } from "../packages/contracts/src/index.js";
import { ErrorEnvelopeFilter } from "../apps/api/src/http/error-envelope.filter.js";

interface Captured {
  body: unknown;
  status: number;
}

function invoke(exception: unknown, correlationId?: string): Captured {
  const captured: Captured = { body: undefined, status: 0 };
  const reply = {
    send: (body: unknown) => {
      captured.body = body;
      return reply;
    },
    status: (code: number) => {
      captured.status = code;
      return reply;
    }
  };
  const request = {
    headers: correlationId ? { "x-correlation-id": correlationId } : {},
    log: { error: vi.fn() }
  };
  const host = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => reply
    })
  } as unknown as ArgumentsHost;

  new ErrorEnvelopeFilter().catch(exception, host);
  return captured;
}

describe("Milestone 11 error envelope", () => {
  it("renders framework errors in the published contract shape", () => {
    const correlationId = randomUUID();
    const { body, status } = invoke(new NotFoundException(), correlationId);

    expect(status).toBe(404);
    expect(errorEnvelopeSchema.parse(body)).toMatchObject({
      code: "NOT_FOUND",
      correlationId
    });
  });

  it("preserves an explicit domain code and field errors", () => {
    const { body, status } = invoke(
      new BadRequestException({
        code: "VALIDATION_FAILED",
        fieldErrors: { slug: ["Too short"] },
        message: "Invalid offering input"
      })
    );

    expect(status).toBe(400);
    expect(errorEnvelopeSchema.parse(body)).toMatchObject({
      code: "VALIDATION_FAILED",
      fieldErrors: { slug: ["Too short"] },
      message: "Invalid offering input"
    });
  });

  it("keeps the slug conflict code stable for API consumers", () => {
    const { body, status } = invoke(
      new ConflictException({
        code: "OFFERING_SLUG_CONFLICT",
        message: "An Offering with this slug already exists"
      })
    );

    expect(status).toBe(409);
    expect(errorEnvelopeSchema.parse(body).code).toBe("OFFERING_SLUG_CONFLICT");
  });

  it("substitutes a correlation id when the caller supplies none", () => {
    const { body } = invoke(new NotFoundException());
    expect(errorEnvelopeSchema.parse(body).correlationId).toMatch(
      /^[0-9a-f-]{36}$/u
    );
  });

  it("ignores a spoofed non-uuid correlation id", () => {
    const { body } = invoke(new NotFoundException(), "../../etc/passwd");
    expect(errorEnvelopeSchema.parse(body).correlationId).not.toBe(
      "../../etc/passwd"
    );
  });

  it("never leaks internal failure detail", () => {
    const { body, status } = invoke(new Error("connection string: secret"));

    expect(status).toBe(500);
    const envelope = errorEnvelopeSchema.parse(body);
    expect(envelope.code).toBe("INTERNAL_ERROR");
    expect(envelope.message).toBe("Unexpected server error");
  });
});
