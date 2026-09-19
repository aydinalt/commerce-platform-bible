import { readFileSync } from "node:fs";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { DecisionAssistant, DecisionBrief } from "@commerce/decision";

import { DECISION_ASSISTANT } from "../apps/api/src/decision/chat.service.js";
import { LazyDecisionAssistant } from "../apps/api/src/decision/lazy.assistant.js";

/**
 * Increment `I101` — Decision Chat configuration stops being a boot condition.
 *
 * ## What was wrong
 *
 * `AppModule`'s `DECISION_ASSISTANT` provider is eager, so `loadChatConfig()`
 * ran while the container was being built. That is invisible while the only
 * thing building the module is an API that serves Chat — and fatal the moment
 * something else does. `scripts/import-catalogue.mjs` raises the API in-process
 * to write a catalogue and touches only `/auth/*`, `/businesses/*` and
 * `/admin/offerings/*`; under `NODE_ENV=production` it was refused at start-up
 * with `CHAT_TRANSPORT_DEVELOPMENT_IN_PRODUCTION`.
 *
 * **And it was refused silently.** `createApiApp({ logLevel: "fatal" })` passed
 * `logger: false` to Nest, which silences the routing table and, with it,
 * Nest's own `ExceptionHandler`. The operator saw `2 partner, 4 ilan okundu`,
 * then nothing, then `exit 1`.
 *
 * ## What these cases hold in place
 *
 * The guard is not relaxed; it is moved from the container to the act. So the
 * pair that matters is **A and B together**: a process that never asks a
 * question boots, and a question asked in production without a vendor is still
 * refused. Either one alone could be satisfied by breaking the other.
 *
 * Nothing here needs a database — `AppModule` builds its pool without
 * connecting — so these run everywhere, which is the point: this is a boot
 * property, and a boot property that only holds where a database happens to be
 * is not being tested.
 */

const BRIEF: DecisionBrief = {
  offerings: [
    {
      attributes: [{ name: "Hacim", unit: "ml", value: "30" }],
      businessName: "Pilot Bakım Marketi",
      categoryName: "Cilt Bakım Ürünleri",
      offeringId: "11111111-1111-1111-1111-111111111111",
      title: "Pilot C Vitamini Serum 30 ml"
    }
  ],
  priorities: ["hassas cilt"]
};

const ASKED = {
  brief: BRIEF,
  question: "Bu ürünün hacmi nedir?",
  turns: [] as readonly { question: string; reply: string }[]
};

/** Boots the real `AppModule` the way the catalogue importer boots it. */
async function bootAsImporterDoes(): Promise<NestFastifyApplication> {
  const { createApiApp } = await import("../apps/api/src/bootstrap.js");
  return createApiApp({ logLevel: "fatal" });
}

describe("Increment I101 the lazy assistant itself", () => {
  it("does not build anything until a question is asked", () => {
    let built = 0;
    const assistant = new LazyDecisionAssistant(() => {
      built += 1;
      return { respond: () => Promise.resolve("answer") };
    });

    /*
     * The whole of the fix is this assertion. Constructing the wrapper is what
     * the Nest provider does at boot; if that alone reached the build function,
     * nothing would have changed.
     */
    expect(built).toBe(0);
    void assistant;
  });

  it("builds once and reuses it", async () => {
    let built = 0;
    const assistant = new LazyDecisionAssistant(() => {
      built += 1;
      return { respond: () => Promise.resolve("answer") };
    });

    await assistant.respond(ASKED);
    await assistant.respond(ASKED);

    expect(built).toBe(1);
  });

  it("reports a build failure as a rejection, and does not cache it", async () => {
    let attempts = 0;
    const assistant = new LazyDecisionAssistant(() => {
      attempts += 1;
      throw new Error("CHAT_TRANSPORT_DEVELOPMENT_IN_PRODUCTION");
    });

    await expect(assistant.respond(ASKED)).rejects.toThrow(
      "CHAT_TRANSPORT_DEVELOPMENT_IN_PRODUCTION"
    );
    /*
     * Asked twice, attempted twice. A cached failure would answer a later
     * question with an earlier question's error, and the two are not
     * guaranteed to be the same error.
     */
    await expect(assistant.respond(ASKED)).rejects.toThrow(
      "CHAT_TRANSPORT_DEVELOPMENT_IN_PRODUCTION"
    );
    expect(attempts).toBe(2);
  });
});

describe("Increment I101 the importer's boot, and the guard behind it", () => {
  let app: NestFastifyApplication | null = null;

  afterEach(async () => {
    if (app !== null) await app.close();
    app = null;
    vi.unstubAllEnvs();
  });

  it("A — boots in production with no Chat configuration at all", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ALLOWED_ORIGINS", "https://pilot.invalid");
    /*
     * Unset rather than merely absent: this file runs in a suite whose
     * environment may carry either, and the case is about what happens when a
     * deployment names no vendor.
     */
    vi.stubEnv("CHAT_TRANSPORT", undefined);
    vi.stubEnv("CHAT_API_KEY", undefined);
    vi.stubEnv("CHAT_MODEL", undefined);

    app = await bootAsImporterDoes();

    // Reaching here is the assertion; before I101 the process exited 1 with an
    // empty stdout and an empty stderr instead.
    expect(app).not.toBeNull();
  });

  it("B — still refuses a production Chat question with no vendor", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ALLOWED_ORIGINS", "https://pilot.invalid");
    vi.stubEnv("CHAT_TRANSPORT", undefined);
    vi.stubEnv("CHAT_API_KEY", undefined);
    vi.stubEnv("CHAT_MODEL", undefined);

    app = await bootAsImporterDoes();

    /*
     * The real provider out of the real container — not a stand-in. This is
     * what `ChatService` is handed, so a question asked through it takes
     * exactly this path.
     */
    const assistant = app.get<DecisionAssistant>(DECISION_ASSISTANT);

    await expect(assistant.respond(ASKED)).rejects.toThrow(
      "CHAT_TRANSPORT_DEVELOPMENT_IN_PRODUCTION"
    );
  });

  it("C — answers as before when the deployment is not production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("ALLOWED_ORIGINS", "http://localhost:3000");
    vi.stubEnv("CHAT_TRANSPORT", undefined);

    app = await bootAsImporterDoes();
    const assistant = app.get<DecisionAssistant>(DECISION_ASSISTANT);

    /*
     * The brief-restating adapter, reached through the wrapper. It states the
     * authoritative values and draws no conclusion, and it makes no network
     * call — so this asserts the existing behaviour survived the indirection
     * without asking a vendor anything.
     */
    const reply = await assistant.respond(ASKED);

    expect(reply).toContain("Pilot C Vitamini Serum 30 ml");
    expect(reply).toContain("30");
  });
});

describe("Increment I101 boot failures are no longer silent", () => {
  /*
   * A source assertion, because the property is about what Nest is handed
   * rather than about what any one run prints. Comments are stripped first —
   * this file's own prose names `logger: false` several times, and a naive
   * search would read the explanation as the code.
   */
  const bootstrap = readFileSync("apps/api/src/bootstrap.ts", "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//gu, "")
    .replaceAll(/^\s*\/\/.*$/gmu, "");

  it("hands Nest a logger that still carries failures", () => {
    expect(bootstrap).not.toMatch(/logger: false/u);
    expect(bootstrap).toMatch(/logger: \["error", "fatal"\]/u);
  });

  it("keeps the quiet that the level was asked for", () => {
    /*
     * `fatal` is still the switch, and the two levels admitted carry nothing
     * but failures — so a run that works prints what it printed before. The
     * routing table lives at `log`, which is not in the list.
     */
    expect(bootstrap).toMatch(/config\.logLevel === "fatal"/u);
    expect(bootstrap).not.toMatch(/logger: \[[^\]]*"log"/u);
    expect(bootstrap).not.toMatch(/logger: \[[^\]]*"debug"/u);
    expect(bootstrap).not.toMatch(/logger: \[[^\]]*"verbose"/u);
  });
});

describe("Increment I101 the importer still boots the one AppModule", () => {
  const importer = readFileSync("scripts/import-catalogue.mjs", "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//gu, "")
    .replaceAll(/^\s*\/\/.*$/gmu, "");

  it("goes through createApiApp rather than a module of its own", () => {
    /*
     * C1 — an importer-only Nest module — was the other way to fix this, and
     * it is the one `bootstrap.ts` exists to prevent: "Anything configured only
     * in `main.ts` would be untestable and could drift." This asserts the
     * importer still uses the shared assembly, so the boot these cases exercise
     * is the boot the importer performs.
     */
    expect(importer).toMatch(/createApiApp/u);
    expect(importer).not.toMatch(/NestFactory/u);
    expect(importer).not.toMatch(/@Module/u);
  });
});
