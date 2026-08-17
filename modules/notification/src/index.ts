export interface EmailMessage {
  body: string;
  recipient: string;
  subject: string;
}

/**
 * Outbound delivery, kept behind a port so the vendor is a deployment decision
 * rather than a code decision. See
 * `docs/implementation/IDENTITY_IMPLEMENTATION_DECISION.md`.
 */
export interface EmailDispatcher {
  deliver(message: EmailMessage): Promise<void>;
}

/**
 * What a delivery attempt actually answered.
 *
 * Three answers rather than two, because "it did not work" hides the only
 * distinction that matters afterwards. A provider that is briefly unreachable
 * and a recipient address that will never be accepted both fail; retrying the
 * first is correct and retrying the second is a message the platform sends to
 * itself every few minutes for as long as the deployment lives.
 */
export type EmailDeliveryOutcome =
  /// The provider accepted responsibility for the message.
  | { kind: "ACCEPTED" }
  /// It will never be accepted: a malformed or suppressed address, a rejected
  /// sender, a credential the provider refuses. Trying again changes nothing.
  | { kind: "REFUSED"; reason: string }
  /// It might work later: a timeout, a network failure, a provider fault or a
  /// rate limit.
  | { kind: "UNAVAILABLE"; reason: string };

/**
 * Everything a transactional email provider does differently, and nothing else.
 *
 * Postmark, SES, Resend, SendGrid and Mailgun all take the same shape: an HTTP
 * request carrying a credential and a JSON body, answered by a status code.
 * They differ in exactly four places, and this interface is those four:
 *
 * 1. where the request goes,
 * 2. how the credential is presented,
 * 3. what the body's fields are called,
 * 4. how an answer is read.
 *
 * Writing an adapter is therefore filling in four small things rather than
 * implementing delivery. The timeout, the retry decision, the secret handling
 * and the outbox's behaviour are all on this side of the line, where they are
 * the same whoever is chosen — and where they are already tested.
 */
export interface EmailProvider {
  /// Names the provider in logs and configuration. Never a credential.
  readonly name: string;

  /** The request to send. The credential belongs in `headers`. */
  request(message: EmailMessage): {
    body: string;
    headers: Record<string, string>;
    url: string;
  };

  /**
   * Reads the provider's answer.
   *
   * Given the status and the body, because providers disagree about which
   * carries the verdict: some return `422` for a suppressed address, others
   * return `200` with an error object inside. An adapter that only looked at
   * the status would call the second one a success.
   */
  read(status: number, body: string): EmailDeliveryOutcome;
}

/**
 * A refusal, raised where the caller expects a throw.
 *
 * `EmailDispatcher.deliver` answers by returning or throwing, and every test
 * dispatcher in the repository is written to that shape. Widening its return
 * type to carry the outcome would rewrite all of them to say something they do
 * not care about, so the one distinction the outbox needs travels on the error
 * instead — and `permanent` is a plain property rather than a class check,
 * because an `instanceof` across a module boundary is a promise about bundling
 * that nothing here makes.
 */
export class EmailRefusedError extends Error {
  readonly permanent = true;

  constructor(reason: string) {
    super(`EMAIL_REFUSED: ${reason}`);
    this.name = "EmailRefusedError";
  }
}

export function isPermanentRefusal(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { permanent?: unknown }).permanent === true
  );
}

/** Event types the worker knows how to turn into a message. */
export const REGISTRATION_REQUESTED = "identity.registration.requested";
export const PASSWORD_RESET_REQUESTED = "identity.password-reset.requested";

export interface OutboxEvent {
  aggregateId: string;
  eventType: string;
  id: string;
}

export const notificationModule = { name: "notification" } as const;
