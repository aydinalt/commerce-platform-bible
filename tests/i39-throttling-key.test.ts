import { readFileSync } from "node:fs";

import Fastify from "fastify";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_TRUSTED_PROXY_HOPS,
  trustProxySetting,
  trustedProxyHops
} from "../apps/api/src/http/trusted-proxy.js";

/**
 * The throttling key (I39).
 *
 * **The platform already throttles.** Since I13, `auth_throttle` counts attempts
 * per hashed subject in one atomic statement, covering registration, recovery
 * and both sign-in scopes, and the count is shared across every instance because
 * it lives in the database. An earlier survey in this session reported "no rate
 * limiting anywhere in the repository" — **that was wrong**, and it was wrong
 * because it searched for the names of libraries rather than for the behaviour.
 *
 * What was actually broken is the key. `identity.controller.ts` uses
 * `request.ip` and calls it "the caller's address"; Fastify only populates that
 * from `x-forwarded-for` when told to, and it had not been told.
 *
 * **Both simple answers are wrong, in opposite directions**, and neither shows
 * up in a test that does not look: one throttles everybody together, the other
 * throttles nobody, and both answer `200` to the request in front of you.
 */
describe("Increment I39 the throttling key", () => {
  /**
   * A real Fastify instance behind a real socket, asked what it thinks the
   * caller's address is.
   *
   * Driven over HTTP rather than through `inject()` on purpose: `request.ip`
   * is derived from the socket and the headers together, and an injected
   * request has no socket to derive half of it from.
   */
  const askedAddress = async (
    trustProxy: false | number,
    headers: Record<string, string> = {}
  ): Promise<string> => {
    const app = Fastify({ trustProxy });
    app.get("/", (request, reply) => reply.send({ ip: request.ip }));
    await app.listen({ host: "127.0.0.1", port: 0 });
    const address = app.server.address();
    if (address === null || typeof address === "string")
      throw new Error("the probe did not take a port");
    try {
      const response = await fetch(
        `http://127.0.0.1:${String(address.port)}/`,
        {
          headers
        }
      );
      const body = (await response.json()) as Record<string, unknown>;
      return String(body["ip"]);
    } finally {
      await app.close();
    }
  };

  /** What a caller can write, and what a proxy in front of them appends. */
  const FORGED = { "x-forwarded-for": "9.9.9.9, 8.8.8.8" };

  describe("what the header may change", () => {
    it("ignores a forged header when no proxy is declared", async () => {
      /*
       * The default, and the behaviour every environment before Vercel had. A
       * caller writing `x-forwarded-for` changes nothing, so the throttle
       * counts the socket — correct when the socket *is* the caller.
       */
      expect(await askedAddress(false, FORGED)).toBe("127.0.0.1");
    });

    it("takes the entry the proxy appended, not the one the caller wrote", async () => {
      /*
       * **This is the whole increment.** With one proxy declared, Fastify
       * counts back one hop from the socket and lands on `8.8.8.8` — the entry
       * the trusted proxy added. `9.9.9.9` is what the caller invented, and it
       * is ignored no matter how many entries they prepend.
       */
      expect(await askedAddress(1, FORGED)).toBe("8.8.8.8");
    });

    it("hands the key back to the caller when more proxies are declared than exist", async () => {
      /*
       * **This case was written to assert the opposite and the measurement said
       * no.** The first version claimed the leftmost entry is never taken at
       * any hop count. It is: when the chain is shorter than the number
       * declared, `proxy-addr` runs out of trusted entries and returns the
       * leftmost one — which is exactly the value a caller writes.
       *
       * So over-declaring is not a harmless margin of safety. Declaring `3`
       * behind one proxy is the same failure as trusting the whole chain: the
       * throttle counts a value the caller chooses, and can be stepped around
       * by changing a header between requests.
       *
       * **The number must match the deployment**, which is why `.env.example`
       * says to verify it against a real request rather than to pick something
       * comfortable.
       */
      expect(await askedAddress(1, FORGED)).toBe("8.8.8.8");
      expect(await askedAddress(3, FORGED)).toBe("9.9.9.9");
    });

    it("still reports the socket when the proxy sent no header", async () => {
      // A declared proxy that adds nothing must not leave the address empty:
      // an empty throttling key is one bucket for everybody, which is the
      // failure this increment exists to remove.
      expect(await askedAddress(1)).toBe("127.0.0.1");
    });
  });

  describe("how the number is read", () => {
    it("defaults to no proxy", () => {
      expect(trustedProxyHops(undefined)).toBe(DEFAULT_TRUSTED_PROXY_HOPS);
      expect(DEFAULT_TRUSTED_PROXY_HOPS).toBe(0);
    });

    it("takes the default from anything it cannot read", () => {
      /*
       * **Deliberately this direction.** A deployment that forgets the setting,
       * or mistypes it, throttles all its callers together — visibly broken,
       * and broken towards refusing. The other way round lets anybody past by
       * writing a header, and nothing looks wrong at all.
       */
      for (const bad of ["", "one", "-1", "1.5", "true"])
        expect(trustedProxyHops(bad)).toBe(0);
    });

    it("reads a declared count", () => {
      expect(trustedProxyHops("1")).toBe(1);
      expect(trustedProxyHops("2")).toBe(2);
    });

    it("turns no proxy into `false` rather than `0`", () => {
      /*
       * The two behave the same for `request.ip`. `false` says the thing out
       * loud — this deployment does not read `x-forwarded-for` at all — and a
       * reader of the adapter's options should not have to know that `0` means
       * that.
       */
      expect(trustProxySetting(0)).toBe(false);
      expect(trustProxySetting(1)).toBe(1);
    });
  });

  describe("where it is wired", () => {
    /** Comments and imports stripped — I36's finding, kept. */
    const source = (path: string): string =>
      readFileSync(path, "utf8")
        .replaceAll(/\/\*[\s\S]*?\*\//gu, "")
        .replaceAll(/^\s*\/\/.*$/gmu, "")
        .replaceAll(/^import[\s\S]*?;$/gmu, "");

    it("is set on the adapter every entry builds", () => {
      /*
       * In `bootstrap.ts` rather than in `main.ts`, so the process entry, the
       * serverless entry and every test get the same setting. A setting applied
       * in one entry and not the others is the shape of bug I37 was written to
       * avoid.
       */
      expect(source("apps/api/src/bootstrap.ts")).toMatch(
        /trustProxy: trustProxySetting\(\)/u
      );
    });

    it("is still the value the throttle counts", () => {
      /*
       * The chain this increment repairs runs from the adapter's option to
       * `request.ip` to `subjectOf` to `auth_throttle`. If the controller
       * stopped using `request.ip`, everything above would keep passing and
       * mean nothing.
       */
      const controller = source("apps/api/src/identity/identity.controller.ts");
      expect(controller).toMatch(/function subjectOf[\s\S]*?request\.ip/u);
      expect(controller).toMatch(/subject: subjectOf\(request\)/u);
    });
  });

  describe("what a deployment is told", () => {
    it("documents the setting and what it costs to get wrong", () => {
      /*
       * Matched as an assignment, not as a substring. **The first version
       * matched `TRUSTED_PROXY_HOPS_X` and passed** — the same collision I29
       * found, where a longer name contains the one being looked for.
       *
       * The consequence of the loose version was not theoretical: a renamed
       * variable would leave the code reading one name and the file documenting
       * another, and this case would have called that documented.
       */
      const env = readFileSync(".env.example", "utf8");
      expect(env).toMatch(/^TRUSTED_PROXY_HOPS=/mu);

      // And the reason, because a name with no explanation is a name somebody
      // sets to whatever looks safest — which here is the value that is wrong.
      expect(env).toMatch(/leftmost/iu);
    });
  });

  describe("the claim that was wrong", () => {
    it("no longer says the platform has no rate limiting", () => {
      /*
       * `DEPLOYING_TO_VERCEL.md` listed "there is no rate limiting anywhere in
       * the repository" as a gap. It was false when written: `auth_throttle`
       * has covered four scopes since I13.
       *
       * Corrected rather than deleted, because a reader who saw the claim needs
       * to find out it was wrong — and asserted here so it cannot come back.
       */
      /*
       * **Struck-through spans are removed before searching**, and that is the
       * fifth time in this repository a check has matched its own correction.
       * Governance says a false claim is struck through rather than deleted, so
       * the words survive on purpose — and a naive substring check reads the
       * correction as the claim.
       *
       * The parallel is exact: source checks strip comments, document checks
       * strip `~~…~~`. What is being asserted is what the document *claims*,
       * not what it contains.
       */
      const asserted = readFileSync(
        "docs/implementation/DEPLOYING_TO_VERCEL.md",
        "utf8"
      ).replaceAll(/~~[\s\S]*?~~/gu, "");
      expect(asserted).not.toMatch(/no rate limiting anywhere/iu);
      // And the correction is present rather than the line simply removed.
      expect(
        readFileSync("docs/implementation/DEPLOYING_TO_VERCEL.md", "utf8")
      ).toMatch(/~~[\s\S]*?no rate limiting anywhere[\s\S]*?~~/iu);
    });
  });
});
