import { describe, expect, it } from "vitest";

import {
  errorEnvelopeSchema,
  healthResponseSchema
} from "../packages/contracts/src/index.js";

describe("platform contracts", () => {
  it("accepts the stable health response", () => {
    expect(
      healthResponseSchema.parse({ service: "api", status: "ok" })
    ).toEqual({ service: "api", status: "ok" });
  });

  it("rejects an error without a correlation id", () => {
    expect(() =>
      errorEnvelopeSchema.parse({ code: "FAILED", message: "Failed" })
    ).toThrow();
  });
});
