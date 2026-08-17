import { afterEach, describe, expect, it, vi } from "vitest";

import { loadEmailConfig } from "@commerce/config";
import { isPermanentRefusal, type EmailProvider } from "@commerce/notification";

import { HttpEmailDispatcher } from "../apps/worker/src/http.dispatcher";

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

/** A provider that stands in for any of them: four small answers. */
function provider(read: EmailProvider["read"]): EmailProvider {
  return {
    name: "test-provider",
    read,
    request: (message) => ({
      body: JSON.stringify({ to: message.recipient }),
      headers: { authorization: "Bearer super-secret-key" },
      url: "https://provider.test/send"
    })
  };
}

const MESSAGE = {
  body: "Confirm your email address:\n\nhttps://app.test/register/confirm?token=SECRET-TOKEN",
  recipient: "someone@example.test",
  subject: "Confirm your email address"
};

/**
 * The email transport, with no provider chosen.
 *
 * Everything a provider does differently is four things behind `EmailProvider`.
 * Everything else — the timeout, the secret handling, and the difference
 * between "not now" and "never" — is on this side of the line, and it is the
 * side most likely to be got wrong. So it is tested before anyone picks a
 * vendor, and whoever picks one inherits these.
 */
describe("Increment I11 email transport", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("accepts what the provider accepted", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 200 }))
    );
    const { lines, logger } = recorder();

    await new HttpEmailDispatcher({
      logger,
      provider: provider(() => ({ kind: "ACCEPTED" })),
      timeoutMs: 1000
    }).deliver(MESSAGE);

    expect(lines[0]?.message).toBe("email_delivery_attempted");
    expect(lines[0]?.fields).toMatchObject({
      outcome: "ACCEPTED",
      provider: "test-provider"
    });
  });

  it("reads the verdict from the body, not only the status", async () => {
    // Providers disagree about this: some answer 422 for a suppressed address,
    // others answer 200 with the error inside. A dispatcher that trusted the
    // status would call the second one delivered.
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ error: "suppressed" }), { status: 200 })
        )
    );

    const refusal = new HttpEmailDispatcher({
      logger: recorder().logger,
      provider: provider((_status, body) =>
        body.includes("suppressed")
          ? { kind: "REFUSED", reason: "suppressed" }
          : { kind: "ACCEPTED" }
      ),
      timeoutMs: 1000
    }).deliver(MESSAGE);

    await expect(refusal).rejects.toThrow(/EMAIL_REFUSED/u);
  });

  it("separates a refusal from an outage", async () => {
    const answer = (kind: "REFUSED" | "UNAVAILABLE") =>
      new HttpEmailDispatcher({
        logger: recorder().logger,
        provider: provider(() => ({ kind, reason: "because" })),
        timeoutMs: 1000
      })
        .deliver(MESSAGE)
        .catch((error: unknown) => error);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 500 }))
    );
    const refused = await answer("REFUSED");
    const unavailable = await answer("UNAVAILABLE");

    // The one distinction the outbox needs, and the reason it is carried on the
    // error rather than in the return type: every existing test dispatcher is
    // written to throw or return, and none of them should have to change.
    expect(isPermanentRefusal(refused)).toBe(true);
    expect(isPermanentRefusal(unavailable)).toBe(false);
  });

  it("gives up on a provider that never answers", async () => {
    // Not a failure — a silence. The worker awaits this call, so a provider
    // that accepts a connection and then says nothing stops every message
    // behind it, which the outbox cannot detect because nothing has failed.
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

    const hung = new HttpEmailDispatcher({
      logger: recorder().logger,
      provider: provider(() => ({ kind: "ACCEPTED" })),
      timeoutMs: 20
    }).deliver(MESSAGE);

    await expect(hung).rejects.toThrow(/EMAIL_UNAVAILABLE/u);
    expect(isPermanentRefusal(await hung.catch((e: unknown) => e))).toBe(false);
  });

  it("puts neither the credential nor the token in a log line", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ echo: MESSAGE.body }), { status: 200 })
        )
    );
    const { lines, logger } = recorder();

    await new HttpEmailDispatcher({
      logger,
      provider: provider(() => ({ kind: "ACCEPTED" })),
      timeoutMs: 1000
    }).deliver(MESSAGE);

    // The provider's response body is the most tempting field to log and the
    // least safe: providers echo the request back inside error payloads, so the
    // string most likely to carry the token is the one explaining why the token
    // was not delivered.
    const logged = JSON.stringify(lines);
    expect(logged).not.toContain("SECRET-TOKEN");
    expect(logged).not.toContain("super-secret-key");
    expect(logged).not.toContain(MESSAGE.recipient);
  });

  it("refuses a deployment that asked for delivery it cannot do", () => {
    vi.stubEnv("EMAIL_TRANSPORT", "postmark");
    vi.stubEnv("EMAIL_API_KEY", "");
    vi.stubEnv("EMAIL_SENDER", "noreply@example.test");

    // Checked at boot rather than at the first registration. A worker that
    // starts, looks healthy and turns every registration into an unwatched
    // retry is the worst of the available outcomes.
    expect(() => loadEmailConfig("production")).toThrow(
      /EMAIL_API_KEY_MISSING/u
    );

    vi.stubEnv("EMAIL_API_KEY", "key");
    vi.stubEnv("EMAIL_SENDER", "");
    expect(() => loadEmailConfig("production")).toThrow(
      /EMAIL_SENDER_MISSING/u
    );
  });

  it("keeps the development transport out of production", () => {
    vi.stubEnv("EMAIL_TRANSPORT", "development");

    expect(() => loadEmailConfig("production")).toThrow(
      /EMAIL_TRANSPORT_DEVELOPMENT_IN_PRODUCTION/u
    );
    expect(loadEmailConfig("test").transport).toBe("development");
  });

  it("names an unknown transport rather than starting without one", () => {
    // `sendgrid` because `postmark` is now a transport somebody wrote. The
    // point of the test is the name nobody wrote, so it has to keep being one.
    vi.stubEnv("EMAIL_TRANSPORT", "sendgrid");

    // A deployment naming an adapter nobody wrote fails with the name it was
    // given, instead of falling back to something that delivers nothing.
    expect(() => loadEmailConfig("production")).toThrow();
  });
});
