import { describe, expect, it } from "vitest";

import {
  hasDirectContactChannel,
  publicBusinessIdentity,
  type BusinessInformation
} from "../modules/business/src/index.js";

const business = (
  overrides: Partial<BusinessInformation> = {}
): BusinessInformation => ({
  contactEmail: "sales@kadikoy.example",
  contactTelephone: "+90 216 000 00 00",
  contactUrl: "https://kadikoy.example/contact",
  id: "0d1a2b3c-4d5e-4f60-8a9b-0c1d2e3f4a5b",
  logoUrl: "https://cdn.example/logo.png",
  name: "Kadıköy Motors",
  publicExposure: "ELIGIBLE",
  shortDescription: "Used cars in Kadıköy since 1998.",
  slug: "kadikoy-motors",
  status: "ACTIVE",
  ...overrides
});

/**
 * The public identity set is the Story's central rule, and it is a rule about
 * what is *absent*. Asserting the exact key set — rather than the presence of
 * the three fields that belong — is what makes a future field addition fail
 * here instead of leaking.
 */
describe("public Business identity set", () => {
  it("contains display name, logo and short description only", () => {
    const identity = publicBusinessIdentity(business());

    // AC-6.
    expect(Object.keys(identity ?? {}).sort()).toEqual([
      "logoUrl",
      "name",
      "shortDescription"
    ]);
    expect(identity).toEqual({
      logoUrl: "https://cdn.example/logo.png",
      name: "Kadıköy Motors",
      shortDescription: "Used cars in Kadıköy since 1998."
    });
  });

  it("excludes every Direct Contact channel", () => {
    const identity = publicBusinessIdentity(business()) as unknown as Record<
      string,
      unknown
    >;

    // AC-9: telephone, email and contact URL are outside public identity, so
    // they have no key here to be forgotten about.
    expect(identity).not.toHaveProperty("contactTelephone");
    expect(identity).not.toHaveProperty("contactEmail");
    expect(identity).not.toHaveProperty("contactUrl");
    expect(JSON.stringify(identity)).not.toContain("kadikoy.example/contact");
  });

  it("carries a supplied name even when the optional fields are absent", () => {
    // AC-6 again: logo and description are included only when supplied, while
    // the display name is always there.
    expect(
      publicBusinessIdentity(
        business({ logoUrl: null, shortDescription: null })
      )
    ).toEqual({
      logoUrl: null,
      name: "Kadıköy Motors",
      shortDescription: null
    });
  });

  it("composes nothing at all while exposure is Ineligible", () => {
    // AC-8: no Business Information is publicly exposed, so there is no
    // partially redacted identity to hand out.
    expect(
      publicBusinessIdentity(business({ publicExposure: "INELIGIBLE" }))
    ).toBeNull();
  });
});

describe("Direct Contact availability", () => {
  it("is unavailable when no channel is supplied", () => {
    // AC-11.
    expect(
      hasDirectContactChannel(
        business({
          contactEmail: null,
          contactTelephone: null,
          contactUrl: null
        })
      )
    ).toBe(false);
  });

  it("is available on any single supplied channel", () => {
    for (const channel of [
      "contactEmail",
      "contactTelephone",
      "contactUrl"
    ] as const) {
      const only = business({
        contactEmail: null,
        contactTelephone: null,
        contactUrl: null,
        [channel]: "supplied"
      });
      expect(hasDirectContactChannel(only)).toBe(true);
    }
  });

  it("does not depend on public exposure", () => {
    // Exposure governs public identity; it says nothing about whether an
    // authenticated Direct Contact channel exists (AC-10 owns that gate).
    expect(
      hasDirectContactChannel(business({ publicExposure: "INELIGIBLE" }))
    ).toBe(true);
  });
});
