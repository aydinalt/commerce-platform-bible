import type { ChatProvider } from "@commerce/decision";

/**
 * How long an answer may be.
 *
 * Decision Chat answers a question about Offerings a person is already looking
 * at, from a brief that holds their values and nothing else. There is not much
 * to say, and a ceiling keeps a runaway answer from becoming a wall of text in
 * a surface that is meant to help somebody compare two cars.
 */
const MAX_TOKENS = 1024;

interface AnthropicResponse {
  content?: { text?: string; type?: string }[];
  error?: { message?: string; type?: string };
  stop_reason?: string | null;
}

/** Error types worth asking again about; everything else is a refusal. */
const TRANSIENT_ERROR_TYPES = new Set([
  "api_error",
  "overloaded_error",
  "rate_limit_error"
]);

/**
 * Anthropic's Messages API, as the three things a provider is.
 *
 * Chosen by the Owner on 2026-08-17. `US-DEC-F03-001` AC-6 forbids a ranking, a
 * winner and a recommendation, and the whole of Chat's usefulness is a model
 * that will hold that line while still answering the question — which is a
 * property of instruction-following rather than of any API.
 */
export function anthropicProvider(options: {
  apiKey: string;
  model: string;
}): ChatProvider {
  return {
    name: "anthropic",

    /**
     * Reads the answer without depending on an enum.
     *
     * A refusal could be recognised by `stop_reason`, but that is a value whose
     * vocabulary belongs to the vendor and can gain members. **The text is the
     * thing being asked for**, so the question asked here is whether there is
     * any: an answer with no text is not an answer, whatever it is called, and
     * the `stop_reason` is carried into the reason so a log says which kind it
     * was without the code having to know the list in advance.
     */
    read(status, body) {
      let parsed: AnthropicResponse;
      try {
        parsed = JSON.parse(body) as AnthropicResponse;
      } catch {
        return {
          kind: "UNAVAILABLE",
          reason: `unreadable answer (status ${status})`
        };
      }

      if (status !== 200) {
        const type = parsed.error?.type ?? `status ${status}`;
        const reason = `${type}: ${parsed.error?.message ?? "no message"}`;
        return TRANSIENT_ERROR_TYPES.has(type)
          ? { kind: "UNAVAILABLE", reason }
          : { kind: "REFUSED", reason };
      }

      const text = (parsed.content ?? [])
        .filter((block) => block.type === "text")
        .map((block) => block.text ?? "")
        .join("")
        .trim();

      if (text === "")
        return {
          kind: "REFUSED",
          reason: `no text (stop_reason ${parsed.stop_reason ?? "absent"})`
        };

      return { kind: "ANSWERED", text };
    },

    /**
     * The whole prompt goes in as one turn.
     *
     * `chatPrompt` has already composed the brief, the two prohibitions, the
     * conversation so far and the question into one text — deliberately, so
     * that what the assistant may see is decided in one governed place. Handing
     * it over as a single user message keeps that true: there is no second
     * channel here through which a fact could reach the model.
     */
    request(prompt) {
      return {
        body: JSON.stringify({
          max_tokens: MAX_TOKENS,
          messages: [{ content: prompt, role: "user" }],
          model: options.model
        }),
        headers: {
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
          "x-api-key": options.apiKey
        },
        url: "https://api.anthropic.com/v1/messages"
      };
    }
  };
}
