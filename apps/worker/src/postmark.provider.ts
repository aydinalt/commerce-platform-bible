import type { EmailProvider } from "@commerce/notification";

/**
 * Postmark's `ErrorCode` values that are permanent **for this message**.
 *
 * This is the whole judgement in the adapter, and the line is drawn narrowly on
 * purpose. `REFUSED` stops the outbox for good; it must therefore mean "asking
 * again will get the same answer about this recipient", not "something is wrong
 * right now".
 *
 * - `300` — the request itself is invalid, which for us means a malformed
 *   address. A retry sends the same malformed address.
 * - `406` — the recipient is inactive: a hard bounce, a spam complaint, or a
 *   manual suppression. Postmark will refuse this address until somebody
 *   reactivates it, and every retry is the platform mailing itself.
 *
 * Everything else — an unconfirmed sender signature, a rejected token, a rate
 * limit, an outage — is `UNAVAILABLE`. Those are real problems and some are
 * permanent until an operator acts, but they are permanent about the
 * *deployment* rather than the message: fix the signature and the queued
 * registrations should still go out. The attempt ceiling handles them, so a
 * misconfiguration dead-letters after eight tries instead of instantly.
 */
const PERMANENT_ERROR_CODES = new Set([300, 406]);

interface PostmarkResponse {
  ErrorCode?: number;
  Message?: string;
}

/**
 * Postmark, as the four things a provider is.
 *
 * Chosen by the Owner on 2026-08-17 for transactional mail specifically: the
 * account sends nothing else, so a registration confirmation cannot queue
 * behind a campaign.
 */
export function postmarkProvider(options: {
  apiKey: string;
  sender: string;
}): EmailProvider {
  return {
    name: "postmark",

    /**
     * The verdict is in the body, not the status.
     *
     * Postmark answers `200` with `ErrorCode: 0` on success and, for several
     * failures, a non-2xx status *and* a body saying which. Reading only the
     * status would call a suppressed recipient delivered, which is the exact
     * mistake `read` takes the body for.
     */
    read(status, body) {
      let parsed: PostmarkResponse;
      try {
        parsed = JSON.parse(body) as PostmarkResponse;
      } catch {
        // A body that is not JSON is not Postmark answering — a proxy, a
        // gateway error page, an interception. Not a refusal of this message.
        return {
          kind: "UNAVAILABLE",
          reason: `unreadable answer (status ${status})`
        };
      }

      if (parsed.ErrorCode === 0) return { kind: "ACCEPTED" };

      const code = parsed.ErrorCode ?? -1;
      // The reason carries Postmark's own words, and Postmark puts the offending
      // address in them. That is why the outcome reason is never logged.
      const reason = `${code}: ${parsed.Message ?? "no message"}`;
      return PERMANENT_ERROR_CODES.has(code)
        ? { kind: "REFUSED", reason }
        : { kind: "UNAVAILABLE", reason };
    },

    request(message) {
      return {
        body: JSON.stringify({
          From: options.sender,
          // Plain text only. Every message the platform sends is a single-use
          // link and a sentence, and an HTML body would add a second rendering
          // of the same token for no gain.
          MessageStream: "outbound",
          Subject: message.subject,
          TextBody: message.body,
          To: message.recipient
        }),
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "x-postmark-server-token": options.apiKey
        },
        url: "https://api.postmarkapp.com/email"
      };
    }
  };
}
