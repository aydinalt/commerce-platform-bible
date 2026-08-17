import { afterEach, describe, expect, it, vi } from "vitest";

import { loadChatConfig } from "@commerce/config";
import {
  AssistantUnavailableError,
  chatPrompt,
  type ChatProvider,
  type DecisionBrief
} from "@commerce/decision";

import { HttpDecisionAssistant } from "../apps/api/src/decision/http.assistant";

/** A logger that records rather than prints, so what is logged is assertable. */
function recorder() {
  const lines: { fields: unknown; message: string }[] = [];
  const noop = (): void => undefined;
  return {
    lines,
    logger: {
      debug: noop,
      error: noop,
      info: (fields: unknown, message: string) =>
        lines.push({ fields, message })
    } as never
  };
}

/** A vendor that stands in for any of them: three small answers. */
function provider(read: ChatProvider["read"]): ChatProvider {
  return {
    name: "test-provider",
    read,
    request: (prompt) => ({
      body: JSON.stringify({ prompt }),
      headers: { authorization: "Bearer super-secret-key" },
      url: "https://assistant.test/answer"
    })
  };
}

const BRIEF: DecisionBrief = {
  offerings: [
    {
      attributes: [
        { name: "Kilometre", unit: "km", value: "42000" },
        { name: "Servis bakımlı", unit: null, value: null }
      ],
      businessName: "Kartal Motors",
      categoryName: "Otomobil",
      offeringId: "11111111-1111-1111-1111-111111111111",
      title: "Kırmızı spor araba"
    }
  ],
  priorities: ["düşük kilometre"]
};

const ASKED = {
  brief: BRIEF,
  question: "Bu araç ne kadar yol yapmış?",
  turns: [{ question: "Önceki soru", reply: "Önceki yanıt" }]
};

/**
 * The Decision Chat transport, with no vendor chosen.
 *
 * Everything a vendor does differently is three things behind `ChatProvider`.
 * Everything else — the prompt, the timeout, the secret handling and what a
 * person is told when the assistant will not answer — is on this side of the
 * line, and it is the side most likely to be got wrong. So it is tested before
 * anyone picks a vendor, and whoever picks one inherits these.
 */
describe("Increment I12 Decision Chat transport", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("answers with what the vendor answered", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 200 }))
    );
    const { lines, logger } = recorder();

    const reply = await new HttpDecisionAssistant({
      logger,
      provider: provider(() => ({ kind: "ANSWERED", text: "42000 km" })),
      timeoutMs: 1000
    }).respond(ASKED);

    expect(reply).toBe("42000 km");
    expect(lines[0]?.message).toBe("assistant_answer_attempted");
    expect(lines[0]?.fields).toMatchObject({
      outcome: "ANSWERED",
      provider: "test-provider"
    });
  });

  it("builds the prompt from the brief and nothing else", () => {
    const prompt = chatPrompt(ASKED);

    // AC-4. Every fact in the prompt came from the brief, and the two rules the
    // Story cares about are stated in it rather than left in a vendor console
    // where nobody reviews them. The absent value is stated rather than
    // omitted: a list that skipped it would read as though it did not apply.
    expect(prompt).toContain("Kırmızı spor araba — Kartal Motors (Otomobil)");
    expect(prompt).toContain("Kilometre: 42000 km");
    expect(prompt).toContain("Servis bakımlı: Belirtilmemiş");
    expect(prompt).toContain("düşük kilometre");
    expect(prompt).toContain("Sıralama yapma, kazanan seçme, öneride bulunma");
    expect(prompt).toContain("Soru: Bu araç ne kadar yol yapmış?");
  });

  it("reads the verdict from the body, not only the status", async () => {
    // Assistant vendors disagree about this the way email vendors do: some
    // answer 400 for a filtered prompt, others answer 200 with the refusal
    // inside. A transport trusting the status would hand a person the refusal
    // text as though it were an answer.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "content_filter" }), {
          status: 200
        })
      )
    );

    const refused = new HttpDecisionAssistant({
      logger: recorder().logger,
      provider: provider((_status, body) =>
        body.includes("content_filter")
          ? { kind: "REFUSED", reason: "content_filter" }
          : { kind: "ANSWERED", text: body }
      ),
      timeoutMs: 1000
    }).respond(ASKED);

    await expect(refused).rejects.toBeInstanceOf(AssistantUnavailableError);
  });

  it("gives up on a vendor that never answers", async () => {
    /*
     * Not a failure — a silence, and the person is watching this one.
     *
     * It used to be worse than a wait. The whole act ran inside a database
     * transaction, so a vendor that accepted a connection and said nothing held
     * one of the pool's ten connections for as long as it liked.
     */
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: { signal: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            init.signal.addEventListener("abort", () =>
              reject(new DOMException("aborted", "AbortError"))
            );
          })
      )
    );

    const hung = new HttpDecisionAssistant({
      logger: recorder().logger,
      provider: provider(() => ({ kind: "ANSWERED", text: "never" })),
      timeoutMs: 20
    }).respond(ASKED);

    await expect(hung).rejects.toThrow(/ASSISTANT_UNAVAILABLE/u);
  });

  it("puts neither the credential nor the conversation in a log line", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ echo: ASKED.question }), {
          status: 200
        })
      )
    );
    const { lines, logger } = recorder();

    await new HttpDecisionAssistant({
      logger,
      provider: provider(() => ({ kind: "ANSWERED", text: "42000 km" })),
      timeoutMs: 1000
    }).respond(ASKED);

    /*
     * The conversation is held for the life of the flow and swept when it
     * expires. A log line is exactly the durable copy that sweep exists to
     * prevent — and the prompt is worse than the question alone, because it
     * carries what somebody is shopping for and what they said matters to them.
     */
    const logged = JSON.stringify(lines);
    expect(logged).not.toContain("super-secret-key");
    expect(logged).not.toContain(ASKED.question);
    expect(logged).not.toContain("düşük kilometre");
    expect(logged).not.toContain("Kartal Motors");
  });

  it("refuses a deployment that asked for an assistant it cannot reach", () => {
    vi.stubEnv("CHAT_TRANSPORT", "http");
    vi.stubEnv("CHAT_API_KEY", "");
    vi.stubEnv("CHAT_MODEL", "some-model");

    // Checked at boot rather than at the first question. A process that starts,
    // looks healthy and fails every Chat is worse than one that does not start.
    expect(() => loadChatConfig("production")).toThrow(/CHAT_API_KEY_MISSING/u);

    vi.stubEnv("CHAT_API_KEY", "key");
    vi.stubEnv("CHAT_MODEL", "");
    // Named separately from the credential: having the key and not the model is
    // the likelier mistake, and one error for both makes an operator guess.
    expect(() => loadChatConfig("production")).toThrow(/CHAT_MODEL_MISSING/u);
  });

  it("keeps the brief-restating adapter out of production", () => {
    vi.stubEnv("CHAT_TRANSPORT", "development");

    // A production Chat answered by an adapter that only restates the brief is
    // the platform pretending to have an assistant.
    expect(() => loadChatConfig("production")).toThrow(
      /CHAT_TRANSPORT_DEVELOPMENT_IN_PRODUCTION/u
    );
    expect(loadChatConfig("test").transport).toBe("development");
  });

  it("names an unknown transport rather than starting without one", () => {
    vi.stubEnv("CHAT_TRANSPORT", "anthropic");

    expect(() => loadChatConfig("production")).toThrow();
  });
});
