import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

describe("generated OpenAPI contract", () => {
  it("contains stable health operations under the V1 prefix", async () => {
    const document = JSON.parse(
      await readFile("generated/openapi.json", "utf8")
    ) as {
      info: { version: string };
      paths: Record<
        string,
        {
          get?: { operationId?: string };
          post?: { operationId?: string };
          put?: { operationId?: string };
        }
      >;
    };

    expect(document.info.version).toBe("1.0.0");
    expect(document.paths["/api/v1/health/live"]?.get?.operationId).toBe(
      "getLiveness"
    );
    expect(document.paths["/api/v1/health/ready"]?.get?.operationId).toBe(
      "getReadiness"
    );
    expect(
      document.paths["/api/v1/businesses/{businessId}/offerings"]?.post
        ?.operationId
    ).toBe("createDraftOffering");
    expect(
      document.paths["/api/v1/businesses/{businessId}/offerings/{offeringId}"]
        ?.get?.operationId
    ).toBe("getDraftOffering");
    expect(
      document.paths["/api/v1/businesses/{businessId}/information"]?.get
        ?.operationId
    ).toBe("getBusinessInformation");
    expect(
      document.paths["/api/v1/businesses/{businessId}/information"]?.put
        ?.operationId
    ).toBe("updateBusinessInformation");
  });
});
