import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { format } from "prettier";

const errorResponse = (description: string) => ({
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorEnvelope" }
    }
  },
  description
});

const healthOperation = (operationId: string, unavailable?: string) => ({
  operationId,
  responses: {
    "200": {
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/HealthResponse" }
        }
      },
      description: "Service is healthy"
    },
    ...(unavailable === undefined ? {} : { "503": errorResponse(unavailable) })
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
      },
      BeginRegistration: {
        additionalProperties: false,
        properties: {
          email: { format: "email", maxLength: 320, type: "string" },
          password: { maxLength: 256, minLength: 12, type: "string" }
        },
        required: ["email", "password"],
        type: "object"
      },
      ConfirmRegistration: {
        additionalProperties: false,
        properties: { token: { maxLength: 200, minLength: 1, type: "string" } },
        required: ["token"],
        type: "object"
      },
      Login: {
        additionalProperties: false,
        properties: {
          email: { format: "email", maxLength: 320, type: "string" },
          password: { maxLength: 256, minLength: 1, type: "string" }
        },
        required: ["email", "password"],
        type: "object"
      },
      Session: {
        additionalProperties: false,
        properties: {
          selectedBusinessId: { format: "uuid", type: ["string", "null"] },
          status: { enum: ["ENABLED", "SUSPENDED"], type: "string" },
          userId: { format: "uuid", type: "string" }
        },
        required: ["selectedBusinessId", "status", "userId"],
        type: "object"
      },
      SelectBusinessContext: {
        additionalProperties: false,
        properties: { businessId: { format: "uuid", type: "string" } },
        required: ["businessId"],
        type: "object"
      },
      AuthorizedBusinesses: {
        additionalProperties: false,
        properties: {
          businesses: {
            items: {
              additionalProperties: false,
              properties: {
                id: { format: "uuid", type: "string" },
                name: { type: "string" },
                slug: { type: "string" }
              },
              required: ["id", "name", "slug"],
              type: "object"
            },
            type: "array"
          }
        },
        required: ["businesses"],
        type: "object"
      },
      CreateDraftOffering: {
        additionalProperties: false,
        properties: {
          categoryId: { format: "uuid", type: "string" },
          slug: { maxLength: 160, minLength: 1, type: "string" },
          summary: { maxLength: 1000, type: "string" },
          title: { maxLength: 240, minLength: 1, type: "string" }
        },
        required: ["categoryId", "slug", "title"],
        type: "object"
      },
      DraftOffering: {
        additionalProperties: false,
        properties: {
          businessId: { format: "uuid", type: "string" },
          categoryId: { format: "uuid", type: "string" },
          createdAt: { format: "date-time", type: "string" },
          id: { format: "uuid", type: "string" },
          slug: { maxLength: 160, minLength: 1, type: "string" },
          status: { enum: ["DRAFT"], type: "string" },
          summary: { maxLength: 1000, type: ["string", "null"] },
          title: { type: "string" },
          updatedAt: { format: "date-time", type: "string" },
          version: { minimum: 1, type: "integer" }
        },
        required: [
          "businessId",
          "categoryId",
          "createdAt",
          "id",
          "slug",
          "status",
          "summary",
          "title",
          "updatedAt",
          "version"
        ],
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
    "/api/v1/auth/registrations": {
      post: {
        description:
          "Answers identically whether or not the address is already registered. The proof is delivered by email; the response carries nothing that could complete a registration.",
        operationId: "beginRegistration",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BeginRegistration" }
            }
          },
          required: true
        },
        responses: {
          "202": {
            description: "Registration accepted for email-control proof"
          },
          "400": errorResponse("Invalid registration input"),
          "429": errorResponse("Too many registration attempts")
        },
        tags: ["Identity"]
      }
    },
    "/api/v1/auth/registrations/confirmations": {
      post: {
        operationId: "confirmRegistration",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ConfirmRegistration" }
            }
          },
          required: true
        },
        responses: {
          "201": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Session" }
              }
            },
            description: "Account created and session established"
          },
          "400": errorResponse("Registration link is invalid or has expired")
        },
        tags: ["Identity"]
      }
    },
    "/api/v1/auth/sessions": {
      post: {
        operationId: "login",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Login" }
            }
          },
          required: true
        },
        responses: {
          "201": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Session" }
              }
            },
            description: "Session established"
          },
          "400": errorResponse("Invalid credentials input"),
          "401": errorResponse("Credentials rejected")
        },
        tags: ["Identity"]
      }
    },
    "/api/v1/auth/sessions/current": {
      delete: {
        operationId: "logout",
        responses: {
          "204": { description: "Session ended" },
          "403": errorResponse("Request origin is missing or not allowed")
        },
        tags: ["Identity"]
      },
      get: {
        operationId: "getCurrentSession",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Session" }
              }
            },
            description: "Current authenticated session"
          },
          "401": errorResponse("No authenticated session")
        },
        tags: ["Identity"]
      }
    },
    "/api/v1/auth/me/businesses": {
      get: {
        description:
          "The Businesses a choice may be made from; none is chosen silently.",
        operationId: "listAuthorizedBusinesses",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthorizedBusinesses" }
              }
            },
            description: "Businesses the person is authorized for"
          },
          "401": errorResponse("No authenticated session")
        },
        tags: ["Identity"]
      }
    },
    "/api/v1/auth/me/business-context": {
      delete: {
        operationId: "leaveBusinessContext",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Session" }
              }
            },
            description: "Returned to the authenticated User baseline"
          },
          "401": errorResponse("No authenticated session"),
          "403": errorResponse("Request origin is missing or not allowed")
        },
        tags: ["Identity"]
      },
      put: {
        operationId: "selectBusinessContext",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SelectBusinessContext" }
            }
          },
          required: true
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Session" }
              }
            },
            description: "Business context entered"
          },
          "400": errorResponse("Invalid context selection"),
          "401": errorResponse("No authenticated session"),
          "403": errorResponse("Request origin is missing or not allowed"),
          "404": errorResponse("No authorized Business matches that identifier")
        },
        tags: ["Identity"]
      }
    },
    "/api/v1/businesses/{businessId}/offerings": {
      post: {
        operationId: "createDraftOffering",
        parameters: [
          {
            in: "path",
            name: "businessId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateDraftOffering" }
            }
          },
          required: true
        },
        responses: {
          "201": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DraftOffering" }
              }
            },
            description: "Draft Offering created"
          },
          "400": errorResponse("Invalid request"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse(
            "Business cannot author offerings, or its context is not selected"
          ),
          "404": errorResponse("Business or catalog resource not found"),
          "409": errorResponse("Offering slug conflict")
        },
        tags: ["Offering"]
      }
    },
    "/api/v1/businesses/{businessId}/offerings/{offeringId}": {
      get: {
        operationId: "getDraftOffering",
        parameters: [
          {
            in: "path",
            name: "businessId",
            required: true,
            schema: { format: "uuid", type: "string" }
          },
          {
            in: "path",
            name: "offeringId",
            required: true,
            schema: { format: "uuid", type: "string" }
          }
        ],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DraftOffering" }
              }
            },
            description: "Owned Draft Offering"
          },
          "400": errorResponse("Invalid identifier"),
          "401": errorResponse("Authentication required"),
          "403": errorResponse("Account is not active"),
          "404": errorResponse("Offering not found")
        },
        tags: ["Offering"]
      }
    },
    "/api/v1/health/live": { get: healthOperation("getLiveness") },
    "/api/v1/health/ready": {
      get: healthOperation(
        "getReadiness",
        "A required dependency is unavailable"
      )
    }
  }
};
const destination = resolve(process.cwd(), "../../generated/openapi.json");

await writeFile(
  destination,
  await format(JSON.stringify(document), { parser: "json" }),
  "utf8"
);
