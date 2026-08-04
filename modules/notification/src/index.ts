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

/** Event types the worker knows how to turn into a message. */
export const REGISTRATION_REQUESTED = "identity.registration.requested";

export interface OutboxEvent {
  aggregateId: string;
  eventType: string;
  id: string;
}

export const notificationModule = { name: "notification" } as const;
