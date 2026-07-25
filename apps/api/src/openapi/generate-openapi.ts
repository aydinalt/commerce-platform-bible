import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { format } from "prettier";

const healthOperation = (operationId: string) => ({
  operationId,
  responses: {
    "200": {
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/HealthResponse" }
        }
      },
      description: "Service is healthy"
    }
  },
  tags: ["Health"]
});

const document = {
  components: {
    schemas: {
      ErrorEnvelope: {
        additionalProperties: false,
        properties: {
          code: { type: "string" },
          correlationId: { format: "uuid", type: "string" },
          fieldErrors: {
            additionalProperties: {
              items: { type: "string" },
              type: "array"
            },
            type: "object"
          },
          message: { type: "string" }
        },
        required: ["code", "correlationId", "message"],
        type: "object"
      },
      HealthResponse: {
        additionalProperties: false,
        properties: {
          service: { enum: ["api"], type: "string" },
          status: { enum: ["ok"], type: "string" }
        },
        required: ["service", "status"],
        type: "object"
      }
    }
  },
  info: {
    description: "V1 decision-completion marketplace HTTP API",
    title: "Commerce Platform API",
    version: "1.0.0"
  },
  openapi: "3.1.0",
  paths: {
    "/api/v1/health/live": { get: healthOperation("getLiveness") },
    "/api/v1/health/ready": { get: healthOperation("getReadiness") }
  }
};
const destination = resolve(process.cwd(), "../../generated/openapi.json");

await writeFile(
  destination,
  await format(JSON.stringify(document), { parser: "json" }),
  "utf8"
);
