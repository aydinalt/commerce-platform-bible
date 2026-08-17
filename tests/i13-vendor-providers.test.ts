import { describe, expect, it } from "vitest";

import { loadChatConfig, loadEmailConfig } from "@commerce/config";
import { chatPrompt } from "@commerce/decision";

import { anthropicProvider } from "../apps/api/src/decision/anthropic.provider";
import { postmarkProvider } from "../apps/worker/src/postmark.provider";

const postmark = postmarkProvider({
  apiKey: "postmark-secret-token",
  sender: "noreply@example.test"
});

const anthropic = anthropicProvider({
  apiKey: "anthropic-secret-key",
  model: "claude-test-model"
});

const MESSAGE = {
  body: "Confirm your email address:\n\nhttps://app.test/register/confirm?token=SECRET",
  recipient: "someone@example.test",
  subject: "Confirm your email address"
};

/**
 * The two vendors the Owner chose, and only what is theirs.
 *
 * Everything general — the timeout, the secret handling, the prompt, the
 * outbox's retry rule, what a person is told — was written and tested before
 * either was named. What is left is three or four values each, and the one
 * judgement inside them: which answers mean *never ask again about this*.
 *
 * That judgement is what these tests are about. Neither vendor is contacted:
 * `read` is a pure function of a status and a body, which is the property that
 * makes it testable without an account.
 */
describe("Increment I13 vendor providers", () => {
  describe("Postmark", () => {
    it("reads success from the body rather than the status", () => {
      // Postmark answers 200 with ErrorCode 0 on success, and for several
      // failures a non-2xx status *and* a body naming which. A transport
      // trusting the status alone would call a suppressed recipient delivered.
      expect(
        postmark.read(200, JSON.stringify({ ErrorCode: 0, Message: "OK" }))
      ).toEqual({ kind: "ACCEPTED" });
    });

    it("stops for good on an address this message can never reach", () => {
      // 406 is an inactive recipient — a hard bounce, a spam complaint or a
      // manual suppression. 300 is a malformed address. Both give the same
      // answer every time they are asked, so asking again is load without
      // information and the outbox dead-letters the row.
      for (const code of [300, 406]) {
        const outcome = postmark.read(
          422,
          JSON.stringify({ ErrorCode: code, Message: "inactive recipient" })
        );
        expect(outcome.kind).toBe("REFUSED");
      }
    });

    it("asks again about anything wrong with the deployment", () => {
      /*
       * An unconfirmed sender signature, a rejected token, a rate limit.
       *
       * Each is permanent until an operator acts — but permanent about the
       * *deployment*, not the message: fix the signature and the queued
       * registrations should still go out. Dead-lettering them instantly would
       * turn a five-minute configuration mistake into lost registrations, so
       * the attempt ceiling handles these instead.
       */
      for (const code of [400, 401, 405, 429]) {
        const outcome = postmark.read(
          422,
          JSON.stringify({ ErrorCode: code, Message: "not right now" })
        );
        expect(outcome.kind).toBe("UNAVAILABLE");
      }
    });

    it("treats an answer that is not Postmark as an outage", () => {
      // A gateway error page, a captive portal, a proxy. Not a refusal of this
      // recipient, and reading it as one would dead-letter a message because
      // somebody's network was misbehaving.
      const outcome = postmark.read(502, "<html>Bad Gateway</html>");
      expect(outcome.kind).toBe("UNAVAILABLE");
    });

    it("sends the sender the deployment configured, on the transactional stream", () => {
      const request = postmark.request(MESSAGE);
      const body = JSON.parse(request.body) as Record<string, unknown>;

      expect(request.url).toBe("https://api.postmarkapp.com/email");
      expect(request.headers["x-postmark-server-token"]).toBe(
        "postmark-secret-token"
      );
      // The From address is never the person's and never a literal: an operator
      // changes it by changing EMAIL_SENDER, which boot already validated.
      expect(body.From).toBe("noreply@example.test");
      expect(body.To).toBe(MESSAGE.recipient);
      expect(body.MessageStream).toBe("outbound");
      // Plain text only. An HTML body would be a second rendering of the same
      // single-use token, for nothing.
      expect(body.TextBody).toBe(MESSAGE.body);
      expect(body.HtmlBody).toBeUndefined();
    });
  });

  describe("Anthropic", () => {
    const answer = (blocks: unknown[], stop = "end_turn") =>
      JSON.stringify({ content: blocks, stop_reason: stop });

    it("returns the text the model produced", () => {
      expect(
        anthropic.read(200, answer([{ text: "42000 km.", type: "text" }]))
      ).toEqual({ kind: "ANSWERED", text: "42000 km." });
    });

    it("joins the text blocks and ignores the ones that are not text", () => {
      const outcome = anthropic.read(
        200,
        answer([
          { text: "Bu araç ", type: "text" },
          { id: "t1", type: "tool_use" },
          { text: "42000 km yapmış.", type: "text" }
        ])
      );

      expect(outcome).toEqual({
        kind: "ANSWERED",
        text: "Bu araç 42000 km yapmış."
      });
    });

    it("treats an answer with no text as a refusal, whatever it is called", () => {
      /*
       * A refusal could be recognised by `stop_reason`, and deliberately is not.
       *
       * That vocabulary belongs to the vendor and can gain members; code that
       * matched a list would read an unfamiliar refusal as an answer. The text
       * is the thing being asked for, so the question is whether there is any —
       * and the `stop_reason` is carried into the reason so a log still says
       * which kind it was.
       */
      const outcome = anthropic.read(200, answer([], "some_future_reason"));

      // Narrowed rather than matched loosely: a `toMatchObject` against the
      // union passed here with a pattern that could never match, which is the
      // shape of an assertion that asserts nothing.
      if (outcome.kind !== "REFUSED") throw new Error(`got ${outcome.kind}`);
      expect(outcome.reason).toContain("some_future_reason");
    });

    it("separates a vendor outage from a request it will not take", () => {
      const transient = anthropic.read(
        529,
        JSON.stringify({
          error: { message: "overloaded", type: "overloaded_error" }
        })
      );
      const permanent = anthropic.read(
        401,
        JSON.stringify({
          error: { message: "invalid key", type: "authentication_error" }
        })
      );

      // Both end as the same sentence to the person. They are two lines in the
      // log, and an operator must not have to guess which of the two it was.
      expect(transient.kind).toBe("UNAVAILABLE");
      expect(permanent.kind).toBe("REFUSED");
    });

    it("carries the whole prompt as one turn and no second channel", () => {
      const prompt = chatPrompt({
        brief: { offerings: [], priorities: ["düşük kilometre"] },
        question: "Ne dersin?",
        turns: []
      });
      const request = anthropic.request(prompt);
      const body = JSON.parse(request.body) as {
        messages: { content: string; role: string }[];
        model: string;
      };

      expect(request.url).toBe("https://api.anthropic.com/v1/messages");
      expect(request.headers["x-api-key"]).toBe("anthropic-secret-key");
      expect(request.headers["anthropic-version"]).toBe("2023-06-01");
      expect(body.model).toBe("claude-test-model");
      // One message, and it is the composed prompt exactly. There is no system
      // parameter and no second field through which a fact could reach the
      // model without passing the one governed composition.
      expect(body.messages).toEqual([{ content: prompt, role: "user" }]);
    });
  });

  it("names the vendor in configuration, not the transport", () => {
    // The values were `http` while no vendor existed, which named the transport
    // rather than the thing being chosen and would have made a second provider
    // unnameable.
    expect(() => loadEmailConfig("test")).not.toThrow();
    expect(() => loadChatConfig("test")).not.toThrow();
    expect(loadEmailConfig("test").transport).toBe("development");
    expect(loadChatConfig("test").transport).toBe("development");
  });
});
