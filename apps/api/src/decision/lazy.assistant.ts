import type { DecisionAssistant, DecisionBrief } from "@commerce/decision";

/**
 * The assistant, resolved on the first question rather than at boot.
 *
 * ## Why this exists
 *
 * `AppModule`'s `DECISION_ASSISTANT` provider is eager, as every Nest provider
 * is, so `loadChatConfig()` ran while the container was being built — before
 * anything had asked a question and regardless of whether the process would
 * ever serve one. That was invisible until a process that serves **no** Chat
 * booted the same module: `scripts/import-catalogue.mjs` raises the API
 * in-process to write a catalogue, touches only `/auth/*`, `/businesses/*` and
 * `/admin/offerings/*`, and was refused at start-up with
 * `CHAT_TRANSPORT_DEVELOPMENT_IN_PRODUCTION` — a Chat rule applied to a process
 * that has nothing to do with Chat.
 *
 * **The guard is not being weakened, it is being moved to where it means
 * something.** A production deployment that names no vendor still refuses to
 * answer a Decision Chat question; what it no longer does is refuse to *start*
 * a process that was never going to ask one. The rule belongs to the act, not
 * to the container.
 *
 * ## Why a wrapper rather than a second module
 *
 * `bootstrap.ts` states the reason it exists: one definition of how the API is
 * assembled, "so tests exercise the same middleware, prefix and filter wiring
 * that production runs. Anything configured only in `main.ts` would be
 * untestable and could drift." An importer-only module would be exactly that
 * drift. This keeps one `AppModule`, one wiring and one `ChatService`, which is
 * unchanged and still injects a `DecisionAssistant` it knows nothing else
 * about.
 *
 * ## What is deliberately not cached
 *
 * A successful build is memoised, so a vendor adapter and its logger are
 * created once rather than per question. A **failure is not**: nothing is
 * stored, so the next question repeats the same attempt and raises the same
 * error. Caching the failure would answer a later question with an error from
 * an earlier one, and the two are not guaranteed to be the same error.
 */
export class LazyDecisionAssistant implements DecisionAssistant {
  private resolved: DecisionAssistant | null = null;

  constructor(private readonly build: () => DecisionAssistant) {}

  /**
   * `async` so that a refusal raised by `build()` arrives as a rejected promise
   * rather than a synchronous throw. Callers await this; a synchronous throw
   * from an interface that promises a `Promise` is the kind of difference that
   * only shows up in the one caller that forgot to await.
   */
  async respond(input: {
    brief: DecisionBrief;
    question: string;
    turns: readonly { question: string; reply: string }[];
  }): Promise<string> {
    this.resolved ??= this.build();
    return this.resolved.respond(input);
  }
}
